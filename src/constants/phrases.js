/**
 * Nayana Clinical Intent Logic (Phase 33 & 38)
 * Full multi-script metadata for deep localization.
 */

import { 
  Heart, Activity, Thermometer, Wind, 
  MessageCircle, Users, HeartHandshake, Smile,
  Coffee, Droplets, Bed, Sun,
  AlertTriangle, Phone, Bell, ShieldAlert 
} from 'lucide-react';

export const CLINICAL_CATEGORIES = [
  { id: 'Medical', label: 'Medical', hi: 'चिकित्सा', kn: 'ವೈದ್ಯಕೀಯ', color: '#00D1FF', icon: Activity },
  { id: 'Social', label: 'Social', hi: 'सामाजिक', kn: 'ಸಾಮಾಜಿಕ', color: '#A855F7', icon: Users },
  { id: 'Personal', label: 'Personal', hi: 'व्यक्तिगत', kn: 'ವೈಯಕ್ತಿಕ', color: '#10B981', icon: Coffee },
  { id: 'Emergency', label: 'Emergency', hi: 'आपातकाल', kn: 'ತುರ್ತು', color: '#FF3D5A', icon: AlertTriangle }
];

export const PHRASES = {
  Medical: [
    { label: 'Pain', hi: 'दर्द', kn: 'ನೋವು', icon: Activity, severity: 3 },
    { label: 'Medication', hi: 'दवाई', kn: 'ಔಷಧ', icon: Thermometer, severity: 2 },
    { label: 'Doctor', hi: 'डॉक्टर', kn: 'ವೈದ್ಯರು', icon: Users, severity: 2 },
    { label: 'Breathe', hi: 'सांस', kn: 'ಉಸಿರು', icon: Wind, severity: 4 },
  ],
  Social: [
    { label: 'Hello', hi: 'नमस्ते', kn: 'ನಮಸ್ಕಾರ', icon: MessageCircle, severity: 1 },
    { label: 'Thank You', hi: 'धन्यवाद', kn: 'ಧನ್ಯವಾದ', icon: HeartHandshake, severity: 1 },
    { label: 'Family', hi: 'परिवार', kn: 'ಕುಟುಂಬ', icon: Users, severity: 2 },
    { label: 'Talk', hi: 'बात करें', kn: 'ಮಾತನಾಡಿ', icon: MessageCircle, severity: 1 },
  ],
  Personal: [
    { label: 'Water', hi: 'पानी', kn: 'ನೀರು', icon: Droplets, severity: 2 },
    { label: 'Rest', hi: 'आराम', kn: 'ವಿಶ್ರಾಂತಿ', icon: Bed, severity: 1 },
    { label: 'Uncomfortable', hi: 'तकलीफ', kn: 'ಅಸ್ವಸ್ಥ', icon: Activity, severity: 2 },
    { label: 'Hungry', hi: 'भूख', kn: 'ಹಸಿವು', icon: Coffee, severity: 2 },
  ],
  Emergency: [
    { label: 'HELP', hi: 'मदद करो', kn: 'ಸಹಾಯ ಮಾಡಿ', icon: Bell, severity: 5 },
    { label: 'Call 112', hi: '112 कॉल करें', kn: '112 ಕರೆ ಮಾಡಿ', icon: Phone, severity: 5 },
    { label: 'Alert', hi: 'अलर्ट', kn: 'ಎಚ್ಚರಿಕೆ', icon: ShieldAlert, severity: 4 },
    { label: 'Caregiver', hi: 'देखभालकर्ता', kn: 'आरोइकेदारा', icon: Activity, severity: 3 },
  ],
};

export const FALLBACK_SENTENCES = {
  'Medical-Pain': {
    en: 'I am experiencing significant pain.',
    hi: 'मुझे बहुत दर्द हो रहा है।',
    kn: 'ನನಗೆ ತುಂಬಾ ನೋವಾಗುತ್ತಿದೆ.'
  },
  'Medical-Medication': {
    en: 'I need my medication.',
    hi: 'मुझे मेरी दवाई चाहिए।',
    kn: 'ನನಗೆ ನನ್ನ ಔಷಧಿ ಬೇಕು.'
  },
  'Medical-Breathe': {
    en: 'I am having difficulty breathing.',
    hi: 'मुझे सांस लेने में तकलीफ हो रही है।',
    kn: 'ನನಗೆ ಉಸಿರಾಡಲು ತೊಂದರೆಯಾಗುತ್ತಿದೆ.'
  },
  'Emergency-HELP': {
    en: 'I need immediate assistance.',
    hi: 'मुझे तुरंत मदद की जरूरत है।',
    kn: 'ನನಗೆ ತಕ್ಷಣದ ಸಹಾಯ ಬೇಕು.'
  }
};

export const QUADRANT_CONFIG = {
  Medical: { label: 'Medical', hi: 'चिकित्सा', kn: 'ವೈದ್ಯಕೀಯ', color: '#00D1FF', shadow: 'shadow-glow-cyan', icon: Activity },
  Social: { label: 'Social', hi: 'सामाजिक', kn: 'ಸಾಮಾಜಿಕ', color: '#A855F7', shadow: 'shadow-glow-purple', icon: Users },
  Personal: { label: 'Personal', hi: 'व्यक्तिगत', kn: 'ವೈಯಕ್ತಿಕ', color: '#10B981', shadow: 'shadow-glow-green', icon: Coffee },
  Emergency: { label: 'Emergency', hi: 'आपातकाल', kn: 'ತುರ್ತು', color: '#FF3D5A', shadow: 'shadow-glow-red', icon: AlertTriangle },
};
