'use client';

import React, { ReactNode, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function FullPageScroll({ children }: { children: ReactNode }) {
  const pages = useMemo(() => React.Children.toArray(children), [children]);

  const [page, setPage] = useState(0);
  const isAnimating = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const go = (next: number) => {
    isAnimating.current = true;
    setPage(next);

    setTimeout(() => (isAnimating.current = false), 800);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (isAnimating.current) return;

    const dir = e.deltaY > 0 ? 1 : -1;
    const next = Math.max(0, Math.min(page + dir, pages.length - 1));

    if (next !== page) go(next);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || isAnimating.current) return;

    const delta = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(delta) < 50) return;

    const dir = delta < 0 ? 1 : -1;
    const next = Math.max(0, Math.min(page + dir, pages.length - 1));

    if (next !== page) go(next);

    touchStartY.current = null;
  };

  return (
    <div className="h-screen overflow-hidden" onWheel={onWheel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <motion.div
        className="h-full"
        animate={{ y: `-${page * 100}vh` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {pages.map((p, i) => (
          <div key={i} className="h-[100dvh] w-full">
            {p}
          </div>
        ))}
      </motion.div>
    </div>
  );
}