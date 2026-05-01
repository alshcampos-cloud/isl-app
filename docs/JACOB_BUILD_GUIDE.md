# Build Guide — InterviewAnswers Access Layer

**Audience:** Jacob Bernal
**Author:** Alsh Campos
**Created:** May 1, 2026
**Status:** Living document. Edit as you go. Send corrections back.

---

## Why this document exists

You asked for production credentials so your Koda Desktop, Koda Mobile, and The Body framework could query InterviewAnswers data. Direct shared-credential access on a personal device isn't a pattern that scales safely, and we don't have the infrastructure to do it the right way yet. Rather than gate you out, we'd rather you build that infrastructure — design the access layer, the role model, the curated views, the local dev environment, the governance docs. When you ship it, we mirror your design on production and your tooling pulls live data the same day.

This document is the build spec. It's organized into four "Builds" with twenty deliverables. Each one has:

- **WHAT** — the deliverable in one sentence
- **WHY** — what bad happens without it / what good comes from it
- **HOW** — concrete steps, tools, code examples, doc links
- **DONE WHEN** — success criteria you can verify yourself

You don't have to do all 20. Pick the ones you have energy for, in the order that makes sense to you. Builds 1 and 2 are the most important; Build 3 is shared infrastructure both of us need; Build 4 is your own existing work that you should keep moving on in parallel.

There's no deadline. Better done well than fast. When you're ready, show me what you have and we'll integrate.

---

## Build 1 — The Access Layer

The technical core. Standardizes how external code reads our database safely.

### 1. Stand up your own Supabase project

- **WHAT:** A new Supabase project on your account that you own and admin.
- **WHY:** You need a place to design the access layer where (a) mistakes don't touch production, (b) you have full admin control to experiment, (c) it can be reviewed before any of it migrates to real data. Think of it as the blueprint stage.
- **HOW:**
  - Go to https://supabase.com → New Project
  - Name: something like `ia-ops-design`
  - Region: closest to you (likely `us-west-1` or `us-east-1`)
  - Save the project URL, anon key, and service-role key in your password manager
  - Free tier limits: 500MB DB, 2GB egress/mo, 50K MAU — plenty for design
- **DONE WHEN:** You can connect via Supabase Studio (web UI), `psql` from terminal, AND from a local Python script using the Supabase client library. All three connection paths verified.

### 2. Design the schema

- **WHAT:** `CREATE TABLE` statements for the data your tooling needs to consume.
- **WHY:** Your existing Koda Desktop guesses at production table names (`users`, `events`, etc.) — that's brittle, breaks when production schemas change, and exposes you to whatever raw data structure happens to exist. Designing what the world should look like FROM YOUR TOOLING'S PERSPECTIVE produces a stable, intentional API. The right shape now prevents years of refactoring later.
- **HOW:** In Supabase Studio's SQL Editor (or in `.sql` files committed to a repo, which is better):

  ```sql
  CREATE SCHEMA IF NOT EXISTS ops;

  CREATE TABLE ops.events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id UUID,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
  );

  CREATE TABLE ops.metrics_daily (
    day DATE PRIMARY KEY,
    signups INTEGER NOT NULL DEFAULT 0,
    purchases INTEGER NOT NULL DEFAULT 0,
    revenue_cents BIGINT NOT NULL DEFAULT 0,
    mrr_cents BIGINT NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE ops.support_tickets (
    id BIGSERIAL PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('open','pending','resolved','closed')),
    classification TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    priority TEXT
    -- NOTE: no email, no body — those live in a separate sensitive_pii table
    -- that ops_external can never touch
  );

  CREATE TABLE ops.campaigns (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    spend_cents BIGINT NOT NULL DEFAULT 0,
    signups INTEGER NOT NULL DEFAULT 0,
    cac_cents BIGINT
  );
  ```

  Iterate. Add tables as needed. Be opinionated about types (`BIGINT` for money in cents, `TIMESTAMPTZ` always, `TEXT` not `VARCHAR(N)`). Separate PII columns from non-PII columns at the table level — that makes RLS easier in step 5.
- **DONE WHEN:** All draft tables exist. You can `INSERT` then `SELECT` and get expected results. PII-bearing columns are isolated to specific tables you'll lock down later.

### 3. Design the role model

- **WHAT:** A non-login Postgres role called `ops_external` that gets attached to authenticated users via JWT custom claims.
- **WHY:** Postgres has a clean separation between **roles** (permissions) and **users** (logins). Mixing them is the most common source of access-control bugs. Best practice: roles are non-login attributes, users log in as themselves and inherit role permissions. This makes "Jacob has ops_external access" a reversible attribute (revoke the claim, lose the access) rather than an identity baked into a credential.
- **HOW:**

  ```sql
  CREATE ROLE ops_external NOLOGIN;
  GRANT USAGE ON SCHEMA ops TO ops_external;
  -- Critical: NO grants on tables yet. Tables stay locked down.
  -- Grants happen only on views (see step 4).
  ```

  For Supabase Auth integration, you set this role via JWT custom claims:
  - When creating a user: `supabase.auth.signUp({ data: { role: 'ops_external' } })`
  - In Supabase, write a database function that reads `auth.jwt() ->> 'role'` and uses it to set the active role
  - Read carefully: https://supabase.com/docs/guides/auth/row-level-security#using-auth-jwt
  - The `auth.jwt()` and custom claims section is what you want
- **DONE WHEN:** You can create a Supabase Auth user, attach the `ops_external` role via custom claim, log in as that user, and `SELECT current_user;` returns `ops_external` (or shows the role is active in `current_setting('role')`).

### 4. Build the curated views (5-15 of them)

- **WHAT:** Named SQL views in an `ops_v1` schema that present sanitized, scoped data. These ARE the API.
- **WHY:** Direct table access is dangerous (over-fetch, schema drift breaks consumers, no abstraction layer). Views give you a stable contract you can evolve without breaking external consumers. The `_v1` schema name signals versioning — when you need breaking changes, create `ops_v2` and migrate consumers gradually rather than blowing up everyone at once.
- **HOW:**

  ```sql
  CREATE SCHEMA IF NOT EXISTS ops_v1;

  CREATE VIEW ops_v1.daily_metrics AS
    SELECT day, signups, purchases, revenue_cents, mrr_cents, active_users
    FROM ops.metrics_daily
    WHERE day >= CURRENT_DATE - INTERVAL '180 days';
    -- Bounded — never returns more than 180 days. Force consumers to be intentional.

  CREATE VIEW ops_v1.support_summary AS
    SELECT id, status, classification, created_at, resolved_at, priority
    -- Explicitly NOT exposing: email, body, internal_notes, customer_id
    FROM ops.support_tickets;

  CREATE VIEW ops_v1.active_campaigns AS
    SELECT name, channel, spend_cents, signups, cac_cents
    FROM ops.campaigns
    WHERE status = 'active';
    -- Excludes: campaign_id (sequence-attackable), creator email, raw_metadata

  CREATE VIEW ops_v1.recent_events AS
    SELECT event_type, occurred_at,
           jsonb_strip_nulls(metadata - 'user_email' - 'ip_address') AS metadata
    FROM ops.events
    WHERE occurred_at >= NOW() - INTERVAL '7 days';
    -- Strips PII from JSONB metadata before exposing

  GRANT SELECT ON ALL TABLES IN SCHEMA ops_v1 TO ops_external;
  ```

  Aim for 5-8 views in v1. Each one should answer ONE clear question for your tooling. If a view is doing two things, split it. **Each view is a named API endpoint** — that mental model.
- **DONE WHEN:** Every view returns expected data when queried as `ops_external`. Querying the underlying `ops.*` tables as `ops_external` returns zero rows or a permission denied error (proving views are the only path).

### 5. Write Row-Level Security policies

- **WHAT:** RLS policies on the underlying tables and views that enforce who-can-see-what at the row level, even when the SQL says `SELECT *`.
- **WHY:** GRANT statements tell Postgres "this role can SELECT from this view." RLS adds "...but only the rows that match this policy." Without RLS, a misconfigured grant exposes everything in the table. With RLS, even a buggy grant fails safe. RLS is the security floor that catches mistakes the rest of the layers miss.
- **HOW:**

  ```sql
  -- Enable RLS on every underlying table
  ALTER TABLE ops.events ENABLE ROW LEVEL SECURITY;
  ALTER TABLE ops.metrics_daily ENABLE ROW LEVEL SECURITY;
  ALTER TABLE ops.support_tickets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE ops.campaigns ENABLE ROW LEVEL SECURITY;

  -- For tables that ops_external should NEVER see directly (everything except via views):
  -- No policies = denies all by default. RLS without a permitting policy = locked down.

  -- For views, configure security_invoker so RLS runs as the calling user:
  ALTER VIEW ops_v1.daily_metrics SET (security_invoker = true);
  ALTER VIEW ops_v1.support_summary SET (security_invoker = true);
  ALTER VIEW ops_v1.active_campaigns SET (security_invoker = true);
  ALTER VIEW ops_v1.recent_events SET (security_invoker = true);
  ```

  **READ THE FOOTGUNS FIRST:** https://supabase.com/docs/guides/auth/row-level-security

  Pay special attention to:
  - Difference between `security_definer` (runs as view creator, **BYPASSES RLS**) and `security_invoker` (runs as caller, **RESPECTS RLS**)
  - The default in Postgres 15+ is `security_invoker` — but old habits and copy-pasted snippets often default to `security_definer`. Always verify.
  - Performance — RLS policies execute on every query. If a policy uses a slow function, every query is slow. Test with `EXPLAIN ANALYZE`.
- **DONE WHEN:** Validation tests (step 8) confirm `ops_external` cannot read any underlying `ops.*` table directly, can read all `ops_v1.*` views, and gets zero rows from views that should be empty for them.

### 6. Write seed data

- **WHAT:** A Python script that populates your tables with realistic-but-fake data — enough to exercise every view and every edge case.
- **WHY:** You can't validate the access layer without data flowing through it. Real data isn't an option (we're not there yet). So generate fake data that has the same shape and edge cases as production: 1000 events with realistic distributions, 100 support tickets across all statuses, NULL values where production has them, recent dates AND historical dates, deleted/archived rows, etc.
- **HOW:** Use Python's `faker` library:

  ```bash
  pip install faker psycopg2-binary
  ```

  Sketch (`seeds/dev_seed.py`):

  ```python
  import os, random, psycopg2
  from faker import Faker
  from datetime import datetime, timedelta, date

  fake = Faker()
  conn = psycopg2.connect(os.environ['SUPABASE_DB_URL'])
  cur = conn.cursor()

  # Idempotent: clean before re-seeding
  for table in ['ops.events', 'ops.metrics_daily', 'ops.support_tickets', 'ops.campaigns']:
      cur.execute(f"TRUNCATE {table} RESTART IDENTITY CASCADE")

  # Daily metrics — 180 days
  for d in range(180, 0, -1):
      day = date.today() - timedelta(days=d)
      cur.execute(
          "INSERT INTO ops.metrics_daily (day, signups, purchases, revenue_cents, mrr_cents, active_users) "
          "VALUES (%s, %s, %s, %s, %s, %s)",
          (day, random.randint(0, 50), random.randint(0, 10),
           random.randint(0, 50000), random.randint(0, 200000),
           random.randint(50, 500))
      )

  # Support tickets — all statuses, mix of priorities, mix of NULL
  for _ in range(100):
      cur.execute(
          "INSERT INTO ops.support_tickets (status, classification, created_at, priority) "
          "VALUES (%s, %s, %s, %s)",
          (random.choice(['open','pending','resolved','closed']),
           random.choice(['billing','feature_request','bug','onboarding', None]),
           fake.date_time_between(start_date='-90d'),
           random.choice(['p0','p1','p2','p3', None]))
      )

  # Events — exercise the metadata JSONB
  for _ in range(1000):
      cur.execute(
          "INSERT INTO ops.events (event_type, user_id, occurred_at, metadata) "
          "VALUES (%s, %s, %s, %s::jsonb)",
          (random.choice(['signup','purchase','login','feature_used','error']),
           fake.uuid4() if random.random() > 0.1 else None,
           fake.date_time_between(start_date='-30d'),
           '{"source":"' + fake.word() + '","user_email":"' + fake.email() + '"}')
      )

  # Campaigns
  for _ in range(20):
      cur.execute(
          "INSERT INTO ops.campaigns (name, channel, status, spend_cents, signups, cac_cents) "
          "VALUES (%s, %s, %s, %s, %s, %s)",
          (fake.catch_phrase(),
           random.choice(['google_ads','reddit','linkedin','email','organic']),
           random.choice(['active','paused','completed']),
           random.randint(0, 500000), random.randint(0, 200), random.randint(100, 10000))
      )

  conn.commit()
  conn.close()
  print("Seed complete.")
  ```

  Run it. Verify rows show up. Use `EXPLAIN ANALYZE` to confirm queries are fast.
- **DONE WHEN:** Running the script populates all tables. Querying `ops_v1.daily_metrics` returns 180 rows with reasonable values. Aggregations work. Re-running the script is idempotent (TRUNCATE at the top resets state cleanly).

### 7. Local dev environment

- **WHAT:** Docker Compose setup that runs Postgres locally, identical to your Supabase project's schema.
- **WHY:** Your Koda Desktop should default to local data, not cloud. Local dev = no internet dependency, no cost, no risk of breaking the cloud project, faster iteration. The cloud project becomes the staging environment, not the dev environment. This is the pattern every real engineering team uses.
- **HOW:** Create `dev/docker-compose.yml`:

  ```yaml
  services:
    postgres:
      image: postgres:15
      environment:
        POSTGRES_PASSWORD: dev_only_password
        POSTGRES_DB: ia_ops_dev
      ports: ["5432:5432"]
      volumes:
        - ./init.sql:/docker-entrypoint-initdb.d/01-init.sql
        - ./seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
  ```

  Put your schema + RLS + views into `dev/init.sql` (export from your Supabase project via `pg_dump --schema-only`). Put generated seed SQL into `dev/seed.sql`. Run `docker compose up`. Update Koda Desktop's `.env.example` to default to `DATABASE_URL=postgresql://postgres:dev_only_password@localhost:5432/ia_ops_dev`.
- **DONE WHEN:** A new contributor can clone your repo, run `docker compose up`, run `python ops_dashboard.py`, and see a working dashboard against local fake data — all in under 10 minutes, no cloud accounts needed.

### 8. Validation tests

- **WHAT:** Automated tests that prove the RLS / role / view setup actually denies what it should and permits what it should.
- **WHY:** Security claims that aren't tested aren't real. You write the policies once, but they need to keep working as the schema evolves. Tests catch regressions when someone (you, me, future contributor) accidentally weakens a policy six months from now.
- **HOW:** Use `pytest`. Two test users — one anonymous, one authenticated as `ops_external`. For each, assert:

  ```python
  # tests/test_access_layer.py
  import pytest
  from supabase import create_client

  @pytest.fixture
  def anon_client():
      return create_client(SUPABASE_URL, ANON_KEY)

  @pytest.fixture
  def ops_external_client():
      client = create_client(SUPABASE_URL, ANON_KEY)
      client.auth.sign_in_with_password({"email": OPS_USER_EMAIL, "password": OPS_USER_PASSWORD})
      return client

  def test_ops_external_can_read_views(ops_external_client):
      r = ops_external_client.from_('ops_v1.daily_metrics').select('*').execute()
      assert len(r.data) > 0, "ops_external should be able to read views"

  def test_ops_external_cannot_read_underlying_tables(ops_external_client):
      r = ops_external_client.from_('ops.metrics_daily').select('*').execute()
      assert r.data == [] or hasattr(r, 'error'), "ops_external should be denied at the underlying table"

  def test_ops_external_cannot_write(ops_external_client):
      r = ops_external_client.from_('ops_v1.daily_metrics').insert({
          "day": "2026-01-01", "signups": 0
      }).execute()
      assert hasattr(r, 'error') and r.error, "writes should fail"

  def test_anonymous_cannot_read_anything(anon_client):
      r = anon_client.from_('ops_v1.daily_metrics').select('*').execute()
      assert r.data == [], "anonymous should see nothing"

  def test_anonymous_cannot_read_underlying(anon_client):
      r = anon_client.from_('ops.events').select('*').execute()
      assert r.data == [], "anonymous should be denied at table level too"
  ```

  Run on every PR (set up GitHub Actions or a pre-commit hook). The test suite IS the security guarantee.
- **DONE WHEN:** Test suite covers every view × every role × (read, write, schema introspection). All green.

### 9. Document the data contract

- **WHAT:** One markdown file (`docs/OPS_V1_CONTRACT.md`) documenting every view in plain English.
- **WHY:** Code is the source of truth for what the schema IS. Docs are the source of truth for what the schema PROMISES. Consumers (you, me, future contributors) read the doc to know what they can rely on. The doc also forces you to articulate the implicit decisions you made — which is where bad choices get caught.
- **HOW:** For each view, document:
  - View name + one-sentence purpose
  - Columns returned, with types and meaning
  - Columns explicitly EXCLUDED, with reason (e.g., "user.email — PII, never expose to ops_external")
  - Refresh expectations (real-time? hourly? daily? cached?)
  - Stability commitment (e.g., "v1: column names + types stable until v2 schema introduced")
  - Known limitations
  - Example queries

  Format example:

  ```markdown
  ## ops_v1.daily_metrics

  Returns daily aggregate metrics for the past 180 days.

  **Columns:**
  | Column | Type | Meaning |
  |---|---|---|
  | day | DATE | Calendar day (UTC) |
  | signups | INTEGER | New user accounts created |
  | purchases | INTEGER | Successful purchase events |
  | revenue_cents | BIGINT | Gross revenue in USD cents |
  | mrr_cents | BIGINT | MRR snapshot at end of day, USD cents |
  | active_users | INTEGER | Distinct users with any activity |

  **Excluded:**
  - User-level breakdowns (privacy)
  - Refund-adjusted revenue (separate view planned for v2)

  **Refresh:** Updated by daily ETL at 02:00 UTC. Today's row may be partial.

  **Stability:** Column names + types stable in v1.

  **Example:**
  ```sql
  SELECT day, signups FROM ops_v1.daily_metrics WHERE day >= CURRENT_DATE - 7;
  ```
  ```
- **DONE WHEN:** A new contributor can read this doc and write working tooling against the views without ever looking at the underlying schema.

---

## Build 2 — The Governance Layer

Access without governance becomes chaos. Set the rules now while there's only one external user (you).

### 10. Onboarding playbook

- **WHAT:** A step-by-step checklist for adding the next external user to production access.
- **WHY:** The first time you add someone, every step is custom. The second time, you regret it. Skip steps 1-2; write the checklist now while it's fresh.
- **HOW:** Markdown file (`docs/ONBOARDING_OPS_USER.md`):

  ```markdown
  # Onboarding a new ops_external user

  ## Pre-requisites
  - New user has been agreed-upon (founder approves)
  - New user has a 1Password account (we'll share via 1Password)

  ## Steps

  1. Founder creates Supabase Auth user with email `<user>@<domain>.com`
     - Supabase Studio → Authentication → Users → "Invite user"
     - Add custom claim `{"role": "ops_external"}` via Auth → Users → user → Raw User Meta Data

  2. Founder generates an invite link
     - Supabase Studio → Authentication → Users → user → "Send password recovery"
     - Copy the recovery link

  3. Founder shares link via 1Password Secure Share (NOT email)
     - 1Password → Share → Set expiration to 24 hours

  4. New user opens link, sets their password (founder never sees it)

  5. New user clones the company repo
     - Founder grants GitHub repo access (read-only or read-write per role)

  6. New user copies `.env.example` to `.env`, fills in credentials:
     - SUPABASE_URL (founder shares)
     - SUPABASE_ANON_KEY (founder shares)
     - User's email + password (set in step 4)

  7. New user runs `docker compose up && python seeds/dev_seed.py`
     - Verifies local environment works against fake data

  8. New user runs their tooling against local
     - Confirms expected data shows up

  9. New user updates `.env` to point at production Supabase URL

  10. Re-runs tooling — verifies prod access works as scoped

  ## Time budget
  Aim for under 30 minutes total. If any step takes longer, the playbook needs improvement.

  ## Off-boarding
  When user leaves: Supabase Studio → Authentication → Users → user → Delete.
  Their access immediately revokes. Audit log retains their history.
  ```
- **DONE WHEN:** You can hand the doc to someone (a Claude agent? a friend?) who's never seen this project, and they get to "working dashboard" in 30 minutes without asking you a question.

### 11. Credential surface inventory

- **WHAT:** A living document listing every service we use, who has access, what level, where credentials live.
- **WHY:** You can't secure what you can't see. This is the map. When something is compromised, the inventory tells you "what else does this credential touch?" — which is what you need to know to do rotation correctly.
- **HOW:** Markdown table (`docs/CREDENTIAL_INVENTORY.md`):

  ```markdown
  # Credential Surface Inventory

  Last updated: <date>

  | Service | Account | Access Level | Credentials Location | Rotation Cadence | Last Rotated |
  |---|---|---|---|---|---|
  | Supabase | alsh@... | Owner | 1Password "IA Production" | 90 days | 2026-04-30 |
  | Vercel | alsh@... | Owner | Browser session + CLI auth | 180 days | never |
  | Stripe | alsh@... | Owner | Browser session + 2FA SMS | 90 days | never |
  | Apple Developer | alsh@... | Account Holder | Browser + 2FA TOTP | 365 days | never |
  | RevenueCat | alsh@... | Owner | Browser session | 180 days | never |
  | GitHub | alshcampos-cloud | Owner | Browser + SSH key + PAT | PAT 90 days | never |
  | Anthropic | alsh@... | Owner | API key in 1Password | 90 days | 2026-04-15 |
  | Resend | alsh@... | Owner | API key in 1Password | 90 days | unknown |
  | Tavily | alsh@... | Owner | API key in 1Password | 180 days | n/a |
  ```

  The "Last Rotated" column drives action. Anything older than the rotation cadence flags for attention.
- **DONE WHEN:** Every service in use is on the list. Locations documented (which 1Password vault, which env file). Doc lives in a private repo (the inventory itself isn't sensitive — it lists locations, not values).

### 12. Rotation procedure

- **WHAT:** Documented steps for rotating each credential when it's compromised or expires.
- **WHY:** Rotation is a high-stress operation done rarely, which means it's exactly when mistakes happen. A documented procedure removes cognitive load. Test it once on a non-critical key so you know it works.
- **HOW:** Per service, document:
  1. How to generate a new credential
  2. Order of operations (what depends on what — you can't rotate the deps before the dependents)
  3. Where to update the new value (Vercel env vars, Supabase secrets, etc.)
  4. How to verify the new credential works
  5. How to invalidate the old credential safely
  6. What downstream systems need notification

  Test the procedure ONCE on a non-critical key (the Tavily API key is a good candidate — losing it is annoying but not fatal). Confirm the playbook is correct. Commit any corrections.
- **DONE WHEN:** Rotation procedure exists for every service in step 11's inventory. One has been actually tested end-to-end.

### 13. "Hit by a bus" runbook template

- **WHAT:** A template each of us fills out, kept in 1Password, that contains everything someone would need to know to pick up our work if we suddenly couldn't.
- **WHY:** Single-person dependency is an existential risk for early-stage companies. As the team grows from 1 to N, this risk doesn't go away — it just spreads. Each team member's domain knowledge is a single point of failure unless documented. The runbook makes critical knowledge transferable.
- **HOW:** Template (`docs/HIT_BY_A_BUS_TEMPLATE.md`):

  ```markdown
  # If I'm Unavailable

  *Owner: <name>*
  *Last updated: <date>*

  ## Emergency contacts
  - <Lawyer name + phone>
  - <Accountant name + phone>
  - <Key advisor names + phones>
  - <Family / spouse contact>

  ## Where credentials live
  - 1Password vault: "<vault name>"
  - Master password recovery: <where the recovery code is stored offline>
  - 2FA backup codes: <location>

  ## Top 5 things that must keep running
  1. <e.g., production deploys to Vercel>
  2. <e.g., Stripe billing>
  3. <e.g., customer support email triage>
  4. <e.g., daily ETL job>
  5. <e.g., security alert monitoring>

  ## How to do each top-5 thing
  ### 1. <First thing>
  Step-by-step, including any gotchas:
  - ...
  - ...

  ### 2. <Second thing>
  - ...

  ## Active commitments
  - Vendors with auto-renew (and renewal dates)
  - Legal obligations
  - Customer SLAs

  ## Decision authority in my absence
  - <Who can sign contracts>
  - <Who can release money>
  - <Who's the technical decision-maker>
  ```

  Each person fills out their own copy, stores in 1Password under a "BREAK GLASS" item with sharing rules.
- **DONE WHEN:** Template exists. You've filled out yours. (Founder will fill out his when back from Omaha.)

### 14. Audit review procedure

- **WHAT:** A documented cadence for reviewing Supabase audit logs, login alerts, and unusual access patterns.
- **WHY:** Audit logs that no one reads aren't audit logs — they're storage costs. Value comes from someone actually looking at them. Even a 10-minute weekly review catches 95% of real issues at our stage.
- **HOW:** Document a weekly cadence:
  - **Monday morning (15 min):**
    - Scan Supabase Auth login attempts (any from unknown IPs?)
    - Scan Stripe activity (unfamiliar charges, refunds, login alerts?)
    - Scan Vercel deploy log (unexpected deploys?)
  - **Monthly (30 min):**
    - Review credential inventory; flag stale ones for rotation
    - Review GitHub Actions runs for failures
    - Review error rate trends
  - **On any alert:**
    - Documented escalation path
    - Who's the first responder
    - What the kill-switch looks like

  Make it a recurring calendar block. Make it boring. The point is consistency.
- **DONE WHEN:** Procedure documented. First weekly review has happened, with notes on what was found (probably nothing — that's fine).

---

## Build 3 — The Security Foundation

The shared mental model. Apply broadly.

### 15. Document the 5-layer security model

- **WHAT:** A reference doc describing how we think about security as a stack: device hygiene → credential management → access control → monitoring → recovery.
- **WHY:** Most security debates devolve because people argue across layers. Naming the layers gives shared language. "We have weak credential management" is actionable; "we should be more secure" is not.
- **HOW:** Markdown doc (`docs/SECURITY_MODEL.md`). For each layer, define:
  - What it covers
  - What "good" looks like at our current stage (1-2 people)
  - What "good" looks like at next stage (5-10 people)
  - Specific tools/processes we'll use

  Stay opinionated. "We use 1Password, not LastPass. We use YubiKey, not SMS 2FA. We move to Google Workspace SSO at 5 people." Decisions documented now save fights later.

  See "5-layer model" structure: device hygiene (your laptop) → credential management (where keys live) → access control (who can do what) → monitoring (you can tell when something's off) → recovery (when something breaks).
- **DONE WHEN:** Doc exists, both of us have read and signed off on the philosophy. Becomes the canonical reference for security debates.

### 16. Threat model for InterviewAnswers

- **WHAT:** An honest list of what we're defending against, ranked by likelihood × blast radius.
- **WHY:** Generic security posture is overkill in some places and underkill in others. The threat model focuses spend where it matters. We're a small early-stage startup, not a bank — defenses should look like one, not the other.
- **HOW:** Markdown doc (`docs/THREAT_MODEL.md`). Rank threats:

  | Threat | Likelihood | Blast radius | Priority |
  |---|---|---|---|
  | Lost/stolen laptop | Moderate | Total — has access to everything | HIGH |
  | Phishing → credential theft | Moderate | Total | HIGH |
  | Forgot password / locked out | Moderate | High — could lock out for days | HIGH |
  | Browser extension / dependency compromise | Low-moderate | Total | MEDIUM |
  | Insider threat | Very low | High — depends on access | MEDIUM (grows as team grows) |
  | Targeted attack | Very low | Total | LOW |
  | Nation-state / APT | ~zero | n/a | IGNORE |
  | DDoS / SQLi / bots | Always present | Low — handled by providers | LOW |

  Three highlighted threats are where 90% of effort should go. Theatrical defenses against unrealistic threats are a waste.
- **DONE WHEN:** Doc exists. Defenses we put in place trace back to specific threats in the model.

### 17. Device hardening checklist

- **WHAT:** A concrete checklist for hardening any laptop/phone that touches credentials.
- **WHY:** Most "security incidents" at our stage start with a compromised device. The checklist makes "is your machine reasonable?" a 30-minute audit instead of an open question.
- **HOW:** Markdown checklist (`docs/DEVICE_HARDENING.md`):

  ```markdown
  ## Device hardening checklist

  - [ ] FileVault enabled (macOS) / BitLocker enabled (Windows)
  - [ ] Find My Mac on, with remote-wipe tested
  - [ ] Auto-screen-lock < 5 minutes
  - [ ] Strong account password (not just biometric — biometric is convenience, password is security)
  - [ ] All credentials in 1Password / Bitwarden, not browser, not Notes app, not text files
  - [ ] YubiKey (or similar hardware key) on top accounts: email, GitHub, Stripe, Supabase, password manager itself
  - [ ] 2 YubiKeys (primary + backup), kept in different physical locations
  - [ ] Browser profile separation: "Admin" Chrome profile for high-stakes accounts (Stripe, Supabase, Vercel, Apple), "Personal" profile for everything else
  - [ ] No `.env` files with prod secrets sitting on disk longer than active dev session
  - [ ] Apps from official sources only (Mac App Store / signed installers)
  - [ ] Software auto-updates on
  - [ ] Backups configured and tested (Time Machine + offsite)
  - [ ] Login alerts enabled on critical accounts (email, GitHub, Stripe, Supabase)
  - [ ] Spending alerts enabled on Anthropic, Vercel, Stripe (catches both runaway costs AND credential abuse)
  ```

  Each item with the "why" written next to it.
- **DONE WHEN:** Checklist exists. You've audited your own device against it (and noted gaps). Founder will do the same.

---

## Build 4 — Your own work (parallel, no dependencies)

These are things you can do RIGHT NOW that don't wait on anything.

### 18. Persona refinement for The Body

- **WHAT:** Locked-in persona files for each of the four agents (Mr. Left, Mrs. Right, The Mouth, The Eye).
- **WHY:** You flagged them as "functional but placeholder" — placeholders attract rewriting. Locked-in personas attract refinement. Make the call now while it's fresh.
- **HOW:** For each agent's `persona.md`, write:
  - Identity (one paragraph — who is this agent)
  - Core decision rules (when does this agent push back, when does it execute, when does it escalate)
  - Voice/tone (with 2-3 example sentences in their voice)
  - Constraints (what this agent won't do)
  - Escalation paths (when does this agent hand off, to whom)
  - A one-liner test — "if I asked this agent X, what would they say?"
- **DONE WHEN:** Each persona file is ≤500 words, distinctive, ready for use without further editing.

### 19. The Body architecture brief

- **WHAT:** A formal proposal for taking The Body from your personal project to company canon.
- **WHY:** You built something real. The choice ahead — keep it personal vs. promote it to company infrastructure — is consequential. The brief surfaces the decisions that need to be made BEFORE anyone implements them.
- **HOW:** Markdown doc covering:
  - Current state and how it works
  - Multi-user implications (does each user get their own personas? shared? a mix?)
  - Hosting — local desktop only, or web app, or both?
  - Cost projections (Anthropic API spend at expected usage)
  - Persona governance (who can edit which personas?)
  - Reporting infrastructure (where do reports live, who owns them, retention)
  - Migration path from current personal-project state to company canon
  - Decision points (each one a yes/no/modify question for me)
- **DONE WHEN:** Doc exists. Specific enough that I can react with "yes / no / modify" on each decision point, not "interesting, let me think."

### 20. Self-security audit

- **WHAT:** An honest gap analysis on YOUR own setup using the Build 3 framework.
- **WHY:** You'll be writing the security playbook. The first audit should be your own — eat your own dog food. If the playbook is right, your audit produces a real to-do list. If the playbook is hand-wavy, your audit reveals it.
- **HOW:** Run yourself through items #15-17. For each item: do you have it, partially have it, not have it, what's the gap? Write it down honestly — this is for your own planning, not for performance.
- **DONE WHEN:** Audit document exists. You have a personal action list for hardening your end. You don't need to fix everything — the inventory is the deliverable.

---

## Suggested order

If you want a recommendation:

1. **First:** stand up the Supabase project (item 1) and design the schema (item 2). This unblocks everything else.
2. **Second:** local dev environment (item 7) and seed data (item 6). Now you can iterate fast.
3. **Third:** the views (item 4) and roles (item 3). Now your tooling has a real API to consume.
4. **Fourth:** validation tests (item 8) and the contract doc (item 9). Now you're confident the security holds.
5. **Fifth:** governance docs (items 10-14). Now the next contributor doesn't need you on the phone.
6. **Throughout:** Build 3 (security foundation) and Build 4 (your own work) as you have energy.

You don't have to do them in this order. Pick the path that energizes you.

---

## When you're ready

Show me what you have. We'll review together. Then I mirror your structure on the production Supabase project, run your migrations, create your real user, and your tooling pulls live data the same day.

There's no deadline. Two weeks, four weeks — your call. Better done well than fast.

---

## Questions / corrections

If anything in this doc is wrong, unclear, or you'd do differently — tell me. This is a living document. The version YOU end up with after building is the version we use going forward.
