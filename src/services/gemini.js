import { FALLBACK_SENTENCES } from '../constants/phrases';

const LANG_NAMES = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
  ta: 'Tamil',
};

const LANG_INSTRUCTIONS = {
  en: 'CRITICAL: You MUST generate the sentence in English only.',
  hi: 'CRITICAL: You MUST generate the entire sentence in Hindi (हिंदी) using Devanagari script. DO NOT use any English words or Latin characters. Every single word must be in Devanagari.',
  kn: 'CRITICAL: You MUST generate the entire sentence in Kannada (ಕನ್ನಡ) using Kannada script. DO NOT use any English words or Latin characters. Every single word must be in Kannada script.',
  ta: 'CRITICAL: You MUST generate the entire sentence in Tamil (தமிழ்) using Tamil script. DO NOT use any English words or Latin characters. Every single word must be in Tamil script.',
};

/**
 * Robust JSON Extractor (Phase 36)
 * Finds the first JSON block {...} or [...] in a string.
 */
function safelyParseJSON(text, fallback = []) {
  if (!text) return fallback;
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch (e1) {
    try {
      // Find JSON block using regex
      const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
         // Remove markdown artifacts
         const cleaned = jsonMatch[0].replace(/```json|```/g, '').trim();
         return JSON.parse(cleaned);
      }
    } catch (e2) {
      console.warn('Nayana: AI JSON extraction failed', text.slice(0, 100));
    }
    return fallback;
  }
}

async function callGeminiProxy(prompt, generationConfig, systemInstruction) {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        generationConfig,
        systemInstruction,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const errorMsg = payload.error || `Gemini proxy error ${response.status}`;
      
      // Phase 36: Propagate Quota specific error for fallback triggering
      if (response.status === 429 || errorMsg.includes('Quota')) {
         throw new Error('QUOTA_EXCEEDED');
      }
      throw new Error(errorMsg);
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Phase 22 & 36: Predictive AI engine to anticipate patient needs.
 */
export async function predictNextNeeds(clinicalLog, vitals, language = 'en') {
  const logSummary = clinicalLog
    .slice(-10)
    .map(entry => `Patient said: ${entry.quadrant}->${entry.phrase}`)
    .join('\n');

  const hour = new Date().getHours();
  const timeLabel = 
    hour >= 6 && hour < 11 ? 'morning (breakfast/wash)' :
    hour >= 11 && hour < 17 ? 'afternoon (rest/lunch)' :
    hour >= 17 && hour < 22 ? 'evening (dinner/handover)' : 'late night (sleep/comfort)';

  const prompt = `You are a predictive clinical AI. Anticipate the next 3 most likely phrases this paralyzed ICU patient will want to say.
Patient: Arjun Mehta | ALS Stage 2
Context:
- Current Time: ${timeLabel}
- Heart Rate: ${vitals.heartRate} BPM
- Stress Level: ${vitals.stressLevel}
- Recent Interactions:
${logSummary || 'No recent communications.'}

Respond ONLY with a JSON array of 3 objects:
[
  { "phrase": "e.g. Water", "quadrant": "Personal", "confidence": 0-100, "reason": "brief clinical reason" },
  { "phrase": "e.g. Pain", "quadrant": "Medical", "confidence": 0-100, "reason": "brief clinical reason" },
  { "phrase": "e.g. Family", "quadrant": "Social", "confidence": 0-100, "reason": "brief clinical reason" }
]`;

  try {
    const data = await callGeminiProxy(prompt, {
      temperature: 0.4,
      maxOutputTokens: 250,
    });

    const results = safelyParseJSON(data.text, []);
    return results.slice(0, 3);
  } catch (error) {
    if (error.message !== 'QUOTA_EXCEEDED') {
      console.warn('Predictive AI Error:', error);
    }
    
    // Conservative fallback based on time of day
    if (hour >= 6 && hour < 11) return [
      { phrase: 'Water', quadrant: 'Personal', confidence: 60, reason: 'Morning hydration' },
      { phrase: 'Clean', quadrant: 'Personal', confidence: 50, reason: 'Morning wash' },
      { phrase: 'Position', quadrant: 'Medical', confidence: 40, reason: 'Bed adjustment' }
    ];
    if (hour >= 22 || hour < 6) return [
      { phrase: 'Lights', quadrant: 'Personal', confidence: 60, reason: 'Night cycle' },
      { phrase: 'Noise', quadrant: 'Personal', confidence: 50, reason: 'Sleep comfort' },
      { phrase: 'Turn', quadrant: 'Medical', confidence: 40, reason: 'Pressure relief' }
    ];
    return [
      { phrase: 'Water', quadrant: 'Personal', confidence: 50, reason: 'Hydration' },
      { phrase: 'Pain', quadrant: 'Medical', confidence: 40, reason: 'Symptom load' },
      { phrase: 'Social', quadrant: 'Social', confidence: 30, reason: 'Boredom' }
    ];
  }
}

export async function generateSentence(
  quadrant,
  phrase,
  language = 'en',
  conversationHistory = [],
  envContext = {}
) {
  const historyContext = conversationHistory
    .slice(-3)
    .map((item) => `Patient previously said: "${item.sentence}"`)
    .join('\n');

  const langName = LANG_NAMES[language] || 'English';

  const hour = new Date().getHours();
  const timeLabel =
    hour >= 6 && hour < 11 ? 'morning' :
      hour >= 11 && hour < 17 ? 'afternoon' :
        hour >= 17 && hour < 22 ? 'evening' : 'late night';

  const envLines = [];
  envLines.push(`- Time of day: ${timeLabel} (${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})`);
  if (envContext.caregiver) envLines.push(`- Assigned caregiver: ${envContext.caregiver}`);
  if (envContext.room) envLines.push(`- Patient room: ${envContext.room}`);
  if (envContext.heartRate) envLines.push(`- Current heart rate: ${envContext.heartRate} BPM`);
  if (envContext.stressLevel) envLines.push(`- Stress level reading: ${envContext.stressLevel}`);
  if (envContext.recentEnteredName) envLines.push(`- Recently entered room: ${envContext.recentEnteredName}`);

  const envBlock = envLines.length
    ? `\nEnvironmental context:\n${envLines.join('\n')}\n`
    : '';

  const systemInstruction = language !== 'en'
    ? `You are a multilingual assistive communication AI. ${LANG_INSTRUCTIONS[language]} Output ONLY the sentence in ${langName} script. Never use English or Latin characters in your response.`
    : `You are an assistive communication AI. Generate a single natural English sentence.`;

  const prompt = `Patient: Arjun Mehta (paralyzed, using gaze-based AAC device).
${historyContext ? `Recent conversation:\n${historyContext}\n` : ''}${envBlock}
Selected category: "${quadrant}" | Selected intent: "${phrase}".

Generate ONE empathetic, calm, first-person sentence (max 30 words) expressing this patient's specific need. Reference caregiver name or time of day if natural.
${LANG_INSTRUCTIONS[language] || LANG_INSTRUCTIONS.en}
Output ONLY the sentence. No quotes. No explanation. No English if language is not English.`;

  try {
    const data = await callGeminiProxy(
      prompt,
      { temperature: 0.65, maxOutputTokens: 200 },
      systemInstruction
    );

    const text = data.text?.trim();
    if (!text || text.length < 3) {
      throw new Error('Gemini returned an invalid sentence.');
    }

    return { text, source: 'gemini' };
  } catch (error) {
    if (error.message !== 'QUOTA_EXCEEDED') {
      console.warn('Gemini fallback:', error.message);
    }
    const key = `${quadrant}-${phrase}`;
    const fallbacks = FALLBACK_SENTENCES[key];
    const fallbackText = typeof fallbacks === 'object' && fallbacks !== null
      ? (fallbacks[language] || fallbacks.en || `I need help with ${phrase.toLowerCase()}.`)
      : (fallbacks || `I need help with ${phrase.toLowerCase()}.`);
    return { text: fallbackText, source: 'fallback' };
  }
}

export async function generateRiskAssessment(patterns) {
  const prompt = `You are a clinical AI analyzing an ICU patient's communication patterns.
Patient: Arjun Mehta | ALS Stage 2 | ICU-7

Analysis:
- Pain mentions (2hr): ${patterns.repeatedPain}
- Respiratory mentions: ${patterns.respiratoryCount}
- Critical phrases: ${patterns.criticalCount}
- Communications (30min): ${patterns.recentFrequency}
- Frequency accelerating: ${patterns.acceleration}
- Recent log: ${patterns.recentEntries}

Respond ONLY in JSON:
{
  "score": 0-100,
  "level": "STABLE|MONITOR|CONCERN|URGENT|CRITICAL",
  "reasoning": "one clinical sentence",
  "recommendation": "one specific action"
}`;

  try {
    const data = await callGeminiProxy(prompt, {
      temperature: 0.3,
      maxOutputTokens: 150,
    });

    return safelyParseJSON(data.text, {});
  } catch {
    const score = Math.min(
      100,
      patterns.repeatedPain * 12 +
      patterns.respiratoryCount * 25 +
      patterns.criticalCount * 20 +
      patterns.recentFrequency * 3 +
      (patterns.acceleration ? 12 : 0)
    );

    return {
      score,
      level:
        score >= 80
          ? 'CRITICAL'
          : score >= 60
            ? 'URGENT'
            : score >= 40
              ? 'CONCERN'
              : score >= 20
                ? 'MONITOR'
                : 'STABLE',
      reasoning:
        score < 20
          ? 'Communication pattern is steady with no immediate escalation indicators.'
          : 'Communication intensity suggests increased symptom burden and requires closer observation.',
      recommendation:
        score >= 60
          ? 'Perform bedside review immediately and confirm respiratory comfort, pain control, and caregiver availability.'
          : 'Continue monitoring trends and reassess if pain or distress phrases increase.',
    };
  }
}

export async function generateHandoverReport(clinicalLog, vitals, riskData) {
  const commSummary =
    clinicalLog
      .slice(-10)
      .map(
        (entry, index) =>
          `${index + 1}. ${entry.quadrant} -> ${entry.phrase}: "${entry.sentence}"`
      )
      .join('\n') || 'No communications recorded.';

  const prompt = `You are a clinical documentation AI. Write a 3-sentence nurse handover report.
Patient: Arjun Mehta | ALS Stage 2 | ICU-7
Risk: ${riskData.riskScore ?? riskData.score}/100 - ${riskData.riskLevel ?? riskData.level}
Heart Rate: ${vitals.heartRate} BPM | Stress: ${vitals.stressLevel}
Communications: ${clinicalLog.length} total
Log: ${commSummary}
Write formally in third person. Cover: communication status, risk assessment, recommended next-shift actions.`;

  try {
    const data = await callGeminiProxy(prompt, {
      temperature: 0.4,
      maxOutputTokens: 200,
    });

    return data.text?.trim() || 'Report generation failed.';
  } catch {
    return `Patient Arjun Mehta communicated ${clinicalLog.length} times during this session using gaze-assisted intent selection. Current risk level is ${riskData.riskLevel ?? riskData.level}, with heart rate ${vitals.heartRate} BPM and stress level ${vitals.stressLevel}. The incoming team should continue communication support, review recent requests, and monitor for escalation in pain, respiratory distress, or emergency phrases.`;
  }
}
