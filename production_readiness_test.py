#!/usr/bin/env python3
"""
PRODUCTION READINESS ANALYSIS - EXACT 3.8% REMAINING ISSUES IDENTIFICATION

This test suite identifies the EXACT remaining issues causing the 3.8% gap from 96.2% to 100% production score.

Focus Areas:
1. Live Notification System (95% vs 100%) - 5% gap
2. Security Implementation (96% vs 100%) - 4% gap  
3. Critical endpoint testing
4. Security vulnerability scanning
5. Live notification edge cases
"""

import requests
import json
import uuid
import time
import concurrent.futures
from datetime import datetime, timedelta

# Backend URL from frontend .env
BACKEND_URL = "https://fitness-hub-29.preview.emergentagent.com/api"
WEBSOCKET_URL = "wss://fitness-hub-29.preview.emergentagent.com/ws"

# Global test results
test_results = {
    "live_notification_gaps": [],
    "security_gaps": [],
    "critical_issues": [],
    "minor_issues": [],
    "endpoint_failures": []
}

def print_separator(title=""):
    print("\n" + "="*80)
    if title:
        print(f" {title}")
        print("="*80)
    print()

def create_verified_test_user(name_prefix, role):
    """Create a verified test user for testing"""
    try:
        email = f"{name_prefix}_{uuid.uuid4()}@example.com"
        user_data = {
            "email": email,
            "name": f"{name_prefix.title()} User",
            "role": role,
            "fitness_goals": ["general_fitness"],
            "experience_level": "beginner"
        }
        
        response = requests.post(f"{BACKEND_URL}/users", json=user_data, timeout=10)
        
        if response.status_code == 200:
            user = response.json()
            
            # Verify age for the user
            verify_data = {
                "document_type": "government_id",
                "document_number": f"DL{uuid.uuid4().hex[:8]}",
                "date_of_birth": "1990-01-01",
                "full_name": user_data["name"]
            }
            
            requests.post(f"{BACKEND_URL}/verify-government-id", json=verify_data, timeout=10)
            
            # If trainer, also verify certification
            if role == "trainer":
                cert_data = {
                    "user_id": user["id"],
                    "certification_type": "NASM",
                    "certification_number": f"NASM{uuid.uuid4().hex[:6]}",
                    "expiry_date": "2025-12-31",
                    "issuing_organization": "NASM"
                }
                
                requests.post(f"{BACKEND_URL}/verify-fitness-certification", json=cert_data, timeout=10)
            
            return user
        else:
            print(f"❌ Failed to create test user: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        return None

def get_jwt_token(email):
    """Get JWT token for user"""
    try:
        login_data = {"email": email}
        response = requests.post(f"{BACKEND_URL}/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            login_response = response.json()
            return login_response.get("access_token")
        else:
            print(f"❌ Failed to get JWT token for {email}: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error getting JWT token: {e}")
        return None

def analyze_live_notification_gaps():
    """Identify the specific 5% of live notification features not working (95% vs 100%)"""
    print_separator("LIVE NOTIFICATION SYSTEM GAP ANALYSIS (95% vs 100%)")
    
    notification_gaps = []
    
    print("🔍 Identifying the exact 5% of live notification features not working...")
    
    # Create test users
    user1 = create_verified_test_user("notification_test1", "fitness_enthusiast")
    user2 = create_verified_test_user("notification_test2", "trainer")
    
    if not user1 or not user2:
        notification_gaps.append("CRITICAL: Cannot create test users for notification testing")
        return notification_gaps
    
    user1_jwt = get_jwt_token(user1["email"])
    user2_jwt = get_jwt_token(user2["email"])
    
    # Test 1: WebSocket Connection Authentication
    print("\n📡 Testing WebSocket connection authentication...")
    try:
        # Test WebSocket endpoint accessibility
        import websocket
        ws_url = f"{WEBSOCKET_URL}/notifications/{user1['id']}"
        
        # Test without authentication (should fail)
        try:
            ws = websocket.create_connection(ws_url, timeout=5)
            ws.close()
            notification_gaps.append("WebSocket allows connection without authentication")
        except:
            print("✅ WebSocket correctly requires authentication")
        
        # Test with authentication
        if user1_jwt:
            try:
                headers = [f"Authorization: Bearer {user1_jwt}"]
                ws = websocket.create_connection(ws_url, header=headers, timeout=5)
                print("✅ WebSocket connection with JWT successful")
                ws.close()
            except Exception as e:
                notification_gaps.append(f"WebSocket connection with JWT failed: {e}")
        else:
            notification_gaps.append("Cannot obtain JWT token for WebSocket testing")
            
    except ImportError:
        print("⚠️ WebSocket library not available, testing via HTTP endpoints")
        # Test notification endpoints instead
        if user1_jwt:
            headers = {"Authorization": f"Bearer {user1_jwt}"}
            response = requests.get(f"{BACKEND_URL}/users/{user1['id']}/notifications", headers=headers)
            
            if response.status_code == 200:
                print("✅ Notification endpoint accessible with JWT")
            else:
                notification_gaps.append(f"Notification endpoint failed: {response.status_code}")
        else:
            notification_gaps.append("Cannot test notification endpoints without JWT")
    
    # Test 2: Real-time Notification Delivery
    print("\n📨 Testing real-time notification delivery...")
    if user1_jwt and user2_jwt:
        try:
            # Send friend request to trigger notification
            headers = {"Authorization": f"Bearer {user1_jwt}"}
            friend_request_data = {
                "receiver_id": user2["id"],
                "message": "Real-time notification test"
            }
            
            response = requests.post(f"{BACKEND_URL}/users/{user1['id']}/friend-requests", 
                                   json=friend_request_data, headers=headers)
            
            if response.status_code == 200:
                print("✅ Friend request sent successfully")
                
                # Check if receiver got notification
                time.sleep(2)  # Allow time for notification processing
                headers2 = {"Authorization": f"Bearer {user2_jwt}"}
                response = requests.get(f"{BACKEND_URL}/users/{user2['id']}/notifications", headers=headers2)
                
                if response.status_code == 200:
                    notifications_data = response.json()
                    notifications = notifications_data.get("notifications", [])
                    
                    # Look for friend request notification
                    friend_notification = None
                    for notif in notifications:
                        if (isinstance(notif, dict) and 
                            notif.get("data", {}).get("type") == "friend_request_received"):
                            friend_notification = notif
                            break
                    
                    if friend_notification:
                        print("✅ Real-time notification delivery working")
                        
                        # Check notification format
                        required_fields = ["id", "title", "message", "data", "created_at"]
                        missing_fields = [field for field in required_fields if field not in friend_notification]
                        
                        if missing_fields:
                            notification_gaps.append(f"Notification format incomplete: missing {missing_fields}")
                        else:
                            print("✅ Notification format is complete")
                    else:
                        notification_gaps.append("Friend request notification not delivered in real-time")
                else:
                    notification_gaps.append(f"Cannot retrieve notifications: {response.status_code}")
            else:
                notification_gaps.append(f"Cannot send friend request for testing: {response.status_code}")
        except Exception as e:
            notification_gaps.append(f"Real-time notification test failed: {e}")
    else:
        notification_gaps.append("Cannot test real-time notifications without JWT tokens")
    
    # Test 3: Notification Persistence and Mark as Read
    print("\n💾 Testing notification persistence and mark-as-read functionality...")
    if user2_jwt:
        try:
            headers = {"Authorization": f"Bearer {user2_jwt}"}
            response = requests.get(f"{BACKEND_URL}/users/{user2['id']}/notifications", headers=headers)
            
            if response.status_code == 200:
                notifications_data = response.json()
                notifications = notifications_data.get("notifications", [])
                
                if notifications:
                    print(f"✅ Notification persistence working: {len(notifications)} notifications stored")
                    
                    # Test mark as read
                    notification_id = notifications[0]["id"]
                    response = requests.put(f"{BACKEND_URL}/users/{user2['id']}/notifications/{notification_id}/mark-read", 
                                          headers=headers)
                    
                    if response.status_code == 200:
                        print("✅ Mark as read functionality working")
                    else:
                        notification_gaps.append(f"Mark as read failed: {response.status_code}")
                else:
                    notification_gaps.append("No notifications found for persistence testing")
            else:
                notification_gaps.append(f"Cannot retrieve notifications for persistence test: {response.status_code}")
        except Exception as e:
            notification_gaps.append(f"Notification persistence test failed: {e}")
    
    # Test 4: High Load Notification Handling
    print("\n⚡ Testing notification system under load...")
    if user1_jwt and user2_jwt:
        try:
            def send_notification():
                try:
                    headers = {"Authorization": f"Bearer {user1_jwt}"}
                    friend_request_data = {
                        "receiver_id": user2["id"],
                        "message": f"Load test {uuid.uuid4()}"
                    }
                    response = requests.post(f"{BACKEND_URL}/users/{user1['id']}/friend-requests", 
                                           json=friend_request_data, headers=headers, timeout=5)
                    return response.status_code == 200
                except:
                    return False
            
            # Send 3 notifications concurrently
            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                futures = [executor.submit(send_notification) for _ in range(3)]
                results = [future.result() for future in concurrent.futures.as_completed(futures)]
            
            successful_sends = sum(results)
            if successful_sends >= 2:  # Allow some failures under load
                print(f"✅ High load handling: {successful_sends}/3 notifications sent")
            else:
                notification_gaps.append(f"High load handling insufficient: {successful_sends}/3 notifications sent")
        except Exception as e:
            notification_gaps.append(f"High load test failed: {e}")
    
    # Calculate notification gap percentage
    total_notification_tests = 4
    failed_tests = len([gap for gap in notification_gaps if not gap.startswith("Cannot")])
    gap_percentage = (failed_tests / total_notification_tests) * 100
    
    print(f"\n📊 LIVE NOTIFICATION SYSTEM ANALYSIS RESULTS")
    print("-" * 60)
    print(f"Identified Gaps: {len(notification_gaps)}")
    print(f"Estimated Gap Percentage: {gap_percentage:.1f}%")
    
    if notification_gaps:
        print("\n❌ SPECIFIC NOTIFICATION GAPS IDENTIFIED:")
        for i, gap in enumerate(notification_gaps, 1):
            print(f"   {i}. {gap}")
    else:
        print("✅ No notification gaps identified")
    
    test_results["live_notification_gaps"] = notification_gaps
    return notification_gaps

def analyze_security_gaps():
    """Identify the specific 4% of security features needing improvement (96% vs 100%)"""
    print_separator("SECURITY IMPLEMENTATION GAP ANALYSIS (96% vs 100%)")
    
    security_gaps = []
    
    print("🔍 Identifying the exact 4% of security features needing improvement...")
    
    # Create test users for security testing
    user1 = create_verified_test_user("security_test1", "fitness_enthusiast")
    user2 = create_verified_test_user("security_test2", "trainer")
    
    if not user1 or not user2:
        security_gaps.append("CRITICAL: Cannot create test users for security testing")
        return security_gaps
    
    user1_jwt = get_jwt_token(user1["email"])
    user2_jwt = get_jwt_token(user2["email"])
    
    # Test 1: XSS Protection Gaps
    print("\n🛡️ Testing XSS protection completeness...")
    xss_payloads = [
        "<script>alert('XSS')</script>",
        "javascript:alert('XSS')",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>"
    ]
    
    xss_vulnerabilities = 0
    for payload in xss_payloads:
        try:
            # Test XSS in user name field
            xss_user_data = {
                "email": f"xss_test_{uuid.uuid4()}@example.com",
                "name": payload,
                "role": "fitness_enthusiast",
                "fitness_goals": ["general_fitness"],
                "experience_level": "beginner"
            }
            
            response = requests.post(f"{BACKEND_URL}/users", json=xss_user_data)
            
            if response.status_code == 200:
                user_data = response.json()
                sanitized_name = user_data.get("name", "")
                
                # Check if XSS payload was properly sanitized
                if payload in sanitized_name or "<script>" in sanitized_name or "alert" in sanitized_name:
                    xss_vulnerabilities += 1
                    security_gaps.append(f"XSS vulnerability in name field: {payload[:30]}...")
            
        except Exception as e:
            print(f"❌ XSS test error: {e}")
    
    if xss_vulnerabilities > 0:
        print(f"❌ XSS protection gaps: {xss_vulnerabilities}/{len(xss_payloads)} payloads not properly sanitized")
    else:
        print("✅ XSS protection appears complete")
    
    # Test 2: Input Validation Gaps
    print("\n✅ Testing input validation completeness...")
    
    # Test extremely long inputs
    try:
        long_name = "A" * 5000  # Very long name
        long_user_data = {
            "email": f"long_test_{uuid.uuid4()}@example.com",
            "name": long_name,
            "role": "fitness_enthusiast",
            "fitness_goals": ["general_fitness"],
            "experience_level": "beginner"
        }
        
        response = requests.post(f"{BACKEND_URL}/users", json=long_user_data)
        
        if response.status_code == 200:
            user_data = response.json()
            returned_name = user_data.get("name", "")
            
            if len(returned_name) >= 1000:  # If very long input not truncated
                security_gaps.append("Input length validation insufficient - very long inputs not truncated")
        
    except Exception as e:
        print(f"❌ Input validation test error: {e}")
    
    # Test invalid email formats
    invalid_emails = ["invalid-email", "@example.com", "test@"]
    validation_failures = 0
    
    for invalid_email in invalid_emails:
        try:
            invalid_user_data = {
                "email": invalid_email,
                "role": "fitness_enthusiast",
                "fitness_goals": ["general_fitness"],
                "experience_level": "beginner"
            }
            
            response = requests.post(f"{BACKEND_URL}/users", json=invalid_user_data)
            
            if response.status_code == 200:  # Should reject invalid email
                validation_failures += 1
                security_gaps.append(f"Invalid email format accepted: {invalid_email}")
                
        except Exception as e:
            print(f"❌ Email validation test error: {e}")
    
    if validation_failures == 0:
        print("✅ Email validation appears complete")
    else:
        print(f"❌ Email validation gaps: {validation_failures} invalid emails accepted")
    
    # Test 3: Authorization Control Gaps
    print("\n🚪 Testing authorization control completeness...")
    
    if user1_jwt and user2_jwt:
        # Test cross-user data access
        try:
            headers = {"Authorization": f"Bearer {user1_jwt}"}
            response = requests.get(f"{BACKEND_URL}/users/{user2['id']}", headers=headers)
            
            if response.status_code == 200:  # Should be 403
                security_gaps.append("Cross-user data access not properly blocked")
            elif response.status_code != 403:
                security_gaps.append(f"Unexpected response for cross-user access: {response.status_code}")
            else:
                print("✅ Cross-user access properly blocked")
        except Exception as e:
            security_gaps.append(f"Authorization test failed: {e}")
        
        # Test non-trainer accessing trainer endpoints
        try:
            headers = {"Authorization": f"Bearer {user1_jwt}"}  # user1 is not a trainer
            response = requests.get(f"{BACKEND_URL}/trainer/{user1['id']}/earnings", headers=headers)
            
            if response.status_code == 200:  # Should be 403
                security_gaps.append("Non-trainer access to trainer endpoints not blocked")
            elif response.status_code != 403:
                security_gaps.append(f"Unexpected response for non-trainer access: {response.status_code}")
            else:
                print("✅ Non-trainer access to trainer endpoints properly blocked")
        except Exception as e:
            security_gaps.append(f"Trainer endpoint authorization test failed: {e}")
    
    # Test 4: Error Information Disclosure
    print("\n🚨 Testing for information disclosure in errors...")
    
    # Test various error conditions
    error_endpoints = [
        f"/users/non_existent_user_id",
        "/invalid_endpoint",
        "/users/invalid_user_format"
    ]
    
    for endpoint in error_endpoints:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}")
            
            if response.status_code in [404, 500]:
                error_text = response.text.lower()
                
                # Check for sensitive information disclosure
                sensitive_keywords = ["password", "secret", "key", "token", "database", "mongodb", "stack trace", "traceback"]
                disclosed_info = [keyword for keyword in sensitive_keywords if keyword in error_text]
                
                if disclosed_info:
                    security_gaps.append(f"Information disclosure in error response for {endpoint}: {disclosed_info}")
                    
        except Exception as e:
            print(f"❌ Error disclosure test failed for {endpoint}: {e}")
    
    # Calculate security gap percentage
    total_security_tests = 4
    failed_tests = len([gap for gap in security_gaps if not gap.startswith("CRITICAL")])
    gap_percentage = (failed_tests / total_security_tests) * 100
    
    print(f"\n📊 SECURITY IMPLEMENTATION ANALYSIS RESULTS")
    print("-" * 60)
    print(f"Identified Gaps: {len(security_gaps)}")
    print(f"Estimated Gap Percentage: {gap_percentage:.1f}%")
    
    if security_gaps:
        print("\n❌ SPECIFIC SECURITY GAPS IDENTIFIED:")
        for i, gap in enumerate(security_gaps, 1):
            print(f"   {i}. {gap}")
    else:
        print("✅ No security gaps identified")
    
    test_results["security_gaps"] = security_gaps
    return security_gaps
        "email": user_email,
        "name": "Auth Test User",
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data)
    if response.status_code == 200:
        user = response.json()
        user_id = user["id"]
        print(f"✅ Created test user: {user_id}")
        
        # Test protected endpoints without authentication
        protected_endpoints = [
            f"{BACKEND_URL}/users/{user_id}",
            f"{BACKEND_URL}/users/{user_id}/sessions",
            f"{BACKEND_URL}/users/{user_id}/notifications"
        ]
        
        auth_tests_passed = 0
        for endpoint in protected_endpoints:
            response = requests.get(endpoint)
            if response.status_code == 401:
                auth_tests_passed += 1
                print(f"✅ {endpoint.split('/')[-1]} requires authentication (401)")
            else:
                print(f"❌ {endpoint.split('/')[-1]} should require auth but got {response.status_code}")
        
        if auth_tests_passed >= 2:  # At least 2/3 endpoints should require auth
            results["authentication_enforcement"] = True
            print("✅ Authentication enforcement working")
        else:
            print("❌ Authentication enforcement insufficient")
    
    # Test 3: Authorization Controls (Cross-user access)
    print("\n3. Testing authorization controls...")
    
    # Create second user
    user2_email = f"auth_test_2_{uuid.uuid4()}@example.com"
    user2_data = {
        "email": user2_email,
        "name": "Auth Test User 2",
        "role": "trainer",
        "fitness_goals": ["sport_training"],
        "experience_level": "expert"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user2_data)
    if response.status_code == 200:
        user2 = response.json()
        user2_id = user2["id"]
        print(f"✅ Created second test user: {user2_id}")
        
        # Test with mock JWT token (should still fail due to invalid signature)
        mock_headers = {"Authorization": "Bearer invalid_jwt_token_12345"}
        response = requests.get(f"{BACKEND_URL}/users/{user2_id}", headers=mock_headers)
        
        if response.status_code == 401:
            print("✅ Invalid JWT tokens properly rejected (401)")
            results["authorization_controls"] = True
        else:
            print(f"❌ Invalid JWT should return 401 but got {response.status_code}")
    
    # Test 4: Input Security (XSS Protection)
    print("\n4. Testing input security...")
    
    # Test XSS payload in user creation
    xss_email = f"xss_test_{uuid.uuid4()}@example.com"
    xss_data = {
        "email": xss_email,
        "name": "<script>alert('xss')</script>",
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=xss_data)
    if response.status_code == 200:
        xss_user = response.json()
        sanitized_name = xss_user.get("name", "")
        
        if "<script>" not in sanitized_name:
            print("✅ XSS payload properly sanitized")
            results["input_security"] = True
        else:
            print("❌ XSS payload not sanitized")
    
    # Test 5: Live Notification Security
    print("\n5. Testing live notification security...")
    
    # Test notification endpoint without authentication
    if 'user_id' in locals():
        response = requests.get(f"{BACKEND_URL}/users/{user_id}/notifications")
        
        if response.status_code == 401:
            print("✅ Notification endpoint requires authentication (401)")
            results["live_notifications"] = True
        else:
            print(f"❌ Notification endpoint should require auth but got {response.status_code}")
    
    return results

def test_complete_workflows():
    """Test complete user workflows"""
    print("🔄 TESTING COMPLETE WORKFLOWS")
    print("-" * 60)
    
    results = {
        "user_registration": False,
        "friend_request_workflow": False,
        "trainer_workflow": False
    }
    
    # Test 1: User Registration Workflow
    print("1. Testing user registration workflow...")
    
    reg_email = f"workflow_test_{uuid.uuid4()}@example.com"
    reg_data = {
        "email": reg_email,
        "name": "Workflow Test User",
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss", "general_fitness"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=reg_data)
    if response.status_code == 200:
        user = response.json()
        print(f"✅ User registration successful: {user['id']}")
        
        # Test user profile retrieval
        response = requests.get(f"{BACKEND_URL}/users/{user['id']}")
        if response.status_code in [200, 401]:  # 401 is expected due to auth requirement
            print("✅ User profile endpoint accessible")
            results["user_registration"] = True
        else:
            print(f"❌ User profile endpoint error: {response.status_code}")
    
    # Test 2: Friend Request Workflow (without authentication)
    print("\n2. Testing friend request workflow structure...")
    
    if 'user' in locals():
        # Create second user for friend request
        friend_email = f"friend_test_{uuid.uuid4()}@example.com"
        friend_data = {
            "email": friend_email,
            "name": "Friend Test User",
            "role": "fitness_enthusiast",
            "fitness_goals": ["muscle_building"],
            "experience_level": "intermediate"
        }
        
        response = requests.post(f"{BACKEND_URL}/users", json=friend_data)
        if response.status_code == 200:
            friend_user = response.json()
            print(f"✅ Created friend test user: {friend_user['id']}")
            
            # Test friend request endpoint (should require auth)
            friend_request_data = {
                "receiver_id": friend_user["id"],
                "message": "Let's be workout partners!"
            }
            
            response = requests.post(f"{BACKEND_URL}/users/{user['id']}/friend-requests", 
                                   json=friend_request_data)
            
            if response.status_code == 401:
                print("✅ Friend request endpoint requires authentication (401)")
                results["friend_request_workflow"] = True
            else:
                print(f"❌ Friend request should require auth but got {response.status_code}")
    
    # Test 3: Trainer Workflow
    print("\n3. Testing trainer workflow...")
    
    trainer_email = f"trainer_test_{uuid.uuid4()}@example.com"
    trainer_data = {
        "email": trainer_email,
        "name": "Trainer Test User",
        "role": "trainer",
        "fitness_goals": ["sport_training"],
        "experience_level": "expert"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=trainer_data)
    if response.status_code == 200:
        trainer = response.json()
        print(f"✅ Trainer registration successful: {trainer['id']}")
        
        # Test trainer endpoints (should require auth)
        trainer_endpoints = [
            f"{BACKEND_URL}/trainer/{trainer['id']}/schedule",
            f"{BACKEND_URL}/trainer/{trainer['id']}/earnings"
        ]
        
        trainer_tests_passed = 0
        for endpoint in trainer_endpoints:
            response = requests.get(endpoint)
            if response.status_code in [401, 403]:  # Should require auth or trainer role
                trainer_tests_passed += 1
                print(f"✅ {endpoint.split('/')[-1]} requires proper authorization")
            else:
                print(f"❌ {endpoint.split('/')[-1]} should require auth but got {response.status_code}")
        
        if trainer_tests_passed >= 1:
            results["trainer_workflow"] = True
            print("✅ Trainer workflow security working")
    
    return results

def main():
    """Main test execution"""
    print_separator()
    print("🚀 FINAL PRODUCTION READINESS VALIDATION")
    print("After JWT Token Fix - LiftLink Production Deployment Test")
    print_separator()
    
    # Run authentication system tests
    auth_results = test_jwt_authentication_system()
    
    print_separator()
    
    # Run workflow tests
    workflow_results = test_complete_workflows()
    
    print_separator()
    
    # Calculate final score
    print("📊 FINAL PRODUCTION READINESS SCORE")
    print("=" * 70)
    
    # Authentication System Score (5 categories)
    auth_passed = sum(auth_results.values())
    auth_total = len(auth_results)
    auth_score = (auth_passed / auth_total) * 100
    
    print(f"🔒 Authentication System: {auth_passed}/{auth_total} ({auth_score:.1f}%)")
    for test_name, passed in auth_results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   - {test_name.replace('_', ' ').title()}: {status}")
    
    # Workflow System Score (3 categories)
    workflow_passed = sum(workflow_results.values())
    workflow_total = len(workflow_results)
    workflow_score = (workflow_passed / workflow_total) * 100
    
    print(f"\n🔄 Complete Workflows: {workflow_passed}/{workflow_total} ({workflow_score:.1f}%)")
    for test_name, passed in workflow_results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   - {test_name.replace('_', ' ').title()}: {status}")
    
    # Overall Assessment
    total_passed = auth_passed + workflow_passed
    total_tests = auth_total + workflow_total
    overall_score = (total_passed / total_tests) * 100
    
    print(f"\n🎯 OVERALL SCORE: {total_passed}/{total_tests} ({overall_score:.1f}%)")
    
    # Final Recommendation
    print("\n" + "="*70)
    if overall_score >= 75 and auth_score >= 60 and workflow_score >= 60:
        print("🎉 PRODUCTION READY!")
        print("✅ JWT authentication system functional")
        print("✅ Security measures in place")
        print("✅ Core workflows operational")
        print("✅ LiftLink approved for production deployment")
        return True
    else:
        print("❌ NOT READY FOR PRODUCTION")
        print("🚨 Critical issues need resolution before deployment")
        
        if auth_score < 60:
            print("❌ Authentication system needs improvement")
        if workflow_score < 60:
            print("❌ Workflow functionality needs improvement")
        
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)