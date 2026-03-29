import PropTypes from 'prop-types';

export default function RiskChart({ riskHistory }) {
  const points = riskHistory.slice(-10);
  const path = points
    .map((point, index) => {
      const x = (index / Math.max(1, points.length - 1)) * 100;
      const y = 100 - point.score;
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  return (
    <div className="panel-elevated p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-white/40">Risk Timeline</p>
      <svg viewBox="0 0 100 100" className="mt-4 h-40 w-full overflow-visible">
        <defs>
          <linearGradient id="riskLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#ff3d5a" />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke="url(#riskLine)" strokeWidth="3" strokeLinecap="round" />
        {points.map((point, index) => {
          const x = (index / Math.max(1, points.length - 1)) * 100;
          const y = 100 - point.score;
          return <circle key={point.timestamp} cx={x} cy={y} r="2.8" fill="#ffffff" />;
        })}
      </svg>
    </div>
  );
}

RiskChart.propTypes = {
  riskHistory: PropTypes.arrayOf(
    PropTypes.shape({
      score: PropTypes.number.isRequired,
      timestamp: PropTypes.number.isRequired,
    })
  ).isRequired,
};
