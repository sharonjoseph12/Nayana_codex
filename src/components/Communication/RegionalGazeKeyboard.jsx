import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronRight, Delete, Volume2, Globe } from 'lucide-react';

const HINDI_LAYOUT = [
  { label: 'अ-औ', chars: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'] },
  { label: 'क-ङ', chars: ['क', 'ख', 'ग', 'घ', 'ङ'] },
  { label: 'च-ञ', chars: ['च', 'छ', 'ज', 'झ', 'ञ'] },
  { label: 'ट-ण', chars: ['ट', 'ठ', 'ड', 'ढ', 'ण'] },
  { label: 'त-न', chars: ['त', 'थ', 'द', 'ध', 'न'] },
  { label: 'प-म', chars: ['प', 'फ', 'ब', 'भ', 'म'] },
  { label: 'य-व', chars: ['य', 'र', 'ल', 'व'] },
  { label: 'श-ह', chars: ['श', 'ष', 'स', 'ह'] },
  { label: 'ा-ो', chars: ['ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं'] },
  { label: '१-०', chars: ['१', '२', '३', '४', '५', '६', '७', '८', '९', '०'] },
];

const KANNADA_LAYOUT = [
  { label: 'ಅ-ಔ', chars: ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ'] },
  { label: 'ಕ-ಙ', chars: ['ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ'] },
  { label: 'ಚ-ಞ', chars: ['ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ'] },
  { label: 'ಟ-ಣ', chars: ['ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ'] },
  { label: 'ತ-ನ', chars: ['ತ', 'ಥ', 'ದ', 'ಧ', 'ನ'] },
  { label: 'ಪ-ಮ', chars: ['ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ'] },
  { label: 'ಯ-ಳ', chars: ['ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ', 'ಸ', 'ಹ', 'ಳ'] },
  { label: 'ಾ-ೋ', chars: ['ಾ', 'ಿ', 'ೀ', 'ು', 'ೂ', 'ೃ', 'ೆ', 'ೇ', 'ೈ', 'ೊ', 'ೋ', 'ೌ', 'ಂ'] },
  { label: '೧-೦', chars: ['೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯', '೦'] },
];

/**
 * Phase 28: Regional Gaze Keyboard
 * Supports phonetic bucketing for Hindi and Kannada scripts.
 */
export default function RegionalGazeKeyboard({ 
  language = 'hi', 
  onType, 
  onBackspace, 
  onClear,
  onSpeak, 
  currentText = '', 
  dwellingOn = null, 
  dwellProgress = 0,
  onClose
}) {
  const [activeGroup, setActiveGroup] = useState(null);
  const layout = language === 'hi' ? HINDI_LAYOUT : KANNADA_LAYOUT;

  const handleGroupSelect = (group) => {
    setActiveGroup(group);
  };

  const handleCharSelect = (char) => {
    onType(char);
    setActiveGroup(null);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-8 animate-fade-in bg-[#080808] rounded-[48px] border border-white/10 select-none">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className={`p-4 rounded-3xl bg-medical/10 text-medical`}>
               <Globe size={32} />
            </div>
            <div>
               <h2 className="text-3xl font-bold text-white">{language === 'hi' ? 'हिंदी कीबोर्ड' : 'ಕನ್ನಡ ಕೀಬೋರ್ಡ್'}</h2>
               <p className="text-xs text-white/20 uppercase tracking-[0.3em] font-mono">Regional Gaze Expression</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button 
              id="key-clear"
              className={`p-4 rounded-3xl bg-white/5 border border-white/10 text-white/40 hover:text-emergency transition-all ${dwellingOn === 'key-clear' ? 'scale-110 border-emergency/50 bg-emergency/10' : ''}`}
              onClick={onClear}
            >
              <Delete size={24} />
            </button>
            <button 
              id="key-close-group"
              onClick={() => activeGroup ? setActiveGroup(null) : onClose()}
              className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest hover:bg-white/10 transition"
            >
              {activeGroup ? 'Back' : 'Exit'}
            </button>
         </div>
      </div>

      <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[40px] p-8 flex flex-col justify-center gap-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {!activeGroup ? (
            layout.map((group, idx) => {
              const elementId = `key-k${idx + 1}`;
              const isDwelling = dwellingOn === elementId;
              
              return (
                <button
                  key={group.label}
                  id={elementId}
                  onClick={() => handleGroupSelect(group)}
                  className={`relative h-24 rounded-[32px] border transition-all duration-300 flex flex-col items-center justify-center gap-1 group ${isDwelling ? 'border-medical bg-medical/10 scale-[1.05] shadow-glow-sm' : 'border-white/5 bg-white/[0.03] hover:border-white/20'}`}
                >
                  <span className={`text-2xl font-bold ${isDwelling ? 'text-medical' : 'text-white/60'}`}>{group.label}</span>
                  {isDwelling && (
                    <div className="absolute inset-x-6 bottom-4 h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-medical shadow-cyan transition-all duration-100 ease-linear" style={{ width: `${dwellProgress}%` }} />
                    </div>
                  )}
                </button>
              );
            })
          ) : (
            activeGroup.chars.map((char, idx) => {
              const elementId = `sub-${idx}`;
              const isDwelling = dwellingOn === elementId;

              return (
                <button
                  key={char}
                  id={elementId}
                  onClick={() => handleCharSelect(char)}
                  className={`relative h-24 rounded-[32px] border transition-all duration-300 flex items-center justify-center group ${isDwelling ? 'border-stable-green bg-stable-green/10 scale-[1.05] shadow-glow-sm' : 'border-white/5 bg-white/[0.03] hover:border-white/20'}`}
                >
                  <span className={`text-4xl font-bold ${isDwelling ? 'text-stable-green' : 'text-white'}`}>{char}</span>
                  {isDwelling && (
                    <div className="absolute inset-x-6 bottom-4 h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-stable-green shadow-green transition-all duration-100 ease-linear" style={{ width: `${dwellProgress}%` }} />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 p-6 bg-white/[0.03] border border-white/5 rounded-[32px]">
         <div className="flex-1 text-4xl font-bold text-white px-4 leading-relaxed font-display h-20 overflow-hidden text-ellipsis whitespace-nowrap">
            {currentText || (language === 'hi' ? 'यहाँ टाइप करें...' : 'ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...')}
         </div>
         <button 
           id="key-speak"
           onClick={onSpeak}
           className={`h-24 px-12 rounded-[28px] bg-medical text-black flex items-center gap-4 transition-all hover:scale-[1.02] ${dwellingOn === 'key-speak' ? 'shadow-glow-sm scale-110' : ''}`}
         >
            <Volume2 size={32} />
            <span className="text-xl font-black uppercase tracking-widest">{language === 'hi' ? 'बोलें' : 'ಮಾತನಾಡಿ'}</span>
         </button>
      </div>
    </div>
  );
}

RegionalGazeKeyboard.propTypes = {
  language: PropTypes.oneOf(['hi', 'kn']),
  onType: PropTypes.func.isRequired,
  onBackspace: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onSpeak: PropTypes.func.isRequired,
  currentText: PropTypes.string,
  dwellingOn: PropTypes.string,
  dwellProgress: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};
