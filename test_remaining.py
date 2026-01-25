#!/usr/bin/env python3
import requests
import json
import uuid

BACKEND_URL = "https://swiftauth-1.preview.emergentagent.com/api"

def test_remaining_ai_endpoints():
    print("🤖 Testing Remaining AI Agent Endpoints")
    
    # Create trainer
    trainer_data = {
        "email": f"trainer_{uuid.uuid4()}@test.com",
        "name": "Test Trainer",
        "role": "trainer",
        "fitness_goals": ["general_fitness"],
        "experience_level": "advanced"
    }
    
    response = requests.post(f"{BACKEND_URL}/create-test-user", json=trainer_data)
    trainer_auth = response.json()
    trainer_token = trainer_auth["access_token"]
    trainer_headers = {"Authorization": f"Bearer {trainer_token}"}
    
    # Create user for onboarding
    user_data = {
        "email": f"user_{uuid.uuid4()}@test.com",
        "name": "Test User",
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/create-test-user", json=user_data)
    user_auth = response.json()
    user_token = user_auth["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    
    # Test AI Onboarding Continue
    print("\n1. Testing AI Onboarding Continue...")
    
    # First start onboarding
    onboarding_data = {"user_name": "Test User"}
    response = requests.post(f"{BACKEND_URL}/ai/onboarding/start", 
                           json=onboarding_data, headers=user_headers)
    
    if response.status_code == 200:
        start_result = response.json()
        session_id = start_result["session_id"]
        
        # Continue onboarding
        continue_data = {
            "session_id": session_id,
            "response": "I want to lose weight and get stronger"
        }
        
        response = requests.post(f"{BACKEND_URL}/ai/onboarding/respond", 
                               json=continue_data, headers=user_headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Error: {response.text}")
    
    # Test AI Program Generation
    print("\n2. Testing AI Program Generation...")
    
    # Create a client for program generation
    client_data = {
        "email": f"client_{uuid.uuid4()}@test.com",
        "name": "Test Client",
        "role": "fitness_enthusiast",
        "fitness_goals": ["muscle_building"],
        "experience_level": "intermediate"
    }
    
    response = requests.post(f"{BACKEND_URL}/create-test-user", json=client_data)
    if response.status_code == 200:
        client_auth = response.json()
        client_id = client_auth["user"]["id"]
        
        program_data = {
            "client_id": client_id,
            "duration_weeks": 4,
            "days_per_week": 3
        }
        
        response = requests.post(f"{BACKEND_URL}/ai/agent/generate-program", 
                               json=program_data, headers=trainer_headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success')}")
            print(f"Draft ID: {result.get('draft_id')}")
            if result.get('program'):
                program = result['program']
                print(f"Program name: {program.get('program_name')}")
                print(f"Weeks: {len(program.get('weeks', []))}")
        elif response.status_code == 429:
            print("Rate limited (expected behavior)")
        else:
            print(f"Error: {response.text}")

if __name__ == "__main__":
    test_remaining_ai_endpoints()