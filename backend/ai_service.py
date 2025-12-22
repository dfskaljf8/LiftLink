"""
LiftLink AI Service - Powered by GPT-5
Handles workout generation, coaching messages, behavior analysis, and automations
"""

import os
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage

# Get API key
EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')

class LiftLinkAI:
    """AI-powered coaching and workout generation service"""
    
    def __init__(self):
        self.api_key = EMERGENT_KEY
        if not self.api_key:
            print("⚠️ EMERGENT_LLM_KEY not found - AI features will be limited")
    
    def _create_chat(self, session_id: str, system_message: str) -> LlmChat:
        """Create a new LLM chat instance"""
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=system_message
        )
        chat.with_model("openai", "gpt-5")
        return chat
    
    # ==================== WORKOUT GENERATION ====================
    
    async def generate_workout_program(
        self,
        trainer_style: Dict,
        client_profile: Dict,
        duration_weeks: int = 4
    ) -> Dict:
        """
        Generate a personalized workout program based on trainer style and client needs
        
        Args:
            trainer_style: Trainer's coaching style, preferences, sample workouts
            client_profile: Client's goals, fitness level, available equipment, schedule
            duration_weeks: Program length (default 4 weeks)
        """
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
            
            return {
                'success': True,
                'program': program
            }
            
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
        trainer_tone: str = "supportive"
    ) -> Dict:
        """
        Generate personalized coaching messages based on behavior triggers
        
        Triggers:
        - missed_workout: Client missed 1+ workouts
        - streak_achieved: Client hit a streak milestone
        - low_energy: Client reported low energy
        - pr_achieved: Client hit a personal record
        - weekly_checkin: Regular weekly check-in
        - motivation_needed: General motivation boost
        """
        
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
            "missed_workout": f"Client {client_data.get('name', 'there')} has missed {client_data.get('missed_count', 2)} workouts. Their last workout was {client_data.get('days_since_last', 3)} days ago.",
            "streak_achieved": f"Client {client_data.get('name', 'there')} just hit a {client_data.get('streak_days', 7)}-day streak! They've been consistent with {client_data.get('workout_type', 'their training')}.",
            "low_energy": f"Client {client_data.get('name', 'there')} reported energy level {client_data.get('energy_level', 2)}/5 today. They mentioned: {client_data.get('energy_note', 'feeling tired')}.",
            "pr_achieved": f"Client {client_data.get('name', 'there')} just hit a PR! {client_data.get('pr_details', 'New personal best')}.",
            "weekly_checkin": f"Weekly check-in for {client_data.get('name', 'there')}. This week: {client_data.get('workouts_completed', 3)}/{client_data.get('workouts_planned', 4)} workouts. Overall adherence: {client_data.get('adherence_percent', 75)}%.",
            "motivation_needed": f"Client {client_data.get('name', 'there')} seems to need some motivation. Goal: {client_data.get('goal', 'get stronger')}. Progress: {client_data.get('progress_note', 'on track')}."
        }
        
        context = trigger_contexts.get(trigger, f"General message for {client_data.get('name', 'client')}")
        
        prompt = f"""Generate a coaching message for this situation:

{context}

Client's vibe preference: {client_data.get('vibe', 'soft_grind')}
Client's current goal: {client_data.get('goal', 'general fitness')}"""

        try:
            chat = self._create_chat(
                session_id=f"coaching_msg_{datetime.now().timestamp()}",
                system_message=system_message
            )
            
            response = await chat.send_message(UserMessage(text=prompt))
            result = json.loads(response)
            
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
        client_state: Dict
    ) -> Dict:
        """
        Adapt a workout based on client's current state
        
        Reasons: low_energy, time_crunch, injury, mood, skip_pattern
        """
        
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
    
    # ==================== PATTERN ANALYSIS ====================
    
    async def analyze_client_patterns(
        self,
        workout_history: List[Dict],
        checkin_history: List[Dict]
    ) -> Dict:
        """
        Analyze client behavior patterns and generate insights/recommendations
        """
        
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
    
    async def generate_content_from_notes(
        self,
        trainer_notes: str,
        content_type: str = "tip"
    ) -> Dict:
        """
        Transform trainer notes/ideas into polished content
        
        Types: tip, program_description, workout_intro, motivation_post
        """
        
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
{trainer_notes}

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
    
    async def generate_content(
        self,
        trainer_notes: str,
        content_type: str = "tip"
    ) -> Dict:
        """
        Wrapper for content generation from trainer notes
        """
        return await self.generate_content_from_notes(trainer_notes, content_type)


# Singleton instance
liftlink_ai = LiftLinkAI()
