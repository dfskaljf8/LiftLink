#!/usr/bin/env python3
import requests
import json
import uuid
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://d660cf88-6e41-4268-ab24-1f6ce76bcb10.preview.emergentagent.com/api"

def print_separator():
    print("\n" + "="*80 + "\n")

def test_trainer_payout_functionality():
    """
    Test the trainer payout functionality that users are reporting as not working.
    
    Test specifically:
    1. POST /api/trainer/{trainer_id}/payout endpoint with amount parameter
    2. Verify the endpoint processes payout requests correctly
    3. Check if the amount validation is working properly
    4. Test both valid and invalid payout amounts
    5. Ensure proper error handling and response formats
    """
    print_separator()
    print("🏋️ TESTING TRAINER PAYOUT FUNCTIONALITY")
    print_separator()
    
    # Use realistic trainer IDs for testing
    trainer_ids = [
        "trainer_sarah_johnson_001",
        "trainer_mike_chen_002", 
        "trainer_emily_rodriguez_003"
    ]
    
    test_results = {
        "valid_payout_requests": {"success": False, "details": ""},
        "amount_validation": {"success": False, "details": ""},
        "error_handling": {"success": False, "details": ""},
        "response_format": {"success": False, "details": ""}
    }
    
    # Test 1: Valid payout requests with realistic amounts
    print("TEST 1: Valid payout requests with realistic amounts")
    print("-" * 60)
    
    valid_test_cases = [
        {"trainer_id": trainer_ids[0], "amount": 5000, "description": "$50.00 payout"},
        {"trainer_id": trainer_ids[1], "amount": 12500, "description": "$125.00 payout"},
        {"trainer_id": trainer_ids[2], "amount": 25000, "description": "$250.00 payout"},
        {"trainer_id": trainer_ids[0], "amount": 7500, "description": "$75.00 payout"},
        {"trainer_id": trainer_ids[1], "amount": 10000, "description": "$100.00 payout"}
    ]
    
    valid_payout_count = 0
    
    for test_case in valid_test_cases:
        trainer_id = test_case["trainer_id"]
        amount = test_case["amount"]
        description = test_case["description"]
        
        print(f"\n🔸 Testing {description} for trainer {trainer_id}")
        
        try:
            response = requests.post(f"{BACKEND_URL}/trainer/{trainer_id}/payout", json={"amount": amount})
            
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ SUCCESS: {json.dumps(result, indent=4)}")
                
                # Verify response structure
                if "message" in result and "amount" in result:
                    expected_amount = amount / 100
                    if result["amount"] == expected_amount:
                        print(f"   ✅ Amount correctly converted: ${result['amount']}")
                        valid_payout_count += 1
                    else:
                        print(f"   ❌ ERROR: Expected amount ${expected_amount} but got ${result['amount']}")
                        test_results["response_format"]["details"] += f"Amount conversion error for {description}. "
                else:
                    print(f"   ❌ ERROR: Missing required fields in response")
                    test_results["response_format"]["details"] += f"Missing fields in response for {description}. "
            else:
                print(f"   ❌ ERROR: Expected 200 but got {response.status_code}")
                print(f"   Response: {response.text}")
                test_results["valid_payout_requests"]["details"] += f"Failed {description} with status {response.status_code}. "
                
        except Exception as e:
            print(f"   ❌ EXCEPTION: {str(e)}")
            test_results["valid_payout_requests"]["details"] += f"Exception for {description}: {str(e)}. "
    
    if valid_payout_count == len(valid_test_cases):
        test_results["valid_payout_requests"]["success"] = True
        test_results["response_format"]["success"] = True
        print(f"\n✅ ALL VALID PAYOUT REQUESTS PASSED: {valid_payout_count}/{len(valid_test_cases)}")
    else:
        print(f"\n❌ VALID PAYOUT REQUESTS FAILED: Only {valid_payout_count}/{len(valid_test_cases)} passed")
    
    # Test 2: Amount validation - test edge cases and invalid amounts
    print("\n\nTEST 2: Amount validation and edge cases")
    print("-" * 60)
    
    validation_test_cases = [
        {"trainer_id": trainer_ids[0], "amount": 0, "description": "Zero amount", "should_fail": True},
        {"trainer_id": trainer_ids[1], "amount": -1000, "description": "Negative amount", "should_fail": True},
        {"trainer_id": trainer_ids[2], "amount": 1, "description": "Minimum amount (1 cent)", "should_fail": False},
        {"trainer_id": trainer_ids[0], "amount": 100000, "description": "Large amount ($1000)", "should_fail": False},
        {"trainer_id": trainer_ids[1], "amount": 999999, "description": "Very large amount ($9999.99)", "should_fail": False}
    ]
    
    validation_success_count = 0
    
    for test_case in validation_test_cases:
        trainer_id = test_case["trainer_id"]
        amount = test_case["amount"]
        description = test_case["description"]
        should_fail = test_case["should_fail"]
        
        print(f"\n🔸 Testing {description} for trainer {trainer_id}")
        
        try:
            response = requests.post(f"{BACKEND_URL}/trainer/{trainer_id}/payout", json={"amount": amount})
            
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
            
            if should_fail:
                if response.status_code != 200:
                    print(f"   ✅ CORRECTLY REJECTED: {description}")
                    validation_success_count += 1
                else:
                    print(f"   ❌ ERROR: {description} should have been rejected but was accepted")
                    test_results["amount_validation"]["details"] += f"{description} should have been rejected. "
            else:
                if response.status_code == 200:
                    result = response.json()
                    print(f"   ✅ CORRECTLY ACCEPTED: {json.dumps(result, indent=4)}")
                    validation_success_count += 1
                else:
                    print(f"   ❌ ERROR: {description} should have been accepted but got status {response.status_code}")
                    test_results["amount_validation"]["details"] += f"{description} should have been accepted. "
                    
        except Exception as e:
            print(f"   ❌ EXCEPTION: {str(e)}")
            test_results["amount_validation"]["details"] += f"Exception for {description}: {str(e)}. "
    
    if validation_success_count == len(validation_test_cases):
        test_results["amount_validation"]["success"] = True
        print(f"\n✅ ALL AMOUNT VALIDATION TESTS PASSED: {validation_success_count}/{len(validation_test_cases)}")
    else:
        print(f"\n❌ AMOUNT VALIDATION TESTS FAILED: Only {validation_success_count}/{len(validation_test_cases)} passed")
    
    # Test 3: Error handling - test with invalid data formats
    print("\n\nTEST 3: Error handling with invalid data formats")
    print("-" * 60)
    
    error_test_cases = [
        {"trainer_id": trainer_ids[0], "data": {"amount": "invalid_string"}, "description": "String amount instead of integer"},
        {"trainer_id": trainer_ids[1], "data": {"amount": 12.5}, "description": "Float amount instead of integer"},
        {"trainer_id": trainer_ids[2], "data": {}, "description": "Missing amount parameter"},
        {"trainer_id": trainer_ids[0], "data": {"wrong_field": 5000}, "description": "Wrong parameter name"},
        {"trainer_id": "invalid_trainer_id", "data": {"amount": 5000}, "description": "Invalid trainer ID"}
    ]
    
    error_handling_success_count = 0
    
    for test_case in error_test_cases:
        trainer_id = test_case["trainer_id"]
        data = test_case["data"]
        description = test_case["description"]
        
        print(f"\n🔸 Testing {description}")
        
        try:
            response = requests.post(f"{BACKEND_URL}/trainer/{trainer_id}/payout", json=data)
            
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
            
            # Error cases should return 4xx or 5xx status codes
            if response.status_code >= 400:
                print(f"   ✅ CORRECTLY HANDLED ERROR: Status {response.status_code}")
                error_handling_success_count += 1
            else:
                print(f"   ❌ ERROR: Expected error status but got {response.status_code}")
                test_results["error_handling"]["details"] += f"{description} should have returned error status. "
                
        except Exception as e:
            print(f"   ❌ EXCEPTION: {str(e)}")
            test_results["error_handling"]["details"] += f"Exception for {description}: {str(e)}. "
    
    if error_handling_success_count == len(error_test_cases):
        test_results["error_handling"]["success"] = True
        print(f"\n✅ ALL ERROR HANDLING TESTS PASSED: {error_handling_success_count}/{len(error_test_cases)}")
    else:
        print(f"\n❌ ERROR HANDLING TESTS FAILED: Only {error_handling_success_count}/{len(error_test_cases)} passed")
    
    # Test 4: Test the specific user-reported issue - payout button not working
    print("\n\nTEST 4: User-reported issue - payout button functionality")
    print("-" * 60)
    
    # Simulate the user's scenario: trainer with earnings trying to request payout
    print("🔸 Simulating user scenario: Trainer requesting payout less than total earnings")
    
    # First, get trainer earnings to understand available balance
    trainer_id = trainer_ids[0]
    print(f"\n   Getting earnings for trainer {trainer_id}...")
    
    try:
        earnings_response = requests.get(f"{BACKEND_URL}/trainer/{trainer_id}/earnings")
        
        if earnings_response.status_code == 200:
            earnings = earnings_response.json()
            print(f"   Trainer earnings: {json.dumps(earnings, indent=4)}")
            
            # Extract total earnings (assuming it's in dollars, convert to cents)
            total_earnings = earnings.get("total_earnings", 0)
            if isinstance(total_earnings, (int, float)):
                total_earnings_cents = int(total_earnings * 100)
                
                # Request payout for less than total earnings (e.g., 50% of total)
                payout_amount = max(1000, total_earnings_cents // 2)  # At least $10 or 50% of earnings
                
                print(f"\n   Requesting payout of ${payout_amount/100:.2f} (less than total earnings of ${total_earnings:.2f})")
                
                payout_response = requests.post(f"{BACKEND_URL}/trainer/{trainer_id}/payout", json={"amount": payout_amount})
                
                print(f"   Payout Status Code: {payout_response.status_code}")
                print(f"   Payout Response: {payout_response.text}")
                
                if payout_response.status_code == 200:
                    payout_result = payout_response.json()
                    print(f"   ✅ PAYOUT SUCCESSFUL: {json.dumps(payout_result, indent=4)}")
                    print(f"   ✅ USER ISSUE RESOLVED: Payout button functionality works correctly")
                else:
                    print(f"   ❌ PAYOUT FAILED: This matches the user's reported issue!")
                    print(f"   ❌ Status: {payout_response.status_code}")
                    print(f"   ❌ Error: {payout_response.text}")
                    test_results["valid_payout_requests"]["details"] += f"User-reported payout issue confirmed. Status: {payout_response.status_code}. "
            else:
                print(f"   ❌ ERROR: Invalid earnings format: {total_earnings}")
        else:
            print(f"   ❌ ERROR: Failed to get trainer earnings. Status: {earnings_response.status_code}")
            print(f"   Response: {earnings_response.text}")
            
    except Exception as e:
        print(f"   ❌ EXCEPTION in user scenario test: {str(e)}")
    
    # Summary
    print_separator()
    print("🏁 TRAINER PAYOUT FUNCTIONALITY TEST SUMMARY")
    print_separator()
    
    total_tests = len(test_results)
    passed_tests = sum(1 for result in test_results.values() if result["success"])
    
    print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} test categories passed")
    print()
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        print(f"{status} {test_name.replace('_', ' ').title()}")
        if not result["success"] and result["details"]:
            print(f"   Details: {result['details']}")
    
    print()
    
    if passed_tests == total_tests:
        print("🎉 ALL TRAINER PAYOUT TESTS PASSED!")
        print("✅ The payout functionality is working correctly.")
        print("✅ Amount validation is working properly.")
        print("✅ Error handling is appropriate.")
        print("✅ Response formats are correct.")
        return True
    else:
        print("⚠️  SOME TRAINER PAYOUT TESTS FAILED!")
        print("❌ The user-reported payout issue may be confirmed.")
        print("🔍 Review the failed test details above for specific problems.")
        return False

if __name__ == "__main__":
    print("🚀 Starting Trainer Payout Functionality Tests...")
    success = test_trainer_payout_functionality()
    
    if success:
        print("\n✅ Testing completed successfully!")
    else:
        print("\n❌ Testing completed with failures!")