#!/usr/bin/env python3
"""
Google API Integration 403 Error Handling Test Suite
Tests the updated Google API integration with proper error handling for 403 errors
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

def test_google_fit_login():
    """Test Google Fit Login: GET /api/google-fit/login
    - Should return mock authentication URL when API is not configured
    - Should log proper error messages
    - Should not return 403 errors
    """
    print_test_header("GOOGLE FIT LOGIN - 403 ERROR HANDLING")
    
    print("Testing GET /api/google-fit/login endpoint...")
    response = requests.get(f"{BACKEND_URL}/google-fit/login")
    
    print(f"Response Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    try:
        response_data = response.json()
        print(f"Response Body: {json.dumps(response_data, indent=2)}")
    except:
        print(f"Response Text: {response.text}")
    
    # Test expectations
    success = True
    issues = []
    
    # Should NOT return 403 errors
    if response.status_code == 403:
        success = False
        issues.append("❌ CRITICAL: Endpoint returned 403 Forbidden - this should be handled gracefully")
    
    # Should return either 501 (not configured) or 200 (mock auth URL)
    if response.status_code == 501:
        print("✅ EXPECTED: API returns 501 when not configured")
        try:
            data = response.json()
            if "not configured" in data.get("detail", "").lower():
                print("✅ EXPECTED: Proper error message for unconfigured API")
            else:
                issues.append("⚠️  Error message could be more descriptive about configuration")
        except:
            issues.append("❌ Response should be valid JSON")
            success = False
    
    elif response.status_code == 200:
        print("✅ EXPECTED: API returns 200 with mock authentication")
        try:
            data = response.json()
            if "authorization_url" in data:
                print("✅ EXPECTED: Mock authentication URL provided")
                print(f"   Mock Auth URL: {data['authorization_url']}")
            if "mock_auth" in data.get("status", ""):
                print("✅ EXPECTED: Mock mode status indicated")
            if "message" in data:
                print(f"✅ EXPECTED: Descriptive message: {data['message']}")
        except:
            issues.append("❌ Response should be valid JSON")
            success = False
    
    else:
        issues.append(f"❌ Unexpected status code: {response.status_code}")
        success = False
    
    # Print results
    if success and not issues:
        print("\n🎉 GOOGLE FIT LOGIN TEST: PASSED")
        print("✅ No 403 errors detected")
        print("✅ Proper error handling implemented")
        print("✅ Mock authentication working correctly")
    else:
        print("\n❌ GOOGLE FIT LOGIN TEST: ISSUES FOUND")
        for issue in issues:
            print(f"   {issue}")
    
    return success, issues

def test_google_calendar_schedule():
    """Test Google Calendar Schedule: GET /api/trainer/trainer_001/schedule
    - Should return mock schedule data when API returns 403
    - Should handle API configuration errors gracefully
    - Should log proper error messages
    """
    print_test_header("GOOGLE CALENDAR SCHEDULE - 403 ERROR HANDLING")
    
    trainer_id = "trainer_001"
    print(f"Testing GET /api/trainer/{trainer_id}/schedule endpoint...")
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer_id}/schedule")
    
    print(f"Response Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    try:
        response_data = response.json()
        print(f"Response Body: {json.dumps(response_data, indent=2)}")
    except:
        print(f"Response Text: {response.text}")
    
    # Test expectations
    success = True
    issues = []
    
    # Should NOT return 403 errors
    if response.status_code == 403:
        success = False
        issues.append("❌ CRITICAL: Endpoint returned 403 Forbidden - should fallback to mock data")
    
    # Should return 200 with schedule data (mock or real)
    if response.status_code == 200:
        print("✅ EXPECTED: API returns 200 with schedule data")
        try:
            data = response.json()
            if "schedule" in data:
                schedule = data["schedule"]
                print(f"✅ EXPECTED: Schedule data provided ({len(schedule)} events)")
                
                # Verify schedule structure
                if isinstance(schedule, list):
                    print("✅ EXPECTED: Schedule is a list of events")
                    
                    if schedule:  # If there are events
                        first_event = schedule[0]
                        expected_fields = ["id", "title", "start_time", "end_time"]
                        missing_fields = [field for field in expected_fields if field not in first_event]
                        
                        if not missing_fields:
                            print("✅ EXPECTED: Schedule events have proper structure")
                        else:
                            issues.append(f"⚠️  Schedule events missing fields: {missing_fields}")
                    else:
                        print("✅ EXPECTED: Empty schedule (valid for new trainer)")
                else:
                    issues.append("❌ Schedule should be a list")
                    success = False
            else:
                issues.append("❌ Response should contain 'schedule' field")
                success = False
        except:
            issues.append("❌ Response should be valid JSON")
            success = False
    
    else:
        issues.append(f"❌ Unexpected status code: {response.status_code}")
        success = False
    
    # Print results
    if success and not issues:
        print("\n🎉 GOOGLE CALENDAR SCHEDULE TEST: PASSED")
        print("✅ No 403 errors detected")
        print("✅ Mock schedule data returned successfully")
        print("✅ Proper fallback handling implemented")
    else:
        print("\n❌ GOOGLE CALENDAR SCHEDULE TEST: ISSUES FOUND")
        for issue in issues:
            print(f"   {issue}")
    
    return success, issues

def test_google_wallet_payment():
    """Test Google Wallet Payment: POST /api/payments/google-pay/create-session
    - Should return mock session when API is not configured
    - Should handle authentication errors properly
    """
    print_test_header("GOOGLE WALLET PAYMENT - 403 ERROR HANDLING")
    
    # Test data
    payment_request = {
        "amount": 7500,  # $75.00 in cents
        "currency": "usd",
        "trainer_id": "trainer_001",
        "client_email": "test.client@example.com",
        "session_details": {
            "session_type": "Personal Training",
            "duration": 60,
            "location": "Gym A"
        }
    }
    
    print("Testing POST /api/payments/google-pay/create-session endpoint...")
    print(f"Request Data: {json.dumps(payment_request, indent=2)}")
    
    response = requests.post(f"{BACKEND_URL}/payments/google-pay/create-session", json=payment_request)
    
    print(f"Response Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    try:
        response_data = response.json()
        print(f"Response Body: {json.dumps(response_data, indent=2)}")
    except:
        print(f"Response Text: {response.text}")
    
    # Test expectations
    success = True
    issues = []
    
    # Should NOT return 403 errors
    if response.status_code == 403:
        success = False
        issues.append("❌ CRITICAL: Endpoint returned 403 Forbidden - should fallback to mock session")
    
    # Should return 200 with session data (mock or real)
    if response.status_code == 200:
        print("✅ EXPECTED: API returns 200 with payment session")
        try:
            data = response.json()
            
            # Check for session data
            expected_fields = ["session_id", "status"]
            present_fields = [field for field in expected_fields if field in data]
            
            if present_fields:
                print(f"✅ EXPECTED: Payment session data provided (fields: {present_fields})")
                
                if "session_id" in data:
                    print(f"   Session ID: {data['session_id']}")
                
                if "status" in data:
                    print(f"   Status: {data['status']}")
                    
                if "mock_mode" in data and data["mock_mode"]:
                    print("✅ EXPECTED: Mock mode indicated when API not configured")
                    
            else:
                issues.append("❌ Response should contain session data")
                success = False
                
        except:
            issues.append("❌ Response should be valid JSON")
            success = False
    
    elif response.status_code == 500:
        # Check if it's a graceful error with proper message
        try:
            data = response.json()
            if "not configured" in data.get("detail", "").lower():
                print("✅ ACCEPTABLE: Graceful error for unconfigured API")
            else:
                issues.append("❌ 500 error should have descriptive message about configuration")
                success = False
        except:
            issues.append("❌ 500 error should return valid JSON with error details")
            success = False
    
    else:
        issues.append(f"❌ Unexpected status code: {response.status_code}")
        success = False
    
    # Print results
    if success and not issues:
        print("\n🎉 GOOGLE WALLET PAYMENT TEST: PASSED")
        print("✅ No 403 errors detected")
        print("✅ Proper authentication error handling")
        print("✅ Mock session handling working correctly")
    else:
        print("\n❌ GOOGLE WALLET PAYMENT TEST: ISSUES FOUND")
        for issue in issues:
            print(f"   {issue}")
    
    return success, issues

def test_fitness_status():
    """Test Fitness Status: GET /api/fitness/status/user_001
    - Should return proper connection status
    - Should handle mock mode properly
    """
    print_test_header("FITNESS STATUS - 403 ERROR HANDLING")
    
    user_id = "user_001"
    print(f"Testing GET /api/fitness/status/{user_id} endpoint...")
    response = requests.get(f"{BACKEND_URL}/fitness/status/{user_id}")
    
    print(f"Response Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    try:
        response_data = response.json()
        print(f"Response Body: {json.dumps(response_data, indent=2)}")
    except:
        print(f"Response Text: {response.text}")
    
    # Test expectations
    success = True
    issues = []
    
    # Should NOT return 403 errors
    if response.status_code == 403:
        success = False
        issues.append("❌ CRITICAL: Endpoint returned 403 Forbidden - should handle gracefully")
    
    # Should return 200 with fitness status or 404 if user not found
    if response.status_code == 200:
        print("✅ EXPECTED: API returns 200 with fitness status")
        try:
            data = response.json()
            
            # Check for required fields (after Fitbit removal)
            expected_fields = ["google_fit_connected", "last_sync"]
            missing_fields = [field for field in expected_fields if field not in data]
            
            if not missing_fields:
                print("✅ EXPECTED: All required fitness status fields present")
                print(f"   Google Fit Connected: {data['google_fit_connected']}")
                print(f"   Last Sync: {data['last_sync']}")
                
                # Should NOT have fitbit_connected field (removed)
                if "fitbit_connected" in data:
                    issues.append("⚠️  fitbit_connected field should be removed")
                else:
                    print("✅ EXPECTED: fitbit_connected field properly removed")
                    
            else:
                issues.append(f"❌ Missing required fields: {missing_fields}")
                success = False
                
        except:
            issues.append("❌ Response should be valid JSON")
            success = False
    
    elif response.status_code == 404:
        print("✅ ACCEPTABLE: User not found (404) - proper error handling")
        try:
            data = response.json()
            if "not found" in data.get("detail", "").lower():
                print("✅ EXPECTED: Proper error message for missing user")
            else:
                issues.append("⚠️  Error message could be more descriptive")
        except:
            issues.append("❌ 404 response should be valid JSON")
    
    else:
        issues.append(f"❌ Unexpected status code: {response.status_code}")
        success = False
    
    # Print results
    if success and not issues:
        print("\n🎉 FITNESS STATUS TEST: PASSED")
        print("✅ No 403 errors detected")
        print("✅ Proper connection status handling")
        print("✅ Mock mode handling working correctly")
    else:
        print("\n❌ FITNESS STATUS TEST: ISSUES FOUND")
        for issue in issues:
            print(f"   {issue}")
    
    return success, issues

def run_all_tests():
    """Run all Google API 403 error handling tests"""
    print("🚀 STARTING GOOGLE API 403 ERROR HANDLING TEST SUITE")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().isoformat()}")
    
    all_results = []
    
    # Run all tests
    tests = [
        ("Google Fit Login", test_google_fit_login),
        ("Google Calendar Schedule", test_google_calendar_schedule),
        ("Google Wallet Payment", test_google_wallet_payment),
        ("Fitness Status", test_fitness_status)
    ]
    
    for test_name, test_func in tests:
        try:
            success, issues = test_func()
            all_results.append({
                "test": test_name,
                "success": success,
                "issues": issues
            })
        except Exception as e:
            print(f"\n❌ CRITICAL ERROR in {test_name}: {str(e)}")
            all_results.append({
                "test": test_name,
                "success": False,
                "issues": [f"Critical error: {str(e)}"]
            })
    
    # Print final summary
    print_separator()
    print("📊 FINAL TEST RESULTS SUMMARY")
    print_separator()
    
    passed_tests = 0
    total_tests = len(all_results)
    
    for result in all_results:
        status = "✅ PASSED" if result["success"] else "❌ FAILED"
        print(f"{status}: {result['test']}")
        
        if result["issues"]:
            for issue in result["issues"]:
                print(f"    {issue}")
        
        if result["success"]:
            passed_tests += 1
    
    print_separator()
    print(f"🎯 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 ALL TESTS PASSED! Google API 403 error handling is working correctly.")
        print("✅ No 403 errors detected in any endpoint")
        print("✅ Mock data fallbacks are functioning properly")
        print("✅ Error handling is graceful and user-friendly")
    else:
        print("⚠️  SOME TESTS FAILED! Issues need to be addressed:")
        failed_tests = [r for r in all_results if not r["success"]]
        for failed in failed_tests:
            print(f"   - {failed['test']}: {len(failed['issues'])} issues")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)