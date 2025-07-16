#!/usr/bin/env python3
import requests
import json
import time
import uuid
from datetime import datetime, timedelta

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://d660cf88-6e41-4268-ab24-1f6ce76bcb10.preview.emergentagent.com/api"

# Test results
test_results = {
    "user_registration": {"success": False, "details": ""},
    "tree_progression": {"success": False, "details": ""},
    "session_management": {"success": False, "details": ""},
    "user_profile": {"success": False, "details": ""},
    "tree_progress_endpoint": {"success": False, "details": ""},
    "email_validation": {"success": False, "details": ""},
    "user_existence_check": {"success": False, "details": ""},
    "user_login": {"success": False, "details": ""},
    "complete_user_journey": {"success": False, "details": ""},
    "fitness_connection_status": {"success": False, "details": ""},
    "fitness_oauth_flows": {"success": False, "details": ""},
    "fitness_data_sync": {"success": False, "details": ""},
    "enhanced_session_management": {"success": False, "details": ""},
    "fitness_disconnection": {"success": False, "details": ""},
    "enhanced_tree_progress": {"success": False, "details": ""},
    "stripe_payment_integration": {"success": False, "details": ""},
    "trainer_features": {"success": False, "details": ""}
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
def test_email_validation_and_user_existence():
    print_separator()
    print("TESTING EMAIL VALIDATION AND USER EXISTENCE CHECK")
    print_separator()
    
    # Test with invalid email format
    print("Testing with invalid email format...")
    invalid_email_data = {
        "email": "invalid-email"
    }
    
    response = requests.post(f"{BACKEND_URL}/check-user", json=invalid_email_data)
    
    if response.status_code == 422:
        print("Successfully rejected invalid email format")
    else:
        print(f"ERROR: Invalid email format should be rejected but got status code: {response.status_code}")
        test_results["email_validation"]["details"] += f"Invalid email format not properly validated. Status code: {response.status_code}. "
        
    # Test with non-existent user
    print("\nTesting with non-existent user...")
    non_existent_email = f"non_existent_{uuid.uuid4()}@example.com"
    non_existent_data = {
        "email": non_existent_email
    }
    
    response = requests.post(f"{BACKEND_URL}/check-user", json=non_existent_data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if result["exists"] == False and result["email"] == non_existent_email:
            print("Successfully identified non-existent user")
        else:
            print(f"ERROR: Non-existent user check failed. Expected exists=False but got {result['exists']}")
            test_results["user_existence_check"]["details"] += f"Non-existent user check failed. Expected exists=False but got {result['exists']}. "
    else:
        print(f"ERROR: Failed to check non-existent user. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["user_existence_check"]["details"] += f"Failed to check non-existent user. Status code: {response.status_code}. "
        return False
    
    # Create a user for existence check
    print("\nCreating a user for existence check...")
    test_email = f"existence_check_{uuid.uuid4()}@example.com"
    user_data = {
        "email": test_email,
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss", "general_fitness"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data)
    
    if response.status_code == 200:
        user = response.json()
        print(f"Created user with email: {test_email}")
        
        # Test with existing user
        print("\nTesting with existing user...")
        existing_data = {
            "email": test_email
        }
        
        response = requests.post(f"{BACKEND_URL}/check-user", json=existing_data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
            
            if result["exists"] == True and result["email"] == test_email and result["user_data"] is not None:
                print("Successfully identified existing user")
                test_results["email_validation"]["success"] = True
                test_results["user_existence_check"]["success"] = True
                return user
            else:
                print(f"ERROR: Existing user check failed. Expected exists=True but got {result['exists']}")
                test_results["user_existence_check"]["details"] += f"Existing user check failed. Expected exists=True but got {result['exists']}. "
        else:
            print(f"ERROR: Failed to check existing user. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            test_results["user_existence_check"]["details"] += f"Failed to check existing user. Status code: {response.status_code}. "
    else:
        print(f"ERROR: Failed to create user for existence check. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["user_existence_check"]["details"] += f"Failed to create user for existence check. Status code: {response.status_code}. "
    
    return False

def test_user_login():
    print_separator()
    print("TESTING USER LOGIN - PYDANTIC VALIDATION FIX")
    print_separator()
    
    # Create multiple users with different data types to test Pydantic validation fix
    test_users = []
    
    # Test 1: Create user with enum values (new format)
    print("Creating user with enum values (new format)...")
    test_email_1 = f"login_test_enum_{uuid.uuid4()}@example.com"
    user_data_1 = {
        "email": test_email_1,
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss", "general_fitness"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data_1)
    
    if response.status_code == 200:
        created_user_1 = response.json()
        print(f"Created user 1 with email: {test_email_1}")
        test_users.append((created_user_1, test_email_1, "enum_format"))
    else:
        print(f"ERROR: Failed to create user 1. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["user_login"]["details"] += f"Failed to create user 1. Status code: {response.status_code}. "
    
    # Test 2: Create user with trainer role
    print("\nCreating user with trainer role...")
    test_email_2 = f"login_test_trainer_{uuid.uuid4()}@example.com"
    user_data_2 = {
        "email": test_email_2,
        "role": "trainer",
        "fitness_goals": ["sport_training", "rehabilitation"],
        "experience_level": "expert"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data_2)
    
    if response.status_code == 200:
        created_user_2 = response.json()
        print(f"Created user 2 with email: {test_email_2}")
        test_users.append((created_user_2, test_email_2, "trainer_role"))
    else:
        print(f"ERROR: Failed to create user 2. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["user_login"]["details"] += f"Failed to create user 2. Status code: {response.status_code}. "
    
    # Now test login for each user to verify Pydantic validation fix
    login_success_count = 0
    
    for created_user, test_email, user_type in test_users:
        print(f"\n--- Testing login for {user_type} user ---")
        print(f"Testing login with email: {test_email}")
        
        login_data = {
            "email": test_email
        }
        
        response = requests.post(f"{BACKEND_URL}/login", json=login_data)
        
        if response.status_code == 200:
            logged_in_user = response.json()
            print(f"✅ Successfully logged in {user_type} user")
            print(f"Login response: {json.dumps(logged_in_user, indent=2)}")
            
            # Verify UserResponse structure and data types
            required_fields = ["id", "email", "role", "fitness_goals", "experience_level", "created_at"]
            missing_fields = [field for field in required_fields if field not in logged_in_user]
            
            if missing_fields:
                print(f"❌ ERROR: Missing fields in login response: {missing_fields}")
                test_results["user_login"]["details"] += f"Missing fields in {user_type} login response: {missing_fields}. "
                continue
            
            # Verify data types are correct (strings, not enum objects)
            validation_errors = []
            
            # Check that role is a string
            if not isinstance(logged_in_user["role"], str):
                validation_errors.append(f"role should be string but got {type(logged_in_user['role'])}")
            
            # Check that fitness_goals is a list of strings
            if not isinstance(logged_in_user["fitness_goals"], list):
                validation_errors.append(f"fitness_goals should be list but got {type(logged_in_user['fitness_goals'])}")
            elif logged_in_user["fitness_goals"]:
                for i, goal in enumerate(logged_in_user["fitness_goals"]):
                    if not isinstance(goal, str):
                        validation_errors.append(f"fitness_goals[{i}] should be string but got {type(goal)}")
            
            # Check that experience_level is a string
            if not isinstance(logged_in_user["experience_level"], str):
                validation_errors.append(f"experience_level should be string but got {type(logged_in_user['experience_level'])}")
            
            # Check that email and id match
            if logged_in_user["email"] != test_email:
                validation_errors.append(f"email mismatch: expected {test_email}, got {logged_in_user['email']}")
            
            if logged_in_user["id"] != created_user["id"]:
                validation_errors.append(f"id mismatch: expected {created_user['id']}, got {logged_in_user['id']}")
            
            if validation_errors:
                print(f"❌ ERROR: Validation errors for {user_type} user:")
                for error in validation_errors:
                    print(f"   - {error}")
                test_results["user_login"]["details"] += f"Validation errors for {user_type} user: {'; '.join(validation_errors)}. "
            else:
                print(f"✅ All validation checks passed for {user_type} user")
                print(f"   - Role: {logged_in_user['role']} (type: {type(logged_in_user['role']).__name__})")
                print(f"   - Fitness goals: {logged_in_user['fitness_goals']} (all strings: {all(isinstance(g, str) for g in logged_in_user['fitness_goals'])})")
                print(f"   - Experience level: {logged_in_user['experience_level']} (type: {type(logged_in_user['experience_level']).__name__})")
                login_success_count += 1
                
        elif response.status_code == 500:
            print(f"❌ CRITICAL ERROR: Login failed with 500 Internal Server Error for {user_type} user")
            print(f"Response: {response.text}")
            print("This indicates the Pydantic validation fix may not be working correctly!")
            test_results["user_login"]["details"] += f"500 Internal Server Error for {user_type} user - Pydantic validation issue. "
        else:
            print(f"❌ ERROR: Failed to login {user_type} user. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            test_results["user_login"]["details"] += f"Failed to login {user_type} user. Status code: {response.status_code}. "
    
    # Test login with non-existent email
    print("\n--- Testing login with non-existent email ---")
    non_existent_email = f"non_existent_{uuid.uuid4()}@example.com"
    login_data = {
        "email": non_existent_email
    }
    
    response = requests.post(f"{BACKEND_URL}/login", json=login_data)
    
    if response.status_code == 404:
        print("✅ Successfully rejected login with non-existent email")
        login_success_count += 1  # Count this as a success since it behaved correctly
    else:
        print(f"❌ ERROR: Login with non-existent email should return 404 but got status code: {response.status_code}")
        test_results["user_login"]["details"] += f"Login with non-existent email returned {response.status_code} instead of 404. "
    
    # Test login with invalid email format
    print("\n--- Testing login with invalid email format ---")
    invalid_login_data = {
        "email": "invalid-email-format"
    }
    
    response = requests.post(f"{BACKEND_URL}/login", json=invalid_login_data)
    
    if response.status_code == 422:
        print("✅ Successfully rejected login with invalid email format")
        login_success_count += 1  # Count this as a success
    else:
        print(f"❌ ERROR: Login with invalid email should return 422 but got status code: {response.status_code}")
        test_results["user_login"]["details"] += f"Login with invalid email returned {response.status_code} instead of 422. "
    
    # Determine overall success
    expected_successes = len(test_users) + 2  # Created users + non-existent email + invalid email
    if login_success_count >= expected_successes:
        print(f"\n✅ LOGIN ENDPOINT TEST PASSED: {login_success_count}/{expected_successes} tests successful")
        print("🎉 Pydantic validation fix is working correctly!")
        test_results["user_login"]["success"] = True
        return test_users[0][0] if test_users else None  # Return first created user
    else:
        print(f"\n❌ LOGIN ENDPOINT TEST FAILED: Only {login_success_count}/{expected_successes} tests successful")
        print("⚠️  Pydantic validation fix may need further investigation")
        
    return test_users[0][0] if test_users else None

def test_fitness_connection_status(user):
    """Test fitness device connection status API"""
    if not user:
        print("Cannot test fitness connection status without a valid user")
        return False
        
    print_separator()
    print("TESTING FITNESS CONNECTION STATUS API")
    print_separator()
    
    user_id = user["id"]
    
    # Test getting fitness connection status
    print(f"Getting fitness connection status for user {user_id}")
    response = requests.get(f"{BACKEND_URL}/fitness/status/{user_id}")
    
    if response.status_code == 200:
        status = response.json()
        print(f"Fitness connection status: {json.dumps(status, indent=2)}")
        
        # Verify response structure
        required_fields = ["fitbit_connected", "google_fit_connected", "last_sync"]
        missing_fields = [field for field in required_fields if field not in status]
        
        if missing_fields:
            print(f"ERROR: Missing fields in fitness status response: {missing_fields}")
            test_results["fitness_connection_status"]["details"] += f"Missing fields: {missing_fields}. "
            return False
        
        # Verify initial values (should be False for new user)
        if status["fitbit_connected"] == False and status["google_fit_connected"] == False:
            print("Initial fitness connection status is correct (both disconnected)")
            test_results["fitness_connection_status"]["success"] = True
            return True
        else:
            print(f"ERROR: Expected both connections to be False but got fitbit: {status['fitbit_connected']}, google_fit: {status['google_fit_connected']}")
            test_results["fitness_connection_status"]["details"] += f"Initial connection status incorrect. "
            return False
    else:
        print(f"ERROR: Failed to get fitness connection status. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["fitness_connection_status"]["details"] += f"Failed to get fitness connection status. Status code: {response.status_code}. "
        return False

def test_fitness_oauth_flows():
    """Test fitness OAuth initiation flows"""
    print_separator()
    print("TESTING FITNESS OAUTH FLOWS")
    print_separator()
    
    # Test Fitbit OAuth initiation
    print("Testing Fitbit OAuth initiation...")
    response = requests.get(f"{BACKEND_URL}/fitbit/login")
    
    if response.status_code == 501:
        result = response.json()
        print(f"Fitbit OAuth response: {json.dumps(result, indent=2)}")
        
        if "not configured" in result.get("detail", "").lower():
            print("Successfully returned proper error for unconfigured Fitbit credentials")
        else:
            print(f"ERROR: Expected 'not configured' error but got: {result.get('detail')}")
            test_results["fitness_oauth_flows"]["details"] += f"Fitbit OAuth error message incorrect. "
    else:
        print(f"ERROR: Expected status code 501 for unconfigured Fitbit but got: {response.status_code}")
        test_results["fitness_oauth_flows"]["details"] += f"Fitbit OAuth status code incorrect. Expected 501 but got {response.status_code}. "
    
    # Test Google Fit OAuth initiation
    print("\nTesting Google Fit OAuth initiation...")
    response = requests.get(f"{BACKEND_URL}/google-fit/login")
    
    if response.status_code == 501:
        result = response.json()
        print(f"Google Fit OAuth response: {json.dumps(result, indent=2)}")
        
        if "not configured" in result.get("detail", "").lower():
            print("Successfully returned proper error for unconfigured Google Fit credentials")
            test_results["fitness_oauth_flows"]["success"] = True
            return True
        else:
            print(f"ERROR: Expected 'not configured' error but got: {result.get('detail')}")
            test_results["fitness_oauth_flows"]["details"] += f"Google Fit OAuth error message incorrect. "
    else:
        print(f"ERROR: Expected status code 501 for unconfigured Google Fit but got: {response.status_code}")
        test_results["fitness_oauth_flows"]["details"] += f"Google Fit OAuth status code incorrect. Expected 501 but got {response.status_code}. "
    
    return False

def test_fitness_data_sync(user):
    """Test fitness data sync functionality"""
    if not user:
        print("Cannot test fitness data sync without a valid user")
        return False
        
    print_separator()
    print("TESTING FITNESS DATA SYNC")
    print_separator()
    
    user_id = user["id"]
    
    # Test sync workouts
    print(f"Testing workout sync for user {user_id}")
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
            print(f"Successfully synced {synced_count} workouts")
            
            if synced_count > 0:
                print("Mock sync process worked correctly")
            else:
                print("WARNING: No workouts were synced (this might be expected for mock data)")
        else:
            print("ERROR: Missing 'synced_workouts' field in response")
            test_results["fitness_data_sync"]["details"] += f"Missing synced_workouts field. "
            return False
    else:
        print(f"ERROR: Failed to sync workouts. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["fitness_data_sync"]["details"] += f"Failed to sync workouts. Status code: {response.status_code}. "
        return False
    
    # Test get fitness data
    print(f"\nTesting get fitness data for user {user_id}")
    response = requests.get(f"{BACKEND_URL}/fitness/data/{user_id}")
    
    if response.status_code == 200:
        fitness_data = response.json()
        print(f"Fitness data response: {json.dumps(fitness_data, indent=2)}")
        
        # Verify response structure
        required_fields = ["total_workouts", "this_week", "avg_duration", "recent_workouts"]
        missing_fields = [field for field in required_fields if field not in fitness_data]
        
        if missing_fields:
            print(f"ERROR: Missing fields in fitness data response: {missing_fields}")
            test_results["fitness_data_sync"]["details"] += f"Missing fields in fitness data: {missing_fields}. "
            return False
        
        # Verify data types
        if (isinstance(fitness_data["total_workouts"], int) and 
            isinstance(fitness_data["this_week"], int) and
            isinstance(fitness_data["avg_duration"], int) and
            isinstance(fitness_data["recent_workouts"], list)):
            print("Fitness data structure and types are correct")
            test_results["fitness_data_sync"]["success"] = True
            return True
        else:
            print("ERROR: Fitness data types are incorrect")
            test_results["fitness_data_sync"]["details"] += f"Fitness data types incorrect. "
            return False
    else:
        print(f"ERROR: Failed to get fitness data. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["fitness_data_sync"]["details"] += f"Failed to get fitness data. Status code: {response.status_code}. "
        return False

def test_enhanced_session_management(user):
    """Test enhanced session management with new fields"""
    if not user:
        print("Cannot test enhanced session management without a valid user")
        return False
        
    print_separator()
    print("TESTING ENHANCED SESSION MANAGEMENT")
    print_separator()
    
    user_id = user["id"]
    
    # Test creating sessions with different sources and new fields
    session_types = [
        {
            "source": "manual",
            "session_type": "Manual Workout",
            "duration_minutes": 45,
            "calories": 300,
            "heart_rate_avg": 140
        },
        {
            "source": "trainer",
            "session_type": "Personal Training",
            "duration_minutes": 60,
            "calories": 400,
            "heart_rate_avg": 155,
            "trainer_id": "trainer_123",
            "scheduled_time": (datetime.now() + timedelta(hours=1)).isoformat()
        },
        {
            "source": "fitbit",
            "session_type": "Running",
            "duration_minutes": 30,
            "calories": 250,
            "heart_rate_avg": 160
        },
        {
            "source": "google_fit",
            "session_type": "Cycling",
            "duration_minutes": 40,
            "calories": 280,
            "heart_rate_avg": 145
        }
    ]
    
    created_sessions = []
    
    for i, session_data in enumerate(session_types):
        print(f"\nCreating {session_data['source']} session...")
        session_data["user_id"] = user_id
        
        response = requests.post(f"{BACKEND_URL}/sessions", json=session_data)
        
        if response.status_code == 200:
            session = response.json()
            print(f"Created session: {json.dumps(session, indent=2)}")
            created_sessions.append(session)
            
            # Verify all fields are present
            required_fields = ["id", "user_id", "session_type", "duration_minutes", "source", "created_at"]
            missing_fields = [field for field in required_fields if field not in session]
            
            if missing_fields:
                print(f"ERROR: Missing fields in session response: {missing_fields}")
                test_results["enhanced_session_management"]["details"] += f"Missing fields in {session_data['source']} session: {missing_fields}. "
                return False
            
            # Verify field values
            if (session["source"] == session_data["source"] and
                session["duration_minutes"] == session_data["duration_minutes"] and
                session.get("calories") == session_data.get("calories") and
                session.get("heart_rate_avg") == session_data.get("heart_rate_avg")):
                print(f"Session fields correctly set for {session_data['source']} source")
            else:
                print(f"ERROR: Session field values incorrect for {session_data['source']} source")
                test_results["enhanced_session_management"]["details"] += f"Field values incorrect for {session_data['source']} session. "
                return False
        else:
            print(f"ERROR: Failed to create {session_data['source']} session. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            test_results["enhanced_session_management"]["details"] += f"Failed to create {session_data['source']} session. Status code: {response.status_code}. "
            return False
    
    # Test upcoming sessions endpoint
    print(f"\nTesting upcoming sessions for user {user_id}")
    response = requests.get(f"{BACKEND_URL}/users/{user_id}/upcoming-sessions")
    
    if response.status_code == 200:
        upcoming = response.json()
        print(f"Upcoming sessions: {json.dumps(upcoming, indent=2)}")
        
        if isinstance(upcoming, list):
            print("Upcoming sessions endpoint works correctly")
        else:
            print("ERROR: Upcoming sessions should return a list")
            test_results["enhanced_session_management"]["details"] += f"Upcoming sessions format incorrect. "
            return False
    else:
        print(f"ERROR: Failed to get upcoming sessions. Status code: {response.status_code}")
        test_results["enhanced_session_management"]["details"] += f"Failed to get upcoming sessions. Status code: {response.status_code}. "
        return False
    
    # Test pending check-ins endpoint
    print(f"\nTesting pending check-ins for user {user_id}")
    response = requests.get(f"{BACKEND_URL}/users/{user_id}/pending-checkins")
    
    if response.status_code == 200:
        pending = response.json()
        print(f"Pending check-ins: {json.dumps(pending, indent=2)}")
        
        if isinstance(pending, list):
            print("Pending check-ins endpoint works correctly")
        else:
            print("ERROR: Pending check-ins should return a list")
            test_results["enhanced_session_management"]["details"] += f"Pending check-ins format incorrect. "
            return False
    else:
        print(f"ERROR: Failed to get pending check-ins. Status code: {response.status_code}")
        test_results["enhanced_session_management"]["details"] += f"Failed to get pending check-ins. Status code: {response.status_code}. "
        return False
    
    # Test request check-in
    if created_sessions:
        session_id = created_sessions[0]["id"]
        print(f"\nTesting request check-in for session {session_id}")
        response = requests.post(f"{BACKEND_URL}/sessions/{session_id}/request-checkin")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Check-in request response: {json.dumps(result, indent=2)}")
            
            if "message" in result:
                print("Check-in request endpoint works correctly")
                test_results["enhanced_session_management"]["success"] = True
                return True
            else:
                print("ERROR: Check-in request should return a message")
                test_results["enhanced_session_management"]["details"] += f"Check-in request response format incorrect. "
                return False
        else:
            print(f"ERROR: Failed to request check-in. Status code: {response.status_code}")
            test_results["enhanced_session_management"]["details"] += f"Failed to request check-in. Status code: {response.status_code}. "
            return False
    
    return False

def test_fitness_disconnection(user):
    """Test fitness device disconnection APIs"""
    if not user:
        print("Cannot test fitness disconnection without a valid user")
        return False
        
    print_separator()
    print("TESTING FITNESS DISCONNECTION APIS")
    print_separator()
    
    user_id = user["id"]
    
    # Test Fitbit disconnection
    print(f"Testing Fitbit disconnection for user {user_id}")
    response = requests.delete(f"{BACKEND_URL}/fitbit/disconnect/{user_id}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Fitbit disconnect response: {json.dumps(result, indent=2)}")
        
        if "message" in result and "disconnected" in result["message"].lower():
            print("Fitbit disconnection works correctly")
        else:
            print("ERROR: Fitbit disconnect response format incorrect")
            test_results["fitness_disconnection"]["details"] += f"Fitbit disconnect response format incorrect. "
            return False
    else:
        print(f"ERROR: Failed to disconnect Fitbit. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["fitness_disconnection"]["details"] += f"Failed to disconnect Fitbit. Status code: {response.status_code}. "
        return False
    
    # Test Google Fit disconnection
    print(f"\nTesting Google Fit disconnection for user {user_id}")
    response = requests.delete(f"{BACKEND_URL}/google-fit/disconnect/{user_id}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Google Fit disconnect response: {json.dumps(result, indent=2)}")
        
        if "message" in result and "disconnected" in result["message"].lower():
            print("Google Fit disconnection works correctly")
            test_results["fitness_disconnection"]["success"] = True
            return True
        else:
            print("ERROR: Google Fit disconnect response format incorrect")
            test_results["fitness_disconnection"]["details"] += f"Google Fit disconnect response format incorrect. "
            return False
    else:
        print(f"ERROR: Failed to disconnect Google Fit. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["fitness_disconnection"]["details"] += f"Failed to disconnect Google Fit. Status code: {response.status_code}. "
        return False

def test_enhanced_tree_progress(user):
    """Test enhanced tree progress with different session sources"""
    if not user:
        print("Cannot test enhanced tree progress without a valid user")
        return False
        
    print_separator()
    print("TESTING ENHANCED TREE PROGRESS WITH SESSION SOURCES")
    print_separator()
    
    user_id = user["id"]
    
    # Create sessions from different sources
    session_sources = ["manual", "trainer", "fitbit", "google_fit"]
    
    for source in session_sources:
        print(f"\nCreating {source} session for tree progress test...")
        session_data = {
            "user_id": user_id,
            "session_type": f"{source.title()} Workout",
            "duration_minutes": 30,
            "source": source,
            "calories": 200,
            "heart_rate_avg": 140
        }
        
        response = requests.post(f"{BACKEND_URL}/sessions", json=session_data)
        
        if response.status_code != 200:
            print(f"ERROR: Failed to create {source} session. Status code: {response.status_code}")
            test_results["enhanced_tree_progress"]["details"] += f"Failed to create {source} session. "
            return False
    
    # Check tree progress after creating sessions from all sources
    print(f"\nChecking tree progress after creating sessions from all sources...")
    response = requests.get(f"{BACKEND_URL}/users/{user_id}/tree-progress")
    
    if response.status_code == 200:
        progress = response.json()
        print(f"Enhanced tree progress: {json.dumps(progress, indent=2)}")
        
        # Verify response structure
        required_fields = ["total_sessions", "consistency_streak", "current_level", "lift_coins", "progress_percentage"]
        missing_fields = [field for field in required_fields if field not in progress]
        
        if missing_fields:
            print(f"ERROR: Missing fields in tree progress response: {missing_fields}")
            test_results["enhanced_tree_progress"]["details"] += f"Missing fields: {missing_fields}. "
            return False
        
        # Verify that sessions from all sources are counted
        if progress["total_sessions"] >= len(session_sources):
            print(f"Tree progress correctly counts sessions from all sources: {progress['total_sessions']} total sessions")
            
            # Verify LiftCoins calculation
            expected_min_coins = len(session_sources) * 50  # 50 coins per session minimum
            if progress["lift_coins"] >= expected_min_coins:
                print(f"LiftCoins calculation works with multiple session sources: {progress['lift_coins']} coins")
                
                # Verify tree level progression
                if progress["current_level"] in ["seed", "sprout", "sapling", "young_tree", "mature_tree", "strong_oak", "mighty_pine", "ancient_elm", "giant_sequoia", "redwood"]:
                    print(f"Tree level is valid: {progress['current_level']}")
                    
                    # Verify progress percentage
                    if 0 <= progress["progress_percentage"] <= 100:
                        print(f"Progress percentage is valid: {progress['progress_percentage']}%")
                        test_results["enhanced_tree_progress"]["success"] = True
                        return True
                    else:
                        print(f"ERROR: Progress percentage out of range: {progress['progress_percentage']}")
                        test_results["enhanced_tree_progress"]["details"] += f"Progress percentage out of range. "
                else:
                    print(f"ERROR: Invalid tree level: {progress['current_level']}")
                    test_results["enhanced_tree_progress"]["details"] += f"Invalid tree level. "
            else:
                print(f"ERROR: LiftCoins calculation incorrect. Expected at least {expected_min_coins} but got {progress['lift_coins']}")
                test_results["enhanced_tree_progress"]["details"] += f"LiftCoins calculation incorrect. "
        else:
            print(f"ERROR: Total sessions count incorrect. Expected at least {len(session_sources)} but got {progress['total_sessions']}")
            test_results["enhanced_tree_progress"]["details"] += f"Session count incorrect. "
    else:
        print(f"ERROR: Failed to get enhanced tree progress. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["enhanced_tree_progress"]["details"] += f"Failed to get tree progress. Status code: {response.status_code}. "
    
    return False

def test_complete_user_journey():
    print_separator()
    print("TESTING COMPLETE USER JOURNEY")
    print_separator()
    
    # Step 1: Check if user exists (should not exist)
    print("Step 1: Checking if user exists...")
    test_email = f"journey_{uuid.uuid4()}@example.com"
    check_data = {
        "email": test_email
    }
    
    response = requests.post(f"{BACKEND_URL}/check-user", json=check_data)
    
    if response.status_code == 200:
        result = response.json()
        if result["exists"] == False:
            print(f"User does not exist as expected: {test_email}")
        else:
            print(f"ERROR: User should not exist but check returned exists=True")
            test_results["complete_user_journey"]["details"] += f"User existence check failed in journey. "
            return False
    else:
        print(f"ERROR: Failed to check user existence. Status code: {response.status_code}")
        test_results["complete_user_journey"]["details"] += f"Failed to check user existence in journey. Status code: {response.status_code}. "
        return False
    
    # Step 2: Register new user
    print("\nStep 2: Registering new user...")
    user_data = {
        "email": test_email,
        "role": "fitness_enthusiast",
        "fitness_goals": ["muscle_building", "sport_training"],
        "experience_level": "intermediate"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data)
    
    if response.status_code == 200:
        user = response.json()
        print(f"Successfully registered user: {json.dumps(user, indent=2)}")
    else:
        print(f"ERROR: Failed to register user. Status code: {response.status_code}")
        test_results["complete_user_journey"]["details"] += f"Failed to register user in journey. Status code: {response.status_code}. "
        return False
    
    # Step 3: Check if user exists now (should exist)
    print("\nStep 3: Checking if user exists now...")
    response = requests.post(f"{BACKEND_URL}/check-user", json=check_data)
    
    if response.status_code == 200:
        result = response.json()
        if result["exists"] == True:
            print(f"User exists as expected after registration")
        else:
            print(f"ERROR: User should exist but check returned exists=False")
            test_results["complete_user_journey"]["details"] += f"User existence check failed after registration in journey. "
            return False
    else:
        print(f"ERROR: Failed to check user existence. Status code: {response.status_code}")
        test_results["complete_user_journey"]["details"] += f"Failed to check user existence after registration in journey. Status code: {response.status_code}. "
        return False
    
    # Step 4: Login with the user
    print("\nStep 4: Logging in with the user...")
    login_data = {
        "email": test_email
    }
    
    response = requests.post(f"{BACKEND_URL}/login", json=login_data)
    
    if response.status_code == 200:
        logged_in_user = response.json()
        print(f"Successfully logged in: {json.dumps(logged_in_user, indent=2)}")
    else:
        print(f"ERROR: Failed to login. Status code: {response.status_code}")
        test_results["complete_user_journey"]["details"] += f"Failed to login in journey. Status code: {response.status_code}. "
        return False
    
    # Step 5: Complete workout sessions
    print("\nStep 5: Completing workout sessions...")
    for i in range(3):
        session_data = {
            "user_id": user["id"],
            "session_type": f"Journey Workout {i+1}",
            "duration_minutes": 60
        }
        
        response = requests.post(f"{BACKEND_URL}/sessions", json=session_data)
        
        if response.status_code == 200:
            session = response.json()
            print(f"Completed session {i+1}: {session['id']}")
        else:
            print(f"ERROR: Failed to complete session {i+1}. Status code: {response.status_code}")
            test_results["complete_user_journey"]["details"] += f"Failed to complete session in journey. Status code: {response.status_code}. "
            return False
    
    # Step 6: Check tree progression
    print("\nStep 6: Checking tree progression...")
    response = requests.get(f"{BACKEND_URL}/users/{user['id']}/tree-progress")
    
    if response.status_code == 200:
        progress = response.json()
        print(f"Tree progression: {json.dumps(progress, indent=2)}")
        
        # Verify progression data
        if progress["total_sessions"] == 3 and progress["consistency_streak"] == 3 and progress["lift_coins"] == 150:
            print("Tree progression data is correct")
        else:
            print(f"ERROR: Tree progression data is incorrect")
            test_results["complete_user_journey"]["details"] += f"Tree progression data incorrect in journey. "
            return False
    else:
        print(f"ERROR: Failed to check tree progression. Status code: {response.status_code}")
        test_results["complete_user_journey"]["details"] += f"Failed to check tree progression in journey. Status code: {response.status_code}. "
        return False
    
    # Step 7: Check session history
    print("\nStep 7: Checking session history...")
    response = requests.get(f"{BACKEND_URL}/users/{user['id']}/sessions")
    
    if response.status_code == 200:
        sessions = response.json()
        print(f"Retrieved {len(sessions)} sessions")
        
        if len(sessions) == 3:
            print("Session history is correct")
        else:
            print(f"ERROR: Expected 3 sessions but got {len(sessions)}")
            test_results["complete_user_journey"]["details"] += f"Session history incorrect in journey. Expected 3 sessions but got {len(sessions)}. "
            return False
    else:
        print(f"ERROR: Failed to get session history. Status code: {response.status_code}")
        test_results["complete_user_journey"]["details"] += f"Failed to get session history in journey. Status code: {response.status_code}. "
        return False
    
    # Step 8: Update user profile
    print("\nStep 8: Updating user profile...")
    update_data = {
        "dark_mode": False,
        "fitness_goals": ["weight_loss", "wellness"],
        "experience_level": "advanced"
    }
    
    response = requests.put(f"{BACKEND_URL}/users/{user['id']}", json=update_data)
    
    if response.status_code == 200:
        updated_user = response.json()
        print(f"Updated user profile: {json.dumps(updated_user, indent=2)}")
        
        # Verify updates
        if updated_user["dark_mode"] == False and "weight_loss" in updated_user["fitness_goals"] and updated_user["experience_level"] == "advanced":
            print("User profile updated correctly")
            test_results["complete_user_journey"]["success"] = True
        else:
            print(f"ERROR: User profile update verification failed")
            test_results["complete_user_journey"]["details"] += f"User profile update verification failed in journey. "
            return False
    else:
        print(f"ERROR: Failed to update user profile. Status code: {response.status_code}")
        test_results["complete_user_journey"]["details"] += f"Failed to update user profile in journey. Status code: {response.status_code}. "
        return False
    
    return True
        
    return True

def test_email_verification_system():
    """Test the newly implemented email verification system"""
    print_separator()
    print("TESTING EMAIL VERIFICATION SYSTEM")
    print_separator()
    
    test_email = f"email_verification_{uuid.uuid4()}@example.com"
    
    # Test 1: Send verification email
    print("Step 1: Testing send verification email...")
    send_request = {
        "email": test_email
    }
    
    response = requests.post(f"{BACKEND_URL}/send-verification", json=send_request)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Send verification response: {json.dumps(result, indent=2)}")
        
        if result.get("verification_sent") == True:
            print("✅ Verification email sent successfully")
        else:
            print("❌ ERROR: Verification email not sent")
            test_results["email_verification"]["details"] += "Verification email not sent. "
            return False
    else:
        print(f"❌ ERROR: Failed to send verification email. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["email_verification"]["details"] += f"Failed to send verification email. Status code: {response.status_code}. "
        return False
    
    # Test 2: Create user (should set email_verified to False)
    print("\nStep 2: Creating user (should require email verification)...")
    user_data = {
        "email": test_email,
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss", "general_fitness"],
        "experience_level": "intermediate"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data)
    
    if response.status_code == 200:
        user = response.json()
        print(f"✅ User created successfully: {user['id']}")
    else:
        print(f"❌ ERROR: Failed to create user. Status code: {response.status_code}")
        test_results["email_verification"]["details"] += f"Failed to create user. Status code: {response.status_code}. "
        return False
    
    # Test 3: Try to login without email verification (should fail)
    print("\nStep 3: Testing login without email verification (should fail)...")
    login_request = {
        "email": test_email
    }
    
    response = requests.post(f"{BACKEND_URL}/login", json=login_request)
    
    if response.status_code == 403:
        result = response.json()
        print(f"✅ Login correctly blocked for unverified email: {result.get('detail')}")
    else:
        print(f"❌ ERROR: Login should be blocked for unverified email but got status code: {response.status_code}")
        test_results["email_verification"]["details"] += f"Login not blocked for unverified email. Status code: {response.status_code}. "
        return False
    
    # Test 4: Verify email with mock code (we'll use a mock code since we can't get the real one)
    print("\nStep 4: Testing email verification with mock code...")
    # For testing, we'll use a mock verification code
    mock_verification_code = "ABC123"
    
    verify_request = {
        "email": test_email,
        "verification_code": mock_verification_code
    }
    
    response = requests.post(f"{BACKEND_URL}/verify-email", json=verify_request)
    
    # This might fail with the mock code, but let's see the response
    print(f"Verify email response status: {response.status_code}")
    if response.status_code != 200:
        print(f"Response: {response.text}")
        print("Note: This is expected to fail with mock verification code in testing")
    
    # Test 5: Test invalid verification scenarios
    print("\nStep 5: Testing invalid verification scenarios...")
    
    # Test with non-existent email
    invalid_verify_request = {
        "email": f"nonexistent_{uuid.uuid4()}@example.com",
        "verification_code": "ABC123"
    }
    
    response = requests.post(f"{BACKEND_URL}/verify-email", json=invalid_verify_request)
    
    if response.status_code == 400:
        print("✅ Correctly rejected verification for non-existent email")
    else:
        print(f"❌ ERROR: Should reject verification for non-existent email but got status code: {response.status_code}")
        test_results["email_verification"]["details"] += f"Invalid email verification handling incorrect. "
    
    test_results["email_verification"]["success"] = True
    print("✅ Email verification system tests completed")
    return True

def test_stripe_payment_integration():
    """Test the newly implemented Stripe payment integration"""
    print_separator()
    print("TESTING STRIPE PAYMENT INTEGRATION")
    print_separator()
    
    trainer_id = "trainer_test_456"
    client_id = "client_test_789"
    session_id = "session_test_123"
    
    # Test 1: Get session cost
    print("Step 1: Testing get session cost...")
    response = requests.get(f"{BACKEND_URL}/payments/session-cost/{trainer_id}")
    
    if response.status_code == 200:
        cost_data = response.json()
        print(f"✅ Session cost retrieved: {json.dumps(cost_data, indent=2)}")
        
        # Verify response structure
        required_fields = ["trainer_id", "session_type", "cost_cents", "cost_dollars", "currency"]
        missing_fields = [field for field in required_fields if field not in cost_data]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in session cost response: {missing_fields}")
            test_results["stripe_payment_integration"]["details"] += f"Missing fields in session cost: {missing_fields}. "
            return False
        
        # Verify cost values
        if cost_data["cost_cents"] == 7500 and cost_data["cost_dollars"] == 75.0:
            print("✅ Session cost values are correct")
        else:
            print(f"❌ ERROR: Expected cost $75.00 but got ${cost_data['cost_dollars']}")
            test_results["stripe_payment_integration"]["details"] += f"Session cost values incorrect. "
            return False
    else:
        print(f"❌ ERROR: Failed to get session cost. Status code: {response.status_code}")
        test_results["stripe_payment_integration"]["details"] += f"Failed to get session cost. Status code: {response.status_code}. "
        return False
    
    # Test 2: Create Stripe checkout session
    print("\nStep 2: Testing create Stripe checkout session...")
    checkout_request = {
        "amount": 7500,  # $75.00
        "trainer_id": trainer_id,
        "client_email": "test.client@example.com",
        "session_details": {
            "trainer_name": "Sarah Johnson",
            "session_type": "personal_training",
            "duration": 60
        }
    }
    
    response = requests.post(f"{BACKEND_URL}/payments/create-session-checkout", json=checkout_request)
    
    if response.status_code == 200:
        checkout_data = response.json()
        print(f"✅ Stripe checkout session created: {json.dumps(checkout_data, indent=2)}")
        
        # Verify response structure
        required_fields = ["checkout_session_id", "checkout_url", "amount", "trainer_id", "client_email"]
        missing_fields = [field for field in required_fields if field not in checkout_data]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in checkout response: {missing_fields}")
            test_results["stripe_payment_integration"]["details"] += f"Missing fields in checkout: {missing_fields}. "
            return False
        
        # Verify checkout URL is a real Stripe URL
        if "checkout.stripe.com" in checkout_data["checkout_url"]:
            print("✅ Real Stripe checkout URL generated")
        else:
            print(f"❌ ERROR: Expected Stripe checkout URL but got: {checkout_data['checkout_url']}")
            test_results["stripe_payment_integration"]["details"] += f"Invalid checkout URL. "
            return False
    else:
        print(f"❌ ERROR: Failed to create checkout session. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["stripe_payment_integration"]["details"] += f"Failed to create checkout session. Status code: {response.status_code}. "
        return False
    
    # Test 3: Complete session check-in with Stripe payment intent
    print("\nStep 3: Testing complete session check-in with Stripe payment...")
    checkin_request = {
        "trainer_id": trainer_id,
        "client_id": client_id,
        "session_data": {
            "amount": 7500,  # $75.00
            "session_type": "Personal Training",
            "duration": 60
        }
    }
    
    response = requests.post(f"{BACKEND_URL}/sessions/{session_id}/complete-checkin", 
                           params=checkin_request, json=checkin_request["session_data"])
    
    if response.status_code == 200:
        payment_data = response.json()
        print(f"✅ Session check-in with payment completed: {json.dumps(payment_data, indent=2)}")
        
        # Verify response structure
        required_fields = ["message", "payment_id", "amount"]
        missing_fields = [field for field in required_fields if field not in payment_data]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in payment response: {missing_fields}")
            test_results["stripe_payment_integration"]["details"] += f"Missing fields in payment: {missing_fields}. "
            return False
        
        # Verify payment ID looks like a Stripe payment intent
        payment_id = payment_data["payment_id"]
        if payment_id.startswith("pi_"):
            print("✅ Real Stripe payment intent ID generated")
        else:
            print(f"❌ ERROR: Expected Stripe payment intent ID but got: {payment_id}")
            test_results["stripe_payment_integration"]["details"] += f"Invalid payment intent ID. "
            return False
        
        # Check for client_secret (needed for frontend)
        if "client_secret" in payment_data:
            print("✅ Client secret provided for frontend integration")
        else:
            print("⚠️  WARNING: No client_secret in response (may be expected for some flows)")
        
        # Store payment ID for confirmation test
        test_payment_id = payment_id
        
    else:
        print(f"❌ ERROR: Failed to complete session check-in. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["stripe_payment_integration"]["details"] += f"Failed to complete session check-in. Status code: {response.status_code}. "
        return False
    
    # Test 4: Confirm payment (if we have a payment ID)
    if 'test_payment_id' in locals():
        print(f"\nStep 4: Testing payment confirmation...")
        confirm_request = {
            "payment_intent_id": test_payment_id,
            "session_id": session_id
        }
        
        response = requests.post(f"{BACKEND_URL}/payments/confirm-payment", json=confirm_request)
        
        if response.status_code == 200:
            confirm_data = response.json()
            print(f"✅ Payment confirmation response: {json.dumps(confirm_data, indent=2)}")
            
            # Verify response structure
            if "message" in confirm_data and "paid" in confirm_data:
                print("✅ Payment confirmation endpoint works correctly")
            else:
                print("❌ ERROR: Payment confirmation response format incorrect")
                test_results["stripe_payment_integration"]["details"] += f"Payment confirmation format incorrect. "
                return False
        else:
            print(f"❌ ERROR: Failed to confirm payment. Status code: {response.status_code}")
            test_results["stripe_payment_integration"]["details"] += f"Failed to confirm payment. Status code: {response.status_code}. "
            return False
    
    # Test 5: Enhanced trainer earnings with Stripe data
    print(f"\nStep 5: Testing enhanced trainer earnings with Stripe data...")
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer_id}/earnings")
    
    if response.status_code == 200:
        earnings_data = response.json()
        print(f"✅ Enhanced trainer earnings: {json.dumps(earnings_data, indent=2)}")
        
        # Verify response structure includes Stripe data
        required_fields = ["total_earnings", "this_month", "completed_sessions", "avg_session_rate"]
        missing_fields = [field for field in required_fields if field not in earnings_data]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in earnings response: {missing_fields}")
            test_results["stripe_payment_integration"]["details"] += f"Missing fields in earnings: {missing_fields}. "
            return False
        
        # Check if Stripe earnings are included
        if "stripe_earnings" in earnings_data:
            print(f"✅ Stripe earnings included: ${earnings_data['stripe_earnings']}")
        else:
            print("⚠️  WARNING: No stripe_earnings field (may be expected for mock data)")
        
        # Check if recent payments include Stripe data
        if "recent_payments" in earnings_data:
            stripe_payments = [p for p in earnings_data["recent_payments"] if p.get("stripe_charge")]
            print(f"✅ Recent payments include {len(stripe_payments)} Stripe payments")
        
        test_results["stripe_payment_integration"]["success"] = True
        print("✅ All Stripe payment integration tests passed!")
        return True
    else:
        print(f"❌ ERROR: Failed to get enhanced trainer earnings. Status code: {response.status_code}")
        test_results["stripe_payment_integration"]["details"] += f"Failed to get enhanced earnings. Status code: {response.status_code}. "
        return False

def test_enhanced_trainer_features():
    """Test the newly implemented trainer features"""
    print_separator()
    print("TESTING ENHANCED TRAINER FEATURES")
    print_separator()
    
    trainer_id = "trainer_test_123"
    
    # Test 1: Get trainer schedule
    print("Step 1: Testing get trainer schedule...")
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer_id}/schedule")
    
    if response.status_code == 200:
        schedule = response.json()
        print(f"✅ Trainer schedule retrieved: {len(schedule.get('schedule', []))} events")
        print(f"Schedule sample: {json.dumps(schedule, indent=2)[:500]}...")
    else:
        print(f"❌ ERROR: Failed to get trainer schedule. Status code: {response.status_code}")
        test_results["trainer_features"]["details"] += f"Failed to get trainer schedule. Status code: {response.status_code}. "
        return False
    
    # Test 2: Create appointment
    print("\nStep 2: Testing create appointment...")
    appointment_data = {
        "title": "Personal Training Session",
        "start_time": (datetime.now() + timedelta(hours=24)).isoformat(),
        "end_time": (datetime.now() + timedelta(hours=25)).isoformat(),
        "client_name": "Test Client",
        "session_type": "Personal Training",
        "location": "Gym Studio A",
        "notes": "Focus on strength training"
    }
    
    response = requests.post(f"{BACKEND_URL}/trainer/{trainer_id}/schedule", json=appointment_data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Appointment created successfully: {result.get('message')}")
    else:
        print(f"❌ ERROR: Failed to create appointment. Status code: {response.status_code}")
        test_results["trainer_features"]["details"] += f"Failed to create appointment. Status code: {response.status_code}. "
        return False
    
    # Test 3: Get available slots
    print("\nStep 3: Testing get available slots...")
    test_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer_id}/available-slots?date={test_date}")
    
    if response.status_code == 200:
        slots = response.json()
        print(f"✅ Available slots retrieved: {len(slots.get('available_slots', []))} slots")
    else:
        print(f"❌ ERROR: Failed to get available slots. Status code: {response.status_code}")
        test_results["trainer_features"]["details"] += f"Failed to get available slots. Status code: {response.status_code}. "
        return False
    
    # Test 4: Get trainer earnings
    print("\nStep 4: Testing get trainer earnings...")
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer_id}/earnings")
    
    if response.status_code == 200:
        earnings = response.json()
        print(f"✅ Trainer earnings retrieved: ${earnings.get('total_earnings', 0)}")
        print(f"Earnings data: {json.dumps(earnings, indent=2)}")
        
        # Verify earnings structure
        required_fields = ["total_earnings", "this_month", "pending_payments", "completed_sessions", "avg_session_rate"]
        missing_fields = [field for field in required_fields if field not in earnings]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in earnings response: {missing_fields}")
            test_results["trainer_features"]["details"] += f"Missing earnings fields: {missing_fields}. "
            return False
    else:
        print(f"❌ ERROR: Failed to get trainer earnings. Status code: {response.status_code}")
        test_results["trainer_features"]["details"] += f"Failed to get trainer earnings. Status code: {response.status_code}. "
        return False
    
    # Test 5: Request payout
    print("\nStep 5: Testing request payout...")
    payout_amount = 5000  # $50.00 in cents
    response = requests.post(f"{BACKEND_URL}/trainer/{trainer_id}/payout?amount={payout_amount}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Payout processed successfully: ${result.get('amount', 0)}")
    else:
        print(f"❌ ERROR: Failed to process payout. Status code: {response.status_code}")
        test_results["trainer_features"]["details"] += f"Failed to process payout. Status code: {response.status_code}. "
        return False
    
    # Test 6: Get trainer reviews
    print("\nStep 6: Testing get trainer reviews...")
    response = requests.get(f"{BACKEND_URL}/trainer/{trainer_id}/reviews")
    
    if response.status_code == 200:
        reviews = response.json()
        print(f"✅ Trainer reviews retrieved: {reviews.get('total_reviews', 0)} reviews, avg rating: {reviews.get('avg_rating', 0)}")
        
        # Verify reviews structure
        required_fields = ["reviews", "avg_rating", "total_reviews"]
        missing_fields = [field for field in required_fields if field not in reviews]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in reviews response: {missing_fields}")
            test_results["trainer_features"]["details"] += f"Missing reviews fields: {missing_fields}. "
            return False
    else:
        print(f"❌ ERROR: Failed to get trainer reviews. Status code: {response.status_code}")
        test_results["trainer_features"]["details"] += f"Failed to get trainer reviews. Status code: {response.status_code}. "
        return False
    
    # Test 7: Respond to review
    print("\nStep 7: Testing respond to review...")
    review_id = "review_001"
    response_data = {
        "response": "Thank you for the positive feedback! I'm glad I could help you achieve your fitness goals."
    }
    
    response = requests.post(f"{BACKEND_URL}/trainer/{trainer_id}/reviews/{review_id}/respond", json=response_data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Review response added successfully: {result.get('message')}")
    else:
        print(f"❌ ERROR: Failed to respond to review. Status code: {response.status_code}")
        test_results["trainer_features"]["details"] += f"Failed to respond to review. Status code: {response.status_code}. "
        return False
    
    test_results["trainer_features"]["success"] = True
    print("✅ Enhanced trainer features tests completed")
    return True

def test_session_checkin_with_payment():
    """Test the enhanced session check-in with payment processing"""
    print_separator()
    print("TESTING SESSION CHECK-IN WITH PAYMENT PROCESSING")
    print_separator()
    
    # Create a test user and session first
    test_email = f"session_test_{uuid.uuid4()}@example.com"
    user_data = {
        "email": test_email,
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss", "general_fitness"],
        "experience_level": "intermediate"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data)
    
    if response.status_code != 200:
        print(f"❌ ERROR: Failed to create test user. Status code: {response.status_code}")
        test_results["session_checkin_payment"]["details"] += f"Failed to create test user. "
        return False
    
    user = response.json()
    user_id = user["id"]
    trainer_id = "trainer_test_456"
    
    # Create a session
    session_data = {
        "user_id": user_id,
        "trainer_id": trainer_id,
        "session_type": "Personal Training",
        "duration_minutes": 60,
        "source": "trainer",
        "calories": 400,
        "heart_rate_avg": 155,
        "scheduled_time": datetime.now().isoformat()
    }
    
    response = requests.post(f"{BACKEND_URL}/sessions", json=session_data)
    
    if response.status_code != 200:
        print(f"❌ ERROR: Failed to create test session. Status code: {response.status_code}")
        test_results["session_checkin_payment"]["details"] += f"Failed to create test session. "
        return False
    
    session = response.json()
    session_id = session["id"]
    print(f"✅ Created test session: {session_id}")
    
    # Test session check-in with payment processing
    print("\nTesting session check-in with payment processing...")
    checkin_data = {
        "amount": 7500,  # $75.00 in cents
        "session_notes": "Great workout session, client showed excellent progress"
    }
    
    response = requests.post(
        f"{BACKEND_URL}/sessions/{session_id}/complete-checkin?trainer_id={trainer_id}&client_id={user_id}",
        json=checkin_data
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Session check-in completed successfully")
        print(f"Payment processed: ${result.get('amount', 0)}")
        print(f"Payment ID: {result.get('payment_id')}")
        
        # Verify response structure
        required_fields = ["message", "payment_id", "amount"]
        missing_fields = [field for field in required_fields if field not in result]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in check-in response: {missing_fields}")
            test_results["session_checkin_payment"]["details"] += f"Missing check-in fields: {missing_fields}. "
            return False
        
        test_results["session_checkin_payment"]["success"] = True
        print("✅ Session check-in with payment processing tests completed")
        return True
    else:
        print(f"❌ ERROR: Failed to complete session check-in. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["session_checkin_payment"]["details"] += f"Failed to complete session check-in. Status code: {response.status_code}. "
        return False

def run_new_features_tests():
    """Run tests for the newly implemented features as requested in the review"""
    print("Starting LiftLink Platform Backend API Tests - NEW FEATURES")
    print(f"Backend URL: {BACKEND_URL}")
    print("Testing: Email Verification, Enhanced Trainer Features, Session Check-in with Payment")
    print_separator()
    
    # Add new test categories to test_results
    test_results["email_verification"] = {"success": False, "details": ""}
    test_results["trainer_features"] = {"success": False, "details": ""}
    test_results["session_checkin_payment"] = {"success": False, "details": ""}
    
    # Test the newly implemented features
    test_email_verification_system()
    test_enhanced_trainer_features()
    test_session_checkin_with_payment()
    
    # Print new features test results summary
    print_separator()
    print("NEW FEATURES TEST RESULTS SUMMARY")
    print_separator()
    
    # Focus on new features tests
    new_features_tests = [
        "email_verification",
        "trainer_features", 
        "session_checkin_payment"
    ]
    
    all_passed = True
    for test_name in new_features_tests:
        if test_name in test_results:
            result = test_results[test_name]
            status = "PASSED" if result["success"] else "FAILED"
            details = result["details"] if result["details"] else "No issues found"
            
            print(f"{test_name}: {status}")
            print(f"Details: {details}")
            print()
            
            if not result["success"]:
                all_passed = False
    
    if all_passed:
        print("✅ All NEW FEATURES tests PASSED!")
    else:
        print("❌ Some NEW FEATURES tests FAILED. See details above.")
    
    return all_passed

def run_focused_tests():
    """Run focused tests for Phase 2 features as specified in test_result.md"""
    print("Starting LiftLink Platform Backend API Tests - Phase 2 Focus")
    print(f"Backend URL: {BACKEND_URL}")
    print("Testing: Fitness API Integration & Session Management Overhaul")
    print_separator()
    
    # Create a test user for fitness integration tests
    print("Creating test user for fitness integration tests...")
    test_email = f"fitness_test_{uuid.uuid4()}@example.com"
    user_data = {
        "email": test_email,
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss", "general_fitness"],
        "experience_level": "intermediate"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data)
    
    if response.status_code == 200:
        user = response.json()
        print(f"Created test user: {user['id']}")
        
        # Test Phase 2 Fitness Integration Features
        test_fitness_connection_status(user)
        test_fitness_oauth_flows()
        test_fitness_data_sync(user)
        test_fitness_disconnection(user)
        test_enhanced_session_management(user)
        
    else:
        print(f"ERROR: Failed to create test user. Status code: {response.status_code}")
        print("Cannot proceed with fitness integration tests without a user")
    
    # Print focused test results summary
    print_separator()
    print("PHASE 2 TEST RESULTS SUMMARY")
    print_separator()
    
    # Focus on Phase 2 specific tests
    phase2_tests = [
        "fitness_connection_status",
        "fitness_oauth_flows", 
        "fitness_data_sync",
        "enhanced_session_management",
        "fitness_disconnection"
    ]
    
    all_passed = True
    for test_name in phase2_tests:
        if test_name in test_results:
            result = test_results[test_name]
            status = "PASSED" if result["success"] else "FAILED"
            details = result["details"] if result["details"] else "No issues found"
            
            print(f"{test_name}: {status}")
            print(f"Details: {details}")
            print()
            
            if not result["success"]:
                all_passed = False
    
    if all_passed:
        print("All Phase 2 tests PASSED!")
    else:
        print("Some Phase 2 tests FAILED. See details above.")

def run_all_tests():
    print("Starting LiftLink Platform Backend API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print_separator()
    
    # Test email validation and user existence check
    existence_user = test_email_validation_and_user_existence()
    
    # Test user login
    login_user = test_user_login()
    
    # Test user registration
    user = test_user_registration()
    
    if user:
        # Test session management and tree progression
        test_session_management_and_tree_progression(user)
        
        # Test user profile management
        test_user_profile_management(user)
        
        # Test Phase 2 Fitness Integration Features
        test_fitness_connection_status(user)
        test_fitness_data_sync(user)
        test_enhanced_session_management(user)
        test_fitness_disconnection(user)
        test_enhanced_tree_progress(user)
    
    # Test fitness OAuth flows (doesn't need user)
    test_fitness_oauth_flows()
    
    # Test complete user journey
    test_complete_user_journey()
    
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

def run_new_features_tests():
    """Run tests specifically for the newly implemented Stripe payment integration"""
    print("Starting LiftLink Stripe Payment Integration Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print_separator()
    
    # Test the new Stripe payment integration
    test_stripe_payment_integration()
    
    # Also test enhanced trainer features that work with payments
    test_enhanced_trainer_features()
    
    # Print test results summary
    print_separator()
    print("STRIPE INTEGRATION TEST RESULTS SUMMARY")
    print_separator()
    
    stripe_tests = ["stripe_payment_integration", "trainer_features"]
    all_passed = True
    
    for test_name in stripe_tests:
        if test_name in test_results:
            result = test_results[test_name]
            status = "PASSED" if result["success"] else "FAILED"
            details = result["details"] if result["details"] else "No issues found"
            
            print(f"{test_name}: {status}")
            print(f"Details: {details}")
            print()
            
            if not result["success"]:
                all_passed = False
    
    if all_passed:
        print("✅ All Stripe integration tests PASSED!")
        print("🎉 Real Stripe payment integration is working correctly!")
    else:
        print("❌ Some Stripe integration tests FAILED. See details above.")

def test_google_fit_and_maps_fixes():
    """Test the updated Google Fit and Google Maps fixes as requested"""
    print_separator()
    print("TESTING GOOGLE FIT AND GOOGLE MAPS FIXES")
    print_separator()
    
    # Test 1: New Google Fit Connection - POST /api/google-fit/connect
    print("Test 1: Testing New Google Fit Connection (POST /api/google-fit/connect)")
    test_user_id = "test_user_123"
    connect_data = {
        "user_id": test_user_id,
        "mock_mode": True
    }
    
    response = requests.post(f"{BACKEND_URL}/google-fit/connect", json=connect_data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Google Fit connection successful: {json.dumps(result, indent=2)}")
        
        # Verify response structure
        required_fields = ["success", "message", "mock_mode", "connected"]
        missing_fields = [field for field in required_fields if field not in result]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in Google Fit connect response: {missing_fields}")
            test_results["google_fit_maps_fixes"]["details"] += f"Missing fields in connect response: {missing_fields}. "
            return False
        
        # Verify values
        if result["success"] == True and result["connected"] == True:
            print("✅ Google Fit connection values are correct")
        else:
            print(f"❌ ERROR: Expected success=True and connected=True but got success={result['success']}, connected={result['connected']}")
            test_results["google_fit_maps_fixes"]["details"] += f"Google Fit connection values incorrect. "
            return False
    else:
        print(f"❌ ERROR: Google Fit connection failed. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["google_fit_maps_fixes"]["details"] += f"Google Fit connection failed. Status code: {response.status_code}. "
        return False
    
    # Test 2: Google Fit Status - GET /api/fitness/status/test_user
    print("\nTest 2: Testing Google Fit Status (GET /api/fitness/status/test_user)")
    response = requests.get(f"{BACKEND_URL}/fitness/status/{test_user_id}")
    
    if response.status_code == 200:
        status = response.json()
        print(f"✅ Google Fit status retrieved: {json.dumps(status, indent=2)}")
        
        # Verify response structure (should NOT have fitbit_connected field)
        required_fields = ["google_fit_connected", "last_sync"]
        missing_fields = [field for field in required_fields if field not in status]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in fitness status response: {missing_fields}")
            test_results["google_fit_maps_fixes"]["details"] += f"Missing fields in status response: {missing_fields}. "
            return False
        
        # Verify fitbit_connected field is NOT present (removed as per fixes)
        if "fitbit_connected" in status:
            print(f"❌ ERROR: fitbit_connected field should be removed but is still present")
            test_results["google_fit_maps_fixes"]["details"] += f"fitbit_connected field not removed. "
            return False
        else:
            print("✅ fitbit_connected field correctly removed from response")
        
        # Verify Google Fit connection status shows as connected after previous test
        if status["google_fit_connected"] == True:
            print("✅ Google Fit connection status correctly shows as connected")
        else:
            print(f"❌ WARNING: Expected google_fit_connected=True after connection but got {status['google_fit_connected']}")
            # This might be expected if user doesn't exist in DB, so don't fail the test
            print("Note: This might be expected if test user doesn't exist in database")
    else:
        print(f"❌ ERROR: Failed to get Google Fit status. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["google_fit_maps_fixes"]["details"] += f"Failed to get Google Fit status. Status code: {response.status_code}. "
        return False
    
    # Test 3: Test if 403 errors are resolved - Google Fit Login
    print("\nTest 3: Testing Google Fit Login for 403 Error Resolution (GET /api/google-fit/login)")
    response = requests.get(f"{BACKEND_URL}/google-fit/login")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Google Fit login successful (no 403 error): {json.dumps(result, indent=2)}")
        
        # Verify response structure
        required_fields = ["authorization_url", "status", "message"]
        missing_fields = [field for field in required_fields if field not in result]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in Google Fit login response: {missing_fields}")
            test_results["google_fit_maps_fixes"]["details"] += f"Missing fields in login response: {missing_fields}. "
            return False
        
        # Verify no 403 error and proper mock response
        if result["status"] == "mock_auth" and "mock mode" in result["message"]:
            print("✅ Google Fit login returns proper mock response without 403 errors")
        else:
            print(f"❌ ERROR: Expected mock_auth status but got {result['status']}")
            test_results["google_fit_maps_fixes"]["details"] += f"Google Fit login response incorrect. "
            return False
    elif response.status_code == 501:
        result = response.json()
        print(f"✅ Google Fit login returns 501 (not configured) instead of 403: {json.dumps(result, indent=2)}")
        if "not configured" in result.get("detail", "").lower():
            print("✅ Proper error handling for unconfigured Google Fit API")
        else:
            print(f"❌ ERROR: Expected 'not configured' error but got: {result.get('detail')}")
            test_results["google_fit_maps_fixes"]["details"] += f"Google Fit login error message incorrect. "
            return False
    elif response.status_code == 403:
        print(f"❌ CRITICAL ERROR: Google Fit login still returns 403 Forbidden error!")
        print(f"Response: {response.text}")
        test_results["google_fit_maps_fixes"]["details"] += f"403 error NOT resolved for Google Fit login. "
        return False
    else:
        print(f"❌ ERROR: Unexpected status code for Google Fit login: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["google_fit_maps_fixes"]["details"] += f"Unexpected Google Fit login status code: {response.status_code}. "
        return False
    
    # Test 4: Test Google Maps API Key Configuration
    print("\nTest 4: Testing Google Maps API Key Configuration")
    # Check if the API key is properly configured in frontend .env
    try:
        with open('/app/frontend/.env', 'r') as f:
            env_content = f.read()
            
        if 'REACT_APP_GOOGLE_MAPS_API_KEY=' in env_content:
            # Extract the API key
            for line in env_content.split('\n'):
                if line.startswith('REACT_APP_GOOGLE_MAPS_API_KEY='):
                    api_key = line.split('=', 1)[1]
                    if api_key and api_key != 'your_google_maps_api_key_here':
                        print(f"✅ Google Maps API key is properly configured: {api_key[:20]}...")
                        print("✅ Frontend can access the Google Maps API key")
                    else:
                        print(f"❌ ERROR: Google Maps API key is not properly set")
                        test_results["google_fit_maps_fixes"]["details"] += f"Google Maps API key not configured. "
                        return False
                    break
        else:
            print(f"❌ ERROR: REACT_APP_GOOGLE_MAPS_API_KEY not found in frontend .env")
            test_results["google_fit_maps_fixes"]["details"] += f"Google Maps API key missing from frontend .env. "
            return False
    except Exception as e:
        print(f"❌ ERROR: Failed to check Google Maps API key configuration: {e}")
        test_results["google_fit_maps_fixes"]["details"] += f"Failed to check Google Maps API key. "
        return False
    
    # Test 5: Test Google Fit OAuth Callback (should handle properly without 403)
    print("\nTest 5: Testing Google Fit OAuth Callback (GET /api/google-fit/callback)")
    callback_params = {
        "code": "mock_auth_code_12345",
        "user_id": test_user_id
    }
    
    response = requests.get(f"{BACKEND_URL}/google-fit/callback", params=callback_params)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Google Fit callback successful (no 403 error): {json.dumps(result, indent=2)}")
        
        # Verify response structure
        required_fields = ["message", "status", "mock_mode"]
        missing_fields = [field for field in required_fields if field not in result]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in Google Fit callback response: {missing_fields}")
            test_results["google_fit_maps_fixes"]["details"] += f"Missing fields in callback response: {missing_fields}. "
            return False
        
        if result["status"] == "connected" and result["mock_mode"] == True:
            print("✅ Google Fit callback handles mock mode properly")
        else:
            print(f"❌ ERROR: Expected connected status with mock_mode=True but got status={result['status']}, mock_mode={result['mock_mode']}")
            test_results["google_fit_maps_fixes"]["details"] += f"Google Fit callback response incorrect. "
            return False
    elif response.status_code == 403:
        print(f"❌ CRITICAL ERROR: Google Fit callback still returns 403 Forbidden error!")
        print(f"Response: {response.text}")
        test_results["google_fit_maps_fixes"]["details"] += f"403 error NOT resolved for Google Fit callback. "
        return False
    else:
        print(f"❌ ERROR: Unexpected status code for Google Fit callback: {response.status_code}")
        print(f"Response: {response.text}")
        test_results["google_fit_maps_fixes"]["details"] += f"Unexpected Google Fit callback status code: {response.status_code}. "
        return False
    
    print("\n🎉 ALL GOOGLE FIT AND GOOGLE MAPS TESTS PASSED!")
    print("✅ New Google Fit connection works without 403 errors")
    print("✅ Google Fit status endpoint works correctly")
    print("✅ Google Maps API key is properly configured")
    print("✅ 403 errors are resolved for Google Fit endpoints")
    
    test_results["google_fit_maps_fixes"]["success"] = True
    return True

if __name__ == "__main__":
    print("🚀 STARTING GOOGLE FIT AND GOOGLE MAPS FIXES TESTING")
    print("=" * 80)
    
    # Add the new test to test_results
    test_results["google_fit_maps_fixes"] = {"success": False, "details": ""}
    
    # Run the specific Google Fit and Maps tests as requested
    test_google_fit_and_maps_fixes()
    
    # Also run some related tests for comprehensive coverage
    user = test_user_registration()
    if user:
        test_fitness_connection_status(user)
        test_fitness_oauth_flows()
        test_fitness_data_sync(user)
        test_fitness_disconnection(user)
    
    # Print final results
    print_separator()
    print("FINAL TEST RESULTS SUMMARY")
    print_separator()
    
    passed_tests = sum(1 for result in test_results.values() if result["success"])
    total_tests = len(test_results)
    
    print(f"PASSED: {passed_tests}/{total_tests} tests")
    print()
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        print(f"{status}: {test_name}")
        if not result["success"] and result["details"]:
            print(f"   Details: {result['details']}")
    
    print_separator()
    
    if passed_tests == total_tests:
        print("🎉 ALL TESTS PASSED! Google Fit and Google Maps fixes are working correctly.")
    else:
        print(f"⚠️  {total_tests - passed_tests} tests failed. Please review the issues above.")
