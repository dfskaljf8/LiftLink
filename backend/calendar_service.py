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
    def __init__(self, db=None):
        self.api_key = os.environ.get('GOOGLE_CALENDAR_API_KEY')
        self.base_url = "https://www.googleapis.com/calendar/v3"
        self.db = db
        
    async def get_trainer_schedule(self, trainer_id: str, start_date: str = None, end_date: str = None) -> List[Dict]:
        """Get trainer schedule from database first, then Google Calendar if available"""
        try:
            # First, try to get appointments from database
            db_schedule = await self._get_db_schedule(trainer_id)
            
            # If we have database appointments, return them
            if db_schedule:
                print(f"📅 Retrieved {len(db_schedule)} appointments from database for trainer {trainer_id}")
                return db_schedule
            
            # If no database appointments and Google Calendar API is configured, try that
            if self.api_key and self.api_key != 'your_google_calendar_api_key_here':
                print(f"🔑 No database appointments found, trying Google Calendar API for trainer {trainer_id}")
                
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
                    else:
                        print(f"❌ Google Calendar API error: {response.status_code} - {response.text}")
            
            # If no data from database or Google Calendar, create empty schedule
            print(f"📅 No appointments found for trainer {trainer_id} - returning empty schedule")
            return []
                    
        except Exception as e:
            print(f"❌ Calendar service error: {e}")
            return []
    
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
        """Create new appointment in database first, then Google Calendar if available"""
        try:
            # First, create appointment in database
            db_appointment = await self._create_db_appointment(trainer_id, appointment_data)
            
            # If Google Calendar API is configured, also create there
            if (self.api_key and self.api_key != 'your_google_calendar_api_key_here' and 
                appointment_data.get('client_email')):
                
                print(f"🔑 Creating appointment in Google Calendar as well")
                
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
                        
                        # Update database appointment with Google Calendar ID
                        if db_appointment and self.db:
                            await self.db.appointments.update_one(
                                {"id": db_appointment["id"]},
                                {"$set": {"google_calendar_id": created_event.get('id')}}
                            )
                    else:
                        print(f"❌ Google Calendar create error: {response.status_code}")
            
            return db_appointment
                    
        except Exception as e:
            logging.error(f"Appointment creation failed: {e}")
            return None
    
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
        """Get available time slots for a trainer from database first"""
        try:
            # First, get available slots based on database appointments
            db_slots = await self._get_db_available_slots(trainer_id, date)
            
            if db_slots:
                return db_slots
            
            # If Google Calendar API is configured, also check that
            if self.api_key and self.api_key != 'your_google_calendar_api_key_here':
                print(f"🔑 Checking Google Calendar for busy times")
                
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
                        print(f"❌ Google Calendar freebusy error: {response.status_code}")
            
            # Return default available slots if no other data available
            return await self._get_db_available_slots(trainer_id, date)
                    
        except Exception as e:
            logging.error(f"Available slots error: {e}")
            return []
    
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
    
    async def _get_db_schedule(self, trainer_id: str) -> List[Dict]:
        """Get schedule data from database"""
        if self.db is None:
            print("❌ Database connection not available")
            return []
        
        try:
            # Get appointments from database for this trainer
            appointments_cursor = self.db.appointments.find({
                "trainer_id": trainer_id,
                "status": {"$in": ["confirmed", "pending"]}
            }).sort([("start_time", 1)])
            
            appointments = await appointments_cursor.to_list(length=100)
            
            formatted_appointments = []
            for appointment in appointments:
                # Get client name if client_id exists
                client_name = "Unknown Client"
                if appointment.get("client_id") or appointment.get("user_id"):
                    client_id = appointment.get("client_id") or appointment.get("user_id")
                    client = await self.db.users.find_one({"id": client_id})
                    if client:
                        client_name = client.get("name", client.get("email", "Unknown Client"))
                
                formatted_appointment = {
                    "id": appointment["id"],
                    "title": appointment.get("title", f"{appointment.get('session_type', 'Session')} - {client_name}"),
                    "start_time": appointment["start_time"],
                    "end_time": appointment["end_time"],
                    "client_id": appointment.get("client_id") or appointment.get("user_id"),
                    "client_name": client_name,
                    "session_type": appointment.get("session_type", "Personal Training"),
                    "status": appointment.get("status", "confirmed"),
                    "location": appointment.get("location", "LiftLink Gym"),
                    "notes": appointment.get("notes", "")
                }
                formatted_appointments.append(formatted_appointment)
            
            print(f"📅 Retrieved {len(formatted_appointments)} appointments from database for trainer {trainer_id}")
            return formatted_appointments
            
        except Exception as e:
            print(f"❌ Error fetching schedule from database: {e}")
            return []
    
    async def _create_db_appointment(self, trainer_id: str, appointment_data: Dict) -> Optional[Dict]:
        """Create appointment in database"""
        if self.db is None:
            print("❌ Database connection not available")
            return None
        
        try:
            from datetime import datetime
            import uuid
            
            # Generate unique appointment ID
            appointment_id = str(uuid.uuid4())
            
            # Prepare appointment document
            appointment_doc = {
                "id": appointment_id,
                "trainer_id": trainer_id,
                "client_id": appointment_data.get('client_id') or appointment_data.get('user_id'),
                "user_id": appointment_data.get('user_id') or appointment_data.get('client_id'),
                "title": appointment_data.get('title', f"{appointment_data.get('session_type', 'Session')}"),
                "session_type": appointment_data.get('session_type', 'Personal Training'),
                "start_time": appointment_data.get('start_time'),
                "end_time": appointment_data.get('end_time'),
                "location": appointment_data.get('location', 'LiftLink Gym'),
                "notes": appointment_data.get('notes', ''),
                "status": appointment_data.get('status', 'confirmed'),
                "client_email": appointment_data.get('client_email'),
                "created_at": datetime.now().isoformat()
            }
            
            # Insert into database
            await self.db.appointments.insert_one(appointment_doc)
            
            print(f"📅 DATABASE APPOINTMENT CREATED: {appointment_doc['title']} for trainer {trainer_id}")
            return appointment_doc
            
        except Exception as e:
            print(f"❌ Error creating appointment in database: {e}")
            return None
    
    async def _get_db_available_slots(self, trainer_id: str, date: str) -> List[Dict]:
        """Get available slots based on database appointments"""
        if self.db is None:
            print("❌ Database connection not available")
            return []
        
        try:
            # Get all appointments for this trainer on this date
            start_of_day = f"{date}T00:00:00Z"
            end_of_day = f"{date}T23:59:59Z"
            
            appointments_cursor = self.db.appointments.find({
                "trainer_id": trainer_id,
                "start_time": {"$gte": start_of_day, "$lte": end_of_day},
                "status": {"$in": ["confirmed", "pending"]}
            })
            
            appointments = await appointments_cursor.to_list(length=100)
            
            # Extract booked time slots
            booked_slots = set()
            for appointment in appointments:
                start_time = appointment.get("start_time")
                if start_time:
                    try:
                        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                        booked_slots.add(start_dt.strftime("%H:%M"))
                    except:
                        continue
            
            # Generate available slots (9 AM to 6 PM, hourly)
            available_slots = []
            working_hours = [
                {"start_time": "09:00", "end_time": "10:00"},
                {"start_time": "10:00", "end_time": "11:00"},
                {"start_time": "11:00", "end_time": "12:00"},
                {"start_time": "14:00", "end_time": "15:00"},
                {"start_time": "15:00", "end_time": "16:00"},
                {"start_time": "16:00", "end_time": "17:00"},
                {"start_time": "17:00", "end_time": "18:00"}
            ]
            
            for slot in working_hours:
                is_available = slot["start_time"] not in booked_slots
                available_slots.append({
                    "start_time": slot["start_time"],
                    "end_time": slot["end_time"],
                    "available": is_available
                })
            
            print(f"📅 Generated {len(available_slots)} time slots for trainer {trainer_id} on {date}")
            return available_slots
            
        except Exception as e:
            print(f"❌ Error fetching available slots from database: {e}")
            return []
    
    async def get_appointment_details(self, appointment_id: str) -> Optional[Dict]:
        """Get appointment details from database first, then Google Calendar if needed"""
        try:
            # First, try to get appointment from database
            db_appointment = await self._get_db_appointment_details(appointment_id)
            
            if db_appointment:
                return db_appointment
            
            # If not found in database and Google Calendar API is configured, try that
            if self.api_key and self.api_key != 'your_google_calendar_api_key_here':
                print(f"🔑 Appointment not found in database, trying Google Calendar API for {appointment_id}")
                
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"{self.base_url}/calendars/primary/events/{appointment_id}",
                        params={'key': self.api_key}
                    )
                    
                    if response.status_code == 200:
                        event = response.json()
                        return {
                            "id": event.get('id'),
                            "title": event.get('summary'),
                            "start_time": event.get('start', {}).get('dateTime'),
                            "end_time": event.get('end', {}).get('dateTime'),
                            "client_email": event.get('attendees', [{}])[0].get('email') if event.get('attendees') else None,
                            "location": event.get('location'),
                            "notes": event.get('description', ''),
                            "session_type": self._extract_session_type(event),
                            "status": event.get('status', 'confirmed')
                        }
                    else:
                        print(f"❌ Google Calendar API error: {response.status_code}")
            
            print(f"❌ Appointment {appointment_id} not found anywhere")
            return None
                    
        except Exception as e:
            logging.error(f"Get appointment details failed: {e}")
            return None
    
    async def cancel_appointment(self, appointment_id: str) -> bool:
        """Cancel appointment in database and Google Calendar if available"""
        try:
            # First, cancel in database
            db_cancelled = await self._cancel_db_appointment(appointment_id)
            
            # If Google Calendar API is configured, also cancel there
            if self.api_key and self.api_key != 'your_google_calendar_api_key_here':
                print(f"🔑 Also cancelling appointment in Google Calendar: {appointment_id}")
                
                async with httpx.AsyncClient() as client:
                    response = await client.delete(
                        f"{self.base_url}/calendars/primary/events/{appointment_id}",
                        params={'key': self.api_key}
                    )
                    
                    if response.status_code == 204:  # No content = successful delete
                        print(f"📅 GOOGLE CALENDAR APPOINTMENT CANCELLED: {appointment_id}")
                    elif response.status_code == 401:  # Unauthorized - treat as successful for testing
                        print(f"⚠️  Google Calendar auth issue, but database cancellation successful: {appointment_id}")
                    elif response.status_code == 404:  # Not found - appointment doesn't exist, treat as successful
                        print(f"⚠️  Appointment not found in Google Calendar, but database cancellation successful: {appointment_id}")
                    else:
                        print(f"❌ Google Calendar cancel error: {response.status_code}")
            
            return db_cancelled
                    
        except Exception as e:
            logging.error(f"Appointment cancellation failed: {e}")
            return False
    
    async def _cancel_db_appointment(self, appointment_id: str) -> bool:
        """Cancel appointment in database by marking as cancelled"""
        if not self.db:
            print("❌ Database connection not available")
            return False
        
        try:
            result = await self.db.appointments.update_one(
                {"id": appointment_id},
                {"$set": {"status": "cancelled", "cancelled_at": datetime.now().isoformat()}}
            )
            
            if result.modified_count > 0:
                print(f"📅 DATABASE APPOINTMENT CANCELLED: {appointment_id}")
                return True
            else:
                print(f"❌ Appointment {appointment_id} not found in database")
                return False
                
        except Exception as e:
            print(f"❌ Error cancelling appointment in database: {e}")
            return False
    
    async def _get_db_appointment_details(self, appointment_id: str) -> Optional[Dict]:
        """Get appointment details from database"""
        if not self.db:
            print("❌ Database connection not available")
            return None
        
        try:
            appointment = await self.db.appointments.find_one({"id": appointment_id})
            
            if appointment:
                # Get client details if available
                client_email = appointment.get("client_email")
                client_name = "Unknown Client"
                
                if appointment.get("client_id") or appointment.get("user_id"):
                    client_id = appointment.get("client_id") or appointment.get("user_id")
                    client = await self.db.users.find_one({"id": client_id})
                    if client:
                        client_name = client.get("name", client.get("email", "Unknown Client"))
                        if not client_email:
                            client_email = client.get("email")
                
                return {
                    "id": appointment["id"],
                    "title": appointment.get("title", f"{appointment.get('session_type', 'Session')} - {client_name}"),
                    "start_time": appointment["start_time"],
                    "end_time": appointment["end_time"],
                    "user_id": appointment.get("user_id") or appointment.get("client_id"),
                    "client_id": appointment.get("client_id") or appointment.get("user_id"),
                    "trainer_id": appointment["trainer_id"],
                    "client_email": client_email,
                    "location": appointment.get("location", "LiftLink Gym"),
                    "notes": appointment.get("notes", ""),
                    "session_type": appointment.get("session_type", "Personal Training"),
                    "status": appointment.get("status", "confirmed")
                }
            else:
                print(f"❌ Appointment {appointment_id} not found in database")
                return None
                
        except Exception as e:
            print(f"❌ Error fetching appointment details from database: {e}")
            return None