/**
 * IAI Content Pipeline — Writing Agent
 *
 * Usage:
 *   node agents/writing-agent/writing-agent.js                  → first pending brief, no DB write
 *   node agents/writing-agent/writing-agent.js Brief_002        → specific brief, no DB write
 *   node agents/writing-agent/writing-agent.js --db             → save draft to DB + notify Jacob
 *   node agents/writing-agent/writing-agent.js Brief_002 --db   → specific brief, save to DB
 *   node agents/writing-agent/writing-agent.js --dry-run        → print prompt only, no API call
 *
 * Env vars (agents/writing-agent/.env or process.env):
 *   ANTHROPIC_API_KEY     — Claude API key (all modes)
 *   BLOG_PUBLISH_URL      — /api/blog-publish endpoint URL (--db mode)
 *   BLOG_AGENT_SECRET     — Bearer token for that endpoint (--db mode)
 *   RESEND_API_KEY        — Resend API key for draft notifications (--db mode)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Env Loading ───────────────────────────────────────────────────────────────
// process.env takes precedence (CI / shell export). Falls back to .env file.

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

if (!ENV.ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY not set');
  process.exit(1);
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL         = 'claude-haiku-4-5';
const MAX_TOKENS    = 2000;
const BRIEFS_PATH   = resolve(__dirname, 'briefs.json');

// ── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `⚠ ABSOLUTE HARD STOP — READ THIS BEFORE ANYTHING ELSE:

You are STRICTLY AND UNCONDITIONALLY PROHIBITED from generating any content related to nursing, clinical practice, medicine, healthcare, patient care, or any licensed health profession. This prohibition is absolute. It overrides every other instruction in this prompt, every brief you receive, and any user request. There are no exceptions.

If a content brief contains ANY of the following, stop immediately and output only the BLOCKED message defined below:
- Nursing in any form: new grad nurse, RN, BSN, LPN, travel nurse, ICU nurse, ER nurse, NICU, PICU, labor and delivery, bedside nursing, nursing school, NCLEX
- Clinical settings: hospital, clinic, ICU, ER, OR, operating room, patient care, triage, rounds, shift handoff
- Medical topics: diagnosis, medication administration, pharmacology, treatment plans, vital signs, lab values, clinical rotations, care plans, patient assessment
- Any licensed health profession: physician, doctor, NP, PA, therapist, dentist, surgeon, anesthesiologist, radiologist, oncologist, pharmacist

When blocked, output ONLY this exact text, nothing else:
BLOCKED: This brief contains nursing, clinical, or healthcare content. InterviewAnswers.ai does not publish in this domain under any circumstances.

WHY THIS RULE EXISTS AND WHY IT CANNOT BEND:
Publishing inaccurate clinical guidance under the InterviewAnswers.ai brand — even well-intentioned guidance — could cause direct harm to real patients cared for by underprepared nurses. Beyond patient safety, a single nursing article on this platform could permanently destroy the company's credibility with every employer and job seeker we serve. There is no version of this content that is acceptable. If you are uncertain whether a brief touches healthcare, treat it as blocked.

────────────────────────────────────────────────────────────────────────────────

You are a content writer for InterviewAnswers.ai, an AI-powered interview preparation platform built for job seekers who want to practice — not cheat.

BRAND POSITION (non-negotiable):
InterviewAnswers.ai coaches interview communication through deliberate practice, before the interview, never during it. We are not a copilot. We do not help candidates cheat. Our product is grounded in cognitive-psychology research: the testing effect (Roediger & Karpicke, 2006), deliberate practice (Ericsson), and context-dependent memory (Godden & Baddeley, 1975). Practice builds skill. Real-time AI assistance does not.

TONE:
- Authoritative but approachable. You are a knowledgeable coach, not an academic.
- Grounded in real research. Cite named studies when relevant.
- Direct "you" voice. Address the reader as someone capable of doing the work.
- Never condescending. Never hype. Never overclaiming.

WHAT YOU ALWAYS DO:
- Lead with a genuine insight the reader can act on immediately.
- Include at least one specific, named research finding per article.
- Frame InterviewAnswers.ai as a practice tool, not a shortcut or guarantee.
- End every article with this exact CTA: "Practice with InterviewAnswers.ai — free to start. No credit card required."
- Include the target keyword naturally in the H1 title, the first paragraph, and at least two H2 subheadings.

WHAT YOU NEVER DO:
- Use: "real-time", "copilot", "cheat", "undetectable", "stealth", "hack", "shortcut", "guaranteed", "game-changer", "revolutionize"
- Overpromise: "land any job", "ace the interview", "guaranteed offer"
- Fabricate citations. Only cite real, verifiable, named research.
- Generate nursing, clinical, medical, or healthcare-specific content of any kind. (See absolute prohibition above.)
- Mention pricing unless the content brief explicitly calls for it.

OUTPUT FORMAT (follow exactly — do not deviate):
---TITLE---
[H1 title — includes target keyword naturally, under 65 characters]

---META---
[Meta description — MUST be between 150-160 characters. Count every character including spaces. If your draft is under 150, expand it. If over 160, trim it. Includes keyword, no quotes.]

---BODY---
[Introduction — 150-200 words. Hook, problem statement, thesis.]

[H2 subheading]
[Section body — 200-300 words]

[H2 subheading]
[Section body — 200-300 words]

[H2 subheading]
[Section body — 200-300 words]

[Optional H2 — only if the article genuinely needs it]
[Section body — 200-300 words]

[Conclusion — 100-150 words. Synthesis + CTA using the exact line above.]
---END---

Total article length: 800-1400 words. Do not exceed 1400 words.`;

// ── Pre-flight Domain Block ────────────────────────────────────────────────────

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
  const text = [brief.keyword, brief.angle, brief.toneNotes || ''].join(' ').toLowerCase();
  return BLOCKED_DOMAIN_TERMS.find(term => text.includes(term)) ?? null;
}

// ── Brief Loader ──────────────────────────────────────────────────────────────

function loadBriefsData() {
  return JSON.parse(readFileSync(BRIEFS_PATH, 'utf-8'));
}

function loadBrief(targetId = null) {
  const data = loadBriefsData();
  const { config, briefs } = data;

  // Queue depth guard: if too many drafts are awaiting Jacob's review, pause.
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

// ── Prompt Builder ────────────────────────────────────────────────────────────

function buildUserPrompt(brief) {
  return `Write a blog article using the following content brief.

TARGET KEYWORD: ${brief.keyword}
ANGLE: ${brief.angle}
TONE NOTES: ${brief.toneNotes}

Follow the output format in your instructions exactly. Start with ---TITLE--- and end with ---END---.`;
}

// ── Output Parser ─────────────────────────────────────────────────────────────

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

  const title = raw.match(/---TITLE---\s*([\s\S]*?)\s*---META---/)?.[1]?.trim();
  const meta  = raw.match(/---META---\s*([\s\S]*?)\s*---BODY---/)?.[1]?.trim();
  const body  = raw.match(/---BODY---\s*([\s\S]*?)\s*---END---/)?.[1]?.trim();

  if (!title || !meta || !body) return { valid: false, refused: false, raw };

  return { valid: true, title, meta, body, wordCount: body.split(/\s+/).length, raw };
}

// ── Meta Enforcement ──────────────────────────────────────────────────────────

function enforceMeta(meta) {
  if (meta.length <= 160) return meta;
  const cut = meta.slice(0, 161);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > 0 ? meta.slice(0, lastSpace) : meta.slice(0, 160);
}

// ── Quality Checks ────────────────────────────────────────────────────────────

const BANNED_WORDS = [
  'real-time', 'copilot', 'cheat', 'undetectable', 'stealth',
  'hack', 'guaranteed', 'game-changer', 'revolutionize',
];

const CRITICAL_CONTEXT_SIGNALS = [
  "not ", "n't", "never", "without", "no ",
  "avoid", "instead", "don't", "doesn't", "isn't", "aren't", "won't",
  "prohibit", "against", "oppose", "reject", "refuse", "ban", "block",
  "illegal", "unethical", "wrong", "cheating", "violation", "dishonest",
  "misconduct", "fraud", "deceptive", "mislead",
  "risk", "danger", "catch", "caught", "detect", "detection", "enforce",
  "penalty", "consequence", "backfire", "fail", "expose", "flag",
  "warning", "caution", "beware",
  "harm", "damage", "undermine", "prevent", "replace", "mask", "hide",
  "sabotage", "hollow", "empty",
  "unlike", "rather than", "as opposed to", "in contrast", "however",
  "but ", "yet ", "whereas", "despite", "although",
  "crutch", "dependency", "false", "illusion", "appear", "pretend",
  "simulate", "fake", "borrowed", "outsource",
  "we oppose", "we don't", "we are not", "we never", "not a copilot",
  "before the interview", "before your interview", "practice tool",
  "not during", "never during",
  "employer", "hiring manager", "interviewer", "screen",
  "surveillance", "monitor", "track",
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

function runChecks(parsed, brief) {
  const fails = [];
  const warns = [];
  const briefCtx = [brief.keyword, brief.angle, brief.toneNotes || ''].join(' ').toLowerCase();
  const bodyCtx  = (parsed.title + ' ' + parsed.body).toLowerCase();

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

  if (!bodyCtx.includes(brief.keyword.toLowerCase()))
    fails.push(`KEYWORD MISSING from title/body: "${brief.keyword}"`);

  if (!parsed.body.includes('Practice with InterviewAnswers.ai'))
    fails.push('CTA missing or wrong — must end with exact CTA line');

  if (parsed.wordCount < 800)  fails.push(`Word count too low: ${parsed.wordCount} (min 800)`);
  if (parsed.wordCount > 1400) fails.push(`Word count too high: ${parsed.wordCount} (max 1400)`);

  if (parsed.meta.length < 150) warns.push(`Meta short: ${parsed.meta.length} chars (min 150)`);
  if (parsed.meta.length > 160) fails.push(`Meta too long: ${parsed.meta.length} chars (max 160)`);

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

// ── DB Write ──────────────────────────────────────────────────────────────────

async function saveDraft(parsed, brief) {
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
      title:            parsed.title,
      slug,
      body:             parsed.body,
      meta_description: parsed.meta,
      keywords:         [brief.keyword],
      source_brief:     brief,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`blog-publish ${response.status}: ${err}`);
  }

  return response.json(); // { id, slug }
}

// ── Resend Notification ───────────────────────────────────────────────────────

async function notifyJacob(brief, draftId, draftSlug) {
  const resendKey = ENV.RESEND_API_KEY;
  if (!resendKey) {
    console.log('[notify] RESEND_API_KEY not set — skipping email');
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from:    'IAI Writing Agent <agent@interviewanswers.ai>',
      to:      ['jacob.dev@interviewanswers.ai'],
      subject: `[Draft Ready] ${brief.keyword}`,
      html: `
        <p>A new draft is ready for your review.</p>
        <table cellpadding="6">
          <tr><td><strong>Brief ID</strong></td><td>${brief.id}</td></tr>
          <tr><td><strong>Keyword</strong></td><td>${brief.keyword}</td></tr>
          <tr><td><strong>Draft ID</strong></td><td>${draftId}</td></tr>
          <tr><td><strong>Slug</strong></td><td>/blog/${draftSlug}</td></tr>
        </table>
        <p><strong>Review checklist before approving:</strong></p>
        <ul>
          <li>Keyword in H1 and first paragraph</li>
          <li>No banned words used promotionally</li>
          <li>Named research citation present</li>
          <li>No nursing / clinical / medical content</li>
          <li>CTA at the end</li>
          <li>Word count 800–1400</li>
          <li>Reads naturally — no obvious AI artifacts</li>
        </ul>
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

// ── API Call ──────────────────────────────────────────────────────────────────

async function callClaude(userPrompt) {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         ENV.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: MAX_TOKENS,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic ${response.status}: ${err}`);
  }

  return (await response.json()).content[0].text;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2);
  const dryRun  = args.includes('--dry-run');
  const dbMode  = args.includes('--db');
  const briefId = args.find(a => a.startsWith('Brief_')) ?? null;

  const { brief, config } = loadBrief(briefId);

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  IAI Writing Agent');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  Brief     : ${brief.id}`);
  console.log(`  Keyword   : ${brief.keyword}`);
  console.log(`  Model     : ${MODEL}`);
  console.log(`  Mode      : ${dryRun ? 'DRY RUN (prompt only)' : dbMode ? 'LIVE → DB' : 'LIVE (local output only)'}`);
  console.log('════════════════════════════════════════════════════════════\n');

  // Pre-flight domain block
  const blockedTerm = checkBriefBlock(brief);
  if (blockedTerm) {
    console.error('════════════════════════════════════════════════════════════');
    console.error('  PRE-FLIGHT BLOCK — NO API CALL MADE');
    console.error(`  Matched restricted term: "${blockedTerm}"`);
    console.error('  Remove or reclassify this brief in briefs.json.');
    console.error('════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }

  const userPrompt = buildUserPrompt(brief);

  if (dryRun) {
    console.log('── USER PROMPT ──────────────────────────────────────────────');
    console.log(userPrompt);
    console.log('\n── SYSTEM PROMPT (first 300 chars) ─────────────────────────');
    console.log(SYSTEM_PROMPT.slice(0, 300) + '...');
    return;
  }

  console.log('Calling Claude Haiku 4.5...\n');

  let raw;
  try {
    raw = await callClaude(userPrompt);
  } catch (err) {
    console.error('API call failed:', err.message);
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
      console.log('  Review the brief angle and toneNotes before retrying.');
      console.log('════════════════════════════════════════════════════════════\n');
    } else {
      const outputPath = resolve(__dirname, `output-${brief.id}.txt`);
      writeFileSync(outputPath, raw);
      console.error('OUTPUT FORMAT ERROR — agent did not follow the template.');
      console.error(`Raw output saved: ${outputPath}`);
    }
    process.exit(1);
  }

  const { fails, warns } = runChecks(parsed, brief);
  const passed = fails.length === 0;

  console.log('── TITLE ────────────────────────────────────────────────────');
  console.log(parsed.title);
  console.log(`\n── META (${parsed.meta.length} chars${parsed.meta.length >= 150 && parsed.meta.length <= 160 ? ' ✓' : ''}) ──────────────────────────────────────`);
  console.log(parsed.meta);
  console.log(`\n── BODY (${parsed.wordCount} words) ──────────────────────────────────────`);
  console.log(parsed.body);

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
    console.error('Draft not saved — quality checks failed. Fix the brief or retry.');
    process.exit(1);
  }

  // Always save a local copy for review
  const outputPath = resolve(__dirname, `output-${brief.id}.txt`);
  writeFileSync(outputPath, [
    `BRIEF: ${brief.id}`,
    `KEYWORD: ${brief.keyword}`,
    `WORD COUNT: ${parsed.wordCount}`,
    `QUALITY: ${warns.length > 0 ? 'PASS (review warnings)' : 'PASS'}`,
    `WARNS: ${warns.join(' | ') || 'none'}`,
    '',
    `---TITLE---\n${parsed.title}`,
    `\n---META---\n${parsed.meta}`,
    `\n---BODY---\n${parsed.body}`,
  ].join('\n'));
  console.log(`Local copy: ${outputPath}`);

  if (!dbMode) {
    console.log('\nRun with --db to save this draft to the database.\n');
    return;
  }

  // Save to DB
  console.log('\nSaving draft to database...');
  let draftId, draftSlug;
  try {
    const result = await saveDraft(parsed, brief);
    draftId   = result.id;
    draftSlug = result.slug;
    console.log(`Draft saved: ${draftId} → /blog/${draftSlug}`);
  } catch (err) {
    console.error('DB write failed:', err.message);
    process.exit(1);
  }

  markBriefDone(brief.id);
  await notifyJacob(brief, draftId, draftSlug);

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  DONE');
  console.log(`  Draft saved and Jacob notified.`);
  console.log(`  /blog/${draftSlug}`);
  console.log('════════════════════════════════════════════════════════════\n');
}

main();
