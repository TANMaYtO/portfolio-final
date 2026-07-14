import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, FileText } from 'lucide-react';
import { BackgroundVideo } from './components/BackgroundVideo';
import { Navbar } from './components/Navbar';
import { VeldaraSection } from './components/VeldaraSection';
import { LithosSection } from './components/LithosSection';
import { FearlessSection } from './components/FearlessSection';
import { QuietpressSection } from './components/QuietpressSection';
import { useTypewriter } from './hooks/useTypewriter';

/**
 * Portfolio hero landing page customized for Tanmay Tomar with seamless Veldara, Lithos, Fearless, and quietpress scroll progression.
 */
export function App(): React.JSX.Element {
  const { displayed, done } = useTypewriter("tanmay\ntomar.", 38, 600);

  return (
    <div className="relative font-sans antialiased selection:bg-[#EAECE9] selection:text-[#1C2E1E] overflow-x-clip">
      {/* SECTION 1: TANMAY TOMAR HOMEPAGE HERO FOLD (Isolated, untouched) */}
      <section className="relative w-full min-h-screen bg-white text-neutral-900 z-20 flex flex-col lg:block shadow-2xl shadow-black">
        <Navbar />
        <BackgroundVideo />

        <div className="relative z-10 flex flex-col order-first lg:order-none w-full bg-white lg:bg-transparent pb-8 lg:pb-0 lg:min-h-screen">
          <main
            id="spade-hero"
            className="w-full max-w-7xl mx-auto px-6 pt-28 lg:pt-12 pb-12 flex-1 flex flex-col justify-center"
          >
            {/* Typewriter Name Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl md:text-7xl lg:text-[88px] font-medium tracking-tight text-black leading-[1.04] mb-8 select-none w-full whitespace-pre-wrap uppercase">
                {displayed}
                {!done && (
                  <span className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink" />
                )}
              </h1>
            </motion.div>

            {/* Bio Description Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-base sm:text-lg text-neutral-500 leading-relaxed font-normal mb-8 max-w-md">
                AI Engineer building autonomous agentic workflows &amp; predictive ML systems. National Finalist @ RBIH &apos;26.
              </p>
            </motion.div>

            {/* Portfolio CTA & Social Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 mt-2"
            >
              <a
                href="https://github.com/TANMaYtO"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 rounded-full bg-[#1C2E1E] text-white font-medium text-base sm:text-lg flex items-center gap-2 shadow-lg shadow-emerald-950/10 hover:bg-black transition-colors"
              >
                <span>Explore Projects</span>
                <ArrowUpRight className="w-5 h-5" />
              </a>

              <a
                href="/RESUME/Tanmay%20Tomar.pdf"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 rounded-full bg-white text-[#1C2E1E] border border-[#E1E3E1] font-medium text-base sm:text-lg flex items-center gap-2 hover:bg-[#F4F6F4] transition-colors shadow-sm"
              >
                <FileText className="w-5 h-5 text-[#4D6D47]" />
                <span>Download Resume</span>
              </a>

              <div className="flex items-center gap-3 ml-2 sm:ml-4">
                <a
                  href="https://github.com/TANMaYtO"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub Profile"
                  className="w-12 h-12 rounded-full border border-[#E1E3E1] flex items-center justify-center text-black hover:bg-[#1C2E1E] hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/in/tanmay-tomar-430500281"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn Profile"
                  className="w-12 h-12 rounded-full border border-[#E1E3E1] flex items-center justify-center text-black hover:bg-[#0077B5] hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </main>
        </div>
      </section>

      {/* SECTION 2: VELDARA SCROLL EXPERIENCE */}
      <VeldaraSection />

      {/* SECTION 3: LITHOS GEOLOGY BRAND HERO */}
      <LithosSection />

      {/* SECTION 4: CREATIVE STUDIOS HERO (FEARLESS VISION DELIVERED) */}
      <FearlessSection />

      {/* SECTION 5: QUIETPRESS MUSIC ARCHIVE HERO */}
      <QuietpressSection />
    </div>
  );
}

export default App;
