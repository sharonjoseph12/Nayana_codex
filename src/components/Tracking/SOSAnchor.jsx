import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';


export default function SOSAnchor({ onTrigger, dwellingOn = null, dwellProgress = 0 }) {
  const id = 'sos-anchor-btn';
  const isDwelling = dwellingOn === id;
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id={id}
      role="button"
      tabIndex={0}
      aria-label="Emergency SOS — gaze for 2 seconds"
      title="Gaze here for 2 seconds to trigger SOS"
      onClick={() => onTrigger()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTrigger(); } }}
      className="fixed bottom-5 right-5 z-50 flex cursor-pointer flex-col items-center justify-center select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Outer pulse ring */}
      <div
        className="absolute rounded-full transition-all duration-700"
        style={{
          width: 72, height: 72,
          background: 'radial-gradient(circle, rgba(255,61,90,0.18) 0%, transparent 70%)',
          transform: pulse ? 'scale(1.35)' : 'scale(1)',
          opacity: pulse ? 0.7 : 0.3,
        }}
      />

      {/* Dwell progress ring */}
      {isDwelling && (
        <svg className="absolute" width={70} height={70} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={35} cy={35} r={30} fill="none" stroke="rgba(255,61,90,0.2)" strokeWidth={5} />
          <circle
            cx={35} cy={35} r={30} fill="none"
            stroke="#ff3d5a" strokeWidth={5}
            strokeDasharray={188}
            strokeDashoffset={188 - (188 * dwellProgress) / 100}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
      )}

      {/* Core button */}
      <div
        className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 text-xl font-bold transition-all duration-200"
        style={{
          borderColor: isDwelling ? '#ff3d5a' : 'rgba(255,61,90,0.45)',
          background: isDwelling ? 'rgba(255,61,90,0.35)' : 'rgba(255,61,90,0.12)',
          boxShadow: isDwelling
            ? '0 0 28px rgba(255,61,90,0.7), 0 0 56px rgba(255,61,90,0.3)'
            : '0 0 12px rgba(255,61,90,0.25)',
          color: '#ff3d5a',
        }}
      >
        🆘
      </div>
      <div
        className="mt-1 text-[9px] uppercase tracking-[0.12em] font-semibold"
        style={{ color: 'rgba(255,61,90,0.65)' }}
      >
        {isDwelling ? `${Math.round(dwellProgress)}%` : 'SOS'}
      </div>
    </div>
  );
}

SOSAnchor.propTypes = {
  onTrigger: PropTypes.func.isRequired,
  dwellingOn: PropTypes.string,
  dwellProgress: PropTypes.number,
};
