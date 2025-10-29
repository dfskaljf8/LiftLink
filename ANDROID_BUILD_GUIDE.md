# LiftLink Android Build & Deployment Guide

## ✅ JAVA_HOME Issue - RESOLVED!

**Status:** OpenJDK 17 has been successfully installed and configured.
- ✅ Java installed: `openjdk version "17.0.17"`
- ✅ JAVA_HOME set: `/usr/lib/jvm/java-17-openjdk-arm64`
- ✅ Verified working: `java -version` command successful

**Note:** For Android SDK installation and building APK, see options below.

---

## 🚀 Complete Android Build Instructions

### Prerequisites

1. **Java JDK 11 or higher** ✅ COMPLETED
   ```bash
   # Check Java version
   java -version
   # Output: openjdk version "17.0.17" 2025-10-21
   
   # JAVA_HOME is set to:
   # /usr/lib/jvm/java-17-openjdk-arm64
   ```

2. **Android SDK**
   ```bash
   # Install Android Studio which includes Android SDK
   # Or use command-line tools from:
   # https://developer.android.com/studio#command-tools
   ```

3. **Environment Variables**
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

---

## 📦 Build APK (Debug - For Testing)

```bash
cd /app/react-native-app/android

# Clean previous builds
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# Output location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**Install Debug APK on Device:**
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔐 Build APK (Release - For Play Store)

### Step 1: Generate Release Keystore (ONE TIME ONLY)

```bash
cd /app/react-native-app/android/app

keytool -genkeypair -v -storetype PKCS12 \
  -keystore liftlink-release-key.keystore \
  -alias liftlink-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**You will be prompted for:**
- Keystore password (e.g., `LiftLink2024Secure!`)
- Key password (can be same as keystore password)
- Your name
- Organization name (LiftLink)
- Organization unit (Engineering)
- City
- State
- Country code (US)

**⚠️ IMPORTANT:**
- **Backup this keystore file immediately!**
- Store passwords in a secure password manager
- Never commit keystore to version control
- If you lose this, you can't update your app on Play Store

### Step 2: Configure Signing

Create `~/.gradle/gradle.properties` (NOT in project):

```properties
LIFTLINK_UPLOAD_STORE_FILE=/absolute/path/to/liftlink-release-key.keystore
LIFTLINK_UPLOAD_STORE_PASSWORD=your_keystore_password
LIFTLINK_UPLOAD_KEY_ALIAS=liftlink-key-alias
LIFTLINK_UPLOAD_KEY_PASSWORD=your_key_password
```

### Step 3: Build Release APK

```bash
cd /app/react-native-app/android

# Clean build
./gradlew clean

# Build release APK
./gradlew assembleRelease

# Output location:
# android/app/build/outputs/apk/release/app-release.apk
```

### Step 4: Build Release AAB (Recommended for Play Store)

```bash
cd /app/react-native-app/android

# Build Android App Bundle
./gradlew bundleRelease

# Output location:
# android/app/build/outputs/bundle/release/app-release.aab
```

**Why AAB?**
- Smaller download sizes (Google optimizes for each device)
- Required for new apps on Play Store
- Supports Dynamic Delivery

---

## 📱 Test Release Build

```bash
# Install release APK on device
adb install app/build/outputs/apk/release/app-release.apk

# Or use bundletool for AAB testing:
bundletool build-apks --bundle=app-release.aab \
  --output=app.apks \
  --mode=universal

bundletool install-apks --apks=app.apks
```

---

## 🔍 Verify APK/AAB

### Check Signature
```bash
jarsigner -verify -verbose -certs app-release.apk
```

### Check Build Info
```bash
aapt dump badging app-release.apk
```

### Check Size
```bash
ls -lh app-release.apk
ls -lh app-release.aab
```

**Expected Sizes:**
- APK: ~40-60 MB
- AAB: ~30-45 MB

---

## 🎨 Create App Icons & Assets

### App Icon (Required)
- **Size**: 512x512 px
- **Format**: PNG, 32-bit
- **Filename**: `ic_launcher.png`
- **Location**: `android/app/src/main/res/mipmap-xxxhdpi/`

**Generate all densities:**
```bash
# Use Android Studio Image Asset tool or online generator:
# https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
```

**Required densities:**
- mdpi: 48x48
- hdpi: 72x72
- xhdpi: 96x96
- xxhdpi: 144x144
- xxxhdpi: 192x192

### Splash Screen
- Update `android/app/src/main/res/drawable/launch_screen.xml`
- Use LiftLink branding with lime green

---

## 📊 Play Store Submission

### 1. Create Play Console Account
- Visit: https://play.google.com/console
- Pay one-time $25 registration fee
- Verify identity

### 2. Create New App
- App name: LiftLink
- Default language: English (US)
- App or game: App
- Free or paid: Free

### 3. Upload AAB
- Go to: Release → Production → Create new release
- Upload: `app-release.aab`
- Add release notes

### 4. Complete Store Listing
Use information from `/app/PLAY_STORE_LISTING.md`:
- App name
- Short description
- Full description
- Screenshots (minimum 2)
- Feature graphic
- App icon

### 5. Set Content Rating
- Complete questionnaire
- Expected rating: PEGI 3, ESRB: Everyone

### 6. Set Target Audience
- Target age: 16+
- Primary category: Health & Fitness

### 7. Privacy Policy
- Host at: https://liftlink.app/privacy-policy
- Use content from `/app/DATA_COLLECTION_AUDIT.md`

### 8. Permissions Declaration
- Location: For finding nearby trainers
- Camera: For profile pictures and verification
- Storage: For saving workout data

### 9. Submit for Review
- Review time: 3-7 business days
- Monitor status in Play Console

---

## 🧪 Pre-Submission Testing Checklist

### Functional Testing
- [ ] App launches without crashes
- [ ] User registration works
- [ ] Login works with JWT
- [ ] Trainer map displays correctly
- [ ] Location permissions work
- [ ] Payment flow completes
- [ ] Workout tracking saves data
- [ ] Theme switching works (light/dark)
- [ ] Notifications deliver
- [ ] Profile updates save
- [ ] Friend requests work
- [ ] Settings screen functional

### Security Testing
- [ ] Data encryption verified
- [ ] HTTPS connections only
- [ ] No sensitive data in logs
- [ ] Keystore properly secured
- [ ] ProGuard enabled
- [ ] No hardcoded secrets

### Performance Testing
- [ ] App size under 100MB
- [ ] Fast startup (under 3 seconds)
- [ ] Smooth scrolling
- [ ] No memory leaks
- [ ] Works on Android 5.0+ (API 21)

### Device Testing
Test on:
- [ ] Low-end device (1GB RAM)
- [ ] Mid-range device (3GB RAM)
- [ ] High-end device (6GB+ RAM)
- [ ] Tablet (if supporting tablets)
- [ ] Different Android versions (21, 23, 28, 31, 34)

### Network Testing
- [ ] Works on WiFi
- [ ] Works on 4G/5G
- [ ] Handles offline mode gracefully
- [ ] Retry logic for failed requests

---

## 📈 Post-Launch Monitoring

### Crash Reporting
- Integrate Firebase Crashlytics
- Monitor crash-free users metric
- Target: 99%+ crash-free

### Performance Monitoring
- App start time
- Screen load times
- API response times
- Memory usage

### User Feedback
- Monitor Play Store reviews
- Respond to user issues
- Track feature requests

### Analytics
- Active users (DAU/MAU)
- Session duration
- Feature usage
- Conversion rates

---

## 🔄 Update Process

### For Bug Fixes
1. Increment versionCode (1 → 2)
2. Update versionName (1.0.0 → 1.0.1)
3. Build new AAB
4. Upload to Play Console
5. Add release notes
6. Submit

### For Features
1. Increment minor version (1.0.0 → 1.1.0)
2. Test thoroughly
3. Create AAB
4. Use staged rollout (10% → 50% → 100%)

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Clear gradle cache
./gradlew clean --no-daemon

# Delete build folders
rm -rf android/app/build
rm -rf android/build

# Rebuild
./gradlew assembleRelease
```

### Signing Errors
- Verify keystore path in gradle.properties
- Check passwords are correct
- Ensure keystore file exists

### ProGuard Issues
- Check `proguard-rules.pro`
- Add keep rules for React Native classes
- Test release build thoroughly

### Size Too Large
- Enable APK splitting
- Remove unused resources
- Optimize images
- Use WebP format

---

## 📚 Additional Resources

**Official Docs:**
- [React Native](https://reactnative.dev/docs/signed-apk-android)
- [Android Developers](https://developer.android.com/studio/publish)
- [Play Console Help](https://support.google.com/googleplay/android-developer)

**Tools:**
- [APK Analyzer](https://developer.android.com/studio/build/apk-analyzer)
- [Bundle Tool](https://developer.android.com/studio/command-line/bundletool)
- [Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)

---

## ✅ Quick Build Commands

```bash
# Debug APK (for testing)
cd android && ./gradlew assembleDebug

# Release APK (for sideloading)
cd android && ./gradlew assembleRelease

# Release AAB (for Play Store) - RECOMMENDED
cd android && ./gradlew bundleRelease

# Install on device
adb install app/build/outputs/apk/release/app-release.apk

# View build size
ls -lh app/build/outputs/bundle/release/app-release.aab
```

---

**Need Help?**
- Check logs: `adb logcat | grep LiftLink`
- Build issues: Clean and rebuild
- Signing issues: Verify keystore configuration
- Play Store rejection: Read rejection email carefully

**Good luck with your launch! 🚀**
