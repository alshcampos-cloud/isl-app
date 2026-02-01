# Stripe Integration Setup Guide

## Environment Variables Checklist

### Frontend (.env.local)

These are already set in your `.env.local` file:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SsqpH2WESK3M3OmJQc3IW3HQo4JT7W2siZPZOjDXB009r2FjgWKgJV360J5mpwCma8WlL2skmswI4v8auYeZvZb00S4iifR8l
VITE_STRIPE_PRO_PRICE_ID=price_1SvuL52WESK3M3OmyRBqY0vI

# Supabase Configuration
VITE_SUPABASE_URL=https://tzrlpwtkrtvjpdhcaayu.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_dOEIA3gZf4rr_h60jh0i3A_8uFs4t8_
```

### Supabase Secrets (Edge Functions)

Set these using the Supabase CLI:

```bash
# Your Stripe Secret Key (starts with sk_test_ or sk_live_)
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Your Stripe Webhook Signing Secret (starts with whsec_)
# Get this AFTER creating the webhook endpoint in Stripe Dashboard
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### Vercel Environment Variables (Production)

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| VITE_STRIPE_PUBLISHABLE_KEY | pk_test_... | Preview, Production |
| VITE_STRIPE_PRO_PRICE_ID | price_... | Preview, Production |
| VITE_SUPABASE_URL | https://... | Preview, Production |
| VITE_SUPABASE_ANON_KEY | sb_... | Preview, Production |

---

## Stripe Dashboard Setup

### Step 1: Create Webhook Endpoint

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - ☑️ checkout.session.completed
   - ☑️ customer.subscription.updated
   - ☑️ customer.subscription.deleted
   - ☑️ invoice.payment_succeeded
   - ☑️ invoice.payment_failed
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Run: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

### Step 2: Configure Customer Portal

1. Go to: https://dashboard.stripe.com/settings/billing/portal
2. Enable "Customer portal link"
3. Configure allowed actions:
   - ☑️ Cancel subscriptions
   - ☑️ Update payment methods
   - ☐ Switch plans (optional - we only have one paid plan)
4. Save changes

### Step 3: Verify Product & Price

1. Go to: https://dashboard.stripe.com/products
2. Verify "InterviewAnswers.ai Pro" exists
3. Verify price is $29.99/month recurring
4. Copy Price ID if different from what's in .env.local

---

## Deployment Commands

### Deploy Edge Functions

```bash
# Navigate to project
cd ~/Downloads/isl-complete

# Link to Supabase project (first time only)
supabase link --project-ref tzrlpwtkrtvjpdhcaayu

# Set Stripe secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# Deploy all functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy create-portal-session

# Verify deployment
supabase functions list
```

### Run Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Open file: `supabase/migrations/20240131_add_stripe_columns.sql`
3. Copy and paste the SQL
4. Click "Run"

---

## Testing Checklist

### Test 1: Successful Payment

1. Click "Upgrade to Pro" on pricing page
2. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
3. Complete checkout
4. Verify redirect to success page
5. Verify `user_profiles.tier = 'pro'` in database

### Test 2: Declined Card

1. Click "Upgrade to Pro"
2. Use test card: `4000 0000 0000 0002`
3. Verify error message appears
4. Verify no tier change in database

### Test 3: Webhook Delivery

1. After successful payment, go to Stripe Dashboard → Webhooks
2. Click on your endpoint
3. View "Recent events"
4. Verify `checkout.session.completed` was sent and received 200 response

### Test 4: Customer Portal

1. As a Pro user, open Subscription Management
2. Click "Manage Subscription"
3. Verify Stripe Customer Portal opens
4. Test "Cancel subscription" (in test mode)
5. Verify user is downgraded to free tier

### Test 5: Subscription Cancellation

1. In Stripe Dashboard, cancel the test subscription
2. Verify webhook `customer.subscription.deleted` is sent
3. Verify `user_profiles.tier = 'free'` in database

---

## Stripe Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 3220 | 3D Secure required |

---

## Troubleshooting

### "Payment system not configured"
- Verify `STRIPE_SECRET_KEY` is set in Supabase secrets
- Run: `supabase secrets list`

### "Webhook signature verification failed"
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Check for extra spaces or newlines in the secret

### "No checkout URL returned"
- Check Edge Function logs: `supabase functions logs create-checkout-session`
- Verify user is authenticated

### Tier not updating after payment
- Check webhook endpoint in Stripe Dashboard for errors
- Verify `checkout.session.completed` event is selected
- Check Edge Function logs: `supabase functions logs stripe-webhook`

---

## Security Notes

1. ✅ Never expose `STRIPE_SECRET_KEY` in frontend code
2. ✅ Always verify webhook signatures
3. ✅ Use service role key only in Edge Functions
4. ✅ Validate userId matches authenticated user
5. ✅ Check existing subscription before creating new one
