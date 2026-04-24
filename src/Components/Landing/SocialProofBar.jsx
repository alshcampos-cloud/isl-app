import { motion } from 'framer-motion';

export default function SocialProofBar() {
  return (
    <section className="relative paper-grain bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center flex flex-col items-center">
            <p className="text-5xl lg:text-6xl font-serif font-normal text-teal-600 leading-none mb-2">9</p>
            <p className="text-sm text-gray-500 min-h-[2.75rem] flex items-start justify-center">Practice Tools</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <p className="text-5xl lg:text-6xl font-serif font-normal text-teal-600 leading-none mb-2">Free</p>
            <p className="text-sm text-gray-500 min-h-[2.75rem] flex flex-col items-center justify-start leading-tight">
              <span>To start practicing</span>
              <span className="text-xs text-gray-400">No credit card</span>
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <p className="text-5xl lg:text-6xl font-serif font-normal text-teal-600 leading-none mb-2">STAR</p>
            <p className="text-sm text-gray-500 min-h-[2.75rem] flex items-start justify-center">Framework Built In</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <p className="text-5xl lg:text-6xl font-serif font-normal text-teal-600 leading-none mb-2">2 min</p>
            <p className="text-sm text-gray-500 min-h-[2.75rem] flex items-start justify-center">To First Practice</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
