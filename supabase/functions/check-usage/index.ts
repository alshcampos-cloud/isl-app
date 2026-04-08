// check-usage/index.ts
// Server-side usage enforcement - validates entitlement + quota before allowing feature usage
// Returns: { allowed: true/false, remaining: number, tier: string }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Tier limits (must match creditSystem.js TIER_LIMITS)
const TIER_LIMITS: Record<string, Record<string, number>> = {
  free: {
    ai_interviewer: 3,
    practice_mode: 10,
    answer_assistant: 5,
    question_gen: 5,
    live_prompter_questions: 10,
  },
  // Nursing pass holders get free-tier limits for general features
  nursing_pass: {
    ai_interviewer: 3,
    practice_mode: 10,
    answer_assistant: 5,
    question_gen: 5,
    live_prompter_questions: 10,
  },
  // General pass holders get unlimited general features
  general_pass: {
    ai_interviewer: 999999,
    practice_mode: 999999,
    answer_assistant: 999999,
    question_gen: 999999,
    live_prompter_questions: 999999,
  },
  // Annual = both passes
  annual: {
    ai_interviewer: 999999,
    practice_mode: 999999,
    answer_assistant: 999999,
    question_gen: 999999,
    live_prompter_questions: 999999,
  },
  // Trial tier removed — free tier is the new onramp
  pro: {
    ai_interviewer: 999999,
    practice_mode: 999999,
    answer_assistant: 999999,
    question_gen: 999999,
    live_prompter_questions: 999999,
  },
  beta: {
    ai_interviewer: 999999,
    practice_mode: 999999,
    answer_assistant: 999999,
    question_gen: 999999,
    live_prompter_questions: 999999,
  },
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ allowed: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ allowed: false, error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ allowed: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('check-usage: User authenticated:', user.id);

    // Parse request
    const { feature } = await req.json();
    if (!feature) {
      return new Response(
        JSON.stringify({ allowed: false, error: 'Feature is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('check-usage: Checking feature:', feature);

    // Get user's tier from user_profiles (including pass expiry columns)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('tier, subscription_status, nursing_pass_expires, general_pass_expires')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // Resolve effective tier (mirrors creditSystem.js resolveEffectiveTier)
    const now = new Date();
    const nursingActive = profile?.nursing_pass_expires &&
      new Date(profile.nursing_pass_expires) > now;
    const generalActive = profile?.general_pass_expires &&
      new Date(profile.general_pass_expires) > now;
    const isLegacyPro = profile?.tier === 'pro' && profile?.subscription_status === 'active';

    let tier = 'free';
    if (nursingActive && generalActive) tier = 'annual';
    else if (generalActive) tier = 'general_pass';
    else if (nursingActive) tier = 'nursing_pass';
    else if (isLegacyPro) tier = 'pro';

    console.log('check-usage: Resolved effective tier:', tier);

    // Check beta_testers table for unlimited access
    const { data: betaUser } = await supabase
      .from('beta_testers')
      .select('unlimited_access')
      .eq('user_id', user.id)
      .maybeSingle();

    if (betaUser?.unlimited_access) {
      tier = 'beta';
      console.log('check-usage: User is beta tester with unlimited access');
    }

    // Unlimited tiers — short circuit
    const unlimitedTiers = ['pro', 'beta', 'annual', 'general_pass'];
    if (unlimitedTiers.includes(tier)) {
      console.log('check-usage: Unlimited access granted for tier:', tier);
      return new Response(
        JSON.stringify({
          allowed: true,
          remaining: 999999,
          used: 0,
          limit: 999999,
          tier,
          unlimited: true,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current period (YYYY-MM format) — reuses `now` from tier resolution above
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    console.log('check-usage: Checking period:', period);

    // Get current usage
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('period', period)
      .maybeSingle();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Usage fetch error:', usageError);
    }

    const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
    const currentUsage = usage?.[feature] || 0;
    const limit = limits[feature];

    if (limit === undefined) {
      console.error('check-usage: Unknown feature:', feature);
      return new Response(
        JSON.stringify({ allowed: false, error: `Unknown feature: ${feature}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const remaining = Math.max(0, limit - currentUsage);
    const allowed = currentUsage < limit;

    console.log(`check-usage: ${feature} - used: ${currentUsage}, limit: ${limit}, allowed: ${allowed}`);

    return new Response(
      JSON.stringify({
        allowed,
        remaining,
        used: currentUsage,
        limit,
        tier,
        unlimited: false,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('check-usage error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ allowed: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
