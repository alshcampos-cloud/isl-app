# Launch Plan Review — Reviewer + Auditor Pass
*Date: April 22, 2026*
*Reviewer: Koda Labs Reviewer/Auditor team*
*Scope: `LAUNCH_PLAN_V2_APR22.md` (PM), `LAUNCH_BUDGET_APR22.md` (Finance), `COMPETITIVE_POSITIONING_APR22.md` (Researcher)*

---

## VERDICT

**CONDITIONAL GO.** The three docs are individually strong and the strategy is coherent. However, they were written in parallel and have **material inconsistencies on dates, dollar amounts, and channel assumptions** that will produce execution confusion by Day 3. Five CRITICAL issues must be reconciled before Thursday Apr 24 (first ad dollar). None of them require a delay; all are resolvable in a 60-minute founder + PM Agent sync.

Launch web Thursday as planned **after** fixing the items in "Top 5 actions TODAY" below.

---

## CRITICAL (must fix before Day 1 / Thursday Apr 24)

### C1. Product Hunt timing contradicts itself across Finance and PM
- **Finance** (`LAUNCH_BUDGET_APR22.md` §2, line 74): "Product Hunt launch day — **PH was April 21 (yesterday)** — this is afterglow spend." Allocates **$150**.
- **PM** (`LAUNCH_PLAN_V2_APR22.md` Part 1.3 + Part 2 Week 3 Plan A): PH is **deferred until iOS approves**, earliest date **Tue May 12**. Part 1.3 explicitly lists PH in "Deferred until iOS approval."
- **Researcher / MEMORY.md**: Confirms PH was originally "pinned to Tuesday April 21" but MEMORY was last updated Apr 15 and PM has since superseded it.
- **Impact:** Finance has already spent $150 of the $1,500 on a launch event that PM says has not happened. Either PH happened Apr 21 and everyone except Finance missed it (unlikely — no PH post mentioned in SESSION_STATE or git history), **or Finance is budgeting against a stale assumption.**
- **Action:** Confirm with Alsh: Did PH launch Apr 21? If **no** (likely), Finance must remove the $150 afterglow line and redistribute. If **yes**, PM's Week 3 Plan A is obsolete.

### C2. Weekly spend totals don't reconcile between PM and Finance
- **PM** Part 2 intro: Week 1 $90, Week 2 $300, Week 3 $500, Week 4 $500 = **$1,390 + $110 reserve = $1,500**.
- **Finance** §8 weekly schedule: Week 1 **$355**, Week 2 $305, Week 3 $330, Week 4 $305, Week 5 $110, misc $95 = $1,500.
- PM Week 1 is $90 paid. Finance Week 1 is $355. **Gap: $265 in Week 1 alone.**
- This is not a rounding error — it's a different philosophy. PM is front-loaded on Google Ads only in Week 1; Finance spreads across Meta/Reddit/tools immediately.
- **Impact:** If Alsh executes PM's $15/day Google-only plan, Finance's Week 1 CAC gates (§6d, "yesterday's spend should not exceed $60/day blended") will trigger on Day 1 as a false negative (we're UNDER spend, not over — so gates are irrelevant but reports will look broken).
- **Action:** Pick one weekly schedule. PM's is more defensible (single-channel validation Week 1). Update Finance §8 to match PM Part 2.

### C3. Meta/TikTok paid spend — two docs say opposite things
- **Finance** §2 allocates **$200** to "Instagram/TikTok boosted posts, 6-8 boosted posts @ $25-30 each."
- **PM** §3.4 TikTok: "**ORGANIC ONLY until iOS approved.**" §3.5 IG: "NOT A PRIORITY WEEK 1–2."
- **Impact:** Finance expects $200 of Meta spend in a plan where PM says it does not happen until Week 3 Plan A (iOS approval required).
- **Action:** If iOS is still in review through Week 4 (likely — Apple has been sitting 5+ days already), Finance's $200 IG/TikTok bucket is stranded. Reallocate to either Google Ads ($900 → $1,100) or Reddit paid ($150 → $350) or reserve.

### C4. "Testimonial collection push" depends on a workflow that does not exist
- **PM** Week 2 Friday May 2: "email 10 most-engaged users from Week 1 asking for a 60-sec video or written quote in exchange for 2 months free."
- **No infrastructure exists for this:**
  - No "give user 2 months free" admin action documented
  - No video-submission receiving flow
  - No testimonial approval/publishing workflow
  - "2 months free" is not a SKU we sell (we sell 30-day passes and annual; there is no 60-day)
- **Impact:** Alsh ships the email Friday, gets 2-3 responses, then has to manually create duplicate 30-day passes in Stripe / Supabase, which has never been done and has no tested path.
- **Action:** Before Week 2 retro (May 5), either (a) define a manual workflow Alsh executes in 10 min per testimonial, or (b) swap "2 months free" for "$30 cash via PayPal/Venmo" which requires no new code.

### C5. Break-even math has a reconciliation gap PM/Finance do not name
- **Finance** §5b: Break-even = **84 paid conversions.**
- **Finance** §4b realistic scenario: **32 paid conversions.**
- **PM** Part 6 Week 4 target (realistic): **15–25 paying customers cumulative, 30-day.**
- **PM** realistic = half of Finance realistic = one-quarter of break-even.
- **Impact:** PM's "realistic" success case delivers ~$400 revenue against $1,585 spend = **-$1,185 net.** That is not "Launch failed" per PM §6.3 ("below 5 paying = bad"), but it is not close to Finance's break-even thesis. One of the two docs is mis-setting expectations for the founder.
- **Action:** Reconcile. The honest read: this $1,500 is **buying validation, not scale** — explicitly call this out in both TL;DRs. Finance's 84-paid break-even is a Month 2-3 number, not Month 1.

---

## HIGH (fix in Week 1)

### H1. Battle Scar #22 (Edge Function retry wrapper) not deployed before first paid traffic
- PM Part 1.2 calls this "Medium" risk, mitigation is "deploy by end of Week 2 regardless."
- Finance §7a marks it as P0 "before ad $ spent."
- Researcher Threat #8: "Edge Function retry wrapper P0… needs to ship before ad spend scales."
- **Three out of three agents flag this and PM is the only one that tolerates delay.**
- The patch is already drafted (`docs/EDGE_FUNCTION_RETRY_PATCH.md`). Jacob is not yet certified.
- **Action:** Either (a) Alsh deploys the patch himself Wednesday Apr 23 (it's documented), or (b) cap Google Ads at $15/day until deployed. Do not ramp to $30+/day without this shipped.

### H2. CAPTCHA, Stripe Radar, Sentry, rate limits — Finance P0s not in PM Day 1
- Finance §7a lists six P0 security/abuse items "before any ad $ spent." None appear in PM's Apr 22 Tuesday checklist.
- Cloudflare Turnstile is a 5-line integration (Finance §7a) — free.
- Per-user rate limit on `ai-feedback` Edge Function (50/user/day) does not exist per MEMORY.md.
- Stripe Radar rules engine is 3 clicks in dashboard — free.
- **Action:** Add to Tuesday Apr 22 pre-launch checklist: enable Stripe Radar, verify `abuse_signals` table is writing, set budget alerts on Google Ads + Resend + Anthropic. CAPTCHA + Sentry can land by Friday Apr 25.

### H3. No Day 1 customer support plan
- PM §5.6: CS Agent "feature-flagged, currently OFF."
- No instructions for when users email `support@interviewanswers.ai` during Week 1.
- Google Ads will drive traffic that generates "why didn't the mic work?" tickets within 24 hours of launch.
- **Action:** Either (a) turn on CS Agent draft-only mode for Week 1, or (b) Alsh commits to a 15-min/day inbox sweep and adds a "Reply within 24h" note to the support autoresponder.

### H4. Marketing Agent is feature-flagged OFF but PM assumes it starts drafting Week 2
- PM §5.3: "Feature-flagged, currently OFF. Turn ON at start of Week 2."
- No test of the agent's output quality against Erin's walled-garden rules has been done since Apr 12 build.
- **Action:** Alsh runs one dry-run of Marketing Agent output Monday Apr 28 BEFORE Week 2, flagged off in production, to verify it doesn't draft clinical specifics. 10-minute task. If it violates walled garden, keep flag off and Alsh manually drafts.

### H5. LinkedIn DM volume exceeds observed founder capacity
- PM §3.3: "Alsh can do ~250 DMs/week max… do not exceed."
- Week 4 Plan: "50 DMs/day × 5 days = 250 DMs. Alsh time investment: 90 min/day."
- 90 min/day × 5 = 7.5h of Week 4's 15h weekly budget on DMs alone.
- This is additive to TikTok filming, weekly retro, ad monitoring, smoke tests, testimonial follow-ups.
- **Action:** Pick one: either LinkedIn is the #1 channel with 250 DMs OR Alsh also films TikTok AND does testimonials AND runs ads. Not all three.

### H6. Apple rejection Week 3 has a Plan B but Plan B doesn't address PH
- PM Plan B (no iOS): continues web spend at $500. Does not schedule PH at all.
- But Finance Week 5 budget ends May 22. If iOS approves May 20, PH would be May 27 — outside the $1,500 window.
- **Action:** Define a "PH without iOS" option. Many PH launches succeed without mobile app; web + Pillar 1 (ethical alternative) is a viable narrative. If iOS is rejected twice, PH cannot wait forever.

### H7. $31.60 / 0 conversions Feb Google Ads result is named but not diagnosed
- PM Part 1.2 acknowledges the Feb attempt, says "different landing page now." Does not explain WHY Feb failed.
- Researcher §7 Threat #7 cites the same data with "do not scale until CAC < $15 proven at $10/day" — stricter than PM's $30-75 target.
- **Action:** 20-min diagnosis before relaunching. Was it the landing page, the keywords, or the budget pacing? Without an answer, we're repeating an experiment we already ran.

---

## LOW (nice to fix)

### L1. $110 reserve vs. $100 tools — the docs disagree on what the residual is for
- PM calls the residual $110 "reserve for emergencies." Finance calls it $100 "tools & subscriptions." These are not the same money. One of them is double-counting.

### L2. Researcher's "durable moat #4" cites 10 indexed SEO pages
- MEMORY.md confirms 10 indexed. Researcher §2.1 calls for 5 more nursing pages in 2 weeks. PM does not budget hours for content writing. Each page is a 3–4h draft + review cycle. Who writes them?

### L3. "Annual All-Access" revenue assumption (10% of mix) has no basis
- Finance §4 assumes 10% of purchasers buy Annual at $99.99. No historical data supports this mix. The app has <5 paying users total today. A single Annual purchase in the test window would skew all LTV math. Either drop Annual from the mix or flag it as speculative.

### L4. "Nursing mix 30% of purchases" assumption
- Same problem. Nursing is a wedge we believe in but have not validated in paid conversion. Budget assumes nursing LTV ($22 net) is proven. It isn't.

### L5. Resend upgrade timing
- PM says "upgrade Apr 22 pre-ads." Finance §9 says "Day 0 gate: Resend Pro upgraded?" Agreed. **Do not let Alsh skip this to save a day** — it's the one infrastructure item that silently fails in every Battle Scar archetype.

### L6. No founder-offline contingency
- Single-founder risk is named in PM §1.2. Mitigation: "Marketing Agent pauses paid channels if Alsh offline >48h." But Marketing Agent is feature-flagged OFF (§5.3). There is no one who pauses ads if Alsh gets the flu Saturday.

### L7. Stripe merchant holds not mentioned anywhere
- New Stripe accounts on first paid traffic spikes can trigger 7-14 day payout holds. Neither doc budgets for this. Cash collected is not cash available.

### L8. Subreddit ban risk to r/nursing is undersized
- PM §3.2 warns correctly. But losing r/nursing permanently is a catastrophic moat loss (Researcher §2.1). Worth elevating to a C-level risk in PM Part 8.

### L9. Anthropic $1,000/mo cap
- PM Part 1.2 says "Tier 3 cap is $1,000/mo… at current traffic we'd burn ~$30/mo." Finance §6b says alert at $200/mo. Two different thresholds. Pick one.

---

## ERIN'S CONSTRAINTS CHECK

**Clean.** No violation of walled garden rules found.
- No hospital/school B2B anywhere in the three docs.
- No AI-as-clinical-reference positioning. Researcher Pillar 4 explicitly ring-fences.
- No specialty matching. Researcher §4 "What to NEVER claim" correctly lists it.
- Nursing content paths all funnel to human-validated library.

One amber flag: PM Week 2 (§ Day-by-day, Apr 30) says "IG carousel #2 post" from `INSTAGRAM_TIKTOK_CAMPAIGNS.md`. **Double-check that carousel for any clinical specifics** — the Apr 15 Reviewer pass caught 4 CRITICAL issues in this asset set. Easy to regress.

---

## BATTLE SCAR AWARENESS

| Scar | Plan addresses? | Verdict |
|---|---|---|
| #1 Monolithic App.jsx | Yes — Jacob tasked, PM blocks changes | Good |
| #8 Charge AFTER success | Not relevant to ad conversions (Google tracks separately); usage charging path unchanged | Good |
| #21 Sign-out hang | Fixed in Build 30 — if rejected, users who signed up mid-launch cannot cleanly log out | **Add to smoke test** |
| #22 Retry wrapper not deployed | Three of three docs flag it; PM tolerates delay; Finance+Researcher demand pre-scale | **Escalate to C1/H1** |
| #25 "Update Review" confusion in ASC | Not mentioned — if Apple asks for changes on Build 30, easy to misfire again | Add to PM §8 failure mode #1 |

---

## RISKS NOT IN THE DOCS

1. **Stripe payout hold** (L7 above).
2. **Apple rejection cycle #3** — if Build 30 rejected, Build 31 is another 5-7 day queue. Plan B does not extend to Week 5+.
3. **Erin unavailability** — nursing moat is one-person-deep. Researcher Threat #6 flags but PM has no contingency.
4. **Jacob certification delays** — Phase 6 incomplete per MEMORY.md. If Jacob is not certified by Week 3, no one ships Edge Function patch.
5. **Reddit shadowban** — r/nursing organic post #1 could shadowban the account silently; no one checks.
6. **Landing page performance** — `/tell-me-about-yourself` has never carried paid traffic. Its mobile CLS/FCP has not been measured this week.
7. **Domain / DNS incident during launch** — Namecheap has had two outages in 2026. No status page subscription documented.
8. **Anthropic rate limit spike** — Tier 3 at 2000 RPM Sonnet. If a single user loop-requests (bug or abuse), they can consume 10% of org limit alone. Rate limiting not enforced in `ai-feedback` (Finance §7b flags).

---

## EXECUTION RISK

- **Alsh 15h/week**: Realistic for Weeks 1–2. **Unrealistic Week 4** if LinkedIn scales to 250 DMs AND TikTok cadence AND testimonials AND ad management (H5).
- **Jacob not certified**: Cannot do the Edge Function patch. Alsh must either deploy it himself (6h task, he knows the codebase) or defer — and defer means Battle Scar #22 during the first traffic spike.
- **Marketing Agent supervision**: Flagged off until Week 2. No founder-approval queue exists in dashboard for agent drafts. Alsh reviews by reading files. This breaks the moment Alsh is offline.

---

## TOP 5 ACTIONS FOR ALSH TODAY (Tuesday Apr 22)

Focus only on these. The three docs are long; the launch does not require reading them end-to-end.

1. **Upgrade Resend to Pro** ($20, 3 clicks). Nothing else works until this lands. — [Finance §10 / PM Part 1.1 — single point of agreement across all docs]

2. **Reconcile PH timing** (5 min). Text or note to PM Agent: "Did PH launch April 21? Y/N." If **N**, tell Finance Agent to remove the $150 PH afterglow line and redistribute. This fixes C1 + C3.

3. **Pick ONE Week 1 budget schedule** (10 min). Either PM's $90 ($15/day Google only) or Finance's $355 (multi-channel). Recommendation: **PM's**. Cleaner validation signal. Update Finance §8 to match.

4. **Enable 5 free security items** (20 min, zero code):
   - Stripe Radar default rules ON
   - Google Ads daily budget alerts set to 50/75/90% of $15
   - Resend sender reputation email alerts ON
   - Anthropic console budget alert at $200/mo (matches Finance, not PM's $500)
   - UptimeRobot free account monitoring `https://www.interviewanswers.ai`

5. **Write the Edge Function retry patch decision** (5 min). Either:
   - **Option A:** "I will deploy the patch Wednesday before Thursday ads launch." (6h of founder time)
   - **Option B:** "I will cap Google Ads at $15/day until the patch is deployed." (Locks Week 2 scaling)
   Pick one, write it down, tell PM Agent.

Everything else — LinkedIn post, Reddit posts, smoke tests, content — follows PM's existing Tuesday schedule. Don't let the other 2,000 lines of plan distract from these five.

---

## GO / NO-GO

**GO on Thursday Apr 24 web launch** IF the five actions above are complete by Wednesday Apr 23 end of day.

**NO-GO** if any of these three remain unresolved by Wed EOD:
- Resend still on Free tier
- Google Ads has no budget alerts set
- Edge Function retry patch is neither deployed nor budget-capped

Everything else is a Week 1 fix and does not block Thursday.

---

*End of review. Reviewer recommends Alsh + PM Agent do a 60-min sync Wednesday morning to close C1–C5, then execute as planned.*
