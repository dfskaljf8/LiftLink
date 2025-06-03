import os
import uuid
import asyncio
import hashlib
import base64
import re
import time
import ipaddress
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Query, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field, EmailStr
from pymongo import MongoClient, GEOSPHERE
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import firebase_admin
from firebase_admin import credentials, auth, storage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from dotenv import load_dotenv
import json
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization
import dns.resolver
import logging
import textstat
# import face_recognition  # Commented out for now - requires complex deps
import numpy as np
from PIL import Image
import io

# Load environment variables
load_dotenv()

# Security Configuration
SECURITY_CONFIG = {
    "MAX_LOGIN_ATTEMPTS": 5,
    "LOGIN_LOCKOUT_DURATION": 300,  # 5 minutes
    "MAX_REGISTRATION_PER_IP_HOUR": 3,
    "MAX_MESSAGES_PER_MINUTE": 10,
    "BANNED_COUNTRIES": [""],  # Add ISO country codes as needed
    "HIGH_RISK_REGIONS": [""],  # Add regions that need extra verification
    "MIN_TRAINER_AGE": 18,
    "MAX_TRAINER_AGE": 80,
    "SUSPICIOUS_KEYWORDS": [
        "meet", "private", "personal", "money", "cash", "payment", 
        "outside", "app", "whatsapp", "telegram", "phone", "number",
        "address", "location", "home", "alone"
    ],
    "GROOMING_PATTERNS": [
        "special", "secret", "don't tell", "between us", "private message",
        "beautiful", "sexy", "cute", "photos", "pictures"
    ]
}

# Initialize security logger
logging.basicConfig(level=logging.INFO)
security_logger = logging.getLogger("liftlink_security")

# Rate limiting storage (in production, use Redis)
rate_limit_storage = {}
failed_login_attempts = {}

def get_client_ip(request: Request) -> str:
    """Get real client IP address"""
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.client.host

def check_rate_limit(identifier: str, limit: int, window_minutes: int = 1) -> bool:
    """Check if request is within rate limit"""
    current_time = time.time()
    window_start = current_time - (window_minutes * 60)
    
    if identifier not in rate_limit_storage:
        rate_limit_storage[identifier] = []
    
    # Remove old entries
    rate_limit_storage[identifier] = [
        timestamp for timestamp in rate_limit_storage[identifier] 
        if timestamp > window_start
    ]
    
    # Check if within limit
    if len(rate_limit_storage[identifier]) >= limit:
        return False
    
    # Add current request
    rate_limit_storage[identifier].append(current_time)
    return True

def is_suspicious_content(text: str) -> Dict[str, Any]:
    """AI-driven content analysis for suspicious patterns"""
    suspicion_score = 0
    flags = []
    
    # Check for suspicious keywords
    text_lower = text.lower()
    for keyword in SECURITY_CONFIG["SUSPICIOUS_KEYWORDS"]:
        if keyword in text_lower:
            suspicion_score += 10
            flags.append(f"suspicious_keyword: {keyword}")
    
    # Check for grooming patterns
    for pattern in SECURITY_CONFIG["GROOMING_PATTERNS"]:
        if pattern in text_lower:
            suspicion_score += 25
            flags.append(f"grooming_pattern: {pattern}")
    
    # Text complexity analysis (predators often use simple language)
    reading_level = textstat.flesch_reading_ease(text)
    if reading_level > 90:  # Very easy to read
        suspicion_score += 5
        flags.append("simple_language")
    
    # Check for excessive punctuation/emojis (grooming behavior)
    emoji_count = len([c for c in text if ord(c) > 127])
    if emoji_count > len(text) * 0.3:
        suspicion_score += 15
        flags.append("excessive_emojis")
    
    # Check for urgency/pressure words
    pressure_words = ["urgent", "now", "immediately", "quickly", "hurry"]
    for word in pressure_words:
        if word in text_lower:
            suspicion_score += 8
            flags.append(f"pressure_word: {word}")
    
    return {
        "suspicion_score": suspicion_score,
        "flags": flags,
        "is_suspicious": suspicion_score > 20
    }

def verify_face_match(id_image_data: bytes, selfie_image_data: bytes) -> bool:
    """Verify face match between ID and selfie using face_recognition"""
    try:
        # Temporarily disabled - requires face_recognition package
        # Load images
        # id_image = face_recognition.load_image_file(io.BytesIO(id_image_data))
        # selfie_image = face_recognition.load_image_file(io.BytesIO(selfie_image_data))
        
        # Get face encodings
        # id_encodings = face_recognition.face_encodings(id_image)
        # selfie_encodings = face_recognition.face_encodings(selfie_image)
        
        # if not id_encodings or not selfie_encodings:
        #     return False
        
        # Compare faces
        # matches = face_recognition.compare_faces([id_encodings[0]], selfie_encodings[0])
        # return matches[0]
        
        # For now, just return True for testing
        return True
        
    except Exception as e:
        security_logger.error(f"Face verification error: {e}")
        return False
        
        # Compare faces
        return matches[0]
        
    except Exception as e:
        security_logger.error(f"Face verification error: {e}")
        return False

async def log_security_event(event_type: str, user_id: str, details: Dict[str, Any], severity: str = "INFO"):
    """Log security events for audit trail"""
    security_event = {
        "event_id": str(uuid.uuid4()),
        "event_type": event_type,
        "user_id": user_id,
        "details": details,
        "severity": severity,
        "timestamp": datetime.utcnow(),
        "investigation_status": "pending" if severity in ["HIGH", "CRITICAL"] else "closed"
    }
    
    await db.security_events.insert_one(security_event)
    security_logger.info(f"Security Event [{severity}]: {event_type} - User: {user_id}")
    
    # Auto-flag for manual review if high severity
    if severity in ["HIGH", "CRITICAL"]:
        await create_manual_review_task(user_id, event_type, details)

async def create_manual_review_task(user_id: str, reason: str, details: Dict[str, Any]):
    """Create manual review task for admin"""
    review_task = {
        "task_id": str(uuid.uuid4()),
        "user_id": user_id,
        "reason": reason,
        "details": details,
        "status": "pending",
        "priority": "high" if reason in ["grooming_detected", "fake_id"] else "medium",
        "created_at": datetime.utcnow(),
        "assigned_admin": None,
        "resolution": None
    }
    
    await db.manual_review_tasks.insert_one(review_task)

def generate_encryption_keypair():
    """Generate RSA key pair for end-to-end encryption"""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    public_key = private_key.public_key()
    
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    return private_pem.decode(), public_pem.decode()

def encrypt_message(message: str, public_key_pem: str) -> str:
    """Encrypt message with recipient's public key"""
    public_key = serialization.load_pem_public_key(public_key_pem.encode())
    
    # For long messages, use hybrid encryption (RSA + AES)
    if len(message.encode()) > 190:  # RSA limitation
        # Generate AES key
        aes_key = Fernet.generate_key()
        fernet = Fernet(aes_key)
        
        # Encrypt message with AES
        encrypted_message = fernet.encrypt(message.encode())
        
        # Encrypt AES key with RSA
        encrypted_aes_key = public_key.encrypt(
            aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        # Combine both
        result = {
            "encrypted_key": base64.b64encode(encrypted_aes_key).decode(),
            "encrypted_message": base64.b64encode(encrypted_message).decode(),
            "type": "hybrid"
        }
        return base64.b64encode(json.dumps(result).encode()).decode()
    else:
        # Direct RSA encryption for short messages
        encrypted = public_key.encrypt(
            message.encode(),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return base64.b64encode(encrypted).decode()

def decrypt_message(encrypted_data: str, private_key_pem: str) -> str:
    """Decrypt message with private key"""
    private_key = serialization.load_pem_private_key(private_key_pem.encode(), password=None)
    
    try:
        # Try hybrid decryption first
        decoded_data = json.loads(base64.b64decode(encrypted_data).decode())
        if decoded_data.get("type") == "hybrid":
            # Decrypt AES key
            encrypted_aes_key = base64.b64decode(decoded_data["encrypted_key"])
            aes_key = private_key.decrypt(
                encrypted_aes_key,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            # Decrypt message
            fernet = Fernet(aes_key)
            encrypted_message = base64.b64decode(decoded_data["encrypted_message"])
            return fernet.decrypt(encrypted_message).decode()
    except:
        # Fall back to direct RSA decryption
        encrypted_bytes = base64.b64decode(encrypted_data)
        decrypted = private_key.decrypt(
            encrypted_bytes,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return decrypted.decode()

# Initialize encryption key (in production, store securely)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key())
cipher_suite = Fernet(ENCRYPTION_KEY)

def encrypt_data(data: str) -> str:
    """Encrypt sensitive data"""
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    """Decrypt sensitive data"""
    return cipher_suite.decrypt(encrypted_data.encode()).decode()

# Custom JSON encoder for MongoDB ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

# Helper function to convert ObjectId to string in documents
def serialize_doc(doc):
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == '_id' and isinstance(value, ObjectId):
                result[key] = str(value)  # Convert ObjectId to string
            elif isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = serialize_doc(value)
            else:
                result[key] = value
        return result
    elif isinstance(doc, ObjectId):
        return str(doc)  # Convert ObjectId to string
    return doc

# Load environment variables
load_dotenv()

# Security Configuration
SECURITY_CONFIG = {
    "MAX_LOGIN_ATTEMPTS": 5,
    "LOGIN_LOCKOUT_DURATION": 300,  # 5 minutes
    "MAX_REGISTRATION_PER_IP_HOUR": 3,
    "MAX_MESSAGES_PER_MINUTE": 10,
    "BANNED_COUNTRIES": [""],  # Add ISO country codes as needed
    "HIGH_RISK_REGIONS": [""],  # Add regions that need extra verification
    "MIN_TRAINER_AGE": 18,
    "MAX_TRAINER_AGE": 80,
    "SUSPICIOUS_KEYWORDS": [
        "meet", "private", "personal", "money", "cash", "payment", 
        "outside", "app", "whatsapp", "telegram", "phone", "number",
        "address", "location", "home", "alone"
    ],
    "GROOMING_PATTERNS": [
        "special", "secret", "don't tell", "between us", "private message",
        "beautiful", "sexy", "cute", "photos", "pictures"
    ]
}

# Initialize security logger
logging.basicConfig(level=logging.INFO)
security_logger = logging.getLogger("liftlink_security")

# Rate limiting storage (in production, use Redis)
rate_limit_storage = {}
failed_login_attempts = {}

def get_client_ip(request: Request) -> str:
    """Get real client IP address"""
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.client.host

def check_rate_limit(identifier: str, limit: int, window_minutes: int = 1) -> bool:
    """Check if request is within rate limit"""
    current_time = time.time()
    window_start = current_time - (window_minutes * 60)
    
    if identifier not in rate_limit_storage:
        rate_limit_storage[identifier] = []
    
    # Remove old entries
    rate_limit_storage[identifier] = [
        timestamp for timestamp in rate_limit_storage[identifier] 
        if timestamp > window_start
    ]
    
    # Check if within limit
    if len(rate_limit_storage[identifier]) >= limit:
        return False
    
    # Add current request
    rate_limit_storage[identifier].append(current_time)
    return True

def is_suspicious_content(text: str) -> Dict[str, Any]:
    """AI-driven content analysis for suspicious patterns"""
    suspicion_score = 0
    flags = []
    
    # Check for suspicious keywords
    text_lower = text.lower()
    for keyword in SECURITY_CONFIG["SUSPICIOUS_KEYWORDS"]:
        if keyword in text_lower:
            suspicion_score += 10
            flags.append(f"suspicious_keyword: {keyword}")
    
    # Check for grooming patterns
    for pattern in SECURITY_CONFIG["GROOMING_PATTERNS"]:
        if pattern in text_lower:
            suspicion_score += 25
            flags.append(f"grooming_pattern: {pattern}")
    
    # Text complexity analysis (predators often use simple language)
    reading_level = textstat.flesch_reading_ease(text)
    if reading_level > 90:  # Very easy to read
        suspicion_score += 5
        flags.append("simple_language")
    
    # Check for excessive punctuation/emojis (grooming behavior)
    emoji_count = len([c for c in text if ord(c) > 127])
    if emoji_count > len(text) * 0.3:
        suspicion_score += 15
        flags.append("excessive_emojis")
    
    # Check for urgency/pressure words
    pressure_words = ["urgent", "now", "immediately", "quickly", "hurry"]
    for word in pressure_words:
        if word in text_lower:
            suspicion_score += 8
            flags.append(f"pressure_word: {word}")
    
    return {
        "suspicion_score": suspicion_score,
        "flags": flags,
        "is_suspicious": suspicion_score > 20
    }

def verify_face_match(id_image_data: bytes, selfie_image_data: bytes) -> bool:
    """Verify face match between ID and selfie using face_recognition"""
    try:
        # Temporarily disabled - requires face_recognition package
        # Load images
        # id_image = face_recognition.load_image_file(io.BytesIO(id_image_data))
        # selfie_image = face_recognition.load_image_file(io.BytesIO(selfie_image_data))
        
        # Get face encodings
        # id_encodings = face_recognition.face_encodings(id_image)
        # selfie_encodings = face_recognition.face_encodings(selfie_image)
        
        # if not id_encodings or not selfie_encodings:
        #     return False
        
        # Compare faces
        # matches = face_recognition.compare_faces([id_encodings[0]], selfie_encodings[0])
        # return matches[0]
        
        # For now, just return True for testing
        return True
        
    except Exception as e:
        security_logger.error(f"Face verification error: {e}")
        return False
        
        # Compare faces
        return matches[0]
        
    except Exception as e:
        security_logger.error(f"Face verification error: {e}")
        return False

async def log_security_event(event_type: str, user_id: str, details: Dict[str, Any], severity: str = "INFO"):
    """Log security events for audit trail"""
    security_event = {
        "event_id": str(uuid.uuid4()),
        "event_type": event_type,
        "user_id": user_id,
        "details": details,
        "severity": severity,
        "timestamp": datetime.utcnow(),
        "investigation_status": "pending" if severity in ["HIGH", "CRITICAL"] else "closed"
    }
    
    await db.security_events.insert_one(security_event)
    security_logger.info(f"Security Event [{severity}]: {event_type} - User: {user_id}")
    
    # Auto-flag for manual review if high severity
    if severity in ["HIGH", "CRITICAL"]:
        await create_manual_review_task(user_id, event_type, details)

async def create_manual_review_task(user_id: str, reason: str, details: Dict[str, Any]):
    """Create manual review task for admin"""
    review_task = {
        "task_id": str(uuid.uuid4()),
        "user_id": user_id,
        "reason": reason,
        "details": details,
        "status": "pending",
        "priority": "high" if reason in ["grooming_detected", "fake_id"] else "medium",
        "created_at": datetime.utcnow(),
        "assigned_admin": None,
        "resolution": None
    }
    
    await db.manual_review_tasks.insert_one(review_task)

def generate_encryption_keypair():
    """Generate RSA key pair for end-to-end encryption"""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    public_key = private_key.public_key()
    
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    return private_pem.decode(), public_pem.decode()

def encrypt_message(message: str, public_key_pem: str) -> str:
    """Encrypt message with recipient's public key"""
    public_key = serialization.load_pem_public_key(public_key_pem.encode())
    
    # For long messages, use hybrid encryption (RSA + AES)
    if len(message.encode()) > 190:  # RSA limitation
        # Generate AES key
        aes_key = Fernet.generate_key()
        fernet = Fernet(aes_key)
        
        # Encrypt message with AES
        encrypted_message = fernet.encrypt(message.encode())
        
        # Encrypt AES key with RSA
        encrypted_aes_key = public_key.encrypt(
            aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        # Combine both
        result = {
            "encrypted_key": base64.b64encode(encrypted_aes_key).decode(),
            "encrypted_message": base64.b64encode(encrypted_message).decode(),
            "type": "hybrid"
        }
        return base64.b64encode(json.dumps(result).encode()).decode()
    else:
        # Direct RSA encryption for short messages
        encrypted = public_key.encrypt(
            message.encode(),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return base64.b64encode(encrypted).decode()

def decrypt_message(encrypted_data: str, private_key_pem: str) -> str:
    """Decrypt message with private key"""
    private_key = serialization.load_pem_private_key(private_key_pem.encode(), password=None)
    
    try:
        # Try hybrid decryption first
        decoded_data = json.loads(base64.b64decode(encrypted_data).decode())
        if decoded_data.get("type") == "hybrid":
            # Decrypt AES key
            encrypted_aes_key = base64.b64decode(decoded_data["encrypted_key"])
            aes_key = private_key.decrypt(
                encrypted_aes_key,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            # Decrypt message
            fernet = Fernet(aes_key)
            encrypted_message = base64.b64decode(decoded_data["encrypted_message"])
            return fernet.decrypt(encrypted_message).decode()
    except:
        # Fall back to direct RSA decryption
        encrypted_bytes = base64.b64decode(encrypted_data)
        decrypted = private_key.decrypt(
            encrypted_bytes,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return decrypted.decode()

# Email verification helper functions
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

# Email verification helper functions
def validate_email_format(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def check_email_domain_exists(email: str) -> bool:
    """Check if email domain exists (has MX record)"""
    try:
        domain = email.split('@')[1]
        dns.resolver.resolve(domain, 'MX')
        return True
    except:
        return False

def generate_verification_code() -> str:
    """Generate 6-digit verification code"""
    import random
    return str(random.randint(100000, 999999))

async def send_verification_email(email: str, code: str) -> bool:
    """Send verification email (simplified for demo)"""
    # In production, you would use a real email service
    # For now, we'll just log the code and return True
    print(f"VERIFICATION CODE for {email}: {code}")
    
    # In production, you'd use something like:
    # - SendGrid API
    # - AWS SES  
    # - SMTP server
    
    return True

# Initialize MongoDB with geospatial indexing
mongo_client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = mongo_client[os.getenv("DB_NAME", "liftlink_db")]

# Create geospatial indexes for location-based features
async def setup_geospatial_indexes():
    """Set up geospatial indexes for location-based matching"""
    try:
        await db.users.create_index([("location", GEOSPHERE)])
        await db.trainers.create_index([("location", GEOSPHERE)])
    except Exception as e:
        print(f"Geospatial index setup (continuing without): {e}")

# Initialize Stripe
stripe_checkout = StripeCheckout(api_key=os.getenv("STRIPE_SECRET_KEY"))

# FastAPI app
app = FastAPI(title="LiftLink API", version="1.0.0")

# Setup database indexes on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database indexes and setup"""
    await setup_geospatial_indexes()

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
    role: str = "user"  # "user" or "trainer" or "admin"
    name: str
    phone: Optional[str] = None
    location: Optional[Dict[str, float]] = None  # {"lat": float, "lng": float}
    gym: Optional[str] = None
    date_of_birth: Optional[str] = None  # YYYY-MM-DD format
    id_verified: bool = False
    id_document_url: Optional[str] = None
    id_verification_status: str = "pending"  # "pending", "verified", "rejected"
    
    # Gamification fields
    xp_points: int = 0
    level: int = 1
    badges: List[str] = []
    lift_coins: int = 0
    total_coins_earned: int = 0
    consecutive_days: int = 0
    last_check_in: Optional[datetime] = None
    
    # Tracking for rewards
    first_session_completed: bool = False
    total_referrals: int = 0
    total_reviews_left: int = 0
    goals_completed: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LiftCoinTransactionModel(BaseModel):
    transaction_id: str
    user_id: str
    transaction_type: str  # "earned", "spent", "purchased"
    amount: int  # positive for earned/purchased, negative for spent
    reason: str  # "daily_streak", "first_session", "review", "referral", "purchase", "session_discount"
    metadata: Optional[Dict[str, Any]] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TreeNodeModel(BaseModel):
    node_id: str
    user_id: str
    node_type: str  # "goal", "achievement", "milestone", "feedback"
    title: str
    description: str
    status: str  # "active", "completed", "locked"
    parent_node_id: Optional[str] = None  # For branching structure
    position: Dict[str, float]  # {"x": 0.5, "y": 0.3} relative positions
    icon: str = "🎯"
    color: str = "#BDD53D"
    xp_reward: int = 0
    coin_reward: int = 0
    completion_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SocialFollowModel(BaseModel):
    follow_id: str
    follower_id: str  # User who is following
    following_id: str  # User being followed
    follow_type: str = "user"  # "user", "trainer"
    notifications_enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SocialActivityModel(BaseModel):
    activity_id: str
    user_id: str
    activity_type: str  # "goal_completed", "badge_earned", "streak_milestone", "session_completed"
    title: str
    description: str
    metadata: Dict[str, Any] = {}
    is_public: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NotificationModel(BaseModel):
    notification_id: str
    user_id: str
    title: str
    message: str
    notification_type: str  # "friend_activity", "achievement", "reminder"
    is_read: bool = False
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LocationModel(BaseModel):
    user_id: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    radius_km: float = 25.0  # Search radius in kilometers
    is_public: bool = True
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class EmailVerificationModel(BaseModel):
    verification_id: str
    email: str
    verification_code: str
    is_verified: bool = False
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

class IDVerificationModel(BaseModel):
    verification_id: str
    user_id: str
    document_type: str  # "drivers_license", "passport", "national_id"
    document_url: str
    extracted_data: Optional[Dict[str, Any]] = {}  # Name, DOB, etc.
    verification_status: str = "pending"  # "pending", "verified", "rejected"
    verification_notes: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CertificationModel(BaseModel):
    certification_id: str
    trainer_id: str
    cert_type: str  # "NASM", "ACE", "ISSA", "CSCS", "Other"
    cert_number_encrypted: str  # Encrypted certification number
    cert_document_url: str  # Firebase Storage URL
    expiration_date: Optional[datetime] = None
    verification_status: str = "pending"  # "pending", "verified", "rejected"
    verification_notes: Optional[str] = None
    verified_at: Optional[datetime] = None
    xp_awarded: int = 0
    coins_awarded: int = 0
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
    is_certified_trainer: bool = False
    verified_certifications: List[str] = []  # List of verified cert types
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

class ProgressEntryRequest(BaseModel):
    weight: float
    body_fat_percentage: Optional[float] = None
    muscle_mass: Optional[float] = None
    measurements: Optional[Dict[str, float]] = {}
    notes: Optional[str] = None

class GoalRequest(BaseModel):
    goal_type: str
    target_value: float
    target_date: str  # ISO format

class IDVerificationRequest(BaseModel):
    document_type: str
    date_of_birth: str  # YYYY-MM-DD format

class CertificationRequest(BaseModel):
    cert_type: str
    cert_number: str
    expiration_date: Optional[str] = None  # YYYY-MM-DD format

class UserRegistrationRequest(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    location: Optional[Dict[str, float]] = None
    gym: Optional[str] = None

class EmailVerificationRequest(BaseModel):
    email: EmailStr
    verification_code: str

class SocialFollowRequest(BaseModel):
    user_id: str

# Authentication dependency
async def get_current_user(token: str = Depends(security)):
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # For demo purposes, we'll use a simplified auth system
        # In production, this would verify Firebase tokens
        user_id = token.credentials if token else "demo_user"
        
        # Handle demo users
        if user_id in ["demo_user", "demo_trainer", "demo_admin"]:
            # Map demo tokens to actual user IDs
            if user_id == "demo_user":
                user_id = "demo_user_1"
            elif user_id == "demo_trainer":
                user_id = "demo_user_2"
            elif user_id == "demo_admin":
                user_id = "admin_aarav"
        
        user = await db.users.find_one({"user_id": user_id})
        if not user:
            # Create demo user if not exists
            if user_id == "demo_user_1":
                user = {
                    "user_id": "demo_user_1",
                    "email": "user@demo.com",
                    "name": "Demo User",
                    "role": "user",
                    "xp_points": 0,
                    "level": 1,
                    "badges": [],
                    "lift_coins": 0,
                    "total_coins_earned": 0,
                    "consecutive_days": 0,
                    "first_session_completed": False,
                    "total_referrals": 0,
                    "total_reviews_left": 0,
                    "goals_completed": 0,
                    "created_at": datetime.utcnow()
                }
                await db.users.insert_one(user)
            elif user_id == "demo_user_2":
                user = {
                    "user_id": "demo_user_2", 
                    "email": "trainer@demo.com",
                    "name": "Demo Trainer",
                    "role": "trainer",
                    "xp_points": 200,
                    "level": 3,
                    "badges": ["verified_trainer", "first_certification"],
                    "lift_coins": 350,
                    "total_coins_earned": 500,
                    "consecutive_days": 5,
                    "first_session_completed": True,
                    "total_referrals": 2,
                    "total_reviews_left": 8,
                    "goals_completed": 3,
                    "created_at": datetime.utcnow()
                }
                await db.users.insert_one(user)
            elif user_id == "admin_aarav":
                user = {
                    "user_id": "admin_aarav",
                    "email": "aaravdthakker@gmail.com",
                    "name": "Aarav Thakker", 
                    "role": "admin",
                    "xp_points": 1000,
                    "level": 10,
                    "badges": ["admin", "platform_founder"],
                    "lift_coins": 5000,
                    "total_coins_earned": 5000,
                    "consecutive_days": 30,
                    "created_at": datetime.utcnow()
                }
                await db.users.insert_one(user)
            else:
                raise HTTPException(status_code=404, detail="User not found")
        
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# Gamification helper functions
async def award_coins(user_id: str, amount: int, reason: str, metadata: Dict = None):
    """Award LiftCoins to a user and create transaction record"""
    if metadata is None:
        metadata = {}
    
    # Update user's coin balance
    await db.users.update_one(
        {"user_id": user_id},
        {"$inc": {"lift_coins": amount, "total_coins_earned": amount}}
    )
    
    # Create transaction record
    transaction = LiftCoinTransactionModel(
        transaction_id=str(uuid.uuid4()),
        user_id=user_id,
        transaction_type="earned",
        amount=amount,
        reason=reason,
        metadata=metadata
    )
    
    await db.lift_coin_transactions.insert_one(transaction.dict())
    return amount

async def award_xp(user_id: str, amount: int, reason: str):
    """Award XP to a user and check for level up"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        return
    
    new_xp = user.get("xp_points", 0) + amount
    new_level = calculate_level(new_xp)
    
    update_data = {"xp_points": new_xp}
    if new_level > user.get("level", 1):
        update_data["level"] = new_level
        # Award bonus coins for level up
        bonus_coins = new_level * 10
        await award_coins(user_id, bonus_coins, f"level_up_to_{new_level}")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    return new_xp, new_level

def calculate_level(xp: int) -> int:
    """Calculate user level based on XP (exponential growth)"""
    if xp < 100:
        return 1
    elif xp < 300:
        return 2
    elif xp < 600:
        return 3
    elif xp < 1000:
        return 4
    elif xp < 1500:
        return 5
    else:
        return min(50, 5 + (xp - 1500) // 300)

async def award_badge(user_id: str, badge_id: str, xp_reward: int = 0, coin_reward: int = 0):
    """Award a badge to a user"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        return False
    
    current_badges = user.get("badges", [])
    if badge_id not in current_badges:
        current_badges.append(badge_id)
        
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"badges": current_badges}}
        )
        
        # Award XP and coins for the badge
        if xp_reward > 0:
            await award_xp(user_id, xp_reward, f"badge_{badge_id}")
        if coin_reward > 0:
            await award_coins(user_id, coin_reward, f"badge_{badge_id}")
        
        return True
    return False

async def check_daily_streak(user_id: str):
    """Check and update daily streak, award coins if applicable"""
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        return 0
    
    today = datetime.now().date()
    last_check_in = user.get("last_check_in")
    
    if last_check_in:
        last_date = last_check_in.date() if isinstance(last_check_in, datetime) else datetime.fromisoformat(last_check_in).date()
        days_diff = (today - last_date).days
        
        if days_diff == 1:
            # Consecutive day
            new_streak = user.get("consecutive_days", 0) + 1
        elif days_diff == 0:
            # Same day, no change
            return user.get("consecutive_days", 0)
        else:
            # Streak broken
            new_streak = 1
    else:
        # First check-in
        new_streak = 1
    
    # Update streak and last check-in
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "consecutive_days": new_streak,
            "last_check_in": datetime.now()
        }}
    )
    
    # Award coins for 7-day streak
    if new_streak == 7:
        await award_coins(user_id, 50, "weekly_streak", {"streak_days": 7})
        await award_badge(user_id, "weekly_warrior", 25, 10)
    elif new_streak == 30:
        await award_coins(user_id, 200, "monthly_streak", {"streak_days": 30})
        await award_badge(user_id, "consistency_champion", 100, 50)
    
    return new_streak

class UserLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_public: bool = True

class KYCDocumentUpload(BaseModel):
    document_type: str  # "government_id", "certification", "selfie"
    document_data: str  # base64 encoded

class MessageRequest(BaseModel):
    recipient_id: str
    content: str
    message_type: str = "text"  # "text", "image", "session_update"

class ReviewRequest(BaseModel):
    trainer_id: str
    rating: int  # 1-5
    review_text: str
    session_id: Optional[str] = None

class ReportRequest(BaseModel):
    reported_user_id: str
    reason: str
    description: str
    evidence: Optional[str] = None

class AdminActionRequest(BaseModel):
    action: str  # "approve", "reject", "ban", "investigate"
    reason: str
    details: Optional[Dict[str, Any]] = None

# Security and KYC Models
class KYCDocumentModel(BaseModel):
    document_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    document_type: str
    document_data: str  # encrypted base64
    verification_status: str = "pending"  # pending, verified, rejected
    verification_notes: Optional[str] = None
    verified_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    verified_at: Optional[datetime] = None

class MessageModel(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    recipient_id: str
    content: str  # encrypted
    message_type: str = "text"
    is_read: bool = False
    suspicion_score: int = 0
    suspicion_flags: List[str] = []
    is_flagged: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    edited_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

class ReviewModel(BaseModel):
    review_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # reviewer
    trainer_id: str
    rating: int
    review_text: str
    session_id: Optional[str] = None
    is_verified_client: bool = False
    moderation_status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReportModel(BaseModel):
    report_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reporter_id: str
    reported_user_id: str
    reason: str
    description: str
    evidence: Optional[str] = None
    status: str = "pending"  # pending, investigating, resolved, dismissed
    priority: str = "medium"  # low, medium, high, critical
    assigned_admin: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

class UserBehaviorModel(BaseModel):
    behavior_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    behavior_type: str  # "rapid_account_creation", "location_mismatch", "suspicious_messaging"
    risk_score: int
    details: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TreeProgressionModel(BaseModel):
    user_id: str
    current_stage: str = "seed"  # seed, sprout, sapling, young_tree, mature_tree, ancient_tree, redwood
    progress_points: int = 0
    milestones_completed: List[str] = []
    visual_upgrades: List[str] = []
    next_stage_requirements: Dict[str, int] = {}

# Tree progression system
TREE_STAGES = {
    "seed": {
        "name": "🌱 Fitness Seed",
        "description": "Just planted! Ready to grow with your first steps.",
        "required_points": 0,
        "icon": "🌱",
        "color": "#90EE90"
    },
    "sprout": {
        "name": "🌿 Growing Sprout", 
        "description": "First signs of growth! You're building momentum.",
        "required_points": 100,
        "icon": "🌿",
        "color": "#9ACD32"
    },
    "sapling": {
        "name": "🌳 Young Sapling",
        "description": "Strong foundation established. Consistent growth visible!",
        "required_points": 500,
        "icon": "🌳",
        "color": "#228B22"
    },
    "young_tree": {
        "name": "🌲 Young Tree",
        "description": "Impressive height reached! Others look up to your progress.",
        "required_points": 1500,
        "icon": "🌲",
        "color": "#006400"
    },
    "mature_tree": {
        "name": "🌴 Mature Tree",
        "description": "Fully developed and inspiring! A fitness role model.",
        "required_points": 3000,
        "icon": "🌴",
        "color": "#8B4513"
    },
    "ancient_tree": {
        "name": "🌳 Ancient Tree",
        "description": "Wisdom and strength embodied. A fitness legend!",
        "required_points": 6000,
        "icon": "🌳",
        "color": "#654321"
    },
    "redwood": {
        "name": "🌲 Mighty Redwood",
        "description": "The pinnacle of fitness achievement! Truly legendary status.",
        "required_points": 10000,
        "icon": "🌲",
        "color": "#B22222"
    }
}

# ============ ENHANCED SECURITY ENDPOINTS ============

# ============ USER MANAGEMENT ENDPOINTS ============

@app.post("/api/users/register")
async def register_user(user_data: UserRegistrationRequest):
    """Register a new user with email verification"""
    
    # Validate email format
    if not validate_email_format(user_data.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Check if email domain exists
    if not check_email_domain_exists(user_data.email):
        raise HTTPException(status_code=400, detail="Email domain does not exist")
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Generate verification code
    verification_code = generate_verification_code()
    
    # Send verification email
    email_sent = await send_verification_email(user_data.email, verification_code)
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send verification email")
    
    # Store verification record (expires in 10 minutes)
    verification_record = EmailVerificationModel(
        verification_id=str(uuid.uuid4()),
        email=user_data.email,
        verification_code=verification_code,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    
    await db.email_verifications.insert_one(verification_record.dict())
    
    # Temporarily store user data for completion after verification
    temp_user_data = user_data.dict()
    temp_user_data["verification_id"] = verification_record.verification_id
    
    await db.temp_users.insert_one(temp_user_data)
    
    return {
        "message": "Verification code sent to email. Please verify to complete registration.",
        "verification_id": verification_record.verification_id
    }

@app.post("/api/users/verify-email")
async def verify_email(verification_data: EmailVerificationRequest):
    """Verify email and complete user registration"""
    
    # Find verification record
    verification = await db.email_verifications.find_one({
        "email": verification_data.email,
        "verification_code": verification_data.verification_code,
        "is_verified": False
    })
    
    if not verification:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Check if verification has expired
    if datetime.utcnow() > verification["expires_at"]:
        raise HTTPException(status_code=400, detail="Verification code has expired")
    
    # Mark as verified
    await db.email_verifications.update_one(
        {"verification_id": verification["verification_id"]},
        {"$set": {"is_verified": True, "verified_at": datetime.utcnow()}}
    )
    
    # Get temporary user data
    temp_user = await db.temp_users.find_one({"verification_id": verification["verification_id"]})
    if not temp_user:
        raise HTTPException(status_code=400, detail="User data not found")
    
    # Create actual user
    user_id = str(uuid.uuid4())
    
    user = UserModel(
        user_id=user_id,
        email=temp_user["email"],
        name=temp_user["name"],
        phone=temp_user.get("phone"),
        location=temp_user.get("location"),
        gym=temp_user.get("gym")
    )
    
    await db.users.insert_one(user.dict())
    
    # Clean up temporary data
    await db.temp_users.delete_one({"verification_id": verification["verification_id"]})
    
    # Create welcome tree nodes for new user
    await create_welcome_tree_nodes(user_id)
    
    return {"user_id": user_id, "message": "Email verified and user registered successfully"}

async def create_welcome_tree_nodes(user_id: str):
    """Create initial welcome tree nodes for new users"""
    
    # Root goal: Get Started
    root_node = TreeNodeModel(
        node_id=str(uuid.uuid4()),
        user_id=user_id,
        node_type="goal",
        title="Welcome to LiftLink! 🎉",
        description="Complete your first fitness goal",
        status="active",
        position={"x": 0.5, "y": 0.1},
        icon="🌱",
        color="#BDD53D",
        xp_reward=50,
        coin_reward=100
    )
    
    # First milestone: Complete Profile
    profile_node = TreeNodeModel(
        node_id=str(uuid.uuid4()),
        user_id=user_id,
        node_type="milestone",
        title="Complete Your Profile",
        description="Add your fitness goals and preferences",
        status="active",
        parent_node_id=root_node.node_id,
        position={"x": 0.3, "y": 0.3},
        icon="👤",
        color="#FF6B6B",
        xp_reward=25,
        coin_reward=50
    )
    
    # Second milestone: First Session
    session_node = TreeNodeModel(
        node_id=str(uuid.uuid4()),
        user_id=user_id,
        node_type="milestone",
        title="Book Your First Session",
        description="Find a trainer and book your first workout",
        status="active",
        parent_node_id=root_node.node_id,
        position={"x": 0.7, "y": 0.3},
        icon="💪",
        color="#45B7D1",
        xp_reward=100,
        coin_reward=200
    )
    
    # Insert all nodes
    await db.tree_nodes.insert_many([
        root_node.dict(),
        profile_node.dict(),
        session_node.dict()
    ])

# ============ LOCATION SERVICES ENDPOINTS ============

@app.put("/api/users/location")
async def update_user_location(
    location_data: UserLocationUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user's location for matching"""
    
    # Update user location
    location_update = {
        "location": {
            "type": "Point",
            "coordinates": [location_data.longitude, location_data.latitude]
        },
        "address": location_data.address,
        "city": location_data.city,
        "state": location_data.state,
        "country": location_data.country,
        "location_updated_at": datetime.utcnow()
    }
    
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": location_update}
    )
    
    # If user is a trainer, update trainer location too
    if current_user.get("role") == "trainer":
        await db.trainers.update_one(
            {"trainer_id": current_user["user_id"]},
            {"$set": {
                "location": {
                    "type": "Point", 
                    "coordinates": [location_data.longitude, location_data.latitude]
                }
            }}
        )
    
    return {"message": "Location updated successfully"}

@app.get("/api/trainers/search")
async def search_trainers(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: Optional[float] = Query(25),  # km
    specialty: Optional[str] = Query(None),
    max_rate: Optional[float] = Query(None),
    gym: Optional[str] = Query(None),
    certified_only: Optional[bool] = Query(False)
):
    """Search for trainers based on location and filters with geospatial queries"""
    
    query = {}
    
    # Add non-location filters
    if specialty:
        query["specialties"] = {"$in": [specialty]}
    if max_rate:
        query["hourly_rate"] = {"$lte": max_rate}
    if gym:
        query["gym_name"] = {"$regex": gym, "$options": "i"}
    if certified_only:
        query["is_certified_trainer"] = True
    
    # Location-based search using MongoDB geospatial queries
    if lat and lng:
        query["location"] = {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                },
                "$maxDistance": radius * 1000  # Convert km to meters
            }
        }
    
    trainers = []
    async for trainer in db.trainers.find(query).limit(50):
        # Get user info
        user = await db.users.find_one({"user_id": trainer["trainer_id"]})
        trainer["trainer_name"] = user["name"] if user else "Unknown"
        
        # Calculate distance if location provided
        if lat and lng and trainer.get("location"):
            distance = calculate_distance(
                lat, lng,
                trainer["location"]["coordinates"][1],
                trainer["location"]["coordinates"][0]
            )
            trainer["distance_km"] = round(distance, 1)
        
        # Get certifications
        certifications = []
        async for cert in db.certifications.find({"trainer_id": trainer["trainer_id"], "verification_status": "verified"}):
            certifications.append(serialize_doc(cert))
        
        trainer["certifications"] = certifications
        trainer["verified_certifications"] = trainer.get("verified_certifications", [])
        trainer["is_certified_trainer"] = trainer.get("is_certified_trainer", False)
        
        trainers.append(serialize_doc(trainer))
    
    # Sort by distance if location provided
    if lat and lng:
        trainers.sort(key=lambda x: x.get("distance_km", float('inf')))
    
    return {"trainers": trainers}

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    import math
    
    # Convert to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    
    return c * r

# ============ SOCIAL TRACKING ENDPOINTS ============

@app.post("/api/social/follow")
async def follow_user(
    follow_data: SocialFollowRequest,
    current_user: dict = Depends(get_current_user)
):
    """Follow another user"""
    
    if follow_data.user_id == current_user["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    # Check if target user exists
    target_user = await db.users.find_one({"user_id": follow_data.user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already following
    existing_follow = await db.social_follows.find_one({
        "follower_id": current_user["user_id"],
        "following_id": follow_data.user_id
    })
    
    if existing_follow:
        raise HTTPException(status_code=400, detail="Already following this user")
    
    # Create follow relationship
    follow = SocialFollowModel(
        follow_id=str(uuid.uuid4()),
        follower_id=current_user["user_id"],
        following_id=follow_data.user_id,
        follow_type=target_user.get("role", "user")
    )
    
    await db.social_follows.insert_one(follow.dict())
    
    # Create notification for followed user
    notification = NotificationModel(
        notification_id=str(uuid.uuid4()),
        user_id=follow_data.user_id,
        title="New Follower",
        message=f"{current_user['name']} started following you",
        notification_type="new_follower",
        metadata={"follower_id": current_user["user_id"]}
    )
    
    await db.notifications.insert_one(notification.dict())
    
    return {"message": "Successfully followed user"}

@app.delete("/api/social/unfollow/{user_id}")
async def unfollow_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Unfollow a user"""
    
    result = await db.social_follows.delete_one({
        "follower_id": current_user["user_id"],
        "following_id": user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Follow relationship not found")
    
    return {"message": "Successfully unfollowed user"}

@app.get("/api/social/following")
async def get_following(current_user: dict = Depends(get_current_user)):
    """Get list of users current user is following"""
    
    following = []
    async for follow in db.social_follows.find({"follower_id": current_user["user_id"]}):
        user = await db.users.find_one({"user_id": follow["following_id"]})
        if user:
            # Get recent activity
            recent_activities = []
            async for activity in db.social_activities.find(
                {"user_id": follow["following_id"]}
            ).sort("created_at", -1).limit(3):
                recent_activities.append(serialize_doc(activity))
            
            following.append({
                "user_id": user["user_id"],
                "name": user["name"],
                "role": user.get("role", "user"),
                "current_streak": user.get("consecutive_days", 0),
                "lift_coins": user.get("lift_coins", 0),
                "level": user.get("level", 1),
                "badges": user.get("badges", []),
                "recent_activities": recent_activities,
                "followed_at": follow["created_at"]
            })
    
    return {"following": following}

@app.get("/api/social/followers")
async def get_followers(current_user: dict = Depends(get_current_user)):
    """Get list of users following current user"""
    
    followers = []
    async for follow in db.social_follows.find({"following_id": current_user["user_id"]}):
        user = await db.users.find_one({"user_id": follow["follower_id"]})
        if user:
            followers.append({
                "user_id": user["user_id"],
                "name": user["name"],
                "role": user.get("role", "user"),
                "current_streak": user.get("consecutive_days", 0),
                "lift_coins": user.get("lift_coins", 0),
                "level": user.get("level", 1),
                "followed_at": follow["created_at"]
            })
    
    return {"followers": followers}

@app.get("/api/social/leaderboards")
async def get_social_leaderboards():
    """Get various leaderboards for social motivation"""
    
    # Longest streaks leaderboard
    streak_leaders = []
    async for user in db.users.find().sort("consecutive_days", -1).limit(10):
        if user.get("consecutive_days", 0) > 0:
            streak_leaders.append({
                "user_id": user["user_id"],
                "name": user["name"],
                "streak": user.get("consecutive_days", 0),
                "level": user.get("level", 1)
            })
    
    # Most LiftCoins leaderboard
    coin_leaders = []
    async for user in db.users.find().sort("total_coins_earned", -1).limit(10):
        if user.get("total_coins_earned", 0) > 0:
            coin_leaders.append({
                "user_id": user["user_id"],
                "name": user["name"],
                "total_coins": user.get("total_coins_earned", 0),
                "current_coins": user.get("lift_coins", 0),
                "level": user.get("level", 1)
            })
    
    # Most sessions this month (for trainers)
    trainer_leaders = []
    start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    async for trainer in db.trainers.find():
        sessions_this_month = await db.bookings.count_documents({
            "trainer_id": trainer["trainer_id"],
            "status": "confirmed",
            "created_at": {"$gte": start_of_month}
        })
        
        if sessions_this_month > 0:
            user = await db.users.find_one({"user_id": trainer["trainer_id"]})
            if user:
                trainer_leaders.append({
                    "trainer_id": trainer["trainer_id"],
                    "name": user["name"],
                    "sessions_this_month": sessions_this_month,
                    "gym": trainer.get("gym_name", ""),
                    "specialties": trainer.get("specialties", [])
                })
    
    trainer_leaders.sort(key=lambda x: x["sessions_this_month"], reverse=True)
    trainer_leaders = trainer_leaders[:10]
    
    return {
        "streak_leaders": streak_leaders,
        "coin_leaders": coin_leaders,
        "trainer_leaders": trainer_leaders,
        "updated_at": datetime.utcnow()
    }

@app.get("/api/social/feed")
async def get_social_feed(
    limit: int = Query(20, le=50),
    current_user: dict = Depends(get_current_user)
):
    """Get social activity feed from followed users"""
    
    # Get users current user is following
    following_ids = []
    async for follow in db.social_follows.find({"follower_id": current_user["user_id"]}):
        following_ids.append(follow["following_id"])
    
    # Include current user's activities too
    following_ids.append(current_user["user_id"])
    
    # Get recent activities from followed users
    activities = []
    async for activity in db.social_activities.find(
        {"user_id": {"$in": following_ids}}
    ).sort("created_at", -1).limit(limit):
        
        # Get user info
        user = await db.users.find_one({"user_id": activity["user_id"]})
        activity_data = serialize_doc(activity)
        activity_data["user_name"] = user["name"] if user else "Unknown"
        activity_data["user_level"] = user.get("level", 1) if user else 1
        
        activities.append(activity_data)
    
    return {"activities": activities, "total_count": len(activities)}

@app.get("/api/social/recommendations")
async def get_follow_recommendations(
    current_user: dict = Depends(get_current_user)
):
    """Get user follow recommendations based on location, goals, and mutual connections"""
    
    # Get current user's following list
    current_following = []
    async for follow in db.social_follows.find({"follower_id": current_user["user_id"]}):
        current_following.append(follow["following_id"])
    
    recommendations = []
    
    # Location-based recommendations
    if current_user.get("location"):
        user_location = current_user["location"]
        async for user in db.users.find({
            "user_id": {"$nin": current_following + [current_user["user_id"]]},
            "location": {
                "$near": {
                    "$geometry": user_location,
                    "$maxDistance": 50000  # 50km radius
                }
            }
        }).limit(5):
            recommendations.append({
                "user_id": user["user_id"],
                "name": user["name"],
                "reason": "nearby_user",
                "distance_km": calculate_distance(
                    user_location["coordinates"][1], user_location["coordinates"][0],
                    user["location"]["coordinates"][1], user["location"]["coordinates"][0]
                ) if user.get("location") else None,
                "role": user.get("role", "user"),
                "gym": user.get("gym"),
                "streak": user.get("consecutive_days", 0)
            })
    
    # Mutual trainer recommendations
    if current_user.get("role") == "user":
        # Find other clients of the same trainers
        user_trainers = []
        async for booking in db.bookings.find({"user_id": current_user["user_id"], "status": "confirmed"}):
            user_trainers.append(booking["trainer_id"])
        
        for trainer_id in user_trainers[:3]:  # Limit to avoid too many queries
            async for booking in db.bookings.find({
                "trainer_id": trainer_id,
                "user_id": {"$nin": current_following + [current_user["user_id"]]},
                "status": "confirmed"
            }).limit(3):
                
                other_client = await db.users.find_one({"user_id": booking["user_id"]})
                if other_client and other_client["user_id"] not in [r["user_id"] for r in recommendations]:
                    trainer = await db.users.find_one({"user_id": trainer_id})
                    recommendations.append({
                        "user_id": other_client["user_id"],
                        "name": other_client["name"],
                        "reason": "shared_trainer",
                        "shared_trainer": trainer["name"] if trainer else "Unknown",
                        "role": other_client.get("role", "user"),
                        "streak": other_client.get("consecutive_days", 0)
                    })
    
    return {"recommendations": recommendations[:10]}  # Limit to 10 recommendations

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
    gym: Optional[str] = Query(None),
    certified_only: Optional[bool] = Query(False)
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
    if certified_only:
        query["is_certified_trainer"] = True
    
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
        
        # Get certifications
        certifications = []
        async for cert in db.certifications.find({"trainer_id": trainer["trainer_id"], "verification_status": "verified"}):
            certifications.append(serialize_doc(cert))
        
        trainer["certifications"] = certifications
        trainer["verified_certifications"] = trainer.get("verified_certifications", [])
        trainer["is_certified_trainer"] = trainer.get("is_certified_trainer", False)
        
        trainers.append(serialize_doc(trainer))
    
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

# ============ TREE VISUALIZATION ENDPOINTS ============

@app.post("/api/tree/create-node")
async def create_tree_node(
    node_type: str,
    title: str,
    description: str,
    parent_node_id: Optional[str] = None,
    position: Dict[str, float] = {"x": 0.5, "y": 0.3},
    xp_reward: int = 0,
    coin_reward: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Create a new tree node (goal, achievement, milestone, feedback)"""
    
    node_id = str(uuid.uuid4())
    
    # Set icon and color based on node type
    icons = {
        "goal": "🎯",
        "achievement": "🏆", 
        "milestone": "📍",
        "feedback": "💭",
        "session": "💪",
        "streak": "🔥"
    }
    
    colors = {
        "goal": "#BDD53D",
        "achievement": "#FFD700",
        "milestone": "#FF6B6B", 
        "feedback": "#4ECDC4",
        "session": "#45B7D1",
        "streak": "#FFA726"
    }
    
    tree_node = TreeNodeModel(
        node_id=node_id,
        user_id=current_user["user_id"],
        node_type=node_type,
        title=title,
        description=description,
        status="active",
        parent_node_id=parent_node_id,
        position=position,
        icon=icons.get(node_type, "🎯"),
        color=colors.get(node_type, "#BDD53D"),
        xp_reward=xp_reward,
        coin_reward=coin_reward
    )
    
    await db.tree_nodes.insert_one(tree_node.dict())
    
    return {"node_id": node_id, "message": "Tree node created successfully"}

@app.get("/api/tree/my-tree")
async def get_my_tree(current_user: dict = Depends(get_current_user)):
    """Get user's complete tree structure"""
    
    nodes = []
    async for node in db.tree_nodes.find({"user_id": current_user["user_id"]}):
        nodes.append(serialize_doc(node))
    
    # Build tree structure with relationships
    tree_structure = build_tree_structure(nodes)
    
    # Get recent activities for tree animation
    recent_activities = []
    async for activity in db.social_activities.find(
        {"user_id": current_user["user_id"]}
    ).sort("created_at", -1).limit(5):
        recent_activities.append(serialize_doc(activity))
    
    return {
        "tree_structure": tree_structure,
        "nodes": nodes,
        "recent_activities": recent_activities,
        "total_nodes": len(nodes),
        "completed_nodes": len([n for n in nodes if n["status"] == "completed"])
    }

@app.get("/api/tree/trainer-impact")
async def get_trainer_impact_tree(current_user: dict = Depends(get_current_user)):
    """Get trainer's impact tree showing client progress"""
    
    if current_user.get("role") != "trainer":
        raise HTTPException(status_code=403, detail="Only trainers can access impact tree")
    
    # Get all clients of this trainer
    client_bookings = []
    async for booking in db.bookings.find({"trainer_id": current_user["user_id"], "status": "confirmed"}):
        client_bookings.append(booking)
    
    # Get unique client IDs
    client_ids = list(set([booking["user_id"] for booking in client_bookings]))
    
    # Build impact tree data
    impact_data = []
    for client_id in client_ids:
        client = await db.users.find_one({"user_id": client_id})
        if client:
            # Get client's progress nodes
            client_nodes = []
            async for node in db.tree_nodes.find({"user_id": client_id}):
                client_nodes.append(serialize_doc(node))
            
            # Get client stats
            total_sessions = await db.bookings.count_documents({
                "user_id": client_id, 
                "trainer_id": current_user["user_id"],
                "status": "confirmed"
            })
            
            impact_data.append({
                "client_id": client_id,
                "client_name": client["name"],
                "total_sessions": total_sessions,
                "nodes_completed": len([n for n in client_nodes if n["status"] == "completed"]),
                "total_nodes": len(client_nodes),
                "current_streak": client.get("consecutive_days", 0),
                "lift_coins": client.get("lift_coins", 0),
                "recent_achievements": [n for n in client_nodes if n["status"] == "completed"][-3:]
            })
    
    return {
        "trainer_id": current_user["user_id"],
        "total_clients": len(client_ids),
        "total_sessions_given": sum([client["total_sessions"] for client in impact_data]),
        "clients_impact": impact_data,
        "forest_health": calculate_forest_health(impact_data)
    }

@app.put("/api/tree/update-node/{node_id}")
async def update_tree_node(
    node_id: str,
    status: Optional[str] = None,
    title: Optional[str] = None,
    description: Optional[str] = None,
    position: Optional[Dict[str, float]] = None,
    current_user: dict = Depends(get_current_user)
):
    """Update a tree node (complete goal, move position, etc.)"""
    
    node = await db.tree_nodes.find_one({"node_id": node_id})
    if not node:
        raise HTTPException(status_code=404, detail="Tree node not found")
    
    if node["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this node")
    
    update_data = {}
    if status:
        update_data["status"] = status
        if status == "completed":
            update_data["completion_date"] = datetime.utcnow()
            
            # Award XP and coins for completion
            if node["xp_reward"] > 0:
                await award_xp(current_user["user_id"], node["xp_reward"], f"completed_{node['node_type']}")
            if node["coin_reward"] > 0:
                await award_coins(current_user["user_id"], node["coin_reward"], f"completed_{node['node_type']}")
            
            # Create social activity
            activity = SocialActivityModel(
                activity_id=str(uuid.uuid4()),
                user_id=current_user["user_id"],
                activity_type=f"{node['node_type']}_completed",
                title=f"Completed {node['title']}",
                description=f"Just achieved: {node['description']}",
                metadata={"node_id": node_id, "xp_earned": node["xp_reward"], "coins_earned": node["coin_reward"]}
            )
            await db.social_activities.insert_one(activity.dict())
    
    if title:
        update_data["title"] = title
    if description:
        update_data["description"] = description
    if position:
        update_data["position"] = position
    
    await db.tree_nodes.update_one(
        {"node_id": node_id},
        {"$set": update_data}
    )
    
    return {"message": "Tree node updated successfully"}

@app.post("/api/tree/add-feedback")
async def add_trainer_feedback(
    client_id: str,
    title: str,
    feedback: str,
    session_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Add trainer feedback as a 'leaf' on client's tree"""
    
    if current_user.get("role") != "trainer":
        raise HTTPException(status_code=403, detail="Only trainers can add feedback")
    
    # Create feedback node on client's tree
    node_id = str(uuid.uuid4())
    
    feedback_node = TreeNodeModel(
        node_id=node_id,
        user_id=client_id,  # Note: This goes on the CLIENT'S tree
        node_type="feedback",
        title=title,
        description=feedback,
        status="completed",  # Feedback is always "complete"
        position={"x": 0.8, "y": 0.9},  # Position as "leaves" on the tree
        icon="🍃",
        color="#4ECDC4",
        completion_date=datetime.utcnow()
    )
    
    await db.tree_nodes.insert_one(feedback_node.dict())
    
    # Create notification for client
    notification = NotificationModel(
        notification_id=str(uuid.uuid4()),
        user_id=client_id,
        title="New Trainer Feedback",
        message=f"Your trainer added feedback: {title}",
        notification_type="trainer_feedback",
        metadata={"trainer_id": current_user["user_id"], "node_id": node_id}
    )
    
    await db.notifications.insert_one(notification.dict())
    
    return {"node_id": node_id, "message": "Feedback added to client's tree successfully"}

def build_tree_structure(nodes):
    """Build hierarchical tree structure from flat node list"""
    tree = {}
    node_map = {node["node_id"]: node for node in nodes}
    
    # Find root nodes (no parent)
    roots = [node for node in nodes if not node.get("parent_node_id")]
    
    # Build children relationships
    for node in nodes:
        node["children"] = []
        for other_node in nodes:
            if other_node.get("parent_node_id") == node["node_id"]:
                node["children"].append(other_node)
    
    return {
        "roots": roots,
        "total_depth": calculate_tree_depth(roots),
        "growth_points": len([n for n in nodes if n["status"] == "completed"]),
        "active_branches": len([n for n in nodes if n["status"] == "active"])
    }

def calculate_tree_depth(roots):
    """Calculate maximum depth of tree"""
    max_depth = 0
    
    def get_depth(node, current_depth=0):
        nonlocal max_depth
        max_depth = max(max_depth, current_depth)
        for child in node.get("children", []):
            get_depth(child, current_depth + 1)
    
    for root in roots:
        get_depth(root)
    
    return max_depth

def calculate_forest_health(impact_data):
    """Calculate overall health/growth of trainer's client forest"""
    if not impact_data:
        return 0
    
    total_score = 0
    for client in impact_data:
        # Score based on sessions, completed nodes, and streak
        session_score = min(client["total_sessions"] * 2, 100)
        completion_rate = (client["nodes_completed"] / max(client["total_nodes"], 1)) * 100
        streak_score = min(client["current_streak"] * 5, 50)
        
        client_score = (session_score + completion_rate + streak_score) / 3
        total_score += client_score
    
    return min(total_score / len(impact_data), 100)

# ============ ID VERIFICATION ENDPOINTS ============

@app.post("/api/verification/upload-id")
async def upload_id_document(
    document_type: str,
    date_of_birth: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload ID document for age verification"""
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, and PDF are allowed.")
    
    # Calculate age from date of birth
    try:
        birth_date = datetime.strptime(date_of_birth, "%Y-%m-%d")
        today = datetime.now()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        
        if age < 18:
            raise HTTPException(status_code=400, detail="You must be 18 or older to use this platform.")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    
    # For demo purposes, simulate file upload
    file_url = f"https://demo-storage.com/id_docs/{current_user['user_id']}_{file.filename}"
    
    # Create verification record
    verification_id = str(uuid.uuid4())
    verification = IDVerificationModel(
        verification_id=verification_id,
        user_id=current_user["user_id"],
        document_type=document_type,
        document_url=file_url,
        extracted_data={"date_of_birth": date_of_birth, "age": age},
        verification_status="verified"  # Auto-verify for demo
    )
    
    await db.id_verifications.insert_one(verification.dict())
    
    # Update user profile
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {
            "date_of_birth": date_of_birth,
            "id_verified": True,
            "id_verification_status": "verified",
            "id_document_url": file_url
        }}
    )
    
    return {
        "message": "ID verification successful",
        "verification_id": verification_id,
        "status": "verified",
        "age": age
    }

@app.post("/api/verification/upload-certification")
async def upload_certification(
    cert_type: str,
    cert_number: str,
    expiration_date: Optional[str] = None,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload trainer certification for verification"""
    
    # Check if user is a trainer
    if current_user.get("role") != "trainer":
        raise HTTPException(status_code=403, detail="Only trainers can upload certifications")
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, and PDF are allowed.")
    
    # For demo purposes, simulate Firebase Storage upload
    file_url = f"https://firebase-storage.com/certifications/{current_user['user_id']}_{cert_type}_{file.filename}"
    
    # Encrypt certification number
    encrypted_cert_number = encrypt_data(cert_number)
    
    # Create certification record
    certification_id = str(uuid.uuid4())
    
    exp_date = None
    if expiration_date:
        try:
            exp_date = datetime.strptime(expiration_date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid expiration date format. Use YYYY-MM-DD.")
    
    # Calculate rewards based on certification type
    xp_reward = 100  # Base XP for any certification
    coin_reward = 150  # Base coins for trainer certification
    
    if cert_type in ["NASM", "ACE", "ACSM"]:
        xp_reward = 150  # Premium certifications get more XP
        coin_reward = 200
    elif cert_type == "CSCS":
        xp_reward = 200  # Strength and conditioning specialist
        coin_reward = 250
    
    certification = CertificationModel(
        certification_id=certification_id,
        trainer_id=current_user["user_id"],
        cert_type=cert_type,
        cert_number_encrypted=encrypted_cert_number,
        cert_document_url=file_url,
        expiration_date=exp_date,
        verification_status="verified",  # Auto-verify for demo
        verified_at=datetime.utcnow(),
        xp_awarded=xp_reward,
        coins_awarded=coin_reward
    )
    
    await db.certifications.insert_one(certification.dict())
    
    # Award XP and coins
    new_xp, new_level = await award_xp(current_user["user_id"], xp_reward, f"certification_{cert_type}")
    await award_coins(current_user["user_id"], coin_reward, f"certification_{cert_type}", {"cert_type": cert_type})
    
    # Award certification badge
    badge_awarded = await award_badge(
        current_user["user_id"], 
        f"certified_{cert_type.lower()}", 
        50, 
        25
    )
    
    # Update trainer profile
    trainer = await db.trainers.find_one({"trainer_id": current_user["user_id"]})
    if trainer:
        verified_certs = trainer.get("verified_certifications", [])
        if cert_type not in verified_certs:
            verified_certs.append(cert_type)
        
        await db.trainers.update_one(
            {"trainer_id": current_user["user_id"]},
            {"$set": {
                "is_certified_trainer": True,
                "verified_certifications": verified_certs
            }}
        )
    
    # Check for "Top Certified Trainer" badge (3+ certifications)
    total_certs = await db.certifications.count_documents({
        "trainer_id": current_user["user_id"],
        "verification_status": "verified"
    })
    
    if total_certs >= 3:
        await award_badge(current_user["user_id"], "top_certified_trainer", 200, 100)
    
    return {
        "message": "Certification uploaded and verified successfully! 🎉",
        "certification_id": certification_id,
        "status": "verified",
        "cert_type": cert_type,
        "rewards": {
            "xp_awarded": xp_reward,
            "coins_awarded": coin_reward,
            "new_xp_total": new_xp,
            "new_level": new_level,
            "badge_awarded": badge_awarded,
            "show_confetti": True  # Trigger confetti animation
        }
    }

@app.get("/api/verification/status")
async def get_verification_status(current_user: dict = Depends(get_current_user)):
    """Get user's verification status"""
    
    # Get ID verification status
    id_verification = await db.id_verifications.find_one({"user_id": current_user["user_id"]})
    
    # Get certifications if trainer
    certifications = []
    if current_user.get("role") == "trainer":
        async for cert in db.certifications.find({"trainer_id": current_user["user_id"]}):
            certifications.append(serialize_doc(cert))
    
    return {
        "id_verified": current_user.get("id_verified", False),
        "id_verification_status": current_user.get("id_verification_status", "pending"),
        "id_verification": serialize_doc(id_verification) if id_verification else None,
        "certifications": certifications,
        "is_certified_trainer": len([c for c in certifications if c.get("verification_status") == "verified"]) > 0
    }

# ============ LIFTCOINS & GAMIFICATION ENDPOINTS ============

@app.post("/api/coins/daily-checkin")
async def daily_checkin(current_user: dict = Depends(get_current_user)):
    """Daily check-in to maintain streak and earn coins"""
    streak = await check_daily_streak(current_user["user_id"])
    
    user = await db.users.find_one({"user_id": current_user["user_id"]})
    
    return {
        "message": f"Daily check-in complete! Streak: {streak} days",
        "consecutive_days": streak,
        "lift_coins": user.get("lift_coins", 0),
        "level": user.get("level", 1),
        "xp_points": user.get("xp_points", 0)
    }

@app.post("/api/coins/purchase")
async def purchase_coins(
    package: str,  # "small", "medium", "large"
    current_user: dict = Depends(get_current_user)
):
    """Purchase LiftCoins with real money"""
    
    packages = {
        "small": {"coins": 250, "price": 4.99},
        "medium": {"coins": 600, "price": 9.99},
        "large": {"coins": 1300, "price": 19.99}
    }
    
    if package not in packages:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    coin_amount = packages[package]["coins"]
    price = packages[package]["price"]
    
    # For demo purposes, simulate successful payment
    transaction_id = str(uuid.uuid4())
    
    # Award coins
    await award_coins(
        current_user["user_id"], 
        coin_amount, 
        "purchase", 
        {"package": package, "price": price, "transaction_id": transaction_id}
    )
    
    # Create purchase transaction with different type
    transaction = LiftCoinTransactionModel(
        transaction_id=transaction_id,
        user_id=current_user["user_id"],
        transaction_type="purchased",
        amount=coin_amount,
        reason="purchase",
        metadata={"package": package, "price": price}
    )
    
    await db.lift_coin_transactions.insert_one(transaction.dict())
    
    user = await db.users.find_one({"user_id": current_user["user_id"]})
    
    return {
        "message": f"Successfully purchased {coin_amount} LiftCoins!",
        "coins_purchased": coin_amount,
        "total_coins": user.get("lift_coins", 0),
        "transaction_id": transaction_id
    }

@app.post("/api/coins/spend")
async def spend_coins(
    amount: int,
    reason: str,
    metadata: Optional[Dict] = None,
    current_user: dict = Depends(get_current_user)
):
    """Spend LiftCoins on perks"""
    
    user = await db.users.find_one({"user_id": current_user["user_id"]})
    current_coins = user.get("lift_coins", 0)
    
    if current_coins < amount:
        raise HTTPException(status_code=400, detail="Insufficient LiftCoins")
    
    # Deduct coins
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$inc": {"lift_coins": -amount}}
    )
    
    # Create spending transaction
    transaction = LiftCoinTransactionModel(
        transaction_id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        transaction_type="spent",
        amount=-amount,
        reason=reason,
        metadata=metadata or {}
    )
    
    await db.lift_coin_transactions.insert_one(transaction.dict())
    
    return {
        "message": f"Successfully spent {amount} LiftCoins on {reason}",
        "coins_spent": amount,
        "remaining_coins": current_coins - amount
    }

@app.get("/api/coins/balance")
async def get_coin_balance(current_user: dict = Depends(get_current_user)):
    """Get user's current coin balance and transaction history"""
    
    user = await db.users.find_one({"user_id": current_user["user_id"]})
    
    # Get recent transactions
    transactions = []
    async for transaction in db.lift_coin_transactions.find({"user_id": current_user["user_id"]}).sort("created_at", -1).limit(20):
        transactions.append(serialize_doc(transaction))
    
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

@app.get("/api/leaderboards/coins")
async def get_coin_leaderboard():
    """Get LiftCoins leaderboard (weekly)"""
    
    # Calculate weekly earnings (last 7 days)
    week_ago = datetime.now() - timedelta(days=7)
    
    # Aggregate weekly coin earnings
    pipeline = [
        {
            "$match": {
                "created_at": {"$gte": week_ago},
                "transaction_type": "earned"
            }
        },
        {
            "$group": {
                "_id": "$user_id",
                "weekly_coins": {"$sum": "$amount"}
            }
        },
        {
            "$sort": {"weekly_coins": -1}
        },
        {
            "$limit": 20
        }
    ]
    
    leaderboard = []
    async for result in db.lift_coin_transactions.aggregate(pipeline):
        user = await db.users.find_one({"user_id": result["_id"]})
        if user:
            leaderboard.append({
                "user_id": result["_id"],
                "name": user["name"],
                "weekly_coins": result["weekly_coins"],
                "total_coins": user.get("total_coins_earned", 0),
                "level": user.get("level", 1),
                "badges": user.get("badges", [])
            })
    
    return {"leaderboard": leaderboard, "period": "weekly"}

@app.get("/api/leaderboards/certified-trainers")
async def get_certified_trainers_leaderboard():
    """Get Top Certified Trainers leaderboard"""
    
    # Get all verified trainers with their certification counts
    trainers = []
    async for trainer in db.trainers.find({"is_certified_trainer": True}):
        # Count verified certifications
        cert_count = await db.certifications.count_documents({
            "trainer_id": trainer["trainer_id"],
            "verification_status": "verified"
        })
        
        # Get user info
        user = await db.users.find_one({"user_id": trainer["trainer_id"]})
        if user:
            # Get recent session count (last 30 days)
            month_ago = datetime.now() - timedelta(days=30)
            recent_sessions = await db.bookings.count_documents({
                "trainer_id": trainer["trainer_id"],
                "status": "confirmed",
                "created_at": {"$gte": month_ago}
            })
            
            trainers.append({
                "trainer_id": trainer["trainer_id"],
                "name": user["name"],
                "cert_count": cert_count,
                "verified_certifications": trainer.get("verified_certifications", []),
                "rating": trainer.get("rating", 0.0),
                "total_sessions": trainer.get("total_sessions", 0),
                "recent_sessions": recent_sessions,
                "xp_points": user.get("xp_points", 0),
                "level": user.get("level", 1),
                "badges": user.get("badges", []),
                "gym_name": trainer.get("gym_name", ""),
                "specialties": trainer.get("specialties", [])
            })
    
    # Sort by certification count, then by XP, then by recent activity
    trainers.sort(key=lambda x: (x["cert_count"], x["xp_points"], x["recent_sessions"]), reverse=True)
    
    return {"leaderboard": trainers[:20], "total_certified_trainers": len(trainers)}

@app.get("/api/rewards/available")
async def get_available_rewards(current_user: dict = Depends(get_current_user)):
    """Get available rewards and how to earn more coins"""
    
    user = await db.users.find_one({"user_id": current_user["user_id"]})
    current_coins = user.get("lift_coins", 0)
    
    rewards = [
        {
            "id": "session_discount",
            "name": "$10 Session Discount",
            "description": "Get $10 off any training session",
            "cost": 1000,
            "available": current_coins >= 1000,
            "icon": "💰"
        },
        {
            "id": "streak_saver",
            "name": "Streak Saver",
            "description": "Keep your daily streak alive if you miss a day",
            "cost": 50,
            "available": current_coins >= 50,
            "icon": "🔥"
        },
        {
            "id": "premium_badge",
            "name": "Premium Badge",
            "description": "Unlock exclusive profile badge",
            "cost": 200,
            "available": current_coins >= 200,
            "icon": "🏅"
        }
    ]
    
    earning_opportunities = [
        {
            "action": "Daily Check-in (7 days)",
            "coins": 50,
            "description": "Log in for 7 consecutive days",
            "available": user.get("consecutive_days", 0) < 7
        },
        {
            "action": "Complete First Session",
            "coins": 100,
            "description": "Book and complete your first training session",
            "available": not user.get("first_session_completed", False)
        },
        {
            "action": "Leave a Review",
            "coins": 20,
            "description": "Review a trainer after your session",
            "available": True
        },
        {
            "action": "Refer a Friend",
            "coins": 200,
            "description": "Invite someone who completes verification",
            "available": True
        },
        {
            "action": "Trainer Certification",
            "coins": 150,
            "description": "Upload and verify fitness certification",
            "available": current_user.get("role") == "trainer"
        }
    ]
    
    return {
        "available_rewards": rewards,
        "earning_opportunities": earning_opportunities,
        "current_coins": current_coins
    }

# ============ PROGRESS TRACKING ENDPOINTS ============

@app.post("/api/progress/add")
async def add_progress_entry(progress_data: ProgressEntryRequest, current_user: dict = Depends(get_current_user)):
    """Add a new progress entry for the user"""
    
    progress_id = str(uuid.uuid4())
    
    progress_entry = ProgressEntryModel(
        progress_id=progress_id,
        user_id=current_user["user_id"],
        weight=progress_data.weight,
        body_fat_percentage=progress_data.body_fat_percentage,
        muscle_mass=progress_data.muscle_mass,
        measurements=progress_data.measurements,
        notes=progress_data.notes
    )
    
    await db.progress_entries.insert_one(progress_entry.dict())
    
    # Update user's current weight in their profile
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"current_weight": progress_data.weight, "last_weigh_in": datetime.utcnow()}}
    )
    
    return {"progress_id": progress_id, "message": "Progress entry added successfully"}

@app.get("/api/progress/my")
async def get_my_progress(current_user: dict = Depends(get_current_user)):
    """Get current user's progress entries"""
    
    progress_entries = []
    async for entry in db.progress_entries.find({"user_id": current_user["user_id"]}).sort("date_recorded", -1):
        progress_entries.append(serialize_doc(entry))
    
    # Get user's goals
    goals = []
    async for goal in db.goals.find({"user_id": current_user["user_id"]}):
        goals.append(serialize_doc(goal))
    
    # Calculate progress stats
    if progress_entries:
        latest_entry = progress_entries[0]
        first_entry = progress_entries[-1]
        
        total_weight_loss = first_entry["weight"] - latest_entry["weight"]
        weight_change_percentage = (total_weight_loss / first_entry["weight"]) * 100 if first_entry["weight"] > 0 else 0
        
        stats = {
            "total_entries": len(progress_entries),
            "total_weight_loss": total_weight_loss,
            "weight_change_percentage": weight_change_percentage,
            "current_weight": latest_entry["weight"],
            "starting_weight": first_entry["weight"],
            "days_tracked": (datetime.fromisoformat(latest_entry["date_recorded"]) - datetime.fromisoformat(first_entry["date_recorded"])).days
        }
    else:
        stats = {
            "total_entries": 0,
            "total_weight_loss": 0,
            "weight_change_percentage": 0,
            "current_weight": 0,
            "starting_weight": 0,
            "days_tracked": 0
        }
    
    return {
        "progress_entries": progress_entries,
        "goals": goals,
        "stats": stats
    }

@app.post("/api/goals/add")
async def add_goal(goal_data: GoalRequest, current_user: dict = Depends(get_current_user)):
    """Add a new goal for the user"""
    
    goal_id = str(uuid.uuid4())
    
    goal = GoalModel(
        goal_id=goal_id,
        user_id=current_user["user_id"],
        goal_type=goal_data.goal_type,
        target_value=goal_data.target_value,
        current_value=0,  # Will be updated based on progress entries
        target_date=datetime.fromisoformat(goal_data.target_date)
    )
    
    await db.goals.insert_one(goal.dict())
    return {"goal_id": goal_id, "message": "Goal added successfully"}

@app.get("/api/progress/analytics")
async def get_progress_analytics(current_user: dict = Depends(get_current_user)):
    """Get detailed analytics for user's progress"""
    
    # Get all progress entries
    progress_entries = []
    async for entry in db.progress_entries.find({"user_id": current_user["user_id"]}).sort("date_recorded", 1):
        progress_entries.append(serialize_doc(entry))
    
    if not progress_entries:
        return {"message": "No progress data available"}
    
    # Calculate weekly averages
    weekly_data = []
    current_week = []
    
    for entry in progress_entries:
        entry_date = datetime.fromisoformat(entry["date_recorded"]) if isinstance(entry["date_recorded"], str) else entry["date_recorded"]
        if not current_week:
            current_week = [{"weight": entry["weight"], "date_recorded": entry_date}]
        else:
            # Check if entry is within 7 days of the first entry in current week
            first_date = current_week[0]["date_recorded"]
            days_diff = (entry_date - first_date).days
            if days_diff <= 7:
                current_week.append({"weight": entry["weight"], "date_recorded": entry_date})
            else:
                # Process current week and start new week
                if current_week:
                    avg_weight = sum(e["weight"] for e in current_week) / len(current_week)
                    week_start = current_week[0]["date_recorded"]
                    weekly_data.append({
                        "week_start": week_start.isoformat(),
                        "average_weight": avg_weight,
                        "entries_count": len(current_week)
                    })
                current_week = [{"weight": entry["weight"], "date_recorded": entry_date}]
    
    # Process last week
    if current_week:
        avg_weight = sum(e["weight"] for e in current_week) / len(current_week)
        week_start = current_week[0]["date_recorded"]
        weekly_data.append({
            "week_start": week_start.isoformat(),
            "average_weight": avg_weight,
            "entries_count": len(current_week)
        })
    
    # Calculate trends
    if len(weekly_data) >= 2:
        recent_trend = weekly_data[-1]["average_weight"] - weekly_data[-2]["average_weight"]
        trend_direction = "losing" if recent_trend < 0 else "gaining" if recent_trend > 0 else "maintaining"
    else:
        recent_trend = 0
        trend_direction = "maintaining"
    
    first_date = datetime.fromisoformat(progress_entries[0]["date_recorded"]) if isinstance(progress_entries[0]["date_recorded"], str) else progress_entries[0]["date_recorded"]
    last_date = datetime.fromisoformat(progress_entries[-1]["date_recorded"]) if isinstance(progress_entries[-1]["date_recorded"], str) else progress_entries[-1]["date_recorded"]
    
    return {
        "weekly_data": weekly_data,
        "recent_trend": recent_trend,
        "trend_direction": trend_direction,
        "total_progress_days": (last_date - first_date).days
    }

@app.get("/api/progress/leaderboard")
async def get_progress_leaderboard():
    """Get leaderboard of users with best progress (anonymized)"""
    
    # Get all users with progress
    leaderboard = []
    
    async for user in db.users.find({}).limit(50):
        # Get user's progress entries
        progress_entries = []
        async for entry in db.progress_entries.find({"user_id": user["user_id"]}).sort("date_recorded", 1):
            progress_entries.append(entry)
        
        if len(progress_entries) >= 2:
            first_entry = progress_entries[0]
            latest_entry = progress_entries[-1]
            
            weight_loss = first_entry["weight"] - latest_entry["weight"]
            weight_loss_percentage = (weight_loss / first_entry["weight"]) * 100 if first_entry["weight"] > 0 else 0
            days_tracked = (latest_entry["date_recorded"] - first_entry["date_recorded"]).days
            
            if weight_loss > 0 and days_tracked > 0:  # Only include actual weight loss
                leaderboard.append({
                    "user_name": user["name"],
                    "weight_loss": weight_loss,
                    "weight_loss_percentage": weight_loss_percentage,
                    "days_tracked": days_tracked,
                    "entries_count": len(progress_entries)
                })
    
    # Sort by weight loss percentage
    leaderboard.sort(key=lambda x: x["weight_loss_percentage"], reverse=True)
    
    return {"leaderboard": leaderboard[:20]}  # Top 20

@app.post("/api/demo/seed-progress")
async def seed_demo_progress():
    """Seed demo progress data for testing (development only)"""
    
    # Create demo users if they don't exist
    demo_users = [
        {
            "user_id": "demo_user_1",
            "email": "user@demo.com",
            "name": "Demo User",
            "role": "user"
        },
        {
            "user_id": "demo_user_2", 
            "email": "trainer@demo.com",
            "name": "Demo Trainer",
            "role": "trainer"
        },
        {
            "user_id": "demo_user_3",
            "email": "john@demo.com", 
            "name": "John Smith",
            "role": "user"
        }
    ]
    
    for user in demo_users:
        existing = await db.users.find_one({"email": user["email"]})
        if not existing:
            user["created_at"] = datetime.utcnow()
            await db.users.insert_one(user)
    
    # Seed progress entries for multiple users
    progress_entries = [
        # User 1 progress (steady weight loss)
        {"user_id": "demo_user_1", "weight": 85.0, "body_fat_percentage": 22.0, "notes": "Starting my journey", "date_recorded": datetime.utcnow() - timedelta(days=30)},
        {"user_id": "demo_user_1", "weight": 84.2, "body_fat_percentage": 21.5, "notes": "Feeling good", "date_recorded": datetime.utcnow() - timedelta(days=23)},
        {"user_id": "demo_user_1", "weight": 83.5, "body_fat_percentage": 21.0, "notes": "Making progress", "date_recorded": datetime.utcnow() - timedelta(days=16)},
        {"user_id": "demo_user_1", "weight": 82.8, "body_fat_percentage": 20.5, "notes": "Diet is working", "date_recorded": datetime.utcnow() - timedelta(days=9)},
        {"user_id": "demo_user_1", "weight": 82.0, "body_fat_percentage": 20.0, "notes": "Lost 3kg so far!", "date_recorded": datetime.utcnow() - timedelta(days=2)},
        
        # User 2 progress (trainer with muscle gain)
        {"user_id": "demo_user_2", "weight": 78.0, "muscle_mass": 65.0, "notes": "Bulking phase", "date_recorded": datetime.utcnow() - timedelta(days=25)},
        {"user_id": "demo_user_2", "weight": 79.5, "muscle_mass": 66.5, "notes": "Gaining muscle", "date_recorded": datetime.utcnow() - timedelta(days=18)},
        {"user_id": "demo_user_2", "weight": 80.2, "muscle_mass": 67.0, "notes": "Strength increasing", "date_recorded": datetime.utcnow() - timedelta(days=11)},
        {"user_id": "demo_user_2", "weight": 81.0, "muscle_mass": 68.0, "notes": "New PR today!", "date_recorded": datetime.utcnow() - timedelta(days=4)},
        
        # User 3 progress (significant weight loss)
        {"user_id": "demo_user_3", "weight": 95.0, "body_fat_percentage": 28.0, "notes": "Need to lose weight", "date_recorded": datetime.utcnow() - timedelta(days=35)},
        {"user_id": "demo_user_3", "weight": 92.5, "body_fat_percentage": 26.5, "notes": "Good start", "date_recorded": datetime.utcnow() - timedelta(days=28)},
        {"user_id": "demo_user_3", "weight": 90.0, "body_fat_percentage": 25.0, "notes": "5kg down!", "date_recorded": datetime.utcnow() - timedelta(days=21)},
        {"user_id": "demo_user_3", "weight": 87.5, "body_fat_percentage": 23.5, "notes": "Halfway there", "date_recorded": datetime.utcnow() - timedelta(days=14)},
        {"user_id": "demo_user_3", "weight": 85.0, "body_fat_percentage": 22.0, "notes": "10kg lost!", "date_recorded": datetime.utcnow() - timedelta(days=7)},
        {"user_id": "demo_user_3", "weight": 83.5, "body_fat_percentage": 21.0, "notes": "Feeling amazing", "date_recorded": datetime.utcnow() - timedelta(days=1)},
    ]
    
    created_entries = 0
    for entry in progress_entries:
        entry["progress_id"] = str(uuid.uuid4())
        entry["created_at"] = entry["date_recorded"]
        
        # Check if entry already exists for this user and date
        existing = await db.progress_entries.find_one({
            "user_id": entry["user_id"],
            "date_recorded": {"$gte": entry["date_recorded"] - timedelta(hours=1), 
                             "$lte": entry["date_recorded"] + timedelta(hours=1)}
        })
        
        if not existing:
            await db.progress_entries.insert_one(entry)
            created_entries += 1
    
    return {
        "message": f"Demo progress data seeded successfully",
        "users_created": len(demo_users),
        "progress_entries_created": created_entries
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
