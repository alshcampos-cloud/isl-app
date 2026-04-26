import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, FileText, BrainCircuit, Lock } from 'lucide-react';

// TrustBar: pure pro-Y credibility signals. No anti-X framing above the fold
// (research: 8 of 9 comparable ethical-positioning brands use 0% anti-X above
// the fold; see docs/SPRINT_3_PLAN.md).
const items = [
  {
    icon: HeartPulse,
    label: 'Built with a clinical co-founder in infection prevention',
    href: null,
  },
  {
    icon: BrainCircuit,
    label: 'Grounded in cognitive-psychology research',
    href: '/ethics',
    external: false,
  },
  {
    icon: FileText,
    label: 'Open ethics statement',
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
