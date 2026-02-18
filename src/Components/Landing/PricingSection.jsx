import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Crown } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '0',
    period: '',
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
      { text: 'Export practice sessions', included: false },
      { text: 'Priority feature updates', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '29.99',
    period: '/month',
    description: 'Unlimited everything. No limits. No worries.',
    cta: 'Start Pro',
    ctaLink: '/onboarding',
    highlighted: true,
    badge: 'UNLIMITED',
    features: [
      { text: 'UNLIMITED AI Interviewer sessions', included: true },
      { text: 'UNLIMITED Practice Mode', included: true },
      { text: 'UNLIMITED Answer Assistant', included: true },
      { text: 'UNLIMITED Question Generator', included: true },
      { text: 'UNLIMITED Live Prompter', included: true },
      { text: 'Unlimited question bank storage', included: true },
      { text: 'Speech recognition', included: true },
      { text: 'Session history & analytics', included: true },
      { text: 'Template library access', included: true },
      { text: 'Export practice sessions', included: true },
      { text: 'Priority feature updates', included: true },
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

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-bold text-center py-2 flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4" />
                  {tier.badge}
                </div>
              )}

              <div className="p-8">
                {/* Plan name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-gray-900">${tier.price}</span>
                  {tier.period && <span className="text-gray-600 text-lg">{tier.period}</span>}
                </div>
                <p className="text-gray-500 mb-6">{tier.description}</p>

                {/* CTA */}
                <Link
                  to={tier.ctaLink}
                  className={`block w-full text-center font-bold py-3 rounded-lg transition-all ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/25'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {tier.cta}
                </Link>

                {/* Features */}
                <ul className="mt-8 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-3">
                      {f.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>
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
          No credit card required for free tier. Cancel Pro anytime.
        </motion.p>
      </div>
    </section>
  );
}
