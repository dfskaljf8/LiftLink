"""
Simplified LiftLink Backend Server
Basic version to get the frontend working
"""

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import asyncio
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="LiftLink API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Mock database
mock_users = {
    "demo_user": {
        "user_id": "demo_user_1",
        "email": "user@demo.com",
        "name": "Demo User",
        "role": "user",
        "level": 5,
        "lift_coins": 150,
        "consecutive_days": 7,
        "xp_points": 450,
        "total_coins_earned": 300,
        "created_at": "2024-01-01T00:00:00Z"
    },
    "demo_trainer": {
        "user_id": "demo_user_2", 
        "email": "trainer@demo.com",
        "name": "Demo Trainer",
        "role": "trainer",
        "level": 8,
        "lift_coins": 250,
        "consecutive_days": 15,
        "xp_points": 850,
        "total_coins_earned": 500,
        "created_at": "2024-01-01T00:00:00Z"
    },
    "demo_admin": {
        "user_id": "admin_aarav",
        "email": "aaravdthakker@gmail.com", 
        "name": "Admin User",
        "role": "admin",
        "level": 10,
        "lift_coins": 500,
        "consecutive_days": 30,
        "xp_points": 1500,
        "total_coins_earned": 1000,
        "created_at": "2024-01-01T00:00:00Z"
    }
}

mock_trainers = [
    {
        "trainer_id": "trainer_1",
        "trainer_name": "Sarah Chen",
        "specialties": ["Weight Loss", "Strength Training"],
        "hourly_rate": 75,
        "rating": 4.9,
        "total_reviews": 127,
        "gym_name": "FitZone Manhattan",
        "location": {
            "type": "Point",
            "coordinates": [-73.9857, 40.7484]  # NYC coordinates
        },
        "bio": "Experienced trainer specializing in weight loss and strength training",
        "experience_years": 8,
        "is_certified_trainer": True,
        "verified_certifications": ["NASM-CPT", "Nutrition Specialist"]
    },
    {
        "trainer_id": "trainer_2", 
        "trainer_name": "Marcus Torres",
        "specialties": ["Strength Training", "Athletic Performance"],
        "hourly_rate": 85,
        "rating": 4.8,
        "total_reviews": 89,
        "gym_name": "Iron Paradise",
        "location": {
            "type": "Point",
            "coordinates": [-73.9442, 40.8176]  # Bronx coordinates
        },
        "bio": "Former athlete turned trainer, specializing in performance",
        "experience_years": 6,
        "is_certified_trainer": True,
        "verified_certifications": ["CSCS", "ACSM"]
    }
]

# Helper functions
async def get_current_user(request: Request):
    """Extract user from auth token"""
    try:
        auth_header = request.headers.get("authorization")
        if not auth_header:
            return None
        
        token = auth_header.replace("Bearer ", "")
        
        # Mock authentication - check demo tokens
        if token in mock_users:
            return mock_users[token]
        
        return None
    except Exception as e:
        logger.error(f"Auth error: {e}")
        return None

# Routes

@app.get("/")
async def root():
    return {"message": "LiftLink API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "LiftLink Backend"}

@app.post("/api/users/register")
async def register_user(request: Request):
    """Register a new user"""
    try:
        data = await request.json()
        email = data.get("email")
        name = data.get("name")
        
        logger.info(f"User registration attempt: {email}")
        
        # For demo, just return success
        return {
            "success": True,
            "message": "User registered successfully",
            "user_id": "demo_user_1"
        }
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=400, detail="Registration failed")

@app.get("/api/users/profile")
async def get_user_profile(request: Request):
    """Get current user profile"""
    try:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        logger.info(f"Profile requested for user: {user['user_id']}")
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")

@app.get("/api/trainers/search")
async def search_trainers(
    request: Request,
    specialty: Optional[str] = None,
    max_rate: Optional[int] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[int] = 25
):
    """Search for trainers"""
    try:
        logger.info(f"Trainer search: specialty={specialty}, max_rate={max_rate}")
        
        # Filter trainers based on criteria
        results = mock_trainers.copy()
        
        if specialty:
            results = [t for t in results if specialty in t.get("specialties", [])]
        
        if max_rate:
            results = [t for t in results if t.get("hourly_rate", 0) <= max_rate]
        
        # Add distance calculation (mock)
        for trainer in results:
            trainer["distance_km"] = 2.5  # Mock distance
        
        return {
            "trainers": results,
            "total_count": len(results),
            "page": 1,
            "per_page": 20
        }
    
    except Exception as e:
        logger.error(f"Trainer search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed")

@app.get("/api/trainers/featured")
async def get_featured_trainers():
    """Get featured trainers for home page"""
    try:
        return {
            "trainers": mock_trainers[:2],
            "success": True
        }
    except Exception as e:
        logger.error(f"Featured trainers error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch featured trainers")

@app.get("/api/bookings/ongoing")
async def get_ongoing_bookings(request: Request):
    """Get user's ongoing bookings"""
    try:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Mock ongoing bookings
        bookings = [
            {
                "id": "booking_1",
                "trainerName": "Sarah Chen",
                "sessionType": "Strength Training",
                "sessionDate": "2024-01-15",
                "sessionTime": "2:00 PM",
                "status": "confirmed"
            }
        ]
        
        return {"bookings": bookings}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bookings fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch bookings")

@app.post("/api/bookings")
async def create_booking(request: Request):
    """Create a new booking"""
    try:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        data = await request.json()
        logger.info(f"Booking creation: {data}")
        
        # Mock booking creation
        return {
            "success": True,
            "booking_id": "booking_123",
            "message": "Booking created successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Booking creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create booking")

@app.get("/api/gamification/check-in")
async def daily_checkin(request: Request):
    """Daily check-in for LiftCoins"""
    try:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        return {
            "success": True,
            "coins_earned": 10,
            "total_coins": user.get("lift_coins", 0) + 10,
            "consecutive_days": user.get("consecutive_days", 0) + 1
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Check-in error: {e}")
        raise HTTPException(status_code=500, detail="Check-in failed")

@app.get("/api/tree/my-tree")
async def get_my_tree(request: Request):
    """Get user's complete tree structure"""
    try:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Mock tree nodes
        nodes = [
            {
                "node_id": "node1",
                "user_id": user["user_id"],
                "node_type": "goal",
                "title": "Welcome to LiftLink! 🎉",
                "description": "Complete your first fitness goal",
                "status": "active",
                "position": {"x": 0.5, "y": 0.1},
                "icon": "🌱",
                "color": "#BDD53D",
                "xp_reward": 50,
                "coin_reward": 100
            },
            {
                "node_id": "node2",
                "user_id": user["user_id"],
                "node_type": "milestone",
                "title": "Complete Your Profile",
                "description": "Add your fitness goals and preferences",
                "status": "completed",
                "parent_node_id": "node1",
                "position": {"x": 0.3, "y": 0.3},
                "icon": "👤",
                "color": "#FF6B6B",
                "xp_reward": 25,
                "coin_reward": 50
            },
            {
                "node_id": "node3",
                "user_id": user["user_id"],
                "node_type": "milestone",
                "title": "Book Your First Session",
                "description": "Find a trainer and book your first workout",
                "status": "active",
                "parent_node_id": "node1",
                "position": {"x": 0.7, "y": 0.3},
                "icon": "💪",
                "color": "#45B7D1",
                "xp_reward": 100,
                "coin_reward": 200
            }
        ]
        
        # Build tree structure with relationships
        tree_structure = {}
        for node in nodes:
            node_id = node["node_id"]
            tree_structure[node_id] = {
                "node_id": node_id,
                "title": node["title"],
                "status": node["status"],
                "children": []
            }
        
        # Add children relationships
        for node in nodes:
            if "parent_node_id" in node and node["parent_node_id"]:
                parent_id = node["parent_node_id"]
                if parent_id in tree_structure:
                    tree_structure[parent_id]["children"].append(node["node_id"])
        
        return {
            "tree_structure": tree_structure,
            "nodes": nodes,
            "total_nodes": len(nodes),
            "completed_nodes": len([n for n in nodes if n["status"] == "completed"])
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Tree data error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tree data")

@app.get("/api/coins/balance")
async def get_coin_balance(request: Request):
    """Get user's current coin balance and transaction history"""
    try:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Mock transactions
        transactions = [
            {
                "transaction_id": "tx1",
                "user_id": user["user_id"],
                "transaction_type": "earned",
                "amount": 50,
                "reason": "profile_completion",
                "created_at": "2024-05-01T10:00:00Z"
            },
            {
                "transaction_id": "tx2",
                "user_id": user["user_id"],
                "transaction_type": "earned",
                "amount": 100,
                "reason": "first_session",
                "created_at": "2024-05-03T14:30:00Z"
            },
            {
                "transaction_id": "tx3",
                "user_id": user["user_id"],
                "transaction_type": "earned",
                "amount": 100,
                "reason": "daily_streak",
                "created_at": "2024-05-05T09:15:00Z"
            }
        ]
        
        # Calculate how close to $10 discount
        current_coins = user.get("lift_coins", 0)
        coins_needed_for_discount = max(0, 1000 - current_coins)
        
        return {
            "lift_coins": current_coins,
            "total_coins_earned": user.get("total_coins_earned", 0),
            "level": user.get("level", 1),
            "xp_points": user.get("xp_points", 0),
            "badges": user.get("badges", []),
            "consecutive_days": user.get("consecutive_days", 0),
            "discount_progress": {
                "current_coins": current_coins,
                "coins_needed": coins_needed_for_discount,
                "discount_available": current_coins >= 1000
            },
            "recent_transactions": transactions
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Coin balance error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch coin balance")

@app.post("/api/coins/daily-checkin")
async def daily_checkin(request: Request):
    """Daily check-in to maintain streak and earn coins"""
    try:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # In a real implementation, we would update the user's streak and coins in the database
        # For this mock, we'll just return the updated values
        
        return {
            "streak": user.get("consecutive_days", 0) + 1,
            "lift_coins": user.get("lift_coins", 0) + 10,
            "message": "Daily check-in successful! +10 LiftCoins"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Daily check-in error: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform daily check-in")

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return {"error": "Internal server error", "detail": str(exc)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)