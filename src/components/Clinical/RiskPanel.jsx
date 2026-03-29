import PropTypes from 'prop-types';

export default function RiskPanel({ score, level, reasoning, recommendation, onRunRiskAssessment }) {
  const width = `${Math.max(4, Math.min(100, score))}%`;
  const levelTone =
    level === 'CRITICAL' || level === 'URGENT'
      ? 'text-emergency'
      : level === 'CONCERN'
        ? 'text-personal'
        : level === 'MONITOR'
          ? 'text-social'
          : 'text-medical';

  return (
    <section className="panel-elevated p-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Clinical AI</p>
          <h3 className="mt-1 font-display text-xl text-white">Risk Sentinel</h3>
        </div>
        <button
          type="button"
          onClick={onRunRiskAssessment}
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 transition hover:border-medical/40 hover:text-white"
        >
          Reassess
        </button>
      </div>

      <div className="mb-4">
        <div className="font-display text-5xl leading-none text-white">{score}</div>
        <div className="mt-1 font-mono text-xs text-white/45">out of 100</div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#00d4ff,#00ffaa,#ff3d5a)]"
          style={{ width }}
        />
      </div>

      <div className="space-y-3 text-sm text-white/70">
        <p>{reasoning}</p>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="mb-1 text-xs uppercase tracking-[0.24em] text-white/35">Recommendation</div>
          <p>{recommendation}</p>
        </div>
      </div>
    </section>
  );
}

RiskPanel.propTypes = {
  score: PropTypes.number.isRequired,
  level: PropTypes.string.isRequired,
  reasoning: PropTypes.string.isRequired,
  recommendation: PropTypes.string.isRequired,
  onRunRiskAssessment: PropTypes.func.isRequired,
};
