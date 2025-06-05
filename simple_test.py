#!/usr/bin/env python3
import requests
import json

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://addec334-1545-4598-8cde-d8de3117afe1.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

def test_api_health():
    try:
        response = requests.get(f"{API_URL}/health")
        print(f"Health check: {response.status_code}")
        if response.status_code == 200:
            print(response.json())
        else:
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

def test_trainers_search():
    try:
        response = requests.get(f"{API_URL}/trainers/search")
        print(f"Trainers search: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data.get('trainers', []))} trainers")
        else:
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print(f"Testing backend at: {API_URL}")
    test_api_health()
    test_trainers_search()