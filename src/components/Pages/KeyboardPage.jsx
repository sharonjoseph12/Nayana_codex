import React, { useState } from 'react';
import PropTypes from 'prop-types';
import GazeKeyboard from '../Communication/GazeKeyboard';
import RegionalGazeKeyboard from '../Communication/RegionalGazeKeyboard';
import { Globe, Type } from 'lucide-react';

/**
 * Phase 28: Global Keyboard Portal
 * Orchestrates English and Regional (Hindi/Kannada) custom expression.
 */
export default function KeyboardPage({ 
  dwellingOn, 
  dwellProgress, 
  onSentenceComplete 
}) {
  const [inputText, setInputText] = useState('');
  const [keyboardLang, setKeyboardLang] = useState('en'); // 'en' | 'hi' | 'kn'

  const handleInput = (char) => {
    setInputText(prev => prev + char);
  };

  const handleBackspace = () => {
    setInputText(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInputText('');
  };

  const handleSpeak = () => {
    if (!inputText.trim()) return;
    onSentenceComplete(inputText);
    setInputText('');
  };

  const toggleLanguage = () => {
    const sequence = ['en', 'hi', 'kn'];
    const nextIndex = (sequence.indexOf(keyboardLang) + 1) % sequence.length;
    setKeyboardLang(sequence[nextIndex]);
    setInputText(''); // Clear on lang change to prevent script mixing
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-medical/10 text-medical">
               <Type size={24} />
            </div>
            <div>
               <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Expressive Keyboard</h1>
               <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-stable-green" />
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">
                     Targeting Mode: {keyboardLang.toUpperCase()}
                  </span>
               </div>
            </div>
         </div>

         {/* Language Toggle - Large Gaze Target */}
         <button 
           id="key-lang-toggle"
           onClick={toggleLanguage}
           className={`group flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-500 ${dwellingOn === 'key-lang-toggle' ? 'border-medical bg-medical/10 scale-110 shadow-glow-sm' : 'border-white/10 bg-white/5 text-white/40'}`}
         >
            <div className={`p-2 rounded-xl bg-white/5 group-hover:bg-medical/20 transition-colors`}>
               <Globe size={16} className={dwellingOn === 'key-lang-toggle' ? 'text-medical' : ''} />
            </div>
            <div className="flex flex-col items-start leading-none">
               <span className="text-[10px] font-bold uppercase tracking-widest">Toggle Language</span>
               <span className={`text-[12px] font-black uppercase mt-1 ${dwellingOn === 'key-lang-toggle' ? 'text-medical' : 'text-white'}`}>
                  {keyboardLang === 'en' ? 'ENGLISH' : keyboardLang === 'hi' ? 'हिन्दी' : 'ಕನ್ನಡ'}
               </span>
            </div>
         </button>
      </div>

      <div className="flex-1 min-h-0">
        {keyboardLang === 'en' ? (
          <GazeKeyboard 
            onType={handleInput} 
            onBackspace={handleBackspace}
            onClear={handleClear}
            onSpeak={handleSpeak} 
            currentText={inputText} 
            dwellingOn={dwellingOn} 
            dwellProgress={dwellProgress} 
          />
        ) : (
          <RegionalGazeKeyboard 
            language={keyboardLang}
            onType={handleInput} 
            onBackspace={handleBackspace}
            onClear={handleClear}
            onSpeak={handleSpeak} 
            currentText={inputText} 
            dwellingOn={dwellingOn} 
            dwellProgress={dwellProgress}
            onClose={() => setKeyboardLang('en')}
          />
        )}
      </div>

      <div className="flex justify-center">
         <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.5em] animate-pulseSoft">
            Neural Phonetic Engine Active
         </p>
      </div>
    </div>
  );
}

KeyboardPage.propTypes = {
  dwellingOn: PropTypes.string,
  dwellProgress: PropTypes.number,
  onSentenceComplete: PropTypes.func.isRequired,
};
