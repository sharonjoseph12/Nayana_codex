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
  const dwellTimerRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());

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
      updateFidelity(0);
      return;
    }

    setFaceDetected(true);
    setGazePosition(data.gaze);
    setHeadPosition(data.head);
    setGazeAccuracy(data.accuracy);
    updateFidelity(data.confidence || 0.95);

    // Gaze Trail
    setGazeTrail((prev) => [{ ...data.gaze, id: Date.now() }, ...prev.slice(0, 15)]);

    const hovered = Object.values(elementsRef.current).find((el) => {
      const domEl = document.getElementById(el.id);
      if (!domEl) return false;
      const rect = domEl.getBoundingClientRect();
      return (
        data.gaze.x >= rect.left &&
        data.gaze.x <= rect.right &&
        data.gaze.y >= rect.top &&
        data.gaze.y <= rect.bottom
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
  }, []);

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
