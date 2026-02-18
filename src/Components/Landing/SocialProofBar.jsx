import { motion } from 'framer-motion';
import { TrendingUp, Award, Zap, Clock } from 'lucide-react';

export default function SocialProofBar() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">5</p>
            <p className="text-sm text-gray-500">Practice Modes</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">92%</p>
            <p className="text-sm text-gray-500">Avg Score Improvement</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">STAR</p>
            <p className="text-sm text-gray-500">Framework Built In</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">2 min</p>
            <p className="text-sm text-gray-500">To First Practice</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
