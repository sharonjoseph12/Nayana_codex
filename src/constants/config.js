export const DWELL_TIME_QUADRANT = 2500;
export const DWELL_TIME_PHRASE = 1500;
export const DWELL_TIME_BUTTON = 2000;
export const SOS_LONG_STARE_MS = 5000;
export const EMOTION_IDLE_ALERT_MS = 60000;
export const CLINICAL_ALERT_COOLDOWN_MS = 5 * 60 * 1000;

export const PATIENT = {
  name: 'Arjun Mehta',
  age: 34,
  condition: 'ALS Stage 2',
  room: 'ICU-7',
  caregiver: 'Dr. Priya Sharma',
  caregiverPhone: '+91XXXXXXXXXX',
};

export const LANGUAGE_OPTIONS = [
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'hi', label: 'HI', name: 'Hindi' },
  { id: 'kn', label: 'KN', name: 'Kannada' },
  { id: 'ta', label: 'TA', name: 'Tamil' },
];

export function encodeTrackableValue(value) {
  return value.replaceAll(' ', '_');
}

export function decodeTrackableValue(value) {
  return value.replaceAll('_', ' ');
}
