# Ad Copy Audit — Practice Prompter Rebrand
**Date:** April 22, 2026
**Owner:** Founder (manual updates in Google Ads dashboard)
**Context:** Rebrand from "Live Prompter / real-time / interview copilot" → "Practice Prompter / rehearsal / ethical interview AI". This doc tracks every ad-copy change in `docs/marketing/` so the founder knows exactly what to re-upload to Google Ads, Meta Ads Manager, and any other live ad platforms.

**Authority docs:**
- `docs/REBRAND_OWNER_DIRECTIVE.md`
- `docs/REBRAND_RESEARCH_APR22.md` §4 (7 tested copy variants) + §5.3 (kill-list keywords)
- `docs/REBRAND_AUDITOR_REPORT.md`
- `docs/REBRAND_FINANCIAL_IMPACT.md`

---

## 1. Google Ads — Changes Requiring Manual Upload

### Campaign A: Brand + Generic Interview Prep
**Platform action required:** Log in to Google Ads → Campaign A → Responsive Search Ads → swap headlines/descriptions below.

| # | Field | Before | After |
|---|-------|--------|-------|
| H6 | Headline 6 | "Real-Time Interview Coach" | "Ethical Interview Prep" |
| D2 | Description 2 | "Real-time feedback on your answers. Build confidence before the real thing. Start now." | "Rehearse your answers out loud. Build confidence before the real thing. Start now." |
| D3 | Description 3 | "Mock interviews, live prompting, and STAR method coaching. Free tier available today." | "Mock interviews, Practice Prompter, and STAR method coaching. Free tier available today." |
| D4 | Description 4 | "Used by job seekers in 50+ industries. AI feedback on every answer. No credit card." | "Built for rehearsal, not real-time. AI feedback on every practice answer. No credit card." |

### Campaign B: STAR Method / Behavioral Interviews
**Platform action required:** Update headline + increase daily budget from $15 to $17.

| # | Field | Before | After |
|---|-------|--------|-------|
| H13 | Headline 13 | "Real-Time STAR Coaching" | "Practice. No Shortcuts." |
| Daily budget | Campaign setting | $15/day | $17/day (+$2/day redirected from killed Campaign D) |

### Campaign C: Nursing Interview
**Platform action required:** Swap one description line.

| # | Field | Before | After |
|---|-------|--------|-------|
| D4 | Description 4 | "SBAR communication drills, clinical scenario practice, and real-time AI feedback." | "SBAR communication drills, clinical scenario practice, and AI feedback on every rep." |

### Campaign D: KILLED
**Platform action required:** **PAUSE Campaign D in Google Ads dashboard.** Do NOT delete — keep paused for 30 days in case we want to mine keyword data. After 30 days, archive.

| Action | Detail |
|--------|--------|
| Pause campaign | Campaign D "Competitor Targeting" — kill all ad groups |
| Reason | Target keywords ("interview copilot", "AI interview assistant", etc.) are on the REBRAND_RESEARCH_APR22.md §5.3 "Kill immediately" list. They drive traffic looking for live in-interview AI assistance — the exact use case we no longer support. |
| Budget reallocation | $2/day → Campaign B (see above). $8/day held in reserve for PH launch-week organic amplification. |

### New Ad Variants to Add (from REBRAND_RESEARCH_APR22.md §4.7)
**Platform action required:** Create 3-5 new Responsive Search Ads in Campaign A and/or Campaign B using these headlines.

| # | Headline | Char count | Best for |
|---|----------|-----------|----------|
| N1 | "The interview AI that doesn't go in the interview." | 52 (too long for 30-char headline, use as description or long-text ad only) | Description line / Meta / LinkedIn |
| N2 | "Practice. No Shortcuts." | 23 | Headline — Campaign A, B |
| N3 | "Ethical interview prep." | 23 | Headline — Campaign A, B |
| N4 | "Built for rehearsal, not real-time" | 34 (too long for headline; use as description) | Description — all campaigns |
| N5 | "Stop freezing in interviews." | 29 | Headline — Campaign A, B |
| N6 | "Built by nurses. Reviewed by nurses." | 38 (too long for headline; use as description) | Description — Campaign C (nursing) |
| N7 | "Your interview. Your answers. Our coaching." | 44 (use as description) | Description — all campaigns |

---

## 2. Negative Keywords to Add (Google Ads)

**Platform action required:** In each campaign, add these as negative keywords (so your ads do NOT show for these queries — quality-score hygiene):

```
-copilot
-"interview copilot"
-"AI interview assistant"
-cheat
-cheating
-undetectable
-stealth
-"real-time interview help"
-"interview helper"
-"live interview AI"
```

These are the kill-list keywords from REBRAND_RESEARCH_APR22.md §5.3. Adding them as negatives ensures Campaign A/B/C don't accidentally bid on traffic we don't want after Campaign D is paused.

---

## 3. Email Platform (Resend / ConvertKit / etc.) — Changes Requiring Manual Upload

### Email Sequence A (Welcome Series)
**Platform action required:** Disable Email A4 in the ESP. Update copy on A1 and A2.

| Email | Action | Detail |
|-------|--------|--------|
| A1 — Welcome + First Win | EDIT | Change body line from "The 3 tools available: Mock Interviewer, Live Prompter, Practice Mode" → "The 3 tools available: Mock Interviewer, Practice Prompter, Practice Mode" |
| A2 — How the AI Coach Works | EDIT | Change body from "the AI adapts to your answers and gives real-time feedback" → "the AI adapts to your answers and coaches you in practice until you're interview-ready" |
| A4 — Feature Deep Dive: Live Prompter | **DELETE / DISABLE** | Remove this email entirely. Old copy leaned cheat-adjacent ("Real-time help during your practice session"). A5 renumbered to A4 (Upgrade Nudge). |
| A5 (now A4) — Upgrade Nudge | RENUMBER | No copy change — just ensure the sequence timing still fires on Day 7, not Day 5. |

### Email Sequence C (Nursing)
**Platform action required:** No copy changes (C1-C4 already align with Practice-not-cheat positioning). Verify no "live" or "real-time" language drifted in.

---

## 4. Product Hunt Launch Page — Changes Requiring Manual Upload

**Platform action required:** In the PH dashboard, update the draft page for the Apr 21 launch. If launch has already happened, these update via PH's "edit after launch" workflow.

| Field | Before | After |
|-------|--------|-------|
| Tagline | "AI mock interviews + real-time STAR coaching" (49 chars) | "The interview AI that doesn't go in the interview." (53 chars) |
| Description | Original (224 chars) mentioning "coaches you in real time" and "live prompting" | New (207 chars): "Rehearse interviews with an AI that coaches you in private. Mock interviews, STAR method feedback, Practice Prompter, and a specialty nursing track. Built for rehearsal, not real-time. Free tier available." |
| First comment | Original mentioned "AI Mock Interviewer that adapts to your responses in real time" and "Live Prompter mode" | New mentions "during practice" instead of "in real time", "Practice Prompter mode", and adds an explicit "Built for rehearsal, not real-time — we do NOT operate during live interviews" bullet. See `GOOGLE_EMAIL_PH_CAMPAIGNS.md` → First Comment section. |
| Gallery Image 2 | Text overlay: "AI Mock Interviewer — Adapts to Your Answers in Real Time" | Text overlay: "AI Mock Interviewer — Adapts to Your Answers in Practice" |
| Gallery Image 5 | Quadrant 2 label: "Live Prompter" | Quadrant 2 label: "Practice Prompter" |

---

## 5. LinkedIn Post (Scheduled for Tue Apr 22, ~10am ET) — Changes Requiring Manual Upload

**Platform action required:** If the post is still in draft / scheduled, update it. If published, consider posting a follow-up clarification.

| Post | Change |
|------|--------|
| LinkedIn Post 1 (Launch Announcement) | "Live Prompter (real-time guidance while you practice)" → "Practice Prompter (guided rehearsal with live feedback during practice sessions)" |
| LinkedIn Post 2 (Why I Built an AI Interview Coach) | No changes — already practice-aligned |
| LinkedIn Post 3 (Nursing Interview Gap) | No changes — already practice-aligned |

---

## 6. Social — Twitter/X and Instagram Launch Posts

**Platform action required:** Update scheduled posts (or post follow-ups if already live).

| Channel | Before | After |
|---------|--------|-------|
| Twitter/X launch post | "AI mock interviews + real-time STAR coaching" + "Live prompting during practice" | "The interview AI that doesn't go in the interview." + "Practice Prompter mode for guided rehearsal" + "Ethical by design" |
| Instagram launch post caption | "AI coach that gives real-time feedback" | "AI coach that gives detailed feedback on every practice answer" |
| Upvote request DM | "real-time feedback" | "practice feedback — built for rehearsal, not real-time" |

---

## 7. Creatives (HTML Ad Mockups) — Status

These are design files, not live ads, but if any were exported to PNG and uploaded to ad platforms they need to be re-exported.

| File | Changes made | Re-export needed? |
|------|-------------|-------------------|
| `creatives/reddit-ad-general.html` | No changes (already clean) | No |
| `creatives/reddit-ad-nursing.html` | No changes (verified clean) | No |
| `creatives/linkedin-post-image.html` | "Live Prompter" tile → "Practice Prompter" | **YES** — if previously exported and posted, re-export and update LinkedIn post image |
| `creatives/product-hunt-gallery-1.html` | Tagline updated (added "rehearsal, not real-time"), 3× "Live Prompter" → "Practice Prompter" | **YES** — re-export before PH launch |
| `creatives/instagram-carousel-cover.html` | No cheat-adjacent copy found | No |
| `creatives/instagram-carousel-slide.html` | No cheat-adjacent copy found | No |
| `creatives/instagram-story-1.html` | No cheat-adjacent copy found | No |
| `creatives/tiktok-thumbnail.html` | No cheat-adjacent copy found | No |

---

## 8. Founder's Next-Actions Checklist

Use this as a literal checklist. Tick each item off in the Google Ads / Meta / PH / ESP dashboards.

- [ ] **Google Ads — Campaign A:** Swap H6, D2, D3, D4 per section 1
- [ ] **Google Ads — Campaign B:** Swap H13, bump budget $15 → $17/day
- [ ] **Google Ads — Campaign C:** Swap D4
- [ ] **Google Ads — Campaign D:** PAUSE (do not delete for 30 days)
- [ ] **Google Ads — All campaigns:** Add negative keywords from section 2
- [ ] **Google Ads — Campaign A and B:** Add 3-5 new RSAs using N2, N3, N4, N5, N7 from section 1
- [ ] **ESP (email):** Disable Email A4, edit copy on A1 + A2, re-time A5 (now A4) to Day 7
- [ ] **Product Hunt:** Update tagline, description, first comment, gallery Image 2, gallery Image 5
- [ ] **LinkedIn:** Update Post 1 copy if still scheduled, OR post follow-up
- [ ] **Twitter/X + Instagram:** Update scheduled launch posts OR post clarifications
- [ ] **Re-export creatives:** `linkedin-post-image.html` → PNG → re-upload to LinkedIn; `product-hunt-gallery-1.html` → PNG → re-upload to PH

---

*End of ad-copy audit. Once all boxes checked, the rebrand has landed across every external ad/marketing surface.*
