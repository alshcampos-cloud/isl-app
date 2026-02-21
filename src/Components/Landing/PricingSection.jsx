import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Crown } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '0',
    period: '/month',
    description: 'Perfect for getting started',
    cta: 'Get Started Free',
    ctaLink: '/onboarding',
    highlighted: false,
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
    ],
  },
  {
    name: '30-Day Pass',
    price: '14.99',
    period: '/ 30 days',
    subtitle: 'One-time payment · No subscription · No auto-renewal',
    description: 'Full access for 30 days. Pay when you need it.',
    cta: 'Get 30-Day Pass',
    ctaLink: '/onboarding',
    highlighted: true,
    badge: 'MOST POPULAR',
    features: [
      { text: 'Unlimited AI mock interviews', included: true },
      { text: 'Unlimited practice sessions', included: true },
      { text: 'Unlimited answer coaching (STAR method)', included: true },
      { text: 'Unlimited question generation', included: true },
      { text: 'Unlimited Live Prompter', included: true },
      { text: 'Full question bank access', included: true },
      { text: 'Session history & analytics', included: true },
    ],
  },
  {
    name: 'Annual All-Access',
    price: '149.99',
    period: '/year',
    subtitle: '~$12.50/mo · General + Nursing tracks',
    description: 'Best value. Everything included, all year.',
    cta: 'Get Annual All-Access',
    ctaLink: '/onboarding',
    highlighted: false,
    badge: 'BEST VALUE',
    features: [
      { text: 'Everything in 30-Day Pass', included: true },
      { text: 'Full Nursing Interview Track', included: true },
      { text: 'AI Coach (20 sessions/month)', included: true },
      { text: 'Year-round access', included: true },
      { text: 'Priority support', included: true },
    ],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all ${
                tier.highlighted
                  ? 'ring-4 ring-teal-500 ring-offset-4 md:scale-105'
                  : 'border border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Badge */}
              {tier.badge && (
                <div className={`text-white text-sm font-bold text-center py-2 flex items-center justify-center gap-2 ${
                  tier.badge === 'BEST VALUE'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600'
                }`}>
                  <Crown className="w-4 h-4" />
                  {tier.badge}
                </div>
              )}

              <div className="p-6 sm:p-8">
                {/* Plan name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">${tier.price}</span>
                  {tier.period && <span className="text-gray-600 text-base sm:text-lg">{tier.period}</span>}
                </div>
                {tier.subtitle && (
                  <p className="text-green-600 text-sm font-medium mb-2">{tier.subtitle}</p>
                )}
                <p className="text-gray-500 text-sm mb-6">{tier.description}</p>

                {/* CTA */}
                <Link
                  to={tier.ctaLink}
                  className={`block w-full text-center font-bold py-3 rounded-lg transition-all ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/25'
                      : tier.badge === 'BEST VALUE'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {tier.cta}
                </Link>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center mt-8 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          No credit card required for free tier. All passes are one-time payments — no subscriptions.
        </motion.p>
      </div>
    </section>
  );
}
