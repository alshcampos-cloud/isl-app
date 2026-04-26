# Sprint 3 Plan (drafted while Sprint 2 coders work)

*Drafted: 2026-04-23 ~17:00 PDT, by Supervisor.*

This is a forward-looking plan for whatever ships after Sprint 2. Any item here can be picked up in a follow-up session.

---

## Context (post-Sprint 2)

After Sprint 2, we will have:
- ✅ Practice-not-cheat positioning live everywhere (hero, ethics, FAQ, onboarding)
- ✅ Trust bar (Stanford / CBS News / cog psych / App Store) in the fold
- ✅ Cog-psych trust strip below social proof
- ✅ Practice-not-cheat differentiator card in WhyISLSection
- ✅ "No autopay" + 30-day guarantee in pricing
- ✅ Onboarding pruned: Breathing skipped, FeaturePreview shrunk, SSO promoted, confirmPassword removed, cog-psych line under practice feedback
- ✅ 6 SEO blog pages cleaned of "real-time feedback"
- ✅ Bundle 1.4 MB → ~80 KB initial blocking JS (Sprint 1)

What's still on the audit backlog:

---

## Sprint 3 Candidates (ranked by leverage)

### S3-1 — Inline Interactive Demo (3h, BIG LEVER)
**Why first:** Researcher Doc 1 identified this as an unclaimed pattern in the entire AI interview-prep category. Nobody runs an inline "try it here" widget on their landing page. Conversion lift well-documented (Intercom, Figma, Linear).

**Spec:**
- New file: `src/Components/Landing/InlineDemoSection.jsx`
- Single hardcoded practice question ("Tell me about a leadership challenge..." — boilerplate behavioral)
- Text input (or voice if mobile), real Claude Haiku call via existing Edge Function `ai-feedback` with mode='practice'
- Limit: 1 free interaction per session via `localStorage._dfp` fingerprint (reuse April 15 abuse system)
- Fallback: if rate-limited, show cached sample feedback + "Sign up free for unlimited practice"
- Place: under HeroSection, above ProblemSection
- Cost guard: Haiku model ($0.25/MTok in / $1.25/MTok out) × ~500 tokens avg = $0.0006 per demo. 1000 demos = $0.60. Cheap.

**Risk:** Edge Function abuse if fingerprint bypass works. Mitigate with IP-rate-limit at Edge level (already exists per Battle Scar #3 retry patch).

### S3-2 — Restructure Features to 4 Pillars (90 min)
**Why:** FeaturesSection currently lists 9 features as bullets. Big Interview + Yoodli use 3-5 pillar pattern. Reduces scroll depth to second CTA (highest-leverage conversion lever per Researcher Doc 1).

**Spec:**
- 4 pillars: (1) Practice Mode (covers AI Interviewer + Practice Mode + Practice Prompter), (2) AI Coach (covers AI Coach + Answer Assistant), (3) Question Library (covers Curated Interviews + Flashcards + Question Generation), (4) Track & Improve (covers IRS + Streaks + Session History)
- Each pillar gets 1 screenshot + 2-3 sub-bullets
- "See all features →" link to a /features page (NEW page or just collapse)
- File: `src/Components/Landing/FeaturesSection.jsx` (rewrite the array structure)

### S3-3 — Lazy-load Below-Fold Sections + Migrate framer-motion to CSS (65 min)
**Why:** Even after Sprint 1's lazy-load, the landing page eagerly imports all 11 sections. Below-fold sections (FAQ, Pricing, CTA, Footer) could lazy-load. Plus framer-motion is ~60 KB gzipped — most landing animations are simple fade-in-on-scroll that CSS keyframes + IntersectionObserver could handle.

**Spec:**
- Convert FAQSection, PricingSection, CTASection, LandingFooter to React.lazy()
- Add Suspense boundaries with min-height skeleton placeholders
- New file: `src/utils/useFadeInOnScroll.js` — 15-line IntersectionObserver hook
- New CSS keyframes in `src/index.css`
- Migrate ProblemSection, FeaturesSection, HowItWorksSection, WhyISLSection, SocialProofBar, TestimonialsSection to use the hook (drop framer-motion imports)
- Keep HeroSection on framer-motion (genuinely complex animations)
- Result: framer-motion deferred until HeroSection scrolls into view (or even lazy-load HeroSection itself)

**Estimated bundle delta:** -40 to -60 KB gzipped on landing.

### S3-4 — NurseAnswerPro Callout Section (45 min, NEEDS ERIN SIGN-OFF)
**Why:** Zero visibility for our best-positioned vertical. Erin is the differentiating credential.

**Spec:**
- New file: `src/Components/Landing/NursingCalloutSection.jsx`
- Full-width teal banner between FeaturesSection and HowItWorksSection
- Headline: "Nurse? There's a dedicated track."
- Body: "Clinically reviewed questions. SBAR drills. Built with Stanford-affiliated clinical co-founder Erin Campos."
- CTA: "Explore NurseAnswerPro →" → `/nurse`
- Gate with `showNursingFeatures()` (per appTarget pattern)

**Blocker:** Erin should approve final copy before ship. The "Built with Stanford-affiliated clinical co-founder" framing was already approved for the TrustBar; this is similar but more prominent.

### S3-5 — Us vs Copilots Comparison Table (30 min, NEEDS ERIN SIGN-OFF)
**Why:** Single clearest article of brand differentiation. Highly shareable (founder tweet bait).

**Spec:**
- New file: `src/Components/Landing/VsCopilotsSection.jsx`
- 3-column table:
  | | InterviewAnswers.ai | Live interview copilots |
  |---|---|---|
  | When you use it | Before the interview | During the interview |
  | What interviewer sees | You, prepared | You, distracted |
  | Detection risk | Zero | Rising (CBS News 2026) |
  | Skill you build | Lasts every interview | Gone when wifi drops |
  | Cost of being caught | None | Offer rescinded |
- Mobile: stacked cards instead of table
- Place: after WhyISLSection, before PricingSection

**Blocker:** Erin/legal review on "Detection risk: Rising (CBS News 2026)" — make sure the citation is defensible.

### S3-6 — Commitment Device on IRS Baseline (60 min + needs persistence design)
**Why:** Duolingo's pre-signup commitment device is well-documented to lift signup-completion 10-20%. We have the IRS trajectory chart already.

**Spec:**
- Replace passive "trajectory you might hit" with active "Commit to 14 days — tap to lock your plan"
- On tap: `localStorage.isl_14day_commit = true` + visual confirmation
- Pass commit flag forward to SignUpPrompt — show "You committed to 14 days. Save your spot →" instead of generic CTA
- File: `src/Components/Onboarding/IRSBaseline.jsx` + `src/Components/Onboarding/SignUpPrompt.jsx` (read commit flag)

**Blocker:** Need to think through: what happens if user signs up later from a different device? Does the commit follow? Probably needs a `commitments` table eventually, but localStorage-only is fine for v1.

### S3-7 — Add AI Coach + Curated Interviews + Flashcards + Streaks/IRS to FeaturesSection (45 min)
**Why:** These features are shipped but not on landing. Currently 5 features shown, 9 shipped.

**Spec:** Append 4 new feature cards to the array in FeaturesSection.jsx. (Coder 2 is doing the hero mockup expansion in Sprint 2 but not the FeaturesSection itself — that's still on the table.)

**Conflicts with S3-2:** If we do the 4-pillar restructure (S3-2), this becomes redundant. Pick one.

---

## Sprint 3 sequencing recommendation

**If 1 hour available:** S3-3 (lazy-load + framer migration). Pure perf win, low risk.

**If 2-3 hours:** S3-1 (inline demo). Biggest unclaimed conversion lever.

**If 4+ hours:** S3-1 + S3-3 in parallel. Demo + perf together.

**Hold for Erin sign-off:** S3-4, S3-5.

**Hold for design thinking:** S3-6 (commitment device persistence model).

---

## Open product questions for the founder

1. Is "Featured in CBS News" accurate, or did CBS News just *report on the trend* (which we were not in)? If the latter, Sprint 2 TrustBar copy needs softening to something like "Cited CBS News reporting on AI-assisted interview fraud."
2. Do we have written consent from any beta users to use named testimonials? Currently all 3 testimonials say "Beta user" — fine, but real names + company logos lift conversion materially per Researcher Doc 1.
3. Is the Apple App Store live for the GENERAL audience yet (Build 30 was waiting for review as of April 15). If yes, the TrustBar's "Live on Apple App Store" badge can link to the actual listing. If no, soften to "Coming soon to the App Store."
4. What's the actual practice mode count? SocialProofBar will say 9 after Sprint 2 — need to confirm we ship 9 or whether the right number is 7 or 11.
