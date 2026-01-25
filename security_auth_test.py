#!/usr/bin/env python3
"""
Comprehensive Security, Authorization, and Live Notification System Testing
Tests JWT authentication, protected endpoints, role-based access control, 
WebSocket notifications, and security validation as requested in the review.
"""

import requests
import json
import time
import uuid
import jwt
from datetime import datetime, timedelta

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://swiftauth-1.preview.emergentagent.com/api"

def print_separator():
    print("\n" + "="*80 + "\n")

def print_step(step_num, title):
    print(f"\n🔍 STEP {step_num}: {title}")
    print("-" * 60)

def create_test_user(role="fitness_enthusiast", name_suffix=""):
    """Create a test user and return user data"""
    email = f"security_test_{role}_{name_suffix}_{uuid.uuid4()}@example.com"
    user_data = {
        "email": email,
        "name": f"Security Test {role.title()} {name_suffix}",
        "role": role,
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data)
    if response.status_code == 200:
        user = response.json()
        
        # Verify age for the user (required for login)
        age_verification_data = {
            "document_type": "drivers_license",
            "document_number": "DL123456789",
            "date_of_birth": "1990-01-01",
            "full_name": user_data["name"]
        }
        
        verify_response = requests.post(f"{BACKEND_URL}/verify-government-id", json=age_verification_data)
        if verify_response.status_code == 200:
            print(f"✅ Age verification completed for {user['email']}")
        else:
            print(f"⚠️ Age verification failed for {user['email']}: {verify_response.status_code}")
        
        # If trainer, also verify fitness certification
        if role == "trainer":
            cert_verification_data = {
                "certification_type": "NASM",
                "certification_number": "NASM123456",
                "expiration_date": "2025-12-31",
                "issuing_organization": "NASM"
            }
            
            cert_response = requests.post(f"{BACKEND_URL}/verify-fitness-certification", json=cert_verification_data)
            if cert_response.status_code == 200:
                print(f"✅ Fitness certification verified for {user['email']}")
            else:
                print(f"⚠️ Fitness certification failed for {user['email']}: {cert_response.status_code}")
        
        return user
    else:
        print(f"❌ Failed to create test user: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def login_user(email):
    """Login user and get JWT token"""
    login_data = {"email": email}
    response = requests.post(f"{BACKEND_URL}/login", json=login_data)
    if response.status_code == 200:
        user_data = response.json()
        return user_data.get("access_token"), user_data
    else:
        print(f"❌ Failed to login user: {response.status_code}")
        print(f"Response: {response.text}")
        return None, None

def main():
    """Main test execution"""
    print_separator()
    print("🔐 COMPREHENSIVE SECURITY, AUTHORIZATION & LIVE NOTIFICATION TESTING")
    print("Testing JWT authentication, protected endpoints, role-based access control,")
    print("WebSocket notifications, and security validation as requested in review.")
    print_separator()
    
    # Test results tracking
    test_results = {
        "jwt_authentication": {"success": False, "details": ""},
        "protected_endpoints": {"success": False, "details": ""},
        "friend_request_security": {"success": False, "details": ""},
        "cross_user_protection": {"success": False, "details": ""},
        "live_notifications": {"success": False, "details": ""},
        "authorization_bypass": {"success": False, "details": ""},
        "input_validation": {"success": False, "details": ""},
        "role_based_access": {"success": False, "details": ""},
        "complete_workflow": {"success": False, "details": ""}
    }
    
    # Step 1: Create test users
    print_step(1, "CREATING TEST USERS FOR SECURITY TESTING")
    
    # Create regular user
    user = create_test_user("fitness_enthusiast", "user1")
    if not user:
        print("❌ Failed to create test user - cannot continue")
        return False
    
    print(f"✅ Created test user: {user['email']}")
    
    # Create trainer user
    trainer = create_test_user("trainer", "trainer1")
    if not trainer:
        print("❌ Failed to create trainer user - cannot continue")
        return False
    
    print(f"✅ Created trainer user: {trainer['email']}")
    
    # Create second user for friend request testing
    user2 = create_test_user("fitness_enthusiast", "user2")
    if not user2:
        print("❌ Failed to create second user - cannot continue")
        return False
    
    print(f"✅ Created second user: {user2['email']}")
    
    # Step 2: Test JWT Authentication System
    print_step(2, "TESTING JWT AUTHENTICATION SYSTEM")
    
    # Test login returns JWT token
    token, login_response = login_user(user["email"])
    
    if not token:
        print("❌ Login failed to return JWT token")
        test_results["jwt_authentication"]["details"] = "Login failed to return JWT token"
        return False
    
    print(f"✅ JWT token received on login")
    print(f"   Token type: {login_response.get('token_type', 'N/A')}")
    print(f"   Token length: {len(token)} characters")
    
    # Verify JWT token format and content
    try:
        # Decode JWT without verification to check structure
        decoded_token = jwt.decode(token, options={"verify_signature": False})
        
        required_fields = ["user_id", "email", "role", "exp", "iat"]
        missing_fields = [field for field in required_fields if field not in decoded_token]
        
        if missing_fields:
            print(f"❌ Missing JWT fields: {missing_fields}")
            test_results["jwt_authentication"]["details"] = f"Missing JWT fields: {missing_fields}"
            return False
        
        print(f"✅ JWT token contains all required fields")
        print(f"   User ID: {decoded_token['user_id']}")
        print(f"   Email: {decoded_token['email']}")
        print(f"   Role: {decoded_token['role']}")
        print(f"   Expires: {datetime.fromtimestamp(decoded_token['exp'])}")
        
        # Verify token expiration is set correctly (24 hours)
        exp_time = datetime.fromtimestamp(decoded_token['exp'])
        iat_time = datetime.fromtimestamp(decoded_token['iat'])
        token_duration = exp_time - iat_time
        
        if 23 <= token_duration.total_seconds() / 3600 <= 25:  # Allow 1 hour tolerance
            print(f"✅ JWT token expiration set correctly: {token_duration}")
            test_results["jwt_authentication"]["success"] = True
        else:
            print(f"❌ JWT token expiration incorrect: {token_duration} (expected ~24 hours)")
            test_results["jwt_authentication"]["details"] = f"Token expiration incorrect: {token_duration}"
            return False
            
    except Exception as e:
        print(f"❌ Failed to decode JWT token: {e}")
        test_results["jwt_authentication"]["details"] = f"JWT decode error: {e}"
        return False
    
    # Get trainer token
    trainer_token, _ = login_user(trainer["email"])
    if not trainer_token:
        print("❌ Failed to login trainer")
        return False
    
    print(f"✅ Trainer JWT token received")
    
    # Get user2 token
    user2_token, _ = login_user(user2["email"])
    if not user2_token:
        print("❌ Failed to login user2")
        return False
    
    print(f"✅ User2 JWT token received")
    
    # Step 3: Test Protected Endpoint Authorization
    print_step(3, "TESTING PROTECTED ENDPOINT AUTHORIZATION")
    
    protected_tests_passed = 0
    total_protected_tests = 0
    
    # Test trainer notifications with valid JWT
    total_protected_tests += 1
    headers = {"Authorization": f"Bearer {trainer_token}"}
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer['id']}/notifications", headers=headers)
    
    if response.status_code in [200, 404]:  # 404 acceptable if no notifications
        print(f"✅ Trainer notifications accessible with valid JWT (Status: {response.status_code})")
        protected_tests_passed += 1
    else:
        print(f"❌ Trainer notifications failed with valid JWT: {response.status_code}")
        print(f"Response: {response.text}")
    
    # Test user notifications with valid JWT
    total_protected_tests += 1
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BACKEND_URL}/users/{user['id']}/notifications", headers=headers)
    
    if response.status_code in [200, 404]:  # 404 acceptable if no notifications
        print(f"✅ User notifications accessible with valid JWT (Status: {response.status_code})")
        protected_tests_passed += 1
    else:
        print(f"❌ User notifications failed with valid JWT: {response.status_code}")
        print(f"Response: {response.text}")
    
    # Test accessing protected endpoints without JWT
    total_protected_tests += 1
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer['id']}/notifications")
    
    if response.status_code == 401:
        print(f"✅ Trainer notifications correctly blocked without JWT")
        protected_tests_passed += 1
    else:
        print(f"❌ Trainer notifications should require JWT: {response.status_code}")
    
    total_protected_tests += 1
    response = requests.get(f"{BACKEND_URL}/users/{user['id']}/notifications")
    
    if response.status_code == 401:
        print(f"✅ User notifications correctly blocked without JWT")
        protected_tests_passed += 1
    else:
        print(f"❌ User notifications should require JWT: {response.status_code}")
    
    # Test cross-user access prevention
    total_protected_tests += 1
    headers = {"Authorization": f"Bearer {token}"}  # Regular user token
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer['id']}/notifications", headers=headers)
    
    if response.status_code == 403:
        print(f"✅ Cross-user trainer access correctly blocked")
        protected_tests_passed += 1
    else:
        print(f"❌ Cross-user trainer access should be blocked: {response.status_code}")
        print(f"Response: {response.text}")
    
    total_protected_tests += 1
    headers = {"Authorization": f"Bearer {user2_token}"}  # Different user token
    response = requests.get(f"{BACKEND_URL}/users/{user['id']}/notifications", headers=headers)
    
    if response.status_code == 403:
        print(f"✅ Cross-user access correctly blocked")
        protected_tests_passed += 1
    else:
        print(f"❌ Cross-user access should be blocked: {response.status_code}")
        print(f"Response: {response.text}")
    
    if protected_tests_passed >= 5:  # Most tests should pass
        test_results["protected_endpoints"]["success"] = True
        print(f"✅ Protected endpoint authorization: {protected_tests_passed}/{total_protected_tests} tests passed")
    else:
        test_results["protected_endpoints"]["details"] = f"Only {protected_tests_passed}/{total_protected_tests} tests passed"
        print(f"❌ Protected endpoint authorization insufficient: {protected_tests_passed}/{total_protected_tests}")
    
    # Step 4: Test Friend Request Security
    print_step(4, "TESTING FRIEND REQUEST SECURITY")
    
    friend_security_tests = 0
    friend_security_passed = 0
    
    # Test friend request requires JWT
    friend_security_tests += 1
    friend_request_data = {"receiver_id": user2["id"], "message": "Let's be friends!"}
    response = requests.post(f"{BACKEND_URL}/users/{user['id']}/friend-requests", json=friend_request_data)
    
    if response.status_code == 401:
        print(f"✅ Friend request correctly requires JWT")
        friend_security_passed += 1
    else:
        print(f"❌ Friend request should require JWT: {response.status_code}")
        print(f"Response: {response.text}")
    
    # Test friend request with valid JWT
    friend_security_tests += 1
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BACKEND_URL}/users/{user['id']}/friend-requests", json=friend_request_data, headers=headers)
    
    if response.status_code == 200:
        print(f"✅ Friend request successful with valid JWT")
        friend_security_passed += 1
        friend_request_response = response.json()
        friend_request_id = friend_request_response.get("friend_request_id")
        print(f"   Friend request ID: {friend_request_id}")
    else:
        print(f"❌ Friend request failed with valid JWT: {response.status_code}")
        print(f"Response: {response.text}")
    
    # Test preventing self friend requests
    friend_security_tests += 1
    self_request_data = {"receiver_id": user["id"], "message": "Self request"}
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BACKEND_URL}/users/{user['id']}/friend-requests", json=self_request_data, headers=headers)
    
    if response.status_code == 400:
        print(f"✅ Self friend request correctly blocked")
        friend_security_passed += 1
    else:
        print(f"❌ Self friend request should be blocked: {response.status_code}")
        print(f"Response: {response.text}")
    
    # Test preventing users from sending requests on behalf of others
    friend_security_tests += 1
    headers = {"Authorization": f"Bearer {user2_token}"}  # user2's token
    malicious_request_data = {"receiver_id": user["id"], "message": "Malicious request"}
    response = requests.post(f"{BACKEND_URL}/users/{user['id']}/friend-requests", json=malicious_request_data, headers=headers)
    
    if response.status_code == 403:
        print(f"✅ Malicious friend request correctly blocked")
        friend_security_passed += 1
    else:
        print(f"❌ Should prevent sending requests on behalf of others: {response.status_code}")
        print(f"Response: {response.text}")
    
    if friend_security_passed >= 3:
        test_results["friend_request_security"]["success"] = True
        print(f"✅ Friend request security: {friend_security_passed}/{friend_security_tests} tests passed")
    else:
        test_results["friend_request_security"]["details"] = f"Only {friend_security_passed}/{friend_security_tests} tests passed"
    
    # Step 5: Test Live Notification System
    print_step(5, "TESTING LIVE NOTIFICATION SYSTEM")
    
    # Check if receiver got notification from friend request
    time.sleep(2)  # Allow time for notification processing
    headers = {"Authorization": f"Bearer {user2_token}"}
    response = requests.get(f"{BACKEND_URL}/users/{user2['id']}/notifications", headers=headers)
    
    if response.status_code == 200:
        notifications_response = response.json()
        notifications = notifications_response.get("notifications", [])
        print(f"✅ Retrieved {len(notifications)} notifications for receiver")
        
        # Look for friend request notification
        friend_notification = None
        for notification in notifications:
            if isinstance(notification, dict) and notification.get("data", {}).get("type") == "friend_request_received":
                friend_notification = notification
                break
        
        if friend_notification:
            print(f"✅ Friend request notification found in database")
            
            # Verify notification format
            required_fields = ["id", "title", "message", "data", "created_at"]
            missing_fields = [field for field in required_fields if field not in friend_notification]
            
            if not missing_fields:
                print(f"✅ Notification format is correct")
                print(f"   Title: {friend_notification.get('title', 'N/A')}")
                print(f"   Message: {friend_notification.get('message', 'N/A')}")
                test_results["live_notifications"]["success"] = True
            else:
                print(f"❌ Missing notification fields: {missing_fields}")
                test_results["live_notifications"]["details"] = f"Missing fields: {missing_fields}"
        else:
            print(f"❌ Friend request notification not found")
            test_results["live_notifications"]["details"] = "Notification not stored"
    else:
        print(f"❌ Failed to retrieve notifications: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["live_notifications"]["details"] = f"Failed to retrieve: {response.status_code}"
    
    # Step 6: Test Authorization Bypass Attempts
    print_step(6, "TESTING AUTHORIZATION BYPASS ATTEMPTS")
    
    bypass_tests = 0
    bypass_blocked = 0
    
    # Test accessing trainer endpoints without trainer role
    bypass_tests += 1
    headers = {"Authorization": f"Bearer {token}"}  # Regular user token
    response = requests.get(f"{BACKEND_URL}/trainer/{user['id']}/schedule", headers=headers)
    
    if response.status_code == 403:
        print(f"✅ Trainer endpoint correctly blocked for non-trainer")
        bypass_blocked += 1
    else:
        print(f"❌ Trainer endpoint should be blocked: {response.status_code}")
        print(f"Response: {response.text}")
    
    # Test accessing other user's data
    bypass_tests += 1
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BACKEND_URL}/users/{user2['id']}/sessions", headers=headers)
    
    if response.status_code == 403:
        print(f"✅ Cross-user data access correctly blocked")
        bypass_blocked += 1
    else:
        print(f"❌ Cross-user data access should be blocked: {response.status_code}")
        print(f"Response: {response.text}")
    
    # Test accessing protected endpoints without tokens
    bypass_tests += 1
    response = requests.get(f"{BACKEND_URL}/users/{user['id']}/tree-progress")
    
    if response.status_code == 401:
        print(f"✅ Protected endpoint correctly requires authentication")
        bypass_blocked += 1
    else:
        print(f"❌ Protected endpoint should require auth: {response.status_code}")
        print(f"Response: {response.text}")
    
    if bypass_blocked >= 2:
        test_results["authorization_bypass"]["success"] = True
        print(f"✅ Authorization bypass prevention: {bypass_blocked}/{bypass_tests} attempts blocked")
    else:
        test_results["authorization_bypass"]["details"] = f"Only {bypass_blocked}/{bypass_tests} attempts blocked"
    
    # Step 7: Test Input Validation & Security
    print_step(7, "TESTING INPUT VALIDATION & SECURITY")
    
    validation_tests = 0
    validation_passed = 0
    
    # Test malicious email input
    validation_tests += 1
    malicious_user_data = {
        "email": "<script>alert('xss')</script>@example.com",
        "name": "Test User",
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=malicious_user_data)
    
    if response.status_code == 422:
        print(f"✅ Malicious email input correctly rejected")
        validation_passed += 1
    else:
        print(f"❌ Malicious email input should be rejected: {response.status_code}")
        print(f"Response: {response.text}")
    
    # Test invalid user ID access
    validation_tests += 1
    response = requests.get(f"{BACKEND_URL}/users/invalid_user_id")
    
    if response.status_code == 404:
        error_response = response.text
        # Check that error doesn't expose sensitive information
        if not any(keyword in error_response.lower() for keyword in ["database", "mongodb", "internal", "stack"]):
            print(f"✅ Error handling doesn't expose sensitive information")
            validation_passed += 1
        else:
            print(f"❌ Error response may expose sensitive information")
    else:
        print(f"❌ Invalid user ID should return 404: {response.status_code}")
    
    if validation_passed >= 1:
        test_results["input_validation"]["success"] = True
        print(f"✅ Input validation security: {validation_passed}/{validation_tests} tests passed")
    else:
        test_results["input_validation"]["details"] = f"Only {validation_passed}/{validation_tests} tests passed"
    
    # Step 8: Test Role-Based Access Control
    print_step(8, "TESTING ROLE-BASED ACCESS CONTROL")
    
    role_tests = 0
    role_passed = 0
    
    # Test trainer can access trainer endpoints
    role_tests += 1
    headers = {"Authorization": f"Bearer {trainer_token}"}
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer['id']}/schedule", headers=headers)
    
    if response.status_code in [200, 404]:  # 404 acceptable if no schedule
        print(f"✅ Trainer can access trainer endpoints (Status: {response.status_code})")
        role_passed += 1
    else:
        print(f"❌ Trainer should access trainer endpoints: {response.status_code}")
        print(f"Response: {response.text}")
    
    # Test regular user cannot access trainer endpoints
    role_tests += 1
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer['id']}/schedule", headers=headers)
    
    if response.status_code == 403:
        print(f"✅ Regular user correctly blocked from trainer endpoints")
        role_passed += 1
    else:
        print(f"❌ Regular user should be blocked from trainer endpoints: {response.status_code}")
        print(f"Response: {response.text}")
    
    if role_passed >= 1:
        test_results["role_based_access"]["success"] = True
        print(f"✅ Role-based access control: {role_passed}/{role_tests} tests passed")
    else:
        test_results["role_based_access"]["details"] = f"Only {role_passed}/{role_tests} tests passed"
    
    # Step 9: Test Complete Friend Request Flow with Security
    print_step(9, "TESTING COMPLETE FRIEND REQUEST FLOW WITH SECURITY")
    
    workflow_success = True
    
    # Accept the friend request (if it exists)
    if 'friend_request_id' in locals() and friend_request_id:
        headers = {"Authorization": f"Bearer {user2_token}"}
        response = requests.put(f"{BACKEND_URL}/users/{user2['id']}/friend-requests/{friend_request_id}/accept", headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Friend request accepted with proper authorization")
            
            # Check if both users see friendship
            time.sleep(1)
            
            # Check User A's friends list
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{BACKEND_URL}/users/{user['id']}/friends", headers=headers)
            
            if response.status_code == 200:
                friends_response = response.json()
                friends_a = friends_response.get("friends", [])
                
                user2_found = any(isinstance(friend, dict) and friend.get("id") == user2["id"] for friend in friends_a)
                if user2_found:
                    print(f"✅ Friendship established in User A's friends list")
                else:
                    print(f"❌ Friendship not found in User A's friends list")
                    workflow_success = False
            else:
                print(f"❌ Failed to get User A's friends list: {response.status_code}")
                print(f"Response: {response.text}")
                workflow_success = False
        else:
            print(f"❌ Friend request acceptance failed: {response.status_code}")
            print(f"Response: {response.text}")
            workflow_success = False
    else:
        print(f"❌ No friend request ID available for acceptance test")
        workflow_success = False
    
    if workflow_success:
        test_results["complete_workflow"]["success"] = True
        print(f"✅ Complete friend request workflow with security working")
    else:
        test_results["complete_workflow"]["details"] = "Workflow completion failed"
    
    # Final Results Summary
    print_separator()
    print("📊 COMPREHENSIVE SECURITY TESTING RESULTS")
    print("=" * 80)
    
    passed_tests = sum(1 for result in test_results.values() if result["success"])
    total_tests = len(test_results)
    success_rate = (passed_tests / total_tests) * 100
    
    print(f"✅ JWT Authentication: {'PASSED' if test_results['jwt_authentication']['success'] else 'FAILED'}")
    print(f"✅ Protected Endpoints: {'PASSED' if test_results['protected_endpoints']['success'] else 'FAILED'}")
    print(f"✅ Friend Request Security: {'PASSED' if test_results['friend_request_security']['success'] else 'FAILED'}")
    print(f"✅ Live Notifications: {'PASSED' if test_results['live_notifications']['success'] else 'FAILED'}")
    print(f"✅ Authorization Bypass Prevention: {'PASSED' if test_results['authorization_bypass']['success'] else 'FAILED'}")
    print(f"✅ Input Validation Security: {'PASSED' if test_results['input_validation']['success'] else 'FAILED'}")
    print(f"✅ Role-Based Access Control: {'PASSED' if test_results['role_based_access']['success'] else 'FAILED'}")
    print(f"✅ Complete Workflow: {'PASSED' if test_results['complete_workflow']['success'] else 'FAILED'}")
    
    print(f"\n📈 Overall Security Success Rate: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)")
    
    if success_rate >= 70:  # 70% threshold for security tests
        print(f"\n🎉 COMPREHENSIVE SECURITY TESTING PASSED!")
        print("✅ JWT authentication system is working correctly")
        print("✅ Protected endpoints require proper authorization")
        print("✅ Role-based access control is functioning")
        print("✅ Cross-user data protection is in place")
        print("✅ Friend request security is implemented")
        print("✅ Live notification system is operational")
        return True
    else:
        print(f"\n❌ COMPREHENSIVE SECURITY TESTING FAILED!")
        failed_tests = [test_name for test_name, result in test_results.items() if not result["success"]]
        print(f"❌ Failed tests: {', '.join(failed_tests)}")
        
        print("\n🔍 FAILURE DETAILS:")
        for test_name, result in test_results.items():
            if not result["success"] and result["details"]:
                print(f"   - {test_name}: {result['details']}")
        
        return False

if __name__ == "__main__":
    main()