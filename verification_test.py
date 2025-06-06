import requests
import json
import time
import base64
import os
from datetime import datetime

# Get backend URL from frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1]
            break

API_URL = f"{BACKEND_URL}/api"
print(f"Testing API at: {API_URL}")

# Demo tokens for testing
DEMO_USER_TOKEN = "demo_user"
DEMO_TRAINER_TOKEN = "demo_trainer"

def test_verification_session_trainee():
    """Test the verification session flow for a trainee"""
    print("\n=== Testing Verification Session Flow for Trainee ===")
    
    # 1. Start verification session
    print("\nStarting verification session...")
    url = f"{API_URL}/verification/start-session"
    headers = {
        "Authorization": f"Bearer {DEMO_USER_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "role": "trainee"
    }
    
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"Error: {response.text}")
        return False
    
    result = response.json()
    session_id = result.get('session_id')
    print(f"Session ID: {session_id}")
    print(f"Role: {result.get('role')}")
    print(f"Next Step: {result.get('next_step')}")
    print(f"Steps Completed: {result.get('steps_completed')}")
    print(f"Total Steps: {result.get('total_steps')}")
    
    # 2. Check session status
    print("\nChecking session status...")
    url = f"{API_URL}/verification/session/{session_id}/status"
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"Error: {response.text}")
        return False
    
    status_result = response.json()
    print(f"Current Step: {status_result.get('current_step')}")
    print(f"Steps Completed: {status_result.get('steps_completed')}")
    print(f"Is Complete: {status_result.get('is_complete')}")
    print(f"Total Steps: {status_result.get('total_steps')}")
    
    # Verify trainee has 3 total steps
    if status_result.get('total_steps') != 3:
        print(f"❌ Trainee verification flow has incorrect step count: {status_result.get('total_steps')} (expected 3)")
        return False
    
    print("✅ Trainee verification flow has correct step count (3)")
    return True

def test_verification_session_trainer():
    """Test the verification session flow for a trainer"""
    print("\n=== Testing Verification Session Flow for Trainer ===")
    
    # 1. Start verification session
    print("\nStarting verification session...")
    url = f"{API_URL}/verification/start-session"
    headers = {
        "Authorization": f"Bearer {DEMO_TRAINER_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "role": "trainer"
    }
    
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"Error: {response.text}")
        return False
    
    result = response.json()
    session_id = result.get('session_id')
    print(f"Session ID: {session_id}")
    print(f"Role: {result.get('role')}")
    print(f"Next Step: {result.get('next_step')}")
    print(f"Steps Completed: {result.get('steps_completed')}")
    print(f"Total Steps: {result.get('total_steps')}")
    
    # 2. Check session status
    print("\nChecking session status...")
    url = f"{API_URL}/verification/session/{session_id}/status"
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"Error: {response.text}")
        return False
    
    status_result = response.json()
    print(f"Current Step: {status_result.get('current_step')}")
    print(f"Steps Completed: {status_result.get('steps_completed')}")
    print(f"Is Complete: {status_result.get('is_complete')}")
    print(f"Total Steps: {status_result.get('total_steps')}")
    
    # Verify trainer has 4 total steps
    if status_result.get('total_steps') != 4:
        print(f"❌ Trainer verification flow has incorrect step count: {status_result.get('total_steps')} (expected 4)")
        return False
    
    print("✅ Trainer verification flow has correct step count (4)")
    return True

def test_invalid_role():
    """Test starting a verification session with an invalid role"""
    print("\n=== Testing Invalid Role Handling ===")
    
    url = f"{API_URL}/verification/start-session"
    headers = {
        "Authorization": f"Bearer {DEMO_USER_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "role": "invalid_role"
    }
    
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Should return 400 Bad Request
    if response.status_code != 400:
        print(f"❌ Invalid role test failed: Expected 400, got {response.status_code}")
        return False
    
    print("✅ Invalid role test passed")
    return True

def test_missing_auth():
    """Test starting a verification session without authentication"""
    print("\n=== Testing Missing Authentication Handling ===")
    
    url = f"{API_URL}/verification/start-session"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "role": "trainee"
    }
    
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Should return 401 Unauthorized
    if response.status_code != 401:
        print(f"❌ Missing authentication test failed: Expected 401, got {response.status_code}")
        return False
    
    print("✅ Missing authentication test passed")
    return True

def run_all_tests():
    """Run all verification system tests"""
    print("Starting verification system tests...")
    
    # Test trainee verification flow
    trainee_result = test_verification_session_trainee()
    
    # Test trainer verification flow
    trainer_result = test_verification_session_trainer()
    
    # Test error handling
    invalid_role_result = test_invalid_role()
    missing_auth_result = test_missing_auth()
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"Trainee Verification Flow: {'✅ PASSED' if trainee_result else '❌ FAILED'}")
    print(f"Trainer Verification Flow: {'✅ PASSED' if trainer_result else '❌ FAILED'}")
    print(f"Invalid Role Handling: {'✅ PASSED' if invalid_role_result else '❌ FAILED'}")
    print(f"Missing Authentication Handling: {'✅ PASSED' if missing_auth_result else '❌ FAILED'}")
    
    overall_result = trainee_result and trainer_result and invalid_role_result and missing_auth_result
    print(f"\nOverall Test Result: {'✅ PASSED' if overall_result else '❌ FAILED'}")
    
    return overall_result

if __name__ == "__main__":
    run_all_tests()