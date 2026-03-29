import { useCallback, useRef } from 'react';
import { CLINICAL_ALERT_COOLDOWN_MS } from '../constants/config';
import { sendWhatsAppAlert } from '../services/whatsapp';

export function useCaregiverAlerts() {
  const lastSentByKey = useRef({});

  const sendManagedAlert = useCallback(async (key, message) => {
    const now = Date.now();
    const lastSent = lastSentByKey.current[key] || 0;
    if (now - lastSent < CLINICAL_ALERT_COOLDOWN_MS) {
      return false;
    }

    const sent = await sendWhatsAppAlert(message);
    if (sent) {
      lastSentByKey.current[key] = now;
    }

    return sent;
  }, []);

  return {
    sendManagedAlert,
  };
}
