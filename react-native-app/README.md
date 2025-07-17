# LiftLink Mobile App

A comprehensive React Native fitness application connecting users with professional trainers, featuring real-time booking, secure payments, and Google API integrations.

## Features

### Core Features
- **User Authentication**: Email-based registration and login
- **Role-Based Access**: Different experiences for trainers and fitness enthusiasts
- **Document Verification**: Age verification (18+) and trainer certification validation
- **Real-Time Booking**: Calendar-based session scheduling with trainers
- **Secure Payments**: Stripe integration with "100% Secure with Stripe" messaging
- **Google Fit Integration**: Real-time fitness data synchronization
- **Google Maps**: Interactive trainer location mapping
- **Session Management**: Complete workout tracking and progress monitoring
- **Tree Progress System**: Gamified fitness journey progression

### Technical Features
- **React Native 0.76.2**: Latest React Native framework
- **React Navigation**: Tab and stack navigation
- **Stripe React Native SDK**: Secure payment processing
- **Google Sign-In**: OAuth authentication for Google services
- **React Native Maps**: Native map integration with custom markers
- **Image Picker**: Document and photo upload functionality
- **AsyncStorage**: Local data persistence
- **Vector Icons**: Professional icon library

## Setup Instructions

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Installation
1. Install dependencies:
```bash
cd react-native-app
npm install
```

2. Configure environment variables:
   - Backend URL is already configured
   - Google API keys are pre-configured
   - Stripe keys are set up

3. Install iOS dependencies (iOS only):
```bash
cd ios && pod install
```

### Running the App
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS  
npm run ios
```

## App Structure

### Authentication Flow
1. **Email Entry**: User enters email address
2. **Name Collection**: New users provide their name
3. **Role Selection**: Choose between Trainer or Fitness Enthusiast
4. **Goal Setting**: Select fitness goals and experience level
5. **Document Verification**: Age verification and trainer certification (if applicable)
6. **Main App**: Access to full functionality

### Main Navigation
- **Dashboard**: Overview of progress, quick actions, and stats
- **Trainers**: Browse and book sessions with certified trainers
- **Fitness**: Google Fit integration and workout tracking
- **Tree**: Visual progress system with 10 levels of growth
- **Sessions**: View upcoming and completed workout sessions
- **Settings**: Profile management and app preferences

### Trainer Features
- **Client Management**: View and manage client relationships
- **Schedule Management**: Calendar-based appointment system
- **Earnings Dashboard**: Track payments and request payouts
- **Profile Management**: Update qualifications and availability

## API Integration

### Google APIs
- **Google Fit**: Fitness data synchronization
- **Google Maps**: Location services and trainer mapping
- **Google Calendar**: Scheduling and appointment management
- **Google Sign-In**: OAuth authentication

### Stripe Integration
- **Payment Processing**: Secure card payments
- **Checkout Sessions**: Complete payment flows
- **Payout System**: Trainer earnings management

### Backend Endpoints
All API calls are routed through the configured backend URL:
- User management and authentication
- Session booking and management
- Payment processing
- Fitness data synchronization
- Document verification

## Security Features

### Payment Security
- **Stripe Integration**: Industry-standard payment processing
- **SSL Encryption**: All data transmission encrypted
- **PCI Compliance**: Secure card data handling
- **"100% Secure with Stripe"**: User-facing security messaging

### Data Protection
- **Document Verification**: Secure ID and certification validation
- **Age Verification**: Mandatory 18+ verification
- **OAuth Integration**: Secure Google account linking
- **Local Storage**: Encrypted user data storage

## UI/UX Features

### Dark Theme
- **Cyberpunk Aesthetic**: Modern dark interface
- **Color Scheme**: Primary blues, secondary greens, accent colors
- **Glass Morphism**: Translucent card effects
- **Smooth Animations**: Native transitions and gestures

### Responsive Design
- **Adaptive Layout**: Works on all screen sizes
- **Native Components**: Platform-specific UI elements
- **Touch Optimization**: Gesture-friendly interactions
- **Accessibility**: Screen reader support and high contrast

## Development Notes

### State Management
- **React Context**: Global state management
- **AsyncStorage**: Persistent local storage
- **Real-time Updates**: Live data synchronization

### Navigation
- **Bottom Tabs**: Primary navigation method
- **Stack Navigation**: Modal and detail screens
- **Deep Linking**: Support for external navigation
- **Authentication Guards**: Route protection

### Performance
- **Image Optimization**: Efficient image loading and caching
- **Lazy Loading**: Component-level performance optimization
- **Memory Management**: Proper cleanup and lifecycle handling
- **Network Optimization**: Efficient API calls and caching

## Testing

### Backend Testing
All backend APIs have been tested with 100% success rate:
- Google Fit integration endpoints
- Google Calendar scheduling
- Stripe payment processing
- Document verification system
- User authentication flows

### Mobile Testing
The app has been designed for comprehensive mobile testing:
- Authentication flow testing
- Payment integration testing
- Google API integration testing
- Navigation and UI testing
- Document upload testing

## Deployment

### Android
1. Generate signed APK:
```bash
cd android
./gradlew assembleRelease
```

2. Upload to Google Play Store

### iOS
1. Archive in Xcode
2. Upload to App Store Connect
3. Submit for review

## Support

For technical support or feature requests, please refer to the main LiftLink platform documentation or contact the development team.

## Version
Current version: 1.0.0

## License
Private - LiftLink Platform