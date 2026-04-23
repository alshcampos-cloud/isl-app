# iOS Deployment Guide — Both Apps
*Last updated: February 28, 2026*

---

## What's Done (Code Complete)

### General App (InterviewAnswers)
- [x] Privacy/consent text updated (OpenAI → Anthropic everywhere)
- [x] PrivacyInfo.xcprivacy manifest created
- [x] Info.plist mic descriptions mention Anthropic + on-device processing
- [x] IAP removed (cordova-plugin-purchase uninstalled)
- [x] Payment routing → always Stripe (external checkout)
- [x] Nursing features gated out (`VITE_APP_TARGET=general`)
- [x] Landing page skipped (→ straight to /app → login)
- [x] Track switcher hidden
- [x] Navbar nursing links hidden
- [x] Teal rebrand colors in Capacitor config
- [x] Build compiles cleanly

### Nursing App (NurseInterviewPro)
- [x] General features gated out (`VITE_APP_TARGET=nursing`)
- [x] Root "/" → redirects to "/nursing" (nursing dashboard)
- [x] "/app" → redirects to "/nursing"
- [x] "/nurse" landing page → redirects to "/nursing" (skip marketing)
- [x] "Back to App" button hidden (no general app to go back to)
- [x] "Account Settings" link hidden (links to general /app)
- [x] Separate Capacitor config (capacitor.config.nursing.json)
- [x] Build compiles cleanly

### Shared Infrastructure
- [x] `src/utils/appTarget.js` — Build-time feature gating
- [x] `scripts/build-ios.sh` — One-command build for any target
- [x] `docs/APP_STORE_METADATA.md` — Store descriptions, keywords, review notes
- [x] Three builds verified: general, nursing, web (all compile)

---

## What YOU Need to Do (Manual Steps)

### TRACK A: General App Resubmission

#### 1. App Icon (REQUIRED)
Current icon is old purple microphone. Need new teal brain icon.
- **Size:** 1024x1024 PNG (no alpha channel)
- **Rules:** No text in the icon (Apple rejects text in app icons)
- **Design:** Teal gradient + brain + sparkles (match your branding)
- **File to replace:** `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`

#### 2. Splash Screen (REQUIRED)
Current splash is generic Capacitor default.
- **Size:** 2732x2732 PNG
- **Design:** The teal InterviewAnswers.ai branded image you showed earlier
- **Files to replace (all 3 are the same image):**
  - `ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png`
  - `ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png`
  - `ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png`

#### 3. Build & Archive
```bash
# Build the general app
./scripts/build-ios.sh general

# Open Xcode
npx cap open ios

# In Xcode:
# 1. Select your team (Signing & Capabilities)
# 2. Set version to 1.1 (or whatever Apple expects)
# 3. Increment build number
# 4. Product → Archive
# 5. Distribute → App Store Connect
```

#### 4. App Store Connect
- Update screenshots (take from simulator — 6.7" iPhone 15 Pro Max + 6.1" iPhone 15 Pro)
- Update description (see docs/APP_STORE_METADATA.md)
- Update "What's New" text
- Update privacy questionnaire if needed
- Submit for review

#### 5. Screenshots Needed (6 per device size)
Suggested screens to capture:
1. Login/onboarding screen
2. Dashboard (home view with practice modes)
3. Practice mode with AI feedback
4. AI Mock Interview in progress
5. Command Center / progress tracking
6. Settings or pricing page

---

### TRACK B: Nursing App (New Submission)

#### 1. Create New App in App Store Connect
- Go to App Store Connect → My Apps → "+" → New App
- **Name:** NurseInterviewPro
- **Bundle ID:** ai.nurseinterviewpro.app (register this in Certificates, Identifiers & Profiles first)
- **SKU:** nurseinterviewpro
- **Primary Language:** English (U.S.)

#### 2. Register Bundle ID
- Go to developer.apple.com → Certificates, Identifiers & Profiles
- Identifiers → "+" → App IDs → App
- Bundle ID: `ai.nurseinterviewpro.app`
- Description: NurseInterviewPro
- Enable capabilities: (none special needed)

#### 3. App Icon & Splash
- **Icon:** Need a nursing-themed version (stethoscope + brain? teal + medical accent?)
- **Splash:** NurseInterviewPro.ai branded version
- Same sizes as general app (1024x1024 icon, 2732x2732 splash)

#### 4. Build Process
```bash
# ⚠️ IMPORTANT: The nursing build shares the same Xcode project.
# You need to change the bundle ID in Xcode after building.

# Build the nursing app
./scripts/build-ios.sh nursing

# Open Xcode
npx cap open ios

# In Xcode:
# 1. Change Bundle Identifier to: ai.nurseinterviewpro.app
# 2. Change Display Name to: NurseInterviewPro
# 3. Select your team
# 4. Set version to 1.0
# 5. Set build number to 1
# 6. Replace app icon and splash with nursing versions
# 7. Product → Archive
# 8. Distribute → App Store Connect (select the NurseInterviewPro app)
```

#### 5. App Store Connect Setup
- Fill in description, keywords, screenshots (see docs/APP_STORE_METADATA.md)
- Add screenshots specific to nursing (specialty selection, SBAR drill, nursing dashboard)
- Set up pricing (Free with IAP — Nursing 30-Day Pass $19.99)
- Complete privacy questionnaire (same answers as general app)
- Add app review notes about AI usage and payment model
- Submit for review

#### 6. Nursing Screenshots Needed
1. Specialty selection screen (8 specialties)
2. Nursing dashboard
3. Mock interview in progress
4. SBAR drill feedback
5. AI coaching session
6. Confidence builder or offer coach

---

## Build Commands Quick Reference

| Command | What it does |
|---------|-------------|
| `./scripts/build-ios.sh general` | Build general iOS app |
| `./scripts/build-ios.sh nursing` | Build nursing iOS app |
| `./scripts/build-ios.sh web` | Build web version (all features) |
| `npx cap sync ios` | Sync web build to iOS project |
| `npx cap open ios` | Open Xcode |
| `VITE_APP_TARGET=general npm run build` | Manual general build |
| `VITE_APP_TARGET=nursing npm run build` | Manual nursing build |

---

## How the Feature Gating Works

### `VITE_APP_TARGET` Environment Variable

| Value | "/" route | "/app" route | "/nursing" route | Nursing UI | General UI |
|-------|----------|-------------|-----------------|-----------|-----------|
| (not set) = `all` | Landing page | General dashboard | Nursing dashboard | ✅ Visible | ✅ Visible |
| `general` | → /app | General dashboard | → /app (redirect) | ❌ Hidden | ✅ Visible |
| `nursing` | → /nursing | → /nursing (redirect) | Nursing dashboard | ✅ Visible | ❌ Hidden |

### Files that use gating
- `src/utils/appTarget.js` — Central config (reads VITE_APP_TARGET)
- `src/App.jsx` — Route definitions, track switcher, ArchetypeCTA
- `src/Components/Landing/LandingNavbar.jsx` — Nursing nav links
- `src/Components/Landing/STARMethodGuidePage.jsx` — Footer links
- `src/Components/Landing/BehavioralInterviewQuestionsPage.jsx` — Footer links
- `src/Components/ConsentDialog.jsx` — Native-aware consent text
- `src/Components/NursingTrack/NursingTrackApp.jsx` — "Back to App" button
- `src/Components/NursingTrack/NursingDashboard.jsx` — "Account Settings" link

---

## Stripe External Payment (Epic v. Apple)

Both apps use external Stripe checkout instead of Apple IAP.

**Legal basis:** May 2025 Epic v. Apple court ruling allows external payment links in U.S. iOS apps with zero Apple commission.

**How it works:**
1. User taps "Subscribe" or "Get Pass" in the app
2. App opens Stripe checkout in a browser/webview
3. User completes payment on interviewanswers.ai
4. Stripe webhook updates Supabase (tier, pass expiry)
5. User returns to app → app checks Supabase → access granted

**For Apple review:** Include a note explaining you use external payment per the Epic v. Apple ruling. See the App Review Notes section in docs/APP_STORE_METADATA.md.

---

## Known Considerations

### Nursing App — Separate Xcode Project?
Currently both apps share ONE Xcode project (`ios/App/`). The build script swaps the Capacitor config, but you manually change the bundle ID in Xcode before archiving. If this becomes cumbersome, you could create a separate `ios-nursing/` directory with its own Xcode project. But for now, the single-project approach works.

### Web Deploy Safety
Building for iOS does NOT affect your Vercel deployment. Vercel runs `npm run build` (no VITE_APP_TARGET), which defaults to `all` — everything visible. The gating only activates when you explicitly set the env var.

### Regression Risks from Today's Changes
1. **App.jsx routing** — Added conditional routes. Risk: wrong build target could show/hide wrong features. Mitigated by defaulting to 'all'.
2. **NursingTrackApp "Back to App"** — Now null in nursing builds. Risk: if null isn't handled by child components. Mitigated: NursingLoadingSkeleton already checks `{onBack && (...)}`.
3. **NursingDashboard "Account Settings"** — Hidden in nursing builds. Risk: users can't access settings. Mitigation: Settings is in the general app; nursing app doesn't have its own settings view (potential future addition).
4. **ConsentDialog** — Different text for native vs web. Risk: text mismatch confuses users. Low risk since each user only sees one version.
5. **LandingNavbar** — Nursing link hidden in general builds. Risk: web version accidentally gets VITE_APP_TARGET set. Mitigated: Vercel doesn't set it.
