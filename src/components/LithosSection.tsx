import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85';
const BG_IMAGE_2 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85';
const SPOTLIGHT_R = 260;

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
}

/**
 * Renders the revealed second image masked by a trailing circular canvas gradient.
 */
function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const revealDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /**
     * Resizes hidden canvas to window width and height.
     */
    function handleResize(): void {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    /**
     * Cleanup resize listener on unmount.
     */
    function cleanupResize(): void {
      window.removeEventListener('resize', handleResize);
    }

    return cleanupResize;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const revealDiv = revealDivRef.current;
    if (!canvas || !revealDiv) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)');
    gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    const dataUrl = canvas.toDataURL();
    revealDiv.style.maskImage = `url(${dataUrl})`;
    revealDiv.style.webkitMaskImage = `url(${dataUrl})`;
  }, [cursorX, cursorY]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: 'none' }} />
      <div
        ref={revealDivRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{
          backgroundImage: `url("${image}")`,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
        }}
      />
    </>
  );
}

/**
 * Full-screen Experience section customized for Tanmay Tomar with cursor-following spotlight reveal.
 */
export function LithosSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mouse = useRef<{ x: number; y: number }>({ x: -999, y: -999 });
  const smooth = useRef<{ x: number; y: number }>({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: -999, y: -999 });
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    /**
     * Stores raw cursor coordinates relative to section bounds.
     */
    function handleMouseMove(e: MouseEvent): void {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      mouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    /**
     * RAF lerping loop smoothing spotlight position toward raw mouse coordinates.
     */
    function loop(): void {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
      setCursorPos({ x: smooth.current.x, y: smooth.current.y });

      rafRef.current = requestAnimationFrame(loop);
    }

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(loop);

    /**
     * Cleanup mouse event listener and animation frame.
     */
    function cleanupMouseMove(): void {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }

    return cleanupMouseMove;
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    /**
     * Updates section active state when intersected.
     */
    function handleIntersection(entries: IntersectionObserverEntry[]): void {
      const [entry] = entries;
      if (entry && entry.isIntersecting) {
        setIsActive(true);
      }
    }

    const observer = new IntersectionObserver(handleIntersection, { threshold: 0.15 });

    observer.observe(section);

    /**
     * Disconnect observer on unmount.
     */
    function disconnectObserver(): void {
      observer.disconnect();
    }

    return disconnectObserver;
  }, []);

  return (
    <div className="relative z-20 min-h-screen bg-white tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <section
          ref={sectionRef}
          className="relative w-full overflow-hidden h-screen bg-black"
          style={{ height: '100dvh' }}
        >
          {/* Layer 1: Base Image */}
          <div
            className={`absolute inset-0 bg-center bg-cover bg-no-repeat z-10 ${isActive ? 'hero-zoom' : ''}`}
            style={{ backgroundImage: `url("${BG_IMAGE_1}")` }}
          />

          {/* Layer 2: Reveal Layer */}
          <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

          {/* Layer 3: Heading */}
          <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
            <h1 className="text-white leading-[0.95]">
              <span
                className={`block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl ${
                  isActive ? 'hero-anim hero-reveal' : 'opacity-0'
                }`}
                style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
              >
                Experience
              </span>
              <span
                className={`block font-normal text-2xl sm:text-4xl md:text-5xl mt-3 text-emerald-300 font-mono tracking-tight ${
                  isActive ? 'hero-anim hero-reveal' : 'opacity-0'
                }`}
                style={{ letterSpacing: '-0.02em', animationDelay: '0.42s' }}
              >
                Innodata Inc. &bull; AI Data Associate
              </span>
            </h1>
          </div>

          {/* Layer 4: Bottom-left bullet 1 */}
          <div
            className={`hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[340px] bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/15 z-50 ${
              isActive ? 'hero-anim hero-fade' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.7s' }}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-400 mt-0.5">&bull;</span>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-mono">
                Evaluated 500+ prompts weekly on proprietary multimodal GenAI models, identifying instruction-following failures, temporal consistency gaps, and physics-based hallucination modes as structured RLHF fine-tuning signal.
              </p>
            </div>
          </div>

          {/* Layer 5: Bottom-right bullet 2 */}
          <div
            className={`absolute bottom-10 sm:bottom-14 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[340px] bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/15 z-50 ${
              isActive ? 'hero-anim hero-fade' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.85s' }}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-400 mt-0.5">&bull;</span>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-mono">
                Maintained 95%+ QA accuracy across model-generated video outputs; surfaced failure patterns into alignment and safety fine-tuning datasets, contributing to measurable reduction in hallucination rates across successive model versions.
              </p>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
