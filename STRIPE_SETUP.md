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

| Variable | Value | Environment | Status |
|----------|-------|-------------|--------|
| VITE_STRIPE_PUBLISHABLE_KEY | pk_live_... | Preview, Production | ✅ Set |
| VITE_STRIPE_PRO_PRICE_ID | price_... (legacy Pro $29.99/mo) | Preview, Production | ✅ Set |
| VITE_STRIPE_NURSING_PASS_PRICE_ID | price_... (Nursing 30-day $19.99) | Preview, Production | ⬜ Needs Step 4+5 |
| VITE_STRIPE_GENERAL_PASS_PRICE_ID | price_... (General 30-day $14.99) | Preview, Production | ⬜ Needs Step 4+5 |
| VITE_STRIPE_ANNUAL_PRICE_ID | price_... (Annual $149.99/yr) | Preview, Production | ⬜ Needs Step 4+5 |
| VITE_SUPABASE_URL | https://... | Preview, Production | ✅ Set |
| VITE_SUPABASE_ANON_KEY | sb_... | Preview, Production | ✅ Set |

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

### Step 3: Verify Product & Price (Legacy Pro)

1. Go to: https://dashboard.stripe.com/products
2. Verify "InterviewAnswers.ai Pro" exists
3. Verify price is $29.99/month recurring
4. Copy Price ID if different from what's in .env.local

### Step 4: Create Pass-Based Products (P2 — February 2026)

Create these 3 new products in Stripe Dashboard → Products → Add product:

**Product 1: Nursing Interview Pro — 30-Day Pass**
- Name: `Nursing Interview Pro — 30-Day Pass`
- Description: `30 days of unlimited nursing interview practice including mock interviews, SBAR drills, AI coaching, and all 70 questions.`
- Price: `$19.99` — One time
- Copy the `price_xxx` ID → this becomes `VITE_STRIPE_NURSING_PASS_PRICE_ID`

**Product 2: General Interview Prep — 30-Day Pass**
- Name: `General Interview Prep — 30-Day Pass`
- Description: `30 days of unlimited general interview practice including mock interviews, STAR coaching, AI feedback, and practice mode.`
- Price: `$14.99` — One time
- Copy the `price_xxx` ID → this becomes `VITE_STRIPE_GENERAL_PASS_PRICE_ID`

**Product 3: Annual All-Access**
- Name: `InterviewAnswers.ai Annual All-Access`
- Description: `Full year of unlimited access to both Nursing and General interview prep. All features, all modes, priority support.`
- Price: `$149.99` — Recurring / Yearly
- Copy the `price_xxx` ID → this becomes `VITE_STRIPE_ANNUAL_PRICE_ID`

### Step 5: Add New Vercel Env Vars

After creating the 3 products above, add their price IDs to Vercel:

```bash
cd ~/Downloads/isl-complete

# Use printf (NOT echo) to avoid trailing newline — Battle Scar!
printf 'price_xxx' | npx vercel env add VITE_STRIPE_NURSING_PASS_PRICE_ID production
printf 'price_xxx' | npx vercel env add VITE_STRIPE_NURSING_PASS_PRICE_ID preview
printf 'price_xxx' | npx vercel env add VITE_STRIPE_GENERAL_PASS_PRICE_ID production
printf 'price_xxx' | npx vercel env add VITE_STRIPE_GENERAL_PASS_PRICE_ID preview
printf 'price_xxx' | npx vercel env add VITE_STRIPE_ANNUAL_PRICE_ID production
printf 'price_xxx' | npx vercel env add VITE_STRIPE_ANNUAL_PRICE_ID preview
```

Replace `price_xxx` with the actual price IDs from Step 4.

### Step 6: Add charge.refunded Webhook Event

1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your existing endpoint (`https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/stripe-webhook`)
3. Click "Update details" or the pencil icon
4. Add this event to the existing list:
   - ☑️ charge.refunded
5. Save changes

The updated webhook should now listen for these events:
   - ☑️ checkout.session.completed
   - ☑️ customer.subscription.updated
   - ☑️ customer.subscription.deleted
   - ☑️ invoice.payment_succeeded
   - ☑️ invoice.payment_failed
   - ☑️ **charge.refunded** (NEW)

### Step 7: Deploy Frontend

```bash
# Option A: Vercel CLI
npx vercel deploy --prod

# Option B: Git push (triggers auto-deploy)
git add -A && git commit -m "P2: Pass-based pricing + product separation" && git push
```

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

### Test 6: Nursing 30-Day Pass Purchase

1. Go to `/nursing` → select specialty → dashboard
2. Click any "Get Nursing Pass" button (or use pricing modal)
3. Verify NursingPricing modal opens with 2 options
4. Click "Get 30-Day Pass" ($19.99)
5. Complete checkout with test card
6. Verify redirect to `/nursing?purchase=success&pass=nursing_30day`
7. Verify `user_profiles.nursing_pass_expires` is set to 30 days from now
8. Verify `resolveEffectiveTier()` returns `nursing_pass`
9. Verify all nursing features are unlocked (unlimited badge, no credit limits)

### Test 7: Annual All-Access Purchase

1. Open NursingPricing modal
2. Click "Get Annual All-Access" ($149.99)
3. Complete checkout
4. Verify `user_profiles.tier = 'annual'` and `subscription_status = 'active'`
5. Verify BOTH nursing and general features are unlocked
6. Verify 30-Day Pass button shows "Included in Annual"

### Test 8: Pass Expiry & Extension

1. Manually set `nursing_pass_expires` to a past date in Supabase
2. Verify user is treated as `free` tier (pass expired)
3. Purchase another 30-day pass
4. Verify `nursing_pass_expires` is extended from current date (not from old expiry)

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
