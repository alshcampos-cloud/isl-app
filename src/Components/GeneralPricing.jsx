// GeneralPricing.jsx — In-app pricing modal for general interview prep
// Shows 30-day pass ($14.99) and Annual All-Access ($149.99/year)
// Mirrors NursingPricing.jsx pattern — calls create-checkout-session Edge Function
//
// Integration: Replaces old PricingPage.jsx in App.jsx showPricingPage modal

import { useState, useEffect } from 'react';
import { X, Shield, Zap, Clock, Star, CheckCircle, Loader2, Crown, Sparkles, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { isIOS, isNativeApp } from '../utils/platform';
import { showNursingFeatures } from '../utils/appTarget';
import { Browser } from '@capacitor/browser';
import { purchaseProduct, restorePurchases, initializePurchases, PRODUCTS } from '../utils/nativePurchases';

export default function GeneralPricing({ userData, onClose }) {
  const [isLoading, setIsLoading] = useState(null); // 'general_30day' | 'annual_all_access' | null
  const [error, setError] = useState(null);

  // Detect if running inside iOS native app
  const isIOSNative = isIOS() && isNativeApp();

  // Initialize native purchase system when component mounts on iOS native
  useEffect(() => {
    if (isIOSNative) {
      initializePurchases();
    }
  }, [isIOSNative]);

  // Normalize userData — App.jsx passes { user, tier } structure
  const user = userData?.user || userData;
  const userId = user?.id;
  const userEmail = user?.email;
  const tier = userData?.tier || 'free';

  // iOS native: use Apple In-App Purchase
  const handleIOSPurchase = async (passType) => {
    if (!userId) {
      setError('You must be logged in to purchase.');
      return;
    }
    setIsLoading(passType);
    setError(null);
    try {
      const productId = passType === 'annual_all_access' ? PRODUCTS.ANNUAL_ALL_ACCESS : PRODUCTS.GENERAL_30DAY;
      const result = await purchaseProduct(productId, userId);
      if (result.error === 'cancelled') {
        setIsLoading(null);
        return;
      }
      if (!result.success && result.error) {
        throw new Error(result.error);
      }
      // Purchase successful — close modal and refresh user data
      onClose?.();
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Purchase failed. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleCheckout = async (passType) => {
    // On iOS native, use Apple IAP
    if (isIOSNative) {
      handleIOSPurchase(passType);
      return;
    }

    if (!userId) {
      setError('You must be logged in to purchase.');
      return;
    }

    setIsLoading(passType);
    setError(null);

    try {
      // Map passType to the correct Stripe price ID env var
      const priceIdMap = {
        general_30day: import.meta.env.VITE_STRIPE_GENERAL_PASS_PRICE_ID,
        annual_all_access: import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID,
      };

      const priceId = priceIdMap[passType];
      if (!priceId) {
        throw new Error('Pricing not configured. Please contact support.');
      }

      const origin = window.location.origin;
      const successUrl = `${origin}/app?purchase=success&pass=${passType}`;
      const cancelUrl = `${origin}/app?purchase=canceled`;

      console.log('🛒 Starting general checkout:', passType);

      const { data, error: fnError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId,
          email: userEmail,
          successUrl,
          cancelUrl,
          passType,
        },
      });

      if (fnError) {
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

  // Check if user already has an active general pass
  const hasActivePass = tier === 'general_pass' || tier === 'annual' || tier === 'pro';
  const isAnnual = tier === 'annual';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/40">
        {/* Close button — floating pill */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-slate-400 hover:text-white hover:bg-white/20 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h2 className="text-white font-bold text-lg">Interview Prep Pro</h2>
          </div>
          <p className="text-slate-400 text-xs">Unlimited AI-powered interview practice</p>
        </div>

        {/* Pricing cards */}
        <div className="p-5 space-y-4">
          {/* 30-Day Pass */}
          <div className={`border rounded-xl p-5 transition-all ${
            hasActivePass && !isAnnual
              ? 'border-indigo-500/40 bg-indigo-500/5'
              : 'border-white/10 hover:border-indigo-500/30 bg-white/[0.02]'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-white font-semibold">30-Day Pass</h3>
                </div>
                <p className="text-slate-400 text-xs mt-1">Full access for 30 days — no subscription, no commitment</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">
                  <span className="text-lg align-top">$</span>
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-indigo-300 to-indigo-500 bg-clip-text text-transparent">14</span>
                  <span className="text-lg text-slate-300">.99</span>
                </p>
                <p className="text-slate-500 text-[10px]">one-time</p>
              </div>
            </div>

            <ul className="space-y-2 mb-4 pl-1">
              {[
                'Unlimited AI mock interviews',
                'Unlimited practice sessions',
                'Unlimited answer coaching (STAR method)',
                'Unlimited question generation',
                'Unlimited Live Prompter',
                'Full question bank access',
                'Session history & analytics',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-slate-300 text-xs">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-500/20 flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-teal-400" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {hasActivePass && !isAnnual ? (
              <button
                onClick={() => handleCheckout('general_30day')}
                disabled={!!isLoading}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30"
              >
                {isLoading === 'general_30day' ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
                ) : (
                  'Extend Pass (+30 days)'
                )}
              </button>
            ) : (
              <button
                onClick={() => handleCheckout('general_30day')}
                disabled={!!isLoading || isAnnual}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                  isAnnual
                    ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-600/25'
                }`}
              >
                {isLoading === 'general_30day' ? (
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
          <div className={`border rounded-xl p-5 relative overflow-hidden transition-all ring-2 ${
            isAnnual
              ? 'border-amber-500/40 bg-amber-500/5 ring-amber-500/30'
              : 'border-teal-500/30 ring-teal-500/40 bg-gradient-to-br from-teal-500/[0.04] to-emerald-500/[0.04]'
          }`}>
            {/* Best value badge */}
            {!isAnnual && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wide shadow-lg">
                MOST POPULAR
              </div>
            )}

            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-teal-400" />
                  <h3 className="text-white font-semibold">Annual All-Access</h3>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  {showNursingFeatures()
                    ? 'General + Nursing interview prep — save over 50%'
                    : 'Complete interview prep — save over 50%'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">
                  <span className="text-lg align-top">$</span>
                  <span className="text-4xl font-extrabold bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">149</span>
                  <span className="text-lg text-slate-300">.99</span>
                </p>
                <p className="text-slate-500 text-[10px]">/year (~$12.50/mo)</p>
              </div>
            </div>

            <ul className="space-y-2 mb-4 pl-1">
              {[
                'Everything in General Pass',
                ...(showNursingFeatures() ? ['Full Nursing Interview Track'] : []),
                'Unlimited AI Coach',
                'Year-round access',
                'Priority support',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-slate-300 text-xs">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-500/20 flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-teal-400" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout('annual_all_access')}
              disabled={!!isLoading || isAnnual}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                isAnnual
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-600/25 hover:-translate-y-0.5'
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
          <div className="flex items-center justify-center gap-6 pt-3 pb-1">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5">
                <Shield className="w-3 h-3" />
              </span>
              Secure checkout
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5">
                <Zap className="w-3 h-3" />
              </span>
              Instant access
            </div>
          </div>

          {/* Restore Purchases — visible only in native app for App Store compliance */}
          {isNativeApp() && (
            <div className="text-center mt-4">
              <p className="text-xs text-slate-500">
                Already purchased?{' '}
                <button
                  id="gp-restore-btn"
                  onClick={async () => {
                    if (!userId) return;
                    const btn = document.getElementById('gp-restore-btn');
                    const msg = document.getElementById('gp-restore-msg');
                    if (btn) btn.textContent = 'Restoring...';
                    if (btn) btn.disabled = true;
                    if (msg) msg.textContent = '';
                    try {
                      const result = await restorePurchases(userId);
                      if (result.restored) {
                        if (msg) { msg.textContent = 'Purchases restored!'; msg.className = 'text-xs text-green-400 mt-1'; }
                        setTimeout(() => { onClose?.(); window.location.reload(); }, 1500);
                      } else {
                        if (msg) { msg.textContent = result.error || 'No active purchases found.'; msg.className = 'text-xs text-slate-500 mt-1'; }
                      }
                    } catch (err) {
                      if (msg) { msg.textContent = 'Unable to restore. Contact support@interviewanswers.ai'; msg.className = 'text-xs text-red-400 mt-1'; }
                    }
                    if (btn) { btn.textContent = 'Restore Purchases'; btn.disabled = false; }
                  }}
                  className="text-blue-400 hover:underline"
                >
                  Restore Purchases
                </button>
              </p>
              <p id="gp-restore-msg" className="text-xs text-slate-500 mt-1"></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
