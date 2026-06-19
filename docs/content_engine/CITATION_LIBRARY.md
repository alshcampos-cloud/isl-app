# InterviewAnswers.ai — Citation Library
**Version:** 1.1
**Last updated:** 2026-05-23 (primary-source verification pass — 9 entries corrected: CIT-001/002/004/005/009/011/013/014/015; full audit notes in commit history)
**Owner:** Lucas Campos
**Purpose:** Brand-approved, verifiable citations for every article the pipeline produces. The writing agent must select ONE primary citation from this library per article. Rotation rule: no citation appears as primary in more than 1 of every 5 articles. Citations not in this library may NOT appear in published articles.

---

## How to use this library

1. **Writing agent reads this file at run time** alongside `BRAND_FACTS.md`.
2. **For each article, agent picks ONE primary citation** based on the brief's topic + cluster.
3. **Agent enforces rotation** — primary citation must differ from the last 4 articles' primary citations.
4. **Secondary citations** can be drawn from this library as supporting evidence (no rotation rule for secondaries).
5. **Editorial reviewer verifies** the citation matches the `verifiable_claim` in the article.
6. **Citations not in this library = REJECT.** No exceptions. AI models hallucinate citations; this is our defense.

---

## Citation entries

### CIT-001 — Roediger & Karpicke (2006) — Testing Effect [HIGH overuse risk]

**Full reference:** Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science*, 17(3), 249-255.

**Age in 2026:** 20 years

**Verifiable claim:** Students who practiced retrieving prose-passage content from memory retained it significantly better at one-week delayed testing than students who only re-read the same material. Notably, at the immediate (5-minute) test, re-reading actually outperformed retrieval — the retrieval-practice advantage emerged only at delays of two days and longer.

**Brand-approved framing:**
> "Roediger and Karpicke's 2006 work on the testing effect showed that students who practiced retrieving prose passages from memory retained them significantly better than students who simply re-read the same material — with the gap emerging at two days and growing at one-week retention. (At the immediate 5-minute test, re-reading actually wins — which helps explain why cramming feels productive in the moment.)"

**Use for:** WHY practicing answers out loud works better than reading prep guides. Foundational citation but overused — rotate aggressively.

**Overuse risk:** HIGH — was being cited in nearly every article in the v1 PoC. CAP: max 1 in 5 articles as primary.

**Common error to avoid:** Calling this "50-year-old research." It's 20 years old.

---

### CIT-002 — Karpicke & Blunt (2011) — Retrieval Beats Concept Mapping

**Full reference:** Karpicke, J. D., & Blunt, J. R. (2011). Retrieval practice produces more learning than elaborative studying with concept mapping. *Science*, 331(6018), 772-775.

**Age in 2026:** 15 years

**Verifiable claim:** In a controlled study, retrieval practice produced about 50% more correct recall on a one-week delayed test than concept mapping (an active study strategy widely considered effective). Effect size: d ≈ 1.50 on the short-answer test — considered very large in cognitive psychology.

**Brand-approved framing:**
> "A 2011 follow-up study in Science by Karpicke and Blunt found retrieval practice produced about 50% more correct recall than concept mapping on a one-week delayed test — an effect size of roughly d = 1.5, considered very large in cognitive psychology."

**Use for:** When comparing retrieval-based practice to other "active" study methods. Stronger ROI citation than CIT-001 because of the specific number.

**Overuse risk:** LOW

**Notes:** Published in *Science* (high authority). Use when reader might be skeptical of cognitive-psychology claims.

---

### CIT-003 — Spitzer (1939) — Original Testing Effect Demonstration

**Full reference:** Spitzer, H. F. (1939). Studies in retention. *Journal of Educational Psychology*, 30(9), 641-656.

**Age in 2026:** 87 years

**Verifiable claim:** Spitzer tested over 3,000 Iowa schoolchildren and found that students who were tested immediately after learning, then again at intervals, retained material significantly better than students who only re-read.

**Brand-approved framing:**
> "The testing effect is not new. In 1939, Herbert Spitzer ran a study with over 3,000 Iowa schoolchildren that demonstrated the same principle now bearing out in modern cognitive psychology labs: testing yourself on what you've learned produces stronger memory than re-reading."

**Use for:** When you want the "decades of research" or "nearly a century of evidence" framing. Anchor historical claims here, not in R&K.

**Overuse risk:** LOW

**Notes:** Pair with R&K 2006 ("Spitzer's 1939 findings have been replicated and extended in modern work like Roediger and Karpicke 2006...") for one-two punch of historical depth + modern confirmation.

---

### CIT-004 — Karpicke & Roediger (2008) — The Critical Importance of Retrieval

**Full reference:** Karpicke, J. D., & Roediger, H. L. (2008). The critical importance of retrieval for learning. *Science*, 319(5865), 966-968.

**Age in 2026:** 18 years

**Verifiable claim:** Learners who self-tested Swahili–English vocabulary remembered approximately 80% at one-week retention. Learners who only re-studied the same material remembered approximately 36%. Roughly a 2.2× difference.

**Brand-approved framing:**
> "Karpicke and Roediger's 2008 Science paper found learners who self-tested Swahili vocabulary remembered about 80% at one week — more than twice the ~36% remembered by those who only re-studied. Retrieval is the muscle of memory."

**Use for:** When you want a SPECIFIC NUMBER to anchor the value of retrieval practice. The 80% vs 36% statistic is memorable and powerful.

**Overuse risk:** LOW

**Notes:** Often a stronger primary citation than CIT-001 because of the concrete data. Default to this over R&K 2006 when both could work.

---

### CIT-005 — Ericsson, Krampe, & Tesch-Römer (1993) — Deliberate Practice

**Full reference:** Ericsson, K. A., Krampe, R. T., & Tesch-Römer, C. (1993). The role of deliberate practice in the acquisition of expert performance. *Psychological Review*, 100(3), 363-406.

**Age in 2026:** 33 years

**Verifiable claim:** Expert performance in any domain is strongly predicted by accumulated hours of deliberate practice — practice that is specific, effortful, with feedback, designed to push the edge of current ability.

**Brand-approved framing:**
> "K. Anders Ericsson's work on deliberate practice established that expertise across domains comes from accumulated hours of specific, effortful, feedback-driven practice — not innate talent. The principle applies to interviewing the same way it applies to chess, music, or surgery."

**Use for:** Articles about WHY practicing the same answer multiple times works. Reframing 'natural talent' as 'practiced skill.'

**Overuse risk:** MEDIUM

**Critical caveat:** Hambrick & Macnamara have published meta-analytic critiques (2014, 2016, 2020) showing deliberate practice explains roughly 12-26% of variance in performance across domains — not "all" or "most." Ericsson himself publicly pushed back on Malcolm Gladwell's "10,000 hour rule" as an oversimplification (Salon 2016, his 2016 book *Peak*). **NEVER cite "the 10,000 hour rule" as if it's the paper's finding** — the paper reported an average for one elite group (Berlin violinists), not a universal threshold. Frame as "deliberate practice is a major component of expertise" not "the only component," and never as "X hours required."

---

### CIT-006 — Bjork & Bjork (1992) — Desirable Difficulties

**Full reference:** Bjork, R. A., & Bjork, E. L. (1992). A new theory of disuse and an old theory of stimulus fluctuation. In Healy, A.F., Kosslyn, S.M., & Shiffrin, R.M. (Eds.), *From learning processes to cognitive processes: Essays in honor of William K. Estes* (Vol. 2, pp. 35-67). Erlbaum.

**Age in 2026:** 34 years

**Verifiable claim:** Study conditions that introduce difficulty — like spacing, interleaving, and retrieval practice — feel harder in the short term but produce significantly better long-term retention than easier conditions.

**Brand-approved framing:**
> "Robert and Elizabeth Bjork's 'desirable difficulties' research showed that study strategies which feel harder in the moment — like practicing retrieval instead of re-reading, or spacing sessions instead of cramming — produce better long-term retention. Effort feels bad; effort works."

**Use for:** Articles about the psychological friction of practicing out loud (it feels uncomfortable; that's why it works).

**Overuse risk:** LOW

---

### CIT-007 — Brooks (2014) — Anxiety Reappraisal

**Full reference:** Brooks, A. W. (2014). Get excited: Reappraising pre-performance anxiety as excitement. *Journal of Experimental Psychology: General*, 143(3), 1144-1158.

**Age in 2026:** 12 years

**Verifiable claim:** In experiments at Harvard, participants who reappraised anxiety as excitement (saying "I am excited" before karaoke singing, math tests, and public speaking) performed measurably better than participants who tried to calm down or simply acknowledged anxiety.

**Brand-approved framing:**
> "Alison Wood Brooks's 2014 research at Harvard found that telling yourself 'I am excited' before an interview produced measurably better performance than trying to calm down. The arousal of pre-performance nerves and the arousal of excitement feel similar to the body — and the body interprets that arousal based on the label you give it."

**Use for:** Articles on interview anxiety, freezing, pre-interview nerves. Powerful counter-intuitive finding.

**Overuse risk:** LOW

---

### CIT-008 — Godden & Baddeley (1975) — Context-Dependent Memory

**Full reference:** Godden, D. R., & Baddeley, A. D. (1975). Context-dependent memory in two natural environments: On land and underwater. *British Journal of Psychology*, 66(3), 325-331.

**Age in 2026:** 51 years

**Verifiable claim:** Scuba divers who learned word lists underwater recalled them significantly better when tested underwater than on land. Memory is partly tied to the physical and emotional context of learning.

**Brand-approved framing:**
> "Godden and Baddeley's classic 1975 study found that scuba divers who learned words underwater recalled them better when tested underwater than on land. Applied to interview prep: practice answers out loud, standing up, on camera if you're interviewing on Zoom — the closer the practice context to the interview context, the more reliable the recall."

**Use for:** Articles about WHY practicing out loud (not just mentally) matters. Why mock-interview environment matters. Why standing up to practice is better than sitting.

**Overuse risk:** LOW

---

### CIT-009 — Bandura (1977) — Self-Efficacy

**Full reference:** Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. *Psychological Review*, 84(2), 191-215.

**Age in 2026:** 49 years

**Verifiable claim:** Self-efficacy — belief in one's capability to perform — is built through four sources (1977 terminology): performance accomplishments, vicarious experience, verbal persuasion, and emotional/physiological arousal correctly interpreted. (Bandura's 1997 book *Self-Efficacy: The Exercise of Control* relabeled these as "enactive mastery experiences, vicarious experiences, verbal persuasion, and physiological/affective states" — when citing the 1977 paper, prefer the 1977 terminology.)

**Brand-approved framing:**
> "Albert Bandura's foundational 1977 work on self-efficacy identified four sources of confidence: performance accomplishments / mastery experiences (you've done it before), vicarious experience (you've seen people like you do it), verbal persuasion (someone credible believes in you), and accurate interpretation of emotional/physiological arousal (your nerves are excitement, not fear)."

**Use for:** Articles about building interview confidence, anxiety, imposter syndrome. Pair well with CIT-007 (Brooks).

**Overuse risk:** LOW

---

### CIT-010 — Yerkes & Dodson (1908) — Arousal & Performance

**Full reference:** Yerkes, R. M., & Dodson, J. D. (1908). The relation of strength of stimulus to rapidity of habit-formation. *Journal of Comparative Neurology and Psychology*, 18(5), 459-482.

**Age in 2026:** 118 years

**Verifiable claim:** Performance increases with physiological arousal up to a certain optimum, then decreases past that optimum. The optimum arousal level is lower for complex tasks than for simple ones.

**Brand-approved framing:**
> "The Yerkes-Dodson law from 1908 — still cited in modern performance psychology — describes a curve where some pre-performance arousal helps performance, but too much hurts. The trick isn't eliminating interview nerves; it's keeping them at the productive level."

**Use for:** Anxiety / nerves articles. Reframing "calm" as the wrong goal.

**Overuse risk:** LOW

**Critical caveat:** Yerkes-Dodson is often misapplied. The inverted-U curve is most robust for SIMPLE tasks and animal learning. For complex human tasks, the picture is more nuanced. Don't make load-bearing arguments on the exact shape of the curve — use the directional claim only.

---

### CIT-011 — Cepeda, Vul, Rohrer, Wixted, & Pashler (2008) — Spacing Effect Quantified

**Full reference:** Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., & Pashler, H. (2008). Spacing effects in learning: A temporal ridgeline of optimal retention. *Psychological Science*, 19(11), 1095-1102.

**Age in 2026:** 18 years

**Verifiable claim:** Optimal gap between study sessions depends on the desired retention interval — declining from about 20-40% of target retention for short delays (e.g., one week) to about 5-10% for very long delays (e.g., one year). For one-week retention, gaps of ~1-2 days are roughly optimal; for one-month retention, ~3-5 days; for one-year retention, gaps measured in weeks.

**Brand-approved framing:**
> "Cepeda and colleagues' 2008 work on the spacing effect quantified what every interview prep coach knows intuitively: don't cram the night before. For an interview a week away, spread your practice across 1-2 day gaps. For one a month out, 3-5 day gaps. The longer the retention you want, the wider the optimal gap."

**Use for:** Articles about WHEN to practice (cadence, spacing, last-minute prep, optimal frequency).

**Overuse risk:** LOW

---

### CIT-012 — Brown, Roediger, & McDaniel (2014) — Make It Stick

**Full reference:** Brown, P. C., Roediger, H. L., & McDaniel, M. A. (2014). *Make It Stick: The Science of Successful Learning*. Belknap Press.

**Age in 2026:** 12 years

**Verifiable claim:** Synthesis of decades of cognitive-psychology research on the testing effect, spacing, interleaving, and elaboration. Argues these techniques are systematically underused because they feel less productive than easier methods like re-reading and highlighting.

**Brand-approved framing:**
> "Make It Stick (Brown, Roediger & McDaniel, 2014) is the popular synthesis of decades of cognitive-psychology research on what actually helps people learn. The book makes the case that the techniques that feel easy — highlighting, re-reading — are the ones that don't work."

**Use for:** When you want to cite an accessible book your reader could actually buy. Good "intro" citation for skeptical readers.

**Overuse risk:** LOW

---

### CIT-013 — Dweck (2006) — Growth Mindset

**Full reference:** Dweck, C. S. (2006). *Mindset: The new psychology of success*. Random House.

**Age in 2026:** 20 years

**Verifiable claim:** People who believe abilities are improvable through effort (growth mindset) tend to show greater learning gains than people who believe abilities are fixed traits.

**Brand-approved framing:**
> "Carol Dweck's research on growth mindset shows that people who see interview skill as improvable through practice tend to outperform people who see it as a fixed trait you either have or don't."

**Use for:** Articles framing interview prep as a skill anyone can build with practice.

**Overuse risk:** MEDIUM

**Critical caveat:** Growth mindset has been replication-controversial. The Sisk et al. (2018) meta-analysis of 129 studies (N=365,915) found mindset interventions have an average effect of only d = 0.08 (trivially small), and the correlation between mindset and academic achievement is r ≈ .10 — meaning mindset accounts for ~1% of variance in achievement. Li & Bates (2019) failed to replicate Mueller & Dweck's classic praise study. **Use the original popular-press claim ONLY in SOFT framing — do not make load-bearing arguments on it.** Prefer CIT-005 (Ericsson, with its own caveats) or the testing-effect cluster (CIT-001 through CIT-004) for "skill is improvable" claims.

---

### CIT-014 — CodeSignal (2025) — Assessment Fraud Doubled

**Full reference:** CodeSignal (2025). *CodeSignal detection systems identify and stop record-high cheating attempts as assessment fraud more than doubled in 2025*. Press release. https://codesignal.com/newsroom/press-releases/codesignal-detection-systems-identify-and-stop-record-high-cheating-attempts-as-assessment-fraud-more-than-doubled-in-2025

**Age in 2026:** 1 year

**Verifiable claim:** Cheating and fraud attempts in CodeSignal's proctored technical assessments more than doubled — from 16% of monitored assessments in 2024 to 35% in 2025. CodeSignal's reported category covers four behaviors combined: copy-paste plagiarism, proxy test-taking (someone else takes the assessment), unauthorized AI tool use, and identity fraud. CodeSignal attributes much of the rise to normalization of AI tools but the 16→35% number is the combined category, NOT AI-specifically.

**Brand-approved framing:**
> "CodeSignal's 2025 detection-systems report found cheating attempts in proctored technical assessments more than doubled in a single year — from 16% in 2024 to 35% in 2025 — a category that includes unauthorized AI use, copy-paste plagiarism, proxy test-taking, and identity fraud."

**Use for:** Industry context articles. Brand-positioning articles. The /ethics cluster.

**Overuse risk:** MEDIUM — strong stat for the ethics cluster but specific to that context. Don't shoehorn into unrelated articles.

**Critical caveats:**
1. Defensible as "more than doubled" but NOT as "tripled" (it's 2.19×, not 3×). Frame as "more than doubled" or "doubled" only.
2. **DO NOT** frame the 16→35% number as "AI-assisted cheating doubled." The category is broader than AI. A careful reader fact-checking the press release will catch this. Use "cheating attempts" or "assessment fraud" — the category CodeSignal actually reports.

---

### CIT-015 — NBC News (2025) — Roy Lee / Interview Coder Case

**Full reference:** Tenbarge, K. (2025, March 27). *Kicked out of Columbia, this student doesn't plan to stop trolling big tech with AI*. NBC News. https://www.nbcnews.com/tech/tech-news/columbia-university-student-trolls-big-tech-ai-tool-job-applications-rcna198454

**Age in 2026:** ~14 months (article published March 27, 2025)

**Verifiable claim:** Columbia University CS undergraduate Chungin "Roy" Lee built a tool called "Interview Coder" designed to help candidates discreetly solve technical coding questions during live interviews. He claimed in a publicly broadcast video (February 2025) to have used it to obtain offers from Amazon, Capital One, Meta, and TikTok. After the video went public, Amazon rescinded its offer; Columbia placed him on academic probation, then suspended him for one year. He subsequently dropped out of Columbia and raised $5.3M for a related venture ("Cluely") — a category we positioned against.

**Brand-approved framing:**
> "The Roy Lee / 'Interview Coder' case — covered on NBC News in March 2025 — is a concrete example of the risk: a Columbia undergrad built a tool to help candidates discreetly solve live coding questions, publicly broadcast a video claiming to have used it on Amazon, Capital One, Meta, and TikTok, and within weeks had his Amazon offer rescinded and was suspended from Columbia."

**Use for:** When you need ONE concrete documented case to support "candidates are losing offers." Pair with CIT-014 (CodeSignal stat) for "anecdote plus statistic" framing.

**Overuse risk:** MEDIUM — high-impact citation; reserve for the /ethics cluster and brand-positioning articles where it's load-bearing.

**Critical caveats:**
1. Cite as the singular concrete case it is. "Candidates have lost offers" plural framing is harder to defend; "the Roy Lee case is one documented example" is bulletproof.
2. Use the **2025** date — common error is to round down to "2024." Article was March 27, 2025.
3. Use the full name "Chungin 'Roy' Lee" on first reference if formality required; "Roy Lee" thereafter.
4. Roy Lee's subsequent venture (Cluely) is in the "live-AI copilot" category we explicitly positioned against. Mentioning Cluely by name is allowed in this specific context (per BRAND_FACTS competitor-naming carve-out for Roy Lee case) but not required.

**Defamation hygiene (READ BEFORE WRITING anything that names Roy Lee or Cluely):**

✅ **OK statements about Roy Lee** (all verifiable to NBC News, TechCrunch, his own public videos):
- Built "Interview Coder," claimed it on Amazon/Capital One/Meta/TikTok in public video
- Amazon rescinded offer; Columbia suspended for 1 year; he dropped out
- Subsequently raised $5.3M for Cluely

❌ **NEVER write about Roy Lee:**
- "Roy Lee is a fraud" (character claim, not behavior)
- "Roy Lee will cheat on his next job" (speculation)
- Any factual claim NOT in NBC News, TechCrunch, or his own videos
- Pejorative character judgments dressed as fact

✅ **OK statements about Cluely:**
- "Cluely raised $5.3M, per TechCrunch"
- "Cluely is in the live-AI interview-assistance category we positioned against" (describes positioning)
- "Cluely was founded by Roy Lee after his Columbia suspension" (factual)

❌ **NEVER write about Cluely:**
- "Cluely is a fraud tool" / "Cluely helps cheat" (calling named product fraudulent)
- "Cluely is deceptive" (character claim about a company)
- Any technical-capability claim not verified to Cluely's own marketing or a reputable source

**Why this matters:** Roy Lee is a limited-purpose public figure (he made himself public). Cluely is a named company. Both could plausibly sue if we make defamatory statements. The truth defense is absolute, but only protects facts that are actually verifiable to reputable sources. Stick to NBC News + TechCrunch + his own videos and we're fine.

See BRAND_FACTS.md "Defamation hygiene rules" section for the full ruleset.

---

## Citation rotation rules (enforced by writing agent)

1. **Primary citation per article must NOT match any of the last 4 articles' primary citations.**
2. **CIT-001 (R&K 2006) usage is capped at 1 in 5 articles** even if rotation would otherwise allow it.
3. **CIT-014 (CodeSignal) and CIT-015 (Roy Lee) are restricted to brand-positioning / ethics cluster articles** — they don't fit general interview-prep content.
4. **CIT-005 (Ericsson) and CIT-013 (Dweck) require the critical caveats to be acknowledged** if the article makes any contested claim. Don't oversimplify.
5. **Secondary citations have no rotation rule** but should be from this library.
6. **No invented citations.** If your argument needs a citation not in this library, omit the argument or flag for human research to add new citation.

---

## Additions to this library

To add a new citation:

1. Find the citation; verify it exists and is real (Google Scholar / DOI lookup)
2. Read the actual paper (or a reliable secondary source if paper is paywalled)
3. Write the `verifiable_claim` — what specifically does the paper show?
4. Write the `brand-approved framing` — how do we cite it in our voice?
5. Identify `use_for` cases and `overuse_risk`
6. Flag any `critical_caveat` if the literature has replication issues or scope limitations
7. Get Lucas approval before adding (15 min review)
8. Add as next CIT-NNN entry
9. Commit with message `citations: add CIT-NNN [author/topic]`

The pipeline picks up new citations on next run automatically.

---

## Update protocol

When a citation needs revision (e.g., new replication study comes out, framing needs sharpening):

1. Update the entry in place
2. Bump version at top of doc
3. Update "Last updated" date
4. Commit with message `citations: update CIT-NNN [what changed]`

The pipeline picks up changes on next run.
