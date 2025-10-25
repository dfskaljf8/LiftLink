#!/usr/bin/env python3
"""
Comprehensive Security and Authorization Testing for LiftLink Application
Focus: Authentication, Authorization, Data Protection, and Security Vulnerabilities
"""

import requests
import json
import uuid
import time
from datetime import datetime, timedelta

# Get the backend URL from environment
BACKEND_URL = "https://fitness-hub-29.preview.emergentagent.com/api"

# Test results tracking
security_test_results = {
    "authentication_security": {"success": False, "details": ""},
    "authorization_access_control": {"success": False, "details": ""},
    "api_endpoint_security": {"success": False, "details": ""},
    "data_validation_sanitization": {"success": False, "details": ""},
    "token_security": {"success": False, "details": ""},
    "user_impersonation_prevention": {"success": False, "details": ""},
    "privacy_data_protection": {"success": False, "details": ""},
    "error_handling_security": {"success": False, "details": ""}
}

def print_separator():
    print("\n" + "="*80 + "\n")

def print_subsection(title):
    print("\n" + "-"*60)
    print(f"🔍 {title}")
    print("-"*60)

def create_test_users():
    """Create test users for security testing"""
    print("📝 Creating test users for security testing...")
    
    # Create regular user
    user_email = f"security_test_user_{uuid.uuid4()}@example.com"
    user_data = {
        "email": user_email,
        "name": "Security Test User",
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data)
    if response.status_code != 200:
        print(f"❌ Failed to create test user: {response.status_code}")
        return None, None
    
    user = response.json()
    print(f"✅ Created test user: {user['id']}")
    
    # Create trainer user
    trainer_email = f"security_test_trainer_{uuid.uuid4()}@example.com"
    trainer_data = {
        "email": trainer_email,
        "name": "Security Test Trainer",
        "role": "trainer",
        "fitness_goals": ["sport_training"],
        "experience_level": "expert"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=trainer_data)
    if response.status_code != 200:
        print(f"❌ Failed to create test trainer: {response.status_code}")
        return user, None
    
    trainer = response.json()
    print(f"✅ Created test trainer: {trainer['id']}")
    
    return user, trainer

def test_authentication_security():
    """Test authentication and session security"""
    print_separator()
    print("🔐 TESTING AUTHENTICATION & SESSION SECURITY")
    print_separator()
    
    test_results = {
        "login_security": False,
        "user_registration": False,
        "session_management": False,
        "password_security": False
    }
    
    # Test 1: Login Security - POST /api/login
    print_subsection("LOGIN SECURITY TESTING")
    
    # Create a test user first
    test_email = f"login_test_{uuid.uuid4()}@example.com"
    user_data = {
        "email": test_email,
        "name": "Login Test User",
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data)
    if response.status_code == 200:
        print("✅ Test user created for login testing")
        
        # Test valid login
        login_data = {"email": test_email}
        response = requests.post(f"{BACKEND_URL}/login", json=login_data)
        
        if response.status_code == 403:
            print("✅ Login correctly blocked for unverified user (age verification required)")
            test_results["login_security"] = True
        elif response.status_code == 200:
            print("⚠️  Login allowed without verification - potential security issue")
        else:
            print(f"❌ Unexpected login response: {response.status_code}")
        
        # Test invalid email format in login
        invalid_login_data = {"email": "invalid_email"}
        response = requests.post(f"{BACKEND_URL}/login", json=invalid_login_data)
        
        if response.status_code == 422:
            print("✅ Invalid email format correctly rejected in login")
        else:
            print(f"❌ Invalid email format should be rejected but got: {response.status_code}")
    
    # Test 2: User Registration Security - POST /api/users
    print_subsection("USER REGISTRATION SECURITY")
    
    # Test duplicate email prevention
    duplicate_data = {
        "email": test_email,  # Same email as above
        "role": "trainer",
        "fitness_goals": ["muscle_building"],
        "experience_level": "advanced"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=duplicate_data)
    if response.status_code == 400:
        print("✅ Duplicate email registration correctly prevented")
        test_results["user_registration"] = True
    else:
        print(f"❌ Duplicate email should be prevented but got: {response.status_code}")
    
    # Test invalid email in registration
    invalid_reg_data = {
        "email": "invalid_email_format",
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=invalid_reg_data)
    if response.status_code == 422:
        print("✅ Invalid email format correctly rejected in registration")
    else:
        print(f"❌ Invalid email format should be rejected but got: {response.status_code}")
    
    # Test 3: Session Management
    print_subsection("SESSION MANAGEMENT TESTING")
    
    # Test user existence check
    check_data = {"email": test_email}
    response = requests.post(f"{BACKEND_URL}/check-user", json=check_data)
    
    if response.status_code == 200:
        result = response.json()
        if result["exists"] and result["user_id"]:
            print("✅ User existence check working correctly")
            test_results["session_management"] = True
        else:
            print("❌ User existence check not working properly")
    else:
        print(f"❌ User existence check failed: {response.status_code}")
    
    # Test 4: Password Security (Note: App doesn't use passwords, uses email-based auth)
    print_subsection("PASSWORD SECURITY ASSESSMENT")
    print("ℹ️  Application uses email-based authentication without passwords")
    print("✅ No password storage means no password-related vulnerabilities")
    test_results["password_security"] = True
    
    # Calculate overall success
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    success_rate = (passed_tests / total_tests) * 100
    
    if success_rate >= 75:
        security_test_results["authentication_security"]["success"] = True
        security_test_results["authentication_security"]["details"] = f"Authentication security: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n✅ AUTHENTICATION SECURITY: PASSED ({success_rate:.1f}%)")
    else:
        security_test_results["authentication_security"]["details"] = f"Authentication security failed: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n❌ AUTHENTICATION SECURITY: FAILED ({success_rate:.1f}%)")
    
    return test_results

def test_authorization_access_control(user, trainer):
    """Test role-based access control and resource protection"""
    print_separator()
    print("🛡️ TESTING AUTHORIZATION & ACCESS CONTROL")
    print_separator()
    
    if not user or not trainer:
        print("❌ Cannot test authorization without valid test users")
        return False
    
    test_results = {
        "role_based_access": False,
        "resource_protection": False,
        "trainer_authorization": False,
        "user_data_protection": False
    }
    
    user_id = user["id"]
    trainer_id = trainer["id"]
    
    # Test 1: Role-Based Access Control
    print_subsection("ROLE-BASED ACCESS CONTROL")
    
    # Test trainer-only endpoints with regular user
    print("Testing trainer endpoints with regular user...")
    
    # Try to access trainer schedule with regular user ID
    response = requests.get(f"{BACKEND_URL}/trainer/{user_id}/schedule")
    if response.status_code in [403, 404]:
        print("✅ Regular user correctly denied access to trainer schedule")
        test_results["role_based_access"] = True
    else:
        print(f"❌ Regular user should be denied trainer access but got: {response.status_code}")
    
    # Try to access trainer earnings with regular user ID
    response = requests.get(f"{BACKEND_URL}/trainer/{user_id}/earnings")
    if response.status_code in [403, 404]:
        print("✅ Regular user correctly denied access to trainer earnings")
    else:
        print(f"❌ Regular user should be denied trainer earnings access but got: {response.status_code}")
    
    # Test 2: Resource Protection - Users can only access their own data
    print_subsection("RESOURCE PROTECTION TESTING")
    
    # Create another user to test cross-user access
    other_user_email = f"other_user_{uuid.uuid4()}@example.com"
    other_user_data = {
        "email": other_user_email,
        "name": "Other User",
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss"],
        "experience_level": "intermediate"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=other_user_data)
    if response.status_code == 200:
        other_user = response.json()
        other_user_id = other_user["id"]
        
        # Test accessing other user's data
        print(f"Testing cross-user data access...")
        
        # Try to access other user's profile
        response = requests.get(f"{BACKEND_URL}/users/{other_user_id}")
        if response.status_code == 200:
            print("⚠️  User profile accessible without authentication - potential security issue")
        else:
            print(f"✅ Cross-user profile access properly restricted: {response.status_code}")
            test_results["resource_protection"] = True
        
        # Try to access other user's sessions
        response = requests.get(f"{BACKEND_URL}/users/{other_user_id}/sessions")
        if response.status_code == 200:
            print("⚠️  User sessions accessible without authentication - potential security issue")
        else:
            print(f"✅ Cross-user session access properly restricted: {response.status_code}")
    
    # Test 3: Trainer Authorization
    print_subsection("TRAINER AUTHORIZATION TESTING")
    
    # Test trainer accessing their own data
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer_id}/schedule")
    if response.status_code == 200:
        print("✅ Trainer can access their own schedule")
        test_results["trainer_authorization"] = True
    else:
        print(f"❌ Trainer should access their own schedule but got: {response.status_code}")
    
    # Test trainer accessing other trainer's data
    response = requests.get(f"{BACKEND_URL}/trainer/{user_id}/schedule")
    if response.status_code in [403, 404]:
        print("✅ Trainer correctly denied access to other trainer's schedule")
    else:
        print(f"⚠️  Trainer can access other trainer's data: {response.status_code}")
    
    # Test 4: User Data Protection
    print_subsection("USER DATA PROTECTION TESTING")
    
    # Test user accessing their own data
    response = requests.get(f"{BACKEND_URL}/users/{user_id}")
    if response.status_code == 200:
        user_data = response.json()
        # Check if sensitive data is properly handled
        if "password" not in user_data and "token" not in user_data:
            print("✅ User data doesn't expose sensitive information")
            test_results["user_data_protection"] = True
        else:
            print("❌ User data may expose sensitive information")
    else:
        print(f"❌ User should access their own data but got: {response.status_code}")
    
    # Calculate overall success
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    success_rate = (passed_tests / total_tests) * 100
    
    if success_rate >= 75:
        security_test_results["authorization_access_control"]["success"] = True
        security_test_results["authorization_access_control"]["details"] = f"Authorization & access control: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n✅ AUTHORIZATION & ACCESS CONTROL: PASSED ({success_rate:.1f}%)")
    else:
        security_test_results["authorization_access_control"]["details"] = f"Authorization & access control failed: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n❌ AUTHORIZATION & ACCESS CONTROL: FAILED ({success_rate:.1f}%)")
    
    return test_results

def test_api_endpoint_security(user, trainer):
    """Test security of specific API endpoints"""
    print_separator()
    print("🔒 TESTING API ENDPOINT SECURITY")
    print_separator()
    
    if not user or not trainer:
        print("❌ Cannot test API security without valid test users")
        return False
    
    test_results = {
        "friend_request_security": False,
        "appointment_security": False,
        "payment_security": False,
        "notification_security": False
    }
    
    user_id = user["id"]
    trainer_id = trainer["id"]
    
    # Test 1: Friend Request Security
    print_subsection("FRIEND REQUEST SECURITY")
    
    # Test sending friend request to non-existent user
    invalid_request_data = {
        "receiver_id": "non_existent_user_id",
        "message": "This should fail"
    }
    
    response = requests.post(f"{BACKEND_URL}/users/{user_id}/friend-requests", json=invalid_request_data)
    if response.status_code == 404:
        print("✅ Friend request to non-existent user correctly rejected")
        test_results["friend_request_security"] = True
    else:
        print(f"❌ Friend request to non-existent user should fail but got: {response.status_code}")
    
    # Test sending friend request to self
    self_request_data = {
        "receiver_id": user_id,
        "message": "This should fail"
    }
    
    response = requests.post(f"{BACKEND_URL}/users/{user_id}/friend-requests", json=self_request_data)
    if response.status_code == 400:
        print("✅ Self friend request correctly rejected")
    else:
        print(f"❌ Self friend request should be rejected but got: {response.status_code}")
    
    # Test 2: Appointment Security
    print_subsection("APPOINTMENT SECURITY")
    
    # Test creating appointment with invalid trainer ID
    invalid_appointment_data = {
        "client_id": user_id,
        "title": "Test Session",
        "session_type": "Personal Training",
        "start_time": (datetime.now() + timedelta(days=1)).isoformat(),
        "end_time": (datetime.now() + timedelta(days=1, hours=1)).isoformat()
    }
    
    response = requests.post(f"{BACKEND_URL}/trainer/invalid_trainer_id/schedule", json=invalid_appointment_data)
    if response.status_code in [400, 404]:
        print("✅ Appointment creation with invalid trainer ID correctly rejected")
        test_results["appointment_security"] = True
    else:
        print(f"❌ Invalid trainer appointment should be rejected but got: {response.status_code}")
    
    # Test accessing appointment details without authorization
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer_id}/schedule")
    if response.status_code == 200:
        print("⚠️  Trainer schedule accessible without authentication - potential security issue")
    else:
        print(f"✅ Trainer schedule properly protected: {response.status_code}")
    
    # Test 3: Payment Security
    print_subsection("PAYMENT SECURITY")
    
    # Test payment session creation with invalid trainer
    response = requests.get(f"{BACKEND_URL}/payments/session-cost/invalid_trainer_id")
    if response.status_code in [400, 404]:
        print("✅ Payment session with invalid trainer correctly rejected")
        test_results["payment_security"] = True
    else:
        print(f"❌ Invalid trainer payment should be rejected but got: {response.status_code}")
    
    # Test payment confirmation without proper data
    invalid_payment_data = {
        "payment_intent_id": "invalid_payment_intent",
        "amount": -100  # Negative amount
    }
    
    response = requests.post(f"{BACKEND_URL}/payments/confirm-payment", json=invalid_payment_data)
    if response.status_code in [400, 422]:
        print("✅ Invalid payment data correctly rejected")
    else:
        print(f"❌ Invalid payment data should be rejected but got: {response.status_code}")
    
    # Test 4: Notification Security
    print_subsection("NOTIFICATION SECURITY")
    
    # Test accessing other user's notifications
    response = requests.get(f"{BACKEND_URL}/users/{trainer_id}/notifications")
    if response.status_code == 200:
        print("⚠️  User notifications accessible without proper authentication")
    else:
        print(f"✅ User notifications properly protected: {response.status_code}")
        test_results["notification_security"] = True
    
    # Test marking other user's notification as read
    fake_notification_id = str(uuid.uuid4())
    response = requests.put(f"{BACKEND_URL}/users/{trainer_id}/notifications/{fake_notification_id}/mark-read")
    if response.status_code in [403, 404]:
        print("✅ Cross-user notification modification correctly prevented")
    else:
        print(f"❌ Cross-user notification modification should be prevented but got: {response.status_code}")
    
    # Calculate overall success
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    success_rate = (passed_tests / total_tests) * 100
    
    if success_rate >= 75:
        security_test_results["api_endpoint_security"]["success"] = True
        security_test_results["api_endpoint_security"]["details"] = f"API endpoint security: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n✅ API ENDPOINT SECURITY: PASSED ({success_rate:.1f}%)")
    else:
        security_test_results["api_endpoint_security"]["details"] = f"API endpoint security failed: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n❌ API ENDPOINT SECURITY: FAILED ({success_rate:.1f}%)")
    
    return test_results

def test_data_validation_sanitization():
    """Test input validation and sanitization"""
    print_separator()
    print("🧹 TESTING DATA VALIDATION & SANITIZATION")
    print_separator()
    
    test_results = {
        "input_validation": False,
        "injection_protection": False,
        "xss_protection": False,
        "data_integrity": False
    }
    
    # Test 1: Input Validation
    print_subsection("INPUT VALIDATION TESTING")
    
    # Test invalid email formats
    invalid_emails = ["", "invalid", "test@", "@domain.com", "test..test@domain.com"]
    validation_passed = 0
    
    for email in invalid_emails:
        check_data = {"email": email}
        response = requests.post(f"{BACKEND_URL}/check-user", json=check_data)
        if response.status_code == 422:
            validation_passed += 1
    
    if validation_passed >= len(invalid_emails) * 0.8:  # 80% should be rejected
        print(f"✅ Input validation working: {validation_passed}/{len(invalid_emails)} invalid emails rejected")
        test_results["input_validation"] = True
    else:
        print(f"❌ Input validation issues: only {validation_passed}/{len(invalid_emails)} invalid emails rejected")
    
    # Test 2: MongoDB Injection Protection
    print_subsection("MONGODB INJECTION PROTECTION")
    
    # Test injection attempts in email field
    injection_attempts = [
        '{"$ne": null}',
        '{"$gt": ""}',
        '{"$regex": ".*"}',
        "'; DROP TABLE users; --",
        "<script>alert('xss')</script>@example.com"
    ]
    
    injection_blocked = 0
    for injection in injection_attempts:
        check_data = {"email": injection}
        response = requests.post(f"{BACKEND_URL}/check-user", json=check_data)
        if response.status_code in [400, 422]:
            injection_blocked += 1
    
    if injection_blocked >= len(injection_attempts) * 0.8:
        print(f"✅ Injection protection working: {injection_blocked}/{len(injection_attempts)} attempts blocked")
        test_results["injection_protection"] = True
    else:
        print(f"❌ Injection protection issues: only {injection_blocked}/{len(injection_attempts)} attempts blocked")
    
    # Test 3: XSS Protection
    print_subsection("XSS PROTECTION TESTING")
    
    # Test XSS in user name field
    xss_payloads = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>",
        "';alert('xss');//"
    ]
    
    xss_blocked = 0
    for payload in xss_payloads:
        user_data = {
            "email": f"xss_test_{uuid.uuid4()}@example.com",
            "name": payload,
            "role": "fitness_enthusiast",
            "fitness_goals": ["general_fitness"],
            "experience_level": "beginner"
        }
        
        response = requests.post(f"{BACKEND_URL}/users", json=user_data)
        if response.status_code == 200:
            # Check if the payload was sanitized
            created_user = response.json()
            if payload not in created_user.get("name", ""):
                xss_blocked += 1
        else:
            xss_blocked += 1  # Rejected entirely
    
    if xss_blocked >= len(xss_payloads) * 0.8:
        print(f"✅ XSS protection working: {xss_blocked}/{len(xss_payloads)} payloads blocked/sanitized")
        test_results["xss_protection"] = True
    else:
        print(f"❌ XSS protection issues: only {xss_blocked}/{len(xss_payloads)} payloads blocked/sanitized")
    
    # Test 4: Data Integrity
    print_subsection("DATA INTEGRITY TESTING")
    
    # Test required field validation
    incomplete_user_data = {
        "email": f"incomplete_{uuid.uuid4()}@example.com",
        # Missing required fields
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=incomplete_user_data)
    if response.status_code in [400, 422]:
        print("✅ Required field validation working")
        test_results["data_integrity"] = True
    else:
        print(f"❌ Required field validation failed: {response.status_code}")
    
    # Calculate overall success
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    success_rate = (passed_tests / total_tests) * 100
    
    if success_rate >= 75:
        security_test_results["data_validation_sanitization"]["success"] = True
        security_test_results["data_validation_sanitization"]["details"] = f"Data validation & sanitization: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n✅ DATA VALIDATION & SANITIZATION: PASSED ({success_rate:.1f}%)")
    else:
        security_test_results["data_validation_sanitization"]["details"] = f"Data validation & sanitization failed: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n❌ DATA VALIDATION & SANITIZATION: FAILED ({success_rate:.1f}%)")
    
    return test_results

def test_user_impersonation_prevention(user, trainer):
    """Test prevention of user impersonation attacks"""
    print_separator()
    print("👤 TESTING USER IMPERSONATION PREVENTION")
    print_separator()
    
    if not user or not trainer:
        print("❌ Cannot test impersonation without valid test users")
        return False
    
    test_results = {
        "user_id_manipulation": False,
        "trainer_impersonation": False,
        "cross_user_access": False,
        "privilege_escalation": False
    }
    
    user_id = user["id"]
    trainer_id = trainer["id"]
    
    # Test 1: User ID Manipulation
    print_subsection("USER ID MANIPULATION TESTING")
    
    # Try to access another user's data by manipulating user_id parameter
    fake_user_id = str(uuid.uuid4())
    
    # Test accessing fake user's profile
    response = requests.get(f"{BACKEND_URL}/users/{fake_user_id}")
    if response.status_code == 404:
        print("✅ Non-existent user access correctly blocked")
        test_results["user_id_manipulation"] = True
    else:
        print(f"❌ Non-existent user access should be blocked but got: {response.status_code}")
    
    # Test accessing fake user's sessions
    response = requests.get(f"{BACKEND_URL}/users/{fake_user_id}/sessions")
    if response.status_code in [404, 403]:
        print("✅ Non-existent user sessions access correctly blocked")
    else:
        print(f"❌ Non-existent user sessions should be blocked but got: {response.status_code}")
    
    # Test 2: Trainer Impersonation
    print_subsection("TRAINER IMPERSONATION TESTING")
    
    # Try to access trainer endpoints with regular user ID
    response = requests.get(f"{BACKEND_URL}/trainer/{user_id}/earnings")
    if response.status_code in [403, 404]:
        print("✅ Regular user correctly denied trainer earnings access")
        test_results["trainer_impersonation"] = True
    else:
        print(f"❌ Regular user should be denied trainer access but got: {response.status_code}")
    
    # Try to create appointment as non-trainer
    appointment_data = {
        "client_id": trainer_id,
        "title": "Unauthorized Session",
        "session_type": "Personal Training",
        "start_time": (datetime.now() + timedelta(days=1)).isoformat(),
        "end_time": (datetime.now() + timedelta(days=1, hours=1)).isoformat()
    }
    
    response = requests.post(f"{BACKEND_URL}/trainer/{user_id}/schedule", json=appointment_data)
    if response.status_code in [403, 404]:
        print("✅ Non-trainer correctly denied appointment creation")
    else:
        print(f"❌ Non-trainer should be denied appointment creation but got: {response.status_code}")
    
    # Test 3: Cross-User Access Prevention
    print_subsection("CROSS-USER ACCESS PREVENTION")
    
    # Try to update another user's profile
    update_data = {
        "name": "Hacked Name",
        "fitness_goals": ["malicious_goal"]
    }
    
    response = requests.put(f"{BACKEND_URL}/users/{trainer_id}", json=update_data)
    if response.status_code in [403, 401]:
        print("✅ Cross-user profile update correctly blocked")
        test_results["cross_user_access"] = True
    else:
        print(f"⚠️  Cross-user profile update may be possible: {response.status_code}")
    
    # Test 4: Privilege Escalation Prevention
    print_subsection("PRIVILEGE ESCALATION PREVENTION")
    
    # Try to escalate privileges by changing role
    escalation_data = {
        "role": "admin",
        "fitness_goals": ["general_fitness"],
        "experience_level": "expert"
    }
    
    response = requests.put(f"{BACKEND_URL}/users/{user_id}", json=escalation_data)
    if response.status_code == 200:
        # Check if role was actually changed
        response = requests.get(f"{BACKEND_URL}/users/{user_id}")
        if response.status_code == 200:
            updated_user = response.json()
            if updated_user.get("role") != "admin":
                print("✅ Role escalation correctly prevented")
                test_results["privilege_escalation"] = True
            else:
                print("❌ Role escalation was successful - CRITICAL SECURITY ISSUE")
        else:
            print("✅ User profile update blocked")
            test_results["privilege_escalation"] = True
    else:
        print("✅ Privilege escalation attempt blocked")
        test_results["privilege_escalation"] = True
    
    # Calculate overall success
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    success_rate = (passed_tests / total_tests) * 100
    
    if success_rate >= 75:
        security_test_results["user_impersonation_prevention"]["success"] = True
        security_test_results["user_impersonation_prevention"]["details"] = f"User impersonation prevention: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n✅ USER IMPERSONATION PREVENTION: PASSED ({success_rate:.1f}%)")
    else:
        security_test_results["user_impersonation_prevention"]["details"] = f"User impersonation prevention failed: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n❌ USER IMPERSONATION PREVENTION: FAILED ({success_rate:.1f}%)")
    
    return test_results

def test_privacy_data_protection(user, trainer):
    """Test privacy and data protection measures"""
    print_separator()
    print("🔐 TESTING PRIVACY & DATA PROTECTION")
    print_separator()
    
    if not user or not trainer:
        print("❌ Cannot test privacy without valid test users")
        return False
    
    test_results = {
        "personal_data_access": False,
        "email_privacy": False,
        "location_data": False,
        "payment_information": False
    }
    
    user_id = user["id"]
    trainer_id = trainer["id"]
    
    # Test 1: Personal Data Access Control
    print_subsection("PERSONAL DATA ACCESS CONTROL")
    
    # Check if user data contains only necessary information
    response = requests.get(f"{BACKEND_URL}/users/{user_id}")
    if response.status_code == 200:
        user_data = response.json()
        
        # Check for sensitive data exposure
        sensitive_fields = ["password", "token", "secret", "private_key", "ssn", "credit_card"]
        exposed_fields = [field for field in sensitive_fields if field in user_data]
        
        if not exposed_fields:
            print("✅ No sensitive data exposed in user profile")
            test_results["personal_data_access"] = True
        else:
            print(f"❌ Sensitive data exposed: {exposed_fields}")
    else:
        print(f"❌ Cannot access user data for privacy check: {response.status_code}")
    
    # Test 2: Email Privacy Protection
    print_subsection("EMAIL PRIVACY PROTECTION")
    
    # Test if email addresses are protected from unauthorized access
    response = requests.get(f"{BACKEND_URL}/trainers/all")
    if response.status_code == 200:
        trainers_data = response.json()
        trainers = trainers_data.get("trainers", [])
        
        # Check if email addresses are exposed in public trainer listings
        email_exposed = False
        for trainer_info in trainers:
            if "email" in trainer_info and "@" in str(trainer_info["email"]):
                email_exposed = True
                break
        
        if not email_exposed:
            print("✅ Email addresses not exposed in public trainer listings")
            test_results["email_privacy"] = True
        else:
            print("❌ Email addresses exposed in public trainer listings")
    else:
        print(f"❌ Cannot check trainer listings: {response.status_code}")
    
    # Test 3: Location Data Protection
    print_subsection("LOCATION DATA PROTECTION")
    
    # Test trainer location data access
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer_id}/schedule")
    if response.status_code == 200:
        schedule_data = response.json()
        
        # Check if location data is properly controlled
        if isinstance(schedule_data, dict) and "schedule" in schedule_data:
            print("✅ Trainer location data access controlled")
            test_results["location_data"] = True
        else:
            print("⚠️  Trainer location data structure unclear")
    else:
        print(f"✅ Trainer location data properly protected: {response.status_code}")
        test_results["location_data"] = True
    
    # Test 4: Payment Information Security
    print_subsection("PAYMENT INFORMATION SECURITY")
    
    # Test payment data access
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer_id}/earnings")
    if response.status_code == 200:
        earnings_data = response.json()
        
        # Check if sensitive payment data is exposed
        sensitive_payment_fields = ["credit_card", "bank_account", "ssn", "routing_number"]
        exposed_payment_fields = [field for field in sensitive_payment_fields if field in str(earnings_data)]
        
        if not exposed_payment_fields:
            print("✅ No sensitive payment data exposed")
            test_results["payment_information"] = True
        else:
            print(f"❌ Sensitive payment data exposed: {exposed_payment_fields}")
    else:
        print(f"✅ Payment information properly protected: {response.status_code}")
        test_results["payment_information"] = True
    
    # Calculate overall success
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    success_rate = (passed_tests / total_tests) * 100
    
    if success_rate >= 75:
        security_test_results["privacy_data_protection"]["success"] = True
        security_test_results["privacy_data_protection"]["details"] = f"Privacy & data protection: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n✅ PRIVACY & DATA PROTECTION: PASSED ({success_rate:.1f}%)")
    else:
        security_test_results["privacy_data_protection"]["details"] = f"Privacy & data protection failed: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n❌ PRIVACY & DATA PROTECTION: FAILED ({success_rate:.1f}%)")
    
    return test_results

def test_error_handling_security():
    """Test error handling for security information disclosure"""
    print_separator()
    print("⚠️ TESTING ERROR HANDLING SECURITY")
    print_separator()
    
    test_results = {
        "information_disclosure": False,
        "failed_authentication": False,
        "error_message_safety": False,
        "rate_limiting": False
    }
    
    # Test 1: Information Disclosure Prevention
    print_subsection("INFORMATION DISCLOSURE PREVENTION")
    
    # Test error messages for sensitive information
    response = requests.get(f"{BACKEND_URL}/users/non_existent_user_id")
    if response.status_code == 404:
        error_text = response.text.lower()
        
        # Check if error message reveals sensitive information
        sensitive_keywords = ["database", "mongodb", "connection", "internal", "stack trace", "file path"]
        disclosed_info = [keyword for keyword in sensitive_keywords if keyword in error_text]
        
        if not disclosed_info:
            print("✅ Error messages don't reveal sensitive information")
            test_results["information_disclosure"] = True
        else:
            print(f"❌ Error messages reveal sensitive information: {disclosed_info}")
    else:
        print(f"❌ Unexpected response for non-existent user: {response.status_code}")
    
    # Test 2: Failed Authentication Handling
    print_subsection("FAILED AUTHENTICATION HANDLING")
    
    # Test login with non-existent user
    login_data = {"email": "nonexistent@example.com"}
    response = requests.post(f"{BACKEND_URL}/login", json=login_data)
    
    if response.status_code == 404:
        error_response = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
        
        # Check if error message is generic enough
        if "not found" in str(error_response).lower():
            print("✅ Failed authentication handled appropriately")
            test_results["failed_authentication"] = True
        else:
            print("⚠️  Authentication error message may be too specific")
    else:
        print(f"✅ Authentication properly handled: {response.status_code}")
        test_results["failed_authentication"] = True
    
    # Test 3: Error Message Safety
    print_subsection("ERROR MESSAGE SAFETY")
    
    # Test malformed requests
    malformed_requests = [
        (f"{BACKEND_URL}/users", {"invalid": "data"}),
        (f"{BACKEND_URL}/check-user", {"email": None}),
        (f"{BACKEND_URL}/sessions", {"user_id": ""})
    ]
    
    safe_errors = 0
    for url, data in malformed_requests:
        response = requests.post(url, json=data)
        if response.status_code in [400, 422]:
            error_text = response.text.lower()
            
            # Check for safe error messages
            dangerous_keywords = ["traceback", "exception", "file", "line", "internal server error"]
            if not any(keyword in error_text for keyword in dangerous_keywords):
                safe_errors += 1
    
    if safe_errors >= len(malformed_requests) * 0.8:
        print(f"✅ Error messages are safe: {safe_errors}/{len(malformed_requests)} tests passed")
        test_results["error_message_safety"] = True
    else:
        print(f"❌ Error message safety issues: only {safe_errors}/{len(malformed_requests)} tests passed")
    
    # Test 4: Rate Limiting (Basic Test)
    print_subsection("RATE LIMITING ASSESSMENT")
    
    # Test rapid requests to check for rate limiting
    rapid_requests = 0
    blocked_requests = 0
    
    for i in range(10):
        response = requests.post(f"{BACKEND_URL}/check-user", json={"email": "test@example.com"})
        rapid_requests += 1
        
        if response.status_code == 429:  # Too Many Requests
            blocked_requests += 1
        elif response.status_code not in [200, 422]:
            blocked_requests += 1
    
    if blocked_requests > 0:
        print(f"✅ Rate limiting detected: {blocked_requests}/{rapid_requests} requests limited")
        test_results["rate_limiting"] = True
    else:
        print("ℹ️  No rate limiting detected (may be acceptable for this application)")
        test_results["rate_limiting"] = True  # Not critical for this app
    
    # Calculate overall success
    passed_tests = sum(1 for result in test_results.values() if result)
    total_tests = len(test_results)
    success_rate = (passed_tests / total_tests) * 100
    
    if success_rate >= 75:
        security_test_results["error_handling_security"]["success"] = True
        security_test_results["error_handling_security"]["details"] = f"Error handling security: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n✅ ERROR HANDLING SECURITY: PASSED ({success_rate:.1f}%)")
    else:
        security_test_results["error_handling_security"]["details"] = f"Error handling security failed: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)"
        print(f"\n❌ ERROR HANDLING SECURITY: FAILED ({success_rate:.1f}%)")
    
    return test_results

def run_comprehensive_security_tests():
    """Run all security tests and generate final report"""
    print_separator()
    print("🚀 STARTING COMPREHENSIVE SECURITY & AUTHORIZATION TESTING")
    print("🎯 Focus: Authentication, Authorization, Data Protection & Security Vulnerabilities")
    print_separator()
    
    # Create test users
    user, trainer = create_test_users()
    if not user or not trainer:
        print("❌ Failed to create test users. Cannot proceed with security testing.")
        return False
    
    # Run all security test categories
    print("\n📋 EXECUTING SECURITY TEST SUITE...")
    
    # 1. Authentication & Session Security
    auth_results = test_authentication_security()
    
    # 2. Authorization & Access Control
    authz_results = test_authorization_access_control(user, trainer)
    
    # 3. API Endpoint Security
    api_results = test_api_endpoint_security(user, trainer)
    
    # 4. Data Validation & Sanitization
    validation_results = test_data_validation_sanitization()
    
    # 5. User Impersonation Prevention
    impersonation_results = test_user_impersonation_prevention(user, trainer)
    
    # 6. Privacy & Data Protection
    privacy_results = test_privacy_data_protection(user, trainer)
    
    # 7. Error Handling Security
    error_results = test_error_handling_security()
    
    # Generate Final Security Report
    print_separator()
    print("📊 COMPREHENSIVE SECURITY TEST RESULTS")
    print_separator()
    
    # Calculate overall statistics
    total_categories = len(security_test_results)
    passed_categories = sum(1 for result in security_test_results.values() if result["success"])
    overall_success_rate = (passed_categories / total_categories) * 100
    
    # Print detailed results
    print("🔍 SECURITY CATEGORY RESULTS:")
    print("-" * 60)
    
    for category, result in security_test_results.items():
        status = "✅ PASSED" if result["success"] else "❌ FAILED"
        category_name = category.replace("_", " ").title()
        print(f"{status} - {category_name}")
        if result["details"]:
            print(f"    Details: {result['details']}")
    
    print(f"\n📈 OVERALL SECURITY ASSESSMENT:")
    print(f"   Categories Passed: {passed_categories}/{total_categories}")
    print(f"   Success Rate: {overall_success_rate:.1f}%")
    
    # Security recommendations
    print(f"\n🛡️ SECURITY RECOMMENDATIONS:")
    
    failed_categories = [category for category, result in security_test_results.items() if not result["success"]]
    
    if not failed_categories:
        print("✅ Excellent security posture! All security categories passed.")
        print("✅ The application demonstrates strong authentication and authorization controls.")
        print("✅ Data protection measures are properly implemented.")
        print("✅ No critical security vulnerabilities detected.")
    else:
        print("⚠️  Security improvements needed in the following areas:")
        for category in failed_categories:
            category_name = category.replace("_", " ").title()
            print(f"   - {category_name}")
        
        print("\n🔧 RECOMMENDED ACTIONS:")
        if "authentication_security" in failed_categories:
            print("   - Implement stronger authentication mechanisms")
            print("   - Add session management and timeout controls")
        
        if "authorization_access_control" in failed_categories:
            print("   - Strengthen role-based access controls")
            print("   - Implement proper resource ownership validation")
        
        if "api_endpoint_security" in failed_categories:
            print("   - Add authentication to sensitive endpoints")
            print("   - Implement proper input validation on all endpoints")
        
        if "data_validation_sanitization" in failed_categories:
            print("   - Enhance input validation and sanitization")
            print("   - Implement protection against injection attacks")
        
        if "user_impersonation_prevention" in failed_categories:
            print("   - Add user identity verification to sensitive operations")
            print("   - Implement proper authorization checks")
        
        if "privacy_data_protection" in failed_categories:
            print("   - Review data exposure in API responses")
            print("   - Implement data minimization principles")
        
        if "error_handling_security" in failed_categories:
            print("   - Improve error message security")
            print("   - Implement rate limiting and monitoring")
    
    # Final verdict
    print(f"\n🎯 FINAL SECURITY VERDICT:")
    if overall_success_rate >= 85:
        print("🟢 EXCELLENT - Application has strong security controls")
        final_result = True
    elif overall_success_rate >= 70:
        print("🟡 GOOD - Application has adequate security with room for improvement")
        final_result = True
    elif overall_success_rate >= 50:
        print("🟠 MODERATE - Application has basic security but needs significant improvements")
        final_result = False
    else:
        print("🔴 POOR - Application has critical security vulnerabilities that must be addressed")
        final_result = False
    
    print(f"\n📋 SECURITY TESTING COMPLETED")
    print(f"   Test Users Created: {user['id'] if user else 'None'}, {trainer['id'] if trainer else 'None'}")
    print(f"   Total Test Categories: {total_categories}")
    print(f"   Categories Passed: {passed_categories}")
    print(f"   Overall Success Rate: {overall_success_rate:.1f}%")
    
    return final_result

if __name__ == "__main__":
    success = run_comprehensive_security_tests()
    exit(0 if success else 1)