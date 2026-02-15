# NurseInterviewPro.ai — Complete Launch Campaign
**Date:** February 13, 2026
**Supersedes:** NURSING_AD_STRATEGY.md, NURSING_LAUNCH_TODAY.md
**This is the SINGLE launch document. Follow it top to bottom.**

**Product:** interviewanswers.ai/nurse (LIVE)
**Budget:** Under $1,000 total
**Assets on hand:** 4 static PNG creatives, 5 TikTok/Reels scripts, Facebook Business Page created
**App features:** 68 nursing interview questions, 8 specialties, SBAR drills, AI coaching, mock interview simulator
**Pricing:** Free (5 practices/month) + Pro ($29.99/month)

---

## TABLE OF CONTENTS

1. [Part 1: The 7-Day Launch Sprint](#part-1-the-7-day-launch-sprint)
2. [Part 2: Video-First Creative Strategy](#part-2-video-first-creative-strategy)
3. [Part 3: The Creative Matrix](#part-3-the-creative-matrix)
4. [Part 4: Platform-Specific Campaign Setup](#part-4-platform-specific-campaign-setup)
5. [Part 5: A/B Test Architecture](#part-5-ab-test-architecture)
6. [Part 6: The Organic Amplifier](#part-6-the-organic-amplifier)
7. [Part 7: Metrics Dashboard](#part-7-metrics-dashboard)
8. [Part 8: Week 2+ Playbook](#part-8-week-2-playbook)

---

# PART 1: THE 7-DAY LAUNCH SPRINT

Every action has a time estimate. Do them in order. Do not skip days.

---

## DAY 1 (Thursday) — Record and Post [3–4 hours]

**Morning (1.5 hours): Record the 6 screen recordings**

These are your PRIMARY creative assets. The 4 existing static PNGs are supplementary.

1. Open interviewanswers.ai/nurse on your phone
2. Start screen recording (iOS: swipe down from top-right corner, tap record icon)
3. Record all 6 videos back-to-back (shot lists in Part 2 below). Pause between each.
4. Stop recording. You now have one long video file.
5. Split into 6 clips using iMovie or CapCut (free)

**Afternoon (1.5 hours): Post organic content**

6. Edit Video R1 (App Walkthrough) with text overlays in CapCut or TikTok's editor
7. Post to TikTok as organic content. Set link in bio: `interviewanswers.ai/nurse`
8. Post same video to Instagram as a Reel. Set link in bio: `interviewanswers.ai/nurse`
9. Add an Instagram Story: screenshot of specialty selection screen + poll sticker "What specialty are you interviewing for?"

**Evening (30 minutes): Reddit launch post**

10. Post in r/studentnurse (full post text in Part 6)
11. Do NOT post in r/nursing today. Wait until Day 3.

*Research principle applied: Show the App Early and Often (#6). Video First (#2). Platform-Native (#5).*

---

## DAY 2 (Friday) — Set Up Paid Ads [3 hours]

**Morning (1 hour): Install tracking pixels**

1. Meta Pixel: Go to business.facebook.com > Events Manager > Connect Data Sources > Web > Meta Pixel. Copy the base code. Add it to the `<head>` of your site or use Vercel's analytics integration.
2. TikTok Pixel: Go to ads.tiktok.com > Assets > Events > Web Events > Create Pixel. Install via code snippet in `<head>`.
3. Reddit Pixel: Go to ads.reddit.com > Pixel > Install. Copy snippet to `<head>`.
4. Verify each pixel fires on interviewanswers.ai/nurse by visiting the page and checking the pixel helper extensions.

**Midday (1 hour): Create Meta campaign**

5. Follow exact setup in Part 4 > Meta section below. Total: $15/day.

**Afternoon (1 hour): Create TikTok and Reddit campaigns**

6. Follow exact setup in Part 4 > TikTok section. Total: $10/day.
7. Follow exact setup in Part 4 > Reddit section. Total: $10/day.

**Total daily ad spend starting Day 2: $35/day**

*Research principle: Test Small, Scale Winners (#8). $35/day = ~$245 for Week 1.*

---

## DAY 3 (Saturday) — Content + Community [2 hours]

**Morning (1 hour): Post second round of organic video**

1. Edit and post Video R2 (SBAR Fear) to TikTok
2. Edit and post Video R3 (Things Nobody Tells You) to Instagram Reels

**Afternoon (1 hour): Community engagement**

3. Post in r/nursing (full text in Part 6). Different angle than r/studentnurse post.
4. Join 3 Facebook nursing groups (see list in Part 6). Do NOT post yet. Lurk and engage with others' posts first. Facebook groups ban people who join and immediately self-promote.
5. Respond to EVERY comment on your Reddit posts and TikTok/Instagram posts from Day 1.

*Research principle: UGC outperforms polished 3:1 (#10). Platform-Native (#5).*

---

## DAY 4 (Sunday) — Review First 48 Hours of Paid Data [1 hour]

**Check these numbers:**

1. Meta Ads Manager: CTR, CPC, impressions, 3-second video plays
2. TikTok Ads Manager: 6-second view rate, CTR, CPC
3. Reddit Ads: impressions, CTR, CPC
4. Supabase dashboard: new signups from /nurse (check user_profiles table, filter by created_at)
5. Google Analytics or Vercel Analytics: traffic to /nurse, bounce rate, time on page

**Decision point (spend $20 per creative before deciding):**
- Any creative with CTR below 0.5% after $20 spend: pause it
- Any creative with 3-sec hook rate below 25% (Meta) or 6-sec view rate below 20% (TikTok): pause it
- Any creative with CTR above 1.5%: note it as a potential winner

6. Post Video R4 (New Grad vs. Difficult Patient) to TikTok
7. Post Video R1 (App Walkthrough) with different text overlays to Instagram Reels

---

## DAY 5 (Monday) — Facebook Groups + Third Video Wave [1.5 hours]

1. Post in 2-3 Facebook nursing groups you joined on Day 3 (use template in Part 6)
2. Edit and post Video R5 (Specialty Switch) to TikTok
3. Post Video R2 (SBAR Fear) cross-posted to Instagram Reels (different day than TikTok)
4. Check all ad metrics again. If any creative has spent $20 with zero clicks, kill it.

---

## DAY 6 (Tuesday) — Optimize and Create New Variations [2 hours]

**Morning (1 hour): Analyze and optimize**

1. Pull full metrics from all 3 ad platforms
2. Identify your top 2 performing creatives (by CTR and CPC)
3. Pause all creatives with CPC above $3.00 or CTR below 0.8%
4. Increase budget on winners by 50% (e.g., if an ad set was at $7.50/day, move it to $11/day)

**Afternoon (1 hour): Create 2 new video variations**

5. Take your best-performing video and re-record it with a different hook (swap the first 3 seconds only)
6. Take your best-performing video and re-record it with a different CTA (swap the last 3 seconds only)
7. Upload these new variations to the same campaigns as new creatives

*Research principle: Creative Diversity Required (#9). Test Small, Scale Winners (#8).*

---

## DAY 7 (Wednesday) — Week 1 Retrospective [1 hour]

**Pull the numbers:**

| Metric | Value | Good/Bad |
|--------|-------|----------|
| Total ad spend | $___ | Should be ~$210–$245 |
| Total impressions | ___ | |
| Total clicks | ___ | |
| Average CPC | $___ | Good if < $1.50 |
| Average CTR | ___% | Good if > 1.2% |
| Signups from /nurse | ___ | Good if > 15 |
| Free-to-Pro conversions | ___ | Any conversion = strong signal |
| Best platform | ___ | Where to increase spend |
| Best creative | ___ | What to make more of |

**Week 2 budget decision:**
- If signups > 20 and CPC < $1.50: increase daily spend to $50/day
- If signups 10–20 and CPC < $2.00: maintain $35/day, swap underperformers
- If signups < 10 and CPC > $2.00: pause all paid, double down on organic, create new videos
- If any single platform has 3x better CPC than others: move 60% of budget there

---

# PART 2: VIDEO-FIRST CREATIVE STRATEGY

Research principle: Video outperforms static 3-4x (#2). Creative Quality IS the Strategy (#1).

All 6 recordings are done on your phone showing the LIVE app at interviewanswers.ai/nurse. No mockups. No simulators. Real product, real phone, real screen recording.

**General recording rules:**
- Record in portrait mode (9:16)
- Use iOS screen recording (no third-party apps needed)
- Scroll SLOWLY. Fast scrolling looks frantic.
- Pause 2-3 seconds on each important screen
- Record in a quiet environment (no background noise for voiceover versions)
- Each recording should be 15-25 seconds raw; you will trim to 9-15 seconds final

---

## RECORDING R1: App Walkthrough (Demo)
**Platform optimized for:** TikTok, Instagram Reels
**Purpose:** Show the product is real and feature-rich
**Final length:** 15 seconds

### Frame-by-Frame Shot List:
| Time | What to show on screen | Text overlay to add in editing |
|------|----------------------|-------------------------------|
| 0-2s | Open interviewanswers.ai/nurse on phone. Show the landing page hero. | "I found a nursing interview app that actually coaches you" |
| 2-5s | Tap "Start Practicing" or navigate to specialty selection. Show all 8 specialty cards. | "You pick your specialty..." |
| 5-8s | Tap "Emergency Department." Show the dashboard with practice modes. | "It has real nursing interview questions..." |
| 8-11s | Tap "Practice Mode." Show a question appearing on screen. | "And AI that scores your SBAR and STAR delivery" |
| 11-13s | Show AI feedback appearing after practice (if possible, or show the feedback screen). | "68 questions. 8 specialties." |
| 13-15s | Show the URL bar or navigate back to landing page showing the URL. | "Free to start. Link in bio." |

### Text overlay style:
- White text with black outline or semi-transparent black background bar
- Position: top-third of screen so it does not cover the app UI
- Font: bold, clean sans-serif (CapCut default works)

### Audio options:
- Option A: No voiceover, add chill lo-fi background track from TikTok's library
- Option B: Record voiceover reading the text overlays in a conversational tone

---

## RECORDING R2: The SBAR Fear (Loss Aversion)
**Platform optimized for:** TikTok, Instagram Reels
**Purpose:** Hook with the #1 nursing interview fear, then show the solution
**Final length:** 12 seconds

### Frame-by-Frame Shot List:
| Time | What to show on screen | Text overlay to add in editing |
|------|----------------------|-------------------------------|
| 0-3s | Black or dark background (just hold phone against a dark surface) | "POV: They ask 'Walk me through an SBAR handoff for a deteriorating patient'" |
| 3-5s | Same dark background or quick cut to a freeze frame | "Your brain: completely blank" |
| 5-9s | Screen recording: Navigate to SBAR Drill mode. Show the SBAR drill interface with per-component scoring (S, B, A, R). | "This app literally practices SBAR with you and scores each component" |
| 9-12s | Show the scoring feedback or final summary screen | "68 nursing interview questions. Free to start. Link in bio." |

### Audio: Trending anxious-then-relieved sound OR dramatic pause sound from TikTok library.

### Repurpose for Instagram:
- Same video, same text overlays
- Change caption to Instagram format (longer, with hashtags at the bottom)
- Add to Instagram Stories as well (tap "Share to Story" after posting as Reel)

---

## RECORDING R3: Things Nobody Tells New Grads (Educational)
**Platform optimized for:** Instagram Reels, TikTok
**Purpose:** Educate and position as an authority; soft product mention
**Final length:** 15 seconds

### Frame-by-Frame Shot List:
| Time | What to show on screen | Text overlay to add in editing |
|------|----------------------|-------------------------------|
| 0-2s | Any background (nursing-related image or just a solid color) | "Things nobody tells new grad nurses about interviews:" |
| 2-4s | Same background | "1. They WILL ask you SBAR questions" |
| 4-6s | Same background | "2. 'Tell me about a time' questions are MOST of the interview" |
| 6-8s | Same background | "3. They care about HOW you communicate, not just WHAT you know" |
| 8-11s | SWITCH to screen recording: show specialty selection -> tap a specialty -> show a question | "4. There's actually an app that helps you practice all of this" |
| 11-15s | Show the app URL or navigate to landing page | "interviewanswers.ai/nurse -- Free to start" |

### Audio: Trending "things nobody tells you" or "list reveal" sound from TikTok library.

---

## RECORDING R4: New Grad vs. The Difficult Patient Question (Comedy/Relatable)
**Platform optimized for:** TikTok
**Purpose:** Humor-driven hook that creates shareability
**Final length:** 10 seconds

### Frame-by-Frame Shot List:
| Time | What to show on screen | Text overlay to add in editing |
|------|----------------------|-------------------------------|
| 0-3s | Dark or neutral background | "Interviewer: 'Tell me about a time you dealt with a difficult patient or family member'" |
| 3-5s | Same background, or use a dramatic zoom effect in CapCut | "Me, a new grad with 2 clinical rotations:" followed by a panic emoji or freeze frame |
| 5-8s | Screen recording: show the app with practice mode and AI feedback visible | "Me after practicing with NurseInterviewPro:" |
| 8-10s | Show landing page or URL | "68 questions. Every specialty. Free. Link in bio." |

### Audio: "Oh no" trending sound or dramatic classical music sting.

---

## RECORDING R5: The Specialty Switch (Experienced Nurse Targeting)
**Platform optimized for:** TikTok, Instagram Reels
**Purpose:** Target the 25% secondary audience (specialty switchers)
**Final length:** 12 seconds

### Frame-by-Frame Shot List:
| Time | What to show on screen | Text overlay to add in editing |
|------|----------------------|-------------------------------|
| 0-3s | Neutral background | "5 years in Med-Surg. Applying to the ICU." |
| 3-5s | Same background | "Them: 'Tell me about a time you managed a rapidly deteriorating patient'" |
| 5-7s | Same background or dramatic zoom | "Me: trying to translate Med-Surg experience to ICU context" |
| 7-10s | Screen recording: show tapping "ICU" specialty, then seeing ICU-specific questions | "This app has specialty-specific questions so you don't wing it" |
| 10-12s | Show URL | "interviewanswers.ai/nurse -- Link in bio" |

### Audio: Trending transition or "glow up" sound.

---

## RECORDING R6: The Mock Interview Reveal (Feature Showcase)
**Platform optimized for:** Facebook (longer attention span), Instagram Reels
**Purpose:** Show the depth of the product -- not just flashcards, but an actual AI mock interview
**Final length:** 15 seconds

### Frame-by-Frame Shot List:
| Time | What to show on screen | Text overlay to add in editing |
|------|----------------------|-------------------------------|
| 0-3s | Start on the dashboard showing all features available | "This nursing interview app has a mode I didn't expect" |
| 3-6s | Tap into Mock Interview. Show the mock interview starting. | "It runs a full mock interview with you" |
| 6-9s | Show a question being asked by the AI interviewer | "Asks real nursing interview questions" |
| 9-12s | Show AI feedback or evaluation appearing | "Then gives you detailed feedback on your answers" |
| 12-15s | Navigate back to show the full feature set (SBAR Drill, Practice, Flashcards, etc.) | "68 questions. 8 specialties. SBAR drills. Free to start." |

### Audio: Slightly impressed/discovery-type trending sound or voiceover.

---

## How to Repurpose One Recording Across Platforms

Each raw recording can produce 3+ pieces of content:

| Source Recording | TikTok Version | Instagram Reel | Instagram Story | Facebook Ad |
|-----------------|---------------|---------------|----------------|------------|
| R1 (Walkthrough) | Full 15s with TikTok audio | Same 15s with IG hashtags | 3 key frames as story slides | Trim to 10s, add headline text |
| R2 (SBAR Fear) | Full 12s with trending sound | Same 12s, different caption | SBAR drill screenshot + poll | Trim to 10s for Feed video |
| R3 (Tips List) | Full 15s with list-reveal sound | Same 15s | Individual tips as story carousel | Use as Flexible Creative video |
| R4 (Comedy) | Full 10s with "oh no" sound | Same 10s | Not ideal for Stories | Not ideal for Facebook |
| R5 (Specialty) | Full 12s | Same 12s | Specialty selection screenshot + quiz | Trim to 10s for retargeting |
| R6 (Mock Interview) | Full 15s | Same 15s | Mock interview screenshot | Best Facebook video (longer attention) |

---

# PART 3: THE CREATIVE MATRIX

Total: 20 creative variations across video, static, text-overlay, and carousel formats.

Research principle: Creative Diversity Required (#9). Meta's Andromeda update penalizes similar-looking assets.

---

## A. VIDEO CREATIVES (6 recordings = 6 primary videos)

| ID | Name | Source | Length | Hook Psychology | Primary Platform |
|----|------|--------|--------|----------------|-----------------|
| V1 | App Walkthrough | Recording R1 | 15s | Curiosity (show the product) | TikTok, IG Reels |
| V2 | SBAR Fear | Recording R2 | 12s | Loss aversion (naming the fear) | TikTok, IG Reels |
| V3 | Things Nobody Tells You | Recording R3 | 15s | Authority/education | IG Reels, TikTok |
| V4 | Difficult Patient Comedy | Recording R4 | 10s | Humor/relatability | TikTok |
| V5 | Specialty Switch | Recording R5 | 12s | Identity (experienced nurse) | TikTok, IG Reels |
| V6 | Mock Interview Reveal | Recording R6 | 15s | Curiosity gap (unexpected feature) | Facebook, IG Reels |

---

## B. EXISTING STATIC CREATIVES (4 PNGs already exported)

| ID | File | Dimensions | Hook Psychology | Primary Platform |
|----|------|-----------|----------------|-----------------|
| S1 | export-nursing-ig-story-1080x1920.png | 1080x1920 | Loss aversion (SBAR fear) | IG Stories, TikTok static |
| S2 | export-nursing-ig-feed-1080x1080.png | 1080x1080 | Feature showcase (8 specialties) | IG Feed, FB Feed |
| S3 | export-nursing-fb-feed-1080x1350.png | 1080x1350 | Before/After transformation | FB Feed |
| S4 | export-nursing-reddit-1200x628.png | 1200x628 | Value-first (clean, minimal) | Reddit, LinkedIn |

---

## C. TEXT-OVERLAY VARIATIONS (4 re-edits of existing video footage)

Same recordings, different first 3 seconds of text. This tests hooks while reusing footage.

| ID | Base Video | New Hook Text (first 3s) | Original Hook | What We Are Testing |
|----|-----------|-------------------------|---------------|-------------------|
| T1 | R1 (Walkthrough) | "Nobody told me this app existed before my interview" | "I found a nursing interview app..." | Regret framing vs. discovery framing |
| T2 | R2 (SBAR Fear) | "They WILL ask you an SBAR question. Are you ready?" | "POV: They ask walk me through an SBAR..." | Direct challenge vs. POV storytelling |
| T3 | R3 (Tips List) | "5 things I'd tell every nursing student before their first interview" | "Things nobody tells new grad nurses..." | Advice framing vs. secret-reveal framing |
| T4 | R5 (Specialty) | "Switching from Med-Surg to ICU? Practice THESE questions." | "5 years in Med-Surg. Applying to the ICU." | Direct instruction vs. storytelling |

---

## D. CAROUSEL CONCEPTS (2 for Instagram Feed)

| ID | Concept | Slides | CTA Slide |
|----|---------|--------|-----------|
| C1 | "5 Nursing Interview Questions That Trip Up Every New Grad" | Slide 1: Hook title. Slides 2-5: One question per slide (actual questions from the app). Slide 6: "Practice all 68 with AI coaching. interviewanswers.ai/nurse" | Slide 6 |
| C2 | "SBAR Interview Answer: Before vs. After Coaching" | Slide 1: "Can you spot the difference?" Slide 2: Weak SBAR answer (unstructured). Slide 3: Strong SBAR answer (structured with S-B-A-R labeled). Slide 4: "The app scores each component." Slide 5: Screenshot of SBAR drill with scoring. Slide 6: "Try it free. interviewanswers.ai/nurse" | Slide 6 |

**How to create carousels:** Use Canva (free) with 1080x1080 slides. Export as individual images. Upload as multi-image post on Instagram.

---

## E. COMPLETE CREATIVE-TO-STRATEGY MAP

| Creative ID | Platform(s) | Audience Segment | Awareness Level | Research Principle |
|------------|------------|-----------------|-----------------|-------------------|
| V1 | TikTok, IG | All segments | Solution Aware | Show the App Early (#6) |
| V2 | TikTok, IG | New Grads (60%) | Problem Aware | Loss Aversion > Features (#4), Hook in 3s (#3) |
| V3 | IG, TikTok | New Grads (60%) | Problem Aware | Platform-Native (#5), Authority |
| V4 | TikTok | New Grads (60%) | Problem Aware | UGC outperforms polished (#10) |
| V5 | TikTok, IG | Specialty Switchers (25%) | Solution Aware | Identity-Based CTAs (#7) |
| V6 | Facebook, IG | All segments | Solution Aware | Show the App (#6), Curiosity |
| S1 | IG Stories | New Grads (60%) | Problem Aware | Loss Aversion (#4) |
| S2 | IG Feed, FB | All segments | Solution Aware | Feature showcase |
| S3 | FB Feed | All segments | Problem Aware | Before/After transformation |
| S4 | Reddit | All segments | Solution Aware | Platform-Native (#5), authenticity |
| T1 | TikTok | All segments | Solution Aware | Hook testing: regret frame |
| T2 | TikTok, IG | New Grads (60%) | Problem Aware | Hook testing: direct challenge |
| T3 | IG Reels | New Grads (60%) | Unaware/Problem | Hook testing: advice frame |
| T4 | TikTok | Specialty Switchers (25%) | Solution Aware | Hook testing: direct instruction |
| C1 | IG Feed | New Grads (60%) | Problem Aware | Curiosity gap, value-first |
| C2 | IG Feed | All segments | Solution Aware | Show the App (#6), education |

---

# PART 4: PLATFORM-SPECIFIC CAMPAIGN SETUP

---

## PLATFORM 1: META (Instagram + Facebook) — $15/day

### Step-by-Step Campaign Creation

1. Go to business.facebook.com > Ads Manager > Create
2. Campaign objective: Click **"Traffic"**
   - Why not Conversions: We do not have enough pixel data yet. Traffic first to build data, switch to Conversions at 50+ conversions.
3. Campaign name: `NursingLaunch_Traffic_Feb2026`
4. Turn ON "Advantage Campaign Budget" and set to **$15/day**
5. Click Next to Ad Set level

### Ad Set 1: New Grad Nurses
- Ad set name: `NewGrad_21-30_NursingInterests`
- Audience:
  - Location: United States
  - Age: 21-30
  - Gender: All (nursing skews female but do not exclude)
  - Detailed targeting:
    - Interests: "Nursing" AND "Job interview"
    - OR: "NCLEX" AND "Job searching"
    - OR: "Nursing schools" AND "Career"
  - Exclude: Current nursing educators, nursing school administrators
- Placements: Click **"Advantage+ Placements"** (let Meta optimize)
- This lets Meta show ads on Instagram Reels, Instagram Stories, Instagram Feed, Facebook Feed, Facebook Reels automatically

### Ad Set 2: Experienced Nurses
- Ad set name: `Experienced_25-45_SpecialtySwitchers`
- Audience:
  - Location: United States
  - Age: 25-45
  - Detailed targeting:
    - Interests: "ICU" OR "Emergency nursing" OR "Operating room" OR "Travel nursing"
    - AND: "Career change" OR "Job searching"
- Placements: Advantage+ Placements

### Creatives to Upload (per ad set, 4 ads each):

**Ad 1 (Video - Walkthrough):**
- Upload: V1 video (R1 App Walkthrough, 15 seconds)
- Primary text: "68 nursing interview questions across ED, ICU, OR, L&D, and 4 more specialties. AI coaching that helps you tell YOUR clinical stories. Practice free."
- Headline: "Nursing Interview Prep That Actually Works"
- Description: "68 Questions. 8 Specialties."
- CTA button: **"Learn More"**
- Destination URL: `https://interviewanswers.ai/nurse?utm_source=meta&utm_medium=paid&utm_campaign=nursing_launch&utm_content=v1_walkthrough`

**Ad 2 (Video - SBAR Fear):**
- Upload: V2 video (R2 SBAR Fear, 12 seconds)
- Primary text: "They WILL ask you an SBAR question. This app practices SBAR with you and scores each component. Free to start."
- Headline: "SBAR Drills + AI Mock Interviews"
- Description: "Practice before they ask."
- CTA button: **"Learn More"**
- Destination URL: `https://interviewanswers.ai/nurse?utm_source=meta&utm_medium=paid&utm_campaign=nursing_launch&utm_content=v2_sbar_fear`

**Ad 3 (Static - Specialty Grid):**
- Upload: S2 (export-nursing-ig-feed-1080x1080.png)
- Primary text: "New grad? Switching specialties? Practice the exact questions they'll ask. ED, ICU, OR, L&D, Peds, Oncology, Med-Surg, Psych."
- Headline: "68 Questions. 8 Specialties. AI Coaching."
- CTA button: **"Learn More"**
- Destination URL: `https://interviewanswers.ai/nurse?utm_source=meta&utm_medium=paid&utm_campaign=nursing_launch&utm_content=s2_specialty_grid`

**Ad 4 (Static - Before/After):**
- Upload: S3 (export-nursing-fb-feed-1080x1350.png)
- Primary text: "You know the medicine. But when they ask 'Tell me about a time you advocated for a patient' -- do you freeze? Practice free."
- Headline: "Stop Winging Your Nursing Interview"
- CTA button: **"Learn More"**
- Destination URL: `https://interviewanswers.ai/nurse?utm_source=meta&utm_medium=paid&utm_campaign=nursing_launch&utm_content=s3_before_after`

6. Review all settings and click **Publish**

---

## PLATFORM 2: TIKTOK — $10/day

### Step-by-Step Campaign Creation

1. Go to ads.tiktok.com > Campaign > Create
2. Advertising objective: Click **"Traffic"**
3. Campaign name: `NursingLaunch_Traffic_Feb2026`
4. Budget: Campaign level, **$10/day**
5. Click Continue to Ad Group

### Ad Group Settings:
- Ad group name: `Nursing_18-35_US`
- Placement: **TikTok only** (uncheck Pangle and other partner apps)
- Location: United States
- Age: 18-35
- Gender: All
- Interests: Select "Nursing," "Healthcare," "Job Interview," "Career Development"
- Budget: $10/day at campaign level (managed by TikTok's optimization)

### Ads to Upload (3 video ads):

**Ad 1 (V1 - App Walkthrough):**
- Upload: V1 video (R1 recording, 15s)
- Ad text: "68 nursing interview questions. AI coaching for SBAR and STAR method. Free to start."
- CTA: **"Learn More"**
- Destination URL: `https://interviewanswers.ai/nurse?utm_source=tiktok&utm_medium=paid&utm_campaign=nursing_launch&utm_content=v1_walkthrough`
- Identity: Use your TikTok account name or create a custom identity name "NurseInterviewPro"

**Ad 2 (V2 - SBAR Fear):**
- Upload: V2 video (R2 recording, 12s)
- Ad text: "They're going to ask you an SBAR question. Practice with AI that scores each component."
- CTA: **"Learn More"**
- Destination URL: `https://interviewanswers.ai/nurse?utm_source=tiktok&utm_medium=paid&utm_campaign=nursing_launch&utm_content=v2_sbar_fear`

**Ad 3 (V4 - Difficult Patient Comedy):**
- Upload: V4 video (R4 recording, 10s)
- Ad text: "New grad? Practice the exact questions they'll ask. 68 questions across 8 nursing specialties."
- CTA: **"Learn More"**
- Destination URL: `https://interviewanswers.ai/nurse?utm_source=tiktok&utm_medium=paid&utm_campaign=nursing_launch&utm_content=v4_comedy`

6. Review and click **Submit**

---

## PLATFORM 3: REDDIT — $10/day

### Step-by-Step Campaign Creation

1. Go to ads.reddit.com > Create Campaign
2. Campaign objective: Click **"Traffic"**
3. Campaign name: `NursingLaunch_Reddit_Feb2026`
4. Start date: Today. No end date (we will pause manually).
5. Daily budget: **$10/day**

### Ad Group Settings:
- Targeting: Community targeting
  - Select communities: **r/nursing**, **r/studentnurse**, **r/newgrad**
  - (If r/newgrad is unavailable as a targeting option, skip it)
- Location: United States
- Device: All

### Ad Creative (Promoted Post format):
- Post type: **Link**
- Headline: "Free resource: 68 nursing interview questions organized by specialty (ED, ICU, OR, L&D, etc.)"
- Body text: "Built by a healthcare professional and an engineer. AI coaches your SBAR and STAR delivery, not clinical accuracy. 8 specialties. Free to start."
- Thumbnail: Upload S4 (export-nursing-reddit-1200x628.png)
- Destination URL: `https://interviewanswers.ai/nurse?utm_source=reddit&utm_medium=paid&utm_campaign=nursing_launch&utm_content=resource_post`
- CTA button: **"Learn More"**

**Important Reddit-specific note:** Reddit users distrust obvious ads. The promoted post should read like a genuine resource share, not a sales pitch. No exclamation points. No "amazing" or "incredible." Factual tone.

6. Submit for review (Reddit ads take 24-48 hours to approve)

---

## PLATFORM 4: FACEBOOK BUSINESS PAGE (Organic, $0)

Since the Facebook Business Page "InterviewAnswers.AI" was just created:

1. Post the V6 (Mock Interview Reveal) video as an organic page post
2. Primary text: "We built a nursing-specific interview prep tool with 68 questions across 8 specialties. SBAR drills score each component of your handoff communication. AI coaching evaluates how you communicate, not what you know. Free to start: interviewanswers.ai/nurse"
3. Pin this post to the top of your page
4. Update the page's CTA button: Click "Add Button" > "Learn More" > URL: interviewanswers.ai/nurse

---

## BUDGET SUMMARY

| Platform | Daily Spend | Weekly Spend | Creatives Running |
|----------|------------|-------------|------------------|
| Meta (IG + FB) | $15 | $105 | 4 ads across 2 ad sets |
| TikTok | $10 | $70 | 3 video ads |
| Reddit | $10 | $70 | 1 promoted post |
| **Total** | **$35/day** | **$245/week** | **8 paid creatives** |

Remaining budget after 4 weeks at $35/day: $1,000 - $980 = $20 buffer.
If you scale winners (Part 5), reduce losers first to stay within budget.

---

# PART 5: A/B TEST ARCHITECTURE

Research principle: Test Small, Scale Winners (#8). $20 per creative test. Kill losers fast.

---

## TEST GRID

| Test # | What We Are Testing | Variable A | Variable B | Platform | Budget per Cell |
|--------|-------------------|-----------|-----------|----------|----------------|
| 1 | Hook type (video) | V2: SBAR Fear (loss aversion) | T2: Direct challenge ("Are you ready?") | TikTok | $20 each |
| 2 | Creative format | V1: Video walkthrough | S2: Static specialty grid | Meta (IG) | $20 each |
| 3 | Audience segment | New Grad ad set (21-30) | Experienced ad set (25-45) | Meta | $20 each |
| 4 | Hook type (video) | V1: Discovery framing | T1: Regret framing | TikTok | $20 each |
| 5 | CTA language | "Learn More" button | "Sign Up" button | Meta | $20 each |
| 6 | Platform | Best creative on TikTok | Same creative on IG Reels | Cross-platform | $20 each |

**How tests run:** Tests 1-5 run automatically because multiple creatives exist in each ad set. Meta and TikTok will allocate impressions to better performers. You read the data, you do not need to manually split traffic.

---

## KILL CRITERIA (Per Creative, After $20 Spend)

| Metric | Threshold | Action |
|--------|-----------|--------|
| CTR | Below 0.5% | Kill immediately |
| 3-sec hook rate (Meta) | Below 25% | Kill immediately |
| 6-sec view rate (TikTok) | Below 20% | Kill immediately |
| CPC | Above $3.00 | Kill immediately |
| Impressions | Below 500 after $20 | Likely audience too narrow; widen targeting |
| Link clicks | Zero after $10 spend | Kill immediately |

---

## WINNER CRITERIA

| Metric | "Good" Threshold | "Great" Threshold |
|--------|-----------------|-------------------|
| CTR | Above 1.2% | Above 2.0% |
| CPC | Below $1.50 | Below $0.80 |
| 3-sec hook rate (Meta) | Above 40% | Above 55% |
| 6-sec view rate (TikTok) | Above 30% | Above 45% |
| Cost per signup | Below $5.00 | Below $3.00 |
| Landing page conversion (visit to signup) | Above 5% | Above 10% |

---

## SCALING PROTOCOL

When a creative hits "Good" or "Great" thresholds after $20 spend:

1. **Day 1-3 of winner:** Increase budget by 25% (e.g., $10/day ad set becomes $12.50/day)
2. **Day 4-7 of sustained winner:** Increase budget by another 25%
3. **Never increase budget by more than 50% in a single day** -- this resets the algorithm's learning phase
4. **Where does the extra budget come from?** Kill the losers and redistribute their budget to winners
5. **Create 2 new variations of the winning creative** (same footage, different hook or CTA) to feed the algorithm fresh assets

---

# PART 6: THE ORGANIC AMPLIFIER (FREE)

These cost $0 and often outperform paid ads in tight-knit communities like nursing.

---

## REDDIT POSTS

### Post 1: r/studentnurse (Day 1)

**Title:** Free resource: 68 nursing interview questions organized by specialty (ED, ICU, OR, L&D, etc.)

**Body:**
```
Hey everyone -- I helped build a free nursing interview prep tool and wanted to share it with this community.

It has 68 specialty-specific interview questions across 8 units (Emergency, ICU, Operating Room, Labor & Delivery, Pediatrics, Oncology, Med-Surg, and Psych/Behavioral).

What makes it different from generic interview prep:
- Questions are written and reviewed by healthcare professionals
- SBAR drill mode with per-component scoring (Situation, Background, Assessment, Recommendation)
- AI coaching that evaluates your communication structure (STAR method), not clinical accuracy
- You pick your target specialty and get questions specific to that unit

It's free to start (5 practices/month) with a Pro tier if you want unlimited.

Link: interviewanswers.ai/nurse

Would love to hear feedback from anyone who tries it. What questions are missing? What would make it more useful?

(Disclaimer: I'm one of the builders, not a random shill account. Happy to answer any questions about how it works.)
```

**Rules:** Respond to every single comment within 2 hours. Be genuine. Accept criticism. If someone says "this sucks because X," respond with "That's fair, we're working on X."

---

### Post 2: r/nursing (Day 3)

**Title:** We built a free nursing interview coaching tool -- looking for feedback from actual nurses

**Body:**
```
Hey r/nursing -- long time lurker. I work with a healthcare infection prevention professional and we built a nursing-specific interview prep tool.

The core idea: AI coaches your COMMUNICATION (SBAR structure, STAR method, specificity, confidence) but does NOT generate or evaluate clinical content. All 68 questions were written/reviewed by nurses.

Why we built it: Generic interview apps don't understand nursing interviews. They don't know what SBAR is, they don't have specialty-specific questions, and they definitely can't help you structure a clinical scenario answer.

Features:
- 68 questions across ED, ICU, OR, L&D, Peds, Onc, Med-Surg, Psych
- SBAR Drill with per-component feedback
- Practice mode with AI coaching
- Mock interview simulator

Free tier gives you 5 practices/month. Pro is $29.99/month for unlimited.

Link: interviewanswers.ai/nurse

Honestly looking for feedback. What interview questions do you wish you'd practiced? What's missing? What specialty should we add next?

(Full transparency: I'm a builder on this project, not a random ad account.)
```

---

### Post 3: r/newgrad (Day 5, if the subreddit allows)

**Title:** Things I learned building nursing interview prep for new grads

**Body:**
```
We've been building a nursing-specific interview prep tool and learned a lot about what actually trips new grads up in interviews. Wanted to share:

1. SBAR questions are the #1 fear, but structured practice makes them manageable
2. "Tell me about a time" behavioral questions make up the majority of nursing interviews
3. Interviewers care more about HOW you communicate clinical thinking than WHAT you know
4. Having structured frameworks (STAR method for behavioral, SBAR for clinical) dramatically improves answer quality

We built a free tool at interviewanswers.ai/nurse that has 68 specialty-specific questions with AI coaching on communication structure. Not trying to sell anything -- the free tier is genuinely useful for prep.

Curious what questions you've gotten in interviews that caught you off guard?
```

---

## FACEBOOK GROUP POSTING PLAN

### Groups to Join (Day 3):
1. "New Nurse Support Group"
2. "New Graduate Nurse (New Grad RN)"
3. "ICU Nurses"
4. "Emergency Nurses"
5. "Travel Nurses Network"
6. "Nursing Interview Tips & Career Advice"

### Posting Rules:
- Do NOT post the day you join. Wait 2 days minimum.
- Engage with 3-5 other posts in the group first (genuine comments, not just "great post!")
- Read each group's rules. Many ban promotional posts. If rules say no promotion, share the resource only if someone asks for interview help.

### Template Post (Day 5):

```
Hey everyone! I helped build a free nursing interview prep tool and wanted to share it here.

It has 68 specialty-specific questions across ED, ICU, OR, L&D, Peds, Oncology, Med-Surg, and Psych. The AI coaches your SBAR delivery and STAR structure -- so it helps you communicate better, not memorize answers.

You can try it free at interviewanswers.ai/nurse

If you have an interview coming up, give it a shot and let me know what you think! Any feedback is super helpful.
```

Attach 1-2 screenshots: the specialty selection screen and the SBAR drill interface.

---

## TIKTOK ORGANIC POSTING SCHEDULE (Week 1)

| Day | Video | Caption |
|-----|-------|---------|
| Day 1 (Thu) | R1: App Walkthrough | "Nursing interview prep that goes beyond 'tell me your strengths.' 68 specialty-specific questions with SBAR drills and AI coaching. Link in bio. #nursinginterview #newgradnurse #nursetok #SBAR" |
| Day 2 (Fri) | R2: SBAR Fear | "If the words 'SBAR interview question' made your stomach drop, this is for you. 68 nursing-specific questions with AI coaching. Link in bio. #nursinginterview #newgradnurse #nursetok #SBAR #nursejobs" |
| Day 3 (Sat) | R4: Difficult Patient Comedy | "That one question that haunts every new grad. But you CAN prepare for it. 68 specialty-specific questions with AI coaching. Link in bio. #newgradnurse #nursinginterview #nursinghumor #nursetok" |
| Day 4 (Sun) | R3: Things Nobody Tells You | "New grad interview prep that actually works. Not just 'research the company and dress professionally' advice. #newgradnurse #nursinginterview #nurselife #interviewtips" |
| Day 5 (Mon) | R5: Specialty Switch | "Switching specialties is nerve-wracking enough without winging the interview. Practice questions specific to ED, ICU, OR, L&D, and more. #nurselife #specialtyswitch #ICUnurse #nursingcareer" |

---

## INSTAGRAM CONTENT CALENDAR (Week 1)

| Day | Format | Content |
|-----|--------|---------|
| Day 1 (Thu) | Reel | R1: App Walkthrough (same as TikTok Day 1) |
| Day 1 (Thu) | Story | Screenshot of specialty selection + poll: "What specialty are you interviewing for?" |
| Day 2 (Fri) | Reel | R3: Things Nobody Tells You |
| Day 3 (Sat) | Story | Screenshot of SBAR drill + quiz: "Can you name all 4 parts of SBAR?" |
| Day 4 (Sun) | Reel | R2: SBAR Fear |
| Day 5 (Mon) | Reel | R5: Specialty Switch |
| Day 5 (Mon) | Story | Screenshot of dashboard showing all features + link sticker to interviewanswers.ai/nurse |

### Hashtag Bank (copy-paste for Instagram posts):

**Core (every post):**
#nursinginterview #newgradnurse #nurselife #nursingschool #nursetok

**Specialty (rotate per post):**
#ICUnurse #EDnurse #ORnurse #LandDnurse #pedsnurse #medsurgnurse #travelnurse #oncologynurse

**Topic (rotate per post):**
#SBAR #STARmethod #nurseinterviewtips #nursingcareer #nursejobs #interviewprep

**Community (rotate per post):**
#nursesoftiktok #nursingcommunity #nursingstudent #nurseproblems

Use 15-20 hashtags per post (Instagram's recommended range). Pick 5 core + 5 specialty/topic + 5 community.

---

# PART 7: METRICS DASHBOARD

---

## DAILY CHECK (5 minutes every evening)

Open these 4 tabs every night:

| Tab | What to Check | Where to Find It |
|-----|--------------|-----------------|
| 1. Meta Ads Manager | CTR, CPC, impressions per ad, amount spent | business.facebook.com > Ads Manager |
| 2. TikTok Ads Manager | 6-sec view rate, CTR, CPC, impressions | ads.tiktok.com > Dashboard |
| 3. Reddit Ads | Impressions, CTR, CPC, comments | ads.reddit.com > Campaign |
| 4. Vercel/Google Analytics | Traffic to /nurse, unique visitors, bounce rate | vercel.com or analytics.google.com |

**Optional daily:** Check Supabase for new signups: count of rows in user_profiles where created_at is today.

---

## WEEKLY CHECK (30 minutes every Wednesday)

| Metric | Source | Target |
|--------|--------|--------|
| Total ad spend | All platforms | Under $245/week |
| Total link clicks | All platforms | Track trend (up, flat, down) |
| Average CPC | All platforms | Below $1.50 |
| Average CTR | All platforms | Above 1.2% |
| Total signups from /nurse | Supabase | Above 15/week |
| Signup-to-active rate | Supabase (users who started at least 1 practice) | Above 50% |
| Free-to-Pro conversion | Stripe dashboard | Any conversion = strong signal |
| Top performing creative | Each platform | Note which and why |
| Worst performing creative | Each platform | Pause if below kill thresholds |
| Organic post engagement | TikTok/IG/Reddit analytics | Comments, shares, saves |

---

## DECISION FRAMEWORK

| If You See This... | Then Do This... |
|-------------------|----------------|
| CPC below $0.80 on any platform | This is a winner. Increase budget 25%. Create 2 variations of this creative. |
| CPC above $3.00 after $20 spend | Kill the creative. Do not spend more. |
| CTR above 2.0% | Strong creative resonance. Scale budget. Test on other platforms. |
| CTR below 0.5% after $20 spend | Kill immediately. Hook is not working. |
| High clicks but zero signups | Landing page problem, not ad problem. Check bounce rate. Simplify the landing page CTA. |
| High signups but zero practice sessions | Onboarding problem. Check first-time user flow. |
| Reddit organic post gets 50+ upvotes | Double down on Reddit. Post in more subreddits. Create more resource-style content. |
| TikTok organic video gets 5,000+ views | Algorithm is pushing it. Post more frequently. Reuse this hook style. |
| One platform CPC is 3x worse than others | Pause that platform entirely. Move budget to the winner. |
| Any Pro conversion from ad traffic | Calculate the CAC (total spend / conversions). If CAC < $30, you are profitable. Scale. |

---

## REVENUE PROJECTIONS

Based on $35/day spend and varying conversion assumptions:

### Conservative Scenario (2% visit-to-signup, 3% free-to-Pro)
| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Total |
|--------|--------|--------|--------|--------|-------|
| Ad spend | $245 | $245 | $245 | $245 | $980 |
| Clicks (at $1.50 CPC) | 163 | 163 | 163 | 163 | 653 |
| Signups (2%) | 3 | 3 | 3 | 3 | 13 |
| Pro conversions (3%) | 0 | 0 | 0 | 0 | 0-1 |
| Revenue | $0 | $0 | $0 | $0-$30 | $0-$30 |

### Moderate Scenario (8% visit-to-signup, 5% free-to-Pro)
| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Total |
|--------|--------|--------|--------|--------|-------|
| Ad spend | $245 | $245 | $245 | $245 | $980 |
| Clicks (at $1.20 CPC) | 204 | 204 | 204 | 204 | 817 |
| Signups (8%) | 16 | 16 | 16 | 16 | 65 |
| Pro conversions (5%) | 1 | 1 | 1 | 1 | 3-4 |
| Revenue | $30 | $30 | $30 | $30 | $90-$120 |

### Optimistic Scenario (12% visit-to-signup, 8% free-to-Pro)
| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Total |
|--------|--------|--------|--------|--------|-------|
| Ad spend | $245 | $245 | $245 | $245 | $980 |
| Clicks (at $0.90 CPC) | 272 | 272 | 272 | 272 | 1,089 |
| Signups (12%) | 33 | 33 | 33 | 33 | 131 |
| Pro conversions (8%) | 3 | 3 | 3 | 3 | 10-11 |
| Revenue | $90 | $90 | $90 | $90 | $300-$330 |

**Break-even math:** At $29.99/month Pro tier, you need 33 Pro conversions to recoup $980 in ad spend. That requires ~660 signups at 5% conversion, or ~5,500 clicks at 12% signup rate. At $1.00 CPC, that is $5,500 in ad spend. This is a long game. The first $1,000 buys data and signal, not profitability. The goal is to find which creative, platform, and audience produces the cheapest signups, then scale THAT.

---

# PART 8: WEEK 2+ PLAYBOOK

---

## HOW TO READ WEEK 1 DATA

After 7 days, you will have:
- ~$245 in spend across 3 platforms
- Performance data on 8 paid creatives
- 5+ organic posts with engagement data
- Some number of signups (even 5 is useful signal)

### Questions to Answer:

**1. Which platform produced the cheapest clicks?**
- If TikTok: nursing community is engaged on TikTok. Double down with more video content.
- If Meta (IG): the targeting is working. Refine audience further.
- If Reddit: the authentic positioning resonates. Post more organic resource content.

**2. Which creative had the highest CTR?**
- This tells you which HOOK works. Create 3 more variations with the same hook angle.

**3. Which creative had the lowest CPC?**
- This tells you which creative the ALGORITHM likes distributing. Scale this one.

**4. Did anyone actually sign up?**
- If yes: the funnel works. Optimize for volume.
- If no: check bounce rate on /nurse. If bounce rate is above 70%, the landing page needs work. If bounce rate is under 50%, the problem may be further in the funnel (signup friction, unclear value prop after clicking).

**5. Did any organic post outperform paid?**
- Common in nursing communities. If a Reddit post gets 100+ upvotes organically, that audience is hungry for this. Consider Reddit as your primary channel.

---

## WHEN TO KILL CAMPAIGNS

Kill an entire platform if, after $70 spend (1 full week):
- Average CTR is below 0.5% across all creatives
- Zero signups attributed to that platform
- CPC is 3x higher than your best platform

Reallocate that platform's budget to your best performer.

---

## WHEN TO SCALE

Scale a campaign when:
- A creative sustains CTR above 1.5% for 3+ days
- CPC stays below $1.50 for 3+ days
- You are seeing signups from that creative/platform

Scaling steps:
1. Increase daily budget by 25% (not more)
2. Wait 3 days for the algorithm to re-optimize
3. If performance holds, increase another 25%
4. Create 2 new variations of the winning creative to prevent fatigue

---

## WHEN TO CREATE NEW VARIATIONS

Create new creatives when:
- A winner starts to fatigue (CTR drops 30%+ from its peak over 5 days)
- You have spent $20+ on every existing creative and identified winners/losers
- You want to test a new audience segment

**New variation formula:** Take the winning creative and change ONE element:
- Same footage, different hook text (first 3 seconds)
- Same footage, different CTA text (last 3 seconds)
- Same hook, different footage (show a different feature)
- Same everything, different platform (cross-post winners)

---

## UGC CREATOR RECRUITMENT PLAN (Month 2)

Once you have data proving which hooks and angles work, recruit UGC creators to scale content production.

### Where to Find Nursing UGC Creators:
1. **TikTok search:** Search #nursetok, #newgradnurse, #nursinglife. Find creators with 1K-50K followers who post about nursing experiences. They are affordable and their audience trusts them.
2. **Instagram search:** Same hashtags. Look for nursing students or new grads who post regularly.
3. **Direct outreach template:**

```
Hi [Name]! I love your content about [specific thing they posted about].

We built a free nursing interview prep tool (interviewanswers.ai/nurse) and are looking for nursing creators to try it and share their honest experience.

Would you be interested in creating a short TikTok/Reel showing the app? We'd pay $150 for a 15-second video. No script required -- just your honest reaction.

Happy to share more details if you're interested!
```

### Budget per Creator: $100-$200
### Target: 3-5 creators in Month 2
### Total UGC Budget: $300-$1,000

### What to Brief Them On:
- Show the app on your phone (screen recording or over-the-shoulder)
- Mention it is free to start
- Be honest -- if something confuses you, say so (authenticity converts)
- Post to their own account; we may boost it via TikTok Spark Ads

### Spark Ads:
Once a creator posts, request Spark Ad authorization. This lets you run their organic post as a paid ad, which gets the "organic look" benefit with paid distribution. TikTok Spark Ads outperform traditional ads by up to 50%.

---

## MONTH 2 TIMELINE

| Week | Focus | Budget |
|------|-------|--------|
| Week 5 | Scale Week 1-4 winners to $50/day. Kill all losers. | $350 |
| Week 6 | Recruit 2-3 UGC creators. Continue scaling winners. | $350 + $300 UGC |
| Week 7 | Launch UGC content as Spark Ads (TikTok) and Partnership Ads (IG). | $350 |
| Week 8 | Full analysis. Decide: more budget or pivot strategy. | $350 |

**Month 2 total: ~$1,400 + $300-$600 UGC = $1,700-$2,000**

Only spend Month 2 budget if Month 1 showed clear signal (signups, engagement, at least 1 Pro conversion).

---

## APPENDIX: UTM LINK REFERENCE

Copy-paste ready links for every creative and platform:

### Paid Ads
```
Meta V1 Walkthrough:    https://interviewanswers.ai/nurse?utm_source=meta&utm_medium=paid&utm_campaign=nursing_launch&utm_content=v1_walkthrough
Meta V2 SBAR Fear:      https://interviewanswers.ai/nurse?utm_source=meta&utm_medium=paid&utm_campaign=nursing_launch&utm_content=v2_sbar_fear
Meta S2 Specialty Grid:  https://interviewanswers.ai/nurse?utm_source=meta&utm_medium=paid&utm_campaign=nursing_launch&utm_content=s2_specialty_grid
Meta S3 Before/After:    https://interviewanswers.ai/nurse?utm_source=meta&utm_medium=paid&utm_campaign=nursing_launch&utm_content=s3_before_after
TikTok V1 Walkthrough:  https://interviewanswers.ai/nurse?utm_source=tiktok&utm_medium=paid&utm_campaign=nursing_launch&utm_content=v1_walkthrough
TikTok V2 SBAR Fear:    https://interviewanswers.ai/nurse?utm_source=tiktok&utm_medium=paid&utm_campaign=nursing_launch&utm_content=v2_sbar_fear
TikTok V4 Comedy:       https://interviewanswers.ai/nurse?utm_source=tiktok&utm_medium=paid&utm_campaign=nursing_launch&utm_content=v4_comedy
Reddit Resource Post:    https://interviewanswers.ai/nurse?utm_source=reddit&utm_medium=paid&utm_campaign=nursing_launch&utm_content=resource_post
```

### Organic Posts
```
TikTok Bio Link:        https://interviewanswers.ai/nurse?utm_source=tiktok&utm_medium=organic&utm_campaign=nursing_launch
Instagram Bio Link:     https://interviewanswers.ai/nurse?utm_source=instagram&utm_medium=organic&utm_campaign=nursing_launch
Reddit Post Link:       https://interviewanswers.ai/nurse?utm_source=reddit&utm_medium=organic&utm_campaign=nursing_launch
Facebook Group Link:    https://interviewanswers.ai/nurse?utm_source=facebook&utm_medium=organic&utm_campaign=nursing_launch
```

---

## APPENDIX: FILE REFERENCE

### Static Creatives (ready to use)
```
ads/export-nursing-ig-story-1080x1920.png     (S1: IG Story / TikTok static)
ads/export-nursing-ig-feed-1080x1080.png      (S2: IG Feed / FB Feed)
ads/export-nursing-fb-feed-1080x1350.png      (S3: FB Feed before/after)
ads/export-nursing-reddit-1200x628.png        (S4: Reddit / LinkedIn)
```

### HTML Source Files (for creating new variations)
```
ads/nursing-ig-story-sbar.html
ads/nursing-ig-feed-specialties.html
ads/nursing-fb-feed-transformation.html
ads/nursing-reddit-card.html
```

### Video Scripts
```
ads/nursing-tiktok-scripts.md                 (5 TikTok/Reels scripts with captions)
ads/RECORDING_SCRIPT.md                       (General app recording shot lists)
```

### Strategy Documents (reference only -- this document supersedes for launch)
```
ads/AD_RESEARCH.md                            (Psychology and platform research)
ads/AD_STRATEGY.md                            (General platform strategy)
ads/CREATIVE_BRIEF.md                         (General creative review package)
ads/NURSING_AD_STRATEGY.md                    (SUPERSEDED by this document)
ads/NURSING_LAUNCH_TODAY.md                   (SUPERSEDED by this document)
```

---

*This document is the single source of truth for the NurseInterviewPro.ai launch campaign. Every creative decision traces to one of the 10 research principles from AD_RESEARCH.md. Every budget decision is designed to maximize learning within a $1,000 constraint. Follow it day by day. Measure everything. Scale what works. Kill what does not.*
