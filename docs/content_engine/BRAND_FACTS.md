# InterviewAnswers.ai — Brand Facts Card
**Version:** 1.7
**Last updated:** 2026-05-23 (added Defamation hygiene rules section — explicit DON'Ts about Roy Lee character claims and Cluely product claims; preserves truth-and-opinion safe harbor for /ethics cluster articles)
**Scope:** GENERAL TRACK ONLY. Pipeline does not produce nursing or clinical content (binding constraint).
**Owner:** Lucas Campos (founder)
**Purpose:** Single source of truth for every factual claim the content pipeline or any future marketing copy might make. The writing agent reads this AT RUN TIME and injects relevant facts into the system prompt. Update once → all future articles reflect new facts.

---

## Product

| Field | Value |
|---|---|
| Brand name | InterviewAnswers.ai |
| Domain | https://www.interviewanswers.ai |
| Tagline | "The interview AI that doesn't go in the interview." |
| Positioning | "Practice, not cheat. Pre-interview rehearsal, never live coaching." |
| Product category | Interview preparation / cognitive coaching |
| Target audience | Job seekers, career switchers, new grads, recent layoffs |

**Scope of this card:** GENERAL track only. The nursing track exists as a walled-garden specialty inside the app but the content engine does not produce nursing or clinical content (see "Forbidden topics" below). Nursing pricing, branding, and copy are out of scope for the pipeline.

## Pricing (verified live as of 2026-05-23)

| SKU | Web price (Stripe) | iOS price (Apple IAP) | Notes |
|---|---|---|---|
| General 30-day Pass | $39 USD | $14.99 USD | iOS still on old price pending Apple IAP update |
| Annual All-Access | $149 USD | $99.99 USD | Same — iOS pending |
| Free tier | $0 | $0 | Limited usage per feature |
| Legacy Pro (closed) | $29.99/mo | N/A | Grandfathered subscribers only; not offered to new users |

(Nursing pricing intentionally omitted — out of scope for the general-track content pipeline. Nursing pricing lives in `docs/marketing/` for the nursing landing site.)

### Pricing history notes (DO NOT cite in articles)
- April 30, 2026: Web prices flipped from $14.99/$99.99 to $39/$149
- iOS prices still on old values pending Apple App Store Connect update (gated on iOS Build 43 approval)
- DO NOT reference old prices ($14.99, $99.99) in any new article
- DO NOT claim "always been $39" — pricing changed
- Default phrasing: "$39 for 30 days unlimited. No subscription. No auto-renew."

## Timeline & history (for context, use selectively)

| Event | Date | Phrasing for articles |
|---|---|---|
| Live Prompter feature shipped | early 2026 (~Q1) | "Earlier this year we shipped..." |
| Live Prompter deleted | approximately April 22, 2026 | "About a month ago" (May 2026) / "in spring 2026" (Jun+) |
| Web pricing flip ($14.99 → $39) | April 30, 2026 | Do NOT reference this directly |
| Brand rebrand to "Practice, not cheat" | April 22, 2026 | "When we rebranded earlier in 2026..." |

### Timeline phrasings DO NOT use
- "Two weeks ago we deleted" (too specific, wrong now)
- "Recently shipped a live AI feature" (implies we still have it)
- "Will delete" (we already did)
- "Just last week" (avoid all hyper-specific recencies — they age badly)

## Citation ages — the perpetual error to prevent

| Citation | Year | Age as of 2026 | What we CAN say |
|---|---|---|---|
| Roediger & Karpicke | 2006 | **20 years** | "Twenty years of research" or just cite by year |
| Karpicke & Roediger | 2008 | 18 years | "Nearly two decades of research" |
| Karpicke & Blunt | 2011 | 15 years | "Over a decade of evidence" |
| Spitzer (testing effect, originally) | 1939 | 87 years | "Nearly 90 years of evidence" — the concept goes back this far |
| Yerkes-Dodson | 1908 | 118 years | "Over a century of performance-psychology research" |
| Ericsson (deliberate practice) | 1993 | 33 years | "Three decades of expertise research" |
| Bjork & Bjork (desirable difficulties) | 1992 | 34 years | "Decades of work on how learning actually sticks" |
| Brooks (anxiety reappraisal) | 2014 | 12 years | "A 2014 Harvard study" or "Research from a decade ago" — avoid bare "recent" |
| Godden & Baddeley (context-dependent memory) | 1975 | 51 years | "Classic 1970s research" |
| Make It Stick (Brown/Roediger/McDaniel) | 2014 | 12 years | "The popular 2014 synthesis" |

### CITATION-AGE PHRASES DO NOT USE
- "Fifty years of cognitive psychology" (when citing R&K) — **WRONG; R&K is 2006**
- "Half a century of evidence" (when citing R&K) — **WRONG**
- "Recent research" (when citing 50+ year old papers like Godden & Baddeley)
- "The science is settled" — overclaim, no scientific finding is "settled"

### When you want the "decades old, established science" framing
- Cite **Spitzer 1939** (87 years) as the historical anchor, then add R&K 2006 as modern confirmation
- Use **"decades of research, anchored by Roediger and Karpicke (2006)"** — accurate at any time

## Brand voice

### Attributes
1. **Honest > clever.** No exaggeration, no spin.
2. **Quietly confident, not aggressive.** We're not trying to bench-press marketing.
3. **Direct second-person voice.** "You" — addressing the reader as someone capable of doing the work.
4. **Grounded in cognitive psychology, not AI hype.** The product is built on science, not buzzwords.
5. **"Earned, not borrowed."** Mastery comes through practice, not shortcuts.
6. **Empathetic, not preachy.** We understand interviews are hard; we don't moralize.
7. **Dignified, not performative.** No emoji walls, no clickbait, no "🔥🔥🔥".

### Tone benchmarks
- **Matches:** Patagonia ("Don't buy this jacket"), DuckDuckGo (pro-privacy, anti-tracking), Signal (encryption-as-default), 37signals/Basecamp (calm work)
- **Avoids:** Forbes listicle, Medium guru post, LinkedIn hustle motivation, "Top 10 tips" content farm

### Voice exemplars
- ✅ "Practice is the part that works. It's also the part most prep guides skip."
- ✅ "You don't need a shortcut. You need ten more reps."
- ❌ "🚀 INTERVIEW HACKS that will BLOW YOUR MIND 🚀"
- ❌ "In today's competitive job market, candidates need every advantage..."
- ❌ "Imagine waking up one day with the confidence to..."

## Banned words and phrases

### NEVER in first-person authority voice (writing about US)
| Word/phrase | Why banned |
|---|---|
| "real-time" | We deleted real-time coaching. Using the phrase undercuts our positioning. |
| "copilot" | The category we left. Don't claim it. |
| "undetectable" | Implies cheating intent. |
| "stealth" | Same. |
| "hack" | Anti-effort framing. |
| "shortcut" | Same. |
| "guaranteed" | Overclaim — no skill outcome is guaranteed. |
| "game-changer" | Hype cliché. |
| "revolutionize" | Same. |
| "ace the interview" | Overclaim. |
| "land any job" | Overclaim. |
| "guaranteed offer" | Overclaim. |

### CAN appear in critical/editorial voice (writing ABOUT competitors or the live-AI category)
These words can appear when CRITICIZING the category, e.g., "Undetectable AI copilots are not actually undetectable." The quality checker uses windowed context detection to allow this — but ONLY in critical framing, never in claims about our product.

### Hyperbolic phrases NEVER use
- "Best [thing] of 2026" (without specific qualifier)
- "Most powerful AI" (any superlative AI claim)
- "Trusted by [N] users" (use only if N is verified and current)
- "Industry-leading" (meaningless puffery)

## Defamation hygiene rules (binding — every article)

The /ethics cluster names specific people and products. That's necessary for the brand position but creates real legal exposure. These rules keep us on truth-and-opinion ground rather than defamation ground.

### Statements about Roy Lee — what you CAN and CANNOT write

✅ **OK to write (all verifiable to NBC News, TechCrunch, or his own public videos):**
- He built "Interview Coder"
- He claimed in a public video to have used it for offers at Amazon, Capital One, Meta, and TikTok
- Amazon rescinded its offer after the video went public
- Columbia placed him on academic probation, then suspended him for one year
- He subsequently dropped out of Columbia
- He raised $5.3M for a follow-on venture (Cluely)
- Hiring managers and university administrators treated his behavior as a form of fraud (descriptive of what THEY did, not assertion about him)

❌ **NEVER write:**
- "Roy Lee is a fraud" (statement about character, not behavior)
- "Roy Lee will cheat on his next job" (speculation about future conduct)
- Any factual claim about him not in NBC News, TechCrunch, or his own videos
- Pejorative judgments dressed up as fact ("Roy Lee is dishonest by nature")
- Speculation about his motivations beyond what he publicly stated

### Statements about Cluely (and other named competitor products)

✅ **OK to write (factual, sourced):**
- "Cluely raised $5.3M, per TechCrunch reporting"
- "Cluely is a startup in the live-AI interview-assistance space we positioned against" (describes category positioning, not character)
- "Cluely was founded by Roy Lee after his Columbia suspension" (factual)

❌ **NEVER write:**
- "Cluely is a fraud tool" / "Cluely helps candidates cheat" (calling a named product fraudulent)
- "Cluely lies to its users" / "Cluely is deceptive" (character claims about a company)
- Any claim about Cluely's specific technical capabilities not verified in their own marketing or a reputable source
- Comparative claims like "Cluely is worse than [competitor]" (defamation + comparative-advertising risk)

### Hiring managers / employers — generalization caveats

✅ **OK:** "Hiring managers quoted in NBC News coverage of the Roy Lee case treated his Interview Coder use as fraud."

❌ **NEVER:** "All hiring managers consider AI use cheating" (overclaim without specific source — not defamation, just sloppy and challengeable)

### Other named competitor brands (Final Round AI, Beyz, ParakeetAI, LockedIn AI, etc.)

✅ **OK:** Discuss the CATEGORY ("live-AI interview copilots") without naming specific brands.

❌ **NEVER:** Name them in our voice. The general "refer to category, not brand" rule (see "Names and brands DO NOT mention in articles" section below) applies — defamation risk reinforces the existing brand-name ban.

### The word "fraud" — when it's safe and when it's not

✅ **OK:** "Behavior treated as fraud by [Columbia / Amazon / hiring manager quoted in source]" — attributes the judgment to a specific actor
✅ **OK:** "The category of live-AI copilots that operate during interviews has been characterized by employers as a form of fraud" — opinion about a category, not a named product
❌ **NEVER:** "X is committing fraud" applied to a named living person or company (defamation per se in many jurisdictions)

### When in doubt: attribute, don't assert

A statement attributed to a reputable source ("per NBC News...", "Columbia stated...", "CodeSignal's 2025 report found...") is much harder to attack than an unsourced assertion. Default to attribution for any pejorative claim about a named person or company.

---

## Forbidden topics in general track

- Medical advice / clinical scenarios / drug dosages / treatment protocols
- Nursing-specific content (out of scope for general track)
- Legal advice
- Financial advice / investment recommendations
- Anything that suggests using the app during a live interview
- Anything that suggests our product helps people cheat
- Specific company hiring policies (without disclaimer that policies change)
- Pricing comparisons with named competitor brands

## Required brand signals in every article

Every article must include:

1. **Product name "InterviewAnswers.ai"** at least once in body
2. **Practice / rehearse / rehearsal** as a concept (these words combined ≥ 3 times)
3. **Brand position reference** — at least once, the distinction from live-AI / copilot must be referenced or implied
4. **CTA at end** — links to `interviewanswers.ai` with anchor text like "Practice with InterviewAnswers.ai" or "Try InterviewAnswers.ai — free to start"
5. **Author byline** — "InterviewAnswers Editorial Team" at launch (org-only). Founder byline is dormant infrastructure, not active.

## Industry data safe to cite

These claims are verifiable and defensible if challenged. Cite the source explicitly.

| Claim | Source | When to use |
|---|---|---|
| "Cheating attempts in CodeSignal's proctored technical assessments more than doubled — from 16% to 35% — between 2024 and 2025. The category includes unauthorized AI use, copy-paste, proxy test-taking, and identity fraud." | CodeSignal 2025 detection-systems press release | Articles about WHY we deleted live AI / industry trends |
| "Columbia CS undergrad Chungin 'Roy' Lee built 'Interview Coder,' publicly claimed to have used it on Amazon, Capital One, Meta, and TikTok offers; Amazon rescinded its offer; Columbia suspended him for a year; he subsequently dropped out." | NBC News, March 27, 2025 (Tenbarge) | When you need ONE concrete case to make 'candidates losing offers' real |
| "[University name] now uses AI-detection at admissions" | Use specific named universities only when verified current | Industry trend context |

## Industry claims NOT safe to cite without verification

- "Most companies are detecting AI" — too broad to verify
- "Recruiters can tell when you used AI" — anecdotal, not data
- "Hiring managers calling it fraud" — used cautiously; the CodeSignal report and Lee case support general framing but don't quote specific recruiters

## Names and brands DO NOT mention in articles

Per binding constraints:

- "Erin" (co-founder) — never use the name in copy. For the general-track content engine, do not reference the co-founder at all (she's associated with the out-of-scope nursing track).
- "Stanford" (co-founder's employer) — never use in copy
- Named competitors:
  - Final Round AI
  - Cluely
  - Interview.chat
  - JobCopilot
  - LiveInterview.ai
  - Beyz.ai
  - ParakeetAI
  - LockedIn AI
  - Interview Coder (Roy Lee's product) — UNLESS in the specific Roy Lee case context, then OK to name
  - Huru, Big Interview, Yoodli — neutral, can mention in factual comparison only

  **Pattern:** Refer to the CATEGORY ("live-AI interview copilots", "interview answer generators", "real-time interview assistance tools") rather than specific brands.

## Required CTAs

### Standard end-of-article CTA (default)
> Practice with InterviewAnswers.ai — free to start. No credit card required.

### Variations OK in long-form articles
> Ready to practice for real? InterviewAnswers.ai is free to start — no card, no auto-renew, just rehearsal.

> Try InterviewAnswers.ai for free. Practice your answers out loud, get feedback, walk in prepared.

### NOT OK
- Any CTA implying speed/cheating ("get answers fast")
- Any CTA implying we'll "ace" the interview FOR you
- Any CTA without the URL or product name

## Author byline conventions

### Default byline at launch (ALL ARTICLES — every cluster)
- **Name:** InterviewAnswers Editorial Team
- **Schema:** Organization
- **Bio URL:** `/about/editorial#editorial-team`

### Founder-voiced byline (DORMANT — future option, do not activate without explicit owner instruction)
- **Status:** Infrastructure built but NOT active. Default selection rule below points all articles to Editorial Team.
- **Name (when activated):** Lucas Campos, Founder
- **Schema (when activated):** Person
- **Bio URL (when activated):** `/about/editorial#founder`
- **Public-facing email (when activated):** `lucas@interviewanswers.ai`
- **Activation trigger:** Explicit owner instruction. The owner has chosen org-only byline at launch because an unknown founder name adds minimal SEO value vs an "Editorial Team" byline backed by a strong editorial-standards page. Revisit when (a) an /ethics-cluster article REQUIRES first-person "I built this, I deleted it" framing or (b) the owner decides on personal-brand exposure.
- **Selection rule for the agent (current):** `byline = "Editorial Team"` for ALL briefs. No exceptions until the owner flips the dormant flag.
- **Selection rule when dormant flag is flipped:** if `brief.cluster == "ethics"` OR `brief.angle in ["why-we-deleted-live-ai", "brand-positioning", "founder-perspective"]`, use founder byline. Otherwise default to Editorial Team.

## JSON-LD Article schema required fields

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[article title]",
  "datePublished": "[ISO 8601]",
  "dateModified": "[ISO 8601 — update on every edit]",
  "author": {
    "@type": "Person|Organization",
    "name": "[byline]",
    "url": "https://www.interviewanswers.ai/about/editorial"
  },
  "publisher": {
    "@type": "Organization",
    "name": "InterviewAnswers.ai",
    "url": "https://www.interviewanswers.ai",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.interviewanswers.ai/logo.png"
    }
  },
  "image": "[hero image URL]",
  "mainEntityOfPage": "[article URL]"
}
```

## Update protocol

When something in this document changes:
1. Bump version (top of doc)
2. Update "Last updated" date
3. Commit to repo with message `brand: update BRAND_FACTS [what changed]`
4. Writing agent picks up changes on next run automatically (reads at run time)
5. NO need to update existing published articles unless the change is critical (e.g., pricing change should trigger article-by-article review)
