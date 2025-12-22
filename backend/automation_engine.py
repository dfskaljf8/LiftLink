"""
LiftLink Automation Engine
Handles behavior-based automations, smart notifications, and adaptive coaching
"""

import os
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
from uuid import uuid4

from backend.ai_service import liftlink_ai

class AutomationEngine:
    """
    The AI autopilot for modern coaches
    Handles: reminders, check-ins, plan adjustments, content delivery, DM templates
    """
    
    def __init__(self, db):
        self.db = db
        self.active_automations = {}
    
    # ==================== BEHAVIOR TRIGGERS ====================
    
    async def check_missed_workouts(self, client_id: str) -> Optional[Dict]:
        """
        Check if client has missed workouts and trigger appropriate action
        Trigger: 2+ missed workouts
        """
        client = await self.db.clients.find_one({"id": client_id}, {"_id": 0})
        if not client:
            return None
        
        # Get workout history for last 7 days
        week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        workout_logs = await self.db.workout_logs.find({
            "client_id": client_id,
            "scheduled_date": {"$gte": week_ago}
        }).to_list(100)
        
        # Count missed vs completed
        scheduled = len(workout_logs)
        completed = len([w for w in workout_logs if w.get("completed", False)])
        missed = scheduled - completed
        
        if missed >= 2:
            # Get client's vibe for message tone
            vibe = client.get("vibe", {}).get("mode", "soft_grind")
            
            # Get last workout date
            last_completed = await self.db.workout_logs.find_one(
                {"client_id": client_id, "completed": True},
                sort=[("completed_at", -1)]
            )
            days_since = 0
            if last_completed and last_completed.get("completed_at"):
                last_date = datetime.fromisoformat(last_completed["completed_at"].replace("Z", "+00:00"))
                days_since = (datetime.now(timezone.utc) - last_date).days
            
            # Generate AI coaching message
            message_result = await liftlink_ai.generate_coaching_message(
                trigger="missed_workout",
                client_data={
                    "name": client.get("name", "there"),
                    "missed_count": missed,
                    "days_since_last": days_since,
                    "vibe": vibe,
                    "goal": client.get("goals", {}).get("primary_goal", "stay consistent")
                },
                trainer_tone=vibe
            )
            
            if message_result.get("success"):
                # Create notification
                notification = {
                    "id": str(uuid4()),
                    "user_id": client_id,
                    "title": "Your coach is checking in 💪",
                    "body": message_result.get("message", ""),
                    "data": {
                        "type": "missed_workout",
                        "suggested_action": message_result.get("suggested_action", ""),
                        "missed_count": missed
                    },
                    "notification_type": "coaching_message",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                
                await self.db.notifications.insert_one(notification)
                
                return {
                    "triggered": True,
                    "action": "missed_workout_message",
                    "notification_id": notification["id"],
                    "message": message_result.get("message")
                }
        
        return {"triggered": False, "missed_count": missed}
    
    async def check_streak_milestone(self, client_id: str) -> Optional[Dict]:
        """
        Check if client hit a streak milestone and celebrate
        Milestones: 7, 14, 21, 30, 60, 90, 180, 365 days
        """
        client = await self.db.clients.find_one({"id": client_id}, {"_id": 0})
        if not client:
            return None
        
        current_streak = client.get("current_streak", 0)
        milestones = [7, 14, 21, 30, 60, 90, 180, 365]
        
        if current_streak in milestones:
            # Check if we already celebrated this milestone
            existing_celebration = await self.db.celebrations.find_one({
                "client_id": client_id,
                "milestone": current_streak,
                "type": "streak"
            })
            
            if existing_celebration:
                return {"triggered": False, "reason": "already_celebrated"}
            
            vibe = client.get("vibe", {}).get("mode", "soft_grind")
            
            # Generate celebration message
            message_result = await liftlink_ai.generate_coaching_message(
                trigger="streak_achieved",
                client_data={
                    "name": client.get("name", "Champion"),
                    "streak_days": current_streak,
                    "vibe": vibe,
                    "goal": client.get("goals", {}).get("primary_goal", "stay consistent")
                },
                trainer_tone=vibe
            )
            
            # Award XP
            xp_rewards = {7: 100, 14: 200, 21: 350, 30: 500, 60: 1000, 90: 1500, 180: 3000, 365: 10000}
            xp_earned = xp_rewards.get(current_streak, 50)
            
            # Update client XP
            await self.db.clients.update_one(
                {"id": client_id},
                {"$inc": {"total_xp": xp_earned}}
            )
            
            # Log XP event
            xp_event = {
                "id": str(uuid4()),
                "client_id": client_id,
                "event_type": "streak_milestone",
                "xp_earned": xp_earned,
                "description": f"{current_streak}-day streak achieved!",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await self.db.xp_events.insert_one(xp_event)
            
            # Record celebration
            await self.db.celebrations.insert_one({
                "id": str(uuid4()),
                "client_id": client_id,
                "milestone": current_streak,
                "type": "streak",
                "xp_awarded": xp_earned,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
            # Check for reward content unlock
            reward_content = await self._check_streak_rewards(client_id, current_streak)
            
            # Create notification
            notification = {
                "id": str(uuid4()),
                "user_id": client_id,
                "title": f"🔥 {current_streak}-Day Streak!",
                "body": message_result.get("message", f"You've hit {current_streak} days! +{xp_earned} XP"),
                "data": {
                    "type": "streak_milestone",
                    "streak_days": current_streak,
                    "xp_earned": xp_earned,
                    "reward_unlocked": reward_content
                },
                "notification_type": "achievement",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await self.db.notifications.insert_one(notification)
            
            return {
                "triggered": True,
                "action": "streak_celebration",
                "streak_days": current_streak,
                "xp_earned": xp_earned,
                "reward_content": reward_content,
                "message": message_result.get("message")
            }
        
        return {"triggered": False, "current_streak": current_streak}
    
    async def _check_streak_rewards(self, client_id: str, streak_days: int) -> Optional[Dict]:
        """Check if there's reward content to unlock for this streak"""
        client = await self.db.clients.find_one({"id": client_id}, {"_id": 0})
        trainer_id = client.get("trainer_id")
        
        if not trainer_id:
            return None
        
        # Find content locked behind this streak
        reward_content = await self.db.content_items.find_one({
            "trainer_id": trainer_id,
            "unlock_requirement": f"{streak_days}_day_streak"
        }, {"_id": 0})
        
        if reward_content:
            # Unlock it for the client
            await self.db.content_unlocks.insert_one({
                "id": str(uuid4()),
                "client_id": client_id,
                "content_id": reward_content["id"],
                "unlocked_at": datetime.now(timezone.utc).isoformat(),
                "unlock_reason": f"{streak_days}_day_streak"
            })
            
            return {
                "content_id": reward_content["id"],
                "title": reward_content.get("title"),
                "type": reward_content.get("type")
            }
        
        return None
    
    async def process_checkin(self, client_id: str, checkin_data: Dict) -> Dict:
        """
        Process daily check-in and adapt today's workout if needed
        """
        client = await self.db.clients.find_one({"id": client_id}, {"_id": 0})
        if not client:
            return {"success": False, "error": "Client not found"}
        
        # Save check-in
        checkin = {
            "id": str(uuid4()),
            "client_id": client_id,
            "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "energy_level": checkin_data.get("energy_level", 3),
            "stress_level": checkin_data.get("stress_level", 3),
            "sleep_quality": checkin_data.get("sleep_quality", 3),
            "sleep_hours": checkin_data.get("sleep_hours", 7),
            "mood": checkin_data.get("mood"),
            "notes": checkin_data.get("notes"),
            "pain_areas": checkin_data.get("pain_areas", []),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Determine workout adjustment
        energy = checkin_data.get("energy_level", 3)
        stress = checkin_data.get("stress_level", 3)
        sleep = checkin_data.get("sleep_quality", 3)
        
        # Calculate intensity adjustment
        wellness_score = (energy + (6 - stress) + sleep) / 3  # Higher is better
        
        if wellness_score < 2:
            intensity_adjustment = "significantly_reduced"
            workout_recommended = wellness_score > 1.5
        elif wellness_score < 2.5:
            intensity_adjustment = "reduced"
            workout_recommended = True
        elif wellness_score > 4:
            intensity_adjustment = "increased"
            workout_recommended = True
        else:
            intensity_adjustment = "normal"
            workout_recommended = True
        
        checkin["workout_recommended"] = workout_recommended
        checkin["intensity_adjustment"] = intensity_adjustment
        
        await self.db.checkins.insert_one(checkin)
        
        # Update client's rolling averages
        await self.db.clients.update_one(
            {"id": client_id},
            {
                "$set": {
                    "last_checkin": checkin,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        # Award XP for check-in
        xp_earned = 10
        await self.db.clients.update_one(
            {"id": client_id},
            {"$inc": {"total_xp": xp_earned}}
        )
        
        # If low energy, generate supportive message
        coaching_message = None
        if energy <= 2:
            vibe = client.get("vibe", {}).get("mode", "soft_grind")
            message_result = await liftlink_ai.generate_coaching_message(
                trigger="low_energy",
                client_data={
                    "name": client.get("name", "there"),
                    "energy_level": energy,
                    "energy_note": checkin_data.get("notes", "feeling low energy"),
                    "vibe": vibe,
                    "goal": client.get("goals", {}).get("primary_goal", "stay healthy")
                },
                trainer_tone=vibe
            )
            if message_result.get("success"):
                coaching_message = message_result.get("message")
        
        # Get today's workout and adapt if needed
        adapted_workout = None
        if intensity_adjustment != "normal":
            today_workout = await self.db.scheduled_workouts.find_one({
                "client_id": client_id,
                "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "completed": False
            }, {"_id": 0})
            
            if today_workout:
                adaptation = await liftlink_ai.adapt_workout(
                    original_workout=today_workout,
                    adaptation_reason=f"checkin_{intensity_adjustment}",
                    client_state={
                        "energy": energy,
                        "stress": stress,
                        "sleep_hours": checkin_data.get("sleep_hours", 7),
                        "mood": checkin_data.get("mood", "neutral"),
                        "pain_areas": checkin_data.get("pain_areas", [])
                    }
                )
                
                if adaptation.get("success"):
                    adapted_workout = adaptation.get("adapted_workout")
                    
                    # Save adapted workout
                    await self.db.scheduled_workouts.update_one(
                        {"id": today_workout["id"]},
                        {"$set": {
                            "adapted": True,
                            "adapted_workout": adapted_workout,
                            "adaptation_reason": intensity_adjustment,
                            "adapted_at": datetime.now(timezone.utc).isoformat()
                        }}
                    )
        
        return {
            "success": True,
            "checkin_id": checkin["id"],
            "wellness_score": round(wellness_score, 2),
            "intensity_adjustment": intensity_adjustment,
            "workout_recommended": workout_recommended,
            "adapted_workout": adapted_workout,
            "coaching_message": coaching_message,
            "xp_earned": xp_earned
        }
    
    async def analyze_skip_patterns(self, client_id: str) -> Dict:
        """
        Analyze patterns in skipped workouts and suggest schedule changes
        """
        # Get workout history for last 30 days
        month_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        
        workout_logs = await self.db.workout_logs.find({
            "client_id": client_id,
            "scheduled_date": {"$gte": month_ago}
        }).to_list(100)
        
        checkin_history = await self.db.checkins.find({
            "client_id": client_id,
            "created_at": {"$gte": month_ago}
        }).to_list(100)
        
        if len(workout_logs) < 5:
            return {"success": False, "error": "Not enough data for analysis"}
        
        # Use AI to analyze patterns
        analysis = await liftlink_ai.analyze_client_patterns(
            workout_history=workout_logs,
            checkin_history=checkin_history
        )
        
        if analysis.get("success"):
            # Save analysis
            await self.db.pattern_analyses.insert_one({
                "id": str(uuid4()),
                "client_id": client_id,
                "analysis": analysis.get("analysis"),
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
            # Create recommendation notification if needed
            recommendations = analysis.get("analysis", {}).get("recommendations", [])
            high_priority = [r for r in recommendations if r.get("priority") == "high"]
            
            if high_priority:
                client = await self.db.clients.find_one({"id": client_id}, {"_id": 0})
                notification = {
                    "id": str(uuid4()),
                    "user_id": client_id,
                    "title": "💡 Schedule Optimization Available",
                    "body": high_priority[0].get("action", "We noticed some patterns in your training"),
                    "data": {
                        "type": "schedule_recommendation",
                        "recommendations": high_priority
                    },
                    "notification_type": "recommendation",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await self.db.notifications.insert_one(notification)
        
        return analysis
    
    # ==================== SCHEDULED AUTOMATIONS ====================
    
    async def run_daily_automations(self):
        """
        Run all daily automation checks for all active clients
        Called by a scheduled job
        """
        results = {
            "processed_clients": 0,
            "missed_workout_triggers": 0,
            "streak_celebrations": 0,
            "errors": []
        }
        
        # Get all active clients with trainers
        clients = await self.db.clients.find({
            "trainer_id": {"$ne": None}
        }).to_list(1000)
        
        for client in clients:
            try:
                client_id = client["id"]
                
                # Check missed workouts
                missed_result = await self.check_missed_workouts(client_id)
                if missed_result and missed_result.get("triggered"):
                    results["missed_workout_triggers"] += 1
                
                # Check streak milestones
                streak_result = await self.check_streak_milestone(client_id)
                if streak_result and streak_result.get("triggered"):
                    results["streak_celebrations"] += 1
                
                results["processed_clients"] += 1
                
            except Exception as e:
                results["errors"].append({
                    "client_id": client.get("id"),
                    "error": str(e)
                })
        
        return results
    
    async def send_workout_reminders(self):
        """
        Send workout reminders for scheduled workouts
        """
        # Get workouts scheduled for today that haven't been completed or reminded
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        upcoming_workouts = await self.db.scheduled_workouts.find({
            "date": today,
            "completed": False,
            "reminder_sent": {"$ne": True}
        }).to_list(1000)
        
        reminders_sent = 0
        
        for workout in upcoming_workouts:
            client_id = workout.get("client_id")
            client = await self.db.clients.find_one({"id": client_id}, {"_id": 0})
            
            if not client:
                continue
            
            # Create reminder notification
            notification = {
                "id": str(uuid4()),
                "user_id": client_id,
                "title": "💪 Workout Time!",
                "body": f"Your {workout.get('name', 'workout')} is ready. Let's crush it!",
                "data": {
                    "type": "workout_reminder",
                    "workout_id": workout.get("id")
                },
                "notification_type": "workout_reminder",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await self.db.notifications.insert_one(notification)
            
            # Mark as reminded
            await self.db.scheduled_workouts.update_one(
                {"id": workout["id"]},
                {"$set": {"reminder_sent": True}}
            )
            
            reminders_sent += 1
        
        return {"reminders_sent": reminders_sent}


# Factory function to create engine with database
def create_automation_engine(db):
    return AutomationEngine(db)
