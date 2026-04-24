# Launch Day Operations Card
*For Alsh on Tuesday April 21, 2026 — Product Hunt launch day*
*Keep this open on a second monitor. Refresh every 15 minutes.*

---

## 📊 The 6 dashboards to have open

Pin these as browser tabs before you go to bed on Apr 20:

1. **Product Hunt** — your listing page to monitor rank + comments
2. **[Anthropic usage](https://console.anthropic.com/settings/usage)** — watch RPM/TPM pressure, alert if approaching tier cap
3. **[Resend logs](https://resend.com/emails)** — watch bounces/complaints in real time, alert if >2% bounce rate
4. **[Supabase logs](https://supabase.com/dashboard/project/tzrlpwtkrtvjpdhcaayu/logs/edge-functions)** — Edge Function errors and 429 retries
5. **[Vercel analytics](https://vercel.com/alshcampos-clouds-projects/interview-as-a-second-language-app/analytics)** — bandwidth, function invocations, edge requests
6. **PostHog** — the funnel (landing → signup → first_practice → paywall → purchase)

Plus one spreadsheet:
- **Hourly metrics log** — a Google Sheet with columns: hour, PH rank, upvotes, total signups, paying users, ad spend, best channel, notable comment/DM

---

## ⏰ Launch day timeline (Tue Apr 21)

### 11:45 PM Apr 20 (the night before)
- [ ] All 6 dashboards pinned
- [ ] Phone charged, at 100%
- [ ] PH draft previewed one more time
- [ ] First maker comment drafted in Notes app, ready to paste
- [ ] Tier 1 outreach list finalized (15 people)
- [ ] Coffee made for 00:01 AM
- [ ] Alarm set for 11:55 PM

### 00:01 AM PT — LAUNCH
- [ ] Hit **Publish** on Product Hunt
- [ ] Verify listing live
- [ ] Paste + **pin** the first maker comment (within 60 seconds)
- [ ] Copy the PH URL
- [ ] Text Tier 1 (15 people) the URL

### 00:15 AM
- [ ] Post on LinkedIn with the PH URL + screenshot of the listing
- [ ] Post on personal Twitter/X if applicable
- [ ] Post in any Discord/Slack communities you're in (follow rules, use #self-promo channels)

### 00:30–01:00 AM
- [ ] Reply to EVERY comment on PH (even one-word ones)
- [ ] Watch rank — target: top 10 within the first hour
- [ ] Monitor the 6 dashboards — if anything is red, follow the emergency playbook below

### 01:00 AM — Sleep 5 hours
- [ ] Set alarm for 06:00 AM. Trust that PH algorithm doesn't care if you're awake — the first-hour push matters most, everything after is just responding.

### 06:00 AM
- [ ] Check all 6 dashboards
- [ ] Reply to every overnight PH comment
- [ ] Send Tier 2 outreach (the broader 30 people)
- [ ] Post on LinkedIn "mid-morning update" with current rank

### 09:00 AM – 06:00 PM
- [ ] Reply to every new comment within 10 minutes
- [ ] Post a mid-day update on your OWN PH listing as a comment (reply to your own pinned comment)
- [ ] Share in any relevant Slack/Discord communities where you haven't yet
- [ ] If TikTok video 10+ is planned for today, post it at 12 PM and 6 PM local time
- [ ] Monitor ad spend, kill/scale per `docs/research/agent_run_apr11/PAID_ROI_MODEL.md` §5

### 06:00 PM
- [ ] Rank check. Thank-you post drafted for end of day.

### 11:59 PM
- [ ] Final rank screenshot for social proof
- [ ] Thank-you post on LinkedIn + PH + Twitter
- [ ] Update the spreadsheet with final numbers
- [ ] Sleep. You earned it.

---

## 🚨 Emergency playbook — what to do if something breaks

### "The site is slow" / "Signups are timing out"
1. Check Vercel analytics → function execution time + edge request count
2. If function invocations > 30k/hour, you're on Vercel Pro's path (1M/month = 41k/hour sustained), fine
3. If edge requests > 80k/hour, bandwidth is pinching — immediately enable `Cache-Control: public, max-age=31536000, immutable` on `/assets/*` via `vercel.json`
4. If functions are genuinely slow (>10s), check Supabase Edge Function logs for Anthropic 429s — that means the retry wrapper is hitting ceiling, upgrade Anthropic tier if needed

### "Users say they didn't get the confirmation email"
1. Check Resend logs → filter by delivered/bounced/complained
2. If bounces spike, check that the sender address is `noreply@interviewanswers.ai` and SPF+DKIM still resolve
3. Immediate workaround: surface the **Google Sign-In** button more prominently on `/onboarding` — it bypasses email confirmation entirely
4. Nuclear option: temporarily disable email confirmation requirement in Supabase Auth Settings → toggle "Enable email confirmations" OFF for 2 hours while you debug (ONLY if users can't sign up at all)

### "The AI is returning errors"
1. Check Anthropic usage dashboard → if RPM > tier cap, you're rate-limited
2. Check Supabase Edge Function logs → filter for `anthropic_api_error` or `[anthropic]`
3. If retry wrapper is working (you'll see retry logs), the wrapper is keeping the experience alive — just slower
4. If retry wrapper is exhausted (returning 429 to client), upgrade Anthropic tier IMMEDIATELY ($400 deposit pushes to Tier 4)
5. Client-side: users should see the friendly "AI is a bit busy" message — if they see a broken screen, the client UI handlers weren't deployed

### "Supabase is throwing errors"
1. Check Supabase Dashboard → Usage → which limit is bleeding?
2. If egress: this means someone is scraping OR assets aren't cached. Enable caching headers in `vercel.json`
3. If connections: hot-upgrade compute from Small → Medium (~$15 extra)
4. If Auth rate limit: increase "Emails per hour" further (up to Resend's cap)

### "The Stripe webhook is 500ing"
1. Check Supabase Edge Function logs for `stripe-webhook`
2. Most common cause: a Stripe event shape changed OR the signing secret rotated
3. Workaround: temporarily disable new paid conversions by swapping the Pricing CTA to "Join waitlist" while you debug — DON'T let users pay and get no receipt

### "The app is crashing on iOS"
1. Check App Store Connect → Crashes → get the stack trace
2. Most common cause: a native module version mismatch after a Vercel redeploy
3. Workaround: roll back to the previous Vercel deployment — `npx vercel rollback`

---

## 🎯 Targets by end of PH launch day

| Metric | Floor | Base | Stretch |
|---|---|---|---|
| PH upvotes | 50 | 200 | 500 |
| PH rank | Top 20 | Top 10 | Top 5 |
| Unique visitors | 400 | 1,200 | 3,000 |
| Signups | 30 | 80 | 200 |
| Paying users | 2 | 5 | 15 |
| App Store reviews | 0 | 5 | 15 |

**Floor = "the launch kind of worked."** Stretch = "creator video amplified overnight." Base = "you executed well."

---

## 💬 Templates for launch day replies

### Reply to "congrats!" type comments
> "Thank you! 🙏 Means a lot that you stopped by. We worked really hard on this — if you give it a try, I'd love your honest feedback."

### Reply to a thoughtful question
> "Great question! [direct answer]. We built it this way because [1-sentence reasoning]. Curious what you think after trying it."

### Reply to a bug report
> "Thank you so much for flagging this — I really appreciate it. Can you DM me a screenshot and the browser you're on? I'll fix this TODAY and ping you when it's live."

### Reply to a competitor mention
> "Yes, we're in that space. The differentiator is [1 specific thing — e.g., 'we built it with a practicing RN clinical co-founder, and every clinical question is human-reviewed, not AI-generated']. Happy to show you side-by-side if that's useful."

### Reply to a 1-star complaint
> "That's fair criticism and I'm sorry for the frustration. Can you tell me more about [specific thing they complained about]? I want to fix this and I'm in the comments all day."

**DO NOT do:**
- Argue with critics
- Defend the product longer than 2 replies
- Delete negative comments
- Respond to competitor trolls
- Make up testimonials
- Ask other users to defend you

---

## 📝 End-of-day retrospective (write this Tuesday night)

Answer in the spreadsheet / a doc:
1. What was the best hour of the day (in signups)? What was going on?
2. What was the worst hour? Why?
3. Best comment I got?
4. Biggest surprise?
5. What would I do differently tomorrow?
6. Which paid channel is worth scaling? Which should I kill?
7. Most urgent follow-up action for Wednesday?

---

*End of ops card. This is your co-pilot on launch day. Keep it open. — Supervisor, Apr 11 2026*
