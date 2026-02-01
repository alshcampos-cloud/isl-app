// stripe-webhook/index.ts
// Handles Stripe webhook events and updates user tier

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// CORS headers (webhooks don't need CORS, but useful for testing)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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

        // Get userId from metadata
        const userId = session.metadata?.userId;
        const customerEmail = session.customer_email || session.metadata?.email;

        if (!userId) {
          console.error('❌ No userId in session metadata');
          return new Response('Missing userId in metadata', { status: 400 });
        }

        console.log('👤 User ID from metadata:', userId);
        console.log('📧 Customer email:', customerEmail);

        // Get subscription ID and customer ID
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        console.log('📋 Subscription ID:', subscriptionId);
        console.log('🏷️ Customer ID:', customerId);

        // Update user_profiles to Pro tier
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            tier: 'pro',
            subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ Failed to update user profile:', updateError);

          // Try to insert if update failed (user might not have profile yet)
          const { error: insertError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: userId,
              tier: 'pro',
              subscription_id: subscriptionId,
              stripe_customer_id: customerId,
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id'
            });

          if (insertError) {
            console.error('❌ Failed to upsert user profile:', insertError);
            return new Response('Database update failed', { status: 500 });
          }
        }

        console.log('✅ User upgraded to Pro:', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Subscription updated:', subscription.id);
        console.log('📊 Status:', subscription.status);

        const userId = subscription.metadata?.userId;

        if (!userId) {
          // Try to find user by subscription_id
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('subscription_id', subscription.id)
            .single();

          if (profile) {
            await updateSubscriptionStatus(supabase, profile.user_id, subscription);
          } else {
            console.warn('⚠️ Could not find user for subscription:', subscription.id);
          }
        } else {
          await updateSubscriptionStatus(supabase, userId, subscription);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🗑️ Subscription deleted:', subscription.id);

        const userId = subscription.metadata?.userId;

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
          // Downgrade user to free tier
          const { error } = await supabase
            .from('user_profiles')
            .update({
              tier: 'free',
              subscription_status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', targetUserId);

          if (error) {
            console.error('❌ Failed to downgrade user:', error);
            return new Response('Database update failed', { status: 500 });
          }

          console.log('✅ User downgraded to Free:', targetUserId);
        } else {
          console.warn('⚠️ Could not find user for canceled subscription:', subscription.id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('💰 Invoice payment succeeded:', invoice.id);

        // This confirms subscription is active
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('subscription_id', subscriptionId)
            .single();

          if (profile) {
            await supabase
              .from('user_profiles')
              .update({
                subscription_status: 'active',
                updated_at: new Date().toISOString(),
              })
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

// Helper function to update subscription status
async function updateSubscriptionStatus(
  supabase: any,
  userId: string,
  subscription: Stripe.Subscription
) {
  // Map Stripe status to our tier
  let tier = 'free';
  let status = subscription.status;

  if (subscription.status === 'active' || subscription.status === 'trialing') {
    tier = 'pro';
    status = 'active';
  } else if (subscription.status === 'past_due') {
    tier = 'pro'; // Keep pro but mark as past_due
    status = 'past_due';
  } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    tier = 'free';
    status = 'canceled';
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      tier,
      subscription_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Failed to update subscription status:', error);
  } else {
    console.log(`✅ Updated user ${userId} to tier: ${tier}, status: ${status}`);
  }
}
