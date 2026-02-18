# InterviewAnswers.AI — Product Architecture

> Distilled from the Master Strategy v2.0 for Claude Code implementation reference.
> For full research citations, see the Master Strategy document.

---

## Core Identity

InterviewAnswers.AI is a **self-efficacy engine** — not an interview prep tool.

Self-efficacy (the belief you can succeed) is the single strongest predictor of interview performance. We build belief through four scientifically-validated channels.

---

## The Four Self-Efficacy Sources

Every feature must activate one or more sources. Features that don't map to a source are distractions.

| Source | Mechanism | Product Feature | Effect Size |
|--------|-----------|-----------------|-------------|
| Mastery Experience | Success at progressively harder tasks | Practice Mode + IRS tracking | d = 0.608 (transfer) |
| Vicarious Learning | Seeing others like you succeed | Your Best Answer + Before/After | d = 0.696 (self-efficacy) |
| Verbal Persuasion | Credible encouragement | AI feedback (Supportive-Specific-Actionable) | d = -0.534 (anxiety) |
| Physiological Mgmt | Managing body's anxiety response | Breathing exercises + progressive desensitization | Combined only |

**Critical:** No individual source is effective alone. Only the combination of all four produces significant results (Huang & Mayer, 2020).

---

## Three User Archetypes

Every UX decision should reference which archetype it serves.

### The Urgent Seeker (Interview in < 14 days)
- **Emotional state:** Panicking, low self-efficacy, high urgency
- **Need:** Rescue, not education
- **Feature path:** Practice Mode → Your Best Answer → Live Prompter
- **Conversion:** First session with helpful AI feedback
- **Risk:** Churns after interview regardless

### The Strategic Builder (Weeks/months out)
- **Emotional state:** Motivated, systematic, wants visible growth
- **Need:** Structure, progression, measurable improvement
- **Feature path:** Onboarding → IRS baseline → Daily streaks → Skill tree
- **Conversion:** Progression plateaus at free tier
- **Risk:** Needs ongoing value

### The Domain Specialist (Career transition)
- **Emotional state:** Domain-confident, interview-anxious
- **Need:** Expert-validated, industry-specific content
- **Feature path:** Domain track → Specialty questions → Domain mock → Certification
- **Conversion:** Seeing their exact field represented
- **Risk:** Rejects generic content

---

## Key Metrics

| Metric | Target | Why |
|--------|--------|-----|
| North Star: WAP | Weekly Active Practitioners | Practice sessions = retention |
| D1 Retention | > 45% | First session quality |
| D7 Retention | > 30% | Streak/habit forming |
| D14 Retention | > 25% | Habit inflection point (Lally curve) |
| Free → Pro | 7% | vs 2–5% industry standard |
| Trial → Pro | 25% | Reverse trial model |
| Monthly Churn | < 5% | Value delivery |

---

## IRS (Interview Readiness Score) — v1.1 Spec

Composite 0–100. Four inputs equally weighted:
1. **Session consistency** — streak days / 14, capped at 1.0
2. **STAR structure adherence** — average AI assessment score
3. **Question coverage** — unique questions practiced / total in bank
4. **Answer preparedness** — personalized answers / total questions in bank

Answer preparedness detects whether a user's question narratives still contain
`[UPPERCASE_PLACEHOLDER]` template markers. Personalized = real content without
template brackets. Drives users to the AI Answer Coach.

Display as animated progress ring. 500ms fill animation with easing.

---

## Habit Formation (66-Day Curve)

Based on Lally et al. (2010):
- **Days 1–14:** Steepest automaticity gains. Maximum notifications, encouragement, streak reminders. Losing a user here = losing them forever.
- **Days 15–40:** Plateau risk. Gamification depth matters: leaderboards, skill trees, domain content.
- **Days 41–66+:** Automaticity. Mastery tier and certifications for long-term LTV.

Missing one day does NOT reset progress. Streak freezes are scientifically sound.

---

## Feedback Framework: Supportive-Specific-Actionable

Every AI feedback response must include all four self-efficacy sources:

1. **MASTERY:** Compare to user's own past performance. "Your Situation setup was 40% more concise than last session."
2. **VICARIOUS:** Social proof without competition. "Users who reach this consistency level typically see IRS climb 15+ points."
3. **VERBAL PERSUASION:** Growth-mindset. "Interview skills improve with practice, not talent. You're building neural pathways."
4. **PHYSIOLOGICAL:** State management prompt. "Before your next question, take one deep breath."

---

## Walled Garden Model (Nursing Track)

**AI Domain:** Communication coaching, STAR/SBAR structure, delivery feedback, pacing, filler words, confidence building
**Human Domain:** Clinical scenario accuracy, nursing terminology, EBP references, scope-of-practice
**Ethical Guardrails:** Source citations on all clinical content, AI disclaimers, quarterly advisory board review

SBAR replaces STAR for clinical communication.

---

## Color System

| Role | Hex | Rule |
|------|-----|------|
| 60% Background | #F0F4F8 | Soft blue-gray — calm |
| 30% Cards | #FFFFFF | White — clarity |
| 10% CTAs | #0D9488 | Teal — growth |
| Achievement | #D97706 | Gold |
| Success | #16A34A | Green |
| Warning | #EA580C | Orange (sparing) |
| **NEVER** | Red for CTAs | Triggers threat response |
