# InterviewAnswers.AI — Creative Brief & Asset Review Package
**Date:** February 10, 2026
**Status:** All Phase 1–3 deliverables complete. Ready for review.
**Supporting Docs:** AD_RESEARCH.md (research), AD_STRATEGY.md (strategy), RECORDING_SCRIPT.md (video plan)

---

## EXECUTIVE SUMMARY

We produced 4 platform-optimized ad creatives for InterviewAnswers.AI, each grounded in advertising psychology research and tailored to its platform's best practices. Every creative decision traces back to findings in AD_RESEARCH.md.

**Core positioning:** We don't sell features. We sell the transformation from "blanking in interviews" to "walking in with confidence." Our unique differentiator is the Live Prompter — real-time coaching during actual interviews — which no competitor offers.

**Visual identity:** Purple-to-indigo gradient (#8B5CF6 → #4F46E5), gold accents (#F59E0B), purple-to-pink CTA gradient, Inter font family. This stands out in a sea of blue/white tech apps.

---

## ASSET INVENTORY

### Ad Creatives (HTML/CSS — screenshot or render to final format)

| # | File | Platform | Dimensions | Angle | Hook Type |
|---|------|----------|------------|-------|-----------|
| 1 | `v2-ig-story-loss-aversion.html` | Instagram Stories / TikTok | 1080×1920 (9:16) | Loss aversion | "You're not ready. And you can feel it." |
| 2 | `v2-ig-feed-prompter.html` | Instagram Feed | 1080×1080 (1:1) | Curiosity gap | "What if you had a coach in your ear?" |
| 3 | `v2-fb-feed-transformation.html` | Facebook Feed | 1080×1350 (4:5) | Before/After transformation | Visual pain points → wins |
| 4 | `v2-linkedin-career.html` | LinkedIn | 1200×627 (1.91:1) | Identity / professional | "Stop practicing answers. Start practicing confidence." |

### App Screenshots (from iPhone 16 Pro Simulator)

| # | File | Content | Used In |
|---|------|---------|---------|
| 1 | `ss-01-fresh.png` | Hero landing screen — "Nail Every Interview" | Available for additional creatives |
| 2 | `ss-02-dashboard-stats.png` | Logged-in dashboard — 55 Questions, 76 Sessions, Practice Modes | v2-ig-story, v2-fb-feed |
| 3 | `ss-01-home-hero.png` | Home hero (simulator frame) | Reference |

### Video Assets

| # | File | Duration | Content |
|---|------|----------|---------|
| 1 | `app-recording.mp4` | ~149s | Raw simulator screen recording |
| 2 | `app-clip-15s.mp4` | 15s | Trimmed clip of app overview |

### Strategy Documents

| # | File | Purpose |
|---|------|---------|
| 1 | `AD_RESEARCH.md` | 25,596 bytes — Full advertising research across psychology, platforms, competitors, app install best practices |
| 2 | `AD_STRATEGY.md` | 14,882 bytes — Platform-specific creative plans, hook strategies, A/B tests, success metrics |
| 3 | `RECORDING_SCRIPT.md` | 7,119 bytes — Shot-by-shot video recording plan for 4 recordings + 6 screenshots |

---

## CREATIVE-BY-CREATIVE BREAKDOWN

---

### CREATIVE 1: Instagram Story — Loss Aversion
**File:** `v2-ig-story-loss-aversion.html`
**Dimensions:** 1080×1920 (9:16 vertical)
**Also works for:** TikTok, YouTube Shorts, Facebook Stories

#### Strategy Behind It
**Research basis:** Loss aversion (Kahneman & Tversky) — losses are felt ~2x as strongly as equivalent gains. Eugene Schwartz's awareness levels place our core audience at "Problem Aware" — they know interviews are hard but haven't found a solution.

**Framework:** H.I.T. (Hook → Insight → Transfer)
- **Hook (top):** "You're not ready. And you can feel it." — Pattern interrupt using loss aversion. Viewer either objects ("yes I am") or identifies ("...yeah"). Both create engagement.
- **Insight (middle):** "That pause when you blanked? The interviewer noticed." + "Every great answer you've ever given was in the shower. After the interview." — Names the specific pain with empathy, not judgment. The shower line is relatable and slightly humorous.
- **Transfer (bottom):** Real app screenshot in phone mockup + "Start Preparing Free →" CTA + swipe-up indicator.

#### Design Decisions
- **Gold accent on emotional line:** "And you can feel it." in #F59E0B draws the eye to the emotional punch
- **Muted insight copy:** Deliberately lower contrast (55% white) — creates visual hierarchy so the hook dominates
- **Phone mockup with perspective:** Slight 3D rotation + glow creates premium feel (MasterClass-style)
- **Dashboard screenshot:** Shows real data (55 Questions, 76 Sessions) — proves the app is real and actively used
- **Swipe-up animation:** CSS keyframe animation on the arrow — catches eye in Stories format

#### A/B Tests to Run
| Test | Variant A | Variant B | Metric |
|------|-----------|-----------|--------|
| Hook text | "You're not ready" (loss aversion) | "What if your phone could coach you?" (curiosity) | 3-sec hook rate |
| CTA text | "Start Preparing Free" | "Try It Free" | CTR |
| Phone content | Dashboard screenshot | Live Prompter mockup | Install rate |

---

### CREATIVE 2: Instagram Feed — Live Prompter Demo
**File:** `v2-ig-feed-prompter.html`
**Dimensions:** 1080×1080 (1:1 square)
**Also works for:** Facebook Feed (may need 4:5 crop), Twitter/X

#### Strategy Behind It
**Research basis:** The Live Prompter is our "movie trailer moment" — the feature that makes people say "wait, it does WHAT?" Instagram Feed's 1:1 format allows a two-column layout that shows AND tells simultaneously.

**Framework:** H.I.T. adapted for visual format
- **Hook (left headline):** "What if you had a coach in your ear?" — Curiosity gap. The question forces the viewer to imagine the scenario.
- **Insight (right mockup):** A fully-built HTML/CSS mockup of the Live Prompter active session showing the question card, STAR coaching prompts, and animated "Listening..." waveform. This IS the answer to the hook question — shown, not told.
- **Transfer (left CTA):** "Try It Free" button + website URL.

#### Design Decisions
- **Two-column layout:** Left = copy + CTA, Right = product proof. This structure is proven for feed ads — the eye travels left-to-right naturally.
- **Built mockup vs. screenshot:** We built a faithful HTML/CSS replica of the Live Prompter because: (1) Screenshots were blocked by mic permissions, (2) A composed mockup is actually better for ads — perfect framing, legible text, no distracting UI chrome.
- **"LIVE" badge with pulsing green dot:** CSS animation creates urgency and emphasizes the real-time nature.
- **STAR coaching prompts visible:** Situation → Task → Action → Result — shows the methodology at a glance.
- **Animated waveform + "Listening...":** Communicates that the app is actively listening — the "wow" moment.
- **"Live Prompter" pill badge:** Top-right corner names the feature for viewers scanning quickly.

#### A/B Tests to Run
| Test | Variant A | Variant B | Metric |
|------|-----------|-----------|--------|
| Layout | Two-column (current) | Full-screen mockup with overlay text | CTR |
| Headline | "Coach in your ear?" (curiosity) | "Your phone listens. Then helps." (surprise) | 3-sec view rate |
| CTA position | Below headline (current) | Overlaid on mockup | Tap-through rate |

---

### CREATIVE 3: Facebook Feed — Before/After Transformation
**File:** `v2-fb-feed-transformation.html`
**Dimensions:** 1080×1350 (4:5 vertical)
**Also works for:** Instagram Feed (with crop), Pinterest

#### Strategy Behind It
**Research basis:** Facebook's audience skews slightly older and more deliberate than IG/TikTok. Before/after transformation is one of the highest-performing ad formats on Facebook — it creates instant contrast and a narrative arc in a single image. Research shows Facebook video gets 67.5% more clicks than static, but static before/after is the strongest single-image format.

**Framework:** Visual contrast + H.I.T.
- **Hook (Before section):** Three pain points with red X marks — "Blanking on answers mid-interview," "Rambling without structure," "Hoping you don't get asked THAT question." These are universal interview fears.
- **Insight (vs. divider + After section):** Three wins with green checkmarks — "STAR-structured responses," "Real-time coaching during interviews," "Walking in knowing you're prepared." The shift from "hoping" to "knowing" is intentional identity-level language.
- **Transfer (phone + CTA):** Real dashboard screenshot showing 55 Questions / 76 Sessions + "Start Preparing Free →" + "No credit card required."

#### Design Decisions
- **Red/green color psychology:** Red = pain/danger, green = success/safety. Instant visual understanding before reading a single word.
- **Emoji section headers:** Worried face (BEFORE) → flexed bicep (AFTER). Adds personality, breaks the "corporate ad" feel.
- **"vs." divider circle:** Creates a clear separation while connecting the two sections as a story.
- **Pain point language:** Each BEFORE item is specific and experiential ("Hoping you don't get asked THAT question") vs. generic ("Bad at interviews"). This specificity comes from AD_RESEARCH.md's finding that the best ads name the exact emotion, not the category.
- **"No credit card required":** Trust signal that reduces friction — research shows this increases CTR by 14% on freemium app ads.

#### A/B Tests to Run
| Test | Variant A | Variant B | Metric |
|------|-----------|-----------|--------|
| Format | Before/After static (current) | Video version with animated transitions | CTR + CPI |
| Pain points | Interview-specific (current) | Career-outcome focused ("Still job searching") | Install rate |
| CTA | "Start Preparing Free" | "See How It Works" | CTR |
| Trust signal | "No credit card required" | "Free for your first 5 sessions" | Conversion rate |

---

### CREATIVE 4: LinkedIn — Professional Career Growth
**File:** `v2-linkedin-career.html`
**Dimensions:** 1200×627 (1.91:1 landscape)
**Also works for:** Twitter/X link cards, blog featured images

#### Strategy Behind It
**Research basis:** LinkedIn CPCs are 3–5x higher than other platforms. The strategy is to use LinkedIn ONLY for high-intent targeting: career changers, recent job seekers, and Thought Leader Ads. The tone must be professional but not corporate — like a mentor, not a recruiter.

**Framework:** Identity-based messaging
- **Hook (headline):** "Stop practicing answers. Start practicing confidence." — This reframes the entire category. Every competitor says "practice answers." We say the goal isn't the answer — it's the confidence. This is Schwartz's "awareness shift" — moving from Solution Aware to Product Aware.
- **Body:** "AI-powered interview coaching that listens to you speak and gives real-time feedback on delivery, structure, and presence." — Factual, benefit-driven, professional tone.
- **Feature cards:** Four glass-morphism cards (Live Prompter, AI Mock Interviewer, STAR Scoring, Progress Tracking) — gives LinkedIn's information-seeking audience the feature depth they want.

#### Design Decisions
- **Two-column layout:** Headline + CTA on left, feature cards on right. LinkedIn's landscape format demands horizontal composition.
- **Glass-morphism cards:** Subtle transparency + blur creates a premium, modern SaaS feel appropriate for LinkedIn's professional audience.
- **Feature icons:** Emoji-based (microphone, robot, star, chart) — adds visual interest without requiring custom icon assets.
- **"No credit card required":** Critical on LinkedIn where the audience is more skeptical of ads.
- **No phone mockup:** LinkedIn audience cares about capability, not visual dazzle. Feature cards communicate more effectively here than a phone screenshot.

#### A/B Tests to Run
| Test | Variant A | Variant B | Metric |
|------|-----------|-----------|--------|
| Format | Static image (current) | Thought Leader Ad (personal post from founder) | CTR + engagement |
| Headline | Identity shift (current) | Pain point: "You know the answer. Your brain just freezes." | CTR |
| CTA | "Start Preparing Free" | "Learn More" (LinkedIn standard) | CTR |
| Audience | Broad professional | Job seekers + career changers only | CPI |

---

## HOW TO EXPORT FINAL AD ASSETS

Each creative is an HTML file that renders at exact platform dimensions. To produce final PNG/JPG assets:

### Method 1: Browser Screenshot (Recommended)
1. Open the HTML file in Chrome
2. Open DevTools (Cmd+Option+I) → Toggle Device Toolbar (Cmd+Shift+M)
3. Set dimensions to match the ad (e.g., 1080×1920 for IG Story)
4. Right-click → "Capture full size screenshot"
5. The exported PNG will be pixel-perfect at the intended dimensions

### Method 2: Puppeteer/Playwright Script
```bash
npx playwright screenshot --viewport-size=1080,1920 v2-ig-story-loss-aversion.html story.png
npx playwright screenshot --viewport-size=1080,1080 v2-ig-feed-prompter.html feed.png
npx playwright screenshot --viewport-size=1080,1350 v2-fb-feed-transformation.html fb.png
npx playwright screenshot --viewport-size=1200,627 v2-linkedin-career.html linkedin.png
```

### Note on Animations
The IG Feed Prompter ad has CSS animations (pulsing LIVE dot, waveform, listening text fade). For static exports, these will capture one frame. For animated versions:
- Record the HTML page as a screen recording → trim to 3–5 second loop → export as GIF or MP4
- This creates a subtle motion ad that outperforms static by 15–25% (per AD_RESEARCH.md findings)

---

## PLATFORM-SPECIFIC POSTING NOTES

### Instagram
- **Stories ad (v2-ig-story):** Upload as 1080×1920 image. Add swipe-up link to interviewanswers.ai (or App Store link post-approval). For paid: use "Install Now" CTA button.
- **Feed ad (v2-ig-feed):** Upload as 1080×1080. Primary text (≤125 chars): "Real-time coaching while you interview. Never blank on an answer again." Hashtags: #interviewprep #jobsearch #interviewtips #careeradvice
- **Reels:** Use the animated version of the IG Feed Prompter — screen-record the HTML page for a 15-second loop with the pulsing LIVE indicator and waveform.

### TikTok
- **Repurpose v2-ig-story** as a static frame, or better: create a screen-recording video version showing the app walkthrough (per RECORDING_SCRIPT.md).
- **Best format:** UGC-style screen recording with voiceover > polished static. TikTok UGC outperforms polished 3:1.
- **Sound:** Always on. Use trending audio or voiceover.
- **CTA:** "Link in bio" for organic, "Install Now" overlay for App Install campaign.

### Facebook
- **Feed ad (v2-fb-feed):** Upload as 1080×1350 (4:5). Use Flexible Creative — upload all 4 creatives + 3 headline variations + 2 primary text variations and let Meta's algorithm find winners.
- **Primary text option 1:** "AI that listens while you interview and coaches you in real-time. Try it free."
- **Primary text option 2:** "That pause when you blanked? The interviewer noticed. InterviewAnswers.AI gives you real-time coaching so you never freeze again."
- **Headlines:** "Practice Confidence, Not Just Answers" / "Real-Time Interview Coaching" / "Stop Winging Your Interviews"

### LinkedIn
- **Upload v2-linkedin as a Sponsored Content image** (1200×627).
- **Headline (≤70 chars):** "Stop Winging Your Interviews — Try AI Coaching Free"
- **Intro text:** "The problem isn't that you don't know the answer. It's that your brain freezes when it matters. InterviewAnswers.AI coaches you in real-time."
- **Better option:** Thought Leader Ad — have the founder post about interview anxiety from personal experience, attach the LinkedIn creative, boost as sponsored.

### YouTube Shorts (Phase 2)
- Adapt top-performing TikTok/Reels creative.
- 6-second bumper: Static frame of the IG Story hook text ("You're not ready.") + logo + "Try It Free."

---

## WHAT TO MEASURE & WHAT "GOOD" LOOKS LIKE

### Primary Metrics by Platform

| Platform | Metric | Target | What It Tells Us |
|----------|--------|--------|-----------------|
| **Instagram Reels** | 3-sec hook rate | > 40% | Does the hook stop scrolling? |
| **Instagram Reels** | CTR | > 1.5% | Does the creative drive action? |
| **Instagram Reels** | CPI | < $3.00 | Is it cost-efficient? |
| **Instagram Feed** | Video completion | > 25% | Does the content hold attention? |
| **TikTok** | 6-sec view rate | > 30% | Past the conversion magic mark |
| **TikTok** | CTR | > 1.0% | Good for TikTok's lower intent |
| **TikTok** | CPI | < $2.00 | TikTok's cost advantage |
| **TikTok** | Share rate | > 0.5% | Organic amplification signal |
| **Facebook** | CTR | > 1.2% | Above average for app install |
| **Facebook** | CPI | < $3.50 | Meta is pricier than TikTok |
| **Facebook** | Frequency | < 3.0 | Avoid creative fatigue |
| **Facebook** | ROAS (30-day) | > 1.0x | Break-even minimum |
| **LinkedIn** | CTR | > 0.5% | Good for LinkedIn's high CPCs |
| **LinkedIn** | CPC | < $5.00 | LinkedIn is expensive — watch closely |

### Secondary Metrics (All Platforms)
- **Install-to-signup rate:** > 50% (measures onboarding friction)
- **Day-1 retention:** > 30% (measures initial value delivery)
- **Feature usage in first session:** Which feature do ad-acquired users try first? (validates our messaging)

### Decision Framework
| Signal | Action |
|--------|--------|
| Hook rate > 40%, CTR < 1% | Hook works but CTA/landing is weak. Test new CTAs. |
| Hook rate < 30% | Hook doesn't stop scrolling. Test new hooks. |
| CTR > 2%, CPI > $5 | Creative works but audience is wrong. Tighten targeting. |
| CPI < $2, Day-1 retention < 20% | Attracting the wrong users. Qualify harder in the ad. |
| One platform CPI 2x+ others | Pause that platform. Double budget on the winner. |

---

## TESTING ROADMAP

### Week 1–2: Initial Test ($200 total)
- **Instagram ($70):** Run v2-ig-story + v2-ig-feed as 2 separate ad sets, $35 each. Broad targeting, 18–45.
- **TikTok ($70):** Run v2-ig-story (adapted) as App Install campaign. $70 to test 2–3 creative variations.
- **Facebook ($60):** Upload all 4 creatives into Flexible Creative. Let Meta optimize. $60 total.
- **Kill criteria:** After $20 spend per creative, anything with < 25% hook rate or < 0.5% CTR gets paused.

### Week 3–4: Scale Winners ($400)
- Take top 2 performers from each platform
- 2x budget on winners
- Create 2 new variations inspired by what worked (new hooks, same structure)
- Kill bottom performers entirely

### Month 2+: Expand
- **YouTube Shorts:** Adapt TikTok winners
- **LinkedIn:** Test 1 Thought Leader Ad if budget allows
- **GDN:** Set up retargeting for interviewanswers.ai visitors who didn't install
- **UGC:** Recruit 3–5 micro-creators ($150–$300/video) for TikTok Spark Ads

---

## WHAT'S NEXT (Recommended)

1. **Export final PNGs** from each HTML file using the methods above
2. **Record app walkthrough video** per RECORDING_SCRIPT.md for video ad versions
3. **Set up ad accounts** on Meta Business Suite, TikTok Ads Manager
4. **Create landing page variant** at interviewanswers.ai/try optimized for ad traffic (shorter, single CTA)
5. **Switch CTA links** from interviewanswers.ai to App Store URL once approved

---

## FILE REFERENCE (Complete)

### Current (v2 — use these)
```
ads/v2-ig-story-loss-aversion.html    # IG Story / TikTok (1080×1920)
ads/v2-ig-feed-prompter.html          # IG Feed (1080×1080)
ads/v2-fb-feed-transformation.html    # Facebook Feed (1080×1350)
ads/v2-linkedin-career.html           # LinkedIn (1200×627)
ads/ss-01-fresh.png                   # Hero screen screenshot
ads/ss-02-dashboard-stats.png         # Dashboard screenshot (used in ads)
ads/app-recording.mp4                 # Raw app recording (~149s)
ads/app-clip-15s.mp4                  # Trimmed 15s clip
ads/AD_RESEARCH.md                    # Research foundation
ads/AD_STRATEGY.md                    # Platform strategy
ads/RECORDING_SCRIPT.md               # Video recording plan
ads/CREATIVE_BRIEF.md                 # This file
```

### Deprecated (v1 — superseded by v2)
```
ads/ig-stories-loss-aversion.html     # Old IG Story
ads/ig-feed-live-prompter.html        # Old IG Feed
ads/ig-feed-real-product.html         # Old IG Feed alt
ads/linkedin-career-growth.html       # Old LinkedIn
ads/headline-variations.md            # Old headline doc
```

---

*Every creative decision traces back to AD_RESEARCH.md. Every platform choice traces back to AD_STRATEGY.md. Nothing is arbitrary.*
