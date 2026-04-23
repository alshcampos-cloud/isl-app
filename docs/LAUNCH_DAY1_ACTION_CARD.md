# Launch Day 1 Action Card
**Date: Tuesday, April 22, 2026**
**Target launch: Thursday, April 24 (web-only, Google Ads MVP test)**
**Status: CONDITIONAL GO** — dependent on 5 actions below

---

## The Verdict

After PM + Finance + Researcher + Reviewer passes, the plan is sound but has **5 critical inconsistencies** between docs. Here's the authoritative reconciliation:

| Contradiction | PM Said | Finance Said | **FINAL ANSWER** |
|---|---|---|---|
| Product Hunt timing | Deferred to May 12 (iOS-gated) | Apr 21 afterglow ($150) | **PM wins — PH on May 12, Finance $150 → Week 1 reserve** |
| Week 1 budget | $90 | $355 | **PM wins — $90. Validation first.** |
| TikTok paid | Organic only until iOS | $200 Meta/TikTok boost | **PM wins — $0 paid social Week 1** |
| Testimonial reward | "2 months free" | No mechanism exists | **Change to free Annual All-Access access code (manual for first 10 only)** |
| Break-even math | 15-25 paying in 30 days | Need 84 paying to break even | **$1,500 = validation budget, NOT break-even. Real break-even = $5K spend** |

**The honest framing of this launch:** You are spending **$1,500 to prove one channel works at <$50 CAC**. That's it. If Week 4 hits 15-25 paying, you've PROVEN the model. You have not yet broken even. Raise your next $3-5K with proof in hand.

---

## Your 5 Actions TODAY (Tuesday Apr 22) — Do These in Order

### ✅ Action 1 — Upgrade Resend to Pro ($20/mo) — 30 seconds
Why: Last infrastructure blocker. Free tier caps at 100 emails/day. Any real traffic breaks the funnel.
→ https://resend.com/settings/billing → "Upgrade" → Pro

**Status check:** When done, tell me "Resend Pro done" and I'll update INFRASTRUCTURE_STATUS.md

---

### ✅ Action 2 — Enable 5 Free Security Items — 20 minutes
These are ALL free, ALL prevent fraud/abuse, ALL must be done before driving paid traffic:

1. **Stripe Radar** (free) — Dashboard → Settings → Radar Rules → Enable recommended rules
2. **Budget alerts** set to 50/75/90% in:
   - Google Ads (Settings → Budget alerts)
   - Supabase (Billing → Usage alerts)
   - Anthropic (Settings → Spend alerts)
3. **Verify abuse_signals table is writing** — run this SQL in Supabase:
   ```sql
   SELECT COUNT(*), MAX(created_at) FROM public.abuse_signals;
   ```
   If count is 0 and a user has signed up since April 15 — something's broken. Otherwise ✅.
4. **Vercel analytics enabled** — Dashboard → Project → Analytics → confirm tracking is on
5. **Google Ads account freeze check** — review if the Feb $31.60/0 conversion issue caused any account limitations

**Status check:** When done, tell me "Security items done"

---

### ✅ Action 3 — Reconcile Week 1 Budget (Choose ONE) — 2 minutes
The PM plan says $90 this week. The Finance plan says $355. Pick one:

- **Option A — $90 (recommended):** Just $15/day Google Ads for Campaign B (STAR Method). Nothing else paid this week. Pure validation.
- **Option B — $200 intermediate:** $90 Google + $50 Reddit promoted + $60 LinkedIn promoted (tight, but covers more channels)

**Recommendation:** Option A. One channel. One campaign. Prove it converts before spending more.

**Status check:** Reply "Budget: $90" or "Budget: $200"

---

### ✅ Action 4 — Decide on Edge Function Retry Patch — 5 minutes
**The problem:** Battle Scar #22 — 5 Edge Function call sites have no retry logic. A Google Ads spike could 429 the Anthropic API and silently fail for users. Patch was drafted but never deployed.

**Two paths:**
- **A) Ship the patch now** — 1 hour of work, then safe for any traffic level. I can spawn a Coder agent to deploy it.
- **B) Cap Google Ads at $15/day and monitor manually** — low enough traffic that 429s won't happen. But this means no scaling past Week 1 until the patch ships.

**Recommendation:** B for this week (validate first), A for next week before Week 2 scaling.

**Status check:** Reply "Retry patch: ship now" or "Retry patch: defer to Week 2"

---

### ✅ Action 5 — First LinkedIn Post Live Today — 15 minutes
While ads are on hold until Thursday, you need to start warming the organic channel today.

**Use the pre-drafted post:**
- Open: `docs/marketing/GOOGLE_EMAIL_PH_CAMPAIGNS.md` → Section "LinkedIn Post 1: Launch Announcement"
- Personalize (2-3 edits max)
- Post at 10am ET today — peak LinkedIn engagement window is 10am-12pm ET

**Then:** Identify 5 people in your LinkedIn network who would engage with the post. DM them: "Just posted something — would love your take." Seeds engagement for the algorithm.

**Status check:** Reply "LinkedIn posted + 5 DMs sent"

---

## Day-by-Day Calendar (Next 10 Days)

| Day | Action | Owner | Budget |
|-----|--------|-------|--------|
| **Tue Apr 22** | 5 Tuesday actions above | Alsh | $20 (Resend Pro) |
| **Wed Apr 23** | Reddit organic post #1 (r/jobs, 9am ET) + 10 more LinkedIn DMs to nurses | Alsh | $0 |
| **Thu Apr 24** | Google Ads campaign B goes live at $15/day | Alsh | $15/day starts |
| **Fri Apr 25** | LinkedIn DM wave (20 nurses target list) + check overnight Ads data | Alsh | $15 |
| **Sat Apr 26** | Reddit organic post #2 (r/nursing) — value-first, follow sub rules | Alsh | $15 |
| **Sun Apr 27** | REST DAY — review Week 1 data, journal observations | Alsh | $15 |
| **Mon Apr 28** | Week 1 retro. Check KPIs. If CAC looks right → Week 2 green light. | Alsh + PM Agent | $15 |
| **Tue Apr 29** | Week 2 begins. Ship retry patch. Expand Google Ads if green. | Alsh + Coder | $15 |
| **Wed Apr 30** | Send first email sequence (if upgraded Resend + signups from week 1) | Marketing Agent | $15 |
| **Thu May 1** | Mid-week Week 2 checkpoint | Alsh | $15 |

**Week 1 total spend:** $20 (Resend) + $90 (Google Ads 6 days × $15) = **$110**

---

## Kill Switches (Automatic — Don't Negotiate With Yourself)

| Trigger | Action |
|---------|--------|
| 7 days Google Ads, 0 paid conversions, <50 clicks | KILL keywords. Diagnose landing page. |
| 7 days Google Ads, 0 paid conversions, 50+ clicks | KILL ads. Landing page is the problem, not traffic. |
| Resend bill hits $40 in one week | Investigate email loops, bad fallbacks |
| Supabase on-demand charge appears | Check for abuse or code error before scaling further |
| Any LinkedIn post drops to <100 impressions | Change approach — too corporate or wrong audience |
| Reddit post downvoted below 0 | Delete. Wait 30 days before re-posting there. |
| Any single user refunds within 48 hours of purchase | Call them. Get feedback. |

---

## Week 1 Success = Any TWO of These

- [ ] 20+ new signups (verified emails)
- [ ] 1+ paying customer (any product)
- [ ] Google Ads CTR >3%
- [ ] LinkedIn post >1,000 impressions
- [ ] Any Reddit comment thread where you engaged meaningfully

Hit 2 of 5 → GREEN light for Week 2 scaling
Hit 0-1 of 5 → PAUSE. Diagnose funnel. Don't scale.

---

## When to Panic vs. When to Trust the Plan

**Normal turbulence (don't react):**
- Day 2 has 0 signups — normal, early. Ads just got approved.
- Reddit post gets 3 upvotes — normal. Most posts die. Pivot Sunday.
- LinkedIn DM gets "no thanks" — 80% of DMs bounce. Keep going.

**Actually panic:**
- Day 5 has 0 signups AND 0 clicks — something is broken. Check the ads account, landing page, Stripe.
- Any user says "I tried to pay but couldn't" — fire drill. Test the checkout immediately.
- Anthropic API throws 429s — check tier, check retry patch deployment status.

---

## Out of Scope This Week (Do NOT Touch)

- Product Hunt (defer to May 12, iOS-gated)
- TikTok paid promotion (organic only until iOS approves)
- Android app (indefinitely deferred)
- B2B sales (Erin's constraint — never)
- Raising prices (need 30 days data first)
- Influencer outreach (need testimonials first)
- Pivoting the AI to clinical content (walled garden — never)
- Hiring (Jacob is in onboarding, no other hires until revenue proven)

---

## Reality Check — What This Plan Actually Is

**This is NOT:**
- A path to break-even in 30 days
- A promise of 500 paying customers
- A replacement for Product Hunt or press

**This IS:**
- A $110 validation test to prove the Google Ads funnel works
- A content engine start (LinkedIn + Reddit + email) that compounds
- A framework so when iOS approves, you're ready to 10x overnight
- A demonstration that infrastructure can handle real traffic

**The real launch is May 12** (PH + iOS + testimonials). The next 3 weeks are the rehearsal.

---

## One Last Thing

The Researcher Agent's #1 insight is the marketing angle that will define your brand:

> **"Practice, not cheat."**

Final Round, Interview.chat, and the entire "AI copilot" category is being publicly called cheating. You are the ethical alternative. Say this in every piece of content you create from this point forward. It's your wedge. Don't waste it.

---

*Reconciled from: LAUNCH_PLAN_V2_APR22.md, LAUNCH_BUDGET_APR22.md, COMPETITIVE_POSITIONING_APR22.md, LAUNCH_REVIEW_APR22.md*
*Updated: April 22, 2026 — evening*
