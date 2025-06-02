#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime, timedelta
import uuid

# Backend URL from frontend/.env
BACKEND_URL = "https://9a44dc3d-c55b-43bb-a7c0-19f9674e5dd3.preview.emergentagent.com/api"

# Demo users for testing
DEMO_USER_TOKEN = "demo_user"
DEMO_TRAINER_TOKEN = "demo_trainer"
ADMIN_TOKEN = "admin_aarav"

# Headers for authentication
def get_headers(token):
    return {"Authorization": f"Bearer {token}"}

# Helper function to print test results
def print_test_result(test_name, success, response=None, error=None):
    status = "✅ PASSED" if success else "❌ FAILED"
    print(f"{test_name}: {status}")
    if not success and error:
        print(f"  Error: {error}")
    if response:
        try:
            print(f"  Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"  Response: {response.text}")
    print("-" * 80)

# Test User Management System
def test_user_management():
    print("\n=== Testing User Management System ===\n")
    
    # Test user registration
    try:
        new_user_data = {
            "email": f"test_user_{uuid.uuid4()}@example.com",
            "name": "Test User",
            "phone": "1234567890",
            "location": {"lat": 37.7749, "lng": -122.4194},
            "gym": "Test Gym"
        }
        
        response = requests.post(f"{BACKEND_URL}/users/register", json=new_user_data)
        success = response.status_code == 200 and "user_id" in response.json()
        print_test_result("User Registration", success, response)
        
        if success:
            new_user_id = response.json()["user_id"]
            print(f"  Created user with ID: {new_user_id}")
    except Exception as e:
        print_test_result("User Registration", False, error=str(e))
    
    # Test get user profile
    try:
        response = requests.get(f"{BACKEND_URL}/users/profile", headers=get_headers(DEMO_USER_TOKEN))
        success = response.status_code == 200 and "user_id" in response.json()
        print_test_result("Get User Profile", success, response)
    except Exception as e:
        print_test_result("Get User Profile", False, error=str(e))
    
    # Test update user profile
    try:
        update_data = {
            "email": "updated_demo@example.com",
            "name": "Updated Demo User",
            "phone": "9876543210",
            "gym": "Updated Gym"
        }
        
        response = requests.put(f"{BACKEND_URL}/users/profile", 
                               headers=get_headers(DEMO_USER_TOKEN),
                               json=update_data)
        success = response.status_code == 200 and "message" in response.json()
        print_test_result("Update User Profile", success, response)
    except Exception as e:
        print_test_result("Update User Profile", False, error=str(e))

# Test Trainer Management System
def test_trainer_management():
    print("\n=== Testing Trainer Management System ===\n")
    
    # Test trainer registration
    try:
        trainer_data = {
            "bio": "Professional trainer with 5 years of experience",
            "specialties": ["Weight Loss", "Strength Training", "Nutrition"],
            "hourly_rate": 50.0,
            "gym_name": "Fitness First",
            "location": {"lat": 37.7749, "lng": -122.4194},
            "experience_years": 5,
            "certifications": ["NASM", "ACE"]
        }
        
        response = requests.post(f"{BACKEND_URL}/trainers/register", 
                                headers=get_headers(DEMO_USER_TOKEN),
                                json=trainer_data)
        success = response.status_code == 200 and "message" in response.json()
        print_test_result("Trainer Registration", success, response)
    except Exception as e:
        print_test_result("Trainer Registration", False, error=str(e))
    
    # Test trainer search
    try:
        response = requests.get(f"{BACKEND_URL}/trainers/search", 
                               params={"lat": 37.7749, "lng": -122.4194, "radius": 50})
        success = response.status_code == 200 and "trainers" in response.json()
        print_test_result("Trainer Search", success, response)
    except Exception as e:
        print_test_result("Trainer Search", False, error=str(e))
    
    # Test get trainer profile
    try:
        # First get a trainer ID from search results
        search_response = requests.get(f"{BACKEND_URL}/trainers/search")
        if search_response.status_code == 200 and search_response.json()["trainers"]:
            trainer_id = search_response.json()["trainers"][0]["trainer_id"]
            
            response = requests.get(f"{BACKEND_URL}/trainers/{trainer_id}")
            success = response.status_code == 200 and "trainer_id" in response.json()
            print_test_result("Get Trainer Profile", success, response)
        else:
            print_test_result("Get Trainer Profile", False, error="No trainers found in search results")
    except Exception as e:
        print_test_result("Get Trainer Profile", False, error=str(e))

# Test Booking and Payment System
def test_booking_payment():
    print("\n=== Testing Booking and Payment System ===\n")
    
    # Test create booking
    booking_id = None
    try:
        # First get a trainer ID from search results
        search_response = requests.get(f"{BACKEND_URL}/trainers/search")
        if search_response.status_code == 200 and search_response.json()["trainers"]:
            trainer_id = search_response.json()["trainers"][0]["trainer_id"]
            
            # Create a booking for tomorrow
            tomorrow = (datetime.now() + timedelta(days=1)).isoformat()
            booking_data = {
                "trainer_id": trainer_id,
                "session_date": tomorrow,
                "duration_hours": 1.0
            }
            
            response = requests.post(f"{BACKEND_URL}/bookings/create", 
                                    headers=get_headers(DEMO_USER_TOKEN),
                                    json=booking_data)
            success = response.status_code == 200 and "booking_id" in response.json()
            print_test_result("Create Booking", success, response)
            
            if success:
                booking_id = response.json()["booking_id"]
                print(f"  Created booking with ID: {booking_id}")
        else:
            print_test_result("Create Booking", False, error="No trainers found in search results")
    except Exception as e:
        print_test_result("Create Booking", False, error=str(e))
    
    # Test get my bookings
    try:
        response = requests.get(f"{BACKEND_URL}/bookings/my", 
                               headers=get_headers(DEMO_USER_TOKEN))
        success = response.status_code == 200 and "bookings" in response.json()
        print_test_result("Get My Bookings", success, response)
    except Exception as e:
        print_test_result("Get My Bookings", False, error=str(e))
    
    # Test create payment session
    if booking_id:
        try:
            response = requests.post(f"{BACKEND_URL}/payments/create-session", 
                                    headers=get_headers(DEMO_USER_TOKEN),
                                    params={"booking_id": booking_id})
            success = response.status_code == 200 and "checkout_url" in response.json() and "session_id" in response.json()
            print_test_result("Create Payment Session", success, response)
            
            if success:
                session_id = response.json()["session_id"]
                print(f"  Created payment session with ID: {session_id}")
                
                # Test get payment status
                try:
                    status_response = requests.get(f"{BACKEND_URL}/payments/status/{session_id}")
                    status_success = status_response.status_code == 200 and "payment_status" in status_response.json()
                    print_test_result("Get Payment Status", status_success, status_response)
                except Exception as e:
                    print_test_result("Get Payment Status", False, error=str(e))
        except Exception as e:
            print_test_result("Create Payment Session", False, error=str(e))

# Test Gamification System
def test_gamification():
    print("\n=== Testing Gamification System ===\n")
    
    # Test daily check-in
    try:
        response = requests.post(f"{BACKEND_URL}/coins/daily-checkin", 
                                headers=get_headers(DEMO_USER_TOKEN))
        success = response.status_code == 200 and "consecutive_days" in response.json()
        print_test_result("Daily Check-in", success, response)
    except Exception as e:
        print_test_result("Daily Check-in", False, error=str(e))
    
    # Test get coin balance
    try:
        response = requests.get(f"{BACKEND_URL}/coins/balance", 
                               headers=get_headers(DEMO_USER_TOKEN))
        success = response.status_code == 200 and "lift_coins" in response.json()
        print_test_result("Get Coin Balance", success, response)
    except Exception as e:
        print_test_result("Get Coin Balance", False, error=str(e))
    
    # Test purchase coins
    try:
        response = requests.post(f"{BACKEND_URL}/coins/purchase", 
                                headers=get_headers(DEMO_USER_TOKEN),
                                params={"package": "small"})
        success = response.status_code == 200 and "coins_purchased" in response.json()
        print_test_result("Purchase Coins", success, response)
    except Exception as e:
        print_test_result("Purchase Coins", False, error=str(e))
    
    # Test spend coins
    try:
        response = requests.post(f"{BACKEND_URL}/coins/spend", 
                                headers=get_headers(DEMO_USER_TOKEN),
                                json={"amount": 10, "reason": "test_purchase"})
        success = response.status_code == 200 and "coins_spent" in response.json()
        print_test_result("Spend Coins", success, response)
    except Exception as e:
        print_test_result("Spend Coins", False, error=str(e))
    
    # Test get available rewards
    try:
        response = requests.get(f"{BACKEND_URL}/rewards/available", 
                               headers=get_headers(DEMO_USER_TOKEN))
        success = response.status_code == 200 and "available_rewards" in response.json()
        print_test_result("Get Available Rewards", success, response)
    except Exception as e:
        print_test_result("Get Available Rewards", False, error=str(e))
    
    # Test get coin leaderboard
    try:
        response = requests.get(f"{BACKEND_URL}/leaderboards/coins")
        success = response.status_code == 200 and "leaderboard" in response.json()
        print_test_result("Get Coin Leaderboard", success, response)
    except Exception as e:
        print_test_result("Get Coin Leaderboard", False, error=str(e))

# Run all tests
if __name__ == "__main__":
    print("\n===== LIFTLINK BACKEND API TESTING =====\n")
    
    # Test User Management System
    test_user_management()
    
    # Test Trainer Management System
    test_trainer_management()
    
    # Test Booking and Payment System
    test_booking_payment()
    
    # Test Gamification System
    test_gamification()
    
    print("\n===== TESTING COMPLETE =====\n")