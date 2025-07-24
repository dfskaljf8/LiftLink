#!/usr/bin/env python3
"""
Google Pay Removal and Stripe Payment Testing
Test that Google Pay has been completely removed and only Stripe payment is available
"""
import requests
import json
import uuid
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://8fe21dd2-35a9-4730-97e3-93ae042411a9.preview.emergentagent.com/api"

def print_separator():
    print("\n" + "="*80 + "\n")

def print_test_header(test_name):
    print_separator()
    print(f"🧪 TESTING: {test_name}")
    print_separator()

def test_google_pay_endpoints_removed():
    """Test that all Google Pay endpoints return 404 (removed)"""
    print_test_header("GOOGLE PAY ENDPOINTS REMOVAL")
    
    google_pay_endpoints = [
        "/payments/google-pay/create-session",
        "/payments/google-pay/process", 
        "/payments/google-pay/confirm",
        "/payments/google-pay/config"
    ]
    
    all_removed = True
    
    for endpoint in google_pay_endpoints:
        print(f"Testing endpoint: {endpoint}")
        
        # Test POST request (most likely method for these endpoints)
        response = requests.post(f"{BACKEND_URL}{endpoint}", json={"test": "data"})
        
        if response.status_code == 404:
            print(f"✅ {endpoint} correctly returns 404 (removed)")
        else:
            print(f"❌ ERROR: {endpoint} returned status {response.status_code}, expected 404")
            print(f"   Response: {response.text}")
            all_removed = False
        
        # Also test GET request in case endpoint accepts GET
        response = requests.get(f"{BACKEND_URL}{endpoint}")
        
        if response.status_code == 404:
            print(f"✅ {endpoint} (GET) correctly returns 404 (removed)")
        else:
            print(f"❌ ERROR: {endpoint} (GET) returned status {response.status_code}, expected 404")
            all_removed = False
    
    if all_removed:
        print("\n🎉 SUCCESS: All Google Pay endpoints have been completely removed!")
        return True
    else:
        print("\n❌ FAILURE: Some Google Pay endpoints are still accessible")
        return False

def test_stripe_payment_functionality():
    """Test that Stripe payment integration is still working"""
    print_test_header("STRIPE PAYMENT FUNCTIONALITY")
    
    trainer_id = "trainer_stripe_test"
    client_email = f"stripe_test_{uuid.uuid4()}@example.com"
    
    # Test 1: Get session cost
    print("Step 1: Testing GET /api/payments/session-cost/{trainer_id}")
    response = requests.get(f"{BACKEND_URL}/payments/session-cost/{trainer_id}")
    
    if response.status_code == 200:
        cost_data = response.json()
        print(f"✅ Session cost retrieved successfully")
        print(f"   Cost data: {json.dumps(cost_data, indent=2)}")
        
        # Verify response structure
        required_fields = ["trainer_id", "session_type", "cost_cents", "cost_dollars", "currency"]
        missing_fields = [field for field in required_fields if field not in cost_data]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in session cost response: {missing_fields}")
            return False
        
        if cost_data["cost_cents"] == 7500 and cost_data["cost_dollars"] == 75.0:
            print("✅ Session cost values are correct ($75.00)")
        else:
            print(f"❌ ERROR: Expected cost $75.00 but got ${cost_data['cost_dollars']}")
            return False
    else:
        print(f"❌ ERROR: Failed to get session cost. Status code: {response.status_code}")
        print(f"   Response: {response.text}")
        return False
    
    # Test 2: Create Stripe checkout session
    print("\nStep 2: Testing POST /api/payments/create-session-checkout")
    checkout_request = {
        "amount": 7500,  # $75.00
        "trainer_id": trainer_id,
        "client_email": client_email,
        "session_details": {
            "trainer_name": "Test Trainer",
            "session_type": "personal_training",
            "duration": 60,
            "location": "Test Gym"
        }
    }
    
    response = requests.post(f"{BACKEND_URL}/payments/create-session-checkout", json=checkout_request)
    
    if response.status_code == 200:
        checkout_data = response.json()
        print(f"✅ Stripe checkout session created successfully")
        print(f"   Checkout data: {json.dumps(checkout_data, indent=2)}")
        
        # Verify response structure
        required_fields = ["checkout_session_id", "checkout_url"]
        missing_fields = [field for field in required_fields if field not in checkout_data]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in checkout response: {missing_fields}")
            return False
        
        # Verify checkout URL is a real Stripe URL
        if "checkout.stripe.com" in checkout_data["checkout_url"]:
            print("✅ Real Stripe checkout URL generated")
            print(f"   Checkout URL: {checkout_data['checkout_url']}")
        else:
            print(f"❌ ERROR: Expected Stripe checkout URL but got: {checkout_data['checkout_url']}")
            return False
        
        # Verify session ID format (Stripe session IDs start with 'cs_')
        if checkout_data["checkout_session_id"].startswith("cs_"):
            print("✅ Valid Stripe checkout session ID format")
            print(f"   Session ID: {checkout_data['checkout_session_id']}")
        else:
            print(f"❌ ERROR: Invalid Stripe session ID format: {checkout_data['checkout_session_id']}")
            return False
            
        checkout_session_id = checkout_data["checkout_session_id"]
    else:
        print(f"❌ ERROR: Failed to create checkout session. Status code: {response.status_code}")
        print(f"   Response: {response.text}")
        return False
    
    print("\n🎉 SUCCESS: Stripe payment integration is fully functional!")
    return True

def test_stripe_payment_confirmation():
    """Test Stripe payment confirmation functionality"""
    print_test_header("STRIPE PAYMENT CONFIRMATION")
    
    # Test payment confirmation with mock payment intent ID
    print("Testing POST /api/payments/confirm-payment")
    
    # Create a mock payment intent ID (Stripe format starts with 'pi_')
    mock_payment_intent_id = "pi_test_1234567890abcdef"
    mock_session_id = f"session_{uuid.uuid4()}"
    
    confirm_request = {
        "payment_intent_id": mock_payment_intent_id,
        "session_id": mock_session_id
    }
    
    response = requests.post(f"{BACKEND_URL}/payments/confirm-payment", json=confirm_request)
    
    if response.status_code == 200:
        confirm_data = response.json()
        print(f"✅ Payment confirmation endpoint is accessible")
        print(f"   Confirmation response: {json.dumps(confirm_data, indent=2)}")
        
        # Verify response structure
        if "message" in confirm_data:
            print("✅ Payment confirmation response has proper structure")
            return True
        else:
            print("❌ ERROR: Payment confirmation response missing 'message' field")
            return False
    else:
        print(f"❌ ERROR: Failed to access payment confirmation. Status code: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_no_google_pay_in_responses():
    """Test that no API responses contain Google Pay references"""
    print_test_header("VERIFY NO GOOGLE PAY REFERENCES")
    
    # Test various endpoints to ensure no Google Pay references
    test_endpoints = [
        ("/payments/session-cost/trainer_test", "GET"),
        ("/trainer/trainer_test/earnings", "GET"),
    ]
    
    google_pay_found = False
    
    for endpoint, method in test_endpoints:
        print(f"Checking {method} {endpoint} for Google Pay references...")
        
        if method == "GET":
            response = requests.get(f"{BACKEND_URL}{endpoint}")
        else:
            response = requests.post(f"{BACKEND_URL}{endpoint}", json={})
        
        if response.status_code == 200:
            response_text = response.text.lower()
            google_pay_terms = ["google pay", "google-pay", "googlepay", "google_pay"]
            
            found_terms = [term for term in google_pay_terms if term in response_text]
            
            if found_terms:
                print(f"❌ ERROR: Found Google Pay references in {endpoint}: {found_terms}")
                google_pay_found = True
            else:
                print(f"✅ No Google Pay references found in {endpoint}")
        else:
            print(f"⚠️  Endpoint {endpoint} returned status {response.status_code} (may be expected)")
    
    if not google_pay_found:
        print("\n🎉 SUCCESS: No Google Pay references found in API responses!")
        return True
    else:
        print("\n❌ FAILURE: Google Pay references still exist in API responses")
        return False

def run_all_tests():
    """Run all Google Pay removal and Stripe payment tests"""
    print("🚀 STARTING GOOGLE PAY REMOVAL AND STRIPE PAYMENT TESTING")
    print("=" * 80)
    
    test_results = {
        "google_pay_endpoints_removed": False,
        "stripe_payment_functionality": False,
        "stripe_payment_confirmation": False,
        "no_google_pay_references": False
    }
    
    # Test 1: Verify Google Pay endpoints are removed
    test_results["google_pay_endpoints_removed"] = test_google_pay_endpoints_removed()
    
    # Test 2: Verify Stripe payment functionality still works
    test_results["stripe_payment_functionality"] = test_stripe_payment_functionality()
    
    # Test 3: Verify Stripe payment confirmation works
    test_results["stripe_payment_confirmation"] = test_stripe_payment_confirmation()
    
    # Test 4: Verify no Google Pay references in responses
    test_results["no_google_pay_references"] = test_no_google_pay_in_responses()
    
    # Summary
    print_separator()
    print("📊 TEST RESULTS SUMMARY")
    print_separator()
    
    passed_tests = 0
    total_tests = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if result:
            passed_tests += 1
    
    print(f"\nOverall Result: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! Google Pay has been completely removed and Stripe payments are fully functional!")
        return True
    else:
        print(f"\n❌ {total_tests - passed_tests} test(s) failed. Please review the issues above.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)