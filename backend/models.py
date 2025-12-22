"""
LiftLink Enhanced Data Models
Supports vibe-based coaching, AI automations, and gamification
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

# ==================== ENUMS ====================

class VibeMode(str, Enum):
    BIG_DOG_MODE = "big_dog_mode"  # Intense, no-excuses
    SOFT_GRIND = "soft_grind"  # Encouraging, sustainable
    EASY_RESTART = "easy_restart"  # Gentle, compassionate

class CoachingApproach(str, Enum):
    STRENGTH_FOCUSED = "strength_focused"
    CONDITIONING_FOCUSED = "conditioning_focused"
    HYBRID = "hybrid"
    MOBILITY_FIRST = "mobility_first"
    SPORT_SPECIFIC = "sport_specific"

class AutomationTrigger(str, Enum):
    MISSED_WORKOUT = "missed_workout"
    STREAK_ACHIEVED = "streak_achieved"
    LOW_ENERGY = "low_energy"
    PR_ACHIEVED = "pr_achieved"
    WEEKLY_CHECKIN = "weekly_checkin"
    SCHEDULE_CONFLICT = "schedule_conflict"
    GOAL_MILESTONE = "goal_milestone"

class ContentType(str, Enum):
    TIP = "tip"
    WORKOUT = "workout"
    PROGRAM = "program"
    MOTIVATION = "motivation"
    RECIPE = "recipe"
    VIDEO = "video"

# ==================== TRAINER MODELS ====================

class TrainerStyle(BaseModel):
    """Trainer's coaching style and preferences"""
    approach: CoachingApproach = CoachingApproach.HYBRID
    methods: List[str] = ["strength", "conditioning"]
    session_structure: str = "warm-up, main work, cool-down"
    sample_exercises: List[str] = []
    communication_tone: VibeMode = VibeMode.SOFT_GRIND
    specializations: List[str] = []
    certifications: List[str] = []

class TrainerProfile(BaseModel):
    """Enhanced trainer profile"""
    id: str
    email: str
    name: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    
    # Coaching style
    style: TrainerStyle = TrainerStyle()
    
    # Business info
    hourly_rate: float = 75.0
    virtual_rate: float = 50.0
    availability: Dict[str, List[str]] = {}  # {"monday": ["9:00", "10:00"]}
    
    # Stats
    total_clients: int = 0
    active_clients: int = 0
    total_workouts_created: int = 0
    avg_client_retention_days: float = 0
    
    # Content locker
    content_library: List[str] = []  # IDs of content items
    
    # Automation settings
    automations_enabled: bool = True
    automation_rules: List[Dict] = []
    
    # Verification
    cert_verified: bool = False
    age_verified: bool = False
    
    created_at: str = ""
    updated_at: str = ""

class AutomationRule(BaseModel):
    """Trainer-defined automation rule"""
    id: str
    trainer_id: str
    name: str
    trigger: AutomationTrigger
    trigger_conditions: Dict[str, Any] = {}  # e.g., {"missed_count": 2}
    action_type: str  # "send_message", "adjust_workout", "unlock_content"
    action_config: Dict[str, Any] = {}
    is_active: bool = True
    created_at: str = ""

# ==================== CLIENT MODELS ====================

class ClientVibe(BaseModel):
    """Client's vibe preferences and state"""
    mode: VibeMode = VibeMode.SOFT_GRIND
    notification_frequency: str = "moderate"  # minimal, moderate, frequent
    preferred_workout_time: str = "morning"
    intensity_preference: int = 3  # 1-5 scale

class ClientGoals(BaseModel):
    """Client's fitness goals"""
    primary_goal: str = "general_fitness"
    secondary_goals: List[str] = []
    target_date: Optional[str] = None
    specific_targets: Dict[str, Any] = {}  # e.g., {"weight": 180, "bench_pr": 225}

class ClientProfile(BaseModel):
    """Enhanced client/trainee profile"""
    id: str
    email: str
    name: str
    profile_image: Optional[str] = None
    
    # Vibe and preferences
    vibe: ClientVibe = ClientVibe()
    goals: ClientGoals = ClientGoals()
    
    # Fitness info
    experience_level: str = "beginner"
    available_equipment: List[str] = ["bodyweight"]
    injuries_limitations: List[str] = []
    available_days: List[str] = ["monday", "wednesday", "friday"]
    session_duration_preference: int = 45  # minutes
    
    # Trainer relationship
    trainer_id: Optional[str] = None
    program_id: Optional[str] = None
    
    # Progress tracking
    current_streak: int = 0
    longest_streak: int = 0
    total_workouts_completed: int = 0
    total_xp: int = 0
    level: int = 1
    
    # Check-in data
    last_checkin: Optional[Dict] = None
    avg_energy: float = 3.0
    avg_stress: float = 3.0
    avg_sleep: float = 7.0
    
    # Verification
    age_verified: bool = False
    
    created_at: str = ""
    updated_at: str = ""

# ==================== WORKOUT MODELS ====================

class Exercise(BaseModel):
    """Single exercise in a workout"""
    id: str
    name: str
    sets: int = 3
    reps: str = "10"  # Can be "10" or "8-12" or "30s"
    rest: str = "60s"
    weight: Optional[str] = None
    notes: Optional[str] = None
    video_url: Optional[str] = None
    alternatives: List[str] = []

class WorkoutDay(BaseModel):
    """A single workout day"""
    id: str
    day_number: int
    name: str
    focus: str
    warmup: List[Exercise] = []
    main_work: List[Exercise] = []
    cooldown: List[Exercise] = []
    estimated_duration: int = 45
    difficulty: int = 3  # 1-5

class WorkoutWeek(BaseModel):
    """A week of workouts"""
    week_number: int
    focus: str
    days: List[WorkoutDay] = []
    notes: Optional[str] = None

class WorkoutProgram(BaseModel):
    """Complete workout program"""
    id: str
    trainer_id: str
    name: str
    description: str
    weeks: List[WorkoutWeek] = []
    duration_weeks: int = 4
    difficulty_level: str = "intermediate"
    equipment_needed: List[str] = []
    ai_generated: bool = False
    progression_notes: Optional[str] = None
    adaptation_triggers: List[str] = []
    created_at: str = ""
    updated_at: str = ""

# ==================== CHECK-IN MODELS ====================

class DailyCheckin(BaseModel):
    """Daily client check-in"""
    id: str
    client_id: str
    date: str
    
    # Quick pulse (1-5 scale)
    energy_level: int = 3
    stress_level: int = 3
    sleep_quality: int = 3
    sleep_hours: float = 7.0
    
    # Optional details
    mood: Optional[str] = None
    notes: Optional[str] = None
    pain_areas: List[str] = []
    
    # Auto-calculated
    workout_recommended: bool = True
    intensity_adjustment: str = "normal"  # reduced, normal, increased
    
    created_at: str = ""

class WeeklyReflection(BaseModel):
    """Weekly deeper check-in"""
    id: str
    client_id: str
    week_start: str
    
    # Progress reflection
    workouts_completed: int = 0
    workouts_planned: int = 0
    adherence_percent: float = 0.0
    
    # Self-assessment
    energy_trend: str = "stable"  # improving, stable, declining
    motivation_level: int = 3
    biggest_win: Optional[str] = None
    biggest_challenge: Optional[str] = None
    
    # Goals check
    on_track: bool = True
    goal_adjustments_needed: Optional[str] = None
    
    created_at: str = ""

# ==================== GAMIFICATION MODELS ====================

class XPEvent(BaseModel):
    """XP earning event"""
    id: str
    client_id: str
    event_type: str  # workout_completed, streak_milestone, checkin, pr_achieved
    xp_earned: int
    description: str
    created_at: str = ""

class Achievement(BaseModel):
    """Unlockable achievement"""
    id: str
    name: str
    description: str
    icon: str
    xp_reward: int
    requirement_type: str  # streak, total_workouts, pr, consistency
    requirement_value: int
    is_hidden: bool = False

class ClientAchievement(BaseModel):
    """Client's unlocked achievement"""
    id: str
    client_id: str
    achievement_id: str
    unlocked_at: str
    celebrated: bool = False  # Has the client seen the celebration

# ==================== CONTENT LOCKER MODELS ====================

class ContentItem(BaseModel):
    """Trainer's content library item"""
    id: str
    trainer_id: str
    type: ContentType
    title: str
    content: str  # Text content or URL
    media_url: Optional[str] = None
    tags: List[str] = []
    is_premium: bool = False
    unlock_requirement: Optional[str] = None  # e.g., "7_day_streak"
    scheduled_delivery: Optional[str] = None
    created_at: str = ""

class ContentDelivery(BaseModel):
    """Scheduled content delivery to client"""
    id: str
    content_id: str
    client_id: str
    scheduled_for: str
    delivered: bool = False
    delivered_at: Optional[str] = None
    opened: bool = False
    opened_at: Optional[str] = None

# ==================== NOTIFICATION MODELS ====================

class PushNotification(BaseModel):
    """Push notification record"""
    id: str
    user_id: str
    title: str
    body: str
    data: Dict[str, Any] = {}
    notification_type: str  # workout_reminder, checkin, message, achievement
    scheduled_for: Optional[str] = None
    sent: bool = False
    sent_at: Optional[str] = None
    opened: bool = False
    opened_at: Optional[str] = None
    created_at: str = ""

# ==================== REQUEST/RESPONSE MODELS ====================

class VibeOnboardingRequest(BaseModel):
    """Vibe-based onboarding request"""
    user_id: str
    vibe_mode: VibeMode
    primary_goal: str
    experience_level: str
    available_days: List[str]
    session_duration: int
    equipment: List[str]
    obstacles: Optional[str] = None

class GenerateProgramRequest(BaseModel):
    """Request to generate AI workout program"""
    trainer_id: str
    client_id: str
    duration_weeks: int = 4
    custom_notes: Optional[str] = None

class CheckinRequest(BaseModel):
    """Daily check-in request"""
    client_id: str
    energy_level: int = Field(ge=1, le=5)
    stress_level: int = Field(ge=1, le=5)
    sleep_quality: int = Field(ge=1, le=5)
    sleep_hours: float = Field(ge=0, le=24)
    mood: Optional[str] = None
    notes: Optional[str] = None
    pain_areas: List[str] = []

class AdaptWorkoutRequest(BaseModel):
    """Request to adapt a workout"""
    workout_id: str
    client_id: str
    reason: str  # low_energy, time_crunch, injury, mood
    available_time: Optional[int] = None
    current_energy: Optional[int] = None
