import { useEffect, useMemo, useState } from 'react';
import { EMOTION_IDLE_ALERT_MS } from '../constants/config';

export function useEmotionDetection({ faceDetected, lastInteractionAt }) {
  const [emotion, setEmotion] = useState('Calm');
  const [distressScore, setDistressScore] = useState(18);
  const [idleDuration, setIdleDuration] = useState(0);

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
    }, 3000);

    return () => window.clearInterval(interval);
  }, [faceDetected, lastInteractionAt]);

  const shouldAlert = useMemo(
    () => emotion === 'Distressed' && idleDuration >= EMOTION_IDLE_ALERT_MS,
    [emotion, idleDuration]
  );

  return {
    emotion,
    distressScore,
    idleDuration,
    shouldAlert,
  };
}
