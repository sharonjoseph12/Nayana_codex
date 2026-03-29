import PropTypes from 'prop-types';
import { FileDown, MessagesSquare, Presentation, ShieldCheck, Siren } from 'lucide-react';
import RiskPanel from '../Clinical/RiskPanel';
import SymptomTimeline from '../Clinical/SymptomTimeline';
import CaregiverLog from '../Clinical/CaregiverLog';

export default function RightPanel({
  riskScore,
  riskLevel,
  riskReasoning,
  riskRecommendation,
  vitals,
  caregiverLog,
  setCaregiverLog,
  clinicalLog,
  onGenerateReport,
  onDownloadPDF,
  onTestWhatsApp,
  onRunRiskAssessment,
  presentationMode,
  setPresentationMode,
}) {
  const miniStats = [
    { label: 'Heart', value: `${vitals.heartRate} BPM`, icon: ShieldCheck, tone: 'text-emergency' },
    { label: 'Blink', value: `${vitals.blinkRate}/min`, icon: Siren, tone: 'text-medical' },
    { label: 'Focus', value: `${vitals.focusScore}%`, icon: MessagesSquare, tone: 'text-social' },
    { label: 'Stress', value: vitals.stressLevel, icon: ShieldCheck, tone: 'text-personal' },
  ];

  return (
    <div className="space-y-4 pl-2">
      <RiskPanel
        score={riskScore}
        level={riskLevel}
        reasoning={riskReasoning}
        recommendation={riskRecommendation}
        onRunRiskAssessment={onRunRiskAssessment}
      />

      <section className="panel-elevated p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Vitals Snapshot</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {miniStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-white/40">
                  <span>{stat.label}</span>
                  <Icon size={12} className={stat.tone} />
                </div>
                <div className="text-sm text-white">{stat.value}</div>
              </div>
            );
          })}
        </div>
      </section>

      <SymptomTimeline clinicalLog={clinicalLog} />
      <CaregiverLog caregiverLog={caregiverLog} setCaregiverLog={setCaregiverLog} />

      <div className="grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={onTestWhatsApp}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-social/25 bg-social/10 px-4 py-3 text-sm text-social"
        >
          <MessagesSquare size={16} />
          Test WhatsApp
        </button>
        <button
          type="button"
          onClick={() => {
            onGenerateReport();
            onDownloadPDF();
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-medical/25 bg-medical/10 px-4 py-3 text-sm text-medical"
        >
          <FileDown size={16} />
          Download PDF
        </button>
        <button
          type="button"
          onClick={() => setPresentationMode((previous) => !previous)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm text-white/70"
        >
          <Presentation size={16} />
          {presentationMode ? 'Exit Presentation Mode' : 'Presentation Mode'}
        </button>
      </div>
    </div>
  );
}

RightPanel.propTypes = {
  riskScore: PropTypes.number.isRequired,
  riskLevel: PropTypes.string.isRequired,
  riskReasoning: PropTypes.string.isRequired,
  riskRecommendation: PropTypes.string.isRequired,
  vitals: PropTypes.shape({
    heartRate: PropTypes.number.isRequired,
    blinkRate: PropTypes.number.isRequired,
    focusScore: PropTypes.number.isRequired,
    stressLevel: PropTypes.string.isRequired,
  }).isRequired,
  caregiverLog: PropTypes.arrayOf(PropTypes.object).isRequired,
  setCaregiverLog: PropTypes.func.isRequired,
  clinicalLog: PropTypes.arrayOf(PropTypes.object).isRequired,
  onGenerateReport: PropTypes.func.isRequired,
  onDownloadPDF: PropTypes.func.isRequired,
  onTestWhatsApp: PropTypes.func.isRequired,
  onRunRiskAssessment: PropTypes.func.isRequired,
  presentationMode: PropTypes.bool.isRequired,
  setPresentationMode: PropTypes.func.isRequired,
};
