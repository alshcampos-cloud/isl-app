import { Check, Crown, Sparkles, Zap, X } from 'lucide-react';
import { TIER_LIMITS } from '../utils/creditSystem';

export default function PricingPage({ onSelectTier, currentTier = 'free' }) {
  
  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: '',
      description: 'Perfect for trying out ISL',
      badge: null,
      features: [
        { text: '3 AI Interviewer sessions', included: true },
        { text: '5 Practice Mode sessions', included: true },
        { text: '2 Answer Assistant sessions', included: true },
        { text: '5 Question Generations', included: true },
        { text: '10 Live Prompter questions (ads for more)', included: true },
        { text: 'Community support', included: true },
        { text: 'Unlimited question bank', included: false },
        { text: 'Priority processing', included: false },
        { text: 'Advanced analytics', included: false }
      ],
      cta: currentTier === 'free' ? 'Current Plan' : 'Downgrade',
      ctaDisabled: currentTier === 'free',
      color: 'gray'
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 14.99,
      period: '/month',
      description: 'Great for students and early career',
      badge: 'POPULAR',
      badgeColor: 'bg-green-500',
      features: [
        { text: '20 AI Interviewer sessions/month', included: true },
        { text: '30 Practice Mode sessions/month', included: true },
        { text: '5 Answer Assistant sessions/month', included: true },
        { text: 'Unlimited Question Generator', included: true },
        { text: 'Live Prompter unlimited (no ads)', included: true },
        { text: 'Email support', included: true },
        { text: 'Question templates library', included: true },
        { text: 'Export your answers', included: true },
        { text: 'Priority processing', included: false }
      ],
      cta: currentTier === 'starter' ? 'Current Plan' : 'Upgrade to Starter',
      ctaDisabled: currentTier === 'starter',
      color: 'green'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29.99,
      period: '/month',
      description: 'For serious job seekers',
      badge: 'BEST VALUE',
      badgeColor: 'bg-indigo-500',
      features: [
        { text: '50 AI Interviewer sessions/month', included: true },
        { text: 'Unlimited Practice Mode', included: true },
        { text: '15 Answer Assistant sessions/month', included: true },
        { text: 'Unlimited Question Generator', included: true },
        { text: 'Live Prompter unlimited (no ads)', included: true },
        { text: 'Priority email support (24hr response)', included: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'Custom templates', included: true },
        { text: 'Priority processing', included: true }
      ],
      cta: currentTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      ctaDisabled: currentTier === 'pro',
      color: 'indigo',
      recommended: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 49.99,
      period: '/month',
      description: 'For executives and career changers',
      badge: 'PREMIUM',
      badgeColor: 'bg-purple-500',
      features: [
        { text: 'Unlimited AI Interviewer sessions', included: true },
        { text: 'Unlimited Practice Mode', included: true },
        { text: '30 Answer Assistant sessions/month', included: true },
        { text: 'Unlimited Question Generator', included: true },
        { text: 'Live Prompter unlimited (no ads)', included: true },
        { text: '1-on-1 coaching session (monthly)', included: true },
        { text: 'Custom template creation', included: true },
        { text: 'Resume review & optimization', included: true },
        { text: 'Priority processing + white glove support', included: true }
      ],
      cta: currentTier === 'premium' ? 'Current Plan' : 'Upgrade to Premium',
      ctaDisabled: currentTier === 'premium',
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the interview preparation you need to land your dream job. All plans include our core features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl hover:scale-105 ${
                tier.recommended ? 'ring-4 ring-indigo-500 ring-offset-4' : ''
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className={`${tier.badgeColor} text-white text-xs font-bold text-center py-2`}>
                  {tier.badge}
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                    <span className="text-gray-600">{tier.period}</span>
                  </div>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => !tier.ctaDisabled && onSelectTier(tier.id)}
                  disabled={tier.ctaDisabled}
                  className={`w-full py-3 rounded-lg font-bold text-white mb-6 transition ${
                    tier.ctaDisabled
                      ? 'bg-gray-300 cursor-not-allowed'
                      : tier.recommended
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                      : `bg-${tier.color}-600 hover:bg-${tier.color}-700`
                  }`}
                >
                  {tier.cta}
                </button>

                {/* Features List */}
                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-gray-600">
                Yes! You can change your plan at any time. When you upgrade, you'll be charged the prorated difference immediately. When you downgrade, the change takes effect at the start of your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Do unused sessions roll over?</h3>
              <p className="text-gray-600">
                No, unused sessions reset at the start of each monthly billing cycle. We recommend using all your sessions each month for maximum value.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor Stripe.
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

        {/* Trust Signals */}
        <div className="text-center">
          <div className="inline-flex items-center gap-8 bg-white rounded-lg p-6 shadow-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">500+</div>
              <div className="text-sm text-gray-600">Jobs Landed</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">10,000+</div>
              <div className="text-sm text-gray-600">Practice Sessions</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">4.9/5</div>
              <div className="text-sm text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
