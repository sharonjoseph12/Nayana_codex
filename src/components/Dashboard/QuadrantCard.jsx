import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  AlertTriangle, Stethoscope, User, Users,
  Heart, Activity, Thermometer, Wind,
  MessageCircle, HeartHandshake, Smile,
  Coffee, Droplets, Bed, Sun,
  Phone, Bell, ShieldAlert
} from 'lucide-react';
import DwellRing from './DwellRing';
import PhraseChips from '../Communication/PhraseChips';
import { QUADRANT_CONFIG } from '../../constants/phrases';

const ICONS = {
  AlertTriangle, Stethoscope, User, Users,
  Heart, Activity, Thermometer, Wind,
  MessageCircle, HeartHandshake, Smile,
  Coffee, Droplets, Bed, Sun,
  Phone, Bell, ShieldAlert
};

const QuadrantCard = memo(function QuadrantCard({
  quadrant,
  translations,
  phrases,
  isSelected,
  isDwelling,
  dwellProgress,
  onQuadrantSelect,
  onPhraseSelect,
  dwellingOn = null,
  densityMode = 'normal',
  isLocked = false,
}) {
  const config = QUADRANT_CONFIG[quadrant];
  // Safeguard against missing icons
  const Icon = config.icon || Activity;
  const isEmergency = quadrant === 'Emergency';

  const minH = densityMode === 'focused' ? '300px' : '260px';

  return (
    <div
      id={`quadrant-${quadrant}`}
      role="button"
      tabIndex={0}
      onClick={() => onQuadrantSelect(quadrant)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onQuadrantSelect(quadrant);
        }
      }}
      className={`relative overflow-hidden rounded-[28px] border-2 p-6 text-left transition-all duration-300 ${
        isSelected
          ? 'scale-[1.02]'
          : 'hover:-translate-y-1'
      } ${isEmergency ? 'animate-breathe' : ''}`}
      style={{
        minHeight: minH,
        background: isSelected
          ? `linear-gradient(135deg, ${config.color}22 0%, ${config.color}10 100%)`
          : `linear-gradient(135deg, ${config.color}14 0%, ${config.color}06 100%)`,
        borderColor: isSelected || isDwelling
          ? (isLocked && isDwelling ? '#00ffaa' : config.color)
          : `${config.color}88`,
        boxShadow: isSelected
          ? `0 0 32px ${config.color}55, inset 0 0 24px ${config.color}12`
          : isDwelling
          ? `0 0 20px ${config.color}44`
          : `0 0 0 1px ${config.color}22, inset 0 0 40px ${config.color}08`,
      }}
    >
      <span className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2" style={{ borderColor: config.color }} />
      <span className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2" style={{ borderColor: config.color }} />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <div
            className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2"
            style={{
              borderColor: `${config.color}99`,
              backgroundColor: `${config.color}20`,
              color: config.color,
              boxShadow: `0 0 16px ${config.color}33`,
            }}
          >
            <Icon size={28} />
          </div>

          <h3
            className="font-display text-3xl font-bold text-white"
            style={{ textShadow: `0 0 20px ${config.color}66` }}
          >
            {translations[quadrant] || quadrant}
          </h3>

          <p className="mt-2 max-w-sm text-sm" style={{ color: `${config.color}cc` }}>
            {config.hint}
          </p>
        </div>
        <DwellRing progress={isDwelling ? dwellProgress : 0} color={config.color} />
      </div>

      <div className="relative z-10 mt-8">
        <div
          className="mb-3 text-xs uppercase tracking-[0.28em] font-semibold"
          style={{ color: isSelected ? config.color : 'rgba(255,255,255,0.5)' }}
        >
          {isSelected ? '↓ Choose phrase' : 'Gaze or click to expand'}
        </div>

        {isSelected ? (
          <PhraseChips
            quadrant={quadrant}
            phrases={phrases}
            translations={translations}
            onPhraseSelect={onPhraseSelect}
            dwellingOn={dwellingOn}
            dwellProgress={dwellProgress}
            isLocked={isLocked}
          />
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {phrases.slice(0, 4).map((phrase) => (
              <div
                key={phrase.label}
                id={`preview-${quadrant}-${phrase.label.replace(' ', '_')}`}
                className="rounded-2xl px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  border: `1px solid ${dwellingOn?.includes(phrase.label) ? config.color : `${config.color}44`}`,
                  background: dwellingOn?.includes(phrase.label) ? `${config.color}20` : `${config.color}12`,
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                {phrase.emoji || '💬'} {translations[phrase.label] || phrase.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 15% 20%, ${config.color}30, transparent 45%), radial-gradient(ellipse at 85% 80%, ${config.color}20, transparent 45%)`,
        }}
      />
    </div>
  );
});

export default QuadrantCard;

QuadrantCard.propTypes = {
  quadrant: PropTypes.string.isRequired,
  translations: PropTypes.object.isRequired,
  phrases: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      emoji: PropTypes.string,
      icon: PropTypes.any
    })
  ).isRequired,
  isSelected: PropTypes.bool.isRequired,
  isDwelling: PropTypes.bool.isRequired,
  dwellProgress: PropTypes.number.isRequired,
  onQuadrantSelect: PropTypes.func.isRequired,
  onPhraseSelect: PropTypes.func.isRequired,
  dwellingOn: PropTypes.string,
  densityMode: PropTypes.string,
};
