# "Try It First" — Campaign Brief (drafted while inline demo was being built)

**Date:** 2026-04-23 evening
**Angle:** Offensive positioning. Positive framing. Zero friction.
**Landing:** www.interviewanswers.ai (the new inline demo component)
**Status:** Draft — ready to A/B test against the "Don't Be a Fraud" campaign once demo ships

---

## Why this angle complements "Don't Be a Fraud"

The "Don't Be a Fraud" campaign is **defensive**:
- Addresses the candidate who's considering a cheat copilot
- Ethical framing ("don't fake it, earn it")
- Anti-competitive (positions against Final Round, Cluely, etc.)
- Works on audiences who already know about the cheat category

"Try It First" is **offensive**:
- Addresses the candidate who's tired of marketing-speak
- No guilt, no competitor bashing — pure product demonstration
- Works on cold audiences who have no context on the category
- Zero-friction conversion: "Try it in 10 seconds, no signup"

**Run both simultaneously** with different creative and different targeting.

---

## Core hook

**Headline variants (pick top performer in A/B):**
1. **"Try it. Ten seconds. No signup."**
2. **"See what your answer looks like to AI."**
3. **"One interview question. Real AI feedback. Right now."**
4. **"Stop reading about AI interview tools. Try one."**
5. **"You have 10 seconds. So does your AI feedback."**

## Key differentiation (vs. category)

| Competitor pattern | Our "Try It First" move |
|---|---|
| Watch our demo video | *Use the actual product on the landing page* |
| Sign up for free trial | *Get feedback before we ask for your email* |
| See screenshots | *See real AI output on YOUR answer* |
| Book a demo | *No sales call — just type and hit submit* |

**Nobody in the AI interview prep category runs an inline demo.** Per Researcher Doc 1:
- Pramp → requires signup
- Yoodli → requires signup (has a "try it" button that opens signup)
- BigInterview → video-only
- Google Interview Warmup → has inline practice BUT requires Google account
- Final Round / Cluely / Sensei / LockedIn → all require signup

We'd be the ONLY one.

---

## Ad copy

### Google Ads — Responsive Search

**Headlines (max 30 chars):**
1. Try AI Interview Feedback
2. 10 Seconds. No Signup.
3. See Your Answer Scored
4. Real AI. Real Feedback.
5. Answer One Question Now
6. Stop Watching Demos
7. Actually Try The AI
8. Free Feedback, No Email
9. 10-Second Interview Practice
10. AI Reads Your Answer
11. Try Before You Sign Up
12. Instant Interview Practice
13. One Question. No Signup.
14. Skip the Signup. Try It.
15. Real AI Feedback Now

**Descriptions (max 90 chars):**
1. Type your answer to one interview question. Get real AI feedback in 10 seconds. No signup.
2. Watch what AI sees in your interview answer — then decide if it's worth your email.
3. Most interview AIs ask for your signup first. We show you the product instead. Try it now.
4. Practice one behavioral interview question. Real AI scoring. Zero signup friction.

**Final URL:** `https://www.interviewanswers.ai/?utm_source=google&utm_medium=cpc&utm_campaign=try_it_first#demo`

---

### Reddit Promoted Post

**Headline:** "I built an AI interview coach. You can try it without signing up."

**Body:**
> Every interview prep tool asks for your email before you've seen what it does. I think that's backwards. So on our landing page, we put a single interview question and a textarea. Type your answer, click a button, get real AI feedback in 10 seconds. No signup. No email gate.
>
> If the feedback sucks, close the tab. If it helps, we're free to start (3 AI interviews + 10 practice sessions per month, no credit card).
>
> The question is "Tell me about a time you led a team through a difficult challenge." Standard behavioral. Takes 2 minutes to try.
>
> Built it this way because we just rebranded from "live prompter" (the cheat-copilot category) to "practice coach" (rehearsal only). Read the whole ethics story at /ethics if you're curious.
>
> Try it: interviewanswers.ai
>
> Would love feedback on the feedback.

**CTA:** Try the free demo

---

### LinkedIn Sponsored Post

**Primary text:**
> Every interview AI product on LinkedIn asks you to sign up before you know if it works.
>
> We inverted it. Our landing page has a single interview question ("Tell me about a time you led a team through a difficult challenge") with a textarea. Type your answer. Click submit. Real AI feedback in 10 seconds. Scored 0-10, with specific STAR-method suggestions. No email required. No credit card. No trial expiration.
>
> If the feedback is useful, we're free to start. If it's not, you've lost 10 seconds.
>
> Built this because "try before you buy" is the right answer in 2026.
>
> → interviewanswers.ai

**Headline:** Try the AI before you sign up
**CTA:** Learn more

---

### Meta (Instagram/Facebook)

**Primary text:**
> 10 seconds. 1 question. Real AI feedback. No signup.
>
> Most interview AIs want your email before they'll show you what they do. We flipped it.
>
> 👉 interviewanswers.ai

**Headline:** Try the AI. No signup.
**CTA:** Learn more
**Landing URL:** `https://www.interviewanswers.ai/?utm_source=meta&utm_medium=paid&utm_campaign=try_it_first`

---

### TikTok / Reels — 12-second script

**Visual:** Point of view — a phone screen showing our landing page. Cursor hovers over the inline demo, types a quick answer ("I led a redesign project..."), hits submit. Feedback card appears with "Score: 7/10" and 3 bullet points. Fade to CTA.

**Voiceover / caption:**
> "Most AI interview tools make you sign up before you see what they do."
> [Screen shows our demo]
> "We flipped it."
> [Submit → AI feedback appears]
> "10 seconds. No signup. Real feedback."
> **"InterviewAnswers.ai. Practice, not cheat."**

**On-screen CTA:** Link in bio

---

### Email Subject Line Variants

1. Try the AI before you sign up
2. 10 seconds, one question, real feedback
3. You can try it without giving us your email
4. Skip the signup. Try the AI.
5. The AI interview tool that doesn't hide behind a signup wall

---

### Product Hunt — Launch Hook

**Tagline:** Try it in 10 seconds. No signup. Real AI feedback.

**First comment (founder):**
> Every AI interview prep tool on Product Hunt asks for your signup before you know if it helps. I think that's backwards.
>
> So our landing page has a single interview question ("Tell me about a time you led a team through a difficult challenge"), a textarea, and a submit button. Click it. Real AI feedback in 10 seconds. 0-10 score, STAR-method breakdown. No email. No credit card. No trial.
>
> If the feedback is useful → we're free to start, unlimited-practice upgrade is $14.99 for 30 days (no autopay).
> If it's not → close the tab. You've lost 10 seconds.
>
> We just rebranded from a "live prompter" feature (the cheat-copilot category) to a pure practice coach. Full story at /ethics.
>
> Try it. Tell me if the AI feedback is any good. 🙏

---

## Landing Page Enhancement for This Campaign

The inline demo IS the landing experience for this campaign. Traffic lands on `/` or `/?#demo`. Consider:
1. When `#demo` is in the URL, **auto-scroll to the demo section** on mount
2. Pre-focus the textarea (mobile-aware: don't force keyboard open)
3. Pre-populate utm params into demo response tracking (for Funnel Agent later)

---

## Budget Recommendation

If running alongside "Don't Be a Fraud" ($90 Week 1):

**Option A — A/B between campaigns ($90 total):**
- "Don't Be a Fraud": $45 (defensive, targets cheat-tool-curious audiences)
- "Try It First": $45 (offensive, targets cold interview-prep audiences)

**Option B — Sequential test:**
- Week 1: "Try It First" only ($90)
- Week 2: Add "Don't Be a Fraud" if Week 1 CPA is green
- Logic: inline demo removes the single biggest conversion friction (signup wall) — should produce better CPA than any ad can alone

**Recommended: Option B.** The inline demo is the WHOLE thesis. Let it fly first.

---

## Success Criteria

Same KPIs as "Don't Be a Fraud" PLUS:

| Demo-specific metric | Green | Yellow | Kill |
|---|---|---|---|
| Demo completion rate (textarea → submit) | >40% | 20-40% | <20% |
| Demo → signup conversion | >15% | 5-15% | <5% |
| Demo abuse rate (rate-limit hits) | <10% | 10-25% | >25% |
| Edge Function cost per demo | <$0.001 | <$0.005 | >$0.01 |

**Kill trigger:** Demo abuse rate >25% OR cost per demo >$0.01. At that point we'd need to add server-side IP rate-limiting.

---

## Next Steps (after the demo ships)

1. Launch "Try It First" as the primary $90 Week 1 campaign
2. Hold "Don't Be a Fraud" as backup / Week 2 expansion
3. Track demo → signup funnel in funnel-tracker (already wired per Phase 2 IAI agent system)
4. At 1,000 demo completions, run a sentiment analysis on submitted answers (are users giving real answers or joke answers?) to validate the funnel quality
5. If demo engagement is high, consider adding a SECOND demo question (variety)

---

**Status: Campaign ready to launch the moment the inline demo ships and verifies.**
