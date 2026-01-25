# LiftLink Mobile App

AI-Powered Fitness Coaching Platform built with Expo.

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Expo account (free at expo.dev)

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn start
```

### Development

```bash
# Start Expo dev server
yarn start

# Run on Android emulator (requires Android Studio)
yarn android

# Run on iOS simulator (requires Xcode, macOS only)
yarn ios
```

## Building for Production

### Using EAS Build (Recommended)

1. **Login to Expo:**
```bash
eas login
```

2. **Configure your project (first time only):**
```bash
eas build:configure
```

3. **Build for development (emulator/device testing):**
```bash
# Android APK for emulators
yarn build:dev:android

# iOS simulator build
yarn build:dev:ios
```

4. **Build for preview (internal testing):**
```bash
yarn build:preview:android
yarn build:preview:ios
```

5. **Build for production (app stores):**
```bash
yarn build:prod:android  # Creates .aab for Play Store
yarn build:prod:ios      # Creates .ipa for App Store
```

### Build Profiles

| Profile | Android | iOS | Use Case |
|---------|---------|-----|----------|
| `development` | APK (debug) | Simulator | Local development |
| `development-device` | APK | Device | Physical device testing |
| `preview` | APK | Device | Internal testing |
| `production` | AAB | IPA | App store submission |

## Project Structure

```
/app/react-native-app/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth flow screens
│   ├── (tabs)/            # Main tab screens
│   ├── _layout.js         # Root layout
│   └── index.js           # Entry point
├── src/
│   ├── components/        # Reusable components
│   ├── context/           # React Context providers
│   ├── services/          # API and utility services
│   └── styles/            # Shared styles
├── assets/                # Images, fonts, etc.
├── app.json               # Expo configuration
├── eas.json               # EAS Build configuration
└── package.json           # Dependencies
```

## Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
EXPO_PUBLIC_API_URL=https://your-api-url.com/api
```

## Native Modules

This app uses several native modules that require development builds:
- `@stripe/stripe-react-native` - Payments
- `react-native-maps` - Maps
- `expo-notifications` - Push notifications
- `expo-location` - Location services

## Submitting to App Stores

### Android (Google Play)
```bash
eas submit --platform android
```

### iOS (App Store)
```bash
eas submit --platform ios
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues:**
```bash
yarn start --clear
```

2. **Clean rebuild:**
```bash
rm -rf node_modules
yarn install
yarn start --clear
```

3. **Prebuild issues:**
```bash
yarn prebuild:clean
```

## Support

For issues, please contact the development team or open an issue in the repository.
