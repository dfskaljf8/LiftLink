# Google API Setup Guide - LiftLink

## 🚨 IMPORTANT: Google Cloud Console Configuration Required

The provided API keys need to be properly configured in Google Cloud Console to work. Here's the complete setup:

## Google API Keys Provided:
- **Google Fit**: `AIzaSyCrwPFj7ndxmDBgVZ87KJQ5kEUf0i8BV8k`
- **Google Calendar**: `AIzaSyDUnJlPih9aJt-5wddx-aXAXGNzLd-5fF8`
- **Google Wallet**: `AIzaSyBczq38awE4_zNta461Augpo4M7OKHMaGA`

## Client IDs:
- **iOS**: `464466068216-e1qq893h44vejoau0vddk93ev2tih0f3.apps.googleusercontent.com`
- **Android**: `464466068216-4sfg6htsflfler6ri9f9hqbsvgl7n7ij.apps.googleusercontent.com`

## Required Google Cloud Console Setup:

### 1. Enable APIs
Visit [Google Cloud Console](https://console.cloud.google.com/) and enable:
- Google Fitness API
- Google Calendar API  
- Google Pay API
- Google Wallet API

### 2. Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Configure app information:
   - App name: "LiftLink"
   - User support email: your email
   - Developer contact: your email
3. Add scopes:
   - `https://www.googleapis.com/auth/fitness.activity.read`
   - `https://www.googleapis.com/auth/fitness.body.read`
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`

### 3. Configure Credentials
1. Go to "APIs & Services" > "Credentials"
2. Verify OAuth 2.0 Client IDs exist for:
   - iOS: `464466068216-e1qq893h44vejoau0vddk93ev2tih0f3.apps.googleusercontent.com`
   - Android: `464466068216-4sfg6htsflfler6ri9f9hqbsvgl7n7ij.apps.googleusercontent.com`
3. Add authorized redirect URIs:
   - `https://523da7e0-8e2a-470e-93ce-84d37811eda4.preview.emergentagent.com/api/google-fit/callback`
   - `https://523da7e0-8e2a-470e-93ce-84d37811eda4.preview.emergentagent.com/api/google-calendar/callback`

### 4. Enable Billing
Some Google APIs require billing to be enabled:
1. Go to "Billing" in Google Cloud Console
2. Set up billing account
3. Link to your project

## Current Status:
- ✅ API keys stored in environment variables
- ✅ Backend configured with fallback to mock mode
- ⚠️ Google Cloud Console setup required for full functionality
- ✅ Mock mode working for testing

## Testing:
Until Google Cloud Console is configured, the APIs will work in mock mode:
- Google Fit: Returns mock fitness data
- Google Calendar: Returns mock calendar events
- Google Wallet: Returns mock payment sessions

## Next Steps:
1. Complete Google Cloud Console configuration
2. Test APIs with real authentication
3. Deploy to production with verified APIs

## Troubleshooting 403 Errors:
403 errors indicate:
- API not enabled in Google Cloud Console
- OAuth consent screen not configured
- Missing scopes or permissions
- Billing not enabled
- Invalid redirect URIs

## Contact:
For Google Cloud Console setup assistance, contact your Google Cloud administrator or follow the official Google API documentation.