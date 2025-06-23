#!/usr/bin/env python3
import requests
import json
import time
import uuid
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://c9e6ed8f-bba7-41f1-b037-b82bb2d085a6.preview.emergentagent.com/api"

# Test results
test_results = {
    "user_registration": {"success": False, "details": ""},
    "tree_progression": {"success": False, "details": ""},
    "session_management": {"success": False, "details": ""},
    "user_profile": {"success": False, "details": ""},
    "tree_progress_endpoint": {"success": False, "details": ""}
}

def print_separator():
    print("\n" + "="*80 + "\n")

def test_user_registration():
    print_separator()
    print("TESTING USER REGISTRATION FLOW")
    print_separator()
    
    # Test fitness enthusiast registration
    enthusiast_email = f"fitness_enthusiast_{uuid.uuid4()}@example.com"
    enthusiast_data = {
        "email": enthusiast_email,
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss", "general_fitness"],
        "experience_level": "intermediate"
    }
    
    print(f"Creating fitness enthusiast user with email: {enthusiast_email}")
    response = requests.post(f"{BACKEND_URL}/users", json=enthusiast_data)
    
    if response.status_code == 200:
        enthusiast_user = response.json()
        print(f"Successfully created fitness enthusiast user with ID: {enthusiast_user['id']}")
        print(f"User details: {json.dumps(enthusiast_user, indent=2)}")
        
        # Verify all fields are present
        required_fields = ["id", "email", "role", "fitness_goals", "experience_level", 
                          "tree_level", "total_sessions", "consistency_streak", "lift_coins", 
                          "dark_mode", "created_at", "updated_at"]
        
        missing_fields = [field for field in required_fields if field not in enthusiast_user]
        
        if missing_fields:
            print(f"ERROR: Missing fields in user response: {missing_fields}")
            test_results["user_registration"]["details"] += f"Missing fields in fitness enthusiast response: {missing_fields}. "
        else:
            print("All required fields present in response")
            
        # Verify correct values
        assert enthusiast_user["email"] == enthusiast_email
        assert enthusiast_user["role"] == "fitness_enthusiast"
        assert set(enthusiast_user["fitness_goals"]) == set(["weight_loss", "general_fitness"])
        assert enthusiast_user["experience_level"] == "intermediate"
        assert enthusiast_user["tree_level"] == "seed"
        assert enthusiast_user["total_sessions"] == 0
        assert enthusiast_user["consistency_streak"] == 0
        assert enthusiast_user["lift_coins"] == 0
        assert enthusiast_user["dark_mode"] == True
        
        print("All values correctly set for fitness enthusiast")
    else:
        print(f"ERROR: Failed to create fitness enthusiast user. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["user_registration"]["details"] += f"Failed to create fitness enthusiast user. Status code: {response.status_code}. "
        return False
    
    # Test trainer registration
    trainer_email = f"trainer_{uuid.uuid4()}@example.com"
    trainer_data = {
        "email": trainer_email,
        "role": "trainer",
        "fitness_goals": ["sport_training", "rehabilitation"],
        "experience_level": "expert"
    }
    
    print(f"\nCreating trainer user with email: {trainer_email}")
    response = requests.post(f"{BACKEND_URL}/users", json=trainer_data)
    
    if response.status_code == 200:
        trainer_user = response.json()
        print(f"Successfully created trainer user with ID: {trainer_user['id']}")
        print(f"User details: {json.dumps(trainer_user, indent=2)}")
        
        # Verify all fields are present
        required_fields = ["id", "email", "role", "fitness_goals", "experience_level", 
                          "tree_level", "total_sessions", "consistency_streak", "lift_coins", 
                          "dark_mode", "created_at", "updated_at"]
        
        missing_fields = [field for field in required_fields if field not in trainer_user]
        
        if missing_fields:
            print(f"ERROR: Missing fields in user response: {missing_fields}")
            test_results["user_registration"]["details"] += f"Missing fields in trainer response: {missing_fields}. "
        else:
            print("All required fields present in response")
            
        # Verify correct values
        assert trainer_user["email"] == trainer_email
        assert trainer_user["role"] == "trainer"
        assert set(trainer_user["fitness_goals"]) == set(["sport_training", "rehabilitation"])
        assert trainer_user["experience_level"] == "expert"
        assert trainer_user["tree_level"] == "seed"
        assert trainer_user["total_sessions"] == 0
        assert trainer_user["consistency_streak"] == 0
        assert trainer_user["lift_coins"] == 0
        assert trainer_user["dark_mode"] == True
        
        print("All values correctly set for trainer")
        
        # Test duplicate email registration
        print("\nTesting duplicate email registration...")
        response = requests.post(f"{BACKEND_URL}/users", json=trainer_data)
        
        if response.status_code == 400:
            print("Successfully detected duplicate email registration")
        else:
            print(f"ERROR: Duplicate email registration should fail but got status code: {response.status_code}")
            test_results["user_registration"]["details"] += f"Duplicate email registration not properly handled. "
            
        test_results["user_registration"]["success"] = True
        return enthusiast_user  # Return the user for further testing
    else:
        print(f"ERROR: Failed to create trainer user. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["user_registration"]["details"] += f"Failed to create trainer user. Status code: {response.status_code}. "
        return False

def test_session_management_and_tree_progression(user):
    if not user:
        print("Cannot test session management without a valid user")
        return False
        
    print_separator()
    print("TESTING SESSION MANAGEMENT & TREE PROGRESSION")
    print_separator()
    
    user_id = user["id"]
    
    # Initial tree progress check
    print(f"Checking initial tree progress for user {user_id}")
    response = requests.get(f"{BACKEND_URL}/users/{user_id}/tree-progress")
    
    if response.status_code == 200:
        initial_progress = response.json()
        print(f"Initial tree progress: {json.dumps(initial_progress, indent=2)}")
        
        # Verify initial values
        assert initial_progress["current_level"] == "seed"
        assert initial_progress["current_score"] == 0
        assert initial_progress["total_sessions"] == 0
        assert initial_progress["consistency_streak"] == 0
        assert initial_progress["lift_coins"] == 0
        
        print("Initial tree progress values are correct")
    else:
        print(f"ERROR: Failed to get initial tree progress. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["tree_progress_endpoint"]["details"] += f"Failed to get initial tree progress. Status code: {response.status_code}. "
        return False
    
    # Create multiple sessions to test tree progression
    session_counts = [5, 5, 5]  # Create 15 sessions in total
    
    current_level = "seed"
    expected_levels = ["seed", "sprout", "sapling"]  # Expected progression
    
    for i, count in enumerate(session_counts):
        print(f"\nCreating {count} sessions for progression test {i+1}...")
        
        for j in range(count):
            session_data = {
                "user_id": user_id,
                "session_type": f"Workout {j+1}",
                "duration_minutes": 45
            }
            
            response = requests.post(f"{BACKEND_URL}/sessions", json=session_data)
            
            if response.status_code != 200:
                print(f"ERROR: Failed to create session. Status code: {response.status_code}")
                print(f"Response: {response.text}")
                test_results["session_management"]["details"] += f"Failed to create session. Status code: {response.status_code}. "
                return False
        
        # Check tree progress after each batch of sessions
        response = requests.get(f"{BACKEND_URL}/users/{user_id}/tree-progress")
        
        if response.status_code == 200:
            progress = response.json()
            print(f"Tree progress after {(i+1)*count} sessions: {json.dumps(progress, indent=2)}")
            
            # Verify progression
            expected_level = expected_levels[i]
            if progress["current_level"] != expected_level:
                print(f"WARNING: Expected tree level to be {expected_level} but got {progress['current_level']}")
                test_results["tree_progression"]["details"] += f"Tree level calculation may be incorrect. Expected {expected_level} after {(i+1)*count} sessions but got {progress['current_level']}. "
            else:
                print(f"Tree level correctly progressed to {progress['current_level']}")
                
            # Verify session count
            expected_sessions = (i+1) * count
            if progress["total_sessions"] != expected_sessions:
                print(f"ERROR: Expected total_sessions to be {expected_sessions} but got {progress['total_sessions']}")
                test_results["session_management"]["details"] += f"Session count incorrect. Expected {expected_sessions} but got {progress['total_sessions']}. "
            else:
                print(f"Session count correctly updated to {progress['total_sessions']}")
                
            # Verify consistency streak
            expected_streak = (i+1) * count
            if progress["consistency_streak"] != expected_streak:
                print(f"ERROR: Expected consistency_streak to be {expected_streak} but got {progress['consistency_streak']}")
                test_results["session_management"]["details"] += f"Consistency streak incorrect. Expected {expected_streak} but got {progress['consistency_streak']}. "
            else:
                print(f"Consistency streak correctly updated to {progress['consistency_streak']}")
                
            # Verify LiftCoins
            expected_coins = (i+1) * count * 50  # 50 coins per session
            if progress["lift_coins"] != expected_coins:
                print(f"ERROR: Expected lift_coins to be {expected_coins} but got {progress['lift_coins']}")
                test_results["session_management"]["details"] += f"LiftCoins calculation incorrect. Expected {expected_coins} but got {progress['lift_coins']}. "
            else:
                print(f"LiftCoins correctly updated to {progress['lift_coins']}")
                
            current_level = progress["current_level"]
        else:
            print(f"ERROR: Failed to get tree progress. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            test_results["tree_progress_endpoint"]["details"] += f"Failed to get tree progress after sessions. Status code: {response.status_code}. "
            return False
    
    # Get user sessions
    print("\nRetrieving user session history...")
    response = requests.get(f"{BACKEND_URL}/users/{user_id}/sessions")
    
    if response.status_code == 200:
        sessions = response.json()
        print(f"Retrieved {len(sessions)} sessions")
        
        if len(sessions) != sum(session_counts):
            print(f"ERROR: Expected {sum(session_counts)} sessions but got {len(sessions)}")
            test_results["session_management"]["details"] += f"Session history incorrect. Expected {sum(session_counts)} sessions but got {len(sessions)}. "
        else:
            print("Session history count is correct")
            test_results["session_management"]["success"] = True
            test_results["tree_progression"]["success"] = True
            test_results["tree_progress_endpoint"]["success"] = True
    else:
        print(f"ERROR: Failed to get user sessions. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["session_management"]["details"] += f"Failed to get user sessions. Status code: {response.status_code}. "
        return False
        
    return True

def test_user_profile_management(user):
    if not user:
        print("Cannot test user profile management without a valid user")
        return False
        
    print_separator()
    print("TESTING USER PROFILE MANAGEMENT")
    print_separator()
    
    user_id = user["id"]
    
    # Get user profile
    print(f"Getting user profile for user {user_id}")
    response = requests.get(f"{BACKEND_URL}/users/{user_id}")
    
    if response.status_code == 200:
        profile = response.json()
        print(f"Retrieved user profile: {json.dumps(profile, indent=2)}")
        
        # Verify profile matches the user we created
        assert profile["id"] == user["id"]
        assert profile["email"] == user["email"]
        assert profile["role"] == user["role"]
        
        print("User profile retrieval successful")
    else:
        print(f"ERROR: Failed to get user profile. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["user_profile"]["details"] += f"Failed to get user profile. Status code: {response.status_code}. "
        return False
    
    # Update user profile - toggle dark mode and change fitness goals
    print("\nUpdating user profile...")
    update_data = {
        "dark_mode": False,
        "fitness_goals": ["muscle_building", "wellness"],
        "experience_level": "advanced"
    }
    
    response = requests.put(f"{BACKEND_URL}/users/{user_id}", json=update_data)
    
    if response.status_code == 200:
        updated_profile = response.json()
        print(f"Updated user profile: {json.dumps(updated_profile, indent=2)}")
        
        # Verify updates were applied
        assert updated_profile["dark_mode"] == False
        assert set(updated_profile["fitness_goals"]) == set(["muscle_building", "wellness"])
        assert updated_profile["experience_level"] == "advanced"
        
        print("User profile update successful")
        
        # Verify by getting the profile again
        response = requests.get(f"{BACKEND_URL}/users/{user_id}")
        
        if response.status_code == 200:
            profile = response.json()
            
            assert profile["dark_mode"] == False
            assert set(profile["fitness_goals"]) == set(["muscle_building", "wellness"])
            assert profile["experience_level"] == "advanced"
            
            print("User profile update verified with separate GET request")
            test_results["user_profile"]["success"] = True
        else:
            print(f"ERROR: Failed to verify user profile update. Status code: {response.status_code}")
            test_results["user_profile"]["details"] += f"Failed to verify user profile update. Status code: {response.status_code}. "
    else:
        print(f"ERROR: Failed to update user profile. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["user_profile"]["details"] += f"Failed to update user profile. Status code: {response.status_code}. "
        return False
        
    return True

def run_all_tests():
    print("Starting LiftLink Platform Backend API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print_separator()
    
    # Test user registration
    user = test_user_registration()
    
    if user:
        # Test session management and tree progression
        test_session_management_and_tree_progression(user)
        
        # Test user profile management
        test_user_profile_management(user)
    
    # Print test results summary
    print_separator()
    print("TEST RESULTS SUMMARY")
    print_separator()
    
    all_passed = True
    for test_name, result in test_results.items():
        status = "PASSED" if result["success"] else "FAILED"
        details = result["details"] if result["details"] else "No issues found"
        
        print(f"{test_name}: {status}")
        print(f"Details: {details}")
        print()
        
        if not result["success"]:
            all_passed = False
    
    if all_passed:
        print("All tests PASSED!")
    else:
        print("Some tests FAILED. See details above.")

if __name__ == "__main__":
    run_all_tests()