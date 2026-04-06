import { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp, Mic2, RotateCcw, Sparkles, Trash2, Volume2 } from 'lucide-react';
import ConversationThread from './ConversationThread';

const LANGUAGE_BADGES = { en: 'EN', hi: 'HI', kn: 'KN', ta: 'TA' };
const LANGUAGE_LABELS = { en: 'English', hi: 'Hindi', kn: 'Kannada', ta: 'Tamil' };

const SpeechOutput = memo(function SpeechOutput({
  sentence,
  isGenerating,
  isSpeaking,
  source,
  selectedQuadrant = null,
  lastSelectedPhrase = null,
  conversationHistory,
  onSpeak,
  onRepeat,
  onClear,
  autoSpeak,
  currentLanguage,
  voiceMode,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-white/8 backdrop-blur-xl" style={{ background: 'rgba(0,0,0,0.55)' }}>

      {/* ── Compact strip (always visible) ── */}
      <div className="flex items-center gap-3 px-4 py-3">

        {/* Source badge */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-medical/25 bg-medical/10 px-2.5 py-1 text-[10px] text-medical">
          <Sparkles size={11} />
          {source === 'gemini' ? 'Gemini' : 'Fallback'}
        </div>

        {/* Sentence / status — takes remaining space */}
        <div className="min-w-0 flex-1">
          {isGenerating ? (
            <div className="flex items-center gap-2 text-white/60">
              <span className="text-sm">Thinking</span>
              <div className="flex gap-0.5">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-medical" style={{ animationDelay: `${d * 0.12}s` }} />
                ))}
              </div>
            </div>
          ) : sentence ? (
            <p className="line-clamp-3 break-words text-base leading-snug font-medium text-white">{sentence}</p>
          ) : (
            <p className="text-sm text-white/35">
              {selectedQuadrant ? `${selectedQuadrant} selected — choose a phrase` : 'Eye gaze at a quadrant to begin'}
            </p>
          )}
        </div>

        {/* Speaking wave */}
        {isSpeaking && (
          <div className="flex shrink-0 h-5 items-end gap-0.5">
            {[10, 16, 12, 18, 14].map((h, i) => (
              <span key={i} className="w-0.5 animate-pulseSoft rounded-full bg-medical" style={{ height: h, animationDelay: `${i * 0.08}s` }} />
            ))}
            <span className="ml-1 text-[9px] text-medical">{LANGUAGE_BADGES[currentLanguage]}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            id="btn-speak"
            type="button"
            onClick={onSpeak}
            disabled={!sentence}
            className="flex items-center gap-1.5 rounded-full border border-medical/30 bg-medical/10 px-3 py-1.5 text-xs text-medical disabled:opacity-40"
          >
            <Volume2 size={13} /> Speak
          </button>
          <button
            id="btn-repeat"
            type="button"
            onClick={onRepeat}
            disabled={!sentence}
            className="flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/65 disabled:opacity-40"
          >
            <RotateCcw size={13} /> Repeat
          </button>
          <button
            id="btn-clear"
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/65"
          >
            <Trash2 size={13} /> Clear
          </button>
          {/* Toggle expanded recent messages */}
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            title={expanded ? 'Hide recent messages' : 'Show recent messages'}
            className="ml-1 flex items-center gap-1 rounded-full border border-white/12 px-2.5 py-1.5 text-xs text-white/50"
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            <span className="hidden sm:inline">Messages</span>
          </button>
        </div>

        {/* Auto-speak indicator */}
        <div className="shrink-0 flex items-center gap-1 text-[10px] text-white/30">
          <Mic2 size={11} />
          {autoSpeak ? 'Auto' : 'Manual'}
        </div>
      </div>

      {/* ── Expanded: full sentence + recent messages ── */}
      {expanded && (
        <div className="grid gap-3 border-t border-white/6 px-4 pb-4 pt-3 lg:grid-cols-[1.6fr,0.9fr]">
          {/* Full sentence panel */}
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/35">
              {selectedQuadrant && lastSelectedPhrase
                ? `${selectedQuadrant} → ${lastSelectedPhrase} → AI Generated`
                : 'Awaiting patient intent'}
            </p>
            {sentence ? (
              <p className="text-xl leading-relaxed text-white">{sentence}</p>
            ) : (
              <p className="text-base text-white/30">No sentence yet — select a quadrant and phrase above.</p>
            )}
            <div className="mt-3 text-[10px] text-white/30">
              {voiceMode === 'elevenlabs' ? 'ElevenLabs' : 'Browser TTS'} · {LANGUAGE_LABELS[currentLanguage]}
            </div>
          </div>

          {/* Recent messages */}
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">Recent Messages</p>
            <ConversationThread conversationHistory={conversationHistory} />
          </div>
        </div>
      )}
    </div>
  );
});

export default SpeechOutput;

SpeechOutput.propTypes = {
  sentence: PropTypes.string.isRequired,
  isGenerating: PropTypes.bool.isRequired,
  isSpeaking: PropTypes.bool.isRequired,
  source: PropTypes.string.isRequired,
  selectedQuadrant: PropTypes.string,
  lastSelectedPhrase: PropTypes.string,
  conversationHistory: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSpeak: PropTypes.func.isRequired,
  onRepeat: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  autoSpeak: PropTypes.bool.isRequired,
  currentLanguage: PropTypes.oneOf(['en', 'hi', 'kn', 'ta']).isRequired,
  voiceMode: PropTypes.oneOf(['elevenlabs', 'browser']).isRequired,
};
