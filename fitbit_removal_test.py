#!/usr/bin/env python3
"""
Test script to verify Fitbit endpoints have been removed and Google Fit integration is working properly.

Test Requirements:
1. Verify that /api/fitbit/login endpoint returns 404 (removed)
2. Verify that /api/fitbit/callback endpoint returns 404 (removed) 
3. Verify that /api/fitbit/disconnect/{user_id} endpoint returns 404 (removed)
4. Test that /api/google-fit/login endpoint still works (returns 501 for unconfigured)
5. Test that /api/google-fit/callback endpoint still works 
6. Test that /api/google-fit/disconnect/{user_id} endpoint still works
7. Test that /api/fitness/status/{user_id} endpoint no longer returns fitbit_connected field
8. Test that /api/sync/workouts and /api/fitness/data endpoints work correctly without Fitbit
"""

import requests
import json
import uuid
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://06aabe0a-6581-4a14-8d92-05c893af6d99.preview.emergentagent.com/api"

def print_separator():
    print("\n" + "="*80 + "\n")

def print_test_header(test_name):
    print_separator()
    print(f"TESTING: {test_name}")
    print_separator()

def create_test_user():
    """Create a test user for testing purposes"""
    test_email = f"fitbit_removal_test_{uuid.uuid4()}@example.com"
    user_data = {
        "email": test_email,
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss", "general_fitness"],
        "experience_level": "intermediate"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data)
    
    if response.status_code == 200:
        user = response.json()
        print(f"✅ Created test user: {user['id']}")
        return user
    else:
        print(f"❌ ERROR: Failed to create test user. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_fitbit_endpoints_removed():
    """Test that all Fitbit endpoints return 404 (removed)"""
    print_test_header("FITBIT ENDPOINTS REMOVAL")
    
    test_user_id = "test_user_123"
    fitbit_endpoints = [
        ("GET", f"{BACKEND_URL}/fitbit/login", "Fitbit login endpoint"),
        ("GET", f"{BACKEND_URL}/fitbit/callback?code=test_code&user_id={test_user_id}", "Fitbit callback endpoint"),
        ("DELETE", f"{BACKEND_URL}/fitbit/disconnect/{test_user_id}", "Fitbit disconnect endpoint")
    ]
    
    all_removed = True
    
    for method, url, description in fitbit_endpoints:
        print(f"\nTesting {description}...")
        print(f"URL: {url}")
        
        if method == "GET":
            response = requests.get(url)
        elif method == "DELETE":
            response = requests.delete(url)
        
        if response.status_code == 404:
            print(f"✅ {description} correctly returns 404 (removed)")
        else:
            print(f"❌ ERROR: {description} should return 404 but got {response.status_code}")
            print(f"Response: {response.text}")
            all_removed = False
    
    if all_removed:
        print("\n🎉 ALL FITBIT ENDPOINTS SUCCESSFULLY REMOVED!")
        return True
    else:
        print("\n❌ SOME FITBIT ENDPOINTS STILL EXIST!")
        return False

def test_google_fit_endpoints_working():
    """Test that Google Fit endpoints are still working"""
    print_test_header("GOOGLE FIT ENDPOINTS FUNCTIONALITY")
    
    test_user_id = "test_user_123"
    all_working = True
    
    # Test 1: Google Fit login endpoint
    print("Testing Google Fit login endpoint...")
    response = requests.get(f"{BACKEND_URL}/google-fit/login")
    
    if response.status_code == 501:
        result = response.json()
        if "not configured" in result.get("detail", "").lower():
            print("✅ Google Fit login endpoint works correctly (returns 501 for unconfigured)")
        else:
            print(f"❌ ERROR: Expected 'not configured' error but got: {result.get('detail')}")
            all_working = False
    else:
        print(f"❌ ERROR: Expected status code 501 for unconfigured Google Fit but got: {response.status_code}")
        all_working = False
    
    # Test 2: Google Fit callback endpoint
    print("\nTesting Google Fit callback endpoint...")
    response = requests.get(f"{BACKEND_URL}/google-fit/callback?code=invalid_code&user_id={test_user_id}")
    
    if response.status_code == 400:
        print("✅ Google Fit callback endpoint works correctly (handles invalid requests)")
    else:
        print(f"❌ ERROR: Expected status code 400 for invalid callback but got: {response.status_code}")
        all_working = False
    
    # Test 3: Google Fit disconnect endpoint
    print("\nTesting Google Fit disconnect endpoint...")
    response = requests.delete(f"{BACKEND_URL}/google-fit/disconnect/{test_user_id}")
    
    if response.status_code == 404:
        print("✅ Google Fit disconnect endpoint works correctly (user not found)")
    elif response.status_code == 200:
        result = response.json()
        if "message" in result and "disconnected" in result["message"].lower():
            print("✅ Google Fit disconnect endpoint works correctly")
        else:
            print(f"❌ ERROR: Unexpected response format: {result}")
            all_working = False
    else:
        print(f"❌ ERROR: Unexpected status code for Google Fit disconnect: {response.status_code}")
        all_working = False
    
    if all_working:
        print("\n🎉 ALL GOOGLE FIT ENDPOINTS ARE WORKING CORRECTLY!")
        return True
    else:
        print("\n❌ SOME GOOGLE FIT ENDPOINTS HAVE ISSUES!")
        return False

def test_fitness_status_no_fitbit_field(user):
    """Test that fitness status endpoint no longer returns fitbit_connected field"""
    if not user:
        print("Cannot test fitness status without a valid user")
        return False
        
    print_test_header("FITNESS STATUS - NO FITBIT FIELD")
    
    user_id = user["id"]
    
    print(f"Testing fitness status for user {user_id}...")
    response = requests.get(f"{BACKEND_URL}/fitness/status/{user_id}")
    
    if response.status_code == 200:
        status = response.json()
        print(f"Fitness status response: {json.dumps(status, indent=2)}")
        
        # Check that fitbit_connected field is NOT present
        if "fitbit_connected" in status:
            print("❌ ERROR: fitbit_connected field should be removed but is still present")
            return False
        else:
            print("✅ fitbit_connected field correctly removed from response")
        
        # Check that google_fit_connected field IS present
        if "google_fit_connected" in status:
            print("✅ google_fit_connected field is present")
        else:
            print("❌ ERROR: google_fit_connected field is missing")
            return False
        
        # Check that last_sync field is present
        if "last_sync" in status:
            print("✅ last_sync field is present")
        else:
            print("❌ ERROR: last_sync field is missing")
            return False
        
        print("\n🎉 FITNESS STATUS ENDPOINT CORRECTLY UPDATED!")
        return True
    else:
        print(f"❌ ERROR: Failed to get fitness status. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_sync_workouts_without_fitbit(user):
    """Test that sync workouts endpoint works correctly without Fitbit"""
    if not user:
        print("Cannot test sync workouts without a valid user")
        return False
        
    print_test_header("SYNC WORKOUTS - WITHOUT FITBIT")
    
    user_id = user["id"]
    
    print(f"Testing workout sync for user {user_id}...")
    sync_data = {
        "user_id": user_id
    }
    
    response = requests.post(f"{BACKEND_URL}/sync/workouts", json=sync_data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Sync workouts response: {json.dumps(result, indent=2)}")
        
        # Verify response structure
        if "synced_workouts" in result:
            synced_count = result["synced_workouts"]
            print(f"✅ Successfully synced {synced_count} workouts")
            
            if synced_count > 0:
                print("✅ Mock sync process worked correctly")
            else:
                print("⚠️  No workouts were synced (this might be expected for mock data)")
            
            print("\n🎉 SYNC WORKOUTS ENDPOINT WORKS WITHOUT FITBIT!")
            return True
        else:
            print("❌ ERROR: Missing 'synced_workouts' field in response")
            return False
    else:
        print(f"❌ ERROR: Failed to sync workouts. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def test_fitness_data_without_fitbit(user):
    """Test that fitness data endpoint works correctly without Fitbit"""
    if not user:
        print("Cannot test fitness data without a valid user")
        return False
        
    print_test_header("FITNESS DATA - WITHOUT FITBIT")
    
    user_id = user["id"]
    
    print(f"Testing get fitness data for user {user_id}...")
    response = requests.get(f"{BACKEND_URL}/fitness/data/{user_id}")
    
    if response.status_code == 200:
        fitness_data = response.json()
        print(f"Fitness data response: {json.dumps(fitness_data, indent=2)}")
        
        # Verify response structure
        required_fields = ["total_workouts", "this_week", "avg_duration", "recent_workouts"]
        missing_fields = [field for field in required_fields if field not in fitness_data]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in fitness data response: {missing_fields}")
            return False
        
        # Verify data types
        if (isinstance(fitness_data["total_workouts"], int) and 
            isinstance(fitness_data["this_week"], int) and
            isinstance(fitness_data["avg_duration"], int) and
            isinstance(fitness_data["recent_workouts"], list)):
            print("✅ Fitness data structure and types are correct")
            
            # Check that recent workouts don't contain fitbit source
            for workout in fitness_data["recent_workouts"]:
                if workout.get("source") == "fitbit":
                    print("❌ ERROR: Found workout with fitbit source - should be removed")
                    return False
            
            print("✅ No fitbit workouts found in recent workouts")
            print("\n🎉 FITNESS DATA ENDPOINT WORKS WITHOUT FITBIT!")
            return True
        else:
            print("❌ ERROR: Fitness data types are incorrect")
            return False
    else:
        print(f"❌ ERROR: Failed to get fitness data. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def run_all_tests():
    """Run all Fitbit removal and Google Fit integration tests"""
    print("🚀 STARTING FITBIT REMOVAL AND GOOGLE FIT INTEGRATION TESTS")
    print("="*80)
    
    test_results = {
        "fitbit_endpoints_removed": False,
        "google_fit_endpoints_working": False,
        "fitness_status_no_fitbit": False,
        "sync_workouts_without_fitbit": False,
        "fitness_data_without_fitbit": False
    }
    
    # Create test user
    print("Creating test user...")
    test_user = create_test_user()
    
    # Run tests
    test_results["fitbit_endpoints_removed"] = test_fitbit_endpoints_removed()
    test_results["google_fit_endpoints_working"] = test_google_fit_endpoints_working()
    
    if test_user:
        test_results["fitness_status_no_fitbit"] = test_fitness_status_no_fitbit_field(test_user)
        test_results["sync_workouts_without_fitbit"] = test_sync_workouts_without_fitbit(test_user)
        test_results["fitness_data_without_fitbit"] = test_fitness_data_without_fitbit(test_user)
    
    # Print final results
    print_separator()
    print("FINAL TEST RESULTS")
    print_separator()
    
    passed_tests = 0
    total_tests = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed_tests += 1
    
    print(f"\nOVERALL RESULT: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! FITBIT REMOVAL AND GOOGLE FIT INTEGRATION SUCCESSFUL!")
        return True
    else:
        print(f"\n❌ {total_tests - passed_tests} TESTS FAILED! REVIEW REQUIRED!")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)