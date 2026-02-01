# InterviewAnswers.ai - Features Documentation

## Interview Practice Modes

### 1. Live Prompter

Real-time AI assistance during actual interviews.

**How it works:**
1. Press the microphone button to start listening
2. The AI transcribes what you and the interviewer say
3. Matching questions from your template library appear as prompts
4. You see suggested talking points in real-time

**Best for:** Live video/phone interviews when you need subtle hints

**Legal Note:** You must obtain consent from the interviewer before recording. Many jurisdictions require all-party consent.

---

### 2. AI Interviewer

Practice with an AI that conducts realistic mock interviews.

**How it works:**
1. Select a question from your library or let the AI pick one
2. Record your answer using the microphone
3. The AI provides STAR-method feedback on your response
4. The AI asks intelligent follow-up questions
5. Continue the conversation until satisfied

**Features:**
- Adaptive follow-up questions based on your answers
- STAR method analysis (Situation, Task, Action, Result)
- Scoring on clarity, structure, and impact
- Conversation history preserved during session

**Best for:** Intensive practice before important interviews

---

### 3. Practice Mode

Simple record-and-review for self-paced preparation.

**How it works:**
1. Select a question from your library
2. Record your answer
3. Get immediate AI feedback with STAR analysis
4. Review your transcript and coaching notes
5. Practice again or move to the next question

**Features:**
- One-click recording
- Automatic transcription
- Instant STAR-method feedback
- Session history tracking

**Best for:** Daily practice and building answer frameworks

---

## Template Library System

### Overview

The template library contains 44 curated interview questions across 6 categories:

| Category | Questions | Focus |
|----------|-----------|-------|
| Core Interview Fundamentals | 8 | Tell me about yourself, strengths, weaknesses |
| Behavioral & STAR | 10 | Leadership, teamwork, conflict resolution |
| Leadership & Influence | 8 | Managing teams, driving change, mentoring |
| Technical & Problem-Solving | 6 | Analytical thinking, debugging, architecture |
| Career Transition | 6 | Job changes, gaps, industry switches |
| Conflict & Difficult Situations | 6 | Handling disagreements, tough decisions |

### How Templates Work

Each question includes:
- **Question text**: The actual interview question
- **Keywords**: Phrases that trigger Live Prompter matching
- **Category**: For filtering and organization

### Live Prompter Matching

When using Live Prompter, the AI matches spoken phrases to your template questions using keyword matching:

```
Question: "Tell me about a time you led a team..."
Keywords: ["led a team", "leadership", "managed people"]

If interviewer says "leadership experience", this question highlights as a match.
```

---

## Subscription Tiers

### Free Tier

| Feature | Daily Limit |
|---------|-------------|
| AI Interviewer Sessions | 5 |
| Answer Assistant Analyses | 3 |
| Live Prompter | 5 minutes |
| Practice Mode | Unlimited |
| Question Library | Full access |

### Pro Tier ($29.99/month)

| Feature | Limit |
|---------|-------|
| AI Interviewer Sessions | Unlimited |
| Answer Assistant Analyses | Unlimited |
| Live Prompter | Unlimited |
| Practice Mode | Unlimited |
| Priority Support | Yes |

### Usage Tracking

- Usage resets daily at midnight (local time)
- Dashboard shows current usage vs limits
- Upgrade prompts appear when approaching limits
- Beta users get unlimited access during testing

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Start/Stop recording (when in recording mode) |
| `Escape` | Close modals and dialogs |

---

## Audio & Recording

### Microphone Access

- Browser requests microphone permission on first use
- Permission persists for the session
- Denied permission shows helpful troubleshooting

### Recording Consent

Before using recording features, users must acknowledge:
- They have consent to record
- They will comply with local recording laws
- They understand their responsibilities

### Audio Processing

- Uses browser's Web Speech API for transcription
- Audio is processed locally (not stored)
- Only transcripts are sent to AI for analysis

---

## Settings & Data

### Settings Page Options

- **Privacy Policy**: Full legal privacy policy
- **Terms of Service**: Full legal terms
- **Contact Support**: Email link to support
- **Delete All Data**: Permanent data deletion

### Data Storage

| Data Type | Storage Location |
|-----------|------------------|
| User profile | Supabase database |
| Practice sessions | Supabase database |
| Questions | Supabase database |
| Consent status | Supabase + localStorage |
| Current view | localStorage |

### Data Deletion

Users can delete all their data through Settings:
1. Go to Settings
2. Click "Delete All Data"
3. Confirm twice
4. All practice sessions, questions, and progress are permanently removed

---

## Tutorial System

### First-Time User Experience

New users see an interactive tutorial covering:
1. Welcome and overview
2. Three practice modes explained
3. Recording tips
4. Getting the most from AI feedback

### Accessing Tutorial Later

The tutorial can be re-accessed from the Settings page.

---

## Technical Notes

### Browser Compatibility

- Chrome (recommended) - Full support
- Safari - Full support
- Firefox - Partial speech recognition support
- Edge - Full support

### Mobile Support

- iOS Safari - Full support
- Android Chrome - Full support
- Recording works in portrait and landscape

### Offline Behavior

- App requires internet connection
- Recording features need active connection
- Cached views may display without connection

---

## Coming Soon

- Export practice sessions as PDF
- Share progress reports
- Custom question creation
- Team/enterprise features
- Advanced analytics dashboard
