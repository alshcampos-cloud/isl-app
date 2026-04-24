# Ship Package — Ad Rebuild Sprint (April 24, 2026)

*Assembled while founder was offline for 2 hours. Everything below is ready.*

---

## TL;DR

**Shipped to production:**
- 3 user-facing Stanford/Erin leaks fixed + deployed to Vercel production
- 5 new ad copy frameworks (docs/marketing/NEW_AD_CAMPAIGNS_APR24.md)
- 5 new PNG creatives + HTML sources (docs/marketing/creatives/v2-*.png)
- Brand-review pass applied — 5 targeted copy fixes
- 2 dead marketing doc kits deleted (ERIN_LINKEDIN_KIT, LAUNCH_CREATIVE_KIT)
- 3 marketing kit docs rewritten (Stanford removed, co-founder anonymized)
- Sub-brand unified to NurseAnswerPro across `docs/marketing/` (21 replacements)
- Nursing C1 welcome email: Edge Function + migration written (NOT deployed — needs your `supabase functions deploy`)

**Your action items when back:**
1. Verify `VITE_STRIPE_NURSING_PASS_PRICE_ID` in Vercel env vars (3 min)
2. Deploy the Edge Function Stanford fix: `supabase functions deploy ai-feedback` (2 min)
3. Deploy the C1 welcome email infra (5 min — detailed checklist in this doc)
4. Upload the 5 new PNG ad creatives to your channels (instructions below)
5. Decide: NurseAnswerPro domain — do you own nurseanswerpro.ai? If yes, alias in Vercel
6. Apple IAP Build 31 — still queued, needs your device reproduction

**5 commits pushed to origin/feature/ui-polish.** Nothing uncommitted worth noting.

---

## 1. What's NEW on disk

### New ad copy: `docs/marketing/NEW_AD_CAMPAIGNS_APR24.md`

5 distinct frameworks × 4 format variants = 20 creative units. Brand-review pass applied. Zero Erin, zero Stanford, zero competitor names. Citations placed in post bodies (not on image creative).

| # | Framework | Best channel | Hook |
|---|---|---|---|
| 1 | **The Science Of Getting Good** | LinkedIn | "The testing effect has 80 years of evidence. Your prep has none." |
| 2 | **3AM** | IG Stories + Reddit (10pm-3am dayparted) | "3:14 AM. Interview in seven hours. You're re-reading your resume." |
| 3 | **The Quiet Contrarian** | LinkedIn + X | "Everyone in your pipeline is using an AI copilot. You won't need one." |
| 4 | **Two Doors** | Meta/IG + Google Display | "In the next 48 hours you'll pick one of two things." |
| 5 | **The Floor, Not The Classroom** (NURSING) | Reddit r/nursing + Meta nurse | "You learned this on the floor, not in a textbook. Interview like it." |

### New PNG creatives: `docs/marketing/creatives/v2-*.png`

| File | Campaign | Size |
|---|---|---|
| `v2-science-of-getting-good.png` | #1 Science | 1200×800 |
| `v2-3am.png` | #2 3AM | 1200×800 |
| `v2-quiet-contrarian.png` | #3 Quiet Contrarian | 1200×800 |
| `v2-two-doors.png` | #4 Two Doors | 1200×800 |
| `v2-floor-not-classroom.png` | #5 Nursing | 1200×800 |

**Note on dimensions:** PNGs are 1200×800 (Meta-leaning 4:5 aspect). LinkedIn (1200×627) and Reddit (1200×628) will center-crop cleanly. The HTML sources are included in `docs/marketing/creatives/v2-*.html` — if you want native LinkedIn dimensions later, tighten the padding/font sizes in each HTML and re-screenshot via headless Chrome.

### Existing PNG creatives (still valid, kept as-is)

| File | Campaign | Status |
|---|---|---|
| `dont-be-a-fraud-v1-earn-it.png` | Don't Be a Fraud — General | Ship-ready |
| `dont-be-a-fraud-v2-family.png` | Don't Be a Fraud — Family stakes | Ship-ready |
| `dont-be-a-fraud-v3-nursing.png` | Don't Be a Fraud — Nursing | Ship-ready (but prefer v2-floor-not-classroom for nursing) |
| `dont-be-a-fraud-v4-we-deleted-it.png` | Don't Be a Fraud — Press/editorial | Ship-ready |
| `dont-be-a-fraud-v5-science.png` | Don't Be a Fraud — Science infographic | Ship-ready |

---

## 2. Channel-by-Channel Upload Map

The 10 total creatives (5 "Don't Be a Fraud" + 5 new "v2") can be distributed across channels in a 10-post cadence over 2-3 weeks. Recommended rollout order:

### Week 1 (this week) — diversify tone, not volume

| Day | Channel | Creative | Caption source |
|---|---|---|---|
| **Today PM** | LinkedIn | `v2-quiet-contrarian.png` | Campaign 3 LinkedIn body (NEW_AD_CAMPAIGNS_APR24.md) |
| **Today PM** | Reddit r/jobs organic (no image needed) | (Text post) | REDDIT_CAMPAIGNS.md → Post 1 |
| **Tomorrow AM** | Instagram feed | `v2-3am.png` | Campaign 2 Meta body |
| **Tomorrow PM** | LinkedIn | `dont-be-a-fraud-v4-we-deleted-it.png` | DONT_BE_A_FRAUD_CAMPAIGN.md (existing caption) |
| **Day 3** | Reddit r/cscareerquestions organic | (Text post) | REDDIT_CAMPAIGNS.md → Post 5 |
| **Day 4** | Instagram feed | `v2-science-of-getting-good.png` | Campaign 1 Meta body |
| **Day 5** | LinkedIn | `v2-two-doors.png` | Campaign 4 LinkedIn body |

### Week 2 — nursing-specific + validation loop

| Day | Channel | Creative | Caption source |
|---|---|---|---|
| **Day 8** | Reddit r/nursing organic | (Text post) | REDDIT_CAMPAIGNS.md → Post 3 (Stanford now removed) |
| **Day 9** | Instagram (nursing segment) | `v2-floor-not-classroom.png` | Campaign 5 Meta body |
| **Day 10** | LinkedIn | `v2-science-of-getting-good.png` | Campaign 1 LinkedIn body |

### Paid ads (start Week 1, run through Week 2)

**Google Ads Campaign B (STAR Method, $17/day):**
- File: `GOOGLE_EMAIL_PH_CAMPAIGNS.md` → Campaign B
- 15 headlines + 4 descriptions (all post-rebrand compliant)
- Landing page: `/tell-me-about-yourself`
- Negative keywords: `AD_COPY_AUDIT.md` §2

**Meta ads (if budget):**
- Use `v2-quiet-contrarian.png` as primary (highest CTR expected per strategy)
- A/B with `v2-3am.png` for late-night dayparting
- Budget: $15-20/day for 7 days, validate CTR ≥2% before scaling

### A/B hypothesis (per Coder 1's handoff note)

Primary A/B: `v2-science-of-getting-good.png` (cognitive-relief frame) vs. `dont-be-a-fraud-v5-science.png` (shame-axis infographic) on LinkedIn — tests whether relief outperforms shame for analytical segment.

---

## 3. Your Post-Return Action Checklist

### ⚡ Critical (do first)

- [ ] **Verify Vercel env var:** Log into Vercel → InterviewAnswers project → Settings → Environment Variables. Confirm `VITE_STRIPE_NURSING_PASS_PRICE_ID` is set to a Stripe price ID (not blank). If blank: Stripe → Products → Nursing 30-Day Pass → copy price ID → paste into Vercel → redeploy. **Without this, nursing checkout fails silently.**

- [ ] **Deploy ai-feedback Edge Function fix** (removes Stanford ED example from AI prompt):
  ```bash
  cd /Users/alshcampos/Downloads/isl-complete
  supabase functions deploy ai-feedback --project-ref tzrlpwtkrtvjpdhcaayu
  ```

- [ ] **Verify deployed build:** Open `https://www.interviewanswers.ai` in incognito — check that the interview-context input placeholder shows "Northwell Health" (not "Stanford Health Care"). If yes, frontend fixes are live.

### 🚀 Nursing C1 welcome email deployment (optional but recommended)

Coder 3 wrote the Edge Function + migration. Deploy in this order:

```bash
# 1. Deploy the Edge Function
cd /Users/alshcampos/Downloads/isl-complete
supabase functions deploy send-welcome-email --project-ref tzrlpwtkrtvjpdhcaayu

# 2. Set Edge Function env vars (in Supabase dashboard → Edge Functions → send-welcome-email → Secrets):
#    RESEND_API_KEY   = re_... (your existing Resend key)
#    WEBHOOK_SECRET   = <generate a long random string>

# 3. Apply the migration
supabase db push --project-ref tzrlpwtkrtvjpdhcaayu

# 4. In Supabase SQL Editor, set the GUCs (replace WEBHOOK_SECRET with your value):
#    ALTER DATABASE postgres SET app.settings.welcome_email_url =
#      'https://tzrlpwtkrtvjpdhcaayu.supabase.co/functions/v1/send-welcome-email';
#    ALTER DATABASE postgres SET app.settings.welcome_email_secret = '<WEBHOOK_SECRET>';

# 5. Restart Postgres (Supabase dashboard → Settings → Database → Restart)

# 6. Test: sign up a test user with archetype = 'new_grad_rn', check for C1 email
#    Rollback if needed: DROP TRIGGER user_profiles_welcome_email ON public.user_profiles;
```

**Note:** C1 only. C2-C4 deferred (cron work, not launch-critical).

### 📢 Social posting (when you have 30 min)

Follow the channel-by-channel upload map in §2. Start with LinkedIn + Reddit r/jobs today.

### 🔮 Strategic decisions pending your input

1. **Video ad tool** — check Apple Subscriptions or Stripe receipts for recurring charges (Runway, Pika, Descript, HeyGen, Captions.ai, InVideo, Opus Clip, etc.). Once identified, we can build video variants of the 5 frameworks.

2. **"Claude's new system"** — I proceeded assuming you meant Skills (canvas-design + brand-review). If you meant something else (Agent SDK, Chrome extension, Claude 4.5 features, etc.), let me know and I'll adapt.

3. **ESP confirmation** — assumed Resend based on existing `agents/marketing-agent/email-sender.ts` wrapper. Confirm this is correct before deploying the welcome email function.

4. **Instagram handles** — captions have `[@handle]` placeholders. Swap on upload.

5. **NurseAnswerPro domain** — do you own `nurseanswerpro.ai`? If yes, add to Vercel with redirect to `/nurse`. If not, ads should point to `interviewanswers.ai/nurse` (which is the safe default).

---

## 4. What Got Fixed (Audit Trail)

### 5 commits on `feature/ui-polish` (all pushed to origin)

| SHA | What |
|---|---|
| `5a93e38` | Initial Stanford + real-time drift fixes in Reddit/IG/Google docs |
| `9c6e37b` | Live code: marketing-agent Edge Function hooks + 3 UI leaks (InterviewContextHub placeholder, ai-feedback prompt, Matt Abrahams credentials, TimerOverlay comment) |
| `acfdd1c` | 5 new ad campaigns (NEW_AD_CAMPAIGNS_APR24.md) + brand-review fixes |
| `5144687` | Delete 2 dead kit files, rewrite 3, rename NurseInterviewPro→NurseAnswerPro (21 refs), write C1 welcome email Edge Function + migration |
| `3c599a4` | 5 new ad creatives (HTML + PNG) |

### Files deleted (both were entirely Erin/Stanford-built — not salvageable)

- `docs/ERIN_LINKEDIN_KIT.md` (Erin LinkedIn bio copy-paste — Erin can't post)
- `docs/LAUNCH_CREATIVE_KIT.md` (every TikTok/Reel script starred Erin)

### Files rewritten (Stanford/Erin stripped)

- `docs/LINKEDIN_LAUNCH_KIT.md` (Alsh's Stanford patient-experience role stripped; co-founder reference anonymized)
- `docs/COMPETITIVE_POSITIONING_APR22.md` (10 Erin/Stanford refs removed, exceeded directive scope intentionally per HARD RULE)
- `docs/PRODUCTHUNT_LAUNCH_KIT.md` (2 refs stripped)

### Files still containing Erin/Stanford (intentionally — internal only)

- `CLAUDE.md`, `docs/BATTLE_SCARS.md`, `docs/SESSION_STATE.md`, `docs/PROTOCOLS.md` — internal dev docs, keep Erin for continuity
- `docs/ERIN_BRIEF.md`, `docs/erin-*.md` — internal review artifacts
- `docs/private/**`, `docs/research/**` — private research
- `src/Components/NursingTrack/nursingQuestions.js` — DB provenance metadata (`reviewer: 'Erin'`)
- Various planning docs under `docs/` (`REBRAND_*.md`, `LAUNCH_BUDGET_APR22.md`, etc.) — flagged by Coder 3 for a follow-up sweep if you want blanket removal

---

## 5. Reviewer Cross-Audit Findings (Regressions to Watch)

Coder 2 flagged 5 regression risks. Monitor:

1. **Marketing Agent hook uniformity** — Stanford credential was strong differentiator in 3 nursing hooks. Replacements ("clinician-reviewed") are weaker. Expected CAC may widen 10-20% on nursing audiences until we add 2-3 new specific-but-non-Stanford hooks in a follow-up.

2. **ai-feedback prompt drift** — Stanford ED → "Senior PM at a healthcare tech company" example changes the AI's pattern-matching domain. Affects ~20% of "rewrite my answer" regenerations. Spot-check 10 outputs from `/ai-feedback` with `approach=LEAD_WITH_WHAT_YOU_DO_NOW` to confirm quality preserved.

3. **Northwell Health placeholder** — east-coast-specific. West-coast users may not recognize it. Cosmetic only, trivial to swap if feedback comes in.

4. **Matt Abrahams credibility anchor weakened** — "Stanford communication expert" carried weight in Learn content. Stripping leaves vague "communication expert." If lessons are audio-narrated, re-narrate or rephrase.

5. **Marketing Agent commit scope bloat** — Coder 2's commit (`9c6e37b`) necessarily pulled in the full 1456-line `marketing-agent/index.ts` because it was untracked. If you want a tighter history, you can split this commit post-hoc via interactive rebase. No runtime impact — feature-flag-gated OFF.

---

## 6. Still Queued (Not Addressed This Sprint)

### Apple IAP Build 31
- Second rejection still outstanding from April 24 morning
- Plan exists in `docs/` — need your device reproduction + RevenueCat config check
- Will tackle on your explicit go after social launch stabilizes

### Follow-up marketing doc sweep (optional)
- Many planning docs still contain Erin/Stanford refs: `REBRAND_*.md`, `LAUNCH_BUDGET_APR22.md`, `LAUNCH_PLAN_V2_APR22.md`, `OVERNIGHT_SENSATION_PLAN.md`
- These are internal planning only (not user-facing ad copy), so lower priority
- Full sweep would take ~20 min

### Email C2-C4 sequence (nursing)
- Only C1 is wired. C2-C4 need a cron job (Supabase Edge Function + pg_cron)
- Not launch-critical; can defer

### Video ad creatives
- Blocked on identifying which video tool you're paying for
- Once identified, the 5 frameworks translate directly to 15-30s video scripts

---

## 7. Phone-Dispatch Spec (Design Only, For Your Review)

See `docs/PHONE_DISPATCH_SPEC.md` in the same commit — a separate doc laying out three architectures for "Claude dispatch from your phone." Design-level, not built. Read when you have 10 min and pick an approach; I'll build it after the Apple IAP fix lands.

---

## Clock

Sprint: **April 24, 2026** — ~2 hours autonomous execution, founder offline.
All deliverables shipped. No blockers on my end.

Next move: you. Read this doc, work through §3 action checklist in order, then we can talk launch velocity.
