import { useEffect, useMemo, useRef, useState } from 'react';

export function useVitals() {
  const [heartRate, setHeartRate] = useState(72);
  const [blinkRate, setBlinkRate] = useState(14);
  const [focusScore, setFocusScore] = useState(82);
  const [stressLevel, setStressLevel] = useState('Low');
  const [alertStatus, setAlertStatus] = useState('Stable');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [fatigueRisk, setFatigueRisk] = useState('Normal');

  const blinkTimestamps = useRef([]);

  useEffect(() => {
    const heartRateInterval = window.setInterval(() => {
      setHeartRate((previous) =>
        Math.max(60, Math.min(100, previous + Math.floor(Math.random() * 7) - 3))
      );
    }, 3000);

    const blinkInterval = window.setInterval(() => {
      if (Math.random() > 0.4) {
        blinkTimestamps.current.push(Date.now());
        blinkTimestamps.current = blinkTimestamps.current.filter(
          (timestamp) => Date.now() - timestamp < 60000
        );

        const rate = blinkTimestamps.current.length;
        setBlinkRate(rate);
        setFocusScore(Math.max(42, Math.min(98, 92 - rate + Math.floor(Math.random() * 12))));

        if (rate < 8) {
          setFatigueRisk('Alert');
        } else if (rate < 12) {
          setFatigueRisk('Watch');
        } else {
          setFatigueRisk('Normal');
        }
      }
    }, 4000);

    const sessionInterval = window.setInterval(() => {
      setSessionDuration((previous) => previous + 1);
    }, 1000);

    return () => {
      window.clearInterval(heartRateInterval);
      window.clearInterval(blinkInterval);
      window.clearInterval(sessionInterval);
    };
  }, []);

  useEffect(() => {
    if (blinkRate < 8) {
      setStressLevel('High');
      setAlertStatus('Warning');
      return;
    }

    if (blinkRate < 12) {
      setStressLevel('Moderate');
      setAlertStatus('Monitor');
      return;
    }

    setStressLevel('Low');
    setAlertStatus('Stable');
  }, [blinkRate]);

  const sessionHealthScore = useMemo(() => {
    const blinkScore =
      blinkRate >= 12 && blinkRate <= 20
        ? 100
        : blinkRate >= 9 && blinkRate < 12
          ? 78
          : blinkRate >= 6 && blinkRate < 9
            ? 56
            : 34;

    const stressModifier =
      stressLevel === 'Low' ? 100 : stressLevel === 'Moderate' ? 72 : 46;

    return Math.max(
      0,
      Math.min(100, Math.round(focusScore * 0.55 + blinkScore * 0.2 + stressModifier * 0.25))
    );
  }, [blinkRate, focusScore, stressLevel]);

  const formatDuration = useMemo(
    () => (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    },
    []
  );

  return {
    heartRate,
    blinkRate,
    focusScore,
    stressLevel,
    alertStatus,
    sessionDuration,
    fatigueRisk,
    sessionHealthScore,
    formatDuration,
  };
}
