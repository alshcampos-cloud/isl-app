# App Store Metadata — Both Apps
*Prepared: February 28, 2026*

---

## APP 1: InterviewAnswers (General)

### Basic Info
- **App Name:** InterviewAnswers
- **Subtitle:** AI Interview Coach & Practice
- **Bundle ID:** ai.interviewanswers.app
- **Category:** Education
- **Secondary Category:** Business
- **Price:** Free (with in-app purchases)

### Description
Master your interview answers with AI-powered coaching. InterviewAnswers.ai helps you practice, get feedback, and build confidence before your next job interview.

**Features:**
- AI Mock Interviewer — Practice with a realistic conversational AI interviewer that adapts to your responses
- Live Prompter — Real-time coaching during practice sessions with instant AI feedback
- STAR Method Coaching — Learn and practice the Situation-Task-Action-Result framework
- Practice Mode — Self-paced interview prep with 100+ curated questions
- Flashcard Review — Quick-review interview questions on the go
- Progress Tracking — Monitor your improvement with session history and scores
- Personalized Feedback — AI analyzes your responses for structure, specificity, confidence, and clarity

**How it works:**
1. Choose a practice mode (Mock Interview, Practice, Prompter, or Flashcards)
2. Respond to interview questions using your microphone
3. Get instant AI-powered feedback on your delivery and content
4. Track your progress and improve over time

Your speech is transcribed on-device. Only text transcripts are sent to Anthropic's Claude AI for coaching feedback. No personal identifiers are shared with third parties.

Free tier includes 5 practice sessions per month. Upgrade to Pro for unlimited access.

### Keywords
interview prep, job interview, mock interview, AI coach, STAR method, interview practice, career prep, interview questions, behavioral interview, job search

### What's New (v1.1)
- Updated to teal brand design
- Improved AI feedback quality with Anthropic's Claude
- Enhanced privacy disclosures
- External payment via Stripe (no Apple commission markup)
- Bug fixes and performance improvements

### In-App Purchases
- General 30-Day Pass: $14.99
- Pro Monthly: $29.99/month

### Privacy Policy URL
https://interviewanswers.ai/privacy

### Support URL
https://interviewanswers.ai

### Marketing URL
https://interviewanswers.ai

---

## APP 2: NurseInterviewPro (Nursing)

### Basic Info
- **App Name:** NurseInterviewPro
- **Subtitle:** Nursing Interview AI Coach
- **Bundle ID:** ai.nurseinterviewpro.app
- **Category:** Education
- **Secondary Category:** Medical
- **Price:** Free (with in-app purchases)

### Description
Land your dream nursing job with AI-powered interview coaching designed specifically for nurses. NurseInterviewPro helps you practice clinical interview questions, master SBAR communication, and build confidence for your next healthcare interview.

**Built for nurses, by healthcare professionals.**

**Features:**
- AI Mock Interviewer — Practice with a realistic nurse hiring manager that asks specialty-specific questions
- 70+ Clinically-Grounded Questions — Curated and reviewed by practicing nurses and nurse educators
- 8 Nursing Specialties — ED, ICU, OR, L&D, Pediatrics, Psych, Med-Surg, and Travel Nursing
- SBAR Communication Drills — Practice Situation-Background-Assessment-Recommendation framework
- STAR Method for Nursing — Learn to structure behavioral answers with clinical examples
- AI Coaching — Personalized feedback on your communication, not clinical accuracy
- Confidence Builder — Build your evidence file of clinical accomplishments
- Offer Negotiation Coach — Practice salary and benefits negotiation

**Clinical integrity promise:**
All interview questions are written or reviewed by qualified nurses and nurse educators. Our AI coaches your communication skills — it never generates clinical content, invents medical facts, or acts as a clinical reference. For clinical questions, we always redirect you to appropriate resources.

**How it works:**
1. Select your nursing specialty
2. Choose a practice mode (Mock Interview, Practice, SBAR Drill, or Flashcards)
3. Respond using your microphone
4. Get AI feedback on your communication structure, specificity, and confidence
5. Track your improvement over time

Your speech is transcribed on-device. Only text transcripts are sent to Anthropic's Claude AI for coaching feedback. No personal identifiers or clinical data are shared with third parties.

Free tier includes limited practice sessions. Get the Nursing Pass for full access to all specialties and features.

### Keywords
nursing interview, nurse job, SBAR, clinical interview, RN interview, healthcare career, nurse practice, NCLEX, nursing specialty, travel nurse

### What's New (v1.0)
- Launch of NurseInterviewPro
- 70+ clinically-grounded interview questions across 8 specialties
- AI-powered communication coaching with SBAR and STAR frameworks
- Confidence builder and offer negotiation coach
- External payment via Stripe

### In-App Purchases
- Nursing 30-Day Pass: $19.99

### Privacy Policy URL
https://interviewanswers.ai/privacy

### Support URL
https://nurseinterviewpro.ai

### Marketing URL
https://nurseinterviewpro.ai

---

## App Review Notes (BOTH APPS)

### For Apple Review Team:

**AI Disclosure:**
This app uses Anthropic's Claude AI (via API) to provide interview coaching feedback. The AI analyzes text transcripts of user practice responses and generates personalized feedback on communication quality (structure, clarity, specificity, confidence).

**Data Flow:**
1. User speaks into microphone
2. Speech is transcribed ON-DEVICE using Web Speech API (no audio leaves the device)
3. Text transcript is sent to our Supabase Edge Function
4. Edge Function forwards text to Anthropic's Claude API for analysis
5. AI coaching feedback is returned to the user

**No personal identifiers** (email, name, payment info) are sent to Anthropic. Audio never leaves the device. See our privacy policy for full details.

**Payment Model:**
This app uses external Stripe checkout for purchases, as permitted under the May 2025 Epic v. Apple court ruling. Users subscribe at our website and log into the app. No Apple IAP is used.

**Microphone Usage:**
Microphone access is used solely for speech-to-text transcription during interview practice sessions. The user must explicitly grant permission before any recording begins. Audio is processed on-device and never stored on external servers.

---

## Privacy Questionnaire Answers (App Store Connect)

### Data Collection
| Data Type | Collected? | Linked to User? | Used for Tracking? |
|-----------|-----------|-----------------|-------------------|
| Email Address | Yes | Yes | No |
| Name | No | — | — |
| User Content (text responses) | Yes | Yes | No |
| Audio Data | Yes (device-only) | No | No |
| Usage Data | Yes | Yes | No |
| Performance Data | Yes | Yes | No |
| Payment Info | No (handled by Stripe) | — | — |

### Third-Party SDKs
- Anthropic Claude API (AI feedback)
- Supabase (auth, database)
- Stripe (payment processing — external, not in-app)
- Capacitor (native bridge)

### Tracking
- **NSPrivacyTracking:** false
- **No ATT prompt needed** — we do not track users across apps
