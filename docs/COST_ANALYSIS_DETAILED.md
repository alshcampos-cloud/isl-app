# InterviewAnswers.AI -- Comprehensive Cost Analysis

*Generated: April 6, 2026*
*Based on: Codebase review of all Edge Functions, credit system, and third-party integrations*

---

## 1. AI Model Usage and Per-Call Costs

### Models Deployed

The app uses three Anthropic Claude models, selected by feature mode in `supabase/functions/ai-feedback/index.ts`:

| Model | Model ID | Input (per 1M tokens) | Output (per 1M tokens) | Used For |
|-------|----------|----------------------|------------------------|----------|
| **Haiku 3.5** (legacy) | `claude-3-5-haiku-20241022` | $0.80 | $4.00 | `generate-bullets` only (simple extraction) |
| **Haiku 4.5** | `claude-haiku-4-5-20251001` | $1.00 | $5.00 | Practice, AI Interviewer, Answer Assistant, Onboarding, Portfolio Analysis, Nursing Practice/SBAR/Offer Coach |
| **Sonnet 4** | `claude-sonnet-4-20250514` | $3.00 | $15.00 | Confidence Brief, Answer Forge (upgrade-answer), Nursing Mock Interview, Nursing AI Coach, Question Generation |

### Per-Call Token Estimates and Costs

| Feature | Model | Est. Input Tokens | Max Output Tokens | Est. Cost/Call |
|---------|-------|-------------------|-------------------|----------------|
| **Practice Mode** (general) | Haiku 4.5 | ~1,500 | 2,000 | $0.012 |
| **AI Mock Interview** (per exchange) | Haiku 4.5 | ~2,000 | 2,000 | $0.012 |
| **AI Mock Interview** (full session, ~4 exchanges) | Haiku 4.5 | ~8,000 total | ~8,000 total | $0.048 |
| **Answer Assistant Start** | Haiku 4.5 | ~500 | 500 | $0.003 |
| **Answer Assistant Continue** | Haiku 4.5 | ~1,000 | 1,000 | $0.006 |
| **Answer Assistant** (full session, ~4 turns) | Haiku 4.5 | ~3,500 total | ~3,500 total | $0.021 |
| **Synthesize STAR Answer** | Haiku 4.5 | ~1,500 | 1,500 | $0.009 |
| **Generate Bullets** | Haiku 3.5 (legacy) | ~300 | 400 | $0.002 |
| **Question Generation** | Sonnet 4 | ~800 | 200 | $0.005 |
| **Onboarding** (general/nursing) | Haiku 4.5 | ~600 | 1,500 | $0.008 |
| **Answer Forge** (upgrade-answer) | Sonnet 4 | ~3,000 | 3,000 | $0.054 |
| **Confidence Brief** | Sonnet 4 | ~1,000 | 1,500 | $0.026 |
| **Portfolio Analysis** | Haiku 4.5 | ~2,000 | 4,000 | $0.022 |
| **Nursing Practice** | Haiku 4.5 | ~1,500 | 2,000 | $0.012 |
| **Nursing SBAR Drill** | Haiku 4.5 | ~1,200 | 1,500 | $0.009 |
| **Nursing Mock Interview** (per exchange) | Sonnet 4 | ~2,000 | 1,500 | $0.029 |
| **Nursing Mock Interview** (full session) | Sonnet 4 | ~10,000 total | ~7,500 total | $0.143 |
| **Nursing AI Coach** (per message) | Sonnet 4 | ~1,500 | 1,500 | $0.027 |
| **Nursing AI Coach** (10-msg session) | Sonnet 4 | ~15,000 total | ~15,000 total | $0.270 |
| **Nursing Offer Coach** | Haiku 4.5 | ~1,200 | 1,500 | $0.009 |

---

## 2. Edge Functions Inventory

| Edge Function | Purpose | External API Calls | Cost Driver |
|---------------|---------|-------------------|-------------|
| `ai-feedback` | All AI evaluation, coaching, answer crafting | Anthropic Claude API | Primary cost center |
| `generate-question` | AI-generated interview questions | Anthropic Claude (Sonnet 4) | ~$0.005/question |
| `tts-generate` | Text-to-speech audio for Learn Center | Google Cloud TTS (Neural2) | ~$16/1M chars |
| `create-checkout-session` | Stripe checkout session creation | Stripe API | No direct cost |
| `stripe-webhook` | Payment event processing, tier updates | Supabase DB | No direct cost |
| `check-usage` | Server-side usage/quota validation | Supabase DB | No direct cost |
| `create-portal-session` | Stripe customer portal access | Stripe API | No direct cost |
| `validate-native-receipt` | Apple/Google IAP receipt validation | Apple/Google servers | No direct cost |

### Supabase Edge Function Execution Costs

Supabase Free tier: 500K Edge Function invocations/month, 2M on Pro ($25/mo).

Each AI call = 1 invocation. Non-AI functions (checkout, webhook, check-usage) add invocations but no API cost.

---

## 3. Third-Party Service Costs

### A. Anthropic API (Claude)

- **Billing:** Pay-per-token, no monthly minimum
- **Primary cost center** for the entire application
- See Section 1 for per-call breakdowns

### B. Google Cloud TTS

- **Tier used:** Neural2 (en-US voices: Neural2-F, Neural2-C, Neural2-D, Neural2-J)
- **Pricing:** $16 per 1M characters (Neural2/WaveNet)
- **Free tier:** 1M WaveNet/Neural2 characters/month
- **Estimated usage per lesson:** ~1,000-2,000 characters (SSML markup adds ~30% overhead)
- **Cost per lesson TTS:** ~$0.02-0.03 (after free tier exhausted)
- **Note:** SSML chunking at 4,800 bytes per request; longer lessons = multiple API calls

### C. Supabase

| Component | Free Tier | Pro Tier ($25/mo) |
|-----------|-----------|-------------------|
| Database (Postgres) | 500MB | 8GB |
| Auth MAU | 50,000 | 100,000 |
| Storage | 1GB | 100GB |
| Edge Function invocations | 500K/mo | 2M/mo |
| Realtime connections | 200 concurrent | 500 concurrent |

**Current plan:** Pro ($25/month) -- required for Edge Function volume and DB size.

### D. Stripe

| Fee Type | Rate |
|----------|------|
| Per transaction | 2.9% + $0.30 |
| Recurring billing | Included |
| Stripe Tax (if enabled) | 0.5% per transaction |
| Webhooks | Free |
| Customer Portal | Free |

### E. Apple App Store (via RevenueCat)

| Fee Type | Rate |
|----------|------|
| Apple commission (Year 1, <$1M revenue) | 15% |
| Apple commission (Year 1, >$1M revenue) | 30% |
| RevenueCat (free tier) | Up to $2.5K MTR free, then 0.9% |

### F. Vercel

| Plan | Cost | Limits |
|------|------|--------|
| Pro | $20/month | 1TB bandwidth, serverless functions |
| Note: Static site, minimal serverless | Likely on free/hobby or Pro | Edge functions handled by Supabase |

### G. Google Ads

- **Budget:** $10/day ($300/month) -- campaign ran Feb 20-22, 2026 ($31.60 spent)
- **Status:** Currently paused (0 conversions recorded)
- **Conversion tracking:** Deployed (gtag + 4 conversion labels)

---

## 4. Cost Per User Session (Detailed Scenarios)

### Free Tier User -- Typical Monthly Usage

| Activity | AI Calls | Cost |
|----------|----------|------|
| Onboarding (1x) | 1 Haiku 4.5 call | $0.008 |
| Practice Mode (10 questions) | 10 Haiku 4.5 calls | $0.12 |
| AI Mock Interview (3 sessions x 4 exchanges) | 12 Haiku 4.5 calls | $0.144 |
| Answer Assistant (5 sessions x 4 turns) | 20 Haiku 4.5 calls | $0.105 |
| Question Generation (5 questions) | 5 Sonnet 4 calls | $0.025 |
| **TOTAL** | **48 calls** | **$0.40** |

### Paid General User ($14.99 pass) -- Heavy Monthly Usage

| Activity | AI Calls | Cost |
|----------|----------|------|
| Practice Mode (30 questions) | 30 Haiku 4.5 | $0.36 |
| AI Mock Interview (10 sessions) | 40 Haiku 4.5 | $0.48 |
| Answer Assistant (15 sessions) | 60 Haiku 4.5 | $0.315 |
| Answer Forge (10 upgrades) | 10 Sonnet 4 | $0.54 |
| Question Generation (20) | 20 Sonnet 4 | $0.10 |
| Generate Bullets (20) | 20 Haiku 3.5 | $0.04 |
| **TOTAL** | **180 calls** | **$1.84** |

### Paid Nursing User ($19.99 pass) -- Heavy Monthly Usage

| Activity | AI Calls | Cost |
|----------|----------|------|
| Nursing Practice (20 questions) | 20 Haiku 4.5 | $0.24 |
| Nursing Mock Interview (8 sessions) | 32 Sonnet 4 | $1.14 |
| Nursing AI Coach (5 sessions x 10 msgs) | 50 Sonnet 4 | $1.35 |
| Nursing SBAR Drill (10) | 10 Haiku 4.5 | $0.09 |
| Confidence Brief (5) | 5 Sonnet 4 | $0.13 |
| TTS lessons (10 lessons) | 10 GCP calls | $0.25 |
| **TOTAL** | **127 calls** | **$3.20** |

### Annual All-Access User ($149.99/yr) -- Power User

Combines both General and Nursing heavy usage:

| Total Monthly AI Cost | $1.84 + $3.20 = **$5.04** |
|-----------------------|---------------------------|

---

## 5. Revenue vs. Cost Margin Analysis

### Per-User Unit Economics

| Plan | Revenue | Platform Fee | Net Revenue | Est. API Cost (avg user) | Est. API Cost (heavy user) | Margin (avg) | Margin (heavy) |
|------|---------|-------------|-------------|-------------------------|---------------------------|--------------|----------------|
| **Free** | $0 | -- | $0 | $0.20 | $0.40 | -$0.20 | -$0.40 |
| **General 30-Day (Web/Stripe)** | $14.99 | $0.73 (4.9%+$0.30) | $14.26 | $0.60 | $1.84 | $13.66 (96%) | $12.42 (87%) |
| **General 30-Day (iOS)** | $14.99 | $2.25 (15%) | $12.74 | $0.60 | $1.84 | $12.14 (95%) | $10.90 (86%) |
| **Nursing 30-Day (Web/Stripe)** | $19.99 | $0.88 | $19.11 | $1.20 | $3.20 | $17.91 (94%) | $15.91 (83%) |
| **Nursing 30-Day (iOS)** | $19.99 | $3.00 (15%) | $16.99 | $1.20 | $3.20 | $15.79 (93%) | $13.79 (81%) |
| **Annual (Web/Stripe)** | $149.99 | $4.65 | $145.34 | $24.00 ($2/mo) | $60.48 ($5.04/mo) | $121.34 (83%) | $84.86 (58%) |
| **Annual (iOS)** | $149.99 | $22.50 (15%) | $127.49 | $24.00 | $60.48 | $103.49 (81%) | $67.01 (53%) |

**Key insight:** Margins are healthy at current usage patterns. The biggest risk is Annual power users on iOS who use both Nursing (Sonnet 4-heavy) and General features aggressively -- still profitable at 53% margin even in worst case.

---

## 6. Fixed Monthly Infrastructure Costs

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| Supabase Pro | $25.00 | Database, Auth, Edge Functions, Storage |
| Vercel | $0-20.00 | Likely free/hobby tier sufficient for current traffic |
| Domain (interviewanswers.ai) | ~$1.50 | Annualized |
| Domain (nurseinterviewpro.ai) | ~$1.50 | Annualized |
| Google Cloud TTS | $0 | Under 1M char/month free tier at current scale |
| Stripe | $0 | No monthly fee, per-transaction only |
| RevenueCat | $0 | Under $2.5K MTR free tier |
| **Total Fixed** | **~$28-48/month** | |

---

## 7. Scaling Projections

### Assumptions
- 80% of users are free tier
- 15% purchase a 30-day pass (average $17.49 blended)
- 5% purchase annual ($149.99)
- 60% of paid users are web (Stripe), 40% iOS (Apple 15% cut)
- Average free user: $0.20/month API cost
- Average paid user: $1.50/month API cost
- Heavy paid user: $4.00/month API cost

### 100 Monthly Active Users

| Line Item | Amount |
|-----------|--------|
| **Revenue** | |
| Free (80 users) | $0 |
| 30-Day Pass (15 users x $17.49) | $262.35 |
| Annual (5 users x $12.50/mo effective) | $62.50 |
| **Gross Revenue** | **$324.85** |
| **Costs** | |
| Platform fees (Stripe + Apple blended ~8%) | -$25.99 |
| Anthropic API (80 free x $0.20 + 20 paid x $1.50) | -$46.00 |
| Supabase Pro | -$25.00 |
| Vercel | -$0 |
| Google Cloud TTS | -$0 |
| **Total Costs** | **-$96.99** |
| **Net Margin** | **$227.86 (70%)** |

### 1,000 Monthly Active Users

| Line Item | Amount |
|-----------|--------|
| **Revenue** | |
| Free (800 users) | $0 |
| 30-Day Pass (150 users x $17.49) | $2,623.50 |
| Annual (50 users x $12.50/mo) | $625.00 |
| **Gross Revenue** | **$3,248.50** |
| **Costs** | |
| Platform fees (~8%) | -$259.88 |
| Anthropic API (800 x $0.20 + 200 x $1.50) | -$460.00 |
| Supabase Pro | -$25.00 |
| Vercel Pro | -$20.00 |
| Google Cloud TTS | -$10.00 |
| **Total Costs** | **-$774.88** |
| **Net Margin** | **$2,473.62 (76%)** |

### 10,000 Monthly Active Users

| Line Item | Amount |
|-----------|--------|
| **Revenue** | |
| Free (8,000 users) | $0 |
| 30-Day Pass (1,500 users x $17.49) | $26,235.00 |
| Annual (500 users x $12.50/mo) | $6,250.00 |
| **Gross Revenue** | **$32,485.00** |
| **Costs** | |
| Platform fees (~8%) | -$2,598.80 |
| Anthropic API (8,000 x $0.20 + 2,000 x $1.50) | -$4,600.00 |
| Supabase (Team plan or self-hosted) | -$599.00 |
| Vercel Pro | -$20.00 |
| Google Cloud TTS | -$100.00 |
| Google Ads (scaled) | -$3,000.00 |
| **Total Costs** | **-$10,917.80** |
| **Net Margin** | **$21,567.20 (66%)** |

---

## 8. Cost Optimization Recommendations

### Short-Term (Implement Now)

1. **Keep Haiku 4.5 as default** -- Already done. The codebase correctly routes most features to Haiku 4.5 at ~1/3 the cost of Sonnet. No change needed.

2. **Monitor Nursing AI Coach sessions** -- At $0.027/message with Sonnet 4, a chatty user doing 10 sessions of 15+ messages = $4.05/month on coaching alone. Consider a soft session length cap (e.g., 15 messages per session) to prevent runaway costs.

3. **Cache Question Generation** -- `generate-question` uses Sonnet 4 ($0.005/call). With 5 free-tier calls per user, this is low-impact now but could be replaced with a pre-generated question pool to eliminate the Sonnet cost entirely.

4. **Track actual token usage** -- Add response header logging for `usage.input_tokens` and `usage.output_tokens` from Anthropic responses. This would replace estimates with real data.

### Medium-Term (1-3 Months)

5. **Evaluate Haiku 4.5 for Nursing Mock/Coach** -- Currently using Sonnet 4 for multi-turn nursing features. If Haiku 4.5 quality is acceptable for these modes, switching would cut nursing mock interview cost from $0.143 to ~$0.048 per session (67% reduction).

6. **TTS caching** -- Cache generated audio for Learn Center lessons in Supabase Storage. Same lesson content generates identical audio. One-time generation cost, then served from cache.

7. **Prompt compression** -- The `upgrade-answer` prompt is ~2,500+ tokens of instructions alone. Reducing prompt boilerplate by 30% would save ~$0.005/call (meaningful at scale).

### Long-Term (3-12 Months)

8. **Batch API for non-interactive features** -- Anthropic's Batch API offers 50% discount on token costs. Features like `generate-bullets` and `portfolio-analysis` that don't need real-time responses could use batch processing.

9. **Prompt caching** -- Anthropic offers prompt caching that reduces repeated system prompt costs by up to 90%. The nursing coach system prompt is sent with every message in a conversation -- caching would significantly reduce multi-turn costs.

10. **Self-hosted inference** -- At 10,000+ users, evaluating self-hosted models (e.g., fine-tuned Llama) for simple tasks like bullet generation could reduce costs further, though this adds operational complexity.

---

## 9. Key Risk Factors

| Risk | Impact | Mitigation |
|------|--------|------------|
| Free tier abuse (bots, multi-accounts) | API costs without revenue | Server-side usage enforcement already in place; add rate limiting per IP |
| Sonnet 4 price increase | 30%+ cost increase on nursing features | Monitor Anthropic pricing; evaluate Haiku 4.5 as fallback |
| Heavy nursing coach users | Single user could cost $5+/month | Soft session caps; monitor top-percentile usage |
| Apple raising commission to 30% | Doubles iOS platform fee | Encourage web signups; annual plan has best margin buffer |
| Google TTS free tier removal | ~$16/1M chars becomes real cost | Pre-generate and cache all lesson audio |
| Supabase free tier changes | Edge Function limits could tighten | Monitor invocation counts; budget for Team plan |

---

## 10. Summary

**InterviewAnswers.AI has strong unit economics.** Even under heavy-usage scenarios:

- **General 30-Day Pass:** 87-96% margin
- **Nursing 30-Day Pass:** 81-94% margin
- **Annual All-Access:** 53-83% margin (widest range due to usage variability)

**The #1 cost driver is Anthropic API calls**, specifically Sonnet 4 for nursing multi-turn features (Mock Interview and AI Coach). All other costs (infrastructure, TTS, payment processing) are either fixed or proportional to revenue.

**Break-even point:** With ~$28-48/month in fixed costs, the app needs just 2-3 paid users per month to cover infrastructure. Each additional paid user contributes $12-19 in margin.

**At 1,000 MAU** (200 paid), the business generates approximately $2,500/month net margin with a 76% margin rate. This is a highly capital-efficient SaaS model with no servers to maintain, no ML infrastructure, and API costs that scale linearly with revenue.

---

*Data sources: `supabase/functions/ai-feedback/index.ts`, `supabase/functions/generate-question/index.ts`, `supabase/functions/tts-generate/index.ts`, `supabase/functions/check-usage/index.ts`, `src/utils/creditSystem.js`, `package.json`. Anthropic pricing as of April 2026. Stripe and Apple commission rates are standard published rates.*
