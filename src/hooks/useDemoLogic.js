import { useState, useCallback, useEffect, useRef } from 'react';

export function useDemoLogic({ onQuadrantSelect, onPhraseSelect, onSOSTrigger }) {
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const demoIntervalRef = useRef(null);

  const stopDemo = useCallback(() => {
    setIsDemoRunning(false);
    setDemoStep(0);
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
  }, []);

  const startDemo = useCallback(() => {
    setIsDemoRunning(true);
    setDemoStep(1);
  }, []);

  useEffect(() => {
    if (!isDemoRunning) return;

    // Choreography sequence
    const runChoreography = () => {
      // Step 1: Eye focus on Emergency quadrant
      onQuadrantSelect('Emergency');
      
      // Step 2: Select a phrase
      setTimeout(() => {
        onPhraseSelect('Emergency', 'I need a doctor');
      }, 5000);

      // Step 3: Trigger SOS
      setTimeout(() => {
        onSOSTrigger();
      }, 12000);

      // Step 4: Stop demo
      setTimeout(() => {
        stopDemo();
      }, 26000);
    };

    runChoreography();

    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, [isDemoRunning, onQuadrantSelect, onPhraseSelect, onSOSTrigger, stopDemo]);

  return {
    isDemoRunning,
    demoStep,
    startDemo,
    stopDemo
  };
}
