// SubscriptionManagement.jsx - Manage Pro subscription
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Crown, CreditCard, Calendar, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

/**
 * SubscriptionManagement Component
 *
 * Allows Pro users to manage their subscription via Stripe Customer Portal
 *
 * Props:
 * - user: Supabase user object
 * - userTier: Current tier ('free', 'pro', 'beta')
 * - subscriptionStatus: Status from user_profiles ('active', 'past_due', 'canceled')
 * - onClose: Callback to close the modal
 */
export default function SubscriptionManagement({
  user,
  userTier = 'free',
  subscriptionStatus = 'inactive',
  onClose
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isPro = userTier === 'pro';
  const isBeta = userTier === 'beta';
  const isActive = subscriptionStatus === 'active';
  const isPastDue = subscriptionStatus === 'past_due';

  const handleManageSubscription = async () => {
    if (!user?.id) {
      setError('You must be logged in');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔧 Opening customer portal...');

      const { data, error: fnError } = await supabase.functions.invoke('create-portal-session', {
        body: {
          returnUrl: window.location.href
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to open subscription portal');
      }

      if (!data?.url) {
        throw new Error('No portal URL returned');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;

    } catch (err) {
      console.error('❌ Portal error:', err);
      setError(err.message || 'Failed to open subscription management');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto overflow-hidden">
      {/* Header */}
      <div className={`p-6 ${isPro ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : isBeta ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gray-600'}`}>
        <div className="flex items-center gap-3 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {isBeta ? 'Beta Tester' : isPro ? 'Pro Subscription' : 'Free Plan'}
            </h2>
            <p className="text-white/80 text-sm">
              {isBeta ? 'Unlimited access as a beta tester' :
               isPro ? '$29.99/month' : 'Limited features'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-gray-600 font-medium">Status</span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            isActive ? 'bg-green-100 text-green-700' :
            isPastDue ? 'bg-yellow-100 text-yellow-700' :
            isBeta ? 'bg-amber-100 text-amber-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {isActive ? '✓ Active' :
             isPastDue ? '⚠ Past Due' :
             isBeta ? '★ Beta Access' :
             'Inactive'}
          </span>
        </div>

        {/* Past Due Warning */}
        {isPastDue && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Payment Past Due</p>
              <p className="text-sm text-yellow-700">
                Please update your payment method to continue your Pro subscription.
              </p>
            </div>
          </div>
        )}

        {/* Features Summary */}
        {(isPro || isBeta) && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Your Benefits</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Unlimited AI Interviewer sessions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Unlimited Practice Mode
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Unlimited Answer Assistant
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Unlimited Question Generator
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Unlimited Live Prompter
              </li>
            </ul>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {/* Manage Subscription Button (Pro users only) */}
          {isPro && (
            <button
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Opening Portal...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Manage Subscription
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {/* Beta users can't manage subscription */}
          {isBeta && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-amber-800 font-medium">
                🎖️ Thank you for being a beta tester!
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Your unlimited access is provided free of charge.
              </p>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>

        {/* Help Text */}
        {isPro && (
          <p className="text-xs text-gray-500 text-center">
            Use the Stripe portal to update payment method, view invoices, or cancel your subscription.
          </p>
        )}
      </div>
    </div>
  );
}
