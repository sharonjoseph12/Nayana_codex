import { useState, useRef, useCallback } from 'react';

export function useDwellTimer(onTrigger, dwellTimeMs = 800) {
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  const startDwell = useCallback(() => {
    setIsHovering(true);
    setProgress(0);
    startTimeRef.current = performance.now();

    const animate = (time) => {
      const elapsed = time - startTimeRef.current;
      const currentProgress = Math.min((elapsed / dwellTimeMs) * 100, 100);
      setProgress(currentProgress);

      if (elapsed < dwellTimeMs) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setProgress(100);
        onTrigger();
        setIsHovering(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [onTrigger, dwellTimeMs]);

  const cancelDwell = useCallback(() => {
    setIsHovering(false);
    setProgress(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  return {
    progress,
    isHovering,
    startDwell,
    cancelDwell
  };
}
