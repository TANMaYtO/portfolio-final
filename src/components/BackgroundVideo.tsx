import React, { useEffect, useRef, useState } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4';

/**
 * Background video component with seamless ping-pong boomerang canvas loop and interactive mouse parallax.
 */
export function BackgroundVideo(): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const currentFrameRef = useRef<number>(0);
  const frameDirectionRef = useRef<number>(1);

  const [useCanvas, setUseCanvas] = useState<boolean>(false);

  const targetXRef = useRef<number>(0);
  const targetYRef = useRef<number>(0);
  const lerpXRef = useRef<number>(0);
  const lerpYRef = useRef<number>(0);
  const rafParallaxIdRef = useRef<number | null>(null);

  // Frame extraction hook
  useEffect(function initFrameCapture(): () => void {
    let isMounted = true;
    const video = videoRef.current;
    if (!video) return () => {};

    let rVfcId: number | null = null;
    let rafId: number | null = null;

    /**
     * Captures current video frame into ImageBitmap array.
     */
    async function captureFrame(): Promise<void> {
      if (!isMounted || !video || framesRef.current.length >= 150) return;

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
     * Ignores video playback error.
     */
    function ignorePlayError(): void {
      // Ignore play errors
    }

    /**
     * Switches to canvas playback when video completes first playthrough.
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
     * Cleans up capture loops and listeners.
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
  }, []);

  // Ping-pong boomerang rendering loop
  useEffect(function initBoomerangLoop(): () => void {
    if (!useCanvas) return () => {};
    let intervalId: ReturnType<typeof setInterval> | null = null;

    /**
     * Renders frames in forward-then-reverse ping-pong sequence.
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

  // Desktop Mouse Parallax Tracking Hook
  useEffect(function initParallaxTracking(): () => void {
    /**
     * Calculates normalized mouse offset from screen center for parallax pan.
     */
    function handleMouseMove(e: MouseEvent): void {
      if (window.innerWidth < 1024) return;
      const offsetX = (e.clientX / window.innerWidth) * 2 - 1;
      const offsetY = (e.clientY / window.innerHeight) * 2 - 1;

      targetXRef.current = offsetX * -25;
      targetYRef.current = offsetY * -15;
    }

    window.addEventListener('mousemove', handleMouseMove);

    /**
     * Removes mouse movement listener on unmount.
     */
    function cleanupMouseMove(): void {
      window.removeEventListener('mousemove', handleMouseMove);
    }

    return cleanupMouseMove;
  }, []);

  // 60fps Spring Lerp Loop for smooth container transformation
  useEffect(function initParallaxLoop(): () => void {
    /**
     * Smoothly interpolates parallax coordinates and applies transform to video wrapper.
     */
    function loop(): void {
      if (window.innerWidth >= 1024 && containerRef.current) {
        const diffX = targetXRef.current - lerpXRef.current;
        const diffY = targetYRef.current - lerpYRef.current;

        if (Math.abs(diffX) > 0.05 || Math.abs(diffY) > 0.05) {
          lerpXRef.current += diffX * 0.12;
          lerpYRef.current += diffY * 0.12;
          containerRef.current.style.transform = `translate3d(${lerpXRef.current.toFixed(2)}px, ${lerpYRef.current.toFixed(2)}px, 0px) scale(1.06)`;
        }
      }
      rafParallaxIdRef.current = requestAnimationFrame(loop);
    }

    rafParallaxIdRef.current = requestAnimationFrame(loop);

    /**
     * Cancels animation frame loop on unmount.
     */
    function cleanupLoop(): void {
      if (rafParallaxIdRef.current) cancelAnimationFrame(rafParallaxIdRef.current);
    }

    return cleanupLoop;
  }, []);

  return (
    <div className="order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-neutral-50 lg:bg-transparent">
      <div
        ref={containerRef}
        className="relative w-full h-full transition-transform duration-75 ease-out will-change-transform"
        style={{ transform: 'scale(1.06)' }}
      >
        {/* Fallback Extraction Video */}
        <video
          ref={videoRef}
          src={VIDEO_URL}
          muted
          playsInline
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover object-right lg:object-right-bottom transition-opacity duration-500 ${
            useCanvas ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Boomerang Canvas */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover object-right lg:object-right-bottom transition-opacity duration-500 ${
            useCanvas ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </div>
  );
}
