import { Check, Crown, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import StripeCheckout from './StripeCheckout';

export default function PricingPage({ onSelectTier, currentTier = 'free', user, userEmail }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCanceledMessage, setShowCanceledMessage] = useState(false);

  // Check URL params for return from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success') === 'true';
    const canceled = params.get('canceled') === 'true';

    if (success) {
      setShowSuccessMessage(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      // Auto-hide after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }

    if (canceled) {
      setShowCanceledMessage(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      // Auto-hide after 5 seconds
      setTimeout(() => setShowCanceledMessage(false), 5000);
    }
  }, []);

  const handleSelectTier = (tierId) => {
    if (tierId === 'free') {
      // Handle downgrade (just call parent handler)
      onSelectTier?.(tierId);
    }
    // For 'pro', the StripeCheckout component handles it
  };
  
  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: '',
      description: 'Perfect for trying out ISL',
      badge: null,
      features: [
        { text: '3 AI Interviewer sessions/month', included: true },
        { text: '10 Practice Mode sessions/month', included: true },
        { text: '5 Answer Assistant sessions/month', included: true },
        { text: '5 Question Generations/month', included: true },
        { text: '10 Live Prompter questions/month', included: true },
        { text: 'Unlimited question bank storage', included: true },
        { text: 'Speech recognition', included: true },
        { text: 'Session history & analytics', included: true },
        { text: 'Template library access', included: true },
        { text: 'Unlimited AI Interviewer', included: false },
        { text: 'Unlimited Practice Mode', included: false },
        { text: 'Unlimited Answer Assistant', included: false },
        { text: 'Unlimited Question Generator', included: false },
        { text: 'Unlimited Live Prompter', included: false }
      ],
      cta: currentTier === 'free' ? 'Current Plan' : 'Downgrade',
      ctaDisabled: currentTier === 'free',
      color: 'gray'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29.99,
      period: '/month',
      description: 'Unlimited practice for serious job seekers',
      badge: 'UNLIMITED',
      badgeColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      features: [
        { text: '✨ UNLIMITED AI Interviewer sessions', included: true, highlight: true },
        { text: '✨ UNLIMITED Practice Mode', included: true, highlight: true },
        { text: '✨ UNLIMITED Answer Assistant', included: true, highlight: true },
        { text: '✨ UNLIMITED Question Generator', included: true, highlight: true },
        { text: '✨ UNLIMITED Live Prompter', included: true, highlight: true },
        { text: 'Unlimited question bank storage', included: true },
        { text: 'Speech recognition', included: true },
        { text: 'Session history & analytics', included: true },
        { text: 'Template library access', included: true },
        { text: 'Export your practice sessions', included: true },
        { text: 'Priority feature updates', included: true }
      ],
      cta: currentTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      ctaDisabled: currentTier === 'pro',
      color: 'indigo',
      recommended: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-800">Welcome to Pro!</h3>
                <p className="text-green-700 text-sm">Your subscription is now active. Enjoy unlimited access!</p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Canceled Message */}
        {showCanceledMessage && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-800">Checkout Canceled</h3>
                <p className="text-yellow-700 text-sm">No worries! You can upgrade anytime when you're ready.</p>
              </div>
            </div>
            <button
              onClick={() => setShowCanceledMessage(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlimited interview practice for just $30/month. No limits. No stress. Just get ready.
          </p>
        </div>

        {/* Pricing Cards - Side by Side */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl ${
                tier.recommended ? 'ring-4 ring-indigo-500 ring-offset-4 transform md:scale-105' : ''
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className={`${tier.badgeColor} text-white text-sm font-bold text-center py-2`}>
                  {tier.badge}
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-5xl font-bold text-gray-900">${tier.price}</span>
                    <span className="text-gray-600 text-lg">{tier.period}</span>
                  </div>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </div>

                {/* CTA Button */}
                {tier.id === 'pro' && !tier.ctaDisabled ? (
                  // Stripe Checkout button for Pro tier
                  <div className="mb-8">
                    <StripeCheckout
                      user={user}
                      userEmail={userEmail}
                      onSuccess={() => {
                        console.log('🚀 Redirecting to Stripe Checkout...');
                        setIsProcessing(true);
                      }}
                      onError={(error) => {
                        console.error('❌ Checkout error:', error);
                        setCheckoutError(error);
                        setIsProcessing(false);
                      }}
                      disabled={isProcessing || !user}
                      className={`w-full py-4 rounded-lg font-bold text-white transition text-lg ${
                        isProcessing || !user
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                      }`}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Redirecting to checkout...
                        </span>
                      ) : !user ? (
                        'Sign in to Upgrade'
                      ) : (
                        'Upgrade to Pro'
                      )}
                    </StripeCheckout>
                    {checkoutError && (
                      <p className="mt-2 text-sm text-red-600 text-center">{checkoutError}</p>
                    )}
                  </div>
                ) : (
                  // Regular button for Free tier or if already Pro
                  <button
                    onClick={() => !tier.ctaDisabled && handleSelectTier(tier.id)}
                    disabled={tier.ctaDisabled}
                    className={`w-full py-4 rounded-lg font-bold text-white mb-8 transition text-lg ${
                      tier.ctaDisabled
                        ? 'bg-gray-300 cursor-not-allowed'
                        : tier.recommended
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {tier.cta}
                  </button>
                )}

                {/* Features List */}
                <div className="space-y-4">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      <span className={`text-sm ${
                        feature.included 
                          ? feature.highlight 
                            ? 'text-indigo-700 font-bold' 
                            : 'text-gray-700 font-medium' 
                          : 'text-gray-400'
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Compare Plans</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Free</th>
                  <th className="text-center py-4 px-4 font-bold text-indigo-600">
                    <div className="flex flex-col items-center">
                      <Crown className="w-5 h-5 mb-1" />
                      Pro
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 px-4 text-gray-700">AI Interviewer sessions</td>
                  <td className="py-4 px-4 text-center text-gray-600">3/month</td>
                  <td className="py-4 px-4 text-center font-bold text-indigo-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Practice Mode sessions</td>
                  <td className="py-4 px-4 text-center text-gray-600">10/month</td>
                  <td className="py-4 px-4 text-center font-bold text-indigo-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Answer Assistant sessions</td>
                  <td className="py-4 px-4 text-center text-gray-600">5/month</td>
                  <td className="py-4 px-4 text-center font-bold text-indigo-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Question Generator</td>
                  <td className="py-4 px-4 text-center text-gray-600">5/month</td>
                  <td className="py-4 px-4 text-center font-bold text-indigo-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Live Prompter</td>
                  <td className="py-4 px-4 text-center text-gray-600">10 questions</td>
                  <td className="py-4 px-4 text-center font-bold text-indigo-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Question bank storage</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Session history & analytics</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Is Pro really unlimited?</h3>
              <p className="text-gray-600">
                Yes! Pro tier gives you unlimited access to all features. We have a fair-use cap of 100 sessions per day to prevent abuse, but 99.9% of users will never hit this limit in normal practice.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-gray-600">
                Yes! You can change your plan at any time. When you upgrade, you'll be charged the prorated difference immediately. When you downgrade, the change takes effect at the start of your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express, Discover). Secure payment processing powered by Stripe.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Is there a money-back guarantee?</h3>
              <p className="text-gray-600">
                Yes! We offer a 7-day money-back guarantee on all paid plans. If you're not satisfied, contact us within 7 days of your purchase for a full refund.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">What happens if I cancel?</h3>
              <p className="text-gray-600">
                You'll retain access to your paid plan features until the end of your current billing period. After that, you'll be automatically moved to the free tier. Your data and question bank will be preserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
