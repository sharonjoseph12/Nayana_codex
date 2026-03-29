import PropTypes from 'prop-types';
import { QUADRANT_CONFIG } from '../../constants/phrases';

export default function DonutChart({ clinicalLog }) {
  const keys = Object.keys(QUADRANT_CONFIG);
  const totals = keys.map((key) => clinicalLog.filter((entry) => entry.quadrant === key).length);
  const sum = Math.max(1, totals.reduce((acc, value) => acc + value, 0));
  let currentOffset = 0;

  return (
    <div className="panel-elevated p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-white/40">Quadrant Usage</p>
      <div className="mt-4 flex items-center gap-5">
        <svg viewBox="0 0 42 42" className="h-40 w-40 -rotate-90">
          {keys.map((key, index) => {
            const value = totals[index];
            const segment = (value / sum) * 100;
            const circle = (
              <circle
                key={key}
                cx="21"
                cy="21"
                r="15.915"
                fill="none"
                stroke={QUADRANT_CONFIG[key].color}
                strokeWidth="4"
                strokeDasharray={`${segment} ${100 - segment}`}
                strokeDashoffset={-currentOffset}
              />
            );
            currentOffset += segment;
            return circle;
          })}
        </svg>
        <div className="space-y-2">
          {keys.map((key, index) => (
            <div key={key} className="flex items-center gap-2 text-sm text-white/70">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: QUADRANT_CONFIG[key].color }} />
              <span>{key}</span>
              <span className="text-white/35">{totals[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

DonutChart.propTypes = {
  clinicalLog: PropTypes.arrayOf(PropTypes.object).isRequired,
};
