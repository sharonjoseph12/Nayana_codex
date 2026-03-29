import PropTypes from 'prop-types';

export default function PainHeatmap({ clinicalLog }) {
  const painCount = clinicalLog.filter((entry) => entry.phrase === 'Pain').length;
  // Compute some basic intensity based on the occurrences
  const maxIntensity = 5;
  const intensity = Math.min(1, painCount / maxIntensity);

  // A more professional interactive map layout
  // (Using simple stylized regions for Chest, Abdomen, Arms, Legs, Head)
  const heatColor = (base, multiplier) => `rgba(239, 68, 68, ${base + intensity * multiplier})`;

  return (
    <div className="panel p-4 h-full flex flex-col items-center">
      <h3 className="text-xs uppercase font-semibold text-slate-500 mb-4 tracking-wider self-start">Pain Frequency Map</h3>
      <svg viewBox="0 0 200 400" className="h-full w-full max-h-[300px]">
        {/* Silhouette Base */}
        <g stroke="#CBD5E1" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Head & Neck */}
          <circle cx="100" cy="40" r="20" className="transition-all duration-300 hover:fill-slate-100" />
          <path d="M90 60 L90 80 M110 60 L110 80" />
          {/* Torso */}
          <rect x="70" y="80" width="60" height="100" rx="10" className="transition-all duration-300 hover:fill-slate-100" />
          {/* Arms */}
          <path d="M60 90 L30 160 L25 180 M140 90 L170 160 L175 180" />
          <rect x="25" y="90" width="45" height="15" rx="5" transform="rotate(20 70 80)" />
          <rect x="130" y="90" width="45" height="15" rx="5" transform="rotate(-20 130 80)" />
          {/* Legs */}
          <path d="M80 180 L70 300 L75 320 M120 180 L130 300 L125 320" />
        </g>
        
        {/* Heatmap Overlays */}
        {intensity > 0 && (
          <g>
            <circle cx="100" cy="110" r={20 + intensity * 10} fill={heatColor(0.2, 0.4)} className="blur-md pointer-events-none" />
            <circle cx="100" cy="150" r={15 + intensity * 5} fill={heatColor(0.1, 0.2)} className="blur-sm pointer-events-none" />
            <ellipse cx="100" cy="110" rx="15" ry="20" fill={heatColor(0.4, 0.5)} className="blur-sm pointer-events-none" />
          </g>
        )}
      </svg>
    </div>
  );
}

PainHeatmap.propTypes = {
  clinicalLog: PropTypes.arrayOf(
    PropTypes.shape({
      phrase: PropTypes.string,
    })
  ).isRequired,
};

