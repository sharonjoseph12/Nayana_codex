import { useState, useEffect, useCallback, useRef } from 'react';
import { predictNextNeeds } from '../services/gemini';
import { cloudSync } from '../services/cloudSync';

/**
 * Phase 22: Predictive AI Hook
 * Periodically analyzes logs and vitals to suggest the next 3 phrases.
 */
export function usePredictiveAI(clinicalLog, vitals) {
  const [suggestions, setSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastAnalysisRef = useRef(0);

  const runAnalysis = useCallback(async () => {
    // Only analyze if something changed or 5 minutes passed
    const now = Date.now();
    if (now - lastAnalysisRef.current < 5 * 60 * 1000 && clinicalLog.length > 0) return;
    
    setIsAnalyzing(true);
    try {
      const nextNeeds = await predictNextNeeds(clinicalLog, vitals);
      setSuggestions(nextNeeds);
      lastAnalysisRef.current = now;

      // Sync predictions to nursing station
      cloudSync.broadcastState({
        type: 'AI_PREDICTIONS',
        suggestions: nextNeeds
      });
    } catch (err) {
      console.error('Nayana: Predictive AI failure:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [clinicalLog, vitals]);

  // Run on first mount and periodically
  useEffect(() => {
    const timeout = setTimeout(runAnalysis, 2000); // Wait for logs to settle
    const interval = setInterval(runAnalysis, 5 * 60 * 1000); // 5 min cycle
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [runAnalysis]);

  // Also run when a new phrase is intentionally selected
  useEffect(() => {
    if (clinicalLog.length > 0) {
      runAnalysis();
    }
  }, [clinicalLog.length, runAnalysis]);

  return { suggestions, isAnalyzing };
}
