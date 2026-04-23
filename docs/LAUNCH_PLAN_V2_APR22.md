# Launch Plan v2 — 30-Day Aggressive Growth Playbook
*PM Agent, Koda Labs LLC — April 22, 2026*
*Scope: Apr 22 → May 21, 2026 (30 days)*
*Owner of this plan: Alsh (founder). PM Agent maintains weekly.*

---

## TL;DR for the Founder

You asked to "prep for launch again" and "get users fast." Here's the honest read:

1. **You are launch-ready on web TODAY.** One knob is un-turned: Resend Pro ($20/mo). Everything else — Supabase Pro, Vercel Pro, Anthropic Tier 3, Stripe, RevenueCat, Custom SMTP, SEO — is verified green in `docs/INFRASTRUCTURE_STATUS.md`.
2. **iOS is a separate wave.** Build 30 has been sitting in Apple's queue since Apr 17. Do not couple web launch to Apple's timeline. Web launches Apr 24 (Thursday). iOS approval becomes a free amplification event whenever it lands.
3. **$1,500 marketing budget is real but small.** It buys 1 channel of proven CAC, not 4 channels of untested CAC. The plan below spends $1,500 across 30 days, front-loading $15/day tests and only scaling what converts.
4. **Realistic 30-day signup target: 200–350.** Not 1,000. The marketing-agent docs sketch bigger numbers; those assume PH + iOS + press hits all land. The plan below delivers 200+ even in the worst-case (no iOS, no PH, no press), and goes to 500+ if iOS lands Week 2.
5. **North-star metric: paying customers, not signups.** At ~3–5% free-to-paid in this category, 300 signups = 10–15 paying = ~$200 MRR / ~$600 pass revenue. This is not a business yet; it's a signal test.

**What this plan is not:** a pitch deck, a brand exercise, or an inventory of everything we could do. It's what we will do, in what order, with what money, and what kills it.

---

## PART 1: Launch Readiness Audit (Apr 22)

### 1.1 Blocking launch RIGHT NOW
Exactly one item:

| Blocker | Cost | Owner | ETA | Why it blocks |
|---|---|---|---|---|
| **Resend Free → Pro** | $20/mo | Alsh | Same day (credit card → upgrade button) | Free tier caps at 100 emails/day. First Reddit post that brings 30 signups + 5-email welcome = 150 emails = silent signup failures. Supabase custom SMTP is already verified pointing at Resend, so upgrading the Resend plan is the only remaining change. |

Nothing else is blocking. The infrastructure doc is the source of truth and it's green.

### 1.2 Risky but launchable (accept and monitor)
These are real risks; none of them justify delaying launch.

| Risk | Severity | Mitigation | Kill criteria |
|---|---|---|---|
| **Edge Function retry wrapper not deployed on 5 call sites** (Battle Scar #22) | Medium. 40% historical silent-failure rate on generate-question; Anthropic at Tier 3 makes this less likely to bite, but a Claude outage would. | `docs/EDGE_FUNCTION_RETRY_PATCH.md` is drafted and ready. If smoke tests flag a failure during launch week, deploy the patch same-day. | >2 user-reported "nothing happened after I hit submit" tickets in a day. |
| **No mobile device QA done in last 30 days** | Medium. iOS Safari is the single most expensive surface (Battle Scars #4–7, #16). Any paid traffic is ~60% mobile. | Alsh runs the 9-path smoke test protocol on iPhone Safari before paid ads go live Thursday. 20 minutes of testing. | Any path fails → pause ads, fix, resume. |
| **Anthropic Tier 3 cap is $1,000/mo** | Low. At current traffic we'd burn ~$30/mo. A PH spike could push us toward $200/mo. Tier 3 absorbs it easily. | Alsh sets a Claude console budget alert at $500/mo. | Alert fires → review and consider short-term rate limit. |
| **Single founder bottleneck** | High. If Alsh is offline for 3+ days, nothing ships. | PM Agent + Marketing Agent scheduled content; Jacob coming online post-certification for bug fixes. | If Alsh offline >48h with campaign live, Marketing Agent pauses paid channels (not organic). |
| **34 current users is too small a cohort to test email sequences** | Low. We are not going to optimize email copy off n=34. Treat the welcome sequence as "ship it, look at opens Week 3." | N/A | N/A — not a launch blocker. |
| **Google Ads account has 170 impressions, $31 spent, 0 conversions history (Feb)** | Medium. That attempt was killed correctly. Restarting on a new landing page (`/tell-me-about-yourself`) with higher-intent keywords resets the experiment. | Hard $15/day cap Week 1; expand only with proof. | $75 spent, 0 signups = kill and diagnose landing page. |

### 1.3 Deferred until iOS approval
Do not start these this week. They need the App Store link to perform.

- **Product Hunt launch** — queued for 7–10 days after iOS approval (target Tue May 12 if iOS lands by May 5)
- **TikTok / Instagram Reels paid** — mobile-heavy; 60%+ of clicks hit an App Store link that 404s if iOS isn't live
- **Press outreach** (Mashable, Lifehacker, Nurse.com) — "also on iPhone" is the hook
- **Referral / invite program** — needs iOS to avoid the "my friend couldn't install it" objection
- **Influencer outreach** — save the payment for PH week; buys double coverage

Keep organic TikTok/IG seeds going this week (see Part 3) but do not pay to amplify.

---

## PART 2: Launch Sequence (Week-by-Week)

Money flows: **Week 1 $90** (6 days × $15 Google Ads) → **Week 2 $300** (scale Google + Reddit ads pilot) → **Week 3 $500** (iOS wave OR continued web) → **Week 4 $500** (double down on winners). Total plan: **$1,390 / $1,500 budget**. $110 held as reserve for emergencies (boosted posts, influencer micro-payment, URL corrections in ads).

### WEEK 1 — Apr 22–28: Soft Launch, Validate the Funnel
**Theme:** Prove the funnel works end-to-end with real paid traffic before we spend real money.

**Total spend this week: $90 paid + ~6h of founder time**

#### Day-by-day calendar

| Day | Date | Action | Channel | Cost | Owner |
|---|---|---|---|---|---|
| Tue | Apr 22 | Upgrade Resend to Pro; run 9-path smoke test on desktop; post LinkedIn founder launch post (GOOGLE_EMAIL_PH_CAMPAIGNS.md → LinkedIn Post 1) at 10am ET | Ops + LinkedIn | $20 | Alsh |
| Wed | Apr 23 | Run 9-path smoke test on iPhone Safari; post Reddit organic #1 (r/jobs, "I was terrible at interviews…") morning 7–9am ET; seed 1 TikTok organic (INSTAGRAM_TIKTOK_CAMPAIGNS.md TikTok #1) | Reddit + TikTok organic | $0 | Alsh |
| Thu | Apr 24 | **Launch Google Ads Campaign B (STAR/Behavioral) at $15/day**; landing page = `/tell-me-about-yourself`; set budget alert at $20/day | Google Ads | $15 | Alsh |
| Fri | Apr 25 | Send 20 LinkedIn DMs to new-grad nurses + travel nurses + specialty switchers using the template in WEB_ONLY_LAUNCH_WEEK_APR22.md; post IG carousel #1 (static, no boost) | LinkedIn + IG organic | $15 (Ads continuing) | Alsh |
| Sat | Apr 26 | Post Reddit organic #2 (r/nursing, "new grad nursing interview guide") — 90% value, 10% tool mention; check ad dashboard | Reddit + Ads | $15 | Alsh |
| Sun | Apr 27 | Rest day for content; Alsh reviews Week 1 metrics; PM Agent writes first weekly report; plan Week 2 | Analytics | $15 | Alsh + PM Agent |
| Mon | Apr 28 | Week 1 retro; kill/keep decision on Google Ads; plan Week 2 expansion | Retro | $15 | Alsh + PM Agent |

#### Week 1 daily KPIs (check every morning)
- New signups (Supabase `auth.users`, last 24h)
- Email verifications (count of `email_confirmed_at IS NOT NULL` in same 24h)
- Google Ads: impressions, clicks, CTR, cost/click
- Reddit: upvotes, comments, saves on each post
- LinkedIn: post impressions, profile views, DM reply rate
- Paid conversions (Stripe checkout.session.completed, last 24h)

#### Week 1 success gates
| Metric | Minimum (continue) | Strong (scale faster) | Kill |
|---|---|---|---|
| Total new signups | 10 | 25 | <5 → funnel is broken |
| Google Ads signups | 1 | 3+ | $75 spent, 0 signups → kill Campaign B |
| Google Ads CTR | 2%+ | 4%+ | <1% → rewrite headlines |
| LinkedIn DM replies | 2 | 5+ | 0 replies from 20 DMs → rewrite template |
| Reddit post upvotes | 10 | 100+ | <5 + removed by mod → re-read subreddit rules |
| Paying customers | 0 (acceptable) | 1 | N/A this week |

**If <5 signups by end of Week 1**, stop all paid activity and run a funnel diagnosis before spending more. Specifically check: does Vercel analytics show traffic landing? Do landing pages convert (is the signup CTA visible above the fold on mobile)? Are confirmation emails arriving (check Resend dashboard)?

---

### WEEK 2 — Apr 29–May 5: Scale Winners, Kill Losers
**Theme:** Double down on what's working. Kill anything that isn't. No new channels this week unless Week 1 exceeded "Strong."

**Total spend this week: ~$300**

#### Channel decisions at Week 2 start
Based on Week 1 data:

- **If Google Ads CAC < $30/signup:** Bump to $30/day. Add Campaign A (Brand + Generic) at $15/day. Keep Campaign B at $15.
- **If Google Ads CAC $30–75:** Hold at $15/day. Rewrite 3 headlines. Test new keywords.
- **If Google Ads CAC > $75 or 0 signups:** Kill. Reallocate $300 to Reddit paid promoted posts (REDDIT_CAMPAIGNS.md → Paid Ad #1, #2).
- **If Reddit organic is getting 50+ upvotes:** Post #3 and #4 from REDDIT_CAMPAIGNS.md. Consider a promoted post ($50 test).
- **If LinkedIn DMs converting (2+ paying):** Send 40 more DMs this week. Refine target list.

#### Day-by-day

| Day | Action | Spend | Owner |
|---|---|---|---|
| Tue Apr 29 | Post Reddit organic #3 (r/cscareerquestions or r/ExperiencedDevs depending on Week 1 learnings); send 20 more LinkedIn DMs | $45 (ads) | Alsh |
| Wed Apr 30 | Ship email welcome sequence live (`GOOGLE_EMAIL_PH_CAMPAIGNS.md` → Email Sequence 1, 5 emails); IG carousel #2 post | $45 | Marketing Agent (draft) + Alsh (send) |
| Thu May 1 | LinkedIn post #2 (founder, story-driven); TikTok organic #2 | $45 | Alsh |
| Fri May 2 | **Testimonial collection push**: email 10 most-engaged users from Week 1 asking for a 60-sec video or written quote in exchange for 2 months free | $45 | Alsh + CS Agent |
| Sat May 3 | Reddit organic #4 (r/nursing, "SBAR interview prep"); check ads dashboard | $45 | Alsh |
| Sun May 4 | Rest / analytics | $30 | — |
| Mon May 5 | Week 2 retro; iOS approval check; plan Week 3 (Plan A vs Plan B) | $45 | Alsh + PM Agent |

#### Week 2 success gates
| Metric | Minimum | Strong |
|---|---|---|
| Cumulative signups (Weeks 1+2) | 35 | 80 |
| Paying customers (cumulative) | 1 | 5 |
| Email open rate (welcome seq) | 35%+ | 50%+ |
| Testimonials collected | 1 | 3 |

---

### WEEK 3 — May 6–12: iOS Approval Contingency
**Theme:** This week's plan branches on Apple's decision. Both branches are pre-written.

#### Plan A — iOS APPROVED (at any point Apr 22–May 5)
This is the second launch wave. It has been waiting for this trigger.

**Hard timeline from approval email:**
- T+0h: Apple sends approval. Alsh acknowledges in ASC, flips "Release this version" to manual or auto.
- T+6h: App is live in App Store. Verify download on own iPhone. Check RevenueCat receipt validation with one real purchase.
- T+12h: Homepage banner goes live ("Now on iPhone — App Store link"). Email any Week 1–2 signups with subject line "You asked for iPhone — it's here."
- T+18h: LinkedIn post (GOOGLE_EMAIL_PH_CAMPAIGNS.md → LinkedIn Post 3). Reddit posts get comment update: "Also now on iPhone: [link]."
- T+24h: Google Ads get updated copy + App Store badge. Spend cap lifts to $50/day temporarily for 72h of amplification.
- T+48h: **Set Product Hunt launch for Tuesday May 12, 00:01 PT.** Notify hunter (Ben Lang or equivalent). Prep all 5 gallery images + maker video.
- T+120h (May 12): **Product Hunt launch day.** See Plan A-Week-3 playbook below.

**Product Hunt Day (May 12) playbook** (from PRODUCTHUNT_LAUNCH_KIT.md, condensed):
- 00:01 PT launch; hunter posts with intro + video
- 06:00 PT Alsh posts in PH comments: founder story, ask for feedback
- 07:00 PT LinkedIn announcement: "We're live on PH — support here"
- 08:00 PT Email blast to all signups (now 80+ hopefully): "We're on PH today — your upvote would mean the world"
- 10:00 PT Reddit posts updated with "We're #X on PH today"
- 15:00 PT First TikTok paid ad ($75 boost, 24h)
- 21:00 PT Day-end status post in PH comments
- Next day: press outreach with "ranked #X on PH" as the hook

Expected signals Plan A: 100–200 signups in the 72h PH window, 5–15 paying.

#### Plan B — iOS STILL IN REVIEW
Same amount of effort, different shape. Do not pause. Do not "wait."

- **Double down on web SEO amplification**: request indexing for 3 remaining unindexed SEO pages (mock-interview-practice, interview-coaching-lessons, interview-prep-podcast). Add internal links from homepage.
- **Launch TikTok organic cadence**: 3 posts this week (INSTAGRAM_TIKTOK_CAMPAIGNS.md TikTok #3, #4, #5). Zero spend, founder-shot.
- **Add Google Ads Campaign C (Nursing)** at $15/day if nursing signups Weeks 1–2 were >0.
- **Reddit paid promoted post** ($50–75 one-off): REDDIT_CAMPAIGNS.md → Paid Ad #1.
- **Email any user who signed up without verifying**: "We're here if you want to finish setting up. Here's what you'll get." (Re-engagement.)

Expected signals Plan B: 30–60 signups this week (web only), 2–5 paying.

#### Week 3 success gates
| Metric | Plan A (iOS live) | Plan B (no iOS) |
|---|---|---|
| Cumulative signups | 180+ | 100+ |
| Paying customers cumulative | 12+ | 6+ |
| App Store downloads | 100+ | N/A |
| PH rank | Top 10 Day 1 | N/A |

---

### WEEK 4 — May 13–19: Double Down on What Works
**Theme:** Whatever channel delivered the lowest CAC across Weeks 1–3 gets the remaining $500.

**Total spend this week: ~$500**

#### Decision tree for budget allocation

Rank channels by CAC through Week 3. Allocate $500 as:
- **#1 channel: $300.** Max out daily budget.
- **#2 channel: $150.** Incremental scale.
- **#3 channel: $50.** Keep warm, but don't feed.
- **Everything below #3: $0.** Pause, document learnings.

#### What "doubling down" looks like per channel

| If winner is… | Week 4 action |
|---|---|
| **Google Ads** | Expand to all 4 campaigns (A+B+C+D) at $15/day each = $60/day × 5 days = $300. Add negative keyword list based on actual search terms from Weeks 1–3. |
| **Reddit (organic + paid)** | 3 new organic posts across r/nursing, r/jobs, r/cscareerquestions. 1 promoted post at $75. Engage in comments of Weeks 1–3 posts daily. |
| **LinkedIn DMs** | Scale to 50 DMs/day × 5 days = 250 DMs. Alsh time investment: 90 min/day. |
| **Product Hunt afterglow (Plan A)** | "Featured on Product Hunt" badge on landing pages. Press outreach (10 emails to Mashable/Lifehacker/Nurse.com/TechCrunch/etc.) with "ranked #X" hook. |
| **TikTok organic** | 1 post/day × 7 days. If any hits 10K views, boost for $75. |
| **Email to existing cohort** | Upgrade prompt campaign to free-tier users who've completed 3+ sessions. Offer first-month 50% off. |

#### Week 4 success gates
| Metric | Plan A cumulative | Plan B cumulative |
|---|---|---|
| Signups (30 days) | 350+ | 200+ |
| Paying customers | 20+ | 10+ |
| Monthly burn (paid + tooling) | $1,500 spent / $65 recurring | $1,500 spent / $65 recurring |
| CAC (paid-only) | <$75 | <$100 |

---

## PART 3: Channel-by-Channel Strategy

### 3.1 Google Ads
- **Status:** READY. Account live (867-867-9900), conversion tracking deployed (AW-17966963623 with 4 labels), 4 campaigns pre-written in GOOGLE_EMAIL_PH_CAMPAIGNS.md.
- **Owner:** Alsh (campaigns, keywords), Marketing Agent (copy variants A/B).
- **Weekly effort:** 90 min setup (Week 1), then 15 min/day to monitor.
- **Expected CAC:** $30–75 based on general interview-prep benchmarks. Below $30 = exceptional, scale. Above $100 = kill.
- **Expected conversion rate:** 3–6% of landing page visits → signups.
- **Budget trajectory:** $15/day (W1) → $30/day (W2) → $45/day (W3) → $60/day (W4) if winning. Total budget: ~$750 of the $1,500 is earmarked here.
- **Kill criteria:** $150 spent with 0 signups → pause all campaigns, diagnose landing page. $200 spent with CAC > $100 → kill and reallocate.
- **Finance warning from April 15 session:** The full 4-campaign plan in GOOGLE_EMAIL_PH_CAMPAIGNS.md totals $70/day = $2,100/mo, which exceeds the $1,500 budget. Do not run all 4 simultaneously. Start with 1, add based on proof.

### 3.2 Reddit (organic + paid)
- **Status:** READY. 5 organic posts + 3 paid ads + 5 comment templates in REDDIT_CAMPAIGNS.md. Reviewer-approved.
- **Owner:** Alsh (posting, comment engagement). Marketing Agent (drafting variants for Week 3–4).
- **Weekly effort:** Post 30 min + 20 min/day comment response = 2.5h/week.
- **Expected CAC:** Organic = $0 but 60% of posts underperform. Paid Reddit ads = $30–60 CAC based on creator benchmarks.
- **Expected conversion rate:** 1–3% of upvotes convert to post clicks; 5–10% of clicks → signups. Net: ~0.1% of upvotes → signups. A 200-upvote post = ~2 signups.
- **Kill criteria:** Any post removed by a mod → pause that subreddit, re-read rules, rewrite before posting again. Two consecutive posts with <10 upvotes → the angle isn't working; rewrite entirely.
- **Important:** r/nursing has **strict** self-promo rules. Every post must be 90%+ value, tool mention is tip #4-of-5 minimum. One mod strike = permanent ban, and we lose the single best organic nursing channel.

### 3.3 LinkedIn (founder posts + DMs)
- **Status:** READY. 3 launch posts + DM template in WEB_ONLY_LAUNCH_WEEK_APR22.md.
- **Owner:** Alsh only. Founder voice is the product here; cannot be delegated to an agent.
- **Weekly effort:** 1 post/week (45 min) + 20 DMs/week (2h) = ~3h/week.
- **Expected CAC:** $0 direct cost. Time cost ~$0 opportunity (Alsh is the CEO, this is the job).
- **Expected conversion rate:** DMs: 15–25% reply rate, 20–40% of repliers → signups, 10–20% of signups → paying = roughly 3–5 paying customers per 100 DMs sent.
- **Kill criteria:** 0 replies from 40 DMs → rewrite template. 3 LinkedIn flags for "spam messaging" → pause all DMs for 30 days.
- **Scale ceiling:** Alsh can do ~250 DMs/week max before LinkedIn starts rate-limiting. Do not exceed.

### 3.4 TikTok
- **Status:** ORGANIC ONLY until iOS approved. 5 scripts in INSTAGRAM_TIKTOK_CAMPAIGNS.md.
- **Owner:** Alsh films; Marketing Agent drafts hooks / captions.
- **Weekly effort:** 1 video = 60 min (script, film, edit, post). 2–3 per week = 2–3h.
- **Expected CAC:** Organic unpredictable. 1 video in 50 goes viral; the rest get 500–2K views.
- **Expected conversion rate:** ~0.05–0.2% of views → landing page visits.
- **Kill criteria:** 4 consecutive videos under 500 views → angle is wrong, not product. Rewrite hooks.
- **Paid pivot:** Only after iOS approved. Then boost any organic >10K views for $75.

### 3.5 Instagram
- **Status:** ASSETS READY (3 carousels, 5 stories, 3 reels in INSTAGRAM_TIKTOK_CAMPAIGNS.md), NOT A PRIORITY WEEK 1–2.
- **Owner:** Alsh posts; Marketing Agent drafts.
- **Weekly effort:** 30 min/week during organic phase.
- **Expected CAC:** Organic very low engagement for B2C productivity apps without existing audience. Do not expect Instagram to be a winner.
- **Kill criteria:** 3 weeks of posting with <50 followers gained → pause; revisit post-iOS.

### 3.6 Email (welcome sequence + transactional)
- **Status:** READY (Resend DNS verified, Supabase Custom SMTP pointing at Resend, 4 email sequences drafted in GOOGLE_EMAIL_PH_CAMPAIGNS.md). **BLOCKED on Resend Pro upgrade.**
- **Owner:** Marketing Agent drafts; Alsh reviews and schedules; CS Agent handles any bounces/complaints.
- **Weekly effort:** 1 hour setup Week 2, then automated.
- **Expected CAC:** $0 direct (on top of Resend $20/mo fixed). Re-engagement is pure upside on existing signups.
- **Expected conversion rate:** 40–50% open on welcome email 1, dropping to 20% by email 5. 2–5% click → upgrade.
- **Kill criteria:** Spam complaint rate >0.1% → pause sequence, audit content, check sender reputation on Resend dashboard.

### 3.7 Product Hunt
- **Status:** DEFERRED until iOS approved. Kit fully ready in PRODUCTHUNT_LAUNCH_KIT.md.
- **Owner:** Alsh (maker); need external hunter (target: Ben Lang or a nursing/career founder).
- **Effort:** 2 hours launch day + 8 hours of comment response across 24h.
- **Expected CAC:** $0 direct. PH traffic is high-intent but low-volume in our category. Expect 50–200 signups over 72h.
- **Expected ranking:** Realistic Top 10 Day 1 with aggressive comment engagement. Not Top 3 without influencer backing.
- **Kill criteria:** N/A — PH is a one-shot event, it happens or doesn't.

### 3.8 Press / PR
- **Status:** DEFERRED. No press list, no press release draft.
- **Owner:** Alsh + Marketing Agent (Week 3+).
- **Effort:** Write 1 press release + send 20 personalized emails = 3h.
- **Expected CAC:** Very variable. One Lifehacker mention = 500 signups. 20 emails → 0 responses is also normal.
- **Kill criteria:** Zero press placements after 30 DMs → not a short-term channel; revisit post-PH with PH rank as the hook.

### 3.9 Referral / invite program
- **Status:** NOT BUILT. Deferred until post-iOS.
- **Rationale:** At 34 users, there's no base to refer from. Build this in Week 5+ when we have 200+ users and 5+ paying.
- **Effort when built:** 3–4 dev days. Jacob-sized task post-certification.

---

## PART 4: Weekly KPIs + Kill Switches

### 4.1 North-star metric
**Paying customers added this week.** Everything else is a leading indicator.

### 4.2 Full metric stack (check Monday morning every week)

| Level | Metric | Source | Target Week 1 | Target Week 4 |
|---|---|---|---|---|
| **North-star** | Paying customers (cumulative) | Stripe dashboard | 0–1 | 10–20 |
| **Revenue** | MRR + pass revenue | Stripe + Supabase | $0 | $250 |
| **Top-of-funnel** | Signups (cumulative) | Supabase auth.users | 10 | 200+ |
| **Funnel** | Email verify rate | Supabase | 70%+ | 70%+ |
| **Funnel** | Signup → first AI session | Supabase events | 50%+ | 60%+ |
| **Funnel** | First session → second session | Supabase events | 40% | 50% |
| **Funnel** | Free → paid conversion | Stripe / Supabase | N/A | 5–8% |
| **Acquisition** | Google Ads CAC | Google Ads + Stripe | N/A (no data) | <$75 |
| **Acquisition** | Organic signups | UTM + referrer | 5+ | 50+ |
| **Acquisition** | LinkedIn DM reply rate | Manual tracking | 15%+ | 20%+ |
| **Engagement** | DAU/MAU | Supabase | N/A | 15%+ |
| **Engagement** | Average sessions/user | Supabase | 1.5 | 2.5 |
| **Retention** | D1 retention | Supabase | N/A | 30%+ |
| **Retention** | D7 retention | Supabase | N/A | 15%+ |
| **Support** | CS tickets | CS Agent dashboard | <3 | <15 |
| **Support** | Critical path smoke tests | Tester Agent | 9/9 pass | 9/9 pass |
| **Infra** | Anthropic spend | Console | <$30/mo | <$200/mo |
| **Infra** | Resend deliverability | Resend dashboard | 98%+ | 98%+ |

### 4.3 Kill switches (automatic — no meeting needed)

| Trigger | Action | Who executes |
|---|---|---|
| Google Ads: $75 spent, 0 signups | Pause all Google Ads campaigns | Alsh (alert from Google Ads) |
| Google Ads: CAC > $100 for 3 days | Pause that campaign, keep others | Alsh |
| Reddit: post removed by mod | Do not post that sub for 14 days | Alsh |
| Reddit: 2 consecutive posts <10 upvotes | Kill that angle; no new post in that sub without rewrite | Alsh |
| LinkedIn: any "message flagged as spam" system notice | Pause DMs for 7 days | Alsh |
| Email: complaint rate >0.1% | Pause welcome sequence | CS Agent alerts; Alsh executes |
| Anthropic spend: $500/mo | Review usage; consider rate limits | Finance alert → Alsh |
| Supabase: any Auth 429/503 for >10 min | Escalate immediately | Alerting → Alsh + PM Agent |
| Tester Agent: any critical path fails | Pause all ads | Tester Agent → Alsh |
| Stripe: charge fails >5% | Audit webhook + product links | Alsh |
| Support tickets: >10/day of same issue | Paid campaigns pause until fix | CS Agent → Alsh |

### 4.4 Budget flexibility — where redirects go

- **Kill Google Ads → shift to:** Reddit paid promoted posts (easier, same intent quality).
- **Kill Reddit → shift to:** LinkedIn DM volume (Alsh's highest-conversion channel).
- **Kill TikTok → shift to:** SEO content (another landing page, another $0 long-term bet).
- **Kill LinkedIn → major problem.** No obvious backup in that funnel quality. Would force us to wait for iOS + PH.

Holding reserve: $110 of the $1,500 stays un-allocated through Week 3 for emergencies.

---

## PART 5: Team + Agent Responsibilities

### 5.1 Alsh (founder)
**Weekly time budget: ~15 hours on growth.**

- High-leverage creative work: LinkedIn posts, TikTok films, DM conversations, any founder-voice content
- LinkedIn DM outreach (3h/week, 20–50 DMs)
- Strategic calls: partner outreach, press responses, hunter outreach
- **Weekly retro Monday morning (30 min):** review PM Agent report, make kill/scale decisions
- Smoke test on iPhone Safari before any ad budget expansion
- Approve anything Marketing Agent drafts before it goes live (zero exceptions during launch month)

**Do NOT spend time on:**
- Writing marketing copy that isn't founder voice (Marketing Agent handles)
- Manual analytics queries (PM Agent handles)
- Creative asset production (already done, 55+ assets in `docs/marketing/`)
- Responding to every support ticket (CS Agent triages; Alsh handles escalations only)

### 5.2 Jacob (new dev, post-certification)
**Cannot modify production code until certified** (per MEMORY.md Phase 6 completion).

Tentative backlog for when he's cleared:
1. Deploy the Edge Function retry wrapper on 5 call sites (`docs/EDGE_FUNCTION_RETRY_PATCH.md`)
2. Commit the ~12,500 lines of Phase 2 code sitting in the working tree
3. Add per-user hourly API rate limit
4. Build the referral system (Week 5+)
5. Small bug fixes surfaced by CS Agent

Escalation: If Jacob tries to touch App.jsx (8,099 lines, 70 useState hooks), PM Agent blocks and reroutes per Battle Scar #1.

### 5.3 Marketing Agent (via Koda Ops dashboard)
Feature-flagged, currently OFF. Turn ON at start of Week 2.

**Responsibilities:**
- Draft A/B variants of Google Ads copy (weekly)
- Draft Reddit post variants for Weeks 3–4
- Draft welcome email sequence refinements based on open/click data
- Schedule + send email sequences (with Alsh approval)
- Populate Creative Assets section of dashboard with any new ad mockups
- CAC rebalancing: redistribute paid budgets weekly based on ad performance

**Hard limit:** Any spend decision >$100 requires Alsh explicit approval. Any copy that references clinical specifics goes through Erin.

### 5.4 PM Agent (this plan's owner)
**Responsibilities:**
- Weekly check-in report published every Monday 9am PT
- Track KPI dashboard; flag deviations from plan
- Maintain this doc (`docs/LAUNCH_PLAN_V2_APR22.md`) as living
- Coordinate inter-agent handoffs (Marketing → CS → Tester)
- Log every kill-switch trigger with timestamp + action taken
- Weekly retro meeting prep: pull data, summarize, recommend 3 decisions

**Escalation:** PM Agent never writes code, never spends money. Only reports, recommends, and coordinates.

### 5.5 Tester Agent
**Responsibilities:**
- Run 7 critical-path tests on every deploy-to-production (auto-triggered)
- Run full smoke test suite every morning at 6am PT
- Alert Alsh + PM Agent if any path fails
- Weekly summary in KPI dashboard

**Hard limit:** Tests execute against production. If a test writes bad data (expected: all tests are read-only or use test accounts), pause Tester Agent immediately.

### 5.6 CS Agent
**Responsibilities:**
- Classify incoming support emails (`support@interviewanswers.ai`) into: bug, billing, feature request, refund, other
- Draft response for every classified ticket; queue for Alsh approval
- Auto-send canned responses for known issues (account deletion, password reset) with Alsh having set these templates
- Log all tickets in dashboard; weekly summary in PM Agent report
- Escalate anything with the words "clinical," "medical advice," "patient safety" directly to Alsh + Erin (the walled garden tripwire)

**Hard limit:** Cannot process refunds. Cannot make commitments on behalf of the company. Drafts only until Alsh approves.

---

## PART 6: 30-Day Success Milestones

### 6.1 Milestone table

| Milestone | Realistic | Stretch | Below this = launch failed |
|---|---|---|---|
| **Week 1: 20 new signups** | 15–25 | 40 | <10 |
| **Week 2: 50 new signups cumulative** | 45–70 | 100 | <30 |
| **Week 3: 150 signups cumulative (iOS wave)** | 120–200 | 300 (PH hit) | <80 |
| **Week 4: 300+ signups cumulative** | 250–400 | 600 | <180 |

### 6.2 Revenue milestones (secondary)

| Week | Realistic paying | Realistic MRR + pass revenue |
|---|---|---|
| Week 1 | 0–1 | $0–$30 |
| Week 2 | 2–5 | $60–$150 |
| Week 3 | 8–15 | $200–$400 |
| Week 4 | 15–25 | $350–$750 |

Annual All-Access ($99.99) is the highest-leverage SKU. If conversion skews toward Annual instead of 30-day passes, revenue materially exceeds the "realistic" column.

### 6.3 What would be objectively bad

- **<180 signups by end of 30 days, despite $1,500 spent** — something fundamental is wrong (product fit, landing page, funnel). Stop spending, do a full diagnostic.
- **<5 paying customers by end of 30 days** — pricing or onboarding is the problem. 3–5% free-to-paid is the floor; below that means either pricing is wrong or onboarding doesn't activate enough users.
- **Negative reviews on App Store when iOS launches** — critical to fix immediately; every 1-star can cost 20 signups.
- **CAC > $150 sustained** — the unit economics don't work. Pause, rethink.

### 6.4 What would be objectively great

- **500+ signups, 20+ paying, <$75 CAC** — this is a real signal. Justifies a Seed conversation. Justifies hiring a second marketer.
- **Featured on Product Hunt (Top 5 day-of)** — free press + 300+ signups in 48h.
- **1 viral TikTok (100K+ views)** — compounding for weeks after.
- **Unsolicited testimonials from nurses** — the walled garden thesis is validated. Expand Erin's advisory board. Consider nursing-only marketing push.

---

## PART 7: Weekly Check-In Format (PM Agent's Monday report)

Every Monday 9am PT, PM Agent posts this to Koda Ops dashboard and emails Alsh:

```
## Launch Plan v2 — Week [N] Check-in
Week of: [dates]

### NORTH STAR
Paying customers this week: [N] (total: [N])
MRR + pass revenue this week: $[X] (total: $[X])

### FUNNEL
Signups: [N] (total: [N])  vs plan: [status]
Verify rate: [X%]
First session rate: [X%]
Free → paid: [X%]

### CHANNELS
Google Ads:   [spend] → [signups] → [CAC] → [status: scale/hold/kill]
Reddit:       [signups] from [posts] posts → [status]
LinkedIn:     [DMs sent] → [replies] → [signups] → [status]
TikTok:       [posts] → [total views] → [signups] → [status]
Email seq:    [sent] → [open %] → [click %] → [status]
Organic SEO:  [signups] via [landing pages]

### KILL SWITCHES TRIGGERED
[list, or "none"]

### INFRASTRUCTURE HEALTH
Anthropic spend MTD: $[X] / $1,000 cap
Supabase Auth health: [ok/issues]
Stripe charge success rate: [X%]
Tester Agent critical paths: [9/9 passing]
CS Agent tickets: [N open, N resolved this week]

### RISK / BLOCKERS
[anything urgent]

### NEXT WEEK RECOMMENDATIONS
1. [decision]
2. [decision]
3. [decision]

### APPROVAL REQUESTS
[anything needing Alsh yes/no]
```

---

## PART 8: Failure Modes + Preventative Rules

### 8.1 Things that will kill this launch if we're not careful

1. **Apple rejects Build 30 again** → Not blocking. Web continues. PM Agent notes and rolls iOS plan forward to next build.
2. **Resend not upgraded before Thursday Apr 24 ads launch** → First paid traffic spike silently fails to deliver emails. **Mitigation:** Apr 22 Resend upgrade is Day-1 Alsh action, pre-ads.
3. **Edge Function silent failures during first traffic spike** → Battle Scar #22 recurs. Users think AI feedback didn't load. **Mitigation:** Deploy retry patch by end of Week 2 regardless; Jacob priority #1 post-certification.
4. **Erin disagrees with launch messaging post-hoc** → Any marketing copy that drifts from walled garden can be pulled at her word. **Mitigation:** Every nursing-specific asset has been reviewed; before Week 3 expansion, Alsh sends Erin a 5-min batch review.
5. **CAC comes in at $120 across all channels** → Not fatal but means $1,500 buys 12–15 customers, not 20–25. **Mitigation:** Kill switches at $75 CAC prevent dumping budget into a bad channel.
6. **App Store 1-star reviews on iOS launch** → Battle Scar #25 type problem. **Mitigation:** Real iPhone smoke test by Alsh the moment Apple approves, before any press push.
7. **PM Agent / Marketing Agent bugs during live traffic** → All agents are feature-flagged. **Mitigation:** If dashboard shows anomalies, flip flag OFF; campaigns continue via manual execution.

### 8.2 Rules Alsh must follow during launch month

1. **Do not touch App.jsx** (Battle Scar #1). If a fix requires App.jsx changes, Jacob does it after certification, or it ships in May.
2. **Smoke test on iPhone Safari before any budget increase.** No exceptions. 20 minutes of testing saves 20 days of debugging.
3. **No cross-channel launches in same 24h.** If Google Ads are ramping, don't also launch TikTok paid same day. Diagnose failures becomes impossible.
4. **Weekly retro is non-negotiable.** Even if Alsh is sick, PM Agent posts the report; decisions wait 24h max.
5. **Monday is the only day to make spend decisions.** Tuesday–Sunday execute the plan; don't pivot mid-week off vanity metrics.
6. **Every marketing asset gets founder approval before live.** Agents draft; founder ships.

---

## PART 9: What's Intentionally Out of Scope

To keep this plan ruthless:

- **Retention/engagement redesign** — out of scope. Ship what exists. Optimize in Month 2.
- **Pricing experiments** — out of scope. One A/B test too many kills signal clarity.
- **New features** — out of scope. Any feature suggestion from this launch becomes a Month 2 backlog item.
- **Android app** — out of scope entirely. iOS + web only for Q2.
- **Hospital/B2B outreach** — out of scope (Erin rejected).
- **Specialty-matching** — out of scope (Erin rejected).
- **NurseInterviewPro.ai separate site** — out of scope. `/nurse` subpage is sufficient.
- **Paid influencer seeding** — out of scope until Week 4 earliest.
- **Complex attribution model** — out of scope. UTM + Stripe + Supabase + self-reported "how did you hear" is enough.

If any of these come up, the answer is "Month 2." Write it down, move on.

---

## PART 10: Quick Reference — the 30-Day Plan on One Page

```
APR 22 Tue  → Resend Pro upgrade + LinkedIn launch post
APR 23 Wed  → Reddit organic #1 (r/jobs) + TikTok #1
APR 24 Thu  → 🟢 Google Ads Campaign B $15/day START
APR 25 Fri  → 20 LinkedIn DMs + IG carousel #1
APR 26 Sat  → Reddit organic #2 (r/nursing)
APR 27 Sun  → Analytics + Week 2 plan
APR 28 Mon  → Week 1 retro; kill/scale decision

APR 29 Tue  → Reddit #3 + 20 more LinkedIn DMs
APR 30 Wed  → Email welcome sequence LIVE + IG carousel #2
MAY 01 Thu  → LinkedIn post #2 + TikTok #2
MAY 02 Fri  → 🎬 Testimonial collection push
MAY 03 Sat  → Reddit #4 (nursing SBAR)
MAY 04 Sun  → Analytics
MAY 05 Mon  → Week 2 retro; check iOS status; Plan A vs B

MAY 06–11   → Plan A: iOS amplification + PH prep
            → Plan B: SEO push + TikTok cadence + Reddit paid test
MAY 12 Tue  → 🚀 Product Hunt launch (Plan A only)

MAY 13–19   → Week 4 doubling-down on #1 channel
            → $500 deployed on winner
MAY 20–21   → 30-day retro + Month 2 planning
```

---

## Appendix A: Source Docs (read order for anyone new to this plan)

1. `CLAUDE.md` — protocols, Battle Scars, Erin's constraints
2. `docs/INFRASTRUCTURE_STATUS.md` — tier status
3. `docs/marketing/WEB_ONLY_LAUNCH_WEEK_APR22.md` — Week 1 detail
4. `docs/marketing/GOOGLE_EMAIL_PH_CAMPAIGNS.md` — Google Ads + email + PH + LinkedIn
5. `docs/marketing/REDDIT_CAMPAIGNS.md` — Reddit posts + paid ads
6. `docs/marketing/INSTAGRAM_TIKTOK_CAMPAIGNS.md` — IG + TikTok scripts
7. `docs/PRODUCTHUNT_LAUNCH_KIT.md` — PH launch day playbook
8. `docs/EDGE_FUNCTION_RETRY_PATCH.md` — retry wrapper, needs deploy
9. `docs/SMOKE_TEST_PROTOCOL.md` — 9 critical paths
10. `docs/BATTLE_SCARS.md` — 24 lessons
11. `docs/SESSION_STATE.md` — session continuity

## Appendix B: Dashboards to bookmark

- Supabase: https://supabase.com/dashboard/project/tzrlpwtkrtvjpdhcaayu
- Vercel: https://vercel.com/alshcampos-clouds-projects/interview-as-a-second-language-app
- Anthropic console: https://console.anthropic.com/settings/billing
- Stripe: https://dashboard.stripe.com
- RevenueCat: https://app.revenuecat.com/projects/72b8c4e6
- Resend: https://resend.com (upgrade first)
- Google Ads: account 867-867-9900
- Google Search Console: interviewanswers.ai property
- App Store Connect: (reviewsubmissions/details/79500bc1-4cc6-43a1-9ddc-cd00da750407)
- Koda Ops: ops.interviewanswers.ai

---

*End of plan. Next action for Alsh: upgrade Resend to Pro, then post the LinkedIn launch post at 10am ET today (Apr 22).*
