# 🔧 Google Pay Real Integration Setup Guide

## Current Status
✅ **Mock Google Pay**: Working with test data
❌ **Real Google Pay**: Requires Google Cloud Console setup

## What You Need to Do for Real Google Pay

### 1. **Google Cloud Console Setup**

#### Step 1: Enable Google Pay API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to "APIs & Services" > "Library"
4. Search for and enable:
   - **Google Pay API**
   - **Google Wallet API**

#### Step 2: Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Name: "LiftLink Google Pay Service"
4. Download the JSON key file
5. Add this JSON content to your backend environment

#### Step 3: Configure OAuth 2.0
1. In "Credentials", click "Create Credentials" > "OAuth 2.0 Client ID"
2. Application type: "Web application"
3. Name: "LiftLink Google Pay Client"
4. Authorized JavaScript origins:
   - `https://1c6587b8-a4c5-4550-aaa8-d1f1e8eabfb1.preview.emergentagent.com`
   - `https://yourdomain.com` (your production domain)
5. Authorized redirect URIs:
   - `https://1c6587b8-a4c5-4550-aaa8-d1f1e8eabfb1.preview.emergentagent.com/api/google-pay/callback`

### 2. **Google Pay Business Console Setup**

#### Step 1: Create Merchant Account
1. Go to [Google Pay & Wallet Console](https://pay.google.com/business/console/)
2. Sign in with your Google account
3. Click "Get Started" to create merchant profile
4. Fill in business information:
   - Business name: "LiftLink"
   - Business type: "Fitness Services"
   - Website: your domain
   - Contact information

#### Step 2: Configure Payment Profile
1. In Google Pay Console, go to "Payment Profile"
2. Add payment methods you want to accept:
   - Credit/Debit cards
   - Bank transfers (if needed)
3. Set up transaction limits and fees
4. Configure settlement account (where money goes)

#### Step 3: Get Merchant ID
1. In Google Pay Console, note your **Merchant ID**
2. This will be something like: `BCR2DN4TR6TMKJ9A`
3. You'll need this for the integration

### 3. **Update Your Backend Code**

#### Current Mock Implementation Location:
- File: `/app/backend/google_wallet_service.py`
- Current merchant ID: `"LiftLink_Fitness_Platform"` (mock)

#### What to Change:
```python
# Replace this in google_wallet_service.py
"merchantInfo": {
    "merchantId": "YOUR_REAL_MERCHANT_ID",  # From Google Pay Console
    "merchantName": "LiftLink"
}
```

#### Add Real API Authentication:
```python
# Add to google_wallet_service.py
import os
import json
from google.auth.transport.requests import Request
from google.oauth2 import service_account

class GoogleWalletService:
    def __init__(self):
        # Load service account credentials
        service_account_info = json.loads(os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON'))
        self.credentials = service_account.Credentials.from_service_account_info(
            service_account_info,
            scopes=['https://www.googleapis.com/auth/wallet_object.issuer']
        )
        self.merchant_id = os.environ.get('GOOGLE_PAY_MERCHANT_ID')
```

### 4. **Update Environment Variables**

Add these to your `/app/backend/.env`:
```bash
# Google Pay Real Configuration
GOOGLE_PAY_MERCHANT_ID="YOUR_MERCHANT_ID_FROM_CONSOLE"
GOOGLE_SERVICE_ACCOUNT_JSON='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}'
```

### 5. **Frontend Configuration**

Update your React Native app's Google Pay config:
```javascript
// In PaymentScreen.js
const googlePayConfig = {
  environment: "PRODUCTION", // Change from "TEST"
  merchantInfo: {
    merchantId: "YOUR_REAL_MERCHANT_ID",
    merchantName: "LiftLink"
  },
  apiVersion: 2,
  apiVersionMinor: 0
};
```

### 6. **Testing Process**

#### Phase 1: Test Environment
1. Use Google Pay's test environment first
2. Test with test cards provided by Google
3. Verify payments flow correctly

#### Phase 2: Production Testing
1. Use real Google Pay accounts
2. Test with small amounts first
3. Verify money reaches your settlement account

### 7. **Required Dependencies**

Add to `/app/backend/requirements.txt`:
```
google-auth==2.16.0
google-auth-oauthlib==1.0.0
google-auth-httplib2==0.1.0
google-api-python-client==2.71.0
```

### 8. **Compliance Requirements**

1. **PCI DSS Compliance**: Ensure your app meets security standards
2. **Privacy Policy**: Update to include Google Pay data handling
3. **Terms of Service**: Include Google Pay terms
4. **Age Restrictions**: Verify user age requirements

### 9. **Common Issues & Solutions**

**Issue**: "Merchant not approved"
**Solution**: Complete business verification in Google Pay Console

**Issue**: "Invalid merchant ID"
**Solution**: Use exact merchant ID from Google Pay Console

**Issue**: "Payment method not available"
**Solution**: Ensure user has Google Pay set up on their device

### 10. **Current vs Real Integration**

#### Current (Mock):
- ✅ UI works perfectly
- ✅ Payment flow simulated
- ✅ Stripe integration as fallback
- ❌ No real money processing

#### After Real Setup:
- ✅ Real Google Pay processing
- ✅ Money goes to your account
- ✅ Real transaction records
- ✅ Production-ready

## Summary

**Current Status**: Your Google Pay UI and flow work perfectly in mock mode
**Next Step**: Complete Google Cloud Console and Google Pay Business Console setup
**Time Required**: 2-3 hours for setup, 1-2 business days for approval
**Result**: Real Google Pay payments processing actual money

The hardest part (the integration code) is already done! You just need to configure the Google accounts and get the real merchant credentials.