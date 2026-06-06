/**
 * IAI Writing Agent — v2
 *
 * Usage:
 *   node agents/writing-agent/writing-agent.js                  → first pending brief, local output only
 *   node agents/writing-agent/writing-agent.js Brief_002        → specific brief, local output only
 *   node agents/writing-agent/writing-agent.js --db             → save draft to DB + notify Jacob
 *   node agents/writing-agent/writing-agent.js Brief_002 --db   → specific brief, save to DB
 *   node agents/writing-agent/writing-agent.js --dry-run        → print prompt only, no API call
 *
 * Env vars (agents/writing-agent/.env or process.env):
 *   ANTHROPIC_API_KEY         — Claude API key (all modes)
 *   BLOG_PUBLISH_URL          — /api/blog-publish endpoint URL (--db mode)
 *   BLOG_AGENT_SECRET         — Bearer token for publish endpoint (--db mode)
 *   SUPABASE_URL              — Supabase project URL (citation rotation + failed_generations)
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (citation rotation + failed_generations)
 *   RESEND_API_KEY            — Resend API key for draft notifications (--db mode, optional)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

// ── Env Loading ───────────────────────────────────────────────────────────────

function loadEnv() {
  const env = { ...process.env };
  try {
    const lines = readFileSync(resolve(__dirname, '.env'), 'utf-8').split('\n');
    for (const line of lines) {
      const eq = line.indexOf('=');
      if (eq < 1) continue;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim();
      if (key && val && !env[key]) env[key] = val;
    }
  } catch { /* no .env file — rely on process.env */ }
  return env;
}

const ENV = loadEnv();

const isDryRun = process.argv.includes('--dry-run');

if (!ENV.ANTHROPIC_API_KEY && !isDryRun) {
  console.error('ERROR: ANTHROPIC_API_KEY not set');
  process.exit(1);
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL         = 'claude-haiku-4-5-20251001';
const MAX_TOKENS    = 4000;
const BRIEFS_PATH   = resolve(__dirname, 'briefs.json');

const CANONICAL_CLUSTERS = new Set([
  'star-method',
  'tell-me-about-yourself',
  'behavioral-interview',
  'mock-interview-practice',
  'ethics',
  'interview-anxiety',
  'industry-specific',
]);

const PILLAR_MAP = {
  'star-method':            '/star-method-guide',
  'tell-me-about-yourself': '/tell-me-about-yourself',
  'behavioral-interview':   '/behavioral-interview-questions',
  'mock-interview-practice':'/mock-interview-practice',
  'ethics':                 '/ethics',
  'interview-anxiety':      null, // future pillar
  'industry-specific':      null, // future pillar
};

// ── Docs Loader ───────────────────────────────────────────────────────────────

function loadContentEngineDoc(filename) {
  const path = resolve(REPO_ROOT, 'docs', 'content_engine', filename);
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    console.error(`ERROR: Cannot read ${path}`);
    process.exit(1);
  }
}

// ── Citation Library Parser ───────────────────────────────────────────────────

function parseCitationLibrary(markdown) {
  const citations = [];
  const entries = markdown.split(/(?=### CIT-)/);
  for (const entry of entries) {
    const idMatch = entry.match(/### (CIT-\d{3})/);
    if (!idMatch) continue;
    const id = idMatch[1];
    const overuseRisk = entry.match(/\*\*Overuse risk:\*\*\s*(HIGH|MEDIUM|LOW)/i)?.[1]?.toUpperCase() ?? 'LOW';
    const useFor = entry.match(/\*\*Use for:\*\*([^*]+)/)?.[1]?.trim() ?? '';
    citations.push({ id, overuseRisk, useFor });
  }
  return citations;
}

// ── Supabase Helpers ──────────────────────────────────────────────────────────

async function supabaseGet(path, params = {}) {
  const url = ENV.SUPABASE_URL;
  const key  = ENV.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${url}/rest/v1/${path}${qs ? '?' + qs : ''}`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function supabasePost(path, body) {
  const url = ENV.SUPABASE_URL;
  const key  = ENV.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  await fetch(`${url}/rest/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(body),
  });
}

// ── Citation Rotation ─────────────────────────────────────────────────────────

async function getRecentCitationIds(n = 5) {
  try {
    const rows = await supabaseGet('blog_posts', {
      select: 'primary_citation_id',
      status: 'eq.published',
      order: 'published_at.desc',
      limit: n,
    });
    if (Array.isArray(rows)) {
      return rows.map(r => r.primary_citation_id).filter(Boolean);
    }
  } catch { /* fallthrough */ }

  // Fallback: local rotation cache
  const cachePath = resolve(__dirname, 'rotation-cache.json');
  if (existsSync(cachePath)) {
    try {
      const cache = JSON.parse(readFileSync(cachePath, 'utf-8'));
      return (cache.recentCitations ?? []).slice(0, n);
    } catch { /* ignore */ }
  }
  return [];
}

function updateLocalRotationCache(citationId) {
  const cachePath = resolve(__dirname, 'rotation-cache.json');
  let cache = { recentCitations: [] };
  if (existsSync(cachePath)) {
    try { cache = JSON.parse(readFileSync(cachePath, 'utf-8')); } catch { /* ignore */ }
  }
  cache.recentCitations = [citationId, ...(cache.recentCitations ?? [])].slice(0, 10);
  writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
}

function selectCitation(allCitations, recentIds) {
  // Exclude citations used in the last 4 articles
  const recent4 = new Set(recentIds.slice(0, 4));
  // Count CIT-001 in last 5 for hard cap
  const cit001Count = recentIds.slice(0, 5).filter(id => id === 'CIT-001').length;

  let candidates = allCitations.filter(c => !recent4.has(c.id));

  // Hard cap: CIT-001 max 1 in 5 regardless of rotation window
  if (cit001Count >= 1) {
    candidates = candidates.filter(c => c.id !== 'CIT-001');
  }

  // Deprioritize HIGH overuse risk
  const preferred = candidates.filter(c => c.overuseRisk !== 'HIGH');
  const pool = preferred.length > 0 ? preferred : candidates;

  if (pool.length === 0) return allCitations[0]; // absolute fallback

  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Legal Review Gate ─────────────────────────────────────────────────────────

async function isLegalReviewRequired(cluster) {
  if (cluster !== 'ethics') return false;

  // Check if any ethics article has already been published
  try {
    const rows = await supabaseGet('blog_posts', {
      select: 'id',
      cluster: 'eq.ethics',
      status: 'eq.published',
      limit: 1,
    });
    if (Array.isArray(rows) && rows.length > 0) return false; // prior ethics article exists
  } catch { /* assume required if we can't check */ }

  return true; // first ethics article — requires legal review
}

// ── Failed Generation Logger ──────────────────────────────────────────────────

async function logFailedGeneration(briefId, step, errorMessage, retryCount) {
  // Try Supabase first
  await supabasePost('failed_generations', {
    brief_id: briefId,
    step,
    error_message: errorMessage,
    retry_count: retryCount,
  }).catch(() => { /* non-fatal */ });

  // Always log locally as backup
  const logPath = resolve(__dirname, 'failed-generations.jsonl');
  const entry = JSON.stringify({ briefId, step, errorMessage, retryCount, ts: new Date().toISOString() }) + '\n';
  writeFileSync(logPath, entry, { flag: 'a' });
}

// ── Pre-flight Domain Block ───────────────────────────────────────────────────

const BLOCKED_DOMAIN_TERMS = [
  'nurs', 'clinical', 'medical', 'healthcare', 'health care',
  'hospital', 'icu', ' er ', 'triage', 'pharmacol', 'medication',
  'patient care', 'diagnosis', 'treatment plan', 'prescription',
  'bedside', 'clinical rotation', 'care plan', 'vital sign',
  'physician', 'doctor ', 'therapist', 'dental', 'dentist',
  'surgical', 'surgery', 'anesthes', 'radiolog', 'oncolog',
  'new grad nurse', 'rn interview', 'bsn', 'lpn', 'nclex',
  'shift handoff', 'patient assessment', 'lab value',
];

function checkBriefBlock(brief) {
  const text = [
    brief.target_keyword ?? brief.keyword ?? '',
    brief.angle ?? '',
    brief.toneNotes ?? '',
    brief.cluster ?? '',
  ].join(' ').toLowerCase();
  return BLOCKED_DOMAIN_TERMS.find(t => text.includes(t)) ?? null;
}

function checkCluster(brief) {
  const cluster = brief.cluster;
  if (!cluster) return 'MISSING — every brief must declare a cluster field';
  if (!CANONICAL_CLUSTERS.has(cluster)) {
    return `"${cluster}" is not a canonical cluster. Must be one of: ${[...CANONICAL_CLUSTERS].join(', ')}`;
  }
  return null;
}

// ── Brief Loader ──────────────────────────────────────────────────────────────

function loadBriefsData() {
  return JSON.parse(readFileSync(BRIEFS_PATH, 'utf-8'));
}

function loadBrief(targetId = null) {
  const data = loadBriefsData();
  const { config, briefs } = data;

  const queueDepth = briefs.filter(b => b.status === 'draft_ready').length;
  if (queueDepth >= (config.maxQueueDepth ?? 3)) {
    console.error('════════════════════════════════════════════════════════════');
    console.error('  QUEUE FULL — agent paused.');
    console.error(`  ${queueDepth} draft(s) are pending review (max: ${config.maxQueueDepth}).`);
    console.error('  Review and approve drafts in Koda Ops before running again.');
    console.error('════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }

  const pending = briefs.filter(b => b.status === 'pending');
  if (pending.length === 0) {
    console.error('No pending briefs found in briefs.json');
    process.exit(1);
  }

  if (targetId) {
    const brief = pending.find(b => b.id === targetId);
    if (!brief) {
      console.error(`Brief "${targetId}" not found or not pending`);
      process.exit(1);
    }
    return { brief, config };
  }

  return { brief: pending[0], config };
}

// ── Prompt Builders ───────────────────────────────────────────────────────────

function buildSystemPrompt() {
  return `You are the writing agent for InterviewAnswers.ai. You produce ONE article from ONE content brief. You are NOT a publishing tool — your output goes to human editorial review before publication.

═══════════════════════════════════════════════════════════════════════════════
SECTION A — INPUT YOU WILL RECEIVE
═══════════════════════════════════════════════════════════════════════════════

1. A content brief (keyword, angle, toneNotes, cluster)
2. The current BRAND_FACTS.md (authoritative source of truth — all facts come from here)
3. The current CITATION_LIBRARY.md (all citations must come from this file)
4. A "recent citations used" list (avoid these as primary citations)
5. The pillar URL for this article's cluster (link up to it in the article)

═══════════════════════════════════════════════════════════════════════════════
SECTION B — BRAND POSITION (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════════════════════

InterviewAnswers.ai coaches interview communication through deliberate practice, BEFORE the interview, NEVER during it. We are not a copilot. We do not help candidates cheat. We are the ethical alternative to the live-AI category — we built a live coaching feature ourselves, then deleted it. That deletion is part of our brand DNA.

Our science is decades of cognitive psychology — the testing effect, deliberate practice, desirable difficulties. Practice builds skill. Real-time AI assistance does not.

═══════════════════════════════════════════════════════════════════════════════
SECTION C — TONE & VOICE
═══════════════════════════════════════════════════════════════════════════════

- Authoritative but approachable. A knowledgeable coach, not an academic.
- Direct second-person voice ("you," not "the candidate" or "one")
- Grounded in real research, with one specific citation per article
- Never condescending, never hyped, never overclaiming
- Match: Patagonia / DuckDuckGo / Signal. Avoid: Forbes listicle / Medium guru.

═══════════════════════════════════════════════════════════════════════════════
SECTION D — WHAT YOU ALWAYS DO
═══════════════════════════════════════════════════════════════════════════════

1. Open with a genuine, specific insight the reader can act on within 5 minutes. NEVER open with "Have you ever wondered...", "In today's competitive job market...", "Picture this:", "Imagine if...", or any AI-cadence cliché.

2. Use exactly ONE primary citation from CITATION_LIBRARY.md. ROTATION RULE: do NOT use any citation from the "recent citations used" list. If your topic naturally fits a recent citation, choose the next-best from the library instead.

3. Include ONE "unique-to-this-article" element that a generic AI couldn't write. Choose ONE of:
   - A specific real-world scenario with precise job title, company type, career stage
   - A specific quantified claim from CITATION_LIBRARY.md (not a generic paraphrase)
   - A counter-intuitive framing of the topic

4. Reference the brand position naturally at least ONCE in the body, not only in the CTA.

5. End with the exact CTA: "Practice with InterviewAnswers.ai — free to start. No credit card required."

6. Propose 3 internal links (see output format). One must link UP to the pillar page for this cluster.

7. Propose an IMAGE_PROMPT for DALL-E 3 hero image generation (see output format).

8. Write a LINKEDIN_VARIANT — 300-word post, more conversational than the article, different angle.

═══════════════════════════════════════════════════════════════════════════════
SECTION E — WHAT YOU NEVER DO
═══════════════════════════════════════════════════════════════════════════════

NEVER use these in our own voice (OK when criticizing the live-AI category):
  real-time, copilot, undetectable, stealth, hack, shortcut, guaranteed,
  game-changer, revolutionize, ace the interview, land any job, guaranteed offer

NEVER fabricate citations. Every citation must exist in CITATION_LIBRARY.md.

NEVER produce nursing, clinical, medical, or healthcare content. If a brief is medical, REFUSE with: "BLOCKED: nursing/clinical/healthcare content out of scope."

NEVER call Roediger & Karpicke (2006) "50 years old." It is 20 years old. For the "decades-old" framing, use Spitzer (1939) as the anchor.

NEVER mention the co-founder's name (Erin), her employer (Stanford), or competitor brand names (Final Round AI, Cluely, Interview.chat, etc.). Refer to the CATEGORY, not specific brands.

NEVER mention pricing unless the brief explicitly calls for it.

═══════════════════════════════════════════════════════════════════════════════
SECTION F — STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

Total article length: 1000–1400 words.

- Hook + thesis: 150–220 words
- 3–5 H2 sections: 200–300 words each
- Conclusion + CTA: 100–180 words

Headings: H2 for main sections (include keyword variants), H3 for sub-points (sparingly). No H4+.
Use lists, blockquotes, and bolding to break up walls of text.

═══════════════════════════════════════════════════════════════════════════════
SECTION G — OUTPUT FORMAT (follow exactly, every field required)
═══════════════════════════════════════════════════════════════════════════════

---TITLE---
[H1 — naturally includes the target keyword, under 65 chars]

---META---
[Meta description — exactly 150–160 characters, includes keyword, clickable]

---PRIMARY_CITATION---
[Citation ID only, e.g.: CIT-004]

---UNIQUE_ELEMENT---
[One sentence describing the unique element you included — scenario/claim/framing]

---BODY---
[Full article body — hook through conclusion + CTA]
---END---

---INTERNAL_LINKS---
[3 links, format: anchor_text|target_url|reason — one per line]

---IMAGE_PROMPT---
[One paragraph DALL-E 3 prompt. Navy/teal palette, editorial illustration, no stock people, no clip-art.]

---LINKEDIN_VARIANT---
[300-word post. Conversational, different angle than article. Ends with: Full article: interviewanswers.ai/blog/[SLUG-PLACEHOLDER]]

═══════════════════════════════════════════════════════════════════════════════
SECTION H — REFUSAL PROTOCOL
═══════════════════════════════════════════════════════════════════════════════

If this brief contains nursing, clinical, or healthcare content, output ONLY:
BLOCKED: This brief contains nursing, clinical, or healthcare content. InterviewAnswers.ai does not publish in this domain.`;
}

function buildUserPrompt(brief, brandFacts, citationLibrary, recentCitations, pillarUrl) {
  const recentList = recentCitations.length > 0
    ? recentCitations.join(', ')
    : 'none yet — all citations available';

  return `CONTENT BRIEF:
ID: ${brief.id}
Target keyword: ${brief.target_keyword ?? brief.keyword}
Angle: ${brief.angle}
Tone notes: ${brief.toneNotes ?? ''}
Cluster: ${brief.cluster}
Pillar page URL: ${pillarUrl ?? 'none defined for this cluster yet'}
Target word count: ${brief.target_word_count ?? 1200}

RECENT CITATIONS USED (do NOT use as primary):
${recentList}

---BRAND_FACTS_START---
${brandFacts}
---BRAND_FACTS_END---

---CITATION_LIBRARY_START---
${citationLibrary}
---CITATION_LIBRARY_END---

Write the article now. Follow the output format in your instructions exactly. Start with ---TITLE--- and end with ---LINKEDIN_VARIANT--- completed.`;
}

// ── Output Parser v2 ──────────────────────────────────────────────────────────

const REFUSAL_SIGNALS = [
  "i can't write", "i cannot write", "i'm unable to write",
  "i can't create", "i cannot create", "i won't write",
  "i will not write", "i'm not able to write", "blocked:",
];

function parseOutput(raw) {
  const lowerRaw = raw.toLowerCase();
  if (REFUSAL_SIGNALS.some(s => lowerRaw.includes(s))) {
    return { valid: false, refused: true, raw };
  }

  const title            = raw.match(/---TITLE---\s*([\s\S]*?)\s*---META---/)?.[1]?.trim();
  const meta             = raw.match(/---META---\s*([\s\S]*?)\s*---PRIMARY_CITATION---/)?.[1]?.trim();
  const primaryCitation  = raw.match(/---PRIMARY_CITATION---\s*([\s\S]*?)\s*---UNIQUE_ELEMENT---/)?.[1]?.trim();
  const uniqueElement    = raw.match(/---UNIQUE_ELEMENT---\s*([\s\S]*?)\s*---BODY---/)?.[1]?.trim();
  const body             = raw.match(/---BODY---\s*([\s\S]*?)\s*---END---/)?.[1]?.trim();
  const internalLinksRaw = raw.match(/---INTERNAL_LINKS---\s*([\s\S]*?)\s*---IMAGE_PROMPT---/)?.[1]?.trim();
  const imagePrompt      = raw.match(/---IMAGE_PROMPT---\s*([\s\S]*?)\s*---LINKEDIN_VARIANT---/)?.[1]?.trim();
  const linkedinVariant  = raw.match(/---LINKEDIN_VARIANT---\s*([\s\S]*?)$/)?.[1]?.trim();

  if (!title || !meta || !primaryCitation || !uniqueElement || !body) {
    return { valid: false, refused: false, raw };
  }

  const internalLinks = (internalLinksRaw ?? '').split('\n')
    .map(l => l.trim())
    .filter(l => l.includes('|'));

  return {
    valid: true,
    title,
    meta,
    primaryCitation,
    uniqueElement,
    body,
    internalLinks,
    imagePrompt: imagePrompt ?? '',
    linkedinVariant: linkedinVariant ?? '',
    wordCount: body.split(/\s+/).length,
    raw,
  };
}

// ── Meta Enforcement ──────────────────────────────────────────────────────────

function enforceMeta(meta) {
  if (meta.length <= 160) return meta;
  const cut = meta.slice(0, 161);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > 0 ? meta.slice(0, lastSpace) : meta.slice(0, 160);
}

// ── Quality Checks v2 ─────────────────────────────────────────────────────────

const BANNED_WORDS = [
  'real-time', 'copilot', 'cheat', 'undetectable', 'stealth',
  'hack', 'guaranteed', 'game-changer', 'revolutionize',
];

const CRITICAL_CONTEXT_SIGNALS = [
  "not ", "n't", "never", "without", "no ", "avoid", "instead", "don't",
  "doesn't", "isn't", "aren't", "won't", "prohibit", "against", "oppose",
  "reject", "refuse", "ban", "block", "illegal", "unethical", "wrong",
  "cheating", "violation", "dishonest", "misconduct", "fraud", "deceptive",
  "mislead", "risk", "danger", "catch", "caught", "detect", "detection",
  "penalty", "consequence", "backfire", "fail", "expose", "flag", "warning",
  "caution", "beware", "harm", "damage", "undermine", "prevent", "replace",
  "mask", "hide", "sabotage", "hollow", "empty", "unlike", "rather than",
  "as opposed to", "in contrast", "however", "but ", "yet ", "whereas",
  "despite", "although", "crutch", "dependency", "false", "illusion",
  "appear", "pretend", "simulate", "fake", "borrowed", "outsource",
  "we oppose", "we don't", "we are not", "we never", "not a copilot",
  "before the interview", "before your interview", "practice tool",
  "not during", "never during", "employer", "hiring manager", "interviewer",
  "screen", "surveillance", "monitor", "track",
];

function isEditorialUse(fullText, bannedWord) {
  const lower = fullText.toLowerCase();
  let searchFrom = 0;
  while (true) {
    const idx = lower.indexOf(bannedWord, searchFrom);
    if (idx === -1) break;
    const start  = Math.max(0, idx - 150);
    const end    = Math.min(lower.length, idx + bannedWord.length + 150);
    const window = lower.slice(start, end);
    if (CRITICAL_CONTEXT_SIGNALS.some(s => window.includes(s))) return true;
    searchFrom = idx + 1;
  }
  return false;
}

function runChecks(parsed, brief, validCitationIds) {
  const fails = [];
  const warns = [];
  const keyword  = brief.target_keyword ?? brief.keyword ?? '';
  const briefCtx = [keyword, brief.angle ?? '', brief.toneNotes ?? ''].join(' ').toLowerCase();
  const bodyCtx  = (parsed.title + ' ' + parsed.body).toLowerCase();

  // Citation validity
  if (!validCitationIds.has(parsed.primaryCitation)) {
    fails.push(`INVALID CITATION ID: "${parsed.primaryCitation}" not found in CITATION_LIBRARY.md`);
  }

  // Unique element present
  if (!parsed.uniqueElement || parsed.uniqueElement.length < 20) {
    warns.push('UNIQUE_ELEMENT is missing or too short — editorial reviewer should verify original POV');
  }

  // Banned words
  for (const word of BANNED_WORDS) {
    if (!bodyCtx.includes(word)) continue;
    if (briefCtx.includes(word)) {
      warns.push(`CONTEXTUAL USE (review): "${word}" — verify it's not promotional`);
    } else if (isEditorialUse(parsed.title + ' ' + parsed.body, word)) {
      warns.push(`EDITORIAL USE (review): "${word}" — used critically, verify framing`);
    } else {
      fails.push(`BANNED WORD: "${word}"`);
    }
  }

  // Keyword present
  if (!bodyCtx.includes(keyword.toLowerCase())) {
    fails.push(`KEYWORD MISSING from title/body: "${keyword}"`);
  }

  // CTA present
  if (!parsed.body.includes('Practice with InterviewAnswers.ai')) {
    fails.push('CTA missing or wrong — must contain "Practice with InterviewAnswers.ai"');
  }

  // Word count
  if (parsed.wordCount < 1000) fails.push(`Word count too low: ${parsed.wordCount} (min 1000)`);
  if (parsed.wordCount > 1400) fails.push(`Word count too high: ${parsed.wordCount} (max 1400)`);

  // Meta length
  if (parsed.meta.length < 150) warns.push(`Meta short: ${parsed.meta.length} chars (min 150)`);
  if (parsed.meta.length > 160) fails.push(`Meta too long: ${parsed.meta.length} chars (max 160)`);

  // Internal links
  if (parsed.internalLinks.length < 3) {
    warns.push(`Only ${parsed.internalLinks.length} internal link(s) suggested (need 3)`);
  }

  // LinkedIn variant
  if (!parsed.linkedinVariant || parsed.linkedinVariant.length < 100) {
    warns.push('LinkedIn variant missing or too short');
  }

  return { fails, warns };
}

// ── Slug Generator ────────────────────────────────────────────────────────────

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// ── API Call with Retry ───────────────────────────────────────────────────────

async function callClaudeWithRetry(systemPrompt, userPrompt, briefId) {
  const MAX_RETRIES = 3;
  const BACKOFF = [0, 1000, 2000];
  const BACKOFF_429 = [5000, 30000, 120000];

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const delay = BACKOFF[attempt];
    if (delay > 0) await new Promise(r => setTimeout(r, delay));

    let response;
    try {
      response = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         ENV.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model:      MODEL,
          max_tokens: MAX_TOKENS,
          system:     systemPrompt,
          messages:   [{ role: 'user', content: userPrompt }],
        }),
      });
    } catch (networkErr) {
      console.warn(`[claude] Network error (attempt ${attempt + 1}/${MAX_RETRIES}): ${networkErr.message}`);
      if (attempt === MAX_RETRIES - 1) {
        await logFailedGeneration(briefId, 'claude_text_gen', networkErr.message, attempt + 1);
        throw networkErr;
      }
      continue;
    }

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('retry-after') ?? '0', 10) * 1000;
      const wait = retryAfter || BACKOFF_429[attempt];
      console.warn(`[claude] 429 rate limit — waiting ${wait / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await logFailedGeneration(briefId, 'claude_text_gen', '429 rate limit', attempt + 1);
      if (attempt === MAX_RETRIES - 1) throw new Error(`Anthropic 429: rate limit exceeded after ${MAX_RETRIES} attempts`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }

    if (!response.ok) {
      const err = await response.text();
      const msg = `Anthropic ${response.status}: ${err}`;
      console.warn(`[claude] Error (attempt ${attempt + 1}/${MAX_RETRIES}): ${msg}`);
      if (attempt === MAX_RETRIES - 1) {
        await logFailedGeneration(briefId, 'claude_text_gen', msg, attempt + 1);
        throw new Error(msg);
      }
      await new Promise(r => setTimeout(r, BACKOFF[attempt + 1] ?? 2000));
      continue;
    }

    return (await response.json()).content[0].text;
  }
}

// ── DB Write ──────────────────────────────────────────────────────────────────

async function saveDraft(parsed, brief, legalReviewRequired) {
  const url    = ENV.BLOG_PUBLISH_URL;
  const secret = ENV.BLOG_AGENT_SECRET;

  if (!url || !secret) {
    console.error('ERROR: BLOG_PUBLISH_URL and BLOG_AGENT_SECRET are required for --db mode');
    process.exit(1);
  }

  const slug = generateSlug(parsed.title);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${secret}`,
    },
    body: JSON.stringify({
      title:                parsed.title,
      slug,
      body:                 parsed.body,
      meta_description:     parsed.meta,
      keywords:             [brief.target_keyword ?? brief.keyword],
      cluster:              brief.cluster,
      primary_citation_id:  parsed.primaryCitation,
      unique_element:       parsed.uniqueElement,
      internal_links:       parsed.internalLinks,
      linkedin_variant:     parsed.linkedinVariant,
      image_prompt:         parsed.imagePrompt,
      legal_review_required: legalReviewRequired,
      source_brief:         brief,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`blog-publish ${response.status}: ${err}`);
  }

  return response.json(); // { id, slug }
}

// ── Resend Notification ───────────────────────────────────────────────────────

async function notifyJacob(brief, draftId, draftSlug, legalReviewRequired) {
  const resendKey = ENV.RESEND_API_KEY;
  if (!resendKey) {
    console.log('[notify] RESEND_API_KEY not set — skipping email');
    return;
  }

  const legalNote = legalReviewRequired
    ? '<p><strong>⚠️ LEGAL REVIEW REQUIRED</strong> — This is the first /ethics article. It cannot publish until Lucas marks it reviewed in Koda Ops.</p>'
    : '';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from:    'IAI Writing Agent <agent@interviewanswers.ai>',
      to:      ['jacob.dev@interviewanswers.ai'],
      subject: `[Draft Ready] ${brief.target_keyword ?? brief.keyword}`,
      html: `
        <p>A new draft is ready for your editorial pass.</p>
        ${legalNote}
        <table cellpadding="6">
          <tr><td><b>Brief</b></td><td>${brief.id}</td></tr>
          <tr><td><b>Keyword</b></td><td>${brief.target_keyword ?? brief.keyword}</td></tr>
          <tr><td><b>Cluster</b></td><td>${brief.cluster}</td></tr>
          <tr><td><b>Draft ID</b></td><td>${draftId}</td></tr>
          <tr><td><b>Slug</b></td><td>/blog/${draftSlug}</td></tr>
        </table>
        <p><strong>8-point editorial pass:</strong></p>
        <ol>
          <li>Read top-to-bottom out loud (1 min)</li>
          <li>Edit 2-3 sentences for real voice (3 min)</li>
          <li>Verify citation matches the PRIMARY_CITATION claim</li>
          <li>Defamation check (any named person or company sourced?)</li>
          <li>Accept/edit 3 internal link suggestions</li>
          <li>Image review (hero image matches article framing?)</li>
          <li>Meta description clickability</li>
          <li>CTA review — specific to this article?</li>
        </ol>
      `,
    }),
  });

  if (!response.ok) {
    console.warn(`[notify] Resend failed (non-fatal): ${await response.text()}`);
  } else {
    console.log('[notify] Draft notification sent to jacob.dev@interviewanswers.ai');
  }
}

// ── Brief Status Update ───────────────────────────────────────────────────────

function markBriefDone(briefId) {
  const data  = loadBriefsData();
  const brief = data.briefs.find(b => b.id === briefId);
  if (brief) {
    brief.status = 'draft_ready';
    writeFileSync(BRIEFS_PATH, JSON.stringify(data, null, 2) + '\n');
    console.log(`[briefs] ${briefId} → draft_ready`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args   = process.argv.slice(2);
  const dryRun = isDryRun;
  const dbMode = args.includes('--db');
  const briefId = args.find(a => a.startsWith('Brief_')) ?? null;

  const { brief } = loadBrief(briefId);

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  IAI Writing Agent v2');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  Brief    : ${brief.id}`);
  console.log(`  Keyword  : ${brief.target_keyword ?? brief.keyword}`);
  console.log(`  Cluster  : ${brief.cluster ?? 'NOT SET'}`);
  console.log(`  Model    : ${MODEL}`);
  console.log(`  Mode     : ${dryRun ? 'DRY RUN' : dbMode ? 'LIVE → DB' : 'LIVE (local output only)'}`);
  console.log('════════════════════════════════════════════════════════════\n');

  // Pre-flight: cluster validation
  const clusterError = checkCluster(brief);
  if (clusterError) {
    console.error(`PRE-FLIGHT BLOCK — cluster invalid: ${clusterError}`);
    process.exit(1);
  }

  // Pre-flight: domain block
  const blockedTerm = checkBriefBlock(brief);
  if (blockedTerm) {
    console.error('════════════════════════════════════════════════════════════');
    console.error('  PRE-FLIGHT BLOCK — NO API CALL MADE');
    console.error(`  Matched restricted term: "${blockedTerm}"`);
    console.error('════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }

  // Load docs at runtime
  console.log('Loading BRAND_FACTS.md + CITATION_LIBRARY.md...');
  const brandFacts       = loadContentEngineDoc('BRAND_FACTS.md');
  const citationLibrary  = loadContentEngineDoc('CITATION_LIBRARY.md');
  const allCitations     = parseCitationLibrary(citationLibrary);
  const validCitationIds = new Set(allCitations.map(c => c.id));

  console.log(`  Citations loaded: ${allCitations.map(c => c.id).join(', ')}`);

  // Citation rotation
  console.log('Checking recent citation usage...');
  const recentCitations = await getRecentCitationIds(5);
  const selected        = selectCitation(allCitations, recentCitations);
  console.log(`  Recent: [${recentCitations.join(', ') || 'none'}]`);
  console.log(`  Selected: ${selected.id} (${selected.overuseRisk} overuse risk)\n`);

  const pillarUrl   = PILLAR_MAP[brief.cluster] ?? null;
  const systemPrompt = buildSystemPrompt();
  const userPrompt   = buildUserPrompt(brief, brandFacts, citationLibrary, recentCitations, pillarUrl);

  if (dryRun) {
    console.log('── USER PROMPT ──────────────────────────────────────────────');
    console.log(userPrompt.slice(0, 800) + '\n[...truncated for dry run]');
    console.log('\n── SYSTEM PROMPT (first 400 chars) ─────────────────────────');
    console.log(systemPrompt.slice(0, 400) + '...');
    return;
  }

  console.log('Calling Claude Haiku 4.5 (with retry logic)...\n');

  let raw;
  try {
    raw = await callClaudeWithRetry(systemPrompt, userPrompt, brief.id);
  } catch (err) {
    console.error('API call failed after all retries:', err.message);
    process.exit(1);
  }

  const parsed = parseOutput(raw);
  if (parsed.valid) parsed.meta = enforceMeta(parsed.meta);

  if (!parsed.valid) {
    if (parsed.refused) {
      console.log('── MODEL RESPONSE ───────────────────────────────────────────');
      console.log(parsed.raw);
      console.log('\n════════════════════════════════════════════════════════════');
      console.log('  STATUS: REFUSED — model declined this brief.');
      console.log('════════════════════════════════════════════════════════════\n');
    } else {
      const outputPath = resolve(__dirname, `output-${brief.id}.txt`);
      writeFileSync(outputPath, raw);
      console.error('OUTPUT FORMAT ERROR — agent did not follow the template.');
      console.error(`Raw output saved: ${outputPath}`);
    }
    process.exit(1);
  }

  const { fails, warns } = runChecks(parsed, brief, validCitationIds);
  const passed = fails.length === 0;

  console.log('── TITLE ────────────────────────────────────────────────────');
  console.log(parsed.title);
  console.log(`\n── META (${parsed.meta.length} chars${parsed.meta.length >= 150 && parsed.meta.length <= 160 ? ' ✓' : ''}) ──`);
  console.log(parsed.meta);
  console.log(`\n── PRIMARY CITATION: ${parsed.primaryCitation} ──`);
  console.log(`── UNIQUE ELEMENT: ${parsed.uniqueElement?.slice(0, 100)} ──`);
  console.log(`\n── BODY (${parsed.wordCount} words) ──────────────────────────────────────`);
  console.log(parsed.body.slice(0, 400) + '\n[...preview]');
  console.log('\n── INTERNAL LINKS ──');
  parsed.internalLinks.forEach(l => console.log('  ' + l));

  console.log('\n════════════════════════════════════════════════════════════');
  if (fails.length === 0 && warns.length === 0) {
    console.log('  QUALITY CHECKS: ALL PASSED ✓');
  } else if (passed) {
    console.log('  QUALITY CHECKS: PASSED WITH WARNINGS');
    warns.forEach(w => console.log(`  ⚠  ${w}`));
  } else {
    console.log('  QUALITY CHECKS: FAILED');
    fails.forEach(f => console.log(`  ✗  ${f}`));
    warns.forEach(w => console.log(`  ⚠  ${w}`));
  }
  console.log('════════════════════════════════════════════════════════════\n');

  if (!passed) {
    console.error('Draft not saved — quality checks failed.');
    process.exit(1);
  }

  // Save local copy
  const outputPath = resolve(__dirname, `output-${brief.id}.txt`);
  writeFileSync(outputPath, [
    `BRIEF: ${brief.id}`,
    `KEYWORD: ${brief.target_keyword ?? brief.keyword}`,
    `CLUSTER: ${brief.cluster}`,
    `PRIMARY CITATION: ${parsed.primaryCitation}`,
    `WORD COUNT: ${parsed.wordCount}`,
    `QUALITY: ${warns.length > 0 ? 'PASS (review warnings)' : 'PASS'}`,
    `WARNS: ${warns.join(' | ') || 'none'}`,
    '',
    `---TITLE---\n${parsed.title}`,
    `\n---META---\n${parsed.meta}`,
    `\n---PRIMARY_CITATION---\n${parsed.primaryCitation}`,
    `\n---UNIQUE_ELEMENT---\n${parsed.uniqueElement}`,
    `\n---BODY---\n${parsed.body}`,
    `\n---INTERNAL_LINKS---\n${parsed.internalLinks.join('\n')}`,
    `\n---IMAGE_PROMPT---\n${parsed.imagePrompt}`,
    `\n---LINKEDIN_VARIANT---\n${parsed.linkedinVariant}`,
  ].join('\n'));
  console.log(`Local copy: ${outputPath}`);

  if (!dbMode) {
    console.log('\nRun with --db to save this draft to the database.\n');
    return;
  }

  // Legal review check
  const legalReviewRequired = await isLegalReviewRequired(brief.cluster);
  if (legalReviewRequired) {
    console.log('\n⚠️  LEGAL REVIEW REQUIRED — first /ethics article. Will be flagged in DB.\n');
  }

  // Save to DB
  console.log('Saving draft to database...');
  let draftId, draftSlug;
  try {
    const result = await saveDraft(parsed, brief, legalReviewRequired);
    draftId   = result.id;
    draftSlug = result.slug;
    console.log(`Draft saved: ${draftId} → /blog/${draftSlug}`);
  } catch (err) {
    console.error('DB write failed:', err.message);
    await logFailedGeneration(brief.id, 'blog_publish', err.message, 0);
    process.exit(1);
  }

  updateLocalRotationCache(parsed.primaryCitation);
  markBriefDone(brief.id);
  await notifyJacob(brief, draftId, draftSlug, legalReviewRequired);

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  DONE');
  console.log(`  Draft saved and Jacob notified.`);
  console.log(`  /blog/${draftSlug}`);
  if (legalReviewRequired) {
    console.log('  ⚠️  Status: pending_legal_review — cannot publish until Lucas signs off.');
  }
  console.log('════════════════════════════════════════════════════════════\n');
}

main();
