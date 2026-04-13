import PropTypes from 'prop-types';
import { Activity, ChevronLeft, Star } from 'lucide-react';
import { encodeTrackableValue } from '../../constants/config';
import { QUADRANT_CONFIG } from '../../constants/phrases';

export default function PhraseChips({
  quadrant,
  phrases,
  translations,
  onPhraseSelect,
  dwellingOn = null,
  dwellProgress = 0,
  isLocked = false,
  favorites = [],
  onToggleFavorite
}) {
  const config = QUADRANT_CONFIG[quadrant];

  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      {phrases.map((phrase) => {
        const id = `phrase-${quadrant}-${encodeTrackableValue(phrase.label)}`;
        const starId = `star-${quadrant}-${encodeTrackableValue(phrase.label)}`;
        const isDwelling = dwellingOn === id;
        const isStarDwelling = dwellingOn === starId;
        const isFavorited = favorites.includes(phrase.label);

        return (
          <div
            key={phrase.label}
            id={id}
            onClick={() => onPhraseSelect(quadrant, phrase.label)}
            className="flex flex-col items-center justify-center rounded-2xl px-4 py-4 text-center transition-all duration-200 group relative overflow-hidden cursor-pointer"
            style={{
              border: `2px solid ${isDwelling ? (isLocked ? '#00ffaa' : config.color) : `${config.color}33`}`,
              background: isDwelling
                ? `${isLocked ? '#00ffaa' : config.color}28`
                : `${config.color}08`,
              color: '#fff',
              boxShadow: isDwelling
                ? `0 0 20px ${isLocked ? '#00ffaa' : config.color}55, inset 0 0 10px ${isLocked ? '#00ffaa' : config.color}15`
                : `none`,
              transform: isDwelling ? (isLocked ? 'scale(1.05)' : 'scale(1.03)') : 'scale(1)',
            }}
          >
            {/* Star Button for Favorites */}
            <button
              id={starId}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(phrase.label);
              }}
              className={`absolute top-2 right-2 p-1.5 rounded-full border transition-all duration-300 ${
                isFavorited 
                  ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-400 scale-110' 
                  : 'bg-white/5 border-white/10 text-white/20 hover:text-white/40'
              } ${isStarDwelling ? 'scale-125 !bg-yellow-400/30' : ''}`}
            >
              <Star size={14} className={isFavorited ? 'fill-yellow-400' : ''} />
            </button>
            {phrase.icon ? (
              <phrase.icon size={28} style={{ color: isDwelling ? (isLocked ? '#00ffaa' : config.color) : 'rgba(255,255,255,0.4)' }} className="transition-colors duration-200" />
            ) : (
              <div className="text-xl opacity-60">{phrase.emoji}</div>
            )}
            <div className="mt-3 text-sm font-bold leading-tight text-white/90 group-hover:text-white">
              {translations[phrase.label] || phrase.label}
            </div>
            {/* Dwell progress bar at bottom */}
            {isDwelling && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: `${config.color}25` }}>
                <div
                  className="h-full rounded-full transition-none"
                  style={{ width: `${dwellProgress}%`, background: config.color, opacity: 0.9 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

PhraseChips.propTypes = {
  quadrant: PropTypes.string.isRequired,
  phrases: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      emoji: PropTypes.string,
      icon: PropTypes.any,
    })
  ).isRequired,
  translations: PropTypes.object.isRequired,
  onPhraseSelect: PropTypes.func.isRequired,
  dwellingOn: PropTypes.string,
  dwellProgress: PropTypes.number,
  isLocked: PropTypes.bool,
};
