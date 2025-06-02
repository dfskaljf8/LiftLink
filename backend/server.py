import os
import uuid
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
import firebase_admin
from firebase_admin import credentials, auth, storage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin (only once)
if not firebase_admin._apps:
    # For development, we'll use the config directly
    firebase_config = {
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "client_email": f"firebase-adminsdk@{os.getenv('FIREBASE_PROJECT_ID')}.iam.gserviceaccount.com",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8Q5M...\n-----END PRIVATE KEY-----\n"  # This would be real in production
    }
    
    try:
        # For now, skip Firebase Admin SDK as we'll handle auth on frontend
        # cred = credentials.Certificate(firebase_config)
        # firebase_admin.initialize_app(cred, {'storageBucket': f"{os.getenv('FIREBASE_PROJECT_ID')}.appspot.com"})
        pass
    except Exception as e:
        print(f"Firebase init error (continuing without admin SDK): {e}")

# Initialize MongoDB
mongo_client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = mongo_client[os.getenv("DB_NAME", "liftlink_db")]

# Initialize Stripe
stripe_checkout = StripeCheckout(api_key=os.getenv("STRIPE_SECRET_KEY"))

# FastAPI app
app = FastAPI(title="LiftLink API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Pydantic Models
class UserModel(BaseModel):
    user_id: str
    email: str
    role: str = "user"  # "user" or "trainer"
    name: str
    phone: Optional[str] = None
    location: Optional[Dict[str, float]] = None  # {"lat": float, "lng": float}
    gym: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TrainerProfileModel(BaseModel):
    trainer_id: str
    bio: str
    specialties: List[str]
    hourly_rate: float
    gym_name: str
    location: Dict[str, float]  # {"lat": float, "lng": float}
    experience_years: int
    certifications: List[str] = []
    profile_image: Optional[str] = None
    availability: Dict[str, List[str]] = {}  # {"monday": ["09:00", "10:00"], ...}
    rating: float = 0.0
    total_sessions: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BookingModel(BaseModel):
    booking_id: str
    user_id: str
    trainer_id: str
    session_date: datetime
    duration_hours: float
    total_amount: float
    platform_fee: float
    trainer_amount: float
    status: str = "pending"  # "pending", "confirmed", "completed", "cancelled"
    payment_session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentTransactionModel(BaseModel):
    transaction_id: str
    session_id: str
    user_id: str
    booking_id: Optional[str] = None
    amount: float
    currency: str = "usd"
    payment_status: str = "pending"  # "pending", "paid", "failed", "expired"
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProgressEntryModel(BaseModel):
    progress_id: str
    user_id: str
    weight: float  # in kg or lbs
    body_fat_percentage: Optional[float] = None
    muscle_mass: Optional[float] = None
    measurements: Optional[Dict[str, float]] = {}  # {"chest": 100, "waist": 80, etc.}
    progress_photos: List[str] = []  # URLs to progress photos
    notes: Optional[str] = None
    date_recorded: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GoalModel(BaseModel):
    goal_id: str
    user_id: str
    goal_type: str  # "weight_loss", "muscle_gain", "strength", etc.
    target_value: float
    current_value: float
    target_date: datetime
    is_achieved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Request/Response Models
class TrainerRegistrationRequest(BaseModel):
    bio: str
    specialties: List[str]
    hourly_rate: float
    gym_name: str
    location: Dict[str, float]
    experience_years: int
    certifications: List[str] = []

class BookingRequest(BaseModel):
    trainer_id: str
    session_date: str  # ISO format
    duration_hours: float

class UserRegistrationRequest(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None
    location: Optional[Dict[str, float]] = None
    gym: Optional[str] = None

# Authentication dependency
async def get_current_user(token: str = Depends(security)):
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # In a real app, verify Firebase token here
        # For demo, we'll extract user_id from token
        user_id = token.credentials if token else "demo_user"
        user = await db.users.find_one({"user_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ USER MANAGEMENT ENDPOINTS ============

@app.post("/api/users/register")
async def register_user(user_data: UserRegistrationRequest):
    """Register a new user"""
    user_id = str(uuid.uuid4())
    
    user = UserModel(
        user_id=user_id,
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        location=user_data.location,
        gym=user_data.gym
    )
    
    await db.users.insert_one(user.dict())
    return {"user_id": user_id, "message": "User registered successfully"}

@app.get("/api/users/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@app.put("/api/users/profile")
async def update_user_profile(user_data: UserRegistrationRequest, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    update_data = user_data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": update_data}
    )
    return {"message": "Profile updated successfully"}

# ============ TRAINER MANAGEMENT ENDPOINTS ============

@app.post("/api/trainers/register")
async def register_trainer(trainer_data: TrainerRegistrationRequest, current_user: dict = Depends(get_current_user)):
    """Register current user as a trainer"""
    
    # Update user role to trainer
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"role": "trainer"}}
    )
    
    # Create trainer profile
    trainer_profile = TrainerProfileModel(
        trainer_id=current_user["user_id"],
        bio=trainer_data.bio,
        specialties=trainer_data.specialties,
        hourly_rate=trainer_data.hourly_rate,
        gym_name=trainer_data.gym_name,
        location=trainer_data.location,
        experience_years=trainer_data.experience_years,
        certifications=trainer_data.certifications
    )
    
    await db.trainers.insert_one(trainer_profile.dict())
    return {"message": "Trainer profile created successfully"}

@app.get("/api/trainers/search")
async def search_trainers(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: Optional[float] = Query(50),  # km
    specialty: Optional[str] = Query(None),
    max_rate: Optional[float] = Query(None),
    gym: Optional[str] = Query(None)
):
    """Search for trainers based on location and filters"""
    
    query = {}
    
    # Add filters
    if specialty:
        query["specialties"] = {"$in": [specialty]}
    if max_rate:
        query["hourly_rate"] = {"$lte": max_rate}
    if gym:
        query["gym_name"] = {"$regex": gym, "$options": "i"}
    
    # Location-based search (simplified - in production would use geospatial queries)
    if lat and lng:
        # For demo, we'll return all trainers
        # In production, implement proper geospatial search
        pass
    
    trainers = []
    async for trainer in db.trainers.find(query).limit(20):
        # Get user info
        user = await db.users.find_one({"user_id": trainer["trainer_id"]})
        trainer["trainer_name"] = user["name"] if user else "Unknown"
        trainers.append(trainer)
    
    return {"trainers": trainers}

@app.get("/api/trainers/{trainer_id}")
async def get_trainer_profile(trainer_id: str):
    """Get trainer profile by ID"""
    trainer = await db.trainers.find_one({"trainer_id": trainer_id})
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    # Get user info
    user = await db.users.find_one({"user_id": trainer_id})
    trainer["trainer_name"] = user["name"] if user else "Unknown"
    trainer["trainer_email"] = user["email"] if user else ""
    
    return trainer

# ============ BOOKING ENDPOINTS ============

@app.post("/api/bookings/create")
async def create_booking(booking_data: BookingRequest, current_user: dict = Depends(get_current_user)):
    """Create a new booking"""
    
    # Get trainer info
    trainer = await db.trainers.find_one({"trainer_id": booking_data.trainer_id})
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    # Calculate amounts
    total_amount = trainer["hourly_rate"] * booking_data.duration_hours
    platform_fee = total_amount * 0.10  # 10% platform fee
    trainer_amount = total_amount - platform_fee
    
    booking_id = str(uuid.uuid4())
    
    booking = BookingModel(
        booking_id=booking_id,
        user_id=current_user["user_id"],
        trainer_id=booking_data.trainer_id,
        session_date=datetime.fromisoformat(booking_data.session_date),
        duration_hours=booking_data.duration_hours,
        total_amount=total_amount,
        platform_fee=platform_fee,
        trainer_amount=trainer_amount
    )
    
    await db.bookings.insert_one(booking.dict())
    return {
        "booking_id": booking_id,
        "total_amount": total_amount,
        "platform_fee": platform_fee,
        "trainer_amount": trainer_amount
    }

@app.get("/api/bookings/my")
async def get_my_bookings(current_user: dict = Depends(get_current_user)):
    """Get current user's bookings"""
    
    bookings = []
    if current_user["role"] == "trainer":
        # Get bookings where user is the trainer
        async for booking in db.bookings.find({"trainer_id": current_user["user_id"]}):
            # Get user info
            user = await db.users.find_one({"user_id": booking["user_id"]})
            booking["client_name"] = user["name"] if user else "Unknown"
            bookings.append(booking)
    else:
        # Get bookings where user is the client
        async for booking in db.bookings.find({"user_id": current_user["user_id"]}):
            # Get trainer info
            trainer = await db.trainers.find_one({"trainer_id": booking["trainer_id"]})
            user = await db.users.find_one({"user_id": booking["trainer_id"]})
            booking["trainer_name"] = user["name"] if user else "Unknown"
            booking["gym_name"] = trainer["gym_name"] if trainer else "Unknown"
            bookings.append(booking)
    
    return {"bookings": bookings}

# ============ PAYMENT ENDPOINTS ============

@app.post("/api/payments/create-session")
async def create_payment_session(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Create Stripe checkout session for booking payment"""
    
    # Get booking
    booking = await db.bookings.find_one({"booking_id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Create transaction record
    transaction_id = str(uuid.uuid4())
    
    # Create checkout session
    request_data = CheckoutSessionRequest(
        amount=booking["total_amount"],
        currency="usd",
        success_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/payment/cancel",
        metadata={
            "booking_id": booking_id,
            "user_id": current_user["user_id"],
            "transaction_id": transaction_id
        }
    )
    
    session = await stripe_checkout.create_checkout_session(request_data)
    
    # Save transaction
    transaction = PaymentTransactionModel(
        transaction_id=transaction_id,
        session_id=session.session_id,
        user_id=current_user["user_id"],
        booking_id=booking_id,
        amount=booking["total_amount"],
        metadata=request_data.metadata
    )
    
    await db.payment_transactions.insert_one(transaction.dict())
    
    # Update booking with session ID
    await db.bookings.update_one(
        {"booking_id": booking_id},
        {"$set": {"payment_session_id": session.session_id}}
    )
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@app.get("/api/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    """Get payment status for a session"""
    
    try:
        status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction status
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": status.payment_status,
                "updated_at": datetime.utcnow()
            }}
        )
        
        # If payment successful, update booking
        if status.payment_status == "paid":
            transaction = await db.payment_transactions.find_one({"session_id": session_id})
            if transaction and transaction.get("booking_id"):
                await db.bookings.update_one(
                    {"booking_id": transaction["booking_id"]},
                    {"$set": {"status": "confirmed"}}
                )
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking payment status: {str(e)}")

# ============ DASHBOARD ENDPOINTS ============

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    
    if current_user["role"] == "trainer":
        # Trainer stats
        total_bookings = await db.bookings.count_documents({"trainer_id": current_user["user_id"]})
        confirmed_bookings = await db.bookings.count_documents({"trainer_id": current_user["user_id"], "status": "confirmed"})
        
        # Calculate total earnings
        earnings_pipeline = [
            {"$match": {"trainer_id": current_user["user_id"], "status": "confirmed"}},
            {"$group": {"_id": None, "total": {"$sum": "$trainer_amount"}}}
        ]
        earnings_result = await db.bookings.aggregate(earnings_pipeline).to_list(1)
        total_earnings = earnings_result[0]["total"] if earnings_result else 0
        
        return {
            "role": "trainer",
            "total_bookings": total_bookings,
            "confirmed_bookings": confirmed_bookings,
            "total_earnings": total_earnings
        }
    else:
        # User stats
        total_bookings = await db.bookings.count_documents({"user_id": current_user["user_id"]})
        confirmed_sessions = await db.bookings.count_documents({"user_id": current_user["user_id"], "status": "confirmed"})
        
        return {
            "role": "user",
            "total_bookings": total_bookings,
            "confirmed_sessions": confirmed_sessions
        }

# ============ ADMIN ENDPOINTS ============

@app.post("/api/admin/seed-admins")
async def seed_admin_users():
    """Seed admin users for the platform"""
    admin_users = [
        {
            "user_id": "admin_aarav",
            "email": "aaravdthakker@gmail.com",
            "name": "Aarav Thakker",
            "role": "admin"
        },
        {
            "user_id": "admin_aadi", 
            "email": "aadidthakker@gmail.com",
            "name": "Aadi Thakker",
            "role": "admin"
        },
        {
            "user_id": "admin_sid",
            "email": "sid.the.manne@gmail.com", 
            "name": "Siddharth Manne",
            "role": "admin"
        }
    ]
    
    created_count = 0
    for admin_user in admin_users:
        # Check if admin already exists
        existing = await db.users.find_one({"email": admin_user["email"]})
        if not existing:
            admin_user["created_at"] = datetime.utcnow()
            await db.users.insert_one(admin_user)
            created_count += 1
    
    return {"message": f"Created {created_count} admin users", "admins": admin_users}

@app.get("/api/admin/stats")
async def get_admin_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get comprehensive admin dashboard statistics"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get platform statistics
    total_users = await db.users.count_documents({})
    total_trainers = await db.users.count_documents({"role": "trainer"})
    total_admins = await db.users.count_documents({"role": "admin"})
    total_bookings = await db.bookings.count_documents({})
    confirmed_bookings = await db.bookings.count_documents({"status": "confirmed"})
    
    # Calculate total platform revenue (10% of all confirmed bookings)
    revenue_pipeline = [
        {"$match": {"status": "confirmed"}},
        {"$group": {"_id": None, "total": {"$sum": "$platform_fee"}}}
    ]
    revenue_result = await db.bookings.aggregate(revenue_pipeline).to_list(1)
    total_platform_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Get recent bookings
    recent_bookings = []
    async for booking in db.bookings.find({}).sort("created_at", -1).limit(5):
        # Get user and trainer info
        user = await db.users.find_one({"user_id": booking["user_id"]})
        trainer = await db.users.find_one({"user_id": booking["trainer_id"]})
        
        booking["user_name"] = user["name"] if user else "Unknown"
        booking["trainer_name"] = trainer["name"] if trainer else "Unknown"
        recent_bookings.append(booking)
    
    return {
        "total_users": total_users,
        "total_trainers": total_trainers,
        "total_admins": total_admins,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "total_platform_revenue": total_platform_revenue,
        "recent_bookings": recent_bookings
    }

@app.get("/api/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """Get all users with pagination"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = []
    async for user in db.users.find({}).sort("created_at", -1).limit(50):
        # Get trainer info if user is a trainer
        if user.get("role") == "trainer":
            trainer = await db.trainers.find_one({"trainer_id": user["user_id"]})
            user["trainer_info"] = trainer
        users.append(user)
    
    return {"users": users}

@app.get("/api/admin/trainers")
async def get_all_trainers(current_user: dict = Depends(get_current_user)):
    """Get all trainers with their profiles"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    trainers = []
    async for trainer in db.trainers.find({}).sort("created_at", -1):
        # Get user info
        user = await db.users.find_one({"user_id": trainer["trainer_id"]})
        trainer["user_info"] = user
        
        # Get booking stats
        total_bookings = await db.bookings.count_documents({"trainer_id": trainer["trainer_id"]})
        confirmed_bookings = await db.bookings.count_documents({"trainer_id": trainer["trainer_id"], "status": "confirmed"})
        
        trainer["booking_stats"] = {
            "total_bookings": total_bookings,
            "confirmed_bookings": confirmed_bookings
        }
        
        trainers.append(trainer)
    
    return {"trainers": trainers}

@app.get("/api/admin/bookings")
async def get_all_bookings(current_user: dict = Depends(get_current_user)):
    """Get all bookings with user and trainer info"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    bookings = []
    async for booking in db.bookings.find({}).sort("created_at", -1).limit(100):
        # Get user and trainer info
        user = await db.users.find_one({"user_id": booking["user_id"]})
        trainer = await db.users.find_one({"user_id": booking["trainer_id"]})
        
        booking["user_name"] = user["name"] if user else "Unknown"
        booking["user_email"] = user["email"] if user else "Unknown"
        booking["trainer_name"] = trainer["name"] if trainer else "Unknown"
        booking["trainer_email"] = trainer["email"] if trainer else "Unknown"
        
        bookings.append(booking)
    
    return {"bookings": bookings}

@app.get("/api/admin/transactions")
async def get_all_transactions(current_user: dict = Depends(get_current_user)):
    """Get all payment transactions"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    transactions = []
    async for transaction in db.payment_transactions.find({}).sort("created_at", -1).limit(100):
        # Get user info
        user = await db.users.find_one({"user_id": transaction["user_id"]})
        transaction["user_name"] = user["name"] if user else "Unknown"
        transaction["user_email"] = user["email"] if user else "Unknown"
        
        # Get booking info if exists
        if transaction.get("booking_id"):
            booking = await db.bookings.find_one({"booking_id": transaction["booking_id"]})
            if booking:
                trainer = await db.users.find_one({"user_id": booking["trainer_id"]})
                transaction["booking_info"] = {
                    "session_date": booking["session_date"],
                    "trainer_name": trainer["name"] if trainer else "Unknown"
                }
        
        transactions.append(transaction)
    
    return {"transactions": transactions}

# ============ HEALTH CHECK ============

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Initialize admin users on startup
@app.on_event("startup")
async def startup_event():
    """Initialize admin users on startup"""
    try:
        admin_users = [
            {
                "user_id": "admin_aarav",
                "email": "aaravdthakker@gmail.com",
                "name": "Aarav Thakker",
                "role": "admin"
            },
            {
                "user_id": "admin_aadi", 
                "email": "aadidthakker@gmail.com",
                "name": "Aadi Thakker",
                "role": "admin"
            },
            {
                "user_id": "admin_sid",
                "email": "sid.the.manne@gmail.com", 
                "name": "Siddharth Manne",
                "role": "admin"
            }
        ]
        
        for admin_user in admin_users:
            existing = await db.users.find_one({"email": admin_user["email"]})
            if not existing:
                admin_user["created_at"] = datetime.utcnow()
                await db.users.insert_one(admin_user)
                print(f"Created admin user: {admin_user['name']}")
    except Exception as e:
        print(f"Error creating admin users: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
