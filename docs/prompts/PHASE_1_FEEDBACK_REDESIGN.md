# Phase 1: Self-Efficacy Feedback Redesign

> Copy-paste this entire file as your Claude Code prompt for Phase 1.
> Read CLAUDE.md, PROTOCOLS.md, PRODUCT_ARCHITECTURE.md, and BATTLE_SCARS.md first.

## PROTOCOL
B.U.I.L.D.

## RESEARCH BASIS
Huang & Mayer (2020): Combined four self-efficacy sources produce d=0.608 (skill transfer), d=0.696 (self-efficacy), d=-0.534 (anxiety reduction). Individual sources = not significant. Only the combination works.

## BUSINESS CASE
This is the highest-ROI change in the entire roadmap. It modifies existing AI feedback prompts — no new architecture, no new UI. Every user who practices gets better outcomes immediately. Estimated 1–2 weeks of evening work.

## TASK
Redesign the AI feedback system so every practice session response activates all four self-efficacy sources. This is a PROMPT change, not an architecture change.

## UNIT OF CHANGE
Create: `src/utils/selfEfficacyFeedback.js`

Export a function that takes session data and returns an enhanced system prompt.

The function signature:
```js
export function buildSelfEfficacyPrompt(sessionData) {
  // sessionData includes:
  //   - currentAnswer (string)
  //   - questionText (string)
  //   - previousScores (array of past session scores, if available)
  //   - streakDays (number)
  //   - questionsCompleted (number)
  //   - totalQuestions (number)
  //
  // Returns: string (system prompt addendum for Claude API call)
}
```

## FEEDBACK STRUCTURE (Every Response Must Include)

1. **MASTERY acknowledgment:** Compare to user's own past performance.
   - "Your Situation setup was 40% more concise than last session."
   - If no history: "You just completed your first practice — that's the hardest step."

2. **VICARIOUS reference:** Social proof without competitive comparison.
   - "Users who reach this STAR consistency level typically see their IRS climb 15+ points over the next week."

3. **VERBAL PERSUASION (growth-mindset):** Credible, specific encouragement.
   - "Interview skills improve with practice, not talent. You're building neural pathways right now."
   - NEVER generic ("Great job!"). Always reference specific observable improvement.

4. **PHYSIOLOGICAL check:** State management integrated into practice flow.
   - "Before your next question, take one deep breath. Research shows this activates your parasympathetic nervous system and improves recall."

## INTEGRATION POINT
Find the existing AI feedback call in the codebase (likely in App.jsx or AnswerAssistant.jsx). The selfEfficacyFeedback function generates a system prompt addendum — append it to the existing system prompt. Do not replace the existing feedback logic.

## DONE CRITERIA
- [ ] New file: `src/utils/selfEfficacyFeedback.js`
- [ ] Every AI feedback response includes all 4 sources
- [ ] Function handles first-time users (no history) gracefully
- [ ] No changes to existing architecture
- [ ] Lighthouse check passes (App → Sign in → Practice → Feedback → Home)
- [ ] iOS Safari tested (Battle Scar #5)

## DO NOT
- Refactor App.jsx
- Change routing or state management
- Modify the AI API call structure
- Touch Stripe, auth, or usage tracking
