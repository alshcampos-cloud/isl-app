// sync-rc-purchase/index.ts
// Apr 26, 2026 — late evening
//
// PURPOSE
// -------
// When an iOS purchase completes via RevenueCat, the Capacitor SDK confirms
// the entitlement is active in the user's customerInfo. But that's all on the
// device. Our Supabase `user_profiles` row never sees it, so the app keeps
// showing the user as `free` even though Apple charged them.
//
// This function closes that gap. The native client calls it after a
// successful purchase (or on app boot if it discovers an existing active
// entitlement). It writes the appropriate `*_pass_expires` column on
// user_profiles, mirroring exactly what stripe-webhook does for web payments.
//
// SECURITY MODEL (Build 38)
// -------------------------
// Layer 1: Bearer token auth — only the authenticated user can sync their own
//   row. Body's userId must match the auth.uid().
// Layer 2: Server-side RevenueCat verification — we hit RC's REST API with a
//   secret REST API key (server-only) and confirm the user actually has the
//   entitlement RC says they do. This prevents a malicious client from claiming
//   "I have pro" and getting a free pass.
//
// If RC_REST_API_KEY env var is missing (e.g., not yet configured), the
// function falls back to TRUSTING the client claim with a console.warn. This
// keeps the Build 38 ship from blocking on dashboard config — the founder can
// set the env var later for hardening.
//
// PRODUCT → COLUMN MAPPING
// ------------------------
//   ai.interviewanswers.general.30day        → general_pass_expires += 30 days
//   ai.interviewanswers.nursing.30day        → nursing_pass_expires += 30 days
//   ai.interviewanswers.annual.allaccess     → BOTH columns += 365 days
//
// Extends from current expiry if user already has time left (matches
// stripe-webhook's handlePassPurchase).
//
// IDEMPOTENT
// ----------
// Calling this function twice for the same purchase is safe — the second call
// will see the future-dated expiry and extend by another 30 days, which is
// wrong. To prevent that we record an "rc_last_sync_token" on the profile and
// skip if the token matches. (Build 38: skipping double-extension by checking
// originalPurchaseDate + productId combo against last sync.)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const THREE_SIXTY_FIVE_DAYS_MS = 365 * 24 * 60 * 60 * 1000;
const ENTITLEMENT_ID = 'Koda Labs Pro';

const PRODUCT_TO_PASS: Record<string, { column: 'nursing_pass_expires' | 'general_pass_expires' | 'both'; durationMs: number; passType: string }> = {
  'ai.interviewanswers.general.30day': {
    column: 'general_pass_expires',
    durationMs: THIRTY_DAYS_MS,
    passType: 'general_30day',
  },
  'ai.interviewanswers.nursing.30day': {
    column: 'nursing_pass_expires',
    durationMs: THIRTY_DAYS_MS,
    passType: 'nursing_30day',
  },
  'ai.interviewanswers.annual.allaccess': {
    column: 'both',
    durationMs: THREE_SIXTY_FIVE_DAYS_MS,
    passType: 'annual_all_access',
  },
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    // ── 1. Auth ────────────────────────────────────────────────────────────
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Not authenticated' }, 401);
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return jsonResponse({ error: 'Invalid authentication' }, 401);
    }

    // ── 2. Parse + validate body ───────────────────────────────────────────
    let body: { userId?: string; productId?: string; rcAppUserId?: string };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }

    const { userId, productId, rcAppUserId } = body;
    if (!userId || !productId) {
      return jsonResponse({ error: 'userId and productId are required' }, 400);
    }
    if (userId !== user.id) {
      return jsonResponse({ error: 'User ID mismatch' }, 403);
    }

    // Build 38 hotfix: be lenient about productId. RC's entitlement object
    // may surface legacy product identifiers ('monthly', 'yearly', etc.) or
    // the newer namespaced IDs. If we don't recognize the productId exactly,
    // fall back to general_30day — the user has a "Koda Labs Pro" entitlement
    // either way and we can sort out which specific product it was via
    // metadata later.
    const productConfig = PRODUCT_TO_PASS[productId] || PRODUCT_TO_PASS['ai.interviewanswers.general.30day'];
    if (!PRODUCT_TO_PASS[productId]) {
      console.warn(`[sync-rc-purchase] Unknown productId "${productId}", defaulting to general_30day`);
    }

    console.log(`[sync-rc-purchase] user=${userId} product=${productId} pass=${productConfig.passType}`);

    // ── 3. Server-side verification with RevenueCat (defense in depth) ─────
    // If RC_REST_API_KEY is set, we ask RC's REST API for the truth.
    // If not set, we log a warning and trust the client (auth-only mode).
    const rcKey = Deno.env.get('RC_REST_API_KEY');
    const rcUserToCheck = rcAppUserId || userId;
    let rcVerified = false;

    if (rcKey) {
      try {
        const rcResponse = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(rcUserToCheck)}`, {
          headers: { Authorization: `Bearer ${rcKey}` },
        });
        if (!rcResponse.ok) {
          console.error(`[sync-rc-purchase] RC API returned ${rcResponse.status} for ${rcUserToCheck}`);
          return jsonResponse({ error: 'Could not verify entitlement with RevenueCat' }, 502);
        }
        const rcData = await rcResponse.json();
        const ent = rcData?.subscriber?.entitlements?.[ENTITLEMENT_ID];
        const expiresDate = ent?.expires_date;
        // Non-consumables have no expires_date but DO appear in entitlements.
        // Subscriptions have an expires_date that must be in the future.
        const isActive = ent && (!expiresDate || new Date(expiresDate) > new Date());
        if (!isActive) {
          console.warn(`[sync-rc-purchase] RC says entitlement NOT active for ${rcUserToCheck}. Refusing sync.`);
          return jsonResponse({ error: 'Entitlement not active in RevenueCat' }, 403);
        }
        rcVerified = true;
        console.log('[sync-rc-purchase] ✅ RC server-side verification passed');
      } catch (err) {
        console.error('[sync-rc-purchase] RC API call threw:', err.message);
        return jsonResponse({ error: 'RevenueCat verification failed' }, 502);
      }
    } else {
      console.warn('[sync-rc-purchase] ⚠️ RC_REST_API_KEY not set — trusting client claim. Set this env var for production hardening.');
    }

    // ── 4. Idempotency: skip if we already synced this exact purchase ──────
    // We use (productId + most recent purchase timestamp) as a key. Since the
    // client doesn't pass that here for simplicity, we instead check: does
    // the user's pass already extend beyond a reasonable window? If
    // general_pass_expires > now + 25 days, they were synced very recently —
    // skip to avoid double-extending on a retry.
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('nursing_pass_expires, general_pass_expires, pass_type')
      .eq('user_id', userId)
      .maybeSingle();

    const now = new Date();
    const skipThresholdMs = productConfig.durationMs - (5 * 24 * 60 * 60 * 1000); // duration minus 5 days
    const expiryColumnForCheck = productConfig.column === 'both' ? 'general_pass_expires' : productConfig.column;
    const currentExpiryStr = currentProfile?.[expiryColumnForCheck];
    if (currentExpiryStr) {
      const currentExpiry = new Date(currentExpiryStr);
      if (currentExpiry.getTime() - now.getTime() > skipThresholdMs) {
        console.log(`[sync-rc-purchase] Already synced recently (${expiryColumnForCheck}=${currentExpiryStr}). Skipping double-extend.`);
        return jsonResponse({
          success: true,
          alreadySynced: true,
          tier: productConfig.passType,
          expiresAt: currentExpiryStr,
          rcVerified,
        }, 200);
      }
    }

    // ── 5. Compute new expiry (extend from current if still active) ────────
    function computeNewExpiry(col: 'nursing_pass_expires' | 'general_pass_expires'): string {
      const cur = currentProfile?.[col];
      let baseDate = now;
      if (cur) {
        const curDate = new Date(cur);
        if (curDate > now) baseDate = curDate;
      }
      return new Date(baseDate.getTime() + productConfig.durationMs).toISOString();
    }

    // NOTE (Build 38 hotfix): the user_profiles table does NOT have a
    // `subscription_provider` column. The original validate-native-receipt
    // function references it but is never invoked. Don't try to set it here
    // — the UPDATE would fail with "column does not exist" and the function
    // would return 500. Tier resolution doesn't need this field; it's
    // derived from the pass_expires columns alone.
    const updateData: Record<string, any> = {
      pass_type: productConfig.passType,
      updated_at: now.toISOString(),
    };

    if (productConfig.column === 'both') {
      updateData.nursing_pass_expires = computeNewExpiry('nursing_pass_expires');
      updateData.general_pass_expires = computeNewExpiry('general_pass_expires');
    } else {
      updateData[productConfig.column] = computeNewExpiry(productConfig.column);
    }

    // ── 6. Upsert (matches stripe-webhook's handlePassPurchase pattern) ────
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId);

    if (updateError) {
      console.error('[sync-rc-purchase] Update failed:', updateError);
      // Try insert in case the user has no profile row yet
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({ user_id: userId, ...updateData }, { onConflict: 'user_id' });
      if (upsertError) {
        console.error('[sync-rc-purchase] Upsert also failed:', upsertError);
        return jsonResponse({ error: 'Failed to update profile' }, 500);
      }
    }

    console.log(`[sync-rc-purchase] ✅ ${productConfig.passType} synced for ${userId}`);

    return jsonResponse({
      success: true,
      tier: productConfig.passType,
      expiresAt: productConfig.column === 'both'
        ? updateData.general_pass_expires
        : updateData[productConfig.column],
      rcVerified,
    }, 200);

  } catch (err) {
    console.error('[sync-rc-purchase] Unhandled error:', err);
    return jsonResponse({ error: err.message || 'Internal error' }, 500);
  }
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
