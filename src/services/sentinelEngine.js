/**
 * Phase 30: Medical Sentinel Engine
 * Correlates multi-modal data to identify pre-critical deterioration patterns.
 */
export const sentinelEngine = {
  
  /**
   * Calculates 'Crisis Probability' based on trend correlation.
   * @param {Object} data { vitals, sentiment, gazeFidelity, clinicalLog }
   */
  calculateProbability: (data) => {
    const { vitals, sentiment, gazeFidelity, clinicalLog } = data;
    
    let score = 0;
    const reasons = [];

    // 1. Vitals Variance (Stress / Heart Rate)
    if (vitals.stressLevel === 'High' || vitals.stressLevel === 'Emergency') {
      score += 35;
      reasons.push('High physiological stress detected');
    }
    if (vitals.heartRate > 110) {
      score += 15;
      reasons.push('Tachycardia baseline shift');
    }

    // 2. Behavioral Decay (Gaze Accuracy is a proxy for neurological fatigue)
    if (gazeFidelity < 40) {
      score += 25;
      reasons.push('Nuero-motor fatigue: Gaze fidelity drop');
    }

    // 3. Sentiment Stability Index
    if (sentiment.stabilityIndex < 30) {
      score += 15;
      reasons.push('Acute emotional destabilization');
    }

    // 4. Critical Intent Density
    const last30Mins = clinicalLog.filter(e => Date.now() - new Date(e.timestamp).getTime() < 30 * 60 * 1000);
    const criticalCount = last30Mins.filter(e => e.phrase === 'HELP' || e.phrase === 'Breathe').length;
    
    if (criticalCount >= 2) {
      score += 20;
      reasons.push('Repeated critical distress signaling');
    }

    // Normalize
    const probability = Math.min(100, score);
    
    return {
      probability,
      reasons,
      level: probability > 85 ? 'CRITICAL_SENTINEL' : probability > 50 ? 'ADVISORY' : 'STABLE',
      timestamp: Date.now()
    };
  }
};
