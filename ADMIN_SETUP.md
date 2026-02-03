# PaynePros Admin Area Setup Guide

## Overview

The PaynePros admin area provides a comprehensive dashboard for managing your tax preparation and bookkeeping business. It includes social login, subscription management, wallet system, messaging aggregation, and content request capabilities.

## Features

### ✅ Implemented

1. **Social Login Authentication**
   - Google, Facebook, Instagram, Apple, WhatsApp (OTP)
   - NextAuth v5 integration
   - Firebase Authentication

2. **Subscription Management**
   - Readyaimgo C-Suite plan activation
   - Stripe Checkout integration
   - Subscription status tracking

3. **Wallet System**
   - Fund wallet via Stripe
   - Allocation management (7 categories)
   - Transaction history
   - Apple Pay support ready

4. **Messaging Hub**
   - Unified inbox (leads from all sources)
   - Pulse daily summary placeholder
   - Lead classification

5. **Content Request System**
   - Request social media content
   - Request bookkeeping reports
   - Request strategic planning
   - Send to BEAM participants option

6. **Admin Pages**
   - Dashboard
   - Messaging
   - Wallet
   - Bookkeeping
   - Marketing
   - Operations
   - Requests
   - Account Settings

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Google, Facebook, Apple providers
3. Enable Firestore Database
4. Enable Storage
5. Copy your Firebase config to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

6. For **server-side Firestore** (admin client list, create client, etc.), use one of:

   **Option A – JSON (single env var):**
   ```env
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"}'
   ```

   **Option B – Split vars** (e.g. for Vercel; private key newlines as `\n` are handled):
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

   Without either, the app falls back to in-memory mock data (new clients work locally but are not persisted).

   **Add New Client flow:** When Firebase Admin is configured, "New Client" creates a document in the `clientWorkspaces` Firestore collection and redirects to `/admin/clients/{id}`. The workspace detail page reads the same collection. If you see "Workspace not found", ensure (1) env vars are set and (2) you are not using a placeholder ID (e.g. `mock-workspace-id`); use the ID returned after creating a client.

7. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

### 3. NextAuth Setup

1. Generate a secret:
```bash
openssl rand -base64 32
```

2. Add to `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret
```

### 4. Social Login Providers

#### Google
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Add to `.env.local`:
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

#### Facebook
1. Go to https://developers.facebook.com/apps
2. Create app, add Facebook Login
3. Add redirect URI: `http://localhost:3000/api/auth/callback/facebook`
4. Add to `.env.local`:
```env
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
```

#### Instagram
1. Use Instagram Basic Display API
2. Configure in Facebook Developer Console
3. Add to `.env.local`:
```env
INSTAGRAM_CLIENT_ID=...
INSTAGRAM_CLIENT_SECRET=...
```

#### Apple
1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Create Services ID
3. Configure Sign in with Apple
4. Add to `.env.local`:
```env
APPLE_ID=...
APPLE_SECRET=...
```

### 5. Stripe Setup

1. Create Stripe account at https://stripe.com
2. Get API keys from Dashboard
3. Add to `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

4. Set up webhook endpoint:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook secret to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 6. Pulse Integration

1. Set up Pulse webhook URL:
```env
PULSE_WEBHOOK_URL=https://your-pulse-webhook-url.com/webhook
```

2. Pulse will receive:
   - Lead submissions
   - Content requests
   - Daily summary requests

### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/admin/login` to access the admin area.

## Admin Area Structure

```
/admin
├── /                    # Dashboard
├── /login              # Login page
├── /subscription       # Activate C-Suite subscription
├── /messaging          # Unified inbox + Pulse summary
├── /wallet             # Wallet management
├── /bookkeeping        # Receipt upload, reports
├── /marketing          # Content requests, analytics
├── /operations         # Transportation, housing requests
├── /requests           # Content request management
└── /account            # Account settings
```

## Firebase Collections

- `users` - User profiles and subscription info
- `leads` - Lead submissions from website
- `wallets` - User wallet balances and allocations
- `walletTransactions` - Wallet transaction history
- `contentRequests` - Content and support requests

## API Routes

- `POST /api/auth/[...nextauth]` - NextAuth handlers
- `POST /api/leads` - Submit lead (already implemented)
- `POST /api/stripe/create-checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Stripe webhook handler
- `GET /api/wallet` - Get wallet balance and allocations
- `POST /api/wallet/fund` - Create funding checkout session
- `POST /api/wallet/allocations` - Update allocation percentages
- `GET /api/requests` - Get user's content requests
- `POST /api/requests` - Create new content request

## Next Steps

1. **Messaging Aggregator**: Integrate Gmail, Outlook, WhatsApp, Instagram, Facebook APIs
2. **Pulse Daily Summary**: Set up cron job to generate daily summaries
3. **Apple Wallet Integration**: Complete Apple Pay funding flow
4. **Withdrawal System**: Implement Apple Cash and debit card withdrawals
5. **File Upload**: Complete receipt upload to Firebase Storage
6. **Analytics**: Connect social media analytics APIs

## Troubleshooting

### Authentication Issues
- Ensure all OAuth redirect URIs match exactly
- Check that `NEXTAUTH_URL` matches your domain
- Verify `NEXTAUTH_SECRET` is set

### Firebase Issues
- Ensure Firestore rules are deployed
- Check that service account JSON is valid
- Verify all Firebase config variables are set

### Stripe Issues
- Test with Stripe test mode keys first
- Verify webhook endpoint is accessible
- Check webhook secret matches Stripe dashboard

### Wallet Issues
- Ensure Stripe webhook is processing `checkout.session.completed`
- Check wallet is created on first access
- Verify allocations sum to 100%

## Support

For issues or questions, refer to:
- Firebase Docs: https://firebase.google.com/docs
- NextAuth Docs: https://next-auth.js.org
- Stripe Docs: https://stripe.com/docs

