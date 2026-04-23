# Anthropic API Capacity & Launch Readiness

*Research run: April 11, 2026 — Product Hunt launch prep*

## 1. TL;DR — Do These Three Things Tonight

1. **Prepay enough credits to force Tier 3 or Tier 4** (~$400 lifetime deposit on the org) at console.anthropic.com/settings/billing. At current Tier 1 ($5 min, 50 RPM) a Product Hunt spike WILL 429 within the first hour.
2. **Set a monthly spend cap** at console.anthropic.com/settings/limits (suggest $500–$1,000) and enable **auto-reload** so the account never hits a hard stop mid-launch. Default caps are low — check and raise deliberately.
3. **Ship a retry wrapper around the two `fetch('https://api.anthropic.com/v1/messages')` calls in `supabase/functions/ai-feedback/index.ts` (lines 681 and 818) and `supabase/functions/generate-question/index.ts` (line 85).** Currently a single Anthropic 429 or 529 surfaces as a broken JSON blob to the user. Battle Scar #3 is not actually implemented.

## 2. Current Tier Estimate

No prepay history is evident in the repo (no references to auto-reload, no credit notes in SESSION_STATE). Given the account was created for a bootstrapped launch and has only been running modest traffic (170 ad impressions, single-digit daily users), the org is almost certainly **Tier 1** or at best **Tier 2**. Assume **Tier 1** until verified in console.anthropic.com/settings/limits.

- Tier 1 = $5 minimum deposit, $100/mo spend cap
- Tier 2 = $40 cumulative, $500/mo spend cap
- Tier 3 = ~$200 cumulative, $1,000/mo
- Tier 4 = ~$400 cumulative, $5,000/mo
- Upgrades auto-apply within minutes once deposits clear.

## 3. Rate Limit Table (Claude Haiku 4.5 + Sonnet 4.5, April 2026)

| Tier | RPM (all) | Sonnet ITPM | Sonnet OTPM | Haiku ITPM | Haiku OTPM |
|------|-----------|-------------|-------------|------------|------------|
| 1    | 50        | 30,000      | 8,000       | 50,000     | 10,000     |
| 2    | 1,000     | 450,000     | 90,000      | 500,000    | 100,000    |
| 3    | 2,000     | 800,000     | 160,000     | 1,000,000  | 200,000    |
| 4    | 4,000     | 2,000,000   | 400,000     | 4,000,000  | 800,000    |

Uncached input tokens are what count toward ITPM. Enterprise/custom tiers exist beyond Tier 4 via sales.

**Pricing (April 2026):** Haiku 4.5 = **$1 / $5** per million in/out. Sonnet 4.5 = **$3 / $15** per million in/out. Batch API gets a 50% discount.

## 4. Launch Math — 1,000 mock interviews in 24 hours

Assumption: 18 calls/interview × 1,000 interviews × (2,000 in + 500 out) tokens = **18,000 calls, 36M input + 9M output tokens over 24h**.

- Average RPM: 18,000 / 1,440 min ≈ **12.5 RPM** — trivially under every tier.
- **Peak** matters more. Product Hunt traffic is spiky; realistic peak = 5–10× average ≈ 60–125 RPM.
- **Tier 1 (50 RPM) FAILS** during any spike.
- **Tier 2 (1,000 RPM, 450k Sonnet ITPM) PASSES** comfortably for interviews.
- Peak ITPM: 125 RPM × 2,000 = 250,000 ITPM — needs Tier 2+ on Sonnet.
- **Cost estimate:** 36M × $3 + 9M × $15 = **$108 + $135 = ~$243** for the 1,000 interviews. Well under a $500 cap.

**Verdict: Tier 2 is the floor. Tier 3 is the safe choice for Product Hunt day.**

## 5. Prepayment + Spend Cap Recommendation (do tonight)

1. console.anthropic.com/settings/billing → **Add credits: $250** (pushes org past Tier 2, comfortably into Tier 3 range over the next reload).
2. Enable **Auto-reload: $100 when balance drops below $50**.
3. console.anthropic.com/settings/limits → set **Monthly spend limit = $500** (hard cap). Anthropic's default is too lax; set it deliberately.
4. Verify current tier shows at least Tier 2 within 5 minutes after the deposit clears.
5. Note: when credits hit zero, requests get a **hard 402/credit error** — auto-reload is the only defense.

## 6. Code Audit Findings — No 429 Retry Logic Exists

**`generate-question/index.ts` line 85:**

```
const response = await fetch('https://api.anthropic.com/v1/messages', { ... })
const data = await response.json()
let question = data.content[0].text.trim()
```

Zero retry. Zero status check. If Anthropic returns 429/529/500, `data.content` is undefined and line 101 throws, caught by a generic 500 handler on line 111. **User sees a broken generation.**

**`ai-feedback/index.ts` line 681 (nursing) and 818 (general):**

```
const nursingResponse = await fetch('https://api.anthropic.com/v1/messages', { ... })
const nursingData = await nursingResponse.json();
...
if (!nursingResponse.ok || nursingData?.error) {
  logError({ ... httpStatus: nursingResponse.status ... })
}
return new Response(JSON.stringify(nursingData), { ... })
```

The 429 path LOGS the error and then returns the raw Anthropic error body to the client as if it were a success — the client parses garbage. **No retry. No Retry-After header respect. No fallback response.** The two `status: 429` responses at lines 300/651 are the app's own monthly-quota gates, unrelated to upstream rate limiting.

**Battle Scar #3 ("retry logic (3 attempts, 0s/1s/2s backoff)") is NOT implemented in either function.**

## 7. Coder Action Items (Ranked)

1. **P0 — Add retry-with-backoff wrapper** around all three Anthropic `fetch` calls. On 429/529/503: read `retry-after` header (fall back to 1s/2s/4s), retry up to 3x. On final failure, return a structured `{ error: 'rate_limited', userMessage: '...' }` so the client can show a friendly retry UI.
2. **P0 — Guard `data.content[0].text`** — every consumer currently assumes success. Check `response.ok && data?.content?.[0]?.text` before indexing.
3. **P1 — Never charge usage on a non-200.** Verify `incrementUsage()` only runs after a confirmed-good response (Battle Scar #8).
4. **P1 — Client-side "try again" button** on rate-limit error instead of silent breakage.
5. **P2 — Log `retry-after` values** to `api_metrics` so we can see Anthropic pressure in real time on launch day.
6. **P2 — Consider a "Haiku fallback" path:** on repeated Sonnet 429s, degrade nursing mock interviews to Haiku rather than failing. Cheaper and keeps the experience alive.
7. **P3 — Batch API** for any async/non-interactive workload (50% discount) — not for live interviews.

## 8. Sources

- [Rate limits — Claude API Docs](https://platform.claude.com/docs/en/api/rate-limits)
- [Pricing — Claude API Docs](https://platform.claude.com/docs/en/about-claude/pricing)
- [How do I pay for my Claude API usage? — Claude Help Center](https://support.anthropic.com/en/articles/8977456-how-do-i-pay-for-my-api-usage)
- [How can I advance my Claude API usage to Tier 2? — Claude Help Center](https://support.anthropic.com/en/articles/10366389-how-can-i-advance-my-api-usage-to-tier-2)
- [Claude Console — Limits](https://console.anthropic.com/settings/limits)
- [Claude API Quota Tiers and Limits Explained (2026) — AI Free API](https://www.aifreeapi.com/en/posts/claude-api-quota-tiers-limits)
- [Claude Rate Limits: Every Tier, Plan & Model (2026) — Morph](https://www.morphllm.com/claude-rate-limits)
- [How to Fix Claude API 429 Rate Limit Error (2026) — AI Free API](https://www.aifreeapi.com/en/posts/fix-claude-api-429-rate-limit-error)
- [Anthropic API Rate Limits: How to Handle 429 Errors — Markaicode](https://markaicode.com/anthropic-api-rate-limits-429-errors/)
- [Claude API Pricing Calculator & Cost Guide (Apr 2026) — Costgoat](https://costgoat.com/pricing/claude-api)

---
## UPDATE: April 22, 2026

**Status corrected:** $250 Anthropic deposit was made (verified with founder). The account is at **Tier 3**.

Tier 3 capacity:
- Monthly cap: $1,000
- Sonnet 4.5: 2,000 RPM, 80K input TPM
- Haiku 4.5: 4,000 RPM
- Can handle Product Hunt spike (500+ concurrent users)

The rest of this document (written April 11, pre-payment) recommending "prepay to Tier 3" is now COMPLETE. Do not treat as a pending action.
