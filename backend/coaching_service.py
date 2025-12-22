"""
LiftLink Coaching Automation Service
Handles all automated coaching features including scheduling, messaging, tasks, challenges
"""

import os
import re
import json
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from uuid import uuid4

from backend.coaching_models import (
    ProgramTemplate, ScheduledWorkout, PDFWorkoutUpload,
    MessageTemplate, ScheduledMessage, AutoCheckIn,
    TaskTemplate, ClientTask, HabitTracker,
    FitnessChallenge, ChallengeParticipant, GroupClass, ScheduledPost,
    ClientActivityLog, ClientProgressReport, PersonalRecord, AtRiskAlert,
    OnboardingSequence, OnboardingStep, ClientOnboardingProgress,
    PaymentSequence, PaymentFollowUp,
    ClientRiskLevel, TaskType, TaskFrequency, MessageTrigger, ChallengeMetric
)


class CoachingAutomationService:
    """
    Comprehensive coaching automation service for LiftLink
    Handles program delivery, messaging, tasks, challenges, tracking, and onboarding
    """
    
    def __init__(self, db, push_service=None, ai_service=None):
        self.db = db
        self.push_service = push_service
        self.ai_service = ai_service
        
    # ==================== PROGRAM DELIVERY ====================
    
    async def create_program_template(
        self,
        trainer_id: str,
        name: str,
        description: str = None,
        duration_weeks: int = 4,
        workouts_per_week: int = 3,
        workouts: List[Dict] = None,
        delivery_type: str = "immediate",
        auto_assign_on: str = None,
        package_ids: List[str] = None
    ) -> Dict:
        """Create a reusable program template"""
        template = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "name": name,
            "description": description,
            "duration_weeks": duration_weeks,
            "workouts_per_week": workouts_per_week,
            "workouts": workouts or [],
            "delivery_type": delivery_type,
            "auto_assign_on": auto_assign_on,
            "package_ids": package_ids or [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.program_templates.insert_one(template)
        return {"success": True, "template": {k: v for k, v in template.items() if k != "_id"}}
    
    async def schedule_workout(
        self,
        trainer_id: str,
        workout_id: str,
        workout_name: str,
        scheduled_date: str,
        client_ids: List[str] = None,
        group_id: str = None,
        scheduled_time: str = None,
        is_recurring: bool = False,
        recurrence_pattern: str = None,
        notification_enabled: bool = True
    ) -> Dict:
        """Schedule a workout for individuals or groups"""
        scheduled = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "client_ids": client_ids or [],
            "group_id": group_id,
            "workout_id": workout_id,
            "workout_name": workout_name,
            "scheduled_date": scheduled_date,
            "scheduled_time": scheduled_time,
            "is_recurring": is_recurring,
            "recurrence_pattern": recurrence_pattern,
            "notification_enabled": notification_enabled,
            "notification_hours_before": 2,
            "status": "scheduled",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.scheduled_workouts.insert_one(scheduled)
        
        # Send notifications to clients
        if notification_enabled and self.push_service:
            all_client_ids = client_ids or []
            if group_id:
                group = await self.db.groups.find_one({"id": group_id})
                if group:
                    all_client_ids.extend(group.get("member_ids", []))
            
            for client_id in all_client_ids:
                await self.push_service.send_to_user(
                    user_id=client_id,
                    title="📅 Workout Scheduled!",
                    body=f"{workout_name} is scheduled for {scheduled_date}",
                    data={"type": "workout_scheduled", "workout_id": workout_id},
                    notification_type="workout"
                )
        
        return {"success": True, "scheduled_workout": {k: v for k, v in scheduled.items() if k != "_id"}}
    
    async def assign_program_to_client(
        self,
        trainer_id: str,
        client_id: str,
        template_id: str,
        start_date: str = None
    ) -> Dict:
        """Assign a program template to a client, scheduling all workouts"""
        template = await self.db.program_templates.find_one({"id": template_id}, {"_id": 0})
        if not template:
            return {"success": False, "error": "Template not found"}
        
        start = datetime.fromisoformat(start_date) if start_date else datetime.now(timezone.utc)
        scheduled_workouts = []
        
        # Schedule each workout in the program
        for week in range(template["duration_weeks"]):
            for day_idx, workout in enumerate(template.get("workouts", [])[:template["workouts_per_week"]]):
                workout_date = start + timedelta(weeks=week, days=day_idx * 2)  # Space out workouts
                
                scheduled = await self.schedule_workout(
                    trainer_id=trainer_id,
                    workout_id=workout.get("id", str(uuid4())),
                    workout_name=workout.get("name", f"Week {week+1} Workout {day_idx+1}"),
                    scheduled_date=workout_date.strftime("%Y-%m-%d"),
                    client_ids=[client_id],
                    notification_enabled=True
                )
                scheduled_workouts.append(scheduled)
        
        # Update client's assigned program
        await self.db.users.update_one(
            {"id": client_id},
            {"$set": {
                "assigned_program_id": template_id,
                "program_start_date": start.isoformat()
            }}
        )
        
        return {
            "success": True,
            "program_name": template["name"],
            "workouts_scheduled": len(scheduled_workouts),
            "start_date": start.isoformat()
        }
    
    async def process_pdf_workout(self, trainer_id: str, file_url: str, filename: str) -> Dict:
        """Process uploaded PDF and extract workout data using AI"""
        upload_record = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "original_filename": filename,
            "file_url": file_url,
            "processing_status": "processing",
            "extracted_workouts": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.pdf_uploads.insert_one(upload_record)
        
        # Use AI to extract workout data (simplified - would need actual PDF parsing)
        if self.ai_service:
            try:
                # This would use AI to parse PDF content
                result = await self.ai_service.parse_workout_pdf(file_url)
                if result.get("success"):
                    upload_record["extracted_workouts"] = result.get("workouts", [])
                    upload_record["processing_status"] = "completed"
                else:
                    upload_record["processing_status"] = "failed"
                    upload_record["error_message"] = result.get("error")
            except Exception as e:
                upload_record["processing_status"] = "failed"
                upload_record["error_message"] = str(e)
        else:
            # Simulated extraction for demo
            upload_record["extracted_workouts"] = [
                {"name": "Extracted Workout 1", "exercises": [{"name": "Exercise A", "sets": 3, "reps": 10}]},
                {"name": "Extracted Workout 2", "exercises": [{"name": "Exercise B", "sets": 4, "reps": 8}]}
            ]
            upload_record["processing_status"] = "completed"
        
        await self.db.pdf_uploads.update_one(
            {"id": upload_record["id"]},
            {"$set": upload_record}
        )
        
        return {"success": True, "upload": {k: v for k, v in upload_record.items() if k != "_id"}}
    
    # ==================== AUTO MESSAGES & CHECK-INS ====================
    
    async def create_message_template(
        self,
        trainer_id: str,
        name: str,
        body: str,
        trigger: str,
        subject: str = None,
        trigger_config: Dict = None,
        send_as: str = "dm"
    ) -> Dict:
        """Create a reusable message template with trigger"""
        template = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "name": name,
            "subject": subject,
            "body": body,
            "trigger": trigger,
            "trigger_config": trigger_config or {},
            "is_active": True,
            "send_as": send_as,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.message_templates.insert_one(template)
        return {"success": True, "template": {k: v for k, v in template.items() if k != "_id"}}
    
    async def schedule_message(
        self,
        trainer_id: str,
        body: str,
        scheduled_datetime: str,
        recipient_ids: List[str] = None,
        group_id: str = None,
        template_id: str = None,
        subject: str = None
    ) -> Dict:
        """Schedule a message for future delivery"""
        message = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "template_id": template_id,
            "recipient_ids": recipient_ids or [],
            "group_id": group_id,
            "subject": subject,
            "body": body,
            "scheduled_datetime": scheduled_datetime,
            "status": "scheduled",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.scheduled_messages.insert_one(message)
        return {"success": True, "message": {k: v for k, v in message.items() if k != "_id"}}
    
    async def personalize_message(self, template_body: str, client_data: Dict) -> str:
        """Personalize a message template with client variables"""
        personalized = template_body
        
        # Replace variables
        variables = {
            "{name}": client_data.get("name", "there"),
            "{first_name}": client_data.get("name", "").split()[0] if client_data.get("name") else "there",
            "{last_workout}": client_data.get("last_workout_name", "your last workout"),
            "{goals}": ", ".join(client_data.get("fitness_goals", ["your goals"])),
            "{streak}": str(client_data.get("current_streak", 0)),
            "{xp}": str(client_data.get("total_xp", 0)),
            "{level}": str(client_data.get("level", 1)),
            "{next_workout}": client_data.get("next_workout_name", "your next workout"),
        }
        
        for var, value in variables.items():
            personalized = personalized.replace(var, value)
        
        return personalized
    
    async def send_triggered_messages(self, trigger: str, client_id: str) -> Dict:
        """Send all active messages for a specific trigger"""
        client = await self.db.users.find_one({"id": client_id}, {"_id": 0})
        if not client:
            return {"success": False, "error": "Client not found"}
        
        trainer_id = client.get("trainer_id")
        if not trainer_id:
            return {"success": False, "error": "Client has no trainer"}
        
        # Find active templates for this trigger
        templates = await self.db.message_templates.find({
            "trainer_id": trainer_id,
            "trigger": trigger,
            "is_active": True
        }, {"_id": 0}).to_list(20)
        
        messages_sent = []
        for template in templates:
            personalized_body = await self.personalize_message(template["body"], client)
            
            # Send via push notification
            if self.push_service and template.get("send_as") in ["dm", "push"]:
                await self.push_service.send_to_user(
                    user_id=client_id,
                    title=template.get("subject", "Message from your coach"),
                    body=personalized_body,
                    notification_type="coach_message"
                )
            
            # Log the sent message
            await self.db.sent_messages.insert_one({
                "id": str(uuid4()),
                "template_id": template["id"],
                "client_id": client_id,
                "body": personalized_body,
                "trigger": trigger,
                "sent_at": datetime.now(timezone.utc).isoformat()
            })
            
            messages_sent.append(template["name"])
        
        return {"success": True, "messages_sent": messages_sent}
    
    # ==================== TASKS, HABITS & REMINDERS ====================
    
    async def create_task_template(
        self,
        trainer_id: str,
        name: str,
        task_type: str,
        frequency: str,
        description: str = None,
        preferred_time: str = None,
        form_fields: List[Dict] = None,
        requires_photo: bool = False,
        requires_measurement: bool = False,
        xp_reward: int = 10
    ) -> Dict:
        """Create a reusable task template"""
        template = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "name": name,
            "description": description,
            "task_type": task_type,
            "frequency": frequency,
            "preferred_time": preferred_time,
            "form_fields": form_fields or [],
            "requires_photo": requires_photo,
            "requires_measurement": requires_measurement,
            "xp_reward": xp_reward,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.task_templates.insert_one(template)
        return {"success": True, "template": {k: v for k, v in template.items() if k != "_id"}}
    
    async def assign_task_to_client(
        self,
        trainer_id: str,
        client_id: str,
        task_template_id: str,
        due_date: str,
        due_time: str = None
    ) -> Dict:
        """Assign a task to a client"""
        template = await self.db.task_templates.find_one({"id": task_template_id}, {"_id": 0})
        if not template:
            return {"success": False, "error": "Task template not found"}
        
        task = {
            "id": str(uuid4()),
            "client_id": client_id,
            "trainer_id": trainer_id,
            "task_template_id": task_template_id,
            "task_name": template["name"],
            "task_type": template["task_type"],
            "due_date": due_date,
            "due_time": due_time or template.get("preferred_time"),
            "status": "pending",
            "xp_reward": template["xp_reward"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.client_tasks.insert_one(task)
        
        # Send notification
        if self.push_service:
            await self.push_service.send_to_user(
                user_id=client_id,
                title="📋 New Task!",
                body=f"{template['name']} is due on {due_date}",
                data={"type": "task_assigned", "task_id": task["id"]},
                notification_type="task"
            )
        
        return {"success": True, "task": {k: v for k, v in task.items() if k != "_id"}}
    
    async def complete_task(
        self,
        task_id: str,
        client_id: str,
        response_data: Dict = None
    ) -> Dict:
        """Complete a task and award XP"""
        task = await self.db.client_tasks.find_one({"id": task_id, "client_id": client_id})
        if not task:
            return {"success": False, "error": "Task not found"}
        
        if task["status"] == "completed":
            return {"success": False, "error": "Task already completed"}
        
        # Update task
        await self.db.client_tasks.update_one(
            {"id": task_id},
            {"$set": {
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "response_data": response_data,
                "xp_earned": task.get("xp_reward", 10)
            }}
        )
        
        # Award XP
        xp_reward = task.get("xp_reward", 10)
        await self.db.users.update_one(
            {"id": client_id},
            {"$inc": {"total_xp": xp_reward}}
        )
        
        # Log activity
        await self.log_activity(client_id, task.get("trainer_id"), "task_completed", {
            "task_id": task_id,
            "task_name": task["task_name"],
            "xp_earned": xp_reward
        })
        
        return {
            "success": True,
            "xp_earned": xp_reward,
            "task_name": task["task_name"]
        }
    
    async def get_client_today_tasks(self, client_id: str) -> List[Dict]:
        """Get all tasks due today for a client's 'Today' screen"""
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        tasks = await self.db.client_tasks.find({
            "client_id": client_id,
            "due_date": today,
            "status": {"$in": ["pending", "overdue"]}
        }, {"_id": 0}).to_list(50)
        
        return tasks
    
    async def create_habit(
        self,
        trainer_id: str,
        client_id: str,
        habit_name: str,
        description: str = None,
        target_frequency: int = 7,
        xp_per_completion: int = 5
    ) -> Dict:
        """Create a habit tracker for a client"""
        habit = {
            "id": str(uuid4()),
            "client_id": client_id,
            "trainer_id": trainer_id,
            "habit_name": habit_name,
            "description": description,
            "target_frequency": target_frequency,
            "current_streak": 0,
            "longest_streak": 0,
            "completion_history": [],
            "xp_per_completion": xp_per_completion,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.habits.insert_one(habit)
        return {"success": True, "habit": {k: v for k, v in habit.items() if k != "_id"}}
    
    async def log_habit_completion(self, habit_id: str, client_id: str) -> Dict:
        """Log a habit completion and update streak"""
        habit = await self.db.habits.find_one({"id": habit_id, "client_id": client_id})
        if not habit:
            return {"success": False, "error": "Habit not found"}
        
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        # Check if already completed today
        history = habit.get("completion_history", [])
        if any(h["date"] == today for h in history):
            return {"success": False, "error": "Already completed today"}
        
        # Add completion
        history.append({"date": today, "completed": True})
        
        # Update streak
        current_streak = habit.get("current_streak", 0) + 1
        longest_streak = max(habit.get("longest_streak", 0), current_streak)
        
        await self.db.habits.update_one(
            {"id": habit_id},
            {"$set": {
                "completion_history": history,
                "current_streak": current_streak,
                "longest_streak": longest_streak
            }}
        )
        
        # Award XP
        xp = habit.get("xp_per_completion", 5)
        await self.db.users.update_one(
            {"id": client_id},
            {"$inc": {"total_xp": xp}}
        )
        
        return {
            "success": True,
            "current_streak": current_streak,
            "xp_earned": xp
        }
    
    # ==================== GROUP TRAINING & CHALLENGES ====================
    
    async def create_challenge(
        self,
        trainer_id: str,
        name: str,
        start_date: str,
        end_date: str,
        metric: str,
        description: str = None,
        target_value: float = None,
        entry_fee: float = 0.0,
        prize_description: str = None,
        is_public: bool = False,
        max_participants: int = None
    ) -> Dict:
        """Create a fitness challenge with leaderboard"""
        challenge = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "name": name,
            "description": description,
            "start_date": start_date,
            "end_date": end_date,
            "metric": metric,
            "target_value": target_value,
            "entry_fee": entry_fee,
            "prize_pool": 0.0,
            "prize_description": prize_description,
            "participant_ids": [],
            "leaderboard": [],
            "is_public": is_public,
            "max_participants": max_participants,
            "status": "upcoming",
            "scheduled_posts": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.challenges.insert_one(challenge)
        return {"success": True, "challenge": {k: v for k, v in challenge.items() if k != "_id"}}
    
    async def join_challenge(self, challenge_id: str, client_id: str) -> Dict:
        """Join a challenge"""
        challenge = await self.db.challenges.find_one({"id": challenge_id})
        if not challenge:
            return {"success": False, "error": "Challenge not found"}
        
        if client_id in challenge.get("participant_ids", []):
            return {"success": False, "error": "Already joined"}
        
        if challenge.get("max_participants") and len(challenge.get("participant_ids", [])) >= challenge["max_participants"]:
            return {"success": False, "error": "Challenge is full"}
        
        client = await self.db.users.find_one({"id": client_id}, {"_id": 0})
        
        # Add participant
        participant = {
            "id": str(uuid4()),
            "challenge_id": challenge_id,
            "client_id": client_id,
            "client_name": client.get("name", "Unknown"),
            "joined_at": datetime.now(timezone.utc).isoformat(),
            "current_value": 0.0,
            "rank": len(challenge.get("participant_ids", [])) + 1,
            "daily_progress": [],
            "badges_earned": []
        }
        
        await self.db.challenge_participants.insert_one(participant)
        
        # Update challenge
        await self.db.challenges.update_one(
            {"id": challenge_id},
            {
                "$push": {"participant_ids": client_id},
                "$inc": {"prize_pool": challenge.get("entry_fee", 0)}
            }
        )
        
        return {"success": True, "participant": {k: v for k, v in participant.items() if k != "_id"}}
    
    async def update_challenge_progress(
        self,
        challenge_id: str,
        client_id: str,
        value: float
    ) -> Dict:
        """Update a participant's challenge progress"""
        participant = await self.db.challenge_participants.find_one({
            "challenge_id": challenge_id,
            "client_id": client_id
        })
        if not participant:
            return {"success": False, "error": "Participant not found"}
        
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        daily_progress = participant.get("daily_progress", [])
        
        # Update or add today's progress
        found = False
        for entry in daily_progress:
            if entry["date"] == today:
                entry["value"] = value
                found = True
                break
        
        if not found:
            daily_progress.append({"date": today, "value": value})
        
        # Calculate total
        total_value = sum(e["value"] for e in daily_progress)
        
        await self.db.challenge_participants.update_one(
            {"challenge_id": challenge_id, "client_id": client_id},
            {"$set": {
                "current_value": total_value,
                "daily_progress": daily_progress
            }}
        )
        
        # Update leaderboard
        await self.update_challenge_leaderboard(challenge_id)
        
        return {"success": True, "current_value": total_value}
    
    async def update_challenge_leaderboard(self, challenge_id: str) -> Dict:
        """Update the challenge leaderboard rankings"""
        participants = await self.db.challenge_participants.find(
            {"challenge_id": challenge_id},
            {"_id": 0}
        ).sort("current_value", -1).to_list(1000)
        
        leaderboard = []
        for rank, p in enumerate(participants, 1):
            leaderboard.append({
                "rank": rank,
                "client_id": p["client_id"],
                "client_name": p["client_name"],
                "value": p["current_value"]
            })
            
            # Update participant rank
            await self.db.challenge_participants.update_one(
                {"challenge_id": challenge_id, "client_id": p["client_id"]},
                {"$set": {"rank": rank}}
            )
        
        await self.db.challenges.update_one(
            {"id": challenge_id},
            {"$set": {"leaderboard": leaderboard}}
        )
        
        return {"success": True, "leaderboard": leaderboard}
    
    async def schedule_challenge_post(
        self,
        challenge_id: str,
        trainer_id: str,
        title: str,
        content: str,
        scheduled_datetime: str,
        post_type: str = "announcement"
    ) -> Dict:
        """Schedule a post for a challenge"""
        post = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "target_type": "challenge",
            "target_id": challenge_id,
            "title": title,
            "content": content,
            "post_type": post_type,
            "scheduled_datetime": scheduled_datetime,
            "status": "scheduled",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.scheduled_posts.insert_one(post)
        
        # Add to challenge's scheduled posts
        await self.db.challenges.update_one(
            {"id": challenge_id},
            {"$push": {"scheduled_posts": {"id": post["id"], "scheduled": scheduled_datetime}}}
        )
        
        return {"success": True, "post": {k: v for k, v in post.items() if k != "_id"}}
    
    async def create_group(
        self,
        trainer_id: str,
        name: str,
        description: str = None,
        max_members: int = None
    ) -> Dict:
        """Create a group class"""
        group = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "name": name,
            "description": description,
            "member_ids": [],
            "max_members": max_members,
            "workout_schedule": [],
            "announcements": [],
            "forum_enabled": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.groups.insert_one(group)
        return {"success": True, "group": {k: v for k, v in group.items() if k != "_id"}}
    
    # ==================== CLIENT TRACKING & ANALYTICS ====================
    
    async def log_activity(
        self,
        client_id: str,
        trainer_id: str,
        activity_type: str,
        activity_data: Dict = None
    ) -> Dict:
        """Log a client activity"""
        log = {
            "id": str(uuid4()),
            "client_id": client_id,
            "trainer_id": trainer_id,
            "activity_type": activity_type,
            "activity_data": activity_data or {},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.activity_logs.insert_one(log)
        return {"success": True, "log_id": log["id"]}
    
    async def record_personal_record(
        self,
        client_id: str,
        exercise_name: str,
        pr_type: str,
        value: float,
        unit: str,
        workout_id: str = None
    ) -> Dict:
        """Record a new personal record"""
        # Get previous PR
        previous = await self.db.personal_records.find_one({
            "client_id": client_id,
            "exercise_name": exercise_name,
            "pr_type": pr_type
        }, {"_id": 0}, sort=[("value", -1)])
        
        pr = {
            "id": str(uuid4()),
            "client_id": client_id,
            "exercise_name": exercise_name,
            "pr_type": pr_type,
            "value": value,
            "unit": unit,
            "previous_value": previous["value"] if previous else None,
            "achieved_at": datetime.now(timezone.utc).isoformat(),
            "workout_id": workout_id
        }
        
        await self.db.personal_records.insert_one(pr)
        
        # Send notification if it's a new PR
        if not previous or value > previous["value"]:
            if self.push_service:
                client = await self.db.users.find_one({"id": client_id})
                if client and client.get("trainer_id"):
                    await self.push_service.send_to_user(
                        user_id=client["trainer_id"],
                        title="🏆 New PR!",
                        body=f"{client.get('name', 'Your client')} set a new {exercise_name} PR: {value} {unit}",
                        notification_type="pr"
                    )
        
        return {"success": True, "pr": {k: v for k, v in pr.items() if k != "_id"}, "is_new_pr": not previous or value > previous["value"]}
    
    async def generate_client_report(
        self,
        client_id: str,
        trainer_id: str,
        period: str = "weekly"
    ) -> Dict:
        """Generate a progress report for a client"""
        now = datetime.now(timezone.utc)
        
        if period == "weekly":
            period_start = now - timedelta(days=7)
        elif period == "monthly":
            period_start = now - timedelta(days=30)
        else:
            period_start = now - timedelta(days=7)
        
        # Calculate metrics
        workouts_completed = await self.db.activity_logs.count_documents({
            "client_id": client_id,
            "activity_type": "workout_completed",
            "timestamp": {"$gte": period_start.isoformat()}
        })
        
        tasks_completed = await self.db.client_tasks.count_documents({
            "client_id": client_id,
            "status": "completed",
            "completed_at": {"$gte": period_start.isoformat()}
        })
        
        tasks_total = await self.db.client_tasks.count_documents({
            "client_id": client_id,
            "due_date": {"$gte": period_start.strftime("%Y-%m-%d"), "$lte": now.strftime("%Y-%m-%d")}
        })
        
        # Determine risk level
        risk_level = "low"
        risk_factors = []
        
        if workouts_completed == 0:
            risk_level = "high"
            risk_factors.append("No workouts completed")
        elif workouts_completed < 2:
            risk_level = "medium"
            risk_factors.append("Low workout frequency")
        
        if tasks_total > 0 and (tasks_completed / tasks_total) < 0.5:
            risk_level = "medium" if risk_level == "low" else risk_level
            risk_factors.append("Low task completion rate")
        
        report = {
            "id": str(uuid4()),
            "client_id": client_id,
            "trainer_id": trainer_id,
            "report_period": period,
            "period_start": period_start.isoformat(),
            "period_end": now.isoformat(),
            "metrics": {
                "workouts_completed": workouts_completed,
                "tasks_completed": tasks_completed,
                "tasks_total": tasks_total,
                "task_completion_rate": round(tasks_completed / tasks_total * 100, 1) if tasks_total > 0 else 0
            },
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "generated_at": now.isoformat()
        }
        
        await self.db.progress_reports.insert_one(report)
        
        # Create alert if at-risk
        if risk_level in ["medium", "high", "critical"]:
            await self.create_at_risk_alert(trainer_id, client_id, risk_level, risk_factors)
        
        return {"success": True, "report": {k: v for k, v in report.items() if k != "_id"}}
    
    async def create_at_risk_alert(
        self,
        trainer_id: str,
        client_id: str,
        risk_level: str,
        risk_factors: List[str]
    ) -> Dict:
        """Create an at-risk client alert"""
        client = await self.db.users.find_one({"id": client_id}, {"_id": 0})
        
        recommended_actions = []
        if "No workouts completed" in risk_factors:
            recommended_actions.append("Send a check-in message")
            recommended_actions.append("Schedule a call")
        if "Low task completion rate" in risk_factors:
            recommended_actions.append("Review task difficulty")
            recommended_actions.append("Send reminder")
        
        alert = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "client_id": client_id,
            "client_name": client.get("name", "Unknown") if client else "Unknown",
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "recommended_actions": recommended_actions,
            "is_acknowledged": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.at_risk_alerts.insert_one(alert)
        
        # Notify trainer
        if self.push_service:
            await self.push_service.send_to_user(
                user_id=trainer_id,
                title=f"⚠️ At-Risk Client: {alert['client_name']}",
                body=f"Risk level: {risk_level.upper()}. {risk_factors[0] if risk_factors else 'Check dashboard for details.'}",
                notification_type="alert"
            )
        
        return {"success": True, "alert": {k: v for k, v in alert.items() if k != "_id"}}
    
    async def get_trainer_dashboard_analytics(self, trainer_id: str) -> Dict:
        """Get comprehensive analytics for trainer dashboard"""
        # Get all clients
        clients = await self.db.users.find({"trainer_id": trainer_id}, {"_id": 0}).to_list(500)
        
        # Active clients (activity in last 7 days)
        week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        active_client_ids = await self.db.activity_logs.distinct(
            "client_id",
            {"trainer_id": trainer_id, "timestamp": {"$gte": week_ago}}
        )
        
        # At-risk clients
        at_risk = await self.db.at_risk_alerts.find({
            "trainer_id": trainer_id,
            "is_acknowledged": False
        }, {"_id": 0}).to_list(100)
        
        # Recent PRs
        recent_prs = await self.db.personal_records.find(
            {"client_id": {"$in": [c["id"] for c in clients]}},
            {"_id": 0}
        ).sort("achieved_at", -1).limit(10).to_list(10)
        
        # Upcoming scheduled workouts
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        upcoming_workouts = await self.db.scheduled_workouts.find({
            "trainer_id": trainer_id,
            "scheduled_date": {"$gte": today},
            "status": "scheduled"
        }, {"_id": 0}).sort("scheduled_date", 1).limit(10).to_list(10)
        
        return {
            "total_clients": len(clients),
            "active_clients": len(active_client_ids),
            "inactive_clients": len(clients) - len(active_client_ids),
            "at_risk_alerts": at_risk,
            "at_risk_count": len(at_risk),
            "recent_prs": recent_prs,
            "upcoming_workouts": upcoming_workouts
        }
    
    # ==================== ONBOARDING & PAYMENTS ====================
    
    async def create_onboarding_sequence(
        self,
        trainer_id: str,
        name: str,
        steps: List[Dict],
        description: str = None,
        trigger: str = "signup",
        trigger_package_ids: List[str] = None
    ) -> Dict:
        """Create an automated onboarding sequence"""
        sequence = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "name": name,
            "description": description,
            "steps": steps,
            "trigger": trigger,
            "trigger_package_ids": trigger_package_ids or [],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.onboarding_sequences.insert_one(sequence)
        return {"success": True, "sequence": {k: v for k, v in sequence.items() if k != "_id"}}
    
    async def start_client_onboarding(
        self,
        client_id: str,
        sequence_id: str
    ) -> Dict:
        """Start a client through an onboarding sequence"""
        sequence = await self.db.onboarding_sequences.find_one({"id": sequence_id}, {"_id": 0})
        if not sequence:
            return {"success": False, "error": "Sequence not found"}
        
        progress = {
            "id": str(uuid4()),
            "client_id": client_id,
            "sequence_id": sequence_id,
            "current_step": 0,
            "completed_steps": [],
            "step_responses": {},
            "started_at": datetime.now(timezone.utc).isoformat(),
            "status": "in_progress"
        }
        
        await self.db.onboarding_progress.insert_one(progress)
        
        # Trigger first step
        await self.process_onboarding_step(client_id, sequence_id, 0)
        
        return {"success": True, "progress": {k: v for k, v in progress.items() if k != "_id"}}
    
    async def process_onboarding_step(
        self,
        client_id: str,
        sequence_id: str,
        step_index: int
    ) -> Dict:
        """Process an onboarding step"""
        sequence = await self.db.onboarding_sequences.find_one({"id": sequence_id}, {"_id": 0})
        if not sequence or step_index >= len(sequence.get("steps", [])):
            return {"success": False, "error": "Invalid step"}
        
        step = sequence["steps"][step_index]
        client = await self.db.users.find_one({"id": client_id}, {"_id": 0})
        
        # Process based on step type
        if step.get("type") == "welcome_message":
            if self.push_service:
                await self.push_service.send_to_user(
                    user_id=client_id,
                    title=step.get("title", "Welcome!"),
                    body=step.get("content", {}).get("message", "Welcome to your fitness journey!"),
                    notification_type="onboarding"
                )
        
        elif step.get("type") == "program_assignment":
            if step.get("content", {}).get("template_id"):
                await self.assign_program_to_client(
                    trainer_id=sequence.get("trainer_id"),
                    client_id=client_id,
                    template_id=step["content"]["template_id"]
                )
        
        elif step.get("type") == "intake_form":
            # Create task for intake form
            await self.db.client_tasks.insert_one({
                "id": str(uuid4()),
                "client_id": client_id,
                "trainer_id": sequence.get("trainer_id"),
                "task_template_id": None,
                "task_name": step.get("title", "Complete Intake Form"),
                "task_type": "custom",
                "due_date": (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d"),
                "status": "pending",
                "xp_reward": 50,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        return {"success": True, "step_processed": step_index}
    
    async def create_payment_sequence(
        self,
        trainer_id: str,
        name: str,
        package_id: str,
        package_name: str,
        package_price: float,
        follow_up_schedule: List[Dict]
    ) -> Dict:
        """Create an automated payment follow-up sequence"""
        sequence = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "name": name,
            "package_id": package_id,
            "package_name": package_name,
            "package_price": package_price,
            "follow_up_schedule": follow_up_schedule,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.payment_sequences.insert_one(sequence)
        return {"success": True, "sequence": {k: v for k, v in sequence.items() if k != "_id"}}
    
    async def start_payment_follow_up(
        self,
        sequence_id: str,
        client_id: str,
        client_name: str,
        client_email: str
    ) -> Dict:
        """Start a payment follow-up sequence for a potential client"""
        sequence = await self.db.payment_sequences.find_one({"id": sequence_id}, {"_id": 0})
        if not sequence:
            return {"success": False, "error": "Sequence not found"}
        
        follow_up = {
            "id": str(uuid4()),
            "sequence_id": sequence_id,
            "client_id": client_id,
            "client_name": client_name,
            "client_email": client_email,
            "package_id": sequence["package_id"],
            "current_step": 0,
            "messages_sent": [],
            "status": "active",
            "started_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.payment_follow_ups.insert_one(follow_up)
        return {"success": True, "follow_up": {k: v for k, v in follow_up.items() if k != "_id"}}


def create_coaching_service(db, push_service=None, ai_service=None):
    """Factory function to create the coaching automation service"""
    return CoachingAutomationService(db, push_service, ai_service)
