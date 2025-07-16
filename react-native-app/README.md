# LiftLink Mobile App

A React Native fitness platform connecting users with professional trainers, featuring real-time payments, Google API integrations, and comprehensive session management.

## Features

- **Authentication & Verification**: Age and certification verification system
- **Payment Integration**: Real Stripe and Google Pay integration
- **Google APIs**: Google Fit, Google Calendar, and Google Wallet integration
- **Trainer Management**: Complete CRM for trainers with client management
- **Session Management**: Book, manage, and track training sessions
- **Real-time Updates**: Live progress tracking and notifications

## API Keys Configuration

The app uses the following real API keys:

### Google APIs
- **Google Fit**: `AIzaSyCrwPFj7ndxmDBgVZ87KJQ5kEUf0i8BV8k`
- **Google Calendar**: `AIzaSyDUnJlPih9aJt-5wddx-aXAXGNzLd-5fF8`
- **Google Wallet**: `AIzaSyBczq38awE4_zNta461Augpo4M7OKHMaGA`

### OAuth Client IDs
- **iOS**: `464466068216-e1qq893h44vejoau0vddk93ev2tih0f3.apps.googleusercontent.com`
- **Android**: `464466068216-4sfg6htsflfler6ri9f9hqbsvgl7n7ij.apps.googleusercontent.com`

### Stripe Integration
- **Publishable Key**: `pk_test_51RQ9buQiOMU12jO7dt2573L4ItnHZCDwgjX7WgfTvL0bKMbX9VD0yFrHBTxmuT3mT71wLj3wPU1QES4jehdjGye000kNGBibLs`
- **Secret Key**: `sk_test_51RQ9buQiOMU12jO7HXiKr2NMWRI3w7KxoMzTU1oamj8wdfzD0yNDoyawZiHYdg13DjUcLJ8vrPQM3qfaE0iNP9XI005mK407Jj`

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- React Native CLI: `npm install -g @react-native-community/cli`
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone and Setup**
   ```bash
   cd react-native-app
   yarn install
   ```

2. **iOS Setup**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Android Setup**
   - Open `android/` folder in Android Studio
   - Sync project with Gradle files
   - Ensure Android SDK is properly configured

### Running the App

#### iOS
```bash
yarn ios
```

#### Android
```bash
yarn android
```

### Backend Configuration

The app connects to the backend at:
`https://d660cf88-6e41-4268-ab24-1f6ce76bcb10.preview.emergentagent.com`

All API keys are pre-configured in the backend environment.

## App Structure

```
react-native-app/
├── App.js                 # Main app component
├── src/
│   └── components/
│       ├── DocumentVerification.js   # ID/Cert verification
│       ├── PaymentScreen.js          # Stripe/Google Pay integration
│       └── TrainerDashboard.js       # Trainer CRM features
├── package.json
├── babel.config.js
├── app.json
└── index.js
```

## Key Features

### Authentication Flow
1. Email input and user check
2. Registration with role selection
3. Document verification (ID + certification for trainers)
4. Main app access

### Payment Integration
- **Stripe**: Full checkout integration with real payment processing
- **Google Pay**: Google Wallet API integration
- **Security**: End-to-end encryption and secure payment handling

### Google API Integration
- **Google Fit**: Real fitness data synchronization
- **Google Calendar**: Trainer scheduling and appointment management
- **Google Wallet**: Payment processing integration

### Trainer Features
- Client management with detailed profiles
- Schedule management with Google Calendar sync
- Earnings tracking with real Stripe integration
- Payout processing

## Development

### Adding New Features
1. Create components in `src/components/`
2. Add navigation in `App.js`
3. Configure any required native modules
4. Test on both iOS and Android

### API Integration
All API calls use axios and connect to the FastAPI backend. The backend handles:
- User authentication and verification
- Payment processing with Stripe
- Google API integrations
- Session management

### Testing
- Use iOS Simulator for iOS testing
- Use Android Emulator for Android testing
- Test payments with Stripe test cards
- Verify Google API integrations

## Deployment

### iOS App Store
1. Configure signing in Xcode
2. Add app icons and launch screens
3. Build for release
4. Upload to App Store Connect

### Google Play Store
1. Generate signed APK
2. Configure app signing
3. Upload to Google Play Console
4. Submit for review

## Support

For issues or questions:
- Check the backend logs for API issues
- Verify all API keys are correctly configured
- Test on physical devices for best results
- Ensure all native dependencies are properly linked

## License

Private - LiftLink Fitness Platform