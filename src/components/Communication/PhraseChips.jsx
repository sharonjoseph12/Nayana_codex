import PropTypes from 'prop-types';
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
}) {
  const config = QUADRANT_CONFIG[quadrant];

  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      {phrases.map((phrase) => {
        const id = `phrase-${quadrant}-${encodeTrackableValue(phrase.label)}`;
        const isDwelling = dwellingOn === id;

        return (
          <button
            key={phrase.label}
            id={id}
            type="button"
            onClick={() => onPhraseSelect(quadrant, phrase.label)}
            className="rounded-2xl px-4 py-3 text-left transition-all duration-200"
            style={{
              border: `2px solid ${isDwelling ? (isLocked ? '#00ffaa' : config.color) : `${config.color}55`}`,
              background: isDwelling
                ? `${isLocked ? '#00ffaa' : config.color}28`
                : `${config.color}10`,
              color: '#fff',
              boxShadow: isDwelling
                ? `0 0 20px ${isLocked ? '#00ffaa' : config.color}55, inset 0 0 10px ${isLocked ? '#00ffaa' : config.color}15`
                : `0 0 0 0 transparent`,
              transform: isDwelling ? (isLocked ? 'scale(1.05)' : 'scale(1.03)') : 'scale(1)',
            }}
          >
            <div className="text-xl">{phrase.emoji}</div>
            <div className="mt-1.5 text-sm font-semibold leading-snug text-white">
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
          </button>
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
      emoji: PropTypes.string.isRequired,
    })
  ).isRequired,
  translations: PropTypes.object.isRequired,
  onPhraseSelect: PropTypes.func.isRequired,
  dwellingOn: PropTypes.string,
  dwellProgress: PropTypes.number,
  isLocked: PropTypes.bool,
};
