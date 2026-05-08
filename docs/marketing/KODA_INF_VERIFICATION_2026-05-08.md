# koda-inf Repository Verification — 2026-05-08

Audit of `https://github.com/jacobdev-prog/koda-inf` (cloned to `~/Downloads/koda-inf/`) against Jacob's claims in his test report and prior comms.

Total files: **23** (excluding `.git` + 5 `.gitkeep` directory placeholders). Total LOC: ~1,490 lines across SQL, Python, YAML, MD.

---

## 🟢 Headline Verdict — GREEN (with one YELLOW caveat on doc organization)

**The work is real and substantive.** SQL schema, RLS policies, views, seed script, tests, and CI are all production-quality for a v1 access layer. Security model and threat model are honestly calibrated, not security theater.

**The one caveat:** documentation organization differs from what Jacob's report likely implied. Instead of 8+ separate doc files (`SECURITY_MODEL.md`, `THREAT_MODEL.md`, `DEVICE_HARDENING.md`, `ONBOARDING_OPS_USER.md`, `AUDIT_REVIEW.md`, `HIT_BY_A_BUS_TEMPLATE.md`, `OPS_V1_CONTRACT.md`, `CREDENTIAL_INVENTORY.md`, `ROTATION_PROCEDURE.md`), there are **4 files** in a folder called `Onboard Guide/` (with space) — the first 6 topics are consolidated into a single 442-line `OPERATIONS_GUIDE.md` as numbered sections.

**Content is there. File count is half what it might have sounded like.** This is style, not substance.

**Recommendation:** Proceed with adoption. Treat Jacob as a real technical contributor — the work backs the claim. Surface the doc-organization discrepancy in the next conversation so future references match reality.

---

## File-by-File Audit

### Top-level

| File | Lines | Assessment |
|---|---:|---|
| `README.md` | 63 | ✅ Substantive. Quick-start is Windows-flavored (`venv\Scripts\activate`, `copy .env.example .env`); macOS/Linux variants are commented out. Doc table at bottom lists the 4 actual `Onboard Guide/` files. |
| `.env.example` | 12 | ✅ Clean. 6 vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` (local default works), `OPS_USER_EMAIL`, `OPS_USER_PASSWORD`. No real values. |
| `.gitignore` | 35 | ✅ Comprehensive. Covers `.env*`, `*credentials*`, `*secrets*`, `*.csv`, Python build artifacts, `__pycache__`, `venv/`, `.venv/`, `.pytest_cache`, `.coverage`, OS files (`.DS_Store`, `Thumbs.db`), IDE folders. |
| `requirements.txt` | 5 | ✅ Pinned ranges: `supabase>=2.0.0,<2.20.0`, `psycopg2-binary>=2.9.0`, `faker>=20.0.0`, `pytest>=7.0.0`, `python-dotenv>=1.0.0`. No `anthropic` SDK — that's not in scope for the access layer (separate concern). |

### `db/schema/` — SQL files

| File | Lines | Assessment |
|---|---:|---|
| `01_ops_schema.sql` | 41 | ✅ **4 tables in `ops` schema verified.** `events`, `metrics_daily`, `support_tickets`, `campaigns`. Columns match `OPS_V1_CONTRACT.md` exactly. Note line 30 explicit comment: *"email, body, internal_notes intentionally absent — PII lives elsewhere"*. |
| `02_roles.sql` | 14 | ✅ Creates `ops_external` role (NOLOGIN) idempotently via DO block + `pg_roles` check. Grants `USAGE` on `ops` schema and `SELECT` on all tables. |
| `03_views.sql` | 43 | ✅ **4 views in `ops_v1` schema verified.** `daily_metrics`, `support_summary`, `active_campaigns`, `recent_events`. All have `security_invoker = true` set. PII-strip on `recent_events` is a real `jsonb_strip_nulls(metadata - 'user_email' - 'ip_address')` operation. Both `ops_external` AND `authenticated` granted SELECT. |
| `04_rls.sql` | 31 | ✅ **RLS enabled on all 4 ops tables.** Two-policy pattern: `direct_read` for `ops_external` (always true — psycopg2 SET ROLE path), `api_read` for `authenticated` (requires JWT `app_metadata.role = 'ops_external'`). The two-path pattern is correct for the architecture. |
| `APPLY_TO_SUPABASE.sql` | 144 | ✅ Consolidated single-file version of all 4 above for one-shot Supabase Studio paste. Has extra `DROP POLICY IF EXISTS` calls so re-applies are idempotent (Postgres has no `CREATE OR REPLACE POLICY`). |

**Verbatim — the most critical bit (RLS api_read policy):**
```sql
CREATE POLICY api_read ON ops.metrics_daily    FOR SELECT TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'ops_external');
```

This is correct. `app_metadata` is admin-only in Supabase (only writable via the Admin API with the service-role key) — users cannot self-elevate. This is the core security primitive that justifies the entire architecture.

**Verbatim — view-level PII strip:**
```sql
CREATE OR REPLACE VIEW ops_v1.recent_events AS
    SELECT event_type,
           occurred_at,
           jsonb_strip_nulls(metadata - 'user_email' - 'ip_address') AS metadata
    FROM ops.events
    WHERE occurred_at >= NOW() - INTERVAL '7 days';
ALTER VIEW ops_v1.recent_events SET (security_invoker = true);
```

Two-layer defense: the view strips at query time AND `security_invoker` ensures RLS still applies through the view (so even a misconfigured view can't leak past row-level rules).

### `db/seeds/dev_seed.py` (110 lines)

✅ **Verifies all four claimed counts:**

| Claim | Verification |
|---|---|
| 180 days of metrics | Line 33: `for d in range(180, 0, -1):` ← exactly 180 iterations |
| 100 support tickets | Line 49: `for _ in range(100):` |
| 1,000 events | Line 67: `for _ in range(1000):` |
| 20 campaigns | Line 88: `for _ in range(20):` |

✅ **Idempotent** — line 30: `cur.execute(f"TRUNCATE {table} RESTART IDENTITY CASCADE")` for all 4 tables before re-seeding.

✅ **Includes intentional PII in events metadata** so the strip test has something to verify against (lines 70-71: `user_email`, `ip_address`).

### `db/migrations/`

⚠️ Empty directory (only `.gitkeep`). Expected for a v1 schema with no migrations yet — flagging as cosmetic only. README says "Future schema migrations." If you'd want to align with Supabase's own `supabase/migrations/` convention, that's a follow-up.

### `dev/docker-compose.yml` (16 lines)

✅ Postgres 15. Auto-applies schema files from `../db/schema` via the `/docker-entrypoint-initdb.d` volume mount (Postgres init-scripts pattern). Healthcheck via `pg_isready`. Default password is `dev_only_password` (clearly not production-grade — and the comment on line 5 is fine for local dev).

### `tests/test_access_layer.py` (152 lines)

✅ **10 distinct test functions** (some parameterized, expanding to 16 actual test runs).

Local-Postgres tests (always run when `DATABASE_URL` set):
1. `test_ops_external_role_exists` — checks `pg_roles`
2. `test_ops_external_can_read_view` — parameterized over 4 views = 4 runs
3. `test_ops_external_can_read_table_directly` — parameterized over 4 tables = 4 runs (with explicit comment justifying why direct table reads ARE allowed for the SET ROLE path while the API path is locked down)
4. `test_ops_external_cannot_insert_into_view` — write-attempt fails
5. `test_recent_events_strips_pii` — **the critical test** (see below)
6. `test_daily_metrics_bounded_to_180_days` — checks MIN/MAX bounds

Supabase-cloud tests (skipped unless cloud creds in env):
7. `test_ops_external_can_read_daily_metrics` — via Python client
8. `test_ops_external_can_read_underlying_table` — confirms `app_metadata.role` JWT claim works
9. `test_anonymous_cannot_read_views` — anon client gets nothing
10. `test_anonymous_cannot_read_underlying` — anon client denied at table level

**Verbatim — the PII-strip test (the one Jacob highlighted):**
```python
def test_recent_events_strips_pii(self):
    """user_email and ip_address must not appear in ops_v1.recent_events."""
    rows, err = as_ops_external("SELECT metadata FROM ops_v1.recent_events LIMIT 50")
    assert err is None, f"Could not query recent_events: {err}"
    for (metadata,) in (rows or []):
        if metadata:
            d = metadata if isinstance(metadata, dict) else json.loads(metadata)
            assert "user_email"  not in d, "user_email leaked into recent_events"
            assert "ip_address"  not in d, "ip_address leaked into recent_events"
```

This is a real test. It would FAIL if someone broke the view's `metadata - 'user_email' - 'ip_address'` operation. Jacob's claim that PII-strip is verified is honored.

### `.github/workflows/test.yml` (57 lines)

✅ Triggers on `push` AND `pull_request` to `master` branch (note: `master`, not `main`).

End-to-end CI:
1. Checkout
2. Python 3.11 setup
3. `pip install -r requirements.txt`
4. Apply all schema files via `psql` loop
5. Seed via `python db/seeds/dev_seed.py`
6. Run `pytest tests/ -v`

Supabase secrets are pulled from GitHub Actions secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPS_USER_EMAIL`, `OPS_USER_PASSWORD`) — when set, the cloud tests run too.

✅ Exact pattern of "boot Postgres → apply schema → seed → test" is what production-grade CI looks like.

### `scripts/verify_connection.py` (69 lines)

✅ Sanity check tool. Verifies (1) Supabase Python client can authenticate, (2) psycopg2 can connect to `DATABASE_URL`, (3) prompts user for manual `psql` verification step. Has graceful skips when env vars are missing. Includes Windows UTF-8 stdout fix (line 9-12).

### `scripts/create_ops_user.py` (48 lines)

✅ Creates the test user via Supabase Admin API with `app_metadata: {role: 'ops_external'}` (the very claim the RLS policies check). Generates 24-char random password. Handles "already exists" gracefully. **Important:** uses `app_metadata` NOT `user_metadata` — exactly the right thing per the security model (line 286 of OPERATIONS_GUIDE explicitly justifies this choice).

### `Onboard Guide/OPERATIONS_GUIDE.md` (442 lines — the consolidated mega-doc)

✅ **6 numbered sections covering:**

| # | Section | Content quality |
|---|---|---|
| 1 | Onboarding a New ops_external User | 10-step procedure with code snippets for each step. Time-budgeted ("under 30 minutes — if longer, fix the playbook"). |
| 2 | Device Security Checklist | 25+ checkboxes across encryption / authentication / credentials / 2FA / browser hygiene / updates. Includes audit table at the bottom (filled in row format, currently empty). |
| 3 | Security Model | **5-layer model verified.** Each layer has "Good now" + "Good at 5-10 people" framing. Layers: Device Hygiene, Credential Management, Access Control, Monitoring, Recovery. Plus a "Decisions we've made" rationale table. |
| 4 | Threat Model | **10 threats verified.** Numbered table with Likelihood × Blast Radius × Priority × Defense. Top 3 (lost laptop / phishing / forgotten password) called out as "deserve 90% of effort." Honest "what we're NOT defending against" section. |
| 5 | Audit Review Procedure | Weekly + monthly cadences. Specific log locations (Supabase Auth logs, Postgres logs, GitHub security log, Anthropic usage). Action protocol on anomaly: "Rotate first, investigate second." Has a review log table seeded with one entry. |
| 6 | If I'm Unavailable | Hit-by-a-bus runbook. Has ~6 explicit `[fill in ...]` placeholders for emergency contacts, hardware key locations, etc. **Same partially-populated state as our own draft.** |

Substantive across all 6. Not a stub. Honest about what's not yet filled in.

**Verbatim — top 3 threats:**
> 1. Lost or stolen laptop — Moderate likelihood, Total blast — HIGH priority — Defense: device encryption, remote wipe, no prod creds on disk
> 2. Phishing → credential theft — Moderate likelihood, Total blast — HIGH priority — Defense: hardware 2FA (YubiKey), 1Password autofill (won't fill on fake domains)
> 3. Forgotten password / lockout — Moderate, High blast (days of downtime) — HIGH priority — Defense: 1Password recovery codes stored offline, backup 2FA codes

### `Onboard Guide/OPS_V1_CONTRACT.md` (117 lines)

✅ **Fully documents all 4 views** with: column name, type, meaning, exclusions, refresh cadence, example query. This is the "API contract" doc and it earns the name.

Each view section has an explicit "Excluded:" line spelling out what's intentionally NOT in the view (e.g., for `support_summary`: "Customer email, message body, internal notes, customer_id (re-identifiable)"). Bottom section lists "What ops_external can never do."

### `Onboard Guide/CREDENTIAL_INVENTORY.md` (41 lines)

✅ Shape is right. Has 3 active credentials (Supabase, GitHub, Anthropic), an `ops_external` test user row, rotation notes, and a "credentials that don't exist yet" table for production credentials Lucas will need to provision (DB password, prod Supabase URL+anon key).

⚠️ **Minor:** Anthropic API key "Last Rotated" is marked `unknown` (line 16). Worth filling in.

### `Onboard Guide/ROTATION_PROCEDURE.md` (78 lines)

✅ Step-by-step rotation procedures for 5 credentials: Supabase anon key, Supabase service role key, ops_external password, GitHub PAT, Anthropic API key. Plus an "Emergency rotation" section (rotate first, investigate second).

Each procedure has 4-7 numbered steps and an Impact assessment (Low / Medium / High).

---

## Discrepancies Flagged

These are differences between what Jacob's report could have implied and what the repo actually contains. None are deal-breakers; some are stylistic, some are organizational, all should be acknowledged.

| # | Discrepancy | Type | Impact |
|---:|---|---|---|
| 1 | Folder is `Onboard Guide/` (with space), not `docs/` | Naming | Cosmetic. Windows-flavored folder naming. |
| 2 | 4 actual doc files instead of 8+ separately-named files (`SECURITY_MODEL.md`, `THREAT_MODEL.md`, `DEVICE_HARDENING.md`, `ONBOARDING_OPS_USER.md`, `AUDIT_REVIEW.md`, `HIT_BY_A_BUS_TEMPLATE.md`) | Organization | Content is all there, consolidated into `OPERATIONS_GUIDE.md` as 6 sections. If the report claimed "separate doc per concern," that's misleading. |
| 3 | `db/migrations/` is empty (only `.gitkeep`) | Cosmetic | Expected for v1 schema. Flagging because if "migrations" was claimed as a deliverable, it's an empty deliverable. |
| 4 | CI triggers on `master` branch, not `main` | Cosmetic | Default GitHub naming has been `main` for years; this is a minor signal that the repo was initialized with older defaults. Won't break anything. |
| 5 | README + OPERATIONS_GUIDE quickstart commands are Windows-flavored (`venv\Scripts\activate`, `copy .env.example .env`); macOS/Linux variants are commented out | Cross-platform | Lucas (Mac) needs to swap `\` for `/` and `copy` for `cp` in the commands. Real portability issue but trivial fix. |
| 6 | Hit-by-a-bus section (OPERATIONS_GUIDE §6) has explicit `[fill in]` placeholders for emergency contacts, hardware key locations, etc. | Population | Template is good; values aren't filled in yet. Same state as our `HIT_BY_A_BUS_LUCAS_DRAFT.md`. Don't claim "complete runbook" until populated. |
| 7 | Anthropic API "Last Rotated: unknown" in CREDENTIAL_INVENTORY | Hygiene | Trivial. Should be filled in or marked "since project inception." |
| 8 | No `anthropic` SDK in `requirements.txt` | Scope | Not actually a discrepancy — this is the access-layer repo, not the LLM-calling code. But if you expected Jacob's repo to also include LLM tooling, it doesn't. Separate concern. |

---

## Top 3 Highlights — Best Validation Evidence

1. **The RLS pattern is genuinely correct.** The two-policy model — `direct_read` for `ops_external` (used by psycopg2 with `SET ROLE`) plus `api_read` for `authenticated` (gated on JWT `app_metadata.role` claim) — is the right way to do this on Supabase. `app_metadata` is admin-only at the Supabase level, so users can't self-elevate. The `security_invoker = true` flag on every view ensures RLS still applies even when reading through the curated `ops_v1` views. This isn't security theater; this is competent infrastructure.

2. **The PII-strip is enforced at TWO layers AND tested.** Layer 1: SQL view does `metadata - 'user_email' - 'ip_address'` at query time. Layer 2: pytest reads 50 view rows and asserts both keys aren't present in any of them. If someone accidentally removed the `- 'user_email'` from the view definition, CI would catch it on the very next PR.

3. **CI is end-to-end and real.** GitHub Actions boots a fresh Postgres 15, applies all 4 schema files, runs the seed (1,300+ rows), then runs all 16 test cases. This is how you catch schema-drift regressions before they hit Supabase. Most tiny repos at this stage either have no CI or run a fake "test" that just checks `import` works. This is the real thing.

---

## Top 3 Concerns — Gaps and Weaknesses

1. **Doc organization claim vs. reality.** If Jacob's report or README ever implies 8+ separate concern-specific docs, the actual repo has 4 files with most topics consolidated. The CONTENT exists; the DISTRIBUTION across files is different. Future references should match (e.g., his hit-by-a-bus template is `OPERATIONS_GUIDE.md §6`, not a standalone file). Flag this in the next conversation so the inventory is accurate.

2. **Hit-by-a-bus runbook is structural, not populated.** Section 6 has `[fill in phone]`, `[fill in name + phone]`, `[where is the printed emergency kit stored?]`, `[where is it kept? where is the backup?]` — same kind of unfilled state as our own draft. This is fine for a template, but the report shouldn't claim "complete emergency runbook." A populated version belongs in 1Password, not in the public repo (good — Jacob notes "Keep a filled-in copy in 1Password under a 'BREAK GLASS' item").

3. **Cross-platform quickstart needs fixing for Mac users.** Lucas runs Mac; the quickstart commands are Windows-flavored. Not a security or correctness issue, but the FIRST command Lucas runs (`venv\Scripts\activate`) will fail on his shell. The macOS/Linux variants are present but commented out, so Lucas needs to swap them in. A few-minute README cleanup pass would fix this for all future Mac/Linux contributors.

---

## Recommendation

**Proceed with adoption.** Treat Jacob as a real technical contributor — the work backs the claim with verifiable evidence. The discrepancies above are organizational/cosmetic, not substantive.

**Before you move forward:**
1. Acknowledge the doc-organization difference in your next conversation with Jacob (just so future references are accurate)
2. Ask him to fill in the section 6 placeholders (`[fill in phone]` etc.) into a 1Password "BREAK GLASS" item
3. Ask him to swap the Windows-only quickstart commands for cross-platform variants in the README, OR add a "macOS/Linux" subsection
4. Compare the `OPERATIONS_GUIDE.md §6` hit-by-a-bus structure against our `HIT_BY_A_BUS_LUCAS_DRAFT.md` and merge what's better in his

The architecture decisions (5-layer security model, 10-threat ranking with priority calls, two-policy RLS, security_invoker views, PII strip at view layer + verified by test) are all calibrated. This is mid-to-senior infrastructure work, not a junior portfolio project.

---

Generated 2026-05-08 by Cowork audit pass against `~/Downloads/koda-inf/`. 23 files reviewed (excluding `.git` and 5 `.gitkeep` placeholders). ~1,490 LOC examined.
