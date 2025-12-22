"""
LiftLink Push Notification Service
Firebase Cloud Messaging integration for iOS and Android push notifications
"""

import os
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()

# Firebase Admin SDK initialization
firebase_initialized = False
fcm = None

def init_firebase():
    """Initialize Firebase Admin SDK"""
    global firebase_initialized, fcm
    
    if firebase_initialized:
        return True
    
    try:
        import firebase_admin
        from firebase_admin import credentials, messaging
        
        # Check if already initialized (from another import)
        try:
            existing_app = firebase_admin.get_app()
            firebase_initialized = True
            fcm = messaging
            print("✅ Firebase already initialized")
            return True
        except ValueError:
            pass  # Not initialized, continue with initialization
        
        # Check for service account credentials
        service_account_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_PATH', '/app/backend/firebase-service-account.json')
        project_id = os.environ.get('FIREBASE_PROJECT_ID', 'liftlink-fitness')
        
        print(f"🔍 Looking for Firebase credentials at: {service_account_path}")
        
        # Try to initialize with credentials file
        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            firebase_initialized = True
            fcm = messaging
            print(f"✅ Firebase initialized with service account (Project: {project_id})")
            return True
        
        # Try to initialize with environment variable (JSON string)
        firebase_creds_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON')
        if firebase_creds_json:
            try:
                cred_dict = json.loads(firebase_creds_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                firebase_initialized = True
                fcm = messaging
                print("✅ Firebase initialized with environment credentials")
                return True
            except json.JSONDecodeError:
                print("❌ Invalid FIREBASE_SERVICE_ACCOUNT_JSON format")
        
        # Initialize without credentials (for local development/testing)
        print("⚠️ Firebase credentials not found - Push notifications will be simulated")
        return False
        
    except ImportError:
        print("⚠️ firebase-admin not installed - Push notifications disabled")
        return False
    except Exception as e:
        print(f"❌ Firebase initialization error: {e}")
        return False


class PushNotificationService:
    """
    Firebase Cloud Messaging service for LiftLink
    Supports: iOS, Android push notifications with custom data payloads
    """
    
    def __init__(self, db):
        self.db = db
        self.initialized = init_firebase()
    
    async def register_device(
        self,
        user_id: str,
        fcm_token: str,
        device_type: str,  # 'ios' or 'android'
        device_info: Optional[Dict] = None
    ) -> Dict:
        """
        Register a device for push notifications
        """
        device_record = {
            "id": str(uuid4()),
            "user_id": user_id,
            "fcm_token": fcm_token,
            "device_type": device_type,
            "device_info": device_info or {},
            "active": True,
            "registered_at": datetime.now(timezone.utc).isoformat(),
            "last_used": datetime.now(timezone.utc).isoformat()
        }
        
        # Upsert - update if token exists, create if new
        await self.db.push_devices.update_one(
            {"fcm_token": fcm_token},
            {"$set": device_record},
            upsert=True
        )
        
        # Update user's notification preferences
        await self.db.users.update_one(
            {"id": user_id},
            {"$set": {
                "push_enabled": True,
                "last_device_registered": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {
            "success": True,
            "device_id": device_record["id"],
            "message": "Device registered for push notifications"
        }
    
    async def unregister_device(self, fcm_token: str) -> Dict:
        """Remove a device from push notifications"""
        result = await self.db.push_devices.update_one(
            {"fcm_token": fcm_token},
            {"$set": {"active": False}}
        )
        
        return {
            "success": result.modified_count > 0,
            "message": "Device unregistered" if result.modified_count > 0 else "Device not found"
        }
    
    async def send_to_user(
        self,
        user_id: str,
        title: str,
        body: str,
        data: Optional[Dict] = None,
        notification_type: str = "general",
        image_url: Optional[str] = None,
        badge_count: Optional[int] = None
    ) -> Dict:
        """
        Send push notification to a specific user (all their devices)
        """
        # Get all active devices for user
        devices = await self.db.push_devices.find({
            "user_id": user_id,
            "active": True
        }).to_list(10)
        
        if not devices:
            return {
                "success": False,
                "error": "No active devices found for user",
                "simulated": True
            }
        
        tokens = [d["fcm_token"] for d in devices]
        
        # Store notification in database
        notification_record = {
            "id": str(uuid4()),
            "user_id": user_id,
            "title": title,
            "body": body,
            "data": data or {},
            "notification_type": notification_type,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "delivered": False,
            "read": False
        }
        await self.db.notifications.insert_one(notification_record)
        
        # Send via FCM
        if self.initialized and fcm:
            results = await self._send_fcm_multicast(
                tokens=tokens,
                title=title,
                body=body,
                data=data,
                image_url=image_url,
                badge_count=badge_count
            )
            
            # Update delivery status
            if results.get("success_count", 0) > 0:
                await self.db.notifications.update_one(
                    {"id": notification_record["id"]},
                    {"$set": {"delivered": True, "delivered_at": datetime.now(timezone.utc).isoformat()}}
                )
            
            return {
                "success": True,
                "notification_id": notification_record["id"],
                "sent_to_devices": len(tokens),
                "success_count": results.get("success_count", 0),
                "failure_count": results.get("failure_count", 0)
            }
        else:
            # Simulation mode
            print(f"📱 [SIMULATED] Push to {user_id}: {title} - {body}")
            return {
                "success": True,
                "notification_id": notification_record["id"],
                "simulated": True,
                "message": "Notification stored (FCM not configured)"
            }
    
    async def _send_fcm_multicast(
        self,
        tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict] = None,
        image_url: Optional[str] = None,
        badge_count: Optional[int] = None
    ) -> Dict:
        """Send FCM multicast message"""
        try:
            from firebase_admin import messaging
            
            # Build notification
            notification = messaging.Notification(
                title=title,
                body=body,
                image=image_url
            )
            
            # Platform-specific config
            android_config = messaging.AndroidConfig(
                priority='high',
                notification=messaging.AndroidNotification(
                    icon='ic_notification',
                    color='#BFFF00',
                    sound='default',
                    channel_id='liftlink_default'
                )
            )
            
            apns_config = messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        badge=badge_count,
                        sound='default',
                        content_available=True
                    )
                )
            )
            
            # Build message
            message = messaging.MulticastMessage(
                tokens=tokens,
                notification=notification,
                data={k: str(v) for k, v in (data or {}).items()},  # FCM requires string values
                android=android_config,
                apns=apns_config
            )
            
            # Send
            response = messaging.send_multicast(message)
            
            return {
                "success_count": response.success_count,
                "failure_count": response.failure_count
            }
            
        except Exception as e:
            print(f"❌ FCM send error: {e}")
            return {"success_count": 0, "failure_count": len(tokens), "error": str(e)}
    
    async def send_to_topic(
        self,
        topic: str,
        title: str,
        body: str,
        data: Optional[Dict] = None
    ) -> Dict:
        """
        Send notification to all subscribers of a topic
        Topics: 'all_users', 'trainers', 'trainees', 'premium'
        """
        if self.initialized and fcm:
            try:
                from firebase_admin import messaging
                
                message = messaging.Message(
                    notification=messaging.Notification(title=title, body=body),
                    data={k: str(v) for k, v in (data or {}).items()},
                    topic=topic
                )
                
                response = messaging.send(message)
                return {"success": True, "message_id": response}
                
            except Exception as e:
                return {"success": False, "error": str(e)}
        else:
            print(f"📱 [SIMULATED] Topic push to '{topic}': {title}")
            return {"success": True, "simulated": True}
    
    async def subscribe_to_topic(self, user_id: str, topic: str) -> Dict:
        """Subscribe user's devices to a topic"""
        devices = await self.db.push_devices.find({
            "user_id": user_id,
            "active": True
        }).to_list(10)
        
        if not devices:
            return {"success": False, "error": "No devices found"}
        
        tokens = [d["fcm_token"] for d in devices]
        
        if self.initialized and fcm:
            try:
                from firebase_admin import messaging
                response = messaging.subscribe_to_topic(tokens, topic)
                return {
                    "success": True,
                    "subscribed_count": response.success_count
                }
            except Exception as e:
                return {"success": False, "error": str(e)}
        
        return {"success": True, "simulated": True}
    
    async def get_user_notifications(
        self,
        user_id: str,
        limit: int = 20,
        unread_only: bool = False
    ) -> List[Dict]:
        """Get notifications for a user"""
        query = {"user_id": user_id}
        if unread_only:
            query["read"] = False
        
        notifications = await self.db.notifications.find(
            query,
            {"_id": 0}
        ).sort("sent_at", -1).limit(limit).to_list(limit)
        
        return notifications
    
    async def mark_as_read(self, notification_id: str) -> Dict:
        """Mark a notification as read"""
        result = await self.db.notifications.update_one(
            {"id": notification_id},
            {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"success": result.modified_count > 0}
    
    async def mark_all_read(self, user_id: str) -> Dict:
        """Mark all user notifications as read"""
        result = await self.db.notifications.update_many(
            {"user_id": user_id, "read": False},
            {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"success": True, "marked_count": result.modified_count}


# Notification templates for different scenarios
NOTIFICATION_TEMPLATES = {
    "workout_reminder": {
        "title": "💪 Workout Time!",
        "body_template": "Your {workout_name} is ready. Let's crush it!"
    },
    "missed_workout": {
        "title": "We miss you! 😢",
        "body_template": "You've missed {count} workouts. Your coach is here to help!"
    },
    "streak_milestone": {
        "title": "🔥 {days}-Day Streak!",
        "body_template": "Incredible consistency! You've earned +{xp} XP!"
    },
    "daily_checkin": {
        "title": "How are you feeling today?",
        "body_template": "Quick check-in to optimize your workout"
    },
    "achievement_unlocked": {
        "title": "🏆 Achievement Unlocked!",
        "body_template": "You earned '{achievement_name}'!"
    },
    "new_message": {
        "title": "New message from {sender}",
        "body_template": "{preview}"
    },
    "program_assigned": {
        "title": "New Program Ready! 📋",
        "body_template": "Your coach assigned '{program_name}'. Check it out!"
    },
    "quest_available": {
        "title": "🎯 New Quest Available!",
        "body_template": "{quest_name} - Complete for {xp} XP!"
    }
}


def create_push_service(db):
    """Factory function to create push notification service"""
    return PushNotificationService(db)
