const ELEVENLABS_API_KEY = 'SERVER_MANAGED';
const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
const ELEVENLABS_URL = '/api/elevenlabs';

const LANG_VOICE_IDS = {
  en: 'EXAVITQu4vr4xnSDxMaL',
  hi: 'EXAVITQu4vr4xnSDxMaL',
  kn: 'EXAVITQu4vr4xnSDxMaL',
  ta: 'EXAVITQu4vr4xnSDxMaL',
};

export { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_URL, LANG_VOICE_IDS };

export async function synthesizeWithElevenLabs(text, lang = 'en', signal) {
  const response = await fetch(ELEVENLABS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal, // AbortSignal — cancels mid-fetch if a new speak() call arrives
    body: JSON.stringify({
      text,
      lang,
      voiceId: LANG_VOICE_IDS[lang] || ELEVENLABS_VOICE_ID,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `ElevenLabs error ${response.status}`);
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}

