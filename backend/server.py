from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
from enum import Enum
import uuid
import os
from datetime import datetime, timedelta
import httpx
from urllib.parse import urlencode
import re
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.test_database

# API Router
from fastapi import APIRouter
api_router = APIRouter()

# Fitness API credentials
FITBIT_CLIENT_ID = os.environ.get('FITBIT_CLIENT_ID', 'your_fitbit_client_id_here')
FITBIT_CLIENT_SECRET = os.environ.get('FITBIT_CLIENT_SECRET', 'your_fitbit_client_secret_here')
GOOGLE_FIT_CLIENT_ID = os.environ.get('GOOGLE_FIT_CLIENT_ID', 'your_google_fit_client_id_here')
GOOGLE_FIT_CLIENT_SECRET = os.environ.get('GOOGLE_FIT_CLIENT_SECRET', 'your_google_fit_client_secret_here')

# Enums
class UserRole(str, Enum):
    FITNESS_ENTHUSIAST = "fitness_enthusiast"
    TRAINER = "trainer"

class FitnessGoal(str, Enum):
    WEIGHT_LOSS = "weight_loss"
    MUSCLE_BUILDING = "muscle_building"
    GENERAL_FITNESS = "general_fitness"
    SPORT_TRAINING = "sport_training"
    REHABILITATION = "rehabilitation"
    WELLNESS = "wellness"

class ExperienceLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class TreeLevel(str, Enum):
    SEED = "seed"
    SPROUT = "sprout"
    SAPLING = "sapling"
    YOUNG_TREE = "young_tree"
    MATURE_TREE = "mature_tree"
    STRONG_OAK = "strong_oak"
    MIGHTY_PINE = "mighty_pine"
    ANCIENT_ELM = "ancient_elm"
    GIANT_SEQUOIA = "giant_sequoia"
    REDWOOD = "redwood"

class SessionSource(str, Enum):
    MANUAL = "manual"
    TRAINER = "trainer"
    FITBIT = "fitbit"
    GOOGLE_FIT = "google_fit"

# Models
class User(BaseModel):
    email: EmailStr
    role: UserRole
    fitness_goals: List[FitnessGoal]
    experience_level: ExperienceLevel

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    fitness_goals: List[str]
    experience_level: str
    created_at: str

class CheckUserRequest(BaseModel):
    email: EmailStr

class CheckUserResponse(BaseModel):
    exists: bool
    user_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr

class Session(BaseModel):
    user_id: str
    trainer_id: Optional[str] = None
    session_type: str
    duration_minutes: int
    source: SessionSource = SessionSource.MANUAL
    calories: Optional[int] = None
    heart_rate_avg: Optional[int] = None
    scheduled_time: Optional[str] = None

class SessionResponse(BaseModel):
    id: str
    user_id: str
    trainer_id: Optional[str]
    session_type: str
    duration_minutes: int
    source: str
    calories: Optional[int]
    heart_rate_avg: Optional[int]
    created_at: str
    scheduled_time: Optional[str]

class TreeProgress(BaseModel):
    total_sessions: int
    consistency_streak: int
    current_level: str
    lift_coins: int
    progress_percentage: float

class FitnessConnectionStatus(BaseModel):
    fitbit_connected: bool
    google_fit_connected: bool
    last_sync: Optional[str]

class FitnessData(BaseModel):
    total_workouts: int
    this_week: int
    avg_duration: int
    recent_workouts: List[dict]

# Utility functions
def generate_id():
    return str(uuid.uuid4())

async def get_user_by_email(email: str):
    return await db.users.find_one({"email": email})

async def get_user_by_id(user_id: str):
    return await db.users.find_one({"id": user_id})

def calculate_tree_level(total_sessions: int, consistency_streak: int) -> TreeLevel:
    score = total_sessions + (consistency_streak * 2)
    
    if score >= 225: return TreeLevel.REDWOOD
    elif score >= 180: return TreeLevel.GIANT_SEQUOIA
    elif score >= 140: return TreeLevel.ANCIENT_ELM
    elif score >= 105: return TreeLevel.MIGHTY_PINE
    elif score >= 75: return TreeLevel.STRONG_OAK
    elif score >= 50: return TreeLevel.MATURE_TREE
    elif score >= 30: return TreeLevel.YOUNG_TREE
    elif score >= 15: return TreeLevel.SAPLING
    elif score >= 5: return TreeLevel.SPROUT
    else: return TreeLevel.SEED

def calculate_progress_percentage(current_level: TreeLevel, score: int) -> float:
    thresholds = {
        TreeLevel.SEED: (0, 5),
        TreeLevel.SPROUT: (5, 15),
        TreeLevel.SAPLING: (15, 30),
        TreeLevel.YOUNG_TREE: (30, 50),
        TreeLevel.MATURE_TREE: (50, 75),
        TreeLevel.STRONG_OAK: (75, 105),
        TreeLevel.MIGHTY_PINE: (105, 140),
        TreeLevel.ANCIENT_ELM: (140, 180),
        TreeLevel.GIANT_SEQUOIA: (180, 225),
        TreeLevel.REDWOOD: (225, 300)
    }
    
    if current_level not in thresholds:
        return 0.0
    
    current_min, next_min = thresholds[current_level]
    if score >= next_min:
        return 100.0
    
    progress = ((score - current_min) / (next_min - current_min)) * 100
    return max(0.0, min(100.0, progress))

# API Routes

# User authentication and management
@api_router.post("/check-user", response_model=CheckUserResponse)
async def check_user_exists(request: CheckUserRequest):
    """Check if a user exists by email for smart authentication routing"""
    user = await get_user_by_email(request.email)
    if user:
        return CheckUserResponse(exists=True, user_id=user["id"])
    return CheckUserResponse(exists=False)

@api_router.post("/login", response_model=UserResponse)
async def login_user(request: LoginRequest):
    """Sign in existing user with email verification check"""
    user = await get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if email is verified
    if not user.get("email_verified", False):
        raise HTTPException(status_code=403, detail="Email not verified. Please check your email for verification code.")
    
    # Convert fitness_goals from enum values to strings if needed
    fitness_goals = user["fitness_goals"]
    if fitness_goals and isinstance(fitness_goals[0], str):
        fitness_goals_str = fitness_goals
    else:
        fitness_goals_str = [goal.value if hasattr(goal, 'value') else str(goal) for goal in fitness_goals]
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        role=user["role"].value if hasattr(user["role"], 'value') else user["role"],
        fitness_goals=fitness_goals_str,
        experience_level=user["experience_level"].value if hasattr(user["experience_level"], 'value') else user["experience_level"],
        created_at=user["created_at"].isoformat() if isinstance(user["created_at"], datetime) else user["created_at"]
    )

@api_router.post("/users", response_model=UserResponse)
async def create_user(user: User):
    """Create new user account with email verification"""
    # Check if user already exists
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = generate_id()
    verification_code = generate_verification_code()
    
    user_doc = {
        "id": user_id,
        "email": user.email,
        "role": user.role.value,
        "fitness_goals": [goal.value for goal in user.fitness_goals],
        "experience_level": user.experience_level.value,
        "created_at": datetime.now().isoformat(),
        "email_verified": False,
        "verification_code": verification_code
    }
    
    await db.users.insert_one(user_doc)
    
    # Send verification email
    email_service.send_verification_email(user.email, verification_code)
    
    return UserResponse(
        id=user_id,
        email=user.email,
        role=user.role.value,
        fitness_goals=[goal.value for goal in user.fitness_goals],
        experience_level=user.experience_level.value,
        created_at=user_doc["created_at"]
    )

@api_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        role=user["role"],
        fitness_goals=user["fitness_goals"],
        experience_level=user["experience_level"],
        created_at=user["created_at"].isoformat() if isinstance(user["created_at"], datetime) else user["created_at"]
    )

@api_router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_update: User):
    """Update user profile"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "role": user_update.role.value,
            "fitness_goals": [goal.value for goal in user_update.fitness_goals],
            "experience_level": user_update.experience_level.value
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await get_user_by_id(user_id)
    return UserResponse(
        id=updated_user["id"],
        email=updated_user["email"],
        role=updated_user["role"],
        fitness_goals=updated_user["fitness_goals"],
        experience_level=updated_user["experience_level"],
        created_at=updated_user["created_at"]
    )

# Fitness Integration APIs
@api_router.get("/fitness/status/{user_id}", response_model=FitnessConnectionStatus)
async def get_fitness_connection_status(user_id: str):
    """Get fitness device connection status"""
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return FitnessConnectionStatus(
        fitbit_connected=user.get("fitbit_connected", False),
        google_fit_connected=user.get("google_fit_connected", False),
        last_sync=user.get("last_sync")
    )

@api_router.get("/fitbit/login")
async def fitbit_login():
    """Initiate Fitbit OAuth flow"""
    if FITBIT_CLIENT_ID == 'your_fitbit_client_id_here':
        raise HTTPException(status_code=501, detail="Fitbit integration not configured")
    
    params = {
        "client_id": FITBIT_CLIENT_ID,
        "response_type": "code",
        "scope": "activity heartrate sleep",
        "redirect_uri": f"{os.environ.get('BACKEND_URL', 'http://localhost:8001')}/api/fitbit/callback"
    }
    
    authorization_url = f"https://www.fitbit.com/oauth2/authorize?{urlencode(params)}"
    return {"authorization_url": authorization_url}

@api_router.get("/fitbit/callback")
async def fitbit_callback(code: str, user_id: str = None):
    """Handle Fitbit OAuth callback"""
    token_data = {
        "client_id": FITBIT_CLIENT_ID,
        "grant_type": "authorization_code",
        "redirect_uri": f"{os.environ.get('BACKEND_URL', 'http://localhost:8001')}/api/fitbit/callback",
        "code": code
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.fitbit.com/oauth2/token",
            data=token_data,
            auth=(FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET)
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code for token")
        
        token_info = response.json()
        
        if user_id:
            await db.users.update_one(
                {"id": user_id},
                {"$set": {
                    "fitbit_token": token_info,
                    "fitbit_connected": True
                }}
            )
    
    return {"message": "Fitbit connected successfully"}

@api_router.get("/google-fit/login")
async def google_fit_login():
    """Initiate Google Fit OAuth flow"""
    if GOOGLE_FIT_CLIENT_ID == 'your_google_fit_client_id_here':
        raise HTTPException(status_code=501, detail="Google Fit integration not configured")
    
    params = {
        "client_id": GOOGLE_FIT_CLIENT_ID,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/fitness.activity.read",
        "redirect_uri": f"{os.environ.get('BACKEND_URL', 'http://localhost:8001')}/api/google-fit/callback",
        "access_type": "offline"
    }
    
    authorization_url = f"https://accounts.google.com/o/oauth2/auth?{urlencode(params)}"
    return {"authorization_url": authorization_url}

@api_router.get("/google-fit/callback")
async def google_fit_callback(code: str, user_id: str = None):
    """Handle Google Fit OAuth callback"""
    token_data = {
        "client_id": GOOGLE_FIT_CLIENT_ID,
        "client_secret": GOOGLE_FIT_CLIENT_SECRET,
        "grant_type": "authorization_code",
        "redirect_uri": f"{os.environ.get('BACKEND_URL', 'http://localhost:8001')}/api/google-fit/callback",
        "code": code
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data=token_data
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code for token")
        
        token_info = response.json()
        
        if user_id:
            await db.users.update_one(
                {"id": user_id},
                {"$set": {
                    "google_fit_token": token_info,
                    "google_fit_connected": True
                }}
            )
    
    return {"message": "Google Fit connected successfully"}

@api_router.post("/sync/workouts")
async def sync_fitness_data(request: dict):
    """Sync fitness data from connected devices"""
    user_id = request.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID required")
    
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    synced_workouts = 0
    
    # Mock sync process - in real implementation, this would fetch from APIs
    mock_workouts = [
        {
            "activity_type": "Running",
            "duration": 30,
            "calories": 250,
            "date": datetime.now().isoformat(),
            "source": SessionSource.FITBIT if user.get("fitbit_connected") else SessionSource.GOOGLE_FIT
        },
        {
            "activity_type": "Weight Training",
            "duration": 45,
            "calories": 180,
            "date": (datetime.now() - timedelta(days=1)).isoformat(),
            "source": SessionSource.FITBIT if user.get("fitbit_connected") else SessionSource.GOOGLE_FIT
        }
    ]
    
    # Create sessions from synced data
    for workout in mock_workouts:
        session_id = generate_id()
        session_doc = {
            "id": session_id,
            "user_id": user_id,
            "session_type": workout["activity_type"],
            "duration_minutes": workout["duration"],
            "calories": workout["calories"],
            "source": workout["source"].value,
            "created_at": workout["date"]
        }
        
        await db.sessions.insert_one(session_doc)
        synced_workouts += 1
    
    # Update last sync time
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"last_sync": datetime.now().isoformat()}}
    )
    
    return {"synced_workouts": synced_workouts}

@api_router.get("/fitness/data/{user_id}", response_model=FitnessData)
async def get_fitness_data(user_id: str):
    """Get fitness data and statistics"""
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get fitness sessions from the last 30 days
    sessions_cursor = db.sessions.find({
        "user_id": user_id,
        "source": {"$in": ["fitbit", "google_fit", "trainer"]}
    }).sort("created_at", -1).limit(10)
    
    sessions = await sessions_cursor.to_list(length=10)
    
    # Calculate stats
    total_workouts = len(sessions)
    this_week_count = sum(1 for s in sessions if 
        datetime.fromisoformat(s["created_at"]) > datetime.now() - timedelta(days=7))
    avg_duration = sum(s.get("duration_minutes", 0) for s in sessions) // max(len(sessions), 1)
    
    recent_workouts = [
        {
            "activity_type": s["session_type"],
            "duration": s["duration_minutes"],
            "calories": s.get("calories", 200),
            "date": s["created_at"],
            "source": s["source"],
            "auto_confirmed": s["source"] in ["fitbit", "google_fit"]
        }
        for s in sessions[:5]
    ]
    
    return FitnessData(
        total_workouts=total_workouts,
        this_week=this_week_count,
        avg_duration=avg_duration,
        recent_workouts=recent_workouts
    )

@api_router.delete("/fitbit/disconnect/{user_id}")
async def disconnect_fitbit(user_id: str):
    """Disconnect Fitbit from user account"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$unset": {"fitbit_token": "", "fitbit_connected": ""}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Fitbit disconnected successfully"}

@api_router.delete("/google-fit/disconnect/{user_id}")
async def disconnect_google_fit(user_id: str):
    """Disconnect Google Fit from user account"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$unset": {"google_fit_token": "", "google_fit_connected": ""}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Google Fit disconnected successfully"}

# Session Management with Check-in System
@api_router.post("/sessions", response_model=SessionResponse)
async def create_session(session: Session):
    """Create a new session (primarily used by trainers and fitness sync)"""
    session_id = generate_id()
    session_doc = {
        "id": session_id,
        "user_id": session.user_id,
        "trainer_id": session.trainer_id,
        "session_type": session.session_type,
        "duration_minutes": session.duration_minutes,
        "source": session.source.value,
        "calories": session.calories,
        "heart_rate_avg": session.heart_rate_avg,
        "scheduled_time": session.scheduled_time,
        "created_at": datetime.now().isoformat()
    }
    
    await db.sessions.insert_one(session_doc)
    
    return SessionResponse(**session_doc)

@api_router.get("/users/{user_id}/sessions", response_model=List[SessionResponse])
async def get_user_sessions(user_id: str):
    """Get all sessions for a user"""
    sessions_cursor = db.sessions.find({"user_id": user_id}).sort("created_at", -1)
    sessions = await sessions_cursor.to_list(length=100)
    
    return [SessionResponse(**session) for session in sessions]

@api_router.get("/users/{user_id}/upcoming-sessions")
async def get_upcoming_sessions(user_id: str):
    """Get upcoming scheduled sessions for a user"""
    # Mock upcoming sessions - in real app, this would query scheduled sessions
    return [
        {
            "id": "upcoming_1",
            "session_type": "Personal Training",
            "scheduled_time": (datetime.now() + timedelta(hours=2)).isoformat(),
            "trainer_name": "Sarah Johnson"
        }
    ]

@api_router.get("/users/{user_id}/pending-checkins")
async def get_pending_checkins(user_id: str):
    """Get pending check-in requests for a user"""
    # Mock pending check-ins - in real app, this would query pending requests
    return []

@api_router.post("/sessions/{session_id}/request-checkin")
async def request_checkin(session_id: str):
    """Request check-in from trainer for a session"""
    # Mock check-in request - in real app, this would notify the trainer
    return {"message": "Check-in request sent to trainer"}

# Tree progress calculation with enhanced tracking
@api_router.get("/users/{user_id}/tree-progress", response_model=TreeProgress)
async def get_tree_progress(user_id: str):
    """Calculate and return user's tree progression"""
    sessions_cursor = db.sessions.find({"user_id": user_id})
    sessions = await sessions_cursor.to_list(length=None)
    
    total_sessions = len(sessions)
    
    # Calculate consistency streak (mock calculation)
    consistency_streak = min(total_sessions, 7)  # Simple mock
    
    # Calculate tree level and progress
    current_level = calculate_tree_level(total_sessions, consistency_streak)
    score = total_sessions + (consistency_streak * 2)
    progress_percentage = calculate_progress_percentage(current_level, score)
    
    # Calculate LiftCoins (50 per session + streak bonus)
    lift_coins = (total_sessions * 50) + (consistency_streak * 10)
    
    return TreeProgress(
        total_sessions=total_sessions,
        consistency_streak=consistency_streak,
        current_level=current_level.value,
        lift_coins=lift_coins,
        progress_percentage=progress_percentage
    )

# Import new services
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from email_service import EmailService, generate_verification_code
from payment_service import PaymentService
from calendar_service import CalendarService

email_service = EmailService()
payment_service = PaymentService()
calendar_service = CalendarService()

# Email Verification Models
class EmailVerificationRequest(BaseModel):
    email: EmailStr

class EmailVerificationResponse(BaseModel):
    message: str
    verification_sent: bool

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    verification_code: str

# Enhanced User Model with verification
class UserWithVerification(BaseModel):
    id: str
    email: str
    role: str
    fitness_goals: List[str]
    experience_level: str
    created_at: str
    email_verified: bool = False
    verification_code: Optional[str] = None

# Trainer-specific models
class ScheduleEvent(BaseModel):
    id: str
    title: str
    start_time: str
    end_time: str
    client_name: str
    session_type: str
    status: str
    location: str
    notes: str

class EarningsData(BaseModel):
    total_earnings: float
    this_month: float
    pending_payments: float
    completed_sessions: int
    avg_session_rate: float

class ReviewData(BaseModel):
    id: str
    client_name: str
    rating: int
    comment: str
    date: str
    session_type: str

# Email Verification Endpoints
@api_router.post("/send-verification", response_model=EmailVerificationResponse)
async def send_verification_email(request: EmailVerificationRequest):
    """Send email verification code"""
    try:
        verification_code = generate_verification_code()
        
        # Store verification code in database (for now, we'll store in memory)
        # In production, store this in your database with expiration
        verification_codes = getattr(send_verification_email, 'codes', {})
        verification_codes[request.email] = verification_code
        send_verification_email.codes = verification_codes
        
        success = email_service.send_verification_email(request.email, verification_code)
        
        return EmailVerificationResponse(
            message="Verification email sent successfully" if success else "Failed to send verification email",
            verification_sent=success
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/verify-email")
async def verify_email(request: VerifyEmailRequest):
    """Verify email with code"""
    try:
        verification_codes = getattr(send_verification_email, 'codes', {})
        
        if request.email not in verification_codes:
            raise HTTPException(status_code=400, detail="No verification code found for this email")
        
        if verification_codes[request.email] != request.verification_code:
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        # Mark user as verified in database
        await db.users.update_one(
            {"email": request.email},
            {"$set": {"email_verified": True, "verification_code": None}}
        )
        
        # Remove verification code from memory
        del verification_codes[request.email]
        
        return {"message": "Email verified successfully", "verified": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Trainer Schedule Management
@api_router.get("/trainer/{trainer_id}/schedule")
async def get_trainer_schedule(trainer_id: str):
    """Get trainer's schedule"""
    schedule = calendar_service.get_trainer_schedule(trainer_id)
    return {"schedule": schedule}

@api_router.post("/trainer/{trainer_id}/schedule")
async def create_appointment(trainer_id: str, appointment_data: dict):
    """Create new appointment"""
    appointment = calendar_service.create_appointment(trainer_id, appointment_data)
    if appointment:
        return {"message": "Appointment created successfully", "appointment": appointment}
    else:
        raise HTTPException(status_code=500, detail="Failed to create appointment")

@api_router.get("/trainer/{trainer_id}/available-slots")
async def get_available_slots(trainer_id: str, date: str):
    """Get available time slots for a trainer"""
    slots = calendar_service.get_available_slots(trainer_id, date)
    return {"available_slots": slots}

# Trainer Earnings
@api_router.get("/trainer/{trainer_id}/earnings")
async def get_trainer_earnings(trainer_id: str):
    """Get trainer earnings data"""
    earnings = payment_service.get_trainer_earnings(trainer_id)
    return earnings

@api_router.post("/trainer/{trainer_id}/payout")
async def request_payout(trainer_id: str, amount: int):
    """Request payout for trainer"""
    success = payment_service.process_trainer_payout(trainer_id, amount)
    if success:
        return {"message": "Payout processed successfully", "amount": amount/100}
    else:
        raise HTTPException(status_code=500, detail="Failed to process payout")

# Trainer Reviews
@api_router.get("/trainer/{trainer_id}/reviews")
async def get_trainer_reviews(trainer_id: str):
    """Get trainer reviews"""
    # Mock reviews data
    mock_reviews = [
        {
            "id": "review_001",
            "client_name": "John D.",
            "rating": 5,
            "comment": "Excellent trainer! Really helped me achieve my fitness goals.",
            "date": "2025-01-05",
            "session_type": "Personal Training"
        },
        {
            "id": "review_002",
            "client_name": "Sarah M.",
            "rating": 4,
            "comment": "Great workout sessions, very motivating and professional.",
            "date": "2025-01-03",
            "session_type": "Group Fitness"
        },
        {
            "id": "review_003",
            "client_name": "Mike L.",
            "rating": 5,
            "comment": "Amazing nutrition advice, lost 10 pounds in 2 months!",
            "date": "2024-12-28",
            "session_type": "Nutrition Consultation"
        }
    ]
    
    return {
        "reviews": mock_reviews,
        "avg_rating": 4.7,
        "total_reviews": len(mock_reviews)
    }

@api_router.post("/trainer/{trainer_id}/reviews/{review_id}/respond")
async def respond_to_review(trainer_id: str, review_id: str, response: dict):
    """Respond to a client review"""
    return {"message": "Response added successfully", "review_id": review_id}

# Enhanced session check-in with payment processing
@api_router.post("/sessions/{session_id}/complete-checkin")
async def complete_session_checkin(session_id: str, trainer_id: str, client_id: str, session_data: dict):
    """Complete session check-in with payment processing"""
    try:
        # Create payment for the session
        amount = session_data.get("amount", 7500)  # Default $75.00
        payment = payment_service.create_payment_intent(amount, trainer_id, client_id, session_id)
        
        if payment:
            # Update session in database with completion
            await db.sessions.update_one(
                {"id": session_id},
                {"$set": {
                    "status": "completed",
                    "completed_at": datetime.now().isoformat(),
                    "payment_id": payment["id"],
                    "amount_paid": amount
                }}
            )
            
            return {
                "message": "Session completed and payment processed",
                "payment_id": payment["id"],
                "client_secret": payment.get("client_secret"),
                "amount": amount/100
            }
        else:
            raise HTTPException(status_code=500, detail="Payment processing failed")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# New Stripe-specific endpoints
@api_router.post("/payments/create-session-checkout")
async def create_session_checkout(request: dict):
    """Create Stripe checkout session for trainee to pay for session"""
    try:
        amount = request.get("amount", 7500)  # Amount in cents
        trainer_id = request.get("trainer_id")
        client_email = request.get("client_email")
        session_details = request.get("session_details", {})
        
        checkout_data = payment_service.create_session_checkout(
            amount, trainer_id, client_email, session_details
        )
        
        if checkout_data:
            return checkout_data
        else:
            raise HTTPException(status_code=500, detail="Failed to create checkout session")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/payments/confirm-payment")
async def confirm_payment(request: dict):
    """Confirm payment and update session status"""
    try:
        payment_intent_id = request.get("payment_intent_id")
        session_id = request.get("session_id")
        
        if payment_service.confirm_payment(payment_intent_id):
            # Update session as paid
            await db.sessions.update_one(
                {"id": session_id},
                {"$set": {
                    "payment_status": "paid",
                    "payment_confirmed_at": datetime.now().isoformat()
                }}
            )
            
            return {"message": "Payment confirmed successfully", "paid": True}
        else:
            return {"message": "Payment confirmation pending", "paid": False}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/payments/session-cost/{trainer_id}")
async def get_session_cost(trainer_id: str, session_type: str = "personal_training"):
    """Get the cost for a session with a specific trainer"""
    # In a real app, this would be stored in trainer profile
    session_costs = {
        "personal_training": 7500,  # $75.00
        "group_training": 3500,     # $35.00
        "nutrition_consultation": 10000,  # $100.00
        "specialized_training": 12500      # $125.00
    }
    
    cost = session_costs.get(session_type, 7500)
    
    return {
        "trainer_id": trainer_id,
        "session_type": session_type,
        "cost_cents": cost,
        "cost_dollars": cost / 100,
        "currency": "USD"
    }

# Add API router to app
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "LiftLink API is running! 🚀 Enhanced with Fitness Integration"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)