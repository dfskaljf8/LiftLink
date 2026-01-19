# LiftLink - AI Autopilot for Modern Coaches

## Overview
LiftLink is an AI-native agentic platform for fitness coaches, competing with apps like Everfit. The AI acts as the core of the app, assisting trainers with suggestions for approval rather than being a simple feature.

## Core Features

### AI Architecture (Implemented ✅)
- **AI Agent Engine** (`ai_agent_engine.py`) - Core agentic AI system
- **Gen-Z Personality** - Witty, results-obsessed AI persona across all interactions
- **Human-in-the-Loop** - AI generates suggestions, trainers approve
- **GPT-5 Integration** - Via Emergent LLM Key

### Security Layer (Implemented ✅)
- API rate limiting
- JWT hardening
- Input sanitization
- Prompt injection protection
- Idempotency keys for payments
- Session management
- File upload validation
- HSTS headers

### Mobile App Features (Implemented ✅)
- AI Onboarding (`AIOnboardingScreen.js`)
- AI Command Center (`AICommandCenter.js`)
- Cash Flow Dashboard (`CashFlowDashboard.js`)
- Maps Integration (`TrainerMapView.js`)
- Privacy & Terms screens

### Expo/EAS Build System (Implemented ✅ - Dec 2025)
- **EAS Project ID:** `d0caa059-83cd-42b2-8dea-2e803fd46d7d`
- App icons generated and configured
- `app.json` configured for iOS & Android
- `eas.json` with development, preview, production profiles
- `metro.config.js` updated for Expo compatibility

## Tech Stack
- **Backend:** FastAPI + MongoDB Atlas
- **Frontend:** React Native 0.76.2 + Expo SDK 52
- **AI:** GPT-5 via `emergentintegrations`
- **Build System:** Expo Application Services (EAS)
- **Payments:** Stripe

## Architecture

```
/app/
├── backend/
│   ├── ai_agent_engine.py     # Core AI logic
│   ├── ai_service.py          # GPT-5 integration
│   ├── cashflow_service.py    # Financial tracking
│   ├── security_middleware.py # Security layer
│   └── server.py              # Main API server
└── react-native-app/
    ├── assets/                # App icons & splash
    ├── src/screens/           # All screen components
    ├── app.json               # Expo config
    ├── eas.json               # EAS build profiles
    └── metro.config.js        # Metro bundler config
```

## API Endpoints (Key)
- `GET /api/health` - Health check
- `POST /api/ai-agent/get-suggestions` - AI suggestions
- `POST /api/ai-agent/approve-suggestion` - Approve AI action
- `POST /api/ai/chat` - Conversational AI
- `GET /api/cashflow/dashboard` - Financial data
- `POST /api/payments/create-intent-idem` - Idempotent payments

## 3rd Party Integrations
- GPT-5 (Emergent LLM Key) ✅
- Stripe (Payments) ✅
- MongoDB Atlas ✅
- Google Sign-In ✅
- Google Maps ✅
- Firebase (Push Notifications) - Needs `google-services.json`

## Next Steps (User Action Required)

### For Android Builds:
1. Add `google-services.json` to `/app/react-native-app/`
2. Run: `eas build --platform android --profile preview`

### For iOS Builds:
1. Update `eas.json` with your Apple Developer credentials:
   - `appleId`: Your Apple ID email
   - `ascAppId`: App Store Connect App ID
   - `appleTeamId`: Your Team ID
2. Run: `eas build --platform ios --profile preview`

### For Production Submission:
1. Add `google-play-service-account.json` for Play Store
2. Complete Apple Developer Program enrollment
3. Run: `eas submit --platform android/ios`

## Future Tasks (P2)
- Security audit with OWASP ZAP
- Professional penetration testing (HackerOne)
- Physical device testing of all features

---
*Last Updated: December 2025*
