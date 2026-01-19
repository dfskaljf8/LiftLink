"""
LiftLink AI Service - Powered by GPT-5.2
Handles workout generation, coaching messages, behavior analysis, automations, and AI chat
With comprehensive prompt injection protection and cost management
"""

import os
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage

# Import security modules
from security_middleware import (
    PromptInjectionProtector,
    InputSanitizer,
    rate_limiter,
    audit_logger
)

# Get API key
EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')

# AI Response Cache for cost management
class AIResponseCache:
    """Simple cache for common AI responses to reduce API costs"""
    
    def __init__(self, ttl_minutes: int = 60):
        self._cache: Dict[str, Dict] = {}
        self.ttl_minutes = ttl_minutes
    
    def _generate_key(self, prompt_type: str, params: Dict) -> str:
        """Generate cache key from parameters"""
        import hashlib
        key_data = f"{prompt_type}:{json.dumps(params, sort_keys=True)}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def get(self, prompt_type: str, params: Dict) -> Optional[Dict]:
        """Get cached response if available and not expired"""
        key = self._generate_key(prompt_type, params)
        cached = self._cache.get(key)
        
        if cached:
            expiry = datetime.fromisoformat(cached["expires_at"])
            if datetime.now() < expiry:
                return cached["response"]
            else:
                del self._cache[key]
        return None
    
    def set(self, prompt_type: str, params: Dict, response: Dict):
        """Cache a response"""
        key = self._generate_key(prompt_type, params)
        self._cache[key] = {
            "response": response,
            "expires_at": (datetime.now() + timedelta(minutes=self.ttl_minutes)).isoformat()
        }


ai_cache = AIResponseCache()


class LiftLinkAI:
    """AI-powered coaching and workout generation service with security protections"""
    
    def __init__(self):
        self.api_key = EMERGENT_KEY
        if not self.api_key:
            print("⚠️ EMERGENT_LLM_KEY not found - AI features will be limited")
        
        # Rate limiting for AI requests (20/hour per user)
        self.user_request_counts: Dict[str, List[datetime]] = {}
        self.max_requests_per_hour = 20
    
    def _check_rate_limit(self, user_id: str) -> bool:
        """Check if user has exceeded AI rate limit"""
        now = datetime.now()
        hour_ago = now - timedelta(hours=1)
        
        # Clean old requests
        if user_id in self.user_request_counts:
            self.user_request_counts[user_id] = [
                t for t in self.user_request_counts[user_id] if t > hour_ago
            ]
        else:
            self.user_request_counts[user_id] = []
        
        return len(self.user_request_counts[user_id]) < self.max_requests_per_hour
    
    def _record_request(self, user_id: str):
        """Record an AI request for rate limiting"""
        if user_id not in self.user_request_counts:
            self.user_request_counts[user_id] = []
        self.user_request_counts[user_id].append(datetime.now())
    
    def _create_chat(self, session_id: str, system_message: str) -> LlmChat:
        """Create a new LLM chat instance with GPT-5.2"""
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=system_message
        )
        # Use GPT-5.2 (latest model)
        chat.with_model("openai", "gpt-5.2")
        return chat
    
    def _sanitize_user_input(self, text: str, input_type: str = "user_message") -> tuple[str, bool]:
        """
        Sanitize user input for prompt injection protection
        Returns (sanitized_text, is_safe)
        """
        # Check for injection attempts
        is_safe, reason = PromptInjectionProtector.check_for_injection(text)
        if not is_safe:
            audit_logger.log_security_event(
                "prompt_injection_attempt",
                "unknown",
                f"Blocked: {reason}",
                "warning"
            )
            return "", False
        
        # Sanitize the input
        sanitized = PromptInjectionProtector.sanitize_for_llm(text, input_type)
        sanitized = InputSanitizer.sanitize_string(sanitized)
        
        return sanitized, True
    
    # ==================== AI CHAT ENDPOINT ====================
    
    async def chat(
        self,
        user_id: str,
        message: str,
        conversation_history: List[Dict] = None,
        context: Dict = None
    ) -> Dict:
        """
        General AI chat for coaching advice and fitness questions
        """
        # Rate limit check
        if not self._check_rate_limit(user_id):
            return {
                "success": False,
                "error": "Rate limit exceeded. Maximum 20 AI requests per hour.",
                "retry_after": 3600
            }
        
        # Sanitize input
        safe_message, is_safe = self._sanitize_user_input(message, "user_message")
        if not is_safe:
            return {
                "success": False,
                "error": "Invalid input detected. Please rephrase your message."
            }
        
        system_message = """You are LiftLink AI, a knowledgeable and supportive fitness coach assistant.
You help users with:
- Workout advice and exercise form tips
- Nutrition guidance (general, not medical advice)
- Motivation and mindset coaching
- Progress tracking insights
- Recovery and rest recommendations

Rules:
- Be encouraging but realistic
- Give actionable advice
- Acknowledge limitations (refer to medical professionals when needed)
- Keep responses concise (under 200 words unless detailed explanation needed)
- Never provide medical diagnoses or prescribe treatments
- Focus on evidence-based fitness information

Respond naturally and conversationally."""

        try:
            chat = self._create_chat(
                session_id=f"chat_{user_id}_{datetime.now().timestamp()}",
                system_message=system_message
            )
            
            # Build context-aware prompt
            prompt_parts = []
            
            if context:
                if context.get("user_goal"):
                    prompt_parts.append(f"User's fitness goal: {context['user_goal']}")
                if context.get("experience_level"):
                    prompt_parts.append(f"Experience level: {context['experience_level']}")
                if context.get("recent_workouts"):
                    prompt_parts.append(f"Recent activity: {context['recent_workouts']} workouts this week")
            
            if prompt_parts:
                context_str = "\n".join(prompt_parts)
                full_prompt = f"Context:\n{context_str}\n\nUser question: {safe_message}"
            else:
                full_prompt = safe_message
            
            response = await chat.send_message(UserMessage(text=full_prompt))
            
            self._record_request(user_id)
            
            return {
                "success": True,
                "response": response,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ AI Chat error: {e}")
            return {
                "success": False,
                "error": "AI service temporarily unavailable. Please try again."
            }
    
    # ==================== WORKOUT GENERATION ====================
    
    async def generate_workout_program(
        self,
        trainer_style: Dict,
        client_profile: Dict,
        duration_weeks: int = 4,
        user_id: str = None
    ) -> Dict:
        """
        Generate a personalized workout program based on trainer style and client needs
        With caching and rate limiting for cost management
        """
        # Rate limit check
        if user_id and not self._check_rate_limit(user_id):
            return {
                "success": False,
                "error": "Rate limit exceeded. Maximum 20 AI requests per hour.",
                "retry_after": 3600
            }
        
        # Check cache first
        cache_params = {
            "approach": trainer_style.get("approach"),
            "goal": client_profile.get("goal"),
            "experience": client_profile.get("experience"),
            "days_per_week": client_profile.get("days_per_week"),
            "duration_weeks": duration_weeks
        }
        
        cached = ai_cache.get("workout_program", cache_params)
        if cached:
            return cached
        
        # Sanitize inputs
        for key in ["approach", "methods", "session_structure"]:
            if key in trainer_style and isinstance(trainer_style[key], str):
                trainer_style[key], _ = self._sanitize_user_input(trainer_style[key], "workout_notes")
        
        for key in ["goal", "limitations"]:
            if key in client_profile and isinstance(client_profile[key], str):
                client_profile[key], _ = self._sanitize_user_input(client_profile[key], "workout_notes")
        
        system_message = """You are an expert fitness program designer for LiftLink. 
You create science-backed, progressive workout programs that are:
- Personalized to the client's goals, fitness level, and available time
- Aligned with the trainer's coaching style and methodology
- Progressive with appropriate volume and intensity increases
- Practical and sustainable for real-world adherence

Always respond with valid JSON only, no markdown or explanation."""

        prompt = f"""Create a {duration_weeks}-week workout program.

TRAINER STYLE:
- Coaching approach: {trainer_style.get('approach', 'balanced')}
- Preferred methods: {trainer_style.get('methods', ['strength', 'conditioning'])}
- Session structure: {trainer_style.get('session_structure', 'warm-up, main work, cool-down')}
- Sample exercises they use: {trainer_style.get('sample_exercises', [])}

CLIENT PROFILE:
- Goal: {client_profile.get('goal', 'general fitness')}
- Experience level: {client_profile.get('experience', 'beginner')}
- Available days per week: {client_profile.get('days_per_week', 3)}
- Session duration: {client_profile.get('session_duration', 45)} minutes
- Equipment: {client_profile.get('equipment', ['bodyweight'])}
- Injuries/limitations: {client_profile.get('limitations', 'none')}
- Vibe preference: {client_profile.get('vibe', 'soft_grind')}

Generate a complete program in this JSON format:
{{
    "program_name": "string",
    "description": "string",
    "weeks": [
        {{
            "week_number": 1,
            "focus": "string",
            "days": [
                {{
                    "day_number": 1,
                    "name": "string",
                    "focus": "string",
                    "warmup": [
                        {{"exercise": "string", "duration": "string"}}
                    ],
                    "main_work": [
                        {{
                            "exercise": "string",
                            "sets": 3,
                            "reps": "8-10",
                            "rest": "60s",
                            "notes": "string"
                        }}
                    ],
                    "cooldown": [
                        {{"exercise": "string", "duration": "string"}}
                    ],
                    "estimated_duration": 45
                }}
            ]
        }}
    ],
    "progression_notes": "string",
    "adaptation_triggers": ["string"]
}}"""

        try:
            chat = self._create_chat(
                session_id=f"workout_gen_{datetime.now().timestamp()}",
                system_message=system_message
            )
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            # Parse JSON response
            program = json.loads(response)
            program['generated_at'] = datetime.now().isoformat()
            program['ai_generated'] = True
            
            result = {
                'success': True,
                'program': program
            }
            
            # Cache the result
            ai_cache.set("workout_program", cache_params, result)
            
            if user_id:
                self._record_request(user_id)
            
            return result
            
        except json.JSONDecodeError as e:
            print(f"❌ AI response parsing error: {e}")
            return {
                'success': False,
                'error': 'Failed to parse AI response',
                'raw_response': response if 'response' in dir() else None
            }
        except Exception as e:
            print(f"❌ Workout generation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== COACHING MESSAGES ====================
    
    async def generate_coaching_message(
        self,
        trigger: str,
        client_data: Dict,
        trainer_tone: str = "supportive",
        user_id: str = None
    ) -> Dict:
        """
        Generate personalized coaching messages based on behavior triggers
        """
        # Rate limit check
        if user_id and not self._check_rate_limit(user_id):
            return {
                "success": False,
                "error": "Rate limit exceeded.",
                "retry_after": 3600
            }
        
        # Sanitize client data
        safe_client_data = {}
        for key, value in client_data.items():
            if isinstance(value, str):
                safe_value, _ = self._sanitize_user_input(value, "content_notes")
                safe_client_data[key] = safe_value
            else:
                safe_client_data[key] = value
        
        tone_descriptions = {
            "dog_mode": "intense, no-excuses, drill-sergeant energy but still respectful",
            "soft_grind": "encouraging, understanding, focused on sustainable progress",
            "easy_restart": "gentle, compassionate, celebrating small wins"
        }
        
        system_message = f"""You are a fitness coach sending a personalized message to your client.
Your tone is: {tone_descriptions.get(trainer_tone, tone_descriptions['soft_grind'])}

Keep messages:
- Concise (2-4 sentences max)
- Personal (use their name)
- Action-oriented (give them one clear next step)
- Authentic (not generic motivational fluff)

Respond with JSON only: {{"message": "your message", "suggested_action": "one specific action"}}"""

        trigger_contexts = {
            "missed_workout": f"Client {safe_client_data.get('name', 'there')} has missed {safe_client_data.get('missed_count', 2)} workouts.",
            "streak_achieved": f"Client {safe_client_data.get('name', 'there')} just hit a {safe_client_data.get('streak_days', 7)}-day streak!",
            "low_energy": f"Client {safe_client_data.get('name', 'there')} reported low energy today.",
            "pr_achieved": f"Client {safe_client_data.get('name', 'there')} just hit a PR! {safe_client_data.get('pr_details', 'New personal best')}.",
            "weekly_checkin": f"Weekly check-in for {safe_client_data.get('name', 'there')}.",
            "motivation_needed": f"Client {safe_client_data.get('name', 'there')} needs motivation."
        }
        
        context = trigger_contexts.get(trigger, f"General message for {safe_client_data.get('name', 'client')}")
        
        prompt = f"""Generate a coaching message for this situation:

{context}

Client's vibe preference: {safe_client_data.get('vibe', 'soft_grind')}
Client's current goal: {safe_client_data.get('goal', 'general fitness')}"""

        try:
            chat = self._create_chat(
                session_id=f"coaching_msg_{datetime.now().timestamp()}",
                system_message=system_message
            )
            
            response = await chat.send_message(UserMessage(text=prompt))
            result = json.loads(response)
            
            if user_id:
                self._record_request(user_id)
            
            return {
                'success': True,
                'trigger': trigger,
                'message': result.get('message', ''),
                'suggested_action': result.get('suggested_action', ''),
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Coaching message error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== WORKOUT ADAPTATION ====================
    
    async def adapt_workout(
        self,
        original_workout: Dict,
        adaptation_reason: str,
        client_state: Dict,
        user_id: str = None
    ) -> Dict:
        """
        Adapt a workout based on client's current state
        """
        if user_id and not self._check_rate_limit(user_id):
            return {
                "success": False,
                "error": "Rate limit exceeded.",
                "retry_after": 3600
            }
        
        system_message = """You are an expert at modifying workouts on-the-fly to match client needs.
Your adaptations should:
- Maintain the workout's intent while adjusting intensity/volume
- Be practical and immediately applicable
- Respect the client's current physical and mental state

Respond with JSON only."""

        prompt = f"""Adapt this workout based on the client's current state.

ORIGINAL WORKOUT:
{json.dumps(original_workout, indent=2)}

ADAPTATION REASON: {adaptation_reason}

CLIENT STATE:
- Energy level: {client_state.get('energy', 3)}/5
- Available time: {client_state.get('available_time', 30)} minutes
- Mood: {client_state.get('mood', 'neutral')}
- Sleep last night: {client_state.get('sleep_hours', 7)} hours
- Stress level: {client_state.get('stress', 3)}/5
- Any pain/discomfort: {client_state.get('pain_areas', 'none')}

Provide adapted workout in this format:
{{
    "adapted_workout": {{
        "name": "string",
        "exercises": [...],
        "estimated_duration": number,
        "intensity_adjustment": "reduced/maintained/increased",
        "adaptation_notes": "string"
    }},
    "coach_note": "Brief explanation for the client"
}}"""

        try:
            chat = self._create_chat(
                session_id=f"adapt_{datetime.now().timestamp()}",
                system_message=system_message
            )
            
            response = await chat.send_message(UserMessage(text=prompt))
            result = json.loads(response)
            
            if user_id:
                self._record_request(user_id)
            
            return {
                'success': True,
                'original_workout': original_workout,
                'adapted_workout': result.get('adapted_workout', {}),
                'coach_note': result.get('coach_note', ''),
                'adaptation_reason': adaptation_reason,
                'adapted_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Workout adaptation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== PROGRESS ANALYSIS ====================
    
    async def analyze_progress(
        self,
        user_id: str,
        workout_history: List[Dict],
        measurements: List[Dict] = None,
        goals: Dict = None
    ) -> Dict:
        """
        Analyze user's fitness progress and provide insights
        """
        if not self._check_rate_limit(user_id):
            return {
                "success": False,
                "error": "Rate limit exceeded.",
                "retry_after": 3600
            }
        
        system_message = """You are a fitness data analyst providing progress insights.
Focus on:
- Positive trends and achievements
- Areas for improvement
- Specific, actionable recommendations
- Realistic goal adjustments if needed

Be encouraging but honest. Respond with JSON only."""

        # Summarize data for prompt
        workout_summary = {
            "total_workouts": len(workout_history),
            "this_week": len([w for w in workout_history if w.get("date", "")[:10] >= (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")]),
            "workout_types": list(set(w.get("type", "general") for w in workout_history[-20:])),
        }
        
        prompt = f"""Analyze this user's fitness progress:

WORKOUT SUMMARY:
- Total workouts logged: {workout_summary['total_workouts']}
- This week: {workout_summary['this_week']}
- Workout types: {workout_summary['workout_types']}

USER GOALS:
{json.dumps(goals, indent=2) if goals else 'General fitness improvement'}

RECENT MEASUREMENTS:
{json.dumps(measurements[-5:] if measurements else [], indent=2)}

Provide analysis in this format:
{{
    "progress_score": 0-100,
    "highlights": ["string"],
    "areas_for_improvement": ["string"],
    "recommendations": [
        {{"action": "string", "priority": "high/medium/low", "reason": "string"}}
    ],
    "goal_status": "on_track/ahead/behind",
    "motivational_note": "string"
}}"""

        try:
            chat = self._create_chat(
                session_id=f"progress_{user_id}_{datetime.now().timestamp()}",
                system_message=system_message
            )
            
            response = await chat.send_message(UserMessage(text=prompt))
            result = json.loads(response)
            
            self._record_request(user_id)
            
            return {
                'success': True,
                'analysis': result,
                'analyzed_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Progress analysis error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== PATTERN ANALYSIS ====================
    
    async def analyze_client_patterns(
        self,
        workout_history: List[Dict],
        checkin_history: List[Dict],
        user_id: str = None
    ) -> Dict:
        """
        Analyze client behavior patterns and generate insights/recommendations
        """
        if user_id and not self._check_rate_limit(user_id):
            return {
                "success": False,
                "error": "Rate limit exceeded.",
                "retry_after": 3600
            }
        
        system_message = """You are a fitness data analyst identifying patterns in client behavior.
Focus on actionable insights that can improve adherence and results.
Be specific and data-driven in your observations.

Respond with JSON only."""

        prompt = f"""Analyze this client's patterns and provide insights.

WORKOUT HISTORY (last 30 days):
{json.dumps(workout_history[-30:] if len(workout_history) > 30 else workout_history, indent=2)}

CHECK-IN HISTORY (last 14 days):
{json.dumps(checkin_history[-14:] if len(checkin_history) > 14 else checkin_history, indent=2)}

Provide analysis in this format:
{{
    "patterns_identified": [
        {{
            "pattern": "string",
            "frequency": "string",
            "impact": "positive/negative/neutral"
        }}
    ],
    "skip_patterns": {{
        "common_skip_days": ["Monday", "Friday"],
        "common_skip_times": ["evening"],
        "likely_reasons": ["string"]
    }},
    "energy_patterns": {{
        "best_days": ["Tuesday"],
        "lowest_days": ["Monday"],
        "correlation_notes": "string"
    }},
    "recommendations": [
        {{
            "action": "string",
            "priority": "high/medium/low",
            "expected_impact": "string"
        }}
    ],
    "suggested_schedule_changes": "string"
}}"""

        try:
            chat = self._create_chat(
                session_id=f"analyze_{datetime.now().timestamp()}",
                system_message=system_message
            )
            
            response = await chat.send_message(UserMessage(text=prompt))
            result = json.loads(response)
            
            if user_id:
                self._record_request(user_id)
            
            return {
                'success': True,
                'analysis': result,
                'analyzed_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Pattern analysis error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    # ==================== CONTENT GENERATION ====================
    
    async def generate_content(
        self,
        trainer_notes: str,
        content_type: str = "tip",
        user_id: str = None
    ) -> Dict:
        """
        Transform trainer notes/ideas into polished content
        """
        if user_id and not self._check_rate_limit(user_id):
            return {
                "success": False,
                "error": "Rate limit exceeded.",
                "retry_after": 3600
            }
        
        # Sanitize input
        safe_notes, is_safe = self._sanitize_user_input(trainer_notes, "content_notes")
        if not is_safe:
            return {
                "success": False,
                "error": "Invalid input detected."
            }
        
        system_message = """You are a fitness content writer helping coaches create engaging content.
Your content should be:
- Professional but approachable
- Evidence-informed
- Action-oriented
- Suitable for social media or in-app delivery

Respond with JSON only."""

        type_instructions = {
            "tip": "Create a concise, actionable fitness tip (2-3 sentences)",
            "program_description": "Write a compelling program description that sells the benefits",
            "workout_intro": "Write an engaging intro for a workout that sets expectations",
            "motivation_post": "Create an authentic motivational message (not generic)"
        }

        prompt = f"""Transform these trainer notes into polished content.

TRAINER NOTES:
{safe_notes}

CONTENT TYPE: {content_type}
INSTRUCTIONS: {type_instructions.get(content_type, type_instructions['tip'])}

Provide content in this format:
{{
    "content": "string",
    "headline": "string (if applicable)",
    "hashtags": ["string"],
    "best_posting_time": "string"
}}"""

        try:
            chat = self._create_chat(
                session_id=f"content_{datetime.now().timestamp()}",
                system_message=system_message
            )
            
            response = await chat.send_message(UserMessage(text=prompt))
            result = json.loads(response)
            
            if user_id:
                self._record_request(user_id)
            
            return {
                'success': True,
                'content_type': content_type,
                'generated_content': result,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Content generation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    # Alias for backward compatibility
    async def generate_content_from_notes(self, trainer_notes: str, content_type: str = "tip") -> Dict:
        return await self.generate_content(trainer_notes, content_type)


# Singleton instance
liftlink_ai = LiftLinkAI()
