import { useEffect, useMemo, useState, useCallback } from 'react';
import { EMOTION_IDLE_ALERT_MS } from '../constants/config';

/**
 * Phase 24: Enhanced Emotion Detection with Sentiment Journey
 * Tracks long-term emotional patterns of the patient.
 */
export function useEmotionDetection({ faceDetected, lastInteractionAt }) {
  const [emotion, setEmotion] = useState('Calm');
  const [distressScore, setDistressScore] = useState(18);
  const [idleDuration, setIdleDuration] = useState(0);
  const [emotionHistory, setEmotionHistory] = useState([]); // Array of { emotion, timestamp }

  useEffect(() => {
    const interval = window.setInterval(() => {
      const idle = lastInteractionAt ? Date.now() - lastInteractionAt : 0;
      setIdleDuration(idle);

      const nextEmotion =
        !faceDetected
          ? 'Unavailable'
          : idle > EMOTION_IDLE_ALERT_MS
            ? 'Distressed'
            : idle > 25000
              ? 'Strained'
              : 'Calm';

      setEmotion(nextEmotion);
      setDistressScore(
        nextEmotion === 'Distressed' ? 82 : nextEmotion === 'Strained' ? 52 : faceDetected ? 18 : 0
      );

      // Periodically add to history (every 10 seconds for journey)
      setEmotionHistory(prev => {
        const lastEntry = prev[prev.length - 1];
        // Only add if emotion changed or 5 minutes passed since last history entry
        const now = Date.now();
        if (lastEntry && lastEntry.emotion === nextEmotion && (now - lastEntry.timestamp < 300000)) {
           return prev;
        }
        return [...prev, { emotion: nextEmotion, timestamp: now }].slice(-50);
      });
    }, 10000); // 10s sampling for journey fidelity

    return () => window.clearInterval(interval);
  }, [faceDetected, lastInteractionAt]);

  const shouldAlert = useMemo(
    () => emotion === 'Distressed' && idleDuration >= EMOTION_IDLE_ALERT_MS,
    [emotion, idleDuration]
  );

  /**
   * Calculates the weighted clinical stability pulse based on emotional history
   */
  const stabilityIndex = useMemo(() => {
    if (emotionHistory.length === 0) return 100;
    const distressedPoints = emotionHistory.filter(h => h.emotion === 'Distressed' || h.emotion === 'Strained').length;
    return Math.max(0, 100 - (distressedPoints / emotionHistory.length) * 100);
  }, [emotionHistory]);

  return {
    emotion,
    distressScore,
    idleDuration,
    shouldAlert,
    emotionHistory,
    stabilityIndex
  };
}
