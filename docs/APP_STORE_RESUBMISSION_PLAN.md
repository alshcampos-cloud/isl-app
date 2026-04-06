# App Store Resubmission Plan — InterviewAnswers.ai
*Generated: April 5, 2026 (overnight work session)*

---

## Rejection History Summary

| Date | Guideline | Issue |
|------|-----------|-------|
| Feb 11, 2026 | 4.3(a) | Spam — looked like template app (RESOLVED) |
| Feb 15, 2026 | 5.1.1, 5.1.2 | AI data sharing not disclosed properly |
| Mar 5, 2026 | 3.1.1, 3.1.2(c) | No Restore Purchases, missing EULA links |
| Mar 12, 2026 | 5.1.1, 5.1.2, 3.1.1, 2.1(b) | Same privacy issue + IAP products without StoreKit |

---

## Root Causes Identified

### 1. Privacy/AI Consent (5.1.1 / 5.1.2) — REJECTED TWICE
**Problem:** Apple's November 2025 update to guideline 5.1.2(i) requires GRANULAR, SEPARATE consent for third-party AI data sharing. Our current consent bundles AI acknowledgment into a general "Accept & Continue" button.

**Fix Required:**
- Separate checkbox specifically for AI data consent
- Must be checked before proceeding
- Settings page must have AI Data Sharing toggle for ongoing control
- Privacy policy must state Anthropic provides "equal protection"
- Must not say "improve our AI models" (contradicts "Anthropic doesn't train on your data")

### 2. IAP Mismatch (3.1.1 / 2.1(b))
**Problem:** IAP product "Pro Monthly" is registered in App Store Connect but StoreKit is NOT implemented in the binary. Restore Purchases button exists in dead code (NativeCheckout.jsx) but is never rendered.

**Decision: Bring back Apple IAP alongside Stripe.**
- Use RevenueCat (`@revenuecat/purchases-capacitor`) for StoreKit 2
- Offer IAP inside the iOS app
- Keep Stripe for web users
- Add Restore Purchases to pricing screen AND Settings

### 3. Terms/EULA Links (3.1.2(c))
**Problem:** EULA link not in App Store description.

**Fix:** Add to App Store Connect description + verify in-app links work.

---

## Implementation Plan

### Phase 1: Privacy Fixes (Code — IN PROGRESS)
- [x] Add granular AI consent checkbox to FirstTimeConsent.jsx
- [x] Fix "improve our AI models" → "improve our service features"
- [x] Add Anthropic equal protection statement to privacy policy
- [x] Update Info.plist NSSpeechRecognitionUsageDescription
- [ ] Add AI Data Sharing section to Settings page

### Phase 2: Nursing Content Gating (Code — IN PROGRESS)
- [x] Gate nursing text in GeneralPricing.jsx behind showNursingFeatures()
- [ ] Remove unused PricingPage.jsx import from App.jsx

### Phase 3: IAP Implementation (Code — PLANNED)
- [ ] Install @revenuecat/purchases-capacitor
- [ ] Configure RevenueCat dashboard with app + products
- [ ] Create/update IAP products in App Store Connect
- [ ] Implement purchase flow for iOS users
- [ ] Add "Restore Purchases" button to pricing screen
- [ ] Add "Restore Purchases" button to Settings
- [ ] Server-side receipt validation
- [ ] Price display must match App Store Connect exactly

### Phase 4: App Store Connect Configuration
- [ ] Set Terms of Use URL in App Information
- [ ] Set Privacy Policy URL in App Information
- [ ] Add EULA link to app description text
- [ ] Update App Privacy nutrition labels to declare Anthropic data sharing
- [ ] Verify all IAP products match binary implementation
- [ ] Update Review Notes with demo credentials and AI explanation

### Phase 5: Final Polish
- [ ] Native offline/error screens (not browser errors)
- [ ] Verify splash screen works properly
- [ ] Test on iPad Air (Apple reviews on iPad)
- [ ] Remove any Stripe/external payment references visible in native app
- [ ] Full QA pass on VITE_APP_TARGET=general build

---

## RevenueCat Implementation Notes

```bash
npm install @revenuecat/purchases-capacitor
npx cap sync
```

Product IDs to register:
- `ai.interviewanswers.pro.monthly` — $29.99/month auto-renewing
- `ai.interviewanswers.general.30day` — $14.99 non-renewing
- `ai.interviewanswers.nursing.30day` — $19.99 non-renewing (nursing app only)

Key requirement: Prices shown in-app MUST exactly match App Store Connect prices.

---

## Apple Review Notes Template

```
Demo Account:
Email: appreviewer@interviewanswers.ai
Password: AppleTester1!

AI Disclosure:
This app uses Anthropic's Claude AI API to provide personalized
interview coaching feedback. User interview responses (text only)
are sent to Anthropic's servers. Audio is transcribed on-device;
no audio data leaves the device.

The app presents explicit AI data sharing consent before any data
is transmitted. Users can manage AI data sharing in Settings.

IAP Products:
- Pro Monthly ($29.99) — visible on the pricing screen
- [Others as applicable]

The "Restore Purchases" button is available on the pricing screen
and in Settings > Subscription.
```

---

## References
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Guideline 5.1.2(i) AI update (Nov 2025): https://developer.apple.com/news/?id=ey6d8onl
- RevenueCat Capacitor: https://www.revenuecat.com/docs/getting-started/installation/capacitor
- Apple EULA: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
