import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260517_222138_3e3205be-3364-417b-a64a-bfe087acbec4.mp4';

interface PhaseStyle {
  opacity: number;
  y: number;
  pointerEvents: 'auto' | 'none';
}

/**
 * Standard phase transition variants for motion elements.
 */
function getPhaseVariants(): Variants {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };
}

/**
 * Linearly interpolates a numeric value between input and output bounds.
 */
function interpolate(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number
): number {
  if (value <= inputMin) {
    return outputMin;
  }
  if (value >= inputMax) {
    return outputMax;
  }
  const ratio = (value - inputMin) / (inputMax - inputMin);
  return outputMin + ratio * (outputMax - outputMin);
}

/**
 * Calculates phase opacity, vertical shift, and pointer events based on scroll progress.
 */
function calculatePhaseStyle(
  progress: number,
  fadeInStart: number,
  fullyVisibleStart: number,
  fullyVisibleEnd: number,
  fadeOutEnd: number
): PhaseStyle {
  let opacity = 0;
  let y = 40;

  if (progress < fadeInStart || progress > fadeOutEnd) {
    opacity = 0;
    y = progress < fadeInStart ? 40 : -40;
  } else if (progress >= fadeInStart && progress < fullyVisibleStart) {
    opacity = interpolate(progress, fadeInStart, fullyVisibleStart, 0, 1);
    y = interpolate(progress, fadeInStart, fullyVisibleStart, 40, 0);
  } else if (progress >= fullyVisibleStart && progress <= fullyVisibleEnd) {
    opacity = 1;
    y = 0;
  } else if (progress > fullyVisibleEnd && progress <= fadeOutEnd) {
    opacity = interpolate(progress, fullyVisibleEnd, fadeOutEnd, 1, 0);
    y = interpolate(progress, fullyVisibleEnd, fadeOutEnd, 0, -40);
  }

  const pointerEvents: 'auto' | 'none' = opacity > 0.05 ? 'auto' : 'none';

  return { opacity, y, pointerEvents };
}

/**
 * Renders the intro phase elements featuring the main heading and tagline.
 */
function renderIntroPhase(style: PhaseStyle): React.JSX.Element {
  return (
    <motion.div
      variants={getPhaseVariants()}
      className="absolute inset-0 flex flex-col justify-between"
      style={{
        opacity: style.opacity,
        y: style.y,
        pointerEvents: style.pointerEvents,
      }}
    >
      <div className="pt-2 sm:pt-4">
        <span className="inline-block px-3 py-1 bg-[#5E0ED7]/10 text-[#5E0ED7] text-xs font-semibold tracking-widest uppercase rounded-full mb-3">
          PORTFOLIO HIGHLIGHT
        </span>
        <p className="text-sm sm:text-base md:text-xl font-semibold tracking-widest uppercase text-black leading-snug max-w-md">
          Orchestrating Autonomous Systems For Next-Gen AI
        </p>
      </div>

      <div className="pb-2 sm:pb-4 flex flex-col items-start md:items-end text-left md:text-right w-full">
        <h1
          className="font-bold uppercase text-black tracking-tighter leading-[0.88]"
          style={{ fontSize: 'clamp(2.5rem, 9vw, 8.5rem)' }}
        >
          ADVANCED<br />
          <span className="text-[#5E0ED7]">AGENTIC</span><br />
          SKILLS
        </h1>
      </div>
    </motion.div>
  );
}

/**
 * Renders the first skill phase focusing on Agentic Workflows.
 */
function renderSkill1Phase(style: PhaseStyle): React.JSX.Element {
  return (
    <motion.div
      variants={getPhaseVariants()}
      className="absolute inset-0 flex flex-col justify-between"
      style={{
        opacity: style.opacity,
        y: style.y,
        pointerEvents: style.pointerEvents,
      }}
    >
      <div className="pt-2 sm:pt-4">
        <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#5E0ED7] uppercase block mb-2">
          Skill Phase 01
        </span>
        <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-black uppercase">
          <span className="text-[#5E0ED7]">01</span> / AGENTIC WORKFLOWS
        </h2>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 sm:pb-4 w-full">
        <div className="max-w-xl">
          <p className="text-base sm:text-lg md:text-2xl font-medium text-black/90 leading-relaxed normal-case">
            Built autonomous multi-agent pipelines evaluating 500+ prompts weekly with self-healing reflection loops.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end shrink-0 text-left md:text-right">
          <div className="font-bold text-black flex items-baseline leading-none mb-1 text-5xl sm:text-6xl md:text-7xl">
            <span className="text-[#5E0ED7]">+</span>15
          </div>
          <div className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-black/80">
            / AGENTS BUILT
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Renders the second skill phase highlighting Predictive ML Systems.
 */
function renderSkill2Phase(style: PhaseStyle): React.JSX.Element {
  return (
    <motion.div
      variants={getPhaseVariants()}
      className="absolute inset-0 flex flex-col justify-between"
      style={{
        opacity: style.opacity,
        y: style.y,
        pointerEvents: style.pointerEvents,
      }}
    >
      <div className="pt-2 sm:pt-4">
        <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#5E0ED7] uppercase block mb-2">
          Skill Phase 02
        </span>
        <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-black uppercase">
          <span className="text-[#5E0ED7]">02</span> / PREDICTIVE ML SYSTEMS
        </h2>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 sm:pb-4 w-full">
        <div className="max-w-xl">
          <p className="text-base sm:text-lg md:text-2xl font-medium text-black/90 leading-relaxed normal-case">
            {"Engineered proprietary GenAI & temporal forecasting models with 99% predictive accuracy. National Finalist @ RBIH '26."}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end shrink-0 text-left md:text-right">
          <div className="font-bold text-black flex items-baseline leading-none mb-1 text-5xl sm:text-6xl md:text-7xl">
            99<span className="text-[#5E0ED7]">%</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-black/80">
            / ACCURACY
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Renders the third skill phase showcasing Full-Stack & Cloud capabilities alongside the CTA button.
 */
function renderSkill3Phase(style: PhaseStyle): React.JSX.Element {
  return (
    <motion.div
      variants={getPhaseVariants()}
      className="absolute inset-0 flex flex-col justify-between"
      style={{
        opacity: style.opacity,
        y: style.y,
        pointerEvents: style.pointerEvents,
      }}
    >
      <div className="pt-2 sm:pt-4">
        <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#5E0ED7] uppercase block mb-2">
          Skill Phase 03
        </span>
        <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-black uppercase">
          <span className="text-[#5E0ED7]">03</span> / FULL-STACK &amp; CLOUD
        </h2>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 sm:pb-4 w-full">
        <div className="max-w-xl flex flex-col items-start">
          <p className="text-base sm:text-lg md:text-2xl font-medium text-black/90 leading-relaxed normal-case mb-6">
            {"Robust React 18, Svelte 5, & Three.js 3D applications backed by scalable cloud pipelines."}
          </p>
          <a
            href="https://github.com/TANMaYtO"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#5E0ED7] text-white font-semibold text-sm sm:text-base tracking-widest uppercase rounded-full hover:bg-black transition-colors shadow-lg shadow-[#5E0ED7]/30"
          >
            <span>EXPLORE GITHUB</span>
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </a>
        </div>

        <div className="flex flex-col items-start md:items-end shrink-0 text-left md:text-right">
          <div className="font-bold text-black flex items-baseline leading-none mb-1 text-5xl sm:text-6xl md:text-7xl">
            <span className="text-[#5E0ED7]">+</span>300
          </div>
          <div className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-black/80">
            / BRANDS &amp; VENTURES
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Full-screen scroll-driven sticky hero section displaying Tanmay Tomar's Advanced Agentic Skills.
 */
export function FearlessSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>(VIDEO_URL);
  const [progress, setProgress] = useState<number>(0);

  // Preload video into RAM Blob URL for instantaneous, stutter-free playback
  useEffect(function initVideoPreload(): () => void {
    let isMounted = true;

    /**
     * Extracts blob from fetch response.
     */
    function handleResponse(res: Response): Promise<Blob> {
      return res.blob();
    }

    /**
     * Updates video source state with created object URL.
     */
    function handleBlob(blob: Blob): void {
      if (isMounted) {
        setVideoSrc(URL.createObjectURL(blob));
      }
    }

    /**
     * Catches and ignores video preloading fetch errors.
     */
    function handleError(): void {
      // Ignore fetch error, fallback to initial VIDEO_URL
    }

    fetch(VIDEO_URL)
      .then(handleResponse)
      .then(handleBlob)
      .catch(handleError);

    /**
     * Cleanup function to prevent state update on unmounted component.
     */
    function cleanup(): void {
      isMounted = false;
    }

    return cleanup;
  }, []);

  useEffect(function initScrollListener(): () => void {
    /**
     * Handles window scroll event to calculate section progress.
     */
    function handleScroll(): void {
      if (!sectionRef.current) {
        return;
      }
      const rect = sectionRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) {
        return;
      }
      const currentScroll = -rect.top;
      const rawProgress = currentScroll / totalScrollable;
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));
      setProgress(clampedProgress);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /**
     * Removes scroll listener on component unmount.
     */
    function cleanupScroll(): void {
      window.removeEventListener('scroll', handleScroll);
    }

    return cleanupScroll;
  }, []);

  const introStyle = calculatePhaseStyle(progress, 0.0, 0.0, 0.22, 0.28);
  const skill1Style = calculatePhaseStyle(progress, 0.22, 0.28, 0.48, 0.55);
  const skill2Style = calculatePhaseStyle(progress, 0.48, 0.55, 0.72, 0.80);
  const skill3Style = calculatePhaseStyle(progress, 0.72, 0.80, 1.0, 1.0);

  return (
    <section
      ref={sectionRef}
      className="relative z-20 h-[350vh] w-full bg-white text-black selection:bg-[#5E0ED7] selection:text-white select-none font-semibold uppercase tracking-widest"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between p-6 sm:p-10 md:p-16">
        {/* Background Video */}
        <video
          src={videoSrc}
          muted
          playsInline
          autoPlay
          loop
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        {/* Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/5 z-20 pointer-events-none">
          <div
            className="h-full bg-[#5E0ED7] transition-all duration-75"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full h-full"
        >
          <AnimatePresence>
            <div className="relative z-10 w-full h-full">
              {renderIntroPhase(introStyle)}
              {renderSkill1Phase(skill1Style)}
              {renderSkill2Phase(skill2Style)}
              {renderSkill3Phase(skill3Style)}
            </div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

export default FearlessSection;
