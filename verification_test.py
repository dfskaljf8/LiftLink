#!/usr/bin/env python3
"""
Comprehensive test suite for the newly implemented document verification system
Tests age verification, certification verification, and login blocking for unverified users
"""
import requests
import json
import uuid
import base64
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://8fe21dd2-35a9-4730-97e3-93ae042411a9.preview.emergentagent.com/api"

# Test results tracking
verification_test_results = {
    "government_id_verification": {"success": False, "details": ""},
    "fitness_certification_verification": {"success": False, "details": ""},
    "login_verification_blocking": {"success": False, "details": ""},
    "verification_status_endpoint": {"success": False, "details": ""},
    "enhanced_user_creation": {"success": False, "details": ""}
}

def print_separator():
    print("\n" + "="*80 + "\n")

def create_mock_image_data():
    """Create mock base64 image data for testing"""
    # Create a simple mock image data (just some text encoded as base64)
    mock_image = "data:image/jpeg;base64," + base64.b64encode(b"mock_government_id_image").decode()
    return mock_image

def test_government_id_verification():
    """Test government ID verification with different scenarios"""
    print_separator()
    print("TESTING GOVERNMENT ID VERIFICATION SYSTEM")
    print_separator()
    
    # Test scenarios based on email patterns as described in verification_service.py
    test_scenarios = [
        {
            "name": "Valid Adult User",
            "email": f"test_adult_{uuid.uuid4()}@example.com",
            "expected_status": "approved",
            "expected_age_verified": True,
            "description": "Normal user over 18"
        },
        {
            "name": "Minor User (Under 18)",
            "email": f"test_minor_{uuid.uuid4()}@example.com",
            "expected_status": "rejected",
            "expected_age_verified": False,
            "description": "User under 18 years old"
        },
        {
            "name": "Invalid ID Document",
            "email": f"test_invalid_{uuid.uuid4()}@example.com",
            "expected_status": "rejected",
            "expected_age_verified": False,
            "description": "Invalid government ID document"
        },
        {
            "name": "Expired ID Document",
            "email": f"test_expired_{uuid.uuid4()}@example.com",
            "expected_status": "rejected",
            "expected_age_verified": False,
            "description": "Expired government ID document"
        }
    ]
    
    successful_tests = 0
    created_users = []
    
    for scenario in test_scenarios:
        print(f"\n--- Testing {scenario['name']} ---")
        print(f"Description: {scenario['description']}")
        print(f"Email: {scenario['email']}")
        
        # First create a user for this test
        user_data = {
            "email": scenario["email"],
            "role": "fitness_enthusiast",
            "fitness_goals": ["weight_loss", "general_fitness"],
            "experience_level": "intermediate"
        }
        
        response = requests.post(f"{BACKEND_URL}/users", json=user_data)
        
        if response.status_code == 200:
            user = response.json()
            created_users.append(user)
            print(f"✅ Created user: {user['id']}")
            
            # Verify initial verification status by checking the verification status endpoint
            status_response = requests.get(f"{BACKEND_URL}/verification-status/{user['id']}")
            if status_response.status_code == 200:
                status = status_response.json()
                if status.get("age_verified") == False:
                    print("✅ User created with age_verified=False as expected")
                else:
                    print("❌ ERROR: User should be created with age_verified=False")
                    verification_test_results["enhanced_user_creation"]["details"] += f"User not created with age_verified=False. "
                    continue
            else:
                print("❌ ERROR: Could not check verification status")
                verification_test_results["enhanced_user_creation"]["details"] += f"Could not check verification status. "
                continue
            
            # Now test government ID verification
            mock_image = create_mock_image_data()
            verification_request = {
                "user_id": user["id"],
                "user_email": scenario["email"],
                "image_data": mock_image
            }
            
            print(f"Submitting government ID verification...")
            response = requests.post(f"{BACKEND_URL}/verify-government-id", json=verification_request)
            
            if response.status_code == 200:
                result = response.json()
                print(f"Verification response: {json.dumps(result, indent=2)}")
                
                # Verify response structure
                required_fields = ["status", "age_verified"]
                missing_fields = [field for field in required_fields if field not in result]
                
                if missing_fields:
                    print(f"❌ ERROR: Missing fields in verification response: {missing_fields}")
                    verification_test_results["government_id_verification"]["details"] += f"Missing fields for {scenario['name']}: {missing_fields}. "
                    continue
                
                # Verify expected results
                if (result["status"] == scenario["expected_status"] and 
                    result["age_verified"] == scenario["expected_age_verified"]):
                    print(f"✅ Verification result matches expected outcome")
                    print(f"   Status: {result['status']}")
                    print(f"   Age Verified: {result['age_verified']}")
                    
                    if not result["age_verified"] and "rejection_reason" in result:
                        print(f"   Rejection Reason: {result['rejection_reason']}")
                    
                    successful_tests += 1
                else:
                    print(f"❌ ERROR: Verification result doesn't match expected outcome")
                    print(f"   Expected: status={scenario['expected_status']}, age_verified={scenario['expected_age_verified']}")
                    print(f"   Got: status={result['status']}, age_verified={result['age_verified']}")
                    verification_test_results["government_id_verification"]["details"] += f"Incorrect result for {scenario['name']}. "
                    
            else:
                print(f"❌ ERROR: Government ID verification failed. Status code: {response.status_code}")
                print(f"Response: {response.text}")
                verification_test_results["government_id_verification"]["details"] += f"API call failed for {scenario['name']}. Status code: {response.status_code}. "
                
        else:
            print(f"❌ ERROR: Failed to create user for {scenario['name']}. Status code: {response.status_code}")
            verification_test_results["government_id_verification"]["details"] += f"User creation failed for {scenario['name']}. "
    
    # Determine success
    if successful_tests == len(test_scenarios):
        print(f"\n✅ GOVERNMENT ID VERIFICATION TESTS PASSED: {successful_tests}/{len(test_scenarios)} scenarios successful")
        verification_test_results["government_id_verification"]["success"] = True
        verification_test_results["enhanced_user_creation"]["success"] = True
    else:
        print(f"\n❌ GOVERNMENT ID VERIFICATION TESTS FAILED: Only {successful_tests}/{len(test_scenarios)} scenarios successful")
    
    return created_users

def test_fitness_certification_verification():
    """Test fitness certification verification for trainers"""
    print_separator()
    print("TESTING FITNESS CERTIFICATION VERIFICATION SYSTEM")
    print_separator()
    
    # Test scenarios for certification verification
    cert_test_scenarios = [
        {
            "name": "Valid NASM Certification",
            "email": f"test_trainer_nasm_{uuid.uuid4()}@example.com",
            "cert_type": "NASM",
            "expected_status": "approved",
            "expected_cert_verified": True,
            "description": "Valid NASM certification"
        },
        {
            "name": "Valid ACSM Certification",
            "email": f"test_trainer_acsm_{uuid.uuid4()}@example.com",
            "cert_type": "ACSM",
            "expected_status": "approved",
            "expected_cert_verified": True,
            "description": "Valid ACSM certification"
        },
        {
            "name": "Invalid Certification Type",
            "email": f"test_trainer_invalid_cert_{uuid.uuid4()}@example.com",
            "cert_type": "INVALID_CERT",
            "expected_status": "rejected",
            "expected_cert_verified": False,
            "description": "Invalid certification type"
        },
        {
            "name": "Invalid Certification Document",
            "email": f"test_trainer_invalid_{uuid.uuid4()}@example.com",
            "cert_type": "ACE",
            "expected_status": "rejected",
            "expected_cert_verified": False,
            "description": "Invalid certification document"
        },
        {
            "name": "Expired Certification",
            "email": f"test_trainer_expired_{uuid.uuid4()}@example.com",
            "cert_type": "NSCA",
            "expected_status": "rejected",
            "expected_cert_verified": False,
            "description": "Expired certification"
        }
    ]
    
    successful_tests = 0
    created_trainers = []
    
    for scenario in cert_test_scenarios:
        print(f"\n--- Testing {scenario['name']} ---")
        print(f"Description: {scenario['description']}")
        print(f"Email: {scenario['email']}")
        print(f"Certification Type: {scenario['cert_type']}")
        
        # Create a trainer user for this test
        trainer_data = {
            "email": scenario["email"],
            "role": "trainer",
            "fitness_goals": ["sport_training", "rehabilitation"],
            "experience_level": "expert"
        }
        
        response = requests.post(f"{BACKEND_URL}/users", json=trainer_data)
        
        if response.status_code == 200:
            trainer = response.json()
            created_trainers.append(trainer)
            print(f"✅ Created trainer: {trainer['id']}")
            
            # Verify initial certification status by checking the verification status endpoint
            status_response = requests.get(f"{BACKEND_URL}/verification-status/{trainer['id']}")
            if status_response.status_code == 200:
                status = status_response.json()
                if status.get("cert_verified") == False:
                    print("✅ Trainer created with cert_verified=False as expected")
                else:
                    print("❌ ERROR: Trainer should be created with cert_verified=False")
                    verification_test_results["enhanced_user_creation"]["details"] += f"Trainer not created with cert_verified=False. "
                    continue
            else:
                print("❌ ERROR: Could not check verification status")
                verification_test_results["enhanced_user_creation"]["details"] += f"Could not check verification status. "
                continue
            
            # Now test fitness certification verification
            mock_cert_image = create_mock_image_data()
            cert_verification_request = {
                "user_id": trainer["id"],
                "user_email": scenario["email"],
                "cert_type": scenario["cert_type"],
                "image_data": mock_cert_image
            }
            
            print(f"Submitting fitness certification verification...")
            response = requests.post(f"{BACKEND_URL}/verify-fitness-certification", json=cert_verification_request)
            
            if response.status_code == 200:
                result = response.json()
                print(f"Certification verification response: {json.dumps(result, indent=2)}")
                
                # Verify response structure
                required_fields = ["status", "cert_verified"]
                missing_fields = [field for field in required_fields if field not in result]
                
                if missing_fields:
                    print(f"❌ ERROR: Missing fields in certification verification response: {missing_fields}")
                    verification_test_results["fitness_certification_verification"]["details"] += f"Missing fields for {scenario['name']}: {missing_fields}. "
                    continue
                
                # Verify expected results
                if (result["status"] == scenario["expected_status"] and 
                    result["cert_verified"] == scenario["expected_cert_verified"]):
                    print(f"✅ Certification verification result matches expected outcome")
                    print(f"   Status: {result['status']}")
                    print(f"   Cert Verified: {result['cert_verified']}")
                    
                    if not result["cert_verified"] and "rejection_reason" in result:
                        print(f"   Rejection Reason: {result['rejection_reason']}")
                    
                    successful_tests += 1
                else:
                    print(f"❌ ERROR: Certification verification result doesn't match expected outcome")
                    print(f"   Expected: status={scenario['expected_status']}, cert_verified={scenario['expected_cert_verified']}")
                    print(f"   Got: status={result['status']}, cert_verified={result['cert_verified']}")
                    verification_test_results["fitness_certification_verification"]["details"] += f"Incorrect result for {scenario['name']}. "
                    
            else:
                print(f"❌ ERROR: Fitness certification verification failed. Status code: {response.status_code}")
                print(f"Response: {response.text}")
                verification_test_results["fitness_certification_verification"]["details"] += f"API call failed for {scenario['name']}. Status code: {response.status_code}. "
                
        else:
            print(f"❌ ERROR: Failed to create trainer for {scenario['name']}. Status code: {response.status_code}")
            verification_test_results["fitness_certification_verification"]["details"] += f"Trainer creation failed for {scenario['name']}. "
    
    # Determine success
    if successful_tests == len(cert_test_scenarios):
        print(f"\n✅ FITNESS CERTIFICATION VERIFICATION TESTS PASSED: {successful_tests}/{len(cert_test_scenarios)} scenarios successful")
        verification_test_results["fitness_certification_verification"]["success"] = True
    else:
        print(f"\n❌ FITNESS CERTIFICATION VERIFICATION TESTS FAILED: Only {successful_tests}/{len(cert_test_scenarios)} scenarios successful")
    
    return created_trainers

def test_login_verification_blocking():
    """Test that login properly blocks unverified users"""
    print_separator()
    print("TESTING LOGIN VERIFICATION BLOCKING")
    print_separator()
    
    # Create test users with different verification states
    test_users = []
    
    # Test 1: Unverified fitness enthusiast (should be blocked)
    print("--- Creating unverified fitness enthusiast ---")
    unverified_enthusiast_email = f"unverified_enthusiast_{uuid.uuid4()}@example.com"
    enthusiast_data = {
        "email": unverified_enthusiast_email,
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=enthusiast_data)
    if response.status_code == 200:
        unverified_enthusiast = response.json()
        test_users.append(("unverified_enthusiast", unverified_enthusiast, unverified_enthusiast_email))
        print(f"✅ Created unverified enthusiast: {unverified_enthusiast['id']}")
    else:
        print(f"❌ ERROR: Failed to create unverified enthusiast")
        return False
    
    # Test 2: Unverified trainer (should be blocked)
    print("\n--- Creating unverified trainer ---")
    unverified_trainer_email = f"unverified_trainer_{uuid.uuid4()}@example.com"
    trainer_data = {
        "email": unverified_trainer_email,
        "role": "trainer",
        "fitness_goals": ["sport_training"],
        "experience_level": "expert"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=trainer_data)
    if response.status_code == 200:
        unverified_trainer = response.json()
        test_users.append(("unverified_trainer", unverified_trainer, unverified_trainer_email))
        print(f"✅ Created unverified trainer: {unverified_trainer['id']}")
    else:
        print(f"❌ ERROR: Failed to create unverified trainer")
        return False
    
    # Test 3: Create and verify an enthusiast (should be allowed)
    print("\n--- Creating and verifying enthusiast ---")
    verified_enthusiast_email = f"test_verified_enthusiast_{uuid.uuid4()}@example.com"
    verified_enthusiast_data = {
        "email": verified_enthusiast_email,
        "role": "fitness_enthusiast",
        "fitness_goals": ["muscle_building"],
        "experience_level": "intermediate"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=verified_enthusiast_data)
    if response.status_code == 200:
        verified_enthusiast = response.json()
        
        # Verify their ID
        mock_image = create_mock_image_data()
        id_verification_request = {
            "user_id": verified_enthusiast["id"],
            "user_email": verified_enthusiast_email,
            "image_data": mock_image
        }
        
        response = requests.post(f"{BACKEND_URL}/verify-government-id", json=id_verification_request)
        if response.status_code == 200:
            result = response.json()
            if result.get("age_verified"):
                test_users.append(("verified_enthusiast", verified_enthusiast, verified_enthusiast_email))
                print(f"✅ Created and verified enthusiast: {verified_enthusiast['id']}")
            else:
                print(f"❌ ERROR: Failed to verify enthusiast ID")
                return False
        else:
            print(f"❌ ERROR: ID verification API call failed")
            return False
    else:
        print(f"❌ ERROR: Failed to create verified enthusiast")
        return False
    
    # Test 4: Create and fully verify a trainer (should be allowed)
    print("\n--- Creating and fully verifying trainer ---")
    fully_verified_trainer_email = f"test_fully_verified_trainer_{uuid.uuid4()}@example.com"
    fully_verified_trainer_data = {
        "email": fully_verified_trainer_email,
        "role": "trainer",
        "fitness_goals": ["rehabilitation"],
        "experience_level": "expert"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=fully_verified_trainer_data)
    if response.status_code == 200:
        fully_verified_trainer = response.json()
        
        # Verify their ID first
        id_verification_request = {
            "user_id": fully_verified_trainer["id"],
            "user_email": fully_verified_trainer_email,
            "image_data": mock_image
        }
        
        response = requests.post(f"{BACKEND_URL}/verify-government-id", json=id_verification_request)
        if response.status_code == 200 and response.json().get("age_verified"):
            
            # Then verify their certification
            cert_verification_request = {
                "user_id": fully_verified_trainer["id"],
                "user_email": fully_verified_trainer_email,
                "cert_type": "NASM",
                "image_data": mock_image
            }
            
            response = requests.post(f"{BACKEND_URL}/verify-fitness-certification", json=cert_verification_request)
            if response.status_code == 200:
                result = response.json()
                if result.get("cert_verified"):
                    test_users.append(("fully_verified_trainer", fully_verified_trainer, fully_verified_trainer_email))
                    print(f"✅ Created and fully verified trainer: {fully_verified_trainer['id']}")
                else:
                    print(f"❌ ERROR: Failed to verify trainer certification")
                    return False
            else:
                print(f"❌ ERROR: Certification verification API call failed")
                return False
        else:
            print(f"❌ ERROR: Failed to verify trainer ID")
            return False
    else:
        print(f"❌ ERROR: Failed to create fully verified trainer")
        return False
    
    # Now test login for each user type
    print("\n" + "="*60)
    print("TESTING LOGIN BLOCKING BEHAVIOR")
    print("="*60)
    
    successful_login_tests = 0
    expected_results = {
        "unverified_enthusiast": {"should_login": False, "expected_status": 403, "reason": "age verification required"},
        "unverified_trainer": {"should_login": False, "expected_status": 403, "reason": "age verification required"},
        "verified_enthusiast": {"should_login": True, "expected_status": 200, "reason": "age verified"},
        "fully_verified_trainer": {"should_login": True, "expected_status": 200, "reason": "fully verified"}
    }
    
    for user_type, user, email in test_users:
        print(f"\n--- Testing login for {user_type} ---")
        print(f"Email: {email}")
        print(f"Expected: {'ALLOW' if expected_results[user_type]['should_login'] else 'BLOCK'}")
        
        login_request = {
            "email": email
        }
        
        response = requests.post(f"{BACKEND_URL}/login", json=login_request)
        
        expected_status = expected_results[user_type]["expected_status"]
        should_login = expected_results[user_type]["should_login"]
        
        if response.status_code == expected_status:
            if should_login and response.status_code == 200:
                print(f"✅ Login ALLOWED as expected for {user_type}")
                login_data = response.json()
                print(f"   User ID: {login_data.get('id')}")
                print(f"   Role: {login_data.get('role')}")
                successful_login_tests += 1
            elif not should_login and response.status_code == 403:
                error_data = response.json()
                print(f"✅ Login BLOCKED as expected for {user_type}")
                print(f"   Error: {error_data.get('detail')}")
                
                # Verify the error message is appropriate
                error_message = error_data.get('detail', '').lower()
                if user_type in ["unverified_enthusiast", "unverified_trainer"] and "age verification" in error_message:
                    print(f"   ✅ Correct error message for age verification")
                    successful_login_tests += 1
                elif user_type == "unverified_trainer" and "certification" in error_message:
                    print(f"   ✅ Correct error message for certification verification")
                    successful_login_tests += 1
                else:
                    print(f"   ❌ Error message may not be specific enough")
                    verification_test_results["login_verification_blocking"]["details"] += f"Error message not specific for {user_type}. "
            else:
                print(f"❌ ERROR: Unexpected login result for {user_type}")
                verification_test_results["login_verification_blocking"]["details"] += f"Unexpected result for {user_type}. "
        else:
            print(f"❌ ERROR: Expected status {expected_status} but got {response.status_code} for {user_type}")
            print(f"Response: {response.text}")
            verification_test_results["login_verification_blocking"]["details"] += f"Wrong status code for {user_type}. Expected {expected_status} but got {response.status_code}. "
    
    # Determine success
    if successful_login_tests == len(test_users):
        print(f"\n✅ LOGIN VERIFICATION BLOCKING TESTS PASSED: {successful_login_tests}/{len(test_users)} scenarios successful")
        verification_test_results["login_verification_blocking"]["success"] = True
    else:
        print(f"\n❌ LOGIN VERIFICATION BLOCKING TESTS FAILED: Only {successful_login_tests}/{len(test_users)} scenarios successful")
    
    return test_users

def test_verification_status_endpoint():
    """Test the verification status endpoint"""
    print_separator()
    print("TESTING VERIFICATION STATUS ENDPOINT")
    print_separator()
    
    # Create a test user and verify them step by step
    test_email = f"status_test_{uuid.uuid4()}@example.com"
    user_data = {
        "email": test_email,
        "role": "trainer",
        "fitness_goals": ["sport_training"],
        "experience_level": "expert"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data)
    if response.status_code != 200:
        print(f"❌ ERROR: Failed to create test user")
        return False
    
    user = response.json()
    user_id = user["id"]
    print(f"✅ Created test user: {user_id}")
    
    # Test 1: Check initial verification status
    print("\n--- Testing initial verification status ---")
    response = requests.get(f"{BACKEND_URL}/verification-status/{user_id}")
    
    if response.status_code == 200:
        status = response.json()
        print(f"Initial verification status: {json.dumps(status, indent=2)}")
        
        # Verify response structure
        required_fields = ["user_id", "age_verified", "cert_verified", "verification_status", "requires_certification"]
        missing_fields = [field for field in required_fields if field not in status]
        
        if missing_fields:
            print(f"❌ ERROR: Missing fields in verification status response: {missing_fields}")
            verification_test_results["verification_status_endpoint"]["details"] += f"Missing fields: {missing_fields}. "
            return False
        
        # Verify initial values
        if (status["user_id"] == user_id and 
            status["age_verified"] == False and 
            status["cert_verified"] == False and
            status["verification_status"] == "pending" and
            status["requires_certification"] == True):
            print("✅ Initial verification status is correct")
        else:
            print("❌ ERROR: Initial verification status values are incorrect")
            verification_test_results["verification_status_endpoint"]["details"] += "Initial status values incorrect. "
            return False
    else:
        print(f"❌ ERROR: Failed to get verification status. Status code: {response.status_code}")
        verification_test_results["verification_status_endpoint"]["details"] += f"API call failed. Status code: {response.status_code}. "
        return False
    
    # Test 2: Verify ID and check status update
    print("\n--- Testing status after ID verification ---")
    mock_image = create_mock_image_data()
    id_verification_request = {
        "user_id": user_id,
        "user_email": test_email,
        "image_data": mock_image
    }
    
    response = requests.post(f"{BACKEND_URL}/verify-government-id", json=id_verification_request)
    if response.status_code == 200 and response.json().get("age_verified"):
        print("✅ ID verification successful")
        
        # Check status again
        response = requests.get(f"{BACKEND_URL}/verification-status/{user_id}")
        if response.status_code == 200:
            status = response.json()
            print(f"Status after ID verification: {json.dumps(status, indent=2)}")
            
            if (status["age_verified"] == True and 
                status["cert_verified"] == False and
                status["verification_status"] == "age_verified"):
                print("✅ Status correctly updated after ID verification")
            else:
                print("❌ ERROR: Status not correctly updated after ID verification")
                verification_test_results["verification_status_endpoint"]["details"] += "Status not updated after ID verification. "
                return False
        else:
            print(f"❌ ERROR: Failed to get status after ID verification")
            return False
    else:
        print(f"❌ ERROR: ID verification failed")
        return False
    
    # Test 3: Verify certification and check final status
    print("\n--- Testing status after certification verification ---")
    cert_verification_request = {
        "user_id": user_id,
        "user_email": test_email,
        "cert_type": "NASM",
        "image_data": mock_image
    }
    
    response = requests.post(f"{BACKEND_URL}/verify-fitness-certification", json=cert_verification_request)
    if response.status_code == 200 and response.json().get("cert_verified"):
        print("✅ Certification verification successful")
        
        # Check final status
        response = requests.get(f"{BACKEND_URL}/verification-status/{user_id}")
        if response.status_code == 200:
            status = response.json()
            print(f"Final verification status: {json.dumps(status, indent=2)}")
            
            if (status["age_verified"] == True and 
                status["cert_verified"] == True and
                status["verification_status"] == "fully_verified"):
                print("✅ Final status correctly shows fully verified")
                verification_test_results["verification_status_endpoint"]["success"] = True
                return True
            else:
                print("❌ ERROR: Final status not correctly updated")
                verification_test_results["verification_status_endpoint"]["details"] += "Final status not updated correctly. "
                return False
        else:
            print(f"❌ ERROR: Failed to get final status")
            return False
    else:
        print(f"❌ ERROR: Certification verification failed")
        return False

def run_all_verification_tests():
    """Run all verification system tests"""
    print("🚀 STARTING COMPREHENSIVE DOCUMENT VERIFICATION SYSTEM TESTS")
    print("="*80)
    
    # Test 1: Government ID Verification
    created_users = test_government_id_verification()
    
    # Test 2: Fitness Certification Verification
    created_trainers = test_fitness_certification_verification()
    
    # Test 3: Login Verification Blocking
    test_users = test_login_verification_blocking()
    
    # Test 4: Verification Status Endpoint
    test_verification_status_endpoint()
    
    # Print final results
    print_separator()
    print("📊 VERIFICATION SYSTEM TEST RESULTS SUMMARY")
    print_separator()
    
    total_tests = len(verification_test_results)
    passed_tests = sum(1 for result in verification_test_results.values() if result["success"])
    
    for test_name, result in verification_test_results.items():
        status = "✅ PASSED" if result["success"] else "❌ FAILED"
        print(f"{test_name}: {status}")
        if not result["success"] and result["details"]:
            print(f"   Details: {result['details']}")
    
    print(f"\nOVERALL RESULT: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 ALL VERIFICATION SYSTEM TESTS PASSED!")
        print("✅ The document verification system is working correctly")
        print("✅ Age verification blocks users under 18")
        print("✅ Certification verification blocks invalid certifications")
        print("✅ Login properly blocks unverified users")
        print("✅ Verification status endpoint works correctly")
        return True
    else:
        print("⚠️  SOME VERIFICATION TESTS FAILED")
        print("❌ The document verification system needs attention")
        return False

if __name__ == "__main__":
    success = run_all_verification_tests()
    exit(0 if success else 1)