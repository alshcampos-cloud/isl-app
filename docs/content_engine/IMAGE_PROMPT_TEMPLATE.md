# InterviewAnswers.ai — Image Prompt Template (DALL-E 3)
**Version:** 1.0
**Last updated:** 2026-05-23
**Owner:** Lucas Campos
**Purpose:** Style direction for every hero image the content engine generates. The writing agent reads this AT RUN TIME to build the `---IMAGE_PROMPT---` section of its output. Update once → all future images reflect new style direction.

---

## Style direction (non-negotiable)

| Attribute | Rule |
|---|---|
| **Aesthetic** | Editorial illustration. Think New York Times Op-Ed graphics, The Atlantic illustrations, Stripe/Linear documentation art. |
| **Palette** | Primary: deep navy (`#0a0e1a`, `#12172a`). Accent: teal (`#14b8a6`, `#0d9488`). Optional accent: emerald (`#10b981`). Backgrounds either deep-navy gradient or clean off-white (`#fafafa`). |
| **No photo people** | Never use realistic human photos, faces, or stock-photo models. Causes uncanny-valley issues with DALL-E and undermines our serious brand voice. |
| **No clip art** | No flat-vector clip art, no "businessman in suit" tropes, no shaking hands, no checkboxes-with-checkmarks. |
| **No clichés** | No light bulbs, no rocket ships, no upward-trending arrows over graphs, no chess pieces, no climbing-the-mountain metaphors. |
| **Geometric / abstract preferred** | Composition built from geometric shapes, abstract patterns, conceptual diagrams, typographic elements. |
| **Conceptual over literal** | An article about anxiety doesn't show an anxious person — it shows the FEELING of anxiety abstracted (e.g., compressed space, asymmetric balance, tension lines). |
| **Composition** | Center-weighted or rule-of-thirds. Clear focal point. Generous negative space. Don't over-decorate. |
| **Output dimensions** | DALL-E 3 standard 1024x1024 → cropped/extended to 1200x628 for Open Graph compliance. Agent generates 1024x1024; publishing endpoint handles crop to 1200x628. |

---

## What every prompt MUST include (the boilerplate)

Every prompt the agent writes ends with this exact suffix to enforce style consistency:

```
Style: editorial illustration in deep navy (#0a0e1a) with teal (#14b8a6) accents.
Geometric and abstract, NOT photorealistic. NO human faces or figures. NO clip art.
NO cliché business imagery (light bulbs, rocket ships, upward arrows, handshakes).
Generous negative space. Center-weighted composition. Dimensions: 1024x1024.
Inspired by editorial illustration in The New York Times Op-Ed section.
```

The agent's article-specific prompt content goes BEFORE this suffix.

---

## Example prompts (3 fully worked examples)

### Example 1 — Article: "Why You Freeze in Interviews (And How to Stop)"
**Cluster:** Interview Anxiety / Performance
**Concept:** the moment of cognitive blank-out under pressure

**Prompt:**
> An abstract editorial illustration of a single isolated geometric circle frozen in a field of fragmented diagonal lines, with the lines bending and refracting around the circle. The circle is teal; the diagonal lines are off-white against a deep navy background. The composition is asymmetric, conveying disrupted thought and arrested motion. Style: editorial illustration in deep navy (#0a0e1a) with teal (#14b8a6) accents. Geometric and abstract, NOT photorealistic. NO human faces or figures. NO clip art. NO cliché business imagery (light bulbs, rocket ships, upward arrows, handshakes). Generous negative space. Center-weighted composition. Dimensions: 1024x1024. Inspired by editorial illustration in The New York Times Op-Ed section.

---

### Example 2 — Article: "3 STAR Method Examples for Senior Engineers"
**Cluster:** STAR Method
**Concept:** the structure of a STAR answer — Situation → Task → Action → Result

**Prompt:**
> An abstract editorial illustration of four nested geometric shapes — a square, a circle, a triangle, and a hexagon — arranged in a horizontal sequence with thin connecting lines between them, suggesting structured progression. Each shape is filled with a slightly different shade of teal against a deep navy background. The shapes are simple and clean, no labels or text inside them. Style: editorial illustration in deep navy (#0a0e1a) with teal (#14b8a6) accents. Geometric and abstract, NOT photorealistic. NO human faces or figures. NO clip art. NO cliché business imagery (light bulbs, rocket ships, upward arrows, handshakes). Generous negative space. Center-weighted composition. Dimensions: 1024x1024. Inspired by editorial illustration in The New York Times Op-Ed section.

---

### Example 3 — Article: "Why We Deleted Our Live AI Interview Copilot"
**Cluster:** Interview Ethics (our moat)
**Concept:** the act of deliberate removal — taking something away as a principled choice

**Prompt:**
> An abstract editorial illustration of a grid of nine identical teal squares arranged in a 3x3 pattern, but with the center square removed, leaving an empty rectangular void in the middle. The remaining squares are evenly spaced against a deep navy background. The composition is calm and deliberate, not dramatic. The visible squares cast no shadows. Style: editorial illustration in deep navy (#0a0e1a) with teal (#14b8a6) accents. Geometric and abstract, NOT photorealistic. NO human faces or figures. NO clip art. NO cliché business imagery (light bulbs, rocket ships, upward arrows, handshakes). Generous negative space. Center-weighted composition. Dimensions: 1024x1024. Inspired by editorial illustration in The New York Times Op-Ed section.

---

## Alt-text generation (paired with image)

Every image gets an `---IMAGE_ALT_TEXT---` block in the agent's output. Rules:

- 60-125 characters
- Describes the image as a screen-reader user would need it (literal description, not metaphor explanation)
- Includes one relevant keyword from the article naturally if it fits the literal description, otherwise skip
- No quotes, no "image of...", no "graphic showing..."

**Example alt text for Example 1 above:**
> Teal circle isolated in a field of fragmented off-white diagonal lines on a navy background.

**Example alt text for Example 2 above:**
> Four nested geometric shapes — square, circle, triangle, hexagon — connected in a horizontal sequence on navy.

**Example alt text for Example 3 above:**
> Grid of nine teal squares on navy with the center square removed, leaving an empty rectangular void.

---

## When to regenerate

The editorial pass reviewer (Jacob) checks each image against the article concept. Regenerate if:
- Image accidentally contains a human face, figure, or silhouette (DALL-E occasionally adds these)
- Image looks like clip art or stock graphic
- Colors are off-palette (warm tones, saturated red/orange, etc. — DALL-E sometimes drifts)
- Composition is busy, cluttered, or over-decorated
- Image is metaphorically off (e.g., an upward arrow on an article about freezing)

Regeneration cost: $0.04 per attempt. Budget 2 regens per article in the worst case. If 3+ regens needed, the prompt itself is the problem — escalate to update this template.

---

## Future considerations (not for Phase 1)

- **HD images ($0.08)** if Phase 2 analysis shows hero images are driving meaningful click-through and standard quality is insufficient
- **In-line illustrations** alongside hero — only if topic clusters benefit (e.g., diagram-heavy articles like "How to structure a STAR answer")
- **Custom illustrator partnership** if monthly volume justifies hiring an editorial illustrator at $50-100/illustration — economics change at ~50+ articles/month

---

## Update protocol

When this document changes:
1. Bump version (top of doc)
2. Update "Last updated" date
3. Commit to repo: `image: update IMAGE_PROMPT_TEMPLATE [what changed]`
4. Writing agent picks up changes on next run (reads at run time)
5. Optionally regenerate hero images for top-traffic existing articles
