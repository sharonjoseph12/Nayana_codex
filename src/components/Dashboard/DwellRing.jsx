import PropTypes from 'prop-types';

export default function DwellRing({ progress, color }) {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <svg width="42" height="42" viewBox="0 0 42 42" className="drop-shadow-[0_0_12px_rgba(255,255,255,0.18)]">
      <circle cx="21" cy="21" r={radius} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="3" />
      <circle
        cx="21"
        cy="21"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 21 21)"
      />
      <circle
        cx={21}
        cy={4 + ((100 - progress) / 100) * 34}
        r="3"
        fill={color}
        style={{ filter: `drop-shadow(0 0 10px ${color})` }}
      />
    </svg>
  );
}

DwellRing.propTypes = {
  progress: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};
