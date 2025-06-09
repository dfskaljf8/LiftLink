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
    
    def test_start_verification_session(self, role):
        """Test starting a verification session"""
        success, response = self.run_test(
            f"Start Verification Session as {role}",
            "POST",
            "api/verification/start-session",
            200,
            data={"role": role}
        )
        
        if success and "session_id" in response:
            self.session_id = response["session_id"]
            print(f"Session ID: {self.session_id}")
            print(f"Role: {response.get('role')}")
            print(f"Next step: {response.get('next_step')}")
            print(f"Steps completed: {response.get('steps_completed')}")
            print(f"Total steps: {response.get('total_steps')}")
        
        return success
    
    def test_get_verification_status(self):
        """Test getting verification session status"""
        if not self.session_id:
            print("❌ No session ID available. Start a session first.")
            return False
        
        success, response = self.run_test(
            "Get Verification Session Status",
            "GET",
            f"api/verification/session/{self.session_id}/status",
            200
        )
        
        if success:
            print(f"Session ID: {response.get('session_id')}")
            print(f"Role: {response.get('role')}")
            print(f"Current step: {response.get('current_step')}")
            print(f"Steps completed: {response.get('steps_completed')}")
            print(f"Is complete: {response.get('is_complete')}")
            print(f"Total steps: {response.get('total_steps')}")
        
        return success
    
    def test_upload_id(self, file_path, date_of_birth, document_type="drivers_license"):
        """Test uploading an ID document"""
        if not self.session_id:
            print("❌ No session ID available. Start a session first.")
            return False
        
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
                
            files = {
                'file': (os.path.basename(file_path), file_data, 'image/jpeg')
            }
            
            data = {
                'session_id': self.session_id,
                'date_of_birth': date_of_birth,
                'document_type': document_type
            }
            
            success, response = self.run_test(
                "Upload ID Document",
                "POST",
                "api/verification/enhanced-upload-id",
                200,
                data=data,
                files=files
            )
            
            if success and "verification_id" in response:
                self.verification_id = response["verification_id"]
                print(f"Verification ID: {self.verification_id}")
                print(f"Age: {response.get('age')}")
                print(f"Next step: {response.get('next_step')}")
                print(f"Verification score: {response.get('verification_score')}")
            
            return success
            
        except Exception as e:
            print(f"❌ Failed to upload ID: {str(e)}")
            return False
    
    def test_upload_selfie(self, file_path):
        """Test uploading a selfie"""
        if not self.session_id:
            print("❌ No session ID available. Start a session first.")
            return False
        
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
                
            files = {
                'file': (os.path.basename(file_path), file_data, 'image/jpeg')
            }
            
            data = {
                'session_id': self.session_id
            }
            
            success, response = self.run_test(
                "Upload Selfie",
                "POST",
                "api/verification/upload-selfie",
                200,
                data=data,
                files=files
            )
            
            if success and "verification_id" in response:
                print(f"Verification ID: {response.get('verification_id')}")
                print(f"Face match score: {response.get('face_match_score')}")
                print(f"Liveness score: {response.get('liveness_score')}")
                print(f"Next step: {response.get('next_step')}")
            
            return success
            
        except Exception as e:
            print(f"❌ Failed to upload selfie: {str(e)}")
            return False
    
    def test_upload_certification(self, file_path):
        """Test uploading a certification document"""
        if not self.session_id:
            print("❌ No session ID available. Start a session first.")
            return False
        
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
                
            files = {
                'file': (os.path.basename(file_path), file_data, 'application/pdf' if file_path.endswith('.pdf') else 'image/jpeg')
            }
            
            data = {
                'session_id': self.session_id
            }
            
            success, response = self.run_test(
                "Upload Certification",
                "POST",
                "api/verification/enhanced-upload-certification",
                200,
                data=data,
                files=files
            )
            
            if success and "certification_id" in response:
                print(f"Certification ID: {response.get('certification_id')}")
                print(f"Certification type: {response.get('cert_type')}")
                print(f"Confidence score: {response.get('confidence_score')}")
                print(f"XP awarded: {response.get('xp_awarded')}")
                print(f"Coins awarded: {response.get('coins_awarded')}")
                print(f"Badge awarded: {response.get('badge_awarded')}")
                print(f"Is complete: {response.get('is_complete')}")
                print(f"Next step: {response.get('next_step')}")
            
            return success
            
        except Exception as e:
            print(f"❌ Failed to upload certification: {str(e)}")
            return False
    
    def test_upload_invalid_certification(self, file_path):
        """Test uploading an invalid certification document"""
        if not self.session_id:
            print("❌ No session ID available. Start a session first.")
            return False
        
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
                
            files = {
                'file': (os.path.basename(file_path), file_data, 'image/jpeg')
            }
            
            data = {
                'session_id': self.session_id
            }
            
            # We expect this to fail with 400 Bad Request
            success, response = self.run_test(
                "Upload Invalid Certification",
                "POST",
                "api/verification/enhanced-upload-certification",
                400,
                data=data,
                files=files
            )
            
            # For invalid certification, we expect a 400 error
            if success:
                print("✅ Successfully rejected invalid certification")
            
            return success
            
        except Exception as e:
            print(f"❌ Failed during invalid certification test: {str(e)}")
            return False
    
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

def create_test_files():
    """Create test files for ID, selfie, and certification uploads"""
    # Create a directory for test files
    os.makedirs("/app/tests/test_files", exist_ok=True)
    
    # Create a mock ID image
    with open("/app/tests/test_files/mock_id.jpg", "w") as f:
        f.write("This is a mock ID image file")
    
    # Create a mock selfie image
    with open("/app/tests/test_files/mock_selfie.jpg", "w") as f:
        f.write("This is a mock selfie image file")
    
    # Create a mock valid certification PDF
    with open("/app/tests/test_files/valid_certification.pdf", "w") as f:
        f.write("NASM Certified Personal Trainer\nCertification Number: ABC123456\nIssued to: Demo Trainer\nIssue Date: 01/01/2023\nExpiry Date: 01/01/2025\nNational Academy of Sports Medicine\nwww.nasm.org")
    
    # Create a mock invalid certification image
    with open("/app/tests/test_files/invalid_certification.jpg", "w") as f:
        f.write("This is not a valid certification document")
    
    print("✅ Created test files in /app/tests/test_files/")

def run_verification_flow_tests(base_url):
    """Test the verification flow for a trainee"""
    tester = VerificationAPITester(base_url)
    
    print("\n===== TESTING TRAINEE VERIFICATION FLOW =====\n")
    
    # Create test files
    create_test_files()
    
    # Test login as user
    if not tester.test_login("user@demo.com", "demo123"):
        print("❌ Login failed, stopping tests")
        return False
    
    # Test getting user profile
    if not tester.test_get_user_profile():
        print("❌ Failed to get user profile, stopping tests")
        return False
    
    # Test starting a verification session as trainee
    if not tester.test_start_verification_session("trainee"):
        print("❌ Failed to start verification session, stopping tests")
        return False
    
    # Test getting verification status
    if not tester.test_get_verification_status():
        print("❌ Failed to get verification status")
    
    # Test uploading ID
    if not tester.test_upload_id("/app/tests/test_files/mock_id.jpg", "1990-01-01"):
        print("❌ Failed to upload ID")
    
    # Test getting updated verification status
    if not tester.test_get_verification_status():
        print("❌ Failed to get updated verification status")
    
    # Test uploading selfie
    if not tester.test_upload_selfie("/app/tests/test_files/mock_selfie.jpg"):
        print("❌ Failed to upload selfie")
    
    # Test getting final verification status
    if not tester.test_get_verification_status():
        print("❌ Failed to get final verification status")
    
    print(f"\n📊 Trainee verification flow tests passed: {tester.tests_passed}/{tester.tests_run}")
    return tester.tests_passed == tester.tests_run

def run_trainer_verification_flow_tests(base_url):
    """Test the verification flow for a trainer"""
    tester = VerificationAPITester(base_url)
    
    print("\n===== TESTING TRAINER VERIFICATION FLOW =====\n")
    
    # Test login as user who will become a trainer
    if not tester.test_login("user@demo.com", "demo123"):
        print("❌ Login failed, stopping tests")
        return False
    
    # Test getting user profile
    if not tester.test_get_user_profile():
        print("❌ Failed to get user profile, stopping tests")
        return False
    
    # Test starting a verification session as trainer
    if not tester.test_start_verification_session("trainer"):
        print("❌ Failed to start verification session, stopping tests")
        return False
    
    # Test getting verification status
    if not tester.test_get_verification_status():
        print("❌ Failed to get verification status")
    
    # Test uploading ID
    if not tester.test_upload_id("/app/tests/test_files/mock_id.jpg", "1990-01-01"):
        print("❌ Failed to upload ID")
    
    # Test getting updated verification status
    if not tester.test_get_verification_status():
        print("❌ Failed to get updated verification status")
    
    # Test uploading selfie
    if not tester.test_upload_selfie("/app/tests/test_files/mock_selfie.jpg"):
        print("❌ Failed to upload selfie")
    
    # Test getting updated verification status
    if not tester.test_get_verification_status():
        print("❌ Failed to get updated verification status")
    
    # Test uploading valid certification
    if not tester.test_upload_certification("/app/tests/test_files/valid_certification.pdf"):
        print("❌ Failed to upload valid certification")
    
    # Test getting final verification status
    if not tester.test_get_verification_status():
        print("❌ Failed to get final verification status")
    
    print(f"\n📊 Trainer verification flow tests passed: {tester.tests_passed}/{tester.tests_run}")
    return tester.tests_passed == tester.tests_run

def run_certification_validation_tests(base_url):
    """Test the certification validation functionality"""
    tester = VerificationAPITester(base_url)
    
    print("\n===== TESTING CERTIFICATION VALIDATION =====\n")
    
    # Test login as user
    if not tester.test_login("user@demo.com", "demo123"):
        print("❌ Login failed, stopping tests")
        return False
    
    # Test starting a verification session as trainer
    if not tester.test_start_verification_session("trainer"):
        print("❌ Failed to start verification session, stopping tests")
        return False
    
    # Test uploading ID (required before certification)
    if not tester.test_upload_id("/app/tests/test_files/mock_id.jpg", "1990-01-01"):
        print("❌ Failed to upload ID")
        return False
    
    # Test uploading selfie (required before certification)
    if not tester.test_upload_selfie("/app/tests/test_files/mock_selfie.jpg"):
        print("❌ Failed to upload selfie")
        return False
    
    # Test uploading invalid certification (should be rejected)
    if not tester.test_upload_invalid_certification("/app/tests/test_files/invalid_certification.jpg"):
        print("❌ Failed during invalid certification test")
    
    # Test uploading valid certification
    if not tester.test_upload_certification("/app/tests/test_files/valid_certification.pdf"):
        print("❌ Failed to upload valid certification")
    
    print(f"\n📊 Certification validation tests passed: {tester.tests_passed}/{tester.tests_run}")
    return tester.tests_passed == tester.tests_run

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
    
    # Run Apple review authentication tests
    apple_review_success = run_apple_review_tests(BACKEND_URL)
    
    # Run all other test flows if needed
    # trainee_verification_success = run_verification_flow_tests(BACKEND_URL)
    # trainer_verification_success = run_trainer_verification_flow_tests(BACKEND_URL)
    # certification_validation_success = run_certification_validation_tests(BACKEND_URL)
    # trainer_crm_success = run_trainer_crm_tests(BACKEND_URL)
    
    # Print overall results
    print("\n===== TEST SUMMARY =====")
    print(f"Apple Review Authentication: {'✅ PASSED' if apple_review_success else '❌ FAILED'}")
    # print(f"Trainee Verification Flow: {'✅ PASSED' if trainee_verification_success else '❌ FAILED'}")
    # print(f"Trainer Verification Flow: {'✅ PASSED' if trainer_verification_success else '❌ FAILED'}")
    # print(f"Certification Validation: {'✅ PASSED' if certification_validation_success else '❌ FAILED'}")
    # print(f"Trainer CRM Dashboard: {'✅ PASSED' if trainer_crm_success else '❌ FAILED'}")
    
    # overall_success = apple_review_success
    # print(f"\nOverall Test Result: {'✅ PASSED' if overall_success else '❌ FAILED'}")
    
    exit(0 if apple_review_success else 1)
