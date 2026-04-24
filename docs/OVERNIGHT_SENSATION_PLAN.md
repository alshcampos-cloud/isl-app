# Overnight Sensation Plan — InterviewAnswers.ai
*Master plan consolidating the April 11, 2026 agent run.*
*Author: Supervisor agent | Session: 5:15–7:00 PM PDT | Agents: 7 (Researcher×4, Finance, Reviewer, Auditor) + Coder tasks*
*Budget cleared by founder: $1,500 (stretch $2,000) | Launch window: Apr 13–26 | PH launch: Tue Apr 21 00:01 PT*

**READ THIS FIRST. Everything else in `docs/research/agent_run_apr11/` and `docs/research/growth/` is source material for this plan.**

## Table of contents

1. [The one-sentence plan](#the-one-sentence-plan)
2. [🚨 Launch-Blocker P0s (5 items, $315, tonight)](#-launch-blocker-p0s-must-fix-before-any-traffic)
3. [📅 Tonight (Apr 11, 5:30–10:00 PM)](#-tonight-april-11-530-pm--1000-pm-pdt)
4. [📅 Tomorrow / Sunday Apr 12 prep day](#-tomorrow-sunday-april-12--prep-day)
5. [📅 Weeks 1–2 daily cadence + day-by-day table](#-weeks-12-april-1225--daily-cadence)
6. [💰 Paid Budget — $1,500 across 14 days](#-paid-budget--1500-across-14-days-apr-1326)
7. [📊 Organic channels — ranked](#-organic-channels--ranked)
8. [🎯 Success criteria at Day 30](#-success-criteria-at-day-30)
9. [🎲 The "Overnight Sensation" scenarios](#-the-overnight-sensation-scenarios-honest-estimates)
10. [⛔ Things NOT to do](#-things-not-to-do-top-5)
11. [🗂️ Cross-references](#️-cross-references--where-everything-lives)
12. [⏱️ Time budget for the founder](#️-time-budget-summary-for-the-founder)
13. [🧾 Final checklist](#-final-checklist-print-this)

---

## The one-sentence plan

**Kill the 5 launch-blocker P0s tonight ($315), deploy the Anthropic retry patch before any traffic hits, run a phased $1,500 paid push layered on top of organic Reddit + TikTok + creator content, aim for 400–600 signups / 20–40 paying users in 30 days — with a long-tail 5–10% shot at a creator video going viral and pulling that number 10×.**

---

## 🚨 Launch-Blocker P0s (Must Fix Before Any Traffic)

These are ordered from "hardest blocker" to "soft blocker." Do them in order. Do not skip ahead.

### P0-1 — Anthropic billing + rate limit tier
**Current state:** almost certainly Tier 1 (50 RPM, $100/mo cap). A PH spike will 429 the first 30–60 concurrent users.
**Fix (20 min, tonight):**
1. Go to [console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing)
2. Add **$250 credits** (lands on **Tier 3** per ANTHROPIC_CAPACITY.md §3; Tier 3 = ~$200 cumulative threshold)
3. Enable **auto-reload: $100 when balance drops below $50**
4. Go to [console.anthropic.com/settings/limits](https://console.anthropic.com/settings/limits) and set **monthly spend limit = $500** (hard cap — Anthropic default is too lax)
5. Wait 5 min, verify org is **Tier 3** in the dashboard
6. **Validation:** Tier 3 should show **Sonnet RPM 2,000 / ITPM 800k, Haiku RPM 2,000 / ITPM 1,000k**
7. **Live monitoring URL for launch day:** [console.anthropic.com/settings/usage](https://console.anthropic.com/settings/usage) — keep this open during PH launch to watch token burn in real time
**Why it matters:** Without this, the retry wrapper (P0-2) cannot actually recover from rate limits — upstream capacity is the real ceiling. Tier 2 is the floor; Tier 3 is the launch-day safe choice.

### P0-2 — Edge Function retry wrapper (the Battle Scar #3 lie)
**Current state:** `CLAUDE.md` Battle Scar #3 claims retry-with-backoff is implemented. It is not. **All 5 Anthropic call sites** do raw `fetch` with no retry, no 429 handling, and return raw error bodies as 200 OK:
- `generate-question/index.ts:85` (primary)
- `ai-feedback/index.ts:681` (nursing path)
- `ai-feedback/index.ts:818` (general path)
- `health-check/index.ts:67` (monitoring)
- `scheduled-health-check/index.ts:135` (cron monitoring)

Verified April 11 at 5:27 PM via grep. The health-check functions will flip alerting to false negatives during a PH launch if they're not patched too — they'll think Claude is down when it's just rate-limited.

**Additional drift:** Battle Scar #3 quotes `0s/1s/2s` backoff; the new helper uses `1s/2s/4s` (more correct per Anthropic's own 429 guidance). Flag this and update Battle Scar #3 during refine pass.

**Fix (already drafted, needs deploy):**
1. Review `docs/EDGE_FUNCTION_RETRY_PATCH.md` — exact patches for each call site
2. The new shared file `supabase/functions/_shared/anthropic.ts` is already written (256 lines, zero deploy risk — nothing imports it yet)
3. Apply patches A, B, C from the doc (primary AI paths)
4. Apply Patch D (new) to health-check + scheduled-health-check — same one-line swap pattern
5. Deploy order: generate-question → ai-feedback → health-check → scheduled-health-check
6. Smoke test with `docs/SMOKE_TEST_PROTOCOL.md` after each deploy
7. **Client-side companion (already done):** `src/utils/fetchWithRetry.js` was updated April 11 at 5:27 PM to stop retrying on 429/503 (prevents client-side piling onto a rate-limited upstream). Build + redeploy web: `npm run build && npx vercel --prod`.
8. **Client UI handlers** for the new 429/503 responses in `src/App.jsx` `handleAIInterviewerSubmit` (~line 3386) and `handlePracticeSubmit` — search for `response.ok` patterns and add friendly error messaging. See `EDGE_FUNCTION_RETRY_PATCH.md` §Client-side companion changes.
9. **Estimated time: 60 min** (30 min patching, 20 min deploy, 10 min smoke + UI handlers)
**Why it matters:** Without retry, one upstream 429 = broken user session = **charged usage on a failure** (Battle Scar #8) = lost conversion AND lost credit. Users never come back.

**Optional P2 hardening (~15 min extra):** Haiku fallback. If Sonnet 429s repeatedly, the helper can transparently degrade to Haiku 4.5 for the same request — cheaper and keeps the experience alive instead of erroring. Not required for launch; add if you have time.

**Known tech debt — do NOT fix tonight:** 14 more `await supabase.auth.signOut()` sites remain across the codebase (verified April 11, 2026 via grep):
- `SettingsPage.jsx:165` (handleDeleteAccount — lower priority because user is already deleted server-side)
- `FirstTimeConsent.jsx:87` (consent decline — edge case)
- `AuthPage.jsx:35` (anonymous session cleanup)
- `Onboarding/ArchetypeOnboarding.jsx:200, 214` (onboarding flow)
- `Onboarding/SignUpPrompt.jsx:82, 163`
- `ProtectedRoute.jsx:160` (password reset — edge case)
- `App.jsx:8789` (unknown, audit later)
- `NursingTrack/SpecialtySelection.jsx:38, 39` and `NursingTrack/NursingDashboard.jsx:103, 104` (gated out of general iOS build — safe for April 21 launch but needs fix before nursing track ships on iOS)
- `googleOAuth.js:47` (post-OAuth cleanup — likely fine, different code path)

**Do not mass-edit these this week.** Battle Scar #13 (string replacement typos) + launch-pressure + untested edges = production break. Schedule a sweep in month 2 after the launch dust settles. Only the SettingsPage.jsx sign-out button was the user-facing P0 — that is already fixed in build 30. Everything else is either edge-case or gated out of the current build.

### P0-3 — Supabase Auth email deliverability
**Current state:** DNS is live (SPF/DKIM/DMARC for Resend — verified April 11 via dig). Unknown whether custom SMTP is wired up in Supabase dashboard. If it's not, you're capped at **2 emails per hour** on Supabase's default mailer.
**Fix (15 min, tonight):**
1. [Supabase Dashboard → Auth → SMTP Settings](https://supabase.com/dashboard/project/tzrlpwtkrtvjpdhcaayu/auth/settings)
2. If "Enable Custom SMTP" toggle is OFF → flip ON
3. Fill in:
   - Host: `smtp.resend.com`
   - Port: `465` (SSL)
   - User: `resend`
   - Password: Resend API key (get from [resend.com/api-keys](https://resend.com/api-keys))
   - Sender: `noreply@interviewanswers.ai`
   - Sender name: `InterviewAnswers.ai`
4. Save
5. [Auth → Rate Limits](https://supabase.com/dashboard/project/tzrlpwtkrtvjpdhcaayu/auth/rate-limits) → set "Emails sent per hour" to **300** (default after enabling custom SMTP is still 30/hr — raise it explicitly)
6. **Also upgrade Resend to Pro ($20/mo)** at [resend.com/pricing](https://resend.com/pricing) — free tier 100/day hard cap kills the launch before Supabase rate limits even bite
7. **Validation:** incognito signup with a fresh Gmail → check Gmail primary inbox for confirmation + check [mail-tester.com](https://www.mail-tester.com) score (target ≥9/10; if <9, do NOT send the warmup batch — fix headers first)
8. **Live monitoring URL for launch day:** [resend.com/emails](https://resend.com/emails) — keep open during PH launch to watch bounces/complaints in real time
**Why it matters:** Without this, every other signup from paid or organic traffic gets a broken confirmation email → they bounce. The Google OAuth escape hatch covers ~60% of users, not 100%.

### P0-4 — Vercel Hobby → Pro (ToS violation)
**Current state:** The app is a paid commercial SaaS (Stripe + IAP) running on Vercel Hobby. **This violates Vercel ToS.** Vercel can suspend the account during peak traffic with zero warning.
**Fix (5 min, tonight):**
1. [vercel.com/alshcampos-clouds-projects/interview-as-a-second-language-app/settings/billing](https://vercel.com/alshcampos-clouds-projects/interview-as-a-second-language-app/settings/billing)
2. Upgrade to Pro ($20/month — solo founder, per seat)
3. Enable analytics + speed insights if you're about to spend $1,500 on traffic — otherwise you fly blind
**Why it matters:** Nothing breaks day-to-day on Hobby, but a PH launch day could trip ToS enforcement. Don't gamble.

### P0-5 — Supabase Free → Pro (hot upgrade)
**Current state:** Free tier has 60 direct connections / ~30 via pooler, 500 MB DB, 5 GB/mo egress. INFRA_CAPACITY §4 identifies pooler connection saturation as the real launch-day bottleneck above 500 signups — well within our 14-day target of 400–600.
**Fix (5 min, tonight OR hot-upgrade mid-launch):**
1. [supabase.com/dashboard/project/tzrlpwtkrtvjpdhcaayu/settings/billing](https://supabase.com/dashboard/project/tzrlpwtkrtvjpdhcaayu/settings/billing)
2. Upgrade to **Pro ($25/month)** — takes ~60 seconds, zero downtime
3. This unlocks: 8 GB DB, 250 GB egress/mo, 2M Edge Function invocations, 90–200 direct connections depending on compute size
**Why it matters:** Hot-upgrade is possible mid-launch per INFRA_CAPACITY §6 item 1, but doing it tonight removes one thing you'd have to watch during peak traffic. $25/mo is cheap insurance.
**Alternative:** Skip tonight if cash-sensitive, watch the Supabase dashboard Usage page on launch day, upgrade the moment egress hits 3 GB or DB connections spike above 30 in-use.

### Total P0 budget: $65/month recurring + $250 one-time Anthropic deposit = **$315 tonight**
*(Vercel Pro $20 + Resend Pro $20 + Supabase Pro $25 + Anthropic $250)*

---

## 📅 Tonight (April 11, 5:30 PM – 10:00 PM PDT)

Apple is reviewing 1.0 (30). We have ~24–48 hrs. Use it.

### 5:30 PM – Fix 5 P0s (sequence matters)
1. [ ] **P0-1** — Anthropic billing (20 min) → $250 one-time
2. [ ] **P0-3** — Resend Pro + Supabase SMTP + rate limits (15 min) → $20/mo
3. [ ] **P0-4** — Vercel Pro upgrade (5 min) → $20/mo
4. [ ] **P0-5** — Supabase Pro upgrade (5 min) → $25/mo
5. [ ] **P0-2** — Review `EDGE_FUNCTION_RETRY_PATCH.md`, apply 5-site patch, deploy, smoke (60 min)

**Checkpoint 7:15 PM:** All 5 P0s green. If any are red, STOP and fix before moving on.
**Total spend at checkpoint:** $315 out-of-pocket tonight.

### 7:00 PM – Apple Small Business Program enrollment
Apple takes 30% on IAP by default. Small Business Program drops it to 15% if annual revenue <$1M. This **doubles effective LTV** and makes every paid channel cheaper. **Free to enroll** if you qualify.
1. [ ] [developer.apple.com/app-store/small-business-program](https://developer.apple.com/app-store/small-business-program) → enroll
2. [ ] Expected processing: 2–3 business days (will not block launch)

### 7:15 PM – Install PostHog (45 min)
You cannot launch paid ads without funnel analytics. Google Ads conversion tracking tells you *what* but not *why*. PostHog shows the drop-off point.
1. [ ] `npm install posthog-js`
2. [ ] Add a provider wrapper in `src/main.jsx` or equivalent
3. [ ] Wire 6 events: `landing_view`, `signup_start`, `signup_complete`, `first_practice`, `paywall_view`, `purchase_complete`
4. [ ] Deploy
5. [ ] Verify events land in PostHog dashboard with a test user
6. [ ] Free tier: 1M events/month — more than enough

### 8:00 PM – Warm-up the email domain (start the clock)
Resend + Supabase SMTP is configured, but the sending domain has never sent real mail through Resend. Gmail/Outlook spam filters interpret "0 → 1000 emails in 24 hours" as suspicious. Warmup is the fix.
1. [ ] Send 20 real confirmation emails tonight (create + delete test accounts across Gmail/Outlook/Yahoo/iCloud)
2. [ ] Send 50 tomorrow, 100 Sunday, 200 Monday — ramping by 2×/day until PH launch
3. [ ] Watch Resend dashboard → Logs for bounces/complaints (zero is the target)

### 8:30 PM – Landing page interactive demo (parallel track)
Cold paid traffic needs to see the product work BEFORE being asked to sign up. The current hero has a static mockup card.
1. [ ] Record a 30-second screen capture of a full AI mock interview exchange (QuickTime → Command+Shift+5 → Record Selected Portion)
2. [ ] Save as MP4, compress to <2MB
3. [ ] Embed as `<video autoplay muted loop playsInline>` in `src/Components/Landing/HeroSection.jsx` — replace the static mockup card
4. [ ] Deploy
5. [ ] Alternative if video isn't possible: animate the "Current Question" card with CSS to cycle through 3 questions

### 9:00 PM – Pre-launch outreach spreadsheet
Build the list of 50 people who upvote PH on launch day (see `docs/PRODUCTHUNT_LAUNCH_KIT.md` §5).
1. [ ] Open a Google Sheet
2. [ ] 5 columns: name, category (close/beta/tech/nursing/other), DM channel, DM sent?, upvoted?
3. [ ] Fill in 50 rows tonight
4. [ ] Don't message them yet — wait until the night before PH launch

### 9:30 PM – TikTok scripts + pre-launch prerequisites

TikTok scripts are **already written** — see `docs/LAUNCH_CREATIVE_KIT.md` §TikTok scripts. Just film them tomorrow. Nothing to draft tonight.

### Pre-launch prerequisites (LAUNCH_PLAN §2, previously uncounted)

These are NOT P0 blockers (the P0s are above) but they ARE launch-blockers in the second-tier sense: if they're red, you launch a broken app. Do them Saturday/Sunday before any paid traffic.

1. [ ] **Merge `feature/nursing-track` → `main`** (MEMORY.md says this is still pending as of Feb 22 — 58 files diverged). Production is currently deployed from the feature branch. If the feature branch is stable, merge it; if not, cherry-pick the nursing track to main and re-deploy. **Do NOT skip this** — running a $1,500 push off a non-mainline branch makes every bug fix a cherry-pick dance.
2. [ ] **Mobile responsive pass on 5 landing routes on a real iOS + real Android device** (not DevTools). The 5 routes: `/`, `/nursing`, `/onboarding`, `/pricing`, `/star-method-guide`. Check: tap targets ≥44px, CTA visible above the fold, no horizontal scroll, font sizes legible. Fix anything broken.
3. [ ] **AI quality sweep**: Run the 20 sample prompts from `docs/AI_QUALITY_CRITERIA.md` through the live production ai-feedback Edge Function. Confirm scores are in the expected range. If the AI is giving weird or wrong feedback, fix that BEFORE driving paid traffic — otherwise you pay $7 per signup to show users a broken experience.

### 10:00 PM – Stop. Sleep. Apple could approve at any moment.

---

## 📅 Tomorrow (Sunday April 12) – Prep day

**Apr 12 is PREP day, not launch day.** Product Hunt is pinned to Apr 21 (Tue). The paid push starts Apr 13 (Mon). So Sunday is for setting up the things that absolutely cannot break mid-launch.

Wake up, check Apple email. Three scenarios:

### Scenario A — Apple approved overnight
Perfect. The Apple milestone unlocks Apple Search Ads + the App Store link in your TikTok bios + the ability to ask for reviews. Continue with the prep day below.

### Scenario B — Apple still in review
No change. None of Sunday's work depends on Apple being approved. Continue with the prep day below.

### Scenario C — Apple rejected
Read rejection carefully. If it's the sign-out bug (shouldn't be — build 30 fixed it), the rejection is informational only (we already shipped the fix). If it's something new, triage and respond within 24 hours. You can still do Sunday's prep work — web signups work regardless of iOS status.

### Sunday prep checklist (Apr 12)
1. [ ] 8:00 AM — Check Apple email
2. [ ] 9:00 AM — **Merge `feature/nursing-track` → `main`** (pre-launch prerequisite). Test smoke paths after.
3. [ ] 10:00 AM — **Film TikTok videos 1–3** using scripts from `docs/LAUNCH_CREATIVE_KIT.md` (don't post yet — post Monday)
4. [ ] 12:00 PM — **Mobile real-device test** on 5 landing routes (iPhone + Android). Fix anything broken.
5. [ ] 1:00 PM — **AI quality sweep**: run 20 prompts from `docs/AI_QUALITY_CRITERIA.md` through production ai-feedback. Log results.
6. [ ] 3:00 PM — **Finalize PostHog funnel**: verify all 6 events fire on a test signup walking through the full funnel.
7. [ ] 4:00 PM — **Research creators**: shortlist 5 nurse TikTok creators (10k–80k followers, recent viral hits in last 30 days). Save to the outreach spreadsheet.
8. [ ] 5:00 PM — **Polish the Product Hunt draft**: one more pass on the tagline, description, first maker comment. Save draft in PH as "ready to publish" state.
9. [ ] 6:00 PM — **Send Resend warmup batch #2** (50 test emails across 4 providers)
10. [ ] 7:00 PM — Dinner. Don't burn out — you have 9 more days of this.

### Monday launch (Apr 13)
1. [ ] 8:00 AM — Post TikTok video 1 (the "Score My Answer" one) at optimal time
2. [ ] 9:00 AM — Start Meta CBO $200 test (Wave 1 begins — see `PAID_ROI_MODEL.md` §3)
3. [ ] 12:00 PM — First helpful Reddit comment in r/newgradnurse (no link, value only)
4. [ ] 3:00 PM — Check PostHog + Resend + Anthropic dashboards
5. [ ] 6:00 PM — Log day 1 metrics; compare to targets
6. [ ] 9:00 PM — Retrospective + plan tomorrow

---

## 📅 Weeks 1–2 (April 12–25) – Daily cadence

Every day, without exception:

**Morning (1 hour):**
- Post 1 TikTok video (native vertical, 15–60 sec)
- Post 1 helpful comment in r/newgradnurse, r/jobs, r/careerguidance
- Check Resend dashboard for bounces/complaints (should be zero)
- Check Anthropic console for rate limit headroom
- Check PostHog funnel — is conversion holding?

**Afternoon (30 min):**
- Respond to every new app review on the App Store (good and bad — esp. bad, kindly)
- Reply to every comment on yesterday's TikTok
- Adjust paid spend based on CAC signal (kill rules in `docs/research/agent_run_apr11/PAID_ROI_MODEL.md` §5)

**Evening (30 min):**
- Log the day: signups, spend, biggest learning
- Update `docs/SESSION_STATE.md` before bed
- Adjust tomorrow's plan based on today's data

### Specific day-of channels (calendar verified: Apr 11 2026 is Saturday):

| Day | TikTok post | Reddit action | Paid action |
|---|---|---|---|
| **Apr 12 (Sun)** | Film videos 1–3 | 3 helpful comments (no links) | Research Meta/TikTok creators, no spend |
| **Apr 13 (Mon)** | Video 1 live | 3 helpful comments | Start Meta $200 test |
| **Apr 14 (Tue)** | Video 2 live | 1 top-level value post in r/jobs | Start TikTok Spark Ads $150 |
| **Apr 15 (Wed)** | Video 3 live | 3 helpful comments | Reddit promoted post ($100) |
| **Apr 16 (Thu)** | Video 4 | 3 helpful comments | Influencer #1 outreach + deposit $250 |
| **Apr 17 (Fri)** | Video 5 | 1 top-level post in r/careerguidance | Influencer #2 outreach + deposit $250 |
| **Apr 18 (Sat)** | Video 6 | 3 helpful comments | Review Wave-1 data; halt losers |
| **Apr 19 (Sun)** | Video 7 | 3 helpful comments | Influencer #1 posts go live |
| **Apr 20 (Mon)** | Video 8 | 3 helpful comments | Pre-launch outreach Tier 1 DMs sent |
| **Apr 21 (Tue)** | **PRODUCT HUNT LAUNCH 00:01 PT** (see `docs/PRODUCTHUNT_LAUNCH_KIT.md`) | Cross-post PH link to 3 subs | All hands on PH comments all day |
| **Apr 22 (Wed)** | Recap video | Thank-you post w/ rank screenshot | Reserve $250 → winner channel |
| **Apr 23 (Thu)** | Video 9 | 3 helpful comments | ASA scale if winning |
| **Apr 24 (Fri)** | Video 10 | 3 helpful comments | Small newsletter sponsor ($100) |
| **Apr 25 (Sat)** | Rest day | — | — |

**Product Hunt is pinned to Tuesday April 21** — exactly 10 days post-Apple-approval, honoring LAUNCH_PLAN §3's "need reviews first" rule. By Apr 21 you should have 10+ real App Store reviews, warmed email reputation, and Wave 1 paid signal data to know which channel to lean on during PH day.

**Do NOT launch PH on Apr 15 (Wed) or earlier.** The LAUNCH_PLAN rule exists because PH drives a traffic spike and you want your funnel + reviews + reputation tuned BEFORE that spike, not after. Launch time: **00:01 AM PT sharp** on Apr 21. Alsh sets an alarm.

---

## 💰 Paid Budget — $1,500 across 14 days (Apr 13–26)

Full breakdown in `docs/research/agent_run_apr11/LAUNCH_PLAN.md` §4 and `docs/research/agent_run_apr11/PAID_ROI_MODEL.md` §3. Short version:

### Wave 1 — Apr 13–15 (Mon–Wed) — $350 — Signal buy
- Meta CBO: **$200** (2 ad sets × $100, $25/day cap, 2 creatives each)
- TikTok Spark Ads: **$150** (boost best organic video)
- **Kill condition:** Meta CPC > $3 OR CAC > $25 after $150 spent → halt Meta, redirect to TikTok

### Wave 2 — Apr 16–20 (Thu–Mon, pre-PH) — $650 — Double down + influencer seed
- Micro-influencer #1: **$250** deposit Apr 16 (nurse TikTok, 10–30k followers, flat fee, 2 videos live by Apr 19)
- Micro-influencer #2: **$250** deposit Apr 17 (different sub-niche, same format, live by Apr 20)
- Reddit promoted post: **$100** (r/jobs or r/careerguidance, Apr 15)
- Meta scale-up **IF** CAC < $12 on day 3: **$150** (else → more TikTok)
- **Kill condition:** influencer <3 paying users in 72 hrs post-video → do not book #3

### Wave 3 — Apr 21–26 (Tue–Sun, PH day + reserve) — $500 — Amplify proof
- Reserve for winner channel: **$250** (deployed Apr 22 after PH day results)
- Apple Search Ads (brand terms only): **$150** (post-Apple-approval, Apr 22–26)
- Sponsored small newsletter ($200 range): **$100** (Apr 24)

### Stretch +$500 (if founder wants)
Third micro-influencer ($250, Apr 18 deposit) + extra Spark Ads boost ($250, Apr 19) — NOT more Meta. Rationale in `PAID_ROI_MODEL.md` §4.

### 14-day blended expectation
- **Total spend:** $1,500
- **Expected paid signups:** ~225 (LAUNCH_PLAN projection)
- **Expected paying users:** **~18 base case** (range 6–48, from PAID_ROI_MODEL §6 with nursing-targeted LP and 5% signup→paid)
- **Blended paid CAC (paying user):** **~$83** at 18 payers (`$1,500 ÷ 18`)
- **Net contribution week 1:** ~$357 (15 passes × $14.99 + 3 annuals × $99.99, net of Apple 15% + Stripe + 20% AI COGS)
- **Net cash position week 1:** **–$1,143** (PAID_ROI_MODEL §6 base case — this is NORMAL, paid doesn't pay back in week 1)
- **Breakeven horizon:** 60–90 days via repeat purchase and 15% annual mix

**Where the $167 figure comes from (and why we don't use it here):** LAUNCH_PLAN §4 uses a more conservative 4% signup→paid conversion (→9 payers → $167 CAC). Both models are defensible; the 5% Finance assumption is the midpoint of the 2–8% published range for nursing-targeted LPs. We run the plan on the 18-payer / $83 CAC number and track variance in PostHog. **If Day-4 data shows 4% or below, switch to the $167 model and tighten kill criteria immediately.**

**Do not panic at –$1,143 on day 7.** Paid acquisition buys data. The organic + compound effects of week 2-4 are what actually close the gap.

---

## 📊 Organic channels — ranked

From the Launch Plan agent output, ordered by expected signups per hour of founder time:

| Rank | Channel | Why | Time budget |
|---|---|---|---|
| **1** | **TikTok organic** | Lowest cost per view in 2026, nursing audience lives here, founder-on-camera is the unfair advantage | 1 hr/day |
| **2** | **Apple Search Ads** (once approved) | Highest intent channel that exists for an app | 15 min setup, then $ |
| **3** | **Reddit (helpful comments first, posts second)** | Skeptical audience, but high trust if you lead with value | 30 min/day |
| **4** | **LinkedIn** (founder-led; clinical co-founder in-voice-only, never named publicly) | Clinical credibility is the differentiator here — no names or institutional affiliations in public copy | 2 posts/week |
| **5** | **Product Hunt** | One-day spike + permanent backlink, NOT sustainable | 1 full day |
| **6** | **Nursing Facebook groups** | Clinical co-founder's network (inbound referral only — never named publicly), high trust, low reach | 15 min/day |
| **7** | **Nursing school Discord servers** | Tiny but 100% target market | 15 min/week |
| **8** | **Hacker News** | Wrong audience for this product | skip |
| **9** | **IndieHackers** | Fellow builders, not end users | 1 post only |
| **10** | **Cold email to career coaches** | Expensive on time, low conversion | skip for now |
| **11** | **Podcast guesting** | Long lead time | week 3+ only |
| **12** | **X/Twitter organic** | Dead for job-seeker traffic in 2026 | skip |
| **13** | **SEO blog content** | 3–6 month payoff, wrong horizon for this push | week 4+ |

**Don't do:**
- Google Ads (killed, see `docs/GOOGLE_ADS_KILL_NOTE.md`)
- Cold DM outreach on LinkedIn
- "Influencer bundles" sold by agencies (markup is 40%+ vs direct outreach)
- Paid press releases (nobody reads them)
- Upwork gig-worker "marketing" services

---

## 🎯 Success criteria at Day 30

| Metric | Target | Stretch |
|---|---|---|
| Total signups (paid + organic) | 400 | 600 |
| Paying users | 20 | 40 |
| Organic TikTok >50k views | 1 | 3 |
| App Store reviews (4.5★+ avg) | 10 | 25 |
| PostHog funnel identifies #1 drop-off | Yes | Yes |
| One paid channel < $10 CAC/signup | Yes | Yes |
| Blended all-channels CAC | <$6/signup | <$4/signup |

### What happens at Day 30
- **Hit the base:** raise month-2 budget to $2k–$3k, double down on the winner channel
- **Miss the base:** the answer is NOT "spend more." It's "fix the funnel drop-off PostHog surfaced and re-run Wave 1 only"
- **Hit the stretch:** the app is working — book the Product Ops Associate conversation with Jacob, start the hire pipeline properly, and commit to a month-3 ASO/SEO investment

---

## 🎲 The "Overnight Sensation" scenarios (honest estimates)

### Scenario 1 — Creator video compounds (probability: 5%)
One of the 2 micro-influencer videos hits the TikTok algorithm. 500k+ views. Spark Ads on the winning video while it's still trending pushes to 1–3M. Nursing aggregator reshares.
- **Outcome:** 800–2,000 paying users in 14 days, $8k–$20k net revenue
- **Required:** choose creators with recent organic 100k+ views (not just 50k follower counts), move fast when one hits

### Scenario 2 — Press pickup (probability: 3%)
A nursing newsletter, a career TikTok roundup, or a local news story features the tool. Free distribution worth $2k–$5k.
- **Outcome:** 300–800 signups from one feature, long tail for weeks
- **Required:** have a journalist-ready one-pager (`docs/PRESS_KIT.md` — doesn't exist yet, write it week 2)

### Scenario 3 — Product Hunt #1 with full momentum transfer (probability: 2%)
PH launch captures top 1 + the attached HN/Reddit reshare cycle.
- **Outcome:** 1,500–3,000 signups, 100+ paying users in 7 days
- **Required:** Everything the PH kit describes + perfect product readiness on launch day

**Combined long-tail probability: ~10%.** Build for the base case, stay ready for the tail. Do not bet the plan on it.

---

## ⛔ Things NOT to do (top 5)

1. **Don't restart Google Ads.** Re-entry criteria in `docs/GOOGLE_ADS_KILL_NOTE.md` are not met. It will waste $1,500.
2. **Don't launch Product Hunt before Apr 21** — the LAUNCH_PLAN §3 prerequisite (2 weeks + real reviews) exists for a reason. Launching earlier = every PH visitor to an unreviewed, unwarmed-email, unoptimized-funnel app = permanent lost user.
3. **Don't build features this month.** The feature set is done. This is execution. Anything that isn't launch prep or a P0 fix is a distraction. Specifically: do NOT start Jacob JD v2, do NOT build the PM dashboard, do NOT touch the Interview Formats plan file, do NOT enable the HomeV2 feature flag for cold traffic.
4. **Don't spend a dollar of paid before P0s are green.** Money goes to waste on a broken funnel.
5. **Don't trust any dashboard number that isn't PostHog funnel + Vercel analytics + Resend logs.** Vanity metrics (TikTok view counts, PH upvotes) are directional, not measurable. Decisions ride on the funnel.

---

## 🗂️ Cross-references — where everything lives

| Topic | Doc |
|---|---|
| **Start here** | `docs/README_APR_11_2026.md` |
| Tonight action card | `docs/TONIGHT_ACTION_CARD.md` |
| Launch day ops card (Apr 21) | `docs/LAUNCH_DAY_OPS_CARD.md` |
| Creative kit (TikTok + Reddit + Meta) | `docs/LAUNCH_CREATIVE_KIT.md` |
| Erin co-founder brief (draft to send) | `docs/ERIN_BRIEF.md` |
| Email capacity | `docs/research/agent_run_apr11/EMAIL_CAPACITY.md` |
| Anthropic capacity + billing | `docs/research/agent_run_apr11/ANTHROPIC_CAPACITY.md` |
| Infra capacity (Supabase/Vercel) | `docs/research/agent_run_apr11/INFRA_CAPACITY.md` |
| Launch plan (organic + waves) | `docs/research/agent_run_apr11/LAUNCH_PLAN.md` |
| Paid ROI model | `docs/research/agent_run_apr11/PAID_ROI_MODEL.md` |
| Reviewer cross-check notes | `docs/research/agent_run_apr11/REVIEW_NOTES.md` |
| Product Hunt kit | `docs/PRODUCTHUNT_LAUNCH_KIT.md` |
| Google Ads kill note | `docs/GOOGLE_ADS_KILL_NOTE.md` |
| Email deliverability status | `docs/EMAIL_DELIVERABILITY_STATUS.md` |
| Edge Function retry patch | `docs/EDGE_FUNCTION_RETRY_PATCH.md` |
| Anthropic retry wrapper code | `supabase/functions/_shared/anthropic.ts` |
| Client retry fix | `src/utils/fetchWithRetry.js` |
| Battle scars (updated #21-23) | `docs/BATTLE_SCARS.md` |
| Session state | `docs/SESSION_STATE.md` |
| Growth strategy memo (earlier) | `docs/research/growth/GROWTH_STRATEGY_MEMO.md` |
| Budget allocation (earlier) | `docs/research/growth/BUDGET_ALLOCATION.md` |

---

## ⏱️ Time budget summary for the founder

| When | Task | Time |
|---|---|---|
| Tonight (Apr 11) | 5 P0 fixes + PostHog + demo video + outreach sheet | ~4 hrs |
| Sunday (Apr 12) | Prep day: merge, film TikToks, mobile test, AI quality sweep, PH polish | ~6 hrs |
| Apr 13–20 (week 1) | Daily cadence + Wave 1/2 paid management | ~2.5 hrs/day |
| **Apr 21 (PH launch)** | All hands: comments, replies, cross-posting, monitoring | ~12 hrs |
| Apr 22–26 (post-PH) | Wave 3 deployment + retrospective | ~2 hrs/day |
| Apr 27 – May 10 (week 3–4) | Daily cadence continues, focused on winners | ~1.5 hrs/day |
| **Total founder time month 1** | ~75 hrs | ~2.5 hrs/day avg |

At Alsh's hourly effective rate (day job + Koda Labs), 75 hours is real money — roughly $4,500–$6,000 of founder opportunity cost. Factor this into "is paid acquisition worth it" math. The answer is yes when the alternative is "spend the same 75 hours and $0 and only hit ~200 signups organically," because the $1,500 lifts the ceiling from 200 to 400–600.

---

## 🧾 Final checklist (print this)

Tonight (Apr 11 by 10 PM):
- [ ] P0-1 Anthropic $250 → Tier 3 confirmed
- [ ] P0-2 Retry wrapper deployed (5 call sites patched + client build redeployed)
- [ ] P0-3 Resend Pro + Supabase custom SMTP + 300/hr rate limit + mail-tester ≥9/10
- [ ] P0-4 Vercel Pro upgraded
- [ ] P0-5 Supabase Pro upgraded
- [ ] Apple Small Business Program enrollment submitted
- [ ] PostHog installed + 6 events firing
- [ ] Resend warmup batch #1 sent (20 emails)
- [ ] Pre-launch outreach spreadsheet has 50 names

Sunday (Apr 12 by 8 PM):
- [ ] `feature/nursing-track` merged to `main`
- [ ] TikTok videos 1–3 filmed (ready to post Monday)
- [ ] Mobile real-device test passed on 5 routes
- [ ] AI quality sweep clean
- [ ] PH draft polished
- [ ] Warmup batch #2 sent (50 emails)

By Apr 21 (PH launch):
- [ ] 10+ App Store reviews
- [ ] 3 Wave-1 days of paid data in PostHog
- [ ] 2 micro-influencer videos live (or 1 if #1 stalls)
- [ ] 50-person outreach list DM'd the night before
- [ ] All 6 monitoring dashboards pinned

Success at day 30:
- [ ] 400+ total signups
- [ ] 20+ paying users
- [ ] 1+ organic TikTok hit (>50k views)
- [ ] One paid channel < $10 CAC

---

*End of master plan. Apr 11, 2026. Session agents: 7. Docs: 10. Code files: 4. Total cost identified tonight: $315. Expected 30-day outcome: 400-600 signups, 20-40 paying users, 5-10% shot at 10× via creator virality.*
