# Marketing Decisions — Pending
**Date:** 2026-05-08
**Owner:** Lucas (final call on all founder-level items)
**Advisors:** Jacob (engineering lens on mechanics/attribution/optimization), Erin (clinical-content gate for nursing-track items)
**Read-only mandate active.** This doc enumerates open decisions; it does not execute them.

---

## How to read this doc

Each decision has:
- **Decision name** — the call to make
- **Context** — what's the question, why now
- **Options** — discrete choices with implications
- **Recommended answer** — best-evidence pick OR "founder's call"
- **Jacob weigh-in?** — Yes / No / Advisory only

Decisions are grouped by urgency tier:
- **🔴 BLOCKING** — paid spend or launch sequencing can't proceed without these
- **🟡 SOON** — needed within ~2 weeks; affects roadmap shape
- **🟢 LATER** — strategic / can wait for first paid signal

---

# 🔴 BLOCKING

## D1 — Install Reddit + Meta + LinkedIn pixels NOW or wait?

**Context:** Every paid ad we've run has had broken or missing attribution. The one Google Ads run (~170 impressions, $0 spend by close) had a broken conversion pixel — no usable learning. Until pixels are wired, every dollar spent on paid is functionally blind. Lucas hit a Meta Business Manager permissions wall in Phase 1; the unblock requires Lucas to provision new Pixel IDs + ad accounts. Estimated effort: 60 min Lucas-time across three platforms.

**Options:**
- **A. Install now (recommended).** Lucas spends 60 min provisioning Meta Pixel + LinkedIn Insight Tag + Reddit Pixel before any paid test. Adds Conversions API (server-side) where free, so iOS 14+ ATT losses don't blind us. Cost: 60 min today + ~30 min QA. Unblocks all paid amplification with measurable CAC.
- **B. Wait, run paid with UTM-only attribution.** Use UTM parameters + first-party signup-source dropdown ("How did you hear about us?") as a fallback. Cheaper today but means we can't optimize ad sets on conversion events — only on clicks. CAC math becomes inferred, not measured.
- **C. Hybrid — install Meta only first.** Meta is the largest paid channel by likely volume (IG/FB Reels). Skip LinkedIn + Reddit pixels for now since organic posts there don't need them. Cuts setup to ~25 min.

**Recommended:** **A** if Lucas has 60 min this week; **C** as fallback if time-boxed. **B** is acceptable only for a single $50-100 test, not for a $390 Ad #2 budget.

**Jacob weigh-in:** **Yes** — this is core attribution infrastructure, engineering-lens decision. Jacob should write the pixel install playbook + QA checklist.

---

## D2 — Commit $390 Ad #2 budget as kill-switch test at current pricing math?

**Context:** We have one paid test in the books (Google Ads, broken pixel, ~170 impressions, 0 conversions, inconclusive). Re-running with $390 hard cap + current pricing ($39 30-day / $19.99 nursing / $149 annual) + new creative (Letter on Screen v2 + 3 statics) would be the first real read on whether brand voice + current funnel produce a measurable CAC. **Depends on D1 being resolved first.**

**Options:**
- **A. Yes, $390 hard cap, kill at CTR<1.5% OR CPC>$3 after 1000 impressions.** Pre-commit thresholds. Soft-launch organic first (3-5 days LinkedIn/Reddit), only amplify what gets organic traction. Daylight-only deploy.
- **B. Yes, but split: $200 Meta + $190 LinkedIn.** Diversify channel risk. Two smaller signals beat one ambiguous larger signal. Same kill thresholds.
- **C. No, wait for Apple Build 43 approval first.** If iOS app isn't live, mobile-first conversions hit a "download is coming soon" wall and tank conversion rate.
- **D. No, run $50 micro-test first to validate pixel firing end-to-end before committing $390.** Engineering hygiene: prove the measurement before scaling the spend.

**Recommended:** **D, then A.** Cheap end-to-end smoke test ($50) confirms pixels fire correctly, then commit the $390 with confidence. Total budget: $440.

**Jacob weigh-in:** **Yes** — experiment design, kill-switch math, confound enumeration. This is Jacob's wheelhouse per the primer Section 7.

---

## D3 — LinkedIn founder essay Day 0 organic launch — ship now or wait for Vercel /ethics page live?

**Context:** Lucas drafted a founder essay on the "we deleted the Live Prompter" pivot (`docs/BLOG_WHY_WE_REMOVED_LIVE_PROMPTER.md` is the canonical text). The plan was to publish on LinkedIn as Day 0 organic launch — refusal-narrative wedge, no spend, builds founder credibility. The blog references a "/ethics" page on the IA.ai site as the canonical link. **That page is not yet live on Vercel.**

**Options:**
- **A. Ship now, link to GitHub markdown file as interim.** Risk: LinkedIn auto-preview of a raw GitHub URL is weak; engagement may suffer. Cheap pivot — post still works.
- **B. Ship LinkedIn essay with NO link, just text.** Force the reader to engage with the idea, not the artifact. Add CTA at end ("Read more at IA.ai/ethics when it's live"). Loses traffic-to-site signal.
- **C. Wait for /ethics page live, then ship.** Cleanest. Requires Lucas (or Jacob, since he has authoring rights now) to ship a basic /ethics route. Estimated engineering: 30-45 min for a static Markdown-rendered page.
- **D. Ship the LinkedIn essay AND the /ethics page in parallel as a coordinated Day 0.** Treat it as a real launch beat: page goes live + post goes live within the same hour. Higher production cost, higher signal.

**Recommended:** **C or D.** The whole wedge is restraint + intentionality. Shipping the essay without the canonical landing page undermines the seriousness of the position. If Jacob can ship /ethics in <1 hr, **D** is the play. Otherwise **C** within 48 hrs.

**Jacob weigh-in:** **Yes (mechanics)** — he should scope the /ethics route work and confirm whether it's a 30-min ship or a 4-hr ship. Brand voice on the essay itself is Lucas's call (locked).

---

# 🟡 SOON

## D4 — Push Spot 5 Transformation to paid (nursing-track specific)?

**Context:** Spot 5 Transformation is an Aaliyah / nursing-track-specific spot. Built but not yet pushed to paid (lives on Lucas's Mac per `~/Desktop/IA_AI_LAUNCH_INDEX.md`). Audience is small (working/aspiring nurses) but very high-fit. NurseInterviewPro.ai landing page funnels into the nursing track inside the main app. Erin (clinical co-founder) has approved B2C-to-nurses targeting; she has rejected B2B-to-schools/hospitals.

**Options:**
- **A. Yes — push to paid as a separate, narrowly-targeted Meta campaign.** $100-150 test budget. Target: nursing-school subreddits, NurseGrid app audience, ICU/ER nurse interest categories on Meta. Distinct attribution path so we can read nursing-track CAC vs. general-track CAC.
- **B. Hold until Erin reviews the spot.** She's the clinical-content gate. If the spot makes any clinical claims or shows clinical imagery, she should approve before paid amplification.
- **C. Hold until NurseInterviewPro.ai landing page is fully wired.** The funnel destination matters. If the landing page isn't conversion-ready, paid traffic gets wasted.
- **D. Run as organic only on r/nursing + r/StudentNurse + LinkedIn nursing groups first.** Soft-launch-organic-before-paid principle. If it doesn't earn traction in nursing communities for free, paid won't fix that.

**Recommended:** **B then D then A.** Erin approval is the gate (CLAUDE.md cardinal rule: clinical co-founder's call is final on nursing track). Then organic test to validate audience resonance. Then paid amplification with kill-switch math.

**Jacob weigh-in:** **Advisory only.** Final call sits with Lucas + Erin (clinical content gate). Jacob can scope the funnel/attribution side once Erin clears the creative.

---

## D5 — Build "What's Worth Practicing" 60s video version (after audio-only v0.5)?

**Context:** WWP audio-only v0.5 is shipped (60s VO on waveform visualization, lives at `docs/marketing/mocks/wwp_audio_only_v0_5.mp4`). It's built for Reels/TikTok audio-discovery surfaces (audio ads). A full video version — same script, with visuals — would be a different format that opens YouTube pre-roll + Reels/TikTok primary feed + LinkedIn video. Production cost estimate: $40-150 depending on AI-gen vs. shot footage.

**Options:**
- **A. Yes, build a 60s video version using the existing VO + recycled cinematic-pack β/ε footage.** Lowest-cost path. β/ε have raw clips that didn't ship — repurpose them under the WWP voiceover. ~$0-40 production, mostly editor time.
- **B. Build a fresh 60s video with new visuals (AI-gen via Veo/Sora).** Higher production value, but burns the §13 Verisimilitude Auditor token + risks aesthetic-default failures we've hit before. ~$80-150.
- **C. Don't build video — keep WWP as audio-only.** The audio format has a clear job (audio-discovery). Video would compete with Letter on Screen v2 + statics for the same surfaces.
- **D. Build 30s + 15s cutdowns of the audio-only version first (still audio).** Test whether shorter versions earn more shares. Cheaper than video, faster to ship.

**Recommended:** **A** — recycle the dead β/ε footage. Cheap, fast, gives us a 60s video without committing fresh production budget. If A earns traction, then consider B. **D** is a fine parallel experiment (10-15 min of editor time).

**Jacob weigh-in:** **Yes** — format/channel choice, attribution for video-vs-audio differential. Lucas authors the creative-direction call; Jacob designs the test.

---

## D6 — Email deliverability investment ($400 Resend Pro upgrade) — now or after first paid signal?

**Context:** We use Resend for transactional + marketing email. Free tier handles low volume but rate-limits and lacks deliverability dashboards (no per-domain spam rate, no IP warming, no open-rate tracking by ISP). Pro tier is $400/mo and unlocks IP warming, deliverability insights, and higher sending limits. **Risk if we don't upgrade:** if a launch burst sends 500+ emails in one day, free tier may throttle or get the domain flagged for spam.

**Options:**
- **A. Upgrade now ($400 burn).** Pre-emptive. Sets up IP warming before launch traffic hits. Lets us see deliverability metrics from day 1.
- **B. Wait until we have first paid signal (10+ signups).** Free tier handles current volume fine. Defer the $400/mo until we have evidence of email-as-channel ROI.
- **C. Upgrade to Resend "Starter" (~$20/mo) instead.** Some Pro features, much lower cost. Worth a check if it covers IP warming.
- **D. Move to Klaviyo or Customer.io (different vendor).** Klaviyo is the e-commerce-grade incumbent; Customer.io is the events-API stack. Different cost profile, more features per dollar but more setup. Not recommended pre-PMF.

**Recommended:** **B** — defer the $400 until we have a paid-signal forcing function. Send 100-200 email burst from free tier first, measure bounce/spam rates, decide based on data. If free tier shows degradation, upgrade then. Engineering-lens failure mode: domain flagged + future deliverability damaged. Mitigation: pre-warm via SPF/DKIM/DMARC tightening (free) + send in smaller batches (free).

**Jacob weigh-in:** **Yes** — failure-mode analysis, deliverability QA, vendor evaluation. This is Jacob's engineering-lens question per primer Section 7.

---

## D7 — Cinematic Pack (β / γ / ε / Freeze / Rejection / Offer Call / Imposter) — kill or revive?

**Context:** Cinematic Pack v1 was a 3-spot launch creative cluster: γ "Object That Was Waiting" / β "Practice Made Visible" / ε "Walk-and-React". Phase 0 artifacts done for all three. **γ was killed** earlier in production (glitchy AI output, note-overlay drift). **β + ε** have raw clips but Lucas paused on smoke/brightness fixes. Total expected production cost: $36.90 / hard cap $90. Additional concepts in the queue: Freeze / Rejection / Offer Call / Imposter (each Phase 0 only, no clips).

**Options:**
- **A. Kill the entire pack. Stop sinking time. Lean on Letter on Screen v2 + statics + WWP audio.** What's shipped is working in the audio/text-driven format. Refusal-narrative wedge doesn't need cinematic production.
- **B. Revive β + ε only.** Finish the smoke/brightness fixes (estimated 2-3 hrs editor time). Ship as paid amplification candidates alongside Letter on Screen v2. Kill γ permanently.
- **C. Revive all four queued concepts (Freeze / Rejection / Offer Call / Imposter) in Phase 0 only.** Cheap exploration — storyboards and motion-prompt drafts, no production. Lets us decide which (if any) to push to production once we have Letter on Screen v2 paid data.
- **D. Kill cinematic for now. Revisit after first $1k of profitable paid spend.** If the current creative earns positive ROAS, we have budget to reinvest in production. If not, we don't waste it on cinematic.

**Recommended:** **D** with a soft revisit at the 60-day mark. Letter on Screen v2 is the cheapest, lowest-risk way to test the wedge. Cinematic production should be paid for by paid-channel ROAS, not by founder time. β + ε raw clips stay in the archive — not deleted, not finished.

**Jacob weigh-in:** **Advisory only.** Production decisions are founder's call. Jacob can advise on creative-vs-spend trade-off math.

---

## D8 — Joy Spot production timing (after Reflection earns paid signal)?

**Context:** Joy Spot is a planned spot in the "after the interview goes well" emotional register — celebration / relief framing. It's intentionally a Phase 2 piece — gated on the Reflection 15s spot earning paid signal first. Reflection raw master was wiped in the sandbox cleanup; raw clips exist in `practice_ritual/reflection_15s/raw/` per `~/Desktop/IA_AI_LAUNCH_INDEX.md`. Joy Spot has Phase 0 artifacts only.

**Options:**
- **A. Hold per current plan — wait for Reflection paid signal before producing Joy.** Preserves the sequencing. Tied to D7 decision: if cinematic is killed, Joy goes with it.
- **B. Produce Joy now in parallel with Reflection rebuild.** Two-spot test rather than serial.
- **C. Kill Joy Spot entirely.** "After interview goes well" is harder to make non-cheesy in our restraint voice. The whole pack tilts toward the "before-it-happens" frame; Joy breaks that.
- **D. Reframe Joy as a customer testimonial spot (not AI-gen).** Real user, real interview win, real voice. Different production path (recruit a customer, get release form, edit). Higher trust signal, lower production risk.

**Recommended:** **A** for now, with **D as a backlog option** for after first 50 customers (we need a customer base before we can do a customer-testimonial spot).

**Jacob weigh-in:** **No.** This is brand-voice + creative-direction territory. Lucas only.

---

# 🟢 LATER

## D9 — SEO content roadmap (8-12 long-tail articles)?

**Context:** Researcher recommended an SEO play targeting long-tail interview-prep keywords ("nurse interview behavioral questions," "STAR method examples for product manager," "interview prep without cheating," etc.). Each article: 1500-2500 words, evergreen, indexed for organic traffic over 3-12 months. Production: ~3-5 hrs/article. Cost: $0 if Lucas/Jacob author, $150-400/article if contracted.

**Options:**
- **A. Commit to 12 articles over 12 weeks. Use Marketing Editor + AI Prompt Marketing Pro agents to draft, Lucas to review/edit.** Aggressive. ~3-5 hrs/week of Lucas review time.
- **B. Commit to 4 articles over 8 weeks.** Conservative pilot. Measures whether SEO is a viable channel for us before committing 12 articles of time.
- **C. Kill SEO. We're a small team; channels with longer feedback loops cost too much in lost focus.** Concentrate on paid + organic social where signal arrives faster.
- **D. Outsource to a freelance SEO writer. $200-300/article × 12 = $2400-3600.** Faster, but quality risk — brand voice gate is absolute, and outsourced writers rarely nail restraint-positioning on first try.

**Recommended:** **B** — pilot 4 articles. Topics: (1) "Why we don't help you cheat in interviews," (2) "The testing effect for interview prep," (3) "Behavioral interview questions for new grad nurses," (4) "STAR method without sounding rehearsed." If 2+ articles index in top 20 within 8 weeks, scale to A. If not, kill.

**Jacob weigh-in:** **Advisory only.** Content strategy is Lucas + Marketing Editor agent. Jacob can advise on SEO mechanics (schema, internal linking, page speed) once articles are drafted.

---

## D10 — Pricing communication strategy: when to announce $39 / $149 prices publicly?

**Context:** Current pricing is locked per `JACOB_FIXES_IMPLEMENTATION_PLAN_2026-05-08.md` #8a: $39 30-day pass, $19.99 nursing pass, $149 annual pass. Pricing is not yet publicly communicated in marketing creative — the existing creative leads with the philosophy ("Practice, not cheat") and not the price. The question is whether/when/how to surface price prominently.

**Options:**
- **A. Lead with price now in paid creative ("$39 for 30 days of practice").** Trades on price clarity. Risks commoditizing — competitors offer "free with real-time cheat assistance," and price-led messaging gets compared dollar-for-dollar.
- **B. Keep price out of creative entirely; reveal only on landing page.** Lead-gen funnel: creative sells the philosophy, page reveals the price. Trusts the wedge to qualify the user before the price reveal.
- **C. Test both as paired ad variants.** Same hook, one with price, one without. Read CTR + conversion-rate differential. Cleanest empirical answer.
- **D. Lead with annual ($149) in creative — frames us as a long-term tool, not an interview-week panic buy.** Higher AOV, but smaller addressable market for the lead message.

**Recommended:** **C** as the experiment design. Brand voice favors B; engineering rigor says test it. Run the comparison once D1 (pixels) is resolved.

**Jacob weigh-in:** **Yes** — experiment design on this A/B test. Lucas authors the creative variants; Jacob designs the read.

---

## D11 — Apple Build 43 launch timing once it's approved?

**Context:** Apple Build 43 didn't get approved in time for the April 22 launch attempt. Status today: in App Review queue (per most recent session ledger). Once approved, the question is how to time the public launch — does it become a launch event in itself, or does it slip silently into the existing TestFlight → App Store transition?

**Options:**
- **A. Coordinated launch beat — LinkedIn essay + App Store live + Practice Prompter rebrand in-product all hit the same day.** Maximum signal, requires all three to be ready simultaneously.
- **B. Silent App Store launch first, then marketing beats over the following 2-4 weeks.** Lower risk of a "launched and crashed" public moment. Gives us time to fix any iOS-specific bugs surfaced by real users.
- **C. Press-release / Product Hunt launch tied to App Store approval.** Higher reach but burns the "one good shot" at PH. Requires the funnel + pricing + pixels all be production-ready.
- **D. App Store live but unpromoted — focus marketing on the web app for now.** Treat iOS as a fulfillment channel, not a marketing channel, until the rest of the funnel is dialed.

**Recommended:** **B** — silent App Store live, then coordinated marketing beats over the following 2 weeks. The April 22 attempt slipped partly because we tried to coordinate too many beats at once. Smaller, sequenced launches reduce concurrent risk per the V.S.A.F.E.R.-M and HIGH-blast principles.

**Jacob weigh-in:** **Advisory only.** Launch sequencing is Lucas's call. Jacob can scope what's needed for each option's prerequisites.

---

# Summary tally

**🔴 BLOCKING (resolve this week):** D1 (pixels), D2 ($390 Ad #2), D3 (LinkedIn essay)
**🟡 SOON (resolve in 2 weeks):** D4 (Spot 5 paid), D5 (WWP video), D6 (Resend Pro), D7 (cinematic pack), D8 (Joy Spot)
**🟢 LATER (strategic):** D9 (SEO), D10 (pricing comms), D11 (App Store launch timing)

**Jacob weigh-in count:** 7 of 11 (D1, D2, D3, D5, D6, D9 advisory, D10)
**Erin gate:** D4 (nursing-track creative)
**Founder-only:** D8

---

## Suggested next session structure

1. **Lucas reads this doc + the primer (`MARKETING_FOR_JACOB_PRIMER.md`).** ~15 min.
2. **Send doc to Jacob with the primer.** Ask him to draft his read on D1 / D2 / D3 (the BLOCKING three) within 48 hrs.
3. **30-min sync** with Jacob to align on the three blocking decisions. Then execute D1 (pixels), then D2 ($50 smoke test → $390 kill-switch).
4. **Erin sync** on D4 (Spot 5 nursing-track paid).
5. **Defer 🟡 SOON tier** until after first paid signal lands.

---

— Cowork (read-only mandate maintained)
