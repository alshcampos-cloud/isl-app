# Website Pricing Audit — 2026-04-30

**Branch:** `feature/website-pricing-update`
**Base commit:** `50d9dafc6f2c3ba51ebf97e0d78c85d0d1011ac7` (= `feature/ui-polish` HEAD)
**Stash safety net:** `stash@{0}` ("WIP feature/ui-polish before branching feature/website-pricing-update — apr30")
**Auditor:** Claude (Phase 1 of V.S.A.F.E.R.-M)

---

## Owner-locked target prices

| Tier | Old | New | Period | Stripe mode |
|---|---|---|---|---|
| Free | $0 | $0 | — | n/a |
| 30-Day Pass (general) | $14.99 | **$39** | 30 days | one-time `payment` |
| Annual Pass | $99.99 | **$129** | 365 days | **one-time `payment`** ← was `subscription` |
| ~~Pro Monthly~~ | ~~$29.99/mo~~ | KILLED | — | — |
| Nursing 30-Day Pass | $19.99 | **unchanged** | 30 days | one-time `payment` |

Free-tier monthly limits: leave alone.

---

## Surface map (what gets edited vs what stays)

| Surface | Type | In scope this run? |
|---|---|---|
| `src/Components/Landing/PricingSection.jsx` | Pre-login marketing | ✅ EDIT |
| `src/Components/Landing/FAQSection.jsx` | Pre-login marketing | ✅ EDIT |
| `src/Components/Landing/MockInterviewPracticePage.jsx` | Pre-login SEO | ✅ EDIT (stale $29.99/mo) |
| `index.html` (JSON-LD `Offer` + `FAQPage`) | Pre-login SEO/structured data | ✅ EDIT |
| `scripts/inject-seo.js` | Build-time SEO injector | ✅ AUDIT — see below |
| `supabase/functions/create-checkout-session/index.ts` | Edge function | ✅ EDIT — annual mode flip |
| **Owner action: Stripe dashboard** | New product creation | 🟡 OWNER (you create $39 + $129 products, send IDs) |
| **Owner action: Vercel env vars** | `VITE_STRIPE_*_PRICE_ID` swap | 🟡 OWNER (you set new IDs in Vercel) |
| `src/Components/GeneralPricing.jsx` | Post-login modal — bundled in website build | ⚠️ DRIFT RISK — **see "Cross-surface coupling" below** |
| `src/Components/Landing/PrivacyPage.jsx` | Pre-login marketing | ❌ no pricing copy, language untouched |
| `src/Components/Landing/TermsPage.jsx` | Pre-login marketing | ⚠️ has stale "subscription" language — flagged for OBSERVED_ISSUES |
| `public/admin.html` | Internal admin dashboard | ⚠️ has $14.99 / $19.99 in MRR estimator — flagged for OBSERVED_ISSUES (not user-facing) |
| All other Landing/* components | Pre-login marketing | ❌ no pricing copy |
| `src/App.jsx` (alerts, post-login modals) | Mixed / app-side | ❌ EXPLICIT EXCLUDE (owner: don't touch the app) |
| `src/Components/UsageLimitModal.jsx`, `Tutorial.jsx`, `UsageDashboard.jsx`, `StripeCheckout.jsx`, `NativeCheckout.jsx`, `PricingPage.jsx` (already deleted) | Post-login app surfaces | ❌ EXPLICIT EXCLUDE |
| `src/Components/NursingTrack/*` | Nursing track app | ❌ EXPLICIT EXCLUDE (only nursing landing copy in scope, and nursing prices aren't changing) |
| `src/utils/creditSystem.js` | Tier definitions | ❌ EXPLICIT EXCLUDE (header comments are stale but logic is correct) |

---

## Detailed findings — file by file

### 1. `src/Components/Landing/PricingSection.jsx` — PRIMARY

| Line | Current string | Note |
|---|---|---|
| 30 | `price: '14.99',` | The visible 30-day pass price — **EDIT to `'39'`** |
| 31 | `period: '/ 30 days',` | Keep as-is |
| 33 | `cta: 'Get 30-Day Pass',` | Keep |
| 36 | `badge: 'UNLIMITED',` | Keep |
| 75 | `<div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">` | ⚠️ Two-column grid — **needs to become 3-column** if we add Annual tier |
| 5–51 | `tiers` array has 2 entries (Free, 30-Day Pass) | **EDIT: add Annual tier ($129)** |
| 68 | `No autopay. Pay once, practice 30 days.` | Keep — still accurate for 30-day; need parallel copy for annual |
| 71 | `Start free. Upgrade when you're ready. No subscription required.` | Keep — confirms "no subscriptions" |
| 151 | `No credit card required for free tier. No auto-renew on 30-Day Pass.` | **EDIT: extend to `…No auto-renew on any pass.`** |

### 2. `src/Components/Landing/FAQSection.jsx`

| Line | Current string | Note |
|---|---|---|
| 36 | `'Start free with generous monthly limits. When you're ready for unlimited practice, grab a 30-Day Pass starting at $14.99 — no subscription, no auto-renew. Or save with the Annual All-Access at $99.99/year for the best value.'` | **EDIT both prices: `$14.99`→`$39`, `$99.99`→`$129`** |

### 3. `src/Components/Landing/MockInterviewPracticePage.jsx` — STALE $29.99/mo

| Line | Current string | Note |
|---|---|---|
| 72 | `text: 'Yes. The free tier includes 3 full AI mock interview sessions per month. No credit card is required to sign up. **Upgrade to Pro for unlimited sessions at $29.99/month.**'` | ❌ STALE — Pro is killed. **EDIT to: `Upgrade to a 30-Day Pass for $39 — no subscription, no auto-renew. Or get the Annual Pass for $129/year.`** |
| 293 | `answer="Yes. The free tier includes 3 full AI mock interview sessions per month. No credit card is required to sign up. **Upgrade to Pro for unlimited sessions at $29.99/month.**"` | Same as line 72 — DUPLICATE. **EDIT identically.** |

### 4. `index.html` — JSON-LD structured data (Google rich-result snippets)

| Line | Current value | Note |
|---|---|---|
| 60 | `"price": "14.99",` (30-Day Pass offer) | **EDIT to `"39"`** |
| 67 | `"price": "19.99",` (30-Day Nursing Pass) | Keep — nursing not changing |
| 74 | `"price": "99.99",` (Annual All-Access) | **EDIT to `"129"`** |
| 63 | `"description": "Unlimited AI mock interviews… for 30 days. No autopay."` | Keep |
| 77 | `"description": "Full access to all interview practice features for one year"` | Optionally enhance: `…for one year. One-time payment, no auto-renew.` |
| 114 | `"text": "Yes. The free plan includes mock interview sessions… Upgrade to a 30-Day Pass starting at **$14.99**… or get the Annual All-Access for **$99.99/year**."` | **EDIT both prices: `14.99`→`39`, `99.99`→`129`** |

### 5. `scripts/inject-seo.js` — build-time SEO post-processor

| Line | Behavior |
|---|---|
| 210 | Strips the `19.99` "30-Day Nursing Pass" Offer from JSON-LD when `VITE_APP_TARGET` is non-web. **Does NOT modify any other prices.** No edit needed if we update `index.html` directly. |

### 6. `supabase/functions/create-checkout-session/index.ts` — CRITICAL coupling

| Line | Current | Issue |
|---|---|---|
| 23–28 | `'annual_all_access': 'subscription'` in `PASS_TYPES` map | ❌ **Conflicts with "no subscriptions" directive.** New $129 annual must be one-time payment. **EDIT to `'annual_all_access': 'payment'`** |
| 23–28 | `'legacy_pro': 'subscription'` | Should it stay for grandfathered Pro users? See Open Questions below. |

If we flip annual to `'payment'` here without simultaneously creating a new one-time-payment Stripe product (Owner action), checkout will fail because the price ID will still point at the old recurring price → Stripe rejects `mode: 'payment'` for a recurring price. **These two changes must land together.**

---

## Stripe price-ID environment variables

| Env var | Where used | Action |
|---|---|---|
| `VITE_STRIPE_GENERAL_PASS_PRICE_ID` | `src/Components/GeneralPricing.jsx:109` | 🟡 OWNER: create new $39 product in Stripe → set new ID in Vercel |
| `VITE_STRIPE_ANNUAL_PRICE_ID` | `GeneralPricing.jsx:110`, `NursingPricing.jsx:90` | 🟡 OWNER: create new $129 **one-time-payment** product in Stripe → set new ID in Vercel. Note: shared between general + nursing flows. |
| `VITE_STRIPE_NURSING_PASS_PRICE_ID` | `NursingPricing.jsx:89` | ❌ Not changing |
| `VITE_STRIPE_PRO_PRICE_ID` | `StripeCheckout.jsx:69` | ⚠️ **STALE — Pro killed.** Code path still references it. See Open Questions. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `StripeCheckout.jsx:10` | Unchanged |

**Owner action checklist for Stripe (do these BEFORE Phase 3 APPLY):**
1. Create product "30-Day Pass" — $39.00 USD — one-time payment
2. Create product "Annual Pass" — $129.00 USD — **one-time payment** (NOT subscription)
3. Archive old products: $14.99 30-Day Pass, $99.99 Annual Subscription, $29.99 Pro Monthly (or leave dormant for grandfathered users)
4. Send me the two new `price_…` IDs
5. After my Phase 3 APPLY, set new IDs in Vercel env vars (production AND preview environments)

---

## Cross-surface coupling — the GeneralPricing modal drift risk

`src/Components/GeneralPricing.jsx` is a post-login modal but **bundles into the website build** (`VITE_APP_TARGET=all`). It pulls price from `import.meta.env.VITE_STRIPE_GENERAL_PASS_PRICE_ID` (the env var) AND has hardcoded display copy `$14.99 / $99.99`.

| Line | Hardcoded value | Effect if we leave it alone |
|---|---|---|
| `GeneralPricing.jsx:2` | `// Shows 30-day pass ($14.99) and Annual All-Access ($99.99/year)` | Comment only — no user impact |
| (display copy in modal) | $14.99, $99.99 | **Visible to web users post-login** when they trigger the upgrade modal — they'll see $14.99 advertised, then Stripe will charge $39 (because env var swap) → support nightmare |

**The owner's stated scope is "do not touch the app."** If we honor that strictly, the GeneralPricing modal will show stale prices to web users post-login. There are three options — owner picks:

- **Option α — Strict exclusion.** Leave `GeneralPricing.jsx` as-is. Live drift between landing page ($39) and post-login modal ($14.99 in copy, $39 charged). Risk: users dispute charges. Recommend banner: "Pricing updated — see /pricing for current rates." But that's still a kludge.
- **Option β — Include the post-login modal.** Treat `GeneralPricing.jsx` as a "website surface bundled into the app" and update its display copy. Same edit pattern as `PricingSection.jsx`. Doesn't touch true app logic (NursingTrack, App.jsx core flows). I recommend this.
- **Option γ — Defer to a follow-up run.** Ship website-only now, schedule a separate "in-app pricing copy refresh" run for `GeneralPricing.jsx`, `NursingPricing.jsx`, `StripeCheckout.jsx`, `NativeCheckout.jsx`, `UsageLimitModal.jsx`, `Tutorial.jsx`, `UsageDashboard.jsx`, and the `App.jsx` alert strings.

Strongly recommend **β** for this run because the env-var swap will create a real charge mismatch the moment we deploy. Web users tap "Get 30-Day Pass" on the landing page → lands them in the post-login modal → that modal still says "$14.99" → they click → Stripe charges $39. That's a chargeback and a 1-star App Store review waiting to happen.

---

## App-side surfaces I am NOT touching this run (per owner directive)

These all contain stale `$14.99` / `$29.99` / `$99.99` strings. Logged in `OBSERVED_ISSUES.md` for a separate run:

- `src/App.jsx` lines 819, 823, 1318–1322, 1682, 1741, 1801, 5512, 6253, 8014, 8119
- `src/Components/UsageLimitModal.jsx:335`
- `src/Components/Tutorial.jsx:243`
- `src/Components/UsageDashboard.jsx:657`
- `src/Components/StripeCheckout.jsx:183` (and stale Pro ID reference at line 69)
- `src/Components/NativeCheckout.jsx:102`
- `src/Components/NursingTrack/NursingPricing.jsx:291`
- `src/Components/NursingTrack/NursingLandingPage.jsx:496` (nursing landing — only if nursing landing is "website" by your definition; ask)
- `src/Components/NursingTrack/NursingTrackApp.jsx:191, 380, 387`
- `src/Components/NursingTrack/NursingTutorial.jsx:391`
- `src/Components/NursingTrack/NursingCommandCenter.jsx:1019`
- `public/admin.html:829, 830, 836` (internal MRR estimator)
- `src/utils/creditSystem.js:5–7, 56–125` (tier definition header comments)
- `src/utils/googleAdsTracking.js:89` (JSDoc example)

---

## Open questions for owner (Phase 2 inputs)

1. **GeneralPricing modal drift — α / β / γ?** I strongly recommend β (include the post-login modal in this run, bounded to display copy only — no logic changes).
2. **Stripe `legacy_pro` mode in checkout edge function** — keep `'subscription'` for grandfathered Pro users (so they can still manage their existing $29.99/mo Stripe subscription via SubscriptionManagement modal), or remove entirely?
3. **`VITE_STRIPE_PRO_PRICE_ID` in `StripeCheckout.jsx:69`** — does any code path still try to start a new Pro checkout? If yes, we have a dead/broken button somewhere. If no, the env var can be cleared and the import removed (but that's app-side cleanup → flag for follow-up).
4. **Annual Pass is `'subscription'` mode in current edge function (line 26).** Owner: if I flip it to `'payment'` and you create a new one-time-payment $129 product in Stripe, the existing annual customers' recurring subscriptions remain intact (they're separate Stripe records). New buyers go to one-time. Confirm that's the intended behavior.
5. **Nursing landing page (`NursingLandingPage.jsx`)** — is this "website" or "app" by your definition? It's pre-login when accessed via `nurseinterviewpro.ai` funnel. If website, I should include it. Currently shows $19.99 (nursing pass, unchanged) so no edit needed regardless — but worth confirming the boundary.
6. **`TermsPage.jsx` lines 134–137** still say "Subscription and Payments" / "subscriptions are billed through Stripe" / "cancel your subscription at any time." With Pro killed and annual flipped to one-time, this language is misleading. **In scope** to soften? (Logging in OBSERVED_ISSUES if no.)

---

## Verified clean — these surfaces have NO pricing strings

- `HeroSection.jsx`, `CTASection.jsx`, `FeatureCarousel.jsx`, `FeaturesSection.jsx`, `HowItWorksSection.jsx`, `LandingNavbar.jsx`, `LandingFooter.jsx`, `InlineDemoSection.jsx`, `ManifestoSection.jsx`, `SocialProofBar.jsx`, `ProblemSection.jsx`, `TrustBar.jsx`, `CogPsychTrustStrip.jsx`, `TestimonialsSection.jsx`, `WhyISLSection.jsx`, `FeatureToolbox.jsx`, `PracticeNetworkCanvas.jsx`
- `STARMethodGuidePage.jsx`, `InterviewQuestionsPage.jsx`, `BehavioralInterviewQuestionsPage.jsx`, `TellMeAboutYourselfPage.jsx`, `EthicsPage.jsx`, `InterviewCoachingLessonsPage.jsx`, `InterviewPrepPodcastPage.jsx`, `NursingInterviewQuestionsPage.jsx` — all only mention "Free tier" / "No credit card required" / "3 sessions/month" — no pricing copy that drifts
- `public/team.html`, `public/house-hunt.html` — no pricing
- `vercel.json` — no pricing references

---

## Phase 1 result

**Total files I propose to edit in Phase 3:** 5 (assuming Option β)

1. `src/Components/Landing/PricingSection.jsx` — primary pricing display, add Annual tier
2. `src/Components/Landing/FAQSection.jsx` — single line update
3. `src/Components/Landing/MockInterviewPracticePage.jsx` — kill stale $29.99/mo Pro mention (×2)
4. `index.html` — JSON-LD `Offer` blocks + FAQPage answer (3 prices)
5. `supabase/functions/create-checkout-session/index.ts` — flip `annual_all_access` from `'subscription'` to `'payment'`
6. _(if Option β)_ `src/Components/GeneralPricing.jsx` — display copy only

**Total Stripe products owner must create:** 2 (new $39 30-day, new $129 annual one-time)
**Total Vercel env var swaps owner must do:** 2 (`VITE_STRIPE_GENERAL_PASS_PRICE_ID`, `VITE_STRIPE_ANNUAL_PRICE_ID`)

Awaiting owner answers to the 6 open questions before I write `PRICING_CHANGE_PROPOSAL.md`.
