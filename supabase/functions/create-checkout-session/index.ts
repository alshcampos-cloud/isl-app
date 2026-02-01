// create-checkout-session/index.ts
// Creates a Stripe Checkout session for Pro subscription

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment system not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get Supabase client for auth verification
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

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Authenticated user:', user.id);

    // Parse request body
    const { priceId, userId, email, successUrl, cancelUrl } = await req.json();

    // Validate required fields
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'Price ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'Success and cancel URLs are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the userId matches the authenticated user
    if (userId !== user.id) {
      console.error('❌ User ID mismatch:', userId, 'vs', user.id);
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const customerEmail = email || user.email;
    console.log('🛒 Creating checkout session for:', customerEmail);

    // Check if user already has a Stripe customer ID
    // Use maybeSingle() to handle users who don't have a profile row yet
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id, tier')
      .eq('user_id', user.id)
      .maybeSingle();

    // If user is already pro, don't let them subscribe again
    if (profile?.tier === 'pro') {
      return new Response(
        JSON.stringify({ error: 'You already have a Pro subscription' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build checkout session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: profile?.stripe_customer_id ? undefined : customerEmail,
      customer: profile?.stripe_customer_id || undefined,
      metadata: {
        userId: user.id,
        email: customerEmail,
        supabaseUserId: user.id, // Redundant but explicit
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          email: customerEmail,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    };

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('✅ Checkout session created:', session.id);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Checkout session error:', error);

    // Get error message safely
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error details:', errorMessage);

    // Handle Stripe-specific errors - return actual error message for debugging
    if (error instanceof Stripe.errors.StripeError) {
      console.error('❌ Stripe error type:', error.type);
      console.error('❌ Stripe error code:', error.code);
      return new Response(
        JSON.stringify({
          error: error.message,
          type: error.type,
          code: error.code
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: errorMessage || 'Failed to create checkout session' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
