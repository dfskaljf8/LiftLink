"""
Simple email verification service for LiftLink
"""
import smtplib
import uuid
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

class EmailService:
    def __init__(self):
        self.smtp_email = os.environ.get('SMTP_EMAIL', 'noreply@liftlink.com')
        self.smtp_password = os.environ.get('SMTP_PASSWORD', 'placeholder')
        
    def send_verification_email(self, to_email: str, verification_code: str) -> bool:
        """Send email verification code (mocked for development)"""
        try:
            # For development - just log the verification code
            print(f"📧 EMAIL VERIFICATION - Send to: {to_email}")
            print(f"🔑 Verification Code: {verification_code}")
            print(f"🔗 Verification Link: http://localhost:3000/verify?code={verification_code}&email={to_email}")
            
            # In production, replace this with actual SMTP sending
            # For now, we'll always return True to simulate successful sending
            return True
            
        except Exception as e:
            print(f"❌ Failed to send verification email: {e}")
            return False
    
    def send_trainer_notification(self, to_email: str, message: str) -> bool:
        """Send trainer notification (mocked for development)"""
        try:
            print(f"📧 TRAINER NOTIFICATION - Send to: {to_email}")
            print(f"💬 Message: {message}")
            return True
        except Exception as e:
            print(f"❌ Failed to send trainer notification: {e}")
            return False

def generate_verification_code() -> str:
    """Generate a 6-digit verification code"""
    return str(uuid.uuid4())[:6].upper()