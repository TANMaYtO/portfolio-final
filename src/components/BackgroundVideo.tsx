import React, { useEffect, useRef, useState } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4';

/**
 * Background video component with RAM Blob preloading and zero-stutter canvas frame bitmap scrubbing.
 */
export function BackgroundVideo(): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<ImageBitmap[]>([]);

  const [videoSrc, setVideoSrc] = useState<string>(VIDEO_URL);
  const [useCanvas, setUseCanvas] = useState<boolean>(false);

  const targetProgressRef = useRef<number>(0);
  const lerpProgressRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Fetch video into RAM Blob URL
  useEffect(function initBlobFetch(): () => void {
    let isMounted = true;

    /**
     * Handles fetch response and extracts Blob.
     */
    function handleResponse(res: Response): Promise<Blob> {
      return res.blob();
    }

    /**
     * Creates Object URL from Blob and updates state.
     */
    function handleBlob(blob: Blob): void {
      if (isMounted) {
        setVideoSrc(URL.createObjectURL(blob));
      }
    }

    /**
     * Ignores fetch error to use default URL fallback.
     */
    function handleError(): void {
      // Fallback to CloudFront URL if fetch fails
    }

    fetch(VIDEO_URL)
      .then(handleResponse)
      .then(handleBlob)
      .catch(handleError);

    /**
     * Cleanup function on unmount.
     */
    function cleanupFetch(): void {
      isMounted = false;
    }

    return cleanupFetch;
  }, []);

  // Frame extraction hook
  useEffect(function initFrameExtraction(): () => void {
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

        if (canvasRef.current && (canvasRef.current.width !== targetW || canvasRef.current.height !== targetH)) {
          canvasRef.current.width = targetW;
          canvasRef.current.height = targetH;
        }

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
     * Ignores video play restriction errors.
     */
    function ignorePlayError(): void {
      // Ignore autoplay errors
    }

    /**
     * When video ends or loops, check if enough frames were captured.
     */
    function handleLoopOrEnd(): void {
      if (!isMounted || !video) return;
      if (framesRef.current.length >= 25) {
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

  // Desktop Mouse Scrubbing Hook
  useEffect(function initMouseScrubbing(): () => void {
    /**
     * Handles mouse movement and maps coordinates to scrubbing progress.
     */
    function handleMouseMove(e: MouseEvent): void {
      if (window.innerWidth < 1024) return;
      const progressX = e.clientX / window.innerWidth;
      const progressY = e.clientY / window.innerHeight;
      const combinedProgress = Math.min(1, Math.max(0, progressX * 0.75 + progressY * 0.25));
      targetProgressRef.current = combinedProgress;
    }

    window.addEventListener('mousemove', handleMouseMove);

    /**
     * Cleans up mouse movement listener.
     */
    function cleanupMouseMove(): void {
      window.removeEventListener('mousemove', handleMouseMove);
    }

    return cleanupMouseMove;
  }, []);

  // 60fps RequestAnimationFrame Lerp Loop
  useEffect(function initRenderLoop(): () => void {
    /**
     * Main rendering loop interpolating progress and drawing frames.
     */
    function loop(): void {
      if (window.innerWidth >= 1024) {
        const diff = targetProgressRef.current - lerpProgressRef.current;
        if (Math.abs(diff) > 0.001) {
          lerpProgressRef.current += diff * 0.22;
        }

        if (useCanvas && framesRef.current.length > 0 && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          const frameIdx = Math.min(
            framesRef.current.length - 1,
            Math.max(0, Math.floor(lerpProgressRef.current * framesRef.current.length))
          );
          const bmp = framesRef.current[frameIdx];
          if (ctx && bmp) {
            ctx.drawImage(bmp, 0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        } else if (!useCanvas && videoRef.current) {
          const video = videoRef.current;
          if (!isNaN(video.duration) && video.duration > 0) {
            video.currentTime = lerpProgressRef.current * video.duration;
          }
        }
      }
      rafIdRef.current = requestAnimationFrame(loop);
    }

    rafIdRef.current = requestAnimationFrame(loop);

    /**
     * Cancels requestAnimationFrame loop on unmount.
     */
    function cleanupLoop(): void {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    }

    return cleanupLoop;
  }, [useCanvas]);

  // Mobile Autoplay Hook
  useEffect(function initMobileAutoplay(): () => void {
    const video = videoRef.current;
    if (!video) return () => {};

    /**
     * Ignores mobile autoplay restriction errors.
     */
    function ignorePlayError(): void {
      // Ignore mobile autoplay errors
    }

    /**
     * Adjusts playback state based on window width.
     */
    function handleResizeOrLoad(): void {
      if (!video) return;
      if (window.innerWidth < 1024) {
        video.autoplay = true;
        video.play().catch(ignorePlayError);
      } else if (!useCanvas) {
        video.pause();
      }
    }

    handleResizeOrLoad();
    window.addEventListener('resize', handleResizeOrLoad);

    /**
     * Removes resize listener on unmount.
     */
    function cleanupResize(): void {
      window.removeEventListener('resize', handleResizeOrLoad);
    }

    return cleanupResize;
  }, [videoSrc, useCanvas]);

  return (
    <div className="order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-neutral-50 lg:bg-transparent">
      {/* Fallback / Extraction Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        className={`w-full h-full object-cover object-right lg:object-right-bottom transition-opacity duration-300 ${
          useCanvas ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Scrubbing Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover object-right lg:object-right-bottom transition-opacity duration-300 ${
          useCanvas ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
