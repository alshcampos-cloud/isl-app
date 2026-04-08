# USF Institutional Pricing Model — Full Breakdown
## Built on Verified Cost Data + Cited USF Enrollment
### March 5, 2026

---

## SECTION 1: USF STUDENT POPULATIONS (ALL CITED)

### Nursing Students (NurseInterviewPro Target)

| Segment | Count | Source |
|---|---|---|
| Total SONHP enrollment | 1,508 (987 UG + 521 Grad) | USF Quick Facts, Fall 2024 [myusf.usfca.edu/cipe/usf-facts] |
| Nursing-specific (BRN) | ~1,095 | California Board of Registered Nursing [rn.ca.gov] |
| BSN new students/year (SF) | ~235 (125 FY + 30 fall xfer + 80 spring xfer) | BRN board meeting materials [rn.ca.gov/pdfs/meetings/brd/brd_may25_item8.pdf] |
| BSN new students/year (Sacramento) | ~40 (20 fall + 20 spring) | BRN board meeting materials |
| ME-MSN new students/year (SF) | ~72 (36 fall + 36 spring) | BRN enrollment data + allnurses.com cohort reports |
| ME-MSN new students/year (OC) | ~52 (26 fall + 26 spring) | BRN enrollment data + allnurses.com cohort reports |
| BSN graduates/year (NCLEX tested, 5yr avg) | 256 | CA BRN NCLEX Pass Rates [rn.ca.gov/education/passrates.shtml] |
| MSN graduates/year (NCLEX tested, 5yr avg) | 114 | CA BRN NCLEX Pass Rates |
| DNP students (est.) | ~90 | College Factual (46 doctoral degrees/yr) |
| Graduate nursing (US News) | 274 | US News 2024 [usnews.com/best-graduate-schools] |

**Who would actually use NurseInterviewPro?**

| Segment | Est. Size | Why They'd Use It | Source for Size |
|---|---|---|---|
| BSN Juniors (3rd year) | ~250 | Part-time jobs, clinical rotations, starting to think about post-grad | Derived: ~275 new BSN/yr × 2 years on campus = ~500 upper-division; half are juniors |
| BSN Seniors (4th year) | ~250 | **First nursing job after graduation — peak interview prep need** | Same derivation; confirmed by ~256 avg NCLEX test-takers/yr |
| ME-MSN (pre-licensure) | ~200 | **First nursing job post-program — same peak need** | BRN: ~124 new/yr × ~2yr program ≈ 248; ~200 in interview-prep stage |
| DNP students | ~90 | Advanced practice positions (FNP, PMHNP) | College Factual: 46 degrees/yr × ~2yr in program |
| RN-to-MSN / 4+1 students | ~50 | Career advancement interviews | Estimated from 274 grad nursing total minus ME-MSN |
| **Total addressable** | **~840** | | |

**Realistic pass distribution for Career Services:**

| Scenario | Who Gets Passes | Count | Rationale |
|---|---|---|---|
| Conservative | BSN seniors only | ~250 | Tightest scope: students actively interviewing for first nursing job |
| Moderate | BSN seniors + MSN | ~450 | Seniors + master's-entry students nearing graduation |
| Full | BSN juniors + seniors + MSN + DNP | ~790 | Covers nearly all nursing students who would interview within the year |

---

### All Students (InterviewAnswers.AI Target)

| Segment | Count | Source |
|---|---|---|
| Total USF enrollment | 8,913 | USF Quick Facts, Fall 2024 |
| Undergraduate | 5,321 | USF Quick Facts |
| Graduate | 3,592 | USF Quick Facts |
| Arts & Sciences | 4,226 | USF Quick Facts |
| Management (Business) | 1,397 | USF Quick Facts |
| Education | 1,089 | USF Quick Facts |
| Law | 571 | USF Quick Facts |
| SONHP | 1,508 | USF Quick Facts |

**Who would actually use InterviewAnswers.AI?**

| Segment | Est. Size | Why They'd Use It |
|---|---|---|
| UG seniors (all schools) | ~1,330 | Post-graduation job search (USF awards ~1,357 bachelor's/yr — Quick Facts) |
| UG juniors | ~1,330 | Internships, part-time jobs |
| Business grad students | ~368 | MBA jobs, consulting, career transitions |
| Education grad students | ~1,089 | Teaching positions, school admin |
| Other grad students seeking jobs | ~500 | Various fields |
| **Total addressable** | **~4,617** | |

**Realistic pass distribution:**

| Scenario | Who Gets Passes | Count | Rationale |
|---|---|---|---|
| Conservative | Seniors actively in career services | ~500 | ~10-15% of students actively use career services (NACE benchmark) |
| Moderate | Juniors + seniors | ~1,000 | Upper-division students most likely interviewing |
| Full | All interested students | ~2,000 | Broad access for anyone who wants it |

---

## SECTION 2: VERIFIED COST DATA

*All costs from docs/COST_ANALYSIS.md (March 4, 2026), based on verified Anthropic pricing and actual Edge Function code.*

### API Cost Per Call

| Feature | Model | Cost/Call or Cost/Session | Source |
|---|---|---|---|
| Practice Mode (+ self-efficacy) | Haiku 4.5 | $0.0079/call | COST_ANALYSIS.md §2 |
| Nursing Practice (4-section) | Haiku 4.5 | $0.0088/call | COST_ANALYSIS.md §3 |
| SBAR Drill | Haiku 4.5 | $0.0078/call | COST_ANALYSIS.md §3 |
| Offer Coach | Haiku 4.5 | $0.006/call | COST_ANALYSIS.md §3 |
| Nursing Mock Interview (full, 12 turns) | Sonnet 4 | **$0.245/session** | COST_ANALYSIS.md §3 |
| AI Coach (8 turns) | Sonnet 4 | **$0.179/session** | COST_ANALYSIS.md §3 |
| Confidence Builder | Sonnet 4 | $0.016/call | COST_ANALYSIS.md §3 |
| AI Interviewer General (3 turns) | Sonnet 4 | $0.017/session | COST_ANALYSIS.md §2 |
| Answer Assistant (full flow) | Haiku 4.5 | $0.011/session | COST_ANALYSIS.md §2 |

### Verified User Archetypes (Weighted Cost Per 30-Day Pass)

| Archetype | % of Users | Sessions | API Cost | Source |
|---|---|---|---|---|
| Dabbler | 40% | 5 total (3 practice, 1 mock, 1 SBAR) | $0.29 | COST_ANALYSIS.md §4 |
| Prepper | 35% | 15 total (6 practice, 3 mock, 3 SBAR, 2 coach, 1 confidence) | $1.20 | COST_ANALYSIS.md §4 |
| Committed | 20% | 30 total (10 practice, 6 mock, 5 SBAR, 5 coach, 4 confidence) | $2.59 | COST_ANALYSIS.md §4 |
| Power User | 5% | 50+ total | $4.61 | COST_ANALYSIS.md §4 |
| **Weighted Average** | | | **$1.24/user** | COST_ANALYSIS.md §4 |

### Stripe Processing Fee

| Pass Price | Stripe Fee (2.9% + $0.30) | Net After Stripe |
|---|---|---|
| $19.99 (nursing retail) | $0.88 | $19.11 |
| $14.99 (general retail) | $0.73 | $14.26 |
| $12.99 | $0.68 | $12.31 |
| $10.99 | $0.62 | $10.37 |
| $8.99 | $0.56 | $8.43 |
| $7.99 | $0.53 | $7.46 |
| $6.99 | $0.50 | $6.49 |
| $5.99 | $0.47 | $5.52 |

### Fixed Overhead (Already Paying — Not Incremental)

| Expense | Monthly | Annual | Source |
|---|---|---|---|
| Supabase Pro | $25.19 | $302 | Verified from billing page |
| Vercel Pro | $20.00 | $240 | Required for commercial use |
| **Incremental cost for USF** | **$0** | **$0** | Same infrastructure, no additional hosting needed |

### Cost of a Free Pilot

| Pilot Size | Duration | Total Cost to Us | Source |
|---|---|---|---|
| 25 students | 30 days | **$31.00** | COST_ANALYSIS.md §8 |
| 50 students | 30 days | **$62.00** | COST_ANALYSIS.md §8 |
| 100 students | 30 days | **$124.00** | COST_ANALYSIS.md §8 |
| 100 students | semester (4 mo) | **$496.00** | COST_ANALYSIS.md §8 |

---

## SECTION 3: PASS PRICING — NURSING (NurseInterviewPro)

### 30-Day Passes

| Quantity Tier | Per Pass | Stripe Fee | API Cost ($1.24) | **Net Profit/Pass** | **Margin** |
|---|---|---|---|---|---|
| Retail (individual) | $19.99 | $0.88 | $1.24 | **$17.87** | **89.4%** |
| 50-99 passes | $12.99 | $0.68 | $1.24 | **$11.07** | **85.2%** |
| 100-249 passes | $10.99 | $0.62 | $1.24 | **$9.13** | **83.1%** |
| 250-499 passes | $8.99 | $0.56 | $1.24 | **$7.19** | **80.0%** |
| 500+ passes | $7.99 | $0.53 | $1.24 | **$6.22** | **77.8%** |

### Semester Passes (120 Days)

Semester cost estimate: Students actively prep for ~2-3 months out of 4. Cost multiplier: ~2.5x the 30-day cost = **$3.10/user.**

| Quantity Tier | Per Pass | Stripe Fee | API Cost ($3.10) | **Net Profit/Pass** | **Margin** |
|---|---|---|---|---|---|
| 50-99 passes | $18.99 | $0.85 | $3.10 | **$15.04** | **79.2%** |
| 100-249 passes | $16.99 | $0.79 | $3.10 | **$13.10** | **77.1%** |
| 250-499 passes | $14.99 | $0.73 | $3.10 | **$11.16** | **74.4%** |
| 500+ passes | $12.99 | $0.68 | $3.10 | **$9.21** | **70.9%** |

### Annual Passes (365 Days)

Annual cost estimate: Students use it across ~2 interview seasons (fall + spring), maybe 4-5 active months total. Cost multiplier: ~3.5x = **$4.34/user.**

| Quantity Tier | Per Pass | Stripe Fee | API Cost ($4.34) | **Net Profit/Pass** | **Margin** |
|---|---|---|---|---|---|
| 50-99 passes | $24.99 | $1.02 | $4.34 | **$19.63** | **78.6%** |
| 100-249 passes | $21.99 | $0.94 | $4.34 | **$16.71** | **76.0%** |
| 250-499 passes | $19.99 | $0.88 | $4.34 | **$14.77** | **73.9%** |
| 500+ passes | $17.99 | $0.82 | $4.34 | **$12.83** | **71.3%** |

---

## SECTION 4: PASS PRICING — GENERAL (InterviewAnswers.AI)

### 30-Day Passes

| Quantity Tier | Per Pass | Stripe Fee | API Cost ($1.24) | **Net Profit/Pass** | **Margin** |
|---|---|---|---|---|---|
| Retail (individual) | $14.99 | $0.73 | $1.24 | **$13.02** | **86.9%** |
| 50-99 passes | $9.99 | $0.59 | $1.24 | **$8.16** | **81.7%** |
| 100-249 passes | $7.99 | $0.53 | $1.24 | **$6.22** | **77.8%** |
| 250-499 passes | $6.99 | $0.50 | $1.24 | **$5.25** | **75.1%** |
| 500+ passes | $5.99 | $0.47 | $1.24 | **$4.28** | **71.5%** |

### Semester Passes (120 Days, $3.10 API cost)

| Quantity Tier | Per Pass | Stripe Fee | API Cost ($3.10) | **Net Profit/Pass** | **Margin** |
|---|---|---|---|---|---|
| 50-99 passes | $14.99 | $0.73 | $3.10 | **$11.16** | **74.4%** |
| 100-249 passes | $12.99 | $0.68 | $3.10 | **$9.21** | **70.9%** |
| 250-499 passes | $10.99 | $0.62 | $3.10 | **$7.27** | **66.2%** |
| 500+ passes | $9.99 | $0.59 | $3.10 | **$6.30** | **63.1%** |

### Annual Passes (365 Days, $4.34 API cost)

| Quantity Tier | Per Pass | Stripe Fee | API Cost ($4.34) | **Net Profit/Pass** | **Margin** |
|---|---|---|---|---|---|
| 50-99 passes | $19.99 | $0.88 | $4.34 | **$14.77** | **73.9%** |
| 100-249 passes | $16.99 | $0.79 | $4.34 | **$11.86** | **69.8%** |
| 250-499 passes | $14.99 | $0.73 | $4.34 | **$9.92** | **66.2%** |
| 500+ passes | $12.99 | $0.68 | $4.34 | **$7.97** | **61.4%** |

---

## SECTION 5: USF SCENARIO MODELING

### Scenario A: Nursing Only — Conservative Start
*Career Services buys passes for BSN seniors only*

| Configuration | Amount |
|---|---|
| **250 nursing 30-day passes** | |
| Revenue | 250 × $8.99 = **$2,248** |
| Stripe fees | 250 × $0.56 = -$140 |
| API costs | 250 × $1.24 = -$310 |
| **Net profit** | **$1,798** |
| **Margin** | **80.0%** |
| Under $5K threshold? | ✅ Yes |

### Scenario B: Nursing — Moderate (RECOMMENDED STARTING POINT)
*BSN seniors + MSN students, semester passes*

| Configuration | Amount |
|---|---|
| **450 nursing semester passes** | |
| Revenue | 450 × $14.99 = **$6,746** |
| Stripe fees | 450 × $0.73 = -$329 |
| API costs | 450 × $3.10 = -$1,395 |
| **Net profit** | **$5,022** |
| **Margin** | **74.4%** |
| Under $5K threshold? | ❌ No — requires PaAS (but $6,746 is reasonable for career services) |

### Scenario C: Nursing — Full Coverage
*All nursing students who'd interview within the year, semester passes*

| Configuration | Amount |
|---|---|
| **750 nursing semester passes** | |
| Revenue | 750 × $12.99 = **$9,743** |
| Stripe fees | 750 × $0.68 = -$510 |
| API costs | 750 × $3.10 = -$2,325 |
| **Net profit** | **$6,908** |
| **Margin** | **70.9%** |

### Scenario D: General Only — Conservative
*500 passes for seniors actively in career services*

| Configuration | Amount |
|---|---|
| **500 general 30-day passes** | |
| Revenue | 500 × $5.99 = **$2,995** |
| Stripe fees | 500 × $0.47 = -$235 |
| API costs | 500 × $1.24 = -$620 |
| **Net profit** | **$2,140** |
| **Margin** | **71.5%** |
| Under $5K threshold? | ✅ Yes |

### Scenario E: General — Moderate
*1,000 semester passes for juniors + seniors*

| Configuration | Amount |
|---|---|
| **1,000 general semester passes** | |
| Revenue | 1,000 × $9.99 = **$9,990** |
| Stripe fees | 1,000 × $0.59 = -$590 |
| API costs | 1,000 × $3.10 = -$3,100 |
| **Net profit** | **$6,300** |
| **Margin** | **63.1%** |

### Scenario F: BUNDLE — Nursing + General (THE BIG DEAL)
*450 nursing semester + 500 general 30-day*

| Configuration | Amount |
|---|---|
| 450 nursing semester passes | $6,746 |
| 500 general 30-day passes | $2,995 |
| **Total revenue** | **$9,741** |
| Total Stripe fees | -$564 |
| Total API costs | -$2,015 |
| **Net profit** | **$7,162** |
| **Margin** | **73.5%** |

### Scenario G: PILOT (FREE) → UPSELL PATH
*Start free, convert to paid*

| Phase | Configuration | Revenue | Our Cost |
|---|---|---|---|
| **Pilot (free)** | 50 nursing 30-day passes | $0 | **$62** |
| **Semester 1 (paid)** | 250 nursing semester passes | $3,748 | $1,103 |
| **Semester 2 (expand)** | 450 nursing semester + 500 general 30-day | $9,741 | $2,579 |
| **Year 1 total** | | **$13,489** | $3,744 |
| **Year 1 net profit** | | | **$9,745 (72%)** |

---

## SECTION 6: WHAT TO PRESENT TO JESSICA (AND WHAT TO HOLD BACK)

### SHOW (in the email / on the call)

| Fact | Source We Can Cite |
|---|---|
| "Individual nursing pass is $19.99 for 30 days" | Our website |
| "For universities, we offer volume discounts up to 60% off" | Our pricing (500+ tier = 60% off retail) |
| "We can do 30-day, semester, or annual passes" | Product offering |
| "Institution page branded for USF" | Our capability |
| "Access codes — you control distribution" | Our system |
| "Usage reporting so you can track student engagement" | Our system |
| "Free 30-day pilot with 50 students" | Our offer |
| "70 clinically validated nursing questions by licensed nurse educators" | Advisory board |
| "Built on NCSBN, SBAR, Nursing Process frameworks" | Product |
| "We see ourselves as complementary to Big Interview — we fill the nursing gap" | Positioning |

### DO NOT REVEAL

| Internal Data | Why |
|---|---|
| Our API costs ($1.24/user avg) | Destroys pricing power |
| Our margins (71-89%) | They'd demand lower prices |
| That a pilot costs us $31-$62 | Makes it seem too cheap |
| Verified user archetypes | Internal product intelligence |
| That Stripe takes $0.47-$0.88/pass | Our problem, not theirs |
| That general product has thinner margins | Would undermine bundle negotiation |

---

## SECTION 7: COMPETITIVE CONTEXT

| Tool | Used at USF? | Est. Price | Our Advantage |
|---|---|---|---|
| Big Interview | ✅ Yes | $3K-$15K/yr (est.) | No nursing-specific content; video-only, not live AI |
| Handshake | ✅ Yes | $8K-$15K/yr (est.) | Job board, not interview prep — different category |
| VMock | ❌ No | ~$2.30/student at UW ($115K for 50K students) | Resume tool, not interview prep |
| Quinncia | ❌ No | $16/student (FGCU textbook model) | Resume + basic interview; no nursing specialization |
| StandOut (InterviewStream) | N/A | Discontinued Feb 2026 | Dead competitor |
| Huru.ai | ❌ No | $9.99-$24.99/mo individual | Has nursing content but no institutional pricing published |

**Sources:** Big Interview [biginterview.com/higher-education], VMock UW Student Tech Fee proposal [techfee.uw.edu/proposal/2022-37/], Quinncia at FGCU [careerservices.fgcu.edu/resources/quinncia/], StandOut [standout.com — discontinued]

### Our Differentiator
We are the only AI-powered interview preparation platform with:
1. Nursing-specific clinically validated content (70 questions reviewed by licensed nurses)
2. Clinical framework alignment (NCSBN, SBAR, Nursing Process, Maslow's, ABC)
3. Live conversational AI mock interviewer (not pre-recorded video)
4. Real-time speech/communication feedback
5. Advisory board of licensed healthcare professionals

Big Interview has none of these for nursing. They don't even have Big Interview Medical for nursing — their medical product focuses on physician residency interviews.

---

## SECTION 8: DELIVERY MODEL — INSTITUTION PAGE + ACCESS CODES

### How It Works

```
Career Services shares: interviewanswers.ai/usf
         ↓
Student lands on USF-branded page
         ↓
Signs up + enters access code
         ↓
Code activates 30-day / semester / annual pass
         ↓
Student uses platform
         ↓
We track: signups, active users, sessions, features
         ↓
Career Services gets usage report
```

### Why Access Codes (Not Email Domain Verification)

| Risk | Email Domain Model | Access Code Model |
|---|---|---|
| Alumni with @usfca.edu | ❌ They get free access, we eat API costs | ✅ Only current students get codes |
| Cost exposure | Uncapped (anyone can sign up) | Capped (finite codes = finite cost) |
| Who controls access | Nobody | Career Services |
| Tracking | Fuzzy (who's a student vs. alumni?) | Exact (code redeemed = 1 pass used) |

USF alumni keep their @usfca.edu emails indefinitely. Recent nursing graduates actively job-hunting would be the heaviest users — and we'd be paying for them without USF paying us.

### Engineering Required: ~2-3 Days

| Component | Description | Effort |
|---|---|---|
| `/usf` React route | Branded landing page for USF | Half day |
| Code redemption flow | Validate code → activate pass → tag user | 1 day |
| Semester/annual pass duration | Add 120-day and 365-day pass types (currently only 30-day and annual exist in webhook) | Half day |
| `institution` column | Tag on user_profiles for reporting | Quick |
| Usage report query | SQL: signups, active users, sessions by institution | Half day |
| **Total** | New files only — no touching App.jsx or existing production | **~2-3 days** |

---

## SECTION 9: BOTTOM LINE SUMMARY

### Pass Pricing at a Glance

| | Nursing 30-Day | Nursing Semester | General 30-Day | General Semester |
|---|---|---|---|---|
| 100+ passes | $10.99 | $16.99 | $7.99 | $12.99 |
| 250+ passes | $8.99 | $14.99 | $6.99 | $10.99 |
| 500+ passes | $7.99 | $12.99 | $5.99 | $9.99 |
| Our margin | 78-83% | 71-77% | 72-78% | 63-71% |
| vs. Retail | 45-60% discount | 15-35% discount | 47-60% discount | 13-33% discount |

### Most Likely Starting Deal

| | |
|---|---|
| **What they buy** | 250 nursing 30-day passes |
| **Price** | $2,248 |
| **Our profit** | $1,798 (80%) |
| **Under $5K threshold** | ✅ Yes — fast approval |
| **Pilot first** | 50 passes free (costs us $62) |
| **Growth path** | → semester passes → add general → expand quantity |

### Absolute Worst Case

| | |
|---|---|
| They buy | 100 nursing 30-day passes at the 100+ tier |
| Revenue | $1,099 |
| Our cost | $186 (Stripe + API) |
| Profit | $913 (83%) |
| Was it worth it? | Yes — we're in at USF with real student data |

### Best Realistic Case (Year 1)

| | |
|---|---|
| Pilot | 50 nursing free (costs $62) |
| Semester 1 | 450 nursing semester ($6,746) |
| Semester 2 | 450 nursing semester + 500 general 30-day ($9,741) |
| **Year 1 total revenue** | **$16,487** |
| **Year 1 total cost** | **$4,306** |
| **Year 1 net profit** | **$12,181 (74%)** |

---

### Data Sources Summary

| Data Point | Source |
|---|---|
| USF enrollment (8,913 total, 1,508 SONHP) | USF Quick Facts Fall 2024 [myusf.usfca.edu/cipe/usf-facts] |
| Nursing enrollment (~1,095) | California BRN [rn.ca.gov] |
| BSN cohort sizes (235 SF, 40 Sac) | BRN board meeting materials [rn.ca.gov/pdfs/meetings/brd/brd_may25_item8.pdf] |
| ME-MSN cohort sizes (72 SF, 52 OC) | BRN data + allnurses.com cohort reports |
| BSN graduates/year (250-268) | CA BRN NCLEX Pass Rates [rn.ca.gov/education/passrates.shtml] |
| MSN graduates/year (101-131) | CA BRN NCLEX Pass Rates |
| DNP degrees/year (46) | College Factual [collegefactual.com] |
| NCLEX pass rates (BSN 90%, MSN 92%) | USF self-reported 3-year avg |
| API costs per call | Verified from Anthropic pricing + actual Edge Function code (COST_ANALYSIS.md, March 4, 2026) |
| User archetypes + weighted avg ($1.24) | Modeled from actual feature usage patterns (COST_ANALYSIS.md §4) |
| Stripe fees (2.9% + $0.30) | Stripe standard pricing |
| USF Career Services staff | USF website [myusf.usfca.edu/career-services/meet-staff] |
| USF uses Big Interview | USF interview practice page [myusf.usfca.edu/career-services/career-resources/interviews-offers/interview-practice] |
| USF $5K procurement threshold | USF purchasing policies [myusf.usfca.edu/purchasing/policies] |
| USF fiscal year (July 1 - June 30) | Standard for US universities |
| Competitive pricing (VMock, Quinncia, Big Interview, Handshake) | Various — see Section 7 sources |
| NACE career center budget median ($504K) | NACE 2024-25 Career Services Benchmarks Report |
| Fixed overhead ($0 incremental) | Already paying Supabase + Vercel for consumer product |
