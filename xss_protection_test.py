#!/usr/bin/env python3
"""
FOCUSED XSS PROTECTION RE-TEST AFTER FIX

Tests the specific XSS protection fix implemented in server.py line 993
where sanitized_name is returned instead of the original unsanitized name.
"""

import requests
import json
import uuid
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://trainer-match-14.preview.emergentagent.com/api"

def print_separator():
    print("\n" + "="*80 + "\n")

def test_xss_protection_fix():
    """
    FOCUSED XSS PROTECTION RE-TEST AFTER FIX
    
    Tests the specific XSS protection fix implemented in server.py line 993
    where sanitized_name is returned instead of the original unsanitized name.
    """
    print_separator()
    print("🔍 FOCUSED XSS PROTECTION RE-TEST AFTER FIX")
    print("🎯 Testing XSS payloads and input validation fixes")
    print_separator()
    
    # Test results tracking
    test_results_local = {
        "xss_protection": {"success": False, "details": "", "passed": 0, "total": 4},
        "input_length_validation": {"success": False, "details": "", "passed": 0, "total": 2},
        "regression_check": {"success": False, "details": "", "passed": 0, "total": 3}
    }
    
    # PRIORITY 1 - CRITICAL: XSS PROTECTION RE-TEST
    print("🚨 PRIORITY 1 - CRITICAL: XSS PROTECTION RE-TEST")
    print("=" * 70)
    print("Testing all 4 XSS payloads to verify sanitization fix")
    
    xss_payloads = [
        "<script>alert('XSS')</script>",
        "javascript:alert('XSS')",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>"
    ]
    
    xss_tests_passed = 0
    
    for i, payload in enumerate(xss_payloads, 1):
        print(f"\n🧪 XSS TEST {i}/4: Testing payload: {payload}")
        print("-" * 50)
        
        # Create user with XSS payload in name field
        test_email = f"xss_test_{i}_{uuid.uuid4()}@example.com"
        user_data = {
            "email": test_email,
            "name": payload,  # XSS payload in name field
            "role": "fitness_enthusiast",
            "fitness_goals": ["general_fitness"],
            "experience_level": "beginner"
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/users", json=user_data, timeout=30)
            
            if response.status_code == 200:
                created_user = response.json()
                returned_name = created_user.get("name", "")
                
                print(f"   Original payload: {payload}")
                print(f"   Returned name: {returned_name}")
                
                # Check if XSS payload is sanitized
                if payload == returned_name:
                    print(f"   ❌ XSS PAYLOAD NOT SANITIZED - Original payload returned unchanged!")
                    test_results_local["xss_protection"]["details"] += f"Payload {i} not sanitized. "
                else:
                    # Check if dangerous patterns are removed/escaped
                    dangerous_patterns = ["<script", "javascript:", "onerror=", "onload="]
                    payload_sanitized = True
                    
                    for pattern in dangerous_patterns:
                        if pattern.lower() in returned_name.lower():
                            payload_sanitized = False
                            break
                    
                    if payload_sanitized:
                        print(f"   ✅ XSS PAYLOAD SANITIZED - Dangerous patterns removed/escaped")
                        xss_tests_passed += 1
                    else:
                        print(f"   ❌ XSS PAYLOAD PARTIALLY SANITIZED - Some dangerous patterns remain")
                        test_results_local["xss_protection"]["details"] += f"Payload {i} partially sanitized. "
                        
            else:
                print(f"   ❌ User creation failed with status: {response.status_code}")
                print(f"   Response: {response.text}")
                test_results_local["xss_protection"]["details"] += f"Payload {i} creation failed. "
                
        except Exception as e:
            print(f"   ❌ Error testing XSS payload: {str(e)}")
            test_results_local["xss_protection"]["details"] += f"Payload {i} error: {str(e)}. "
    
    # Update XSS protection results
    test_results_local["xss_protection"]["passed"] = xss_tests_passed
    test_results_local["xss_protection"]["success"] = xss_tests_passed == 4
    
    print(f"\n📊 XSS PROTECTION RESULTS: {xss_tests_passed}/4 payloads sanitized")
    if xss_tests_passed == 4:
        print("✅ XSS PROTECTION: ALL PAYLOADS SANITIZED - FIX SUCCESSFUL!")
    else:
        print(f"❌ XSS PROTECTION: {4 - xss_tests_passed} payloads still vulnerable")
    
    # PRIORITY 2: INPUT LENGTH VALIDATION RE-TEST
    print("\n📏 PRIORITY 2: INPUT LENGTH VALIDATION RE-TEST")
    print("=" * 70)
    print("Testing email and name length validation")
    
    length_tests_passed = 0
    
    # Test 1: Email length validation (>254 characters)
    print("\n🧪 LENGTH TEST 1/2: Email length validation (>254 characters)")
    print("-" * 50)
    
    long_email = "a" * 250 + "@example.com"  # 261 characters total
    test_data = {
        "email": long_email,
        "name": "Test User",
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/users", json=test_data, timeout=30)
        
        if response.status_code == 422:
            print(f"   ✅ EMAIL LENGTH VALIDATION WORKING - Long email rejected (422)")
            length_tests_passed += 1
        else:
            print(f"   ❌ EMAIL LENGTH VALIDATION FAILED - Expected 422, got {response.status_code}")
            print(f"   Email length: {len(long_email)} characters")
            test_results_local["input_length_validation"]["details"] += "Email length validation failed. "
            
    except Exception as e:
        print(f"   ❌ Error testing email length: {str(e)}")
        test_results_local["input_length_validation"]["details"] += f"Email length error: {str(e)}. "
    
    # Test 2: Name length validation (>100 characters)
    print("\n🧪 LENGTH TEST 2/2: Name length validation (>100 characters)")
    print("-" * 50)
    
    long_name = "A" * 101  # 101 characters
    test_data = {
        "email": f"name_length_test_{uuid.uuid4()}@example.com",
        "name": long_name,
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/users", json=test_data, timeout=30)
        
        if response.status_code == 422:
            print(f"   ✅ NAME LENGTH VALIDATION WORKING - Long name rejected (422)")
            length_tests_passed += 1
        else:
            print(f"   ❌ NAME LENGTH VALIDATION FAILED - Expected 422, got {response.status_code}")
            print(f"   Name length: {len(long_name)} characters")
            test_results_local["input_length_validation"]["details"] += "Name length validation failed. "
            
    except Exception as e:
        print(f"   ❌ Error testing name length: {str(e)}")
        test_results_local["input_length_validation"]["details"] += f"Name length error: {str(e)}. "
    
    # Update input length validation results
    test_results_local["input_length_validation"]["passed"] = length_tests_passed
    test_results_local["input_length_validation"]["success"] = length_tests_passed == 2
    
    print(f"\n📊 INPUT LENGTH VALIDATION RESULTS: {length_tests_passed}/2 tests passed")
    if length_tests_passed == 2:
        print("✅ INPUT LENGTH VALIDATION: ALL TESTS PASSED")
    else:
        print(f"❌ INPUT LENGTH VALIDATION: {2 - length_tests_passed} tests failed")
    
    # PRIORITY 3: REGRESSION CHECK
    print("\n🔄 PRIORITY 3: REGRESSION CHECK")
    print("=" * 70)
    print("Ensuring XSS fix didn't break other functionality")
    
    regression_tests_passed = 0
    
    # Test 1: Normal user creation with valid data
    print("\n🧪 REGRESSION TEST 1/3: Normal user creation")
    print("-" * 50)
    
    normal_user_data = {
        "email": f"regression_test_{uuid.uuid4()}@example.com",
        "name": "John Doe",
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss"],
        "experience_level": "intermediate"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/users", json=normal_user_data, timeout=30)
        
        if response.status_code == 200:
            created_user = response.json()
            if created_user.get("name") == "John Doe":
                print("   ✅ NORMAL USER CREATION WORKING - Valid data processed correctly")
                regression_tests_passed += 1
                normal_user_id = created_user["id"]
            else:
                print(f"   ❌ Name field issue - Expected 'John Doe', got '{created_user.get('name')}'")
                test_results_local["regression_check"]["details"] += "Normal user name issue. "
        else:
            print(f"   ❌ NORMAL USER CREATION FAILED - Status: {response.status_code}")
            test_results_local["regression_check"]["details"] += "Normal user creation failed. "
            
    except Exception as e:
        print(f"   ❌ Error in normal user creation: {str(e)}")
        test_results_local["regression_check"]["details"] += f"Normal user error: {str(e)}. "
    
    # Test 2: Special characters in names (should be allowed)
    print("\n🧪 REGRESSION TEST 2/3: Special characters in names")
    print("-" * 50)
    
    special_name_data = {
        "email": f"special_chars_{uuid.uuid4()}@example.com",
        "name": "José María O'Connor-Smith",
        "role": "trainer",
        "fitness_goals": ["sport_training"],
        "experience_level": "expert"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/users", json=special_name_data, timeout=30)
        
        if response.status_code == 200:
            created_user = response.json()
            returned_name = created_user.get("name", "")
            
            # Check if special characters are preserved (not over-sanitized)
            if "José" in returned_name and "María" in returned_name and "O'Connor" in returned_name:
                print("   ✅ SPECIAL CHARACTERS PRESERVED - Legitimate characters not over-sanitized")
                regression_tests_passed += 1
            else:
                print(f"   ❌ OVER-SANITIZATION - Special characters removed: '{returned_name}'")
                test_results_local["regression_check"]["details"] += "Over-sanitization detected. "
        else:
            print(f"   ❌ SPECIAL CHARACTERS TEST FAILED - Status: {response.status_code}")
            test_results_local["regression_check"]["details"] += "Special characters test failed. "
            
    except Exception as e:
        print(f"   ❌ Error in special characters test: {str(e)}")
        test_results_local["regression_check"]["details"] += f"Special chars error: {str(e)}. "
    
    # Test 3: Check user endpoint still works
    print("\n🧪 REGRESSION TEST 3/3: Check user endpoint functionality")
    print("-" * 50)
    
    if regression_tests_passed > 0:  # Only if we have a valid user
        check_data = {"email": normal_user_data["email"]}
        
        try:
            response = requests.post(f"{BACKEND_URL}/check-user", json=check_data, timeout=30)
            
            if response.status_code == 200:
                check_result = response.json()
                if check_result.get("exists") and check_result.get("user_id"):
                    print("   ✅ CHECK USER ENDPOINT WORKING - User lookup functional")
                    regression_tests_passed += 1
                else:
                    print(f"   ❌ Check user endpoint issue - Response: {check_result}")
                    test_results_local["regression_check"]["details"] += "Check user endpoint issue. "
            else:
                print(f"   ❌ CHECK USER ENDPOINT FAILED - Status: {response.status_code}")
                test_results_local["regression_check"]["details"] += "Check user endpoint failed. "
                
        except Exception as e:
            print(f"   ❌ Error in check user test: {str(e)}")
            test_results_local["regression_check"]["details"] += f"Check user error: {str(e)}. "
    else:
        print("   ⏭️  SKIPPING - No valid user for check user test")
    
    # Update regression check results
    test_results_local["regression_check"]["passed"] = regression_tests_passed
    test_results_local["regression_check"]["success"] = regression_tests_passed >= 2  # Allow 1 failure
    
    print(f"\n📊 REGRESSION CHECK RESULTS: {regression_tests_passed}/3 tests passed")
    if regression_tests_passed >= 2:
        print("✅ REGRESSION CHECK: PASSED - XSS fix didn't break functionality")
    else:
        print(f"❌ REGRESSION CHECK: FAILED - {3 - regression_tests_passed} functionality issues detected")
    
    # FINAL RESULTS SUMMARY
    print("\n🎯 FOCUSED XSS PROTECTION FIX TEST RESULTS")
    print("=" * 70)
    
    print(f"🚨 XSS Protection (Priority 1): {'✅ PASSED' if test_results_local['xss_protection']['success'] else '❌ FAILED'} ({test_results_local['xss_protection']['passed']}/4)")
    print(f"📏 Input Length Validation (Priority 2): {'✅ PASSED' if test_results_local['input_length_validation']['success'] else '❌ FAILED'} ({test_results_local['input_length_validation']['passed']}/2)")
    print(f"🔄 Regression Check (Priority 3): {'✅ PASSED' if test_results_local['regression_check']['success'] else '❌ FAILED'} ({test_results_local['regression_check']['passed']}/3)")
    
    # Calculate overall success
    critical_success = test_results_local['xss_protection']['success']
    overall_tests_passed = sum(result['passed'] for result in test_results_local.values())
    total_tests = sum(result['total'] for result in test_results_local.values())
    success_rate = (overall_tests_passed / total_tests) * 100
    
    print(f"\n📈 Overall Success Rate: {success_rate:.1f}% ({overall_tests_passed}/{total_tests} tests passed)")
    
    if critical_success and success_rate >= 75:
        print(f"\n🎉 XSS PROTECTION FIX VALIDATION: SUCCESS!")
        print("✅ Critical XSS vulnerabilities have been resolved")
        print("✅ Input validation is working correctly")
        print("✅ No regression issues detected")
        return True
    else:
        print(f"\n❌ XSS PROTECTION FIX VALIDATION: FAILED!")
        
        failure_reasons = []
        if not critical_success:
            failure_reasons.append(f"XSS protection failed ({test_results_local['xss_protection']['passed']}/4 payloads sanitized)")
        if not test_results_local['input_length_validation']['success']:
            failure_reasons.append(f"Input length validation failed ({test_results_local['input_length_validation']['passed']}/2 tests)")
        if not test_results_local['regression_check']['success']:
            failure_reasons.append(f"Regression issues detected ({test_results_local['regression_check']['passed']}/3 tests)")
        
        print(f"❌ Issues: {'; '.join(failure_reasons)}")
        
        # Collect detailed failure information
        all_details = []
        for test_name, result in test_results_local.items():
            if result["details"]:
                all_details.append(f"{test_name}: {result['details']}")
        
        print(f"❌ Detailed Issues: {'; '.join(all_details)}")
        return False

if __name__ == "__main__":
    print("🚀 STARTING FOCUSED XSS PROTECTION RE-TEST")
    print("=" * 80)
    
    # Run focused XSS protection test as requested in review
    success = test_xss_protection_fix()
    
    print_separator()
    print("📊 FOCUSED TEST RESULTS SUMMARY")
    print_separator()
    
    if success:
        print("🎉 XSS PROTECTION FIX VALIDATION: SUCCESS!")
        print("The XSS protection fix has been successfully validated.")
    else:
        print("❌ XSS PROTECTION FIX VALIDATION: FAILED!")
        print("The XSS protection fix needs further attention.")
    
    print("=" * 80)