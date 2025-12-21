#===================================================
# LiftLink Comprehensive Testing
#===================================================

## Test Scope
- Backend API endpoints
- Authentication flows (Email + Google OAuth)
- Authorization (JWT tokens, protected routes)
- Document verification (OCR)
- Trainer discovery features
- Database operations

## API Base URL
https://trainer-match-14.preview.emergentagent.com

## Test Categories

### 1. Authentication Endpoints
- POST /api/check-user - Check if user exists
- POST /api/users - Create new user
- POST /api/login - Email login (requires age verification)
- POST /api/auth/google - Google OAuth sign-in
- GET /api/auth/me - Get current authenticated user
- POST /api/auth/logout - Logout user

### 2. Verification Endpoints
- POST /api/verify-government-id - Age verification with OCR
- POST /api/verify-fitness-certification - Certification verification with OCR

### 3. Trainer Endpoints
- GET /api/trainers/all - Get all trainers (for swipe discovery)
- POST /api/create-test-user - Create test trainer/trainee

### 4. Protected Endpoints (require JWT)
- GET /api/auth/me
- Various user-specific endpoints

## Test Credentials
- Google Auth Test: testgoogle@gmail.com
- Regular User Test: newregular@test.com (age verified)

## Testing Priority
1. Authentication flow completeness
2. Authorization (JWT validation)
3. OCR verification endpoints
4. Trainer discovery data
5. Error handling

agent_communication:
  - agent: "main"
    message: "Please perform comprehensive testing of all backend endpoints, authentication flows, and authorization. Test both success and error cases. Verify JWT tokens work correctly for protected routes."
