import requests
import unittest
import json
import time
from datetime import datetime, timedelta

class LiftLinkAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.trainer_id = None
        self.booking_id = None
        self.session_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test the health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_login(self, email, password):
        """Test login with Firebase credentials"""
        # For testing purposes, we'll use the user ID as the token
        # In a real app, this would be a Firebase token
        if email == "user@demo.com":
            self.token = "demo_user"
            return True
        elif email == "trainer@demo.com":
            self.token = "demo_trainer"
            return True
        return False

    def test_get_user_profile(self):
        """Test getting user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "api/users/profile",
            200
        )
        if success:
            self.user_id = response.get('user_id')
            print(f"User profile: {json.dumps(response, indent=2)}")
        return success

    def test_update_user_profile(self, name, phone, gym):
        """Test updating user profile"""
        success, response = self.run_test(
            "Update User Profile",
            "PUT",
            "api/users/profile",
            200,
            data={"name": name, "phone": phone, "gym": gym, "email": "user@demo.com"}
        )
        return success

    def test_register_trainer(self):
        """Test registering as a trainer"""
        trainer_data = {
            "bio": "I'm a certified personal trainer with expertise in strength training.",
            "specialties": ["Weight Training", "Cardio", "Personal Training"],
            "hourly_rate": 50.0,
            "gym_name": "FitZone Gym",
            "location": {"lat": 40.7128, "lng": -74.0060},
            "experience_years": 5,
            "certifications": ["NASM CPT", "ACE"]
        }
        
        success, response = self.run_test(
            "Register as Trainer",
            "POST",
            "api/trainers/register",
            200,
            data=trainer_data
        )
        return success

    def test_search_trainers(self, specialty=None, max_rate=None, gym=None):
        """Test searching for trainers"""
        params = {}
        if specialty:
            params['specialty'] = specialty
        if max_rate:
            params['max_rate'] = max_rate
        if gym:
            params['gym'] = gym
            
        success, response = self.run_test(
            "Search Trainers",
            "GET",
            "api/trainers/search",
            200,
            params=params
        )
        
        if success and 'trainers' in response:
            trainers = response['trainers']
            if trainers:
                self.trainer_id = trainers[0].get('trainer_id')
                print(f"Found {len(trainers)} trainers")
                print(f"First trainer: {json.dumps(trainers[0], indent=2)}")
            else:
                print("No trainers found")
        
        return success

    def test_get_trainer_profile(self, trainer_id):
        """Test getting trainer profile"""
        success, response = self.run_test(
            "Get Trainer Profile",
            "GET",
            f"api/trainers/{trainer_id}",
            200
        )
        if success:
            print(f"Trainer profile: {json.dumps(response, indent=2)}")
        return success

    def test_create_booking(self, trainer_id):
        """Test creating a booking"""
        # Set session date to tomorrow at 10 AM
        session_date = (datetime.now() + timedelta(days=1)).replace(hour=10, minute=0, second=0).isoformat()
        
        booking_data = {
            "trainer_id": trainer_id,
            "session_date": session_date,
            "duration_hours": 1.0
        }
        
        success, response = self.run_test(
            "Create Booking",
            "POST",
            "api/bookings/create",
            200,
            data=booking_data
        )
        
        if success and 'booking_id' in response:
            self.booking_id = response['booking_id']
            print(f"Booking created with ID: {self.booking_id}")
            print(f"Total amount: ${response.get('total_amount')}")
            print(f"Platform fee: ${response.get('platform_fee')}")
            print(f"Trainer amount: ${response.get('trainer_amount')}")
        
        return success

    def test_get_my_bookings(self):
        """Test getting user's bookings"""
        success, response = self.run_test(
            "Get My Bookings",
            "GET",
            "api/bookings/my",
            200
        )
        
        if success and 'bookings' in response:
            bookings = response['bookings']
            print(f"Found {len(bookings)} bookings")
            if bookings:
                print(f"First booking: {json.dumps(bookings[0], indent=2)}")
        
        return success

    def test_create_payment_session(self, booking_id):
        """Test creating a payment session"""
        success, response = self.run_test(
            "Create Payment Session",
            "POST",
            f"api/payments/create-session?booking_id={booking_id}",
            200
        )
        
        if success and 'session_id' in response:
            self.session_id = response['session_id']
            print(f"Payment session created with ID: {self.session_id}")
            print(f"Checkout URL: {response.get('checkout_url')}")
        
        return success

    def test_get_payment_status(self, session_id):
        """Test getting payment status"""
        success, response = self.run_test(
            "Get Payment Status",
            "GET",
            f"api/payments/status/{session_id}",
            200
        )
        
        if success:
            print(f"Payment status: {response.get('payment_status')}")
            print(f"Amount total: ${response.get('amount_total')}")
        
        return success

    def test_get_dashboard_stats(self):
        """Test getting dashboard statistics"""
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "api/dashboard/stats",
            200
        )
        
        if success:
            print(f"Dashboard stats: {json.dumps(response, indent=2)}")
        
        return success

def run_user_flow_tests(base_url):
    """Run tests for the regular user flow"""
    tester = LiftLinkAPITester(base_url)
    
    print("\n===== TESTING USER FLOW =====\n")
    
    # Test health check
    if not tester.test_health_check():
        print("❌ Health check failed, stopping tests")
        return False
    
    # Test login
    if not tester.test_login("user@demo.com", "demo123"):
        print("❌ Login failed, stopping tests")
        return False
    
    # Test getting user profile
    if not tester.test_get_user_profile():
        print("❌ Failed to get user profile, stopping tests")
        return False
    
    # Test updating user profile
    if not tester.test_update_user_profile("Demo User", "555-123-4567", "FitZone Gym"):
        print("❌ Failed to update user profile")
    
    # Test searching for trainers
    if not tester.test_search_trainers():
        print("❌ Failed to search trainers")
    
    # If we found a trainer, test getting their profile
    if tester.trainer_id:
        if not tester.test_get_trainer_profile(tester.trainer_id):
            print("❌ Failed to get trainer profile")
        
        # Test creating a booking
        if not tester.test_create_booking(tester.trainer_id):
            print("❌ Failed to create booking")
        
        # If booking was created, test payment session
        if tester.booking_id:
            if not tester.test_create_payment_session(tester.booking_id):
                print("❌ Failed to create payment session")
            
            # If payment session was created, test getting status
            if tester.session_id:
                if not tester.test_get_payment_status(tester.session_id):
                    print("❌ Failed to get payment status")
    
    # Test getting user's bookings
    if not tester.test_get_my_bookings():
        print("❌ Failed to get user's bookings")
    
    # Test getting dashboard stats
    if not tester.test_get_dashboard_stats():
        print("❌ Failed to get dashboard stats")
    
    print(f"\n📊 User flow tests passed: {tester.tests_passed}/{tester.tests_run}")
    return tester.tests_passed == tester.tests_run

def run_trainer_flow_tests(base_url):
    """Run tests for the trainer flow"""
    tester = LiftLinkAPITester(base_url)
    
    print("\n===== TESTING TRAINER FLOW =====\n")
    
    # Test login as trainer
    if not tester.test_login("trainer@demo.com", "demo123"):
        print("❌ Trainer login failed, stopping tests")
        return False
    
    # Test getting trainer profile
    if not tester.test_get_user_profile():
        print("❌ Failed to get trainer profile, stopping tests")
        return False
    
    # Test getting trainer's bookings
    if not tester.test_get_my_bookings():
        print("❌ Failed to get trainer's bookings")
    
    # Test getting dashboard stats
    if not tester.test_get_dashboard_stats():
        print("❌ Failed to get trainer dashboard stats")
    
    print(f"\n📊 Trainer flow tests passed: {tester.tests_passed}/{tester.tests_run}")
    return tester.tests_passed == tester.tests_run

def run_user_to_trainer_conversion_test(base_url):
    """Test converting a regular user to a trainer"""
    tester = LiftLinkAPITester(base_url)
    
    print("\n===== TESTING USER TO TRAINER CONVERSION =====\n")
    
    # Test login
    if not tester.test_login("user@demo.com", "demo123"):
        print("❌ Login failed, stopping tests")
        return False
    
    # Test getting user profile
    if not tester.test_get_user_profile():
        print("❌ Failed to get user profile, stopping tests")
        return False
    
    # Test registering as a trainer
    if not tester.test_register_trainer():
        print("❌ Failed to register as trainer")
        return False
    
    # Test getting updated profile (should now be a trainer)
    if not tester.test_get_user_profile():
        print("❌ Failed to get updated profile")
        return False
    
    print(f"\n📊 User to trainer conversion tests passed: {tester.tests_passed}/{tester.tests_run}")
    return tester.tests_passed == tester.tests_run

if __name__ == "__main__":
    # Get the backend URL from the frontend .env file
    import os
    from dotenv import load_dotenv
    
    # Load frontend .env to get the backend URL
    load_dotenv("/app/frontend/.env")
    BACKEND_URL = os.getenv("REACT_APP_BACKEND_URL")
    
    if not BACKEND_URL:
        print("❌ REACT_APP_BACKEND_URL not found in frontend/.env")
        exit(1)
    
    print(f"🔗 Testing backend at: {BACKEND_URL}")
    
    # Run all test flows
    user_flow_success = run_user_flow_tests(BACKEND_URL)
    trainer_flow_success = run_trainer_flow_tests(BACKEND_URL)
    conversion_success = run_user_to_trainer_conversion_test(BACKEND_URL)
    
    # Print overall results
    print("\n===== TEST SUMMARY =====")
    print(f"User Flow: {'✅ PASSED' if user_flow_success else '❌ FAILED'}")
    print(f"Trainer Flow: {'✅ PASSED' if trainer_flow_success else '❌ FAILED'}")
    print(f"User to Trainer Conversion: {'✅ PASSED' if conversion_success else '❌ FAILED'}")
    
    overall_success = user_flow_success and trainer_flow_success and conversion_success
    print(f"\nOverall Test Result: {'✅ PASSED' if overall_success else '❌ FAILED'}")
    
    exit(0 if overall_success else 1)
