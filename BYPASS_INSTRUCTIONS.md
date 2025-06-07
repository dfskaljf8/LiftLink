# LiftLink Development Bypass Instructions

## Quick Access to App (Skip Verification)

To bypass the age and ID verification and access the main app directly, you have several options:

### Option 1: URL Parameters
Add one of these parameters to the URL:
- `?bypass=true`
- `?dev=true`

**Examples:**
- `http://localhost:3000?bypass=true`
- `http://localhost:3000?dev=true`

### Option 2: Quick Bypass Buttons
When you access the app with the bypass parameter, you'll see additional orange "Skip Verification" buttons on the role selection page:

- **⚡ Skip Verification as Trainee** - Access the trainee version of the app
- **⚡ Skip Verification as Trainer** - Access the trainer version with CRM dashboard

### What Each Role Shows:

#### Trainee Experience:
- Enhanced trainer search with comprehensive filters
- Fitness journey tracking
- Booking system
- Social features
- Progress analytics

#### Trainer Experience:
- Professional CRM dashboard
- Client management system
- Revenue analytics
- Business insights
- Trainer-specific features

### To Remove Bypass (Production Mode):
Simply access the app without the URL parameters to use the full verification flow.

### Note:
This bypass is for development purposes only and should be removed before production deployment.