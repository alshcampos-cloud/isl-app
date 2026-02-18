# Phase 3: Streaks + IRS v1

> Copy-paste this entire file as your Claude Code prompt for Phase 3.
> Read CLAUDE.md, PROTOCOLS.md, PRODUCT_ARCHITECTURE.md, and BATTLE_SCARS.md first.

## PROTOCOL
B.U.I.L.D.

## RESEARCH BASIS
Lally et al. (2010): 66-day habit formation curve, missing one day doesn't reset progress. Duolingo data: 3x daily return with active streak, +14% D14 retention from streak wagers, 2.3x engagement at 7+ day streaks.

## BUSINESS CASE
Streaks are the single most proven retention mechanic in consumer apps. IRS gives users a number to care about — like a credit score for interview readiness. Together they create the daily return trigger that compounds into habit formation. Estimated 2 weekends.

## UNIT 1: Streak Counter

Create: `src/Components/Streaks/StreakTracker.jsx`
Create: `src/utils/streakCalculator.js`

### Streak Logic
```js
export function calculateStreak(practiceHistory) {
  // practiceHistory: array of { date: ISO string, completed: boolean }
  // Returns: { currentStreak: number, longestStreak: number, freezesAvailable: number }
}
```

### Rules
- Streak increments when user completes 1+ practice session in a calendar day
- One free freeze per week (streak doesn't break if day is missed)
- Missing a day WITHOUT freeze resets streak to 0
- Growth framing ONLY — no loss/guilt messaging
- Milestones: 3, 7, 14, 30 days (celebrate each)

### Supabase Schema
```sql
-- Add to existing practice_sessions or create new table
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  freezes_used_this_week INTEGER DEFAULT 0,
  freeze_week_start DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### UI
- Small flame icon + number on home screen (next to IRS)
- Subtle confetti animation at milestone days
- "Day X of your streak" in home screen CTA for Strategic Builders
- Streak freeze: show remaining freezes, allow manual activation

## UNIT 2: IRS v1 (Interview Readiness Score)

Create: `src/utils/irsCalculator.js`
Create: `src/Components/IRS/IRSDisplay.jsx`

### Calculation
```js
export function calculateIRS(userData) {
  // Three inputs equally weighted (each 0–1, averaged, × 100):
  // 1. Session consistency: streakDays / 14, capped at 1.0
  // 2. STAR structure adherence: average AI assessment score (0–1)
  // 3. Question coverage: uniqueQuestionsAttempted / totalQuestionsInBank
  //
  // Returns: { score: number (0-100), components: { consistency, starQuality, coverage } }
}
```

### UI: Progress Ring
- Animated progress ring (500ms fill with easing curve)
- Haptic feedback on mobile when score updates
- Center-dominant on home screen
- Color: teal (#0D9488) fill on #F0F4F8 background
- Score delta shown after each session: "+3 points today"
- Growth message tied to delta: "Your STAR structure improved 23% this week"

### Supabase Schema
```sql
CREATE TABLE IF NOT EXISTS user_irs (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  current_score INTEGER DEFAULT 0,
  previous_score INTEGER DEFAULT 0,
  consistency_component DECIMAL DEFAULT 0,
  star_quality_component DECIMAL DEFAULT 0,
  coverage_component DECIMAL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## DONE CRITERIA
- [ ] Streak increments after completing a practice session
- [ ] Streak displays on home screen with flame icon
- [ ] Streak freeze works (1/week)
- [ ] Milestone celebrations at 3, 7, 14, 30 days
- [ ] IRS calculates from three components
- [ ] IRS progress ring animates on home screen
- [ ] IRS delta shows after session completion
- [ ] Both persist in Supabase (not localStorage — Battle Scar #5)
- [ ] Lighthouse check passes
- [ ] iOS Safari tested

## DO NOT
- Use localStorage for streak/IRS data (iOS Safari clears it)
- Add loss-aversion messaging ("Don't lose your streak!")
- Make leaderboards yet (Phase 4+)
- Touch existing Practice Mode logic beyond adding streak/IRS update calls
