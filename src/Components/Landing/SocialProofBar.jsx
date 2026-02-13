import { motion } from 'framer-motion';
import { Shield, Users, Award, Zap } from 'lucide-react';

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
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">5</p>
            <p className="text-sm text-gray-500">AI Practice Modes</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">AES-256</p>
            <p className="text-sm text-gray-500">Data Encryption</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">STAR</p>
            <p className="text-sm text-gray-500">Method Formatting</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">Free</p>
            <p className="text-sm text-gray-500">To Get Started</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
