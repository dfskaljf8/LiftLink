# LiftLink CI/CD Build Guide

## Quick Start

### GitHub Actions

The workflow is automatically configured in `.github/workflows/android-build.yml`.

#### Automatic Builds
- **Debug APK**: Built automatically on push to `main` or `develop`
- **Release APK**: Triggered manually via GitHub Actions UI

#### Manual Build Steps
1. Go to **Actions** tab in your GitHub repository
2. Select **Android Build** workflow
3. Click **Run workflow**
4. Choose build type: `debug` or `release`
5. Click **Run workflow**
6. Download APK from **Artifacts** section after build completes

---

### GitLab CI/CD

The pipeline is configured in `.gitlab-ci.yml`.

#### Pipeline Stages
1. **install**: Install Node.js dependencies
2. **build**: Build APK/AAB
3. **deploy**: (Optional) Deploy to Play Store

#### Manual Build
1. Go to **CI/CD > Pipelines**
2. Click **Run pipeline**
3. For release builds, manually trigger the `build_release` job

---

## Setting Up Signed Builds

### Step 1: Generate Keystore

```bash
keytool -genkey -v \
  -keystore liftlink-release.keystore \
  -alias liftlink \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### Step 2: Encode Keystore for CI/CD

```bash
base64 -i liftlink-release.keystore -o keystore-base64.txt
```

### Step 3: Add Secrets

#### GitHub Secrets
Go to **Settings > Secrets and variables > Actions** and add:
- `KEYSTORE_BASE64`: Content of keystore-base64.txt
- `KEYSTORE_PASSWORD`: Your keystore password
- `KEY_ALIAS`: `liftlink` (or your alias)
- `KEY_PASSWORD`: Your key password

#### GitLab CI/CD Variables
Go to **Settings > CI/CD > Variables** and add:
- `KEYSTORE_BASE64`: Content of keystore-base64.txt (masked)
- `KEYSTORE_PASSWORD`: Your keystore password (masked)
- `KEY_ALIAS`: `liftlink` (or your alias)
- `KEY_PASSWORD`: Your key password (masked)

---

## Build Outputs

| Build Type | Output Path | Use Case |
|------------|-------------|----------|
| Debug APK | `app/build/outputs/apk/debug/app-debug.apk` | Testing |
| Release APK | `app/build/outputs/apk/release/app-release.apk` | Distribution |
| App Bundle | `app/build/outputs/bundle/release/app-release.aab` | Play Store |

---

## Troubleshooting

### Build fails with "SDK not found"
```yaml
# Add to your workflow:
- name: Setup Android SDK
  uses: android-actions/setup-android@v3
```

### Out of memory error
Add to `react-native-app/android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### Signing issues
- Verify keystore file is correctly base64 encoded
- Check that all secrets match your keystore configuration
- Ensure key alias matches the one used when creating keystore

### Dependencies not found
Make sure the install step runs before build:
```yaml
dependencies:
  - install_dependencies
```

---

## Local Testing

Test the build locally before pushing:

```bash
cd react-native-app
yarn install
cd android
./gradlew assembleDebug
```

The APK will be at:
`android/app/build/outputs/apk/debug/app-debug.apk`
