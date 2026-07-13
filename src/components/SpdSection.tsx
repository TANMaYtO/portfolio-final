import React from 'react';
import { motion, type Variants } from 'framer-motion';

/**
 * Returns Framer Motion container variants for staggering child elements.
 */
function getContainerVariants(): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };
}

/**
 * Returns Framer Motion animation variants for individual child elements.
 */
function getItemVariants(): Variants {
  return {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };
}

/**
 * Renders the minimalist 80x80 white SVG logo per designer specification.
 */
function SpdLogo(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-[80px] h-[80px] mb-12 mx-auto fill-white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M60 15 C35 45 20 65 20 80 C20 95 32 105 45 105 C54 105 60 98 60 98 C60 98 66 105 75 105 C88 105 100 95 100 80 C100 65 85 45 60 15 Z" />
      <polygon points="53,98 67,98 60,115" />
    </svg>
  );
}

/**
 * Minimal #FF0000 red S.P.D Projects section featuring high-contrast typography and dynamic video blend.
 */
export function SpdSection(): React.JSX.Element {
  const containerVariants: Variants = getContainerVariants();
  const itemVariants: Variants = getItemVariants();

  return (
    <section className="relative min-h-screen w-full bg-[#FF0000] flex flex-col z-30 font-manrope pb-12 sm:pb-20">
      <div className="flex-1 flex flex-col items-center w-full pt-[100px] md:pt-[400px]">
        <motion.div
          className="flex flex-col items-center w-full px-8 text-center z-20 relative max-w-[900px] h-auto md:h-[620px] mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={itemVariants}>
            <SpdLogo />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-white text-[16px] h-auto md:h-[100px] w-full max-w-[400px] leading-[1.6] mb-[40px] uppercase tracking-wider mx-auto font-semibold"
          >
            We built this platform with a single purpose to eliminate operational chaos and restore balance to your daily business routine
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="font-marck text-white text-[80px] md:text-[120px] leading-none mb-[32px] select-none"
          >
            S.P.D
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-white leading-[1.6] mb-[100px] md:mb-24 w-full flex flex-col items-center font-light"
          >
            <p className="mb-[24px] text-[16px] w-[400px] max-w-full text-center">
              I Was Exhausted By Software That Demanded More Effort Than It Actually Saved. That Is Why We Engineered An Autonomous Architecture That Operates Silently In The Background.
            </p>
            <p className="text-[16px] w-[400px] max-w-full text-center">
              Your Business Should Serve Your Life, Not Consume It. Let Our Algorithms Handle The Heavy Lifting, So You Can Focus On The Vision.
            </p>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative w-full shrink-0 overflow-visible">
        <div className="absolute top-0 left-0 w-full h-[100px] bg-gradient-to-b from-[#FF0000] to-transparent z-10 pointer-events-none" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto block object-contain"
        >
          <source
            src="https://res.cloudinary.com/daklr2whx/video/upload/v1778602552/track-video_2_s9lp53.mp4"
            type="video/mp4"
          />
        </video>
      </div>
    </section>
  );
}
