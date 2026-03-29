import twilio from 'twilio';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN || !process.env.CAREGIVER_NUMBER) {
    return res.status(200).json({
      success: true,
      simulated: true,
    });
  }

  try {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${process.env.CAREGIVER_NUMBER}`,
      body: message,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
