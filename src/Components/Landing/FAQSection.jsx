import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Is it really free to start?',
    a: 'Yes! The free tier gives you 3 AI Interviewer sessions, 10 Practice sessions, 5 Answer Assistant sessions, 5 Question Generations, and 10 Live Prompter questions per month. No credit card required.',
  },
  {
    q: 'How is this different from ChatGPT?',
    a: 'ISL is purpose-built for interview prep. It uses motivational interviewing techniques to pull answers from YOUR real experiences, provides scored feedback, has a live prompter for actual interviews, and tracks your progress over time. ChatGPT gives generic advice — ISL gives you a complete practice system.',
  },
  {
    q: 'Does the Live Prompter work during real interviews?',
    a: 'Yes. The Live Prompter listens to interview questions and shows you bullet points from your prepared answers in real-time. It works alongside video calls on Teams, Zoom, etc. Note: some companies may have policies about using notes during interviews, so use responsibly.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. Your data is encrypted with AES-256. We use Supabase for secure authentication and storage. Your practice sessions and answers are private to your account. We never share your data with third parties.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. There are no contracts or commitments. You can cancel your Pro subscription at any time and continue using it until the end of your billing period. You can also downgrade to the free tier.',
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors pr-4">
          {faq.q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
