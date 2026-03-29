export async function sendWhatsAppAlert(message) {
  try {
    const response = await fetch('/api/send-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.warn('WhatsApp send failed:', data.error || response.statusText);
      return false;
    }

    return Boolean(data.success);
  } catch (error) {
    console.warn('WhatsApp API unavailable:', error.message);
    return false;
  }
}

export function buildSOSMessage(patient, time) {
  return `NAYANA SOS ALERT\n\nPatient: ${patient.name}\nRoom: ${patient.room}\nCondition: ${patient.condition}\nTime: ${time}\n\nPatient requires immediate assistance.\nPowered by Nayana — Hackfest 2026`;
}

export function buildEmotionMessage(patient, emotion, time) {
  return `NAYANA EMOTION ALERT\n\nPatient: ${patient.name}\nRoom: ${patient.room}\nTime: ${time}\n\nDistress detected: ${emotion}. No interaction for 60 seconds. Please check immediately.`;
}

export function buildRiskMessage(patient, assessment, time) {
  return `NAYANA CLINICAL ALERT\n\nPatient: ${patient.name}\nRoom: ${patient.room}\nRisk: ${assessment.score}/100 — ${assessment.level}\nTime: ${time}\n\n${assessment.reasoning}\nAction: ${assessment.recommendation}`;
}
