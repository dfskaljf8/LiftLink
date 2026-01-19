"""
LiftLink AI Agent Engine - The Brain of the Platform
Powers all intelligent features: client monitoring, suggestions, onboarding, program generation
AI suggests, trainers approve - human-in-the-loop architecture
"""

import os
import json
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
from uuid import uuid4
from enum import Enum
from dotenv import load_dotenv

load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage

# Import security modules
from security_middleware import (
    PromptInjectionProtector,
    InputSanitizer,
    audit_logger
)

EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')


class SuggestionType(str, Enum):
    """Types of AI suggestions"""
    MESSAGE = "message"  # AI suggests sending a message
    WORKOUT_CHANGE = "workout_change"  # AI suggests modifying workout
    PROGRAM_ADJUSTMENT = "program_adjustment"  # AI suggests program changes
    CHECK_IN = "check_in"  # AI suggests checking in with client
    CELEBRATION = "celebration"  # AI suggests celebrating achievement
    INTERVENTION = "intervention"  # AI suggests intervention for at-risk client
    SCHEDULE_CHANGE = "schedule_change"  # AI suggests rescheduling
    NUTRITION_TIP = "nutrition_tip"  # AI suggests nutrition advice
    RECOVERY_RECOMMENDATION = "recovery_recommendation"  # AI suggests recovery


class SuggestionPriority(str, Enum):
    """Priority levels for suggestions"""
    CRITICAL = "critical"  # Needs immediate attention (injury risk, long absence)
    HIGH = "high"  # Important (missed workouts, declining engagement)
    MEDIUM = "medium"  # Standard (weekly check-ins, progress updates)
    LOW = "low"  # Nice to have (celebrations, tips)


class SuggestionStatus(str, Enum):
    """Status of AI suggestions"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"
    AUTO_SENT = "auto_sent"  # For low-priority auto-approved items


class AIAgentEngine:
    """
    The AI Agent Engine - Brain of LiftLink
    
    Capabilities:
    - Monitors all clients continuously
    - Analyzes patterns and behaviors
    - Generates intelligent suggestions
    - Powers conversational onboarding
    - Creates and adapts programs
    - Drafts personalized messages
    
    All suggestions go to trainers for approval (human-in-the-loop)
    """
    
    def __init__(self, db=None):
        self.db = db
        self.api_key = EMERGENT_KEY
        if not self.api_key:
            print("⚠️ EMERGENT_LLM_KEY not found - AI Agent will be limited")
    
    def set_db(self, db):
        """Set database connection"""
        self.db = db
    
    def _create_chat(self, session_id: str, system_message: str) -> LlmChat:
        """Create a new LLM chat instance with GPT-5.2"""
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=system_message
        )
        chat.with_model("openai", "gpt-5.2")
        return chat
    
    # ==================== CLIENT MONITORING ====================
    
    async def analyze_client(self, client_id: str, trainer_id: str) -> Dict:
        """
        Deep analysis of a single client's patterns, behaviors, and needs
        Returns insights and generates suggestions
        """
        if self.db is None:
            return {"error": "Database not connected"}
        
        # Gather client data
        client = await self.db.users.find_one({"id": client_id}, {"_id": 0})
        if not client:
            return {"error": "Client not found"}
        
        # Get workout history (last 30 days)
        thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        workouts = await self.db.sessions.find({
            "user_id": client_id,
            "created_at": {"$gte": thirty_days_ago}
        }, {"_id": 0}).to_list(100)
        
        # Get check-ins
        checkins = await self.db.checkins.find({
            "client_id": client_id,
            "created_at": {"$gte": thirty_days_ago}
        }, {"_id": 0}).to_list(50)
        
        # Get scheduled workouts
        scheduled = await self.db.scheduled_workouts.find({
            "client_id": client_id,
            "status": {"$in": ["pending", "completed", "missed"]}
        }, {"_id": 0}).to_list(50)
        
        # Calculate metrics
        completed_count = len([w for w in workouts if w.get("status") == "completed"])
        missed_count = len([s for s in scheduled if s.get("status") == "missed"])
        total_scheduled = len(scheduled)
        
        adherence_rate = (completed_count / total_scheduled * 100) if total_scheduled > 0 else 0
        
        # Analyze energy levels from check-ins
        energy_levels = [c.get("energy_level", 3) for c in checkins if c.get("energy_level")]
        avg_energy = sum(energy_levels) / len(energy_levels) if energy_levels else 3
        
        # Days since last workout
        last_workout = workouts[0] if workouts else None
        days_since_workout = 0
        if last_workout:
            last_date = datetime.fromisoformat(last_workout.get("created_at", "").replace("Z", "+00:00"))
            days_since_workout = (datetime.now(timezone.utc) - last_date).days
        
        # Build analysis
        analysis = {
            "client_id": client_id,
            "client_name": client.get("name", "Unknown"),
            "trainer_id": trainer_id,
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
            "metrics": {
                "workouts_completed": completed_count,
                "workouts_missed": missed_count,
                "adherence_rate": round(adherence_rate, 1),
                "avg_energy_level": round(avg_energy, 1),
                "days_since_last_workout": days_since_workout,
                "total_checkins": len(checkins),
                "current_streak": self._calculate_streak(workouts),
            },
            "patterns": [],
            "risk_factors": [],
            "opportunities": [],
            "suggestions": []
        }
        
        # Identify patterns and generate suggestions
        suggestions = await self._generate_client_suggestions(analysis, client, workouts, checkins)
        analysis["suggestions"] = suggestions
        
        # Store analysis
        await self.db.ai_client_analysis.update_one(
            {"client_id": client_id},
            {"$set": analysis},
            upsert=True
        )
        
        return analysis
    
    def _calculate_streak(self, workouts: List[Dict]) -> int:
        """Calculate current workout streak"""
        if not workouts:
            return 0
        
        streak = 0
        today = datetime.now(timezone.utc).date()
        
        for workout in sorted(workouts, key=lambda x: x.get("created_at", ""), reverse=True):
            workout_date = datetime.fromisoformat(
                workout.get("created_at", "").replace("Z", "+00:00")
            ).date()
            
            expected_date = today - timedelta(days=streak)
            
            if workout_date == expected_date or workout_date == expected_date - timedelta(days=1):
                streak += 1
            else:
                break
        
        return streak
    
    async def _generate_client_suggestions(
        self,
        analysis: Dict,
        client: Dict,
        workouts: List[Dict],
        checkins: List[Dict]
    ) -> List[Dict]:
        """Generate AI suggestions based on client analysis"""
        suggestions = []
        metrics = analysis["metrics"]
        
        # Rule-based suggestions (fast, no AI needed)
        
        # 1. Long absence - high priority
        if metrics["days_since_last_workout"] >= 5:
            suggestions.append(await self._create_suggestion(
                trainer_id=analysis["trainer_id"],
                client_id=analysis["client_id"],
                suggestion_type=SuggestionType.CHECK_IN,
                priority=SuggestionPriority.HIGH if metrics["days_since_last_workout"] >= 7 else SuggestionPriority.MEDIUM,
                title=f"Check in with {analysis['client_name']}",
                reason=f"No workout logged in {metrics['days_since_last_workout']} days",
                suggested_action="Send a supportive check-in message",
                auto_generate_message=True,
                context={"days_absent": metrics["days_since_last_workout"]}
            ))
        
        # 2. Low adherence - intervention needed
        if metrics["adherence_rate"] < 50 and metrics["workouts_missed"] >= 3:
            suggestions.append(await self._create_suggestion(
                trainer_id=analysis["trainer_id"],
                client_id=analysis["client_id"],
                suggestion_type=SuggestionType.INTERVENTION,
                priority=SuggestionPriority.HIGH,
                title=f"Intervention needed for {analysis['client_name']}",
                reason=f"Adherence rate dropped to {metrics['adherence_rate']}%",
                suggested_action="Schedule a call to discuss barriers and adjust program",
                auto_generate_message=True,
                context={"adherence_rate": metrics["adherence_rate"], "missed": metrics["workouts_missed"]}
            ))
        
        # 3. Low energy pattern
        if metrics["avg_energy_level"] < 2.5:
            suggestions.append(await self._create_suggestion(
                trainer_id=analysis["trainer_id"],
                client_id=analysis["client_id"],
                suggestion_type=SuggestionType.RECOVERY_RECOMMENDATION,
                priority=SuggestionPriority.MEDIUM,
                title=f"Energy concerns for {analysis['client_name']}",
                reason=f"Average energy level is {metrics['avg_energy_level']}/5",
                suggested_action="Suggest recovery focus or check sleep/nutrition",
                auto_generate_message=True,
                context={"avg_energy": metrics["avg_energy_level"]}
            ))
        
        # 4. Streak celebration
        if metrics["current_streak"] >= 7:
            suggestions.append(await self._create_suggestion(
                trainer_id=analysis["trainer_id"],
                client_id=analysis["client_id"],
                suggestion_type=SuggestionType.CELEBRATION,
                priority=SuggestionPriority.LOW,
                title=f"Celebrate {analysis['client_name']}'s streak!",
                reason=f"{metrics['current_streak']}-day workout streak achieved",
                suggested_action="Send congratulations message",
                auto_generate_message=True,
                context={"streak_days": metrics["current_streak"]}
            ))
        
        # 5. High adherence - program progression
        if metrics["adherence_rate"] >= 85 and metrics["workouts_completed"] >= 10:
            suggestions.append(await self._create_suggestion(
                trainer_id=analysis["trainer_id"],
                client_id=analysis["client_id"],
                suggestion_type=SuggestionType.PROGRAM_ADJUSTMENT,
                priority=SuggestionPriority.MEDIUM,
                title=f"Progress {analysis['client_name']}'s program",
                reason=f"High adherence ({metrics['adherence_rate']}%) - ready for progression",
                suggested_action="Increase intensity or add new exercises",
                auto_generate_message=False,
                context={"adherence_rate": metrics["adherence_rate"]}
            ))
        
        return suggestions
    
    async def _create_suggestion(
        self,
        trainer_id: str,
        client_id: str,
        suggestion_type: SuggestionType,
        priority: SuggestionPriority,
        title: str,
        reason: str,
        suggested_action: str,
        auto_generate_message: bool = False,
        context: Dict = None
    ) -> Dict:
        """Create and store an AI suggestion"""
        suggestion = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "client_id": client_id,
            "type": suggestion_type.value,
            "priority": priority.value,
            "title": title,
            "reason": reason,
            "suggested_action": suggested_action,
            "status": SuggestionStatus.PENDING.value,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=3)).isoformat(),
            "context": context or {},
            "ai_generated_content": None
        }
        
        # Auto-generate message content if requested
        if auto_generate_message:
            message = await self._generate_suggestion_message(suggestion)
            suggestion["ai_generated_content"] = message
        
        # Store suggestion
        if self.db:
            await self.db.ai_suggestions.insert_one({**suggestion, "_id": suggestion["id"]})
        
        return suggestion
    
    async def _generate_suggestion_message(self, suggestion: Dict) -> Dict:
        """Generate AI message content for a suggestion"""
        system_message = """You are a fitness coach assistant helping trainers communicate with clients.
Generate a personalized, empathetic message based on the situation.
Keep messages concise (2-4 sentences), warm, and action-oriented.
Match the tone to the situation (supportive for struggles, celebratory for wins).
Respond with JSON: {"subject": "brief subject", "message": "the message", "call_to_action": "one specific action"}"""

        prompt = f"""Generate a coaching message for this situation:

Type: {suggestion['type']}
Title: {suggestion['title']}
Reason: {suggestion['reason']}
Context: {json.dumps(suggestion.get('context', {}))}
Suggested action: {suggestion['suggested_action']}"""

        try:
            chat = self._create_chat(
                session_id=f"msg_gen_{suggestion['id']}",
                system_message=system_message
            )
            response = await chat.send_message(UserMessage(text=prompt))
            return json.loads(response)
        except Exception as e:
            print(f"❌ Message generation error: {e}")
            return {
                "subject": suggestion["title"],
                "message": f"Hey! Just wanted to check in with you. {suggestion['suggested_action']}",
                "call_to_action": "Let me know how you're doing!"
            }
    
    # ==================== BATCH CLIENT MONITORING ====================
    
    async def monitor_all_clients(self, trainer_id: str) -> Dict:
        """
        Analyze all clients for a trainer and generate suggestions
        This is the main "autopilot" function
        """
        if self.db is None:
            return {"error": "Database not connected"}
        
        # Get all clients for trainer
        clients = await self.db.users.find({
            "trainer_id": trainer_id,
            "role": "trainee"
        }, {"_id": 0, "id": 1, "name": 1}).to_list(100)
        
        results = {
            "trainer_id": trainer_id,
            "clients_analyzed": 0,
            "suggestions_generated": 0,
            "critical_alerts": 0,
            "high_priority": 0,
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
            "client_summaries": []
        }
        
        for client in clients:
            analysis = await self.analyze_client(client["id"], trainer_id)
            
            if "error" not in analysis:
                results["clients_analyzed"] += 1
                results["suggestions_generated"] += len(analysis.get("suggestions", []))
                
                # Count by priority
                for suggestion in analysis.get("suggestions", []):
                    if suggestion["priority"] == SuggestionPriority.CRITICAL.value:
                        results["critical_alerts"] += 1
                    elif suggestion["priority"] == SuggestionPriority.HIGH.value:
                        results["high_priority"] += 1
                
                results["client_summaries"].append({
                    "client_id": client["id"],
                    "client_name": client.get("name", "Unknown"),
                    "suggestions_count": len(analysis.get("suggestions", [])),
                    "risk_level": "high" if analysis["metrics"]["adherence_rate"] < 50 else "normal"
                })
        
        return results
    
    # ==================== SUGGESTION MANAGEMENT ====================
    
    async def get_pending_suggestions(
        self,
        trainer_id: str,
        limit: int = 20,
        priority_filter: str = None
    ) -> List[Dict]:
        """Get pending AI suggestions for trainer approval"""
        if self.db is None:
            return []
        
        query = {
            "trainer_id": trainer_id,
            "status": SuggestionStatus.PENDING.value
        }
        
        if priority_filter:
            query["priority"] = priority_filter
        
        suggestions = await self.db.ai_suggestions.find(
            query,
            {"_id": 0}
        ).sort([
            ("priority", 1),  # Critical first
            ("created_at", -1)
        ]).limit(limit).to_list(limit)
        
        # Enrich with client names
        for suggestion in suggestions:
            client = await self.db.users.find_one(
                {"id": suggestion["client_id"]},
                {"_id": 0, "name": 1, "profile_image": 1}
            )
            if client:
                suggestion["client_name"] = client.get("name", "Unknown")
                suggestion["client_image"] = client.get("profile_image")
        
        return suggestions
    
    async def approve_suggestion(
        self,
        suggestion_id: str,
        trainer_id: str,
        modifications: Dict = None
    ) -> Dict:
        """Trainer approves an AI suggestion"""
        if self.db is None:
            return {"error": "Database not connected"}
        
        suggestion = await self.db.ai_suggestions.find_one(
            {"id": suggestion_id, "trainer_id": trainer_id},
            {"_id": 0}
        )
        
        if not suggestion:
            return {"error": "Suggestion not found"}
        
        # Apply modifications if any
        final_content = suggestion.get("ai_generated_content", {})
        if modifications:
            final_content.update(modifications)
        
        # Update suggestion status
        await self.db.ai_suggestions.update_one(
            {"id": suggestion_id},
            {
                "$set": {
                    "status": SuggestionStatus.APPROVED.value,
                    "approved_at": datetime.now(timezone.utc).isoformat(),
                    "final_content": final_content,
                    "modifications": modifications
                }
            }
        )
        
        # Execute the suggestion based on type
        result = await self._execute_suggestion(suggestion, final_content)
        
        # Log audit
        audit_logger.log_security_event(
            "ai_suggestion_approved",
            trainer_id,
            f"Approved suggestion {suggestion_id} for client {suggestion['client_id']}",
            "info"
        )
        
        return {
            "success": True,
            "suggestion_id": suggestion_id,
            "executed": result
        }
    
    async def reject_suggestion(
        self,
        suggestion_id: str,
        trainer_id: str,
        reason: str = None
    ) -> Dict:
        """Trainer rejects an AI suggestion"""
        if self.db is None:
            return {"error": "Database not connected"}
        
        result = await self.db.ai_suggestions.update_one(
            {"id": suggestion_id, "trainer_id": trainer_id},
            {
                "$set": {
                    "status": SuggestionStatus.REJECTED.value,
                    "rejected_at": datetime.now(timezone.utc).isoformat(),
                    "rejection_reason": reason
                }
            }
        )
        
        return {
            "success": result.modified_count > 0,
            "suggestion_id": suggestion_id
        }
    
    async def _execute_suggestion(self, suggestion: Dict, content: Dict) -> Dict:
        """Execute an approved suggestion"""
        suggestion_type = suggestion["type"]
        
        if suggestion_type in [SuggestionType.MESSAGE.value, SuggestionType.CHECK_IN.value,
                               SuggestionType.CELEBRATION.value, SuggestionType.INTERVENTION.value,
                               SuggestionType.RECOVERY_RECOMMENDATION.value]:
            # Send message to client
            message = {
                "id": str(uuid4()),
                "from_id": suggestion["trainer_id"],
                "to_id": suggestion["client_id"],
                "subject": content.get("subject", "Message from your coach"),
                "message": content.get("message", ""),
                "type": "ai_generated",
                "suggestion_id": suggestion["id"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "read": False
            }
            
            if self.db:
                await self.db.messages.insert_one({**message, "_id": message["id"]})
            
            return {"type": "message_sent", "message_id": message["id"]}
        
        elif suggestion_type == SuggestionType.PROGRAM_ADJUSTMENT.value:
            # Create program adjustment task
            task = {
                "id": str(uuid4()),
                "trainer_id": suggestion["trainer_id"],
                "client_id": suggestion["client_id"],
                "type": "program_adjustment",
                "description": content.get("message", suggestion["suggested_action"]),
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            if self.db:
                await self.db.trainer_tasks.insert_one({**task, "_id": task["id"]})
            
            return {"type": "task_created", "task_id": task["id"]}
        
        return {"type": "noted", "action": suggestion["suggested_action"]}
    
    # ==================== AI-POWERED ONBOARDING ====================
    
    async def start_onboarding(self, user_id: str, user_name: str) -> Dict:
        """Start AI-powered conversational onboarding"""
        session_id = str(uuid4())
        
        # Create onboarding session
        session = {
            "id": session_id,
            "user_id": user_id,
            "user_name": user_name,
            "status": "active",
            "step": 0,
            "collected_data": {},
            "conversation_history": [],
            "started_at": datetime.now(timezone.utc).isoformat()
        }
        
        if self.db:
            await self.db.ai_onboarding_sessions.insert_one({**session, "_id": session_id})
        
        # Generate first message
        first_message = await self._generate_onboarding_message(session, "start")
        
        session["conversation_history"].append({
            "role": "assistant",
            "content": first_message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        if self.db:
            await self.db.ai_onboarding_sessions.update_one(
                {"id": session_id},
                {"$set": {"conversation_history": session["conversation_history"]}}
            )
        
        return {
            "session_id": session_id,
            "message": first_message,
            "step": 0,
            "complete": False
        }
    
    async def continue_onboarding(
        self,
        session_id: str,
        user_response: str
    ) -> Dict:
        """Continue onboarding conversation based on user response"""
        if self.db is None:
            return {"error": "Database not connected"}
        
        # Sanitize input
        safe_response, is_safe = self._sanitize_input(user_response)
        if not is_safe:
            return {
                "session_id": session_id,
                "message": "I didn't quite catch that. Could you rephrase?",
                "complete": False
            }
        
        # Get session
        session = await self.db.ai_onboarding_sessions.find_one(
            {"id": session_id},
            {"_id": 0}
        )
        
        if not session:
            return {"error": "Session not found"}
        
        # Add user response to history
        session["conversation_history"].append({
            "role": "user",
            "content": safe_response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # Extract data from response
        extracted = await self._extract_onboarding_data(session, safe_response)
        session["collected_data"].update(extracted)
        session["step"] += 1
        
        # Check if onboarding is complete
        required_fields = ["fitness_goal", "experience_level", "days_per_week", "preferred_time"]
        collected_fields = list(session["collected_data"].keys())
        is_complete = all(field in collected_fields for field in required_fields)
        
        if is_complete:
            # Generate completion message
            response_message = await self._generate_onboarding_message(session, "complete")
            session["status"] = "completed"
            session["completed_at"] = datetime.now(timezone.utc).isoformat()
            
            # Update user profile with collected data
            await self.db.users.update_one(
                {"id": session["user_id"]},
                {"$set": {
                    "onboarding_data": session["collected_data"],
                    "fitness_goals": [session["collected_data"].get("fitness_goal")],
                    "experience_level": session["collected_data"].get("experience_level"),
                    "preferred_days": session["collected_data"].get("days_per_week"),
                    "onboarding_completed": True
                }}
            )
        else:
            # Generate next question
            response_message = await self._generate_onboarding_message(session, "continue")
        
        # Add assistant response to history
        session["conversation_history"].append({
            "role": "assistant",
            "content": response_message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # Update session
        await self.db.ai_onboarding_sessions.update_one(
            {"id": session_id},
            {"$set": session}
        )
        
        return {
            "session_id": session_id,
            "message": response_message,
            "step": session["step"],
            "complete": is_complete,
            "collected_data": session["collected_data"] if is_complete else None
        }
    
    async def _generate_onboarding_message(self, session: Dict, phase: str) -> str:
        """Generate onboarding conversation message"""
        system_message = """You are a friendly fitness coach onboarding new clients.
Have a natural conversation to learn about them.
Ask ONE question at a time.
Be warm, encouraging, and personalized.
Keep responses concise (2-3 sentences max).

You need to collect: fitness goal, experience level, available days per week, preferred workout time.
Don't ask directly - have a conversation."""

        if phase == "start":
            return f"Hey {session['user_name']}! 👋 I'm so excited to help you on your fitness journey. Before we match you with the perfect trainer, I'd love to know - what's the main thing you're hoping to achieve with your fitness? Whether it's getting stronger, losing weight, or just feeling better - I'm all ears!"
        
        elif phase == "complete":
            data = session["collected_data"]
            return f"Amazing! I've got a great picture of what you're looking for. Based on everything you've shared - wanting to {data.get('fitness_goal', 'improve fitness')}, with your {data.get('experience_level', 'current')} experience, training {data.get('days_per_week', 'a few')} days a week - I'm going to find you the perfect trainer match. Let's do this! 💪"
        
        else:
            # Generate contextual follow-up
            collected = list(session["collected_data"].keys())
            history = session["conversation_history"][-4:]  # Last 4 messages
            
            context = f"""
Conversation so far: {json.dumps(history)}
Already collected: {collected}
Still need: {[f for f in ['fitness_goal', 'experience_level', 'days_per_week', 'preferred_time'] if f not in collected]}

Generate the next conversational question to collect missing info naturally."""

            try:
                chat = self._create_chat(
                    session_id=f"onboard_{session['id']}",
                    system_message=system_message
                )
                return await chat.send_message(UserMessage(text=context))
            except Exception as e:
                print(f"❌ Onboarding message error: {e}")
                # Fallback questions
                if "experience_level" not in collected:
                    return "That's awesome! How would you describe your current fitness experience? Are you just getting started, been at it for a while, or a seasoned pro?"
                elif "days_per_week" not in collected:
                    return "Great! How many days a week can you realistically commit to working out? No judgment - even 2-3 days can get amazing results!"
                elif "preferred_time" not in collected:
                    return "And when do you prefer to work out? Morning person, lunchtime warrior, or evening exerciser?"
                else:
                    return "Tell me more about what you're looking for!"
    
    async def _extract_onboarding_data(self, session: Dict, response: str) -> Dict:
        """Extract structured data from user's conversational response"""
        system_message = """Extract fitness onboarding data from the user's response.
Return ONLY valid JSON with any of these fields if mentioned:
- fitness_goal: "weight_loss", "muscle_gain", "strength", "endurance", "flexibility", "general_fitness"
- experience_level: "beginner", "intermediate", "advanced"
- days_per_week: number (1-7)
- preferred_time: "morning", "afternoon", "evening", "flexible"

Only include fields that are clearly mentioned. Return {} if nothing relevant found."""

        try:
            chat = self._create_chat(
                session_id=f"extract_{session['id']}_{datetime.now().timestamp()}",
                system_message=system_message
            )
            
            result = await chat.send_message(UserMessage(text=f"User said: {response}"))
            return json.loads(result)
        except:
            # Fallback: simple keyword extraction
            extracted = {}
            response_lower = response.lower()
            
            # Goals
            if any(w in response_lower for w in ["lose weight", "weight loss", "slim", "lean"]):
                extracted["fitness_goal"] = "weight_loss"
            elif any(w in response_lower for w in ["muscle", "bulk", "mass", "bigger"]):
                extracted["fitness_goal"] = "muscle_gain"
            elif any(w in response_lower for w in ["strong", "strength", "power"]):
                extracted["fitness_goal"] = "strength"
            elif any(w in response_lower for w in ["fit", "healthy", "better", "general"]):
                extracted["fitness_goal"] = "general_fitness"
            
            # Experience
            if any(w in response_lower for w in ["beginner", "new", "starting", "never"]):
                extracted["experience_level"] = "beginner"
            elif any(w in response_lower for w in ["intermediate", "some", "while"]):
                extracted["experience_level"] = "intermediate"
            elif any(w in response_lower for w in ["advanced", "years", "experienced"]):
                extracted["experience_level"] = "advanced"
            
            # Days
            for num in ["1", "2", "3", "4", "5", "6", "7", "one", "two", "three", "four", "five", "six", "seven"]:
                if num in response_lower:
                    day_map = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7}
                    extracted["days_per_week"] = day_map.get(num, int(num) if num.isdigit() else None)
                    break
            
            # Time
            if any(w in response_lower for w in ["morning", "am", "early"]):
                extracted["preferred_time"] = "morning"
            elif any(w in response_lower for w in ["afternoon", "lunch", "midday"]):
                extracted["preferred_time"] = "afternoon"
            elif any(w in response_lower for w in ["evening", "night", "pm", "after work"]):
                extracted["preferred_time"] = "evening"
            
            return extracted
    
    # ==================== AI PROGRAM GENERATION ====================
    
    async def generate_program_draft(
        self,
        trainer_id: str,
        client_id: str,
        parameters: Dict = None
    ) -> Dict:
        """Generate a workout program draft for trainer approval"""
        if self.db is None:
            return {"error": "Database not connected"}
        
        # Get client data
        client = await self.db.users.find_one({"id": client_id}, {"_id": 0})
        if not client:
            return {"error": "Client not found"}
        
        # Get trainer style
        trainer = await self.db.users.find_one({"id": trainer_id}, {"_id": 0})
        trainer_style = trainer.get("coaching_style", {}) if trainer else {}
        
        # Default parameters
        params = {
            "duration_weeks": 4,
            "days_per_week": client.get("preferred_days", 3),
            "session_duration": 45,
            "goal": client.get("fitness_goals", ["general_fitness"])[0] if client.get("fitness_goals") else "general_fitness",
            "experience": client.get("experience_level", "beginner"),
            **(parameters or {})
        }
        
        system_message = """You are an expert fitness program designer.
Create personalized, progressive workout programs.
Programs should be practical, science-based, and achievable.
Always respond with valid JSON matching the exact structure requested."""

        prompt = f"""Create a {params['duration_weeks']}-week workout program.

Client: {client.get('name', 'Client')}
Goal: {params['goal']}
Experience: {params['experience']}
Days/week: {params['days_per_week']}
Session length: {params['session_duration']} minutes
Trainer style: {trainer_style.get('approach', 'balanced')}

Return JSON:
{{
    "program_name": "string",
    "description": "string",
    "weeks": [
        {{
            "week_number": 1,
            "theme": "string",
            "days": [
                {{
                    "day": 1,
                    "name": "string (e.g., Push Day)",
                    "exercises": [
                        {{
                            "name": "string",
                            "sets": 3,
                            "reps": "8-10",
                            "rest_seconds": 60,
                            "notes": "string"
                        }}
                    ],
                    "duration_minutes": 45
                }}
            ]
        }}
    ],
    "progression_plan": "string",
    "notes_for_trainer": "string"
}}"""

        try:
            chat = self._create_chat(
                session_id=f"program_{client_id}_{datetime.now().timestamp()}",
                system_message=system_message
            )
            
            response = await chat.send_message(UserMessage(text=prompt))
            program = json.loads(response)
            
            # Create draft
            draft = {
                "id": str(uuid4()),
                "trainer_id": trainer_id,
                "client_id": client_id,
                "client_name": client.get("name", "Unknown"),
                "status": "draft",
                "program": program,
                "parameters": params,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "ai_generated": True
            }
            
            if self.db:
                await self.db.ai_program_drafts.insert_one({**draft, "_id": draft["id"]})
            
            return {
                "success": True,
                "draft_id": draft["id"],
                "program": program
            }
            
        except Exception as e:
            print(f"❌ Program generation error: {e}")
            return {"error": str(e)}
    
    async def approve_program_draft(
        self,
        draft_id: str,
        trainer_id: str,
        modifications: Dict = None
    ) -> Dict:
        """Trainer approves a program draft"""
        if self.db is None:
            return {"error": "Database not connected"}
        
        draft = await self.db.ai_program_drafts.find_one(
            {"id": draft_id, "trainer_id": trainer_id},
            {"_id": 0}
        )
        
        if not draft:
            return {"error": "Draft not found"}
        
        # Apply modifications
        program = draft["program"]
        if modifications:
            program.update(modifications)
        
        # Create actual program
        active_program = {
            "id": str(uuid4()),
            "trainer_id": trainer_id,
            "client_id": draft["client_id"],
            "name": program["program_name"],
            "description": program["description"],
            "weeks": program["weeks"],
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "from_draft": draft_id,
            "ai_generated": True
        }
        
        await self.db.workout_programs.insert_one({**active_program, "_id": active_program["id"]})
        
        # Update draft status
        await self.db.ai_program_drafts.update_one(
            {"id": draft_id},
            {"$set": {"status": "approved", "approved_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        return {
            "success": True,
            "program_id": active_program["id"]
        }
    
    # ==================== UTILITY METHODS ====================
    
    def _sanitize_input(self, text: str) -> tuple:
        """Sanitize user input"""
        is_safe, _ = PromptInjectionProtector.check_for_injection(text)
        if not is_safe:
            return "", False
        
        sanitized = InputSanitizer.sanitize_string(text, max_length=1000)
        return sanitized, True
    
    async def get_agent_stats(self, trainer_id: str) -> Dict:
        """Get AI agent statistics for a trainer"""
        if self.db is None:
            return {}
        
        # Count suggestions
        total_suggestions = await self.db.ai_suggestions.count_documents({"trainer_id": trainer_id})
        pending = await self.db.ai_suggestions.count_documents({
            "trainer_id": trainer_id,
            "status": SuggestionStatus.PENDING.value
        })
        approved = await self.db.ai_suggestions.count_documents({
            "trainer_id": trainer_id,
            "status": SuggestionStatus.APPROVED.value
        })
        
        # Count programs
        programs = await self.db.ai_program_drafts.count_documents({"trainer_id": trainer_id})
        
        return {
            "total_suggestions": total_suggestions,
            "pending_suggestions": pending,
            "approved_suggestions": approved,
            "approval_rate": round(approved / total_suggestions * 100, 1) if total_suggestions > 0 else 0,
            "programs_generated": programs
        }


# Singleton instance
ai_agent = AIAgentEngine()
