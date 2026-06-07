// NursingPricing.jsx — In-app pricing modal for nursing track
// Shows 30-day pass ($19.99). Annual All-Access card hidden 2026-05-27 per
// owner directive ("don't advertise it for 149") — Stripe Default is now
// $149 and we're not running Annual through paid acquisition. The
// `handleCheckout('annual_all_access')` path and isAnnual indicators are
// preserved so existing Annual members still see "Included in Annual" on
// the 30-Day card and can be re-enabled later by restoring the card markup.
// Calls create-checkout-session Edge Function with passType parameter
//
// ⚠️ D.R.A.F.T. Protocol: NEW file. No existing code modified.

import { useEffect, useState } from 'react';
import { X, Shield, Zap, Clock, Star, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isIOS, isNativeApp } from '../../utils/platform';
import { purchaseProduct, restorePurchases, initializePurchases, PRODUCTS } from '../../utils/nativePurchases';
import { readLocalSession } from '../../utils/localSessionGuard';

export default function NursingPricing({ userData, onClose }) {
  const [isLoading, setIsLoading] = useState(null); // 'nursing_30day' | 'annual_all_access' | null
  const [error, setError] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [successKind, setSuccessKind] = useState('purchased');
  const [successWarning, setSuccessWarning] = useState(null);

  // Detect if running inside iOS native app
  const isIOSNative = isIOS() && isNativeApp();

  // 2026-06-04: localStorage fallback for the auth check.
  //
  // Why this exists
  // ---------------
  // We previously gated purchase on `userData?.user?.id` only — the parent
  // (NursingTrackApp.jsx) is supposed to populate this via getSession().
  // But if the parent's auth check races, deadlocks, or the modal mounts
  // before the parent's userData has settled, the user clicks Buy and sees
  // "You must be logged in to purchase." while genuinely logged in.
  //
  // Fix: if the prop is incomplete, fall back to reading the session
  // straight from localStorage (lock-free synchronous read — same pattern
  // shipped in PRs #29/#43/#48/#49). The localStorage session IS the
  // authoritative store; the SDK is just a wrapper that can hang.
  //
  // Effect: as long as the user has a valid Supabase session in
  // localStorage, the purchase flow proceeds — regardless of parent-prop
  // timing.
  const resolveActiveUser = () => {
    if (userData?.user?.id) {
      return { id: userData.user.id, email: userData.user.email };
    }
    const stored = readLocalSession();
    if (stored.isValid && stored.user?.id && !stored.isAnonymous) {
      return { id: stored.user.id, email: stored.user.email };
    }
    return null;
  };

  const userId = userData?.user?.id || readLocalSession().user?.id;

  // Initialize RC purchases when modal mounts on iOS native
  useEffect(() => {
    if (isIOSNative && userId) {
      initializePurchases(userId);
    }
  }, [isIOSNative, userId]);

  // iOS native: use Apple In-App Purchase via RevenueCat
  // Apr 27, 2026 (Build 41): wired NursingPricing iOS path to RC IAP. Was
  // bouncing to Safari which (a) violated Apple 3.1.1 (steering off-platform
  // for digital content) and (b) made nursing 30-day SKU unpurchasable through
  // native StoreKit even though it's defined in App Store Connect.
  const handleIOSPurchase = async (passType) => {
    const activeUser = resolveActiveUser();
    if (!activeUser) {
      setError('You must be logged in to purchase.');
      return;
    }
    setIsLoading(passType);
    setError(null);
    try {
      const productId = passType === 'annual_all_access'
        ? PRODUCTS.ANNUAL_ALL_ACCESS
        : PRODUCTS.NURSING_30DAY;
      if (!productId) {
        throw new Error('This purchase is not available on this build.');
      }
      const result = await purchaseProduct(productId, activeUser.id);
      if (result.error === 'cancelled') {
        setIsLoading(null);
        return;
      }
      if (!result.success) {
        throw new Error(result.error || 'Purchase did not complete. Please try again.');
      }
      setSuccessKind(result.alreadyOwned ? 'restored' : 'purchased');
      setSuccessWarning(result.backendSyncFailed ? result.warning : null);
      setPurchaseSuccess(true);
      setTimeout(() => {
        onClose?.();
      }, result.backendSyncFailed ? 4000 : 1800);
    } catch (err) {
      setError(err.message || 'Purchase failed. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleCheckout = async (passType) => {
    // On iOS native, use RevenueCat IAP (NOT Safari redirect — Apple 3.1.1)
    if (isIOSNative) {
      handleIOSPurchase(passType);
      return;
    }

    const activeUser = resolveActiveUser();
    if (!activeUser) {
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
          userId: activeUser.id,
          email: activeUser.email,
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

  // Build 41 (Apr 27): success modal — same pattern as GeneralPricing.
  if (purchaseSuccess) {
    const isRestored = successKind === 'restored';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="relative bg-slate-900 border border-sky-500/30 rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-sky-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">
            {isRestored ? 'Welcome back.' : "You're in."}
          </h2>
          <p className="text-slate-300 text-sm">
            {isRestored
              ? 'You already have access. Restoring your Nursing Pro features now.'
              : 'Nursing Pro features unlocked. Welcome aboard.'}
          </p>
          {successWarning && (
            <p className="text-amber-400 text-xs mt-3 px-2">
              {successWarning}
            </p>
          )}
        </div>
      </div>
    );
  }

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

          {/* Annual All-Access card hidden 2026-05-27 per owner directive.
              Stripe Default is $149 and we're not advertising Annual through
              paid acquisition. The handleCheckout('annual_all_access') path
              and isAnnual indicators on the 30-Day card are preserved so
              existing Annual members still see "Included in Annual" /
              "Active Annual Member". Restore the card markup here if Annual
              is re-introduced. */}

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

          {/* Ethics callout — practice-first commitment */}
          <div className="mt-3 px-4 py-3 bg-sky-500/10 border border-sky-500/20 rounded-lg">
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-[11px] text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                Practice-first design
              </li>
              <li className="flex items-center gap-2 text-[11px] text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                Built for preparation, not cheating
              </li>
              <li className="flex items-center gap-2 text-[11px] text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                No interview-time tools &mdash; ever
              </li>
            </ul>
          </div>

          {/* Apple-required purchase disclosure for non-consumable time-limited passes.
              Not auto-renewing subscriptions — one-time purchases with time-bounded access. */}
          {isNativeApp() && (
            <div className="mt-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Payment will be charged to your Apple ID account at confirmation of
                purchase. These are one-time purchases with no auto-renewal. The 30-Day
                Pass grants full access for 30 days from the date of purchase; the
                Annual All-Access Pass grants full access for 1 year from the date of
                purchase. Access expires automatically at the end of the purchased
                period — nothing is billed again unless you choose to buy another pass.
                All sales are final except where required by law. To restore a previous
                purchase on a new device, tap "Restore Purchases" in Settings.
              </p>
              <p className="text-[11px] text-slate-600 mt-2">
                <a href="https://www.interviewanswers.ai/privacy" target="_blank" rel="noopener noreferrer" className="underline text-teal-700 hover:text-teal-800">
                  Privacy Policy
                </a>
                {' • '}
                <a href="https://www.interviewanswers.ai/terms" target="_blank" rel="noopener noreferrer" className="underline text-teal-700 hover:text-teal-800">
                  Terms of Use (EULA)
                </a>
              </p>
            </div>
          )}

          {/* Restore Purchases — native apps only (Apple requirement) */}
          {isNativeApp() && (
            <p className="text-center text-xs text-slate-400 mt-4">
              Already purchased?{' '}
              <button
                id="nursing-restore-btn"
                onClick={async () => {
                  const btn = document.getElementById('nursing-restore-btn');
                  const msg = document.getElementById('nursing-restore-msg');
                  if (btn) btn.textContent = 'Restoring...';
                  try {
                    const result = await restorePurchases(userData?.user?.id);
                    if (result.restored) {
                      if (msg) { msg.textContent = 'Purchases restored!'; msg.style.color = '#22c55e'; }
                      setTimeout(() => { onClose?.(); window.location.reload(); }, 1500);
                    } else {
                      if (msg) { msg.textContent = result.error || 'No active purchases found.'; msg.style.color = '#ef4444'; }
                    }
                  } catch {
                    if (msg) { msg.textContent = 'Unable to restore. Contact support@interviewanswers.ai'; msg.style.color = '#ef4444'; }
                  }
                  if (btn) btn.textContent = 'Restore Purchases';
                }}
                className="text-sky-400 hover:underline"
              >
                Restore Purchases
              </button>
              <span id="nursing-restore-msg" className="block mt-1 text-xs"></span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
