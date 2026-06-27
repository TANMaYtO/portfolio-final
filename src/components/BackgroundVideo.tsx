import React, { useEffect, useRef } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4';

/**
 * Background video component with hardware-accelerated looping and interactive mouse parallax.
 */
export function BackgroundVideo(): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetXRef = useRef<number>(0);
  const targetYRef = useRef<number>(0);
  const lerpXRef = useRef<number>(0);
  const lerpYRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Desktop Mouse Parallax Tracking Hook
  useEffect(function initParallaxTracking(): () => void {
    /**
     * Calculates normalized mouse offset from screen center for parallax pan.
     */
    function handleMouseMove(e: MouseEvent): void {
      if (window.innerWidth < 1024) return;
      // Range from -1 to 1 based on distance from center
      const offsetX = (e.clientX / window.innerWidth) * 2 - 1;
      const offsetY = (e.clientY / window.innerHeight) * 2 - 1;

      // Maximum translation in pixels
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
          lerpXRef.current += diffX * 0.12; // Smooth spring damping
          lerpYRef.current += diffY * 0.12;
          containerRef.current.style.transform = `translate3d(${lerpXRef.current.toFixed(2)}px, ${lerpYRef.current.toFixed(2)}px, 0px) scale(1.06)`;
        }
      }
      rafIdRef.current = requestAnimationFrame(loop);
    }

    rafIdRef.current = requestAnimationFrame(loop);

    /**
     * Cancels animation frame loop on unmount.
     */
    function cleanupLoop(): void {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    }

    return cleanupLoop;
  }, []);

  return (
    <div className="order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-neutral-50 lg:bg-transparent">
      <div
        ref={containerRef}
        className="w-full h-full transition-transform duration-75 ease-out will-change-transform"
        style={{ transform: 'scale(1.06)' }}
      >
        <video
          src={VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-right lg:object-right-bottom"
        />
      </div>
    </div>
  );
}
