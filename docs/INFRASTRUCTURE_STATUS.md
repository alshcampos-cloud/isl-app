# Infrastructure Status — Single Source of Truth
*Last updated: April 22, 2026*
*Purpose: The one place to check "are we ready to scale?"*

---

## Quick Snapshot

| Service | Tier | Status | Last Verified | Monthly Cost | Ready for PH Launch? |
|---------|------|--------|---------------|--------------|---------------------|
| **Supabase** | Pro | ✅ | Apr 22 (dashboard confirmed) | $25 | ✅ Yes |
| **Vercel** | Pro | ✅ | Apr 22 (dashboard confirmed) | $20 base + $200 on-demand cap | ✅ Yes |
| **Anthropic API** | Tier 3 ($250 deposit) | ✅ | Apr 22 (founder confirmed payment made) | Pay-as-you-go, $1,000/mo cap | ✅ Yes |
| **Stripe** | Standard account | ✅ | Apr 22 (env vars verified in Vercel) | 2.9% + $0.30/txn | ✅ Yes |
| **RevenueCat** | Free | ✅ | Apr 15 (products + offerings configured) | Free under $10K/mo revenue | ✅ Yes |
| **GitHub** | Free | ✅ | Apr 22 (pushed successfully) | $0 | ✅ Yes |
| **Namecheap (DNS)** | Standard | ✅ | Apr 22 (site resolves, DNS live) | ~$15/yr domain | ✅ Yes |
| **Resend (Email)** | **FREE** | ⚠️ **BOTTLENECK** | Apr 22 (founder confirmed) | $0 | ❌ **Blocks at 100 emails/day** |
| **Supabase Custom SMTP → Resend** | Enabled, routing to smtp.resend.com:465 | ✅ **VERIFIED** | Apr 22 (dashboard confirmed) | — | ✅ Yes |

### Total Current Monthly Burn: **~$45/mo base** ($25 Supabase + $20 Vercel)
Plus pay-as-you-go on Anthropic (currently negligible) + Stripe fees (only on paid conversions).

---

## Detailed Status

### ✅ Supabase — Pro Plan
- **Plan:** Pro
- **Monthly:** $25 base
- **Spend cap:** DISABLED (scales beyond quota, bills on-demand)
- **Project:** `isl-production` (ref: `tzrlpwtkrtvjpdhcaayu`)
- **Capacity:** 8GB database, 100GB bandwidth, 50K MAU, 500MB cached Edge Function RAM
- **Dashboard:** https://supabase.com/dashboard/project/tzrlpwtkrtvjpdhcaayu

### ✅ Vercel — Pro Plan
- **Plan:** Pro
- **Monthly:** $20 base
- **Credit used:** $1 / $20 (5%)
- **On-demand cap:** $200/mo (hard ceiling on overage)
- **Capacity:** 1 TB bandwidth, unlimited deployments, 1M serverless function invocations
- **Domain:** www.interviewanswers.ai (managed via Namecheap DNS → Vercel)
- **Dashboard:** https://vercel.com/alshcampos-clouds-projects/interview-as-a-second-language-app

### ✅ Anthropic API — Tier 3
- **Lifetime spend:** $250+ (prepay deposit)
- **Monthly cap:** $1,000
- **Sonnet 4.5:** 2,000 RPM, 80K input TPM
- **Haiku 4.5:** 4,000 RPM
- **Can handle:** Product Hunt spike (500+ concurrent users), Google Ads burst
- **Dashboard:** https://console.anthropic.com/settings/billing

### ✅ Stripe
- **Products live in Production:**
  - General 30-Day Pass ($14.99) — `VITE_STRIPE_GENERAL_PASS_PRICE_ID`
  - Nursing 30-Day Pass ($19.99) — `VITE_STRIPE_NURSING_PASS_PRICE_ID`
  - Annual All-Access ($99.99) — `VITE_STRIPE_ANNUAL_PRICE_ID`
  - Legacy Pro ($29.99/mo) — `VITE_STRIPE_PRO_PRICE_ID`
- **Publishable key:** set
- **Secret key:** set in Supabase Edge Function secrets
- **Webhook:** `stripe-webhook` Edge Function deployed, signature verification enabled
- **Dashboard:** https://dashboard.stripe.com

### ✅ RevenueCat
- **Products configured for InterviewAnswers.ai app:** 2 (General 30-Day Pass, Annual All-Access)
- **Entitlement:** "Koda Labs Pro" (5 products attached total: 3 Test Store + 2 IAI)
- **Offering:** "default" with 5 packages
- **API key in app:** `appl_EVayWIHevmksvikfi0FXvbzGpxd`
- **Dashboard:** https://app.revenuecat.com/projects/72b8c4e6

### ⚠️ Resend — FREE TIER (BOTTLENECK)
- **Plan:** Free
- **Daily cap:** 100 emails
- **Monthly cap:** 3,000 emails
- **Domains:** 1
- **AI credits:** 5/mo
- **Upgrade path:** Pro is $20/mo → 50,000 emails/mo, no daily limit, 10 domains

**Scenarios this blocks:**
| Traffic | Emails/day | Breaks? |
|---------|------------|---------|
| 34 users today | ~5 | ✅ No |
| Google Ads $15/day (5-20 signups) | 5-20 | ✅ No |
| Reddit organic spike (30 signups + 5-email welcome) | 150 | ❌ Yes |
| Product Hunt (500 signups + 5 emails) | 2,500 | ❌ Fatal |

**Upgrade before:** Any paid advertising OR any organic traffic spike OR Product Hunt launch.

### ✅ Supabase Custom SMTP → Resend — VERIFIED April 22, 2026

**Configuration confirmed in Supabase Dashboard:**
- Custom SMTP: **ENABLED**
- Sender email: `support@interviewanswers.ai`
- Sender name: `InterviewAnswers.ai`
- Host: `smtp.resend.com`
- Port: `465` (TLS)
- Username: `resend`
- Password: (Resend API key, saved and encrypted)
- Minimum interval per user: 60 seconds

**What this fixes:** Every Supabase Auth email (signup confirmation, password reset, magic link) is now routed through Resend, bypassing Supabase's built-in 4/hour rate limit. Signups will not silently fail under traffic spikes.

**DNS confirmed live:** SPF, DKIM, DMARC records verified for interviewanswers.ai via Resend.

---

## Pre-Launch Checklist

Before running ANY paid marketing (Google Ads, Reddit ads, PH launch):

- [x] Supabase Pro ($25/mo) — DONE
- [x] Vercel Pro ($20/mo) — DONE
- [x] Anthropic Tier 3 ($250 prepay) — DONE
- [x] Stripe products + webhooks — DONE
- [x] RevenueCat products + entitlement — DONE
- [x] **Supabase Custom SMTP → Resend** — VERIFIED Apr 22
- [ ] **Resend upgrade to Pro ($20/mo)** — NOT DONE (only remaining blocker)

**Once the two open items are confirmed, total monthly fixed cost:** **$65/mo** ($25 + $20 + $20)
Plus pay-as-you-go (Anthropic, Stripe fees).

---

## Escalation — What Happens If You Launch Without These?

**Without Resend Pro:** Free tier caps at 100 emails/day. A successful Reddit post that brings 30+ signups would exhaust your daily email quota, meaning:
- Later signups never receive verification emails
- They can't log in (email not confirmed)
- They leave, never return
- You never know because the signups aren't converting

**Without Supabase Custom SMTP configured:** Even worse — every signup email goes through Supabase's 4/hour default mailer. Under any real traffic, 90%+ of signups silently fail.

**Upgrading Resend without configuring Supabase custom SMTP is useless.** They work together.

---

## Automatic Updates to This Doc

When a tier or config changes, update this doc IMMEDIATELY with:
- New tier/plan
- Date verified (YYYY-MM-DD)
- Monthly cost change
- Link to verification (dashboard URL)

This is the source of truth. SESSION_STATE references it. Agents read it.
