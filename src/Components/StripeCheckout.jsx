// StripeCheckout.jsx - Handles Pro subscription checkout flow
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

// Initialize Stripe with publishable key (lazy-loaded singleton)
let stripePromise = null;
const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('❌ Missing VITE_STRIPE_PUBLISHABLE_KEY');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

/**
 * StripeCheckout Component
 *
 * Initiates Stripe Checkout session for Pro subscription
 *
 * Props:
 * - user: Supabase user object (required)
 * - userEmail: User's email address (required)
 * - onSuccess: Callback after successful redirect setup
 * - onError: Callback for error handling
 * - onCancel: Callback when user cancels
 * - children: Custom button content (optional)
 */
export default function StripeCheckout({
  user,
  userEmail,
  onSuccess,
  onError,
  onCancel,
  children,
  className = '',
  disabled = false
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    // Validate required props
    if (!user?.id) {
      const err = 'You must be logged in to upgrade';
      setError(err);
      onError?.(err);
      return;
    }

    if (!userEmail) {
      const err = 'Email address is required';
      setError(err);
      onError?.(err);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🛒 Starting checkout for user:', user.id);

      // Get the price ID from environment
      const priceId = import.meta.env.VITE_STRIPE_PRO_PRICE_ID;
      if (!priceId) {
        throw new Error('Missing VITE_STRIPE_PRO_PRICE_ID configuration');
      }

      // Get current URL for success/cancel redirects
      const origin = window.location.origin;
      const successUrl = `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/?canceled=true`;

      console.log('📤 Calling create-checkout-session Edge Function...');

      // Call Supabase Edge Function to create checkout session
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId: user.id,
          email: userEmail,
          successUrl,
          cancelUrl
        }
      });

      if (fnError) {
        console.error('❌ Edge Function error:', fnError);
        throw new Error(fnError.message || 'Failed to create checkout session');
      }

      if (!data?.url) {
        console.error('❌ No checkout URL returned:', data);
        throw new Error('No checkout URL returned from server');
      }

      console.log('✅ Checkout session created, redirecting to Stripe...');

      // Call success callback before redirect
      onSuccess?.();

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (err) {
      console.error('❌ Checkout error:', err);
      const errorMessage = err.message || 'Failed to start checkout. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Default button styles
  const defaultClassName = `
    w-full py-3 px-6 rounded-lg font-semibold text-white
    bg-gradient-to-r from-indigo-600 to-purple-600
    hover:from-indigo-700 hover:to-purple-700
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200 ease-in-out
    flex items-center justify-center gap-2
  `;

  return (
    <div className="stripe-checkout">
      <button
        onClick={handleCheckout}
        disabled={disabled || isLoading}
        className={className || defaultClassName}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          children || (
            <>
              <span>Upgrade to Pro - $29.99/mo</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </>
          )
        )}
      </button>

      {/* Error display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Hook to check checkout status from URL params
 * Use this in your main App component to handle return from Stripe
 */
export function useCheckoutStatus() {
  const [status, setStatus] = useState({
    success: false,
    canceled: false,
    sessionId: null,
    checked: false
  });

  useState(() => {
    // Check URL params on mount
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success') === 'true';
    const canceled = params.get('canceled') === 'true';
    const sessionId = params.get('session_id');

    if (success || canceled) {
      setStatus({ success, canceled, sessionId, checked: true });

      // Clean up URL params without page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else {
      setStatus(prev => ({ ...prev, checked: true }));
    }
  }, []);

  return status;
}

/**
 * Utility to verify checkout session (optional - for extra security)
 * Call this after successful checkout to verify with backend
 */
export async function verifyCheckoutSession(sessionId) {
  if (!sessionId) return { verified: false, error: 'No session ID' };

  try {
    const { data, error } = await supabase.functions.invoke('verify-checkout-session', {
      body: { sessionId }
    });

    if (error) {
      return { verified: false, error: error.message };
    }

    return { verified: data?.verified || false, tier: data?.tier };
  } catch (err) {
    return { verified: false, error: err.message };
  }
}
