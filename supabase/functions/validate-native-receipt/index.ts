// validate-native-receipt/index.ts
// Validates Apple App Store / Google Play receipts and upgrades user to Pro
//
// Called from the native app after a successful in-app purchase.
// Verifies the receipt with Apple/Google servers, then updates user_profiles.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { userId, receipt, provider } = await req.json();

    // Verify userId matches authenticated user
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!receipt || !provider) {
      return new Response(
        JSON.stringify({ error: 'Receipt and provider are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Validating ${provider} receipt for user: ${userId}`);

    let isValid = false;

    if (provider === 'apple') {
      isValid = await validateAppleReceipt(receipt);
    } else if (provider === 'google') {
      isValid = await validateGoogleReceipt(receipt);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid provider. Must be "apple" or "google"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValid) {
      console.error(`Invalid ${provider} receipt for user: ${userId}`);
      return new Response(
        JSON.stringify({ valid: false, error: 'Receipt validation failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Receipt is valid — upgrade user to Pro
    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        tier: 'pro',
        subscription_status: 'active',
        subscription_provider: provider, // 'apple' or 'google' — distinguishes from Stripe
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('Failed to update user profile:', updateError);
      return new Response(
        JSON.stringify({ valid: true, error: 'Failed to update subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${userId} upgraded to Pro via ${provider}`);

    return new Response(
      JSON.stringify({ valid: true, tier: 'pro' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Receipt validation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Receipt validation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Validate Apple App Store receipt
 * Uses Apple's App Store Server API (v2)
 *
 * TODO: When ready to go live, set these env vars in Supabase:
 *   - APPLE_SHARED_SECRET (from App Store Connect)
 *   - APPLE_BUNDLE_ID (ai.interviewanswers.app)
 *
 * For sandbox testing, use: https://sandbox.itunes.apple.com/verifyReceipt
 * For production, use: https://buy.itunes.apple.com/verifyReceipt
 */
async function validateAppleReceipt(receipt: string): Promise<boolean> {
  const sharedSecret = Deno.env.get('APPLE_SHARED_SECRET');
  if (!sharedSecret) {
    console.error('APPLE_SHARED_SECRET not configured');
    return false;
  }

  try {
    // Try production first
    let response = await fetch('https://buy.itunes.apple.com/verifyReceipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'receipt-data': receipt,
        password: sharedSecret,
        'exclude-old-transactions': true,
      }),
    });

    let result = await response.json();

    // Status 21007 means it's a sandbox receipt — retry with sandbox URL
    if (result.status === 21007) {
      response = await fetch('https://sandbox.itunes.apple.com/verifyReceipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'receipt-data': receipt,
          password: sharedSecret,
          'exclude-old-transactions': true,
        }),
      });
      result = await response.json();
    }

    // Status 0 = valid receipt
    if (result.status === 0) {
      // Check that the subscription is active
      const latestReceipt = result.latest_receipt_info?.[0];
      if (latestReceipt) {
        const expiresDate = new Date(parseInt(latestReceipt.expires_date_ms));
        return expiresDate > new Date();
      }
    }

    console.error('Apple receipt validation failed with status:', result.status);
    return false;
  } catch (err) {
    console.error('Apple receipt validation error:', err);
    return false;
  }
}

/**
 * Validate Google Play receipt
 * Uses Google Play Developer API
 *
 * TODO: When ready to go live, set these env vars in Supabase:
 *   - GOOGLE_PLAY_SERVICE_ACCOUNT_KEY (JSON service account key)
 *   - GOOGLE_PLAY_PACKAGE_NAME (ai.interviewanswers.app)
 */
async function validateGoogleReceipt(receipt: string): Promise<boolean> {
  const serviceAccountKey = Deno.env.get('GOOGLE_PLAY_SERVICE_ACCOUNT_KEY');
  const packageName = Deno.env.get('GOOGLE_PLAY_PACKAGE_NAME');

  if (!serviceAccountKey || !packageName) {
    console.error('Google Play validation not configured');
    return false;
  }

  try {
    const parsedReceipt = JSON.parse(receipt);
    const { purchaseToken, productId } = parsedReceipt;

    // Get access token from service account
    const serviceAccount = JSON.parse(serviceAccountKey);
    // TODO: Implement JWT signing for Google OAuth2
    // For now, this is a placeholder for the Google Play Developer API call

    console.log(`Would validate Google receipt for product: ${productId}`);
    return false; // Return false until properly configured
  } catch (err) {
    console.error('Google receipt validation error:', err);
    return false;
  }
}
