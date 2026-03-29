import PropTypes from 'prop-types';
import CommsChart from './CommsChart';
import RiskChart from './RiskChart';
import DonutChart from './DonutChart';
import PainHeatmap from './PainHeatmap';

export default function AnalyticsPage({ clinicalLog, vitals, clinicalAI, conversationHistory }) {
  return (
    <div className="grid flex-1 gap-4 overflow-y-auto p-4 md:grid-cols-2">
      <CommsChart clinicalLog={clinicalLog} />
      <RiskChart riskHistory={clinicalAI.riskHistory} />
      <DonutChart clinicalLog={clinicalLog} />
      <PainHeatmap clinicalLog={clinicalLog} />
      <section className="panel-elevated p-5 md:col-span-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Session Intelligence</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <h3 className="font-display text-2xl text-white">Clinical insight</h3>
            <p className="mt-3 text-sm leading-7 text-white/72">
              Risk is currently {clinicalAI.riskLevel} at {clinicalAI.riskScore}/100. The patient has sent {clinicalLog.length} gaze-assisted communications, with {conversationHistory.length} recent contextual entries available for sentence generation.
            </p>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Recommendation: {clinicalAI.riskRecommendation}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Focus</div>
              <div className="mt-2 text-3xl text-white">{vitals.focusScore}%</div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Fatigue Risk</div>
              <div className="mt-2 text-3xl text-white">{vitals.fatigueRisk}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

AnalyticsPage.propTypes = {
  clinicalLog: PropTypes.arrayOf(PropTypes.object).isRequired,
  vitals: PropTypes.shape({
    focusScore: PropTypes.number.isRequired,
    fatigueRisk: PropTypes.string.isRequired,
  }).isRequired,
  clinicalAI: PropTypes.shape({
    riskHistory: PropTypes.array.isRequired,
    riskLevel: PropTypes.string.isRequired,
    riskScore: PropTypes.number.isRequired,
    riskRecommendation: PropTypes.string.isRequired,
  }).isRequired,
  conversationHistory: PropTypes.arrayOf(PropTypes.object).isRequired,
};
