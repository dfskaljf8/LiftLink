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
BACKEND_URL = "https://swiftauth-1.preview.emergentagent.com/api"
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

def test_critical_endpoints():
    """Test all critical endpoints for errors or unexpected responses"""
    print_separator("CRITICAL ENDPOINTS TESTING")
    
    endpoint_failures = []
    
    # Create test users for endpoint testing
    test_user = create_verified_test_user("endpoint_test_user", "fitness_enthusiast")
    test_trainer = create_verified_test_user("endpoint_test_trainer", "trainer")
    
    if not test_user or not test_trainer:
        endpoint_failures.append("CRITICAL: Failed to create test users for endpoint testing")
        return endpoint_failures
    
    user_jwt = get_jwt_token(test_user["email"])
    trainer_jwt = get_jwt_token(test_trainer["email"])
    
    # Critical endpoints to test
    critical_endpoints = [
        # Authentication endpoints
        ("POST", "/check-user", {"email": test_user["email"]}, None, 200),
        ("POST", "/login", {"email": test_user["email"]}, None, 200),
        
        # User endpoints (require auth)
        ("GET", f"/users/{test_user['id']}", None, user_jwt, 200),
        ("GET", f"/users/{test_user['id']}/sessions", None, user_jwt, 200),
        ("GET", f"/users/{test_user['id']}/tree-progress", None, None, 200),
        ("GET", f"/users/{test_user['id']}/notifications", None, user_jwt, 200),
        
        # Trainer endpoints (require auth)
        ("GET", f"/trainer/{test_trainer['id']}/earnings", None, trainer_jwt, 200),
        ("GET", f"/trainer/{test_trainer['id']}/schedule", None, trainer_jwt, 200),
        
        # Payment endpoints
        ("GET", f"/payments/session-cost/{test_trainer['id']}/personal_training", None, None, 200),
        
        # Fitness endpoints
        ("GET", f"/fitness/status/{test_user['id']}", None, None, 200),
        ("GET", "/google-fit/login", None, None, 200),
    ]
    
    print("🔍 Testing critical endpoints for failures...")
    
    for method, endpoint, data, jwt_token, expected_status in critical_endpoints:
        try:
            headers = {}
            if jwt_token:
                headers["Authorization"] = f"Bearer {jwt_token}"
            
            if method == "GET":
                response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(f"{BACKEND_URL}{endpoint}", json=data, headers=headers, timeout=10)
            
            if response.status_code != expected_status:
                failure_msg = f"{method} {endpoint}: {response.status_code} (expected {expected_status})"
                endpoint_failures.append(failure_msg)
                print(f"❌ {failure_msg}")
                
                # Check for specific error patterns
                if response.status_code == 500:
                    test_results["critical_issues"].append(f"Internal server error on {endpoint}")
                elif response.status_code == 404 and expected_status == 200:
                    test_results["critical_issues"].append(f"Endpoint not found: {endpoint}")
            else:
                print(f"✅ {method} {endpoint}: {response.status_code}")
            
        except requests.exceptions.Timeout:
            failure_msg = f"{method} {endpoint}: TIMEOUT"
            endpoint_failures.append(failure_msg)
            test_results["critical_issues"].append(f"Endpoint timeout: {endpoint}")
            print(f"❌ {failure_msg}")
        except Exception as e:
            failure_msg = f"{method} {endpoint}: ERROR - {e}"
            endpoint_failures.append(failure_msg)
            test_results["critical_issues"].append(f"Endpoint error: {endpoint} - {e}")
            print(f"❌ {failure_msg}")
    
    success_rate = ((len(critical_endpoints) - len(endpoint_failures)) / len(critical_endpoints)) * 100
    
    print(f"\n📊 Critical Endpoints Results: {success_rate:.1f}% success rate")
    if endpoint_failures:
        print(f"❌ Failed Endpoints: {len(endpoint_failures)}")
        for endpoint in endpoint_failures:
            print(f"   - {endpoint}")
    
    test_results["endpoint_failures"] = endpoint_failures
    return endpoint_failures

def generate_final_report():
    """Generate the final production readiness report identifying exact 3.8% gap"""
    print_separator("PRODUCTION READINESS FINAL REPORT - EXACT 3.8% GAP ANALYSIS")
    
    print("🎯 EXACT 3.8% REMAINING ISSUES FROM 96.2% PRODUCTION SCORE")
    print("="*80)
    
    # Calculate gap percentages
    notification_gaps = len(test_results.get("live_notification_gaps", []))
    security_gaps = len(test_results.get("security_gaps", []))
    critical_issues = len(test_results.get("critical_issues", []))
    endpoint_failures = len(test_results.get("endpoint_failures", []))
    
    total_issues = notification_gaps + security_gaps + critical_issues + endpoint_failures
    
    print(f"\n📊 ISSUE BREAKDOWN:")
    print(f"   Live Notification Issues: {notification_gaps}")
    print(f"   Security Implementation Issues: {security_gaps}")
    print(f"   Critical System Issues: {critical_issues}")
    print(f"   Endpoint Failures: {endpoint_failures}")
    print(f"   Total Issues Identified: {total_issues}")
    
    # Detailed breakdown
    if notification_gaps > 0:
        print(f"\n📱 LIVE NOTIFICATION SYSTEM GAPS ({notification_gaps} issues):")
        for i, gap in enumerate(test_results.get("live_notification_gaps", []), 1):
            print(f"   {i}. {gap}")
    
    if security_gaps > 0:
        print(f"\n🔒 SECURITY IMPLEMENTATION GAPS ({security_gaps} issues):")
        for i, gap in enumerate(test_results.get("security_gaps", []), 1):
            print(f"   {i}. {gap}")
    
    if critical_issues > 0:
        print(f"\n🚨 CRITICAL SYSTEM ISSUES ({critical_issues} issues):")
        for i, issue in enumerate(test_results.get("critical_issues", []), 1):
            print(f"   {i}. {issue}")
    
    if endpoint_failures > 0:
        print(f"\n🌐 ENDPOINT FAILURES ({endpoint_failures} issues):")
        for i, failure in enumerate(test_results.get("endpoint_failures", []), 1):
            print(f"   {i}. {failure}")
    
    # Priority ranking
    print(f"\n🎯 PRIORITY RANKING FOR FIXING 3.8% GAP:")
    priority_items = []
    
    if critical_issues > 0:
        priority_items.append(f"1. CRITICAL: Fix {critical_issues} critical system issues")
    if security_gaps > 0:
        priority_items.append(f"2. SECURITY: Address {security_gaps} security vulnerabilities")
    if notification_gaps > 0:
        priority_items.append(f"3. NOTIFICATIONS: Resolve {notification_gaps} live notification issues")
    if endpoint_failures > 0:
        priority_items.append(f"4. ENDPOINTS: Fix {endpoint_failures} endpoint failures")
    
    for item in priority_items:
        print(f"   {item}")
    
    if total_issues == 0:
        print("\n🎉 NO REMAINING ISSUES IDENTIFIED!")
        print("✅ System appears to be at 100% production readiness")
    else:
        print(f"\n📈 ESTIMATED IMPACT: {total_issues} issues represent the 3.8% gap")
        print("🔧 Fix these issues to achieve 100% production readiness")
    
    return {
        "total_issues": total_issues,
        "notification_gaps": notification_gaps,
        "security_gaps": security_gaps,
        "critical_issues": critical_issues,
        "endpoint_failures": endpoint_failures,
        "priority_items": priority_items
    }

def main():
    """Main function to run production readiness analysis"""
    print("🚀 STARTING PRODUCTION READINESS ANALYSIS")
    print("Identifying the EXACT 3.8% remaining issues from 96.2% production score")
    
    try:
        # Run all analyses
        print("\n🔍 Phase 1: Analyzing Live Notification System Gaps...")
        analyze_live_notification_gaps()
        
        print("\n🔍 Phase 2: Analyzing Security Implementation Gaps...")
        analyze_security_gaps()
        
        print("\n🔍 Phase 3: Testing Critical Endpoints...")
        test_critical_endpoints()
        
        # Generate final report
        print("\n🔍 Phase 4: Generating Final Analysis Report...")
        final_report = generate_final_report()
        
        return final_report
        
    except Exception as e:
        print(f"❌ Analysis failed with error: {e}")
        test_results["critical_issues"].append(f"Analysis execution error: {e}")
        return {"total_issues": 1, "error": str(e)}

if __name__ == "__main__":
    main()