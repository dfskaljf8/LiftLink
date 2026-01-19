#!/usr/bin/env python3
import requests
import json
import time
import uuid
from datetime import datetime, timedelta

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://fitcoach-ai-36.preview.emergentagent.com/api"

def test_coaching_automation_endpoints():
    """
    TEST COACHING AUTOMATION BACKEND API
    
    Tests the LiftLink Coaching Automation Backend API endpoints:
    1. Program Templates CRUD
    2. Challenges Flow
    3. Tasks & Habits
    4. Dashboard Analytics
    5. Health Check
    """
    print("="*80)
    print("🤖 TESTING COACHING AUTOMATION BACKEND API")
    print("="*80)
    
    results = {"passed": 0, "total": 0, "tests": {}}
    
    # Setup: Create test trainer and client
    print("\n📝 SETUP: Creating test trainer and client for coaching automation")
    print("-" * 60)
    
    # Create test trainer
    trainer_email = f"coach_trainer_{uuid.uuid4()}@example.com"
    trainer_data = {
        "email": trainer_email,
        "name": "Coach Automation Trainer",
        "role": "trainer",
        "fitness_goals": ["sport_training"],
        "experience_level": "expert"
    }
    
    response = requests.post(f"{BACKEND_URL}/create-test-user", json=trainer_data)
    if response.status_code != 200:
        print(f"❌ Failed to create test trainer: {response.status_code}")
        return {"passed": 0, "total": 1, "tests": {"setup": {"passed": False, "error": "Failed to create trainer"}}}
    
    trainer_login = response.json()
    trainer_id = trainer_login["user"]["id"]
    print(f"✅ Created test trainer: {trainer_login['user']['name']} - {trainer_id}")
    
    # Create test client
    client_email = f"coach_client_{uuid.uuid4()}@example.com"
    client_data = {
        "email": client_email,
        "name": "Coach Automation Client",
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss", "muscle_building"],
        "experience_level": "beginner"
    }
    
    response = requests.post(f"{BACKEND_URL}/create-test-user", json=client_data)
    if response.status_code != 200:
        print(f"❌ Failed to create test client: {response.status_code}")
        return {"passed": 0, "total": 1, "tests": {"setup": {"passed": False, "error": "Failed to create client"}}}
    
    client_login = response.json()
    client_id = client_login["user"]["id"]
    print(f"✅ Created test client: {client_login['user']['name']} - {client_id}")
    
    # Test 1: PROGRAM TEMPLATES CRUD
    print("\n" + "="*60)
    print("📋 TESTING PROGRAM TEMPLATES CRUD")
    print("="*60)
    
    # Test 1.1: POST /api/coaching/program-templates
    print("\n1️⃣ Testing POST /api/coaching/program-templates - Create program template")
    results["total"] += 1
    try:
        program_data = {
            "name": "Test Program",
            "duration_weeks": 4,
            "workouts_per_week": 3
        }
        response = requests.post(f"{BACKEND_URL}/coaching/program-templates?trainer_id=test-001", json=program_data)
        
        if response.status_code == 200:
            data = response.json()
            if "template" in data and "id" in data["template"]:
                results["tests"]["program_template_create"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Create program template: PASS")
                print(f"   Created program: {program_data['name']}")
            else:
                results["tests"]["program_template_create"] = {"passed": False, "error": "Missing template or id in response"}
                print(f"❌ Create program template: FAIL - Invalid response structure")
        else:
            results["tests"]["program_template_create"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Create program template: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["program_template_create"] = {"passed": False, "error": str(e)}
        print(f"❌ Create program template: FAIL - {e}")
    
    # Test 1.2: GET /api/coaching/program-templates/test-001
    print("\n2️⃣ Testing GET /api/coaching/program-templates/test-001 - Get program templates")
    results["total"] += 1
    try:
        response = requests.get(f"{BACKEND_URL}/coaching/program-templates/test-001")
        
        if response.status_code == 200:
            data = response.json()
            if "templates" in data and isinstance(data["templates"], list):
                results["tests"]["program_template_get"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Get program templates: PASS")
                templates = data["templates"]
                print(f"   Found {len(templates)} program templates")
            else:
                results["tests"]["program_template_get"] = {"passed": False, "error": "Invalid response structure"}
                print(f"❌ Get program templates: FAIL - Invalid response structure")
        else:
            results["tests"]["program_template_get"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Get program templates: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["program_template_get"] = {"passed": False, "error": str(e)}
        print(f"❌ Get program templates: FAIL - {e}")
    
    # Test 2: CHALLENGES FLOW
    print("\n" + "="*60)
    print("🏆 TESTING CHALLENGES FLOW")
    print("="*60)
    
    challenge_id = None
    
    # Test 2.1: POST /api/coaching/challenges - Create challenge
    print("\n3️⃣ Testing POST /api/coaching/challenges - Create challenge")
    results["total"] += 1
    try:
        challenge_data = {
            "name": "Step Challenge",
            "start_date": "2025-01-01",
            "end_date": "2025-01-31",
            "metric": "steps",
            "target_value": 100000
        }
        response = requests.post(f"{BACKEND_URL}/coaching/challenges?trainer_id=test-001", json=challenge_data)
        
        if response.status_code == 200:
            data = response.json()
            if "challenge" in data and "id" in data["challenge"]:
                challenge_id = data["challenge"]["id"]
                results["tests"]["challenge_create"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Create challenge: PASS")
                print(f"   Created challenge: {challenge_data['name']} (ID: {challenge_id})")
            else:
                results["tests"]["challenge_create"] = {"passed": False, "error": "Missing challenge or id in response"}
                print(f"❌ Create challenge: FAIL - Invalid response structure")
        else:
            results["tests"]["challenge_create"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Create challenge: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["challenge_create"] = {"passed": False, "error": str(e)}
        print(f"❌ Create challenge: FAIL - {e}")
    
    # Test 2.2: POST /api/coaching/challenges/{challenge_id}/join - Join challenge
    print("\n4️⃣ Testing POST /api/coaching/challenges/{challenge_id}/join - Join challenge")
    results["total"] += 1
    try:
        if challenge_id:
            response = requests.post(f"{BACKEND_URL}/coaching/challenges/{challenge_id}/join?client_id=client-001")
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data or "joined" in data:
                    results["tests"]["challenge_join"] = {"passed": True, "error": None}
                    results["passed"] += 1
                    print("✅ Join challenge: PASS")
                    print(f"   Client joined challenge: {challenge_id}")
                else:
                    results["tests"]["challenge_join"] = {"passed": False, "error": "Missing success or joined in response"}
                    print(f"❌ Join challenge: FAIL - Invalid response structure")
            else:
                results["tests"]["challenge_join"] = {"passed": False, "error": f"Status: {response.status_code}"}
                print(f"❌ Join challenge: FAIL - Status: {response.status_code}")
        else:
            results["tests"]["challenge_join"] = {"passed": False, "error": "No challenge_id available"}
            print("❌ Join challenge: FAIL - No challenge_id available")
    except Exception as e:
        results["tests"]["challenge_join"] = {"passed": False, "error": str(e)}
        print(f"❌ Join challenge: FAIL - {e}")
    
    # Test 2.3: GET /api/coaching/challenges/{challenge_id}/leaderboard - Get leaderboard
    print("\n5️⃣ Testing GET /api/coaching/challenges/{challenge_id}/leaderboard - Get leaderboard")
    results["total"] += 1
    try:
        if challenge_id:
            response = requests.get(f"{BACKEND_URL}/coaching/challenges/{challenge_id}/leaderboard")
            
            if response.status_code == 200:
                data = response.json()
                if "leaderboard" in data or "participants" in data:
                    results["tests"]["challenge_leaderboard"] = {"passed": True, "error": None}
                    results["passed"] += 1
                    print("✅ Get challenge leaderboard: PASS")
                    leaderboard = data.get("leaderboard", data.get("participants", []))
                    print(f"   Leaderboard has {len(leaderboard) if isinstance(leaderboard, list) else 0} participants")
                else:
                    results["tests"]["challenge_leaderboard"] = {"passed": False, "error": "Missing leaderboard or participants in response"}
                    print(f"❌ Get challenge leaderboard: FAIL - Invalid response structure")
            else:
                results["tests"]["challenge_leaderboard"] = {"passed": False, "error": f"Status: {response.status_code}"}
                print(f"❌ Get challenge leaderboard: FAIL - Status: {response.status_code}")
        else:
            results["tests"]["challenge_leaderboard"] = {"passed": False, "error": "No challenge_id available"}
            print("❌ Get challenge leaderboard: FAIL - No challenge_id available")
    except Exception as e:
        results["tests"]["challenge_leaderboard"] = {"passed": False, "error": str(e)}
        print(f"❌ Get challenge leaderboard: FAIL - {e}")
    
    # Test 3: TASKS & HABITS
    print("\n" + "="*60)
    print("✅ TESTING TASKS & HABITS")
    print("="*60)
    
    habit_id = None
    
    # Test 3.1: POST /api/coaching/task-templates - Create task template
    print("\n6️⃣ Testing POST /api/coaching/task-templates - Create task template")
    results["total"] += 1
    try:
        task_data = {
            "name": "Daily Weigh-in",
            "task_type": "weigh_in",
            "frequency": "daily",
            "xp_reward": 10
        }
        response = requests.post(f"{BACKEND_URL}/coaching/task-templates?trainer_id=test-001", json=task_data)
        
        if response.status_code == 200:
            data = response.json()
            if "template" in data and "id" in data["template"]:
                results["tests"]["task_template_create"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Create task template: PASS")
                print(f"   Created task: {task_data['name']}")
            else:
                results["tests"]["task_template_create"] = {"passed": False, "error": "Missing template or id in response"}
                print(f"❌ Create task template: FAIL - Invalid response structure")
        else:
            results["tests"]["task_template_create"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Create task template: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["task_template_create"] = {"passed": False, "error": str(e)}
        print(f"❌ Create task template: FAIL - {e}")
    
    # Test 3.2: POST /api/coaching/habits - Create habit
    print("\n7️⃣ Testing POST /api/coaching/habits - Create habit")
    results["total"] += 1
    try:
        response = requests.post(f"{BACKEND_URL}/coaching/habits?trainer_id=test-001&client_id=client-001&habit_name=Drink%20Water")
        
        if response.status_code == 200:
            data = response.json()
            if "habit" in data and "id" in data["habit"]:
                habit_id = data["habit"]["id"]
                results["tests"]["habit_create"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Create habit: PASS")
                print(f"   Created habit: Drink Water (ID: {habit_id})")
            else:
                results["tests"]["habit_create"] = {"passed": False, "error": "Missing habit or id in response"}
                print(f"❌ Create habit: FAIL - Invalid response structure")
        else:
            results["tests"]["habit_create"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Create habit: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["habit_create"] = {"passed": False, "error": str(e)}
        print(f"❌ Create habit: FAIL - {e}")
    
    # Test 3.3: POST /api/coaching/habits/{habit_id}/complete - Complete habit
    print("\n8️⃣ Testing POST /api/coaching/habits/{habit_id}/complete - Complete habit")
    results["total"] += 1
    try:
        if habit_id:
            response = requests.post(f"{BACKEND_URL}/coaching/habits/{habit_id}/complete?client_id=client-001")
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data or "completed" in data:
                    results["tests"]["habit_complete"] = {"passed": True, "error": None}
                    results["passed"] += 1
                    print("✅ Complete habit: PASS")
                    print(f"   Habit completed: {habit_id}")
                else:
                    results["tests"]["habit_complete"] = {"passed": False, "error": "Missing success or completed in response"}
                    print(f"❌ Complete habit: FAIL - Invalid response structure")
            else:
                results["tests"]["habit_complete"] = {"passed": False, "error": f"Status: {response.status_code}"}
                print(f"❌ Complete habit: FAIL - Status: {response.status_code}")
        else:
            results["tests"]["habit_complete"] = {"passed": False, "error": "No habit_id available"}
            print("❌ Complete habit: FAIL - No habit_id available")
    except Exception as e:
        results["tests"]["habit_complete"] = {"passed": False, "error": str(e)}
        print(f"❌ Complete habit: FAIL - {e}")
    
    # Test 4: DASHBOARD ANALYTICS
    print("\n" + "="*60)
    print("📊 TESTING DASHBOARD ANALYTICS")
    print("="*60)
    
    # Test 4.1: GET /api/coaching/dashboard-analytics/test-001 - Get dashboard analytics
    print("\n9️⃣ Testing GET /api/coaching/dashboard-analytics/test-001 - Get dashboard analytics")
    results["total"] += 1
    try:
        response = requests.get(f"{BACKEND_URL}/coaching/dashboard-analytics/test-001")
        
        if response.status_code == 200:
            data = response.json()
            if "analytics" in data or "dashboard" in data or "stats" in data:
                results["tests"]["dashboard_analytics"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Get dashboard analytics: PASS")
                print(f"   Analytics data retrieved successfully")
            else:
                results["tests"]["dashboard_analytics"] = {"passed": False, "error": "Missing analytics, dashboard, or stats in response"}
                print(f"❌ Get dashboard analytics: FAIL - Invalid response structure")
        else:
            results["tests"]["dashboard_analytics"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Get dashboard analytics: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["dashboard_analytics"] = {"passed": False, "error": str(e)}
        print(f"❌ Get dashboard analytics: FAIL - {e}")
    
    # Test 5: HEALTH CHECK
    print("\n" + "="*60)
    print("🏥 TESTING HEALTH CHECK")
    print("="*60)
    
    # Test 5.1: GET /api/health - Health check (should show 110 endpoints)
    print("\n🔟 Testing GET /api/health - Health check (should show 110 endpoints)")
    results["total"] += 1
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        
        if response.status_code == 200:
            data = response.json()
            if "endpoints" in data:
                endpoint_count = data.get("endpoints")
                results["tests"]["health_check"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Health check: PASS")
                print(f"   Found {endpoint_count} endpoints")
                if endpoint_count >= 110:
                    print("   ✅ Endpoint count meets expected minimum (110)")
                else:
                    print(f"   ⚠️  Endpoint count ({endpoint_count}) below expected (110)")
            else:
                results["tests"]["health_check"] = {"passed": False, "error": "Missing endpoints in response"}
                print(f"❌ Health check: FAIL - Missing endpoints in response")
        else:
            results["tests"]["health_check"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Health check: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["health_check"] = {"passed": False, "error": str(e)}
        print(f"❌ Health check: FAIL - {e}")
    
    # Summary
    print("\n" + "="*80)
    print("📊 COACHING AUTOMATION API TEST RESULTS")
    print("="*80)
    
    percentage = (results["passed"] / results["total"] * 100) if results["total"] > 0 else 0
    status = "✅ PASS" if results["passed"] == results["total"] else "❌ FAIL"
    
    print(f"COACHING AUTOMATION API: {results['passed']}/{results['total']} ({percentage:.1f}%) {status}")
    
    # Show detailed results by category
    categories = {
        "program": "📋 PROGRAM TEMPLATES",
        "challenge": "🏆 CHALLENGES",
        "task": "✅ TASKS",
        "habit": "✅ HABITS",
        "dashboard": "📊 DASHBOARD ANALYTICS",
        "health": "🏥 HEALTH CHECK"
    }
    
    for category, label in categories.items():
        category_tests = {k: v for k, v in results["tests"].items() if k.startswith(category)}
        if category_tests:
            category_passed = sum(1 for test in category_tests.values() if test["passed"])
            category_total = len(category_tests)
            category_pct = (category_passed / category_total * 100) if category_total > 0 else 0
            category_status = "✅" if category_passed == category_total else "❌"
            print(f"   {label}: {category_passed}/{category_total} ({category_pct:.1f}%) {category_status}")
    
    # Show failing tests
    failing_tests = {k: v for k, v in results["tests"].items() if not v["passed"]}
    if failing_tests:
        print(f"\n❌ FAILING TESTS ({len(failing_tests)}):")
        for test_name, test_result in failing_tests.items():
            print(f"   • {test_name}: {test_result['error']}")
    
    return results

if __name__ == "__main__":
    print("🚀 STARTING LIFTLINK COACHING AUTOMATION BACKEND API TESTING")
    print("="*80)
    
    # Run coaching automation test suite
    coaching_results = test_coaching_automation_endpoints()
    
    # Final Summary
    print("\n" + "="*80)
    print("📊 FINAL TEST RESULTS SUMMARY")
    print("="*80)
    
    passed = coaching_results["passed"]
    total = coaching_results["total"]
    percentage = (passed / total * 100) if total > 0 else 0
    status = "✅ PASS" if passed == total else "❌ FAIL"
    
    print(f"COACHING AUTOMATION API: {passed}/{total} ({percentage:.1f}%) {status}")
    
    if percentage == 100:
        print("\n🎉 ALL TESTS PASSED! Coaching Automation Backend API is fully functional and ready for production.")
    else:
        print(f"\n⚠️  {total - passed} tests failed. Review the detailed results above.")
    
    print("="*80)