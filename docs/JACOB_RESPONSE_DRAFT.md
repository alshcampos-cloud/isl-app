# Jacob Response — Draft for Review

**Drafted:** Late night Apr 30 / early May 1, 2026 (founder up against Omaha flight)
**Status:** NOT SENT. Founder review + edit before sending.
**Recommended timing:** Edit at the airport tomorrow morning, send before boarding. Jacob gets it Friday morning, has 60 hours of clarity instead of waiting.

---

## Strategic shift this draft captures

Tonight's realization: **Jacob's not asking for credentials — he's asking to do meaningful work.** The thing blocking him isn't access; it's that we don't have the infrastructure for safe access yet. Rather than gate him out, give him ownership of building the infrastructure itself. He uses his own Supabase project, designs the access layer his way, builds it on his terms. When ready, founder mirrors his design on the production Supabase project, runs his migrations, creates his real user. The integration step is fast because Jacob already designed the structure.

Reframes:
- Credentials → infrastructure ownership
- "Wait until we figure it out" → "you figure it out, on your timeline"
- "Here's a small task" → "build the layer that makes the team scale"

This is also the right org chart. Co-builders construct systems together. Contractors request access from founders. Jacob's work pattern + ambition reads as co-builder, which surfaces the equity/scope conversation that's overdue.

---

## The message — copy/paste/edit in Gmail

> Subject: Re: Report for April 29th 2026
>
> Jacob —
>
> You've been asking for access and to do more. Here's the real picture.
>
> What I've been doing as a solo founder — credentials in CLI tools, browser sessions, env files on my MacBook — works for one person accepting the risk on their own behalf. It doesn't scale to two. **We don't have the infrastructure for safe access yet, and that's the actual blocker.** Not trust, not approval — infrastructure.
>
> So instead of dragging this out: **build the infrastructure that makes safe access possible. You're the right person for it.**
>
> Below is what needs to exist before we can responsibly add anyone (you, future contributors, future hires) with production access. None of it requires anything from me. All of it can be built on your own Supabase free-tier project, your own machine, your own timeline. When you're ready, I mirror your design on the production project and your tooling pulls live data the same day.
>
> Format for each item: **WHAT** you're building, **WHY** it matters, **HOW** to build it, **DONE WHEN** you can confirm it works.
>
> ---
>
> ## Build 1 — The Access Layer
>
> The technical core. Standardizes how any external code reads our database safely.
>
> ### 1. Stand up your own Supabase project
>
> - **What:** A new Supabase project on your account that you own and admin.
> - **Why:** You need a place to design the access layer where (a) mistakes don't touch production, (b) you have full admin control to experiment, (c) I can review your work before anything migrates to our real data. Think of it as the blueprint stage.
> - **How:** Go to https://supabase.com → New Project. Name it something like `ia-ops-design`. Pick the closest region (likely `us-west-1` or `us-east-1`). Save the project URL, anon key, and service-role key in your password manager — you'll need them. Free tier: 500MB DB, 2GB egress/mo, 50K monthly active users. More than enough for design work.
> - **Done when:** You can connect via Supabase Studio (the web UI), `psql`, AND from a local Python script using the Supabase client library. All three connection paths verified.
>
> ### 2. Design the schema
>
> - **What:** `CREATE TABLE` statements for the data your tooling needs to consume.
> - **Why:** Your existing Koda Desktop guesses at production table names. Don't replicate my schema (it evolved organically and is messy in places). Design what the world looks like from your tooling's perspective. The right shape now prevents years of refactoring later. This is also where you discover what you ACTUALLY need versus what you thought you needed — you'll cut some columns and add others.
> - **How:** Write SQL in the Supabase Studio SQL Editor (or in `.sql` files committed to a repo, which is better). Start with the entities your Koda Desktop currently queries — events, metrics, tickets, campaigns, content, alerts. Sketch:
>   ```sql
>   CREATE SCHEMA IF NOT EXISTS ops;
>
>   CREATE TABLE ops.events (
>     id BIGSERIAL PRIMARY KEY,
>     event_type TEXT NOT NULL,
>     user_id UUID,
>     occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
>     metadata JSONB
>   );
>
>   CREATE TABLE ops.metrics_daily (
>     day DATE PRIMARY KEY,
>     signups INTEGER NOT NULL DEFAULT 0,
>     purchases INTEGER NOT NULL DEFAULT 0,
>     revenue_cents BIGINT NOT NULL DEFAULT 0,
>     mrr_cents BIGINT NOT NULL DEFAULT 0,
>     active_users INTEGER NOT NULL DEFAULT 0
>   );
>
>   CREATE TABLE ops.support_tickets (
>     id BIGSERIAL PRIMARY KEY,
>     status TEXT NOT NULL CHECK (status IN ('open','pending','resolved','closed')),
>     classification TEXT,
>     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
>     resolved_at TIMESTAMPTZ,
>     -- Note: no email, no body — those live in a separate sensitive_pii table
>     -- that ops_external can never touch
>     priority TEXT
>   );
>   ```
>   Iterate. Add tables as needed. Be opinionated about types and constraints.
> - **Done when:** All draft tables exist in your project. You can run `INSERT` then `SELECT` and get expected results. You've separated PII-bearing columns into their own tables (or excluded them entirely from views — see #4).
>
> ### 3. Design the role model
>
> - **What:** A non-login Postgres role called `ops_external` that gets attached to authenticated users via JWT custom claims.
> - **Why:** Postgres has the concept of "roles" (permissions) and "users" (logins). Mixing them is the most common source of access-control bugs. Best practice: roles are non-login attributes, users login as themselves and inherit role permissions. This makes "Jacob has ops_external access" a reversible attribute, not an identity baked into a credential.
> - **How:** In your project's SQL editor:
>   ```sql
>   CREATE ROLE ops_external NOLOGIN;
>   GRANT USAGE ON SCHEMA ops TO ops_external;
>   -- Important: NO grants on tables yet. Tables stay locked down.
>   -- Grants happen only on views (see #4).
>   ```
>   For Supabase Auth integration, you set this role via JWT custom claims when a user logs in. The Supabase docs for `supabase.auth.signUp({ data: { role: 'ops_external' } })` plus a database function that reads `auth.jwt()->>'role'` is the standard pattern. Read https://supabase.com/docs/guides/auth/row-level-security carefully — the section on `auth.jwt()` and custom claims is what you want.
> - **Done when:** You can create a Supabase Auth user, attach the `ops_external` role via custom claim, log in as that user, and `SELECT current_user;` returns `ops_external`.
>
> ### 4. Build the curated views (5-15 of them)
>
> - **What:** Named SQL views in an `ops_v1` schema that present sanitized, scoped data. These ARE the API.
> - **Why:** Direct table access is dangerous (over-fetch, schema drift breaks consumers, no abstraction layer). Views give you a stable contract you can evolve without breaking external consumers. The `_v1` schema name signals versioning — when you need breaking changes, you create `ops_v2` and migrate consumers gradually.
> - **How:** In your SQL editor:
>   ```sql
>   CREATE SCHEMA IF NOT EXISTS ops_v1;
>
>   CREATE VIEW ops_v1.daily_metrics AS
>     SELECT day, signups, purchases, revenue_cents, mrr_cents, active_users
>     FROM ops.metrics_daily
>     WHERE day >= CURRENT_DATE - INTERVAL '180 days';
>     -- Bounded — never returns more than 180 days. Force consumers to be intentional.
>
>   CREATE VIEW ops_v1.support_summary AS
>     SELECT id, status, classification, created_at, resolved_at, priority
>     -- Explicitly NOT exposing: email, body, internal_notes, customer_id
>     FROM ops.support_tickets;
>
>   CREATE VIEW ops_v1.active_campaigns AS
>     SELECT name, channel, spend_cents, signups, cac_cents
>     FROM ops.campaigns
>     WHERE status = 'active';
>     -- Excludes: campaign_id (sequence-attackable), creator email, raw_metadata
>
>   GRANT SELECT ON ALL TABLES IN SCHEMA ops_v1 TO ops_external;
>   ```
>   Aim for 5-8 views in v1. Each one should answer ONE clear question for your tooling. If a view is doing two things, split it.
> - **Done when:** Every view has been queried as `ops_external` and returns expected data. Every view has been queried as `ops_external` against the underlying `ops.*` tables and DENIES access (proving the views are the only path).
>
> ### 5. Write Row-Level Security policies
>
> - **What:** RLS policies on the underlying tables and views that enforce who-can-see-what at the row level, even when the SQL says "SELECT *".
> - **Why:** Grants tell Postgres "this role can SELECT from this view." RLS adds "...but only the rows that match this policy." Without RLS, a misconfigured grant exposes everything in the table. With RLS, even a buggy grant fails safe. RLS is the security floor.
> - **How:** Enable RLS on every table:
>   ```sql
>   ALTER TABLE ops.events ENABLE ROW LEVEL SECURITY;
>   ALTER TABLE ops.metrics_daily ENABLE ROW LEVEL SECURITY;
>   ALTER TABLE ops.support_tickets ENABLE ROW LEVEL SECURITY;
>   -- ... and every other table
>
>   -- For tables that ops_external should NEVER see directly (everything except via views):
>   -- No policies = denies all. RLS without a permitting policy = locked down.
>
>   -- For views, you can also use security_invoker so RLS runs as the calling user:
>   ALTER VIEW ops_v1.daily_metrics SET (security_invoker = true);
>   ```
>   **Read the footguns first:** https://supabase.com/docs/guides/auth/row-level-security — pay special attention to the difference between `security_definer` (runs as view creator, BYPASSES RLS) and `security_invoker` (runs as caller, RESPECTS RLS). The default is `security_invoker` in Postgres 15+, but old habits and copy-pasted snippets can get you the wrong one.
> - **Done when:** A test (see #8) confirms that `ops_external` cannot read any underlying `ops.*` table directly, can read all `ops_v1.*` views, and gets zero rows from views that should be empty for them.
>
> ### 6. Write seed data
>
> - **What:** A Python script that populates your tables with realistic-but-fake data — enough to exercise every view and every edge case.
> - **Why:** You can't validate the access layer without data flowing through it. Real data isn't an option (we're not there yet). So you generate fake data that has the same shape and edge cases as production: 1000 events with realistic distributions, 30 support tickets across all statuses, NULL values where production has them, recent dates AND historical dates, deleted/archived rows, etc.
> - **How:** Use Python's `faker` library (`pip install faker`). Use `psycopg2` or the Supabase Python client to insert. Sketch:
>   ```python
>   from faker import Faker
>   from datetime import datetime, timedelta, date
>   import random, psycopg2
>
>   fake = Faker()
>   conn = psycopg2.connect(SUPABASE_DB_URL)
>   cur = conn.cursor()
>
>   # Daily metrics for past 180 days
>   for d in range(180, 0, -1):
>       day = date.today() - timedelta(days=d)
>       cur.execute(
>           "INSERT INTO ops.metrics_daily (day, signups, purchases, revenue_cents, mrr_cents, active_users) "
>           "VALUES (%s, %s, %s, %s, %s, %s)",
>           (day, random.randint(0, 50), random.randint(0, 10),
>            random.randint(0, 50000), random.randint(0, 200000),
>            random.randint(50, 500))
>       )
>
>   # Support tickets — exercise all status values
>   for _ in range(100):
>       cur.execute(
>           "INSERT INTO ops.support_tickets (status, classification, created_at, priority) "
>           "VALUES (%s, %s, %s, %s)",
>           (random.choice(['open','pending','resolved','closed']),
>            random.choice(['billing','feature_request','bug','onboarding', None]),
>            fake.date_time_between(start_date='-90d'),
>            random.choice(['p0','p1','p2','p3', None]))
>       )
>
>   conn.commit()
>   ```
>   Generate enough rows that aggregations meaningful (10-20 per category minimum). Save as `seeds/dev_seed.py`. Idempotent: a `TRUNCATE` at the top so re-running gives a clean reset.
> - **Done when:** Running the script populates all tables. Querying `ops_v1.daily_metrics` returns 180 rows with reasonable values. Aggregations work.
>
> ### 7. Local dev environment
>
> - **What:** Docker Compose setup that runs Postgres locally, identical to your Supabase project's schema.
> - **Why:** Your Koda Desktop should default to local data, not cloud. Local dev = no internet dependency, no cost, no risk of breaking the cloud project, faster iteration. Cloud project becomes the staging environment, not the dev environment. This is the pattern every real engineering team uses.
> - **How:** Create `dev/docker-compose.yml`:
>   ```yaml
>   services:
>     postgres:
>       image: postgres:15
>       environment:
>         POSTGRES_PASSWORD: dev_only_password
>         POSTGRES_DB: ia_ops_dev
>       ports: ["5432:5432"]
>       volumes:
>         - ./init.sql:/docker-entrypoint-initdb.d/init.sql
>   ```
>   Put your schema + RLS + views into `dev/init.sql`. Run `docker compose up`. Run your seed script against `localhost:5432`. Update Koda Desktop's `.env.example` to default to `DATABASE_URL=postgresql://postgres:dev_only_password@localhost:5432/ia_ops_dev`.
> - **Done when:** A new contributor can clone the repo, run `docker compose up`, run `python seeds/dev_seed.py`, run `python ops_dashboard.py`, and see a working dashboard against local fake data — all in under 10 minutes, no cloud accounts needed.
>
> ### 8. Validation tests
>
> - **What:** Automated tests that prove the RLS / role / view setup actually denies what it should and permits what it should.
> - **Why:** Security claims that aren't tested aren't real. You write the policies once, but they need to keep working as the schema evolves. Tests catch regressions when you (or I) accidentally weaken a policy six months from now.
> - **How:** Use `pytest`. Two test users — one anonymous, one authenticated as `ops_external`. For each, assert:
>   ```python
>   def test_ops_external_can_read_views(ops_external_client):
>       r = ops_external_client.from_('ops_v1.daily_metrics').select('*').execute()
>       assert r.data, "should return rows"
>
>   def test_ops_external_cannot_read_underlying_tables(ops_external_client):
>       r = ops_external_client.from_('ops.metrics_daily').select('*').execute()
>       assert not r.data, "should be denied or empty"
>
>   def test_ops_external_cannot_write(ops_external_client):
>       r = ops_external_client.from_('ops_v1.daily_metrics').insert({...}).execute()
>       assert r.error, "should fail"
>
>   def test_anonymous_cannot_read_anything(anon_client):
>       r = anon_client.from_('ops_v1.daily_metrics').select('*').execute()
>       assert not r.data
>   ```
>   Run on every PR. CI = github actions or just `make test`.
> - **Done when:** Test suite covers every view × every role × (read, write, schema introspection). All green.
>
> ### 9. Document the data contract
>
> - **What:** One markdown file (`docs/OPS_V1_CONTRACT.md`) documenting every view in plain English.
> - **Why:** Code is the source of truth for what the schema IS. Docs are the source of truth for what the schema PROMISES. Consumers (you, me, future contributors) read the doc to know what they can rely on. The doc also forces you to articulate the implicit decisions you made — which is where bad choices get caught.
> - **How:** For each view, document:
>   - View name + purpose (one sentence)
>   - Columns returned, with types and meaning
>   - Columns explicitly EXCLUDED, with reason (e.g., "user.email — PII, never expose to ops_external")
>   - Refresh expectations (real-time? hourly? daily? cached?)
>   - Stability commitment (e.g., "v1: column names + types stable until v2 schema introduced")
>   - Known limitations
> - **Done when:** A new contributor can read this doc and write working tooling against the views without ever looking at the underlying schema.
>
> ---
>
> ## Build 2 — The Governance Layer
>
> Access without governance becomes chaos. Set the rules now while there's only one external user (you).
>
> ### 10. Onboarding playbook
>
> - **What:** A step-by-step checklist for adding the next external user to production access.
> - **Why:** The first time you add someone, every step is custom. The second time, you regret it. The third time, you write a checklist. Skip steps 1-2; write the checklist now while it's fresh.
> - **How:** Markdown file (`docs/ONBOARDING_OPS_USER.md`):
>   ```
>   1. Founder creates Supabase Auth user with email `<jacob>@<domain>.com`
>      and custom claim `{"role": "ops_external"}`
>   2. Founder generates an invite link via Supabase Studio
>   3. Founder shares invite link via 1Password Secure Share (NOT email)
>   4. New user opens the link, sets their password (founder never sees it)
>   5. New user clones the company repo
>   6. New user copies `.env.example` to `.env`, fills in their credentials
>   7. New user runs `docker compose up && python seeds/dev_seed.py`
>   8. New user runs `python ops_dashboard.py` — verifies local works
>   9. New user updates `.env` to point at production Supabase URL
>   10. Re-runs `python ops_dashboard.py` — verifies prod access works
>   ```
>   Each step explicit. No "you'll figure it out" steps.
> - **Done when:** You can hand the doc to someone (a Claude agent? a friend?) who's never seen this project, and they get to "working dashboard" in 30 minutes without asking you a question.
>
> ### 11. Credential surface inventory
>
> - **What:** A living document listing every service we use, who has access, what level, where credentials live.
> - **Why:** You can't secure what you can't see. This is the map. When something is compromised, the inventory tells you "what else does this credential touch?" — which is what you need to know to do rotation correctly.
> - **How:** Markdown table (`docs/CREDENTIAL_INVENTORY.md`):
>   ```
>   | Service | Account / User | Access Level | Credentials Location | Last Rotated |
>   |---|---|---|---|---|
>   | Supabase | alsh@... | Owner | 1Password "IA Production" | 2026-04-30 |
>   | Vercel | alsh@... | Owner | Browser session + CLI auth | never |
>   | Stripe | alsh@... | Owner | Browser session + 2FA SMS | never |
>   | Apple Developer | alsh@... | Account Holder | Browser + 2FA TOTP | never |
>   | RevenueCat | alsh@... | Owner | Browser session | never |
>   | GitHub | alshcampos-cloud | Owner | Browser + SSH key + PAT | (PAT not rotated) |
>   | Anthropic | alsh@... | Owner | API key in 1Password | 2026-04-15 |
>   ```
>   Founder fills in the actual values. You design the format and write the first version. The "Last Rotated" column is the action-driver — anything older than 90 days flagged for rotation.
> - **Done when:** Every service we use is on the list. Every credential's location is documented (which 1Password vault, which env file, etc.). The doc is committed to a private repo (the inventory itself isn't sensitive — it lists locations, not values).
>
> ### 12. Rotation procedure
>
> - **What:** Documented steps for rotating each credential when it's compromised or expires.
> - **Why:** Rotation is a high-stress operation that's done rarely, which means it's exactly when mistakes happen. A documented procedure removes the cognitive load. Test it once on a non-critical key so you know it works.
> - **How:** Per service, document:
>   1. How to generate a new credential
>   2. Order of operations (what depends on what — you can't rotate the deps before the dependents)
>   3. Where to update the new value (Vercel env vars, Supabase secrets, etc.)
>   4. How to verify the new credential works
>   5. How to invalidate the old credential safely
>   6. What downstream systems need notification
>
>   Test the procedure ONCE on a non-critical key (e.g., the Tavily API key — losing it is annoying but not fatal). Confirm the playbook is correct. Commit any corrections.
> - **Done when:** Rotation procedure exists for every service in #11's inventory. One has been actually tested end-to-end.
>
> ### 13. "Hit by a bus" runbook template
>
> - **What:** A template each of us fills out, kept in 1Password, that contains everything someone would need to know to pick up our work if we suddenly couldn't.
> - **Why:** Sole-founder companies have an existential single-person dependency. As the team grows from 1 to N, this risk doesn't go away — it just spreads. Each team member's domain knowledge is a single point of failure unless documented. The runbook makes critical knowledge transferable.
> - **How:** Template (`docs/HIT_BY_A_BUS_TEMPLATE.md`):
>   ```
>   - Emergency contacts (lawyer, accountant, key advisors, family)
>   - Where credentials live (1Password vault names, recovery info)
>   - Top 5 things that must keep running (production deploys, billing, customer support)
>   - How to do each of those top 5 things — step by step
>   - Active commitments (vendors with auto-renew, legal obligations, customer SLAs)
>   - Recovery passphrases / backup codes location
>   - Who has authority to make decisions in your absence (board, cofounder, etc.)
>   ```
>   Each person fills out their own copy, stores in 1Password under a "BREAK GLASS" item with sharing rules.
> - **Done when:** Template exists. You've filled out yours. Founder fills out his when back from Omaha.
>
> ### 14. Audit review procedure
>
> - **What:** A documented cadence for reviewing Supabase audit logs, login alerts, and unusual access patterns.
> - **Why:** Audit logs that no one reads aren't audit logs — they're storage costs. The value comes from someone actually looking at them with intent. Even a 10-minute weekly review catches 95% of real issues at our stage.
> - **How:** Document a weekly cadence:
>   - Monday morning: scan Supabase Auth login attempts (any from unknown IPs?)
>   - Monday morning: scan Stripe activity (any unfamiliar charges, refunds, or login alerts?)
>   - Monthly: review credential inventory; flag anything stale for rotation
>   - On any alert: documented escalation path
>
>   Set it up as a recurring calendar block. Make it ≤15 min. Make it boring. The point is consistency.
> - **Done when:** Procedure is documented. First weekly review has happened, with notes on what was found (probably nothing — that's fine).
>
> ---
>
> ## Build 3 — The Security Foundation
>
> The shared mental model. Apply broadly.
>
> ### 15. Document the 5-layer security model
>
> - **What:** A reference doc describing how we think about security as a stack: device hygiene → credential management → access control → monitoring → recovery.
> - **Why:** Most security debates devolve because people are arguing across layers. Naming the layers gives us shared language. "We have weak credential management" is actionable; "we should be more secure" is not.
> - **How:** Markdown doc (`docs/SECURITY_MODEL.md`). For each layer, define:
>   - What it covers
>   - What "good" looks like at our current stage (1-2 people)
>   - What "good" looks like at next stage (5-10 people)
>   - Specific tools/processes we'll use
>
>   Stay opinionated. "We use 1Password, not Lastpass. We use YubiKey, not SMS 2FA. We use Google Workspace SSO when we hit 5 people." Decisions documented now save fights later.
> - **Done when:** Doc exists, both of us have read it and signed off on the philosophy. It's the canonical reference for any future security debate.
>
> ### 16. Threat model for InterviewAnswers (current stage)
>
> - **What:** An honest list of what we're defending against, ranked by likelihood × blast radius.
> - **Why:** Generic security posture is overkill in some places and underkill in others. The threat model focuses spend where it matters. We're a small early-stage startup, not a bank — our defense should look like one, not the other.
> - **How:** Markdown doc (`docs/THREAT_MODEL.md`). Rank threats:
>   - Lost/stolen laptop (founder + you both)
>   - Phishing → credential theft
>   - Accidental key leak (committed to git, screenshotted in chat)
>   - Compromised dependency (npm/pip supply chain)
>   - Insider threat (low for us, but always nonzero)
>   - DDoS / SQL injection / bot attacks (handled by providers)
>   - Targeted attack (very low at our size — explicitly say so)
>   - Nation-state / APT (zero — say "out of scope")
>
>   Honest scoping. Theatrical defenses against unrealistic threats are a waste.
> - **Done when:** Doc exists. Defenses we put in place trace back to specific threats in the model.
>
> ### 17. Device hardening checklist
>
> - **What:** A concrete checklist for hardening any laptop / phone that touches credentials.
> - **Why:** Most "security incidents" at our stage start with a compromised device. The checklist makes "is your machine reasonable?" a 30-minute audit instead of an open question.
> - **How:** Markdown checklist (`docs/DEVICE_HARDENING.md`):
>   ```
>   ☐ FileVault enabled (macOS) / BitLocker enabled (Windows)
>   ☐ Find My Mac on, with remote-wipe tested
>   ☐ Auto-screen-lock < 5 minutes
>   ☐ Strong account password (not just biometric)
>   ☐ All credentials in 1Password / Bitwarden, not browser/Notes
>   ☐ YubiKey (or similar hardware key) on top accounts: email, GitHub, Stripe, Supabase, password manager itself
>   ☐ Browser profile separation: "Admin" profile for high-stakes accounts, "Personal" for everything else
>   ☐ No `.env` files with prod secrets sitting on disk longer than active dev session
>   ☐ Apps from official sources only (Mac App Store / signed installers)
>   ☐ Software auto-updates on
>   ☐ Backups configured and tested (Time Machine + offsite)
>   ```
>   Each item with the "why" written next to it.
> - **Done when:** Checklist exists. You've audited your own device against it (and noted the gaps). Founder will do the same when back.
>
> ---
>
> ## Build 4 — Polish your own work (parallel, no dependencies)
>
> ### 18. Persona refinement for The Body
>
> - **What:** Locked-in persona files for each of the four agents.
> - **Why:** You flagged them as "functional but placeholder" — placeholders attract rewriting. Locked-in personas attract refinement. Make the call now while it's fresh.
> - **How:** For each agent (`memory/{mr-left,mrs-right,the-mouth,the-eye}/persona.md`), write:
>   - Identity (one paragraph)
>   - Core decision rules (when does this agent push back, when does it execute, when does it escalate)
>   - Voice/tone (with 2-3 example sentences in their voice)
>   - Constraints (what this agent won't do)
>   - Escalation paths (when does this agent hand off, to whom)
> - **Done when:** Each persona file is ≤500 words, distinctive, and ready for use without further editing.
>
> ### 19. The Body architecture brief
>
> - **What:** A formal proposal for taking The Body from your personal project to company canon.
> - **Why:** You built something real. The choice ahead — keep it personal vs. promote it to company infrastructure — is consequential. The brief surfaces the decisions that need to be made BEFORE anyone implements them.
> - **How:** Markdown doc covering:
>   - Current state and how it works
>   - Multi-user implications (does each user get their own personas? shared? a mix?)
>   - Hosting — local desktop only, or web app, or both?
>   - Cost projections (Anthropic API spend at expected usage)
>   - Persona governance (who can edit which personas?)
>   - Reporting infrastructure (where do reports live, who owns them, retention)
>   - Migration path from current personal-project state to company canon
> - **Done when:** Doc exists. Specific enough that founder can react with "yes / no / modify" on each decision point, not "interesting, let me think."
>
> ### 20. Self-security audit
>
> - **What:** An honest gap analysis on YOUR own setup using the Build 3 framework.
> - **Why:** You're going to be writing the security playbook. The first audit should be your own — eat your own dog food. If the playbook is right, your audit produces a real to-do list. If the playbook is hand-wavy, your audit reveals it.
> - **How:** Run yourself through #15-17. For each item: do you have it, partially have it, not have it, what's the gap? Write it down honestly — this is for your own planning, not for performance.
> - **Done when:** Audit document exists. You have a personal action list for hardening your end. (You don't need to fix everything — the inventory is the deliverable.)
>
> ---
>
> **Rules of engagement:**
>
> - **No deadline.** I'm out for the weekend, then heads-down on iOS rollout for a week. Two weeks, four weeks, six weeks — your call. Better done well than done fast.
> - **No expected scope.** All 20 items, or 10, or 5. Defend your scoping decisions. If you cut something, tell me why.
> - **No expected polish.** Document YOUR thinking. If you considered three approaches, write that. The reasoning is more valuable than the result.
> - **You own this layer.** Going forward, "how does external access work at InterviewAnswers?" → "talk to Jacob, it's his system." Not theoretical. That's the actual job description if you want it.
>
> When you have something you're proud of, show me. **I mirror your structure on the production Supabase project, run your migrations, create your real user, and your tooling pulls live data the same day.** Integration is fast because you've already designed it. We're not building it together — you're building it; I'm providing the destination.
>
> ---
>
> One last thing. What I've described is a real piece of company infrastructure, not a personal project. If you build it, we should talk about what that means structurally — equity, scope, decision authority, compensation. Not in email. When I'm back.
>
> Have a productive weekend.
>
> — Alsh

---

## What to edit before sending

Honest things to consider:

1. **Tone calibration.** This is direct, warm, doesn't apologize. Re-read tomorrow morning rested — does it land like you intended? If it feels too direct, soften the "I haven't been able to give either" line. If it feels too soft, cut some of the "no deadline / no expected scope" qualifiers (they're encouraging but also a little hand-holdy).

2. **The equity paragraph.** That's the load-bearing one. If you're not ready to have THAT conversation yet, you can soften it to:
   > *"There's a bigger conversation about what your role looks like going forward — equity, scope, decision authority. That's a Monday-when-I'm-back conversation, but I want you to know it's on my mind."*
   
   Or if you ARE ready to commit to a structure (contractor / co-founder / advisor), say what you're proposing. Vague-but-honest > falsely committed > silent.

3. **The "free tier" comment about Supabase.** Verify yourself — Supabase free tier supports 500MB DB + 2GB transfer + custom auth. Plenty for Jacob's design phase. If you want him to know there's no cost concern, leave it. If you'd rather he treat this as paid work and bill you for it, remove it.

4. **The deliverable list (1-5).** Five items might be too many for the framing of "your call on scope." Consider cutting to 3 (Supabase project, access layer, contract doc) and rolling the rest into "additional welcome but not required."

5. **Subject line.** "Re: Report for April 29th 2026 — real reply" telegraphs that this is the substantive response. If you want it to read more casually, change to "Re: Report for April 29th 2026" alone.

---

## What's in this message vs. what's NOT

**In the message:**
- Honest reason for the delay (no infrastructure)
- Clear, ownership-framed work assignment
- His autonomy on timeline + scope + tooling
- The integration commitment ("when you're ready, I mirror your structure")
- Acknowledgment that this is real company infrastructure
- Door open for the equity/scope conversation

**NOT in the message (intentionally):**
- The full security framework conversation (defer until Monday after he sees this and reacts)
- Specific SQL / view names / schema specifics (let him design from his own consumer perspective, not mine)
- Production credentials or access of any kind
- Any commitment to specific compensation/equity structure
- Apologies (avoid; this isn't a wrong, it's a system in evolution)
- Mentions of timeline pressure on YOUR side (his work isn't blocking you; iOS pricing is the real next thread)

---

## The Monday conversation — bring this in head, not email

When you're back from Omaha, the call has three threads:

1. **Did the message land?** Read his reaction. Energetic + ambitious = co-builder material. Lukewarm = contractor material. Defensive = renegotiate scope.

2. **What does his role actually look like?** This is the equity/scope/payroll conversation. Three honest options:
   - **Contractor (1099)** — paid hourly or per deliverable. Clean separation. Easy to start, easy to wind down. ~$50-150/hr depending on his market and your runway.
   - **Co-founder / equity grant** — vesting schedule, decision authority, real responsibility. Heavy commitment both directions. Should be drafted by a lawyer once you both agree.
   - **Advisor with small equity** — quarterly check-ins, occasional deep work, 0.25-0.5% over 2-year vest. Low commitment but signals genuine partnership. Many founders use this as a stepping stone before deciding contractor vs co-founder.

3. **What's the trajectory?** Even if you start contractor, do you envision this becoming co-founder? Be honest with him about the path. People stay engaged when they see the next step; they disengage when they feel stuck.

You don't need to resolve this in one Monday call. But you need to surface it. Right now Jacob is doing real work without a defined relationship — that's a debt accumulating in both directions.

---

## Files referenced

- `docs/IOS_PRICING_HANDOFF.md` — the parallel iOS workstream you'll be heads-down on next week
- `docs/PRICING_AUDIT_2026-04-30.md` — context on what just shipped tonight
- MEMORY.md — strategic context entries for May 1-3 founder absence
