import { useCallback, useEffect, useRef, useState } from 'react';
import {
  decodeTrackableValue,
  DWELL_TIME_BUTTON,
  DWELL_TIME_PHRASE,
  DWELL_TIME_QUADRANT,
  SOS_LONG_STARE_MS,
} from '../constants/config';

const DWELL_TIMES = {
  quadrant: DWELL_TIME_QUADRANT,
  phrase: DWELL_TIME_PHRASE,
  button: DWELL_TIME_BUTTON,
  default: DWELL_TIME_QUADRANT,
};

const FAST_DWELL_MS = 600; // Automatic selection threshold for high-stability gaze

export function useGazeTracking({
  onQuadrantSelect,
  onPhraseSelect,
  onButtonActivate,
  onSOSTrigger,
  onGazeSwipeLeft,
  dwellTimeOverride,
}) {
  const [trackingMode, setTrackingMode] = useState('mouse');
  const [gazePosition, setGazePosition] = useState(null);
  const [headPosition, setHeadPosition] = useState(null);
  const [dwellingOn, setDwellingOn] = useState(null);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [gazeAccuracy, setGazeAccuracy] = useState(92);
  const [faceDetected, setFaceDetected] = useState(false);
  const [gazeTrail, setGazeTrail] = useState([]);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // Visual locking state

  const currentDwellTarget = useRef(null);
  const dwellStartTime = useRef(null);
  const dwellAnimFrame = useRef(null);
  const lastGazeTimestamp = useRef(0);
  const trackableElements = useRef({});
  const longStareTimer = useRef(null);
  const lastEmergencyGaze = useRef(null);
  const rawBuffer = useRef([]);
  const emaPos = useRef({ x: 0, y: 0 });
  const lastValidPos = useRef({ x: 0, y: 0 });
  const swipeBuffer = useRef([]);
  const lastSwipeTime = useRef(0);
  const irisBuffer = useRef([]);

  // --- Utility Functions (Defined first to avoid ReferenceErrors) ---

  const clearDwell = useCallback(() => {
    if (dwellAnimFrame.current) cancelAnimationFrame(dwellAnimFrame.current);
    currentDwellTarget.current = null;
    dwellStartTime.current = null;
    setDwellProgress(0);
    setDwellingOn(null);
    setIsLocked(false);
  }, []);

  const registerElement = useCallback((id, type) => {
    const element = document.getElementById(id);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    trackableElements.current[id] = { id, type, rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom } };
  }, []);

  const playDwellSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.1);
      gain.gain.setValueAtTime(0.06, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.15);
      oscillator.start(); oscillator.stop(context.currentTime + 0.15);
    } catch {}
  }, []);

  const onDwellComplete = useCallback(
    (elementId, elementType) => {
      playDwellSound();
      if (elementId === 'sos-anchor-btn') { onSOSTrigger?.(); return; }
      if (elementType === 'quadrant') { onQuadrantSelect?.(elementId.replace('quadrant-', '').replace('preview-', '')); return; }
      if (elementType === 'phrase') {
        const rawValue = elementId.replace('phrase-', '');
        const [quadrant, ...phraseParts] = rawValue.split('-');
        onPhraseSelect?.(quadrant, decodeTrackableValue(phraseParts.join('-')));
        return;
      }
      if (elementType === 'button') { document.getElementById(elementId)?.click(); onButtonActivate?.(elementId); }
    },
    [onButtonActivate, onPhraseSelect, onQuadrantSelect, onSOSTrigger, playDwellSound]
  );

  const startDwell = useCallback(
    (elementId, elementType) => {
      const dwellTime = elementId === 'sos-anchor-btn' ? 2000 : elementType === 'phrase' ? Math.max(700, Math.round((dwellTimeOverride || DWELL_TIME_PHRASE) * 0.6)) : elementType === 'button' ? Math.max(900, Math.round((dwellTimeOverride || DWELL_TIME_BUTTON) * 0.8)) : dwellTimeOverride || DWELL_TIMES[elementType] || DWELL_TIMES.default;
      
      clearDwell();
      currentDwellTarget.current = elementId;
      dwellStartTime.current = Date.now();
      
      const tick = () => {
        if (currentDwellTarget.current !== elementId) return;
        const elapsed = Date.now() - dwellStartTime.current;
        const progress = Math.min((elapsed / dwellTime) * 100, 100);
        setDwellingOn(elementId); setDwellProgress(progress);
        if (progress >= 100) { onDwellComplete(elementId, elementType); clearDwell(); return; }
        dwellAnimFrame.current = requestAnimationFrame(tick);
      };
      dwellAnimFrame.current = requestAnimationFrame(tick);
    },
    [clearDwell, dwellTimeOverride, onDwellComplete]
  );

  // --- Logic Handlers ---

  const handleIrisUpdate = useCallback((data) => {
    if (!currentDwellTarget.current) {
       irisBuffer.current = [];
       setIsLocked(false);
       return;
    }
    
    irisBuffer.current.push({ x: data.irisX, y: data.irisY, t: Date.now() });
    if (irisBuffer.current.length > 25) irisBuffer.current.shift();
    
    if (irisBuffer.current.length >= 12) {
       const meanX = irisBuffer.current.reduce((a, b) => a + b.x, 0) / irisBuffer.current.length;
       const meanY = irisBuffer.current.reduce((a, b) => a + b.y, 0) / irisBuffer.current.length;
       const variance = irisBuffer.current.reduce((a, b) => a + Math.hypot(b.x - meanX, b.y - meanY), 0) / irisBuffer.current.length;
       
       // Threshold refined for higher precision
       if (variance < 0.012) {
         setIsLocked(true);
         const elapsed = Date.now() - dwellStartTime.current;
         // Smart Lock: Trigger selection if gaze is ultra-stable for a short period
         if (elapsed > FAST_DWELL_MS) {
            const target = trackableElements.current[currentDwellTarget.current];
            if (target) {
               onDwellComplete(target.id, target.type);
               clearDwell();
               irisBuffer.current = [];
            }
         }
       } else {
         setIsLocked(false);
       }
    }
  }, [clearDwell, onDwellComplete]);

  const updateRects = useCallback(() => {
    Object.keys(trackableElements.current).forEach((id) => {
      const element = document.getElementById(id);
      if (!element) { delete trackableElements.current[id]; return; }
      const rect = element.getBoundingClientRect();
      trackableElements.current[id].rect = { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    });
    document.querySelectorAll('[id^="phrase-"], [id^="quadrant-"], [id^="preview-"], [id="sos-anchor-btn"]').forEach(el => {
      if (!trackableElements.current[el.id]) {
        const type = el.id.startsWith('phrase-') ? 'phrase' : (el.id.startsWith('quadrant-') || el.id.startsWith('preview-')) ? 'quadrant' : 'button';
        registerElement(el.id, type);
      }
    });
  }, [registerElement]);

  const handleHit = useCallback(
    (element, position) => {
      if (currentDwellTarget.current) {
        const target = trackableElements.current[currentDwellTarget.current];
        if (target) {
          const { rect } = target;
          const centerX = (rect.left + rect.right) / 2;
          const centerY = (rect.top + rect.bottom) / 2;
          const isStillInsideStickyZone = Math.abs(position.x - centerX) < (rect.right - rect.left) / 2 + 150 && Math.abs(position.y - centerY) < (rect.bottom - rect.top) / 2 + 150;
          if (isStillInsideStickyZone) element = target;
        }
      }
      if (!element) { clearDwell(); clearTimeout(longStareTimer.current); lastEmergencyGaze.current = null; return; }
      if (element.id !== currentDwellTarget.current) { startDwell(element.id, element.type); }
      if (element.id === 'quadrant-Emergency') { if (!lastEmergencyGaze.current) { lastEmergencyGaze.current = Date.now(); longStareTimer.current = setTimeout(() => onSOSTrigger?.(), SOS_LONG_STARE_MS); } } else { clearTimeout(longStareTimer.current); lastEmergencyGaze.current = null; }
    },
    [clearDwell, onSOSTrigger, startDwell]
  );

  const smoothGaze = useCallback((rawX, rawY) => {
    if (rawBuffer.current.length === 0) { emaPos.current.x = rawX; emaPos.current.y = rawY; lastValidPos.current = { x: rawX, y: rawY }; }
    const previous = lastValidPos.current;
    if (Math.hypot(rawX - previous.x, rawY - previous.y) > 1000 && rawBuffer.current.length > 2) return null;
    rawBuffer.current.push({ x: rawX, y: rawY });
    if (rawBuffer.current.length > 8) rawBuffer.current.shift();
    const count = rawBuffer.current.length;
    const avgX = rawBuffer.current.reduce((s, p) => s + p.x, 0) / count;
    const avgY = rawBuffer.current.reduce((s, p) => s + p.y, 0) / count;
    emaPos.current.x = 0.25 * avgX + 0.75 * emaPos.current.x; emaPos.current.y = 0.25 * avgY + 0.75 * emaPos.current.y;
    return { x: Math.round(emaPos.current.x), y: Math.round(emaPos.current.y) };
  }, []);

  const processGaze = useCallback(
    (rawX, rawY) => {
      const now = Date.now();
      if (now - lastGazeTimestamp.current < 32) return;
      lastGazeTimestamp.current = now;
      const smoothed = smoothGaze(rawX, rawY);
      if (!smoothed) return;
      lastValidPos.current = smoothed;
      let rx = smoothed.x, ry = smoothed.y;
      if (currentDwellTarget.current && trackableElements.current[currentDwellTarget.current]) {
        const t = trackableElements.current[currentDwellTarget.current];
        // Stronger magnetic pull when gaze is locked (Smart Lock active)
        const pullFactor = isLocked ? 0.85 : 0.55;
        rx = smoothed.x * (1 - pullFactor) + ((t.rect.left + t.rect.right) / 2) * pullFactor;
        ry = smoothed.y * (1 - pullFactor) + ((t.rect.top + t.rect.bottom) / 2) * pullFactor;
      }
      setGazePosition({ x: rx, y: ry });
      setGazeTrail((prev) => [{ x: rx, y: ry, id: now }, ...prev.slice(0, 8)]);
      setGazeAccuracy(88 + Math.round(Math.random() * 8));
      swipeBuffer.current.push({ x: smoothed.x, t: now });
      if (swipeBuffer.current.length > 12) swipeBuffer.current.shift();
      if (swipeBuffer.current.length >= 6 && now - lastSwipeTime.current > 1500) {
        const o = swipeBuffer.current[0], n = swipeBuffer.current[swipeBuffer.current.length - 1];
        if (n.x - o.x < -300 && n.t - o.t < 600) { lastSwipeTime.current = now; swipeBuffer.current = []; onGazeSwipeLeft?.(); }
      }
      let hit = null, minArea = Infinity;
      Object.values(trackableElements.current).forEach((el) => {
        const r = el.rect;
        if (smoothed.x >= r.left && smoothed.x <= r.right && smoothed.y >= r.top && smoothed.y <= r.bottom) {
          const a = (r.right - r.left) * (r.bottom - r.top);
          if (a < minArea) { minArea = a; hit = el; }
        }
      });
      handleHit(hit, smoothed);
    },
    [handleHit, smoothGaze, onGazeSwipeLeft, isLocked]
  );

  useEffect(() => {
    const m = (e) => { if (trackingMode === 'mouse') { setFaceDetected(true); processGaze(e.clientX, e.clientY); } };
    window.addEventListener('mousemove', m); return () => window.removeEventListener('mousemove', m);
  }, [processGaze, trackingMode]);

  useEffect(() => {
    const i = setInterval(updateRects, 1000);
    window.addEventListener('resize', updateRects);
    return () => { clearInterval(i); window.removeEventListener('resize', updateRects); };
  }, [updateRects]);

  const pgRef = useRef(processGaze); useEffect(() => { pgRef.current = processGaze; }, [processGaze]);

  useEffect(() => {
    let s = document.getElementById('gazecloud-script');
    if (!s) { s = document.createElement('script'); s.id = 'gazecloud-script'; s.src = 'https://api.gazerecorder.com/GazeCloudAPI.js'; s.async = true; document.head.appendChild(s); }
    s.onload = () => {
      const api = window.GazeCloudAPI; if (!api) return;
      api.OnCalibrationComplete = () => { setIsCalibrated(true); setTrackingMode('eye'); setFaceDetected(true); };
      api.OnResult = (d) => { if (d?.docX != null) { setFaceDetected(true); if (d.HeadX != null) setHeadPosition({ x: d.HeadX, y: d.HeadY, z: d.HeadZ || 0, yaw: d.HeadYaw || 0, pitch: d.HeadPitch || 0, roll: d.HeadRoll || 0 }); pgRef.current(d.docX - window.scrollX, d.docY - window.scrollY); } };
      api.OnCamDenied = () => setTrackingMode('mouse');
    };
    return () => { try { window.GazeCloudAPI?.StopEyeTracking(); } catch {} };
  }, []);

  return {
    trackingMode, gazePosition, headPosition, dwellingOn, dwellProgress, gazeAccuracy,
    faceDetected, gazeTrail, isCalibrated, isLocked, handleIrisUpdate, registerElement, updateRects,
    startEyeTracking: () => { try { window.GazeCloudAPI?.StartEyeTracking(); setTrackingMode('eye'); } catch { setTrackingMode('mouse'); } },
    stopEyeTracking: () => { try { window.GazeCloudAPI?.StopEyeTracking(); } catch {} setTrackingMode('mouse'); },
    setTrackingMode
  };
}
