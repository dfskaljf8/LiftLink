"""
Google Calendar integration for LiftLink trainer scheduling
"""
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
import httpx
from urllib.parse import urlencode

class CalendarService:
    def __init__(self):
        self.api_key = os.environ.get('GOOGLE_CALENDAR_API_KEY')
        self.base_url = "https://www.googleapis.com/calendar/v3"
        
    async def get_trainer_schedule(self, trainer_id: str, start_date: str = None, end_date: str = None) -> List[Dict]:
        """Get trainer schedule from Google Calendar with proper error handling"""
        try:
            if not self.api_key or self.api_key == 'your_google_calendar_api_key_here':
                print("⚠️  Google Calendar API not configured, using mock data")
                return self._get_mock_schedule()
            
            print(f"🔑 Attempting Google Calendar API call for trainer {trainer_id}")
            
            # Use real Google Calendar API
            if not start_date:
                start_date = datetime.now().isoformat() + 'Z'
            if not end_date:
                end_date = (datetime.now() + timedelta(days=7)).isoformat() + 'Z'
            
            # Try to get primary calendar first
            calendar_id = "primary"  # Use primary calendar for now
            
            params = {
                'key': self.api_key,
                'timeMin': start_date,
                'timeMax': end_date,
                'singleEvents': 'true',
                'orderBy': 'startTime'
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/calendars/{calendar_id}/events",
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    events = self._format_calendar_events(data.get('items', []))
                    print(f"📅 GOOGLE CALENDAR SUCCESS: Retrieved {len(events)} events")
                    return events
                elif response.status_code == 403:
                    print(f"❌ Google Calendar 403 Error: API not properly configured in Google Cloud Console")
                    print("🔧 Using mock data - Please configure Google Calendar API in Google Cloud Console")
                    return self._get_mock_schedule()
                else:
                    print(f"❌ Google Calendar API error: {response.status_code} - {response.text}")
                    return self._get_mock_schedule()
                    
        except Exception as e:
            print(f"❌ Calendar service error: {e}")
            return self._get_mock_schedule()
    
    def _format_calendar_events(self, events: List[Dict]) -> List[Dict]:
        """Format Google Calendar events to LiftLink format"""
        formatted_events = []
        for event in events:
            formatted_event = {
                "id": event.get('id'),
                "title": event.get('summary', 'Training Session'),
                "start_time": event.get('start', {}).get('dateTime', event.get('start', {}).get('date')),
                "end_time": event.get('end', {}).get('dateTime', event.get('end', {}).get('date')),
                "client_name": self._extract_client_name(event),
                "session_type": self._extract_session_type(event),
                "status": "confirmed",
                "location": event.get('location', 'LiftLink Gym'),
                "notes": event.get('description', '')
            }
            formatted_events.append(formatted_event)
        return formatted_events
    
    def _extract_client_name(self, event: Dict) -> str:
        """Extract client name from event"""
        attendees = event.get('attendees', [])
        if attendees:
            return attendees[0].get('email', 'Unknown Client')
        return 'Unknown Client'
    
    def _extract_session_type(self, event: Dict) -> str:
        """Extract session type from event title"""
        title = event.get('summary', '').lower()
        if 'personal' in title:
            return 'Personal Training'
        elif 'group' in title:
            return 'Group Fitness'
        elif 'nutrition' in title:
            return 'Nutrition Consultation'
        return 'Training Session'
    
    async def create_appointment(self, trainer_id: str, appointment_data: Dict) -> Optional[Dict]:
        """Create new appointment in Google Calendar"""
        try:
            if not self.api_key or self.api_key == 'your_google_calendar_api_key_here':
                return self._create_mock_appointment(trainer_id, appointment_data)
            
            # Prepare event data for Google Calendar
            event_data = {
                'summary': appointment_data.get('title', 'Training Session'),
                'description': appointment_data.get('notes', ''),
                'start': {
                    'dateTime': appointment_data.get('start_time'),
                    'timeZone': 'UTC'
                },
                'end': {
                    'dateTime': appointment_data.get('end_time'),
                    'timeZone': 'UTC'
                },
                'location': appointment_data.get('location', 'LiftLink Gym'),
                'attendees': [
                    {'email': appointment_data.get('client_email', 'client@example.com')}
                ],
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 10}
                    ]
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/calendars/primary/events",
                    json=event_data,
                    params={'key': self.api_key}
                )
                
                if response.status_code == 200:
                    created_event = response.json()
                    print(f"📅 GOOGLE CALENDAR APPOINTMENT CREATED: {created_event['summary']}")
                    return self._format_created_event(created_event)
                else:
                    logging.warning(f"Google Calendar create error: {response.status_code}")
                    return self._create_mock_appointment(trainer_id, appointment_data)
                    
        except Exception as e:
            logging.error(f"Appointment creation failed: {e}")
            return self._create_mock_appointment(trainer_id, appointment_data)
    
    def _format_created_event(self, event: Dict) -> Dict:
        """Format created Google Calendar event"""
        return {
            "id": event.get('id'),
            "title": event.get('summary'),
            "start_time": event.get('start', {}).get('dateTime'),
            "end_time": event.get('end', {}).get('dateTime'),
            "status": "confirmed",
            "calendar_event_id": event.get('id'),
            "created_at": datetime.now().isoformat()
        }
    
    async def update_appointment(self, appointment_id: str, update_data: Dict) -> bool:
        """Update existing appointment in Google Calendar"""
        try:
            if not self.api_key or self.api_key == 'your_google_calendar_api_key_here':
                print(f"📝 MOCK APPOINTMENT UPDATED: {appointment_id}")
                return True
                
            # Get existing event first
            async with httpx.AsyncClient() as client:
                get_response = await client.get(
                    f"{self.base_url}/calendars/primary/events/{appointment_id}",
                    params={'key': self.api_key}
                )
                
                if get_response.status_code != 200:
                    return False
                
                event = get_response.json()
                
                # Update event with new data
                if 'title' in update_data:
                    event['summary'] = update_data['title']
                if 'start_time' in update_data:
                    event['start']['dateTime'] = update_data['start_time']
                if 'end_time' in update_data:
                    event['end']['dateTime'] = update_data['end_time']
                if 'notes' in update_data:
                    event['description'] = update_data['notes']
                
                # Update event in Google Calendar
                update_response = await client.put(
                    f"{self.base_url}/calendars/primary/events/{appointment_id}",
                    json=event,
                    params={'key': self.api_key}
                )
                
                if update_response.status_code == 200:
                    print(f"📝 GOOGLE CALENDAR APPOINTMENT UPDATED: {appointment_id}")
                    return True
                else:
                    return False
                    
        except Exception as e:
            logging.error(f"Appointment update failed: {e}")
            return False
    
    async def get_available_slots(self, trainer_id: str, date: str) -> List[Dict]:
        """Get available time slots for a trainer"""
        try:
            if not self.api_key or self.api_key == 'your_google_calendar_api_key_here':
                return self._get_mock_available_slots()
            
            # Get busy times from Google Calendar
            start_time = f"{date}T00:00:00Z"
            end_time = f"{date}T23:59:59Z"
            
            freebusy_request = {
                "timeMin": start_time,
                "timeMax": end_time,
                "items": [{"id": "primary"}]
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/freebusy",
                    json=freebusy_request,
                    params={'key': self.api_key}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    busy_times = data.get('calendars', {}).get('primary', {}).get('busy', [])
                    return self._calculate_available_slots(busy_times, date)
                else:
                    return self._get_mock_available_slots()
                    
        except Exception as e:
            logging.error(f"Available slots error: {e}")
            return self._get_mock_available_slots()
    
    def _calculate_available_slots(self, busy_times: List[Dict], date: str) -> List[Dict]:
        """Calculate available slots based on busy times"""
        # Standard working hours: 9 AM to 6 PM
        working_hours = [
            {"start_time": "09:00", "end_time": "10:00"},
            {"start_time": "10:00", "end_time": "11:00"},
            {"start_time": "11:00", "end_time": "12:00"},
            {"start_time": "14:00", "end_time": "15:00"},
            {"start_time": "15:00", "end_time": "16:00"},
            {"start_time": "16:00", "end_time": "17:00"},
            {"start_time": "17:00", "end_time": "18:00"}
        ]
        
        available_slots = []
        
        for slot in working_hours:
            slot_start = datetime.fromisoformat(f"{date}T{slot['start_time']}:00")
            slot_end = datetime.fromisoformat(f"{date}T{slot['end_time']}:00")
            
            # Check if slot conflicts with busy times
            is_available = True
            for busy_time in busy_times:
                busy_start = datetime.fromisoformat(busy_time['start'].replace('Z', '+00:00'))
                busy_end = datetime.fromisoformat(busy_time['end'].replace('Z', '+00:00'))
                
                # Check for overlap
                if (slot_start < busy_end and slot_end > busy_start):
                    is_available = False
                    break
            
            available_slots.append({
                "start_time": slot['start_time'],
                "end_time": slot['end_time'],
                "available": is_available
            })
        
        return available_slots
    
    def _get_mock_schedule(self) -> List[Dict]:
        """Get mock schedule data"""
        return [
            {
                "id": "event_001",
                "title": "Personal Training - John Doe",
                "start_time": "2025-01-11T09:00:00Z",
                "end_time": "2025-01-11T10:00:00Z",
                "client_id": "client_001",
                "client_name": "John Doe",
                "session_type": "Personal Training",
                "status": "confirmed",
                "location": "LiftLink Gym - Studio A",
                "notes": "Focus on upper body strength"
            },
            {
                "id": "event_002",
                "title": "Group Fitness - HIIT Class",
                "start_time": "2025-01-11T18:00:00Z", 
                "end_time": "2025-01-11T19:00:00Z",
                "client_id": None,
                "client_name": "Group Class",
                "session_type": "Group Fitness",
                "status": "confirmed",
                "location": "LiftLink Gym - Main Floor",
                "notes": "High intensity interval training"
            },
            {
                "id": "event_003",
                "title": "Nutrition Consultation - Jane Smith",
                "start_time": "2025-01-12T14:00:00Z",
                "end_time": "2025-01-12T15:00:00Z", 
                "client_id": "client_002",
                "client_name": "Jane Smith",
                "session_type": "Nutrition Consultation",
                "status": "pending",
                "location": "Virtual Meeting",
                "notes": "Weekly nutrition check-in"
            }
        ]
    
    def _create_mock_appointment(self, trainer_id: str, appointment_data: Dict) -> Optional[Dict]:
        """Create mock appointment"""
        mock_appointment = {
            "id": f"event_new_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "trainer_id": trainer_id,
            **appointment_data,
            "status": "confirmed",
            "created_at": datetime.now().isoformat()
        }
        
        print(f"📅 MOCK APPOINTMENT CREATED: {appointment_data.get('title')} for trainer {trainer_id}")
        return mock_appointment
    
    def _get_mock_available_slots(self) -> List[Dict]:
        """Get mock available slots"""
        return [
            {"start_time": "09:00", "end_time": "10:00", "available": True},
            {"start_time": "10:00", "end_time": "11:00", "available": True},
            {"start_time": "11:00", "end_time": "12:00", "available": False},
            {"start_time": "14:00", "end_time": "15:00", "available": True},
            {"start_time": "15:00", "end_time": "16:00", "available": True},
            {"start_time": "16:00", "end_time": "17:00", "available": False},
            {"start_time": "17:00", "end_time": "18:00", "available": True}
        ]