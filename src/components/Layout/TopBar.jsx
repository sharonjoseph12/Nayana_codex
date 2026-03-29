import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Eye,
  MicOff,
  MonitorPlay,
  MousePointer2,
  Presentation,
  Volume2,
  Waves,
} from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../../constants/config';
import { webrtcManager } from '../../services/webrtc';

export default function TopBar({
  patient,
  currentLanguage,
  setCurrentLanguage,
  trackingMode,
  gazeAccuracy,
  faceDetected,
  isMuted,
  toggleMute,
  autoSpeak,
  setAutoSpeak,
  voiceMode,
  setVoiceMode,
  elevenLabsAvailable,
  isDemoRunning,
  startDemo,
  presentationMode,
  setPresentationMode,
  startEyeTracking,
  stopEyeTracking,
}) {
  const [time, setTime] = useState(() => new Date());
  const [sessionCode, setSessionCode] = useState(null);
  const [isInitializingCode, setIsInitializingCode] = useState(false);

  const handleGenerateRemoteCode = async () => {
    setIsInitializingCode(true);
    try {
      const code = await webrtcManager.initHost();
      setSessionCode(code);
    } catch (error) {
      console.error('Failed to generate code:', error);
    } finally {
      setIsInitializingCode(false);
    }
  };

  useEffect(() => {
    const interval = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="panel mx-4 mt-4 flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl border border-medical/20 bg-medical/10 px-4 py-3">
          <div className="font-display text-2xl text-white">Nayana</div>
          <div className="text-xs uppercase tracking-[0.28em] text-medical/75">Assistive ICU Console</div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">Patient</div>
          <div className="text-sm text-white">
            {patient.name} - {patient.condition} - {patient.room}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
          {LANGUAGE_OPTIONS.map((language) => (
            <button
              key={language.id}
              type="button"
              onClick={() => setCurrentLanguage(language.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                currentLanguage === language.id
                  ? 'bg-white text-[#0d0d0d]'
                  : 'text-white/55 hover:bg-white/5 hover:text-white'
              }`}
            >
              {language.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => (trackingMode === 'eye' ? stopEyeTracking() : startEyeTracking())}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70"
        >
          {trackingMode === 'eye' ? <Eye size={16} /> : <MousePointer2 size={16} />}
          {trackingMode === 'eye' ? 'Eye Mode' : 'Mouse Mode'}
        </button>

        <div className="rounded-full border border-medical/20 bg-medical/10 px-4 py-2 text-xs text-medical">
          {trackingMode === 'eye' ? `${gazeAccuracy}% accuracy` : 'Fallback active'} - {faceDetected ? 'Face detected' : 'Awaiting face'}
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70"
        >
          {isMuted ? <MicOff size={16} /> : <Volume2 size={16} />}
          {isMuted ? 'Muted' : 'Voice On'}
        </button>

        <button
          type="button"
          onClick={() => setVoiceMode((previous) => (previous === 'elevenlabs' ? 'browser' : 'elevenlabs'))}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-mono transition ${
            voiceMode === 'elevenlabs'
              ? 'border-medical/35 bg-medical/10 text-medical'
              : 'border-white/15 bg-white/[0.05] text-white/45'
          }`}
        >
          <span>{voiceMode === 'elevenlabs' ? 'Voice AI' : 'Browser'}</span>
          <span>{voiceMode === 'elevenlabs' ? 'ElevenLabs' : 'Speech'}</span>
        </button>

        {voiceMode === 'elevenlabs' && elevenLabsAvailable ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-social/20 bg-social/10 px-3 py-2 text-[10px] font-mono text-social">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-social" />
            MULTILINGUAL ACTIVE
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setAutoSpeak((previous) => !previous)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
            autoSpeak ? 'border-social/25 bg-social/10 text-social' : 'border-white/10 text-white/70'
          }`}
        >
          <Waves size={16} />
          Auto Speak
        </button>

        <button
          type="button"
          onClick={startDemo}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
            isDemoRunning ? 'border-emergency/25 bg-emergency/10 text-emergency' : 'border-white/10 text-white/70'
          }`}
        >
          <MonitorPlay size={16} />
          {isDemoRunning ? 'Stop Demo' : 'Auto Demo'}
        </button>

        <button
          type="button"
          onClick={() => setPresentationMode((previous) => !previous)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
            presentationMode ? 'border-white/20 bg-white/10 text-white' : 'border-white/10 text-white/70'
          }`}
        >
          <Presentation size={16} />
          Present
        </button>

        {!sessionCode ? (
          <button
            type="button"
            onClick={handleGenerateRemoteCode}
            disabled={isInitializingCode}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm text-white transition-colors"
          >
            {isInitializingCode ? 'Generating...' : 'Enable Remote'}
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-4 py-2 text-sm font-bold text-[#00d4ff] font-mono shadow-[0_0_10px_rgba(0,212,255,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse"></span>
              CODE: {sessionCode}
            </div>
            <a 
              href="/caretaker" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm text-white transition-colors"
            >
              Open Caretaker Web ↗
            </a>
          </>
        )}

        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white">
          {time.toLocaleTimeString('en-IN')}
        </div>
      </div>
    </header>
  );
}

TopBar.propTypes = {
  patient: PropTypes.object.isRequired,
  currentLanguage: PropTypes.string.isRequired,
  setCurrentLanguage: PropTypes.func.isRequired,
  trackingMode: PropTypes.string.isRequired,
  gazeAccuracy: PropTypes.number.isRequired,
  faceDetected: PropTypes.bool.isRequired,
  isMuted: PropTypes.bool.isRequired,
  toggleMute: PropTypes.func.isRequired,
  autoSpeak: PropTypes.bool.isRequired,
  setAutoSpeak: PropTypes.func.isRequired,
  voiceMode: PropTypes.oneOf(['elevenlabs', 'browser']).isRequired,
  setVoiceMode: PropTypes.func.isRequired,
  elevenLabsAvailable: PropTypes.bool.isRequired,
  isDemoRunning: PropTypes.bool.isRequired,
  startDemo: PropTypes.func.isRequired,
  presentationMode: PropTypes.bool.isRequired,
  setPresentationMode: PropTypes.func.isRequired,
  startEyeTracking: PropTypes.func.isRequired,
  stopEyeTracking: PropTypes.func.isRequired,
};
