import { PATIENT } from '../constants/config';

export function buildPDFHTML(report, clinicalLog, vitals, clinicalAI) {
  const rows = clinicalLog
    .slice(-12)
    .map(
      (entry) => `
        <tr>
          <td>${new Date(entry.timestamp).toLocaleTimeString('en-IN')}</td>
          <td>${entry.quadrant}</td>
          <td>${entry.phrase}</td>
          <td>${entry.sentence}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Nayana Clinical Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #101010; }
          h1, h2 { margin-bottom: 8px; }
          .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
          .card { border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; vertical-align: top; }
          th { background: #f5f5f5; }
          .muted { color: #666; }
        </style>
      </head>
      <body>
        <h1>Nayana Clinical Handover</h1>
        <p class="muted">Generated ${new Date().toLocaleString('en-IN')}</p>
        <div class="meta">
          <div class="card"><strong>Patient</strong><br/>${PATIENT.name}<br/>${PATIENT.condition}<br/>Room ${PATIENT.room}</div>
          <div class="card"><strong>Clinical AI</strong><br/>Risk ${clinicalAI.riskScore}/100<br/>${clinicalAI.riskLevel}<br/>${clinicalAI.riskRecommendation}</div>
          <div class="card"><strong>Vitals</strong><br/>Heart Rate ${vitals.heartRate} BPM<br/>Blink Rate ${vitals.blinkRate}/min<br/>Stress ${vitals.stressLevel}</div>
          <div class="card"><strong>Session</strong><br/>Duration ${vitals.formatDuration(vitals.sessionDuration)}<br/>Messages ${clinicalLog.length}<br/>Fatigue ${vitals.fatigueRisk}</div>
        </div>
        <h2>AI Summary</h2>
        <p>${report}</p>
        <h2>Recent Communication Log</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Quadrant</th>
              <th>Phrase</th>
              <th>Generated Sentence</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="4">No communication records yet.</td></tr>'}
          </tbody>
        </table>
      </body>
    </html>
  `;
}
