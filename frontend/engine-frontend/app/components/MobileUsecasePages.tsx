'use client';

import { motion } from 'framer-motion';
import { usecases } from './usecases';

export default function MobileUsecasePages() {
  return (
    <>
      {usecases.map((usecase, index) => (
        <section
          key={usecase.title}
          className="md:hidden h-[100dvh] snap-start py-10 px-5 bg-gradient-to-br from-black via-slate-900 to-purple-900 relative"
        >
          <div className="relative z-10 flex h-full flex-col justify-center gap-8">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-violet-300/60 mb-4">
                Use Case {index + 1} / {usecases.length}
              </p>

              <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
                {usecase.title}
              </h3>

              <p className="text-gray-300">{usecase.description}</p>
            </div>

            <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
              <ul className="space-y-3">
                {usecase.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="w-2.5 h-2.5 bg-purple-400 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <motion.button
              className="mt-auto w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white"
              whileTap={{ scale: 0.95 }}
            >
              {usecase.buttonText}
            </motion.button>
          </div>
        </section>
      ))}
    </>
  );
}