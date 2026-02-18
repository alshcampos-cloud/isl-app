# Phase 2: Archetype-Detection Onboarding

> Copy-paste this entire file as your Claude Code prompt for Phase 2.
> Read CLAUDE.md, PROTOCOLS.md, PRODUCT_ARCHITECTURE.md, and BATTLE_SCARS.md first.

## PROTOCOL
B.U.I.L.D.

## RESEARCH BASIS
VR-JIT trials: Early engagement predicts employment outcomes. Nielsen Norman: 60% abandon pre-value registration. Totago: Users achieving one outcome = 5x more likely to convert.

## BUSINESS CASE
The first 2 minutes determine whether a user stays or leaves. Current onboarding is generic. Archetype detection personalizes the entire experience from Screen 1. Estimated 1 weekend.

## TASK
Build a 5-screen value-first onboarding flow that detects user archetype and delivers value BEFORE asking for signup.

## UNIT OF CHANGE
Create: `src/Components/Onboarding/ArchetypeDetection.jsx`
Create: `src/utils/archetypeRouter.js`

## THE 5-SCREEN FLOW

**Screen 1: Archetype Detection** (no signup required)
- "When is your next interview?"
  - This week / Within a month / Building long-term skills / Preparing for a specific field
- "What field are you in?"
  - General / Nursing / Technology / Healthcare / Government / Other

**Screen 2: Breathing Exercise**
- 30-second guided breath animation
- "92% of people feel interview anxiety. Let's start by taking a breath."
- Differentiates from every competitor immediately

**Screen 3: First Practice**
- One easy question with AI feedback
- Value delivered in under 2 minutes, before registration
- Use the self-efficacy feedback from Phase 1

**Screen 4: IRS Baseline**
- "Your Interview Readiness Score is 34. Here's what that means."
- Animated progress ring (0 → 34)
- Show what 75+ looks like (aspirational)

**Screen 5: Sign Up to Save**
- "Create an account to save your progress and start your 7-day free Pro trial."
- Value already demonstrated — signup preserves what they built

## ARCHETYPE ROUTING (archetypeRouter.js)

```js
export function getArchetype(answers) {
  // Returns: 'urgent_seeker' | 'strategic_builder' | 'domain_specialist'
}

export function getArchetypeConfig(archetype) {
  // Returns: { homeScreenCTA, featureEmphasis, notificationCadence, paywallTriggers }
}
```

| Archetype | Route After Onboarding | Home CTA |
|-----------|----------------------|----------|
| Urgent Seeker | Practice Mode with easy question | "Practice your top question now" |
| Strategic Builder | IRS assessment | "Start Day 1 of your Confidence Lab" |
| Domain Specialist | Track selection | "Choose your specialty track" |

## STORAGE
Store archetype in Supabase user profile. Add column: `archetype TEXT` to users table.

## DONE CRITERIA
- [ ] New users see onboarding flow
- [ ] Existing users NEVER see it
- [ ] Archetype stored in Supabase
- [ ] Home screen CTA changes based on archetype
- [ ] Breathing exercise animation works on iOS Safari
- [ ] Value delivered before signup screen
- [ ] Lighthouse check passes

## DO NOT
- Modify existing user auth flow
- Change App.jsx routing logic (add new route, don't restructure)
- Touch existing Practice Mode code
