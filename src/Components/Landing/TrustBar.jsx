import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, Newspaper, BrainCircuit, Lock } from 'lucide-react';

// CBS News reported on AI-assisted interview fraud — we cite their reporting on /ethics.
// Note: we are NOT "featured in" CBS News; we cite it as third-party validation of the
// problem we built the rebrand around. Phrase carefully (defamation/accuracy posture).
const CBS_NEWS_URL = 'https://www.cbsnews.com/news/ai-interview-cheating-job-candidates-chatgpt-employers/';

const items = [
  {
    icon: HeartPulse,
    label: 'Built with a Stanford-affiliated clinical co-founder',
    href: null,
  },
  {
    icon: Newspaper,
    label: 'Built around CBS News-reported interview-fraud research',
    href: CBS_NEWS_URL,
    external: true,
  },
  {
    icon: BrainCircuit,
    label: 'Grounded in cognitive-psychology research',
    href: '/ethics',
    external: false,
  },
  {
    icon: Lock,
    label: 'AES-256 encryption · your practice stays private',
    href: null,
  },
];

export default function TrustBar() {
  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <motion.ul
          className="flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-8 text-sm text-slate-600"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {items.map(({ icon: Icon, label, href, external }) => {
            const content = (
              <span className="flex items-center gap-2 justify-center md:justify-start">
                <Icon className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>{label}</span>
              </span>
            );
            return (
              <li key={label} className="text-center md:text-left">
                {href ? (
                  external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-teal-700 transition-colors"
                    >
                      {content}
                    </a>
                  ) : (
                    <Link to={href} className="hover:text-teal-700 transition-colors">
                      {content}
                    </Link>
                  )
                ) : (
                  content
                )}
              </li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
