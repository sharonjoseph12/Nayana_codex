import { useCallback, useEffect, useMemo, useRef, useState, useDeferredValue } from 'react';
import TopBar from './components/Layout/TopBar';
import LeftNav from './components/Layout/LeftNav';
import LeftSidebar from './components/Layout/LeftSidebar';
import RightPanel from './components/Layout/RightPanel';
import BottomBar from './components/Layout/BottomBar';
import QuadrantGrid from './components/Dashboard/QuadrantGrid';
import SpeechOutput from './components/Communication/SpeechOutput';
import SOSModal from './components/Modals/SOSModal';
import ReportModal from './components/Modals/ReportModal';
import VoiceSetupModal from './components/Modals/VoiceSetupModal';
import GazeReticle from './components/Tracking/GazeReticle';
import GazeEngine from './components/Tracking/GazeEngine';
import CalibrationScreen from './components/Tracking/CalibrationScreen';
import SOSAnchor from './components/Tracking/SOSAnchor';
import AnalyticsPage from './components/Analytics/AnalyticsPage';
import CaregiverHubPage from './components/Pages/CaregiverHubPage';
import SessionHistoryPage from './components/Pages/SessionHistoryPage';
import PainMapPage from './components/Pages/PainMapPage';
import SettingsPage from './components/Pages/SettingsPage';
import LoginPage from './components/Pages/LoginPage';
import NeuralBackground from './components/NeuralBackground';
import { useGazeTracking } from './hooks/useGazeTracking';
import { useVitals } from './hooks/useVitals';
import { useSpeech } from './hooks/useSpeech';
import { useClinicalAI } from './hooks/useClinicalAI';
import { useCaregiverAlerts } from './hooks/useCaregiverAlerts';
import { useEmotionDetection } from './hooks/useEmotionDetection';
import { useDemoLogic } from './hooks/useDemoLogic';
import { PATIENT as DEFAULT_PATIENT, encodeTrackableValue } from './constants/config';
import { CLINICAL_CATEGORIES, PHRASES, QUADRANT_CONFIG } from './constants/phrases';
import { TRANSLATIONS } from './constants/translations';
import { generateHandoverReport, generateSentence } from './services/gemini';
import { synthesizeWithElevenLabs } from './services/elevenlabs';

// Initialize Global Tab ID for isolation
if (typeof window !== 'undefined' && !window.__nayana_tab_id) {
  window.__nayana_tab_id = Math.random().toString(36).substring(7);
}
import { buildPDFHTML } from './services/pdf';
import { buildEmotionMessage, buildSOSMessage, sendWhatsAppAlert } from './services/whatsapp';
import { webrtcManager } from './services/webrtc';

function getTimeAgo(minutes) {
  const date = new Date(Date.now() - minutes * 60 * 1000);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}



export default function PatientApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [patient, setPatient] = useState(DEFAULT_PATIENT);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [generatedSentence, setGeneratedSentence] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const deferredSentence = useDeferredValue(generatedSentence);
  const deferredGenerating = useDeferredValue(isGenerating);

  const [sentenceSource, setSentenceSource] = useState('fallback');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [clinicalLog, setClinicalLog] = useState([]);
  const [caregiverLog, setCaregiverLog] = useState([
    { id: 1, time: getTimeAgo(12), message: 'Patient requested water', sentence: 'I am very thirsty and would like some water please.', phrase: 'Water', quadrant: 'Personal', color: '#bf80ff', acknowledged: true },
    { id: 2, time: getTimeAgo(7), message: 'Patient reported pain', sentence: 'I am experiencing significant pain and need immediate medical attention.', phrase: 'Pain', quadrant: 'Medical', color: '#00d4ff', acknowledged: true },
    { id: 3, time: getTimeAgo(3), message: 'Patient greeted family', sentence: 'Hello, it is so good to see you today.', phrase: 'Hello', quadrant: 'Social', color: '#00ffaa', acknowledged: false },
  ]);
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(10);
  const [showReportModal, setShowReportModal] = useState(false);
  const [clinicalReport, setClinicalReport] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [lastSelectedPhrase, setLastSelectedPhrase] = useState(null);
  const [lastSelectedPhraseKey, setLastSelectedPhraseKey] = useState(null);
  const [lastInteractionAt, setLastInteractionAt] = useState(Date.now());
  const [voiceSetupOpen, setVoiceSetupOpen] = useState(false);
  const [dwellTime, setDwellTime] = useState(1800);
  const [painLog, setPainLog] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [caregiverResponse, setCaregiverResponse] = useState(null);
  const [densityMode, setDensityMode] = useState('normal'); // 'normal' | 'focused' | 'binary'
  const [trackingEnabled, setTrackingEnabled] = useState(true);


  const vitals = useVitals();
  const { isSpeaking, isMuted, autoSpeak, speak, cancelSpeech, toggleMute, setAutoSpeak, voiceMode, setVoiceMode, activeSpeechLanguage, elevenLabsAvailable } = useSpeech();
  const clinicalAI = useClinicalAI(clinicalLog);
  const { sendManagedAlert } = useCaregiverAlerts();

  const isSpeakingRef = useRef(isSpeaking);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  
  const lastSpeechRef = useRef({ text: '', timestamp: 0 });

  const showToast = useCallback((message, tone = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((previous) => [...previous, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const addCaregiverEntry = useCallback((quadrant, message, color, extras = {}) => {
    setCaregiverLog((previous) =>
      [
        {
          id: Date.now() + Math.random(),
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          message,
          quadrant,
          color: color || '#00d4ff',
          acknowledged: extras.acknowledged ?? false,
          phrase: extras.phrase || null,
          sentence: extras.sentence || message,
        },
        ...previous,
      ].slice(0, 40)
    );
  }, []);

  const triggerSOS = useCallback(async () => {
    setSosActive(true);
    addCaregiverEntry('Emergency', 'SOS triggered - emergency caregiver alert sent', '#ff3d5a', {
      acknowledged: false,
      phrase: 'SOS',
      sentence: 'Emergency alert sent to caregiver.',
    });
    await sendManagedAlert('sos', buildSOSMessage(patient, new Date().toLocaleTimeString('en-IN')));
    speak('Emergency alert has been triggered. Caregiver has been notified.');
    showToast('SOS alert sent to caregiver', 'warning');
  }, [addCaregiverEntry, patient, sendManagedAlert, showToast, speak]);

  const handlePhraseSelect = useCallback(
    async (quadrant, phrase, options = {}) => {
      if (isGenerating) return '';

      setSelectedQuadrant(quadrant);
      setLastSelectedPhrase(phrase);
      setLastSelectedPhraseKey(`${quadrant}-${phrase}`);
      setIsGenerating(true);
      setGeneratedSentence('');
      setLastInteractionAt(Date.now());

      const interactionId = `${Date.now()}-${Math.random().toString(36).substring(10)}`;

      try {
        const result = await generateSentence(quadrant, phrase, currentLanguage, conversationHistory, {
          heartRate: vitals.heartRate,
          stressLevel: vitals.stressLevel,
          caregiver: patient.caregiver,
          room: patient.room,
        });

        if (result.text) {
          setGeneratedSentence(result.text);
          setSentenceSource(result.source);
          setLastSelectedPhrase(result.text);
          setLastInteractionAt(new Date());

          const entry = {
            id: interactionId,
            quadrant,
            phrase,
            sentence: result.text,
            timestamp: new Date(),
            source: result.source,
            language: currentLanguage,
          };

          setClinicalLog((prev) => [...prev, entry].slice(-100));
          setConversationHistory((prev) => [...prev, entry].slice(-50));
          
          addCaregiverEntry(quadrant, `${quadrant} -> ${phrase}`, QUADRANT_CONFIG[quadrant]?.color, {
            phrase,
            sentence: result.text,
            interactionId
          });

          // Sync via BroadcastChannel (Include Tab ID)
          const commsChannel = new BroadcastChannel('nayana_comms');
          commsChannel.postMessage({
            type: 'PHRASE_SELECTED',
            text: result.text,
            interactionId,
            tabId: window.__nayana_tab_id
          });

          if (autoSpeak || options.forceSpeak) {
            speak(result.text, currentLanguage);
          }
          return result.text;
        }
      } catch (error) {
        console.error('Selection error:', error);
        showToast('Failed to process selection', 'warning');
      } finally {
        setIsGenerating(false);
      }
    },
    [autoSpeak, conversationHistory, currentLanguage, patient.caregiver, patient.room, speak, vitals.heartRate, vitals.stressLevel, addCaregiverEntry, showToast]
  );

  const handleQuadrantSelect = useCallback((quadrantName) => {
    cancelSpeech();
    setSelectedQuadrant(quadrantName);
    setGeneratedSentence('');
    setLastSelectedPhrase(null);
    setLastSelectedPhraseKey(null);
    setLastInteractionAt(Date.now());
  }, [cancelSpeech]);

  const handleGazeSwipeLeft = useCallback(() => {
    // Back/cancel gesture: if a quadrant is open, close it; otherwise do nothing
    if (selectedQuadrant) {
      cancelSpeech();
      setSelectedQuadrant(null);
      setGeneratedSentence('');
      setLastSelectedPhrase(null);
      setLastSelectedPhraseKey(null);
      showToast('↩ Gaze swipe — back to grid', 'info');
    }
  }, [cancelSpeech, selectedQuadrant, showToast]);

  const repeatLastSentence = useCallback(() => {
    if (generatedSentence) speak(generatedSentence, currentLanguage);
  }, [generatedSentence, speak, currentLanguage]);

  const clearOutput = useCallback(() => {
    cancelSpeech();
    setGeneratedSentence('');
    setSelectedQuadrant(null);
    setLastSelectedPhrase(null);
  }, [cancelSpeech]);

  const generateReport = useCallback(async () => {
    setShowReportModal(true);
    setReportLoading(true);
    const report = await generateHandoverReport(clinicalLog, vitals, clinicalAI);
    setClinicalReport(report);
    setReportLoading(false);
    return report;
  }, [clinicalLog, vitals, clinicalAI]);

  const downloadPDF = useCallback(async () => {
    const report = clinicalReport || (await generateHandoverReport(clinicalLog, vitals, clinicalAI));
    if (!clinicalReport) setClinicalReport(report);
    const html = buildPDFHTML(report, clinicalLog, vitals, clinicalAI);
    showToast('Generating PDF file...', 'info');
    
    import('html2pdf.js').then((m) => {
      const html2pdf = m.default || m;
      const filename = `Nayana_Clinical_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const element = document.createElement('div');
      element.innerHTML = html;

      html2pdf().from(element).set(opt).output('blob').then((pdfBlob) => {
        const url = URL.createObjectURL(pdfBlob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        
        showToast('Clinical report downloaded successfully', 'success');
      }).catch((err) => {
        console.error('PDF Blob error:', err);
        showToast('Error generating PDF', 'warning');
      });
    }).catch((err) => {
      console.error('PDF module error:', err);
      showToast('Error loading PDF engine', 'warning');
    });
  }, [clinicalAI, clinicalLog, clinicalReport, showToast, vitals]);

  const { isDemoRunning, startDemo, stopDemo } = useDemoLogic({
    onQuadrantSelect: handleQuadrantSelect,
    onPhraseSelect: handlePhraseSelect,
    onSOSTrigger: triggerSOS,
  });

  const { trackingMode, gazePosition, headPosition, dwellingOn, dwellProgress, gazeAccuracy, gazeTrail, faceDetected, isCalibrated, isLocked, handleIrisUpdate, registerElement, startEyeTracking, stopEyeTracking, setTrackingMode } = useGazeTracking({
    onQuadrantSelect: handleQuadrantSelect,
    onPhraseSelect: handlePhraseSelect,
    onSOSTrigger: triggerSOS,
    onGazeSwipeLeft: handleGazeSwipeLeft,
    dwellTimeOverride: dwellTime,
  });

  const emotionDetection = useEmotionDetection({ faceDetected, lastInteractionAt });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      ['Medical', 'Social', 'Personal', 'Emergency'].forEach((quadrant) => {
        registerElement(`quadrant-${quadrant}`, 'quadrant');
        PHRASES[quadrant]?.forEach((phrase) => registerElement(`phrase-${quadrant}-${encodeTrackableValue(phrase.label)}`, 'phrase'));
      });
      registerElement('btn-speak', 'button');
      registerElement('btn-repeat', 'button');
      registerElement('btn-clear', 'button');
      // Permanent SOS anchor
      registerElement('sos-anchor-btn', 'button');
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [registerElement, selectedQuadrant, currentLanguage, activePage]);

  useEffect(() => {
    if (!sosActive) {
      setSosCountdown(10);
      return;
    }
    if (sosCountdown <= 0) {
      setSosActive(false);
      return;
    }
    const timeout = window.setTimeout(() => setSosCountdown((previous) => previous - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [sosActive, sosCountdown]);

  useEffect(() => {
    const handler = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      if (event.key === 'F1') {
        event.preventDefault();
        startDemo();
      }
      if (event.key === 'Escape') stopDemo();
      if (event.key === 'm' || event.key === 'M') handleQuadrantSelect('Medical');
      if (event.key === 's' || event.key === 'S') handleQuadrantSelect('Social');
      if (event.key === 'n' || event.key === 'N') handleQuadrantSelect('Personal');
      if (event.key === 'e' || event.key === 'E') handleQuadrantSelect('Emergency');
      if (event.key === 'r' || event.key === 'R') repeatLastSentence();
      if (event.key === 'x' || event.key === 'X') clearOutput();
      if (event.key === 'p' || event.key === 'P') setPresentationMode((previous) => !previous);
      if (event.key === 'v' || event.key === 'V') setVoiceSetupOpen((previous) => !previous);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generatedSentence, isDemoRunning]);

  useEffect(() => {
    if (!emotionDetection.shouldAlert) return;
    sendManagedAlert('emotion', buildEmotionMessage(patient, emotionDetection.emotion, new Date().toLocaleTimeString('en-IN')));
    addCaregiverEntry('Clinical', `Emotion sentinel detected ${emotionDetection.emotion.toLowerCase()}`, '#ff3d5a', {
      sentence: `Emotion sentinel detected ${emotionDetection.emotion.toLowerCase()}`,
      phrase: 'Emotion Alert',
    });
  }, [addCaregiverEntry, emotionDetection.emotion, emotionDetection.shouldAlert, sendManagedAlert]);

  useEffect(() => {
    const channel = new BroadcastChannel('nayana_comms');
    channel.onmessage = (event) => {
      // Ignore messages from this same tab to prevent Echo Loops
      if (event.data?.tabId === window.__nayana_tab_id) return;

      if (event.data?.type === 'CAREGIVER_RESPONSE' && event.data.text) {
        setCaregiverResponse({ text: event.data.text, timestamp: Date.now() });
        speak(event.data.text, currentLanguage);
        showToast('Caregiver response received', 'success');
      }
    };
    return () => channel.close();
  }, [currentLanguage, showToast, speak]);

  useEffect(() => {
    if (!caregiverResponse) return undefined;
    const timeout = window.setTimeout(() => setCaregiverResponse(null), 9000);
    return () => window.clearTimeout(timeout);
  }, [caregiverResponse]);

  useEffect(() => {
    if (webrtcManager.isHost && webrtcManager.connection) {
      const serializableVitals = { ...vitals };
      delete serializableVitals.formatDuration;
      webrtcManager.sendData({
        type: 'SYNC_STATE',
        vitals: serializableVitals,
        caregiverLog,
        clinicalLog,
        clinicalAI: { riskScore: clinicalAI.riskScore, riskLevel: clinicalAI.riskLevel },
        lastInteractionAt,
        patient
      });
    }
  }, [vitals, caregiverLog, clinicalLog, clinicalAI.riskScore, clinicalAI.riskLevel, lastInteractionAt, patient]);

  useEffect(() => {
    const handleWebRTC = (data) => {
      if (data.type === 'REQUEST_SYNC') {
        const serializableVitals = { ...vitals };
        delete serializableVitals.formatDuration;
        webrtcManager.sendData({
          type: 'SYNC_STATE',
          vitals: serializableVitals,
          caregiverLog,
          clinicalLog,
          clinicalAI: { riskScore: clinicalAI.riskScore, riskLevel: clinicalAI.riskLevel },
          lastInteractionAt,
          patient
        });
      } else if (data.type === 'ADD_CAREGIVER_ENTRY' && data.payload) {
        addCaregiverEntry(
          data.payload.quadrant, 
          data.payload.message, 
          data.payload.color, 
          data.payload.extras
        );
      } else if (data.type === 'CAREGIVER_RESPONSE' && data.text) {
        // Ignore messages originating from the same logical event / tab
        if (data.tabId === window.__nayana_tab_id) return;
        
        setCaregiverResponse({ text: data.text, timestamp: Date.now() });
        speak(data.text, currentLanguage);
        showToast('Caregiver response received', 'success');
      }
    };
    
    const unsubscribe = webrtcManager.subscribe(handleWebRTC);
    return () => unsubscribe();
  }, [vitals, caregiverLog, clinicalLog, clinicalAI, lastInteractionAt, patient, addCaregiverEntry, speak, currentLanguage, showToast]);

  const currentTranslations = useMemo(() => TRANSLATIONS[currentLanguage] || TRANSLATIONS.en, [currentLanguage]);

  const handleLogin = useCallback((patientData) => {
    setPatient(patientData);
    setIsLoggedIn(true);
  }, []);

  const handleWhatsAppTest = useCallback(() => {
    sendWhatsAppAlert(`NAYANA TEST\nSystem working correctly\nTime: ${new Date().toLocaleTimeString('en-IN')}`);
  }, []);

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className={`relative flex h-screen flex-col overflow-hidden bg-base ${presentationMode ? 'text-[1.04rem]' : ''}`}>
      <NeuralBackground />
      <GazeReticle position={gazePosition} trail={gazeTrail} dwellingOn={dwellingOn} dwellProgress={dwellProgress} isLocked={isLocked} />

      <TopBar
        patient={patient}
        currentLanguage={currentLanguage}
        setCurrentLanguage={setCurrentLanguage}
        trackingMode={trackingMode}
        gazeAccuracy={gazeAccuracy}
        faceDetected={faceDetected}
        isMuted={isMuted}
        toggleMute={toggleMute}
        autoSpeak={autoSpeak}
        setAutoSpeak={setAutoSpeak}
        voiceMode={voiceMode}
        setVoiceMode={setVoiceMode}
        elevenLabsAvailable={elevenLabsAvailable}
        isDemoRunning={isDemoRunning}
        startDemo={startDemo}
        presentationMode={presentationMode}
        setPresentationMode={setPresentationMode}
        startEyeTracking={() => {
          startEyeTracking();
          setTrackingEnabled(true);
        }}
        stopEyeTracking={stopEyeTracking}
        trackingEnabled={trackingEnabled}
        setTrackingEnabled={setTrackingEnabled}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden px-4 pb-2 pt-4">
        {!presentationMode ? <LeftNav activePage={activePage} setActivePage={setActivePage} /> : null}

        {!presentationMode ? (
          <div className="ml-3 hidden w-[190px] shrink-0 overflow-y-auto overflow-x-hidden xl:block">
            <LeftSidebar vitals={vitals} />
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {activePage === 'dashboard' ? (
            <div className="flex h-full min-h-0 flex-col">
              {/* Quadrant grid — takes all available vertical space */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                <QuadrantGrid
                  selectedQuadrant={selectedQuadrant}
                  dwellingOn={dwellingOn}
                  dwellProgress={dwellProgress}
                  isLocked={isLocked}
                  onQuadrantSelect={handleQuadrantSelect}
                  onPhraseSelect={handlePhraseSelect}
                  translations={currentTranslations}
                  densityMode={densityMode}
                  lastSelectedPhrase={lastSelectedPhraseKey}
                />
              </div>
              {/* Voice output + recent messages — pinned to bottom */}
              <div className="shrink-0">
                <SpeechOutput
                  sentence={deferredSentence}
                  isGenerating={deferredGenerating}
                  isSpeaking={isSpeaking}
                  source={sentenceSource}
                  selectedQuadrant={selectedQuadrant}
                  lastSelectedPhrase={lastSelectedPhrase}
                  conversationHistory={conversationHistory}
                  onSpeak={() => speak(generatedSentence, currentLanguage)}
                  onRepeat={repeatLastSentence}
                  onClear={clearOutput}
                  autoSpeak={autoSpeak}
                  currentLanguage={activeSpeechLanguage || currentLanguage}
                  voiceMode={voiceMode}
                />
              </div>
            </div>
          ) : null}

          {activePage === 'analytics' ? <AnalyticsPage clinicalLog={clinicalLog} vitals={vitals} clinicalAI={clinicalAI} conversationHistory={conversationHistory} /> : null}
          {activePage === 'caregiver' ? <CaregiverHubPage caregiverLog={caregiverLog} setCaregiverLog={setCaregiverLog} clinicalLog={clinicalLog} vitals={vitals} clinicalAI={clinicalAI} showToast={showToast} speak={speak} currentLanguage={currentLanguage} onAddCaregiverEntry={addCaregiverEntry} lastInteractionAt={lastInteractionAt} /> : null}
          {activePage === 'history' ? <SessionHistoryPage clinicalLog={clinicalLog} vitals={vitals} clinicalAI={clinicalAI} /> : null}
          {activePage === 'painmap' ? <PainMapPage currentLanguage={currentLanguage} onPhraseSelect={handlePhraseSelect} painLog={painLog} setPainLog={setPainLog} /> : null}
          {activePage === 'settings' ? <SettingsPage currentLanguage={currentLanguage} setCurrentLanguage={setCurrentLanguage} autoSpeak={autoSpeak} setAutoSpeak={setAutoSpeak} isMuted={isMuted} toggleMute={toggleMute} trackingMode={trackingMode} startEyeTracking={startEyeTracking} stopEyeTracking={stopEyeTracking} dwellTime={dwellTime} setDwellTime={setDwellTime} densityMode={densityMode} setDensityMode={setDensityMode} /> : null}
        </div>

        {!presentationMode ? (
          <div className="ml-4 hidden w-[280px] shrink-0 overflow-y-auto overflow-x-hidden xl:block">
            <RightPanel
              riskScore={clinicalAI.riskScore}
              riskLevel={clinicalAI.riskLevel}
              riskReasoning={clinicalAI.riskReasoning}
              riskRecommendation={clinicalAI.riskRecommendation}
              vitals={vitals}
              caregiverLog={caregiverLog}
              setCaregiverLog={setCaregiverLog}
              clinicalLog={clinicalLog}
              onGenerateReport={generateReport}
              onDownloadPDF={downloadPDF}
              onTestWhatsApp={handleWhatsAppTest}
              onRunRiskAssessment={clinicalAI.runRiskAssessment}
              presentationMode={presentationMode}
              setPresentationMode={setPresentationMode}
            />
          </div>
        ) : null}
      </div>

      {!presentationMode ? <BottomBar isDemoRunning={isDemoRunning} /> : null}
      <GazeEngine 
        faceDetected={faceDetected} 
        onGazeUpdate={handleIrisUpdate} 
        isEnabled={trackingEnabled}
      />

      <CalibrationScreen open={trackingMode === 'eye' && !isCalibrated} onSkip={() => setTrackingMode('mouse')} />

      {sosActive ? <SOSModal countdown={sosCountdown} patient={patient} onCancel={() => setSosActive(false)} /> : null}

      {showReportModal ? (
        <ReportModal
          report={clinicalReport}
          loading={reportLoading}
          vitals={vitals}
          clinicalAI={clinicalAI}
          clinicalLog={clinicalLog}
          sessionDuration={vitals.sessionDuration}
          formatDuration={vitals.formatDuration}
          onDownload={downloadPDF}
          onClose={() => setShowReportModal(false)}
        />
      ) : null}

      <VoiceSetupModal open={voiceSetupOpen} onClose={() => setVoiceSetupOpen(false)} autoSpeak={autoSpeak} setAutoSpeak={setAutoSpeak} />

      {/* Permanent SOS Anchor — always visible, bypasses all menus */}
      {!presentationMode && !sosActive ? (
        <SOSAnchor
          onTrigger={triggerSOS}
          dwellingOn={dwellingOn}
          dwellProgress={dwellProgress}
        />
      ) : null}
    </div>
  );
}
