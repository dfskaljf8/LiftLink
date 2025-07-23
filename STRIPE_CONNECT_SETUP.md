# Stripe Connect Setup Guide for LiftLink

## Overview
This guide will help you set up Stripe Connect so trainers can receive direct payments from clients and cash out to their bank accounts.

## What's Already Implemented ✅

### Backend Implementation
- **Express Account Creation**: `POST /api/trainer/{trainer_id}/create-stripe-account`
- **Onboarding Links**: `GET /api/trainer/{trainer_id}/onboarding-link`
- **Real Payouts**: `POST /api/trainer/{trainer_id}/payout` (using real Stripe transfers)
- **Destination Charges**: Payments go directly to trainer accounts
- **Webhook Handling**: `POST /api/webhook/stripe` for account updates

### Payment Service Methods
- `create_express_account()` - Creates trainer Stripe accounts
- `create_onboarding_link()` - Generates onboarding URLs
- `process_trainer_payout()` - Real Stripe transfers
- `handle_webhook_event()` - Processes Stripe events

## Required Setup Steps

### Step 1: Enable Stripe Connect in Dashboard
1. Go to https://dashboard.stripe.com/connect/overview
2. Click "Get started with Connect"
3. Choose "Platforms and marketplaces"
4. Configure your platform settings:
   - Platform name: "LiftLink"
   - Website: Your app domain
   - Business type: Technology/Fitness

### Step 2: Configure Webhook Endpoints
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://your-backend-domain.com/api/webhook/stripe`
4. Select these events:
   - `account.updated`
   - `payment_intent.succeeded`
   - `transfer.created`
   - `payout.paid`
5. Copy the webhook secret and update `.env`:

```bash
STRIPE_WEBHOOK_SECRET="<YOUR_WEBHOOK_SECRET>"
```

### Step 3: Update Environment Variables
Replace placeholder values in `/app/backend/.env`:

```bash
# Your actual Stripe keys
STRIPE_SECRET_KEY="<YOUR_STRIPE_SECRET_KEY>"  # From Stripe dashboard
STRIPE_PUBLISHABLE_KEY="<YOUR_STRIPE_PUBLISHABLE_KEY>"  # From Stripe dashboard
STRIPE_WEBHOOK_SECRET="<YOUR_WEBHOOK_SECRET>"  # From webhook configuration
```

## How the Flow Works

### 1. Trainer Onboarding Process

#### A. Create Stripe Account
```bash
curl -X POST https://your-backend.com/api/trainer/trainer123/create-stripe-account \
  -H "Content-Type: application/json" \
  -d '{"email": "trainer@example.com"}'

# Response:
{
  "account_id": "acct_1234567890",
  "trainer_id": "trainer123",
  "onboarding_required": true
}
```

#### B. Get Onboarding Link
```bash
curl -X GET https://your-backend.com/api/trainer/trainer123/onboarding-link

# Response:
{
  "onboarding_url": "https://connect.stripe.com/oauth/authorize?...",
  "account_id": "acct_1234567890"
}
```

#### C. Trainer Completes Onboarding
- Trainer clicks the onboarding link
- Fills out business/banking information
- Stripe verifies their identity
- Webhook fires when account is ready

### 2. Client Payment Process

#### A. Create Payment
```bash
curl -X POST https://your-backend.com/api/payments/create-session-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 7500,
    "trainer_id": "trainer123",
    "client_email": "client@example.com",
    "session_details": {
      "trainer_name": "John Smith",
      "session_type": "personal_training"
    }
  }'

# Response:
{
  "checkout_session_id": "YOUR_CHECKOUT_SESSION_ID",
  "checkout_url": "https://checkout.stripe.com/c/pay/...",
  "amount": 7500,
  "destination_account": "acct_1234567890"
}
```

#### B. Payment Processing
- Client pays through Stripe Checkout
- Money goes directly to trainer's account (destination charge)
- No manual transfer needed - automatic!

### 3. Trainer Cash Out Process

#### A. Request Payout
```bash
curl -X POST https://your-backend.com/api/trainer/trainer123/payout \
  -H "Content-Type: application/json" \
  -d '{"amount": 6750}'  # Amount in cents ($67.50)

# Response:
{
  "message": "Payout processed successfully",
  "amount": 67.50
}
```

#### B. Money Transfer
- Creates real Stripe transfer to trainer's bank account
- Usually arrives in 2-7 business days
- Trainer gets email notification from Stripe

## Database Schema Updates

The system automatically updates your MongoDB with:

### Trainers Collection
```javascript
{
  id: "trainer123",
  name: "John Smith",
  email: "trainer@example.com",
  stripe_account_id: "acct_1234567890",        // Added by system
  stripe_onboarding_complete: true,            // Updated by webhook
  stripe_created_at: "2025-01-18T10:30:00Z"    // Added by system
}
```

### Payouts Collection (New)
```javascript
{
  trainer_id: "trainer123",
  amount: 6750,
  stripe_account_id: "acct_1234567890",
  status: "processed",
  created_at: "2025-01-18T10:30:00Z"
}
```

## Testing the Integration

### Test with Stripe Test Mode
1. Use test API keys (<YOUR_STRIPE_SECRET_KEY> and <YOUR_STRIPE_PUBLISHABLE_KEY>)
2. Use test bank account numbers:
   - Routing: `110000000`
   - Account: `000123456789`
3. Use test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 9995`

### Test Flow
1. Create trainer account
2. Complete onboarding with test data
3. Create payment from client
4. Verify money in trainer's test account
5. Request payout
6. Check webhook events in Stripe dashboard

## Security Features ✅

- **Webhook Signature Verification**: Prevents fake webhooks
- **Environment Variables**: API keys stored securely
- **Express Accounts**: Trainers don't handle sensitive data
- **PCI Compliance**: Stripe handles card processing
- **Real Banking**: Stripe handles bank transfers

## Production Checklist

### Before Going Live:
- [ ] Replace test API keys with live keys
- [ ] Set up production webhook endpoints
- [ ] Test with real bank account (small amount)
- [ ] Configure Stripe Radar for fraud detection
- [ ] Set up monitoring for failed payouts
- [ ] Add retry logic for failed transfers
- [ ] Implement payout scheduling (daily/weekly)

### Optional Enhancements:
- [ ] Platform fees (take percentage of payments)
- [ ] Instant payouts (additional Stripe feature)
- [ ] Multi-currency support
- [ ] Payout notifications to trainers
- [ ] Earnings analytics dashboard

## API Reference Summary

| Endpoint | Purpose | Status |
|----------|---------|---------|
| `POST /api/trainer/{id}/create-stripe-account` | Create trainer account | ✅ Implemented |
| `GET /api/trainer/{id}/onboarding-link` | Get onboarding URL | ✅ Implemented |
| `POST /api/trainer/{id}/payout` | Process payout | ✅ Implemented |
| `POST /api/payments/create-session-checkout` | Create payment | ✅ Enhanced for Connect |
| `POST /api/webhook/stripe` | Handle webhooks | ✅ Implemented |

## Support

- **Stripe Documentation**: https://stripe.com/docs/connect
- **Express Accounts**: https://stripe.com/docs/connect/express-accounts
- **Testing Guide**: https://stripe.com/docs/connect/testing

The Stripe Connect integration is now **fully implemented** and ready for testing!