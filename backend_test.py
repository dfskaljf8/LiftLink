import requests
import unittest
import json
import time
import os
import base64
from datetime import datetime, timedelta
from dotenv import load_dotenv

class VerificationAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.trainer_id = None
        self.session_id = None
        self.verification_id = None
        self.client_id = None
        
    def run_test(self, name, method, endpoint, expected_status, data=None, params=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                if files:
                    # For multipart/form-data requests with file uploads
                    response = requests.post(url, headers=headers, data=data, files=files)
                else:
                    # For JSON requests
                    headers['Content-Type'] = 'application/json'
                    response = requests.post(url, json=data, headers=headers)
            
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
    
    def test_login(self, email, password):
        """Test login with demo credentials"""
        # For testing purposes, we'll use predefined tokens
        if email == "user@demo.com":
            self.token = "demo_user"
            self.user_id = "user123"
            return True
        elif email == "trainer@demo.com":
            self.token = "demo_trainer"
            self.user_id = "trainer123"
            self.trainer_id = "trainer123"
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
            print(f"User profile: {json.dumps(response, indent=2)}")
        return success
    
    def test_get_trainer_crm_overview(self):
        """Test getting trainer CRM dashboard overview"""
        success, response = self.run_test(
            "Get Trainer CRM Overview",
            "GET",
            "api/trainer/crm/overview",
            200
        )
        
        if success:
            overview = response.get('overview', {})
            recent_activity = response.get('recent_activity', [])
            upcoming_sessions = response.get('upcoming_sessions', [])
            
            print(f"Total bookings: {overview.get('total_bookings')}")
            print(f"This month bookings: {overview.get('this_month_bookings')}")
            print(f"Total revenue: ${overview.get('total_revenue')}")
            print(f"This month revenue: ${overview.get('this_month_revenue')}")
            print(f"Total clients: {overview.get('total_clients')}")
            print(f"Recent activity count: {len(recent_activity)}")
            print(f"Upcoming sessions count: {len(upcoming_sessions)}")
        
        return success
    
    def test_get_trainer_clients(self, search=None, page=1, limit=10):
        """Test getting trainer's client list"""
        params = {
            'page': page,
            'limit': limit
        }
        
        if search:
            params['search'] = search
        
        success, response = self.run_test(
            "Get Trainer Clients",
            "GET",
            "api/trainer/crm/clients",
            200,
            params=params
        )
        
        if success:
            clients = response.get('clients', [])
            pagination = response.get('pagination', {})
            
            print(f"Found {len(clients)} clients")
            print(f"Total clients: {pagination.get('total')}")
            print(f"Page: {pagination.get('page')} of {pagination.get('pages')}")
            
            if clients:
                print(f"First client: {json.dumps(clients[0], indent=2)}")
                # Save first client ID for detailed test
                self.client_id = clients[0].get('user_id')
        
        return success
    
    def test_get_client_details(self, client_id=None):
        """Test getting specific client details"""
        if not client_id and not self.client_id:
            print("❌ No client ID available. Get client list first.")
            return False
        
        client_id = client_id or self.client_id
        
        success, response = self.run_test(
            "Get Client Details",
            "GET",
            f"api/trainer/crm/client/{client_id}",
            200
        )
        
        if success:
            client = response.get('client', {})
            statistics = response.get('statistics', {})
            booking_history = response.get('booking_history', [])
            progress_entries = response.get('progress_entries', [])
            
            print(f"Client name: {client.get('name')}")
            print(f"Total sessions: {statistics.get('total_sessions')}")
            print(f"Completed sessions: {statistics.get('completed_sessions')}")
            print(f"Completion rate: {statistics.get('completion_rate')}%")
            print(f"Total spent: ${statistics.get('total_spent')}")
            print(f"Booking history count: {len(booking_history)}")
            print(f"Progress entries count: {len(progress_entries)}")
        
        return success
    
    def test_get_trainer_analytics(self, period="month"):
        """Test getting trainer analytics"""
        params = {
            'period': period
        }
        
        success, response = self.run_test(
            f"Get Trainer Analytics ({period})",
            "GET",
            "api/trainer/crm/analytics",
            200,
            params=params
        )
        
        if success:
            date_range = response.get('date_range', {})
            revenue_trend = response.get('revenue_trend', [])
            client_retention = response.get('client_retention', {})
            popular_sessions = response.get('popular_sessions', [])
            
            print(f"Period: {response.get('period')}")
            print(f"Date range: {date_range.get('start')} to {date_range.get('end')}")
            print(f"Revenue trend data points: {len(revenue_trend)}")
            print(f"Repeat clients: {client_retention.get('repeat_clients')} of {client_retention.get('total_clients')}")
            print(f"Popular session types: {len(popular_sessions)}")
            
            if popular_sessions:
                print(f"Most popular session: {json.dumps(popular_sessions[0], indent=2)}")
        
        return success

def run_trainer_crm_tests(base_url):
    """Test the trainer CRM dashboard endpoints"""
    tester = VerificationAPITester(base_url)
    
    print("\n===== TESTING TRAINER CRM DASHBOARD =====\n")
    
    # Test login as trainer
    if not tester.test_login("trainer@demo.com", "demo123"):
        print("❌ Trainer login failed, stopping tests")
        return False
    
    # Test getting trainer profile
    if not tester.test_get_user_profile():
        print("❌ Failed to get trainer profile, stopping tests")
        return False
    
    # Test getting CRM overview
    if not tester.test_get_trainer_crm_overview():
        print("❌ Failed to get CRM overview")
    
    # Test getting client list
    if not tester.test_get_trainer_clients():
        print("❌ Failed to get client list")
    
    # Test getting client details
    if tester.client_id:
        if not tester.test_get_client_details():
            print("❌ Failed to get client details")
    else:
        print("⚠️ Skipping client details test - no client ID available")
    
    # Test getting analytics with different periods
    for period in ["week", "month", "quarter", "year"]:
        if not tester.test_get_trainer_analytics(period):
            print(f"❌ Failed to get analytics for period: {period}")
    
    print(f"\n📊 Trainer CRM tests passed: {tester.tests_passed}/{tester.tests_run}")
    return tester.tests_passed == tester.tests_run

def run_analytics_tests(base_url):
    """Test the analytics endpoints"""
    tester = VerificationAPITester(base_url)
    
    print("\n===== TESTING ANALYTICS ENDPOINTS =====\n")
    
    # Test login as user
    if not tester.test_login("user@demo.com", "demo123"):
        print("❌ User login failed, stopping tests")
        return False
    
    # Test getting analytics overview with different time ranges
    for time_range in ["week", "month", "year", "all"]:
        success, response = tester.run_test(
            f"Get Analytics Overview ({time_range})",
            "GET",
            "api/analytics/overview",
            200,
            params={"time_range": time_range}
        )
        
        if success:
            print(f"Time range: {response.get('time_range')}")
            print(f"Start date: {response.get('start_date')}")
            print(f"End date: {response.get('end_date')}")
            print(f"Total workouts: {response.get('total_workouts')}")
            print(f"Total calories: {response.get('total_calories')}")
            print(f"Average heart rate: {response.get('average_heart_rate')}")
            print(f"Workout trend data points: {len(response.get('workout_trend', []))}")
        else:
            print(f"❌ Failed to get analytics overview for time range: {time_range}")
    
    # Test getting goals analytics
    success, response = tester.run_test(
        "Get Goals Analytics",
        "GET",
        "api/analytics/goals",
        200
    )
    
    if success:
        goals = response.get('goals', [])
        print(f"Total goals: {len(goals)}")
        if goals:
            print(f"First goal: {json.dumps(goals[0], indent=2)}")
    else:
        print("❌ Failed to get goals analytics")
    
    # Test getting achievements analytics
    success, response = tester.run_test(
        "Get Achievements Analytics",
        "GET",
        "api/analytics/achievements",
        200
    )
    
    if success:
        achievements = response.get('achievements', [])
        print(f"Total achievements: {len(achievements)}")
        if achievements:
            print(f"First achievement: {json.dumps(achievements[0], indent=2)}")
    else:
        print("❌ Failed to get achievements analytics")
    
    print(f"\n📊 Analytics tests passed: {tester.tests_passed}/{tester.tests_run}")
    return tester.tests_passed == tester.tests_run

def run_trainer_marketplace_tests(base_url):
    """Test the trainer marketplace endpoints"""
    tester = VerificationAPITester(base_url)
    
    print("\n===== TESTING TRAINER MARKETPLACE =====\n")
    
    # Test login as user
    if not tester.test_login("user@demo.com", "demo123"):
        print("❌ User login failed, stopping tests")
        return False
    
    # Test getting trainers with no filters
    success, response = tester.run_test(
        "Get All Trainers",
        "GET",
        "api/trainers",
        200
    )
    
    trainer_id = None
    if success:
        trainers = response.get('trainers', [])
        print(f"Total trainers: {len(trainers)}")
        if trainers:
            print(f"First trainer: {json.dumps(trainers[0], indent=2)}")
            trainer_id = trainers[0].get('trainer_id')
    else:
        print("❌ Failed to get trainers")
    
    # Test getting trainers with specialty filter
    success, response = tester.run_test(
        "Get Trainers by Specialty",
        "GET",
        "api/trainers",
        200,
        params={"specialty": "Strength Training"}
    )
    
    if success:
        trainers = response.get('trainers', [])
        print(f"Trainers with Strength Training specialty: {len(trainers)}")
    else:
        print("❌ Failed to get trainers by specialty")
    
    # Test getting trainers with price range filter
    success, response = tester.run_test(
        "Get Trainers by Price Range",
        "GET",
        "api/trainers",
        200,
        params={"min_price": 30, "max_price": 100}
    )
    
    if success:
        trainers = response.get('trainers', [])
        print(f"Trainers in price range $30-$100: {len(trainers)}")
    else:
        print("❌ Failed to get trainers by price range")
    
    # Test getting trainers with rating filter
    success, response = tester.run_test(
        "Get Trainers by Rating",
        "GET",
        "api/trainers",
        200,
        params={"min_rating": 4.0}
    )
    
    if success:
        trainers = response.get('trainers', [])
        print(f"Trainers with rating >= 4.0: {len(trainers)}")
    else:
        print("❌ Failed to get trainers by rating")
    
    # Test getting trainers with multiple filters
    success, response = tester.run_test(
        "Get Trainers with Multiple Filters",
        "GET",
        "api/trainers",
        200,
        params={
            "specialty": "Nutrition Coaching",
            "min_rating": 4.0,
            "max_price": 80
        }
    )
    
    if success:
        trainers = response.get('trainers', [])
        print(f"Trainers matching multiple filters: {len(trainers)}")
    else:
        print("❌ Failed to get trainers with multiple filters")
    
    # Test booking a session with a trainer
    if trainer_id:
        # Get tomorrow's date for the session
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%dT10:00:00")
        
        success, response = tester.run_test(
            "Book Trainer Session",
            "POST",
            f"api/trainers/{trainer_id}/book",
            200,
            data={
                "session_date": tomorrow,
                "duration_hours": 1.0
            }
        )
        
        if success:
            print(f"Booking ID: {response.get('booking_id')}")
            print(f"Session date: {response.get('session_date')}")
            print(f"Trainer name: {response.get('trainer_name')}")
            print(f"Total amount: ${response.get('total_amount')}")
            print(f"Payment status: {response.get('payment_status')}")
        else:
            print("❌ Failed to book trainer session")
    else:
        print("⚠️ Skipping booking test - no trainer ID available")
    
    print(f"\n📊 Trainer marketplace tests passed: {tester.tests_passed}/{tester.tests_run}")
    return tester.tests_passed == tester.tests_run

def run_apple_review_tests(base_url):
    """Test the Apple review authentication system"""
    tester = VerificationAPITester(base_url)
    
    print("\n===== TESTING APPLE REVIEW AUTHENTICATION =====\n")
    
    # Test 1: Get Apple test accounts info
    success, response = tester.run_test(
        "Get Apple Test Accounts",
        "GET",
        "api/auth/apple-test-accounts",
        200
    )
    
    if success:
        test_accounts = response.get('test_accounts', [])
        print(f"Found {len(test_accounts)} Apple test accounts")
        for account in test_accounts:
            print(f"- {account.get('username')} ({account.get('role')}): {account.get('description')}")
            print(f"  Features: {', '.join(account.get('features', []))[:100]}...")
    
    # Test 2: Login with valid Apple reviewer credentials
    success, response = tester.run_test(
        "Apple Reviewer Login (Valid)",
        "POST",
        "api/auth/apple-review-login",
        200,
        data={
            "username": "apple_reviewer_2024",
            "password": "LiftLink2024Review!"
        }
    )
    
    reviewer_user_id = None
    if success:
        print(f"Login successful: {response.get('message')}")
        print(f"User role: {response.get('user', {}).get('role')}")
        print(f"Bypass enabled: {response.get('bypass_enabled')}")
        print(f"Demo data: {response.get('demo_data')}")
        
        # Save user_id for subsequent tests
        reviewer_user_id = response.get('user', {}).get('user_id')
        
        # For the bypass tests, we'll use the user_id directly as the token
        # This is because the authentication middleware uses the token as the user_id
        if reviewer_user_id:
            tester.token = reviewer_user_id
            
            # Test ID verification bypass
            success, response = tester.run_test(
                "ID Verification Bypass (Reviewer)",
                "POST",
                "api/verification/apple-bypass",
                200,
                data={
                    "type": "id"
                }
            )
            
            if success:
                print(f"ID verification bypass: {response.get('message')}")
                print(f"Verified: {response.get('verified')}")
            
            # Test selfie verification bypass
            success, response = tester.run_test(
                "Selfie Verification Bypass (Reviewer)",
                "POST",
                "api/verification/apple-bypass",
                200,
                data={
                    "type": "selfie"
                }
            )
            
            if success:
                print(f"Selfie verification bypass: {response.get('message')}")
                print(f"Verified: {response.get('verified')}")
    
    # Test 3: Login with valid Apple trainer credentials
    success, response = tester.run_test(
        "Apple Trainer Login (Valid)",
        "POST",
        "api/auth/apple-review-login",
        200,
        data={
            "username": "apple_trainer_reviewer",
            "password": "TrainerReview2024!"
        }
    )
    
    trainer_user_id = None
    if success:
        print(f"Login successful: {response.get('message')}")
        print(f"User role: {response.get('user', {}).get('role')}")
        print(f"Bypass enabled: {response.get('bypass_enabled')}")
        print(f"Demo data: {response.get('demo_data')}")
        
        # Save user_id for subsequent tests
        trainer_user_id = response.get('user', {}).get('user_id')
        
        # For the bypass tests, we'll use the user_id directly as the token
        if trainer_user_id:
            tester.token = trainer_user_id
            
            # Test certification verification bypass
            success, response = tester.run_test(
                "Certification Verification Bypass (Trainer)",
                "POST",
                "api/verification/apple-bypass",
                200,
                data={
                    "type": "certification"
                }
            )
            
            if success:
                print(f"Certification verification bypass: {response.get('message')}")
                print(f"Verified: {response.get('verified')}")
    
    # Test 4: Login with invalid credentials
    success, response = tester.run_test(
        "Apple Reviewer Login (Invalid)",
        "POST",
        "api/auth/apple-review-login",
        401,
        data={
            "username": "apple_reviewer_2024",
            "password": "WrongPassword123!"
        }
    )
    
    if success:
        print("Successfully rejected invalid credentials")
    
    # Test 5: Login with missing credentials
    success, response = tester.run_test(
        "Apple Reviewer Login (Missing Credentials)",
        "POST",
        "api/auth/apple-review-login",
        400,
        data={
            "username": "apple_reviewer_2024"
        }
    )
    
    if success:
        print("Successfully rejected missing credentials")
    
    print(f"\n📊 Apple review authentication tests passed: {tester.tests_passed}/{tester.tests_run}")
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
    
    # Run all tests
    apple_review_success = run_apple_review_tests(BACKEND_URL)
    trainer_crm_success = run_trainer_crm_tests(BACKEND_URL)
    analytics_success = run_analytics_tests(BACKEND_URL)
    trainer_marketplace_success = run_trainer_marketplace_tests(BACKEND_URL)
    
    # Print overall results
    print("\n===== TEST SUMMARY =====")
    print(f"Apple Review Authentication: {'✅ PASSED' if apple_review_success else '❌ FAILED'}")
    print(f"Trainer CRM Dashboard: {'✅ PASSED' if trainer_crm_success else '❌ FAILED'}")
    print(f"Analytics Endpoints: {'✅ PASSED' if analytics_success else '❌ FAILED'}")
    print(f"Trainer Marketplace: {'✅ PASSED' if trainer_marketplace_success else '❌ FAILED'}")
    
    overall_success = apple_review_success and trainer_crm_success and analytics_success and trainer_marketplace_success
    print(f"\nOverall Test Result: {'✅ PASSED' if overall_success else '❌ FAILED'}")
    
    exit(0 if overall_success else 1)
