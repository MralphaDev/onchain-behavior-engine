'use client';

import { motion } from 'framer-motion';

export default function LandingHero() {
  return (
    <section
      data-fullpage-section
      className="relative h-screen snap-start flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-slate-900 to-purple-900"
      style={{ scrollSnapStop: 'always' }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-6 leading-[1.12] md:leading-[1.18] bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Onchain Behavior Engine
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Decode wallet intelligence. Surface hidden behavioral patterns. Detect market manipulation in real time.
        </motion.p>

        <motion.button
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300 border border-purple-400/50 hover:border-purple-300"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          Start Analysis
        </motion.button>
      </div>
    </section>
  );
}