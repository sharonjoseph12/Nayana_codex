import React from 'react';
import PropTypes from 'prop-types';
import QuadrantCard from './QuadrantCard';
import PhraseGrid from './PhraseGrid';
import AdaptiveSuggestionBar from './AdaptiveSuggestionBar';
import { Star } from 'lucide-react';
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
  densityMode = 'normal',
  lastSelectedPhrase,
  aiSuggestions = [],
  favorites = [],
  onToggleFavorite,
  translations = {}
}) {
  const showDetail = !!selectedQuadrant;

  // Extra logic: Extract pinned phrases for THE HOME VIEW (optional)
  // But plan says "at top of each quadrant's phrase list", so let's do that in PhraseGrid/Chips.
  // Actually, let's also show a global "Pinned" bar on the dashboard if any exist.
  const pinnedPhrases = []; // Logic to find phrases across all quadrants that are in favorites
  Object.entries(PHRASES).forEach(([qKey, pList]) => {
    pList.forEach(p => { if (favorites.includes(p.label)) pinnedPhrases.push({ ...p, quadrant: qKey }); });
  });

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

      {!showDetail && pinnedPhrases.length > 0 && (
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-3 px-2">
            <Star size={12} className="text-yellow-400 fill-yellow-400/20" />
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Pinned Phrases</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {pinnedPhrases.map(p => (
              <button
                key={`${p.quadrant}-${p.label}`}
                onClick={() => onPhraseSelect(p.quadrant, p.label)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[11px] font-bold text-white/70 hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <p.icon size={14} style={{ color: QUADRANT_CONFIG[p.quadrant].color }} />
                {translations[p.label] || p.label}
              </button>
            ))}
          </div>
        </div>
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
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
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
