# Product Hunt Launch Kit — InterviewAnswers.ai
*Created April 11, 2026 — ready to execute when iOS app is Apple-approved*

---

## When to launch

**DO NOT launch before:**
1. iOS build 1.0 (29) is **Approved** by Apple (not just submitted)
2. Web app smoke test passes all 9 critical paths (`docs/SMOKE_TEST_PROTOCOL.md`)
3. Email deliverability is fixed (SPF/DKIM/DMARC + custom SMTP in Supabase) — PH traffic will hammer signup flow; if confirmation emails go to spam, the launch is wasted
4. You have at least **5 real signed-up users** who can upvote/comment authentically in the first hour

**Best launch day:** **Tuesday or Wednesday**. Avoid Monday (too crowded), Friday (low traffic), weekends (dead).
**Launch time:** **12:01 AM Pacific Time.** Product Hunt resets at midnight PT — launching at 00:01 gives you the full 24-hour window to accumulate upvotes. Set an alarm. Be awake.
**Avoid:** holidays, major tech announcement days (Apple events, Google I/O, WWDC), OpenAI model launches.

---

## The 6 things you need ready before launch day

| # | Asset | Where it goes | Owner |
|---|---|---|---|
| 1 | Product name + tagline (60 char max) | PH listing | Alsh |
| 2 | Description (260 char max) | PH listing | Alsh |
| 3 | Gallery: thumbnail + 3–6 images + optional video | PH listing | Alsh |
| 4 | First comment from maker (the "why I built this" post) | PH listing, pinned | Alsh |
| 5 | Outreach list of 30–50 people who will upvote within first 2 hours | Personal DMs | Alsh |
| 6 | Hunter (optional but helpful) | DM request | Alsh |

---

## 1. Product name + tagline

**Product name:** `InterviewAnswers.ai`

**Tagline (60 char limit, aim for 50):**

Pick ONE. A/B test in your head — which one would make YOU click?

- **Primary:** `AI interview coach that actually listens and talks back` (53 ch)
- Alt 1: `Practice real job interviews with an AI that asks follow-ups` (59 ch)
- Alt 2: `The AI mock interviewer built for nurses and new grads` (54 ch)
- Alt 3: `Free AI interview practice. Real voice. Real feedback.` (54 ch)

**Recommendation:** Use the primary. "Actually listens and talks back" is the differentiator vs Interview Warmup, Pramp, Big Interview — all of which are either text-only or scripted.

---

## 2. Description (260 char limit)

**Primary (252 ch):**

> Practice job interviews with an AI that speaks, listens, and adapts. Real voice responses, STAR-method coaching, and specialty tracks for nurses and career-changers. Free to start, $14.99 for 30-day access. Built by a healthcare professional who got tired of bombing interviews.

**Shorter alt (195 ch):**

> AI-powered mock interviews with real voice responses and STAR-method coaching. Nursing specialty track with 70+ clinically-reviewed questions. Free to try, no credit card. Built by a healthcare pro.

Use whichever feels more "you" on launch morning.

---

## 3. Gallery assets

Product Hunt gallery holds up to 6 images + 1 optional video. **Quality matters more than quantity — 3 great screenshots beat 6 mediocre ones.**

### Required
1. **Thumbnail (240×240 PNG or JPG)** — App icon. Use `public/icon-512.png` or the iOS app icon. Make sure background is solid, not transparent.
2. **Hero screenshot (1270×760 recommended)** — The home screen showing the 4 main features: Live Prompter, AI Mock Interviewer, STAR Coach, Practice Mode. Mobile OR desktop, pick one and be consistent.
3. **"The magic moment" screenshot** — Mid-interview with AI mock interviewer: user's transcribed answer on screen, AI's follow-up question, and a delivery feedback card ("slow down", "add a specific example"). This is the shot that sells it. Without this, people think it's another text chatbot.
4. **Nursing specialty track screenshot** — SBAR drill or a nursing practice question with enriched feedback. Shows you have depth, not just a general tool.

### Optional but recommended
5. **Results screenshot** — Interview session summary with STAR scoring breakdown.
6. **Social proof card** — If you have a real testimonial, screenshot it in a nice card. If not, skip — don't fake it.

### Video (optional, highly recommended)
**60–90 second screen recording** showing a full mock interview: question → user speaks → AI transcription appears → AI follow-up → feedback. No voiceover needed — the product speaks for itself (literally). Upload as MP4, <50MB.

**Tool suggestions:** QuickTime screen record + iMovie trim. Or Loom (free tier). Don't over-produce — PH audience can smell a paid ad and distrusts it.

### ⚠️ Asset hygiene
- Remove all test/dev data from screenshots (no "test@test.com", no "asdf asdf" answers)
- Use light mode unless dark mode is clearly better
- Pin to one device aspect ratio — don't mix iPhone + desktop + iPad in the same gallery
- No watermarks, no "Powered by X" in corners, no timestamps in the UI

---

## 4. First maker comment (pinned)

This is the MOST IMPORTANT piece of copy on launch day. It's the first thing hunters read after the tagline. Pin it within 60 seconds of going live.

**Draft (copy-paste ready, ~350 words):**

> Hey Product Hunt 👋
>
> I'm Alsh, a healthcare professional by day and a builder by night. InterviewAnswers.ai is the tool I wish existed when I was going through my own interview cycle in 2024.
>
> **The problem I kept running into:** there are plenty of "AI interview prep" tools, but they're all variations on text chatbots or pre-recorded video questions. None of them actually listen to you speak, respond in real time, and coach you the way a friend would — follow-ups included.
>
> I wanted something that felt like having a coach in the room.
>
> **What InterviewAnswers.ai does:**
> - **AI Mock Interviewer** — speaks the question out loud, listens to you answer, transcribes what you said, asks a follow-up, and gives feedback on your delivery (pacing, filler words, specificity, STAR structure)
> - **Live Prompter** — real-time bullet points during practice, like a teleprompter that only shows the key talking points
> - **STAR Coach** — walks you through the Situation-Task-Action-Result framework for behavioral questions
> - **Nursing specialty track** — I partner with a Master's-prepared RN clinical co-founder who reviews every clinical question. 70+ questions across ED, ICU, med-surg, and more. Zero AI-generated clinical content — all human-validated.
>
> **What it's NOT:**
> - Not a clinical reference (we explicitly redirect drug-dosage questions to UpToDate)
> - Not a cheating tool for live interviews
> - Not locked behind a paywall — the free tier is genuinely usable
>
> **Pricing:** Free to start with real usage (no credit card). $14.99 for a 30-day pass if you want unlimited, or $99/year for the annual plan.
>
> **Built with:** React + Vite, Supabase, Claude via Edge Functions, Stripe, and Capacitor for iOS.
>
> I'd love your brutal, honest feedback — especially on the AI mock interviewer flow. What makes it feel real? What makes it feel fake? I'm in the comments all day and I read everything.
>
> Thank you for hunting! 🙏

**Tips:**
- Pin this comment immediately
- Edit it if you get a great insight during the day — PH lets you edit
- Reply to EVERY top-level comment within the first 4 hours, even one-word ones ("Congrats!" → "Thanks so much for stopping by 🙏")

---

## 5. Outreach list + upvote drive sequence

**The first 2 hours determine the next 22.** PH's algorithm heavily weights upvote velocity in the opening window. You need ~30 real upvotes in the first hour to land on the homepage top 5.

### Who to ask
Build a spreadsheet BEFORE launch day with 50 names in these categories:

| Category | Target count | Who |
|---|---|---|
| Family/close friends with PH accounts | 5–10 | People who will 100% show up |
| Beta testers who already use the app | 10–15 | Real users whose comments will ring true |
| Tech/builder friends from LinkedIn | 10–15 | PH-savvy audience |
| Nursing network (clinical co-founder's contacts + yours) | 5–10 | Target audience + credibility |
| Past coworkers, gym friends, random network | 5–10 | Quantity, not quality |

**Do NOT:** buy upvotes, ask in upvote exchange Discord/Telegram groups, or use any service that promises upvotes. PH detects this and will shadowban you — and you lose the account permanently.

### Outreach messages (copy-paste)

**Tier 1 — close network (send night before launch):**
> Hey [name] — launching InterviewAnswers.ai on Product Hunt tomorrow at 12:01am PT. If you have 60 seconds tomorrow morning, would mean the world to me if you could: (1) upvote, (2) drop a real comment if you've tried it. Link goes live at midnight — I'll DM you the URL. Zero pressure if today is crazy 🙏

**Tier 2 — broader network (send morning of launch after post goes live):**
> Hey [name] — today's the day! Just launched InterviewAnswers.ai on Product Hunt: [URL]. If you have a minute to upvote and leave a quick comment, I'd be super grateful. Genuine feedback only — no need to be nice. Thanks 🙏

**Tier 3 — cold audience (don't send on launch day — save for week 2 if launch underperformed):**
> Not applicable. Don't cold-DM strangers about Product Hunt upvotes.

### Upvote drive timing
- **T-24h:** Final outreach wave to tier 1
- **T-0 (12:01am PT):** Post goes live. Immediately pin first comment. Text close friends the URL.
- **T+15min:** Post to your LinkedIn: "Just launched InterviewAnswers.ai on @ProductHunt — [URL]. Would love your feedback." (Use the LinkedIn post template from `docs/LINKEDIN_LAUNCH_KIT.md` as a starting point, but cut it to 4 lines for the PH day.)
- **T+30min:** Post in any relevant Slack communities, Discord servers you're in. Follow their rules — most communities have a #self-promo channel.
- **T+1h:** Check you're on the homepage. If not, push harder on outreach.
- **T+4h:** Write a mid-day update as a second comment on your own post: "Wow, the response so far has been incredible. [Specific insight from the comments]. Keep it coming."
- **T+12h:** Second LinkedIn post with a screenshot of your current PH rank.
- **T+24h:** Thank-you post everywhere. Screenshot final rank. Lessons learned.

---

## 6. Hunter (optional)

A "hunter" is a high-reputation PH user who submits your product for you. A hunter with a big following can bring 100+ extra upvotes in the first hour, but **the hunter golden age is over** — since 2023, self-hunts perform about as well as hunted launches if the product is good.

**Recommendation:** Self-hunt. Don't spend a week chasing a hunter you don't know. If you already know someone with 500+ followers on PH, sure, ask them — but don't block the launch on it.

**If you want to try:** Search PH for "best hunters," find 3–5 who hunt products in your category (AI, education, career), look at whether they're still active (last hunt in the past 30 days), and DM them a short pitch:
> Hey [name] — big fan of your hunts in the AI/education space. I'm launching InterviewAnswers.ai (AI voice interview coach, nursing specialty track, built by a healthcare professional) and wondered if you'd be open to hunting it. Happy to share a demo video. Totally understand if not — either way, thanks for all the great finds!

If they say no or don't respond within 48 hours, move on and self-hunt.

---

## Day-of checklist

### Night before (11 PM PT)
- [ ] Double-check all gallery assets uploaded to PH draft (PH lets you create a draft and go live with one click)
- [ ] Tagline and description locked in
- [ ] First comment drafted in a notes app, copy-paste ready
- [ ] LinkedIn post drafted
- [ ] Tier 1 outreach sent (~15 people)
- [ ] Alarm set for 11:55 PM PT
- [ ] Laptop charged, coffee/water ready
- [ ] Web app smoke test run one more time. If anything is broken, PAUSE the launch
- [ ] iOS app link ready (App Store URL, once approved)

### 12:00 AM PT
- [ ] Hit publish on PH
- [ ] Verify listing is live (refresh PH homepage)
- [ ] Post first comment, PIN IT
- [ ] Copy the PH URL
- [ ] Send Tier 1 outreach the URL via text/DM

### 12:15 AM PT
- [ ] Post on LinkedIn
- [ ] Post on personal Twitter/X if you have one
- [ ] Post in relevant Discord/Slack communities
- [ ] Reply to first comments on PH

### 6:00 AM PT
- [ ] Check rank — aim for top 10
- [ ] Reply to every comment from the night
- [ ] Second outreach wave to Tier 2
- [ ] Post on Reddit if the product fits — r/nursing, r/careerguidance, r/SideProject. **Follow subreddit rules.** r/SideProject is always safe. r/nursing will remove promo; don't try.

### 12:00 PM PT
- [ ] Mid-day LinkedIn update with screenshot of rank
- [ ] Reply to ALL comments — no exceptions
- [ ] Share in any remaining networks

### 6:00 PM PT
- [ ] Thank-you post drafted for end of day
- [ ] Check analytics — how many sign-ups came from PH? (You'll need UTM parameters — see below)

### 11:59 PM PT
- [ ] Final rank screenshot
- [ ] Thank-you post on LinkedIn + PH
- [ ] Go to bed. You earned it.

---

## UTM tracking (do this BEFORE launch)

Product Hunt traffic needs a UTM so you can tell PH signups from organic signups in Supabase.

**Link to use on PH and in all PH outreach:**
```
https://www.interviewanswers.ai/?utm_source=producthunt&utm_medium=launch&utm_campaign=ph_launch_2026
```

Check in Supabase after the launch:
```sql
-- Rough count of PH-attributed signups
SELECT COUNT(*) FROM auth.users
WHERE raw_user_meta_data->>'utm_source' = 'producthunt'
  AND created_at >= '2026-XX-XX';
```

(Note: this only works if the signup flow captures UTM params into user metadata. If it doesn't today, that's a 30-minute code change — check `src/App.jsx` signup handler. If not implemented, at minimum you'll see the traffic spike in Vercel analytics.)

---

## Realistic expectations

**What a good launch looks like for a solo builder with no audience:**
- 150–400 upvotes
- Top 10 of the day (maybe top 5 on a slow day)
- 50–200 clicks to the site from PH
- 10–40 signups
- 1–5 paying conversions in the first week from PH traffic

**What a viral launch looks like (rare, don't count on it):**
- 1,000+ upvotes
- #1 Product of the Day
- 2,000+ clicks
- 200+ signups
- 20+ conversions

**What a "failed" launch looks like:**
- <50 upvotes
- Not on homepage
- <20 clicks

**Even a "failed" launch is worth doing** — you get a permanent PH page, backlinks, social proof ("featured on Product Hunt"), and lessons. The only truly wasted launch is one where you weren't ready and the product was broken.

---

## After the launch

### Day +1
- Thank-you post with screenshots of rank and any standout comments
- Email list of everyone who signed up through PH with a personal note
- Archive the PH page URL everywhere — footer, About page, email signature

### Week +1
- If you got good traction, Product Hunt will put you in the weekly/monthly newsletter. Respond to any press DMs you get (there will be a few — not all legit, some are SEO scrapers).
- Follow up on any real press interest with the same materials you used for PH.

### Month +1
- Don't relaunch on PH within 6 months. PH has a no-spam rule. You can launch a major update (e.g., "InterviewAnswers.ai v2 with [major feature]") but it must be substantially new.

---

## What Product Hunt is NOT good for

Be realistic about what PH delivers:
- ✅ One-day traffic spike
- ✅ Permanent SEO backlink
- ✅ Social proof
- ✅ A few high-signal comments from builders
- ❌ NOT a sustainable acquisition channel
- ❌ NOT a nursing audience (PH audience skews heavy tech, very few nurses)
- ❌ NOT a reliable paid conversion driver

**The nursing audience is on Reddit (r/nursing), Facebook groups, nursing school Discords, and Instagram — not Product Hunt.** Use PH for the general track launch and credibility. Use nursing-specific channels for the nursing track.

---

## Red flags to watch for on launch day

- **Your site goes down.** PH traffic is <1,000 concurrent users for most launches — Vercel will handle it. But check. If Vercel shows degraded performance, your launch is over.
- **Sign-ups aren't completing.** If email confirmation is broken (see P0 bug 1) — every PH visitor gets a broken signup. Test at 11 PM PT the night before.
- **Comments accuse you of being fake/AI-generated.** Happens to new accounts. Respond politely, point to your real LinkedIn, don't engage trolls beyond the first reply.
- **Someone claims your product is a ripoff of theirs.** Happens. Stay calm. Respond once with your differentiators, don't argue further.

---

## Final note

**Don't launch until you're ready.** A rushed launch burns your one shot. Better to wait 2 weeks and land cleanly than to launch tomorrow with a broken signup flow and an iOS app still in Apple review.

The pre-launch checklist at the top of this doc is non-negotiable. Work through it, fix anything broken, THEN pick a launch date.

---

*End of Product Hunt Launch Kit. Pair with `docs/LINKEDIN_LAUNCH_KIT.md` for the LinkedIn side of the launch.*
