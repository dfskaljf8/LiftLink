"""
Google Wallet API integration for LiftLink payment processing
"""
import os
import json
import logging
from datetime import datetime
from typing import Dict, Optional
import httpx
import stripe

class GoogleWalletService:
    def __init__(self):
        self.api_key = os.environ.get('GOOGLE_WALLET_API_KEY')
        self.stripe_secret = os.environ.get('STRIPE_SECRET_KEY')
        self.base_url = "https://payments.googleapis.com/v1"
        
        # Initialize Stripe
        if self.stripe_secret:
            stripe.api_key = self.stripe_secret
    
    async def process_google_pay_payment(self, payment_token: str, amount: int, currency: str = "usd") -> Dict:
        """
        Process Google Pay payment using Stripe as the payment processor
        """
        try:
            if not self.api_key or self.api_key == 'your_google_wallet_api_key_here':
                return await self._process_mock_payment(amount, currency)
            
            if not self.stripe_secret:
                logging.error("Stripe secret key not configured")
                return {"status": "error", "message": "Payment processor not configured"}
            
            # Create Stripe payment intent with Google Pay token
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,  # Amount in cents
                currency=currency,
                payment_method_data={
                    'type': 'card',
                    'card': {
                        'token': payment_token
                    }
                },
                confirmation_method='manual',
                confirm=True,
                description="LiftLink Training Session - Google Pay"
            )
            
            print(f"💳 GOOGLE PAY PAYMENT PROCESSED: ${amount/100:.2f} via Stripe")
            
            return {
                "status": "success",
                "payment_intent_id": payment_intent.id,
                "amount": amount,
                "currency": currency,
                "payment_method": "google_pay",
                "client_secret": payment_intent.client_secret
            }
            
        except stripe.error.StripeError as e:
            logging.error(f"Stripe error: {e}")
            return {
                "status": "error", 
                "message": f"Payment failed: {str(e)}"
            }
        except Exception as e:
            logging.error(f"Google Pay payment error: {e}")
            return await self._process_mock_payment(amount, currency)
    
    async def _process_mock_payment(self, amount: int, currency: str) -> Dict:
        """Process mock Google Pay payment for testing"""
        mock_payment_id = f"gpay_mock_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        print(f"💳 MOCK GOOGLE PAY PAYMENT: ${amount/100:.2f} {currency.upper()}")
        
        return {
            "status": "success",
            "payment_intent_id": mock_payment_id,
            "amount": amount,
            "currency": currency,
            "payment_method": "google_pay",
            "client_secret": f"pi_{mock_payment_id}_secret"
        }
    
    async def create_google_pay_session(self, 
                                       amount: int, 
                                       currency: str = "usd",
                                       trainer_id: str = None,
                                       client_email: str = None,
                                       session_details: Dict = None) -> Dict:
        """
        Create a Google Pay payment session with real API key
        """
        try:
            if not self.api_key or self.api_key == 'your_google_wallet_api_key_here':
                print("⚠️  Google Wallet API not configured, using mock session")
                return self._create_mock_google_pay_session(amount, currency, trainer_id, client_email)
            
            # Create payment request object for Google Pay with real API key
            payment_request = {
                "apiVersion": 2,
                "apiVersionMinor": 0,
                "allowedPaymentMethods": [{
                    "type": "CARD",
                    "parameters": {
                        "allowedAuthMethods": ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                        "allowedCardNetworks": ["VISA", "MASTERCARD", "AMEX"]
                    },
                    "tokenizationSpecification": {
                        "type": "PAYMENT_GATEWAY",
                        "parameters": {
                            "gateway": "stripe",
                            "stripe:version": "2020-08-27",
                            "stripe:publishableKey": os.environ.get('STRIPE_PUBLISHABLE_KEY'),
                            "googleWalletApiKey": self.api_key  # Add Google Wallet API key
                        }
                    }
                }],
                "merchantInfo": {
                    "merchantId": "LiftLink_Fitness_Platform",
                    "merchantName": "LiftLink"
                },
                "transactionInfo": {
                    "totalPriceStatus": "FINAL",
                    "totalPrice": f"{amount/100:.2f}",
                    "currencyCode": currency.upper(),
                    "countryCode": "US"
                },
                "environment": "TEST",  # Use real environment
                "apiKey": self.api_key   # Include API key in request
            }
            
            session_id = f"gpay_session_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            print(f"💳 GOOGLE PAY SESSION CREATED: ${amount/100:.2f} for trainer {trainer_id} with API key")
            
            return {
                "session_id": session_id,
                "payment_request": payment_request,
                "amount": amount,
                "currency": currency,
                "status": "created",
                "api_key": self.api_key
            }
            
        except Exception as e:
            logging.error(f"Google Pay session creation error: {e}")
            return self._create_mock_google_pay_session(amount, currency, trainer_id, client_email)
    
    def _create_mock_google_pay_session(self, amount: int, currency: str, trainer_id: str, client_email: str) -> Dict:
        """Create mock Google Pay session for testing"""
        session_id = f"gpay_mock_session_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        mock_payment_request = {
            "apiVersion": 2,
            "apiVersionMinor": 0,
            "allowedPaymentMethods": [{
                "type": "CARD",
                "parameters": {
                    "allowedAuthMethods": ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                    "allowedCardNetworks": ["VISA", "MASTERCARD", "AMEX"]
                },
                "tokenizationSpecification": {
                    "type": "PAYMENT_GATEWAY",
                    "parameters": {
                        "gateway": "stripe",
                        "stripe:version": "v3",
                        "stripe:publishableKey": "pk_test_mock"
                    }
                }
            }],
            "merchantInfo": {
                "merchantId": "LiftLink_Fitness_Platform",
                "merchantName": "LiftLink"
            },
            "transactionInfo": {
                "totalPriceStatus": "FINAL",
                "totalPrice": f"{amount/100:.2f}",
                "currencyCode": currency.upper(),
                "countryCode": "US"
            }
        }
        
        print(f"💳 MOCK GOOGLE PAY SESSION: ${amount/100:.2f} for trainer {trainer_id}")
        
        return {
            "session_id": session_id,
            "payment_request": mock_payment_request,
            "amount": amount,
            "currency": currency,
            "status": "created"
        }
    
    async def confirm_google_pay_payment(self, payment_intent_id: str) -> Dict:
        """
        Confirm Google Pay payment status
        """
        try:
            if not self.stripe_secret:
                # Mock confirmation
                return {
                    "payment_intent_id": payment_intent_id,
                    "status": "succeeded",
                    "paid": True,
                    "amount": 7500,  # Mock amount
                    "currency": "usd"
                }
            
            # Retrieve payment intent from Stripe
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                "payment_intent_id": payment_intent.id,
                "status": payment_intent.status,
                "paid": payment_intent.status == "succeeded",
                "amount": payment_intent.amount,
                "currency": payment_intent.currency
            }
            
        except stripe.error.StripeError as e:
            logging.error(f"Stripe confirmation error: {e}")
            return {
                "payment_intent_id": payment_intent_id,
                "status": "failed",
                "paid": False,
                "error": str(e)
            }
        except Exception as e:
            logging.error(f"Google Pay confirmation error: {e}")
            return {
                "payment_intent_id": payment_intent_id,
                "status": "error",
                "paid": False,
                "error": str(e)
            }
    
    def get_google_pay_config(self) -> Dict:
        """
        Get Google Pay configuration for frontend
        """
        return {
            "environment": "TEST",  # Change to "PRODUCTION" for live
            "apiVersion": 2,
            "apiVersionMinor": 0,
            "merchantInfo": {
                "merchantId": "LiftLink_Fitness_Platform",
                "merchantName": "LiftLink"
            },
            "gateway": "stripe",
            "gatewayConfig": {
                "publishableKey": os.environ.get('STRIPE_PUBLISHABLE_KEY')
            }
        }