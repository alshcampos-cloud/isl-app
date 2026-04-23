# 30-Day Launch Budget & CAC Playbook

*Owner: Finance Agent (Koda Labs LLC)*
*Created: April 22, 2026*
*Window: April 22 – May 22, 2026 (30 days)*
*Status: SOURCE OF TRUTH for every marketing dollar spent this window*

---

## TL;DR — The 4 Numbers To Remember

| # | Number | Meaning |
|---|--------|---------|
| 1 | **$1,500** | Total marketing cash available (hard cap this window) |
| 2 | **$85/mo** | Fixed burn after Resend Pro ($25 Supabase + $20 Vercel + $20 Resend + ~$20 misc tools) |
| 3 | **$10.39 net / paid signup** | Average blended margin after Stripe + Anthropic (weighted mix — see §4) |
| 4 | **145 paid signups** | Break-even against the $1,500 marketing spend at blended margin |

If by **Day 14** we have < 20 paid signups and CAC > $50, we cut Google Ads 50% and pour into the two cheapest channels (PH afterglow + Reddit organic). See §6 kill-switches.

---

## 1. Starting Position

### Cash Available
- **Marketing cash on hand:** $1,500 (one-time)
- **Founder personal runway for fixed burn:** separate bucket — NOT mixed into the $1,500

### Fixed Monthly Burn (Month 1, with Resend Pro)

| Line item | Cost | Notes |
|---|---|---|
| Supabase Pro | $25 | Verified Apr 22 (`INFRASTRUCTURE_STATUS.md`) |
| Vercel Pro | $20 | $200/mo on-demand cap in place |
| Resend Pro | $20 | **Must upgrade before ANY paid ads run** (email bottleneck) |
| Namecheap domain (annualized) | ~$1.25 | $15/yr ÷ 12 |
| Tools buffer (see §2) | ~$20 | Ad mockup / analytics / scheduling |
| **Total fixed** | **~$86/mo** | Round to **$85/mo** |

### Variable Costs Per User (Marginal)

| Cost | Value | Source |
|---|---|---|
| Anthropic API per free active user | $0.10 | Low-end of 0.10–0.50 range, assuming most free users do ≤2 sessions |
| Anthropic API per paid user (30 days) | $0.50 | Heavy practice + mock interviews on Sonnet |
| Stripe fee — General Pass ($14.99) | $0.73 | 2.9% × $14.99 + $0.30 |
| Stripe fee — Nursing Pass ($19.99) | $0.88 | 2.9% × $19.99 + $0.30 |
| Stripe fee — Annual ($99.99) | $3.20 | 2.9% × $99.99 + $0.30 |
| Resend email cost per user (5-email welcome + 4-email nurture) | ~$0.004 | 50K/mo ÷ $20 = $0.0004/email × ~10 emails |

### Net Margin Per Paid Conversion

| Product | Revenue | Stripe fee | Anthropic | Email | **Net** |
|---|---|---|---|---|---|
| General 30-Day Pass | $14.99 | -$0.73 | -$0.50 | -$0.004 | **$13.76** |
| Nursing 30-Day Pass | $19.99 | -$0.88 | -$0.50 | -$0.004 | **$18.61** |
| Annual All-Access (Year 1) | $99.99 | -$3.20 | -$6.00* | -$0.004 | **$90.79** |

*Annual Anthropic: $0.50 × 12 months = $6.00 assuming steady use. Likely lower in practice as heavy use clusters around job-search windows.*

---

## 2. Channel Budget Allocation (4 weeks)

**Discipline note:** The existing `GOOGLE_EMAIL_PH_CAMPAIGNS.md` proposes $2,100/mo on Google Ads alone. That exceeds the entire $1,500 budget. **We are cutting Google Ads to $900** and diversifying so a single channel cannot zero the account.

### Allocation Table — $1,500 over 30 days

| Channel | Allocation | % of total | Daily avg | Justification |
|---|---|---|---|---|
| **Google Ads** (all 4 campaigns combined) | **$900** | 60% | $30/day | Highest-intent traffic. Brand + STAR + Nursing + Competitor campaigns proportionally rescaled. See §2a. |
| **Reddit ads** | **$150** | 10% | $5/day | Test subreddits r/jobs, r/nursing, r/careerguidance. Low CPC (~$0.50-1.50). Small learning budget. |
| **Instagram/TikTok boosted posts** | **$200** | 13% | $6.60/day | Boost existing organic reels (cheapest way to test creative; no production cost). 6-8 boosted posts @ $25-30 each. |
| **Product Hunt launch day** | **$150** | 10% | one-off | PH was April 21 (yesterday) — this is **afterglow spend**: $100 retargeting PH visitors via Meta/Google, $50 for PH-featured banner on LinkedIn. |
| **Tools & subscriptions** | **$100** | 7% | one-off | See §2b. |
| **Email (Resend)** | $0 | — | — | Already in §1 fixed burn. Free variable scale. |
| **TOTAL** | **$1,500** | 100% | — | — |

### §2a. Google Ads Rebalanced ($900 total, not $2,100)

| Campaign | Original daily | **New daily** | Monthly | Priority rationale |
|---|---|---|---|---|
| A: Brand + Generic | $25 | **$12** | $360 | Broadest reach; needed to test baseline CPC |
| B: STAR / Behavioral | $20 | **$10** | $300 | Highest-intent cluster; keep as the #2 spend |
| C: Nursing | $15 | **$6** | $180 | Niche but highest LTV (see §3); keep live |
| D: Competitor | $10 | **$2** | $60 | Smallest test — risky for brand policy, experimental only |
| **Daily total** | $70 | **$30** | **$900** | |

Switch to Target CPA bid strategy **only after 30 conversions**. Until then, Maximize Conversions with conservative daily caps.

### §2b. Tools & Subscriptions ($100 total)

10-20x efficiency unlocks worth buying this window:

| Tool | Cost | Why worth it |
|---|---|---|
| **Plausible Analytics** (or Umami self-host) | $9/mo | Privacy-respecting analytics. Google Analytics is free but slow for decision-making; Plausible = real-time funnel insight. Optional — skip if GA4 is set up. |
| **Buffer free tier or Typefully** | $0 | Social scheduling — free tiers cover 3 channels |
| **Canva Pro** (monthly, not annual) | $15 | Ad mockups for Reddit/IG/TikTok. Cancel after launch window. |
| **Stripe Radar Rules Engine** | $0.05/txn (only on paid) | Fraud protection. Included free up to 1,000 txns/mo. See §7. |
| **Rewardful or Tolt** (affiliate tool) | $29/mo first month | **ONLY if** PH launch brought in 2+ power users who want to refer. Gate behind Day 7 decision. |
| **Perplexity Pro or equivalent for research** | $20/mo | Speeds up competitor/audience research 5x. Cancel after launch window. |
| **Buffer for unknowns** | ~$25 | Domain renewals, small ad template purchases |
| **Total** | **~$100** | Flex allocation, cap hard |

---

## 3. CAC Targets by Channel

### §3a. LTV Assumptions by Segment

| Segment | Avg product | Expected repeat purchase rate | LTV (12 mo) |
|---|---|---|---|
| **General (non-nursing)** | $14.99 pass | 25% buy a second pass within 6 months (one job search = avg 1.25 passes) | **$14.99 × 1.25 = $18.74 gross / $17.20 net** |
| **Nursing** | $19.99 pass | 20% buy a second pass (nurses cycle jobs less frequently than general) | **$19.99 × 1.20 = $23.99 gross / $22.33 net** |
| **Annual All-Access** | $99.99 | 40% renew year 2 (industry avg for B2C sub tools: 30-50%) | **$99.99 × 1.40 = $139.99 gross / ~$127 net** |
| **Blended (assume mix: 60% general / 30% nursing / 10% annual)** | — | — | **$17.20×.6 + $22.33×.3 + $127×.1 = $29.69 blended net LTV** |

### §3b. CAC Targets By Channel

CAC:LTV minimum = **1:3** (i.e., CAC ≤ LTV/3 = **$9.90 blended** target).

| Channel | Target CAC | CAC:LTV ratio | Kill threshold | Rationale |
|---|---|---|---|---|
| **Google Ads — Brand/Generic** | $10-14 | 1:2.1–1:3.0 | Spent $300 + <3 paid signups = KILL | Google's own suggested CPA range |
| **Google Ads — STAR** | $6-10 | 1:3.0–1:5.0 | Spent $250 + <4 paid signups = KILL | Higher-intent; should be cheapest |
| **Google Ads — Nursing** | $10-15 | 1:1.5–1:2.2 | Spent $180 + <2 paid signups = KILL | Higher CAC is acceptable; higher LTV ($22 net) |
| **Google Ads — Competitor** | $10-14 | 1:2.1–1:3.0 | Spent $60 + <1 paid signup = KILL | Tiny budget, fast kill |
| **Reddit ads** | $5-12 | 1:2.5–1:5.9 | Spent $100 + <2 paid signups = KILL | Low CPC but tough conversion; kill fast |
| **IG/TikTok boosted** | $8-15 | 1:2.0–1:3.7 | Spent $150 + <3 paid signups = KILL | Awareness channel; conversion lagging expected |
| **PH afterglow retargeting** | $5-10 | 1:3.0–1:5.9 | Spent $150 + <2 paid signups = KILL | Warm traffic; should convert cheap |

**Global kill rule:** ANY channel with **$300 spent and zero paid signups = KILL immediately**, no exceptions, no "it just needs more time."

---

## 4. Revenue Scenarios (30 days)

### Assumptions for all three scenarios

- **Mix of paid purchases:** 60% General / 30% Nursing / 10% Annual
- **Blended stripe+anthropic+email cost per paid:** general = $1.23, nursing = $1.38, annual = $9.20
- **Blended net per paid:** $13.76 × .6 + $18.61 × .3 + $90.79 × .1 = **$22.93** (weighted by mix)
- Correction for conservatism — using **$19 avg net per paid signup** in the scenarios below to account for refunds, chargebacks, and mix drift
- Free-tier Anthropic cost: $0.10 × total free signups
- **Total signups** = paid CAC drivers + organic (PH afterglow, SEO, word-of-mouth)

### §4a. Pessimistic

| Metric | Value |
|---|---|
| Total signups (paid + organic) | 500 |
| Free-to-paid conversion | **2.0%** (low end of industry range) |
| Paid conversions | 10 |
| Revenue mix (6 general / 3 nursing / 1 annual) | $14.99×6 + $19.99×3 + $99.99×1 = **$249.84** |
| Stripe fees | -$7.32 |
| Anthropic (free users: 500 × $0.10) | -$50.00 |
| Anthropic (paid users: 10 × $0.50) | -$5.00 |
| Email (~$0.004 × 500) | -$2.00 |
| **Revenue minus variable costs** | **$185.52** |
| Marketing spend | -$1,500 |
| **Net cash (before fixed burn)** | **-$1,314.48** |
| Fixed burn (1 month) | -$85 |
| **Pessimistic net 30-day cash** | **-$1,399** |

### §4b. Realistic (base case)

| Metric | Value |
|---|---|
| Total signups (paid + organic) | 900 |
| Free-to-paid conversion | **3.5%** (mid-industry) |
| Paid conversions | 32 |
| Revenue mix (19 general / 10 nursing / 3 annual) | $14.99×19 + $19.99×10 + $99.99×3 = **$784.68** |
| Stripe fees | -$23.55 |
| Anthropic (free: 900 × $0.10) | -$90.00 |
| Anthropic (paid: 32 × $0.50) | -$16.00 |
| Email | -$3.60 |
| **Revenue minus variable costs** | **$651.53** |
| Marketing spend | -$1,500 |
| **Net cash (before fixed burn)** | **-$848.47** |
| Fixed burn | -$85 |
| **Realistic net 30-day cash** | **-$933** |

### §4c. Optimistic

| Metric | Value |
|---|---|
| Total signups | 1,600 (PH afterglow + SEO compounds + 1 viral Reddit/IG post) |
| Free-to-paid conversion | **5.0%** (top of industry) |
| Paid conversions | 80 |
| Revenue mix (48 general / 24 nursing / 8 annual) | $14.99×48 + $19.99×24 + $99.99×8 = **$2,000** (rounded) |
| Stripe fees | -$58.80 |
| Anthropic (free: 1600 × $0.10) | -$160.00 |
| Anthropic (paid: 80 × $0.50) | -$40.00 |
| Email | -$6.40 |
| **Revenue minus variable costs** | **$1,734.80** |
| Marketing spend | -$1,500 |
| **Net cash (before fixed burn)** | **+$234.80** |
| Fixed burn | -$85 |
| **Optimistic net 30-day cash** | **+$150** |

### §4d. Scenario Summary

| Scenario | Signups | Paid | Revenue | Net variable margin | Net 30-day cash (incl. $85 fixed) |
|---|---|---|---|---|---|
| Pessimistic | 500 | 10 | $249.84 | $185.52 | **-$1,399** |
| Realistic | 900 | 32 | $784.68 | $651.53 | **-$933** |
| Optimistic | 1,600 | 80 | $2,000 | $1,734.80 | **+$150** |

**Honest read:** Even the optimistic case only breaks even on Month 1 cash. **This is the expected shape of a product launch.** The $1,500 is purchasing brand awareness and SEO signals that pay out in months 2-6. Kill-switch discipline (§6) is what determines whether we compound or bleed.

---

## 5. Cash Runway Math

### §5a. Break-even (per month)

- Fixed burn: **$85/mo**
- Net per paid signup (blended): **~$19**
- **Paid signups to cover fixed burn alone:** $85 / $19 = **4.5 paid signups/mo**

→ Once we cross **5 paid conversions/mo organically (no ad spend)**, fixed infrastructure is self-sustaining.

### §5b. Break-even (incl. $1,500 marketing window)

- Total spend: $1,500 marketing + $85 fixed = $1,585
- Paid signups needed to cover: $1,585 / $19 = **~84 paid signups**

→ Sitting between our Realistic (32) and Optimistic (80) scenarios. **Break-even in 30 days is aggressive but possible.**

### §5c. Runway Projections

Assume founder has **$X** in a separate operating account for fixed burn (outside this $1,500). The $1,500 is the ad budget only.

| Scenario | 30-day outcome | Days to exhaust $1,500 ad budget |
|---|---|---|
| Pessimistic | $185 recovered from paid conversions → effectively spent $1,315 of $1,500 on net basis | 30 days (spend at planned pace) |
| Realistic | $651 recovered → net spent ~$850 | 30 days |
| Optimistic | $1,735 recovered → net spent negative (profitable ad spend) | **Ads are paying for themselves by Day ~25** — recycle into more spend |

### §5d. When to Raise Prices

**Do NOT raise prices in the $1,500 window.** Reason: we have no conversion data yet. Changing price = changing variable in the experiment.

**Price-raise decision gate (post-Day 30):**
- If realistic scenario hits (3.5% conversion) → **hold prices**, scale ad budget
- If > 5% conversion AND ads profitable → **test $24.99 general / $29.99 nursing** as A/B in Month 2
- If < 2% conversion → **cut prices** is wrong answer. Fix onboarding/messaging first (see §6).

---

## 6. Kill-Switch Rules (Non-Negotiable)

### §6a. Channel-Level Kills (from §3b, consolidated)

| Trigger | Action | Authority |
|---|---|---|
| ANY channel: $300 spent + 0 paid signups | **KILL channel immediately**, redistribute to top performer | Founder auto-approve |
| Weekly Google Ads CAC > $60 (any campaign) | **Cut that campaign's daily budget 50%** | Founder auto-approve |
| Weekly Google Ads CAC > $40 blended | Review keywords, add negatives | Weekly review |
| Reddit ads CPC > $3.00 | Pause ad; reassess subreddit | Daily check |
| IG/TikTok boost CPM > $20 without signups | Pause boost | Daily check |

### §6b. Infrastructure Kills

| Trigger | Action |
|---|---|
| Resend bill > $40/mo | Re-architect email flow — consolidate welcome series from 5 → 3 emails, reduce win-back frequency |
| Anthropic spend > $200/mo | Audit prompt length; reduce max tokens on practice mode; enforce rate limits |
| Vercel on-demand > $50/mo | Audit image sizes, cache headers; consider CDN for static assets |
| Supabase bandwidth > 80GB | Audit queries; add indexes |

### §6c. Budget Alerts (Set In Each Platform)

| Platform | Alert at 50% | Alert at 75% | Alert at 90% |
|---|---|---|---|
| Google Ads (monthly $900 cap) | $450 | $675 | $810 |
| Reddit ads ($150 cap) | $75 | $112 | $135 |
| Meta (IG/TikTok $200 cap) | $100 | $150 | $180 |
| Anthropic (assume $100 soft cap) | $50 | $75 | $90 |
| Stripe-monitored transaction volume | n/a — monitor refund rate |  |  |

**Set these alerts in each platform's notification settings before launching any ad.** This is a 15-minute task. Do not skip.

### §6d. Daily Dashboard Check (5 min/day)

Each morning, check these 4 numbers:
1. **Yesterday's spend across all channels** (should not exceed $60/day blended)
2. **Yesterday's paid signups** (target: 1+/day in realistic scenario)
3. **Yesterday's free signups** (target: 30+/day in realistic)
4. **Running CAC for the week** (target: ≤ $30 blended)

If any number is >30% off target for 3 consecutive days → trigger mid-week review.

---

## 7. Insurance / Protection Recommendations

### §7a. Set Up Before Scaling (Day 0-3)

| Protection | Action | Cost | Priority |
|---|---|---|---|
| **Stripe Radar default rules** | Enable in Stripe Dashboard → Radar → Rules. Use Stripe's ML-based rules (included free). | $0 | **P0 — before any ad $ spent** |
| **Rate limit on signup endpoint** | Verify Supabase rate limiting enabled; add CAPTCHA if not | $0 | **P0** |
| **CAPTCHA on signup (Turnstile/hCaptcha)** | Cloudflare Turnstile is free; 5-line integration | $0 | **P0 before launch** |
| **Abuse signals table** | Already built per MEMORY.md (Apr 15) — verify it's actively writing | $0 | **P0 — confirm live** |
| **Stripe fraud alerts** | Enable email notifications for chargebacks | $0 | **P0** |
| **Budget alerts on all platforms** | See §6c | $0 | **P0** |
| **Supabase backup confirmation** | Pro plan includes daily backups — verify retention period | $0 | P1 |
| **Error tracking (Sentry free tier)** | 5K events/mo free; catches Edge Function failures | $0 | P1 within Week 1 |
| **Uptime monitoring (UptimeRobot free)** | Free 50-monitor plan; alerts on site down | $0 | P1 within Week 1 |

### §7b. Fraud / Abuse Vectors to Monitor

1. **Free-tier abuse (already partially protected):**
   - `_dfp` device fingerprint on signup (April 15 shipped)
   - Email normalization (plus-addressing blocked)
   - `abuse_signals` table in Supabase
   - **Add:** Alert when >5 signups from same `_dfp` in 24h

2. **Card testing on Stripe:**
   - Stripe Radar default rules cover this
   - Additionally: rate-limit checkout-session creation to 3/user/hour

3. **Refund abuse:**
   - Monitor refund rate weekly. If > 5% of paid conversions refund, investigate root cause (UX bug? Misleading ad copy?)

4. **API/Anthropic abuse:**
   - Edge Functions already auth-gated via Supabase JWT
   - **Add:** Per-user rate limit in `ai-feedback` Edge Function — cap at 50 AI calls/user/day (more than any legit user would make)

### §7c. What NOT To Do Yet

- Don't buy paid fraud tools (Sift, Kount) — overkill at this volume
- Don't set up affiliate program until Day 14 check-in shows power users exist
- Don't negotiate annual-pay discounts with Supabase/Vercel — too early; cash flexibility > cost savings

---

## 8. Week-By-Week Spending Schedule

| Week | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Weekly total |
|---|---|---|---|---|---|---|---|---|
| **Week 1 (Apr 22-28)** | $55 | $55 | $55 | $55 | $55 | $40 | $40 | **$355** |
| **Week 2 (Apr 29 - May 5)** | $45 | $45 | $45 | $45 | $45 | $40 | $40 | **$305** |
| **Week 3 (May 6-12)** | $50 | $50 | $50 | $50 | $50 | $40 | $40 | **$330** |
| **Week 4 (May 13-19)** | $45 | $45 | $45 | $45 | $45 | $40 | $40 | **$305** |
| **Week 5 buffer (May 20-22)** | $35 | $35 | $40 | — | — | — | — | **$110** |
| **Rounding / tools / PH afterglow** | | | | | | | | **$95** |
| **TOTAL** | | | | | | | | **$1,500** |

Week 1 is front-loaded for launch momentum. Weeks 2-4 steady-state. Week 5 is a 3-day wind-down to stay within window.

---

## 9. Decision Gates (Calendar)

| Date | Gate | If YES | If NO |
|---|---|---|---|
| **Apr 22 (today)** | Resend Pro upgraded? | Start ads Day 1 | **DO NOT START ADS.** Upgrade first. |
| **Apr 25 (Day 3)** | Any channel at $100 with 0 signups? | Pause that channel | Continue |
| **Apr 28 (Day 7)** | Blended CAC < $30? | Maintain spend | Review landing pages + ad copy |
| **May 5 (Day 14)** | ≥ 20 paid signups cumulative? | Scale winners, kill losers | Cut ad spend 50%, invest in SEO content |
| **May 12 (Day 21)** | ≥ 50 paid signups cumulative? | Consider adding $500 more ad budget | Lock to realistic scenario |
| **May 19 (Day 28)** | Month 2 decision: continue ads? | Use Month 1 margin to fund Month 2 at same level | Pause, double down on organic |

---

## 10. Summary for the Founder

**What this document says, in 5 sentences:**

1. You have $1,500 for ads and $85/mo for infrastructure.
2. Put $900 on Google Ads (rebalanced down from $2,100 suggested), $200 on Meta, $150 Reddit, $150 PH afterglow, $100 tools.
3. Realistic outcome: 900 signups, 32 paid conversions, $785 revenue, net -$933 in month one — normal for a launch.
4. Break-even requires 84 paid conversions; achievable at 5%+ conversion (optimistic) but not at 2% (pessimistic).
5. Kill any channel burning $300 with zero paid signups; set budget alerts at 50/75/90% on every platform **before** you launch.

**Single most important thing:** Resend Pro MUST be upgraded before a single ad dollar is spent. Otherwise you will silently drop 90% of paid signups into the void.

---

*End of playbook. Update this file weekly at the Day 7/14/21/28 gates with actuals vs. projections.*
