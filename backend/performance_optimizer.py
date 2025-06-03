"""
Performance Optimization Module for LiftLink Platform
Implements caching, compression, database optimization, and frontend optimization
"""

import asyncio
import time
import json
import gzip
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from functools import wraps
import redis
from motor.motor_asyncio import AsyncIOMotorClient
import os
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import logging

# Configure logging
perf_logger = logging.getLogger("liftlink_performance")
perf_logger.setLevel(logging.INFO)

# Redis connection for caching
try:
    redis_client = redis.Redis(host=os.getenv('REDIS_HOST', 'localhost'), port=6379, decode_responses=True)
    redis_client.ping()
    USE_REDIS_CACHE = True
except:
    USE_REDIS_CACHE = False
    in_memory_cache = {}
    cache_timestamps = {}

class PerformanceOptimizer:
    def __init__(self, mongo_client: AsyncIOMotorClient):
        self.db = mongo_client[os.getenv("DB_NAME", "liftlink_db")]
        self.cache_stats = {
            "hits": 0,
            "misses": 0,
            "writes": 0
        }
    
    async def setup_database_indexes(self):
        """Create optimized database indexes for better query performance"""
        try:
            # User collection indexes
            await self.db.users.create_index([("email", 1)], unique=True)
            await self.db.users.create_index([("user_id", 1)], unique=True)
            await self.db.users.create_index([("role", 1)])
            await self.db.users.create_index([("created_at", -1)])
            await self.db.users.create_index([("location", "2dsphere")])
            await self.db.users.create_index([("consecutive_days", -1)])
            await self.db.users.create_index([("lift_coins", -1)])
            await self.db.users.create_index([("level", -1)])
            
            # Trainer collection indexes
            await self.db.trainers.create_index([("trainer_id", 1)], unique=True)
            await self.db.trainers.create_index([("location", "2dsphere")])
            await self.db.trainers.create_index([("specialties", 1)])
            await self.db.trainers.create_index([("hourly_rate", 1)])
            await self.db.trainers.create_index([("rating", -1)])
            await self.db.trainers.create_index([("is_certified_trainer", 1)])
            await self.db.trainers.create_index([("gym_name", 1)])
            
            # Booking collection indexes
            await self.db.bookings.create_index([("user_id", 1)])
            await self.db.bookings.create_index([("trainer_id", 1)])
            await self.db.bookings.create_index([("session_date", 1)])
            await self.db.bookings.create_index([("status", 1)])
            await self.db.bookings.create_index([("created_at", -1)])
            await self.db.bookings.create_index([("user_id", 1), ("status", 1)])
            await self.db.bookings.create_index([("trainer_id", 1), ("status", 1)])
            
            # Messages collection indexes
            await self.db.messages.create_index([("sender_id", 1)])
            await self.db.messages.create_index([("recipient_id", 1)])
            await self.db.messages.create_index([("created_at", -1)])
            await self.db.messages.create_index([("is_read", 1)])
            await self.db.messages.create_index([("sender_id", 1), ("recipient_id", 1), ("created_at", -1)])
            
            # Progress entries indexes
            await self.db.progress_entries.create_index([("user_id", 1)])
            await self.db.progress_entries.create_index([("date_recorded", -1)])
            await self.db.progress_entries.create_index([("user_id", 1), ("date_recorded", -1)])
            
            # Social activity indexes
            await self.db.social_activities.create_index([("user_id", 1)])
            await self.db.social_activities.create_index([("created_at", -1)])
            await self.db.social_activities.create_index([("activity_type", 1)])
            
            # Security events indexes
            await self.db.security_events.create_index([("user_id", 1)])
            await self.db.security_events.create_index([("event_type", 1)])
            await self.db.security_events.create_index([("severity", 1)])
            await self.db.security_events.create_index([("timestamp", -1)])
            await self.db.security_events.create_index([("investigation_status", 1)])
            
            # Compound indexes for common queries
            await self.db.trainers.create_index([
                ("location", "2dsphere"),
                ("specialties", 1),
                ("hourly_rate", 1),
                ("rating", -1)
            ])
            
            await self.db.bookings.create_index([
                ("trainer_id", 1),
                ("session_date", 1),
                ("status", 1)
            ])
            
            perf_logger.info("Database indexes created successfully")
            
        except Exception as e:
            perf_logger.error(f"Error creating database indexes: {e}")
    
    def cache_key(self, prefix: str, **kwargs) -> str:
        """Generate consistent cache keys"""
        key_parts = [prefix]
        for k, v in sorted(kwargs.items()):
            key_parts.append(f"{k}:{v}")
        return ":".join(key_parts)
    
    async def get_cached(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            if USE_REDIS_CACHE:
                cached_data = redis_client.get(key)
                if cached_data:
                    self.cache_stats["hits"] += 1
                    return json.loads(cached_data)
            else:
                # Fallback to in-memory cache
                if key in in_memory_cache:
                    timestamp = cache_timestamps.get(key, 0)
                    if time.time() - timestamp < 300:  # 5 minute TTL
                        self.cache_stats["hits"] += 1
                        return in_memory_cache[key]
                    else:
                        # Expired, remove
                        del in_memory_cache[key]
                        if key in cache_timestamps:
                            del cache_timestamps[key]
            
            self.cache_stats["misses"] += 1
            return None
            
        except Exception as e:
            perf_logger.error(f"Cache get error: {e}")
            return None
    
    async def set_cached(self, key: str, value: Any, ttl: int = 300):
        """Set value in cache with TTL"""
        try:
            if USE_REDIS_CACHE:
                redis_client.setex(key, ttl, json.dumps(value, default=str))
            else:
                # Fallback to in-memory cache
                in_memory_cache[key] = value
                cache_timestamps[key] = time.time()
            
            self.cache_stats["writes"] += 1
            
        except Exception as e:
            perf_logger.error(f"Cache set error: {e}")
    
    async def delete_cached(self, pattern: str):
        """Delete cached values matching pattern"""
        try:
            if USE_REDIS_CACHE:
                keys = redis_client.keys(pattern)
                if keys:
                    redis_client.delete(*keys)
            else:
                # Fallback - delete matching keys
                keys_to_delete = [k for k in in_memory_cache.keys() if pattern in k]
                for k in keys_to_delete:
                    del in_memory_cache[k]
                    if k in cache_timestamps:
                        del cache_timestamps[k]
                        
        except Exception as e:
            perf_logger.error(f"Cache delete error: {e}")

# Caching decorators
def cache_result(ttl: int = 300, key_prefix: str = ""):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key_parts = [key_prefix or func.__name__]
            
            # Add relevant arguments to cache key
            for arg in args:
                if isinstance(arg, (str, int, float)):
                    cache_key_parts.append(str(arg))
            
            for k, v in kwargs.items():
                if isinstance(v, (str, int, float, bool)) and k != 'current_user':
                    cache_key_parts.append(f"{k}:{v}")
            
            cache_key = ":".join(cache_key_parts)
            
            # Try to get from cache
            optimizer = PerformanceOptimizer(None)  # Would inject DB in production
            cached_result = await optimizer.get_cached(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await optimizer.set_cached(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

def invalidate_cache_on_update(cache_patterns: List[str]):
    """Decorator to invalidate cache when data is updated"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            
            # Invalidate related cache entries
            optimizer = PerformanceOptimizer(None)
            for pattern in cache_patterns:
                await optimizer.delete_cached(pattern)
            
            return result
        return wrapper
    return decorator

class CompressionMiddleware:
    """Middleware for response compression"""
    
    def __init__(self, min_size: int = 1000):
        self.min_size = min_size
    
    async def __call__(self, request: Request, call_next):
        response = await call_next(request)
        
        # Check if client accepts gzip
        accept_encoding = request.headers.get("accept-encoding", "")
        if "gzip" not in accept_encoding:
            return response
        
        # Only compress JSON responses above minimum size
        if (hasattr(response, 'body') and 
            isinstance(response, JSONResponse) and
            len(response.body) > self.min_size):
            
            # Compress the response body
            compressed_body = gzip.compress(response.body)
            
            # Create new response with compressed body
            compressed_response = Response(
                content=compressed_body,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.media_type
            )
            
            compressed_response.headers["content-encoding"] = "gzip"
            compressed_response.headers["content-length"] = str(len(compressed_body))
            
            return compressed_response
        
        return response

class DatabaseQueryOptimizer:
    """Optimize database queries with aggregation pipelines and efficient queries"""
    
    def __init__(self, db):
        self.db = db
    
    async def get_trainer_stats_optimized(self, trainer_id: str) -> Dict[str, Any]:
        """Optimized aggregation for trainer statistics"""
        pipeline = [
            {"$match": {"trainer_id": trainer_id}},
            {"$group": {
                "_id": "$trainer_id",
                "total_bookings": {"$sum": 1},
                "confirmed_bookings": {
                    "$sum": {"$cond": [{"$eq": ["$status", "confirmed"]}, 1, 0]}
                },
                "total_earnings": {
                    "$sum": {"$cond": [{"$eq": ["$status", "confirmed"]}, "$trainer_amount", 0]}
                },
                "avg_rating": {"$avg": "$rating"},
                "recent_bookings": {
                    "$push": {
                        "$cond": [
                            {"$gte": ["$created_at", datetime.utcnow() - timedelta(days=30)]},
                            "$$ROOT",
                            None
                        ]
                    }
                }
            }}
        ]
        
        result = await self.db.bookings.aggregate(pipeline).to_list(1)
        return result[0] if result else {}
    
    async def get_user_analytics_optimized(self, user_id: str) -> Dict[str, Any]:
        """Optimized user analytics with aggregation"""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": "$user_id",
                "total_sessions": {"$sum": 1},
                "completed_sessions": {
                    "$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}
                },
                "total_spent": {"$sum": "$total_amount"},
                "avg_session_duration": {"$avg": "$duration_hours"},
                "favorite_trainers": {
                    "$addToSet": "$trainer_id"
                }
            }}
        ]
        
        result = await self.db.bookings.aggregate(pipeline).to_list(1)
        return result[0] if result else {}
    
    async def get_leaderboard_optimized(self, category: str, limit: int = 10) -> List[Dict]:
        """Optimized leaderboard queries"""
        if category == "streaks":
            pipeline = [
                {"$match": {"consecutive_days": {"$gt": 0}}},
                {"$sort": {"consecutive_days": -1}},
                {"$limit": limit},
                {"$project": {
                    "user_id": 1,
                    "name": 1,
                    "consecutive_days": 1,
                    "level": 1,
                    "badges": 1
                }}
            ]
        elif category == "coins":
            pipeline = [
                {"$match": {"total_coins_earned": {"$gt": 0}}},
                {"$sort": {"total_coins_earned": -1}},
                {"$limit": limit},
                {"$project": {
                    "user_id": 1,
                    "name": 1,
                    "total_coins_earned": 1,
                    "lift_coins": 1,
                    "level": 1
                }}
            ]
        else:
            return []
        
        return await self.db.users.aggregate(pipeline).to_list(limit)
    
    async def search_trainers_optimized(self, filters: Dict[str, Any]) -> List[Dict]:
        """Optimized trainer search with geospatial queries"""
        pipeline = []
        
        # Match stage
        match_conditions = {}
        
        if filters.get("specialty"):
            match_conditions["specialties"] = {"$in": [filters["specialty"]]}
        
        if filters.get("max_rate"):
            match_conditions["hourly_rate"] = {"$lte": filters["max_rate"]}
        
        if filters.get("certified_only"):
            match_conditions["is_certified_trainer"] = True
        
        if filters.get("gym"):
            match_conditions["gym_name"] = {"$regex": filters["gym"], "$options": "i"}
        
        # Geospatial search
        if filters.get("lat") and filters.get("lng"):
            match_conditions["location"] = {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [filters["lng"], filters["lat"]]
                    },
                    "$maxDistance": (filters.get("radius", 25)) * 1000
                }
            }
        
        if match_conditions:
            pipeline.append({"$match": match_conditions})
        
        # Lookup user information
        pipeline.extend([
            {"$lookup": {
                "from": "users",
                "localField": "trainer_id",
                "foreignField": "user_id",
                "as": "user_info"
            }},
            {"$unwind": "$user_info"},
            
            # Lookup certifications
            {"$lookup": {
                "from": "certifications",
                "localField": "trainer_id",
                "foreignField": "trainer_id",
                "as": "certifications"
            }},
            
            # Project final result
            {"$project": {
                "trainer_id": 1,
                "trainer_name": "$user_info.name",
                "bio": 1,
                "specialties": 1,
                "hourly_rate": 1,
                "gym_name": 1,
                "location": 1,
                "experience_years": 1,
                "rating": 1,
                "total_sessions": 1,
                "is_certified_trainer": 1,
                "verified_certifications": 1,
                "certifications": {
                    "$filter": {
                        "input": "$certifications",
                        "cond": {"$eq": ["$$this.verification_status", "verified"]}
                    }
                }
            }},
            
            {"$limit": 50}
        ])
        
        return await self.db.trainers.aggregate(pipeline).to_list(50)

class FrontendOptimization:
    """Frontend performance optimization utilities"""
    
    @staticmethod
    def optimize_api_response(data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize API response by removing unnecessary fields and compressing data"""
        
        # Remove internal fields
        internal_fields = ['_id', 'created_at', 'updated_at', 'password_hash']
        
        def clean_dict(obj):
            if isinstance(obj, dict):
                return {
                    k: clean_dict(v) for k, v in obj.items() 
                    if k not in internal_fields
                }
            elif isinstance(obj, list):
                return [clean_dict(item) for item in obj]
            else:
                return obj
        
        return clean_dict(data)
    
    @staticmethod
    def paginate_results(results: List[Dict], page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Paginate results to reduce payload size"""
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        paginated_results = results[start_idx:end_idx]
        
        return {
            "results": paginated_results,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total_items": len(results),
                "total_pages": (len(results) + per_page - 1) // per_page,
                "has_next": end_idx < len(results),
                "has_prev": page > 1
            }
        }
    
    @staticmethod
    def compress_image_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Compress image metadata for faster loading"""
        compressed = {
            "url": metadata.get("url"),
            "width": metadata.get("width"),
            "height": metadata.get("height"),
            "size": metadata.get("file_size")
        }
        
        # Add thumbnail URL if available
        if "thumbnail_url" in metadata:
            compressed["thumb"] = metadata["thumbnail_url"]
        
        return compressed

class RequestTimer:
    """Middleware to track request processing times"""
    
    def __init__(self):
        self.request_times = {}
    
    async def __call__(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        
        # Log slow requests
        if process_time > 2.0:  # Requests taking more than 2 seconds
            perf_logger.warning(
                f"Slow request: {request.method} {request.url.path} took {process_time:.2f}s"
            )
        
        # Add timing header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response

# Connection pooling for external services
class ConnectionPoolManager:
    """Manage connection pools for external services"""
    
    def __init__(self):
        self.pools = {}
    
    async def get_http_session(self, service_name: str):
        """Get or create HTTP session with connection pooling"""
        import aiohttp
        
        if service_name not in self.pools:
            connector = aiohttp.TCPConnector(
                limit=100,  # Total connection limit
                limit_per_host=30,  # Per-host connection limit
                keepalive_timeout=300,  # Keep connections alive for 5 minutes
                enable_cleanup_closed=True
            )
            
            timeout = aiohttp.ClientTimeout(total=30, connect=10)
            
            self.pools[service_name] = aiohttp.ClientSession(
                connector=connector,
                timeout=timeout
            )
        
        return self.pools[service_name]
    
    async def close_all_pools(self):
        """Close all connection pools"""
        for session in self.pools.values():
            await session.close()
        self.pools.clear()

# Memory usage monitoring
class MemoryMonitor:
    """Monitor memory usage and implement cleanup strategies"""
    
    @staticmethod
    def get_memory_usage():
        """Get current memory usage"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        memory_info = process.memory_info()
        
        return {
            "rss_mb": memory_info.rss / 1024 / 1024,  # Resident Set Size
            "vms_mb": memory_info.vms / 1024 / 1024,  # Virtual Memory Size
            "percent": process.memory_percent()
        }
    
    @staticmethod
    async def cleanup_expired_cache():
        """Clean up expired cache entries"""
        if not USE_REDIS_CACHE:
            current_time = time.time()
            expired_keys = [
                key for key, timestamp in cache_timestamps.items()
                if current_time - timestamp > 300  # 5 minutes
            ]
            
            for key in expired_keys:
                if key in in_memory_cache:
                    del in_memory_cache[key]
                if key in cache_timestamps:
                    del cache_timestamps[key]
            
            return len(expired_keys)
        return 0

# Background task for performance monitoring
async def performance_monitoring_task():
    """Background task to monitor and optimize performance"""
    while True:
        try:
            # Monitor memory usage
            memory_stats = MemoryMonitor.get_memory_usage()
            if memory_stats["percent"] > 80:  # High memory usage
                perf_logger.warning(f"High memory usage: {memory_stats['percent']:.1f}%")
                await MemoryMonitor.cleanup_expired_cache()
            
            # Clean up expired cache entries
            cleaned_entries = await MemoryMonitor.cleanup_expired_cache()
            if cleaned_entries > 0:
                perf_logger.info(f"Cleaned up {cleaned_entries} expired cache entries")
            
            # Sleep for 5 minutes before next check
            await asyncio.sleep(300)
            
        except Exception as e:
            perf_logger.error(f"Performance monitoring error: {e}")
            await asyncio.sleep(60)  # Wait 1 minute on error