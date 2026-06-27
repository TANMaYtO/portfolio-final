import React, { useEffect, useRef, useState } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4';

/**
 * Background video component with RAM Blob preloading and 60fps multi-axis timeline scrubbing.
 */
export function BackgroundVideo(): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>(VIDEO_URL);
  const targetTimeRef = useRef<number>(0);
  const lerpTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Fetch video into RAM Blob URL for instantaneous zero-stutter 60fps scrubbing
  useEffect(() => {
    let isMounted = true;
    fetch(VIDEO_URL)
      .then((res) => res.blob())
      .then((blob) => {
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setVideoSrc(url);
        }
      })
      .catch(() => {
        // Fallback to CloudFront URL if fetch fails
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Desktop Mouse Scrubbing Hook (Combining horizontal and vertical cursor progression)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (window.innerWidth < 1024 || !videoRef.current) return;
      const video = videoRef.current;
      if (isNaN(video.duration) || video.duration === 0) return;

      // Map horizontal (75% weight) and vertical (25% weight) cursor position to timeline progress
      const progressX = e.clientX / window.innerWidth;
      const progressY = e.clientY / window.innerHeight;
      const combinedProgress = Math.min(1, Math.max(0, progressX * 0.75 + progressY * 0.25));

      const nextTarget = combinedProgress * video.duration;
      targetTimeRef.current = nextTarget;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 60fps RequestAnimationFrame Lerp Loop for fluid human figure tracking
  useEffect(() => {
    const loop = (): void => {
      if (window.innerWidth >= 1024 && videoRef.current) {
        const video = videoRef.current;
        if (!isNaN(video.duration) && video.duration > 0) {
          const diff = targetTimeRef.current - lerpTimeRef.current;
          if (Math.abs(diff) > 0.002) {
            lerpTimeRef.current += diff * 0.22; // Smooth spring damping factor
            video.currentTime = lerpTimeRef.current;
          }
        }
      }
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Mobile Autoplay Hook
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleResizeOrLoad = (): void => {
      if (window.innerWidth < 1024) {
        video.autoplay = true;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    handleResizeOrLoad();
    window.addEventListener('resize', handleResizeOrLoad);
    return () => window.removeEventListener('resize', handleResizeOrLoad);
  }, [videoSrc]);

  return (
    <div className="order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-neutral-50 lg:bg-transparent">
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover object-right lg:object-right-bottom"
      />
    </div>
  );
}
