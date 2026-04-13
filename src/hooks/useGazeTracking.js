import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Phase 27: Hardware Sentinel & Signal Fidelity Tracking
 */
export function useGazeTracking({ onQuadrantSelect, onPhraseSelect, onSOSTrigger, dwellTimeOverride }) {
  const [trackingMode, setTrackingMode] = useState('mouse'); // 'mouse' | 'eye'
  const [gazePosition, setGazePosition] = useState({ x: 0, y: 0 });
  const [headPosition, setHeadPosition] = useState({ x: 0, y: 0, z: 0 });
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [gazeAccuracy, setGazeAccuracy] = useState(100);
  const [signalQuality, setSignalQuality] = useState(100); // 0-100%
  const [fps, setFps] = useState(0);
  
  const [dwellingOn, setDwellingOn] = useState(null);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gazeTrail, setGazeTrail] = useState([]);

  const elementsRef = useRef({});
  const smoothedGazeRef = useRef({ x: 0, y: 0 });
  const dwellTimerRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());
  const rawGazeHistoryRef = useRef([]); // Last 12 raw samples for Ultra-Precision WMA window

  const JITTER_THRESHOLD = 12; // pixels - ultra-heavy stillness zone
  const VELOCITY_CLAMP = 40;   // pixels per frame - prevents jumping artifacts
  const ALPHA_MIN = 0.04;    // Liquid smoothness floor
  const ALPHA_MAX = 0.75;    // High responsiveness for large jumps
  const ALPHA_MOUSE = 0.85;  // Higher responsiveness for mouse simulation

  // FPS & Quality Tracking
  const updateFidelity = useCallback((confidence) => {
    frameCountRef.current++;
    const now = Date.now();
    if (now - lastFpsUpdateRef.current >= 1000) {
       setFps(Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current)));
       frameCountRef.current = 0;
       lastFpsUpdateRef.current = now;
    }
    
    // Smooth signal quality decay
    setSignalQuality(prev => {
       const target = confidence * 100;
       return prev * 0.9 + target * 0.1;
    });
  }, []);

  const registerElement = useCallback((id, type, bounds) => {
    elementsRef.current[id] = { id, type, bounds: bounds || null };
  }, []);

  const handleIrisUpdate = useCallback((data) => {
    if (!data) {
      setFaceDetected(false);
      setGazeTrail([]); // Clear trail on signal loss
      updateFidelity(0);
      return;
    }

    setFaceDetected(true);
    setHeadPosition(data.head || { x: 0, y: 0, z: 0 });
    setGazeAccuracy(data.accuracy || 100);
    updateFidelity(data.confidence || 0.95);

    // --- Phase 45: Ultra-Precision Weighted Moving Average (12-frame window) ---
    if (!data.gaze) return; // Guard against missing iris data
    rawGazeHistoryRef.current = [{ x: data.gaze.x, y: data.gaze.y }, ...rawGazeHistoryRef.current.slice(0, 11)];
    
    let weightSum = 0;
    const wma = rawGazeHistoryRef.current.reduce((acc, p, i) => {
      const weight = rawGazeHistoryRef.current.length - i;
      weightSum += weight;
      return { x: acc.x + p.x * weight, y: acc.y + p.y * weight };
    }, { x: 0, y: 0 });
    
    let rawX = wma.x / weightSum;
    let rawY = wma.y / weightSum;
    
    const prev = smoothedGazeRef.current;
    
    // --- Phase 46: Velocity Clamping ---
    // Prevents "jumping" when the vision sensor loses track momentarily
    const deltaX = rawX - prev.x;
    const deltaY = rawY - prev.y;
    const rawDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (rawDist > VELOCITY_CLAMP) {
      const scale = VELOCITY_CLAMP / rawDist;
      rawX = prev.x + deltaX * scale;
      rawY = prev.y + deltaY * scale;
    }
    
    const dist = Math.sqrt(Math.pow(rawX - prev.x, 2) + Math.pow(rawY - prev.y, 2));
    let nextX = prev.x;
    let nextY = prev.y;

    if (dist > JITTER_THRESHOLD) {
      // Quadratic Acceleration: (dist/400)^2 provides massive speed for jumps, stability for selection.
      // Dwell-Aware Lock: Dropping alpha to 0.03 when dwelling on an element for rigid stability.
      const baseAlpha = dwellingOn ? 0.03 : (ALPHA_MIN + Math.pow(dist / 400, 2));
      
      const adaptiveAlpha = trackingMode === 'mouse' 
        ? ALPHA_MOUSE 
        : Math.min(ALPHA_MAX, baseAlpha * (data.confidence || 0.95));
      
      nextX = prev.x * (1 - adaptiveAlpha) + rawX * adaptiveAlpha;
      nextY = prev.y * (1 - adaptiveAlpha) + rawY * adaptiveAlpha;
    }

    smoothedGazeRef.current = { x: nextX, y: nextY };
    setGazePosition({ x: nextX, y: nextY });

    // Gaze Trail - Only add if position is non-zero
    if (nextX !== 0 && nextY !== 0) {
      setGazeTrail((prevTrail) => [{ x: nextX, y: nextY, id: performance.now() + Math.random() }, ...prevTrail.slice(0, 15)]);
    }

    const hovered = Object.values(elementsRef.current).find((el) => {
      const domEl = document.getElementById(el.id);
      if (!domEl) return false;
      const rect = domEl.getBoundingClientRect();
      return (
        nextX >= rect.left &&
        nextX <= rect.right &&
        nextY >= rect.top &&
        nextY <= rect.bottom
      );
    });

    if (hovered?.id !== dwellingOn) {
      setDwellingOn(hovered?.id || null);
      setDwellProgress(0);
      if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);

      if (hovered) {
        const startTime = Date.now();
        const duration = dwellTimeOverride || 1800;
        dwellTimerRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(100, (elapsed / duration) * 100);
          setDwellProgress(progress);

          if (elapsed >= duration) {
            clearInterval(dwellTimerRef.current);
            if (hovered.type === 'quadrant') onQuadrantSelect(hovered.id.replace('quadrant-', ''));
            if (hovered.type === 'phrase') {
               const parts = hovered.id.split('-');
               onPhraseSelect(parts[1], parts[2]);
            }
            if (hovered.id === 'sos-anchor-btn') onSOSTrigger();
            
            // Generic click for buttons
            const domEl = document.getElementById(hovered.id);
            if (domEl) domEl.click();
            
            setDwellProgress(0);
            setDwellingOn(null);
          }
        }, 50);
      }
    }
  }, [dwellingOn, dwellTimeOverride, onPhraseSelect, onQuadrantSelect, onSOSTrigger, updateFidelity]);

  const startEyeTracking = useCallback(() => {
    setTrackingMode('eye');
    setIsCalibrated(false);
  }, []);

  const stopEyeTracking = useCallback(() => {
    setTrackingMode('mouse');
    setIsCalibrated(false);
    smoothedGazeRef.current = { x: 0, y: 0 }; // Reset stabilizer
    setGazeTrail([]);
  }, []);

  // Phase 45: Mouse Simulation Bridge
  useEffect(() => {
    if (trackingMode !== 'mouse') return;

    const handleMouseMove = (e) => {
      handleIrisUpdate({
        gaze: { x: e.clientX, y: e.clientY },
        head: { x: 0, y: 0, z: 0 },
        accuracy: 100,
        confidence: 1.0,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [trackingMode, handleIrisUpdate]);

  return {
    trackingMode,
    gazePosition,
    headPosition,
    dwellingOn,
    dwellProgress,
    gazeAccuracy,
    signalQuality,
    fps,
    gazeTrail,
    faceDetected,
    isCalibrated,
    isLocked,
    setIsCalibrated,
    handleIrisUpdate,
    registerElement,
    startEyeTracking,
    stopEyeTracking,
    setTrackingMode,
  };
}
