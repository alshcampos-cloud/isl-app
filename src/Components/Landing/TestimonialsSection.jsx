import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "I used to freeze up on behavioral questions. After practicing with the AI Interviewer for a week, I got three callbacks in a row. The real-time prompter was a game-changer for my final round.",
    name: 'Sarah M.',
    role: 'Product Manager candidate',
    stars: 5,
  },
  {
    quote: "The Answer Assistant helped me realize I had way better stories than I thought. It pulled out details I would have never included on my own. Landed my dream job at a top tech company.",
    name: 'James T.',
    role: 'Software Engineer candidate',
    stars: 5,
  },
  {
    quote: "I was spending hours writing scripts that sounded robotic. InterviewAnswers.ai helped me practice speaking naturally about my real experiences. My interviewer even complimented how authentic my answers sounded.",
    name: 'Priya K.',
    role: 'Data Analyst candidate',
    stars: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Real Results from Real Candidates
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Hear from job seekers who transformed their interview performance.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{t.quote}"
              </p>

              <div>
                <p className="font-bold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
