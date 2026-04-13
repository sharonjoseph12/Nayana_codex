import { useCallback, useEffect, useRef, useState } from 'react';
import { LANG_CODES } from '../constants/translations';
import {
  ELEVENLABS_API_KEY,
  synthesizeWithElevenLabs,
} from '../services/elevenlabs';

export function useSpeech() {
  const currentAudio = useRef(null);
  const currentAudioUrl = useRef(null);
  // AbortController for any in-flight ElevenLabs fetch — hard-cancels mid-request
  const fetchAbortController = useRef(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceMode, setVoiceModeState] = useState(
    () => window.localStorage.getItem('nayana_voice_mode') || 'elevenlabs'
  );
  const [autoSpeak, setAutoSpeakState] = useState(
    () => window.localStorage.getItem('nayana_autospeak') !== 'false'
  );
  const [activeSpeechLanguage, setActiveSpeechLanguage] = useState('en');
  const [elevenLabsAvailable, setElevenLabsAvailable] = useState(true);

  // Initialize the absolute global singleton if needed
  if (typeof window !== 'undefined' && !window.__nayana_speech_lock) {
    window.__nayana_speech_lock = { text: '', timestamp: 0 };
  }

  const releaseCurrentAudio = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.src = '';
      currentAudio.current.load();
      currentAudio.current = null;
    }
    if (currentAudioUrl.current) {
      URL.revokeObjectURL(currentAudioUrl.current);
      currentAudioUrl.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
      releaseCurrentAudio();
    },
    [releaseCurrentAudio]
  );

  const setAutoSpeak = useCallback((valueOrUpdater) => {
    setAutoSpeakState((previous) => {
      const next =
        typeof valueOrUpdater === 'function' ? valueOrUpdater(previous) : valueOrUpdater;
      window.localStorage.setItem('nayana_autospeak', String(next));
      return next;
    });
  }, []);

  const setVoiceMode = useCallback((valueOrUpdater) => {
    setVoiceModeState((previous) => {
      const next =
        typeof valueOrUpdater === 'function' ? valueOrUpdater(previous) : valueOrUpdater;
      window.localStorage.setItem('nayana_voice_mode', next);
      return next;
    });
  }, []);

  // Stops BOTH the HTML audio element AND any in-flight ElevenLabs fetch
  const cancelSpeech = useCallback(() => {
    if (fetchAbortController.current) {
      fetchAbortController.current.abort();
      fetchAbortController.current = null;
    }
    releaseCurrentAudio();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [releaseCurrentAudio]);

  const speakWithBrowser = useCallback((text, lang = 'en') => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = LANG_CODES[lang] || 'en-IN';
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((entry) => entry.lang === langCode) ||
      voices.find((entry) => entry.lang.startsWith(langCode.split('-')[0]));

    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }, []);

  const speakWithElevenLabs = useCallback(
    async (text, lang = 'en') => {
      setIsSpeaking(true);

      // Fresh AbortController for this specific request
      const controller = new AbortController();
      fetchAbortController.current = controller;

      try {
        const audioUrl = await synthesizeWithElevenLabs(text, lang, controller.signal);

        // If cancelled mid-fetch, bail out silently
        if (controller.signal.aborted) return;

        setElevenLabsAvailable(true);
        currentAudioUrl.current = audioUrl;
 
        hasPlayedRef.current = false;
        const audio = new Audio(audioUrl);
        currentAudio.current = audio;

        audio.onplay = () => {
          hasPlayedRef.current = true;
          setIsSpeaking(true);
        };
        audio.onended = () => {
          setIsSpeaking(false);
          releaseCurrentAudio();
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          releaseCurrentAudio();
          // ONLY fallback if NO audio has played yet to avoid "Repeat" effect
          if (!controller.signal.aborted && !hasPlayedRef.current) {
            speakWithBrowser(text, lang);
          }
        };

        await audio.play();
      } catch (error) {
        // AbortError = a newer speak() call cancelled this one — do nothing
        if (error?.name === 'AbortError' || controller.signal.aborted) return;

        const isQuotaError = /quota|401|403|api key/i.test(String(error?.message || ''));
        
        if (!isQuotaError) {
           console.warn('ElevenLabs error:', error);
        }
        
        releaseCurrentAudio();
        if (isQuotaError) {
          setElevenLabsAvailable(false);
        }
        setIsSpeaking(false);
        speakWithBrowser(text, lang);
      }
    },
    [releaseCurrentAudio, speakWithBrowser]
  );

  const speak = useCallback(
    async (text, lang = 'en') => {
      if (isMuted || !text) return;

      const now = Date.now();
      const globalLock = window.__nayana_speech_lock;
      
      // Strict Hardware Lock: 
      // 1. Block identical phrases within 1500ms
      // 2. Block ANY overlapping trigger within 800ms
      if (
        (text === globalLock.text && now - globalLock.timestamp < 1500) ||
        (now - globalLock.timestamp < 800)
      ) {
        return;
      }
      
      window.__nayana_speech_lock = { text, timestamp: now };
      
      setActiveSpeechLanguage(lang);
      // Hard-stop everything (abort fetch + stop audio + cancel browser TTS)
      cancelSpeech();

      if (voiceMode === 'elevenlabs' && ELEVENLABS_API_KEY !== 'PASTE_YOUR_KEY_HERE') {
        await speakWithElevenLabs(text, lang);
      } else {
        speakWithBrowser(text, lang);
      }
    },
    [cancelSpeech, isMuted, speakWithBrowser, speakWithElevenLabs, voiceMode]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((previous) => {
      if (!previous) cancelSpeech();
      return !previous;
    });
  }, [cancelSpeech]);

  return {
    isSpeaking,
    isMuted,
    autoSpeak,
    speak,
    cancelSpeech,
    toggleMute,
    setAutoSpeak,
    voiceMode,
    setVoiceMode,
    activeSpeechLanguage,
    elevenLabsAvailable,
  };
}
