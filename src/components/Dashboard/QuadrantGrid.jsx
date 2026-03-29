import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { PHRASES, QUADRANT_CONFIG, TIME_OF_DAY_WEIGHTS, SEQUENTIAL_PREDICTIONS, getTimeProfile } from '../../constants/phrases';
import QuadrantCard from './QuadrantCard';

// Binary mode mega-button (fullscreen 2-button layout)
// Binary mode mega-button (fullscreen 2-button layout)
function BinaryButton({ quadrant, onQuadrantSelect, dwellingOn = null, dwellProgress = 0 }) {
  const config = QUADRANT_CONFIG[quadrant];
  const isDwelling = dwellingOn === `quadrant-${quadrant}`;

  return (
    <div
      id={`quadrant-${quadrant}`}
      role="button"
      tabIndex={0}
      onClick={() => onQuadrantSelect(quadrant)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onQuadrantSelect(quadrant); } }}
      className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[32px] border-2 transition-all duration-300"
      style={{
        background: config.bg,
        borderColor: isDwelling ? config.color : config.border,
        minHeight: '48vh',
        boxShadow: isDwelling ? `0 0 48px ${config.color}44` : undefined,
      }}
    >
      {/* Dwell ring overlay */}
      {isDwelling && (
        <svg className="absolute inset-0 m-auto" width={160} height={160} style={{ opacity: 0.85 }}>
          <circle cx={80} cy={80} r={70} fill="none" stroke={`${config.color}30`} strokeWidth={10} />
          <circle
            cx={80} cy={80} r={70} fill="none"
            stroke={config.color} strokeWidth={10}
            strokeDasharray={440}
            strokeDashoffset={440 - (440 * dwellProgress) / 100}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
      )}
      <div className="text-7xl mb-6 select-none" style={{ filter: `drop-shadow(0 0 24px ${config.color})` }}>
        {quadrant === 'Medical' ? '🩺' : quadrant === 'Emergency' ? '🆘' : quadrant === 'Social' ? '💬' : '🧍'}
      </div>
      <div className="font-display text-5xl font-bold text-white select-none">{quadrant}</div>
      <div className="mt-3 text-base text-white/50 select-none">{config.hint}</div>
    </div>
  );
}

BinaryButton.propTypes = {
  quadrant: PropTypes.string.isRequired,
  onQuadrantSelect: PropTypes.func.isRequired,
  dwellingOn: PropTypes.string,
  dwellProgress: PropTypes.number.isRequired,
};

export default function QuadrantGrid({
  selectedQuadrant = null,
  dwellingOn = null,
  dwellProgress = 0,
  isLocked = false,
  onQuadrantSelect,
  onPhraseSelect,
  translations,
  densityMode = 'normal',
  lastSelectedPhrase = null,
}) {
  const timeProfile = useMemo(() => getTimeProfile(), []);
  const weights = TIME_OF_DAY_WEIGHTS[timeProfile] || {};

  // Sort phrases within each quadrant by time-of-day weight
  const sortedPhrases = useMemo(() => {
    const result = {};
    Object.entries(PHRASES).forEach(([quadrant, phrases]) => {
      result[quadrant] = [...phrases].sort((a, b) => {
        const weightA = weights[`${quadrant}-${a.label}`] || 0;
        const weightB = weights[`${quadrant}-${b.label}`] || 0;
        return weightB - weightA;
      });
    });
    return result;
  }, [weights]);

  // Sequential prediction suggestions
  const sequentialSuggestions = useMemo(() => {
    if (!lastSelectedPhrase) return null;
    return SEQUENTIAL_PREDICTIONS[lastSelectedPhrase] || null;
  }, [lastSelectedPhrase]);

  // Binary mode: only show Medical + Emergency as two giant buttons
  if (densityMode === 'binary') {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emergency animate-pulse" />
          <span className="text-xs uppercase tracking-[0.22em] text-white/40">Binary Mode — High Fatigue</span>
        </div>
        <div className="grid grid-cols-2 gap-4 flex-1">
          {['Medical', 'Emergency'].map((q) => (
            <BinaryButton
              key={q}
              quadrant={q}
              onQuadrantSelect={onQuadrantSelect}
              dwellingOn={dwellingOn}
              dwellProgress={dwellProgress}
            />
          ))}
        </div>
      </div>
    );
  }

  // Focused mode: 1-column layout with larger touch targets
  const gridClass = densityMode === 'focused'
    ? 'grid flex-1 grid-cols-1 gap-5 p-4 md:grid-cols-2'
    : 'grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-2';

  return (
    <div className="flex flex-col min-h-0">
      {/* Time-of-day badge */}
      <div className="flex items-center gap-2 px-5 pt-2 pb-1">
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/30">
          {timeProfile === 'morning' ? '🌅 Morning grid' :
           timeProfile === 'afternoon' ? '☀️ Afternoon grid' :
           timeProfile === 'evening' ? '🌆 Evening grid' : '🌙 Night grid'}
          &nbsp;· phrases auto-prioritized
        </span>
      </div>

      {/* Sequential prediction bar */}
      {sequentialSuggestions && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2 backdrop-blur-md">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/35 mr-1 shrink-0">Next →</span>
          {sequentialSuggestions.map((s) => {
            const cfg = QUADRANT_CONFIG[s.quadrant];
            const ph = PHRASES[s.quadrant]?.find((p) => p.label === s.label);
            return (
              <button
                key={`${s.quadrant}-${s.label}`}
                type="button"
                onClick={() => onPhraseSelect(s.quadrant, s.label)}
                className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition hover:scale-105"
                style={{ borderColor: `${cfg.color}44`, color: cfg.color, background: `${cfg.color}10` }}
              >
                {ph?.emoji} {translations[s.label] || s.label}
              </button>
            );
          })}
        </div>
      )}

      <div className={gridClass}>
        {Object.entries(sortedPhrases).map(([quadrant, phrases]) => (
          <QuadrantCard
            key={quadrant}
            quadrant={quadrant}
            translations={translations}
            phrases={phrases}
            isSelected={selectedQuadrant === quadrant}
            isDwelling={dwellingOn === `quadrant-${quadrant}`}
            dwellProgress={dwellProgress}
            onQuadrantSelect={onQuadrantSelect}
            onPhraseSelect={onPhraseSelect}
            dwellingOn={dwellingOn}
            densityMode={densityMode}
            isLocked={isLocked}
          />
        ))}
      </div>
    </div>
  );
}

QuadrantGrid.propTypes = {
  selectedQuadrant: PropTypes.string,
  dwellingOn: PropTypes.string,
  dwellProgress: PropTypes.number.isRequired,
  onQuadrantSelect: PropTypes.func.isRequired,
  onPhraseSelect: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
  densityMode: PropTypes.oneOf(['normal', 'focused', 'binary']),
  lastSelectedPhrase: PropTypes.string,
};
