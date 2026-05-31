# Marketing for Jacob — A Primer
**From:** Lucas
**To:** Jacob Bernal
**Date:** 2026-05-08

You're a sharp engineer and you just earned authoring authority on the IA.ai codebase. Now we're pivoting to marketing and you're new to that domain. This is the catch-up. Read in one sitting, ~10 minutes.

---

## 1. What marketing is for IA.ai specifically

Forget generic marketing. Our brand position is restraint, in the Patagonia / DuckDuckGo / Signal tradition — companies that won by **publicly refusing** to do the obviously profitable thing.

Our wedge is the **"Practice, not cheat"** thesis. The market is full of "AI interview assistants" that promise to feed candidates answers in real-time during live interviews. That's a cheating tool dressed in productivity language. We shipped one of those (the original Live Prompter) and then **deleted it**, on purpose, and wrote a blog post explaining why. That blog (`docs/BLOG_WHY_WE_REMOVED_LIVE_PROMPTER.md`) is the foundational document — every campaign references it directly or indirectly.

The positioning is: **we are the ethical interview prep tool that practices before the interview, never during.** Competitors say "be your interview hero with our real-time copilot." We say "do the work; we'll help you practice; the interview itself is yours."

This positioning makes most marketing strategies wrong for us. We can't run "amazing interview hack" ads — that's the cheating frame. We can't promise "land any job" — that's overclaiming. We CAN'T do "you deserve this shortcut" — that's the exact opposite of our wedge.

What we CAN do: refusal narratives ("We deleted the prompter. Here's why."), science-of-getting-good content (the testing effect, deliberate practice), and "before-it-happens" framing (preparation, not improv). These three angles produce 90% of our shippable creative.

## 2. Current channels + what we've tried

**Phase 1 (Apr 22 launch attempt) — slipped.** The plan was Web → Product Hunt → LinkedIn → email drip → Reddit → IG/TT. We assembled the assets but the launch didn't fully fire. Reasons: pricing decisions weren't locked, Stripe annual pass was broken (mode mismatch), Apple Build 43 didn't get approved in time, and the testing-the-funnel runs surfaced bugs we're still fixing (your test report).

**What we've actually shipped, in priority order:**

- **Letter on Screen v2** — 12-second typography spot, 1080×1920 (Reels/TikTok aspect). Lives at `docs/marketing/mocks/letter_on_screen_v2.mp4`. The "We deleted the prompter" refusal-narrative wedge, told in plain text on screen.
- **"What's Worth Practicing" audio v0.5** — 60-second voice-over on a waveform visualization. The 60s version is for Reels/TikTok audio-discovery surfaces (audio ads). Lives at `docs/marketing/mocks/wwp_audio_only_v0_5.mp4`. A video version is a pending decision — see decisions list.
- **3 statics** — `static_a_practice_not_cheat.png`, `static_b_before_it_happens.png`, `static_c_testing_effect.png`. Three angles, three aspect ratios. Lives in `docs/marketing/mocks/`.
- **Spot 5 Transformation** — Aaliyah / nursing-track-specific spot. Built but not yet pushed to paid. Lives on Lucas's Mac per `~/Desktop/IA_AI_LAUNCH_INDEX.md`.
- **Don't-be-a-fraud series** — 5 PNG variants (earn it / family / nursing / we-deleted-it / science). Lives in `docs/marketing/creatives/`.

**What we've tested in paid:** one Google Ads run with ~170 impressions, 0 conversions, broken conversion pixel. Real takeaway: we need pixels installed before any paid retest. The Pixel install is currently blocked on Lucas creating Meta / LinkedIn / Reddit pixel IDs (Phase 1 hit a Meta Business Manager permission wall).

**What we have but haven't shipped:** Cinematic Pack v1 — 3 spots (γ "Object That Was Waiting" / β "Practice Made Visible" / ε "Walk-and-React"). Phase 0 artifacts done for all three. γ was killed earlier in production (glitchy AI output, note-overlay drift). β + ε have raw clips but Lucas paused on smoke/brightness fixes. Total expected production cost $36.90 / hard cap $90. Media test plan $900 across Days 4-13.

## 3. Key terminology — plain language

- **CAC** (Customer Acquisition Cost) — the dollars you spend to get one paying customer. If you spend $300 on ads and 3 people buy a $39 pass, CAC = $100. Our target CAC for a 30-day pass is $25-35.
- **LTV** (Lifetime Value) — total revenue from one customer over time. For a single 30-day pass at $39 with no repeat, LTV = $39. If 20% buy another, LTV climbs.
- **ROAS** (Return on Ad Spend) — revenue ÷ ad spend. $100 in ads → $400 in revenue → ROAS = 4. Anything below 1.0 is losing money.
- **CTR** (Click-Through Rate) — % of people who saw the ad and clicked. Above 1.5% is decent. Below 1% is a kill candidate.
- **CPC** (Cost Per Click) — what you pay each time someone clicks. Above $3 is expensive for our budget profile.
- **Conversion funnel** — the path: impression → click → landing page → signup → first session → purchase. We measure dropoff at each step.
- **Paid vs organic** — paid = you bought the impression (ads). Organic = someone shared / found you free (SEO, word of mouth, social shares). Different unit economics, different feedback loops.
- **Kill switch** — the math threshold below which you turn off an ad without further deliberation. Ours: CTR < 1.5% OR CPC > $3 after 1000 impressions = kill.
- **Soft launch** — small, organic-first, no big spend. Used to surface bugs and pressure-test funnel before paid amplification.
- **Daylight rule** — never deploy high-risk changes (HIGH-blast in framework terms, which includes large paid spend bets) outside daytime hours. Same as the engineering rule.
- **Attribution** — figuring out which channel/ad/touch actually caused a conversion. Hard. We use UTM parameters + pixel events + first-party signup-source dropdown.

## 4. Decision framework — when to ship vs iterate vs kill

For paid spend specifically, we use a kill-switch math + soft-launch-organic-first pattern:

1. **Always soft-launch organic before paid amplification.** Post the creative on LinkedIn or Reddit organically. If it doesn't get traction without dollars behind it, paid won't fix that. Paid amplifies existing signal — it doesn't create signal.
2. **Pre-commit kill thresholds before launching.** Write down: "I will kill this ad if CTR < 1.5% AND CPC > $3 after $X spent or N impressions." Whichever hits first. No re-litigating after the fact.
3. **HIGH-blast paid spend = daylight only.** Don't launch a $1000 ad campaign at 2am tired. Same rule that applies to Stripe webhook edits: daylight + second pair of eyes (or at minimum, write the kill threshold down before launching).
4. **Ship at 80% confident, iterate at 60%, kill below 40%.** If you're 80%+ that this creative will work, ship it now. If 60-80%, ship a small test. If 40-60%, iterate before shipping. If below 40%, kill or rebuild.
5. **The brand-voice gate is absolute.** Anything that drifts toward "cheating" framing or overpromising results gets killed regardless of how good the engagement numbers look. The wedge is restraint; we don't trade it for short-term clicks.

## 5. What's locked vs what's negotiable

**Locked (don't touch without Lucas explicit override):**
- Brand voice (restraint, refusal narrative, "practice not cheat")
- Pricing ($39 30-day, $19.99 nursing pass, $149 annual — per `JACOB_FIXES_IMPLEMENTATION_PLAN_2026-05-08.md` #8a)
- Apple App Store / TestFlight workflow (App Review controls timing)
- Stripe webhook signature verification path (engineering HIGH-blast)
- Public-facing copy on the founder-blog level (the ethics-pivot blog is canon)

**Negotiable (where you can author):**
- Specific creative execution within brand voice — new ad variants, new hook angles, new statics
- Channel-specific mechanics — IG vs Reddit vs LinkedIn-specific best practices, ad format choices
- Distribution tactics — which subreddits, which LinkedIn groups, which creator partnerships
- Attribution mechanics — UTM schemes, pixel events, signup-source tracking
- Performance analysis — kill-switch math, A/B test design, channel-mix optimization
- Optimization — landing page conversion rate, email open rate, ad creative iteration
- Marketing-stack tooling — choice of Pixel vs Conversions API, Klaviyo vs Resend etc., analytics dashboards

**Founder's call (Lucas only, but you can advise):**
- Whether to commit budget to a specific campaign
- Whether to extend product offering (new tiers, new SKUs)
- Whether to revive killed creative or stay killed
- Brand-voice deviations for specific channels (probably no, but Lucas decides)

## 6. Where you fit in

You're a smart engineer new to marketing. The framework doesn't expect you to author brand voice — that's locked. But it expects you to bring engineering rigor to:

- **Ad mechanics:** which ad format performs on which platform, why, how to measure
- **Distribution:** how to get creative in front of the right audience efficiently
- **Attribution:** building the measurement infrastructure that tells us what works
- **Optimization:** the iterative loop of test → measure → kill or scale → next
- **Channel-specific tactics:** what works on Reddit doesn't work on LinkedIn; you'll learn each channel's grain
- **Performance review:** running the kill-switch math weekly; surfacing campaigns that should die

When you have a question that's about MECHANICS, you decide. When it's about VOICE OR PRICING, you bring it to Lucas. Same dual-track structure as the Jacob fixes plan — LOW-blast you authorize, HIGH-blast escalates.

## 7. First 3 calls you should weigh in on

From the decisions-pending list (`MARKETING_DECISIONS_PENDING_2026-05-08.md`), these are the three calls where your engineering lens helps most:

1. **Pixel install — install now or wait?** This is the attribution-infrastructure decision. Until Pixel IDs are wired, every paid ad runs blind. Lucas has been blocked on Meta Business Manager permissions. Your call: is it worth Lucas spending 60 min to provision new Pixels + ad accounts, OR can we afford to run another small paid test without attribution and pull learning from UTM + signup-source dropdown alone? Engineering-lens question: what's the cheapest reliable attribution we can build?

2. **Email deliverability investment — $400 Resend Pro upgrade now or after first paid signal?** Resend free tier handles low volume but rate-limits and lacks deliverability dashboards. Spending $400 on Pro unlocks better insights + IP warming. Engineering-lens question: what's the failure mode if we don't upgrade and send 500+ emails in a launch burst?

3. **Kill switch test on Ad #2 ($390 budget).** We have one Google Ads test in the books with broken pixel data. Re-running with current pricing math at $390 hard cap would test whether the brand voice + new creative + (hopefully wired) pixels produce a measurable CAC. Engineering-lens question: is the experiment design sound? What confound do we still have? Is the kill threshold defensible?

For each of these, write up your read, surface to Lucas, get a yes/no, then either execute or escalate.

---

Welcome to the marketing side. Same framework, same discipline, different domain. The brand voice gate is the only thing that's truly non-negotiable — everything else is iterable.

Read `MARKETING_DECISIONS_PENDING_2026-05-08.md` next, then loop with Lucas on the three you want to start with.

— Lucas (via Cowork)
