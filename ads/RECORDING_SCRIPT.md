# Recording Script — InterviewAnswers.AI Ad Creatives
**Device:** iPhone 16 Pro Simulator (52B75F82-B47E-4236-8554-1A2CDBA3D9B1)
**Date:** February 10, 2026

---

## PRE-RECORDING CHECKLIST
- [ ] App is launched and logged in with data (questions, sessions showing)
- [ ] Simulator status bar shows clean time (set to 9:41 for Apple-style consistency)
- [ ] No other apps in background
- [ ] Simulator window is focused and full-screen

---

## RECORDING 1: APP OVERVIEW TOUR (Hero Content)
**Purpose:** Capture the full app experience for use across all platforms
**Target length:** 45 seconds raw → cut to 15s, 25s, 30s versions
**What viewer should take away:** "This app has multiple real features, it's polished, it looks premium"

### Shot List:
| Time | Screen | Action | What to Show |
|------|--------|--------|-------------|
| 0:00–0:05 | Home/Landing | Pause on hero | "Nail Every Interview" headline, purple gradient, CTA |
| 0:05–0:08 | Home | Scroll down slowly | Feature cards appear (Live Prompter, AI Interviewer, Practice, etc.) |
| 0:08–0:12 | Home | Continue scroll | Stats section (Questions, Sessions, Days streak) |
| 0:12–0:15 | Home | Tap "Start Practicing Free" | Transition to logged-in home |
| 0:15–0:20 | Dashboard | Pause | Show user dashboard with stats, practice modes |
| 0:20–0:25 | Dashboard | Scroll | Show all available modes |
| 0:25–0:30 | Live Prompter | Tap into Live Prompter | Show the Live Prompter interface |
| 0:30–0:35 | Live Prompter | Pause on interface | Current question + AI coaching STAR prompts |
| 0:35–0:40 | AI Interviewer | Navigate to AI Interviewer | Show the mock interview setup |
| 0:40–0:45 | Practice Mode | Quick look | Show the practice/scoring interface |

### Notes:
- Scroll SLOWLY. Fast scrolling looks frantic and cheap.
- Pause for 2–3 seconds on each important screen so frames are usable as stills too.
- This is the master recording — all other videos cut from this.

---

## RECORDING 2: LIVE PROMPTER DEMO (Flagship Feature)
**Purpose:** Show the "movie trailer moment" — real-time coaching during an interview
**Target length:** 30 seconds raw → cut to 15s version
**What viewer should take away:** "Wait, it coaches you IN REAL-TIME during the actual interview?!"

### Shot List:
| Time | Screen | Action | What to Show |
|------|--------|--------|-------------|
| 0:00–0:03 | Home/Dashboard | Quick navigate | Tap into Live Prompter mode |
| 0:03–0:08 | Live Prompter | Session starting | Question appears: "Tell me about a time..." |
| 0:08–0:15 | Live Prompter | Coaching active | AI coaching prompts appear (Situation, Task, Action, Result) |
| 0:15–0:20 | Live Prompter | Listening state | "Listening..." with audio waveform animation |
| 0:20–0:25 | Live Prompter | Feedback | Real-time feedback/prompts updating |
| 0:25–0:30 | Live Prompter | End/review | Session summary or score |

### Notes:
- The Listening animation is KEY — it shows the app is actively listening
- The STAR coaching prompts appearing in real-time is the money shot
- If we can show the coaching text dynamically appearing (not just static), that's the hook

---

## RECORDING 3: AI MOCK INTERVIEWER (Secondary Feature)
**Purpose:** Show the conversational mock interview experience
**Target length:** 25 seconds raw → cut to 12s version
**What viewer should take away:** "It's like having a real interview coach on your phone"

### Shot List:
| Time | Screen | Action | What to Show |
|------|--------|--------|-------------|
| 0:00–0:03 | Dashboard | Navigate | Tap AI Interviewer |
| 0:03–0:08 | AI Interviewer | Setup | Category selection or session start |
| 0:08–0:15 | AI Interviewer | In session | AI asking a question, conversation flow |
| 0:15–0:20 | AI Interviewer | Feedback | AI providing structured feedback on answer |
| 0:20–0:25 | AI Interviewer | Score/summary | Performance scoring or session end |

---

## RECORDING 4: PRACTICE MODE + SCORING (Supporting Feature)
**Purpose:** Show the STAR method scoring system
**Target length:** 20 seconds raw → cut to 10s version
**What viewer should take away:** "It actually scores your answers and tells you what to improve"

### Shot List:
| Time | Screen | Action | What to Show |
|------|--------|--------|-------------|
| 0:00–0:03 | Dashboard | Navigate | Tap Practice Mode |
| 0:03–0:08 | Practice | Question appears | Show a question card |
| 0:08–0:12 | Practice | Recording/answer | User answering (or simulated) |
| 0:12–0:17 | Practice | Scoring | STAR score appearing with breakdown |
| 0:17–0:20 | Practice | Feedback | Specific improvement suggestions |

---

## SCREENSHOTS TO CAPTURE (Static Ad Assets)

After recordings, capture clean screenshots of:

1. **Home/Hero screen** — "Nail Every Interview" with gradient (for brand shots)
2. **Dashboard with stats** — shows active usage, real data (for social proof)
3. **Live Prompter active** — question + coaching prompts visible (HERO SCREENSHOT)
4. **AI Interviewer in session** — conversation with AI visible
5. **Practice scoring screen** — STAR scores visible
6. **Settings/Profile** — shows Pro features (for upgrade messaging)

### Screenshot Settings:
- Clean status bar (9:41, full battery, full wifi)
- No notifications
- Each screenshot = potential static ad asset or phone mockup insert

---

## POST-RECORDING

### File Naming Convention:
```
rec-01-app-overview-raw.mp4
rec-02-live-prompter-raw.mp4
rec-03-ai-interviewer-raw.mp4
rec-04-practice-scoring-raw.mp4
ss-01-home-hero.png
ss-02-dashboard-stats.png
ss-03-live-prompter-active.png
ss-04-ai-interviewer-session.png
ss-05-practice-scoring.png
```

### Trimming Plan (using avconvert):
From rec-01-app-overview-raw.mp4:
- `rec-01-overview-15s.mp4` — first 15s (home + scroll to features)
- `rec-01-overview-25s.mp4` — first 25s (home through dashboard)
- `rec-01-overview-30s.mp4` — home through Live Prompter entry

From rec-02-live-prompter-raw.mp4:
- `rec-02-prompter-15s.mp4` — tightest cut, question + coaching only

From rec-03-ai-interviewer-raw.mp4:
- `rec-03-interviewer-12s.mp4` — question + feedback only

---

## IMPORTANT CONSTRAINTS

1. **I cannot tap the simulator programmatically** (no accessibility access for AppleScript)
2. **The user will need to manually navigate** through the app while recording runs
3. **Alternative: Navigate via Safari URL** if the app supports deep links
4. **Alternative: Use static screenshots** and create motion in post-production (Ken Burns effect, slide-in animations via HTML/CSS)

### Plan B — If Manual Navigation Isn't Possible:
Create animated HTML/CSS mockups using real screenshots:
- Phone frame with screenshot cycling through screens
- CSS animations for slide transitions between features
- Text overlays with ad copy
- Export as video via screen recording of the HTML page

This is what MasterClass does for many of their "app demo" ad segments — it's polished, controlled, and doesn't require live app interaction.

---

*Script written BEFORE recording. Every second is planned. No wasted captures.*
