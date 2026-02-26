// NursingPricing.jsx — In-app pricing modal for nursing track
// Shows 30-day pass ($19.99) and Annual All-Access ($149.99/year)
// Calls create-checkout-session Edge Function with passType parameter
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.

import { useState } from 'react';
import { X, Shield, Zap, Clock, Star, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function NursingPricing({ userData, onClose }) {
  const [isLoading, setIsLoading] = useState(null); // 'nursing_30day' | 'annual_all_access' | null
  const [error, setError] = useState(null);

  const handleCheckout = async (passType) => {
    if (!userData?.user?.id) {
      setError('You must be logged in to purchase.');
      return;
    }

    setIsLoading(passType);
    setError(null);

    try {
      // Map passType to the correct Stripe price ID env var
      const priceIdMap = {
        nursing_30day: import.meta.env.VITE_STRIPE_NURSING_PASS_PRICE_ID,
        annual_all_access: import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID,
      };

      const priceId = priceIdMap[passType];
      if (!priceId) {
        throw new Error('Pricing not configured. Please contact support.');
      }

      const origin = window.location.origin;
      const successUrl = `${origin}/nursing?purchase=success&pass=${passType}`;
      const cancelUrl = `${origin}/nursing?purchase=canceled`;

      console.log('🛒 Starting nursing checkout:', passType);

      const { data, error: fnError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId: userData.user.id,
          email: userData.user.email,
          successUrl,
          cancelUrl,
          passType,
        },
      });

      if (fnError) {
        // Try to extract error message from response
        let errorDetail = 'Failed to create checkout session';
        if (fnError.context && typeof fnError.context.json === 'function') {
          try {
            const errorBody = await fnError.context.json();
            errorDetail = errorBody.error || errorDetail;
          } catch {
            // fallback
          }
        }
        errorDetail = data?.error || errorDetail || fnError.message;
        throw new Error(errorDetail);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }

      console.log('✅ Redirecting to Stripe Checkout...');
      window.location.href = data.url;

    } catch (err) {
      console.error('❌ Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  // Check if user already has an active nursing pass
  const hasActivePass = userData?.tier === 'nursing_pass' || userData?.tier === 'annual' || userData?.tier === 'pro';
  const isAnnual = userData?.tier === 'annual';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-lg">Nursing Interview Pro</h2>
            <p className="text-slate-400 text-xs mt-0.5">Unlimited practice for your interview prep</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-2.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing cards */}
        <div className="p-5 space-y-4">
          {/* 30-Day Pass */}
          <div className={`border rounded-xl p-5 transition-all ${
            hasActivePass && !isAnnual
              ? 'border-sky-500/40 bg-sky-500/5'
              : 'border-white/10 hover:border-sky-500/30 bg-white/[0.02]'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <h3 className="text-white font-semibold">30-Day Pass</h3>
                </div>
                <p className="text-slate-400 text-xs mt-1">Full access for 30 days — perfect for interview prep bursts</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-2xl">$19<span className="text-base">.99</span></p>
                <p className="text-slate-500 text-[10px]">one-time</p>
              </div>
            </div>

            <ul className="space-y-1.5 mb-4">
              {[
                'Unlimited mock interviews',
                'Unlimited practice sessions',
                'Unlimited SBAR drills',
                'Unlimited AI Coach',
                'Confidence Builder AI Brief',
                'Offer Negotiation Coach',
                'All 70 questions + flashcards',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-300 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {hasActivePass && !isAnnual ? (
              <button
                onClick={() => handleCheckout('nursing_30day')}
                disabled={!!isLoading}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30"
              >
                {isLoading === 'nursing_30day' ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
                ) : (
                  'Extend Pass (+30 days)'
                )}
              </button>
            ) : (
              <button
                onClick={() => handleCheckout('nursing_30day')}
                disabled={!!isLoading || isAnnual}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isAnnual
                    ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20'
                }`}
              >
                {isLoading === 'nursing_30day' ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
                ) : isAnnual ? (
                  'Included in Annual'
                ) : (
                  'Get 30-Day Pass'
                )}
              </button>
            )}
          </div>

          {/* Annual All-Access */}
          <div className={`border rounded-xl p-5 relative overflow-hidden transition-all ${
            isAnnual
              ? 'border-amber-500/40 bg-amber-500/5'
              : 'border-amber-500/20 hover:border-amber-500/40 bg-gradient-to-br from-amber-500/[0.03] to-orange-500/[0.03]'
          }`}>
            {/* Best value badge */}
            {!isAnnual && (
              <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                BEST VALUE
              </div>
            )}

            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <h3 className="text-white font-semibold">Annual All-Access</h3>
                </div>
                <p className="text-slate-400 text-xs mt-1">Nursing + General interview prep — save 38%</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-2xl">$149<span className="text-base">.99</span></p>
                <p className="text-slate-500 text-[10px]">/year (~$12.50/mo)</p>
              </div>
            </div>

            <ul className="space-y-1.5 mb-4">
              {[
                'Everything in Nursing Pass',
                'General Interview Prep included',
                'Unlimited AI Coach',
                'Year-round access',
                'Priority support',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-300 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout('annual_all_access')}
              disabled={!!isLoading || isAnnual}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isAnnual
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/20 hover:-translate-y-0.5'
              }`}
            >
              {isLoading === 'annual_all_access' ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
              ) : isAnnual ? (
                '✓ Active Annual Member'
              ) : (
                'Get Annual All-Access'
              )}
            </button>
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400 text-xs">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 text-[10px] mt-1 hover:text-red-300"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 pt-2 pb-1">
            <div className="flex items-center gap-1 text-slate-500 text-[10px]">
              <Shield className="w-3 h-3" />
              Secure checkout
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-[10px]">
              <Zap className="w-3 h-3" />
              Instant access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
