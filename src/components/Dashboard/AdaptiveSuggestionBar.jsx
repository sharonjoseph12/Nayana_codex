import React from 'react';
import PropTypes from 'prop-types';
import { Sparkles, Activity, PlusCircle } from 'lucide-react';
import { encodeTrackableValue } from '../../constants/config';

/**
 * Phase 22: Adaptive Suggestion Bar
 * Displays 3 AI-predicted phrases at the top of the grid for low-energy selection.
 */
export default function AdaptiveSuggestionBar({ 
  suggestions = [], 
  onPhraseSelect, 
  dwellingOn, 
  dwellProgress 
}) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 animate-fade-in-up">
      <div className="flex items-center gap-2 px-1">
         <Sparkles size={14} className="text-medical animate-pulse" />
         <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">AI PREDICTED NEEDS</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {suggestions.map((item, index) => {
          const isDwelling = dwellingOn === `predict-${index}`;
          const trackId = `phrase-${item.quadrant}-${encodeTrackableValue(item.phrase)}`;
          
          return (
            <button
              key={index}
              id={`predict-${index}`}
              data-tracking-id={trackId}
              onClick={() => onPhraseSelect(item.quadrant, item.phrase)}
              className={`relative group overflow-hidden flex flex-col items-center justify-center py-5 transition-all duration-300 rounded-[28px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:scale-[1.02] active:scale-[0.98] ${isDwelling ? 'border-medical/40' : ''}`}
            >
              {/* Neural Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-medical/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col items-center gap-1">
                 <span className="text-lg font-bold text-white group-hover:text-medical transition-colors">{item.phrase}</span>
                 <div className="flex items-center gap-1 opacity-30 text-[8px] font-mono uppercase tracking-widest">
                    <Activity size={8} /> {item.confidence || 80}% Fit
                 </div>
              </div>

              {/* Dwell Progress Ring (Inner) */}
              {isDwelling && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-medical shadow-[0_0_10px_rgba(0,212,255,0.8)] transition-all duration-100 ease-linear"
                  style={{ width: `${dwellProgress}%` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

AdaptiveSuggestionBar.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.object),
  onPhraseSelect: PropTypes.func.isRequired,
  dwellingOn: PropTypes.string,
  dwellProgress: PropTypes.number,
};
