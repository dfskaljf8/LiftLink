# Ionic Appflow APK Build Guide for LiftLink

## Quick Start

### 1. Create Ionic Appflow Account
1. Go to https://ionic.io/appflow
2. Sign up for free account
3. Create new app in dashboard

### 2. Install Ionic CLI
```bash
npm install -g @ionic/cli
ionic login
```

### 3. Connect Repository
In Appflow Dashboard:
- Navigate to "Apps" > "LiftLink" > "Git"
- Connect GitHub/GitLab repository
- Or use Ionic CLI: `ionic link`

### 4. Build Configuration

#### For Debug APK (Testing)
1. Go to "Build" > "Native Builds"
2. Select "Android"
3. Choose "Debug APK"
4. Click "Start Build"

#### For Release APK (Distribution)
1. Create signing keystore:
```bash
keytool -genkey -v -keystore liftlink-release.keystore -alias liftlink -keyalg RSA -keysize 2048 -validity 10000
```

2. Upload keystore in Appflow:
   - "Build" > "Certificates"
   - "Add Certificate" > Android
   - Upload .keystore file

3. Build Release APK with signing certificate

### 5. Download & Test
- Download APK from build artifacts
- Install on Android device: `adb install liftlink.apk`

## Alternative: GitHub Actions

Create `.github/workflows/android-build.yml`:

```yaml
name: Android Build
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '17'
          
      - name: Install dependencies
        run: |
          cd react-native-app
          yarn install
          
      - name: Build Android APK
        run: |
          cd react-native-app/android
          ./gradlew assembleRelease
          
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release.apk
          path: react-native-app/android/app/build/outputs/apk/release/
```

## Build Types

| Type | Use Case | Signing |
|------|----------|--------|
| Debug APK | Testing | Auto |
| Release APK | Distribution | Required |
| App Bundle (AAB) | Play Store | Required |

## Pricing

- **Free**: 1 build/month
- **Starter ($29/mo)**: 20 builds
- **Growth ($79/mo)**: Unlimited builds

## Troubleshooting

### Build fails with memory error
Increase Gradle heap in `android/gradle.properties`:
```
org.gradle.jvmargs=-Xmx4096m
```

### Signing issues
Verify keystore password and alias match configuration.

### Dependencies not found
Run `yarn install` before building.
