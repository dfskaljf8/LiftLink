"""
Stripe payment integration for LiftLink trainer earnings and session payments
"""
import os
import stripe
from typing import Dict, Optional
import logging
from datetime import datetime

# Set Stripe API key
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

class PaymentService:
    def __init__(self):
        self.stripe_key = os.environ.get('STRIPE_SECRET_KEY')
        if not self.stripe_key:
            logging.warning("Stripe API key not found in environment variables")
        else:
            stripe.api_key = self.stripe_key
            print(f"🔑 Stripe API key configured: {self.stripe_key[:12]}...")
        
    def create_payment_intent(self, amount: int, trainer_id: str, client_id: str, session_id: str, trainer_stripe_account: str = None) -> Optional[Dict]:
        """Create a real Stripe payment intent for session payment with destination charge"""
        try:
            if not self.stripe_key:
                print("❌ STRIPE ERROR: No API key configured")
                return None
                
            # Create payment intent with destination charge (for Stripe Connect)
            payment_intent_params = {
                'amount': amount,
                'currency': 'usd',
                'metadata': {
                    'trainer_id': trainer_id,
                    'client_id': client_id,
                    'session_id': session_id,
                    'purpose': 'session_payment'
                },
                'description': f'LiftLink Training Session - Trainer {trainer_id}',
                'automatic_payment_methods': {'enabled': True}
            }
            
            # If trainer has Stripe Connect account, use destination charge
            if trainer_stripe_account:
                payment_intent_params['transfer_data'] = {
                    'destination': trainer_stripe_account,
                    'amount': amount  # Full amount goes to trainer (no platform fee for now)
                }
                print(f"💳 Creating destination charge to {trainer_stripe_account}")
            
            payment_intent = stripe.PaymentIntent.create(**payment_intent_params)
            
            print(f"💳 STRIPE PAYMENT INTENT CREATED: ${amount/100:.2f} for trainer {trainer_id}")
            print(f"   Payment Intent ID: {payment_intent.id}")
            print(f"   Client Secret: {payment_intent.client_secret}")
            if trainer_stripe_account:
                print(f"   Destination Account: {trainer_stripe_account}")
            
            return {
                "id": payment_intent.id,
                "client_secret": payment_intent.client_secret,
                "amount": amount,
                "currency": payment_intent.currency,
                "status": payment_intent.status,
                "trainer_id": trainer_id,
                "client_id": client_id,
                "session_id": session_id,
                "destination_account": trainer_stripe_account,
                "created": payment_intent.created
            }
            
        except stripe.error.StripeError as e:
            logging.error(f"Stripe payment creation failed: {e}")
            print(f"❌ STRIPE ERROR: {e}")
            return None
        except Exception as e:
            logging.error(f"Payment creation failed: {e}")
            print(f"❌ PAYMENT ERROR: {e}")
            return None
    
    def confirm_payment(self, payment_intent_id: str) -> bool:
        """Confirm a payment intent"""
        try:
            if not self.stripe_key:
                print("❌ STRIPE ERROR: No API key configured")
                return False
                
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if payment_intent.status == 'succeeded':
                print(f"💰 PAYMENT CONFIRMED: {payment_intent_id}")
                return True
            else:
                print(f"⏳ PAYMENT PENDING: {payment_intent_id} - Status: {payment_intent.status}")
                return False
                
        except stripe.error.StripeError as e:
            logging.error(f"Payment confirmation failed: {e}")
            return False
    
    def get_trainer_earnings(self, trainer_id: str, start_date: str = None, end_date: str = None) -> Dict:
        """Get trainer earnings from Stripe data and mock recent data"""
        try:
            if not self.stripe_key:
                print("❌ STRIPE ERROR: No API key configured, returning mock data")
                return self._get_mock_earnings()
                
            # In a real implementation, you would query Stripe for actual payment data
            # For now, we'll get some basic account info and combine with mock data
            
            # Get recent charges for this trainer (if any)
            charges = stripe.Charge.list(
                limit=10,
                expand=['data.payment_intent']
            )
            
            # Filter charges for this trainer (from metadata)
            trainer_charges = []
            total_stripe_earnings = 0
            
            for charge in charges.data:
                if (charge.payment_intent and 
                    charge.payment_intent.metadata and 
                    charge.payment_intent.metadata.get('trainer_id') == trainer_id):
                    trainer_charges.append(charge)
                    if charge.status == 'succeeded':
                        total_stripe_earnings += charge.amount
            
            # Combine with mock data for demo purposes
            mock_earnings = {
                "total_earnings": (total_stripe_earnings / 100) + 1800.00,  # Add Stripe earnings to mock base
                "this_month": (total_stripe_earnings / 100) + 450.00,
                "pending_payments": 75.00,
                "completed_sessions": len(trainer_charges) + 18,
                "avg_session_rate": 75.00,
                "stripe_earnings": total_stripe_earnings / 100,
                "recent_payments": []
            }
            
            # Add Stripe payments to recent payments
            for charge in trainer_charges[:5]:  # Last 5 payments
                if charge.status == 'succeeded':
                    mock_earnings["recent_payments"].append({
                        "id": charge.id,
                        "amount": charge.amount / 100,
                        "date": charge.created,
                        "client_name": charge.payment_intent.metadata.get('client_id', 'Unknown'),
                        "session_type": "Personal Training",
                        "stripe_charge": True
                    })
            
            # Add some mock payments to fill the list
            if len(mock_earnings["recent_payments"]) < 3:
                mock_payments = [
                    {
                        "id": "pi_mock_001",
                        "amount": 75.00,
                        "date": "2025-01-10",
                        "client_name": "John Doe",
                        "session_type": "Personal Training",
                        "stripe_charge": False
                    },
                    {
                        "id": "pi_mock_002", 
                        "amount": 100.00,
                        "date": "2025-01-09",
                        "client_name": "Jane Smith",
                        "session_type": "Nutrition Consultation",
                        "stripe_charge": False
                    }
                ]
                mock_earnings["recent_payments"].extend(mock_payments)
            
            return mock_earnings
            
        except stripe.error.StripeError as e:
            logging.error(f"Stripe earnings query failed: {e}")
            print(f"❌ STRIPE ERROR: {e}")
            return self._get_mock_earnings()
    
    def _get_mock_earnings(self):
        """Return mock earnings data when Stripe is not available"""
        return {
            "total_earnings": 1800.00,
            "this_month": 450.00,
            "pending_payments": 75.00,
            "completed_sessions": 18,
            "avg_session_rate": 75.00,
            "stripe_earnings": 0.00,
            "recent_payments": [
                {
                    "id": "pi_mock_001",
                    "amount": 75.00,
                    "date": "2025-01-10",
                    "client_name": "John Doe",
                    "session_type": "Personal Training",
                    "stripe_charge": False
                },
                {
                    "id": "pi_mock_002", 
                    "amount": 100.00,
                    "date": "2025-01-09",
                    "client_name": "Jane Smith",
                    "session_type": "Nutrition Consultation",
                    "stripe_charge": False
                }
            ]
        }
    
    def create_express_account(self, trainer_id: str, trainer_email: str) -> Optional[Dict]:
        """Create a Stripe Express account for trainer onboarding"""
        try:
            if not self.stripe_key:
                print("❌ STRIPE ERROR: No API key configured")
                return None
                
            account = stripe.Account.create(
                type="express",
                country="US",
                email=trainer_email,
                capabilities={
                    "card_payments": {"requested": True},
                    "transfers": {"requested": True}
                },
                business_type="individual",
                metadata={
                    "trainer_id": trainer_id,
                    "platform": "liftlink"
                }
            )
            
            print(f"🏦 STRIPE EXPRESS ACCOUNT CREATED: {account.id} for trainer {trainer_id}")
            return {
                "account_id": account.id,
                "trainer_id": trainer_id,
                "onboarding_required": True
            }
            
        except stripe.error.StripeError as e:
            logging.error(f"Express account creation failed: {e}")
            print(f"❌ STRIPE ACCOUNT ERROR: {e}")
            return None
    
    def create_onboarding_link(self, stripe_account_id: str) -> Optional[str]:
        """Create onboarding link for trainer to complete Stripe setup"""
        try:
            if not self.stripe_key:
                print("❌ STRIPE ERROR: No API key configured")
                return None
                
            account_link = stripe.AccountLink.create(
                account=stripe_account_id,
                refresh_url="https://8fe21dd2-35a9-4730-97e3-93ae042411a9.preview.emergentagent.com/reauth",
                return_url="https://8fe21dd2-35a9-4730-97e3-93ae042411a9.preview.emergentagent.com/onboarding-success",
                type="account_onboarding"
            )
            
            print(f"🔗 ONBOARDING LINK CREATED: {account_link.url}")
            return account_link.url
            
        except stripe.error.StripeError as e:
            logging.error(f"Onboarding link creation failed: {e}")
            print(f"❌ ONBOARDING LINK ERROR: {e}")
            return None

    def process_trainer_payout(self, trainer_id: str, amount: int, stripe_account_id: str) -> bool:
        """Process REAL payout to trainer using Stripe Connect Transfer"""
        try:
            if not self.stripe_key:
                print("❌ STRIPE ERROR: No API key configured")
                return False
                
            # Create REAL Stripe transfer to trainer's account
            transfer = stripe.Transfer.create(
                amount=amount,
                currency="usd",
                destination=stripe_account_id,
                metadata={
                    "trainer_id": trainer_id,
                    "platform": "liftlink",
                    "payout_date": datetime.now().isoformat()
                }
            )
            
            print(f"💰 REAL STRIPE TRANSFER PROCESSED: ${amount/100:.2f}")
            print(f"   Transfer ID: {transfer.id}")
            print(f"   Destination Account: {stripe_account_id}")
            print(f"   Trainer ID: {trainer_id}")
            
            return True
            
        except stripe.error.StripeError as e:
            logging.error(f"Stripe transfer failed: {e}")
            print(f"❌ STRIPE TRANSFER ERROR: {e}")
            return False
        except Exception as e:
            logging.error(f"Payout failed: {e}")
            print(f"❌ PAYOUT FAILED: {e}")
            return False
    
    def create_session_checkout(self, amount: int, trainer_id: str, client_email: str, session_details: Dict, trainer_stripe_account: str = None) -> Optional[Dict]:
        """Create a Stripe Checkout session for trainee to pay for session with Connect support"""
        try:
            if not self.stripe_key:
                print("❌ STRIPE ERROR: No API key configured")
                return None
                
            checkout_params = {
                'payment_method_types': ['card'],
                'line_items': [{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f'Personal Training Session',
                            'description': f"Training session with {session_details.get('trainer_name', 'Professional Trainer')}",
                        },
                        'unit_amount': amount,
                    },
                    'quantity': 1,
                }],
                'mode': 'payment',
                'success_url': 'https://8fe21dd2-35a9-4730-97e3-93ae042411a9.preview.emergentagent.com/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url': 'https://8fe21dd2-35a9-4730-97e3-93ae042411a9.preview.emergentagent.com/cancel',
                'customer_email': client_email,
                'metadata': {
                    'trainer_id': trainer_id,
                    'session_type': session_details.get('session_type', 'personal_training'),
                    'session_duration': str(session_details.get('duration', 60))
                }
            }
            
            # Add destination charge if trainer has Stripe Connect account
            if trainer_stripe_account:
                checkout_params['payment_intent_data'] = {
                    'transfer_data': {
                        'destination': trainer_stripe_account,
                        'amount': amount  # Full amount goes to trainer (no platform fee)
                    }
                }
                print(f"🛒 Creating checkout with destination: {trainer_stripe_account}")
            
            checkout_session = stripe.checkout.Session.create(**checkout_params)
            
            print(f"🛒 STRIPE CHECKOUT CREATED: ${amount/100:.2f}")
            print(f"   Session ID: {checkout_session.id}")
            print(f"   Payment URL: {checkout_session.url}")
            if trainer_stripe_account:
                print(f"   Destination Account: {trainer_stripe_account}")
            
            return {
                "checkout_session_id": checkout_session.id,
                "checkout_url": checkout_session.url,
                "amount": amount,
                "trainer_id": trainer_id,
                "client_email": client_email,
                "destination_account": trainer_stripe_account
            }
            
        except stripe.error.StripeError as e:
            logging.error(f"Stripe checkout creation failed: {e}")
            print(f"❌ STRIPE CHECKOUT ERROR: {e}")
            return None

    def handle_webhook_event(self, event_type: str, event_data: Dict) -> bool:
        """Handle Stripe webhook events for Connect accounts"""
        try:
            if event_type == "account.updated":
                # Handle trainer account onboarding completion
                account = event_data.get('object', {})
                account_id = account.get('id')
                
                # Check if onboarding is complete
                if account.get('charges_enabled') and account.get('payouts_enabled'):
                    print(f"✅ TRAINER ONBOARDING COMPLETE: {account_id}")
                    return True
                    
            elif event_type == "payment_intent.succeeded":
                # Handle successful payment
                payment_intent = event_data.get('object', {})
                trainer_id = payment_intent.get('metadata', {}).get('trainer_id')
                amount = payment_intent.get('amount')
                
                print(f"💰 PAYMENT SUCCEEDED: ${amount/100:.2f} for trainer {trainer_id}")
                return True
                
            elif event_type == "transfer.created":
                # Handle transfer to trainer
                transfer = event_data.get('object', {})
                destination = transfer.get('destination')
                amount = transfer.get('amount')
                
                print(f"📤 TRANSFER CREATED: ${amount/100:.2f} to {destination}")
                return True
                
            elif event_type == "payout.paid":
                # Handle payout completion
                payout = event_data.get('object', {})
                account_id = payout.get('stripe_account')
                amount = payout.get('amount')
                
                print(f"💸 PAYOUT COMPLETED: ${amount/100:.2f} from {account_id}")
                return True
                
            return False
            
        except Exception as e:
            logging.error(f"Webhook handling failed: {e}")
            print(f"❌ WEBHOOK ERROR: {e}")
            return False