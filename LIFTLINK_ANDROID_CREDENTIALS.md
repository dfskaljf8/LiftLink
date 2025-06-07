# LiftLink Android Package and Certificate Information

## 📱 **Package Name:**
```
com.liftlink.app
```

## 🔑 **Debug Certificate Information:**
- **Keystore File**: `/app/liftlink-debug.keystore`
- **Alias**: `liftlink`
- **Store Password**: `android`
- **Key Password**: `android`
- **SHA-1 Fingerprint**: `F4:9E:00:F6:44:A9:DB:3B:61:92:FD:4F:31:B0:5E:4E:D5:D4:B0:F5`
- **SHA-256 Fingerprint**: `D9:44:FD:F6:14:7F:17:44:7B:19:50:BB:34:D1:D1:97:FC:00:7F:2C:FB:8F:CC:58:78:A8:A6:8F:A4:39:46:B1`

## 🚀 **Production Certificate Information:**
- **Keystore File**: `/app/liftlink-release.keystore`
- **Alias**: `liftlink`
- **Store Password**: `liftlink2024`
- **Key Password**: `liftlink2024`
- **SHA-1 Fingerprint**: `C1:E8:E4:6A:4F:0A:88:F9:20:2A:06:F7:76:A9:50:FF:92:3A:F3:3E`
- **SHA-256 Fingerprint**: `90:EC:47:3A:A7:EE:86:20:1D:42:04:A2:D6:5D:5C:E9:75:25:B2:A5:7B:45:9B:CB:78:A4:5D:1C:15:94:7F:43`

---

## 🔧 **How to Use These for Health Integrations:**

### **1. Google Fit API Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing: "LiftLink"
3. Enable Google Fit API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Select "Android" as application type
6. **Package Name**: `com.liftlink.app`
7. **SHA-1 Certificate Fingerprint** (Debug): `F4:9E:00:F6:44:A9:DB:3B:61:92:FD:4F:31:B0:5E:4E:D5:D4:B0:F5`
8. **SHA-1 Certificate Fingerprint** (Production): `C1:E8:E4:6A:4F:0A:88:F9:20:2A:06:F7:76:A9:50:FF:92:3A:F3:3E`

### **2. Fitbit API Setup:**
1. Go to [Fitbit Developer Console](https://dev.fitbit.com/apps)
2. Create new application
3. **Application Name**: "LiftLink"
4. **Application Website**: "https://liftlink.app"
5. **Organization**: "LiftLink"
6. **Application Type**: "Personal"
7. **Callback URL**: `https://your-domain.com/auth/fitbit/callback`

### **3. Garmin Connect API Setup:**
1. Go to [Garmin Developer Portal](https://developer.garmin.com/)
2. Create developer account
3. Register new application
4. **App Name**: "LiftLink"
5. **Package ID**: `com.liftlink.app`

### **4. Apple HealthKit Setup:**
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create iOS App ID: `com.liftlink.app`
3. Enable HealthKit capability
4. Generate certificates for iOS development

---

## 📋 **Environment Variables to Add:**

Add these to your `/app/backend/.env` file:

```bash
# Google Fit API
GOOGLE_FIT_CLIENT_ID=your_google_client_id_here
GOOGLE_FIT_CLIENT_SECRET=your_google_client_secret_here

# Fitbit API
FITBIT_CLIENT_ID=your_fitbit_client_id_here
FITBIT_CLIENT_SECRET=your_fitbit_client_secret_here

# Garmin Connect API
GARMIN_API_KEY=your_garmin_api_key_here
GARMIN_API_SECRET=your_garmin_api_secret_here

# Package Information
ANDROID_PACKAGE_NAME=com.liftlink.app
ANDROID_DEBUG_SHA1=F4:9E:00:F6:44:A9:DB:3B:61:92:FD:4F:31:B0:5E:4E:D5:D4:B0:F5
ANDROID_RELEASE_SHA1=C1:E8:E4:6A:4F:0A:88:F9:20:2A:06:F7:76:A9:50:FF:92:3A:F3:3E
```

---

## 🔐 **Keystore Commands for Reference:**

### **List Debug Keystore:**
```bash
keytool -keystore /app/liftlink-debug.keystore -list -v -alias liftlink -storepass android
```

### **List Production Keystore:**
```bash
keytool -keystore /app/liftlink-release.keystore -list -v -alias liftlink -storepass liftlink2024
```

### **Extract SHA-1 Only:**
```bash
# Debug
keytool -keystore /app/liftlink-debug.keystore -list -v -alias liftlink -storepass android | grep SHA1

# Production
keytool -keystore /app/liftlink-release.keystore -list -v -alias liftlink -storepass liftlink2024 | grep SHA1
```

---

## 🛡️ **Security Notes:**

1. **Debug Keystore**: Use only for development and testing
2. **Production Keystore**: Use for app store releases
3. **Keep Production Keystore Secure**: Store in secure location with backups
4. **Never Share Private Keys**: Only share SHA-1 fingerprints, never the actual keystore files

---

## 🚀 **Next Steps:**

1. **Set up Google Fit API** using the SHA-1 fingerprints above
2. **Configure other health APIs** with the package name
3. **Update backend environment variables** with obtained API keys
4. **Test health integrations** using the HealthIntegrations component
5. **Deploy to production** using the production keystore

Your LiftLink app is now ready for health device integrations! 🎉