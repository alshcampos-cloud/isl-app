# USF Career Services Partnership — Pricing & Strategy
## For Erin's Review | March 5, 2026

---

## THE OPPORTUNITY

Jessica Li (Career Counselor, USF Career Services) emailed asking about group pricing. Her question: "Is this price per person and what would it look like for a group price or discount?"

She serves ALL 8,913 USF students, not just nursing. Both products are relevant.

USF already pays for Big Interview (general interview prep). They have nothing nursing-specific.

**Erin approved pursuing this.**

---

## USF AT A GLANCE

| | Number |
|---|---|
| Total USF enrollment | 8,913 |
| School of Nursing & Health (SONHP) | 1,508 (987 UG + 521 Grad) |
| Nursing students specifically | ~1,095 (BRN data) |
| BSN graduates/year | 250-268 |
| MSN graduates/year | 101-131 |
| US News Nursing rank (Master's) | #27 nationally |
| USF tuition | $61,870/year |
| Career Services tech budget (est.) | $20,000-$40,000/year |
| They already pay for | Big Interview + Handshake |

---

## WHAT WE'RE OFFERING: TWO PRODUCTS

### Product 1: NurseInterviewPro (Nursing Students)
- AI mock interviews with clinically validated questions (70 Erin-approved)
- NCSBN, SBAR, Nursing Process framework alignment
- Real-time feedback on communication quality
- Advisory board-reviewed clinical content
- **Nothing like this exists at USF or anywhere they currently use**

### Product 2: InterviewAnswers.AI (All Students)
- AI mock interviews for any field
- STAR method coaching
- Practice mode, Live Prompter
- Serves business, education, arts & sciences, etc.
- **Competes with Big Interview — but with live AI, not pre-recorded video**

---

## HOW IT WORKS: INSTITUTION PAGE + ACCESS CODES

Instead of bulk passes or email domain verification (which alumni could exploit), we build an institutional login system:

### The Student Experience
1. Career Services shares a link: `interviewanswers.ai/usf`
2. Student lands on a **USF-branded page** ("USF Career Services × NurseInterviewPro")
3. Student signs up and enters their **access code** (provided by Career Services)
4. Code activates a **semester pass** (~120 days) automatically
5. Student uses the platform all semester

### What Career Services Gets
- **Branded institution page** — looks like a real partnership (because it is)
- **Access code control** — they decide who gets codes, how many, when
- **Usage reporting** — we provide data: signups, active users, sessions, features used
- **Mid-semester scaling** — "We need 200 more seats" → we generate more codes, done
- **Semester-over-semester tracking** — engagement trends they can report to their VP

### Why Access Codes (Not Email Domain)
- USF alumni keep their `@usfca.edu` emails. Recent nursing grads actively job-hunting would flood the platform.
- Access codes = Career Services distributes through current-student channels only
- Codes can be single-use OR a shared semester code with a redemption cap (e.g., max 500)
- Finite codes = our cost exposure is capped and predictable

### Engineering: ~2-3 Days to Build
All new files — no touching existing production code (follows D.R.A.F.T. protocol):
- New React route (`/usf`) with institution branding
- Code redemption → semester pass activation
- `institution` tag on user profile for reporting
- SQL-based usage reports (exportable)
- Reusable template: spin up `/sjsu` or `/samuelmerritt` in an hour

---

## PRICING: TWO OPTIONS, SEMESTER-BASED

We're offering **semester licenses** (not annual — we don't have the infrastructure for a 12-month commitment yet). If the first semester works, they buy the second. That's effectively annual, on our terms.

### Option 1: NurseInterviewPro (Nursing Students Only)

| | Price | Our API Cost | Margin |
|---|---|---|---|
| **Semester — Anchor** | **$2,499** | $630-$1,092 | **56-75%** |
| Semester — Floor | $1,799 | $630-$1,092 | 39-65% |

**Covers:** ~500-800 nursing student codes (BSN juniors/seniors + MSN)
**Per-student equivalent:** $2,499 / 500 codes = $5.00/student
**vs. Individual retail:** $19.99/person → **75% institutional discount**
**Competitive comp:** Quinncia charges $16/student. Big Interview est. $3K-$15K/year. We're competitive.

**Margin reality:**
- At anchor ($2,499): We keep $1,407-$1,869 after API costs. Healthy.
- At floor ($1,799): We keep $707-$1,169. Tighter but still profitable.
- Worst case (higher adoption than expected): Still profitable — the code cap protects us.

### Option 2: InterviewAnswers.AI (All Students)

| | Price | Our API Cost | Margin |
|---|---|---|---|
| **Semester — Anchor** | **$3,499** | $1,338-$2,673 | **24-62%** |
| Semester — Floor | $2,999 | $1,338-$2,673 | 11-54% |

**Covers:** ~500-1,000 student codes (any major)
**Per-student equivalent:** $3,499 / 750 codes = $4.67/student
**vs. Individual retail:** $14.99/person → **69% institutional discount**

**Margin reality:**
- At anchor ($3,499): $826-$2,161 margin. Okay at conservative adoption, thin at aggressive.
- At floor ($2,999): $326-$1,661. Very thin at high adoption.
- **⚠️ General has less wiggle room than nursing.** 8,913 eligible students = more cost exposure.
- **The code cap is critical here** — limits our downside.

### Bundle (Both Products)

| | Price | Notes |
|---|---|---|
| **Semester — Anchor** | **$4,999** | Nursing + General together |
| Semester — Floor | $3,999 | |

**Pitch:** "NurseInterviewPro for your nursing students. InterviewAnswers.AI for everyone else. One partnership, one price."

### Where the Money Is

**Nursing is the high-margin, low-risk product.** No competition at USF. Unique content. Manageable student pool.

**General is the add-on.** Competes with Big Interview. Higher cost exposure. Thinner margins. Worth offering but not leading with.

**Recommended approach:**
1. Lead with nursing at $2,499/semester
2. Mention general as a bundle add-on for $2,500 more
3. If they only want general, $3,499 minimum with a code cap

---

## THE SCALING STORY (WHY THIS IS MORE THAN A BULK DISCOUNT)

This is what makes the institutional model worth more than group-rate passes:

| What They Buy | What They Actually Get |
|---|---|
| Interview prep access | ✅ That, plus... |
| | Branded institution page (partnership optics) |
| | Access code management (add students anytime) |
| | Usage reporting (engagement data for their VP) |
| | Mid-semester scaling (need more seats? Done.) |
| | Semester-over-semester trend data |
| | Dedicated support |

**This is what Big Interview likely offers** at their institutional tier. We need to be at this level to command institutional pricing.

**And for us:** Every institution is a reusable template. Build USF once → copy for every future school. The institution page + code system is the B2B product infrastructure.

---

## WHAT JESSICA IS ACTUALLY ASKING FOR

She asked for group pricing. We should answer her question directly AND introduce the institutional model.

**In the email:**
1. Answer: Individual price is $19.99/person for 30 days
2. Introduce: For universities, we offer semester institutional partnerships — branded page, access codes, usage reporting
3. Mention: Both products (nursing-specific AND general)
4. Steer: "Let's set up a 20-minute call to talk through what makes sense for USF"
5. Offer: Free pilot

**On the call:**
- Nursing semester: anchor at $2,499
- Bundle semester: anchor at $4,999
- Free 30-day pilot to prove value before commitment
- Walk through the institution page + code system
- "How many nursing students do you want to start with?"

**We do NOT put specific pricing in the email.** Pricing happens on the call.

---

## PROCUREMENT CONTEXT

| | |
|---|---|
| USF direct purchase threshold | $5,000 (under this = Senior Director can approve) |
| Our nursing anchor | $2,499/semester ✅ Under threshold |
| Our bundle anchor | $4,999/semester ✅ Just under threshold |
| USF fiscal year | July 1 - June 30 |
| Current timing | March = budget planning for FY27 |
| Best close window | May-June (end-of-year budget spend) |
| Decision-maker | Alex Hochman (Senior Director) |

**Both our anchors are under the $5K threshold.** This means fast approval — no formal procurement process.

---

## COMPETITIVE POSITIONING

| | Big Interview | NurseInterviewPro |
|---|---|---|
| Nursing-specific questions | ❌ | ✅ 70 clinically validated |
| Clinical frameworks | ❌ | ✅ NCSBN, SBAR, Nursing Process |
| AI mock interviewer (live, conversational) | ❌ Video-only | ✅ |
| Advisory board (licensed nurses) | ❌ | ✅ |
| Real-time speech feedback | ❌ | ✅ |
| Est. institutional price | $3K-$15K/year | $2,499/semester |

**Pitch is NOT "replace Big Interview."** It's: "Big Interview handles general prep. We fill the nursing-specific gap."

**One less competitor:** StandOut (InterviewStream) discontinued Feb 2026. Market is consolidating.

---

## PARTNERSHIP TERMS

- **Non-exclusive** — USF keeps Big Interview, uses other tools. We're additive.
- **No non-compete** — We sell to other schools freely.
- **Semester contracts** — ~4 months. Renew each semester.
- **Free pilot available** — 30-day pilot with one cohort, no cost.
- **Scaling built-in** — Need more codes mid-semester? We add them.
- **Pricing holds** — Semester pricing guaranteed for the academic year.

---

## EXPANSION PIPELINE (AFTER USF)

### Bay Area Nursing Schools (6 Viable Targets)
| School | Nursing Students | Type |
|--------|-----------------|------|
| SJSU | ~400 | Public CSU |
| Samuel Merritt | ~600 | Private, nursing-focused |
| Dominican University | ~200 | Private |
| CSU East Bay | ~200 | Public CSU |
| Sonoma State | ~150 | Public CSU |
| Sacramento State | ~300 | Public CSU |

### AJCU Consortium (27 Jesuit Universities)
USF is a Jesuit school. If we succeed here, we have warm introductions to Georgetown, Boston College, Loyola, Fordham, Santa Clara, etc. Many have nursing programs. AJCU has cooperative purchasing.

### National TAM
- 869 BSN programs in the US
- At $2,499-$4,999/semester per school
- **National TAM: $3.5M-$7.0M/year** for nursing alone
- General interview prep TAM is much larger (4,000+ universities)

---

## TIMELINE

| When | Action |
|------|--------|
| This week | Reply to Jessica's email |
| Next 2 weeks | 30-min demo call with Jessica + hopefully Alex Hochman |
| April | Free 30-day pilot with BSN seniors (~100-250 students) |
| May | Pilot results + formal semester proposal |
| May-June | Contract signed (end-of-fiscal-year budget) |
| August 2026 | Full rollout for Fall semester |

---

## BOTTOM LINE

| | Nursing | General | Bundle |
|---|---|---|---|
| Semester anchor | $2,499 | $3,499 | $4,999 |
| Semester floor | $1,799 | $2,999 | $3,999 |
| Our margin at anchor | 56-75% | 24-62% | 25-61% |
| Risk level | Low | Medium-High | Medium |
| Under $5K threshold | ✅ | ✅ | ✅ (just) |
| Competition at USF | None | Big Interview | Partial |

**Nursing is the wedge. General is the upsell. The institution page is the infrastructure. Access codes protect us from cost overruns. Semester pricing keeps our commitment manageable.**
