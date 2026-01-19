#!/usr/bin/env python3
import requests
import json
import uuid

BACKEND_URL = "https://fitcoach-ai-36.preview.emergentagent.com/api"

def test_ai_endpoints():
    print("🤖 Testing LiftLink AI Agent Engine")
    
    # Create trainer
    trainer_data = {
        "email": f"trainer_{uuid.uuid4()}@test.com",
        "name": "Test Trainer",
        "role": "trainer",
        "fitness_goals": ["general_fitness"],
        "experience_level": "advanced"
    }
    
    print("Creating trainer...")
    response = requests.post(f"{BACKEND_URL}/create-test-user", json=trainer_data)
    if response.status_code != 200:
        print(f"❌ Failed to create trainer: {response.status_code}")
        return
    
    trainer_auth = response.json()
    trainer_token = trainer_auth["access_token"]
    headers = {"Authorization": f"Bearer {trainer_token}"}
    
    print("✅ Trainer created")
    
    # Test 1: AI Agent Stats
    print("\n1. Testing AI Agent Stats...")
    response = requests.get(f"{BACKEND_URL}/ai/agent/stats", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
    else:
        print(f"Error: {response.text}")
    
    # Test 2: AI Suggestions
    print("\n2. Testing AI Suggestions...")
    response = requests.get(f"{BACKEND_URL}/ai/agent/suggestions", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response type: {type(response.json())}")
        print(f"Response: {response.json()}")
    else:
        print(f"Error: {response.text}")
    
    # Test 3: AI Onboarding (create regular user first)
    user_data = {
        "email": f"user_{uuid.uuid4()}@test.com",
        "name": "Test User",
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss"],
        "experience_level": "beginner"
    }
    
    print("\n3. Creating user for onboarding...")
    response = requests.post(f"{BACKEND_URL}/create-test-user", json=user_data)
    if response.status_code == 200:
        user_auth = response.json()
        user_token = user_auth["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}
        
        print("Testing AI Onboarding Start...")
        onboarding_data = {"user_name": "Test User"}
        response = requests.post(f"{BACKEND_URL}/ai/onboarding/start", 
                               json=onboarding_data, headers=user_headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Error: {response.text}")
    
if __name__ == "__main__":
    test_ai_endpoints()