# LiftLink Auth Testing Playbook

## Step 1: Create Test User & Session via API

```bash
API_URL="https://coach-assist-10.preview.emergentagent.com"

# Create user via Google Auth endpoint
curl -X POST "$API_URL/api/auth/google" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com",
    "name": "Test User",
    "picture": "https://via.placeholder.com/150",
    "google_id": "test_google_123",
    "session_token": "test_session_token"
  }'
```

## Step 2: Test Backend API

```bash
# Get access token from Step 1 response
TOKEN="<access_token_from_step_1>"

# Test auth endpoint
curl -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN"

# Test protected endpoints
curl -X GET "$API_URL/api/trainers/all" \
  -H "Authorization: Bearer $TOKEN"
```

## Step 3: Test Regular Login Flow

```bash
# Create user with email/password
curl -X POST "$API_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "regular@example.com",
    "password": "TestPass123!",
    "name": "Regular User",
    "role": "fitness_enthusiast",
    "fitness_goals": ["weight_loss"],
    "experience_level": "beginner"
  }'

# Note: Login requires age verification first
# Verify age using /api/verify-government-id endpoint
```

## Checklist
- [x] Google Auth creates new user correctly
- [x] Google Auth returns JWT token
- [x] /auth/me returns user data with token
- [x] Users created via Google are auto age-verified
- [x] Regular signup works
- [ ] Regular login requires age verification (by design)

## Success Indicators
✅ /api/auth/google returns user + access_token
✅ /api/auth/me returns user data
✅ Profile image stored from Google
✅ age_verified: true for Google users

## MongoDB Verification
```bash
# Check users in database
mongosh --eval "
use('liftlink_db');
db.users.find({email: /google/}).pretty();
"
```
