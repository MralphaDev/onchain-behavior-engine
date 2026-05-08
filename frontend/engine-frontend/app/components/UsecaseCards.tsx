'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usecases } from './usecases';

export default function UsecaseCards() {
  const ref = useRef(null);
  const router = useRouter();
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleUsecaseClick = (usecaseTitle: string) => {
    if (usecaseTitle === 'Rugpull Detection') {
      router.push('/usecases/rugpull');
    }
  };

  return (
    <>
    <section
        ref={ref}
        data-fullpage-section
        className="hidden md:block min-h-screen snap-start py-16 px-6 bg-gradient-to-br from-black via-slate-900 to-purple-900 relative overflow-hidden"
        style={{ scrollSnapStop: 'always' }}
      >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-[1.12] md:leading-[1.18] bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
            Intelligence Applications
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Deploy cutting-edge behavioral analysis across critical use cases to uncover hidden patterns,
            detect manipulation, and gain actionable insights in real-time.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {usecases.map((usecase, index) => (
            <motion.div
              key={usecase.title}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -8 }}
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full group-hover:border-purple-400/30 transition-all duration-500">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-200 transition-colors duration-300">
                    {usecase.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {usecase.description}
                  </p>
                </div>

                {/* Features list */}
                <div className="mb-8">
                  <ul className="space-y-2">
                    {usecase.features.map((feature, idx) => (
                      <motion.li
                        key={feature}
                        className="flex items-center text-sm text-gray-400"
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: index * 0.2 + idx * 0.1 }}
                      >
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 flex-shrink-0" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <motion.button
                  onClick={() => handleUsecaseClick(usecase.title)}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 border border-purple-400/50 hover:border-purple-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {usecase.buttonText}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
        >
          <p className="text-gray-400 mb-6">
            Ready to unlock behavioral intelligence?
          </p>
          <motion.button
            className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium rounded-full hover:bg-white/20 hover:border-white/30 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    </section>

      {usecases.map((usecase, index) => (
        <section
          key={usecase.title}
          data-fullpage-section
          className="md:hidden h-screen snap-start py-10 px-5 bg-gradient-to-br from-black via-slate-900 to-purple-900 relative overflow-hidden"
          style={{ scrollSnapStop: 'always' }}
        >
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-16 left-5 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-16 right-5 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.25, 0.45, 0.25],
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

        </section>
      ))}
    </>
  );
}