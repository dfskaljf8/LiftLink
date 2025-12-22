# LiftLink Android APK Build Guide

## Prerequisites Installed
- ✅ Java 17 (OpenJDK 17)
- ✅ Android SDK (API 34, Build Tools 34.0.0)
- ✅ Gradle Wrapper 8.3

## Environment Variables
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-arm64
export ANDROID_HOME=/opt/android-sdk
export ANDROID_SDK_ROOT=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
```

## Build Commands

### Debug APK (for testing)
```bash
cd /app/react-native-app/android
./gradlew assembleDebug
```
Output: `app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for production)
First, create a signing keystore:
```bash
keytool -genkey -v -keystore liftlink-release-key.keystore -alias liftlink-key -keyalg RSA -keysize 2048 -validity 10000
```

Add signing config to `gradle.properties`:
```properties
LIFTLINK_UPLOAD_STORE_FILE=liftlink-release-key.keystore
LIFTLINK_UPLOAD_STORE_PASSWORD=your-password
LIFTLINK_UPLOAD_KEY_ALIAS=liftlink-key
LIFTLINK_UPLOAD_KEY_PASSWORD=your-password
```

Build release:
```bash
./gradlew assembleRelease
```
Output: `app/build/outputs/apk/release/app-release.apk`

### Android App Bundle (recommended for Play Store)
```bash
./gradlew bundleRelease
```
Output: `app/build/outputs/bundle/release/app-release.aab`

## Security Features Enabled

### 1. Root/Jailbreak Detection
- Library: `jail-monkey` (Native)
- File: `src/services/DeviceSecurityManager.js`
- Features:
  - Root detection on Android
  - Jailbreak detection on iOS
  - ADB debugging detection
  - Mock location detection
  - Debug mode detection

### 2. Certificate Pinning
- Library: `react-native-ssl-pinning` (Native)
- File: `src/services/CertificatePinningService.js`
- Config: `android/app/src/main/res/xml/network_security_config.xml`
- Features:
  - HTTPS-only connections
  - Certificate pin verification
  - SSL violation reporting
  - Automatic fallback for pinned domains

### 3. Code Obfuscation
- Tool: ProGuard/R8
- Config: `android/app/proguard-rules.pro`
- Features:
  - Class name obfuscation
  - Method name obfuscation
  - String encryption
  - Log statement removal
  - Code optimization

### 4. Network Security
- Config: `android/app/src/main/res/xml/network_security_config.xml`
- Features:
  - Cleartext traffic disabled
  - Domain-specific trust anchors
  - Debug override for development

## APK Size Optimization
The build is configured to:
- Split APKs by CPU architecture
- Enable shrinkResources
- Enable minification with ProGuard

## Testing the APK
1. Install on device: `adb install app-debug.apk`
2. Or download to your computer and install manually

## EAS Build Alternative (Cloud)
If local build fails due to resources, use EAS Build:

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure build:
```bash
eas build:configure
```

4. Build APK:
```bash
eas build --platform android --profile preview
```

## Ionic Appflow Build (Recommended Cloud Service)
Ionic Appflow provides automated cloud builds without requiring local Android SDK setup.

### Setup Steps:

1. **Create Ionic Appflow Account**
   - Go to https://ionic.io/appflow
   - Sign up for a free account
   - Create a new app in the dashboard

2. **Install Ionic CLI**
   ```bash
   npm install -g @ionic/cli
   ```

3. **Connect Your Repository**
   - In Appflow dashboard, go to "Apps" > Your App > "Git"
   - Connect your GitHub/GitLab/Bitbucket repository
   - Or push code directly using Ionic CLI

4. **Configure Build**
   - Go to "Build" > "Native Builds"
   - Select "Android" platform
   - Choose build type: "Debug APK" or "Release APK"
   - For release builds, upload your signing keystore

5. **Trigger Build**
   - Click "Start Build"
   - Select the branch/commit to build
   - Wait for build completion (typically 10-15 minutes)

6. **Download APK**
   - Once complete, download APK from the build artifacts
   - For Play Store: Build AAB format instead

### Appflow Configuration File
Create `ionic.config.json` in project root if not exists:
```json
{
  "name": "LiftLink",
  "integrations": {
    "capacitor": {}
  },
  "type": "react"
}
```

### Build Types Available:
- **Debug APK**: For testing, no signing required
- **Release APK**: Signed, for distribution outside Play Store
- **App Bundle (AAB)**: Required for Google Play Store submission

### Pricing:
- **Free tier**: Limited builds per month
- **Starter ($29/mo)**: More builds, basic features
- **Growth ($79/mo)**: Unlimited builds, CI/CD automation

### Alternative: Use GitHub Actions
See `.github/workflows/android-build.yml` for automated builds on push.

## Troubleshooting

### Out of Memory
Add to `gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
```

### SDK Not Found
Run: `source /etc/profile.d/android.sh`

### Native Module Issues
Run:
```bash
cd /app/react-native-app
yarn install
cd android
./gradlew clean
```
