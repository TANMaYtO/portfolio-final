import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Menu, X, BarChart3, Heart } from 'lucide-react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_183632_c311af08-e4b7-458f-81e7-79847a49b3d3.mp4';

/**
 * Background video component that captures video frames and loops them boomerang-style on canvas.
 */
function BoomerangVideoBg(): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>(VIDEO_URL);
  const [useCanvas, setUseCanvas] = useState<boolean>(false);
  const framesRef = useRef<ImageBitmap[]>([]);
  const frameDirectionRef = useRef<number>(1);
  const currentFrameRef = useRef<number>(0);
  const lastCaptureTimeRef = useRef<number>(0);

  // Fetch into RAM Blob URL to ensure fast loading and zero CORS restrictions
  useEffect(function initVideoBlob(): () => void {
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
      // Ignore errors
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;
    let rVfcId: number;
    let rafId: number;

    /**
     * Captures current video frame into RAM ImageBitmap.
     */
    async function captureFrame(): Promise<void> {
      if (!video || !isMounted || video.paused) return;
      const now = performance.now();
      if (now - lastCaptureTimeRef.current < 33) return;
      lastCaptureTimeRef.current = now;

      if (framesRef.current.length >= 150) return;

      try {
        const vw = video.videoWidth || 960;
        const vh = video.videoHeight || 540;
        const scale = Math.min(1, 960 / vw);
        const targetW = Math.round(vw * scale);
        const targetH = Math.round(vh * scale);

        if ('createImageBitmap' in window) {
          const bmp = await (window as any).createImageBitmap(video, {
            resizeWidth: targetW,
            resizeHeight: targetH,
          });
          if (isMounted) framesRef.current.push(bmp);
        } else {
          const offCanvas = document.createElement('canvas');
          offCanvas.width = targetW;
          offCanvas.height = targetH;
          const offCtx = offCanvas.getContext('2d');
          if (offCtx) {
            offCtx.drawImage(video, 0, 0, targetW, targetH);
            const bmp = await (window as any).createImageBitmap(offCanvas);
            if (isMounted) framesRef.current.push(bmp);
          }
        }
      } catch (e) {
        // Ignore capture errors during initialization
      }
    }

    /**
     * Step loop for frame extraction.
     */
    function stepCallback(): void {
      if (!isMounted || !video) return;
      captureFrame();
      if ('requestVideoFrameCallback' in video) {
        rVfcId = (video as any).requestVideoFrameCallback(stepCallback);
      } else {
        rafId = requestAnimationFrame(stepCallback);
      }
    }

    /**
     * When video ends or loops, check if enough frames were captured.
     */
    function handleLoopOrEnd(): void {
      if (!isMounted || !video) return;
      if (framesRef.current.length >= 30) {
        setUseCanvas(true);
      } else {
        video.currentTime = 0;
        video.play().catch(ignorePlayError);
      }
    }

    /**
     * Ignores video playback error.
     */
    function ignorePlayError(): void {
      // Ignore autoplay restriction error
    }

    video.addEventListener('ended', handleLoopOrEnd);
    video.play().catch(ignorePlayError);

    if ('requestVideoFrameCallback' in video) {
      rVfcId = (video as any).requestVideoFrameCallback(stepCallback);
    } else {
      rafId = requestAnimationFrame(stepCallback);
    }

    /**
     * Cleans up frame capture loops and event listeners.
     */
    function cleanupCapture(): void {
      isMounted = false;
      if (video) {
        video.removeEventListener('ended', handleLoopOrEnd);
        if ('requestVideoFrameCallback' in video && rVfcId) {
          try { (video as any).cancelVideoFrameCallback(rVfcId); } catch (e) {}
        }
      }
      if (rafId) cancelAnimationFrame(rafId);
    }

    return cleanupCapture;
  }, [videoSrc]);

  // Ping-pong (boomerang) canvas playback loop at 30fps
  useEffect(() => {
    if (!useCanvas) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let intervalId: any;

    /**
     * Renders captured boomerang frames in ping-pong loop.
     */
    function renderBoomerang(): void {
      const frames = framesRef.current;
      if (!frames || frames.length === 0 || !canvas || !ctx) return;

      const frame = frames[currentFrameRef.current];
      if (frame) {
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
        const cw = canvas.width;
        const ch = canvas.height;
        const s = Math.max(cw / frame.width, ch / frame.height);
        const dw = frame.width * s;
        const dh = frame.height * s;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      }

      currentFrameRef.current += frameDirectionRef.current;
      if (currentFrameRef.current >= frames.length - 1) {
        currentFrameRef.current = frames.length - 1;
        frameDirectionRef.current = -1;
      } else if (currentFrameRef.current <= 0) {
        currentFrameRef.current = 0;
        frameDirectionRef.current = 1;
      }
    }

    intervalId = setInterval(renderBoomerang, 1000 / 30);

    /**
     * Clears rendering interval on unmount.
     */
    function cleanupInterval(): void {
      clearInterval(intervalId);
    }

    return cleanupInterval;
  }, [useCanvas]);

  return (
    <div className="absolute inset-0 z-0 scale-[1.08] origin-center overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        autoPlay
        loop={!useCanvas}
        className={`h-full w-full object-cover ${useCanvas ? 'hidden' : 'block'}`}
      />
      <canvas
        ref={canvasRef}
        className={`h-full w-full object-cover ${useCanvas ? 'block' : 'hidden'}`}
      />
    </div>
  );
}

/**
 * Full-screen hero section for vinyl record label quietpress.
 */
export function QuietpressSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);

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

  /**
   * Toggles mobile menu state.
   */
  function toggleMenu(): void {
    /**
     * Inverts boolean state.
     */
    function invertState(prev: boolean): boolean {
      return !prev;
    }
    setIsMenuOpen(invertState);
  }

  /**
   * Toggles heart liked state.
   */
  function toggleLike(): void {
    /**
     * Inverts boolean state.
     */
    function invertState(prev: boolean): boolean {
      return !prev;
    }
    setIsLiked(invertState);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <section
        ref={sectionRef}
        className="quietpress-root relative z-20 h-screen w-full overflow-hidden bg-black text-white select-none"
        style={{ height: '100dvh' }}
      >
        {/* Background Boomerang Video */}
        <BoomerangVideoBg />

      {/* Header Bar */}
      <header className="absolute top-0 inset-x-0 z-20 px-4 sm:px-6 py-5 flex items-center justify-between">
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 256 256">
            <path d="M 256 256 L 128 256 C 198.692 256 256 198.692 256 128 C 256 57.308 198.692 0 128 0 C 57.308 0 0 57.308 0 128 C 0 198.692 57.308 256 128 256 L 0 256 L 0 0 L 256 0 Z M 128 104 C 141.255 104 152 114.745 152 128 C 152 141.255 141.255 152 128 152 C 114.745 152 104 141.255 104 128 C 104 114.745 114.745 104 128 104 Z" />
          </svg>
          <span className="text-base tracking-tight text-white font-normal">quietpress</span>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/90">
          <a href="#anthology" className="hover:text-white transition-colors">Anthology</a>
          <a href="#talents" className="hover:text-white transition-colors">Talents</a>
          <a href="#sound-diary" className="hover:text-white transition-colors">Sound diary</a>
          <a href="#playback-salon" className="hover:text-white transition-colors">Playback salon</a>
        </nav>

        {/* Right Side: Cart & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="rounded-xl bg-white p-1 pr-3 sm:pr-4 flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95 transition-transform duration-200 text-gray-900">
            <div className="h-7 w-7 rounded-lg bg-blue-700 flex items-center justify-center text-white shrink-0">
              <ShoppingCart size={14} strokeWidth={2} />
            </div>
            <span className="hidden sm:inline text-sm font-medium">Cart (0)</span>
            <span className="sm:hidden text-sm font-medium">(0)</span>
          </button>

          <button
            onClick={toggleMenu}
            className="liquid-glass h-9 w-9 rounded-xl flex items-center justify-center text-white md:hidden hover:scale-105 active:scale-95 transition-transform duration-200"
            aria-label="Toggle Navigation Menu"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-20 left-0 right-0 z-30 liquid-glass mx-4 rounded-2xl p-2 flex flex-col gap-1 md:hidden shadow-2xl animate-fade-up">
          <a
            href="#anthology"
            onClick={toggleMenu}
            className="rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors"
          >
            Anthology
          </a>
          <a
            href="#talents"
            onClick={toggleMenu}
            className="rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors"
          >
            Talents
          </a>
          <a
            href="#sound-diary"
            onClick={toggleMenu}
            className="rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors"
          >
            Sound diary
          </a>
          <a
            href="#playback-salon"
            onClick={toggleMenu}
            className="rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors"
          >
            Playback salon
          </a>
        </div>
      )}

      {/* Hero Centered Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto pt-28 sm:pt-36 md:pt-44 px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Tag Badge */}
        <div
          className={`liquid-glass rounded-lg px-4 py-1.5 text-xs sm:text-sm text-white mb-5 sm:mb-6 ${
            isActive ? 'animate-fade-up delay-1' : 'opacity-0'
          }`}
          style={{ background: 'rgba(255, 255, 255, 0.16)' }}
        >
          Press 04 . Vernal woods
        </div>

        {/* Headline */}
        <h1
          className={`max-w-3xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-white font-normal tracking-tight whitespace-pre-line ${
            isActive ? 'animate-fade-up delay-2' : 'opacity-0'
          }`}
        >
          {"records cut for the\ncalm listener."}
        </h1>

        {/* Subtext */}
        <p
          className={`mt-5 sm:mt-6 max-w-md text-sm sm:text-base md:text-lg leading-relaxed text-white/90 ${
            isActive ? 'animate-fade-up delay-3' : 'opacity-0'
          }`}
        >
          Drone, roots, and nature-captured sound on wax LPs. Every disc cut just once, snag it or miss.
        </p>

        {/* Buttons */}
        <div
          className={`mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto ${
            isActive ? 'animate-fade-up delay-4' : 'opacity-0'
          }`}
        >
          <button className="rounded-xl bg-white px-7 py-2.5 text-sm font-medium text-gray-900 hover:scale-105 active:scale-95 transition-transform duration-200 w-full sm:w-auto shadow-lg">
            Browse the shelves
          </button>
          <button className="liquid-glass rounded-xl px-7 py-2.5 text-sm font-medium text-white hover:scale-105 active:scale-95 transition-transform duration-200 w-full sm:w-auto">
            Newest arrivals
          </button>
        </div>
      </div>

      {/* Now Playing Widget */}
      <div
        className={`absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-10 z-20 w-[270px] sm:w-72 ${
          isActive ? 'animate-fade-up delay-5' : 'opacity-0'
        }`}
      >
        {/* Track Card */}
        <div className="rounded-2xl bg-white p-2.5 pr-4 shadow-lg mb-2 text-gray-900">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-700 flex items-center justify-center text-white shrink-0">
              <BarChart3 size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Helia Marsh &mdash; Fern Light</p>
              <div className="mt-1.5 h-1 w-full rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full w-[30%] bg-blue-700 rounded-full" />
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-gray-500 font-mono">
                <span>0:33</span>
                <span>-1:21</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-2">
          <button className="flex-1 rounded-2xl bg-white py-2 text-sm font-medium text-gray-900 shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200">
            Prev
          </button>
          <button
            onClick={toggleLike}
            className="h-10 w-10 rounded-full bg-white shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200 flex items-center justify-center shrink-0"
            aria-label="Like Track"
          >
            <Heart
              size={16}
              className="text-blue-700 transition-colors"
              fill={isLiked ? '#1d4ed8' : 'none'}
            />
          </button>
          <button className="flex-1 rounded-2xl bg-white py-2 text-sm font-medium text-gray-900 shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200">
            Next
          </button>
        </div>
      </div>
      </section>
    </motion.div>
  );
}
