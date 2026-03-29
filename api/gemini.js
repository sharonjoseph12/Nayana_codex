const GEMINI_MODEL = 'gemini-2.5-flash';

function extractText(data) {
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

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

  const { prompt, generationConfig, systemInstruction } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: generationConfig || {
      temperature: 0.4,
      maxOutputTokens: 500,
    },
  };

  // Enforce language at the system level — much stronger than prompt instructions alone
  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });


    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Gemini request failed',
      });
    }

    const text = extractText(data);
    if (!text) {
      console.error('Gemini API Full Response:', JSON.stringify(data, null, 2));
      const finishReason = data?.candidates?.[0]?.finishReason || 'Unknown';
      return res.status(502).json({ error: `Gemini returned an empty response (FinishReason: ${finishReason}). Check console for details.` });
    }

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
