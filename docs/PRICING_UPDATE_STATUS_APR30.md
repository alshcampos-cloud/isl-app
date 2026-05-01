# Website Pricing Update — Status Report for Owner Return

**Session start:** 2026-04-30 ~6:00 PM
**Pricing commit landed:** 2026-04-30 ~6:35 PM (`58396ff`)
**Audit doc commit:** 2026-04-30 ~7:05 PM (`187c359`)
**Current branch:** `feature/website-pricing-update`
**Pushed?** No. You review before deploy.

---

## TL;DR

Done:
- ✅ Website pricing copy: $14.99 → $39 (30-day), $99.99 → $129 (annual)
- ✅ Annual Pass tier ADDED to website (was missing — Pricing Section was 2-tier, now 3-tier)
- ✅ Stale `$29.99/mo Pro` references killed on `MockInterviewPracticePage.jsx`
- ✅ JSON-LD structured data (Google rich-snippet prices) updated
- ✅ Build verified clean (0 errors, 16 SEO routes regenerated)
- ✅ Audit document committed (`docs/PRICING_AUDIT_2026-04-30.md`)
- ✅ Two discrete commits — easy rollback per file or per scope

NOT done (intentionally — needs your action or your call):
- ❌ Stripe products: I did NOT touch Stripe. You confirmed you logged in and handled it.
- ❌ Vercel env vars: I did NOT modify. You set new `price_…` IDs.
- ❌ Push: Nothing pushed. You approve the diff.
- ❌ Edge function (`create-checkout-session`): UNTOUCHED per your "keep the api" directive
- ❌ GeneralPricing.jsx post-login modal: UNTOUCHED per "do not touch the app" — **CRITICAL DRIFT RISK, see below**
- ❌ iOS / Apple IAP / RevenueCat: UNTOUCHED per "do not bring in the apple payment method"
- ❌ Rebrand-stale copy: AUDITED — none found. Website is already 99% rebrand-aligned.

---

## What changed (commit `58396ff`)

| File | Change |
|---|---|
| `src/Components/Landing/PricingSection.jsx` | 30-day `$14.99` → `$39`. Added Annual Pass tier ($129/year, "BEST VALUE" badge). Grid 2-col → 3-col. Fixed "No credit card required" conditional (now gates on free tier only, not on `!highlighted` which would have falsely tagged the new Annual tier). |
| `src/Components/Landing/FAQSection.jsx` | Pricing FAQ answer prices updated. "Annual All-Access" → "Annual Pass". |
| `src/Components/Landing/MockInterviewPracticePage.jsx` | Killed two stale `$29.99/month Pro` references (one in JSON-LD, one in visible FAQ). Replaced with new pricing language. |
| `index.html` | JSON-LD `Offer` blocks: `14.99` → `39`, `99.99` → `129`. FAQPage answer rewritten with new prices and one-time-payment language. |

**Total: 4 files. +35 / -13 lines.** Clean diff. Build passes.

---

## 🚨 CRITICAL — DRIFT RISK YOU NEED TO CLOSE BEFORE PUSHING

**`src/Components/GeneralPricing.jsx` still hardcodes `$14.99` and `$99.99` in the post-login upgrade modal.**

This component bundles into the website build. When a web user signs up and sees the in-app upgrade prompt, this modal still displays the OLD prices in its copy. But once you update Vercel env vars (`VITE_STRIPE_GENERAL_PASS_PRICE_ID`, `VITE_STRIPE_ANNUAL_PRICE_ID`) to point at your new $39 / $129 Stripe products, Stripe will charge the NEW price.

**Result:** User sees "$14.99" advertised in the modal → clicks → Stripe charges $39 → support ticket / chargeback.

I did NOT fix this because you said "do not touch the app." Three options when you return:

- **Option A (recommended, 5 min):** Let me update the display copy ONLY in `GeneralPricing.jsx`. No logic changes. No iOS/IAP changes (the file already branches on `isNativeApp()`). Web users see correct $39 / $129; iOS users still go through Apple IAP unchanged.
- **Option B:** You don't deploy this commit until iOS IAP / App Store Connect is also updated to $39 / $129. (Bigger workstream.)
- **Option C:** Deploy as-is, accept the drift, monitor support tickets. (I don't recommend.)

**Repeating: if you push this commit AND swap Vercel env vars without addressing GeneralPricing.jsx, you will charge web users $39 while showing them $14.99 in the modal copy.**

---

## What you need to do when you return

### To deploy the pricing change safely:

1. **Decide on GeneralPricing.jsx** (Option A / B / C above). Tell me, I'll execute or stand down.
2. **Verify Stripe products exist** with the new prices:
   - 30-Day Pass — $39.00 — one-time payment
   - Annual Pass — $129.00 — (consider whether one-time or subscription; see "API note" below)
3. **Verify Vercel env vars** updated to new `price_…` IDs (production AND preview):
   - `VITE_STRIPE_GENERAL_PASS_PRICE_ID` → new $39 product price ID
   - `VITE_STRIPE_ANNUAL_PRICE_ID` → new $129 product price ID
4. **Review the diff:**
   ```bash
   cd /Users/alshcampos/Downloads/isl-complete
   git log --oneline feature/ui-polish..feature/website-pricing-update
   git diff feature/ui-polish..feature/website-pricing-update
   ```
5. **Push the branch:**
   ```bash
   git push -u vercel-repo feature/website-pricing-update
   # Then create PR on github.com → review → merge → Vercel auto-deploys
   ```
   _(Or merge into `feature/ui-polish` first if that's your intended deploy branch.)_

### Smoke test after deploy:

- Visit interviewanswers.ai → pricing section shows 3 tiers: Free / 30-Day Pass $39 / Annual Pass $129
- View page source — JSON-LD `Offer` elements show new prices (Google rich snippets refresh in 1-7 days)
- `/mock-interview-practice` — FAQ "Is it really free?" no longer mentions $29.99/mo
- Click "Get 30-Day Pass" → onboarding → after signup, upgrade modal → **Stripe charges $39**, NOT $14.99 (this is where the GeneralPricing drift will bite you if not fixed)

---

## API note (your "keep the api" directive)

I did NOT touch `supabase/functions/create-checkout-session/index.ts`. The current `PASS_TYPES` mapping still treats `annual_all_access` as `'subscription'` mode. Per your earlier "no subscriptions" directive this is technically inconsistent — but you explicitly said keep the API for now to minimize risk. Two ways to reconcile:

- If your new $129 Stripe product is ALSO a subscription (e.g., recurring annual), the code is fine as-is. Customers see "Annual Pass" on the site, get charged $129/yr recurring. Brand language "no autopay" on the site is misleading in that case.
- If your new $129 Stripe product is one-time payment, the edge function will REJECT it with `mode: 'subscription'`. Checkout will fail. You'd need to flip line 26 to `'payment'`.

**Tell me which one you set up in Stripe and I'll handle the edge function in a separate small commit if needed.** This is a 1-line fix.

---

## Rebrand audit findings

You asked me to bring the website "up to date" with rebrand themes (voice changes, prompter changes, anti-cheat positioning, practice mode). I dispatched the Researcher and Auditor agents in parallel.

**Result: NO rebrand changes needed on customer-facing pages.** The website is already 99% aligned.

**Both agents flagged false positives:**
- **Researcher** said `ManifestoSection.jsx:73` had an incomplete sentence. I read the file myself — line 73 is just one line of a multi-line paragraph; the full sentence reads cleanly: *"We killed a real-time coaching feature along the way — it turns out live whispers aren't practice, and practice is the whole point."* This IS the canonical kill story. Brand-correct.
- **Auditor** said `WhyISLSection.jsx:7` had stale "live-interview prompter" language. The line is in a card titled "Practice, not cheat" with description *"We deleted our live-interview prompter. No in-ear AI. No 'undetectable' mode."* That's literally the canonical rebrand positioning per `MEMORY.md`. Brand-correct.

**Verified clean (per direct grep — zero customer-facing hits):**
- Voice/audio references — none on landing pages or `index.html`
- Practice mode references — all framed correctly (no stale "live" language)
- "Live Prompter" customer-facing — all references either say "Practice Prompter" or are in past-tense rebrand context ("We deleted our live prompter")
- "real-time" — only used in NEGATION ("No real-time answers in your ear") which is the brand-approved usage
- Competitor names ("Final Round", "Cluely", etc.) — none on website
- "Erin" / "Stanford" — none on website

**One genuinely stale location (NOT changed, out of scope):**
- `public/admin.html` line 876: `'Live Prompter': { key: 'live_prompter_questions', ... }` — internal admin dashboard analytics key. Not customer-facing. The DB column `live_prompter_questions` would also need a migration to rename. Out of scope per your "the website" definition. Logged for a future internal cleanup pass.

**Conclusion: per your "do not break anything!" directive, the right call is to NOT make speculative changes when nothing is actually stale. The website is brand-aligned today.**

---

## Commits made this session

```
187c359 docs: add pricing audit doc that drove the website pricing update
58396ff Website pricing update: $14.99→$39 30-day, $99.99→$129 annual
```

Branch base: `50d9dafc` (= `feature/ui-polish` HEAD = current production).

To rollback either commit individually:
```bash
git revert 58396ff   # rolls back pricing only, keeps audit doc
git revert 187c359   # rolls back doc only
git reset --hard 50d9dafc   # nukes everything in this branch
```

The pre-session dirty tree is preserved at `stash@{0}` ("WIP feature/ui-polish before branching feature/website-pricing-update — apr30"). Recover with `git stash pop` after returning to `feature/ui-polish`.

---

## What I did NOT do (per your scope directives)

- iOS/Apple IAP/RevenueCat: zero changes
- Edge functions / API: zero changes
- Stripe dashboard: zero touches
- Vercel env vars: zero touches
- Database / Supabase migrations: zero changes
- App.jsx / NursingTrack/* / GeneralPricing.jsx / NursingPricing.jsx / StripeCheckout.jsx / NativeCheckout.jsx / UsageLimitModal.jsx / Tutorial.jsx / UsageDashboard.jsx / SubscriptionManagement.jsx: zero changes
- Push: zero pushes

---

## Time spent

~6:00 PM start → ~7:10 PM stand down. Single discrete pricing commit + audit doc + this status report. Came in well under your 3-hour bypass budget.

The fleet (Researcher, Auditor, agents) are stood down. Ready to resume when you return. Most likely next step: you tell me Option A/B/C on the GeneralPricing.jsx drift question, I knock out a 5-line fix, and you push.
