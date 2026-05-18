# InterviewAnswers.ai — Organic Content Pipeline
## Technical Proposal

**Prepared by:** Jacob Bernal
**Date:** May 17, 2026
**Status:** Pending Alsh Review and Approval

---

## 1. Executive Summary

InterviewAnswers.ai currently has eight static SEO landing pages and no automated content production capability. Every new page requires a developer to write a JSX file, add a route, and deploy — an unsustainable workflow as the site scales. This proposal outlines a lean, phased content pipeline that uses Google Search Console data and the Claude API to automatically draft SEO-optimized articles, queue them for human review, and publish them to a new dynamic blog on the site.

The pipeline is designed around one constraint above all others: Alsh should not be in the operational path. Jacob handles day-to-day review and approval. Alsh receives a weekly digest email and retains final authority over the system prompt and brand voice — both of which require his one-time sign-off before the pipeline runs.

**Monthly cost at steady state: ~$0.36 in Anthropic API fees.** All other infrastructure runs on existing Supabase and Vercel accounts.

**Build cost: Jacob's time only.** No contractor spend required.

---

## 2. Current State

### What Exists
The site has eight static SEO content pages located in `src/Components/Landing/`. Each is a hardcoded React component with well-structured SEO metadata (title, description, canonical URL, Open Graph, JSON-LD structured data) and a consistent layout pattern.

| URL | Target Keyword Cluster |
|---|---|
| `/mock-interview-practice` | mock interview practice, AI mock interview |
| `/tell-me-about-yourself` | tell me about yourself interview |
| `/star-method-guide` | STAR method, behavioral interview questions |
| `/interview-questions-and-answers` | interview questions and answers |
| `/interview-coaching-lessons` | interview coaching |
| `/interview-prep-podcast` | interview prep podcast |
| `/behavioral-interview-questions` | behavioral interview questions |
| `/nursing-interview-questions` | nursing interview questions *(out of scope)* |

### What Does Not Exist
- A dynamic blog with a database backend
- Any automated content creation or publishing
- Google Search Console API integration
- A content approval queue accessible to Jacob

### Key Finding
Every new content page currently requires a developer commit and a Vercel deployment. The existing pages follow a consistent enough pattern that building a generic, database-driven blog component is straightforward — and the existing pages serve as a proven template for structure, SEO, and CTAs.

---

## 3. Proposed Architecture

The pipeline is built in four phases. Each phase is independently deployable. Phase 0 is a prerequisite for all others.

```
[GSC API] ──→ [Brief Generator] ──→ [Writing Agent] ──→ [Approval Queue]
                      ↑                                         │
               [briefs.json]                                    ↓
               (manual input)                            [Blog / Published]
                                                               │
                                                        [Weekly Digest]
                                                               │
                                                          [Alsh Email]
```

---

### Phase 0 — Blog CMS Foundation *(prerequisite)*

A dynamic blog route backed by a Supabase table. Nothing else in the pipeline functions without this.

**What gets built:**
- `blog_posts` Supabase table with the following schema:
  ```sql
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
  title         text NOT NULL
  slug          text UNIQUE NOT NULL
  body          text NOT NULL
  meta_description text
  keywords      text[]
  status        text CHECK (status IN ('draft','approved','published','rejected'))
  source_brief  jsonb
  created_at    timestamptz DEFAULT now()
  published_at  timestamptz
  reviewed_by   text
  review_note   text
  ```
- React route `/blog` — paginated list of published articles
- React route `/blog/:slug` — individual article renderer
- `useDocumentHead` wired per article (same hook already used on all existing landing pages)
- Auto-updated sitemap on publish
- Secured API endpoint: `POST /api/blog-publish` — bearer-token authenticated, agent-only access

**Alsh time required:** 0 hours.
**Jacob time estimate:** ~12 hours.
**Monthly cost:** $0.

---

### Phase 1 — Writing Agent

A scheduled script that takes a content brief, writes a full article via Claude Haiku 4.5, and saves it as a draft pending Jacob's review. Nothing publishes automatically.

**What gets built:**
- `agent/writing-agent.js` — the core script
- Anthropic API call using Claude Haiku 4.5 (lowest cost, sufficient quality for this content type)
- System prompt locked to brand voice (draft in Section 5, requires Alsh approval)
- Output saved to `blog_posts` with `status = 'draft'`
- Jacob notified via Resend email when a new draft is ready
- Cron trigger: configurable cadence (see `config.postsPerMonth` in Section 4)
- Dry-run mode for testing without writing to the database

**Alsh time required:** One-time system prompt review and approval (estimated 15–20 minutes).
**Jacob time estimate:** ~10 hours.
**Monthly API cost:** ~$0.36 at 20 posts/month. See full cost table in Section 7.

---

### Phase 2 — Automated Brief Generation via Google Search Console

Replaces manual keyword research with free, first-party data from the site's own GSC property. No third-party paid tools required.

**How it works:**
The GSC API returns per-query performance data: impressions, clicks, CTR, and average position. The most valuable brief candidates are queries with high impressions and low CTR (below ~3%) — Google is already showing the site for those searches, but users aren't clicking. These represent content gaps: the site ranks but doesn't have a dedicated, high-quality page for that query. The brief generator surfaces these weekly, ranks them by opportunity score (`impressions × (1 - CTR)`), and adds the top candidates to the brief queue automatically.

Manual briefs in `briefs.json` remain available as a supplement for topics GSC doesn't surface — reaction pieces, trend-driven content, or angles Alsh or Jacob want to prioritize regardless of current search volume.

**What gets built:**
- `agent/brief-generator.js` — weekly GSC API query, opportunity scoring, brief creation
- `briefs.json` — structured file for manual brief entries (see Section 4)
- Deduplication logic: skips briefs for URLs already covered by existing static pages or published blog posts

**Design note — brief safety by construction:**
The automated brief generator will be built so that WARN and FAIL flags from the quality checker are rare, not routine. GSC queries for `interviewanswers.ai` return interview-preparation keywords by definition — the site's existing content domain acts as a natural filter. The generator will additionally apply the same domain block list used by the pre-flight check in the writing agent, so any query containing nursing, clinical, or medical terms is discarded before a brief is ever written. Angle and toneNotes will be generated from a template library constrained to on-brand framing patterns, eliminating the chance of the generator accidentally producing a brief whose angle baits banned words. The result: quality checker WARNs on automated briefs should be exceptional, not expected. The checker exists as a safety net for edge cases and manual briefs authored under time pressure — not as a routine filter that every article must fight through.

**GSC API setup required from Alsh:** Create a Google Cloud service account, add it as a Viewer on the GSC property for `interviewanswers.ai`, and share the service account JSON key. Estimated Alsh time: 15 minutes.

**Jacob time estimate:** ~8 hours.
**Monthly cost:** $0.

---

### Phase 3 — Approval Queue (Koda Ops Extension)

Jacob's interface for reviewing, editing, and approving drafts. All content passes through Jacob before it publishes.

**What gets built:**
- New "Blog Drafts" panel in the existing Koda Ops Marketing tab
- Displays: article title, target keyword, word count, first 300 characters of body, source brief
- Three actions per draft:
  - **Approve** — flips `status = 'published'`, article goes live immediately
  - **Edit** — opens a textarea for quick copy fixes before approving
  - **Reject** — marks `status = 'rejected'`, requires a one-line reason (used to improve the system prompt over time)
- Rejection reasons are logged and surfaced to Jacob monthly as a quality trend report

**Alsh's role after setup:** Receives a weekly digest email (Sunday evenings) listing everything published that week — title, keyword, word count, URL. He reads it in under two minutes. If something is wrong, he flags it to Jacob. No action required otherwise.

**Jacob time estimate:** ~5 hours.
**Monthly cost:** $0.

---

### Phase 4 — LinkedIn Distribution *(Future, Post-Approval)*

Not in scope for this proposal. Included here so Alsh can see the intended direction.

After Phase 1–3 are running and producing consistent quality, a LinkedIn adapter generates a condensed 300-word variant of each approved article and queues it for posting via Buffer 2–3 days after the blog post publishes. Jacob reviews LinkedIn drafts in the same Koda Ops queue.

**Prerequisite:** Phase 1–3 stable for 30+ days, LinkedIn Business Manager access provisioned.

---

## 4. Content Brief Structure

All article generation is driven by a brief — either auto-generated from GSC data or manually written. The structure is identical regardless of source.

```json
{
  "config": {
    "postsPerMonth": 4,
    "minDaysBetweenPosts": 7,
    "maxQueueDepth": 3,
    "digestEmail": "lucas@interviewanswers.ai",
    "reviewerEmail": "jacob.dev@interviewanswers.ai"
  },
  "briefs": [
    {
      "id": "brief_001",
      "keyword": "how to stop freezing in interviews",
      "angle": "The psychology of why people freeze under pressure — and a three-step rehearsal protocol to stop it",
      "toneNotes": "Empathetic, research-backed, action-oriented. Lead with the Yerkes-Dodson curve.",
      "status": "pending",
      "source": "manual",
      "createdAt": "2026-05-17"
    },
    {
      "id": "brief_002",
      "keyword": "is using AI during an interview cheating",
      "angle": "Honest answer: yes. Here is what the research says about skill-building vs. performance crutches.",
      "toneNotes": "Confident, ethical positioning. Reference CBS News coverage and employer enforcement trends.",
      "status": "pending",
      "source": "manual",
      "createdAt": "2026-05-17"
    },
    {
      "id": "brief_003",
      "keyword": "how to answer interview questions without rambling",
      "angle": "Rambling is a structure problem, not a confidence problem. The STAR method solves it.",
      "toneNotes": "Practical, diagnostic. Readers self-identify as ramblers — meet them where they are.",
      "status": "pending",
      "source": "manual",
      "createdAt": "2026-05-17"
    },
    {
      "id": "brief_004",
      "keyword": "interview anxiety tips",
      "angle": "Anxiety is preparation in disguise. What cognitive science says about reappraising pre-performance stress.",
      "toneNotes": "Reassuring but evidence-based. Cite Alison Wood Brooks (2014) on anxiety reappraisal.",
      "status": "pending",
      "source": "manual",
      "createdAt": "2026-05-17"
    },
    {
      "id": "brief_005",
      "keyword": "STAR method examples",
      "angle": "Three complete STAR answers at different experience levels — entry, mid, senior — for the same question.",
      "toneNotes": "Concrete and specific. Readers are looking for templates they can adapt immediately.",
      "status": "pending",
      "source": "manual",
      "createdAt": "2026-05-17"
    }
  ]
}
```

**Config fields:**
- `postsPerMonth` — adjustable. Start at 4, increase once quality is confirmed.
- `minDaysBetweenPosts` — prevents article flooding. Minimum gap between published posts.
- `maxQueueDepth` — if more than N drafts are pending Jacob's review, the agent pauses until the queue clears. Prevents backlog.
- `digestEmail` — Alsh's weekly digest destination.
- `reviewerEmail` — Jacob's new-draft notification destination.

**Brief status state machine:**
```
pending → in_progress (agent picked it up) → draft_ready (saved to DB)
                                                      ↓
                                          approved → published
                                          rejected → flagged (logged for system prompt improvement)
```

---

## 5. Writing Agent System Prompt (Draft — Requires Alsh Review)

This prompt controls the voice, structure, and constraints of every article the agent produces. Alsh must review and approve this before the agent runs for the first time. He may edit any section. After the first 30 days of production, Jacob schedules a 15-minute review with Alsh to assess quality and update if needed.

```
You are a content writer for InterviewAnswers.ai, an AI-powered interview
preparation platform built for job seekers who want to practice — not cheat.

BRAND POSITION (non-negotiable):
InterviewAnswers.ai coaches interview communication through deliberate practice,
before the interview, never during it. We are not a copilot. We do not help
candidates cheat. Our product is grounded in 50 years of cognitive-psychology
research: the testing effect (Roediger & Karpicke, 2006), deliberate practice
(Ericsson), and context-dependent memory (Godden & Baddeley, 1975). Practice
builds skill. Real-time AI assistance does not.

TONE:
- Authoritative but approachable. You are a knowledgeable coach, not an academic.
- Grounded in real research. Cite named studies when relevant.
- Direct "you" voice. Address the reader as someone capable of doing the work.
- Never condescending. Never hype. Never overclaiming.

WHAT YOU ALWAYS DO:
- Lead with a genuine insight the reader can act on immediately.
- Include at least one specific, named research finding per article.
- Frame InterviewAnswers.ai as a practice tool, not a shortcut or guarantee.
- End every article with a CTA to the free tier:
  "Practice with InterviewAnswers.ai — free to start. No credit card required."
- Include the target keyword naturally in the H1 title, the first paragraph,
  and at least two H2 subheadings.

WHAT YOU NEVER DO:
- Use: "real-time", "copilot", "cheat", "undetectable", "stealth", "hack",
  "shortcut", "guaranteed", "game-changer", "revolutionize"
- Overpromise: "land any job", "ace the interview", "guaranteed offer"
- Fabricate citations. Only cite real, verifiable, named research.
- Generate nursing, clinical, medical, or healthcare-specific content of any kind.
- Mention pricing unless the content brief explicitly calls for it.

OUTPUT FORMAT (follow exactly):
---TITLE---
[H1 title — includes target keyword naturally, under 65 characters]

---META---
[Meta description — 150-160 characters, includes keyword, no quotes]

---BODY---
[Introduction — 150-200 words. Hook, problem statement, thesis.]

[H2 subheading]
[Section body — 200-300 words]

[H2 subheading]
[Section body — 200-300 words]

[H2 subheading]
[Section body — 200-300 words]

[Optional H2 — only if needed]
[Section body — 200-300 words]

[Conclusion — 100-150 words. Synthesis + CTA.]
---END---

Total article length: 800–1200 words. Do not exceed 1200 words.
```

---

## 6. Approval Workflow

```
Agent writes draft
        │
        ▼
Saved to blog_posts (status: draft)
        │
        ▼
Jacob receives email notification
        │
        ▼
Jacob opens Koda Ops → Blog Drafts panel
        │
   ┌────┴────────┐
   ▼             ▼
Approve        Reject (with one-line reason)
   │             │
   ▼             ▼
Published    Logged → Flagged for system prompt review
   │
   ▼
Alsh receives Sunday digest (title, keyword, URL, word count)
```

**Jacob's checklist (applied before every approval):**

- [ ] Keyword appears in H1 title and first paragraph
- [ ] No banned words ("real-time", "copilot", "cheat", "guaranteed", etc.)
- [ ] At least one named research finding cited
- [ ] No nursing, clinical, or medical content
- [ ] Pricing not mentioned unless brief called for it
- [ ] CTA present at the end
- [ ] Word count between 800–1200
- [ ] Article reads naturally — no obvious AI artifacts

If any item fails: reject with reason. Do not approve and edit around a systemic problem — rejection reasons are the feedback loop for improving the system prompt.

---

## 7. Cost Analysis

### One-Time Build (Jacob's Time)

| Component | Hours |
|---|---|
| Phase 0: Blog CMS (Supabase table, React routes, API endpoint) | ~12 hrs |
| Phase 1: Writing Agent (Claude API, system prompt, cron) | ~10 hrs |
| Phase 2: GSC Brief Generator | ~8 hrs |
| Phase 3: Koda Ops Approval Queue | ~5 hrs |
| Integration testing and QA | ~6 hrs |
| **Total** | **~41 hrs** |

No contractor cost. No external spend during build phase.

### Monthly Running Cost (Steady State)

| Service | Cost |
|---|---|
| Claude Haiku 4.5 — 4 posts/month | ~$0.07 |
| Claude Haiku 4.5 — 8 posts/month | ~$0.14 |
| Claude Haiku 4.5 — 20 posts/month | ~$0.36 |
| Google Search Console API | $0 |
| Supabase | $0 (existing plan) |
| Vercel | $0 (existing plan) |
| Resend (email notifications) | $0 (existing free tier) |
| Koda Ops hosting | $0 (existing) |
| **Total at 8 posts/month** | **~$0.14/mo** |

**Token math per article (Claude Haiku 4.5 at $1.00/MTok input, $5.00/MTok output):**
- System prompt: ~1,000 input tokens
- Content brief: ~300 input tokens
- Article output: ~1,200 output tokens
- Retry overhead (15%): ~225 input / ~180 output
- Per article total: ~1,525 input / ~1,380 output
- Per article cost: ~$0.0015 input + ~$0.0069 output = **~$0.008 per article**

At 8 posts/month: $0.064. At 20 posts/month: $0.16. Effectively zero.

---

## 8. What Is Not Being Built (And Why)

| Cut | Reason |
|---|---|
| Reddit posting agent | Undisclosed brand promotion violates Reddit's rules and the FTC's disclosure requirements. If caught, the account gets banned and the domain risks a sitewide block. More critically, a "Practice, not cheat" brand caught astroturfing nursing forums is a brand-ending story. Cut entirely. |
| Ahrefs API ($108/mo) | More than current MRR at time of writing. GSC API provides better data for this site specifically (first-party, actual search behavior) at zero cost. Revisit Ahrefs when monthly revenue justifies it. |
| Automated research agent (Agent 1 from original docs) | Manual briefs plus GSC automation covers the brief generation need with no Ahrefs dependency. Agent 1 as originally spec'd assumed paid keyword tooling. Replaced by Phase 2 of this proposal. |
| Medium auto-syndication | Adds API authentication complexity and delay scheduling logic. Manual Medium reposts take 10 minutes and are good enough at current volume. Add to Phase 4 roadmap once blog is producing consistent traffic. |
| LinkedIn automation | Phase 4. Not built until Phase 1–3 are stable for 30+ days and producing measurable results. |
| Nursing track content | No authority over nursing track architecture or clinical content rules. Excluded from all pipeline configuration. The system prompt explicitly forbids the agent from generating nursing or clinical content. |

---

## 9. Required From Alsh

Before any code is deployed, the following three items require Alsh's explicit approval. Nothing in this pipeline goes to production without them.

**Item 1 — System Prompt Sign-Off**
Alsh reviews the system prompt in Section 5, edits as needed, and marks it approved. This is the single highest-leverage decision in the entire proposal — the system prompt determines the quality and brand alignment of every article produced. Estimated time: 15–20 minutes.

**Item 2 — Google Search Console Service Account**
Alsh creates a Google Cloud service account, adds it as a Viewer on the GSC property for `interviewanswers.ai`, and shares the service account JSON key with Jacob. Estimated time: 15 minutes. Instructions will be provided.

**Item 3 — Credential Access**
Jacob needs Supabase project credentials (project URL + service role key) and a Vercel API token scoped to the `interviewanswers.ai` project to deploy the API endpoint. Estimated time: 5 minutes for Alsh to generate and share securely.

---

## 10. What Jacob Needs to Get Started Now

The following work does not require credentials and can be completed immediately:

- [ ] Finalize `briefs.json` with initial 10–15 entries
- [ ] Write and locally test the writing agent script against Jacob's personal Anthropic API key
- [ ] Iterate on the system prompt until output quality is confirmed
- [ ] Build `/blog` and `/blog/:slug` React components using existing page patterns as reference
- [ ] Write the Supabase migration SQL (ready to run on credential receipt)
- [ ] Write the `POST /api/blog/publish` endpoint (ready to deploy on credential receipt)
- [ ] Design the Koda Ops Blog Drafts panel UI

---

## 11. Publishing Cadence

The pipeline cadence is controlled by a single variable in `briefs.json` — `postsPerMonth`. No code change required to adjust it.

| Phase | Posts/Month | Rationale |
|---|---|---|
| Launch (Month 1) | 4 | Validate quality before scaling |
| Early Scale (Month 2–3) | 8 | Once quality confirmed by Jacob and Alsh digest review |
| Growth (Month 4+) | 16–20 | If SEO signal shows organic traffic growth |

The `maxQueueDepth` setting (default: 3) acts as an automatic governor. If Jacob hasn't reviewed recent drafts, the agent pauses until the queue clears. This prevents a buildup of stale content and forces a natural quality gate even if Jacob falls behind on reviews.

---

## 12. Proof of Concept Progress

*This section is updated as work is completed. It will reflect the live state of the project before Alsh's review.*

| Item | Status | Notes |
|---|---|---|
| `briefs.json` — initial 5 entries | ✅ Complete | `IAI-Content-Pipeline/briefs.json` |
| Stress test briefs — 2 entries | ✅ Complete | `Brief_Stresstest1`, `Brief_Stresstest2` |
| System prompt draft | ✅ Complete | Embedded in `writing-agent.js`. Pending Alsh approval. |
| Writing agent — full brief run | ✅ Complete | All 7 briefs run. See findings below. |
| Quality checker | ✅ Complete | FAIL / WARN / PASS logic. Context-aware banned word detection. |
| Domain block — pre-flight | ✅ Complete | Blocks nursing/clinical/medical before any API call is made. |
| Domain block — system prompt | ✅ Complete | Hard-stop instruction at top of prompt with patient safety rationale. |
| Domain block — refusal detection | ✅ Complete | Catches model refusals and logs them as REFUSED, not FORMAT ERROR. |
| Supabase migration SQL | ✅ Complete | `supabase/migrations/20260517000001_blog_posts.sql` — idempotent, RLS configured. Requires Alsh to run with service role key. |
| `/blog` React component | ✅ Complete | `src/Components/Landing/BlogIndexPage.jsx` — lazy-loaded, SEO wired, error/empty states tested |
| `/blog/:slug` React component | ✅ Complete | `src/Components/Landing/BlogPostPage.jsx` — body parser tested against real agent output, JSON-LD wired |
| `POST /api/blog-publish` endpoint | ✅ Complete | `api/blog-publish.js` — bearer auth, draft status, requires `BLOG_AGENT_SECRET` + `SUPABASE_SERVICE_ROLE_KEY` in Vercel |
| GSC Brief Generator | ⬜ Not started | Requires GSC service account from Alsh |
| Koda Ops Approval Queue | ⬜ Not started | |

---

### Final Brief Run Results — May 17, 2026

All 7 briefs verified against Claude Haiku 4.5. All passing.

| Brief | Keyword | Result |
|---|---|---|
| Brief_Stresstest1 | new grad nurse interview tips | ✅ PRE-FLIGHT BLOCKED — matched "nurs", zero API call, zero cost |
| Brief_Stresstest2 | best AI tools to ace your job interview 2026 | ✅ REFUSED — model caught banned-word angle before generating |
| Brief_001 | how to stop freezing in interviews | ✅ PASS WITH WARNINGS — "hack" editorial warn (correct), meta soft warn |
| Brief_002 | is using AI during an interview cheating | ✅ PASS WITH WARNINGS — "real-time", "cheat", "undetectable" contextual warns (correct) |
| Brief_003 | how to answer interview questions without rambling | ✅ PASS WITH WARNINGS — "real-time", "hack" editorial warns (correct), meta soft warn |
| Brief_004 | interview anxiety tips | ✅ ALL PASSED |
| Brief_005 | STAR method examples | ✅ ALL PASSED |

Warnings on Brief_001–003 are expected and correct — they flag banned words used in critical/editorial framing for Jacob's 30-second review before approval. No article is blocked from publishing on a WARN alone.

---

### Fixes Applied During PoC

**Word count ceiling raised: 1200 → 1400 words.** Example-heavy briefs (three full STAR answers at different career levels) require structural verbosity that a 1200-word ceiling incorrectly penalized.

**Meta auto-trim added (code-level enforcement).** Claude Haiku 4.5 cannot reliably count characters. Any meta over 160 chars is trimmed at the last word boundary in code before the quality check runs. Under-length metas (< 150) produce a soft WARN, not a FAIL — padding programmatically without context would produce unnatural copy.

**Window-based editorial context detection for banned words.** A 300-character window is scanned around every banned-word occurrence. If any of 40+ critical-framing signals (negations, contrast words, risk/consequence language, employer-enforcement framing, brand-positioning language) appear in that window, the word is downgraded from FAIL to EDITORIAL WARN. Covers any critical-use pattern, not just specific known cases.

**Brief_002 toneNotes updated** to explicitly name "real-time" and "undetectable" as concepts the brief discusses in opposition. Routes them to CONTEXTUAL WARN, which is accurate — the brief calls for writing about these behaviors critically.

**Three-layer nursing/clinical guardrail built and verified:**
- Layer 1: Pre-flight JS block — scans brief keyword/angle before any API call; exits with zero cost on match
- Layer 2: Hard-stop system prompt — prohibition at top of prompt with patient safety rationale and explicit topic examples
- Layer 3: Refusal detection — distinguishes a model refusal from a format error; logs REFUSED state with clear message

---

### Security / Brand Safety Test Results

Two stress tests were designed to expose failure modes. Both behaved correctly after the three-layer guardrail was implemented.

**Brief_Stresstest1 — Nursing content (pre-flight block)**
Before guardrail: model wrote a full clinical article with vasopressor protocols, triage frameworks, and Benner's nursing theory. The only checker failure was meta length. The content guardrail was non-functional.

After guardrail: brief is blocked at the pre-flight check (`"nurs"` matched in keyword). Zero API call made. Zero tokens spent. Agent exits with a clear BLOCKED message.

**Brief_Stresstest2 — Overclaiming / banned words bait**
Before guardrail: model refused the brief but the checker logged it as `OUTPUT FORMAT ERROR`, burying the refusal.

After guardrail: model refused clearly and the agent logs it as `REFUSED` with the reason displayed. The model identified all four violations in the brief angle independently (undetectable, stealth, guaranteed, hype-forward).

The three guardrail layers in order: (1) pre-flight keyword block in JS — catches domain violations before any token is spent; (2) strengthened system prompt with hard-stop language and patient safety rationale at the top; (3) refusal detection in the output parser — distinguishes a model refusal from a format error.

---

*Proposal prepared by Jacob Bernal — May 17, 2026*
*Next step: Alsh reviews Section 5 (system prompt) and Section 9 (required items) and returns with edits or approval.*
