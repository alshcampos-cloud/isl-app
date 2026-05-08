# Hit by a Bus — Lucas's Runbook
**Last updated:** 2026-05-08
**Owner:** Alsh "Lucas" Campos
**Backup operator:** Jacob Bernal

## 1. If Lucas is unreachable for >24 hours

Phone tree (in order):
- [TO FILL] Family/spouse name + phone
- [TO FILL] Trusted friend name + phone
- Jacob Bernal (technical co-founder/operator) — [TO FILL contact]

## 2. Critical accounts and where credentials live

### Production infrastructure
| Account | URL | Login Email | Credential Location | Recovery method |
|---|---|---|---|---|
| Apple Developer / App Store Connect | https://appstoreconnect.apple.com | alshcampos@gmail.com | 1Password vault: [TO FILL] | Apple ID 2FA + recovery key |
| Vercel | https://vercel.com | [TO FILL email] | 1Password vault: [TO FILL] | GitHub OAuth or recovery email |
| Stripe | https://dashboard.stripe.com | [TO FILL] | 1Password vault: [TO FILL — "BREAK GLASS"] | 2FA + backup codes in 1Password |
| Supabase (production) | https://supabase.com/dashboard | [TO FILL] | 1Password vault: [TO FILL] | Email recovery |
| Supabase (ops) | https://aroiwndgaxykmdamefjt.supabase.co | ops-test@interviewanswers.ai | 1Password (shared with Jacob) | Email recovery |
| RevenueCat | https://app.revenuecat.com | alshcampos@gmail.com | 1Password vault: [TO FILL] | Email recovery |
| Anthropic | https://console.anthropic.com | [TO FILL] | 1Password vault: [TO FILL] | Email recovery |
| Domain registrar (interviewanswers.ai) | [TO FILL — Namecheap/Cloudflare/etc.] | [TO FILL] | 1Password vault: [TO FILL] | Email + 2FA |
| Resend | https://resend.com | [TO FILL] | 1Password vault: [TO FILL] | Email recovery |
| GitHub | https://github.com | alshcampos-cloud | 1Password vault: [TO FILL] | Recovery codes |
| Google AI Studio | https://aistudio.google.com | alshwenbearcampos@gmail.com | Google account 2FA | Recovery email + phone |

### Marketing accounts
| Account | URL | Login | Notes |
|---|---|---|---|
| Meta Business / Ads Manager | https://business.facebook.com | [TO FILL] | Ad account 935298776659557 |
| LinkedIn Campaign Manager | https://www.linkedin.com/campaignmanager | [TO FILL] | Ad account onboarding pending |
| Reddit Ads | https://ads.reddit.com | [TO FILL] | Account creation pending |

## 3. Critical files and their locations

| File | Local path | Backup location |
|---|---|---|
| IA.ai source code | ~/Downloads/isl-complete | GitHub: alshcampos-cloud/isl-app |
| Production .env | ~/Downloads/isl-complete/.env | 1Password vault: [TO FILL] (NOT in git) |
| `~/.zshrc` env vars | ~/.zshrc | 1Password vault: [TO FILL] for GEMINI_API_KEY |
| Brand assets / mocks | ~/Downloads/isl-complete/docs/marketing/ | GitHub repo |

## 4. Recovery procedures

### If Lucas's Mac dies / is lost
1. Jacob (or trusted person) accesses 1Password vault "InterviewAnswers Engineering"
2. Pulls all credentials listed above
3. Logs into GitHub, Vercel, Stripe, Apple Developer to confirm operational state
4. Rotates any credentials that may have been compromised on the lost device
5. Notifies users via [TO FILL — status page or email] if downtime expected

### If main domain (interviewanswers.ai) fails
1. Check Vercel deploy status
2. Check DNS at registrar
3. If DNS is the issue: contact [TO FILL — registrar name] support
4. Status page: [TO FILL or "none yet"]

### If Stripe payments fail
1. Check Stripe Dashboard for outages
2. Check `supabase/functions/stripe-webhook/` for signature verification errors
3. Check `STRIPE_WEBHOOK_SECRET` is current in Supabase
4. Contact: Stripe support via dashboard

### If iOS purchases fail
1. Check RevenueCat dashboard for sync errors
2. Check `RC_REST_API_KEY` is set in Supabase Edge Functions Secrets
3. Check `supabase/functions/sync-rc-purchase/` logs in Supabase
4. Apple StoreKit status: https://developer.apple.com/system-status/

## 5. Decisions only Lucas can make (don't assume)
- New pricing changes
- Brand voice deviations
- Major feature deletions or pivots
- Hiring or contractor decisions
- Equity / financial decisions

## 6. Decisions Jacob is authorized to make in Lucas's absence
- Bug fixes (per Jacob framework: triage by severity × blast radius, smoke test gate)
- Security patches (rotate compromised secrets immediately)
- Hotfix deploys to maintain uptime
- Customer support response per established templates
- [TO FILL — anything else Lucas wants to delegate]

## 7. Communication continuity
- Customer support email: [TO FILL]
- Founder email forward (if applicable): [TO FILL]
- Twitter/X account credentials: [TO FILL]
- LinkedIn page admin access: [TO FILL]

## 8. Financial / legal
- Bank: [TO FILL]
- Accountant: [TO FILL]
- Lawyer: [TO FILL]
- Business entity: [TO FILL — LLC name + state]
- EIN: [TO FILL — stored in 1Password, NEVER in git]

---

**Storage location:** 1Password "BREAK GLASS" item, shared with Jacob's vault.
**Review cadence:** monthly, or whenever a credential rotates.
