# LESSONS AUDIT -- Master Compilation for IAI Agent System
# Every failure, constraint, and prevention rule from all Koda Labs projects
# Compiled: April 8, 2026

**Sources audited:**
- InterviewAnswers.AI CLAUDE.md (20 battle scars + 7 additional)
- InterviewAnswers.AI docs/BATTLE_SCARS.md (full engineering lessons)
- Baby Decoder CLAUDE.md (24 lessons, 4 unique to Baby Decoder)
- IAI Agent Coding Guide v1.0 (9 known failure modes)
- IAI Agent Spec v2 (architecture decisions, anti-patterns, open questions)

**Purpose:** The IAI Agent System must not repeat ANY of these mistakes. Each lesson includes what happened, the prevention rule, and how it specifically applies to agent code.

---

## 1. ARCHITECTURE FAILURES

### 1.1 Monolithic Component Problem
- **What happened:** App.jsx grew to 8,099 lines with ~70 useState hooks. Every change risked breaking unrelated features. A fix on line 5316 could break behavior on line 740.
- **Prevention:** Build features as separate, isolated components. Each module gets its own file. Never pile code into a single entry point.
- **Agent application:** Each agent (PM, Health Monitor, Tester, CS) has its own directory and entry point. Never merge agent logic into a shared monolith. The `/agents` directory structure already enforces this -- do not deviate. If a shared function is needed, it goes in `/agents/shared/`, not inline in an agent file.

### 1.2 State-Based Routing is Fragile
- **What happened:** Views controlled by `currentView` state instead of URL routes. Refreshing the page lost your place. Debugging was impossible -- could not link to a specific view or determine app state.
- **Prevention:** Use proper URL-based routing (React Router) from day one. Every view gets a proper URL route.
- **Agent application:** The parent dashboard must use React Router routes, not state-based view switching. Each dashboard view (health, OKRs, proposals, test results) gets its own URL. Deep-linking to a specific alert or proposal must be possible.

### 1.3 Stack Creep
- **What happened (agent coding guide):** New infrastructure was added mid-build without validation. Dependencies crept in, increasing surface area and failure modes.
- **Prevention:** The agent stack is locked: Node.js/TypeScript, Vercel serverless + cron, Supabase, Resend for email. No new infrastructure without Lucas's explicit approval.
- **Agent application:** Before importing any new package or introducing any new service, stop and flag it. The coding guide explicitly says: "Do not introduce new infrastructure not listed above without flagging it to Lucas first."

### 1.4 Opportunistic Refactoring
- **What happened (agent coding guide):** Code was changed that was not the target of the fix. Side-effect changes introduced regressions.
- **Prevention:** Scope-locked means scope-locked. Touch only what is necessary for the current task.
- **Agent application:** When fixing an agent bug or adding a feature, do not "clean up" adjacent code. The V.S.A.F.E.R.-M protocol applies to all agent code that touches anything near the live IAI product.

### 1.5 Agent Code Must Not Touch IAI Application Code
- **What happened (agent coding guide):** The boundary between agent code (`/agents`) and IAI application code (`/src`) must be absolute.
- **Prevention:** Agents read from IAI tables but never write to them. Agent code lives in `/agents`, never in `/src`. If you need to modify any file in `/src`, stop and confirm with Lucas.
- **Agent application:** This is a hard boundary. The Health Monitor reads Supabase tables. The Tester Agent runs end-to-end tests against the deployed app. Neither modifies IAI source code, database tables, or configuration.

---

## 2. STATE MANAGEMENT FAILURES

### 2.1 Context Loss Between Sessions
- **What happened:** Moving between Claude Code sessions lost all context. Had to re-explain the codebase, re-establish constraints, re-identify what was already fixed.
- **Prevention:** CLAUDE.md exists for this reason. SESSION_STATE.md must be updated at the end of every session. BATTLE_SCARS.md must be read before every session.
- **Agent application:** Every agent build session must start by reading the coding guide, SESSION_STATE.md, and BATTLE_SCARS.md. Every session must end by updating SESSION_STATE.md with current phase, last completed step, and any blockers. Skipping the session state update is explicitly listed as a known failure mode.

### 2.2 exchangeCount is 0-Indexed
- **What happened:** exchangeCount starts at 0 and increments AFTER each response. A `>= 3` check fires on the 4th user submission, not the 3rd.
- **Prevention:** Always verify off-by-one behavior in counter/index logic. Document the indexing convention.
- **Agent application:** Any agent counter logic (e.g., retry counts, polling intervals, test iteration counts) must document whether it is 0-indexed or 1-indexed. Off-by-one errors in health check polling windows could cause missed alerts or false positives.

### 2.3 Nursing previousScores Uses Averaged Scores
- **What happened:** NursingPracticeMode created `[avg, avg, avg]` instead of real per-session scores. Appeared to work but masked actual data.
- **Prevention:** Always use real data, not synthetic stand-ins, unless explicitly flagged as temporary.
- **Agent application:** When the PM Agent computes SLI values, it must use real query results, not averages, estimates, or placeholder values. If data is unavailable, report "no data" -- never fabricate a value.

---

## 3. API / INTEGRATION FAILURES

### 3.1 Edge Functions Fail Silently (40% Failure Rate)
- **What happened:** Supabase Edge Functions (AI feedback, checkout, webhooks) failed silently. 40% failure rate on question generation. Users thought things worked when they didn't.
- **Prevention:** Every API call must include: retry logic (3 attempts with 0s/1s/2s backoff), explicit error responses, console logging for every attempt, never charge usage before confirmed success.
- **Agent application:** Every agent function that calls an external service (Supabase, Stripe API, Vercel API, Claude API, Resend) must follow the retry pattern. The error handling pattern from the coding guide is mandatory:
  1. Try the operation
  2. On success: log, persist to database
  3. On failure: log error, persist failure event to database, fire alert, re-throw
  No silent failures. No empty catch blocks.

### 3.2 Charge AFTER Success, Never Before
- **What happened:** Usage counter incremented before API call. If call failed (40% of the time), user lost a credit for nothing.
- **Prevention:** Sacred pattern: check limits -> user acts -> API call with retry -> wait for success -> only then increment usage. All retries fail -> charge zero.
- **Agent application:** If the agent system ever tracks usage (e.g., API call quotas, alert counts), the same principle applies: persist the result AFTER confirmation, not before the operation. The coding guide states: "Every agent writes its output to a Supabase table before doing anything else. If the output isn't persisted, it doesn't count."

### 3.3 Stripe Webhook Silent Failures
- **What happened (agent spec):** Stripe webhooks failed without surfacing an error to the application. Payments appeared to succeed but subscriptions were never activated.
- **Prevention:** Health Monitor must check webhook delivery independently of IAI application logs. Webhook signing secret must be verified.
- **Agent application:** The Health Monitor's `stripe.ts` check must independently verify webhook delivery status via the Stripe API, not by reading IAI application logs. This is a zero-tolerance SLO.

### 3.4 Claude API False Positives
- **What happened (agent spec):** Claude Code reported a feature as working when it was not. Self-assessment was unreliable.
- **Prevention:** The Tester Agent exists specifically to replace Claude's self-assessment with deterministic end-to-end tests.
- **Agent application:** Never trust an agent's self-report that something is "working." The Tester Agent must run actual end-to-end tests against the deployed application. A passing health check does not mean the product works for users.

### 3.5 Ideal Answer Hallucination
- **What happened:** The AI generated a HIPAA/patient-data themed answer for a fintech analytics question because it saw "Stanford" and assumed healthcare context. No constraints on what facts the AI could use.
- **Prevention:** Constrain what the AI can generate. Only use facts from actual user data. Never invent context.
- **Agent application:** When the PM Agent or CS Agent generates text (proposals, email drafts, digests), it must only reference data it has actually queried. Never infer, assume, or hallucinate context. If the agent says "edge function error rate is 2.1%," that number must come from an actual database query, not an estimate.

### 3.6 Supabase SQL Editor Autocomplete Corruption
- **What happened:** Supabase SQL editor's aggressive autocomplete silently modified SQL as it was typed. Column and table names were replaced with wrong suggestions. Migrations failed with cryptic errors.
- **Prevention:** Use the Monaco API directly to inject queries. Save all migration SQL as `.sql` files in the repo. Verify tables exist with `SELECT * FROM information_schema.tables` before testing.
- **Agent application:** All agent database migrations must be saved as `.sql` files in the repository. Never rely on the Supabase SQL editor for one-off table creation. After running any migration, verify the table exists before proceeding.

### 3.7 Supabase Tables Didn't Persist
- **What happened:** Migration ran in SQL editor, got "Success," but the table was not there when the team came back. First test flow failed silently because tracking calls used try/catch with console.warn.
- **Prevention:** Always verify tables exist after migration. Save migrations as files and commit them. Re-run if the table does not exist.
- **Agent application:** Phase 1 Step 1 of the coding guide requires: "Test insert into each agent table -- confirm data persists." This is not optional. After creating agent_health_events, agent_alerts, agent_pm_reports, agent_proposals, and agent_logs, verify each one with a test insert and a subsequent SELECT.

---

## 4. DEPLOYMENT / BUILD FAILURES

### 4.1 Broke Production with Bad Deploy
- **What happened:** A bad deploy broke production. Had to `git revert` to restore the app for a beta tester.
- **Prevention:** Always know what commit you are working from. Feature branches. Always be able to revert. Never push directly to main without review.
- **Agent application:** The coding guide requires merge-gated workflow: "No direct push to main without review. PR or explicit Lucas approval." The Tester Agent exists to validate deploys automatically. No agent code change should be deployed without the Tester Agent passing.

### 4.2 Vercel Environment Variable Newline Bug
- **What happened:** Using `echo` to pipe values into `vercel env add` appended a trailing newline, breaking env vars silently.
- **Prevention:** Always use `printf 'value' | vercel env add VAR_NAME production` -- never `echo`.
- **Agent application:** When setting up agent environment variables (Supabase service role key, Resend API key, Stripe secret key), use `printf`, not `echo`. A trailing newline in an API key causes authentication failures that are extremely difficult to debug.

### 4.3 Multiple CTAs Pointing to Wrong Routes
- **What happened:** Landing page had 7 CTA buttons across 5 component files. When the onboarding route changed, only 1 of 7 was updated. Paid ad traffic skipped onboarding.
- **Prevention:** When changing a user flow entry point, grep ALL files for the old route. Landing pages scatter CTAs across navbar, hero, features, pricing, footer, and mobile sticky components.
- **Agent application:** The Tester Agent's `cta-routing.ts` test exists specifically for this. It must verify EVERY onboarding CTA routes correctly, not just the one most recently changed. This is a zero-tolerance SLO.

### 4.4 CTA Routing Regression
- **What happened (agent spec):** CTAs silently routed to `/signup` instead of `/onboarding`. Zero users converted. Nobody noticed until manual inspection.
- **Prevention:** Zero-tolerance SLO on CTA routing accuracy. Health Monitor runs funnel.ts check on every deploy. Tester Agent validates on every deploy.
- **Agent application:** This is the single most important test case. The funnel check must verify the actual routing behavior, not just that the page loads. Both the Health Monitor (continuous polling) and Tester Agent (deploy-triggered) must independently validate this.

---

## 5. TESTING FAILURES

### 5.1 Never Fix What You Can't See
- **What happened:** Multiple times, fixes were made based on partial file context. Result: syntax errors, unclosed tags, duplicate code blocks in an 8,099-line file.
- **Prevention:** Read the actual file before changing it. Do not guess. Do not assume. Use full filesystem access.
- **Agent application:** Before modifying any agent file, read it first. The coding guide reinforces this: "Always check what already exists before creating a new file or function."

### 5.2 Regression Checklists Are Non-Negotiable
- **What happened:** Fixed chart dot click handling (pointerEvents fix for iOS Safari) and almost broke desktop hover animations.
- **Prevention:** After any change, list 3-7 specific things it could break, tied to specific mechanisms (state, effect dependency, async timing, event listener lifecycle, browser quirks). No generic warnings.
- **Agent application:** After modifying any agent code, produce a regression checklist. Example: changing the Health Monitor polling interval could affect alert timing, PM Agent report accuracy, Supabase connection pool saturation, and Vercel function timeout limits.

### 5.3 One Bug/Feature at a Time
- **What happened:** Trying to fix multiple bugs simultaneously caused cascading failures. Fix for Bug A broke the context for Bug B.
- **Prevention:** Build one piece, verify it works, then build the next. The coding guide reinforces: "Work one checklist step at a time. Complete it fully before moving to the next."
- **Agent application:** Phase 1 steps have dependencies. Out-of-order builds create hidden failures. Complete Step 1 (database setup) before Step 2 (shared infrastructure) before Step 3 (Health Monitor) before Step 4 (PM Agent). Do not skip ahead.

### 5.4 Always Test Signup End-to-End After Auth Flow Changes
- **What happened:** After adding anonymous auth, fixing the email verification trap, and changing CTA routes, the full signup pipeline had 3 different entry points. Each needed separate verification. Unit testing individual components did not catch routing/auth integration failures.
- **Prevention:** After any change to auth, routing, or onboarding, run the complete signup flow in an incognito window. Every single time.
- **Agent application:** The Tester Agent must run end-to-end flows, not just individual checks. The anonymous auth test must simulate a complete new user journey, not just verify the auth endpoint responds. The coding guide states: "Always test full auth flow end-to-end, not just API availability."

### 5.5 Nursing Track Serving Wrong Content
- **What happened (agent spec):** SBAR Drill served non-clinical questions to nursing users. Erin (the clinical domain expert) caught it, not automated testing.
- **Prevention:** The Tester Agent must validate track-specific content on every deploy.
- **Agent application:** `nursing-track.ts` in the test suite must verify that nursing-specific questions are served to nursing track users AND that general users do not receive clinical content. Content validation, not just page-load validation.

---

## 6. SECURITY / AUTH FAILURES

### 6.1 Anonymous Auth Trap
- **What happened:** Anonymous users created via `signInAnonymously()` had a valid Supabase session but no email. ProtectedRoute checked email verification -- anonymous users had `email_confirmed_at: null` and no email, creating a dead-end "Verify Your Email" screen with a blank email field.
- **Prevention:** Every auth gate must explicitly handle the anonymous case. ProtectedRoute now checks `user.is_anonymous` before email verification. Guard in LandingPage prevents anonymous sessions from being treated as authenticated.
- **Agent application:** The Tester Agent's `auth-flow.ts` must test the anonymous auth path specifically. The Health Monitor must detect auth trap conditions -- any flow where a user cannot progress past auth. This is a zero-tolerance SLO.

### 6.2 Stripe Webhook Signing Secret Required
- **What happened:** Without proper signing secret verification, anyone could fake a payment event.
- **Prevention:** Webhook signing secret verification in Edge Function. Create webhook in Stripe Dashboard, get signing secret (whsec_...), set in Supabase secrets, verify signature.
- **Agent application:** The Health Monitor's Stripe check must verify webhook signing is operational, not just that webhooks are "delivered." A webhook that arrives but fails signature verification is worse than no webhook (it creates a false positive).

### 6.3 Agent Service Role Key Must Not Write to IAI Tables
- **What happened (agent coding guide):** The coding guide explicitly requires: "Confirm agent service role key cannot write to IAI user tables."
- **Prevention:** RLS policies must prevent agent writes to user-facing tables. Test this during database setup.
- **Agent application:** Phase 1 Step 1 requires verifying this. The agent service role key should have SELECT on IAI tables and full access to agent tables only. Test that an INSERT to an IAI user table fails with the agent key.

### 6.4 Baby Data is Sensitive (COPPA-Adjacent)
- **What happened (Baby Decoder):** Baby names, dates of birth, health observations, growth data are extremely sensitive personal data.
- **Prevention:** Encrypt at rest. Never share between users. Never use for training. Never expose in logs. Never transmit to third parties.
- **Agent application:** The agent system reads IAI user data (usage patterns, funnel events, auth status). It must never log PII. Agent_logs entries must not contain user emails, names, or other identifying information. Aggregate only.

---

## 7. UX / UI FAILURES

### 7.1 iOS Safari Microphone Breaks
- **What happened:** Mic worked on Chrome desktop but broke on iOS Safari. Start/stop sounds are OS-level and cannot be suppressed. Programmatic mic start silently fails without user gesture.
- **Prevention:** Keep mic session open continuously (start once, pause/resume, stop only on exit). Reinitialize fresh on each new session. Never auto-start mic. Always require explicit user tap. Guard with isListeningRef.current check.
- **Agent application:** The Tester Agent's mobile viewport tests must account for iOS Safari behavior. If agents ever surface information through a web dashboard with interactive elements, iOS Safari compatibility must be validated. Use both onClick AND onTouchStart/onTouchEnd.

### 7.2 Mic Cleanup Between Sessions
- **What happened:** Stale recognition objects broke new sessions. Ending an interview and starting a new one broke the mic.
- **Prevention:** Full cleanup sequence: stop recognition, remove event listeners, null the ref, reinitialize fresh. 100ms delay before new recognition.
- **Agent application:** Analogously, any agent that maintains persistent connections (WebSocket, long-polling, database connection pools) must properly clean up between runs. Stale connections from a previous cron invocation must not leak into the next one. Vercel serverless functions are stateless -- do not assume state persists between invocations.

### 7.3 Chart Dot Fix Almost Broke Desktop Hover
- **What happened:** Fixed pointerEvents for iOS Safari chart dots and nearly broke desktop hover animations in the process.
- **Prevention:** Regression checklists tied to specific mechanisms.
- **Agent application:** When the parent dashboard is built (Phase 3), any data visualization changes must be tested on both mobile and desktop. SLO status cards with color-coded indicators must work on touch devices.

### 7.4 Parents Are Exhausted at 3am (Baby Decoder UX)
- **What happened (Baby Decoder):** Small tap targets, complex flows, and too many steps meant exhausted parents would not use the app.
- **Prevention:** Minimum 48x48px tap targets. Maximum 2 taps to complete core action. Voice logging as primary input.
- **Agent application:** The parent dashboard (Phase 3) must be mobile-first. Lucas should be able to approve/reject a proposal with a single tap from his phone. Push notifications must link directly to the action needed. No multi-step flows for critical operations.

### 7.5 Guilt-Tripping Users
- **What happened (Baby Decoder):** Messaging like "You haven't logged in 3 days" is hostile UX. Erin flagged similar concerns about patronizing messaging in IAI ("You just need more experience").
- **Prevention:** Guide constructively. Never gatekeep. Warm re-engagement, not guilt.
- **Agent application:** If agents generate user-facing communications (CS Agent email drafts, PM Agent digests), tone must be professional and constructive. Alert messages should state facts ("Edge function error rate exceeded 2% over the past hour") not blame ("Your system is failing").

---

## 8. PROCESS / WORKFLOW FAILURES

### 8.1 String Replacement Typos
- **What happened:** Manual find-and-replace in 8,099 lines introduced wrong line ranges, missed closing brackets, duplicate paste errors.
- **Prevention:** Use proper file operations. Create new files, test them, then integrate. Do not do massive string replacements.
- **Agent application:** When modifying agent code, use exact-line edits, not bulk replacements. The E in V.S.A.F.E.R.-M requires exact-line accounting for every change.

### 8.2 Hardcoded Threshold Values
- **What happened (agent coding guide):** The potential for hardcoded SLO thresholds scattered across agent code makes recalibration impossible.
- **Prevention:** All SLO values live in `/agents/shared/slo-definitions.ts`. Never hardcode threshold values inline in agent code. Import them from the single source of truth.
- **Agent application:** This is explicitly called out in the coding guide: "Always import SLO values from slo-definitions.ts -- never hardcode thresholds." When thresholds need recalibration (planned for Day 30), only one file changes.

### 8.3 Console.log in Production
- **What happened (agent coding guide):** Console.log statements in production code are noise that obscure real issues.
- **Prevention:** Never use console.log in production code. Use the shared logger that writes to agent_logs table.
- **Agent application:** Every significant action gets a structured log entry via `/agents/shared/logger.ts`. The logger writes to the agent_logs Supabase table with agent name, level, message, and timestamp.

### 8.4 Skipping Session State Update
- **What happened (agent coding guide):** Losing continuity between sessions because SESSION_STATE.md was not updated. Next session started from scratch.
- **Prevention:** Always update SESSION_STATE.md at session end. No exceptions. The coding guide lists this as a known failure mode.
- **Agent application:** At the end of every build session: update SESSION_STATE.md with current phase, last completed step, blockers, and what the next session should start with.

### 8.5 Domain Expert Feedback Overrides Engineering
- **What happened:** Engineers built specialty matching, nursing school B2B, and hospital partnerships. Erin (clinical domain expert) cut through all of it: nurses know their specialty, schools will not buy this, hospitals are not the right customer. Weeks of engineering work discarded.
- **Prevention:** When the domain expert says no, it is no. Her concerns become constraints. Engineering analysis cannot replicate domain expertise.
- **Agent application:** The PM Agent proposes fixes. Lucas approves or rejects. The agent system never acts autonomously. Core principle from the spec: "Observe first. Propose before acting. No agent takes action on the live product without Lucas's explicit sign-off."

### 8.6 AI-Generated Clinical/Developmental Content
- **What happened:** AI confidently generates plausible-sounding clinical content that may be wrong. In the nursing context, wrong clinical information could harm patients. In Baby Decoder, wrong developmental milestones could cause parental anxiety.
- **Prevention:** THE cardinal rule across all Koda Labs products. AI coaches communication (IAI) or tracks patterns (Baby Decoder). Humans provide clinical/developmental content. No exceptions, no shortcuts, no "just this once."
- **Agent application:** The agent system monitors and reports. It does not generate clinical content, interview questions, milestone data, or any domain-specific content. If the PM Agent proposes a fix related to clinical content, it must flag it for human review explicitly.

### 8.7 Medical Redirect Must Be Instant (Baby Decoder)
- **What happened (Baby Decoder):** If the AI starts answering a medical question and THEN redirects, the parent already has a partial (potentially wrong) answer.
- **Prevention:** Medical redirect must be the FIRST sentence in the response. Not after context. Not after "that's a good question."
- **Agent application:** If the CS Agent (Phase 2) receives a support email with clinical/medical questions, the drafted response must redirect to appropriate resources FIRST, before any other content. The same pattern applies: redirect is the first sentence, then offer to help with what the product actually does.

### 8.8 Out-of-Order Build Steps
- **What happened (agent coding guide):** Phase 1 steps have dependencies. Building out of order creates hidden failures that surface later.
- **Prevention:** "Do not skip ahead. Phase 1 steps have dependencies. Out-of-order builds create hidden failures."
- **Agent application:** The Phase 1 checklist is sequential: Database Setup -> Shared Infrastructure -> Health Monitor -> PM Agent. Each step depends on the previous one. Do not build the Health Monitor before shared infrastructure (logger, alert, types) is tested.

---

## 9. APPLE APP STORE FAILURES

### 9.1 Capacitor Adds Cross-Platform Complexity
- **What happened:** App runs on web (Vercel) and as native app (Capacitor for iOS/Android). Each platform has different payment flows (Stripe web vs Apple/Google IAP).
- **Prevention:** Web first. Do not optimize for Capacitor until web is solid. Flag anything that might need native consideration.
- **Agent application:** The agent system is web-only. Phase 3 dashboard is a web application. Do not introduce Capacitor or native app considerations into the agent system. If Lucas decides to add an iOS dashboard app later, it should be scoped as a separate phase with its own constraints.

### 9.2 RevenueCat Production vs Test API Keys
- **What happened (git log):** The app shipped with test RevenueCat API keys. Had to emergency-switch to production keys (`appl_` prefix).
- **Prevention:** Always verify that production API keys are used in production builds. Test keys in development, production keys in production. Never mix them.
- **Agent application:** The Health Monitor must use production API keys for all checks. If multiple environments exist (staging, production), each must use its own set of keys. The Tester Agent should validate that production environment variables are correctly set as part of the deploy check.

### 9.3 Mobile Viewport Testing Missing
- **What happened:** Zero real device testing was done before launching ad campaigns that drove mobile traffic.
- **Prevention:** The Tester Agent includes `mobile-viewport.ts` as a critical path test. Key flows must render correctly on mobile viewport.
- **Agent application:** The Tester Agent must include mobile viewport validation. This means testing at standard mobile breakpoints (375px, 390px, 414px width), not just verifying that the page loads.

---

## CROSS-CUTTING RULES (Apply to ALL Agent Code)

These rules apply universally across all agent code. They are derived from failures across all Koda Labs projects.

1. **No silent failures.** Every error must be logged, persisted, and surfaced. Empty catch blocks are prohibited.
2. **Persist before acting.** Write results to Supabase before taking any other action. If it is not in the database, it did not happen.
3. **Read before writing.** Always read the actual file/table/state before modifying it. Never guess.
4. **One step at a time.** Complete one checklist step fully before moving to the next.
5. **Observe, propose, then act.** No agent takes autonomous action on the live product. Lucas approves.
6. **Single source of truth for thresholds.** All SLO values in slo-definitions.ts. No inline hardcoding.
7. **Structured logging only.** Use the shared logger. No console.log.
8. **Never write to IAI tables.** Agents are read-only on IAI data. Write only to agent-specific tables.
9. **Never modify /src.** Agent code lives in /agents. If you must touch /src, stop and ask Lucas.
10. **Session continuity is mandatory.** Update SESSION_STATE.md at the end of every session. Read it at the start.
11. **When uncertain, stop and ask.** A one-minute clarification prevents a two-hour rollback. This is the most important rule.

---

## KNOWN FAILURE MODES SUMMARY TABLE

| # | Failure Mode | Source | SLO Tier | Agent Responsible |
|---|-------------|--------|----------|-------------------|
| 1 | CTA routing regression | IAI production, agent spec | CRITICAL (zero tolerance) | Health Monitor + Tester |
| 2 | Anonymous auth trap | IAI production, agent spec | CRITICAL (zero tolerance) | Health Monitor + Tester |
| 3 | Silent Stripe webhook failure | IAI production, agent spec | CRITICAL (zero tolerance) | Health Monitor |
| 4 | Edge function 40% failure rate | IAI production | HIGH | Health Monitor |
| 5 | Charging before success | IAI production | HIGH | PM Agent (monitors credit system) |
| 6 | Nursing track wrong content | IAI production, agent spec | HIGH | Tester Agent |
| 7 | Claude API false positive | IAI production, agent spec | HIGH | Tester Agent (replaces self-assessment) |
| 8 | AI hallucination in answers | IAI production | HIGH | PM Agent (content quality monitoring) |
| 9 | Supabase table not persisting | IAI production | MONITOR | Health Monitor (database health) |
| 10 | iOS Safari mic/touch failures | IAI production | MONITOR | Tester Agent (mobile viewport) |
| 11 | Vercel env var newline bug | IAI production | MONITOR | Deployment checklist |
| 12 | Stack creep | Agent coding guide | PROCESS | Lucas approval gate |
| 13 | Opportunistic refactoring | Agent coding guide | PROCESS | V.S.A.F.E.R.-M protocol |
| 14 | Session state not updated | Agent coding guide | PROCESS | Session protocol |
| 15 | Out-of-order build steps | Agent coding guide | PROCESS | Phase 1 checklist |

---

*This audit covers 50+ distinct lessons from 4 Koda Labs project documents and 2 agent specification documents. Every lesson was learned through real failures, real bugs, and real user impact. The agent system exists to prevent these failures from recurring.*

*Compiled April 8, 2026 -- Koda Labs LLC*

---

## Agent System Specific (Discovered During Build)

**April 7, 2026 | Vercel serverless function bundling limitation**
- **What happened:** Agent code in `/agents/` directory couldn't be imported by Vercel serverless functions in `/api/` because Vercel's bundler only follows imports within the function's own directory tree. Static imports, dynamic imports, and `includeFiles` config all failed to resolve cross-directory TypeScript modules.
- **Prevention:** For Phase 1, deploy agent logic as Supabase Edge Functions (Deno) which already work. The `/agents/` TypeScript code serves as the canonical architecture reference. When ready for Vercel Pro or a dedicated server, the Node.js agent code can be used directly.
- **Application:** Any future agent code that needs to run on Vercel must either live within `/api/` or be deployed to a different runtime (Supabase Edge Functions, standalone server, etc.)
