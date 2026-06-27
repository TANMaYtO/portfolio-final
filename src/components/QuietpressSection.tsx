import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Play, Pause, Volume2, Music } from 'lucide-react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_183632_c311af08-e4b7-458f-81e7-79847a49b3d3.mp4';

interface TrackItem {
  id: string;
  title: string;
  mood: string;
  duration: string;
  baseFreq: number;
}

const TRACKS: TrackItem[] = [
  {
    id: '01',
    title: 'Echoes of Veldara',
    mood: 'Cinematic Orchestral',
    duration: '3:42',
    baseFreq: 110.0, // A2
  },
  {
    id: '02',
    title: 'Vernal Woods Resonance',
    mood: 'Ambient Synth Drone',
    duration: '4:15',
    baseFreq: 130.81, // C3
  },
  {
    id: '03',
    title: 'Cybernetic Horizon',
    mood: 'Sci-Fi Deep Pulse',
    duration: '2:58',
    baseFreq: 146.83, // D3
  },
];

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

  useEffect(function initCapture(): () => void {
    const video = videoRef.current;
    if (!video) return () => {};

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
        // Ignore capture errors
      }
    }

    /**
     * Step loop for frame capture.
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
     * Ignores autoplay restrictions.
     */
    function ignorePlayError(): void {
      // Ignore errors
    }

    /**
     * Switches to canvas boomerang mode once enough frames are captured.
     */
    function handleLoopOrEnd(): void {
      if (!isMounted || !video) return;
      if (framesRef.current.length >= 20) {
        setUseCanvas(true);
      } else {
        video.currentTime = 0;
        video.play().catch(ignorePlayError);
      }
    }

    video.addEventListener('ended', handleLoopOrEnd);
    video.play().catch(ignorePlayError);

    if ('requestVideoFrameCallback' in video) {
      rVfcId = (video as any).requestVideoFrameCallback(stepCallback);
    } else {
      rafId = requestAnimationFrame(stepCallback);
    }

    /**
     * Cleans up capture loops on unmount.
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

  useEffect(function initBoomerangRender(): () => void {
    if (!useCanvas) return () => {};
    let intervalId: ReturnType<typeof setInterval> | null = null;

    /**
     * Renders frames in forward-then-reverse sequence.
     */
    function renderBoomerang(): void {
      const frames = framesRef.current;
      const canvas = canvasRef.current;
      if (!frames || frames.length === 0 || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const frame = frames[currentFrameRef.current];
      if (frame) {
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
          canvas.width = canvas.clientWidth || 960;
          canvas.height = canvas.clientHeight || 540;
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
     * Clears interval on unmount.
     */
    function cleanupInterval(): void {
      if (intervalId) clearInterval(intervalId);
    }

    return cleanupInterval;
  }, [useCanvas]);

  return (
    <div className="absolute inset-0 z-0 scale-[1.08] origin-center overflow-hidden bg-black pointer-events-none">
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
 * Animated visualizer bar component for active audio track.
 */
function VisualizerBars({ isPlaying }: { isPlaying: boolean }): React.JSX.Element {
  return (
    <div className="flex items-end gap-0.5 h-3.5 px-1">
      {[0.8, 1.0, 0.6, 0.9].map(function renderBar(mult, idx): React.JSX.Element {
        return (
          <motion.div
            key={idx}
            className="w-0.5 bg-[#5E0ED7] rounded-full"
            animate={
              isPlaying
                ? { height: [3, 14 * mult, 4, 12 * mult, 3] }
                : { height: 3 }
            }
            transition={{
              duration: 0.5 + idx * 0.1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Full-screen composer showcase section for Laeddis.
 */
export function QuietpressSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const [isActive, setIsActive] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  useEffect(function initObserver(): () => void {
    const section = sectionRef.current;
    if (!section) return () => {};

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
   * Stops any currently synthesized audio tones.
   */
  function stopAudio(): void {
    oscillatorsRef.current.forEach(function stopOsc(osc: OscillatorNode): void {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    oscillatorsRef.current = [];
    if (gainNodeRef.current) {
      try { gainNodeRef.current.disconnect(); } catch (e) {}
    }
    setPlayingTrackId(null);
  }

  /**
   * Synthesizes ambient cinematic drone for the specified track using Web Audio API.
   */
  function playAudioForTrack(track: TrackItem): void {
    stopAudio();

    if (playingTrackId === track.id) {
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 1.2);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    const freqs = [track.baseFreq, track.baseFreq * 1.5, track.baseFreq * 2.0];
    const newOscs: OscillatorNode[] = [];

    freqs.forEach(function createOsc(freq: number, index: number): void {
      const osc = ctx.createOscillator();
      osc.type = index === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.2 + index * 0.1;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 1.5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(masterGain);
      osc.start();
      newOscs.push(osc, lfo);
    });

    oscillatorsRef.current = newOscs;
    setPlayingTrackId(track.id);
  }

  /**
   * Triggers playback for the latest release (Track 01).
   */
  function handleListenLatest(): void {
    const latest = TRACKS[0];
    if (latest) {
      playAudioForTrack(latest);
    }
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
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-[#5E0ED7] flex items-center justify-center text-white shadow-md shadow-[#5E0ED7]/40">
              <Music size={13} />
            </div>
            <span className="text-base tracking-widest text-white font-semibold uppercase">LAEDDIS</span>
          </div>

          {/* Center: Composer Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/90 font-medium">
            <a href="#discography" className="hover:text-white transition-colors">Discography</a>
            <a href="#orchestral" className="hover:text-white transition-colors">Orchestral Projects</a>
            <a href="#sound-design" className="hover:text-white transition-colors">Sound Design</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </nav>

          {/* Right Side: Mobile Menu Toggle */}
          <div className="flex items-center">
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
              href="#discography"
              onClick={toggleMenu}
              className="rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors"
            >
              Discography
            </a>
            <a
              href="#orchestral"
              onClick={toggleMenu}
              className="rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors"
            >
              Orchestral Projects
            </a>
            <a
              href="#sound-design"
              onClick={toggleMenu}
              className="rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors"
            >
              Sound Design
            </a>
            <a
              href="#about"
              onClick={toggleMenu}
              className="rounded-xl px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-colors"
            >
              About
            </a>
          </div>
        )}

        {/* Hero Centered Content (Top Center, leaving middle screen completely open) */}
        <div className="relative z-10 w-full max-w-5xl mx-auto pt-28 sm:pt-36 md:pt-44 px-4 sm:px-6 flex flex-col items-center text-center">
          {/* Tag Badge */}
          <div
            className={`liquid-glass rounded-lg px-4 py-1.5 text-xs sm:text-sm text-white mb-5 sm:mb-6 font-mono ${
              isActive ? 'animate-fade-up delay-1' : 'opacity-0'
            }`}
            style={{ background: 'rgba(255, 255, 255, 0.16)' }}
          >
            Original Compositions by Laeddis
          </div>

          {/* Headline */}
          <h1
            className={`max-w-3xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-white font-normal tracking-tight whitespace-pre-line ${
              isActive ? 'animate-fade-up delay-2' : 'opacity-0'
            }`}
          >
            {"Immersive Cinematic\nSoundscapes."}
          </h1>

          {/* Call to Action Button */}
          <div
            className={`mt-8 ${
              isActive ? 'animate-fade-up delay-4' : 'opacity-0'
            }`}
          >
            <button
              onClick={handleListenLatest}
              className="group relative inline-flex items-center gap-3 rounded-xl bg-[#5E0ED7] px-7 py-3 text-sm sm:text-base font-semibold text-white shadow-xl hover:bg-[#6f19f7] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Volume2 size={18} className="animate-pulse" />
              <span>Listen to the Latest Release</span>
            </button>
          </div>
        </div>

        {/* Sleek Vertical Tracklist (Compact Bottom-Right Widget, keeping center screen completely unobstructed) */}
        <div
          className={`absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-10 z-20 w-[280px] sm:w-80 liquid-glass rounded-2xl p-3 shadow-2xl border border-white/15 backdrop-blur-md ${
            isActive ? 'animate-fade-up delay-5' : 'opacity-0'
          }`}
          style={{ background: 'rgba(0, 0, 0, 0.65)' }}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 px-1 text-[11px] uppercase tracking-wider text-white/50 font-mono">
            <span>Showcase Tracks</span>
            <span>Live Audio</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {TRACKS.map(function renderRow(track): React.JSX.Element {
              const isPlaying = playingTrackId === track.id;
              return (
                <div
                  key={track.id}
                  onClick={function handleRowClick(): void { playAudioForTrack(track); }}
                  className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    isPlaying
                      ? 'bg-[#5E0ED7]/30 border border-[#5E0ED7]/60 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white/90 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isPlaying ? 'bg-[#5E0ED7] text-white' : 'bg-white/10 group-hover:bg-white/20 text-white'
                      }`}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <div className="truncate">
                      <p className="text-xs font-medium truncate">{track.title}</p>
                      <p className="text-[10px] text-white/60 truncate">{track.mood}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <VisualizerBars isPlaying={isPlaying} />
                    <span className="text-[11px] font-mono text-white/60">{track.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default QuietpressSection;
