// Time-of-day phrase priority weights. Higher = shown first.
// Profile: morning (6-11), afternoon (11-17), evening (17-22), night (22-6)
export const TIME_OF_DAY_WEIGHTS = {
  morning: {
    'Medical-Medication': 10, 'Personal-Hungry': 9, 'Personal-Water': 8,
    'Medical-Pain': 7, 'Social-Hello': 6, 'Personal-Uncomfortable': 5,
  },
  afternoon: {
    'Medical-Pain': 10, 'Medical-Doctor': 8, 'Social-Talk': 7,
    'Personal-Water': 7, 'Personal-Uncomfortable': 6, 'Social-Family': 5,
  },
  evening: {
    'Social-Family': 10, 'Social-Hello': 8, 'Personal-Hungry': 8,
    'Personal-Water': 7, 'Medical-Medication': 7, 'Social-Thank You': 6,
  },
  night: {
    'Personal-Rest': 10, 'Personal-Uncomfortable': 8, 'Medical-Pain': 7,
    'Medical-Medication': 6, 'Personal-Water': 5, 'Medical-Breathe': 5,
  },
};

export function getTimeProfile() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

// Sequential prediction: after selecting a phrase, offer contextual next phrases.
// Key: "Quadrant-Phrase", Value: array of { quadrant, label } in priority order.
export const SEQUENTIAL_PREDICTIONS = {
  'Medical-Pain': [
    { quadrant: 'Medical', label: 'Medication' },
    { quadrant: 'Medical', label: 'Doctor' },
    { quadrant: 'Personal', label: 'Uncomfortable' },
  ],
  'Medical-Breathe': [
    { quadrant: 'Emergency', label: 'HELP' },
    { quadrant: 'Medical', label: 'Doctor' },
    { quadrant: 'Emergency', label: 'Alert' },
  ],
  'Medical-Medication': [
    { quadrant: 'Medical', label: 'Doctor' },
    { quadrant: 'Personal', label: 'Water' },
    { quadrant: 'Personal', label: 'Rest' },
  ],
  'Personal-Hungry': [
    { quadrant: 'Personal', label: 'Water' },
    { quadrant: 'Social', label: 'Thank You' },
    { quadrant: 'Personal', label: 'Rest' },
  ],
  'Personal-Water': [
    { quadrant: 'Personal', label: 'Hungry' },
    { quadrant: 'Social', label: 'Thank You' },
    { quadrant: 'Medical', label: 'Medication' },
  ],
  'Personal-Uncomfortable': [
    { quadrant: 'Medical', label: 'Pain' },
    { quadrant: 'Personal', label: 'Rest' },
    { quadrant: 'Medical', label: 'Doctor' },
  ],
  'Social-Hello': [
    { quadrant: 'Social', label: 'Family' },
    { quadrant: 'Social', label: 'Talk' },
    { quadrant: 'Personal', label: 'Water' },
  ],
  'Emergency-HELP': [
    { quadrant: 'Emergency', label: 'Call 112' },
    { quadrant: 'Emergency', label: 'Caregiver' },
    { quadrant: 'Medical', label: 'Doctor' },
  ],
};

export const PHRASES = {
  Medical: [
    { label: 'Pain', emoji: '🩺', severity: 3 },
    { label: 'Medication', emoji: '💊', severity: 2 },
    { label: 'Doctor', emoji: '👨‍⚕️', severity: 3 },
    { label: 'Breathe', emoji: '🫁', severity: 4 },
  ],
  Social: [
    { label: 'Hello', emoji: '👋', severity: 1 },
    { label: 'Thank You', emoji: '🙏', severity: 1 },
    { label: 'Family', emoji: '👨‍👩‍👧', severity: 1 },
    { label: 'Talk', emoji: '💬', severity: 1 },
  ],
  Personal: [
    { label: 'Water', emoji: '💧', severity: 2 },
    { label: 'Rest', emoji: '😴', severity: 1 },
    { label: 'Uncomfortable', emoji: '🛏️', severity: 2 },
    { label: 'Hungry', emoji: '🍽️', severity: 2 },
  ],
  Emergency: [
    { label: 'HELP', emoji: '🆘', severity: 4 },
    { label: 'Call 112', emoji: '📞', severity: 4 },
    { label: 'Alert', emoji: '🚨', severity: 4 },
    { label: 'Caregiver', emoji: '🧑‍⚕️', severity: 3 },
  ],
};

export const QUADRANT_CONFIG = {
  Medical: {
    color: '#00d4ff',
    bg: 'rgba(0, 212, 255, 0.08)',
    border: 'rgba(0, 212, 255, 0.25)',
    icon: 'Stethoscope',
    hint: 'Clinical requests and symptoms',
  },
  Social: {
    color: '#00ffaa',
    bg: 'rgba(0, 255, 170, 0.08)',
    border: 'rgba(0, 255, 170, 0.25)',
    icon: 'Users',
    hint: 'Human connection and comfort',
  },
  Personal: {
    color: '#bf80ff',
    bg: 'rgba(191, 128, 255, 0.08)',
    border: 'rgba(191, 128, 255, 0.25)',
    icon: 'User',
    hint: 'Personal needs and preferences',
  },
  Emergency: {
    color: '#ff3d5a',
    bg: 'rgba(255, 61, 90, 0.08)',
    border: 'rgba(255, 61, 90, 0.25)',
    icon: 'AlertTriangle',
    hint: 'Immediate escalation pathways',
  },
};

export const FALLBACK_SENTENCES = {
  'Medical-Pain': {
    en: 'I am experiencing significant pain and need immediate medical attention.',
    hi: 'मुझे बहुत तेज़ दर्द हो रहा है और मुझे तुरंत चिकित्सा सहायता चाहिए।',
    kn: 'ನನಗೆ ತೀವ್ರ ನೋವಾಗುತ್ತಿದೆ ಮತ್ತು ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಬೇಕು.',
    ta: 'எனக்கு கடுமையான வலி இருக்கிறது, உடனடியாக மருத்துவ உதவி தேவை.',
  },
  'Medical-Medication': {
    en: 'I believe it is time for my scheduled medication.',
    hi: 'मुझे लगता है मेरी दवाई का समय हो गया है।',
    kn: 'ನನ್ನ ನಿಗದಿತ ಔಷಧ ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ ಆಗಿದೆ ಎಂದು ನನಗೆ ಅನಿಸುತ್ತದೆ.',
    ta: 'என் குறிப்பிட்ட நேர மருந்து எடுக்கும் நேரம் வந்துவிட்டதாக நினைக்கிறேன்.',
  },
  'Medical-Doctor': {
    en: 'I would like a doctor to come see me right away.',
    hi: 'मैं चाहता हूँ कि डॉक्टर अभी मुझे देखने आएं।',
    kn: 'ವೈದ್ಯರು ಈಗಲೇ ನನ್ನನ್ನು ನೋಡಲು ಬರಬೇಕು.',
    ta: 'ஒரு மருத்துவர் இப்போதே என்னைப் பார்க்க வர வேண்டும்.',
  },
  'Medical-Breathe': {
    en: 'I am having difficulty breathing and need assistance.',
    hi: 'मुझे सांस लेने में तकलीफ हो रही है और सहायता चाहिए।',
    kn: 'ನನಗೆ ಉಸಿರಾಟ ಕಷ್ಟವಾಗುತ್ತಿದೆ ಮತ್ತು ಸಹಾಯ ಬೇಕು.',
    ta: 'எனக்கு சுவாசிக்க கஷ்டமாக உள்ளது, உதவி தேவை.',
  },
  'Social-Hello': {
    en: 'Hello, it is so good to see you today.',
    hi: 'नमस्ते, आज आपको देखकर बहुत अच्छा लगा।',
    kn: 'ನಮಸ್ಕಾರ, ಇಂದು ನಿಮ್ಮನ್ನು ನೋಡಿ ತುಂಬಾ ಸಂತೋಷವಾಯಿತು.',
    ta: 'வணக்கம், இன்று உங்களைப் பார்ப்பது மிகவும் மகிழ்ச்சியாக உள்ளது.',
  },
  'Social-Thank You': {
    en: 'Thank you so much for taking care of me.',
    hi: 'मेरी देखभाल करने के लिए आपका बहुत-बहुत धन्यवाद।',
    kn: 'ನನ್ನ ಆರೈಕೆ ಮಾಡಿದ್ದಕ್ಕಾಗಿ ತುಂಬಾ ಧನ್ಯವಾದಗಳು.',
    ta: 'என்னை கவனித்துக் கொண்டதற்கு மிகவும் நன்றி.',
  },
  'Social-Family': {
    en: 'I would really like to see my family right now.',
    hi: 'मैं अभी अपने परिवार से मिलना चाहता हूँ।',
    kn: 'ನಾನು ಈಗ ನನ್ನ ಕುಟುಂಬವನ್ನು ನೋಡಲು ಬಯಸುತ್ತೇನೆ.',
    ta: 'நான் இப்போது என் குடும்பத்தினரைப் பார்க்க விரும்புகிறேன்.',
  },
  'Social-Talk': {
    en: 'I would love to have someone to talk to.',
    hi: 'मैं किसी से बात करना चाहता हूँ।',
    kn: 'ನಾನು ಯಾರೊಂದಿಗಾದರೂ ಮಾತನಾಡಲು ಬಯಸುತ್ತೇನೆ.',
    ta: 'யாரோடாவது பேசினால் நல்லாக இருக்கும்.',
  },
  'Personal-Water': {
    en: 'I am very thirsty and would like some water please.',
    hi: 'मुझे बहुत प्यास लगी है, कृपया पानी चाहिए।',
    kn: 'ನನಗೆ ತುಂಬಾ ಬಾಯಾರಿಕೆಯಾಗಿದೆ, ದಯವಿಟ್ಟು ನೀರು ಬೇಕು.',
    ta: 'எனக்கு மிகவும் தாகமாக உள்ளது, தயவுசெய்து தண்ணீர் வேண்டும்.',
  },
  'Personal-Rest': {
    en: 'I am feeling tired and would like to rest now.',
    hi: 'मुझे थकान महसूस हो रही है और अभी आराम करना चाहता हूँ।',
    kn: 'ನನಗೆ ದಣಿವಾಗಿದೆ ಮತ್ತು ಈಗ ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಲು ಬಯಸುತ್ತೇನೆ.',
    ta: 'எனக்கு சோர்வாக உள்ளது, இப்போது ஓய்வெடுக்க விரும்புகிறேன்.',
  },
  'Personal-Uncomfortable': {
    en: 'I am uncomfortable and need to change my position.',
    hi: 'मुझे असुविधा हो रही है और मुझे अपनी स्थिति बदलनी है।',
    kn: 'ನನಗೆ ಅಸ್ವಸ್ಥತೆ ಆಗುತ್ತಿದೆ ಮತ್ತು ನನ್ನ ಸ್ಥಾನ ಬದಲಾಯಿಸಬೇಕಿದೆ.',
    ta: 'எனக்கு அசௌகரியமாக உள்ளது, என் நிலையை மாற்ற வேண்டும்.',
  },
  'Personal-Hungry': {
    en: 'I am hungry and would like something to eat please.',
    hi: 'मुझे भूख लगी है, कृपया कुछ खाने को चाहिए।',
    kn: 'ನನಗೆ ಹಸಿವಾಗಿದೆ, ದಯವಿಟ್ಟು ಏನಾದರೂ ತಿನ್ನಲು ಕೊಡಿ.',
    ta: 'எனக்கு பசிக்கிறது, தயவுசெய்து ஏதாவது சாப்பிட வேண்டும்.',
  },
  'Emergency-HELP': {
    en: 'I need immediate help right now please.',
    hi: 'मुझे अभी तुरंत मदद चाहिए।',
    kn: 'ನನಗೆ ಈಗಲೇ ತಕ್ಷಣ ಸಹಾಯ ಬೇಕು.',
    ta: 'எனக்கு இப்போதே உடனடியாக உதவி வேண்டும்.',
  },
  'Emergency-Call 112': {
    en: 'Please call emergency services immediately.',
    hi: 'कृपया तुरंत आपातकालीन सेवाओं को कॉल करें।',
    kn: 'ದಯವಿಟ್ಟು ತಕ್ಷಣ ತುರ್ತು ಸೇವೆಗಳಿಗೆ ಕರೆ ಮಾಡಿ.',
    ta: 'தயவுசெய்து உடனடியாக அவசர சேவைகளை அழையுங்கள்.',
  },
  'Emergency-Alert': {
    en: 'This is an emergency and I need urgent assistance.',
    hi: 'यह आपातकाल है और मुझे तत्काल सहायता चाहिए।',
    kn: 'ಇದು ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಮತ್ತು ನನಗೆ ತಕ್ಷಣದ ಸಹಾಯ ಬೇಕು.',
    ta: 'இது அவசரநிலை, எனக்கு உடனடி உதவி தேவை.',
  },
  'Emergency-Caregiver': {
    en: 'Please get my caregiver here immediately.',
    hi: 'कृपया मेरी देखभालकर्ता को अभी बुलाएं।',
    kn: 'ದಯವಿಟ್ಟು ನನ್ನ ಆರೈಕೆದಾರರನ್ನು ತಕ್ಷಣ ಇಲ್ಲಿಗೆ ಕರೆಯಿರಿ.',
    ta: 'தயவுசெய்து என் பராமரிப்பாளரை இப்போதே இங்கே அழையுங்கள்.',
  },
};

export const CLINICAL_CATEGORIES = {
  'Medical-Pain': 'PAIN',
  'Medical-Breathe': 'RESPIRATORY',
  'Medical-Doctor': 'DISTRESS_SIGNAL',
  'Emergency-HELP': 'CRITICAL',
  'Emergency-Call 112': 'CRITICAL',
  'Emergency-Alert': 'CRITICAL',
  'Emergency-Caregiver': 'DISTRESS_SIGNAL',
};
