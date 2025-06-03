"""
Advanced Security Middleware for LiftLink Platform
Implements comprehensive protection against abuse, fraud, and security threats
"""

import time
import uuid
import hashlib
import logging
import ipaddress
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer
import redis
import geoip2.database
import geoip2.errors
from textblob import TextBlob
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Configure logging
security_logger = logging.getLogger("liftlink_security")
security_logger.setLevel(logging.INFO)

# Redis for production-grade rate limiting (fallback to in-memory for dev)
try:
    redis_client = redis.Redis(host=os.getenv('REDIS_HOST', 'localhost'), port=6379, decode_responses=True)
    redis_client.ping()
    USE_REDIS = True
except:
    USE_REDIS = False
    in_memory_cache = {}

# Advanced security configuration
ENHANCED_SECURITY_CONFIG = {
    # Rate limiting (requests per minute)
    "REGISTRATION_RATE_LIMIT": 3,
    "LOGIN_RATE_LIMIT": 10,
    "MESSAGE_RATE_LIMIT": 15,
    "API_RATE_LIMIT": 100,
    "UPLOAD_RATE_LIMIT": 5,
    
    # Geo-fencing
    "BANNED_COUNTRIES": ["", ""],  # Add ISO codes as needed
    "HIGH_RISK_COUNTRIES": ["", ""],  # Countries requiring extra verification
    "VPN_DETECTION": True,
    
    # Behavioral analysis
    "MAX_ACCOUNT_CREATION_VELOCITY": 5,  # Max accounts per IP per day
    "SUSPICIOUS_TIME_WINDOW": 300,  # 5 minutes for rapid actions
    "MIN_SESSION_TIME": 30,  # Minimum time before major actions (seconds)
    
    # Content moderation
    "PROFANITY_THRESHOLD": 0.7,
    "TOXICITY_THRESHOLD": 0.8,
    "ADULT_CONTENT_THRESHOLD": 0.9,
    
    # Biometric verification
    "FACE_MATCH_THRESHOLD": 0.85,
    "LIVENESS_DETECTION": True,
    "ID_VERIFICATION_TIMEOUT": 300,  # 5 minutes
    
    # Device fingerprinting
    "TRACK_DEVICE_FINGERPRINTS": True,
    "MAX_ACCOUNTS_PER_DEVICE": 3,
    "DEVICE_REPUTATION_TRACKING": True
}

class AdvancedSecurityMiddleware:
    def __init__(self, mongo_client: AsyncIOMotorClient):
        self.db = mongo_client[os.getenv("DB_NAME", "liftlink_db")]
        self.security_cache = {}
        self.device_fingerprints = {}
        
    async def check_rate_limit(self, identifier: str, action: str, request_ip: str) -> bool:
        """Advanced rate limiting with Redis support"""
        limit_key = f"rate_limit:{action}:{identifier}"
        current_time = int(time.time())
        window = 60  # 1 minute window
        
        # Get action-specific limit
        limits = {
            "registration": ENHANCED_SECURITY_CONFIG["REGISTRATION_RATE_LIMIT"],
            "login": ENHANCED_SECURITY_CONFIG["LOGIN_RATE_LIMIT"],
            "message": ENHANCED_SECURITY_CONFIG["MESSAGE_RATE_LIMIT"],
            "api": ENHANCED_SECURITY_CONFIG["API_RATE_LIMIT"],
            "upload": ENHANCED_SECURITY_CONFIG["UPLOAD_RATE_LIMIT"]
        }
        
        limit = limits.get(action, 10)
        
        if USE_REDIS:
            # Use Redis sliding window
            pipe = redis_client.pipeline()
            pipe.zremrangebyscore(limit_key, 0, current_time - window)
            pipe.zcard(limit_key)
            pipe.zadd(limit_key, {str(uuid.uuid4()): current_time})
            pipe.expire(limit_key, window)
            results = pipe.execute()
            
            current_requests = results[1]
            
            if current_requests >= limit:
                await self.log_security_event("rate_limit_exceeded", identifier, {
                    "action": action,
                    "limit": limit,
                    "current_count": current_requests,
                    "ip": request_ip
                }, "MEDIUM")
                return False
                
        else:
            # Fallback to in-memory
            if limit_key not in in_memory_cache:
                in_memory_cache[limit_key] = []
            
            # Clean old entries
            in_memory_cache[limit_key] = [
                ts for ts in in_memory_cache[limit_key] 
                if ts > current_time - window
            ]
            
            if len(in_memory_cache[limit_key]) >= limit:
                return False
            
            in_memory_cache[limit_key].append(current_time)
        
        return True
    
    async def analyze_geo_location(self, ip: str) -> Dict[str, Any]:
        """Analyze IP geolocation and detect VPNs/proxies"""
        try:
            # For demo purposes, return mock data
            # In production, use MaxMind GeoIP2 or similar service
            geo_data = {
                "country": "US",
                "region": "CA",
                "city": "San Francisco",
                "is_vpn": False,
                "is_proxy": False,
                "is_tor": False,
                "risk_score": 0,
                "timezone": "America/Los_Angeles"
            }
            
            # Check against banned countries
            if geo_data["country"] in ENHANCED_SECURITY_CONFIG["BANNED_COUNTRIES"]:
                geo_data["risk_score"] += 100
                geo_data["ban_reason"] = "banned_country"
            
            # Check against high-risk countries
            if geo_data["country"] in ENHANCED_SECURITY_CONFIG["HIGH_RISK_COUNTRIES"]:
                geo_data["risk_score"] += 50
                geo_data["requires_extra_verification"] = True
            
            # VPN/Proxy detection
            if geo_data.get("is_vpn") or geo_data.get("is_proxy"):
                geo_data["risk_score"] += 75
                geo_data["vpn_detected"] = True
            
            return geo_data
            
        except Exception as e:
            security_logger.error(f"Geolocation analysis failed: {e}")
            return {"country": "UNKNOWN", "risk_score": 25}
    
    async def analyze_device_fingerprint(self, request: Request) -> Dict[str, Any]:
        """Analyze device fingerprint for fraud detection"""
        headers = dict(request.headers)
        
        # Create device fingerprint
        fingerprint_data = {
            "user_agent": headers.get("user-agent", ""),
            "accept_language": headers.get("accept-language", ""),
            "accept_encoding": headers.get("accept-encoding", ""),
            "screen_resolution": headers.get("x-screen-resolution", ""),
            "timezone": headers.get("x-timezone", ""),
            "platform": headers.get("x-platform", "")
        }
        
        # Generate fingerprint hash
        fingerprint_string = "|".join([
            fingerprint_data["user_agent"],
            fingerprint_data["accept_language"], 
            fingerprint_data["accept_encoding"],
            fingerprint_data["screen_resolution"],
            fingerprint_data["timezone"]
        ])
        
        device_id = hashlib.sha256(fingerprint_string.encode()).hexdigest()
        
        # Check device reputation
        device_info = await self.db.device_fingerprints.find_one({"device_id": device_id})
        
        if not device_info:
            # New device
            device_info = {
                "device_id": device_id,
                "fingerprint_data": fingerprint_data,
                "first_seen": datetime.utcnow(),
                "account_count": 0,
                "suspicious_activity": [],
                "reputation_score": 100,  # Start with good reputation
                "is_trusted": False
            }
            await self.db.device_fingerprints.insert_one(device_info)
        
        # Check for suspicious patterns
        risk_factors = []
        
        # Too many accounts from same device
        if device_info["account_count"] > ENHANCED_SECURITY_CONFIG["MAX_ACCOUNTS_PER_DEVICE"]:
            risk_factors.append("multiple_accounts_same_device")
        
        # Suspicious user agent
        ua = fingerprint_data["user_agent"].lower()
        if any(bot in ua for bot in ["bot", "crawler", "spider", "scraper"]):
            risk_factors.append("bot_user_agent")
        
        # Missing common headers
        if not fingerprint_data["accept_language"] or not fingerprint_data["accept_encoding"]:
            risk_factors.append("missing_headers")
        
        return {
            "device_id": device_id,
            "is_new_device": device_info["account_count"] == 0,
            "account_count": device_info["account_count"],
            "reputation_score": device_info["reputation_score"],
            "risk_factors": risk_factors,
            "is_trusted": device_info["is_trusted"]
        }
    
    async def analyze_behavioral_patterns(self, user_id: str, action: str, context: Dict) -> Dict[str, Any]:
        """Analyze user behavior for suspicious patterns"""
        
        # Get recent user activities
        recent_activities = []
        async for activity in self.db.user_activities.find(
            {"user_id": user_id}
        ).sort("timestamp", -1).limit(50):
            recent_activities.append(activity)
        
        risk_score = 0
        flags = []
        
        # Rapid action detection
        if len(recent_activities) > 0:
            time_diffs = []
            for i in range(min(5, len(recent_activities) - 1)):
                diff = (recent_activities[i]["timestamp"] - recent_activities[i+1]["timestamp"]).total_seconds()
                time_diffs.append(diff)
            
            if time_diffs and min(time_diffs) < 5:  # Less than 5 seconds between actions
                risk_score += 30
                flags.append("rapid_actions")
        
        # Location hopping detection
        location_changes = 0
        if len(recent_activities) > 1:
            prev_ip = None
            for activity in recent_activities:
                current_ip = activity.get("ip_address")
                if prev_ip and current_ip and prev_ip != current_ip:
                    location_changes += 1
                prev_ip = current_ip
        
        if location_changes > 3:  # Multiple IP changes
            risk_score += 40
            flags.append("location_hopping")
        
        # Session time analysis
        if action in ["registration", "first_message", "booking"]:
            user_creation = await self.db.users.find_one({"user_id": user_id})
            if user_creation:
                account_age = (datetime.utcnow() - user_creation["created_at"]).total_seconds()
                if account_age < ENHANCED_SECURITY_CONFIG["MIN_SESSION_TIME"]:
                    risk_score += 50
                    flags.append("premature_action")
        
        # Message pattern analysis (for messaging actions)
        if action == "send_message":
            message_content = context.get("content", "")
            content_analysis = await self.analyze_message_content(message_content)
            risk_score += content_analysis["risk_score"]
            flags.extend(content_analysis["flags"])
        
        return {
            "risk_score": risk_score,
            "flags": flags,
            "is_suspicious": risk_score > 70,
            "requires_review": risk_score > 50
        }
    
    async def analyze_message_content(self, content: str) -> Dict[str, Any]:
        """Advanced content analysis for suspicious messaging patterns"""
        risk_score = 0
        flags = []
        
        # Basic suspicious keywords check
        suspicious_keywords = [
            "meet offline", "personal number", "whatsapp", "telegram", 
            "outside app", "cash payment", "private", "secret", "don't tell",
            "special deal", "discount", "free session", "nude", "sexy",
            "beautiful", "gorgeous", "cute girl", "hot"
        ]
        
        content_lower = content.lower()
        for keyword in suspicious_keywords:
            if keyword in content_lower:
                risk_score += 15
                flags.append(f"suspicious_keyword: {keyword}")
        
        # Urgency detection
        urgency_patterns = [
            "urgent", "asap", "immediately", "right now", "hurry",
            "limited time", "expires soon", "act fast"
        ]
        
        for pattern in urgency_patterns:
            if pattern in content_lower:
                risk_score += 10
                flags.append(f"urgency_pattern: {pattern}")
        
        # Contact information extraction
        import re
        
        # Phone number detection
        phone_patterns = [
            r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            r'\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b',
            r'\b\d{10,}\b'
        ]
        
        for pattern in phone_patterns:
            if re.search(pattern, content):
                risk_score += 25
                flags.append("phone_number_detected")
                break
        
        # Email detection
        if re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', content):
            risk_score += 20
            flags.append("email_detected")
        
        # Social media handles
        social_patterns = [
            r'@\w+', r'instagram\.com/', r'facebook\.com/', 
            r'snapchat', r'snap me', r'add me on'
        ]
        
        for pattern in social_patterns:
            if re.search(pattern, content_lower):
                risk_score += 20
                flags.append("social_media_contact")
                break
        
        # Excessive punctuation/symbols (grooming behavior)
        special_chars = len([c for c in content if not c.isalnum() and not c.isspace()])
        if special_chars > len(content) * 0.3:
            risk_score += 15
            flags.append("excessive_punctuation")
        
        # Repetitive characters (e.g., "sooooo beautiful")
        if re.search(r'(.)\1{3,}', content):
            risk_score += 10
            flags.append("repetitive_characters")
        
        # Language complexity analysis
        try:
            blob = TextBlob(content)
            sentiment = blob.sentiment.polarity
            
            # Overly positive messages can be grooming
            if sentiment > 0.8 and len(content.split()) > 10:
                risk_score += 15
                flags.append("overly_positive_sentiment")
                
        except:
            pass
        
        return {
            "risk_score": min(risk_score, 100),
            "flags": flags,
            "is_high_risk": risk_score > 50
        }
    
    async def log_security_event(self, event_type: str, user_id: str, details: Dict[str, Any], severity: str = "INFO"):
        """Enhanced security event logging"""
        security_event = {
            "event_id": str(uuid.uuid4()),
            "event_type": event_type,
            "user_id": user_id,
            "details": details,
            "severity": severity,
            "timestamp": datetime.utcnow(),
            "investigation_status": "pending" if severity in ["HIGH", "CRITICAL"] else "closed",
            "auto_action_taken": None,
            "requires_human_review": severity in ["HIGH", "CRITICAL"]
        }
        
        await self.db.security_events.insert_one(security_event)
        security_logger.warning(f"Security Event [{severity}]: {event_type} - User: {user_id}")
        
        # Auto-response for critical events
        if severity == "CRITICAL":
            await self.take_automatic_action(event_type, user_id, details)
    
    async def take_automatic_action(self, event_type: str, user_id: str, details: Dict[str, Any]):
        """Take automatic protective actions for critical security events"""
        
        actions_taken = []
        
        # Account suspension for severe violations
        if event_type in ["grooming_detected", "identity_fraud", "multiple_violations"]:
            await self.db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "account_status": "suspended",
                    "suspension_reason": event_type,
                    "suspended_at": datetime.utcnow()
                }}
            )
            actions_taken.append("account_suspended")
        
        # IP blocking for malicious activity
        if event_type in ["bot_activity", "scraping_detected", "ddos_attempt"]:
            ip_address = details.get("ip")
            if ip_address:
                await self.db.blocked_ips.insert_one({
                    "ip_address": ip_address,
                    "reason": event_type,
                    "blocked_at": datetime.utcnow(),
                    "auto_blocked": True
                })
                actions_taken.append("ip_blocked")
        
        # Device blocking for fraud
        if event_type in ["device_fraud", "multiple_fake_accounts"]:
            device_id = details.get("device_id")
            if device_id:
                await self.db.device_fingerprints.update_one(
                    {"device_id": device_id},
                    {"$set": {
                        "is_blocked": True,
                        "block_reason": event_type,
                        "blocked_at": datetime.utcnow()
                    }}
                )
                actions_taken.append("device_blocked")
        
        # Update security event with actions taken
        await self.db.security_events.update_one(
            {"user_id": user_id, "event_type": event_type},
            {"$set": {"auto_action_taken": actions_taken}},
            upsert=False
        )

# Geo-fencing decorator
def require_geo_compliance(allow_vpn: bool = False):
    """Decorator to enforce geo-fencing rules"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract request and current_user from kwargs
            request = None
            current_user = None
            
            for arg in args:
                if hasattr(arg, 'headers'):
                    request = arg
                    break
            
            if 'current_user' in kwargs:
                current_user = kwargs['current_user']
            
            if request:
                middleware = AdvancedSecurityMiddleware(None)  # Would inject DB in production
                client_ip = get_client_ip(request)
                geo_data = await middleware.analyze_geo_location(client_ip)
                
                # Check if country is banned
                if geo_data.get("ban_reason") == "banned_country":
                    raise HTTPException(
                        status_code=403, 
                        detail="Access denied from this region"
                    )
                
                # Check VPN policy
                if not allow_vpn and geo_data.get("vpn_detected"):
                    raise HTTPException(
                        status_code=403,
                        detail="VPN/Proxy access not allowed for this service"
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def get_client_ip(request: Request) -> str:
    """Extract real client IP from request"""
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return getattr(request.client, 'host', '127.0.0.1')

# Security monitoring helper functions
async def monitor_user_session(user_id: str, action: str, context: Dict):
    """Monitor and log user session activity"""
    activity = {
        "user_id": user_id,
        "action": action,
        "context": context,
        "timestamp": datetime.utcnow(),
        "ip_address": context.get("ip"),
        "user_agent": context.get("user_agent")
    }
    
    # Store activity (would use injected DB in production)
    # await db.user_activities.insert_one(activity)
    
    return activity

class ContentModerationService:
    """Advanced content moderation using AI and rule-based systems"""
    
    @staticmethod
    async def moderate_profile_content(content: Dict[str, str]) -> Dict[str, Any]:
        """Moderate user profile content"""
        results = {
            "approved": True,
            "flags": [],
            "confidence": 1.0,
            "requires_human_review": False
        }
        
        # Check bio content
        if 'bio' in content:
            bio_analysis = await ContentModerationService._analyze_text(content['bio'])
            if bio_analysis['is_inappropriate']:
                results['approved'] = False
                results['flags'].extend(bio_analysis['flags'])
        
        # Check for contact information in inappropriate places
        for field in ['name', 'bio']:
            if field in content:
                if ContentModerationService._contains_contact_info(content[field]):
                    results['flags'].append('contact_info_in_profile')
                    results['requires_human_review'] = True
        
        return results
    
    @staticmethod
    async def moderate_image_content(image_data: bytes) -> Dict[str, Any]:
        """Moderate uploaded images"""
        # Placeholder for image moderation
        # In production, would use services like Google Vision API, AWS Rekognition
        return {
            "approved": True,
            "is_adult_content": False,
            "is_violent": False,
            "contains_text": False,
            "confidence": 0.95
        }
    
    @staticmethod
    async def _analyze_text(text: str) -> Dict[str, Any]:
        """Analyze text content for inappropriate material"""
        # Simplified analysis - in production would use more sophisticated NLP
        inappropriate_terms = [
            'escort', 'sugar', 'daddy', 'hookup', 'casual', 'nsa',
            'adult services', 'massage', 'companionship'
        ]
        
        text_lower = text.lower()
        flags = []
        
        for term in inappropriate_terms:
            if term in text_lower:
                flags.append(f'inappropriate_term: {term}')
        
        return {
            "is_inappropriate": len(flags) > 0,
            "flags": flags,
            "confidence": 0.8 if flags else 0.95
        }
    
    @staticmethod
    def _contains_contact_info(text: str) -> bool:
        """Check if text contains contact information"""
        import re
        
        # Check for phone numbers
        phone_patterns = [
            r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            r'\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b'
        ]
        
        for pattern in phone_patterns:
            if re.search(pattern, text):
                return True
        
        # Check for email
        if re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text):
            return True
        
        # Check for social media
        social_keywords = ['instagram', 'snapchat', 'whatsapp', 'telegram', '@']
        for keyword in social_keywords:
            if keyword.lower() in text.lower():
                return True
        
        return False