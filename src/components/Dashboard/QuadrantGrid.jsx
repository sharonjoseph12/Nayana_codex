import React from 'react';
import PropTypes from 'prop-types';
import QuadrantCard from './QuadrantCard';
import PhraseGrid from './PhraseGrid';
import AdaptiveSuggestionBar from './AdaptiveSuggestionBar';
import { QUADRANT_CONFIG, PHRASES } from '../../constants/phrases';

/**
 * Phase 34: Clinical Quadrant Grid (Hardened Orchestration)
 * Corrects import resolution and prop-interfaces for QuadrantCard.
 */
export default function QuadrantGrid({
  selectedQuadrant,
  dwellingOn,
  dwellProgress,
  isLocked,
  onQuadrantSelect,
  onPhraseSelect,
  translations,
  densityMode = 'normal',
  lastSelectedPhrase,
  aiSuggestions = []
}) {
  const showDetail = !!selectedQuadrant;

  return (
    <div className="flex h-full flex-col p-4 sm:p-6 lg:p-8">
      {/* 🔮 Phase 22: Predictive AI Suggestions Bar */}
      {!showDetail && (
        <AdaptiveSuggestionBar 
          suggestions={aiSuggestions}
          onPhraseSelect={onPhraseSelect}
          dwellingOn={dwellingOn}
          dwellProgress={dwellProgress}
        />
      )}

      {!showDetail ? (
        <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-4 sm:gap-6 lg:gap-8">
          {Object.entries(QUADRANT_CONFIG).map(([key, config]) => (
            <QuadrantCard
              key={key}
              quadrant={key}
              translations={translations}
              phrases={PHRASES[key]}
              isSelected={selectedQuadrant === key}
              isDwelling={dwellingOn === `quadrant-${key}`}
              dwellProgress={dwellProgress}
              onQuadrantSelect={onQuadrantSelect}
              onPhraseSelect={onPhraseSelect}
              dwellingOn={dwellingOn}
              densityMode={densityMode}
              isLocked={isLocked}
            />
          ))}
        </div>
      ) : (
        <PhraseGrid
          quadrant={selectedQuadrant}
          config={QUADRANT_CONFIG[selectedQuadrant]}
          phrases={PHRASES[selectedQuadrant]}
          dwellingOn={dwellingOn}
          dwellProgress={dwellProgress}
          isLocked={isLocked}
          onPhraseSelect={(phrase) => onPhraseSelect(selectedQuadrant, phrase)}
          onBack={() => onQuadrantSelect(null)}
          translations={translations}
          densityMode={densityMode}
          lastSelectedPhrase={lastSelectedPhrase}
        />
      )}
    </div>
  );
}

QuadrantGrid.propTypes = {
  selectedQuadrant: PropTypes.string,
  dwellingOn: PropTypes.string,
  dwellProgress: PropTypes.number,
  isLocked: PropTypes.bool,
  onQuadrantSelect: PropTypes.func.isRequired,
  onPhraseSelect: PropTypes.func.isRequired,
  translations: PropTypes.object.isRequired,
  densityMode: PropTypes.string,
  lastSelectedPhrase: PropTypes.string,
  aiSuggestions: PropTypes.arrayOf(PropTypes.object),
};
