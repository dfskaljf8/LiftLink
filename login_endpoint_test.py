#!/usr/bin/env python3
"""
Focused test for the login endpoint Pydantic validation fix.
This test specifically addresses the user's reported issue where login process hangs
due to Pydantic validation errors in the UserResponse model.
"""

import requests
import json
import uuid
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://liftlink-build.preview.emergentagent.com/api"

def print_separator():
    print("\n" + "="*80 + "\n")

def test_login_endpoint_fix():
    """
    Test the /api/login endpoint fix for Pydantic validation issues.
    
    The fix addresses the issue where UserResponse model expected different 
    data types than what was stored in the database, causing 500 errors.
    """
    print_separator()
    print("🔍 TESTING LOGIN ENDPOINT - PYDANTIC VALIDATION FIX")
    print("📋 Focus: Verify login works without 500 Internal Server Errors")
    print("🎯 Expected: UserResponse with proper string data types")
    print_separator()
    
    test_results = {
        "users_created": 0,
        "successful_logins": 0,
        "validation_errors": [],
        "critical_errors": [],
        "overall_success": False
    }
    
    # Test scenarios with different user types and data combinations
    test_scenarios = [
        {
            "name": "Fitness Enthusiast - Basic Goals",
            "email_prefix": "fitness_basic",
            "data": {
                "role": "fitness_enthusiast",
                "fitness_goals": ["weight_loss", "general_fitness"],
                "experience_level": "beginner"
            }
        },
        {
            "name": "Fitness Enthusiast - Multiple Goals",
            "email_prefix": "fitness_multi",
            "data": {
                "role": "fitness_enthusiast", 
                "fitness_goals": ["muscle_building", "sport_training", "wellness"],
                "experience_level": "intermediate"
            }
        },
        {
            "name": "Trainer - Professional",
            "email_prefix": "trainer_pro",
            "data": {
                "role": "trainer",
                "fitness_goals": ["sport_training", "rehabilitation"],
                "experience_level": "expert"
            }
        },
        {
            "name": "Advanced User - All Goals",
            "email_prefix": "advanced_all",
            "data": {
                "role": "fitness_enthusiast",
                "fitness_goals": ["weight_loss", "muscle_building", "general_fitness", "sport_training", "rehabilitation", "wellness"],
                "experience_level": "advanced"
            }
        }
    ]
    
    created_users = []
    
    # Step 1: Create test users
    print("📝 STEP 1: Creating test users with various data combinations")
    print("-" * 60)
    
    for scenario in test_scenarios:
        print(f"\nCreating user: {scenario['name']}")
        
        test_email = f"{scenario['email_prefix']}_{uuid.uuid4()}@example.com"
        user_data = {
            "email": test_email,
            **scenario['data']
        }
        
        print(f"   Email: {test_email}")
        print(f"   Role: {user_data['role']}")
        print(f"   Goals: {user_data['fitness_goals']}")
        print(f"   Level: {user_data['experience_level']}")
        
        response = requests.post(f"{BACKEND_URL}/users", json=user_data)
        
        if response.status_code == 200:
            created_user = response.json()
            created_users.append({
                "user": created_user,
                "email": test_email,
                "scenario": scenario['name']
            })
            test_results["users_created"] += 1
            print(f"   ✅ User created successfully (ID: {created_user['id']})")
        else:
            print(f"   ❌ Failed to create user. Status: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results["critical_errors"].append(f"Failed to create {scenario['name']}: {response.status_code}")
    
    print(f"\n📊 Created {test_results['users_created']}/{len(test_scenarios)} users successfully")
    
    # Step 2: Test login for each created user
    print_separator()
    print("🔐 STEP 2: Testing login for each user")
    print("-" * 60)
    
    for user_info in created_users:
        user = user_info["user"]
        email = user_info["email"]
        scenario_name = user_info["scenario"]
        
        print(f"\n🧪 Testing login for: {scenario_name}")
        print(f"   Email: {email}")
        
        login_data = {"email": email}
        
        try:
            response = requests.post(f"{BACKEND_URL}/login", json=login_data, timeout=10)
            
            if response.status_code == 200:
                logged_in_user = response.json()
                print(f"   ✅ Login successful!")
                
                # Detailed validation of UserResponse structure
                validation_passed = True
                
                # Check required fields
                required_fields = ["id", "email", "role", "fitness_goals", "experience_level", "created_at"]
                missing_fields = [field for field in required_fields if field not in logged_in_user]
                
                if missing_fields:
                    print(f"   ❌ Missing fields: {missing_fields}")
                    test_results["validation_errors"].append(f"{scenario_name}: Missing fields {missing_fields}")
                    validation_passed = False
                
                # Check data types (critical for Pydantic validation fix)
                type_errors = []
                
                if not isinstance(logged_in_user.get("id"), str):
                    type_errors.append(f"id should be str, got {type(logged_in_user.get('id'))}")
                
                if not isinstance(logged_in_user.get("email"), str):
                    type_errors.append(f"email should be str, got {type(logged_in_user.get('email'))}")
                
                if not isinstance(logged_in_user.get("role"), str):
                    type_errors.append(f"role should be str, got {type(logged_in_user.get('role'))}")
                
                if not isinstance(logged_in_user.get("experience_level"), str):
                    type_errors.append(f"experience_level should be str, got {type(logged_in_user.get('experience_level'))}")
                
                if not isinstance(logged_in_user.get("fitness_goals"), list):
                    type_errors.append(f"fitness_goals should be list, got {type(logged_in_user.get('fitness_goals'))}")
                elif logged_in_user.get("fitness_goals"):
                    for i, goal in enumerate(logged_in_user["fitness_goals"]):
                        if not isinstance(goal, str):
                            type_errors.append(f"fitness_goals[{i}] should be str, got {type(goal)}")
                
                if not isinstance(logged_in_user.get("created_at"), str):
                    type_errors.append(f"created_at should be str, got {type(logged_in_user.get('created_at'))}")
                
                if type_errors:
                    print(f"   ❌ Data type errors:")
                    for error in type_errors:
                        print(f"      - {error}")
                    test_results["validation_errors"].extend([f"{scenario_name}: {error}" for error in type_errors])
                    validation_passed = False
                
                # Check data consistency
                consistency_errors = []
                
                if logged_in_user.get("id") != user["id"]:
                    consistency_errors.append(f"ID mismatch: expected {user['id']}, got {logged_in_user.get('id')}")
                
                if logged_in_user.get("email") != email:
                    consistency_errors.append(f"Email mismatch: expected {email}, got {logged_in_user.get('email')}")
                
                if consistency_errors:
                    print(f"   ❌ Data consistency errors:")
                    for error in consistency_errors:
                        print(f"      - {error}")
                    test_results["validation_errors"].extend([f"{scenario_name}: {error}" for error in consistency_errors])
                    validation_passed = False
                
                if validation_passed:
                    print(f"   ✅ All validations passed!")
                    print(f"      - Role: '{logged_in_user['role']}' (string)")
                    print(f"      - Goals: {logged_in_user['fitness_goals']} (list of strings)")
                    print(f"      - Level: '{logged_in_user['experience_level']}' (string)")
                    test_results["successful_logins"] += 1
                else:
                    print(f"   ⚠️  Login succeeded but validation failed")
                    
            elif response.status_code == 500:
                print(f"   🚨 CRITICAL: 500 Internal Server Error!")
                print(f"   This indicates the Pydantic validation fix is NOT working!")
                print(f"   Response: {response.text}")
                test_results["critical_errors"].append(f"{scenario_name}: 500 Internal Server Error - Pydantic validation issue")
                
            elif response.status_code == 404:
                print(f"   ❌ User not found (404)")
                test_results["critical_errors"].append(f"{scenario_name}: User not found after creation")
                
            else:
                print(f"   ❌ Unexpected status code: {response.status_code}")
                print(f"   Response: {response.text}")
                test_results["critical_errors"].append(f"{scenario_name}: Unexpected status {response.status_code}")
                
        except requests.exceptions.Timeout:
            print(f"   🚨 CRITICAL: Login request timed out!")
            print(f"   This indicates the login process is hanging!")
            test_results["critical_errors"].append(f"{scenario_name}: Login timeout - process hanging")
            
        except Exception as e:
            print(f"   ❌ Exception during login: {str(e)}")
            test_results["critical_errors"].append(f"{scenario_name}: Exception - {str(e)}")
    
    # Step 3: Test edge cases
    print_separator()
    print("🧪 STEP 3: Testing edge cases")
    print("-" * 60)
    
    # Test non-existent user
    print("\n🔍 Testing login with non-existent email...")
    non_existent_email = f"nonexistent_{uuid.uuid4()}@example.com"
    response = requests.post(f"{BACKEND_URL}/login", json={"email": non_existent_email})
    
    if response.status_code == 404:
        print("   ✅ Correctly returned 404 for non-existent user")
    else:
        print(f"   ❌ Expected 404, got {response.status_code}")
        test_results["validation_errors"].append(f"Non-existent user: Expected 404, got {response.status_code}")
    
    # Test invalid email format
    print("\n🔍 Testing login with invalid email format...")
    response = requests.post(f"{BACKEND_URL}/login", json={"email": "invalid-email"})
    
    if response.status_code == 422:
        print("   ✅ Correctly returned 422 for invalid email format")
    else:
        print(f"   ❌ Expected 422, got {response.status_code}")
        test_results["validation_errors"].append(f"Invalid email: Expected 422, got {response.status_code}")
    
    # Step 4: Final assessment
    print_separator()
    print("📊 FINAL ASSESSMENT")
    print_separator()
    
    print(f"👥 Users created: {test_results['users_created']}/{len(test_scenarios)}")
    print(f"🔐 Successful logins: {test_results['successful_logins']}/{test_results['users_created']}")
    print(f"⚠️  Validation errors: {len(test_results['validation_errors'])}")
    print(f"🚨 Critical errors: {len(test_results['critical_errors'])}")
    
    if test_results["critical_errors"]:
        print(f"\n🚨 CRITICAL ERRORS FOUND:")
        for error in test_results["critical_errors"]:
            print(f"   - {error}")
    
    if test_results["validation_errors"]:
        print(f"\n⚠️  VALIDATION ERRORS:")
        for error in test_results["validation_errors"]:
            print(f"   - {error}")
    
    # Determine overall success
    has_critical_errors = len(test_results["critical_errors"]) > 0
    has_500_errors = any("500 Internal Server Error" in error for error in test_results["critical_errors"])
    has_timeout_errors = any("timeout" in error.lower() for error in test_results["critical_errors"])
    
    success_rate = test_results["successful_logins"] / max(test_results["users_created"], 1)
    
    print_separator()
    
    if has_500_errors:
        print("🚨 RESULT: LOGIN ENDPOINT FIX FAILED")
        print("❌ 500 Internal Server Errors detected - Pydantic validation fix not working")
        test_results["overall_success"] = False
        
    elif has_timeout_errors:
        print("🚨 RESULT: LOGIN ENDPOINT FIX FAILED") 
        print("❌ Login timeouts detected - process still hanging")
        test_results["overall_success"] = False
        
    elif has_critical_errors:
        print("🚨 RESULT: LOGIN ENDPOINT HAS CRITICAL ISSUES")
        print("❌ Critical errors prevent proper login functionality")
        test_results["overall_success"] = False
        
    elif success_rate >= 0.8:  # 80% success rate threshold
        print("✅ RESULT: LOGIN ENDPOINT FIX SUCCESSFUL")
        print("🎉 Pydantic validation fix is working correctly!")
        print("✅ No 500 errors, no timeouts, proper UserResponse format")
        test_results["overall_success"] = True
        
    else:
        print("⚠️  RESULT: LOGIN ENDPOINT PARTIALLY WORKING")
        print(f"⚠️  Success rate: {success_rate:.1%} (below 80% threshold)")
        print("🔧 May need additional fixes")
        test_results["overall_success"] = False
    
    return test_results

if __name__ == "__main__":
    print("🚀 Starting focused login endpoint test...")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print(f"⏰ Test started at: {datetime.now().isoformat()}")
    
    results = test_login_endpoint_fix()
    
    print(f"\n⏰ Test completed at: {datetime.now().isoformat()}")
    print("🏁 Test execution finished.")