from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

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

# Models
class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    role: UserRole
    fitness_goals: List[FitnessGoal] = []
    experience_level: Optional[ExperienceLevel] = None
    tree_level: TreeLevel = TreeLevel.SEED
    total_sessions: int = 0
    consistency_streak: int = 0
    lift_coins: int = 0
    dark_mode: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserProfileCreate(BaseModel):
    email: str
    role: UserRole
    fitness_goals: List[FitnessGoal] = []
    experience_level: Optional[ExperienceLevel] = None

class UserProfileUpdate(BaseModel):
    fitness_goals: Optional[List[FitnessGoal]] = None
    experience_level: Optional[ExperienceLevel] = None
    dark_mode: Optional[bool] = None

class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_type: str
    duration_minutes: int
    lift_coins_earned: int = 50
    completed_at: datetime = Field(default_factory=datetime.utcnow)

class SessionCreate(BaseModel):
    user_id: str
    session_type: str
    duration_minutes: int

# Helper functions
def get_tree_progress(total_sessions: int, consistency_streak: int) -> TreeLevel:
    """Calculate tree level based on sessions and consistency"""
    total_score = total_sessions + (consistency_streak * 2)
    
    if total_score >= 500:
        return TreeLevel.REDWOOD
    elif total_score >= 350:
        return TreeLevel.GIANT_SEQUOIA
    elif total_score >= 250:
        return TreeLevel.ANCIENT_ELM
    elif total_score >= 175:
        return TreeLevel.MIGHTY_PINE
    elif total_score >= 120:
        return TreeLevel.STRONG_OAK
    elif total_score >= 80:
        return TreeLevel.MATURE_TREE
    elif total_score >= 50:
        return TreeLevel.YOUNG_TREE
    elif total_score >= 25:
        return TreeLevel.SAPLING
    elif total_score >= 10:
        return TreeLevel.SPROUT
    else:
        return TreeLevel.SEED

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to LiftLink Platform! 🏆"}

@api_router.post("/users", response_model=UserProfile)
async def create_user(user_data: UserProfileCreate):
    user_dict = user_data.dict()
    user_obj = UserProfile(**user_dict)
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_obj.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users/{user_id}", response_model=UserProfile)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserProfile(**user)

@api_router.get("/users/email/{email}", response_model=UserProfile)
async def get_user_by_email(email: str):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserProfile(**user)

@api_router.put("/users/{user_id}", response_model=UserProfile)
async def update_user(user_id: str, update_data: UserProfileUpdate):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    await db.users.update_one({"id": user_id}, {"$set": update_dict})
    
    updated_user = await db.users.find_one({"id": user_id})
    return UserProfile(**updated_user)

@api_router.post("/sessions", response_model=Session)
async def create_session(session_data: SessionCreate):
    # Verify user exists
    user = await db.users.find_one({"id": session_data.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create session
    session_obj = Session(**session_data.dict())
    await db.sessions.insert_one(session_obj.dict())
    
    # Update user stats
    new_total_sessions = user["total_sessions"] + 1
    new_consistency_streak = user["consistency_streak"] + 1
    new_lift_coins = user["lift_coins"] + session_obj.lift_coins_earned
    new_tree_level = get_tree_progress(new_total_sessions, new_consistency_streak)
    
    await db.users.update_one(
        {"id": session_data.user_id},
        {
            "$set": {
                "total_sessions": new_total_sessions,
                "consistency_streak": new_consistency_streak,
                "lift_coins": new_lift_coins,
                "tree_level": new_tree_level,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return session_obj

@api_router.get("/users/{user_id}/sessions", response_model=List[Session])
async def get_user_sessions(user_id: str):
    sessions = await db.sessions.find({"user_id": user_id}).to_list(1000)
    return [Session(**session) for session in sessions]

@api_router.get("/users/{user_id}/tree-progress")
async def get_tree_progress_info(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_score = user["total_sessions"] + (user["consistency_streak"] * 2)
    current_level = user["tree_level"]
    
    # Calculate next level requirements
    level_thresholds = {
        "seed": 10,
        "sprout": 25,
        "sapling": 50,
        "young_tree": 80,
        "mature_tree": 120,
        "strong_oak": 175,
        "mighty_pine": 250,
        "ancient_elm": 350,
        "giant_sequoia": 500,
        "redwood": 500  # Max level
    }
    
    next_threshold = level_thresholds.get(current_level, 500)
    progress_percentage = min((current_score / next_threshold) * 100, 100) if next_threshold > 0 else 100
    
    return {
        "current_level": current_level,
        "current_score": current_score,
        "next_threshold": next_threshold,
        "progress_percentage": progress_percentage,
        "total_sessions": user["total_sessions"],
        "consistency_streak": user["consistency_streak"],
        "lift_coins": user["lift_coins"]
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()