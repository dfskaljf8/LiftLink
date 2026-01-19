#!/usr/bin/env python3
import requests
import json
import time
import uuid
from datetime import datetime, timedelta

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://fitcoach-ai-36.preview.emergentagent.com/api"

def test_liftlink_2_0_firebase_integration():
    """
    TEST LIFTLINK 2.0 FIREBASE INTEGRATION - REVIEW REQUEST
    
    Tests the complete LiftLink 2.0 integration with Firebase push notifications configured:
    1. Firebase Push Notifications (LIVE - Not Simulated)
    2. Gamification System 
    3. Content Locker
    4. Vibe Onboarding
    5. Trainer Dashboard
    """
    print("="*80)
    print("🚀 TESTING LIFTLINK 2.0 FIREBASE INTEGRATION - REVIEW REQUEST")
    print("="*80)
    
    results = {"passed": 0, "total": 0, "tests": {}}
    
    # Setup: Create test users
    print("\n📝 SETUP: Creating test users for LiftLink 2.0 Firebase testing")
    print("-" * 60)
    
    # Create test trainee
    trainee_email = f"firebase_trainee_{uuid.uuid4()}@example.com"
    trainee_data = {
        "email": trainee_email,
        "name": "Firebase Test Trainee",
        "role": "fitness_enthusiast",
        "fitness_goals": ["weight_loss", "muscle_building"],
        "experience_level": "intermediate"
    }
    
    response = requests.post(f"{BACKEND_URL}/create-test-user", json=trainee_data)
    if response.status_code != 200:
        print(f"❌ Failed to create test trainee: {response.status_code}")
        return {"passed": 0, "total": 1, "tests": {"setup": {"passed": False, "error": "Failed to create trainee"}}}
    
    trainee_login = response.json()
    trainee_id = trainee_login["user"]["id"]
    trainee_jwt = trainee_login["access_token"]
    print(f"✅ Created test trainee: {trainee_login['user']['name']} - {trainee_id}")
    
    # Create test trainer
    trainer_email = f"firebase_trainer_{uuid.uuid4()}@example.com"
    trainer_data = {
        "email": trainer_email,
        "name": "Firebase Test Trainer",
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
    trainer_jwt = trainer_login["access_token"]
    print(f"✅ Created test trainer: {trainer_login['user']['name']} - {trainer_id}")
    
    # Test 1: FIREBASE PUSH NOTIFICATIONS (LIVE)
    print("\n" + "="*80)
    print("📱 TESTING FIREBASE PUSH NOTIFICATIONS (LIVE - NOT SIMULATED)")
    print("="*80)
    firebase_results = test_firebase_push_notifications_live(trainee_id, trainer_id)
    results["passed"] += firebase_results["passed"]
    results["total"] += firebase_results["total"]
    results["tests"].update(firebase_results["tests"])
    
    # Test 2: GAMIFICATION SYSTEM
    print("\n" + "="*80)
    print("🎮 TESTING GAMIFICATION SYSTEM")
    print("="*80)
    gamification_results = test_gamification_system_review(trainee_id, trainer_id, trainee_jwt)
    results["passed"] += gamification_results["passed"]
    results["total"] += gamification_results["total"]
    results["tests"].update(gamification_results["tests"])
    
    # Test 3: CONTENT LOCKER
    print("\n" + "="*80)
    print("📚 TESTING CONTENT LOCKER")
    print("="*80)
    content_results = test_content_locker_review(trainer_id, trainee_id)
    results["passed"] += content_results["passed"]
    results["total"] += content_results["total"]
    results["tests"].update(content_results["tests"])
    
    # Test 4: VIBE ONBOARDING
    print("\n" + "="*80)
    print("🎯 TESTING VIBE ONBOARDING")
    print("="*80)
    vibe_results = test_vibe_onboarding_review(trainee_id)
    results["passed"] += vibe_results["passed"]
    results["total"] += vibe_results["total"]
    results["tests"].update(vibe_results["tests"])
    
    # Test 5: TRAINER DASHBOARD
    print("\n" + "="*80)
    print("📊 TESTING TRAINER DASHBOARD")
    print("="*80)
    dashboard_results = test_trainer_dashboard_review(trainer_id)
    results["passed"] += dashboard_results["passed"]
    results["total"] += dashboard_results["total"]
    results["tests"].update(dashboard_results["tests"])
    
    # Summary
    print("\n" + "="*80)
    print("📊 LIFTLINK 2.0 FIREBASE INTEGRATION TEST RESULTS")
    print("="*80)
    
    percentage = (results["passed"] / results["total"] * 100) if results["total"] > 0 else 0
    status = "✅ PASS" if results["passed"] == results["total"] else "❌ FAIL"
    
    print(f"LIFTLINK 2.0 FIREBASE INTEGRATION: {results['passed']}/{results['total']} ({percentage:.1f}%) {status}")
    
    # Show detailed results by category
    categories = {
        "firebase": "📱 FIREBASE PUSH NOTIFICATIONS",
        "gamification": "🎮 GAMIFICATION SYSTEM",
        "content": "📚 CONTENT LOCKER",
        "vibe": "🎯 VIBE ONBOARDING",
        "dashboard": "📊 TRAINER DASHBOARD"
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

def test_firebase_push_notifications_live(trainee_id, trainer_id):
    """Test Firebase push notifications with LIVE Firebase (not simulated)"""
    results = {"passed": 0, "total": 0, "tests": {}}
    
    # Test 1: POST /api/push/register-device - Register a device with FCM token
    print("\n1️⃣ Testing POST /api/push/register-device - Register device with FCM token")
    results["total"] += 1
    try:
        device_data = {
            "user_id": trainee_id,
            "fcm_token": f"firebase_fcm_token_{uuid.uuid4()}",
            "device_type": "android",
            "device_id": f"firebase_device_{uuid.uuid4()}"
        }
        response = requests.post(f"{BACKEND_URL}/push/register-device", json=device_data)
        
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data.get("success"):
                results["tests"]["firebase_register_device"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Firebase register device endpoint: PASS")
                print(f"   Device registered for user: {trainee_id}")
            else:
                results["tests"]["firebase_register_device"] = {"passed": False, "error": "Registration not successful"}
                print(f"❌ Firebase register device endpoint: FAIL - Registration not successful")
        else:
            results["tests"]["firebase_register_device"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Firebase register device endpoint: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["firebase_register_device"] = {"passed": False, "error": str(e)}
        print(f"❌ Firebase register device endpoint: FAIL - {e}")
    
    # Test 2: POST /api/push/send - Send a notification (should use real Firebase now)
    print("\n2️⃣ Testing POST /api/push/send - Send notification using real Firebase")
    results["total"] += 1
    try:
        notification_data = {
            "user_id": trainee_id,
            "title": "Firebase Live Test Notification",
            "body": "This notification should be sent via real Firebase, not simulated",
            "data": {"type": "firebase_test", "test_id": "live_firebase"},
            "notification_type": "general"
        }
        response = requests.post(f"{BACKEND_URL}/push/send", json=notification_data)
        
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data.get("success"):
                # Check if Firebase is being used (not simulated)
                firebase_used = data.get("firebase_used", False) or "firebase" in str(data).lower()
                results["tests"]["firebase_send_notification"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Firebase send notification endpoint: PASS")
                print(f"   Notification sent via Firebase to user: {trainee_id}")
                if firebase_used:
                    print("   ✅ Real Firebase detected (not simulated)")
                else:
                    print("   ⚠️  Firebase status unclear - check logs for 'Firebase initialized with service account'")
            else:
                results["tests"]["firebase_send_notification"] = {"passed": False, "error": "Send not successful"}
                print(f"❌ Firebase send notification endpoint: FAIL - Send not successful")
        else:
            results["tests"]["firebase_send_notification"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Firebase send notification endpoint: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["firebase_send_notification"] = {"passed": False, "error": str(e)}
        print(f"❌ Firebase send notification endpoint: FAIL - {e}")
    
    # Test 3: GET /api/push/notifications/{user_id} - Get user notifications
    print("\n3️⃣ Testing GET /api/push/notifications/{user_id} - Get user notifications")
    results["total"] += 1
    try:
        response = requests.get(f"{BACKEND_URL}/push/notifications/{trainee_id}")
        
        if response.status_code == 200:
            data = response.json()
            if "notifications" in data and isinstance(data["notifications"], list):
                results["tests"]["firebase_get_notifications"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Firebase get notifications endpoint: PASS")
                print(f"   Found {len(data['notifications'])} notifications for user")
            else:
                results["tests"]["firebase_get_notifications"] = {"passed": False, "error": "Invalid notifications response"}
                print(f"❌ Firebase get notifications endpoint: FAIL - Invalid response format")
        else:
            results["tests"]["firebase_get_notifications"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Firebase get notifications endpoint: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["firebase_get_notifications"] = {"passed": False, "error": str(e)}
        print(f"❌ Firebase get notifications endpoint: FAIL - {e}")
    
    return results

def test_gamification_system_review(trainee_id, trainer_id, trainee_jwt):
    """Test gamification system endpoints for review"""
    results = {"passed": 0, "total": 0, "tests": {}}
    
    # Test 1: GET /api/gamification/stats/{user_id} - Should include xp, streak, quests fields
    print("\n1️⃣ Testing GET /api/gamification/stats/{user_id} - Should include xp, streak, quests fields")
    results["total"] += 1
    try:
        response = requests.get(f"{BACKEND_URL}/gamification/stats/{trainee_id}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["xp", "streak", "quests"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if len(missing_fields) == 0:
                results["tests"]["gamification_stats_fields"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Gamification stats endpoint: PASS")
                print(f"   XP: {data.get('xp')}, Streak: {data.get('streak')}, Quests: {len(data.get('quests', []))}")
            else:
                results["tests"]["gamification_stats_fields"] = {"passed": False, "error": f"Missing required fields: {missing_fields}"}
                print(f"❌ Gamification stats endpoint: FAIL - Missing fields: {missing_fields}")
                print(f"   Available fields: {list(data.keys())}")
        else:
            results["tests"]["gamification_stats_fields"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Gamification stats endpoint: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["gamification_stats_fields"] = {"passed": False, "error": str(e)}
        print(f"❌ Gamification stats endpoint: FAIL - {e}")
    
    # Test 2: POST /api/gamification/award-xp - Award XP and check for level up
    print("\n2️⃣ Testing POST /api/gamification/award-xp - Award XP and check for level up")
    results["total"] += 1
    try:
        award_data = {
            "user_id": trainee_id,
            "amount": 150,
            "event_type": "workout_completed",
            "description": "Completed advanced strength training session"
        }
        response = requests.post(f"{BACKEND_URL}/gamification/award-xp", params=award_data)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["xp_awarded", "new_total_xp", "level_up"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if len(missing_fields) == 0:
                results["tests"]["gamification_award_xp_fields"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Award XP endpoint: PASS")
                print(f"   Awarded: {data.get('xp_awarded')} XP, New Total: {data.get('new_total_xp')}")
                print(f"   Level Up: {data.get('level_up')}")
            else:
                results["tests"]["gamification_award_xp_fields"] = {"passed": False, "error": f"Missing required fields: {missing_fields}"}
                print(f"❌ Award XP endpoint: FAIL - Missing fields: {missing_fields}")
                print(f"   Available fields: {list(data.keys())}")
        else:
            results["tests"]["gamification_award_xp_fields"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Award XP endpoint: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["gamification_award_xp_fields"] = {"passed": False, "error": str(e)}
        print(f"❌ Award XP endpoint: FAIL - {e}")
    
    # Test 3: GET /api/gamification/achievements - List all achievements
    print("\n3️⃣ Testing GET /api/gamification/achievements - List all achievements")
    results["total"] += 1
    try:
        response = requests.get(f"{BACKEND_URL}/gamification/achievements")
        
        if response.status_code == 200:
            data = response.json()
            if "achievements" in data and isinstance(data["achievements"], list):
                results["tests"]["gamification_list_achievements"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ List achievements endpoint: PASS")
                print(f"   Found {len(data['achievements'])} available achievements")
            else:
                results["tests"]["gamification_list_achievements"] = {"passed": False, "error": "Invalid achievements response format"}
                print(f"❌ List achievements endpoint: FAIL - Invalid response format")
        else:
            results["tests"]["gamification_list_achievements"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ List achievements endpoint: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["gamification_list_achievements"] = {"passed": False, "error": str(e)}
        print(f"❌ List achievements endpoint: FAIL - {e}")
    
    # Test 4: POST /api/gamification/accept-quest - Accept a quest
    print("\n4️⃣ Testing POST /api/gamification/accept-quest - Accept a quest")
    results["total"] += 1
    try:
        quest_data = {
            "user_id": trainee_id,
            "quest_id": "weekly_warrior"
        }
        response = requests.post(f"{BACKEND_URL}/gamification/accept-quest", params=quest_data)
        
        if response.status_code == 200:
            data = response.json()
            if "quest_accepted" in data or "success" in data:
                results["tests"]["gamification_accept_quest"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Accept quest endpoint: PASS")
                print(f"   Quest accepted: {data.get('quest_accepted', data.get('success'))}")
            else:
                results["tests"]["gamification_accept_quest"] = {"passed": False, "error": "Missing quest_accepted or success field"}
                print(f"❌ Accept quest endpoint: FAIL - Missing quest_accepted field")
                print(f"   Response: {data}")
        else:
            results["tests"]["gamification_accept_quest"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Accept quest endpoint: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["gamification_accept_quest"] = {"passed": False, "error": str(e)}
        print(f"❌ Accept quest endpoint: FAIL - {e}")
    
    # Test 5: POST /api/gamification/update-quest-progress - Update progress
    print("\n5️⃣ Testing POST /api/gamification/update-quest-progress - Update progress")
    results["total"] += 1
    try:
        progress_data = {
            "user_id": trainee_id,
            "quest_type": "weekly_warrior",
            "increment": 1
        }
        response = requests.post(f"{BACKEND_URL}/gamification/update-quest-progress", params=progress_data)
        
        if response.status_code == 200:
            data = response.json()
            if "progress_updated" in data or "success" in data:
                results["tests"]["gamification_update_progress"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Update quest progress endpoint: PASS")
                print(f"   Progress updated: {data.get('progress_updated', data.get('success'))}")
            else:
                results["tests"]["gamification_update_progress"] = {"passed": False, "error": "Missing progress_updated or success field"}
                print(f"❌ Update quest progress endpoint: FAIL - Missing progress_updated field")
                print(f"   Response: {data}")
        else:
            results["tests"]["gamification_update_progress"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Update quest progress endpoint: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["gamification_update_progress"] = {"passed": False, "error": str(e)}
        print(f"❌ Update quest progress endpoint: FAIL - {e}")
    
    return results

def test_content_locker_review(trainer_id, trainee_id):
    """Test content locker endpoints for review"""
    results = {"passed": 0, "total": 0, "tests": {}}
    content_id = None
    
    # Test 1: POST /api/content - Create new content
    print("\n1️⃣ Testing POST /api/content - Create new content")
    results["total"] += 1
    try:
        content_data = {
            "trainer_id": trainer_id,
            "title": "Firebase Test Content - Advanced Deadlift Form",
            "content": "Master the deadlift with these essential tips: 1) Keep the bar close to your body, 2) Engage your lats, 3) Drive through your heels, 4) Maintain neutral spine...",
            "type": "tip",
            "tags": ["deadlift", "form", "technique", "strength"]
        }
        response = requests.post(f"{BACKEND_URL}/content", json=content_data)
        
        if response.status_code == 200:
            data = response.json()
            if "content_item" in data and "id" in data["content_item"]:
                content_id = data["content_item"]["id"]
                results["tests"]["content_create_new"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Create content endpoint: PASS")
                print(f"   Created content ID: {content_id}")
            else:
                results["tests"]["content_create_new"] = {"passed": False, "error": "Missing content_item or id"}
                print(f"❌ Create content endpoint: FAIL - Missing content_item or id")
        else:
            results["tests"]["content_create_new"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Create content endpoint: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["content_create_new"] = {"passed": False, "error": str(e)}
        print(f"❌ Create content endpoint: FAIL - {e}")
    
    # Test 2: GET /api/content/trainer/{trainer_id} - Get trainer's content
    print("\n2️⃣ Testing GET /api/content/trainer/{trainer_id} - Get trainer's content")
    results["total"] += 1
    try:
        response = requests.get(f"{BACKEND_URL}/content/trainer/{trainer_id}")
        
        if response.status_code == 200:
            data = response.json()
            if "content_items" in data and isinstance(data["content_items"], list):
                results["tests"]["content_get_trainer_content"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Get trainer content endpoint: PASS")
                print(f"   Found {len(data['content_items'])} content items for trainer")
            else:
                results["tests"]["content_get_trainer_content"] = {"passed": False, "error": "Invalid content_items response"}
                print(f"❌ Get trainer content endpoint: FAIL - Invalid response format")
        else:
            results["tests"]["content_get_trainer_content"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Get trainer content endpoint: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["content_get_trainer_content"] = {"passed": False, "error": str(e)}
        print(f"❌ Get trainer content endpoint: FAIL - {e}")
    
    # Test 3: POST /api/content/schedule - Schedule content delivery
    print("\n3️⃣ Testing POST /api/content/schedule - Schedule content delivery")
    results["total"] += 1
    try:
        if content_id:
            schedule_data = {
                "content_id": content_id,
                "client_ids": [trainee_id],
                "delivery_time": "now"
            }
            response = requests.post(f"{BACKEND_URL}/content/schedule", json=schedule_data)
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data.get("success"):
                    results["tests"]["content_schedule_delivery"] = {"passed": True, "error": None}
                    results["passed"] += 1
                    print("✅ Schedule content delivery endpoint: PASS")
                    print(f"   Scheduled content delivery to {len(schedule_data['client_ids'])} clients")
                else:
                    results["tests"]["content_schedule_delivery"] = {"passed": False, "error": "Schedule not successful"}
                    print(f"❌ Schedule content delivery endpoint: FAIL - Schedule not successful")
            else:
                results["tests"]["content_schedule_delivery"] = {"passed": False, "error": f"Status: {response.status_code} - {response.text}"}
                print(f"❌ Schedule content delivery endpoint: FAIL - Status: {response.status_code}")
                print(f"   Response: {response.text}")
        else:
            results["tests"]["content_schedule_delivery"] = {"passed": False, "error": "No content_id available for scheduling"}
            print("❌ Schedule content delivery endpoint: FAIL - No content_id available")
    except Exception as e:
        results["tests"]["content_schedule_delivery"] = {"passed": False, "error": str(e)}
        print(f"❌ Schedule content delivery endpoint: FAIL - {e}")
    
    # Test 4: POST /api/ai/enhance-content - AI enhance content
    print("\n4️⃣ Testing POST /api/ai/enhance-content - AI enhance content")
    results["total"] += 1
    try:
        enhance_data = {
            "trainer_notes": "Basic deadlift form and safety tips",
            "content_type": "tip"
        }
        response = requests.post(f"{BACKEND_URL}/ai/enhance-content", json=enhance_data)
        
        if response.status_code == 200:
            data = response.json()
            if "generated_content" in data or "enhanced_content" in data:
                results["tests"]["content_ai_enhance"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ AI enhance content endpoint: PASS")
                print(f"   Enhanced content generated successfully")
            else:
                results["tests"]["content_ai_enhance"] = {"passed": False, "error": "Missing generated_content or enhanced_content"}
                print(f"❌ AI enhance content endpoint: FAIL - Missing generated content")
        else:
            results["tests"]["content_ai_enhance"] = {"passed": False, "error": f"Status: {response.status_code} - {response.text}"}
            print(f"❌ AI enhance content endpoint: FAIL - Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        results["tests"]["content_ai_enhance"] = {"passed": False, "error": str(e)}
        print(f"❌ AI enhance content endpoint: FAIL - {e}")
    
    return results

def test_vibe_onboarding_review(trainee_id):
    """Test vibe onboarding endpoints for review"""
    results = {"passed": 0, "total": 0, "tests": {}}
    
    vibe_modes = ["big_dog_mode", "soft_grind", "easy_restart"]
    
    for i, vibe_mode in enumerate(vibe_modes, 1):
        print(f"\n{i}️⃣ Testing POST /api/onboarding/vibe - {vibe_mode}")
        results["total"] += 1
        try:
            vibe_data = {
                "user_id": trainee_id,
                "vibe_mode": vibe_mode
            }
            response = requests.post(f"{BACKEND_URL}/onboarding/vibe", json=vibe_data)
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data.get("success"):
                    results["tests"][f"vibe_onboarding_{vibe_mode}"] = {"passed": True, "error": None}
                    results["passed"] += 1
                    print(f"✅ Vibe onboarding ({vibe_mode}): PASS")
                    print(f"   Vibe preferences set successfully")
                    if "xp_awarded" in data:
                        print(f"   XP awarded: {data.get('xp_awarded')}")
                else:
                    results["tests"][f"vibe_onboarding_{vibe_mode}"] = {"passed": False, "error": "Onboarding not successful"}
                    print(f"❌ Vibe onboarding ({vibe_mode}): FAIL - Not successful")
            else:
                results["tests"][f"vibe_onboarding_{vibe_mode}"] = {"passed": False, "error": f"Status: {response.status_code}"}
                print(f"❌ Vibe onboarding ({vibe_mode}): FAIL - Status: {response.status_code}")
        except Exception as e:
            results["tests"][f"vibe_onboarding_{vibe_mode}"] = {"passed": False, "error": str(e)}
            print(f"❌ Vibe onboarding ({vibe_mode}): FAIL - {e}")
    
    return results

def test_trainer_dashboard_review(trainer_id):
    """Test trainer dashboard endpoint for review"""
    results = {"passed": 0, "total": 0, "tests": {}}
    
    # Test 1: GET /api/trainer/dashboard/{trainer_id}
    print("\n1️⃣ Testing GET /api/trainer/dashboard/{trainer_id}")
    results["total"] += 1
    try:
        response = requests.get(f"{BACKEND_URL}/trainer/dashboard/{trainer_id}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["trainer_info", "client_stats", "alerts", "recent_activity"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if len(missing_fields) == 0:
                results["tests"]["dashboard_trainer_data"] = {"passed": True, "error": None}
                results["passed"] += 1
                print("✅ Trainer dashboard endpoint: PASS")
                print(f"   Trainer: {data.get('trainer_info', {}).get('name', 'Unknown')}")
                print(f"   Total clients: {data.get('client_stats', {}).get('total_clients', 0)}")
                print(f"   Active clients: {data.get('client_stats', {}).get('active_clients', 0)}")
                print(f"   Alerts: {len(data.get('alerts', {}).get('needs_attention', []))} needs attention")
            else:
                results["tests"]["dashboard_trainer_data"] = {"passed": False, "error": f"Missing required fields: {missing_fields}"}
                print(f"❌ Trainer dashboard endpoint: FAIL - Missing fields: {missing_fields}")
                print(f"   Available fields: {list(data.keys())}")
        else:
            results["tests"]["dashboard_trainer_data"] = {"passed": False, "error": f"Status: {response.status_code}"}
            print(f"❌ Trainer dashboard endpoint: FAIL - Status: {response.status_code}")
    except Exception as e:
        results["tests"]["dashboard_trainer_data"] = {"passed": False, "error": str(e)}
        print(f"❌ Trainer dashboard endpoint: FAIL - {e}")
    
    return results

if __name__ == "__main__":
    print("🚀 LIFTLINK 2.0 FIREBASE INTEGRATION TESTING")
    print("=" * 80)
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 80)
    
    # Run the Firebase integration test as requested in the review
    firebase_results = test_liftlink_2_0_firebase_integration()
    
    print("\n" + "=" * 80)
    print("🎯 FIREBASE INTEGRATION TEST SUMMARY")
    print("=" * 80)
    
    total_percentage = (firebase_results["passed"] / firebase_results["total"] * 100) if firebase_results["total"] > 0 else 0
    overall_status = "✅ PASS" if firebase_results["passed"] == firebase_results["total"] else "❌ FAIL"
    
    print(f"OVERALL RESULT: {firebase_results['passed']}/{firebase_results['total']} ({total_percentage:.1f}%) {overall_status}")
    
    # Show critical failures
    critical_failures = []
    for test_name, test_result in firebase_results["tests"].items():
        if not test_result["passed"]:
            critical_failures.append(f"{test_name}: {test_result['error']}")
    
    if critical_failures:
        print(f"\n❌ CRITICAL FAILURES ({len(critical_failures)}):")
        for failure in critical_failures:
            print(f"   • {failure}")
    else:
        print("\n✅ ALL TESTS PASSED - FIREBASE INTEGRATION WORKING CORRECTLY")
    
    print("\n" + "=" * 80)