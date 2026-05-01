# iOS Pricing Update — Deferred Workstream

**Created:** 2026-04-30 23:55 PT, after web pricing $39/$149 went live.
**Why deferred:** Build 43 in App Store review + iOS price change creates display↔charge mismatch (chargeback risk) until matching iOS code change ships in a new build. This is a 3–5 day cycle, not 15 minutes.

---

## Current state (as of Apr 30 2026)

| Surface | Display copy | Charged amount | Source |
|---|---|---|---|
| **Web** (Stripe) | $39 / $149 | $39 / $149 | New one-off Stripe prices wired to `VITE_STRIPE_*_PRICE_ID` env vars |
| **iOS** (Apple IAP) | $14.99 / $99.99 | $14.99 / $99.99 | Old App Store Connect IAPs, untouched |

The iOS display ($14.99/$99.99) currently MATCHES what Apple IAP charges, so no chargeback risk **right now**. The risk would appear if someone updated Apple IAP prices without simultaneously updating the iOS display copy.

The current `GeneralPricing.jsx` has **platform-branched display**:

```jsx
<span className="text-4xl font-extrabold text-navy-700">
  {isNativeApp() ? '99' : '149'}
</span>
{isNativeApp() && <span className="text-lg text-slate-400">.99</span>}
```

This branch must REMAIN until Apple IAP is updated. After Apple update, the branch must be REMOVED (set web=iOS=$39/$149).

---

## Prerequisites before starting iOS work

- [ ] **Build 43 is APPROVED by Apple and live on the App Store** (not in review). Verify in App Store Connect → My Apps → InterviewAnswers → status shows "Ready for Sale" (or similar).
- [ ] **Web pricing has been live + stable for at least 7 days** (gives time for any chargebacks/support tickets to surface)
- [ ] **You have a clear strategic decision** on whether iOS should match web or stay lower as a launch promo. See "Strategic considerations" below.

---

## Strategic considerations BEFORE clicking anything

### Option A — Match web ($39 / $149 on iOS)

Pros:
- Brand consistency
- Higher revenue per iOS sale (~$28 net after Apple's 30% on $39.99 vs $14.99 net of $10.49 today — ~$17.50/sale uplift)
- Cleaner support story ("our pricing is $39")

Cons:
- iOS conversion typically drops 30–50% in this category at $39.99 vs $14.99
- Apple still takes 15–30% — net per sale is significantly lower than web
- Customers who downloaded the iOS app for "$14.99" pricing may feel bait-and-switched (especially if they were on the old TestFlight)

Math at expected conversion:
- Today: 100 iOS visits × 5% conv × ($14.99 - $1.50 Apple cut) = ~$67/100 visits
- After: 100 iOS visits × 2.5% conv × ($39.99 × 0.7 net) = ~$70/100 visits

Net revenue roughly equal at first; iOS volume halves but per-sale revenue ~3× higher.

### Option B — Keep iOS at $14.99 / $99.99 (cheaper than web)

Pros:
- Maximizes iOS download volume during launch
- "iOS exclusive" framing if you want to push the App Store
- Less risk of chargebacks / 1-star reviews from price-sensitive users
- Web at $39 still does the heavy revenue lifting; iOS becomes a top-of-funnel growth channel

Cons:
- Brand inconsistency ("why is iOS cheaper?")
- Customers may screenshot the price difference — minor PR awkwardness
- Lost revenue per iOS sale

### Option C — Mid-tier ($24.99 / $99.99 on iOS)

Compromise. Closer to web parity but accounts for iOS conversion sensitivity. Still takes the conversion hit but smaller. Less effective brand signal.

### Recommendation

**Default to Option B (keep iOS lower) for the first 30 days post-launch.** Reason: you want iOS volume during the launch window to drive App Store ranking. You can always raise iOS prices after — easier than lowering them.

After 30 days of data, decide based on actual conversion rates. If iOS converts well at $14.99, keep it. If it converts poorly, you have nothing to lose by raising to $39.

---

## When you decide to update iOS pricing — full procedure

### Step 1 — App Store Connect: update IAP prices

1. Open https://appstoreconnect.apple.com → My Apps → **InterviewAnswers.ai**
2. Top tab: **In-App Purchases** (or **Features → In-App Purchases & Subscriptions**)
3. You'll see a list of products. Identify each:
   - `general.30day` (or similar) — current $14.99, target $39.99
   - `annual_all_access` (or similar) — current $99.99, target $149.99
   - `nursing.30day` — current $19.99, **DO NOT CHANGE**
4. Click into **`general.30day`** → tab: **Pricing and Availability** (or **Pricing**)
5. Click **+ Schedule a New Price**
6. Choose tier: **Tier 39** ($39.99 USD) or use Apple's custom-pricing UI for exact $39 if available in your regions
7. Start date: **today** (or future date if scheduling)
8. End date: leave blank (open-ended)
9. Save
10. Repeat for **`annual_all_access`** → **Tier 149** ($149.99)

Apple changes are visible across regions within ~30 minutes. **No app review required** for price changes on existing IAPs.

### Step 2 — RevenueCat dashboard sync

1. Open https://app.revenuecat.com → your project (`72b8c4e6` per tabs open)
2. Left sidebar: **Products** (or **Entitlements**)
3. For each product, verify the price reflects the new App Store price:
   - If RC auto-syncs (default), wait ~5 min and refresh
   - If not, look for a **"Refresh from App Store"** button per product
4. Verify each product shows the correct new price + correct entitlement mapping

### Step 3 — Update iOS display in code

Remove the platform branching from `GeneralPricing.jsx`:

```jsx
// BEFORE (current state):
<span className="text-4xl font-extrabold text-navy-700">
  {isNativeApp() ? '14' : '39'}
</span>
{isNativeApp() && <span className="text-lg text-slate-400">.99</span>}

// AFTER (post-Apple-update):
<span className="text-4xl font-extrabold text-navy-700">39</span>
```

Same pattern for the annual price block (`{isNativeApp() ? '99' : '149'}` → just `149`) and the savings/per-month line (`{isNativeApp() ? 'save over 30%' : 'save over 65%'}` → just `'save over 65%'`).

**Don't forget the file header comment** — update the platform-branched documentation block at the top of `GeneralPricing.jsx` to reflect that branching is removed.

If you keep iOS lower (Option B), update the iOS branch values from `14` → `14` (no change) and `99` → `99` (no change). The branch stays. Just verify display matches Apple IAP.

### Step 4 — Build new iOS version (Build 44)

Standard iOS build flow:
```bash
cd /Users/alshcampos/Downloads/isl-complete
npm run cap:ios   # builds + opens Xcode
# In Xcode: Product → Archive → distribute via App Store Connect
```

Increment build number first in iOS pbxproj or via Xcode. The current build number from MEMORY.md was 43.

Submit Build 44 to Apple. **No new review needed** if only IAP prices changed — Apple's review focuses on app behavior, not IAP price points. But Build 44 itself goes through standard binary review (~1-3 days).

### Step 5 — TestFlight verification (before submitting Build 44)

While Build 44 is internal-only on TestFlight:
1. Install on test device
2. Sign in with sandbox tester
3. Tap "Get 30-Day Pass" — Apple StoreKit dialog should show **$39.99** (or whatever you set)
4. Verify in-app display matches dialog (no chargeback risk)
5. Complete sandbox purchase → verify `pass_holder` tier in Usage screen
6. Repeat for Annual Pass at $149.99

If display ≠ Apple charge, FIX the iOS display branch before submitting Build 44.

### Step 6 — Post-Build-44 monitoring

After Build 44 is approved + live:
1. Monitor App Store conversion rate for 7 days. Compare to Build 43 baseline.
2. Monitor support email for "I was charged $X" tickets
3. Monitor RevenueCat for failed transactions (mode/price mismatches surface here)
4. If conversion crashes >50%, consider rolling back iOS to lower price (just update App Store Connect IAP prices back — no Build 45 needed if display still matches)

---

## Things NOT to do

- ❌ Do NOT change Apple IAP prices while a build is in App Store review (Build 43 currently)
- ❌ Do NOT change Apple IAP without simultaneously updating GeneralPricing.jsx iOS branch (creates display↔charge mismatch)
- ❌ Do NOT delete old IAP products (Apple doesn't always let you, and existing customers' subscription records may break)
- ❌ Do NOT change `nursing.30day` pricing — owner explicitly said nursing stays at $19.99
- ❌ Do NOT change RevenueCat product configurations directly (the prices come FROM Apple, not from RC). Apple is the source of truth for IAP prices.

---

## Files that will need editing when you do this work

| File | Lines | Change |
|---|---|---|
| `src/Components/GeneralPricing.jsx` | ~2-7 (header comment) | Update branching policy comment |
| `src/Components/GeneralPricing.jsx` | ~241-244 (30-day price block) | Remove `isNativeApp() ? '14' : '39'` branch |
| `src/Components/GeneralPricing.jsx` | ~321-326 (annual price block) | Remove `isNativeApp() ? '99' : '149'` branch |
| `src/Components/GeneralPricing.jsx` | ~318 (savings line) | Remove `isNativeApp() ? '30%' : '65%'` branch |
| `src/Components/GeneralPricing.jsx` | ~324 (monthly equiv) | Remove `isNativeApp() ? '$8.33' : '$12.42'` branch |
| iOS `pbxproj` | Build number | Increment 43 → 44 |

If you choose Option B (keep iOS lower), only update the file header comment to clarify the branching strategy. No code edits needed — branch logic stays.

---

## Owner-only actions (I cannot do these via CLI/MCP)

- App Store Connect IAP price changes (Stripe-style block on financial dashboards)
- RevenueCat dashboard product config (RC has no public API for this)
- Xcode build + archive + distribute (requires user to be at Mac with Xcode)
- TestFlight purchase test (requires physical device + sandbox account)

I CAN do:
- Code edits to remove the iOS branch in GeneralPricing.jsx
- Build verification (`npm run build:ios-general`)
- Commit + push the iOS code change
- Document the rollout in a session-state file

---

## Question to ask before you start

**"Has Build 43 been approved and live on the App Store for at least 7 days?"**

- If NO → wait. Don't start.
- If YES → proceed to "Strategic considerations" above and pick A/B/C.

---

## Related context

- Web pricing change: commit `c709950` on `main` (Apr 30, 2026)
- Current Stripe price IDs (web):
  - `price_1TSA8GJtT6sejUOKbIm3M8Km` ($39 30-Day Pass, one-off)
  - `price_1TSAKHJtT6sejUOKYsUYDfMj` ($149 Annual Pass, one-off)
- Edge function: `create-checkout-session` deployed Apr 30, `annual_all_access` mode = `'payment'`
- MEMORY.md entry: "APRIL 30 ~23:55 PT — WEB PRICING UPDATE LIVE ✅ (iOS deferred)"
