# Email deliverability investment ($400 Resend Pro upgrade) — now or later?

**Labels suggestion:** marketing, decision, infrastructure, wave-2
**Assignees suggestion:** @lucas (owner) + @jacobdev-prog (failure-mode analysis)

---

## Context

We use Resend for transactional + marketing email. Free tier handles low volume but rate-limits and lacks deliverability dashboards (no per-domain spam rate, no IP warming, no open-rate tracking by ISP). Pro tier is $400/mo and unlocks IP warming + deliverability insights + higher sending limits. **Risk if we don't upgrade:** if a launch burst sends 500+ emails in one day, free tier may throttle or get the domain flagged for spam.

## Options

- **A) Upgrade now ($400 burn)** — Pre-emptive. Sets up IP warming before launch traffic. Per-day-1 deliverability metrics.
- **B) Wait until first paid signal (10+ signups)** — Free tier handles current volume. Defer $400/mo until we have evidence of email-as-channel ROI.
- **C) Upgrade to Resend "Starter" (~$20/mo) instead** — Some Pro features, much lower cost. Worth a check if it covers IP warming.
- **D) Move to Klaviyo or Customer.io (different vendor)** — Klaviyo = e-commerce-grade incumbent. Customer.io = events-API stack. More features per dollar, more setup. Not recommended pre-PMF.

## Recommended

**B** — defer $400 until forcing function. Send 100-200 burst from free tier first, measure bounce/spam rates, decide on data. If free tier shows degradation, upgrade then. Engineering-lens failure mode: domain flagged + future deliverability damaged. Mitigation: pre-warm via SPF/DKIM/DMARC tightening (free) + send in smaller batches (free).

## Jacob's input requested

- Failure-mode analysis: if we don't upgrade and send 500+ emails in a launch burst, what specifically breaks? Domain reputation damage that can't be undone?
- Vendor evaluation: is Resend Pro the right $400, or is Customer.io / Postmark / SES + own infra a better engineering investment?
- Pre-warming via SPF/DKIM/DMARC — is the current config solid?

## Decision deadline

**Within 14 days, but no later than first launch burst.** Tied to Apple Build 43 launch (D11).

## Outcome (filled in after decision)

_TBD_
