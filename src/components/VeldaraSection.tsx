import React, { useEffect, useRef } from 'react';

const VELDARA_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260616_212935_bbf608da-62d1-4f25-9be4-c346e4d09cc8.mp4';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

/**
 * Immersive 3D scroll section showcasing Tanmay Tomar's flagship AI projects.
 */
export function VeldaraSection(): React.JSX.Element {
  const scrollVideoContainerRef = useRef<HTMLDivElement | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoFallbackRef = useRef<HTMLVideoElement | null>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fixedCardsRef = useRef<HTMLDivElement | null>(null);
  const veldaraNavRef = useRef<HTMLElement | null>(null);
  const veldaraHeroRef = useRef<HTMLElement | null>(null);

  // Scroll Video Engine
  useEffect(() => {
    const canvas = videoCanvasRef.current;
    const videoEl = videoFallbackRef.current;
    if (!canvas || !videoEl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frames: ImageBitmap[] = [];
    let framesReady = false;
    let lastFrameIndex = -1;
    let videoSeeking = false;
    let rafId: number;

    /**
     * Resizes canvas to match device pixel ratio and display rect.
     */
    function resizeCanvas(): void {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      lastFrameIndex = -1;
    }

    /**
     * Extracts video frames into RAM ImageBitmaps.
     */
    async function extractFrames(): Promise<void> {
      try {
        const response = await fetch(VELDARA_VIDEO_URL, { mode: 'cors' });
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';
        video.preload = 'auto';
        video.src = objectUrl;

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject();
          setTimeout(() => reject(), 15000);
        });

        const scale = Math.min(1, 1280 / video.videoWidth);
        const scaledWidth = Math.round(video.videoWidth * scale);
        const scaledHeight = Math.round(video.videoHeight * scale);
        const frameCount = Math.max(30, Math.min(120, Math.round(video.duration * 24)));

        for (let i = 0; i < frameCount; i++) {
          const time = (i / (frameCount - 1)) * (video.duration - 0.05);
          video.currentTime = time;
          await new Promise<void>((resolve, reject) => {
            const onSeeked = (): void => {
              video.removeEventListener('seeked', onSeeked);
              resolve();
            };
            video.addEventListener('seeked', onSeeked);
            setTimeout(() => {
              video.removeEventListener('seeked', onSeeked);
              reject();
            }, 3000);
          });
          const bitmap = await createImageBitmap(video, {
            resizeWidth: scaledWidth,
            resizeHeight: scaledHeight,
          });
          frames.push(bitmap);
        }

        if (frames.length > 0 && canvas && videoEl) {
          framesReady = true;
          canvas.style.visibility = 'visible';
          videoEl.style.display = 'none';
        }
        URL.revokeObjectURL(objectUrl);
      } catch (e) {
        // Fallback to video seeking
      }
    }

    /**
     * Calculates scroll progress through the projects section.
     */
    function getProgress(): number {
      const vh = window.innerHeight;
      const start = vh * 0.95;
      const end = document.documentElement.scrollHeight - vh;
      const range = end - start;
      if (range <= 0) return 0;
      return Math.max(0, Math.min(1, (window.scrollY - start) / range));
    }

    /**
     * Draws an ImageBitmap frame centered on canvas.
     */
    function drawFrame(frame: ImageBitmap): void {
      if (!canvas || !ctx) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / frame.width, ch / frame.height);
      const dw = frame.width * s;
      const dh = frame.height * s;
      ctx.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    /**
     * RAF loop updating background frame or playback time.
     */
    function videoTick(): void {
      const progress = getProgress();
      if (framesReady && frames.length > 0) {
        const idx = Math.round(progress * (frames.length - 1));
        if (idx !== lastFrameIndex) {
          lastFrameIndex = idx;
          if (frames[idx]) drawFrame(frames[idx]);
        }
      } else if (videoEl && videoEl.duration && isFinite(videoEl.duration) && videoEl.readyState >= 1) {
        const target = progress * videoEl.duration;
        if (!videoSeeking && Math.abs(videoEl.currentTime - target) > 0.001) {
          videoSeeking = true;
          videoEl.currentTime = target;
        }
      }

      const vh = window.innerHeight;
      const isScrolledIntoSection = window.scrollY >= vh * 0.75 && window.scrollY <= vh * 4.8;
      if (veldaraNavRef.current) {
        veldaraNavRef.current.style.opacity = isScrolledIntoSection ? '1' : '0';
        veldaraNavRef.current.style.pointerEvents = isScrolledIntoSection ? 'auto' : 'none';
      }
      const isVideoActive = window.scrollY >= vh * 0.15 && window.scrollY <= vh * 5.2;
      if (scrollVideoContainerRef.current) {
        scrollVideoContainerRef.current.style.opacity = isVideoActive ? '1' : '0';
      }
      if (particlesCanvasRef.current) {
        particlesCanvasRef.current.style.opacity = isVideoActive ? '1' : '0';
      }

      rafId = requestAnimationFrame(videoTick);
    }

    const onSeeked = (): void => {
      videoSeeking = false;
    };
    const onStalled = (): void => {
      videoSeeking = false;
    };
    const onLoadedData = (): void => {
      if (videoEl) videoEl.currentTime = 0;
    };

    videoEl.addEventListener('seeked', onSeeked);
    videoEl.addEventListener('stalled', onStalled);
    videoEl.addEventListener('loadeddata', onLoadedData);
    canvas.style.visibility = 'hidden';

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    rafId = requestAnimationFrame(videoTick);
    extractFrames();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
      videoEl.removeEventListener('seeked', onSeeked);
      videoEl.removeEventListener('stalled', onStalled);
      videoEl.removeEventListener('loadeddata', onLoadedData);
    };
  }, []);

  // Particles Hook
  useEffect(() => {
    const pCanvas = particlesCanvasRef.current;
    if (!pCanvas) return;
    const pCtx = pCanvas.getContext('2d');
    if (!pCtx) return;

    let particles: Particle[] = [];
    let rafId: number;

    /**
     * Creates randomized floating particles.
     */
    function createParticles(): void {
      if (!pCanvas) return;
      particles = [];
      const count = Math.floor((pCanvas.width * pCanvas.height) / 12000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * pCanvas.width,
          y: Math.random() * pCanvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.6 + 0.2,
        });
      }
    }

    /**
     * Resizes particle canvas.
     */
    function resizeParticles(): void {
      if (!pCanvas) return;
      pCanvas.width = window.innerWidth;
      pCanvas.height = window.innerHeight;
      createParticles();
    }

    /**
     * Animates particle trajectory.
     */
    function animateParticles(): void {
      if (!pCanvas || !pCtx) return;
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = pCanvas.width;
        if (p.x > pCanvas.width) p.x = 0;
        if (p.y < 0) p.y = pCanvas.height;
        if (p.y > pCanvas.height) p.y = 0;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        pCtx.fill();
      }
      rafId = requestAnimationFrame(animateParticles);
    }

    resizeParticles();
    window.addEventListener('resize', resizeParticles);
    animateParticles();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeParticles);
    };
  }, []);

  // Scroll Fade & Card Trigger Hook
  useEffect(() => {
    let rafId: number;

    /**
     * Handles hero fade and fixed card animation on scroll.
     */
    function tickScroll(): void {
      const vh = window.innerHeight;
      const scrollY = window.scrollY;

      // Hero Fade
      if (veldaraHeroRef.current) {
        const relScroll = Math.max(0, scrollY - vh);
        const fade = Math.max(0, 1 - relScroll / (vh * 0.35));
        veldaraHeroRef.current.style.opacity = String(fade);
      }

      // Fixed Cards
      const trigger = document.getElementById('cards-trigger');
      const fixedCards = fixedCardsRef.current;
      if (trigger && fixedCards) {
        const rect = trigger.getBoundingClientRect();
        const triggerTop = rect.top + scrollY;
        const triggerHeight = rect.height;

        const start = triggerTop - vh * 0.5;
        const end = triggerTop + triggerHeight - vh * 0.3;
        const range = end - start;

        let progress = range > 0 ? (scrollY - start) / range : 0;
        progress = Math.max(0, Math.min(1, progress));

        const isActive = scrollY >= start - vh * 0.2 && scrollY <= end + vh * 0.3;
        const fadeIn = Math.min(1, Math.max(0, (scrollY - (start - vh * 0.2)) / (vh * 0.2)));
        const fadeOut = Math.min(1, Math.max(0, (end + vh * 0.3 - scrollY) / (vh * 0.3)));
        const containerOpacity = isActive ? Math.min(fadeIn, fadeOut) : 0;

        fixedCards.style.opacity = String(containerOpacity);
        fixedCards.style.pointerEvents = containerOpacity > 0.1 ? 'auto' : 'none';

        const cardsGrid = fixedCards.querySelector('.grid') as HTMLElement | null;
        if (cardsGrid) {
          const isMobile = window.innerWidth < 768;
          const revealPct = progress * 130;
          const mask = isMobile
            ? `linear-gradient(to bottom, black ${revealPct}%, transparent ${revealPct + 20}%)`
            : `linear-gradient(to right, black ${revealPct}%, transparent ${revealPct + 15}%)`;
          cardsGrid.style.maskImage = mask;
          cardsGrid.style.webkitMaskImage = mask;
        }
      }

      rafId = requestAnimationFrame(tickScroll);
    }

    rafId = requestAnimationFrame(tickScroll);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="relative bg-[#010101] text-white font-sans overflow-hidden min-h-[380vh]">
      {/* Scroll Video Background */}
      <div
        id="scroll-video-container"
        ref={scrollVideoContainerRef}
        className="fixed inset-0 z-[1] bg-[#0a0a0a] top-[-20%] transition-opacity duration-300 opacity-0"
      >
        <canvas ref={videoCanvasRef} className="absolute inset-0 w-full h-full object-cover" />
        <video
          ref={videoFallbackRef}
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          src={VELDARA_VIDEO_URL}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Particles */}
      <canvas ref={particlesCanvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-[3] transition-opacity duration-300 opacity-0" />

      {/* Fixed Cards */}
      <div
        ref={fixedCardsRef}
        className="fixed bottom-0 inset-x-0 z-[4] px-6 sm:px-10 py-8 opacity-0 pointer-events-none transition-opacity duration-150"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Cronus */}
          <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-2xl font-bold text-white">Cronus</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 font-mono">SaaS</span>
              </div>
              <p className="text-emerald-400 text-xs font-mono mb-3">Autonomous YouTube Shorts Automation</p>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                7-node LangGraph pipeline driving trend discovery, Gemini Flash scriptwriting, sub-2s local Kokoro-ONNX TTS, and 1080×1920 kinetic subtitle assembly with zero human intervention.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-mono">20+ DAU Pro</span>
              <a
                href="https://github.com/TANMaYtO/YT-AUTONOMOUS-BOT"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-300 hover:text-white font-medium transition-colors flex items-center gap-1"
              >
                <span>Code</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>

          {/* Card 2: PRISM */}
          <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-2xl font-bold text-white">PRISM</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 font-mono">Multi-Agent</span>
              </div>
              <p className="text-emerald-400 text-xs font-mono mb-3">Autonomous PR Review System</p>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Parallel 4-agent review graph executing via fan-out with real-time SSE findings. AST-based Code Knowledge Graph extracts 6,000+ function definitions in under 5s.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-mono">0.33 F1 vs Human</span>
              <a
                href="https://github.com/TANMaYtO/PRISM"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-300 hover:text-white font-medium transition-colors flex items-center gap-1"
              >
                <span>Code</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>

          {/* Card 3: V24 */}
          <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-2xl font-bold text-white">V24</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Finalist</span>
              </div>
              <p className="text-emerald-400 text-xs font-mono mb-3">RBIH &apos;26 National Finalist</p>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Out-of-core Polars fraud detection pipeline with sub-second temporal variance feature engineering. CatBoost + LightGBM ensemble achieving 0.910 F1 under live load.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-mono">Top 4 / 25,000+</span>
              <span className="text-xs text-gray-400 font-mono">Confidential</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Header Bar when Scrolled */}
      <nav
        ref={veldaraNavRef}
        className="fixed top-0 inset-x-0 z-50 px-6 sm:px-10 py-5 flex items-center justify-between transition-opacity duration-300 opacity-0 pointer-events-none bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm"
      >
        <div className="flex items-center gap-8">
          <span className="font-bold text-xl text-white tracking-tight select-none uppercase">
            TANMAY®
          </span>
          <span className="text-emerald-400 font-mono text-xs px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/40 hidden sm:inline-block">
            Flagship Agentic &amp; ML Architecture
          </span>
        </div>
        <div className="flex items-center gap-4 text-gray-300">
          <a href="https://github.com/TANMaYtO" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="GitHub">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </nav>

      {/* Main Content Flow */}
      <div className="relative z-[2]">
        {/* Section 1: Hero Title */}
        <section
          ref={veldaraHeroRef}
          className="relative h-screen w-full flex flex-col items-center justify-end text-center px-6 pb-24 transition-opacity duration-150"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tight text-white uppercase select-none mb-4">
              Projects
            </h1>
          </div>
          <div className="relative z-10 mt-16 animate-bounce text-gray-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </section>

        {/* Spacer */}
        <div className="h-[120vh]" />

        {/* Cards Trigger Zone */}
        <div id="cards-trigger" className="h-[160vh]" />

        {/* Bottom Cushion */}
        <div className="h-[60vh]" />
      </div>
    </div>
  );
}
