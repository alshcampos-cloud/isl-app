# Content Engine v2 — Unblock Checklist

**Date:** 2026-05-25
**For:** Lucas — what *you* specifically must do to get Jacob's content engine live.
**Source of truth:** `JACOB_HANDOFF_v2.md` (same folder).

---

## ⚠️ FIRST — this work is not in git

`docs/content_engine/` is **untracked** — no branch, no commit, not pushed. The whole v2 (6 docs, ~137 KB of strategy) exists only as loose files in the working tree. One `git clean` or a lost working copy and it's gone.

A stale `.git/index.lock` is blocking commits and the sandbox can't remove it (mount permission). **Do this from your Mac terminal, now:**
```
cd ~/Downloads/isl-complete
rm -f .git/index.lock
git checkout -b feature/content-engine-v2
git add docs/content_engine/
git commit -m "docs(content-engine): v2 strategy + Jacob handoff"
git push -u origin feature/content-engine-v2
```
2 minutes. Do it before anything else — everything below assumes the docs survive.

---

## Blocker A — Doc reviews (~2 hrs, chunk-able)

You're the only one who can sign these off. Break it into sittings:

| Doc | What you're checking | Time |
|-----|---------------------|------|
| `BRAND_FACTS.md` | Pricing ($39/30-day, $149/yr), citation ages, banned words — is every fact correct? This is what stops the agent repeating the "50 years of cognitive psychology" error. | 30 min |
| `CITATION_LIBRARY.md` | The 15 citations — are they real, correctly dated, fairly characterized? The agent may cite ONLY from this list. | 15 min |
| v2 system prompt (`CONTENT_ENGINE_V2_STRATEGY.md` §6) | Voice, refusal rules, structure. Read it as "would I publish what this produces?" | 30 min |
| Byline strategy (handoff §"What you can build today") | Decide: "Editorial Team" vs "Founder" vs hybrid as the default byline. | 15 min |
| Topic cluster map (`CONTENT_ENGINE_V2_STRATEGY.md` §7) | The 7 clusters (5 active, 2 future) — approve the structure so articles don't cannibalize each other or the static pages. | 15 min |
| `IMAGE_PROMPT_TEMPLATE.md` | Style + 3 example prompts for the DALL-E hero images. | 10 min |

**Smallest unblock:** items 1-3 are what the agent reads at runtime. Sign those off and Phase 1 can move; 4-6 can be stubbed and edited later.

---

## Blocker B — API keys (~15 min — THE hard blocker)

Jacob's writing agent cannot generate a single article without the Anthropic key. This is the real gate.

**1. Anthropic API key**
- console.anthropic.com → Settings → API keys → **Create Key** → name `iaai-content-engine`
- Set spend cap: Settings → Billing → Usage limits → **$20/month**, email alerts at 50/75/90%

**2. OpenAI API key** (hero images)
- platform.openai.com → API keys → **Create new secret key** → name `iaai-content-engine-dalle`
- Set hard limit: Settings → Limits → **$10/month**

**3. Where the keys go** — both stores (hybrid: agent runs in GitHub Actions, publish endpoint in Vercel):
- **GitHub Secrets** (`github.com/alshcampos-cloud/isl-app/settings/secrets/actions`): `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- **Vercel env vars**: same keys for the publish endpoint
- Never paste keys in Slack/email/PR text.

The spend caps aren't optional — without them a retry loop can burn $1000s before the bill tells you.

---

## Not blocking Phase 1

- **GSC service account** (Google Cloud → IAM → service account → GSC Reader). Only needed for the Phase 2 brief generator. Skip for now.
- **Legal review** — one-time ~$500-1500 attorney pass. Gates **only the first `/ethics`-cluster article**, not the pipeline. Book the attorney whenever; Phase 1 (non-ethics articles) ships without it.

---

## Already approved — no action needed

**Phase 0 ships as-is:** Jacob's v1 blog CMS, React routes, quality checker, the three-layer nursing guardrail, pre-flight keyword block, refusal detection, `briefs.json`. Confirmed correct, including his scope cuts (no Reddit agent, no Ahrefs, no Medium auto-syndication).

---

## Critical path to a live article

1. Commit the docs (2 min, above) →
2. Mint the Anthropic key + cap (10 min) →
3. Sign off BRAND_FACTS + CITATION_LIBRARY + system prompt (~75 min) →
4. Hand Jacob the green light → he builds Phase 0.5 + Phase 1.

Everything else (OpenAI key, byline, cluster map, GSC, legal) runs in parallel and doesn't hold the first article.
