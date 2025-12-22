"""
LiftLink Coaching Automation Models
Comprehensive data models for automated coaching features
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from uuid import uuid4


# ==================== ENUMS ====================

class ProgramDeliveryType(str, Enum):
    IMMEDIATE = "immediate"
    SCHEDULED = "scheduled"
    SEQUENCE = "sequence"
    ON_PURCHASE = "on_purchase"
    ON_SIGNUP = "on_signup"


class TaskType(str, Enum):
    WEIGH_IN = "weigh_in"
    PROGRESS_PHOTO = "progress_photo"
    WEEKLY_FORM = "weekly_form"
    MEASUREMENT = "measurement"
    CUSTOM = "custom"


class TaskFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    ONE_TIME = "one_time"


class MessageTrigger(str, Enum):
    AFTER_WORKOUT = "after_workout"
    MISSED_WORKOUT = "missed_workout"
    REST_DAY = "rest_day"
    WEEKLY_CHECKIN = "weekly_checkin"
    STREAK_MILESTONE = "streak_milestone"
    SIGNUP = "signup"
    PURCHASE = "purchase"
    CUSTOM_DATE = "custom_date"


class ChallengeMetric(str, Enum):
    STEPS = "steps"
    TOTAL_WEIGHT_LIFTED = "total_weight_lifted"
    TOTAL_REPS = "total_reps"
    WEIGHT_CHANGE = "weight_change"
    WORKOUT_COUNT = "workout_count"
    STREAK_DAYS = "streak_days"
    CALORIES_BURNED = "calories_burned"


class ClientRiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class OnboardingStepType(str, Enum):
    WELCOME_MESSAGE = "welcome_message"
    INTAKE_FORM = "intake_form"
    GOAL_SETTING = "goal_setting"
    PROGRAM_ASSIGNMENT = "program_assignment"
    FIRST_WORKOUT = "first_workout"
    PAYMENT = "payment"
    CUSTOM = "custom"


# ==================== PROGRAM DELIVERY MODELS ====================

class ProgramTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    name: str
    description: Optional[str] = None
    duration_weeks: int = 4
    workouts_per_week: int = 3
    workouts: List[Dict] = []  # List of workout definitions
    delivery_type: ProgramDeliveryType = ProgramDeliveryType.IMMEDIATE
    auto_assign_on: Optional[str] = None  # "signup", "package_purchase", etc.
    package_ids: List[str] = []  # Packages that trigger auto-assignment
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ScheduledWorkout(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    client_ids: List[str] = []  # Can be individual or group
    group_id: Optional[str] = None
    workout_id: str
    workout_name: str
    scheduled_date: str
    scheduled_time: Optional[str] = None
    sequence_position: Optional[int] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None  # "weekly", "biweekly", etc.
    notification_enabled: bool = True
    notification_hours_before: int = 2
    status: str = "scheduled"  # scheduled, completed, skipped
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class PDFWorkoutUpload(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    original_filename: str
    file_url: str
    processing_status: str = "pending"  # pending, processing, completed, failed
    extracted_workouts: List[Dict] = []
    error_message: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ==================== AUTO MESSAGES MODELS ====================

class MessageTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    name: str
    subject: Optional[str] = None
    body: str  # Supports variables: {name}, {last_workout}, {goals}, {streak}, etc.
    trigger: MessageTrigger
    trigger_config: Dict = {}  # e.g., {"days_after_workout": 1, "workout_type": "leg"}
    is_active: bool = True
    send_as: str = "dm"  # dm, push, email
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ScheduledMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    template_id: Optional[str] = None
    recipient_ids: List[str] = []  # Individual clients or "all"
    group_id: Optional[str] = None
    subject: Optional[str] = None
    body: str
    scheduled_datetime: str
    personalization_vars: List[str] = []  # Variables to personalize
    status: str = "scheduled"  # scheduled, sent, failed
    sent_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class AutoCheckIn(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    client_id: str
    trigger: MessageTrigger
    message_template_id: str
    last_sent: Optional[str] = None
    next_scheduled: Optional[str] = None
    is_active: bool = True


# ==================== TASKS & HABITS MODELS ====================

class TaskTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    name: str
    description: Optional[str] = None
    task_type: TaskType
    frequency: TaskFrequency
    preferred_time: Optional[str] = None  # "09:00"
    form_fields: List[Dict] = []  # For custom forms
    requires_photo: bool = False
    requires_measurement: bool = False
    xp_reward: int = 10
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ClientTask(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    client_id: str
    trainer_id: str
    task_template_id: str
    task_name: str
    task_type: TaskType
    due_date: str
    due_time: Optional[str] = None
    status: str = "pending"  # pending, completed, skipped, overdue
    completed_at: Optional[str] = None
    response_data: Optional[Dict] = None  # Weight, photo URL, form answers
    xp_earned: int = 0
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class HabitTracker(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    client_id: str
    trainer_id: str
    habit_name: str
    description: Optional[str] = None
    target_frequency: int = 7  # Times per week
    current_streak: int = 0
    longest_streak: int = 0
    completion_history: List[Dict] = []  # {"date": "2024-01-01", "completed": true}
    xp_per_completion: int = 5
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ==================== GROUP & CHALLENGES MODELS ====================

class FitnessChallenge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    name: str
    description: Optional[str] = None
    start_date: str
    end_date: str
    metric: ChallengeMetric
    target_value: Optional[float] = None  # e.g., 10000 steps, 50 workouts
    entry_fee: float = 0.0
    prize_pool: float = 0.0
    prize_description: Optional[str] = None
    participant_ids: List[str] = []
    leaderboard: List[Dict] = []  # Auto-updated
    is_public: bool = False
    max_participants: Optional[int] = None
    status: str = "upcoming"  # upcoming, active, completed
    scheduled_posts: List[Dict] = []  # Forum/announcement posts
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ChallengeParticipant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    challenge_id: str
    client_id: str
    client_name: str
    joined_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    current_value: float = 0.0
    rank: int = 0
    daily_progress: List[Dict] = []  # {"date": "2024-01-01", "value": 5000}
    badges_earned: List[str] = []


class GroupClass(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    name: str
    description: Optional[str] = None
    member_ids: List[str] = []
    max_members: Optional[int] = None
    workout_schedule: List[Dict] = []  # Scheduled workouts for the group
    announcements: List[Dict] = []
    forum_enabled: bool = True
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ScheduledPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    target_type: str  # "group", "challenge", "all_clients"
    target_id: Optional[str] = None
    title: str
    content: str
    post_type: str = "announcement"  # announcement, forum, challenge_update
    scheduled_datetime: str
    status: str = "scheduled"
    posted_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ==================== CLIENT TRACKING MODELS ====================

class ClientActivityLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    client_id: str
    trainer_id: str
    activity_type: str  # workout_completed, task_completed, checkin, pr_set, etc.
    activity_data: Dict = {}
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ClientProgressReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    client_id: str
    trainer_id: str
    report_period: str  # "weekly", "monthly"
    period_start: str
    period_end: str
    metrics: Dict = {}  # workouts_completed, tasks_completed, weight_change, etc.
    risk_level: ClientRiskLevel = ClientRiskLevel.LOW
    risk_factors: List[str] = []
    coach_notes: Optional[str] = None
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class PersonalRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    client_id: str
    exercise_name: str
    pr_type: str  # "1rm", "5rm", "max_reps", "fastest_time", etc.
    value: float
    unit: str  # "lbs", "kg", "reps", "seconds"
    previous_value: Optional[float] = None
    achieved_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    workout_id: Optional[str] = None


class AtRiskAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    client_id: str
    client_name: str
    risk_level: ClientRiskLevel
    risk_factors: List[str]
    recommended_actions: List[str]
    is_acknowledged: bool = False
    acknowledged_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ==================== ONBOARDING & PAYMENTS MODELS ====================

class OnboardingSequence(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    name: str
    description: Optional[str] = None
    steps: List[Dict] = []  # Ordered list of onboarding steps
    trigger: str = "signup"  # signup, package_purchase, manual
    trigger_package_ids: List[str] = []
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class OnboardingStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    sequence_id: str
    step_order: int
    step_type: OnboardingStepType
    title: str
    description: Optional[str] = None
    content: Dict = {}  # Step-specific content
    delay_days: int = 0  # Days after previous step
    is_required: bool = True
    auto_advance: bool = True


class ClientOnboardingProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    client_id: str
    sequence_id: str
    current_step: int = 0
    completed_steps: List[str] = []
    step_responses: Dict = {}  # Responses/data from each step
    started_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    completed_at: Optional[str] = None
    status: str = "in_progress"  # in_progress, completed, abandoned


class PaymentSequence(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    trainer_id: str
    name: str
    package_id: str
    package_name: str
    package_price: float
    follow_up_schedule: List[Dict] = []  # Days and messages for follow-ups
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class PaymentFollowUp(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    sequence_id: str
    client_id: str
    client_name: str
    client_email: str
    package_id: str
    current_step: int = 0
    messages_sent: List[Dict] = []
    status: str = "active"  # active, converted, expired, unsubscribed
    started_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    converted_at: Optional[str] = None


# ==================== REQUEST MODELS ====================

class CreateProgramTemplateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    duration_weeks: int = 4
    workouts_per_week: int = 3
    workouts: List[Dict] = []
    delivery_type: ProgramDeliveryType = ProgramDeliveryType.IMMEDIATE
    auto_assign_on: Optional[str] = None
    package_ids: List[str] = []


class ScheduleWorkoutRequest(BaseModel):
    client_ids: List[str] = []
    group_id: Optional[str] = None
    workout_id: str
    workout_name: str
    scheduled_date: str
    scheduled_time: Optional[str] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    notification_enabled: bool = True


class CreateMessageTemplateRequest(BaseModel):
    name: str
    subject: Optional[str] = None
    body: str
    trigger: MessageTrigger
    trigger_config: Dict = {}
    send_as: str = "dm"


class ScheduleMessageRequest(BaseModel):
    template_id: Optional[str] = None
    recipient_ids: List[str] = []
    group_id: Optional[str] = None
    subject: Optional[str] = None
    body: str
    scheduled_datetime: str


class CreateTaskTemplateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    task_type: TaskType
    frequency: TaskFrequency
    preferred_time: Optional[str] = None
    form_fields: List[Dict] = []
    requires_photo: bool = False
    requires_measurement: bool = False
    xp_reward: int = 10


class CreateChallengeRequest(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: str
    end_date: str
    metric: ChallengeMetric
    target_value: Optional[float] = None
    entry_fee: float = 0.0
    prize_description: Optional[str] = None
    is_public: bool = False
    max_participants: Optional[int] = None


class CreateOnboardingSequenceRequest(BaseModel):
    name: str
    description: Optional[str] = None
    steps: List[Dict] = []
    trigger: str = "signup"
    trigger_package_ids: List[str] = []


class CreatePaymentSequenceRequest(BaseModel):
    name: str
    package_id: str
    package_name: str
    package_price: float
    follow_up_schedule: List[Dict] = []
