# Phone-Dispatch Spec — Claude Control From Your iPhone

*Design document. Not built. Read when you have 10 min and pick an approach — I'll build after the Apple IAP fix lands.*

---

## Your goal (as I understand it)

You want to dispatch tasks to Claude from your phone while at work. Specifically:
- Send a prompt from your phone
- Claude Code (with full repo access) executes it
- You see the result asynchronously — don't need to watch the screen
- Ideally threaded so you can follow-up on a task later in the day
- Can kick off work that runs while you're in meetings, then check in on break

---

## 4 architectures — ranked by effort-to-payoff

### 🥇 **Option A: Slack/Telegram/iMessage bridge** (RECOMMENDED)

**How it works:**
- A background service runs on your Mac (or a cloud Linux VPS)
- You message a Slack channel / Telegram chat / iMessage contact from your phone
- The service listens, routes to Claude Agent SDK, gets the response
- Response posts back to the same channel
- All threaded — follow-ups stay in context

**Why this is best:**
- Native mobile UX (no custom app)
- Async — doesn't need live session
- Threading means Claude has context on follow-ups
- You can kick off work mid-meeting, glance at the result later
- Cheap to build (~1 day with Claude Agent SDK)

**What you need:**
- Anthropic API key (you have)
- Slack workspace OR Telegram bot token OR iMessage bridge
- Something always-on to run the listener:
  - **Option A1:** Your Mac stays on, runs a background service (free, simple)
  - **Option A2:** A small Hetzner/DigitalOcean VPS ($5/mo) — always available, survives Mac sleep
- Repository clone on the listener machine (cloud option means the VPS clones ISL repo)

**My recommendation within Option A:** Telegram bot + VPS. Telegram has the cleanest bot API, runs well as a background service, and $5/mo VPS means it works even when your Mac sleeps.

**Rough build plan (1 day):**
1. Spin up a $5 Ubuntu VPS on Hetzner/DO (10 min)
2. Clone the repo there + set up Claude Agent SDK + Node.js (30 min)
3. Register a Telegram bot via @BotFather (5 min)
4. Write listener script: poll Telegram → send to Claude Agent SDK → post back (2-3 hours)
5. Add safety gates: whitelist your Telegram user ID, cap tokens/session, dry-run flag (1 hour)
6. Deploy + test (1 hour)

**Estimated cost:** $5/mo VPS + Anthropic API usage (you already pay for this).

---

### 🥈 **Option B: SSH to home Mac via Termius**

**How it works:**
- Your Mac stays on, runs a listener (sshd + `screen`/`tmux`)
- iPhone app (Termius, Blink Shell) SSHes in
- You type prompts directly to Claude Code inside a terminal session

**Why it's second:**
- Zero build — uses existing SSH + Claude Code
- Full tool access
- But typing on phone is painful, and syncing dotfiles is a pain

**What you need:**
- Mac that doesn't sleep (`caffeinate` or System Settings → Never Sleep)
- SSH server enabled (System Settings → General → Sharing → Remote Login)
- Static IP or dynamic DNS (`ngrok` or `Cloudflare Tunnel`)
- Termius app on iPhone (paid: $8/mo; or Blink Shell free with ads)

**Caveats:**
- Security: exposing SSH publicly needs key auth + fail2ban + nonstandard port
- Typing code on phone keyboard sucks for anything longer than one-liner

---

### 🥉 **Option C: Custom web UI at ops.interviewanswers.ai**

**How it works:**
- You already have `koda-ops/` dashboard — add a "Dispatch" tab
- Simple form: prompt text area + submit
- Backend API route (Vercel serverless or Supabase Edge Function) calls Claude Agent SDK
- Result streams back to the dashboard
- Mobile-optimized responsive design

**Why it's third:**
- Custom UX can be phone-optimized
- Integrates with existing ops dashboard
- But: requires building a real UI + API + streaming UX
- Longer build (2-3 days)
- No threading out-of-the-box

**What you need:**
- Existing koda-ops dashboard (you have)
- Vercel serverless API route OR Supabase Edge Function
- Anthropic API key
- Auth layer (you already have Supabase auth)

---

### 🏳️ **Option D: GitHub Issues + auto-responder**

**How it works:**
- Post a GitHub issue with a specific label (e.g., `claude-dispatch`)
- GitHub Action triggers on new issue
- Action runs Claude Agent SDK against the issue body
- Posts response as issue comment
- Threaded via issue comments

**Why it's fourth:**
- Free (GitHub Actions free tier + Anthropic API)
- Native GitHub mobile app for posting issues
- But: GitHub Actions are slow (cold start ~30s per run)
- Weird UX — reading Claude's output in a GitHub issue thread
- Can easily leak sensitive repo work if issues aren't private

---

## My recommendation

**Option A (Telegram bot + $5 VPS).** Best balance of effort and payoff for your specific use case (founder dispatching from phone during workday).

If you want to skip the VPS: **Option A with your Mac as the listener**. Downside: sleeps overnight.

If you want zero new infrastructure: **Option B (SSH + Termius)**. Downside: painful typing.

---

## Safety gates I'd build into whatever we pick

These apply across all options:

1. **User whitelist** — only your Telegram/Slack/GitHub user ID can dispatch. Silently ignore others.
2. **Token budget per session** — cap at e.g. 100K tokens to prevent runaway.
3. **Dangerous-command filter** — reject prompts that start with `rm -rf`, `git push --force`, `supabase db reset`, etc. Require a confirmation reply.
4. **Branch gate** — can only commit to `feature/*` branches, never `main`.
5. **Dry-run flag** — prefix prompt with `--dryrun` → Claude explains the plan, doesn't execute. Useful for verifying before committing.
6. **Log everything** — every dispatched prompt + response appended to a local log file for audit.
7. **Kill switch** — slash command like `/kill` that terminates in-flight agents.

---

## Open questions for you

1. **Telegram or Slack?** Both work. Telegram has cleaner bot API; Slack is more common in work contexts. If you're already in a Slack workspace, that might be easier.
2. **Always-on requirement?** If yes → VPS. If overnight gaps are fine → your Mac.
3. **Shared dispatch OR solo?** Do you want Jacob (new dev) to also dispatch, or is this just for you?
4. **What's the first use case?** Quick context:
   - "Check the latest Stripe webhook logs for errors"
   - "Commit the latest copy fix and push"
   - "Run the nursing launch smoke test"
   - "Generate 3 new IG captions for tomorrow's post"
   - Something more ambitious

Answer those and I can have a working Telegram bot by tomorrow evening.

---

## One note on "Claude's new system"

You mentioned it in passing. My best guess is you were referring to **Skills** (we used `brand-review` + `canvas-design` this sprint) or the **Claude Agent SDK**. The phone-dispatch build would lean on the Agent SDK to run autonomous Claude Code sessions from a bot handler.

If you meant something else — Claude for Chrome, Claude 4.5 computer-use, Claude desktop app, etc. — let me know and I'll adapt the architecture.

---

*Design doc ends. Not built. Waiting on your picks for the open questions above.*
