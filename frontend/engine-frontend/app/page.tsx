'use client';

import FullPageScroll from './components/FullPageScroll';
import LandingHero from './components/LandingHero';
import UsecaseCards from './components/UsecaseCards';
import { usecases } from './components/usecases';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    setReady(true); //  important: wait for client
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!ready) return null; //  prevent hydration mismatch

  const pages = [
    <LandingHero key="hero" />,
    !isMobile ? (
      <UsecaseCards key="desktop" />
    ) : (
      usecases.map((u) => (
        <section
          key={u.title}
          className="h-[100dvh] flex flex-col justify-center px-6 bg-gradient-to-br from-black via-slate-900 to-purple-900"
        >
          <h2 className="text-white text-3xl font-bold mb-4">{u.title}</h2>
          <p className="text-gray-300 mb-6">{u.description}</p>

          <ul className="space-y-2 text-gray-400 mb-10">
            {u.features.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>

          <button className="bg-purple-600 text-white py-4 rounded-xl">
            {u.buttonText}
          </button>
        </section>
      ))
    ),
  ].flat(); 

  return (
    <main className="h-screen overflow-hidden">
      <FullPageScroll>{pages}</FullPageScroll>
    </main>
  );
}


/*
⚠️ IMPORTANT NOTE ABOUT FULL PAGE SCROLL BUG

This component relies on FullPageScroll, which calculates pages using:
React.Children.toArray(children)

Because of this, ALL children must be stable and consistent on first render.

❌ DO NOT:
- Conditionally render different numbers of children AFTER hydration
- Mix desktop/mobile branches inside the children tree without fixing structure
- Use "hidden / md:block" to simulate page removal (it still counts as a page)

WHY THIS CAUSES BUGS:
- FullPageScroll counts React children, not visible DOM
- If children change between desktop/mobile or after hydration,
  the scroll index becomes misaligned
- This results in "ghost pages" (blank scroll screens)

SYMPTOM:
- Extra empty page at the end of scroll
- Wrong number of scroll steps (e.g. 3 pages instead of 2)
- Blank white screen page

FIX:
- Build a stable "pages array" BEFORE passing into FullPageScroll
- Ensure the number of children NEVER changes after mount
- Use `.flat()` when mapping conditional arrays

✔ Rule: FullPageScroll must receive a FINAL, STATIC page list
*/