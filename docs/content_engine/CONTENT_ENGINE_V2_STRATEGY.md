# InterviewAnswers.ai — Content Engine v2 (Strategy & Specification)
**Status:** REVIEW — Lucas's revision of Jacob's proposal. Not yet sent to Jacob.
**Date:** 2026-05-23
**Author:** Lucas + Claude
**Supersedes:** Jacob's "Organic Content Pipeline" proposal (2026-05-17)

---

## 1. What this document is

Jacob's v1 proposal is a solid technical foundation — the architecture is right, the PoC works, the guardrails are real. **This document keeps all of that and upgrades it from a "publishes posts" pipeline to a content engine that can actually rank in 2026.**

Three working principles:
1. **Don't waste Jacob's PoC.** Phase 0 (blog CMS), three-layer guardrails, quality checker, and the pre-flight nursing block all ship as-is.
2. **AI generates the scaffold; humans add the moat.** Pure-AI content gets penalized by Google's helpful-content updates. We win by adding 20% original POV per article — founder anecdote, unique citation, real numbers — that no other AI can produce.
3. **Distribution matters more than publication.** A blog post that ships to a blog and dies has done nothing. The pipeline orchestrates publish → tweet → LinkedIn → email → community engagement within 24 hours of approval.

---

## 2. What's preserved from Jacob's v1 (no change needed)

| Item | Why we keep it |
|---|---|
| `blog_posts` Supabase table schema | Well-designed; supports our needs |
| `/blog` + `/blog/:slug` React routes | Match existing page patterns |
| `POST /api/blog-publish` endpoint with bearer auth | Correct security posture |
| Three-layer nursing/clinical guardrail | Critical for walled-garden brand promise |
| Quality checker (FAIL / WARN / PASS) | Catches banned-word framing automatically |
| Pre-flight keyword block (saves API spend before any call) | Smart cost discipline |
| Refusal detection (REFUSED ≠ FORMAT ERROR) | Honest signal of model behavior |
| `briefs.json` structure with config block | Clean separation of strategy from execution |
| `maxQueueDepth` governor | Prevents stale backlog |
| Approval queue UI plan (Koda Ops integration) | Right place for it |
| Cost discipline (Haiku 4.5, GSC API, existing infra) | $0.36/mo at 20 posts/mo is the right number |
| Reddit posting agent NOT built | Correct call — promotional Reddit risks brand-ending account ban |

**Jacob's v1 ships unchanged as Phase 0. Don't rework what works.**

---

## 3. The 12 upgrades

Each upgrade has: WHAT changes, WHY it matters, WHO does it, EFFORT, and SHIPPING PHASE.

### 🔴 BLOCKING — must be in place before any article publishes

#### Upgrade 1 — Brand Facts Card (single source of truth)

**Problem:** "50 years of cognitive psychology research" appeared in the Manifesto (cut), ad copy (Auditor-corrected), and now Jacob's system prompt. **Roediger & Karpicke (2006) is 20 years old, not 50.** Without a single source of truth, this same error will keep reappearing.

**Fix:** Create `docs/content_engine/BRAND_FACTS.md` as the canonical reference for every factual claim the pipeline (or any future copy) might make. Includes:
- Current pricing ($39 / $149) — general track only; nursing pricing intentionally out of scope for the pipeline
- Live-prompter deletion timeline ("approximately April 22, 2026")
- Citation ages (R&K 2006 = 20 years; testing-effect concept = ~85 years if anchored to Spitzer 1939)
- Banned phrases (with the "why" so future contributors understand)
- Brand voice attributes
- Pricing rollout history (so we don't claim "always been $39")

**Pipeline integration:** Writing agent reads `BRAND_FACTS.md` AT RUN TIME and injects relevant facts into the system prompt. When a fact changes, we update one file, not 50 articles.

**Who:** Lucas writes v1 of the card (~30 min). Jacob wires the agent to read it.
**Effort:** 30 min Lucas + 30 min Jacob = 1 hour total
**Ships in:** Phase 1 (before any article writes)

#### Upgrade 2 — Citation Library (rotation, not monoculture)

**Problem:** If every article cites Roediger & Karpicke 2006 as its centerpiece, the corpus reads templated. After 5 articles, the citation loses force.

**Fix:** Create `docs/content_engine/CITATION_LIBRARY.md` with 15+ verified citations across:
- **Testing effect / retrieval practice** (R&K 2006, Karpicke & Roediger 2008, Karpicke & Blunt 2011)
- **Spacing effect** (Spitzer 1939, Cepeda et al. 2008, Bahrick 1979)
- **Deliberate practice** (Ericsson 1993)
- **Desirable difficulties** (Bjork & Bjork 1992, Soderstrom & Bjork 2015)
- **Anxiety reappraisal** (Brooks 2014, Jamieson et al. 2010)
- **Context-dependent memory** (Godden & Baddeley 1975)
- **Make It Stick** (Brown / Roediger / McDaniel 2014 — popular synthesis)
- **Self-efficacy** (Bandura 1977)
- **Yerkes-Dodson** (1908 — performance & arousal)
- **Industry data** (CodeSignal 2025 fraud report; NBC Roy Lee case; specific verifiable stats only)

For each citation: full reference, exact verifiable claim, brand-approved framing, when to use it.

**System prompt requirement:** "Use ONE primary citation per article. Rotate so the same citation appears no more than 1 in 5 articles. The citation must come from `CITATION_LIBRARY.md` — never invent or paraphrase from memory."

**Who:** Lucas/Claude builds the library (~1 hour). Jacob wires rotation logic.
**Effort:** 1 hour Lucas + 1 hour Jacob = 2 hours
**Ships in:** Phase 1

#### Upgrade 3 — Topic cluster map (prevent cannibalization)

**Problem:** Brief #005 is "STAR method examples." We have a static page at `/star-method-guide`. Without explicit topical separation, they fight each other in Google SERPs. Same risk for Brief #001 (interview freezing) overlapping with concepts on `/tell-me-about-yourself`, and Brief #003 (rambling) overlapping with `/behavioral-interview-questions`.

**Fix:** Pillar-and-supporting-content structure:
- **Pillar pages** (existing static landing pages) target the HEAD term of each cluster (`/star-method-guide` → "STAR method")
- **Supporting blog articles** target LONG-TAILS within the cluster ("3 STAR examples for senior engineers")
- Each blog post links UP to its pillar with anchor text matching the pillar's head term
- Pillars get refreshed annually with links DOWN to their best supporting articles

Map (canonical version lives in Section 7 — 7 clusters total, 5 active at launch, 2 future):

| Cluster | Pillar | Status |
|---|---|---|
| STAR Method | `/star-method-guide` | Active at launch |
| Tell Me About Yourself | `/tell-me-about-yourself` | Active at launch |
| Behavioral Interview Q's | `/behavioral-interview-questions` | Active at launch |
| Mock Interview Practice | `/mock-interview-practice` | Active at launch |
| Interview Ethics (our moat) | `/ethics` | Active at launch — highest priority |
| Interview Anxiety / Performance | (build pillar in Phase 2) | Future |
| Industry-Specific Interview Prep | (build pillars when conversion data justifies) | Future |

**Pipeline integration:** Every brief (manual or GSC-derived) declares which cluster it belongs to. Brief generator skips a brief if a published article already covers that long-tail. Internal links generated to point UP to pillar.

**Who:** Lucas approves the cluster map (~15 min). Jacob wires brief → cluster → internal-link logic.
**Effort:** 15 min Lucas + 3 hours Jacob = 3.25 hours
**Ships in:** Phase 1

#### Upgrade 4 — Author byline + E-E-A-T strategy

**Problem:** Google's helpful-content updates (Mar 2024 + ongoing) specifically downrank unauthored AI content. Jacob's v1 has no byline strategy. **Without a real attributed author, articles will sink regardless of quality.**

**Fix:** Adopt a hybrid byline strategy:
- **Default byline:** "InterviewAnswers Editorial Team" with schema.org `Organization` author
- **Founder-voiced articles (FUTURE OPTION, dormant at launch):** "Lucas Campos, Founder" with schema.org `Person` author — infrastructure built but not activated. Switch is one config flag away.
- **At launch, all articles use Editorial Team byline.** Including the /ethics cluster. Org-only is honest E-E-A-T for an unknown founder; loses minimal SEO juice vs personal byline. Can flip later.
- Build a single `/about/editorial` page with two sections at launch: (1) Editorial Team intro paragraph (organization-level — also acknowledges Jacob Bernal as editorial review contractor), (2) Editorial Standards short list (citation discipline, human review, no fabricated sources, corrections email). Anchor IDs `#editorial-team` (active) and `#founder` (reserved for future activation) — both built into the page markup now. Do NOT include co-founder on this page — the content engine is general-track only; the co-founder is associated with the out-of-scope nursing track. Full launch copy lives in `JACOB_HANDOFF_v2.md` Section "What you can build TODAY."

JSON-LD per article:
```json
{
  "@type": "Article",
  "author": {
    "@type": "Person",
    "name": "Lucas Campos",
    "url": "https://www.interviewanswers.ai/about/editorial",
    "jobTitle": "Founder"
  },
  "publisher": {
    "@type": "Organization",
    "name": "InterviewAnswers.ai",
    "url": "https://www.interviewanswers.ai"
  },
  "datePublished": "...",
  "dateModified": "..."
}
```

**Pipeline integration:** Brief specifies byline type. Quality checker requires every article to have a byline + bio link.

**Who:** Lucas approves the byline strategy. Jacob writes the `/about/editorial` page + JSON-LD wiring.
**Effort:** 30 min Lucas + 4 hours Jacob = 4.5 hours
**Ships in:** Phase 0.5 (with blog CMS, before any article publishes)

#### Upgrade 5 — Image strategy

**Problem:** Articles without hero images + in-line visuals underperform organic search 30-50% in 2026. Jacob's v1 ships text only.

**Fix:** Three tiers of visual strategy:
- **Tier 1 (MVP, every article):** Hero image only. Use AI-generated (DALL-E 3 via OpenAI API or Stability AI) with a brand-style prompt template. ~$0.04-$0.08 per image.
- **Tier 2 (after Phase 1 stable):** Hero + 1-2 in-line diagrams. Simple SVG-based or static PNG.
- **Tier 3 (long-term):** Hero + diagrams + interactive elements (the "practice a STAR answer here →" inline widget).

**Image prompt template** (saved as `IMAGE_PROMPT_TEMPLATE.md`):
> "Editorial illustration for a serious interview-preparation article. Style: clean, minimalist, navy and teal color palette (#0d9488 accents on #0a0e1a backgrounds). NO stock-photo people, NO clip-art, NO AI-art tropes (chrome, lens flare, hexagons). Should communicate the concept of [TOPIC] through abstract or symbolic visual metaphor. Square crop, suitable for 1200x628 social and 1280x720 in-article."

**Pipeline integration:** After article approval, agent generates image, uploads to Supabase Storage, attaches URL to article record. Quality checker requires `hero_image_url` not null before publish.

**Who:** Jacob wires image gen call + Supabase Storage. Lucas approves prompt template once.
**Effort:** 4 hours Jacob
**Monthly cost added:** ~$0.50 (8 articles × ~$0.06)
**Ships in:** Phase 1.5

### 🟡 STRATEGIC — turn this into a real content engine

#### Upgrade 6 — Real editorial pass (not a 30-second checklist)

**Problem:** Jacob's v1 has a "30-second review checklist." That's pattern-matching, not editorial. AI content that gets a 30-second review reads like AI content — and Google now penalizes that.

**Fix:** Replace the 30-second checklist with a **5-10 minute editorial pass** per article. This work is JACOB'S, not Lucas's (preserves Lucas-out-of-operational-path constraint).

Editorial pass checklist:
1. **Read top-to-bottom out loud** (catches AI-cadence sentences that don't sound human)
2. **Edit 2-3 sentences** to add Lucas/Jacob's actual voice — humor, real anecdote, real number
3. **Verify the citation exists and the claim is accurate** (check `CITATION_LIBRARY.md`)
4. **Add 2-3 internal links** to other articles or static pillar pages
5. **Replace one generic example with a specific, real one** (e.g., not "a software engineer" → "the senior backend engineer interviewing at fintech")
6. **Check meta description for clickability** (does it make YOU want to click?)
7. **Image review** — does the hero image match the article's framing?
8. **CTA review** — is the CTA at the end specific to this article, or generic?

If all 8 items pass: approve.
If 1-2 fail: edit in queue.
If 3+ fail: reject + log reason → improves system prompt next iteration.

**Pipeline integration:** Koda Ops queue shows the checklist alongside the draft.

**Who:** Jacob does editorial pass. Lucas reviews only the rejection trend report monthly.
**Effort:** ~10 min per article × 8 articles/month = ~1.5 hours/month Jacob
**Ships in:** Phase 1

#### Upgrade 7 — LinkedIn syndication in Phase 1.5 (not Phase 4)

**Problem:** Jacob's v1 defers LinkedIn distribution by 30+ days post-launch. **LinkedIn is the single highest-leverage SEO amplifier we have** — LinkedIn posts → external links → ranking signal — and articles published with no distribution die in obscurity.

**Fix:** LinkedIn syndication ships in **Phase 1.5**, immediately after the writing agent is producing approved articles.

How it works:
- Once an article is approved, the agent generates a **300-word LinkedIn variant** with a different angle (founder-voiced, conversational)
- Variant queued in Koda Ops alongside the blog draft
- Jacob (not Buffer — we ship via Jacob's manual post for now) reviews + posts to LinkedIn 2-3 days after the blog post publishes
- LinkedIn post includes the blog URL (LinkedIn algorithm penalizes external links, but the SEO upside outweighs)

**Pipeline integration:** Same approval workflow as articles. Same brand-voice constraints.

**Who:** Jacob ships LinkedIn variant generation. Manual posting (no Buffer API).
**Effort:** 3 hours Jacob
**Ships in:** Phase 1.5 (after Phase 1 is stable for ~7 days, not 30)

#### Upgrade 8 — Better GSC opportunity scoring

**Problem:** Jacob's v1 scores GSC opportunities as `impressions × (1 - CTR)`. This overweights raw impressions and ignores position + intent.

**Fix:** Better formula:

```
opportunity_score = impressions × (1 - CTR) × position_decay(position) × intent_score(query)

where:
  position_decay = 1 if position < 4
                 = 0.7 if position 4-10
                 = 0.4 if position 11-20
                 = 0.2 if position 21-50
                 = 0.05 if position > 50

  intent_score = 1.0 if query contains: "tool", "app", "best", "free", "online", "practice"
              = 0.7 if query contains: "how to", "what is", "guide", "tips", "examples"
              = 0.3 if query contains: "definition", "meaning", "history" (info-only)
              = 0.5 default
```

This rewards queries where we're close to ranking (page 1-2) and queries with commercial intent over pure informational.

**Pipeline integration:** Phase 2 brief generator uses this formula.

**Who:** Jacob (replaces his existing scoring function).
**Effort:** 1 hour
**Ships in:** Phase 2

#### Upgrade 9 — Internal linking strategy (auto-suggest in editorial step)

**Problem:** Articles without internal links don't pass authority to each other. Site's link graph stays flat.

**Fix:** During editorial pass, agent suggests 3-5 internal links per article:
- 1-2 links UP to the pillar (static landing page) for this article's cluster
- 1-2 links SIDEWAYS to recent blog articles in same cluster
- 1 link to `/ethics` (every article has the brand-defense link at least once)

Implementation: a simple query against `blog_posts` table + the static pillar map. Suggest anchor text using exact-match keyword from the target page.

**Who:** Jacob wires the suggestion logic.
**Effort:** 3 hours
**Ships in:** Phase 1.5

### 🟢 BIGGER (future phases — Phase 2+)

#### Upgrade 10 — Citation verification

**Problem:** AI models hallucinate citations confidently. System prompt instruction "never fabricate citations" is a wish, not a guarantee.

**Fix (Phase 2):** Build a verification step. Any citation in a draft article must match an entry in `CITATION_LIBRARY.md`. Citations not in the library = WARN, not auto-publish.

**Who:** Jacob.
**Effort:** 4 hours
**Ships in:** Phase 2 (after we have a working pipeline producing real articles)

#### Upgrade 11 — Distribution chain orchestration

**Problem:** Each distribution channel (LinkedIn, X, email, Reddit, HN) is currently a separate manual action. Articles ship without coordination.

**Fix (Phase 3):** After article publishes, agent automatically:
- Drafts an X thread variant (5-7 tweets)
- Drafts a LinkedIn variant (300 words)
- Drafts an email-to-subscribers variant (if/when we have a list)
- Adds the article to the next weekly digest email
- Identifies 1-2 Reddit threads where Lucas could answer with a value-first response that mentions the article

All drafts queued for Jacob's review. No auto-publishing to social.

**Who:** Jacob.
**Effort:** 8 hours
**Ships in:** Phase 3

#### Upgrade 12 — Measurement & learning loop

**Problem:** Without measurement, the pipeline can't learn what works.

**Fix (Phase 3):** Monthly automated report showing per-article:
- GSC: impressions, clicks, position, CTR
- Supabase: signups attributable (via UTM in article CTAs)
- Stripe: revenue attributable (via UTM → Stripe metadata)
- Composite: ROI per article (revenue ÷ generation cost, including editorial time)

Surface to Lucas in the weekly digest. Use to:
- Identify under-performing articles → refresh or kill
- Identify high-performing articles → repurpose into LinkedIn long-form, syndicate to Medium, expand into pillar pages
- Identify high-converting clusters → invest more briefs there

**Who:** Jacob.
**Effort:** 4 hours
**Ships in:** Phase 3

---

## 4. The Brand Facts Card (embedded — also lives at `BRAND_FACTS.md`)

This is the single source of truth. The writing agent reads this every run. Update once → all future articles reflect new facts.

```yaml
# InterviewAnswers.ai — Brand Facts Card v1
# Last updated: 2026-05-23
# Source of truth for all generated content.

product:
  name: InterviewAnswers.ai
  url: https://www.interviewanswers.ai
  tagline: "The interview AI that doesn't go in the interview."
  positioning: "Practice, not cheat. Pre-interview rehearsal, never live coaching."

pricing:
  general_30day: 39
  general_30day_currency: USD
  annual_all_access: 149
  pricing_notes: "$39 = one-time, no auto-renew. $149 = annual, also one-time. Free tier exists. Nursing pricing intentionally omitted — out of scope for the general-track pipeline."
  history_note: |
    Web prices flipped from $14.99/$99.99 to $39/$149 on April 30, 2026.
    iOS Apple IAP still shows $14.99/$99.99 pending Apple IAP price update.
    Do NOT reference old prices in any new article.

timeline:
  rebrand: "April 22, 2026"
  live_prompter_deletion: "approximately April 22, 2026 — about a month before May 23, 2026"
  preferred_phrasing: '"A month ago" (May 2026) / "in spring 2026" (after Jun 2026)'
  do_not_say:
    - "Two weeks ago we deleted"  # Too specific, wrong now
    - "Recently shipped a live AI feature"  # Implies we still have it
    - "Will delete"  # We already did

citation_ages:
  Roediger_Karpicke_2006: 20    # years old as of 2026, NOT 50
  Spitzer_1939: 87
  Yerkes_Dodson_1908: 118
  Ericsson_1993: 33
  Bjork_Bjork_1992: 34
  Brooks_2014_anxiety: 12
  Godden_Baddeley_1975: 51
  preferred_phrasing: '"Decades of research" / "Twenty years of evidence-based practice" / Anchor specific claims to specific papers'
  do_not_say:
    - "Fifty years of cognitive psychology"   # WRONG when citing R&K
    - "Recent research"                         # When citing 50+ year old papers
    - "The science is settled"                  # Overclaim

brand_voice:
  attributes:
    - Honest over clever
    - Quietly confident, not aggressive
    - Direct second-person voice — address the reader as someone capable
    - Cognitive-psychology-grounded, not AI-hype
    - "Earned, not borrowed" (the mastery framing)
  tone:
    matches: ["Patagonia", "DuckDuckGo", "Signal"]   # Ethical-positioning peers
    avoids: ["Forbes listicle", "Medium guru", "LinkedIn motivational"]

banned_words_phrases:
  in_first_person_authority_voice:
    - "real-time"        # Reserve for talking ABOUT competitors, not us
    - "copilot"
    - "undetectable"
    - "stealth"
    - "hack"
    - "shortcut"
    - "guaranteed"
    - "game-changer"
    - "revolutionize"
    - "ace the interview"
    - "land any job"
    - "guaranteed offer"
  in_critical_editorial_voice:
    note: "These can appear when CRITICIZING the category (e.g., 'undetectable AI copilots are not actually undetectable'). Quality checker uses windowed context detection."

forbidden_topics_general_track:
  - Medical advice / clinical scenarios / drug dosages
  - Nursing-specific content (out of scope for general track)
  - Legal advice
  - Financial advice
  - Anything that suggests using the app during a live interview

required_brand_signals_in_every_article:
  - The product name "InterviewAnswers.ai" appears at least once in body
  - The phrase "practice" (or "rehearse" or "rehearsal") appears at least 3 times
  - Distinction from "live AI" / "copilot" / "interview-time assistance" is referenced or implied
  - CTA at end links to interviewanswers.ai/ with anchor text "Practice with InterviewAnswers.ai" or similar

industry_data_safe_to_cite:
  - "CodeSignal 2025 fraud report: cheating attempts in proctored technical assessments more than doubled — 16% → 35% — covering unauthorized AI use, copy-paste, proxy test-taking, identity fraud" (verifiable)
  - "NBC News coverage of Roy Lee / Interview Coder case" (verifiable, specific)
  - "USF / UCSF and other universities now require AI-detection at admissions" (verifiable, search current sources)

avoid_naming_in_copy:
  - "Erin" (co-founder, per binding constraint)
  - "Stanford" (employer of co-founder, per binding constraint)
  - Named competitor brands (Final Round AI, Cluely, Interview.chat, JobCopilot, etc.) — refer to the CATEGORY only
```

---

## 5. The Citation Library

**Canonical source: `docs/content_engine/CITATION_LIBRARY.md`** (CIT-001 through CIT-015, ~3,500 words with full references, verifiable claims, brand-approved framings, use cases, and overuse risk per entry).

Do not duplicate the library contents here — the strategy doc was previously out of sync. The writing agent reads `CITATION_LIBRARY.md` at run time. Editorial pass verifies the agent's `---PRIMARY_CITATION---` output (in `CIT-NNN` format) matches an entry in that file.

**Rotation rule (enforced in the system prompt):** No citation appears as primary in more than 1 of every 5 articles. CIT-001 (Roediger & Karpicke 2006) is the highest overuse risk and is hard-capped at 1 in 5 even if rotation would allow more.

**The 15 citation IDs at a glance:**

<!-- BEGIN_DUPLICATE_YAML_REMOVED -->
```yaml
# Original embedded YAML removed 2026-05-23 to eliminate sync risk with CITATION_LIBRARY.md.
# See CITATION_LIBRARY.md for full entries. The agent reads from that file at run time.
# Stub kept for git-history continuity.
removed: true
# All entries (CIT-001 through CIT-015) live in CITATION_LIBRARY.md
# - CIT-001 Roediger & Karpicke 2006 — testing effect (HIGH overuse risk)
# - CIT-002 Karpicke & Blunt 2011 — retrieval beats concept mapping
# - CIT-003 Spitzer 1939 — original testing-effect demonstration
# - CIT-004 Karpicke & Roediger 2008 — 80% vs 36% retention (Swahili vocab)
# - CIT-005 Ericsson 1993 — deliberate practice
# - CIT-006 Bjork & Bjork 1992 — desirable difficulties
# - CIT-007 Brooks 2014 — anxiety reappraisal
# - CIT-008 Godden & Baddeley 1975 — context-dependent memory
# - CIT-009 Bandura 1977 — self-efficacy
# - CIT-010 Yerkes-Dodson 1908 — performance & arousal
# - CIT-011 Cepeda et al. 2008 — spacing effect
# - CIT-012 Dweck — growth mindset (use with replication caveats)
# - CIT-013 Brown/Roediger/McDaniel 2014 — Make It Stick
# - CIT-014 CodeSignal 2025 fraud report — "more than doubled" framing
# - CIT-015 NBC News March 2025 (Tenbarge) — Roy Lee / Interview Coder case (Amazon, Capital One, Meta, TikTok)
```
<!-- END_DUPLICATE_YAML_REMOVED -->

---

## 6. The Revised System Prompt v2 (embedded — also lives at `WRITING_AGENT_SYSTEM_PROMPT_V2.md`)

This replaces Jacob's v1 prompt. Key changes from v1:

1. **Reads BRAND_FACTS.md and CITATION_LIBRARY.md at run time** (not hardcoded)
2. **Citation rotation enforced** (no R&K 2006 in more than 1 of 5)
3. **Required unique insight per article** (a sentence the AI cannot write generically)
4. **Internal link suggestions in output** (the agent proposes 3 specific links)
5. **Image prompt generated for the article** (passed to image gen step)
6. **LinkedIn variant + X thread queued automatically** (Phase 1.5)
7. **More specific structural guardrails** (anti-AI-cadence sentence patterns)

```
You are the writing agent for InterviewAnswers.ai. You produce ONE article from
ONE content brief. You are NOT a publishing tool — your output goes to human
editorial review (Jacob) before publication.

═══════════════════════════════════════════════════════════════════════════════
SECTION A — INPUT YOU WILL RECEIVE
═══════════════════════════════════════════════════════════════════════════════

1. A content brief in JSON format (keyword, angle, toneNotes, cluster, source)
2. The current BRAND_FACTS.md (passed inline at run time)
3. The current CITATION_LIBRARY.md (passed inline at run time)
4. A "recent citations used" list (the last 5 articles' primary citations,
   to enforce rotation)
5. A "cluster siblings" list (other recent articles in same cluster, for
   internal-link suggestions)

═══════════════════════════════════════════════════════════════════════════════
SECTION B — BRAND POSITION (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════════════════════

InterviewAnswers.ai coaches interview communication through deliberate practice,
BEFORE the interview, NEVER during it. We are not a copilot. We do not help
candidates cheat. We are the ethical alternative to the live-AI category — we
built a live coaching feature ourselves, then deleted it. That deletion is
part of our brand DNA.

Our science is decades of cognitive psychology — the testing effect, deliberate
practice, desirable difficulties. Practice builds skill. Real-time AI assistance
does not.

═══════════════════════════════════════════════════════════════════════════════
SECTION C — TONE & VOICE
═══════════════════════════════════════════════════════════════════════════════

- Authoritative but approachable. A knowledgeable coach, not an academic.
- Direct second-person voice ("you," not "the candidate" or "one")
- Grounded in real research, with one specific citation per article
- Never condescending, never hyped, never overclaiming
- Match tone of Patagonia / DuckDuckGo / Signal, not Forbes listicle / Medium guru

═══════════════════════════════════════════════════════════════════════════════
SECTION D — WHAT YOU ALWAYS DO
═══════════════════════════════════════════════════════════════════════════════

1. Open with a genuine, specific insight the reader can act on within 5 minutes
   of finishing the article. NEVER open with "Have you ever wondered..." or
   "In today's competitive job market..." or any AI-cadence cliché.

2. Include exactly ONE primary citation from CITATION_LIBRARY.md. ROTATION RULE:
   you may NOT use any citation appearing in the "recent citations used" list
   passed in your input. If your topic naturally fits a recent citation, choose
   the next-best citation from the library OR add a secondary supporting citation
   instead of repeating the primary.

3. Include ONE "unique-to-this-article" element — something a generic AI
   couldn't write. Choose ONE of:
   - A specific real-world scenario (e.g., "a senior backend engineer
     interviewing at a fintech series B after being laid off from a FAANG")
   - A specific quantified claim from CITATION_LIBRARY.md (not generic
     paraphrase)
   - A counter-intuitive framing of the topic (e.g., "the rambling problem
     is actually a structure problem")

4. Reference the brand position naturally at least ONCE in the body, NOT just
   in the CTA. Examples:
   - "...which is why we coach practice, not live assistance"
   - "...even when AI copilots promise to help you in the moment, the data
     says preparation pre-interview produces better outcomes"

5. End with a CTA paragraph that includes the URL interviewanswers.ai and the
   phrasing "Practice with InterviewAnswers.ai — free to start. No credit card
   required."

6. Propose 3 INTERNAL LINKS at the end of your output (see Section H format).
   Pick from the "cluster siblings" list provided, plus 1 link to a pillar
   landing page (/star-method-guide, /tell-me-about-yourself,
   /behavioral-interview-questions, /mock-interview-practice, or /ethics).

7. Propose an IMAGE PROMPT (see Section H format). Editorial illustration
   style — clean, minimalist, navy/teal palette. No stock-photo people, no
   clip-art tropes.

═══════════════════════════════════════════════════════════════════════════════
SECTION E — WHAT YOU NEVER DO
═══════════════════════════════════════════════════════════════════════════════

NEVER use these words in our own voice (they may appear when CRITICIZING
the live-AI category):
real-time, copilot, undetectable, stealth, hack, shortcut, guaranteed,
game-changer, revolutionize, ace the interview, land any job, guaranteed offer

NEVER fabricate citations. If your argument needs a citation not in
CITATION_LIBRARY.md, omit the argument or flag it for human research.

NEVER produce nursing, clinical, medical, or healthcare-specific content of
any kind. This brief should not have been routed to you if it's medical;
if it slipped through, REFUSE the brief with reason "out-of-scope clinical
content."

NEVER cite Roediger & Karpicke (2006) as "50 years old." The paper is from
2006. The TESTING EFFECT concept dates to ~1939 (Spitzer) — use that citation
if you need the "decades old" framing.

NEVER use AI-cadence opening clichés: "In today's...", "Have you ever
wondered...", "Picture this:", "Imagine if...", "We've all been there..."

NEVER mention pricing unless the brief explicitly calls for it.

═══════════════════════════════════════════════════════════════════════════════
SECTION F — STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

Total article length: 1000–1400 words. (Raised from v1's 1200 ceiling to
accommodate example-heavy briefs.)

Structure:
- Hook + thesis (150-220 words)
- 3-5 H2 sections (200-300 words each)
- Optional Q&A or "quick wins" section (150-200 words) for tactical articles
- Conclusion + CTA (100-180 words)

Internal sub-headings:
- H2 for each major section — must include keyword variants
- H3 for sub-points within sections (use sparingly)
- NO H4 or deeper
- Use lists, blockquotes, and bolding to break up walls of text

═══════════════════════════════════════════════════════════════════════════════
SECTION G — OUTPUT FORMAT (follow exactly)
═══════════════════════════════════════════════════════════════════════════════

---TITLE---
[H1 — naturally includes the target keyword, under 65 chars]

---META---
[Meta description — 150-160 chars, includes keyword, clickability >= "would I click?"]

---PRIMARY_CITATION---
[The ID of the citation you used from CITATION_LIBRARY.md in CIT-NNN format, e.g.: CIT-004]

---UNIQUE_ELEMENT---
[One sentence describing the unique-to-this-article element you included
(specific scenario, quantified claim, or counter-intuitive framing).
This helps the editorial reviewer verify your work.]

---BODY---
[Introduction — 150-220 words. Hook, problem, thesis. NO clichés.]

[H2 subheading]
[Section body]

[H2 subheading]
[Section body]

[H2 subheading]
[Section body]

[Optional H2 — only if needed]
[Section body]

[Conclusion + CTA — 100-180 words. Synthesis, then "Practice with
InterviewAnswers.ai — free to start. No credit card required."]
---END---

---INTERNAL_LINKS---
[List 3 internal links the editorial reviewer should consider adding.
Format: anchor_text|target_url|reason. Example:
  STAR method guide|/star-method-guide|pillar page for this cluster
  Common interview mistakes|/blog/common-interview-mistakes|recent cluster sibling
  Why we deleted our live AI|/ethics|brand-defense link required in every article]

---IMAGE_PROMPT---
[A 1-paragraph image prompt for DALL-E 3 / Stability. Editorial illustration
style, navy + teal palette, no stock-photo people, no clip-art. Should
visually communicate the core concept of the article.]

---LINKEDIN_VARIANT---
[300-word LinkedIn post version. Founder-voiced. Conversational. Different angle
than the blog article (more personal, less formal). Ends with a link to the
blog article via the line "Full article: interviewanswers.ai/blog/[SLUG]"]

═══════════════════════════════════════════════════════════════════════════════
SECTION H — REFUSAL PROTOCOL
═══════════════════════════════════════════════════════════════════════════════

If you cannot produce an article that meets ALL of the requirements above
(for example: brief is for clinical content, brief angle is bait for banned
words, brief is too narrow to write 1000+ words on, brief has no defensible
citation in the library), REFUSE with a structured reason:

---REFUSED---
[One paragraph explaining what about the brief makes the requirements unmeetable.
Be specific. Examples:
- "The brief 'best AI interview copilot 2026' requires praising a category we
  positioned against. No on-brand article is possible."
- "The brief 'top 10 nursing interview questions' is clinical content out of
  scope for the general track."]
```

---

## 7. Topic Cluster Map (initial)

| Cluster | Pillar (existing static page) | Long-tail blog target examples | Status |
|---|---|---|---|
| STAR Method | `/star-method-guide` | "3 STAR answers for senior engineers", "STAR for behavioral questions", "How to shorten a rambling STAR answer", "STAR vs CAR vs PAR (when each works)" | Active. 4-6 articles to come from this. |
| Tell Me About Yourself | `/tell-me-about-yourself` | "TMAY for career switchers", "TMAY for new grads", "Common TMAY mistakes", "How long should TMAY be (the 90-second rule)" | Active. 4-6 articles. |
| Behavioral Interview Q's | `/behavioral-interview-questions` | "Top behavioral questions by company type", "Behavioral q's for managers", "Behavioral q's that signal red flags from the interviewer", "How to answer behavioral q's without rambling" | Active. 4-6 articles. |
| Mock Interview Practice | `/mock-interview-practice` | "AI mock interview vs peer mock interview", "How to record your own mock", "Mock interview frequency", "What to ask the mock interviewer" | Active. 4 articles. |
| Interview Ethics (our moat) | `/ethics` | "Why we deleted our live AI copilot", "Is using AI in an interview cheating?", "Employer detection trends 2026", "The Roy Lee case explained" | **Highest-priority cluster — no competitor publishes here. 6+ articles.** |
| Interview Anxiety / Performance | (no pillar yet — write one Phase 2) | "Why you freeze in interviews", "Pre-interview anxiety reframe", "Yerkes-Dodson for interviewing", "Physiological grounding techniques" | New cluster. Build pillar first. |
| Industry-Specific Interview Prep | (no pillar yet) | "Software engineer behavioral interview", "PM behavioral interview", "Consulting case interview prep" | Future. Each gets its own pillar when we know which industries convert. |

**Decision rule for "blog vs static page":**
- Static (pillar): high-volume head keyword, definitive evergreen content, monthly-updated, owns the cluster
- Blog (supporting): long-tail variant, specific use case, narrower scope, links UP to pillar

---

## 8. Editorial Standards (Jacob's pass)

For every article in the approval queue, Jacob does this 5-10 min pass:

1. **Read top-to-bottom out loud** (1 min) — catches AI-cadence sentences
2. **Edit 2-3 sentences** (3 min) — add real voice, specific anecdote, concrete number
3. **Verify primary citation** (1 min) — does the agent's `---PRIMARY_CITATION---` match an entry in CITATION_LIBRARY.md? Does the claim in the article match the citation's `verifiable_claim`?
4. **Defamation check** (30 sec) — any statement about a named person (Roy Lee, etc.) or named company (Cluely, etc.) is either sourced to a reputable outlet (NBC News, TechCrunch, etc.) OR clearly framed as opinion. No unsourced character claims about specific people or companies. See BRAND_FACTS "Defamation hygiene rules" if any flag.
5. **Internal links** (1 min) — accept the agent's 3 suggested links OR replace with better ones from cluster siblings
6. **Image review** (1 min) — does the hero image match the article framing? If no, regenerate.
7. **Meta description clickability check** (30 sec) — does it make you want to click?
8. **CTA review** (30 sec) — is the CTA specific to this article? If generic, edit.
9. **Final sanity** (1 min) — would Lucas read this and feel it represents the brand?

**If all 8 pass:** Approve → status = published.
**If 1-2 fail:** Edit in queue → fix the issue → approve.
**If 3+ fail:** Reject → log reason → improves system prompt in next iteration.

**Rejection reason categories (for monthly system-prompt-improvement review):**
- Banned word leak
- Citation hallucination / fabrication
- Generic AI cadence (no unique element)
- Wrong cluster / cannibalization risk
- Missing internal links
- Missing brand position reference
- Tone mismatch (too academic, too hype, too motivational)
- Other

---

## 9. Distribution Chain (Phase 3 spec — but lay it out now)

When an article publishes:

| Time | Action | Channel | Who triggers |
|---|---|---|---|
| T+0 | Article goes live at `/blog/[slug]` | Blog | Pipeline auto |
| T+5 min | Add to sitemap | SEO | Pipeline auto |
| T+10 min | Ping IndexNow API (Bing + Yandex) | SEO | Pipeline auto |
| T+30 min | LinkedIn variant goes to Jacob's queue for review | LinkedIn | Pipeline draft |
| T+1 hr (after Jacob approval) | LinkedIn post live | LinkedIn | Jacob manual |
| T+2 hr | X thread variant goes to queue | X | Pipeline draft |
| T+3 hr (after approval) | X thread live | X | Jacob manual |
| T+24 hr | Article included in weekly digest email (if list exists) | Email | Pipeline auto when list ≥ 50 subscribers |
| T+24 hr | Reddit thread opportunities surfaced in Koda Ops | Reddit | Suggestion only, no auto-post |
| T+72 hr | Article URL submitted to GSC for re-crawl | SEO | Pipeline auto |
| T+7 days | Performance check: did it get any traffic? Surface to weekly digest | Measurement | Pipeline auto |
| T+30 days | Performance review: refresh, repurpose, or kill | Strategy | Lucas reads, decides |

---

## 10. Cost Analysis (Updated)

| Service | v1 cost | v2 cost | Notes |
|---|---|---|---|
| Claude Haiku 4.5 — text generation | $0.064 / 8 posts | $0.064 | Unchanged |
| Image generation (DALL-E 3 std) | $0 | ~$0.50 / 8 posts | NEW — $0.04 each, ~hero only |
| Image generation (DALL-E 3 HD, if used) | $0 | ~$0.96 / 8 posts | OPTIONAL |
| GSC API | $0 | $0 | Unchanged |
| Supabase / Vercel / Resend / Koda Ops | $0 | $0 | Unchanged |
| **Total monthly @ 8 posts** | **$0.064** | **~$0.40** | Effectively still rounding error |
| **Total monthly @ 20 posts** | **$0.16** | **~$1.00** |  |

**Cost is still rounding error. Quality is the constraint, not cost.**

### Build cost (Jacob's time, v2 vs v1)

| Phase | v1 hrs | v2 hrs | Delta |
|---|---|---|---|
| Phase 0 — Blog CMS | 12 | 12 | — |
| Phase 1 — Writing Agent | 10 | 12 | +2 (BRAND_FACTS + citation lib wiring) |
| Phase 1 — Image generation | 0 | 4 | +4 (NEW) |
| Phase 1 — Author byline + E-E-A-T | 0 | 4 | +4 (NEW) |
| Phase 1.5 — LinkedIn syndication | 0 | 3 | +3 (NEW — moved from Phase 4) |
| Phase 1.5 — Internal link suggestions | 0 | 3 | +3 (NEW) |
| Phase 2 — GSC Brief Generator | 8 | 9 | +1 (better scoring formula) |
| Phase 3 — Approval Queue | 5 | 6 | +1 (editorial standards UI) |
| Phase 3 — Citation verification | 0 | 4 | +4 (NEW) |
| Phase 3 — Distribution chain | 0 | 8 | +8 (NEW) |
| Phase 3 — Measurement loop | 0 | 4 | +4 (NEW) |
| Integration testing + QA | 6 | 8 | +2 |
| **TOTAL Jacob hours** | **41** | **77** | **+36** |

**Effort doubles, but the output is a real content engine, not a publishing pipeline.**

### Lucas's time (v1 vs v2)

| Item | v1 | v2 |
|---|---|---|
| System prompt review | 15-20 min | 30 min (richer prompt to review) |
| GSC service account setup | 15 min | 15 min |
| Credentials handoff | 5 min | 5 min |
| BRAND_FACTS card writing | 0 | 30 min (write v1 of the card) |
| Citation library review | 0 | 15 min (review citations) |
| Cluster map approval | 0 | 15 min |
| Byline strategy approval | 0 | 15 min |
| Image prompt template approval | 0 | 10 min |
| **TOTAL Lucas time (one-time)** | **35-40 min** | **2 hrs 15 min** |

Still light. Lucas remains out of operational path after this one-time setup.

---

## 11. Revised Phase Plan

```
Phase 0 (already done by Jacob) — Blog CMS — 12 hrs Jacob, 0 hrs Lucas
   ↓
Phase 0.5 (NEW) — Author byline + /about/editorial — 4 hrs Jacob, 30 min Lucas
   ↓
Phase 1 — Writing agent with BRAND_FACTS + CITATION_LIBRARY rotation — 12 hrs Jacob, 1 hr Lucas
   ↓
Phase 1.5 — Image gen + LinkedIn variant + internal link suggestions — 10 hrs Jacob, 15 min Lucas
   ↓
   [GATE: 14 days of clean operation, Jacob editorial pass on each article]
   ↓
Phase 2 — GSC brief generator with improved scoring — 9 hrs Jacob, 15 min Lucas
   ↓
   [GATE: 30 days of clean operation, organic traffic data accumulating]
   ↓
Phase 3 — Distribution chain + citation verification + measurement loop — 22 hrs Jacob, 0 hrs Lucas
   ↓
   [GATE: 60 days of clean operation, real performance data]
   ↓
Phase 4 (FUTURE) — Pillar restructure + interactive elements + advanced topical authority work
```

**Total time to a working content engine: ~3 weeks of Jacob's part-time work.**

---

## 12. What requires Lucas approval (one-time, ~2 hours total)

1. **`BRAND_FACTS.md` v1** — Lucas writes / reviews (30 min)
2. **`CITATION_LIBRARY.md` v1** — Lucas reviews (15 min)
3. **System Prompt v2** — Lucas reviews (30 min)
4. **Author byline strategy** — Lucas decides Editorial Team vs Lucas vs hybrid (15 min)
5. **Topic cluster map** — Lucas approves clusters (15 min)
6. **Image prompt template** — Lucas approves style (10 min)
7. **GSC service account** — Lucas creates and shares JSON key (15 min)

After this, Lucas's only ongoing role is reading the Sunday digest email.

---

## 13. What's still NOT being built (v2 confirms cuts)

| Cut | Reason (unchanged from v1) |
|---|---|
| Reddit posting agent | Brand-ending risk if astroturfing detected |
| Ahrefs API | GSC API is first-party + better + free |
| Medium auto-syndication | Manual is fine at current volume |
| Nursing track content in pipeline | Out of scope; walled garden |
| Comments on articles | Not in this phase — engagement via cross-posted Reddit threads instead |
| Pure-AI publish without editorial pass | Google penalty risk; Jacob's 5-10 min pass is the moat |

---

## 14. Success criteria (how we know it's working)

By Day 90 of pipeline operation:

| Metric | Target | Reason |
|---|---|---|
| Articles published | 20-30 | At 8/month cadence |
| Articles ranking in top 30 (GSC) | ≥ 10 | Realistic for new content domain |
| Organic clicks from articles | ≥ 500/month | Compound effect kicks in around month 2-3 |
| Article → signup conversion | ≥ 1% | Industry benchmark for SEO content |
| Article → paid conversion | ≥ 0.05% | Conservative — most paid customers from direct brand |
| Editorial pass rejection rate | ≤ 20% | If higher, system prompt needs improvement |
| Article-attributable revenue (90-day) | ≥ $200 | Pays for pipeline at break-even |

**If these aren't met by Day 90: the issue is content fit, not pipeline mechanics. Pivot the brief strategy, not the technical implementation.**

---

## 15. The Jacob Handoff

(See separate doc: `JACOB_HANDOFF_v2.md`. That doc is what gets sent.)

The handoff doc gives Jacob:
- Approved Phase 0 (his work ships unchanged)
- BRAND_FACTS.md to consume
- CITATION_LIBRARY.md to consume
- System Prompt v2 to install
- Cluster map to wire into brief logic
- Image gen + LinkedIn variant + internal links specs for Phase 1.5
- Updated phase plan with effort estimates
- One-time Lucas approvals needed before Phase 1 ships
