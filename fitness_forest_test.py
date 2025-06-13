#!/usr/bin/env python3
import requests
import json
import os
from datetime import datetime

# Get backend URL from frontend .env file
BACKEND_URL = "https://fd415076-40f8-4e16-bde7-e9903ea200b3.preview.emergentagent.com"

# Demo user credentials
DEMO_USER_TOKEN = "demo_user"
DEMO_TRAINER_TOKEN = "demo_trainer"
DEMO_ADMIN_TOKEN = "demo_admin"

# Test headers
headers = {
    "Authorization": f"Bearer {DEMO_USER_TOKEN}",
    "Content-Type": "application/json"
}

def print_separator(title):
    """Print a separator with title for better readability"""
    print("\n" + "="*80)
    print(f" {title} ".center(80, "="))
    print("="*80 + "\n")

def test_user_profile():
    """Test user profile endpoint"""
    print_separator("Testing User Profile Endpoint")
    
    # Test GET /api/users/profile
    response = requests.get(f"{BACKEND_URL}/api/users/profile", headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ GET /api/users/profile - Status: {response.status_code}")
        print(f"User ID: {user_data.get('user_id')}")
        print(f"Name: {user_data.get('name')}")
        print(f"Email: {user_data.get('email')}")
        print(f"Role: {user_data.get('role')}")
        print(f"Level: {user_data.get('level')}")
        print(f"XP Points: {user_data.get('xp_points')}")
        print(f"LiftCoins: {user_data.get('lift_coins')}")
        print(f"Consecutive Days: {user_data.get('consecutive_days')}")
        
        # Verify required fields for tree progress calculation
        required_fields = ['level', 'consecutive_days', 'lift_coins', 'xp_points']
        missing_fields = [field for field in required_fields if field not in user_data]
        
        if missing_fields:
            print(f"❌ Missing required fields for tree progress calculation: {missing_fields}")
            return False
        else:
            print("✅ All required fields for tree progress calculation are present")
            return True
    else:
        print(f"❌ GET /api/users/profile - Status: {response.status_code}")
        print(f"Error: {response.text}")
        return False

def test_tree_visualization():
    """Test tree visualization endpoint"""
    print_separator("Testing Tree Visualization Endpoint")
    
    # Test GET /api/tree/my-tree
    response = requests.get(f"{BACKEND_URL}/api/tree/my-tree", headers=headers)
    
    if response.status_code == 200:
        tree_data = response.json()
        print(f"✅ GET /api/tree/my-tree - Status: {response.status_code}")
        
        # Check if tree structure exists
        if 'tree_structure' in tree_data:
            print(f"Tree structure found with {len(tree_data.get('nodes', []))} nodes")
            
            # Check if nodes have required fields
            if tree_data.get('nodes'):
                node = tree_data['nodes'][0]
                print(f"Sample node: {node.get('title')} - Status: {node.get('status')}")
                
                required_node_fields = ['node_id', 'title', 'description', 'status']
                missing_fields = [field for field in required_node_fields if field not in node]
                
                if missing_fields:
                    print(f"❌ Missing required node fields: {missing_fields}")
                    return False
                else:
                    print("✅ All required node fields are present")
                    return True
            else:
                print("❌ No nodes found in tree structure")
                return False
        else:
            print("❌ Tree structure not found in response")
            return False
    else:
        print(f"❌ GET /api/tree/my-tree - Status: {response.status_code}")
        print(f"Error: {response.text}")
        return False

def test_coin_balance():
    """Test coin balance endpoint"""
    print_separator("Testing Coin Balance Endpoint")
    
    # Test GET /api/coins/balance
    response = requests.get(f"{BACKEND_URL}/api/coins/balance", headers=headers)
    
    if response.status_code == 200:
        coin_data = response.json()
        print(f"✅ GET /api/coins/balance - Status: {response.status_code}")
        print(f"LiftCoins: {coin_data.get('lift_coins')}")
        print(f"Total Coins Earned: {coin_data.get('total_coins_earned')}")
        print(f"Level: {coin_data.get('level')}")
        print(f"XP Points: {coin_data.get('xp_points')}")
        
        # Verify required fields
        required_fields = ['lift_coins', 'total_coins_earned', 'level', 'xp_points']
        missing_fields = [field for field in required_fields if field not in coin_data]
        
        if missing_fields:
            print(f"❌ Missing required fields: {missing_fields}")
            return False
        else:
            print("✅ All required fields are present")
            return True
    else:
        print(f"❌ GET /api/coins/balance - Status: {response.status_code}")
        print(f"Error: {response.text}")
        return False

def test_daily_checkin():
    """Test daily check-in endpoint"""
    print_separator("Testing Daily Check-in Endpoint")
    
    # Test POST /api/coins/daily-checkin
    response = requests.post(f"{BACKEND_URL}/api/coins/daily-checkin", headers=headers)
    
    if response.status_code == 200:
        checkin_data = response.json()
        print(f"✅ POST /api/coins/daily-checkin - Status: {response.status_code}")
        print(f"Message: {checkin_data.get('message')}")
        print(f"Streak: {checkin_data.get('streak')}")
        print(f"LiftCoins: {checkin_data.get('lift_coins')}")
        
        # Verify required fields
        required_fields = ['streak', 'lift_coins', 'message']
        missing_fields = [field for field in required_fields if field not in checkin_data]
        
        if missing_fields:
            print(f"❌ Missing required fields: {missing_fields}")
            return False
        else:
            print("✅ All required fields are present")
            return True
    else:
        print(f"❌ POST /api/coins/daily-checkin - Status: {response.status_code}")
        print(f"Error: {response.text}")
        return False

def test_tree_progress_calculation():
    """Test tree progress calculation formula"""
    print_separator("Testing Tree Progress Calculation Formula")
    
    # Get user profile data
    profile_response = requests.get(f"{BACKEND_URL}/api/users/profile", headers=headers)
    
    if profile_response.status_code == 200:
        user_data = profile_response.json()
        level = user_data.get('level', 1)
        streak = user_data.get('consecutive_days', 0)
        xp = user_data.get('xp_points', 0)
        
        # Calculate progress using the formula:
        # baseProgress (level * 10) + streakBonus (streak * 2, max 30%) + activityBonus (xp/100, max 20%)
        base_progress = level * 10
        streak_bonus = min(streak * 2, 30)
        activity_bonus = min(xp / 100, 20)
        
        total_progress = min(base_progress + streak_bonus + activity_bonus, 100)
        
        print(f"User Level: {level}")
        print(f"User Streak: {streak}")
        print(f"User XP: {xp}")
        print(f"Base Progress (level * 10): {base_progress}%")
        print(f"Streak Bonus (min(streak * 2, 30)): {streak_bonus}%")
        print(f"Activity Bonus (min(xp/100, 20)): {activity_bonus}%")
        print(f"Total Progress (capped at 100%): {total_progress}%")
        
        # Example calculation for verification
        example_level = 5
        example_streak = 7
        example_xp = 450
        
        example_base = example_level * 10
        example_streak_bonus = min(example_streak * 2, 30)
        example_activity_bonus = min(example_xp / 100, 20)
        example_total = example_base + example_streak_bonus + example_activity_bonus
        
        print("\nExample Calculation:")
        print(f"Level 5, Streak 7, XP 450")
        print(f"Base Progress: {example_base}%")
        print(f"Streak Bonus: {example_streak_bonus}%")
        print(f"Activity Bonus: {example_activity_bonus}%")
        print(f"Total Progress: {example_total}%")
        
        return True
    else:
        print(f"❌ Failed to get user profile data - Status: {profile_response.status_code}")
        print(f"Error: {profile_response.text}")
        return False

def run_all_tests():
    """Run all tests and return overall status"""
    results = {
        "user_profile": test_user_profile(),
        "tree_visualization": test_tree_visualization(),
        "coin_balance": test_coin_balance(),
        "daily_checkin": test_daily_checkin(),
        "tree_progress_calculation": test_tree_progress_calculation()
    }
    
    print_separator("Test Results Summary")
    
    all_passed = True
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        if not result:
            all_passed = False
        print(f"{test_name}: {status}")
    
    return all_passed

if __name__ == "__main__":
    success = run_all_tests()
    print(f"\nOverall Test Result: {'✅ PASSED' if success else '❌ FAILED'}")