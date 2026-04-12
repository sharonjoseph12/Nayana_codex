const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

const LANG_VOICE_IDS = {
  en: 'EXAVITQu4vr4xnSDxMaL',
  hi: 'EXAVITQu4vr4xnSDxMaL',
  kn: 'EXAVITQu4vr4xnSDxMaL',
  ta: 'EXAVITQu4vr4xnSDxMaL',
};

const LANG_TO_ELEVENLABS = {
  en: 'en',
  hi: 'hi',
  kn: 'kn',
  ta: 'ta',
};

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, lang = 'en', voiceId } = req.body || {};
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'PASTE_YOUR_KEY_HERE';

  if (ELEVENLABS_API_KEY === 'PASTE_YOUR_KEY_HERE') {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY is not configured on the server' });
  }

  const languageCode = LANG_TO_ELEVENLABS[lang] || 'en';

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || LANG_VOICE_IDS[lang] || ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: errorText || 'ElevenLabs request failed',
      });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioBuffer);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
