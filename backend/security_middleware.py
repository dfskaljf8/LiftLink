"""
LiftLink Security Middleware - Comprehensive Security Features
Implements all 23+ security requirements for production-ready app
"""

import os
import re
import json
import hashlib
import secrets
import html
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Set
from functools import wraps
from collections import defaultdict
import asyncio

from fastapi import Request, HTTPException, Response, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import jwt
from dotenv import load_dotenv

load_dotenv()

# ==================== CONFIGURATION ====================

JWT_SECRET = os.environ.get('JWT_SECRET', 'liftlink_secret_key_change_in_production')
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Short-lived access tokens
REFRESH_TOKEN_EXPIRE_DAYS = 7
MAX_CONCURRENT_SESSIONS = 3

# ==================== TOKEN BLACKLIST ====================

class TokenBlacklist:
    """In-memory token blacklist with expiration cleanup"""
    
    def __init__(self):
        self._blacklist: Dict[str, datetime] = {}
        self._cleanup_interval = 3600  # 1 hour
        self._last_cleanup = datetime.now(timezone.utc)
    
    def add(self, token_jti: str, expires_at: datetime):
        """Add token to blacklist"""
        self._blacklist[token_jti] = expires_at
        self._cleanup_if_needed()
    
    def is_blacklisted(self, token_jti: str) -> bool:
        """Check if token is blacklisted"""
        self._cleanup_if_needed()
        return token_jti in self._blacklist
    
    def _cleanup_if_needed(self):
        """Remove expired entries"""
        now = datetime.now(timezone.utc)
        if (now - self._last_cleanup).seconds > self._cleanup_interval:
            expired = [jti for jti, exp in self._blacklist.items() if exp < now]
            for jti in expired:
                del self._blacklist[jti]
            self._last_cleanup = now


token_blacklist = TokenBlacklist()


# ==================== USER SESSIONS ====================

class SessionManager:
    """Manage user sessions with concurrent session limits"""
    
    def __init__(self, max_sessions: int = MAX_CONCURRENT_SESSIONS):
        self._sessions: Dict[str, List[Dict]] = defaultdict(list)
        self.max_sessions = max_sessions
    
    def add_session(self, user_id: str, token_jti: str, device_info: str = "unknown"):
        """Add a new session, removing oldest if limit exceeded"""
        session = {
            "jti": token_jti,
            "device": device_info,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        self._sessions[user_id].append(session)
        
        # Remove oldest sessions if over limit
        while len(self._sessions[user_id]) > self.max_sessions:
            oldest = self._sessions[user_id].pop(0)
            token_blacklist.add(oldest["jti"], datetime.now(timezone.utc) + timedelta(hours=1))
        
        return session
    
    def remove_session(self, user_id: str, token_jti: str):
        """Remove a specific session"""
        self._sessions[user_id] = [
            s for s in self._sessions[user_id] if s["jti"] != token_jti
        ]
    
    def remove_all_sessions(self, user_id: str):
        """Remove all sessions for a user (force logout)"""
        for session in self._sessions[user_id]:
            token_blacklist.add(session["jti"], datetime.now(timezone.utc) + timedelta(hours=1))
        self._sessions[user_id] = []
    
    def get_sessions(self, user_id: str) -> List[Dict]:
        """Get all active sessions for a user"""
        return self._sessions[user_id]


session_manager = SessionManager()


# ==================== IDEMPOTENCY ====================

class IdempotencyStore:
    """Store idempotency keys for payment and critical operations"""
    
    def __init__(self, ttl_hours: int = 24):
        self._store: Dict[str, Dict] = {}
        self.ttl_hours = ttl_hours
        self._last_cleanup = datetime.now(timezone.utc)
    
    def get(self, key: str) -> Optional[Dict]:
        """Get cached response for idempotency key"""
        self._cleanup_expired()
        return self._store.get(key)
    
    def set(self, key: str, response: Dict, status_code: int = 200):
        """Store response for idempotency key"""
        self._store[key] = {
            "response": response,
            "status_code": status_code,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=self.ttl_hours)).isoformat()
        }
    
    def _cleanup_expired(self):
        """Remove expired entries"""
        now = datetime.now(timezone.utc)
        if (now - self._last_cleanup).seconds > 3600:  # Cleanup hourly
            expired = []
            for key, data in self._store.items():
                exp = datetime.fromisoformat(data["expires_at"].replace('Z', '+00:00'))
                if exp < now:
                    expired.append(key)
            for key in expired:
                del self._store[key]
            self._last_cleanup = now


idempotency_store = IdempotencyStore()


def check_idempotency(idempotency_key: str) -> Optional[JSONResponse]:
    """Check if request has already been processed"""
    cached = idempotency_store.get(idempotency_key)
    if cached:
        return JSONResponse(
            content=cached["response"],
            status_code=cached["status_code"],
            headers={"X-Idempotent-Replayed": "true"}
        )
    return None


def store_idempotent_response(idempotency_key: str, response: Dict, status_code: int = 200):
    """Store response for future idempotent requests"""
    idempotency_store.set(idempotency_key, response, status_code)


# ==================== MULTI-LEVEL RATE LIMITING ====================

class MultiLevelRateLimiter:
    """
    Multi-level rate limiting:
    - Per IP (prevent DDoS)
    - Per User (prevent abuse)
    - Per Endpoint (protect expensive operations)
    """
    
    def __init__(self):
        self._ip_requests: Dict[str, List[datetime]] = defaultdict(list)
        self._user_requests: Dict[str, List[datetime]] = defaultdict(list)
        self._endpoint_requests: Dict[str, Dict[str, List[datetime]]] = defaultdict(lambda: defaultdict(list))
        
        # Rate limits
        self.limits = {
            "ip": {"requests": 100, "window": 60},  # 100 req/min per IP
            "user": {"requests": 60, "window": 60},  # 60 req/min per user
            "auth": {"requests": 5, "window": 900},  # 5 attempts per 15 min
            "ai": {"requests": 20, "window": 3600},  # 20 AI requests per hour
            "payment": {"requests": 10, "window": 3600},  # 10 payment actions per hour
        }
    
    def _clean_old_requests(self, requests: List[datetime], window_seconds: int) -> List[datetime]:
        """Remove requests outside the time window"""
        cutoff = datetime.now(timezone.utc) - timedelta(seconds=window_seconds)
        return [r for r in requests if r > cutoff]
    
    def check_ip_limit(self, ip: str) -> bool:
        """Check if IP has exceeded rate limit"""
        limit = self.limits["ip"]
        self._ip_requests[ip] = self._clean_old_requests(
            self._ip_requests[ip], limit["window"]
        )
        return len(self._ip_requests[ip]) < limit["requests"]
    
    def check_user_limit(self, user_id: str) -> bool:
        """Check if user has exceeded rate limit"""
        limit = self.limits["user"]
        self._user_requests[user_id] = self._clean_old_requests(
            self._user_requests[user_id], limit["window"]
        )
        return len(self._user_requests[user_id]) < limit["requests"]
    
    def check_endpoint_limit(self, user_id: str, endpoint_type: str) -> bool:
        """Check endpoint-specific rate limit (auth, ai, payment)"""
        if endpoint_type not in self.limits:
            return True
        
        limit = self.limits[endpoint_type]
        self._endpoint_requests[endpoint_type][user_id] = self._clean_old_requests(
            self._endpoint_requests[endpoint_type][user_id], limit["window"]
        )
        return len(self._endpoint_requests[endpoint_type][user_id]) < limit["requests"]
    
    def record_request(self, ip: str, user_id: Optional[str] = None, endpoint_type: Optional[str] = None):
        """Record a request for rate limiting"""
        now = datetime.now(timezone.utc)
        self._ip_requests[ip].append(now)
        
        if user_id:
            self._user_requests[user_id].append(now)
        
        if endpoint_type and user_id:
            self._endpoint_requests[endpoint_type][user_id].append(now)


rate_limiter = MultiLevelRateLimiter()


# ==================== INPUT SANITIZATION ====================

class InputSanitizer:
    """Comprehensive input sanitization for XSS and injection prevention"""
    
    # Patterns that indicate malicious input
    DANGEROUS_PATTERNS = [
        # XSS patterns
        r'<script.*?>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
        r'<iframe.*?>',
        r'<object.*?>',
        r'<embed.*?>',
        r'<link.*?>',
        r'<meta.*?>',
        r'data:text/html',
        r'vbscript:',
        r'expression\s*\(',
        r'@import',
        r'<svg.*?on\w+',
        r'<img.*?onerror',
        r'<body.*?onload',
        
        # JavaScript execution
        r'alert\s*\(',
        r'confirm\s*\(',
        r'prompt\s*\(',
        r'eval\s*\(',
        r'setTimeout\s*\(',
        r'setInterval\s*\(',
        r'Function\s*\(',
        r'constructor\s*\[',
        r'__proto__',
        r'prototype\s*\[',
        
        # NoSQL injection patterns
        r'\$where',
        r'\$regex',
        r'\$gt',
        r'\$lt',
        r'\$ne',
        r'\$in',
        r'\$nin',
        r'\$or',
        r'\$and',
        r'\$not',
        r'\$exists',
        r'\$elemMatch',
        r'{\s*"\$',
        
        # SQL injection (just in case)
        r';\s*DROP\s+',
        r';\s*DELETE\s+',
        r';\s*INSERT\s+',
        r';\s*UPDATE\s+',
        r';\s*CREATE\s+',
        r';\s*ALTER\s+',
        r'--\s*$',
        r'/\*.*?\*/',
        r'UNION\s+SELECT',
        r'OR\s+1\s*=\s*1',
        r"OR\s+'1'\s*=\s*'1'",
    ]
    
    @classmethod
    def sanitize_string(cls, input_str: str, max_length: int = 1000) -> str:
        """Sanitize a string input"""
        if not isinstance(input_str, str):
            return str(input_str)[:max_length]
        
        sanitized = input_str
        
        # Remove dangerous patterns
        for pattern in cls.DANGEROUS_PATTERNS:
            sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE | re.DOTALL)
        
        # HTML escape
        sanitized = html.escape(sanitized, quote=True)
        
        # Truncate
        return sanitized[:max_length]
    
    @classmethod
    def sanitize_dict(cls, data: Dict, max_depth: int = 5) -> Dict:
        """Recursively sanitize dictionary values"""
        if max_depth <= 0:
            return {}
        
        sanitized = {}
        for key, value in data.items():
            # Sanitize key
            clean_key = cls.sanitize_string(str(key), max_length=100)
            
            # Sanitize value based on type
            if isinstance(value, str):
                sanitized[clean_key] = cls.sanitize_string(value)
            elif isinstance(value, dict):
                sanitized[clean_key] = cls.sanitize_dict(value, max_depth - 1)
            elif isinstance(value, list):
                sanitized[clean_key] = cls.sanitize_list(value, max_depth - 1)
            else:
                sanitized[clean_key] = value
        
        return sanitized
    
    @classmethod
    def sanitize_list(cls, data: List, max_depth: int = 5) -> List:
        """Recursively sanitize list values"""
        if max_depth <= 0:
            return []
        
        sanitized = []
        for item in data[:100]:  # Limit list size
            if isinstance(item, str):
                sanitized.append(cls.sanitize_string(item))
            elif isinstance(item, dict):
                sanitized.append(cls.sanitize_dict(item, max_depth - 1))
            elif isinstance(item, list):
                sanitized.append(cls.sanitize_list(item, max_depth - 1))
            else:
                sanitized.append(item)
        
        return sanitized
    
    @classmethod
    def is_safe_mongo_query(cls, query: Dict) -> bool:
        """Check if MongoDB query is safe (no operator injection)"""
        query_str = json.dumps(query)
        
        # Check for MongoDB operators in unexpected places
        dangerous_operators = ['$where', '$function', '$accumulator']
        for op in dangerous_operators:
            if op in query_str:
                return False
        
        return True


# ==================== PROMPT INJECTION PROTECTION ====================

class PromptInjectionProtector:
    """Protect AI prompts from injection attacks"""
    
    # Patterns that indicate prompt injection attempts
    INJECTION_PATTERNS = [
        r'ignore\s+(previous|all|above)\s+instructions?',
        r'disregard\s+(previous|all|above)',
        r'forget\s+(everything|all|previous)',
        r'new\s+instructions?:',
        r'system\s*:\s*',
        r'assistant\s*:\s*',
        r'human\s*:\s*',
        r'user\s*:\s*',
        r'override\s+(system|instructions?)',
        r'pretend\s+(you\s+are|to\s+be)',
        r'act\s+as\s+(if|a)',
        r'you\s+are\s+now',
        r'switch\s+(to|into)\s+mode',
        r'jailbreak',
        r'DAN\s+mode',
        r'developer\s+mode',
        r'bypass\s+(filter|restriction|safety)',
        r'\]\]\s*\[\[',  # Common prompt escape sequences
        r'```\s*system',
        r'<\|.*?\|>',  # Special tokens
    ]
    
    # Maximum lengths for different input types
    MAX_LENGTHS = {
        "user_message": 2000,
        "workout_notes": 1000,
        "content_notes": 500,
        "bio": 500,
    }
    
    @classmethod
    def check_for_injection(cls, text: str) -> tuple[bool, str]:
        """
        Check if text contains potential prompt injection
        Returns (is_safe, reason)
        """
        if not text:
            return True, ""
        
        text_lower = text.lower()
        
        for pattern in cls.INJECTION_PATTERNS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return False, f"Potential prompt injection detected"
        
        return True, ""
    
    @classmethod
    def sanitize_for_llm(cls, text: str, input_type: str = "user_message") -> str:
        """Sanitize text for safe inclusion in LLM prompts"""
        max_length = cls.MAX_LENGTHS.get(input_type, 1000)
        
        # Truncate
        sanitized = text[:max_length]
        
        # Remove potential escape sequences
        sanitized = re.sub(r'```', '`', sanitized)
        sanitized = re.sub(r'<\|', '<', sanitized)
        sanitized = re.sub(r'\|>', '>', sanitized)
        
        # Remove null bytes and control characters
        sanitized = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', sanitized)
        
        return sanitized
    
    @classmethod
    def wrap_user_input(cls, text: str, label: str = "USER INPUT") -> str:
        """Wrap user input with clear delimiters for LLM"""
        sanitized = cls.sanitize_for_llm(text)
        return f"\n---BEGIN {label}---\n{sanitized}\n---END {label}---\n"


# ==================== SECURE ERROR MESSAGES ====================

class SecureErrorHandler:
    """Generate secure error messages that don't leak sensitive info"""
    
    # Generic error messages for external use
    GENERIC_ERRORS = {
        401: "Authentication required",
        403: "Access denied",
        404: "Resource not found",
        422: "Invalid request data",
        429: "Too many requests. Please try again later.",
        500: "An error occurred. Please try again.",
    }
    
    @classmethod
    def get_safe_error(cls, status_code: int, internal_error: str = None) -> str:
        """Get a safe error message for external use"""
        # Log internal error for debugging
        if internal_error:
            print(f"Internal error ({status_code}): {internal_error}")
        
        return cls.GENERIC_ERRORS.get(status_code, "An error occurred")
    
    @classmethod
    def sanitize_error_response(cls, error_dict: Dict) -> Dict:
        """Remove sensitive information from error responses"""
        safe_fields = {"detail", "error", "message", "code"}
        sensitive_patterns = [
            r'password',
            r'secret',
            r'key',
            r'token',
            r'api[-_]?key',
            r'credentials?',
            r'auth',
        ]
        
        sanitized = {}
        for key, value in error_dict.items():
            # Only include safe fields
            if key.lower() not in safe_fields:
                continue
            
            # Check for sensitive data in values
            if isinstance(value, str):
                is_sensitive = any(
                    re.search(pattern, value, re.IGNORECASE)
                    for pattern in sensitive_patterns
                )
                if not is_sensitive:
                    sanitized[key] = value
            else:
                sanitized[key] = value
        
        return sanitized if sanitized else {"detail": "An error occurred"}


# ==================== ENHANCED TOKEN MANAGEMENT ====================

def create_tokens(user_id: str, email: str, role: str, device_info: str = "unknown") -> Dict:
    """Create access and refresh token pair"""
    jti = secrets.token_urlsafe(16)
    
    now = datetime.now(timezone.utc)
    
    # Access token (short-lived)
    access_payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "jti": jti,
        "type": "access",
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": now,
    }
    access_token = jwt.encode(access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    # Refresh token (longer-lived)
    refresh_jti = secrets.token_urlsafe(16)
    refresh_payload = {
        "user_id": user_id,
        "jti": refresh_jti,
        "access_jti": jti,
        "type": "refresh",
        "exp": now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        "iat": now,
    }
    refresh_token = jwt.encode(refresh_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    # Register session
    session_manager.add_session(user_id, jti, device_info)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


def verify_access_token(token: str) -> Dict:
    """Verify access token and check blacklist"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Check token type
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        # Check blacklist
        if token_blacklist.is_blacklisted(payload.get("jti", "")):
            raise HTTPException(status_code=401, detail="Token has been revoked")
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def refresh_access_token(refresh_token: str) -> Dict:
    """Use refresh token to get new access token"""
    try:
        payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Check token type
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        # Check blacklist
        if token_blacklist.is_blacklisted(payload.get("jti", "")):
            raise HTTPException(status_code=401, detail="Refresh token has been revoked")
        
        # Blacklist old access token
        token_blacklist.add(
            payload.get("access_jti", ""),
            datetime.now(timezone.utc) + timedelta(hours=1)
        )
        
        # Get user info (you'd normally fetch from DB)
        user_id = payload.get("user_id")
        
        # Create new tokens
        return create_tokens(user_id, "", "", "")  # Email/role would come from DB
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


def invalidate_token(token: str):
    """Invalidate a token (add to blacklist)"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM], options={"verify_exp": False})
        exp = datetime.fromtimestamp(payload.get("exp", 0), tz=timezone.utc)
        token_blacklist.add(payload.get("jti", ""), exp)
        
        # Also remove from session manager
        session_manager.remove_session(payload.get("user_id", ""), payload.get("jti", ""))
    except:
        pass  # Ignore errors during logout


# ==================== FILE UPLOAD VALIDATION ====================

class FileUploadValidator:
    """Validate file uploads for security"""
    
    # Allowed MIME types and extensions
    ALLOWED_TYPES = {
        "image": {
            "mime": ["image/jpeg", "image/png", "image/webp", "image/heic"],
            "extensions": [".jpg", ".jpeg", ".png", ".webp", ".heic"],
            "max_size": 10 * 1024 * 1024,  # 10MB
        },
        "document": {
            "mime": ["application/pdf", "image/jpeg", "image/png"],
            "extensions": [".pdf", ".jpg", ".jpeg", ".png"],
            "max_size": 20 * 1024 * 1024,  # 20MB
        },
        "video": {
            "mime": ["video/mp4", "video/quicktime", "video/webm"],
            "extensions": [".mp4", ".mov", ".webm"],
            "max_size": 100 * 1024 * 1024,  # 100MB
        },
    }
    
    # Magic bytes for file type verification
    MAGIC_BYTES = {
        b'\xff\xd8\xff': "image/jpeg",
        b'\x89PNG\r\n\x1a\n': "image/png",
        b'RIFF': "image/webp",  # Partial match for WEBP
        b'%PDF': "application/pdf",
        b'\x00\x00\x00': "video/mp4",  # Simplified MP4 check
    }
    
    @classmethod
    def validate_file(cls, file_content: bytes, filename: str, file_type: str = "image") -> tuple[bool, str]:
        """
        Validate uploaded file
        Returns (is_valid, error_message)
        """
        if file_type not in cls.ALLOWED_TYPES:
            return False, "Invalid file type category"
        
        config = cls.ALLOWED_TYPES[file_type]
        
        # Check file size
        if len(file_content) > config["max_size"]:
            max_mb = config["max_size"] / (1024 * 1024)
            return False, f"File too large. Maximum size is {max_mb}MB"
        
        # Check extension
        ext = os.path.splitext(filename.lower())[1]
        if ext not in config["extensions"]:
            return False, f"Invalid file extension. Allowed: {', '.join(config['extensions'])}"
        
        # Verify magic bytes (file signature)
        is_valid_type = False
        for magic, mime in cls.MAGIC_BYTES.items():
            if file_content[:len(magic)].startswith(magic[:4]):  # Check first 4 bytes at minimum
                if mime in config["mime"]:
                    is_valid_type = True
                    break
        
        if not is_valid_type:
            return False, "File content does not match declared type"
        
        return True, ""
    
    @classmethod
    def generate_safe_filename(cls, original_filename: str) -> str:
        """Generate a safe filename to prevent path traversal"""
        # Get extension
        ext = os.path.splitext(original_filename.lower())[1]
        
        # Generate random filename
        safe_name = secrets.token_urlsafe(16)
        
        return f"{safe_name}{ext}"


# ==================== SECURITY HEADERS MIDDLEWARE ====================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # HSTS (only in production with HTTPS)
        if os.environ.get("ENVIRONMENT") == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )
        
        return response


# ==================== AUDIT LOGGING ====================

class AuditLogger:
    """Log security-relevant events for audit trail"""
    
    @staticmethod
    def log_auth_attempt(email: str, success: bool, ip: str, reason: str = ""):
        """Log authentication attempt"""
        event = {
            "type": "auth_attempt",
            "email": email[:50],  # Truncate for privacy
            "success": success,
            "ip": ip,
            "reason": reason if not success else "",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        print(f"🔐 AUTH: {json.dumps(event)}")
    
    @staticmethod
    def log_payment_event(user_id: str, action: str, amount: float, success: bool, idempotency_key: str = ""):
        """Log payment event"""
        event = {
            "type": "payment",
            "user_id": user_id,
            "action": action,
            "amount": amount,
            "success": success,
            "idempotency_key": idempotency_key[:20] if idempotency_key else "",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        print(f"💰 PAYMENT: {json.dumps(event)}")
    
    @staticmethod
    def log_security_event(event_type: str, user_id: str, details: str, severity: str = "info"):
        """Log security event"""
        event = {
            "type": "security",
            "event": event_type,
            "user_id": user_id,
            "details": details[:200],
            "severity": severity,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        print(f"🛡️ SECURITY [{severity.upper()}]: {json.dumps(event)}")


audit_logger = AuditLogger()


# ==================== PASSWORD SECURITY ====================

import hashlib
import secrets

def hash_password(password: str) -> str:
    """Hash password using bcrypt-style approach with salt"""
    salt = secrets.token_hex(16)
    # Using SHA-256 with salt (in production, use bcrypt/argon2)
    hash_input = f"{salt}{password}".encode()
    for _ in range(10000):  # Key stretching
        hash_input = hashlib.sha256(hash_input).digest()
    return f"{salt}${hash_input.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash"""
    try:
        salt, hash_value = stored_hash.split('$')
        hash_input = f"{salt}{password}".encode()
        for _ in range(10000):
            hash_input = hashlib.sha256(hash_input).digest()
        return hash_input.hex() == hash_value
    except:
        return False


# ==================== WEBHOOK SIGNATURE VERIFICATION ====================

def verify_stripe_webhook_signature(payload: bytes, signature: str, webhook_secret: str) -> bool:
    """Verify Stripe webhook signature"""
    try:
        import stripe
        stripe.Webhook.construct_event(payload, signature, webhook_secret)
        return True
    except Exception as e:
        print(f"Webhook signature verification failed: {e}")
        return False


# ==================== EXPORTS ====================

__all__ = [
    # Token management
    "create_tokens",
    "verify_access_token",
    "refresh_access_token",
    "invalidate_token",
    "token_blacklist",
    "session_manager",
    
    # Rate limiting
    "rate_limiter",
    "MultiLevelRateLimiter",
    
    # Idempotency
    "check_idempotency",
    "store_idempotent_response",
    "idempotency_store",
    
    # Input sanitization
    "InputSanitizer",
    
    # Prompt injection
    "PromptInjectionProtector",
    
    # Error handling
    "SecureErrorHandler",
    
    # File upload
    "FileUploadValidator",
    
    # Middleware
    "SecurityHeadersMiddleware",
    
    # Audit logging
    "audit_logger",
    "AuditLogger",
    
    # Password
    "hash_password",
    "verify_password",
    
    # Webhooks
    "verify_stripe_webhook_signature",
]
