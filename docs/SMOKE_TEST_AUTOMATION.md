# Smoke Test Automation

`npm run smoke` runs a 9-check pre-deploy smoke test that catches the obvious regressions in under a minute. Closes the biggest gap from `docs/DOCS_AND_REGRESSION_AUDIT_2026-05-08.md`: previously the smoke test was honor-system documentation in `SMOKE_TEST_PROTOCOL.md`. Now it's executable.

## When to run

Always:
- **Before every production deploy** (`git push origin main`, Vercel deploy, manual deploy)
- **Before merging any PR** that touches `index.html`, `.env`, `src/Components/Landing/*`, `src/Components/PricingPage.jsx`, or any pricing / Stripe / RC-related code
- **After any pricing update**, JSON-LD edit, or env-var rotation
- **When `JACOB_REPORT_TRIAGE_FRAMEWORK.md` Step 4 says to run a smoke test**

Optional but recommended:
- Before walking away for the night if anything was edited that day
- After installing a new dependency
- When CI fails and you want a faster local repro

## What `npm run smoke` automates (9 checks)

| # | Check | What it verifies | Failure mode |
|---|---|---|---|
| 1 | `npm run build` | Vite build + `scripts/inject-seo.js` complete without errors | Build broken (syntax, type, import error, SEO injection failure) |
| 2 | `GET /` | `https://www.interviewanswers.ai/` returns HTTP 200 | Site down, DNS issue, Vercel deploy broken |
| 3 | `GET /ethics` + body match | `/ethics` returns 200 AND body contains "ethics" or "Practice, not cheat" | Route 404 (most common: SPA routing regression), or page rendered but copy stripped |
| 4 | JSON-LD prices | `index.html` contains `"price": "39"`, `"19.99"`, `"149"` | Pricing edit shipped to JSON-LD that doesn't match real pricing |
| 5 | `.env` Stripe IDs | All 4 `VITE_STRIPE_*_PRICE_ID` keys present and `price_*`-formatted | `.env` rotation lost a key; copy-paste error; placeholder leaked |
| 6 | Supabase secrets | `RC_REST_API_KEY` is in `supabase secrets list` | RC sync function will fail in production (the May 8 fix-2 regression we just landed) |
| 7 | Google gtag | `index.html` has `googletagmanager.com/gtag/js?id=AW-` AND `AW-17966963623` | Conversion tracking removed; ad spend untracked |
| 8 | Deprecated terms | No `Live Prompter` / `in-ear` / `undetectable AI` strings in `src/Components/Landing/*` or `PricingPage.jsx` | Ethics-pivot regression — old "cheating tool" copy crept back in |
| 9 | `console.log` in src/ | Warns if more than 5 console.log lines (warn-only, doesn't fail) | Debug code left in production source |

Exit codes:
- `0` — all required checks passed (warnings allowed)
- `1` — one or more required checks failed; details + failed-check list printed at the bottom

Skip logic:
- Check 6 (Supabase secrets) skips gracefully if the `supabase` CLI isn't installed or you aren't logged in — install via `brew install supabase/tap/supabase` to enable.
- `SMOKE_SKIP_BUILD=1 npm run smoke` skips check 1 if you've already built recently and just want to re-run the HTTP/grep checks.

## What still requires manual smoke (NOT automated, not in scope)

These can't be automated in 30 minutes — they require real accounts, real cards, real devices, or external infrastructure. Run them by hand before launch.

| Manual check | Steps | When to run |
|---|---|---|
| Full signup flow | Visit `/`, enter a real email, click magic link, verify signed in | After any auth-related change |
| Stripe 30-day pass purchase | Real card → checkout → success → check Supabase `user_credits` table grants entitlement | After any pricing or Stripe webhook change |
| Stripe annual purchase | Same flow, $149 SKU | Same |
| Apple sandbox IAP | Build 43 in TestFlight → buy 30-day pass → verify `sync-rc-purchase` Edge Function fires + RC dashboard shows transaction | After any IAP, RC, or Edge Function change |
| Database read/write | Sign in, complete a practice session, verify session row in `practice_sessions` table | After any RLS or schema migration |

These are documented in `docs/SMOKE_TEST_PROTOCOL.md` and remain the operator's responsibility. The framework in `docs/JACOB_REPORT_TRIAGE_FRAMEWORK.md` Step 4 references all 5 manual + 9 automated paths.

## Adding a new check (contributor guide)

Each check is a self-contained section in `scripts/smoke-test.sh` between two `header "..."` lines. Pattern:

```bash
header "10/10  Your new check name"
if <test>; then
  ok "what passed"
else
  fail "what failed" "remediation hint"
fi
```

The four reporting helpers are:
- `ok "message"` — increments PASS count
- `fail "message" "hint"` — increments FAIL count, adds to failed-checks list, exit code 1
- `warn "message" "hint"` — increments WARN count, doesn't fail the run
- `skip "message" "hint"` — increments SKIP count, doesn't fail the run

**Style rules:**
- Each check should run in under 5 seconds (the whole script must stay under ~60s, build excluded)
- Don't add checks that require credentials beyond what's already on disk (`.env`, `supabase` login)
- Update the table in this doc when you add a check; bump the `1/9` numbers in the script headers
- Don't add checks that are "nice to have" — only checks that catch real regressions we've actually shipped

## How this relates to other docs

- `docs/SMOKE_TEST_PROTOCOL.md` — the original (manual) protocol; still authoritative for the manual checks
- `docs/JACOB_REPORT_TRIAGE_FRAMEWORK.md` Step 4 — calls `npm run smoke` between fixes
- `docs/DOCS_AND_REGRESSION_AUDIT_2026-05-08.md` — flagged the absence of automation as the biggest framework gap; this script is the response
- `docs/BATTLE_SCARS.md` #14 (Rollback Must Always Be Possible) and #15 (Regression Checklists Are Non-Negotiable) — the reasons this exists

Generated 2026-05-08.
