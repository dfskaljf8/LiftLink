# LiftLink Data Collection & Privacy Audit

**Last Updated**: October 25, 2024
**App Version**: 1.0.0
**Compliance**: GDPR, CCPA, HIPAA-like standards

---

## 🔒 EXECUTIVE SUMMARY

LiftLink is designed with **privacy-first** principles. All sensitive data is encrypted end-to-end, and we collect only the minimum necessary information to provide our fitness services.

**Key Privacy Features**:
- ✅ End-to-End Encryption (AES-256)
- ✅ No data sold to third parties
- ✅ User-controlled data export/deletion
- ✅ Optional analytics (disabled by default)
- ✅ Local-first data storage

---

## 📊 DATA COLLECTION CATEGORIES

### 1. ACCOUNT & AUTHENTICATION DATA

**What We Collect**:
- Email address (for login and account recovery)
- Password (hashed with bcrypt, never stored in plaintext)
- User ID (UUID, generated client-side)
- JWT tokens (for session management)
- Authentication timestamps

**Purpose**:
- User authentication and account security
- Session management
- Account recovery

**Storage**:
- **Backend**: Passwords hashed with bcrypt (10 rounds)
- **Mobile**: JWT tokens encrypted with AES-256 in AsyncStorage
- **Encryption**: Yes (E2E encrypted)
- **Retention**: Until account deletion

**Third-Party Sharing**: None

---

### 2. PROFILE INFORMATION

**What We Collect**:
- Name (optional, user-provided)
- Profile picture (optional, user-uploaded)
- Fitness goals (e.g., "weight loss", "muscle gain")
- Experience level (e.g., "beginner", "intermediate", "advanced")
- Age verification status (boolean, for compliance)
- Role (user or trainer)

**Purpose**:
- Personalize fitness recommendations
- Match users with appropriate trainers
- Display user profile in app

**Storage**:
- **Backend**: MongoDB Atlas (encrypted at rest)
- **Mobile**: Encrypted with user-specific key in AsyncStorage
- **Encryption**: Yes (E2E encrypted)
- **Retention**: Until account deletion

**Third-Party Sharing**: None

---

### 3. FITNESS & HEALTH DATA

**What We Collect**:
- Workout sessions (type, duration, calories)
- Tree progression levels (gamification)
- LiftCoins earned (reward system)
- Workout history
- Session check-ins
- Google Fit data (if user connects - optional)

**Purpose**:
- Track fitness progress
- Provide personalized recommendations
- Gamification and motivation
- Generate analytics for user

**Storage**:
- **Backend**: MongoDB Atlas (encrypted at rest)
- **Mobile**: Encrypted health data in AsyncStorage
- **Encryption**: Yes (AES-256, HIPAA-like protection)
- **Retention**: Until account deletion or user manually deletes

**Third-Party Sharing**:
- Google Fit (only if user explicitly connects)
- No other third parties

**User Controls**:
- ✅ Export all fitness data
- ✅ Delete specific workout sessions
- ✅ Disconnect Google Fit anytime

---

### 4. LOCATION DATA

**What We Collect**:
- GPS coordinates (for trainer map feature)
- City/region (for trainer search)
- IP address (automatically collected by backend)

**Purpose**:
- Show nearby trainers on map
- Match users with local trainers
- Basic analytics (region-level only)

**Storage**:
- **Backend**: Coordinates stored in MongoDB
- **Mobile**: Temporary cache only (cleared on logout)
- **Encryption**: Yes (coordinates encrypted in transit)
- **Retention**: Until account deletion

**Third-Party Sharing**:
- Google Maps API (for map display only)

**User Controls**:
- ✅ Location permission can be revoked anytime
- ✅ Location data not required for core app features
- ✅ Can use app without location services

---

### 5. PAYMENT INFORMATION

**What We Collect**:
- Stripe customer ID
- Payment session IDs
- Transaction amounts
- Payment timestamps
- Trainer Connect account IDs (for trainers)

**Purpose**:
- Process payments for fitness sessions
- Pay trainers via Stripe Connect
- Transaction history

**Storage**:
- **Backend**: Stripe customer IDs only (NOT full card details)
- **Mobile**: Payment session IDs temporarily (encrypted)
- **Encryption**: Yes (AES-256, PCI DSS compliant)
- **Retention**: 7 years (financial compliance requirement)

**Card Data**: 
- ❌ Never stored on our servers
- ✅ Handled exclusively by Stripe (PCI DSS Level 1)
- ✅ Tokenized by Stripe

**Third-Party Sharing**:
- Stripe (payment processor) - PCI DSS compliant

**User Controls**:
- ✅ View all transactions
- ✅ Export payment history
- ✅ Delete payment method from Stripe

---

### 6. SOCIAL & COMMUNICATION DATA

**What We Collect**:
- Friend requests sent/received
- Friend connections
- Notification preferences
- In-app messages (if feature enabled)

**Purpose**:
- Social features (friend requests, leaderboards)
- Push notifications about workouts
- Communication between users and trainers

**Storage**:
- **Backend**: MongoDB Atlas
- **Mobile**: Encrypted in AsyncStorage
- **Encryption**: Yes (E2E encrypted)
- **Retention**: Until account deletion or manually removed

**Third-Party Sharing**: None

---

### 7. USAGE & ANALYTICS DATA (OPTIONAL)

**What We Collect** (Only if enabled in settings):
- App usage patterns (screens viewed, features used)
- Session duration
- Crash reports
- Device information (model, OS version)

**Purpose**:
- Improve app performance
- Fix bugs and crashes
- Understand feature usage

**Storage**:
- **Backend**: Aggregated analytics (no PII)
- **Retention**: 90 days

**Third-Party Sharing**:
- None (we do NOT use Google Analytics, Facebook Pixel, etc.)

**User Controls**:
- ✅ Disabled by default
- ✅ Can be toggled OFF in Settings
- ✅ Fully anonymous (no link to user identity)

---

### 8. DEVICE & TECHNICAL DATA

**What We Collect**:
- Device type (iOS/Android)
- OS version
- App version
- Language preference
- Time zone

**Purpose**:
- Ensure app compatibility
- Localize content
- Sync across devices

**Storage**:
- **Backend**: Basic device info
- **Retention**: While account is active

**Third-Party Sharing**: None

---

## 🚫 WHAT WE DO NOT COLLECT

- ❌ Biometric data (Face ID/Touch ID stays on device)
- ❌ Microphone or camera data (except user-initiated photo uploads)
- ❌ Browsing history
- ❌ Contacts list
- ❌ Other apps installed on your device
- ❌ SMS or call logs
- ❌ Clipboard data
- ❌ Background location (only when app is open)
- ❌ Social media activity

---

## 🔐 ENCRYPTION & SECURITY

### Data at Rest:
- **User Data**: AES-256 encryption in AsyncStorage
- **Health Data**: AES-256 encryption (HIPAA-like)
- **Payment Data**: Encrypted, tokenized by Stripe
- **JWT Tokens**: Encrypted before storage

### Data in Transit:
- **HTTPS Only**: All API calls use TLS 1.3
- **Certificate Pinning**: Prevents man-in-the-middle attacks
- **HMAC Verification**: Data integrity checks

### Key Management:
- **Per-User Keys**: Each user has unique encryption key
- **PBKDF2 Key Derivation**: 10,000 iterations
- **No Plaintext Keys**: Never stored in readable format

---

## 👤 USER RIGHTS & CONTROLS

### Access:
- ✅ View all your data in Settings → Export Data

### Rectification:
- ✅ Edit profile information anytime
- ✅ Update fitness goals and preferences

### Erasure (Right to be Forgotten):
- ✅ Delete account in Settings → Delete Account
- ✅ All data permanently deleted within 30 days
- ✅ Encrypted backups destroyed

### Portability:
- ✅ Export all data in encrypted JSON format
- ✅ Download workout history, payments, profile

### Objection:
- ✅ Opt-out of analytics in Settings
- ✅ Disable push notifications
- ✅ Revoke location permissions

---

## 🌍 THIRD-PARTY SERVICES

### Services We Use:

1. **Stripe** (Payment Processing)
   - Purpose: Payment processing
   - Data Shared: Transaction amounts, customer ID
   - Privacy Policy: https://stripe.com/privacy

2. **Google Maps** (Map Display)
   - Purpose: Display trainer locations on map
   - Data Shared: GPS coordinates (temporary)
   - Privacy Policy: https://policies.google.com/privacy

3. **Google Fit** (Optional)
   - Purpose: Sync workout data
   - Data Shared: Only if user explicitly connects
   - Privacy Policy: https://policies.google.com/privacy

4. **MongoDB Atlas** (Database)
   - Purpose: Store user data (encrypted at rest)
   - Data Shared: All user data (encrypted)
   - Privacy Policy: https://www.mongodb.com/legal/privacy-policy

### Services We DO NOT Use:
- ❌ Google Analytics
- ❌ Facebook SDK
- ❌ Ad networks
- ❌ Tracking pixels
- ❌ Data brokers

---

## 📝 DATA RETENTION POLICY

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| Account Data | Until deletion | Account management |
| Fitness Data | Until deletion | User preference |
| Payment Records | 7 years | Financial compliance (required by law) |
| Analytics | 90 days | Performance optimization |
| Session Logs | 30 days | Security auditing |
| Crash Reports | 60 days | Bug fixing |

**On Account Deletion**:
- All personal data deleted within 30 days
- Payment records anonymized (legal requirement)
- No data retained after deletion

---

## 🚨 DATA BREACHES

**In case of a data breach**, we will:
1. Notify affected users within 72 hours
2. Report to relevant authorities (GDPR requirement)
3. Provide details on what data was affected
4. Offer remediation steps

**Our Security Measures**:
- Regular security audits
- Penetration testing
- Encrypted backups
- Access controls (need-to-know basis)

---

## 👶 CHILDREN'S PRIVACY

- LiftLink is **NOT intended for children under 13**
- Age verification required during signup
- If we discover a child's data, we delete it immediately

---

## 🌐 INTERNATIONAL DATA TRANSFERS

- **Primary Storage**: US-based servers (MongoDB Atlas)
- **Compliance**: GDPR-compliant data transfer mechanisms
- **User Rights**: EU users have same rights as outlined above

---

## 📞 CONTACT & DATA REQUESTS

**For Privacy Concerns**:
- Email: privacy@liftlink.com
- Response Time: Within 7 days

**Data Subject Requests** (GDPR/CCPA):
- Access Request: Settings → Export Data
- Deletion Request: Settings → Delete Account
- Questions: privacy@liftlink.com

---

## 🔄 CHANGES TO THIS POLICY

- We may update this policy periodically
- Users notified of significant changes via email
- Continued use implies acceptance

**Last Updated**: October 25, 2024

---

## ✅ COMPLIANCE CERTIFICATIONS

- GDPR Compliant (EU)
- CCPA Compliant (California)
- HIPAA-like standards for health data
- PCI DSS Level 1 (via Stripe)

---

## 📊 DATA MINIMIZATION PRINCIPLE

We follow the principle of **data minimization**:
- Collect only what's necessary
- Store only as long as needed
- Share only with essential partners
- Encrypt everything sensitive

**Your privacy is our priority.** 🔒
