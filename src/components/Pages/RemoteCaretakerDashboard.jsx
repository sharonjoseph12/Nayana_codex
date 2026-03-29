import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { webrtcManager } from '../../services/webrtc';
import CaregiverHubPage from './CaregiverHubPage';

export default function RemoteCaretakerDashboard() {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  
  // States mirrored from patient app
  const [caregiverLog, setCaregiverLog] = useState([]);
  const [clinicalLog, setClinicalLog] = useState([]);
  const [vitals, setVitals] = useState({
    heartRate: '--',
    bloodPressure: '--',
    spo2: '--',
    blinkRate: '--',
    focusScore: '--',
    stressLevel: '--'
  });
  const [clinicalAI, setClinicalAI] = useState({
    riskScore: 0,
    riskLevel: 'Unknown',
  });
  const [lastInteractionAt, setLastInteractionAt] = useState(Date.now());
  const [patientInfo, setPatientInfo] = useState({
    name: 'Unknown Patient',
    condition: '',
    room: '',
    caregiver: ''
  });

  // Since webrtcManager is a singleton, check if connection exists
  useEffect(() => {
    if (!webrtcManager.connection || !webrtcManager.connection.open) {
      // Not connected, redirect to login
      navigate('/caretaker');
      return;
    }

    setConnected(true);

    const handleWebRTCData = (data) => {
      // Handle connection closed
      if (data.type === 'CONNECTION_CLOSED') {
        navigate('/caretaker');
        return;
      }

      // Handle data sync
      if (data.type === 'SYNC_STATE') {
        if (data.vitals) setVitals(data.vitals);
        if (data.caregiverLog) setCaregiverLog(data.caregiverLog);
        if (data.clinicalLog) setClinicalLog(data.clinicalLog);
        if (data.clinicalAI) setClinicalAI(data.clinicalAI);
        if (data.lastInteractionAt) setLastInteractionAt(data.lastInteractionAt);
        if (data.patient) setPatientInfo(data.patient);
      }
    };

    const unsubscribe = webrtcManager.subscribe(handleWebRTCData);
    
    // Request initial state from host
    webrtcManager.sendData({ type: 'REQUEST_SYNC' });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  // Mock functions for CaregiverHubPage since it expects them
  const mockShowToast = (msg, tone) => console.log('Toast:', msg, tone);
  const mockSpeak = (msg) => console.log('Speak:', msg);
  
  // Custom add entry that proxies back to patient
  const handleAddCaregiverEntry = (quadrant, message, color, extras) => {
    webrtcManager.sendData({
      type: 'ADD_CAREGIVER_ENTRY',
      payload: { quadrant, message, color, extras }
    });
  };

  if (!connected) return <div className="flex h-screen items-center justify-center bg-[#070707] text-white font-mono">Connecting...</div>;

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-[#151515] px-4 py-2 text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-[#00ffaa] animate-pulse"></div>
          Connected to Patient Session
      </div>
      <CaregiverHubPage 
        caregiverLog={caregiverLog}
        setCaregiverLog={() => {}} // State is managed by patient app, read-only here
        clinicalLog={clinicalLog}
        vitals={vitals}
        clinicalAI={clinicalAI}
        showToast={mockShowToast}
        speak={mockSpeak}
        currentLanguage="en"
        onAddCaregiverEntry={handleAddCaregiverEntry}
        onSendResponse={(text) => webrtcManager.sendData({ type: 'CAREGIVER_RESPONSE', text })}
        lastInteractionAt={lastInteractionAt}
        patientInfoOverride={patientInfo}
      />
    </div>
  );
}
