# Subscription Activation Setup

## ✅ Implementation Complete

The subscription activation flow has been fully implemented. Here's what was created:

### Files Created/Updated:

1. **`/app/api/subscription/create-session/route.ts`**
   - Creates Stripe Checkout session
   - Uses Readyaimgo Stripe keys
   - Returns checkout URL

2. **`/app/api/subscription/webhook/route.ts`**
   - Handles Stripe webhook events
   - Activates subscription in Firestore when payment succeeds
   - Sets `cSuiteEnabled: true` flag

3. **`/app/admin/subscription/page.tsx`** (Updated)
   - "Activate Subscription" button
   - Calls API and redirects to Stripe Checkout

4. **`/app/admin/subscription/success/page.tsx`** (New)
   - Success page after payment
   - Shows confirmation and links to dashboard

5. **`/app/admin/layout.tsx`** (Updated)
   - Checks subscription status
   - Redirects to subscription page if not activated

6. **`lib/repositories/user-repository.ts`** (Updated)
   - Added `cSuiteEnabled` and `subscription` fields to User interface

## 🔑 Required Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration (Readyaimgo account)
STRIPE_SECRET_KEY_READY=sk_live_xxx
READYAIMGO_CSUITE_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET_READY=whsec_xxx

# Base URL (for redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### For Production:

```env
NEXT_PUBLIC_BASE_URL=https://paynepros.com
```

## 📋 How to Get Stripe Values

### 1. Stripe Secret Key (`STRIPE_SECRET_KEY_READY`)
- Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- Copy the **Secret key** (starts with `sk_live_` or `sk_test_`)

### 2. Price ID (`READYAIMGO_CSUITE_PRICE_ID`)
- Go to [Stripe Products](https://dashboard.stripe.com/products)
- Find or create your C-Suite subscription product
- Copy the **Price ID** (starts with `price_`)

### 3. Webhook Secret (`STRIPE_WEBHOOK_SECRET_READY`)
- Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
- Click "Add endpoint"
- Set endpoint URL to: `https://paynepros.com/api/subscription/webhook`
- Select events:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
- Copy the **Signing secret** (starts with `whsec_`)

## 🔄 How It Works

1. **User clicks "Activate Subscription"**
   - Frontend calls `/api/subscription/create-session`
   - API creates Stripe Checkout session
   - User redirected to Stripe payment page

2. **User completes payment**
   - Stripe processes payment
   - Stripe sends webhook to `/api/subscription/webhook`
   - Webhook handler:
     - Verifies webhook signature
     - Updates Firestore: `users/{userId}` with:
       ```json
       {
         "subscription": {
           "status": "active",
           "plan": "c-suite",
           "startedAt": "2024-01-01T00:00:00Z"
         },
         "subscriptionStatus": "active",
         "cSuiteEnabled": true
       }
       ```

3. **User redirected to success page**
   - Shows confirmation message
   - Links to dashboard and wallet setup

4. **Admin features unlocked**
   - Dashboard checks `cSuiteEnabled` flag
   - All admin features become accessible

## 🧪 Testing Locally

### Using Stripe CLI (Recommended)

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`

2. Login: `stripe login`

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/subscription/webhook
   ```

4. Copy the webhook signing secret from the CLI output and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET_READY=whsec_xxx
   ```

5. Use test mode keys:
   ```env
   STRIPE_SECRET_KEY_READY=sk_test_xxx
   READYAIMGO_CSUITE_PRICE_ID=price_test_xxx
   ```

### Testing the Flow

1. Start dev server: `npm run dev`
2. Navigate to `/admin/subscription`
3. Click "Activate Subscription"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete checkout
6. Verify webhook fires (check Stripe CLI output)
7. Check Firestore for updated user document

## 🚨 Important Notes

- **Firebase Admin**: The webhook handler uses Firebase Admin SDK. If not configured, it will log warnings but won't crash.
- **Auth**: Currently using mock user ID (`mock-admin-id`). When you re-enable auth, update the API routes to use `session.user.id`.
- **Webhook Security**: Always verify webhook signatures in production.
- **Error Handling**: The API routes include error handling and will return appropriate error messages.

## 🔐 Security Checklist

- [ ] Use production Stripe keys in production
- [ ] Set `STRIPE_WEBHOOK_SECRET_READY` correctly
- [ ] Verify webhook signatures (already implemented)
- [ ] Use HTTPS in production
- [ ] Re-enable authentication before going live
- [ ] Test webhook delivery in production

## 📞 Support

If you encounter issues:
1. Check Stripe Dashboard → Webhooks for delivery logs
2. Check server logs for error messages
3. Verify all environment variables are set
4. Ensure Firebase Admin is configured (for production)



