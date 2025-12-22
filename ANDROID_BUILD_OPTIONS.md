# LiftLink Android Build Options

## Recommended Build Services for React Native

Ionic Appflow is designed for Ionic/Capacitor apps. For React Native CLI projects, use:

### Option 1: GitHub Actions (Recommended - FREE)

Already configured in `.github/workflows/android-build.yml`

**How to use:**
1. Push code to GitHub
2. Go to **Actions** tab
3. Select **Build Android APK**
4. Click **Run workflow**
5. Choose `debug` or `release`
6. Download APK from **Artifacts**

---

### Option 2: EAS Build (Expo)

Requires adding Expo to your project.

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Initialize (adds expo config)
eas init

# Build
eas build --platform android --profile preview
```

---

### Option 3: Codemagic (Free tier available)

1. Sign up at https://codemagic.io
2. Connect your GitHub repo
3. Select "React Native App"
4. Configure build settings
5. Start build

**codemagic.yaml** (place in repo root):
```yaml
workflows:
  react-native-android:
    name: Android Build
    max_build_duration: 60
    environment:
      java: 17
      node: 18
    scripts:
      - name: Install dependencies
        script: |
          cd react-native-app
          yarn install
      - name: Build Android
        script: |
          cd react-native-app/android
          ./gradlew assembleRelease
    artifacts:
      - react-native-app/android/app/build/outputs/**/*.apk
```

---

### Option 4: Bitrise (Free tier available)

1. Sign up at https://bitrise.io
2. Add your app
3. Select "React Native" project type
4. Use default React Native workflow

---

### Option 5: Local Build

```bash
cd react-native-app

# Install dependencies
yarn install

# Create JS bundle
mkdir -p android/app/src/main/assets
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Build APK
cd android
./gradlew assembleDebug
# or for release:
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Why Ionic Appflow Doesn't Work

Ionic Appflow expects:
- Ionic Framework structure
- Capacitor or Cordova plugins
- `ionic.config.json` with Capacitor integration

LiftLink is a **React Native CLI** project, which has a different structure.
