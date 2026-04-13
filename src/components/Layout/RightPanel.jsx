import { memo } from 'react';
import PropTypes from 'prop-types';
import { FileDown, MessagesSquare, Presentation, ShieldCheck, Siren } from 'lucide-react';
import RiskPanel from '../Clinical/RiskPanel';
import SymptomTimeline from '../Clinical/SymptomTimeline';
import CaregiverLog from '../Clinical/CaregiverLog';

const RightPanel = memo(function RightPanel({
  riskScore,
  riskLevel,
  riskReasoning,
  riskRecommendation,
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
  return (
    <div className="space-y-4 pl-2">
      <RiskPanel
        score={riskScore}
        level={riskLevel}
        reasoning={riskReasoning}
        recommendation={riskRecommendation}
        onRunRiskAssessment={onRunRiskAssessment}
      />


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
});

export default RightPanel;

RightPanel.propTypes = {
  riskScore: PropTypes.number.isRequired,
  riskLevel: PropTypes.string.isRequired,
  riskReasoning: PropTypes.string.isRequired,
  riskRecommendation: PropTypes.string.isRequired,
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
