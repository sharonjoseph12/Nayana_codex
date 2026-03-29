import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { PATIENT } from '../../constants/config';
import { sendWhatsAppAlert } from '../../services/whatsapp';

function getRiskColor(score) {
  if (score > 70) return '#ff3d5a';
  if (score > 40) return '#ffd700';
  return '#00ffaa';
}

export default function CaregiverHubPage({
  caregiverLog,
  setCaregiverLog,
  clinicalLog,
  vitals,
  clinicalAI,
  showToast,
  speak,
  currentLanguage,
  onAddCaregiverEntry,
  lastInteractionAt,
  onSendResponse,
  patientInfoOverride,
}) {
  const [responseText, setResponseText] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [roundLog, setRoundLog] = useState([]);
  const reminderRef = useRef([]);

  useEffect(
    () => () => {
      reminderRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  const lastCommunication = clinicalLog[clinicalLog.length - 1];
  const lastActiveMinutes = Math.max(0, Math.floor((Date.now() - lastInteractionAt) / 60000));
  const isCommunicating = Date.now() - lastInteractionAt < 2 * 60 * 1000;
  const unreadCount = caregiverLog.filter((entry) => !entry.acknowledged).length;

  const sendResponseToPatient = () => {
    if (!responseText.trim()) return;

    if (onSendResponse) {
      onSendResponse(responseText.trim());
    } else {
      const channel = new BroadcastChannel('nayana_comms');
      channel.postMessage({ type: 'CAREGIVER_RESPONSE', text: responseText.trim() });
      channel.close();
    }
    
    showToast(`Response sent to patient: "${responseText.trim()}"`, 'success');
    onAddCaregiverEntry('Caregiver', `Response sent: "${responseText.trim()}"`, '#00ffaa', {
      acknowledged: true,
      sentence: responseText.trim(),
      phrase: 'Caregiver Response',
    });
    setResponseText('');
  };

  const scheduleReminder = () => {
    if (!reminderTime) {
      showToast('Choose a reminder time first', 'warning');
      return;
    }

    const now = new Date();
    const [hours, minutes] = reminderTime.split(':');
    const target = new Date();
    target.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10), 0, 0);
    const delay = target.getTime() - now.getTime();

    if (delay <= 0) {
      showToast('Reminder time must be later today', 'warning');
      return;
    }

    const timer = window.setTimeout(() => {
      showToast('Medication reminder: Time for scheduled medication', 'warning');
      speak('Medication reminder. It is time for the scheduled medication.', currentLanguage);
      onAddCaregiverEntry('Medical', `Medication reminder triggered at ${reminderTime}`, '#ffd700', {
        acknowledged: false,
        sentence: `Medication reminder triggered at ${reminderTime}`,
        phrase: 'Medication Reminder',
      });
    }, delay);

    reminderRef.current.push(timer);
    showToast(`Reminder set for ${reminderTime}`, 'success');
  };

  const markRoundComplete = () => {
    const message = `Round completed at ${new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    setRoundLog((previous) => [...previous, message]);
    onAddCaregiverEntry('Clinical', message, '#00ffaa', {
      acknowledged: true,
      sentence: message,
      phrase: 'Round Complete',
    });
    showToast('Nurse round logged', 'success');
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '600', color: '#fff' }}>
          Caregiver Hub
        </h1>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
          Live patient monitoring and caregiver coordination
        </p>
      </div>

      <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '14px' }}>
          Live Patient Status
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#bf80ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#000' }}>
            AM
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff', fontFamily: 'Syne, sans-serif' }}>
              {(patientInfoOverride || PATIENT).name}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              {(patientInfoOverride || PATIENT).condition} - {(patientInfoOverride || PATIENT).room} - Caregiver: {(patientInfoOverride || PATIENT).caregiver}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '5px' }}>
              Last communication:{' '}
              {lastCommunication
                ? new Date(lastCommunication.timestamp).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'No session activity yet'}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Mono, monospace' }}>RISK SCORE</div>
            <div style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'DM Mono, monospace', color: getRiskColor(clinicalAI.riskScore) }}>
              {clinicalAI.riskScore}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: getRiskColor(clinicalAI.riskScore) }}>
              {clinicalAI.riskLevel}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '14px', fontSize: '12px', color: isCommunicating ? '#00ffaa' : '#ffd700' }}>
          {isCommunicating
            ? 'Patient is communicating'
            : `Patient is silent - last active ${lastActiveMinutes} minute${lastActiveMinutes === 1 ? '' : 's'} ago`}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginTop: '16px' }}>
          {[
            { label: 'Heart Rate', value: `${vitals.heartRate} BPM`, color: '#00d4ff' },
            { label: 'Blink Rate', value: `${vitals.blinkRate}/min`, color: '#00ffaa' },
            { label: 'Focus', value: `${vitals.focusScore}%`, color: '#bf80ff' },
            { label: 'Stress', value: vitals.stressLevel, color: '#ffd700' },
          ].map((item) => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: item.color, fontFamily: 'DM Mono, monospace' }}>{item.value}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '14px' }}>
          Communication Feed - {unreadCount} unread
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
          {caregiverLog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>No communications yet</div>
          ) : (
            caregiverLog.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  background: entry.acknowledged ? 'rgba(0,255,170,0.04)' : 'rgba(0,212,255,0.04)',
                  border: `1px solid ${entry.acknowledged ? 'rgba(0,255,170,0.16)' : 'rgba(0,212,255,0.15)'}`,
                  borderLeft: `3px solid ${entry.color}`,
                  borderRadius: '8px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '100px', border: `1px solid ${entry.color}55`, color: entry.color, fontSize: '9px', fontFamily: 'DM Mono, monospace' }}>
                      {entry.quadrant}
                    </span>
                    {entry.phrase ? <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Mono, monospace' }}>{entry.phrase}</span> : null}
                    <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'DM Mono, monospace' }}>{entry.time}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: entry.acknowledged ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.85)', fontWeight: entry.acknowledged ? '400' : '500', marginTop: '8px' }}>
                    {entry.sentence || entry.message}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {!entry.acknowledged ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCaregiverLog((previous) =>
                          previous.map((item) => (item.id === entry.id ? { ...item, acknowledged: true } : item))
                        )
                      }
                      style={{ padding: '3px 8px', borderRadius: '100px', border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.08)', color: '#00d4ff', fontSize: '9px', fontFamily: 'DM Mono, monospace', cursor: 'pointer' }}
                    >
                      ACK
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => sendWhatsAppAlert(`Patient comm: ${entry.sentence || entry.message} - ${entry.time}`)}
                    style={{ padding: '3px 8px', borderRadius: '100px', border: '1px solid rgba(37,211,102,0.3)', background: 'rgba(37,211,102,0.08)', color: '#25d366', fontSize: '9px', fontFamily: 'DM Mono, monospace', cursor: 'pointer' }}
                  >
                    WA
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Send Response to Patient
          </div>
          <input
            value={responseText}
            onChange={(event) => setResponseText(event.target.value)}
            placeholder="Type message for patient to read..."
            style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', outline: 'none', marginBottom: '8px' }}
          />
          <button
            type="button"
            onClick={sendResponseToPatient}
            style={{ width: '100%', padding: '9px', borderRadius: '9px', border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.1)', color: '#00d4ff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer' }}
          >
            Send to Patient Screen
          </button>
        </div>

        <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Schedule Medication Reminder
          </div>
          <input
            type="time"
            value={reminderTime}
            onChange={(event) => setReminderTime(event.target.value)}
            style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontFamily: 'DM Mono, monospace', fontSize: '13px', outline: 'none', marginBottom: '8px' }}
          />
          <button
            type="button"
            onClick={scheduleReminder}
            style={{ width: '100%', padding: '9px', borderRadius: '9px', border: '1px solid rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.08)', color: '#ffd700', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer' }}
          >
            Set Reminder
          </button>
          <button
            type="button"
            onClick={markRoundComplete}
            style={{ width: '100%', padding: '9px', borderRadius: '9px', border: '1px solid rgba(0,255,170,0.3)', background: 'rgba(0,255,170,0.08)', color: '#00ffaa', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}
          >
            Mark Round Complete
          </button>
          {roundLog.slice(-3).map((entry, index) => (
            <div key={`${entry}-${index}`} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
              OK {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

CaregiverHubPage.propTypes = {
  caregiverLog: PropTypes.arrayOf(PropTypes.object).isRequired,
  setCaregiverLog: PropTypes.func.isRequired,
  clinicalLog: PropTypes.arrayOf(PropTypes.object).isRequired,
  vitals: PropTypes.object.isRequired,
  clinicalAI: PropTypes.object.isRequired,
  showToast: PropTypes.func.isRequired,
  speak: PropTypes.func.isRequired,
  currentLanguage: PropTypes.string.isRequired,
  onAddCaregiverEntry: PropTypes.func.isRequired,
  lastInteractionAt: PropTypes.number.isRequired,
};
