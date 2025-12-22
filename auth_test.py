#!/usr/bin/env python3
import requests
import json

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://coach-assist-10.preview.emergentagent.com/api"

def test_authentication_flow():
    """Test the complete authentication flow to get real JWT tokens"""
    print("🔍 TESTING AUTHENTICATION FLOW")
    print("=" * 50)
    
    # Step 1: Create a test user
    print("📝 Step 1: Creating test user...")
    user_email = "auth_test_user@example.com"
    user_data = {
        "email": user_email,
        "name": "Auth Test User",
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/users", json=user_data)
    if response.status_code == 200:
        user = response.json()
        print(f"✅ User created: {user['id']}")
    elif response.status_code == 400 and "already exists" in response.text:
        print("✅ User already exists, continuing...")
        # Get user info
        check_data = {"email": user_email}
        response = requests.post(f"{BACKEND_URL}/check-user", json=check_data)
        if response.status_code == 200:
            check_result = response.json()
            user = {"id": check_result["user_id"], "email": user_email}
        else:
            print(f"❌ Failed to get existing user: {response.status_code}")
            return None
    else:
        print(f"❌ Failed to create user: {response.status_code}")
        print(f"Response: {response.text}")
        return None
    
    # Step 2: Try to login (this should return JWT token)
    print("\n🔑 Step 2: Testing login...")
    login_data = {"email": user_email}
    
    response = requests.post(f"{BACKEND_URL}/login", json=login_data)
    print(f"Login response status: {response.status_code}")
    print(f"Login response: {response.text}")
    
    if response.status_code == 200:
        login_result = response.json()
        if "access_token" in login_result:
            print(f"✅ JWT token received: {login_result['access_token'][:50]}...")
            return login_result["access_token"]
        else:
            print("❌ No access_token in login response")
            return None
    elif response.status_code == 403:
        print("⚠️ User needs verification - this is expected for new users")
        return None
    else:
        print(f"❌ Login failed: {response.status_code}")
        return None

def test_endpoint_with_auth(endpoint, token=None, method="GET", data=None):
    """Test an endpoint with optional authentication"""
    print(f"\n🔍 Testing {method} {endpoint}")
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method == "GET":
            response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers)
        elif method == "PUT":
            response = requests.put(f"{BACKEND_URL}{endpoint}", headers=headers, json=data or {})
        elif method == "POST":
            response = requests.post(f"{BACKEND_URL}{endpoint}", headers=headers, json=data or {})
        
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Response: {response.text[:200]}")
        
        return response.status_code
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    # Test authentication flow
    token = test_authentication_flow()
    
    # Test some endpoints without authentication
    print("\n" + "="*60)
    print("TESTING ENDPOINTS WITHOUT AUTHENTICATION")
    print("="*60)
    
    test_endpoint_with_auth("/users/test_user_id")
    test_endpoint_with_auth("/users/test_user_id/sessions")
    test_endpoint_with_auth("/users/test_user_id", method="PUT", data={"name": "Test"})
    
    # Test with authentication if we have a token
    if token:
        print("\n" + "="*60)
        print("TESTING ENDPOINTS WITH AUTHENTICATION")
        print("="*60)
        
        test_endpoint_with_auth("/users/test_user_id", token=token)
        test_endpoint_with_auth("/users/test_user_id/sessions", token=token)
    else:
        print("\n⚠️ No valid JWT token available for authenticated tests")