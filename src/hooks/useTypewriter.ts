import { useEffect, useState } from 'react';

interface TypewriterResult {
  displayed: string;
  done: boolean;
}

/**
 * Custom React hook that builds a string slice by slice using setTimeout and setInterval.
 */
export function useTypewriter(
  text: string,
  speed: number = 38,
  startDelay: number = 600
): TypewriterResult {
  const [displayed, setDisplayed] = useState<string>('');
  const [done, setDone] = useState<boolean>(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timeoutId = setTimeout(() => {
      let currentIndex = 1;
      setDisplayed(text.slice(0, 1));

      intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          currentIndex += 1;
          setDisplayed(text.slice(0, currentIndex));
        } else {
          setDone(true);
          if (intervalId) clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}
