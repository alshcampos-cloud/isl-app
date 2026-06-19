# USF Career Services Partnership — Complete Analysis
## InterviewAnswers.AI + NurseInterviewPro
### March 5, 2026

---

## EXECUTIVE SUMMARY

Jessica Li (Career Counselor, USF Career Services) asked about group pricing for our nursing interview prep tool. This is a significant opportunity because:

1. **USF has the largest nursing school in the Bay Area** — 1,508 SONHP students, ~1,095 nursing students, 350-400 pre-licensure graduates/year
2. **Career Services serves ALL 8,913 students** — not just nursing. Both products are relevant.
3. **USF already pays for interview prep** — they use Big Interview. We're not creating a new budget category.
4. **USF is a private Jesuit university** — faster purchasing, more budget flexibility than public schools
5. **The $5,000 direct purchase threshold** — price under $5K and Alex Hochman (Senior Director) can buy without formal procurement

**Bottom line:** Offer a flat annual institutional license at $4,999/year for NurseInterviewPro (nursing students) as the anchor. Introduce InterviewAnswers.AI (all students) as an add-on. Bundle both for $7,999/year. Start the conversation with a free pilot semester.

---

## PART 1: WHO WE'RE SELLING TO

### The Contact: Jessica Li
- **Title:** Career Counselor
- **Email:** jmli2@usfca.edu
- **Role:** Front-line counselor, not a budget decision-maker
- **What she asked:** "Is this price per person and what would it look like for a group price or discount?"
- **What this means:** She's exploring. Someone (possibly a student, possibly a colleague) brought our tool to her attention. She's gathering info to bring to her boss.

### The Decision-Makers (Jessica will escalate to these people)
| Name | Title | Email | Role |
|------|-------|-------|------|
| **Alex Hochman** | Senior Director | ahochman@usfca.edu | Budget authority, purchasing decisions |
| **Ellen Kelly** | Director of Career Success | kellye@usfca.edu | Program decisions, tool evaluation |
| Julia Hing | Director of Employer Relationships | jahing@usfca.edu | May care about placement rates |

### Org Structure
Career Services reports through **Student Life** → VP of Student Affairs → Provost

### Current Tech Stack (Confirmed)
1. **Handshake** — primary career management platform (~$8K-$15K/year estimated)
2. **Big Interview** — interview practice tool (~$3K-$15K/year estimated). **This is our direct competitor.**
3. **Graduates First** — free practice assessments via university email
4. **Micro-internship platform** (likely Parker Dewey)

**NOT currently using:** VMock, GoinGlobal, Vault

---

## PART 2: USF BY THE NUMBERS

### Total University
| Metric | Number |
|--------|--------|
| Total enrollment (Fall 2024) | 8,913 |
| Undergraduate | 5,321 |
| Graduate | 3,592 |
| Schools | Arts & Sciences (4,226), Management (1,397), Nursing & Health (1,508), Education (1,089), Law (571) |
| Tuition (UG) | $61,870/year |
| Graduation rate (6-year) | 70.2% |

### School of Nursing & Health Professions (SONHP)
| Metric | Number | Source |
|--------|--------|--------|
| Total SONHP enrollment | 1,508 (987 UG + 521 Grad) | USF Quick Facts Fall 2024 |
| Nursing-specific enrollment | ~1,095 | California BRN |
| BSN new students/year | ~275 (235 SF + 40 Sacramento) | BRN |
| ME-MSN new students/year | ~124 (72 SF + 52 Orange County) | BRN |
| BSN graduates/year (NCLEX tested) | 250-268 | BRN 5-year data |
| MSN graduates/year (NCLEX tested) | 101-131 | BRN 5-year data |
| Total pre-licensure grads/year | 350-400 | BRN |
| DNP degrees/year | ~46 | College Factual |
| BSN NCLEX pass rate (3-year) | 90% | USF self-reported |
| ME-MSN NCLEX pass rate (3-year) | 92% | USF self-reported |
| Full-time nursing faculty | 34 | US News |
| US News Nursing Master's rank | #27 nationally | US News 2026 |
| US News UG Nursing rank | #22 (top 3%) | US News 2025 |

### Key Insight: Who Would Actually Use Each Product?

**NurseInterviewPro (Nursing Interview Prep):**
| Segment | Est. Size | When They Interview | Likelihood of Use |
|---------|-----------|--------------------|--------------------|
| BSN Juniors (3rd year) | ~250 | Part-time jobs, clinical rotations | Medium (20-30%) |
| BSN Seniors (4th year) | ~250 | First nursing job after graduation | **High (40-60%)** |
| ME-MSN students (pre-licensure) | ~274 | First nursing job post-program | **High (40-60%)** |
| DNP students | ~90 | Advanced practice positions | Medium (20-30%) |
| **Total addressable** | **~864** | | |
| **Realistic active users** | **~200-350** | | |

**InterviewAnswers.AI (General Interview Prep):**
| Segment | Est. Size | When They Interview | Likelihood of Use |
|---------|-----------|--------------------|--------------------|
| ALL undergrads | 5,321 | Part-time jobs, internships, post-grad | Low-Medium (5-15%) |
| Business/Management grad | 368 | MBA jobs, consulting | Medium (15-25%) |
| Education grad | 1,089 | Teaching positions | Low (5-10%) |
| Other grad students | ~2,135 | Various | Low (5-10%) |
| **Total addressable** | **~8,913** | | |
| **Realistic active users** | **~450-900** | | |

---

## PART 3: THE 30-DAY PASS PROBLEM — AND HOW TO SOLVE IT

### Current Product Structure
- NurseInterviewPro: $19.99 one-time → 30 days of access
- InterviewAnswers.AI: $14.99 one-time → 30 days of access
- Pro tier: $29.99/month subscription

### Why 30-Day Passes Don't Work for Institutions
1. **Administration nightmare** — who distributes codes? When do they expire? What about new students?
2. **Timing mismatch** — students need access throughout a semester (4 months), not just 30 days
3. **Renewal friction** — students won't re-activate; they'll just stop using it
4. **Budget unpredictability** — "how many passes do we buy?" is an unanswerable question

### The Solution: Institutional Annual License

**What we offer:** Unlimited access for all students in the covered population for 12 months.

**How it works technically:**
1. USF gets a custom institutional login page (e.g., `interviewanswers.ai/usf`)
2. Students sign up with their `@usfca.edu` email
3. Domain-verified accounts automatically get full access (no 30-day limit)
4. Access renews annually when the institution renews the contract
5. Usage dashboard for Career Services to track engagement (anonymized)

**What we'd need to build (minimal):**
- Email domain verification at signup (`@usfca.edu` = institutional access)
- Remove 30-day expiration for institutional users
- Basic admin dashboard (student count, session count, feature usage)
- This is straightforward — it's a tier check, not a platform rebuild

**Alternative (simpler for V1):**
- Generate a batch of extended-duration access codes (semester = 120 days)
- Jessica/Career Services distributes codes
- No custom engineering needed for initial pilot

---

## PART 4: COST TO SERVE — HONEST NUMBERS

### API Cost Per Student

| Action | Model | Cost/Call | Avg Calls/Active User/Month |
|--------|-------|-----------|---------------------------|
| Practice question feedback | Haiku | $0.001 | 15-25 |
| Mock interview turn | Sonnet | $0.025 | 20-40 |
| STAR coaching feedback | Sonnet | $0.025 | 5-10 |
| Live Prompter | Haiku | $0.001 | 10-20 |
| **Total per active user/month** | | | **$0.65-$1.75** |

Average: ~$1.00/active user/month

### Scenario Modeling: NurseInterviewPro at USF

| Scenario | Students w/ Access | Adoption Rate | Active Users | Monthly API Cost | Annual API Cost |
|----------|-------------------|---------------|--------------|-----------------|-----------------|
| Conservative | 800 | 15% | 120 | $120 | $1,440 |
| Moderate | 800 | 25% | 200 | $200 | $2,400 |
| Aggressive | 800 | 40% | 320 | $320 | $3,840 |

**Note on usage patterns:** Students don't use it evenly across 12 months. Usage spikes during:
- October-November (fall interview season)
- March-April (spring interview season)
- May (graduating seniors)
- The "active" months are really ~6 out of 12, so annual cost is roughly half the naive 12x calculation

**Adjusted annual API cost:**
- Conservative: ~$720
- Moderate: ~$1,200
- Aggressive: ~$1,920

### Scenario Modeling: InterviewAnswers.AI (General) at USF

| Scenario | Students w/ Access | Adoption Rate | Active Users | Monthly API Cost | Annual API Cost |
|----------|-------------------|---------------|--------------|-----------------|-----------------|
| Conservative | 8,913 | 5% | 446 | $446 | $5,352 |
| Moderate | 8,913 | 10% | 891 | $891 | $10,692 |
| Aggressive | 8,913 | 15% | 1,337 | $1,337 | $16,044 |

**Adjusted for seasonal usage (~6 active months):**
- Conservative: ~$2,676
- Moderate: ~$5,346
- Aggressive: ~$8,022

### Other Costs (Fixed)
| Item | Monthly | Annual |
|------|---------|--------|
| Supabase (already paying) | $25 | $300 |
| Vercel (already paying) | $20 | $240 |
| Support/maintenance time | ~2 hrs/month | ~$0 incremental |
| **Incremental fixed costs** | | **~$540** |

---

## PART 5: PRICING STRATEGY

### The $5,000 Magic Number

USF's direct purchase threshold is **$5,000**. Below this, Alex Hochman (Senior Director) can approve without procurement. Above it, Purchasing & Ancillary Services (PaAS) gets involved, adding weeks to months.

**This shapes our entire strategy.**

### Pricing Tiers

#### Option A: NurseInterviewPro Only (Nursing Students)
| | Price | Our Cost | Gross Margin | Procurement |
|---|-------|----------|-------------|-------------|
| **Anchor** | $4,999/year | ~$1,200-$1,920 | 62-76% | Under threshold — fast |
| Negotiated | $3,999/year | ~$1,200-$1,920 | 52-70% | Under threshold — fast |
| Floor | $2,999/year | ~$1,200-$1,920 | 36-60% | Under threshold — fast |

**Per-student equivalent at $4,999:** $4,999 / 800 nursing students = **$6.25/student/year**
Compare to: individual pass at $19.99 = 69% discount. Sounds impressive.

#### Option B: InterviewAnswers.AI Only (All Students)
| | Price | Our Cost | Gross Margin | Procurement |
|---|-------|----------|-------------|-------------|
| **Anchor** | $7,999/year | ~$2,676-$5,346 | 33-67% | Requires PaAS |
| Negotiated | $5,999/year | ~$2,676-$5,346 | 11-55% | Requires PaAS |
| Floor | $4,999/year | ~$2,676-$5,346 | 0-47% | Under threshold |

**Risk:** At aggressive adoption, our cost approaches our price. The general tool is riskier at lower price points because 8,913 students is a large pool.

#### Option C: Campus Bundle (RECOMMENDED)
| | Price | Our Cost | Gross Margin | Procurement |
|---|-------|----------|-------------|-------------|
| **Anchor** | $9,999/year | ~$3,876-$7,266 | 27-61% | Requires PaAS |
| Negotiated | $7,999/year | ~$3,876-$7,266 | 9-52% | Requires PaAS |

**The bundle pitch:** "Your nursing students get specialized interview coaching for one of the most competitive fields in healthcare. ALL your students get AI-powered interview prep. One contract, one vendor, one price."

### RECOMMENDED STRATEGY: Lead with Nursing, Bundle Up

**Step 1:** Offer NurseInterviewPro institutional license at **$4,999/year**
- Under procurement threshold = fast decision
- High margin (62-76%)
- Jessica asked about nursing — give her what she asked for
- Clear differentiator vs. Big Interview (nursing-specific, AI-powered, clinical framework-aligned)

**Step 2:** On the call, introduce InterviewAnswers.AI for all students
- "Since you're Career Services for the whole university, you might also be interested in..."
- Bundle price: **$7,999/year** for both
- Frame as: "NurseInterviewPro alone is $4,999. Add general interview prep for all 8,913 students for just $3,000 more."

**Step 3:** Offer a free pilot to reduce risk
- 30-day pilot with one cohort (e.g., BSN seniors, ~250 students)
- No commitment, no cost
- We generate engagement data to prove value
- Pilot converts to annual license

### Why This Is Better Than Per-Pass Group Pricing

Jessica asked about per-person pricing. Here's why we should redirect:

| Approach | Per-Pass Group Pricing | Annual Institutional License |
|----------|----------------------|------------------------------|
| Jessica's question | "Buy 100 passes at $12 each = $1,200" | "Unlimited access for all nursing students = $4,999/year" |
| Administration | Career Services has to distribute codes | Students sign up with @usfca.edu email |
| Coverage | Only students who get codes | All eligible students |
| Budget predictability | "How many passes should we buy?" | One flat number |
| Renewal | "Do we need more passes? Different passes?" | One annual renewal |
| Value perception | "$1,200 for some passes" | "$4,999 for a university-wide program" |

---

## PART 6: COMPETITIVE POSITIONING

### USF Already Pays for Big Interview

This is both a challenge and an opportunity.

**Big Interview:**
- Generic interview prep (behavioral, technical, industry-specific)
- Pre-recorded video practice with AI feedback
- 700+ university partners
- Individual price: $299 lifetime
- Institutional: estimated $3K-$15K/year (custom quoted)
- **No nursing-specific content**
- **No clinical framework alignment**
- **No AI mock interviewer (just video recording)**

**Our Differentiator:**

| Feature | Big Interview | NurseInterviewPro | InterviewAnswers.AI |
|---------|--------------|-------------------|---------------------|
| AI mock interviewer | No (video-only) | Yes (conversational AI) | Yes (conversational AI) |
| Real-time coaching | No | Yes (Live Prompter) | Yes (Live Prompter) |
| Nursing-specific questions | No | Yes (clinically validated) | N/A |
| STAR method coaching | Basic templates | AI-powered feedback | AI-powered feedback |
| Clinical framework alignment | None | NCSBN, SBAR, Nursing Process | N/A |
| Speech analysis | No | Yes (pacing, filler words) | Yes |
| Advisory board oversight | No | Licensed nurse educators | N/A |

**The pitch is NOT "replace Big Interview."** The pitch is: **"Big Interview handles general prep. NurseInterviewPro fills the gap for your largest school — nursing."**

This is additive, not competitive. USF can keep Big Interview AND add us. This removes the "do we have to switch?" friction.

### Price Comparison to Peers

| Tool | What It Does | Est. Institutional Price |
|------|-------------|-------------------------|
| Handshake | Career management platform | $8,000-$15,000/year |
| Big Interview | General interview practice | $3,000-$15,000/year |
| VMock | AI resume review | $5,000-$30,000/year |
| **NurseInterviewPro** | **Nursing interview AI coaching** | **$4,999/year** |
| **Both products bundled** | **All-student interview AI coaching** | **$7,999/year** |

Our pricing is competitive — comparable to Big Interview, less than VMock, much less than Handshake.

---

## PART 7: USF-SPECIFIC SELLING POINTS

### Why This Matters to USF Specifically

1. **SONHP is USF's crown jewel** — #22 undergrad nursing nationally, #27 master's. 1,508 students = 17% of total enrollment. Supporting nursing success = institutional priority.

2. **350-400 graduates/year compete for Bay Area nursing jobs** — Stanford Medical Center, UCSF, Kaiser, SFGH all recruit from USF. Interview performance directly affects placement rates.

3. **NCLEX pass rates fluctuate** — BSN dipped to 85% in 2021-22, currently at 89.5%. Communication coaching complements clinical prep.

4. **$61,870/year tuition** — parents and students expect career support for that price. AI-powered coaching tools are table stakes at top-tier nursing schools.

5. **Jesuit mission alignment** — USF's mission emphasizes equity and access. An institutional license means ALL nursing students get coaching, not just those who can afford $19.99 individually.

6. **Sacramento + Orange County campuses** — institutional license covers all campuses automatically.

---

## PART 8: EXPANSION PIPELINE (BEYOND USF)

### Bay Area Nursing Schools (6 Viable Targets)
| School | BSN Students | Type | Notes |
|--------|-------------|------|-------|
| SJSU | ~400 BSN | Public CSU | Largest; would need RFP |
| Samuel Merritt University | ~600 nursing | Private | Oakland; nursing-focused |
| Dominican University | ~200 nursing | Private | San Rafael |
| CSU East Bay | ~200 BSN | Public CSU | Hayward |
| Sonoma State | ~150 BSN | Public CSU | Rohnert Park |
| Sacramento State | ~300 BSN | Public CSU | USF already has campus there |

### National TAM
- 869 BSN programs in the US
- Average annual revenue per school at our pricing: ~$4,000-$8,000
- **National TAM: $3.5M-$7.0M/year** for nursing alone
- General interview prep TAM is much larger (4,000+ universities)

### AJCU Consortium Opportunity
USF is one of 27 Jesuit universities (Association of Jesuit Colleges and Universities). If we succeed at USF, the AJCU network is a warm introduction channel to:
- Georgetown, Boston College, Loyola, Fordham, Santa Clara, Gonzaga, Creighton, Marquette, etc.
- Many have nursing programs
- AJCU has a cooperative purchasing program

---

## PART 9: PARTNERSHIP TERMS (PER ERIN)

| Term | Position |
|------|----------|
| Exclusivity | **Non-exclusive** — USF can use other tools too (they already use Big Interview) |
| Non-compete | **No non-compete** — we can sell to other schools |
| Data | Student data stays with USF; we see anonymized usage metrics only |
| Duration | 1-year annual contract with auto-renewal |
| Cancellation | Either party can cancel with 60-day notice |
| Pricing lock | Year 1 pricing guaranteed; Year 2+ subject to max 5% annual increase |
| Pilot | Free 30-day pilot for one cohort before commitment |
| Support | Dedicated onboarding + quarterly check-ins |

---

## PART 10: TIMING

### Why Now Is Good

1. **March = budget planning season** — USF's fiscal year is July 1 - June 30. March-April is when departments submit budget proposals for next year.
2. **Jessica reached out to US** — inbound interest is 10x easier to close than cold outreach.
3. **End-of-year spending** — if there's budget remaining from this fiscal year, a pilot can start immediately (May-June).
4. **Fall 2026 semester** — ideal launch timing for a full institutional rollout.

### Ideal Timeline
| Date | Action |
|------|--------|
| This week | Reply to Jessica's email (see draft below) |
| Within 2 weeks | 30-min demo call with Jessica + Ellen Kelly or Alex Hochman |
| April | Free 30-day pilot with BSN seniors (~250 students) |
| May | Pilot results + formal proposal |
| June | Contract signed (end-of-fiscal-year budget) |
| August 2026 | Full rollout for Fall semester |

---

## SUMMARY OF NUMBERS

| Metric | Value |
|--------|-------|
| **Nursing students who'd have access** | ~800-1,095 |
| **Realistic active nursing users** | 200-350 |
| **All USF students who'd have access (bundle)** | 8,913 |
| **Our annual API cost (nursing only)** | $1,200-$1,920 |
| **Our annual API cost (bundle)** | $3,876-$7,266 |
| **Anchor price: Nursing only** | $4,999/year |
| **Anchor price: Campus bundle** | $7,999/year |
| **Gross margin: Nursing at anchor** | 62-76% |
| **Gross margin: Bundle at anchor** | 9-52% |
| **Comparable tool (Big Interview)** | $3,000-$15,000/year |
| **USF procurement threshold** | $5,000 |
| **Decision-maker** | Alex Hochman (Senior Director) |
| **Fiscal year** | July 1 - June 30 |
| **Best close window** | May-June (end of fiscal year) |

---

## PART 11: DRAFT EMAIL TO JESSICA

**Subject:** Re: Group Pricing for Interview Prep — Happy to Chat!

---

Hi Jessica,

Thanks so much for reaching out — great question!

For individual access, the nursing interview prep tool is $19.99 per person for 30 days. But for a university partnership, we offer something much better than bulk passes.

We work with Career Services centers to provide **institutional annual licenses** — unlimited access for your entire student population at a flat yearly rate. That means no managing individual codes, no expiration headaches, and every student who needs it can use it.

For USF specifically, I think there's a really compelling fit:

**NurseInterviewPro** — AI-powered nursing interview coaching built on validated clinical frameworks (NCSBN, SBAR, Nursing Process). Students practice with a conversational AI interviewer, get real-time feedback on their responses, and build confidence for clinical nursing interviews. This is purpose-built for nursing — not general interview prep adapted for healthcare.

We also have **InterviewAnswers.AI**, our general interview prep platform that serves students across all majors — great for business, education, arts & sciences, and beyond.

I'd love to set up a quick 20-30 minute call to walk you through both tools, talk pricing based on your specific needs, and discuss a **free pilot** so your team can see the platform in action before any commitment. Happy to include anyone else from your team who might be interested.

What does your schedule look like in the next week or two?

Best,
[Your name]
InterviewAnswers.AI | NurseInterviewPro.ai

---

### EMAIL NOTES FOR YOU (Don't send this part):

**What this email does:**
1. Answers her literal question (per-person price = $19.99)
2. Immediately pivots to institutional license (what we actually want to sell)
3. Introduces BOTH products (she's Career Services, not just nursing)
4. Steers toward a call (where pricing happens)
5. Offers a free pilot (reduces risk, gets us in the door)
6. Invites her to bring colleagues (we want Alex Hochman or Ellen Kelly on the call)
7. Does NOT commit to specific institutional pricing in writing (that happens on the call)

**What to say on the call (not in the email):**
- NurseInterviewPro institutional license: anchor at $4,999/year
- Campus bundle (both products): anchor at $7,999/year
- Be prepared to negotiate down to $3,500 (nursing) or $6,500 (bundle)
- Lead with the free pilot offer — it's the lowest-friction way to close
- Mention the clinical advisory board and that content is nurse-educator validated
- If she mentions Big Interview: "We see ourselves as complementary. Big Interview does general prep well. We fill the nursing-specific gap that generic tools can't address."
- If price pushback: "We're happy to start with a pilot semester at no cost so you can see the value firsthand before committing."

**Strategic notes:**
- $4,999 is just under USF's $5,000 direct purchase threshold — Alex Hochman can approve without formal procurement
- The fiscal year ends June 30 — "use it or lose it" budget pressure is real
- March is budget planning season for FY27 — we want to be in the conversation NOW
- Don't mention competitor pricing or benchmarks — let them tell us what they pay for Big Interview
