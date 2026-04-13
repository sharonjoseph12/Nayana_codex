import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Delete, MessageCircle, Send, X, Space } from 'lucide-react';

/**
 * Phase 23: Gaze-Optimized Big-Target Keyboard
 */
const KEY_MAP = [
  { id: 'k1', label: 'ABC', letters: ['A', 'B', 'C'] },
  { id: 'k2', label: 'DEF', letters: ['D', 'E', 'F'] },
  { id: 'k3', label: 'GHI', letters: ['G', 'H', 'I'] },
  { id: 'k4', label: 'JKL', letters: ['J', 'K', 'L'] },
  { id: 'k5', label: 'MNO', letters: ['M', 'N', 'O'] },
  { id: 'k6', label: 'PQRS', letters: ['P', 'Q', 'R', 'S'] },
  { id: 'k7', label: 'TUV', letters: ['T', 'U', 'V'] },
  { id: 'k8', label: 'WXYZ', letters: ['W', 'X', 'Y', 'Z'] },
  { id: 'k9', label: 'SPACE', letters: [' '], icon: <Space size={24} /> },
  { id: 'k10', label: 'BACK', letters: ['BACK'], icon: <Delete size={24} /> },
];

export default function GazeKeyboard({ 
  onType, 
  onBackspace, 
  onClear,
  onSpeak,
  dwellingOn, 
  dwellProgress 
}) {
  const [activeGroup, setActiveGroup] = useState(null);

  const handleGroupSelect = (group) => {
    if (group.letters.length === 1) {
      if (group.label === 'SPACE') onType(' ');
      else if (group.label === 'BACK') onBackspace();
      return;
    }
    setActiveGroup(group);
  };

  const handleLetterSelect = (letter) => {
    onType(letter);
    setActiveGroup(null);
  };

  return (
    <div className="flex h-full flex-col gap-6 animate-fade-in">
      {!activeGroup ? (
        <div className="grid grid-cols-3 gap-6 flex-1">
          {KEY_MAP.map((key) => {
            const isDwelling = dwellingOn === `key-${key.id}`;
            return (
              <button
                key={key.id}
                id={`key-${key.id}`}
                onClick={() => handleGroupSelect(key)}
                className={`flex flex-col items-center justify-center rounded-[32px] border border-white/[0.08] bg-white/[0.03] transition-all hover:bg-white/[0.08] hover:scale-[1.02] ${isDwelling ? 'border-medical/50 scale-[1.02] shadow-glow-sm' : ''}`}
              >
                {key.icon ? (
                  <div className="text-white/40">{key.icon}</div>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-white mb-1">{key.label}</span>
                    <span className="text-[10px] font-mono tracking-[0.4em] text-white/20 uppercase">{key.letters.join(' ')}</span>
                  </>
                )}
                
                {isDwelling && (
                  <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
                     <div 
                       className="absolute bottom-0 left-0 h-1.5 bg-medical transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(0,212,255,0.6)]"
                       style={{ width: `${dwellProgress}%` }}
                     />
                  </div>
                )}
              </button>
            );
          })}
          
          <button
            id="key-speak"
            onClick={onSpeak}
            className={`flex flex-col items-center justify-center rounded-[32px] border border-medical/20 bg-medical/10 text-medical transition-all hover:bg-medical/20 ${dwellingOn === 'key-speak' ? 'border-medical scale-[1.02] shadow-cyan' : ''}`}
          >
            <MessageCircle size={32} className="mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest">Speak All</span>
            {dwellingOn === 'key-speak' && (
              <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
                 <div className="absolute bottom-0 left-0 h-1.5 bg-medical w-full opacity-30" style={{ width: `${dwellProgress}%` }} />
              </div>
            )}
          </button>

          <button
            id="key-clear"
            onClick={onClear}
            className={`flex flex-col items-center justify-center rounded-[32px] border border-emergency/20 bg-emergency/5 text-emergency transition-all hover:bg-emergency/10 ${dwellingOn === 'key-clear' ? 'border-emergency scale-[1.02] shadow-red' : ''}`}
          >
            <X size={32} className="mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest">Reset</span>
             {dwellingOn === 'key-clear' && (
              <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
                 <div className="absolute bottom-0 left-0 h-1.5 bg-emergency w-full opacity-30" style={{ width: `${dwellProgress}%` }} />
              </div>
            )}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 animate-scale-in">
           <div className="flex items-center justify-between px-6">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">Selecting from {activeGroup.label}</span>
              <button 
                id="key-close-group"
                onClick={() => setActiveGroup(null)}
                className={`p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition ${dwellingOn === 'key-close-group' ? 'border-medical' : ''}`}
              >
                <X size={20} />
              </button>
           </div>
           
           <div className="grid grid-cols-2 gap-6 flex-1">
              {activeGroup.letters.map((letter, idx) => {
                const id = `sub-${idx}`;
                const isDwelling = dwellingOn === id;
                return (
                  <button
                    key={letter}
                    id={id}
                    onClick={() => handleLetterSelect(letter)}
                    className={`flex flex-col items-center justify-center rounded-[32px] border border-white/[0.1] bg-white/[0.05] transition-all hover:bg-white/[0.1] ${isDwelling ? 'border-medical scale-[1.05] shadow-glow-md' : ''}`}
                  >
                    <span className="text-6xl font-black text-white">{letter}</span>
                    {isDwelling && (
                      <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
                         <div className="absolute bottom-0 left-0 h-2 bg-medical transition-all duration-100 ease-linear" style={{ width: `${dwellProgress}%` }} />
                      </div>
                    )}
                  </button>
                );
              })}
           </div>
        </div>
      )}
    </div>
  );
}

GazeKeyboard.propTypes = {
  onType: PropTypes.func.isRequired,
  onBackspace: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onSpeak: PropTypes.func.isRequired,
  dwellingOn: PropTypes.string,
  dwellProgress: PropTypes.number,
};
