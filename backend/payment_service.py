"""
Stripe payment integration for LiftLink trainer earnings
"""
import os
import stripe
from typing import Dict, Optional
import logging

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_placeholder')

class PaymentService:
    def __init__(self):
        self.stripe_key = os.environ.get('STRIPE_SECRET_KEY')
        
    def create_payment_intent(self, amount: int, trainer_id: str, client_id: str, session_id: str) -> Optional[Dict]:
        """Create a payment intent for session payment"""
        try:
            # For development - mock payment creation
            mock_payment = {
                "id": f"pi_mock_{session_id}",
                "amount": amount,
                "currency": "usd",
                "status": "succeeded",
                "trainer_id": trainer_id,
                "client_id": client_id,
                "session_id": session_id,
                "created": "2025-01-01T00:00:00Z"
            }
            
            print(f"💳 MOCK PAYMENT CREATED: ${amount/100:.2f} for trainer {trainer_id}")
            return mock_payment
            
        except Exception as e:
            logging.error(f"Payment creation failed: {e}")
            return None
    
    def get_trainer_earnings(self, trainer_id: str, start_date: str = None, end_date: str = None) -> Dict:
        """Get trainer earnings summary"""
        # Mock earnings data for development
        mock_earnings = {
            "total_earnings": 2450.00,
            "this_month": 650.00,
            "pending_payments": 150.00,
            "completed_sessions": 23,
            "avg_session_rate": 75.00,
            "recent_payments": [
                {
                    "id": "pi_mock_001",
                    "amount": 75.00,
                    "date": "2025-01-10",
                    "client_name": "John Doe",
                    "session_type": "Personal Training"
                },
                {
                    "id": "pi_mock_002", 
                    "amount": 100.00,
                    "date": "2025-01-09",
                    "client_name": "Jane Smith",
                    "session_type": "Nutrition Consultation"
                }
            ]
        }
        
        return mock_earnings
    
    def process_trainer_payout(self, trainer_id: str, amount: int) -> bool:
        """Process payout to trainer (mocked)"""
        try:
            print(f"💰 MOCK PAYOUT: ${amount/100:.2f} to trainer {trainer_id}")
            return True
        except Exception as e:
            logging.error(f"Payout failed: {e}")
            return False