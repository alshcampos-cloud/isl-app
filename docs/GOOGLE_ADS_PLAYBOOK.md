# Google Ads Playbook — InterviewAnswers.ai
## Ready-to-Execute Campaign Setup Guide

**Created:** February 18, 2026
**Budget Recommendation:** $300-500/month to start (Phase 1)

---

## STEP 1: Account Setup Checklist

1. Go to https://ads.google.com and click "Start now"
2. Sign in with the Google account you want to manage billing
3. Choose "Switch to Expert Mode" (bottom of page) — skip the guided setup
4. Set up billing (credit card or bank account)
5. Set timezone and currency (USD)
6. Link Google Search Console (already set up)
7. Install Google Ads conversion tag on interviewanswers.ai (instructions below)

---

## STEP 2: Conversion Tracking Setup

Before running any ads, set up conversion tracking so you know what's working.

### Conversions to Track:
| Conversion | Type | Value |
|-----------|------|-------|
| Sign Up (account creation) | Primary | $5 |
| Start Free Trial/Practice | Primary | $2 |
| Purchase (any tier) | Primary | Dynamic ($14.99-$149.99) |
| Visit Pricing Page | Secondary | $0.50 |

### How to Install:
1. In Google Ads → Tools → Conversions → New conversion action
2. Choose "Website"
3. Enter interviewanswers.ai
4. Add the Global Site Tag to index.html `<head>`
5. Set up event snippets for each conversion

---

## STEP 3: Campaign Structure

### Campaign 1: General Interview Prep (Highest Priority)
**Goal:** Capture people actively looking for interview help
**Budget:** $150-200/month
**Bidding:** Manual CPC, start at $2.50 max

#### Ad Group 1A: Interview Practice
**Keywords (Exact Match):**
- [interview practice app]
- [ai interview practice]
- [mock interview practice]
- [interview prep tool]
- [practice interview questions]

**Keywords (Phrase Match):**
- "interview practice online"
- "ai interview coach"
- "mock interview app"

**Negative Keywords:**
- free (add after testing — some free-seekers convert to paid)
- download
- reddit
- youtube
- salary
- glassdoor
- indeed

#### Ad Group 1B: STAR Method
**Keywords (Exact Match):**
- [star method interview]
- [star method examples]
- [star interview technique]
- [behavioral interview answers]
- [how to answer behavioral questions]

**Keywords (Phrase Match):**
- "star method practice"
- "behavioral interview prep"
- "situational interview answers"

#### Ad Group 1C: Live Interview Help
**Keywords (Exact Match):**
- [interview answer help]
- [real time interview help]
- [interview prompter]
- [interview coaching app]

**Keywords (Phrase Match):**
- "help during interview"
- "interview cheat sheet app"
- "live interview assistance"

---

### Campaign 2: Nursing Interview Prep (NurseInterviewPro)
**Goal:** Capture nurses preparing for job interviews
**Budget:** $100-200/month
**Bidding:** Manual CPC, start at $2.00 max

#### Ad Group 2A: Nursing Interview Questions
**Keywords (Exact Match):**
- [nursing interview questions]
- [nursing interview prep]
- [nurse interview questions and answers]
- [nursing job interview tips]
- [how to prepare for nursing interview]

**Keywords (Phrase Match):**
- "nursing interview preparation"
- "nurse job interview"
- "nursing behavioral interview"

**Negative Keywords:**
- nclex
- nursing school
- lpn (unless you want to target)
- cna
- rn salary
- nursing jobs (they want jobs, not prep)
- hiring

#### Ad Group 2B: Specialty Nursing
**Keywords (Exact Match):**
- [icu nurse interview questions]
- [er nurse interview questions]
- [new grad nurse interview]
- [travel nurse interview prep]
- [clinical nurse interview]

**Keywords (Phrase Match):**
- "hospital nurse interview"
- "nursing specialty interview"
- "new graduate nurse interview"

---

### Campaign 3: Competitor/Brand (Low Priority — Phase 2)
**Goal:** Show up when people search for competitors
**Budget:** $50-100/month
**Bidding:** Manual CPC, $1.50 max

**Keywords:**
- [final round ai]
- [interview warmup google]
- [huru ai interview]
- [pramp interview]
- [interviewing io]
- [mock interview online]

**Note:** Competitor campaigns typically have lower CTR but capture high-intent users who are actively shopping for solutions.

---

## STEP 4: Ad Copy

### Campaign 1 — General Interview Prep

**Headlines (pick any 15, Google will mix and match):**
1. AI Interview Practice Tool
2. Ace Your Next Interview
3. Real-Time Interview Coaching
4. STAR Method Made Easy
5. Practice With AI Interviewer
6. Get Hired Faster
7. Interview Prep That Works
8. AI-Powered Mock Interviews
9. Nail Behavioral Questions
10. Start Practicing Free Today
11. Live Interview Prompter
12. From Nervous to Confident
13. Try Free — No Card Needed
14. Smart Interview Practice
15. Your AI Interview Coach

**Descriptions (pick any 4):**
1. Practice mock interviews with AI that adapts to your answers. Get real-time STAR method coaching. Start free today — no credit card needed.
2. Stop winging your interviews. Our AI coach helps you nail behavioral questions with structured, confident answers. Try it free.
3. Real-time interview prompter + AI mock interviews + STAR method coaching. Everything you need to land the job. Free to start.
4. Join thousands preparing smarter with AI-powered interview practice. Get instant feedback on your answers. Start for free.

**Sitelinks:**
- STAR Method Guide → /star-method-guide
- Try Free Practice → /onboarding
- Behavioral Questions → /behavioral-interview-questions
- See Pricing → /#pricing

**Callout Extensions:**
- No Credit Card Required
- AI-Powered Feedback
- STAR Method Coaching
- Works on Mobile

---

### Campaign 2 — Nursing Interview Prep

**Headlines:**
1. Nursing Interview Prep AI
2. Ace Your Nursing Interview
3. Nurse Interview Questions
4. AI Coaching for Nurses
5. Practice SBAR Responses
6. Land Your Dream Nursing Job
7. NurseInterviewPro.ai
8. Clinical Scenario Practice
9. New Grad Nurse? Start Here
10. Nursing Behavioral Questions
11. Interview Like a Pro Nurse
12. Free Nursing Practice Mode
13. Nurse-Specific AI Coach
14. 36+ Nursing Questions
15. Start Practicing Free

**Descriptions:**
1. Practice nursing interview questions with AI coaching built for healthcare. SBAR communication, clinical scenarios, behavioral questions. Start free.
2. From new grad to experienced nurse — prepare for your next interview with AI that understands healthcare. Try free, no credit card needed.
3. 36+ nursing-specific interview questions with AI feedback on your communication skills. Practice SBAR, clinical scenarios, and behavioral answers.
4. Don't lose your dream nursing job to interview anxiety. Practice with AI that coaches you on clinical communication. Free to start.

**Sitelinks:**
- Nursing Questions List → /nursing-interview-questions
- NurseInterviewPro → /nurse
- STAR Method Guide → /star-method-guide
- Try Free → /onboarding

**Callout Extensions:**
- Built for Healthcare
- SBAR Communication Coach
- Free Practice Mode
- 36+ Nursing Questions

---

## STEP 5: Landing Pages

Each campaign should link to the most relevant page:

| Campaign | Landing Page | URL |
|----------|-------------|-----|
| General Interview | Homepage | https://www.interviewanswers.ai/ |
| STAR Method | STAR Guide | https://www.interviewanswers.ai/star-method-guide |
| Nursing | NurseInterviewPro | https://www.interviewanswers.ai/nurse |
| Behavioral Questions | Behavioral Page | https://www.interviewanswers.ai/behavioral-interview-questions |

**Quality Score Tips** (lower CPC = more clicks for same budget):
- Landing page must match ad copy keywords
- Page load speed matters (our Vercel deployment is fast)
- Mobile-friendly (our pages are responsive)
- Clear CTA above the fold

---

## STEP 6: Budget & Bidding Strategy

### Phase 1: Learning ($300-500/month, Months 1-2)
- Manual CPC bidding — you control max per click
- Start with $10-15/day across all campaigns
- Let Google collect 50+ clicks per ad group before judging
- Review search terms weekly, add negative keywords aggressively
- Expect: $2-4 average CPC, 100-200 clicks/month, 5-15 signups

### Phase 2: Optimization ($500-1000/month, Months 3-4)
- Pause underperforming keywords (high spend, no conversions)
- Increase budget on winners
- Switch to Target CPA bidding (once you have 30+ conversions)
- Add remarketing campaign for site visitors who didn't sign up
- Expect: $1.50-3.50 CPC, 200-500 clicks/month, 15-40 signups

### Phase 3: Scale (Month 5+)
- Add competitor campaigns
- Test Performance Max campaigns
- Expand to new keyword themes
- Consider YouTube video ads (if you create demo videos)

---

## STEP 7: Weekly Optimization Checklist

Every week, check:
- [ ] Search Terms Report — add irrelevant terms as negative keywords
- [ ] Click-through rate (CTR) — aim for 3%+ on search
- [ ] Cost per conversion — is it below your target?
- [ ] Quality Score — are any keywords below 5? Fix landing page relevance
- [ ] Ad copy performance — pause low-CTR headlines/descriptions
- [ ] Budget pacing — are you spending full daily budget?

---

## Expected Results (Conservative Estimates)

### Month 1 (Learning Phase)
| Metric | Estimate |
|--------|----------|
| Budget | $300-500 |
| Clicks | 100-200 |
| CPC | $2-4 |
| Signups | 5-15 |
| Cost per signup | $20-60 |
| Paid conversions | 1-3 |

### Month 3 (Optimized)
| Metric | Estimate |
|--------|----------|
| Budget | $500-800 |
| Clicks | 200-400 |
| CPC | $1.50-3 |
| Signups | 20-40 |
| Cost per signup | $12-25 |
| Paid conversions | 4-10 |

### Break-Even Math
- If a 30-Day Pass = $14.99 and CPA (cost to acquire paying customer) = $30
- You need each customer to buy ~2 passes to break even
- Annual plan at $149.99 means you're profitable from first purchase if CPA < $150
- **Target: Get CPA under $50, focus on annual plan upsells**

---

## CPC Benchmarks by Industry (2026 Reference)

| Industry | Avg CPC |
|----------|---------|
| Education & Instruction | $6.23 |
| Healthcare | $1.49-5.00 |
| Technology (SaaS) | $5.00+ |
| Career & Employment | $2-4 |
| **Our niche estimate** | **$2-4** |

Sources: [Backlinko](https://backlinko.com/how-much-does-google-ads-cost), [WordStream](https://www.wordstream.com/blog/google-ads-cost), [Bootstrap Creative](https://bootstrapcreative.com/how-much-does-it-cost-to-buy-keywords-on-google/)

---

## Quick Start: What to Do First

1. **Create Google Ads account** → ads.google.com
2. **Set up billing** → credit card
3. **Install conversion tracking** → Global Site Tag in index.html
4. **Create Campaign 1** (General Interview) with Ad Groups 1A + 1B
5. **Create Campaign 2** (Nursing) with Ad Group 2A
6. **Set daily budget** → $10/day total ($5 general, $5 nursing)
7. **Launch and wait 7 days** before making changes
8. **Review search terms** → add negative keywords
9. **Repeat weekly optimization**

---

*This playbook was prepared for InterviewAnswers.ai. All ad copy and keywords are ready to copy-paste into Google Ads.*
