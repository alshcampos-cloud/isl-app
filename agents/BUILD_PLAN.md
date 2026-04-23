# IAI Agent System — Build Plan
*Phase 1 Overnight Build: April 6-7, 2026*

---

## Architecture Decisions (from spec review)

### Health Monitor Checks (5 required)
Each check follows the same pattern:
1. Perform the check
2. Log result to agent_health_events
3. If SLO breached → fire alert via alert.ts
4. Return structured CheckResult

| Check | What It Tests | How | SLO Key |
|-------|---------------|-----|---------|
| funnel.ts | CTA routing accuracy | Fetch /onboarding, verify 200 + correct content | CTA_ROUTING_ACCURACY |
| stripe.ts | Webhook delivery | Query Stripe API for recent webhook attempts, check delivery status | STRIPE_WEBHOOK_DELIVERY |
| supabase.ts | Edge function error rate | Query api_error_log for error rate in last hour | EDGE_FUNCTION_ERROR_RATE |
| vercel.ts | Build status | Query Vercel API for latest deployment status | VERCEL_DEPLOY_SUCCESS |
| claude-api.ts | API availability | Send minimal test prompt to Haiku, check response | CLAUDE_API_ERROR_RATE |

### PM Agent Components (4 required)
| Component | What It Does | Inputs | Output |
|-----------|-------------|--------|--------|
| slo-checker.ts | Reads agent_health_events, compares to SLO definitions | agent_health_events table | SLO breach list |
| okr-tracker.ts | Queries IAI + Stripe data, computes OKR KR values | user_profiles, practice_sessions, usage_tracking, Stripe API | OKR progress map |
| report-builder.ts | Assembles weekly digest from slo-checker + okr-tracker | SLO breaches + OKR progress | Full report JSON |
| proposal-engine.ts | Generates Proposal objects for Critical/High breaches | SLO breaches | Proposal records |

### API Routes (4 required for Vercel)
| Route | Purpose | Trigger |
|-------|---------|---------|
| /api/agent-cron.ts | Runs Health Monitor every 15 min, PM Agent weekly | Vercel cron |
| /api/tester-webhook.ts | Activates Tester Agent on deploy | Vercel deploy webhook |
| /api/dashboard-data.ts | Serves data to admin dashboard | Dashboard fetch |
| /api/proposals.ts | Approve/reject proposals | Dashboard action |

---

## Key Constraints (from battle scars)

1. **No writing to IAI tables** — agents are read-only on /src data
2. **No silent failures** — every error logged and surfaced
3. **SLO values from slo-definitions.ts only** — never hardcoded
4. **Fire-and-forget logging** — never block the main check flow
5. **Deduplication** — same alert not fired twice within 60 min
6. **Service role key** — agents use SUPABASE_SERVICE_ROLE_KEY, not anon key
7. **TypeScript** — all agent code is TypeScript
8. **Error pattern** — try/catch with explicit logging on both success and failure

---

## Build Order (overnight)

1. ✅ Step 1 — Database tables (DONE)
2. 🔄 Step 2 — Shared infrastructure (agent building)
3. ⏳ Step 3 — Health Monitor (5 checks + orchestrator)
4. ⏳ Step 4 — PM Agent (4 components + orchestrator)
5. ⏳ Step 5 — API routes (4 Vercel endpoints)
6. ⏳ Step 6 — Deploy + verify
7. ⏳ Step 7 — Update SESSION_STATE.md + BATTLE_SCARS.md
