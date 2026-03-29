import { useCallback, useEffect, useRef, useState } from 'react';
import { PATIENT } from '../constants/config';
import { generateRiskAssessment } from '../services/gemini';
import { buildRiskMessage, sendWhatsAppAlert } from '../services/whatsapp';

export function useClinicalAI(clinicalLog) {
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('STABLE');
  const [riskReasoning, setRiskReasoning] = useState('No escalation indicators detected.');
  const [riskRecommendation, setRiskRecommendation] = useState('Continue standard monitoring.');
  const [riskHistory, setRiskHistory] = useState([
    {
      score: 0,
      level: 'STABLE',
      timestamp: Date.now(),
    },
  ]);
  const [lastAssessment, setLastAssessment] = useState(null);

  const lastEscalationLevel = useRef('STABLE');

  const analyzePatterns = useCallback(() => {
    const now = Date.now();
    const last2Hours = clinicalLog.filter(
      (entry) => now - new Date(entry.timestamp).getTime() < 2 * 60 * 60 * 1000
    );
    const last30Minutes = clinicalLog.filter(
      (entry) => now - new Date(entry.timestamp).getTime() < 30 * 60 * 1000
    );
    const previous30Minutes = clinicalLog.filter((entry) => {
      const age = now - new Date(entry.timestamp).getTime();
      return age >= 30 * 60 * 1000 && age < 60 * 60 * 1000;
    });

    return {
      repeatedPain: last2Hours.filter((entry) => entry.category === 'PAIN').length,
      respiratoryCount: last2Hours.filter((entry) => entry.category === 'RESPIRATORY').length,
      criticalCount: last2Hours.filter((entry) => entry.severity >= 4).length,
      distressCount: last2Hours.filter((entry) => entry.category === 'DISTRESS_SIGNAL').length,
      recentFrequency: last30Minutes.length,
      previousFrequency: previous30Minutes.length,
      acceleration: last30Minutes.length > previous30Minutes.length * 1.5,
      recentEntries:
        last2Hours
          .slice(-10)
          .map(
            (entry) =>
              `${new Date(entry.timestamp).toLocaleTimeString('en-IN')} — ${entry.quadrant} → ${entry.phrase}`
          )
          .join('\n') || 'No communications',
    };
  }, [clinicalLog]);

  const runRiskAssessment = useCallback(async () => {
    if (clinicalLog.length < 2) {
      return null;
    }

    const patterns = analyzePatterns();
    const assessment = await generateRiskAssessment(patterns);

    setRiskScore(assessment.score);
    setRiskLevel(assessment.level);
    setRiskReasoning(assessment.reasoning);
    setRiskRecommendation(assessment.recommendation);
    setLastAssessment(new Date());
    setRiskHistory((previous) =>
      [...previous, { score: assessment.score, level: assessment.level, timestamp: Date.now() }].slice(-20)
    );

    const levels = ['STABLE', 'MONITOR', 'CONCERN', 'URGENT', 'CRITICAL'];
    if (levels.indexOf(assessment.level) > levels.indexOf(lastEscalationLevel.current)) {
      lastEscalationLevel.current = assessment.level;
      if (assessment.level === 'URGENT' || assessment.level === 'CRITICAL') {
        await sendWhatsAppAlert(
          buildRiskMessage(PATIENT, assessment, new Date().toLocaleTimeString('en-IN'))
        );
      }
    }

    return assessment;
  }, [analyzePatterns, clinicalLog]);

  useEffect(() => {
    const interval = window.setInterval(runRiskAssessment, 15 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [runRiskAssessment]);

  useEffect(() => {
    const lastEntry = clinicalLog[clinicalLog.length - 1];
    if (lastEntry && lastEntry.severity >= 3) {
      runRiskAssessment();
    }
  }, [clinicalLog, runRiskAssessment]);

  return {
    riskScore,
    riskLevel,
    riskReasoning,
    riskRecommendation,
    riskHistory,
    lastAssessment,
    runRiskAssessment,
  };
}
