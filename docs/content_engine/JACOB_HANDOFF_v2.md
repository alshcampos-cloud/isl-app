# Content Engine — Handoff to Jacob (v2)
**Date:** 2026-05-23
**From:** Lucas
**To:** Jacob Bernal
**Replaces:** your "Organic Content Pipeline" proposal from May 17

---

## TL;DR (read this first)

**Scope:** GENERAL TRACK ONLY. This pipeline produces blog content for the general job-seeker audience. It does NOT produce nursing, clinical, or healthcare-specific content — that's a separate walled-garden specialty in the app, not part of this pipeline. Your three-layer nursing guardrail from v1 is what enforces this and stays.

Your v1 foundation is solid. **Phase 0 (blog CMS, three-layer guardrail, quality checker) ships unchanged — that work is approved.**

We're upgrading the pipeline FROM "writes and publishes blog posts" TO "competes in 2026 SEO." 12 specific upgrades. The strategic doc lives at `docs/content_engine/CONTENT_ENGINE_V2_STRATEGY.md` — read it after this handoff. Three concrete artifacts you can start consuming today:

- `docs/content_engine/BRAND_FACTS.md` — single source of truth for pricing, timeline, citation ages, banned words. The writing agent reads this at run time.
- `docs/content_engine/CITATION_LIBRARY.md` — 15 verified citations. Agent picks ONE primary per article. No citation outside this library is allowed.
- `docs/content_engine/CONTENT_ENGINE_V2_STRATEGY.md` — the full strategic spec including the v2 system prompt (Section 6), topic cluster map (Section 7), editorial standards (Section 8), distribution chain (Section 9), and revised phase plan (Section 11).

Total effort delta from your v1: roughly +36 hours of your time across the build. Approximately 3 weeks of part-time work to reach a working content engine.

---

## What I changed and why — short version

**The 3 BLOCKING fixes (must be in place before any article publishes):**

1. **"50 years of cognitive psychology" — that's wrong.** Roediger & Karpicke 2006 = 20 years old. Same error appeared in the homepage Manifesto (cut) and ad copy (fixed). It's now in your system prompt. We need a single source of truth (`BRAND_FACTS.md`) that the agent reads at run time so this never reappears.

2. **One citation in every article = formulaic.** If every article cites R&K 2006, the corpus reads templated and Google's helpful-content updates will downrank us. Built a 15-citation library with rotation rules.

3. **No author byline = E-E-A-T penalty.** Google's 2024+ helpful-content updates penalize anonymous AI content. Need a real author byline + bio page (`/about/editorial`) before any article publishes.

**The 2 STRATEGIC upgrades you need to add to your build:**

4. **Image strategy.** Articles without hero images typically underperform on social sharing and click-through (Open Graph + Twitter Card render with image, articles get more click-share). Add DALL-E 3 generation step (~$0.04 per image, ~$0.32/mo at 8 articles).

5. **Topic cluster mapping (anti-cannibalization).** Your Brief #005 ("STAR method examples") will cannibalize the existing `/star-method-guide` static page. Need to map briefs to clusters with pillar-and-supporting structure. Map is in the strategy doc Section 7.

**The 4 STRATEGIC upgrades that move LinkedIn syndication + internal links earlier (Phase 1.5 not Phase 4):**

6. **5-10 min editorial pass per article.** Your "30-second checklist" is pattern-matching, not editorial. AI content with a 30-second review reads like AI content. Spec is in strategy doc Section 8. Your time, not Lucas's.

7. **LinkedIn syndication in Phase 1.5.** Don't defer 30 days — LinkedIn is the biggest organic amplifier we have. Agent generates a 300-word LinkedIn variant alongside the blog draft.

8. **Better GSC scoring.** Your `impressions × (1 - CTR)` formula overweights raw impressions. Add position decay + intent classification.

9. **Internal link suggestions.** During editorial pass, agent suggests 3 internal links (2 to cluster siblings, 1 to a pillar page, 1 brand-defense link to `/ethics`).

**The 3 BIGGER upgrades for Phase 2 / Phase 3:**

10. **Citation verification step** — automated check that every citation in a draft matches an entry in `CITATION_LIBRARY.md`. If not, reject.

11. **Distribution chain orchestration** — when an article publishes, automatically draft X thread + LinkedIn variant + email-to-subscribers entry. Queue for your approval.

12. **Measurement / learning loop** — monthly automated report: per-article GSC clicks + Supabase signups + Stripe revenue. Surface to Lucas in the weekly digest.

Full detail on each upgrade in strategy doc Section 3.

---

## What ships when — your build plan

| Phase | Deliverable | Your hours | Lucas hours | Status |
|---|---|---|---|---|
| **Phase 0** | Blog CMS (your v1 work) | 12 (done) | 0 | ✅ APPROVED — ship as-is |
| **Phase 0.5** (NEW) | `/about/editorial` page + byline + JSON-LD Person schema | 4 | 30 min | ⬜ Not started |
| **Phase 1** | Writing agent reading BRAND_FACTS + CITATION_LIBRARY with rotation | 12 | 1 hr | ⬜ Not started |
| **Phase 1.5** (NEW) | Image generation + LinkedIn variant + internal link suggestions | 10 | 15 min | ⬜ Not started |
| | **— GATE: 14 days of clean operation, editorial pass on every article —** | | | |
| **Phase 2** | GSC brief generator with improved scoring + cluster routing | 9 | 15 min | ⬜ Not started |
| | **— GATE: 30 days of clean operation, organic traffic accumulating —** | | | |
| **Phase 3** | Citation verification + distribution chain + measurement loop | 22 | 0 | ⬜ Not started |
| | **— GATE: 60 days of clean operation, real performance data —** | | | |
| **Phase 4** (FUTURE) | Pillar restructure + interactive elements + advanced topical authority work | TBD | TBD | Not in this proposal |

**Total Jacob hours: ~77** (Phase 0: 12 [done] + Phase 0.5: 4 + Phase 1: 12 + Phase 1.5: 10 + Phase 2: 9 + Phase 3: 22 + integration testing & QA: 8 = 77). Spread across 3 weeks of part-time work assuming ~25 hr/week.

---

## What I'm approving now (no further sign-off needed)

✅ **Phase 0** — your blog CMS work, three-layer nursing guardrail, quality checker, pre-flight keyword block, refusal detection, `briefs.json` structure. Ship as-is.

✅ **Cutting these from scope** (your v1 cuts confirmed correct):
- Reddit posting agent (brand-ending risk)
- Ahrefs API (GSC is better + free for our case)
- Medium auto-syndication (manual is fine)
- Nursing track content in pipeline (out of scope)

---

## What needs Lucas approval / setup before Phase 1 ships

### A. Document approvals (~2 hours Lucas time, one-time)

1. **`BRAND_FACTS.md` v1** — Lucas reviews/edits the source-of-truth card (30 min)
2. **`CITATION_LIBRARY.md` v1** — Lucas reviews the 15 citations (15 min)
3. **System Prompt v2** (in strategy doc Section 6) — Lucas reviews/edits (30 min)
4. **Author byline strategy** — Lucas decides "Editorial Team" vs "Founder" vs hybrid for default (15 min)
5. **Topic cluster map** (in strategy doc Section 7) — Lucas approves the 7-cluster map (5 active at launch, 2 future) (15 min)
6. **Image prompt template** — Lucas reviews drafted `IMAGE_PROMPT_TEMPLATE.md` (style + 3 example prompts) (10 min)
7. **Pre-launch attorney engagement** — Lucas identifies / books an attorney for one-time review of the first /ethics-cluster article (~$500-1500). Doesn't block Phase 1 deploy — only blocks first /ethics article publish. (15 min to email an attorney; review itself happens later)

### B. Credentials Lucas creates and shares with Jacob (~45 min Lucas time, one-time)

| # | Credential | Where Lucas creates | Where it lives | Used by |
|---|---|---|---|---|
| 7 | **Anthropic API key** | https://console.anthropic.com/settings/keys → "Create Key" → name: `iaai-content-engine` | Vercel env var `ANTHROPIC_API_KEY` | Writing agent (Claude Haiku 4.5 text gen + LinkedIn variant) |
| 8 | **OpenAI API key** | https://platform.openai.com/api-keys → "Create new secret key" → name: `iaai-content-engine-dalle` | Vercel env var `OPENAI_API_KEY` | Image generation (DALL-E 3) |
| 9 | **Google Cloud service account JSON** | console.cloud.google.com → IAM → Service Accounts → Create → "GSC Reader" → Add as Viewer to GSC property for `interviewanswers.ai` → download JSON | Vercel env var `GSC_SERVICE_ACCOUNT_JSON` (the entire JSON pasted as string) | GSC brief generator (Phase 2) |
| 10 | **Supabase service role key** | supabase.com/dashboard → Project → Settings → API → "service_role secret" (NOT anon key — service role is needed to bypass RLS for writes) | Vercel env var `SUPABASE_SERVICE_ROLE_KEY` | Writing agent inserts to `blog_posts` |
| 11 | **Supabase project URL** | Same settings page, "Project URL" field | Vercel env var `SUPABASE_URL` (likely already set) | Writing agent |
| 12 | **Vercel API token (project-scoped)** | vercel.com/account/tokens → "Create" → scope: `alshcampos-cloud/interview-as-a-second-language-app` only | Share with Jacob securely (1Password / encrypted email) | Jacob deploys the agent + endpoint |
| 13 | **`BLOG_AGENT_SECRET`** | Jacob generates a random 32-char string (`openssl rand -hex 32`) | Vercel env var `BLOG_AGENT_SECRET` AND Jacob's local agent config | Bearer-auth for `POST /api/blog-publish` |
| 14 | **IndexNow API key** | Generate any 32-char random string at https://www.bing.com/indexnow → host at `interviewanswers.ai/{KEY}.txt` (Vercel `/public`) | Vercel env var `INDEXNOW_API_KEY` | Phase 3 distribution chain (Bing + Yandex re-crawl ping). Not needed for Phase 1. |

### C. Budget caps Lucas sets on Anthropic + OpenAI (~10 min total)

**Critical:** without spend caps, a runaway pipeline (bad rate-limit handling, retry loop, infinite cron) could burn $1000s before you notice.

| Service | Where to set | Recommended cap |
|---|---|---|
| **Anthropic** | console.anthropic.com → Settings → Billing → "Usage limits" → set monthly limit | **$20/month** (covers 100+ articles at our cost). Email alert at 50%, 75%, 90%. |
| **OpenAI** | platform.openai.com → Settings → Limits → "Usage limits" → set hard limit | **$10/month** (covers 200+ images). Email alert at 50%, 75%, 90%. |

These caps create hard-failure modes that you NOTICE. Without them, the only signal is the bill at end of month.

### How to bundle the credential handoff securely

The right storage location depends on where the pipeline RUNS:

- **If pipeline runs in Vercel cron (serverless function):** Lucas sets all credentials in Vercel env vars (`vercel.com/dashboard → project → settings → environment variables`). Jacob never sees raw values.
- **If pipeline runs in GitHub Actions (Jacob's preference, presumably):** Lucas adds them as GitHub Secrets at `github.com/alshcampos-cloud/isl-app/settings/secrets/actions`. Workflow YAML references them as `${{ secrets.ANTHROPIC_API_KEY }}` — Jacob never sees raw values. Tradeoff: GitHub Secrets are write-only after set (can't read back to verify); same applies to Vercel.
- **Hybrid (likely the actual answer):** Pipeline (agent) runs in GitHub Actions, but the publishing endpoint (`POST /api/blog-publish`) lives in Vercel. So both stores get a copy of credentials they each need: GitHub Secrets for `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `BLOG_AGENT_SECRET`; Vercel env vars for the same set plus anything the publishing endpoint reads.

For local-development testing only: share via 1Password / Bitwarden / encrypted email.

**Do NOT:** send credentials in plain Slack DM, email body, GitHub issue, GitHub PR description, or any non-encrypted channel.

### Where does the agent run

**Decision: hybrid.** Agent runs in GitHub Actions. Publishing endpoint stays in Vercel.

| Component | Where it runs | Why |
|---|---|---|
| Writing agent (the cron job) | **GitHub Actions** | Faster iteration loop (PR-based), GitHub Secrets management, free 2,000 min/mo well above our ~150 min/mo usage |
| `POST /api/blog-publish` endpoint | **Vercel** (same project as the app) | Already exists from your v1, no reason to relocate |
| Image storage | **Supabase Storage public bucket** | Already in your stack, CDN-fronted |
| Cron schedule | See cron schedule section below | — |

**Credential split:**
- GitHub Secrets gets: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `BLOG_AGENT_SECRET`
- Vercel env vars gets: `BLOG_AGENT_SECRET` (the publish endpoint verifies the bearer), `SUPABASE_SERVICE_ROLE_KEY` (same), `INDEXNOW_API_KEY` (Phase 3)
- Both stores get a copy of credentials they each need — no shared cross-system secret store

### Cron schedule

**Decision: Mon + Thu at 7:00 AM PT (15:00 UTC) for draft generation.**

Why these times:
- Generates drafts at the start of Jacob's working day, twice a week (Mon for the week's flow, Thu for end-of-week catch-up)
- ~2 drafts per run × 2 runs/week = ~16 drafts/month (covers the 8 articles/month target with margin for rejections)
- 60-second stagger between articles within a run keeps us well under Anthropic Tier 1 rate limits (50 RPM × 1 RPM actual = 50× headroom)
- Jacob can manually trigger via `workflow_dispatch` for testing or one-off runs

GitHub Actions cron syntax:
```yaml
on:
  schedule:
    - cron: '0 15 * * 1,4'   # Mon + Thu 15:00 UTC = 7:00 AM PT (8:00 AM PDT)
  workflow_dispatch:          # allow manual trigger for testing
```

### Order of operations

You don't need to wait for all 13 items — but Phase 1 can't ship without items 1-3 (BRAND_FACTS, CITATION_LIBRARY, System Prompt v2 — these are read by the agent at run time) AND items 7-8 (Anthropic + OpenAI API keys — without them, agent can't make any API call).

Items 4-6 (byline, cluster map, image prompt template) are needed before Phase 1, but Jacob can stub them and you can edit.

Item 9 (GSC service account) is only needed for Phase 2 — can come later.

Items 10-13 (Supabase + Vercel + bearer secret) Jacob already needs from your original v1 — should already be in flight.

---

## What you can build TODAY (no approvals needed)

These are all independent of the approvals above:

1. **Wire your writing agent to READ `BRAND_FACTS.md` and `CITATION_LIBRARY.md` at run time.** Don't hardcode facts into the system prompt. The whole point is the agent picks up changes when the docs update.

2. **Build the `/about/editorial` page.** Static React page with two sections at launch (founder bio infrastructure stays dormant — see "Future option" below):

   **a. Editorial Team (intro paragraph, organization-level)**
   > "InterviewAnswers Editorial Team articles are produced by our content pipeline — drafted, reviewed against our citation library and brand standards, edited for accuracy and voice, then published. Our editorial standards are anchored in cognitive psychology research on practice, retrieval, and skill acquisition. Editorial review by Jacob Bernal, our technical operations contractor."

   **b. Editorial Standards (short list, public-facing)**
   - One primary citation per article, drawn from a verified library; no fabricated sources
   - Every article reviewed by a human before publication
   - Citation rotation enforced — no single source over-cited
   - No claims about products, employers, or detection systems without verifiable sourcing
   - Contact: `editorial@interviewanswers.ai` for corrections or source questions

   **c. Anchor IDs (build now even if section dormant)**
   - `#editorial-team` for the org section (used by default byline schema's `url`)
   - `#founder` reserved for future use (founder bio added later if/when activated)

   Do NOT reference any co-founder on this page — the content engine is general-track only, and the co-founder is associated with the nursing track which is out of scope here.

   **Byline at launch:** every article → "InterviewAnswers Editorial Team" + `Organization` schema. Founder-byline path is built into the agent and schema but NOT activated. See `BRAND_FACTS.md` Author Byline section for the activation rule.

   **Future option (do not implement now):** When/if Lucas decides to attach his name to specific articles (e.g., an /ethics-cluster piece that REQUIRES first-person "I built this, I deleted it" framing), the founder byline gets activated for that article only by flipping a flag. Infrastructure: anchor `#founder` exists, schema selection logic in the agent handles either `Organization` or `Person` based on config. No page rebuild needed.

3. **Add image generation step.** OpenAI DALL-E 3 API call (style direction in `docs/content_engine/IMAGE_PROMPT_TEMPLATE.md` — read at run time alongside BRAND_FACTS + CITATION_LIBRARY). Upload result to Supabase Storage public bucket. Attach URL to `blog_posts.hero_image_url`. Alt-text to `blog_posts.hero_image_alt_text`.

4. **Implement citation rotation logic.** Query the last 4 published articles' `primary_citation_id`. The agent's selection must not match any of them. R&K 2006 capped at 1 in 5 even if rotation would allow.

5. **Implement cluster routing.** Each brief in `briefs.json` declares its cluster. Agent uses the cluster to:
   - Pick from cluster-appropriate citations
   - Generate internal-link suggestions from siblings
   - Pick the correct pillar page URL for the "link up" suggestion

6. **Build editorial pass UI in Koda Ops.** Show the 8-item checklist from strategy doc Section 8 alongside the draft. Track which items the reviewer checked / edited / rejected. Surface rejection reasons monthly.

7. **Build LinkedIn variant generation.** Same agent run produces a `---LINKEDIN_VARIANT---` block in the output. Save to a new `linkedin_drafts` table or column. Queue for Jacob's review alongside blog draft.

---

## Operational spec — gaps to close before Phase 1 ships

The audit caught 6 gaps in the original v2 spec. Resolving these here so you don't have to email back asking. Override any of these if you have a better answer — these are starting positions.

### 1. Error handling, retry, and dead-letter queue (Battle Scar #3 in CLAUDE.md)

Every API call (Anthropic, OpenAI/DALL-E, Supabase) must follow this pattern:

- **3 retries with exponential backoff** (0s / 1s / 2s) on transient failures (5xx, network timeout)
- **NO retry on 4xx** except 429 (rate limit) — those get the backoff treatment with longer base (5s / 30s / 120s)
- **After all retries fail:** write the failed attempt to a `failed_generations` table with: brief_id, step (e.g., "claude_text_gen" or "dalle_image_gen"), error message, timestamp, retry_count
- **Never charge usage / increment counters until the call confirms success** (project's billing pattern)
- **Cron run keeps going** after individual failures — one failed article does not stop the batch

### 2. Anthropic + OpenAI rate limit handling

Project Memory documents we hit our internal 429 cap recently (Anthropic Tier 1 = 50 RPM, 50K input tokens/min, 10K output tokens/min on Haiku). The pipeline must:

- **Stagger article generation by ≥ 60 seconds** in the cron loop. 8 articles = 8 minutes minimum.
- **Detect 429 from Anthropic** specifically (not auto-retry; respect the `retry-after` header)
- **Detect 429 from OpenAI** for DALL-E (default tier is 5 images/min — staggering already solves this)
- **Log every rate-limit event** to `failed_generations` even if subsequent retry succeeds — visibility into how close we are to the limit

### 3. Article rejection workflow

When you reject a draft in Koda Ops:

- Draft moves to `rejected_drafts` table (NOT deleted — keep for system-prompt-improvement review)
- The original brief stays in the queue with `rejection_count` incremented
- **After 3 rejections of the same brief:** auto-delete the brief, notify Lucas in the weekly digest with the rejection reasons
- **Same article does not auto-regenerate** — the rejection means the brief itself is the problem, or the system prompt needs to evolve

### 4. Image generation — alt-text + storage + accessibility

DALL-E 3 generates the hero image. The agent must ALSO generate:

- **`---IMAGE_ALT_TEXT---` section** in its output (60-125 chars, describes the image for screen readers + SEO)
- Editorial pass verifies alt-text is accurate (not just keyword-stuffed)
- Image gets uploaded to Supabase Storage public bucket; URL written to `blog_posts.hero_image_url`
- **Image dimensions:** 1200x628 minimum (Open Graph / Twitter Card compliant)

### 5. IndexNow API setup (Phase 3 distribution)

For T+10 min "Ping IndexNow (Bing + Yandex)" step in the distribution chain:

- Generate a single IndexNow API key (any 32-char random string) at https://www.bing.com/indexnow
- Host the key at `https://www.interviewanswers.ai/{KEY}.txt` (Vercel static file in `/public`)
- Add to Vercel env vars as `INDEXNOW_API_KEY` (item 14 — append to credentials table)
- Use only when Phase 3 distribution chain ships — not needed for Phase 1

### 6. Apple App Store walled-garden compliance (binding)

**Explicit:** This pipeline does NOT generate nursing or clinical content. Ever. Per CLAUDE.md Part 2's walled-garden rule, all clinical content is human-validated only. Any brief tagged with `cluster: nursing` or `cluster: clinical` triggers the agent's refusal protocol (Section H of the system prompt). The pre-flight keyword block (your v1 work) should reject these briefs before any API call.

If we later want a nursing-content pipeline, it gets a separate spec with human-in-the-loop review BEFORE generation, not after.

### 7. Pre-launch legal review gate for /ethics cluster

The /ethics cluster names specific people (Roy Lee) and companies (Cluely) that we positioned against. BRAND_FACTS "Defamation hygiene rules" defines the truth-and-opinion safe harbor, but the FIRST article in this cluster gets one extra gate: **attorney review before publish.**

**Mechanism:**

- Jacob marks the article in the editorial queue with status `ethics_first_article_pending_legal_review` instead of auto-publishing
- Lucas downloads the draft as PDF or shares the Koda Ops queue URL with an attorney ($300-500/hr, one read-through estimated $500-1500)
- Attorney signs off (or sends edits) → Lucas updates the article in Koda Ops → status flips to `ready_to_publish` → next cron run picks it up
- Lucas documents the attorney's "safe to publish" feedback so it becomes the benchmark for all SUBSEQUENT /ethics articles — they go through the normal editorial pass without re-review unless they introduce new named persons/companies
- If a later /ethics article DOES introduce a new named target (e.g., a new competitor case or a new candidate-loses-offer case), it triggers the legal-review gate again

**Implementation in Phase 1:**

- Add `legal_review_required` boolean column to `blog_posts` table (default `false`)
- Writing agent sets `legal_review_required = true` for any article where `brief.cluster == "ethics"` AND no prior /ethics article exists in `blog_posts` table
- Publishing endpoint refuses to publish any article where `legal_review_required = true` and `legal_review_approved_at IS NULL`
- Koda Ops surfaces the legal-review queue as a separate filter

**Why this matters:**

The agent + editorial pass + BRAND_FACTS defamation rules give us strong structural defense, but they're trained against rules I drafted, not against actual case law. One attorney read-through of the first /ethics article validates the whole defamation hygiene rulebook against jurisdiction-specific case law (NYT v. Sullivan, anti-SLAPP statutes in our domicile state, etc.). One-time cost; permanent benchmark.

**Reminder (this is on the agent's spec, not just Jacob's mental model):** This gate covers the FIRST /ethics article only. Subsequent /ethics articles that reuse the same named persons/companies within the established attorney-approved framing do NOT need re-review.

---

### 8. Quality monitoring (first 30 days)

Beyond the editorial pass, Lucas does a weekly random-article re-review for the first 4 weeks:

- Pick 1 published article at random (RNG)
- Read it cold (forget it was AI-generated)
- Rate on: factual accuracy, voice match, no banned-word leak, citation match, internal-link quality
- If 2/4 weekly reviews fail → pause the pipeline and revise the system prompt

This is the canary against gradual quality drift that the 5-10 min per-article pass can't catch.

---

## Phase 1 acceptance criteria (Definition of Done)

You can declare Phase 1 complete when ALL 8 checks pass:

1. ☐ **End-to-end success on the test brief** (defined below) — agent reads briefs.json → reads BRAND_FACTS/CITATION_LIBRARY from Supabase → generates article + image + LinkedIn variant + internal links → POSTs to `/api/blog-publish` → draft appears in Koda Ops approval queue. No manual intervention required.
2. ☐ **BRAND_FACTS + CITATION_LIBRARY consumed at run time**, not hardcoded into the system prompt. Editing `BRAND_FACTS.md` and re-running the CI sync changes the next article's behavior.
3. ☐ **Citation rotation enforced** — last-4-articles query runs, agent picks a `primary_citation_id` that doesn't match any of them. R&K 2006 (CIT-001) hard-cap of 1-in-5 enforced even if rotation would allow.
4. ☐ **Image generation produces a 1200x628 final image** (DALL-E generates 1024x1024, publishing endpoint crops/extends), uploaded to Supabase Storage, URL written to `blog_posts.hero_image_url`. Image alt-text written to `blog_posts.hero_image_alt_text`.
5. ☐ **LinkedIn variant produced** in the same agent run, written to `blog_posts.linkedin_variant`, surfaced in the Koda Ops editorial queue alongside the blog draft.
6. ☐ **Editorial pass UI in Koda Ops** shows the 8-item checklist from Section 8 of the strategy doc, captures which items the reviewer checked/edited/rejected, time-stamps the pass duration so we can measure if 5-10 min is realistic.
7. ☐ **Error path tested** — at least one synthetic failure (e.g., simulated Anthropic 429) produces a row in `failed_generations` with retry_count, error_message, step. Verifies the dead-letter pattern works.
8. ☐ **Cron runs at scheduled time** (Mon + Thu 15:00 UTC) without manual trigger. Workflow appears in GitHub Actions tab as a successful run.

When all 8 pass → ship to production → enter the 14-day Phase 1 → Phase 2 gate.

---

## Test brief (the canary for Phase 1 acceptance)

Use this brief as the end-to-end test before declaring Phase 1 done. It's deliberately representative of typical pipeline output — not an edge case.

```json
{
  "id": "test-001",
  "cluster": "star-method",
  "target_keyword": "STAR method examples senior engineer",
  "long_tail": "3 STAR examples for senior engineers",
  "target_word_count": 1200,
  "intent": "informational",
  "pillar_url": "/star-method-guide",
  "expected_primary_citation": "CIT-002 OR CIT-004 (rotation-permitting)",
  "rejection_test_metadata": {
    "should_succeed": true,
    "expected_byline": "InterviewAnswers Editorial Team",
    "expected_schema_type": "Organization"
  }
}
```

Acceptance flow:
1. Run the agent against this brief (manual `workflow_dispatch` trigger in GitHub Actions)
2. Verify the agent's output sections (`---TITLE---` through `---LINKEDIN_VARIANT---`) all parse cleanly
3. Verify Supabase row in `blog_posts` has all 7 new columns populated (hero_image_url, hero_image_alt_text, linkedin_variant, primary_citation_id, cluster='star-method', unique_element, internal_links)
4. Open the draft in Koda Ops, run the 8-item editorial pass, approve
5. Verify article publishes to `/blog/3-star-examples-for-senior-engineers` (or similar slug)
6. Verify JSON-LD on the published page contains `Organization` schema with the Editorial Team byline (not Person)
7. Spot-check the LinkedIn variant — does it match the blog article's core argument with a different angle?

If all 7 pass → Phase 1 acceptance check #1 is GREEN. Move to checks 2-8.

---

## briefs.json migration note

Your v1 `briefs.json` has briefs without the `cluster` field. Phase 1 requires every brief to declare its cluster (one of the 7 canonical values: `star-method`, `tell-me-about-yourself`, `behavioral-interview`, `mock-interview-practice`, `ethics`, `interview-anxiety`, `industry-specific`).

**Migration approach:** manual. The file is small, version-controlled, and human-readable. Add the `cluster` field to each existing brief in a PR. Don't write migration code for a one-time edit.

The database constraint (`blog_posts_cluster_canonical`) enforces the canonical 7 values — if you accidentally put `cluster: "anxiety"` instead of `cluster: "interview-anxiety"`, the publish step fails with a constraint violation. The agent's pre-flight should validate the brief's cluster field against the same enum BEFORE making any API call (saves $0.05 per misconfigured brief).

---

## Files I've created for you to consume

These are net-new files in `docs/content_engine/`:

| File | Purpose | Lines |
|---|---|---|
| `BRAND_FACTS.md` v1.5 | Source-of-truth for facts, banned words, byline rules | ~250 |
| `CITATION_LIBRARY.md` | 15 verified citations, rotation rules | ~330 |
| `CONTENT_ENGINE_V2_STRATEGY.md` | Full strategic spec including System Prompt v2 (Section 6), cluster map (Section 7), editorial standards (Section 8), distribution chain (Section 9) | ~870 |
| `IMAGE_PROMPT_TEMPLATE.md` | DALL-E 3 style direction + 3 example prompts + alt-text rules | ~140 |
| `MIGRATIONS_PHASE1.sql` | DDL for new blog_posts columns + failed_generations table + rejected_drafts table + content_engine_config table + cluster constraint | ~150 |
| `JACOB_HANDOFF_v2.md` (this file) | Your read-this-first handoff | ~450 |

Total reading time: ~30 min for `JACOB_HANDOFF_v2.md` and skimming the rest. Full deep-read of the strategy doc: ~45 min.

---

## Key technical decisions you'll need to make

### Where does `BRAND_FACTS.md` live?

I put it in `docs/content_engine/BRAND_FACTS.md` so it's version-controlled. The writing agent (running on Vercel cron presumably) needs to READ it at run time.

Options:
- **A.** Agent reads from GitHub raw URL (e.g., `raw.githubusercontent.com/alshcampos-cloud/isl-app/main/docs/content_engine/BRAND_FACTS.md`). Slow but no infra change.
- **B.** Agent reads from a Supabase `content_engine_config` table that's synced from the repo (CI job updates it on every push to main). Faster, more reliable.
- **C.** Agent bundles BRAND_FACTS.md into its deploy artifact. Stalest — only updates when the agent re-deploys.

My pick: **B.** Set up a tiny CI step that copies these 3 files into a Supabase table whenever they change on main. Agent reads from Supabase. ~30 min to wire.

### Citation rotation tracking

Simplest: add `primary_citation_id` column to `blog_posts` table. Agent queries the last 4 published articles' `primary_citation_id` before picking its own. Enforces the rotation rule.

### Image storage

Supabase Storage public bucket. Cost: negligible. Image URLs are fast-CDN'd via Supabase.

### LinkedIn variant storage

Option A: new `linkedin_drafts` table.
Option B: new column `linkedin_variant` on `blog_posts`.

My pick: **B.** Same lifecycle as the blog post.

---

## How I want the editorial pass to work in Koda Ops

When you open a draft in the queue, you should see:

```
┌─────────────────────────────────────────────────┐
│ DRAFT: how-to-stop-freezing-in-interviews       │
│ Cluster: Anxiety / Performance                  │
│ Primary citation: CIT-007 Brooks 2014           │
│ Word count: 1,180 (in range)                    │
│ Hero image: [thumbnail]                         │
├─────────────────────────────────────────────────┤
│ [Article text — scrollable]                     │
├─────────────────────────────────────────────────┤
│ EDITORIAL PASS — check each:                    │
│ ☐ 1. Read top-to-bottom out loud (1 min)        │
│ ☐ 2. Edit 2-3 sentences for real voice (3 min)  │
│ ☐ 3. Verify citation matches CIT-007 claim      │
│ ☐ 4. Defamation check (named person/co. sourced)│
│ ☐ 5. Accept/edit 3 internal link suggestions    │
│ ☐ 6. Image review                               │
│ ☐ 7. Meta description clickability              │
│ ☐ 8. CTA review                                 │
│ ☐ 9. Final sanity                               │
│                                                  │
│ [Edit body] [Approve] [Reject (reason→)]        │
├─────────────────────────────────────────────────┤
│ LINKEDIN VARIANT preview:                       │
│ [300-word LinkedIn version]                     │
│ [Edit] [Approve LinkedIn separately]            │
└─────────────────────────────────────────────────┘
```

Both the blog draft AND the LinkedIn variant go through the same Jacob approval gate.

---

## Token / API cost math (final v2 numbers)

| Service | Per article | 8 articles/mo | 20 articles/mo |
|---|---|---|---|
| Claude Haiku 4.5 (text gen) | $0.008 | $0.064 | $0.16 |
| Claude Haiku 4.5 (LinkedIn variant — extra ~400 output tokens) | $0.002 | $0.016 | $0.04 |
| DALL-E 3 standard ($0.040 / 1024x1024) | $0.040 | $0.32 | $0.80 |
| OpenAI text-embedding (if used for cluster routing similarity) | ~$0.0001 | negligible | negligible |
| **Total per article** | **$0.05** | **$0.40** | **$1.00** |

Still effectively rounding error. The constraint is your time, not API spend.

---

## Build sequencing — concrete week-by-week

### Week 1 (this week, while Lucas reviews approvals)
- Wire BRAND_FACTS + CITATION_LIBRARY into agent at run time
- Build `/about/editorial` page
- Add image generation step (OpenAI DALL-E 3 API)
- Update Supabase schema (`hero_image_url`, `linkedin_variant`, `primary_citation_id` columns)

### Week 2 (Lucas approves over the weekend)
- Implement citation rotation logic (last 4 articles check)
- Implement cluster routing (briefs declare cluster, agent uses it)
- Build LinkedIn variant generation
- Build internal link suggestion logic

### Week 3
- Build editorial pass UI in Koda Ops
- Integration testing — run 5 test briefs end-to-end
- Phase 1.5 ships

### Week 4+ (Phase 2)
- GSC brief generator with improved scoring
- Distribution chain prep

### Month 2+ (Phase 3)
- Citation verification
- Measurement loop
- Distribution chain ships

---

## Things you might disagree with / want to push back on

I want your honest take on these. If you have better thinking, override:

1. **B vs A vs C for BRAND_FACTS hosting** — I picked Supabase-synced because of reliability, but A (raw GitHub URL) is simpler. Your call.

2. **Image strategy MVP scope** — I said "hero image only" for MVP. You could argue for in-line diagrams too (more SEO lift but more agent complexity). What's the right tradeoff?

3. **LinkedIn variant generation in same agent run vs separate run** — I put it in same run for simplicity. You might argue separate run for better optimization. Your call.

4. **Editorial pass time estimate** — I said 5-10 min. If your reality is more like 3-5 min, that's fine — but be honest about whether 3 min is REAL editorial or pattern matching.

5. **Internal link auto-suggest vs auto-add** — I said suggest, you approve. You might argue auto-add (with editorial override). Risk: bad internal links hurt SEO. Conservative is fine.

6. **Citation library size** — 15 is the minimum. If you find we're hitting rotation limits, we expand. Each new citation needs Lucas approval (15 min).

7. **The 14-day gate before Phase 2** — feels right to me but you might want longer or shorter. The principle: prove Phase 1 quality before adding scoring complexity.

---

## Questions to come back with

Send Lucas your answers when you've read the strategy doc:

1. Do you agree with the 12 upgrades? Anything you'd cut?
2. Do you agree with the phase sequencing?
3. Anything in BRAND_FACTS that's wrong / missing / needs Lucas to verify?
4. Are there citations in CITATION_LIBRARY that have problems I didn't catch?
5. Does the system prompt v2 still match what you envisioned, or am I over-prescribing structure?
6. What's the right hosting choice for BRAND_FACTS (A/B/C above)?

---

## What this UNLOCKS

If we do this right, by Day 90 of operation:

- 20-30 articles published, each with editorial quality
- ≥10 articles ranking in top 30 (GSC visible)
- ~500/month organic clicks from articles
- ~5 paid customers/month attributable to organic content
- ~$200/month revenue from organic, ~$2,400/year run rate
- A LinkedIn feed that publishes regularly with real engagement
- A measurement loop that tells us which content actually works

Then we scale. By month 12, organic should be a $20-50K/year channel — bigger than any paid channel will be at our current ad budget.

---

## What I need from you in the next 7 days

1. Read `docs/content_engine/CONTENT_ENGINE_V2_STRATEGY.md` in full
2. Send me your honest pushback on anything you disagree with
3. Start Phase 0.5 (`/about/editorial` + byline schema) — doesn't need approvals
4. Wire BRAND_FACTS + CITATION_LIBRARY consumption into the agent

I'll have the 7 approvals back to you by Sunday evening with any edits.

— Lucas
