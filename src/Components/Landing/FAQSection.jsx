import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Is it really free to start?',
    a: 'Yes! The free tier gives you 3 AI Interviewer sessions, 10 Practice sessions, 5 Answer Assistant sessions, 5 Question Generations, and 10 Practice Prompter questions per month. No credit card required.',
  },
  {
    q: 'How is this different from ChatGPT?',
    a: 'InterviewAnswers.ai is purpose-built for interview prep. It uses motivational interviewing techniques to pull answers from YOUR real experiences, provides scored feedback based on cognitive-psychology research on retrieval practice, has a Practice Prompter for rehearsing out loud, and tracks your progress over time. ChatGPT gives generic advice — InterviewAnswers.ai gives you a complete practice system built around how people actually learn interview skills.',
  },
  {
    q: 'What does the Practice Prompter do?',
    a: 'The Practice Prompter is a rehearsal tool. You read a question out loud, answer out loud, and see bullet points from your prepared answers so you can train yourself to hit your key points naturally. It\u2019s for practice sessions before the interview \u2014 not for use during an actual interview.',
  },
  {
    q: 'Can I use this during a real interview?',
    a: 'No \u2014 we don\u2019t support that. InterviewAnswers.ai is built for preparation, not cheating. It\u2019s designed to help you practice your answers before the interview so you can deliver them confidently on the day. Our Terms of Service explicitly prohibit using the product during live interviews. See our ethics page at /ethics for the full reasoning.',
  },
  {
    q: 'How are you different from "interview copilot" tools?',
    a: 'Some AI interview products market themselves as real-time "copilots" you use during live interviews. News outlets like CBS News have reported that this pattern is raising concerns among employers, and some candidates have had offers rescinded after being detected using such tools. We made a different choice: we\u2019re the interview coach you practice with beforehand \u2014 never a tool you bring into the room. Practice, not cheat. See our ethics page at /ethics for more.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. Your data is encrypted with AES-256. We use Supabase for secure authentication and storage. Your practice sessions and answers are private to your account. We never share your data with third parties.',
  },
  {
    q: 'How does pricing work?',
    a: 'Start free with generous monthly limits. When you\'re ready for unlimited practice, grab a 30-Day Pass starting at $14.99 — no subscription, no auto-renew. Or save with the Annual All-Access at $99.99/year for the best value.',
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-lg font-medium text-gray-900 group-hover:text-teal-600 transition-colors pr-4">
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
    <section className="py-16 sm:py-20 bg-white">
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
