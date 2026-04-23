// stripe-webhook/index.ts
// Handles Stripe webhook events and updates user tier / pass expiry
//
// IMPORTANT: The app's user_profiles table uses TWO id columns:
//   - id: random UUID (auto-generated primary key)
//   - user_id: auth.uid() (the Supabase auth user ID)
// The frontend queries by .eq('user_id', user.id) everywhere.
// This webhook MUST also use .eq('user_id', userId) to match.
//
// PASS MODEL (P2):
//   - nursing_30day: Sets nursing_pass_expires = NOW + 30 days (extends if active)
//   - general_30day: Sets general_pass_expires = NOW + 30 days (extends if active)
//   - annual_all_access: Sets BOTH expiry dates = NOW + 365 days (subscription)
//   - legacy_pro: Original behavior — sets tier = 'pro' (backward compat)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// CORS headers (webhooks don't need CORS, but useful for testing)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// 30-day pass duration in milliseconds
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const THREE_SIXTY_FIVE_DAYS_MS = 365 * 24 * 60 * 60 * 1000;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('⚠️ Non-POST request to webhook:', req.method);
      return new Response('Method not allowed', { status: 405 });
    }

    // Get Stripe secret key and webhook secret
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      return new Response('Server configuration error', { status: 500 });
    }

    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return new Response('Server configuration error', { status: 500 });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get Supabase client with service role (for admin operations)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature header');
      return new Response('No signature', { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    console.log('✅ Webhook verified. Event type:', event.type);
    console.log('📦 Event ID:', event.id);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('💳 Checkout session completed:', session.id);

        // Get userId and passType from metadata
        const userId = session.metadata?.userId;
        const passType = session.metadata?.passType || 'legacy_pro';
        const customerEmail = session.customer_email || session.metadata?.email;

        if (!userId) {
          console.error('❌ No userId in session metadata');
          return new Response('Missing userId in metadata', { status: 400 });
        }

        console.log('👤 User ID:', userId);
        console.log('📧 Email:', customerEmail);
        console.log('🏷️ Pass type:', passType);

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const now = new Date();

        if (passType === 'nursing_30day') {
          // ── Nursing 30-Day Pass ────────────────────────────
          await handlePassPurchase(supabase, userId, customerId, 'nursing_pass_expires', THIRTY_DAYS_MS, 'nursing_30day');

        } else if (passType === 'general_30day') {
          // ── General 30-Day Pass ────────────────────────────
          await handlePassPurchase(supabase, userId, customerId, 'general_pass_expires', THIRTY_DAYS_MS, 'general_30day');

        } else if (passType === 'annual_all_access') {
          // ── Annual All-Access ──────────────────────────────
          // Set BOTH expiry dates + subscription tracking
          const expires = new Date(now.getTime() + THREE_SIXTY_FIVE_DAYS_MS);

          await upsertProfile(supabase, userId, {
            nursing_pass_expires: expires.toISOString(),
            general_pass_expires: expires.toISOString(),
            pass_type: 'annual_all_access',
            stripe_customer_id: customerId,
            subscription_id: subscriptionId,
            subscription_status: 'active',
            updated_at: now.toISOString(),
          });

          console.log('✅ Annual All-Access activated for:', userId, '| Expires:', expires.toISOString());

        } else {
          // ── Legacy Pro Subscription ────────────────────────
          await upsertProfile(supabase, userId, {
            tier: 'pro',
            subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            subscription_status: 'active',
            updated_at: now.toISOString(),
          });

          console.log('✅ Legacy Pro activated for:', userId);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Subscription updated:', subscription.id);
        console.log('📊 Status:', subscription.status);

        const userId = subscription.metadata?.userId;
        const passType = subscription.metadata?.passType;

        if (!userId) {
          // Try to find user by subscription_id
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('subscription_id', subscription.id)
            .single();

          if (profile) {
            await updateSubscriptionStatus(supabase, profile.user_id, subscription, passType);
          } else {
            console.warn('⚠️ Could not find user for subscription:', subscription.id);
          }
        } else {
          await updateSubscriptionStatus(supabase, userId, subscription, passType);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🗑️ Subscription deleted:', subscription.id);

        const userId = subscription.metadata?.userId;
        const passType = subscription.metadata?.passType;

        // Find user by subscription_id if not in metadata
        let targetUserId = userId;
        if (!targetUserId) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('subscription_id', subscription.id)
            .single();

          targetUserId = profile?.user_id;
        }

        if (targetUserId) {
          // DON'T clear pass expiry dates — let them expire naturally.
          // Just mark the subscription as canceled so it won't renew.
          const updateData: Record<string, any> = {
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          };

          // Only downgrade tier for legacy pro (pass users keep access until expiry)
          if (!passType || passType === 'legacy_pro') {
            updateData.tier = 'free';
          }

          const { error } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('user_id', targetUserId);

          if (error) {
            console.error('❌ Failed to handle subscription deletion:', error);
            return new Response('Database update failed', { status: 500 });
          }

          console.log('✅ Subscription canceled for:', targetUserId, '| passType:', passType || 'legacy_pro');
        } else {
          console.warn('⚠️ Could not find user for canceled subscription:', subscription.id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('💰 Invoice payment succeeded:', invoice.id);

        // This fires for subscription renewals (annual plan)
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_id, pass_type, nursing_pass_expires, general_pass_expires')
            .eq('subscription_id', subscriptionId)
            .single();

          if (profile) {
            const updateData: Record<string, any> = {
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            };

            // For annual renewals, extend BOTH expiry dates by 365 days from current expiry
            if (profile.pass_type === 'annual_all_access') {
              const now = new Date();
              const currentNursingExpiry = profile.nursing_pass_expires
                ? new Date(profile.nursing_pass_expires)
                : now;
              const currentGeneralExpiry = profile.general_pass_expires
                ? new Date(profile.general_pass_expires)
                : now;

              // Extend from current expiry (not from now) — rewards users who renewed early
              const nursingBase = currentNursingExpiry > now ? currentNursingExpiry : now;
              const generalBase = currentGeneralExpiry > now ? currentGeneralExpiry : now;

              updateData.nursing_pass_expires = new Date(nursingBase.getTime() + THREE_SIXTY_FIVE_DAYS_MS).toISOString();
              updateData.general_pass_expires = new Date(generalBase.getTime() + THREE_SIXTY_FIVE_DAYS_MS).toISOString();

              console.log('🔄 Annual renewal — extending expiry for:', profile.user_id);
            }

            await supabase
              .from('user_profiles')
              .update(updateData)
              .eq('user_id', profile.user_id);

            console.log('✅ Confirmed active subscription for:', profile.user_id);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('❌ Invoice payment failed:', invoice.id);

        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('subscription_id', subscriptionId)
            .single();

          if (profile) {
            // Mark as past_due but DON'T revoke access — let Stripe retry
            await supabase
              .from('user_profiles')
              .update({
                subscription_status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', profile.user_id);

            console.log('⚠️ Marked subscription as past_due for:', profile.user_id);
          }
        }
        break;
      }

      case 'charge.refunded': {
        // Handle refunds — revoke pass access immediately
        const charge = event.data.object as Stripe.Charge;
        console.log('💸 Charge refunded:', charge.id);

        const passType = charge.metadata?.passType;
        const userId = charge.metadata?.userId;

        if (userId && passType) {
          const now = new Date().toISOString();
          const updateData: Record<string, any> = { updated_at: now };

          if (passType === 'nursing_30day') {
            updateData.nursing_pass_expires = now; // Expire immediately
          } else if (passType === 'general_30day') {
            updateData.general_pass_expires = now;
          } else if (passType === 'annual_all_access') {
            updateData.nursing_pass_expires = now;
            updateData.general_pass_expires = now;
            updateData.subscription_status = 'canceled';
          }

          const { error } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('user_id', userId);

          if (error) {
            console.error('❌ Failed to revoke pass on refund:', error);
          } else {
            console.log('✅ Pass revoked on refund for:', userId, '| passType:', passType);
          }
        } else {
          console.warn('⚠️ Refund without userId/passType metadata:', charge.id);
        }
        break;
      }

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    // Return success to Stripe
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(`Webhook error: ${error.message}`, { status: 500 });
  }
});

// ============================================================================
// HELPER: Handle 30-day pass purchase (with extension logic)
// ============================================================================
// If user has an active pass, EXTEND from current expiry (don't waste remaining days).
// If no active pass or expired, start from NOW.

async function handlePassPurchase(
  supabase: any,
  userId: string,
  customerId: string,
  expiryColumn: 'nursing_pass_expires' | 'general_pass_expires',
  durationMs: number,
  passType: string,
) {
  const now = new Date();

  // Fetch current profile to check existing expiry
  const { data: profile } = await supabase
    .from('user_profiles')
    .select(`${expiryColumn}`)
    .eq('user_id', userId)
    .maybeSingle();

  // Determine base date: extend from current expiry if still active, otherwise from now
  let baseDate = now;
  if (profile?.[expiryColumn]) {
    const currentExpiry = new Date(profile[expiryColumn]);
    if (currentExpiry > now) {
      baseDate = currentExpiry; // Extend from current expiry
      console.log('📅 Extending pass from current expiry:', currentExpiry.toISOString());
    }
  }

  const newExpiry = new Date(baseDate.getTime() + durationMs);

  await upsertProfile(supabase, userId, {
    [expiryColumn]: newExpiry.toISOString(),
    pass_type: passType,
    stripe_customer_id: customerId,
    updated_at: now.toISOString(),
  });

  console.log(`✅ ${passType} activated for:`, userId, '| Expires:', newExpiry.toISOString());
}

// ============================================================================
// HELPER: Upsert user profile (update with insert fallback)
// ============================================================================
// Handles the case where a user purchases before their profile row exists.

async function upsertProfile(
  supabase: any,
  userId: string,
  updateData: Record<string, any>,
) {
  const { data: updateResult, error: updateError } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select('id');

  if (updateError) {
    console.error('❌ Update failed, trying upsert:', updateError);
    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, ...updateData }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('❌ Upsert also failed:', upsertError);
      throw new Error('Database update failed');
    }
    console.log('✅ Upserted profile (insert fallback)');
  } else if (!updateResult || updateResult.length === 0) {
    console.warn('⚠️ Update matched 0 rows — trying upsert');
    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, ...updateData }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('❌ Upsert failed (0-row fallback):', upsertError);
      throw new Error('Database update failed');
    }
    console.log('✅ Upserted profile via 0-row fallback');
  } else {
    console.log('✅ Updated', updateResult.length, 'row(s) for user_id:', userId);
  }
}

// ============================================================================
// HELPER: Update subscription status (for annual and legacy pro)
// ============================================================================

async function updateSubscriptionStatus(
  supabase: any,
  userId: string,
  subscription: Stripe.Subscription,
  passType?: string,
) {
  let status = subscription.status;

  const updateData: Record<string, any> = {
    subscription_status: status === 'active' || status === 'trialing' ? 'active' : status,
    updated_at: new Date().toISOString(),
  };

  // Only set tier for legacy pro (pass users use expiry dates, not tier)
  if (!passType || passType === 'legacy_pro') {
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      updateData.tier = 'pro';
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      updateData.tier = 'free';
    }
    // past_due: keep tier as-is
  }

  const { error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Failed to update subscription status:', error);
  } else {
    console.log(`✅ Updated user ${userId} | status: ${status} | passType: ${passType || 'legacy_pro'}`);
  }
}
