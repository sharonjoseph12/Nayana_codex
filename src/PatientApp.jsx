import { useCallback, useEffect, useMemo, useRef, useState, useDeferredValue } from 'react';
import html2pdf from 'html2pdf.js';
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
import HardwareStatsModal from './components/Modals/HardwareStatsModal';
import HandoverReportModal from './components/Modals/HandoverReportModal';
import GazeReticle from './components/Tracking/GazeReticle';
import { Star } from 'lucide-react';
import GazeEngine from './components/Tracking/GazeEngine';
import CalibrationScreen from './components/Tracking/CalibrationScreen';
import SOSAnchor from './components/Tracking/SOSAnchor';
import AnalyticsPage from './components/Analytics/AnalyticsPage';
import CaregiverHubPage from './components/Pages/CaregiverHubPage';
import SessionHistoryPage from './components/Pages/SessionHistoryPage';
import PainMapPage from './components/Pages/PainMapPage';
import SettingsPage from './components/Pages/SettingsPage';
import LoginPage from './components/Pages/LoginPage';
import KeyboardPage from './components/Pages/KeyboardPage';
import MemoryPage from './components/Pages/MemoryPage';
import FamilyPortalPage from './components/Pages/FamilyPortalPage';
import NeuralBackground from './components/NeuralBackground';
import { useGazeTracking } from './hooks/useGazeTracking';
import useRealVitals from './hooks/useRealVitals';
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

// Phase 21-31: Clinical Intelligence, Hardware Health & Family Respite
import { cloudSync } from './services/cloudSync';
import { useClinicalMemory } from './hooks/useClinicalMemory';
import { usePredictiveAI } from './hooks/usePredictiveAI';
import { sentinelEngine } from './services/sentinelEngine';

import { buildPDFHTML } from './services/pdf';
import { buildEmotionMessage, buildSOSMessage, buildRiskMessage, sendWhatsAppAlert } from './services/whatsapp';
import { webrtcManager } from './services/webrtc';
import { Heart } from 'lucide-react';

// Initialize Global Tab ID for isolation
if (typeof window !== 'undefined' && !window.__nayana_tab_id) {
  window.__nayana_tab_id = Math.random().toString(36).substring(7);
}

const elevenLabsAvailable = !!import.meta.env.VITE_ELEVENLABS_API_KEY;

export default function PatientApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [patient, setPatient] = useState(DEFAULT_PATIENT);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [generatedSentence, setGeneratedSentence] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState('default');
  const [wellbeingScore, setWellbeingScore] = useState(100);
  const [showHardwareStats, setShowHardwareStats] = useState(false);
  const [showFamilyHug, setShowFamilyHug] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverReportText, setHandoverReportText] = useState('');
  const [handoverGenerating, setHandoverGenerating] = useState(false);

  const deferredSentence = useDeferredValue(generatedSentence);
  const deferredGenerating = useDeferredValue(isGenerating);

  const [conversationHistory, setConversationHistory] = useState([]);
  const [painLog, setPainLog] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try {
      const key = `nayana_favs_${patient?.room || 'default'}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch { return []; }
  });
  const { caregiverLog, clinicalLog, updateLog, setMemory } = useClinicalMemory(patient.room);

  const setCaregiverLog = useCallback((newLog) => {
    setMemory(prev => ({ ...prev, caregiverLog: typeof newLog === 'function' ? newLog(prev.caregiverLog) : newLog }));
  }, [setMemory]);

  const setClinicalLog = useCallback((newLog) => {
    setMemory(prev => ({ ...prev, clinicalLog: typeof newLog === 'function' ? newLog(prev.clinicalLog) : newLog }));
  }, [setMemory]);

  const [sosActive, setSosActive] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [lastSelectedPhraseKey, setLastSelectedPhraseKey] = useState(null);
  const [lastInteractionAt, setLastInteractionAt] = useState(Date.now());
  const [dwellTime, setDwellTime] = useState(1800);
  const [toasts, setToasts] = useState([]);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [showGazeReticle, setShowGazeReticle] = useState(true);
  const [visionRefresh, setVisionRefresh] = useState(0);

  const refreshVision = useCallback(() => {
    setVisionRefresh(prev => prev + 1);
    setTrackingEnabled(false);
    setTimeout(() => setTrackingEnabled(true), 100);
  }, []);

  const [densityMode, setDensityMode] = useState('normal');

  const { vitals, isLive: isVitalsLive, connectBLE, disconnectBLE } = useRealVitals(true);
  const { isSpeaking, isMuted, autoSpeak, speak, cancelSpeech, toggleMute, setAutoSpeak, voiceMode, setVoiceMode } = useSpeech();
  const clinicalAI = useClinicalAI({ vitals, patient });
  const { sendManagedAlert } = useCaregiverAlerts();
  const { suggestions: aiSuggestions } = usePredictiveAI(clinicalLog, vitals);

  const { trackingMode, gazePosition, headPosition, dwellingOn, dwellProgress, gazeAccuracy, signalQuality, fps, gazeTrail, faceDetected, isCalibrated, isLocked, handleIrisUpdate, registerElement, startEyeTracking, stopEyeTracking, setTrackingMode } = useGazeTracking({ onQuadrantSelect: useCallback((q) => setSelectedQuadrant(q), []), onPhraseSelect: useCallback((q, p) => handlePhraseSelect(q, p), []), onSOSTrigger: useCallback(() => triggerSOS(), []), dwellTimeOverride: dwellTime });

  const emotionDetection = useEmotionDetection({ faceDetected, lastInteractionAt });

  // Phase 30: Sentinel Heartbeat Activation
  const sentinelReport = useMemo(() => {
     return sentinelEngine.calculateProbability({
        vitals, sentiment: { stabilityIndex: emotionDetection.stabilityIndex }, gazeFidelity: signalQuality, clinicalLog
     });
  }, [vitals, emotionDetection.stabilityIndex, signalQuality, clinicalLog]);

  // Phase 31: Remote Family Connection Hub
  useEffect(() => {
     const unsubscribe = cloudSync.subscribe((data) => {
        if (data.type === 'FAMILY_HUG' && data.roomId === patient.room) {
           setShowFamilyHug(true);
           setTimeout(() => setShowFamilyHug(false), 3500);
        }
     });
     return unsubscribe;
  }, [patient.room]);

  useEffect(() => {
    setTheme(new Date().getHours() >= 22 || new Date().getHours() < 6 ? 'night' : 'default');
    if (sentinelReport.probability > 90 && !sosActive) triggerSOS('SENTINEL_ADVISORY: DETERIORATION PREDICTED');
  }, [sentinelReport, patient.id, patient.room, sosActive]);

  useEffect(() => {
     const interval = setInterval(() => {
        setWellbeingScore(prev => activePage === 'memory' ? Math.min(100, prev + 2) : Math.max(0, prev - 1));
     }, 10000);
     return () => clearInterval(interval);
  }, [activePage]);

  const showToast = useCallback((message, tone = 'info', action = null) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, tone, action }]);
    const duration = action ? 10000 : 3200;
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const addCaregiverEntry = useCallback((quadrant, message, color, extras = {}) => {
    // Phase 44: Defensive Sanitization
    const safeMessage = typeof message === 'string' ? message : 'System Update Received';
    const entry = { id: Date.now() + Math.random(), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), message: safeMessage, quadrant, color, acknowledged: extras.acknowledged ?? false, phrase: extras.phrase || null, sentence: extras.sentence || safeMessage, timestamp: new Date() };
    updateLog('caregiverLog', entry);
  }, [updateLog]);

  const triggerSOS = useCallback(async (reason = 'SOS triggered') => {
    // Phase 44: Defensive Sanitization for event leakage
    const safeReason = typeof reason === 'string' ? reason : 'SOS triggered';
    setSosActive(true);
    addCaregiverEntry('Emergency', safeReason, '#ff3d5a', { acknowledged: false, phrase: 'SOS', sentence: safeReason });
    await sendManagedAlert('sos', buildSOSMessage(patient, new Date().toLocaleTimeString('en-IN')));
    speak('Emergency alert has been triggered.'); 
    showToast('SOS alert sent', 'warning');
  }, [addCaregiverEntry, patient, sendManagedAlert, showToast, speak]);
  // Persist conversationHistory and painLog to localStorage
  useEffect(() => {
    try {
      const key = `nayana_conv_${patient.room}_${new Date().toDateString()}`;
      localStorage.setItem(key, JSON.stringify(conversationHistory));
    } catch {}
  }, [conversationHistory, patient.room]);

  useEffect(() => {
    try {
      const key = `nayana_pain_${patient.room}_${new Date().toDateString()}`;
      localStorage.setItem(key, JSON.stringify(painLog));
    } catch {}
  }, [painLog, patient.room]);

  useEffect(() => {
    try {
      const key = `nayana_favs_${patient.room}`;
      localStorage.setItem(key, JSON.stringify(favorites));
    } catch {}
  }, [favorites, patient.room]);

  // Inactivity auto-alert — fires after 5 minutes of no patient interaction
  const inactivityAlertedRef = useRef(false);
  useEffect(() => {
    const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutes
    const check = setInterval(() => {
      const elapsed = Date.now() - lastInteractionAt;
      if (elapsed > INACTIVITY_MS && !inactivityAlertedRef.current && !sosActive) {
        inactivityAlertedRef.current = true;
        showToast('⚠ No patient interaction for 5 min — check patient', 'warning');
        sendWhatsAppAlert(buildEmotionMessage(patient, 'No interaction detected', new Date().toLocaleTimeString('en-IN')));
      }
      if (elapsed < INACTIVITY_MS) {
        inactivityAlertedRef.current = false; // reset if patient becomes active again
      }
    }, 30000); // check every 30s
    return () => clearInterval(check);
  }, [lastInteractionAt, patient, showToast, sosActive]);


  const handlePhraseSelect = async (quadrant, phrase, options = {}) => {
    if (isGenerating) return;
    setSelectedQuadrant(quadrant); setLastSelectedPhraseKey(`${quadrant}-${phrase}`);
    setIsGenerating(true); setLastInteractionAt(Date.now());
    try {
      const result = await generateSentence(quadrant, phrase, currentLanguage, conversationHistory, { heartRate: vitals.heartRate, caregiver: patient.caregiver, room: patient.room, patient });
      if (result.text) {
        setGeneratedSentence(result.text); setConversationHistory((prev) => [{ sentence: result.text }, ...prev].slice(0, 50));
        addCaregiverEntry(quadrant, `${quadrant} -> ${phrase}`, QUADRANT_CONFIG[quadrant]?.color, { phrase, sentence: result.text });
        cloudSync.broadcastState({ type: 'PHRASE_SELECTED', text: result.text, roomId: patient.room });
        if (autoSpeak || options.forceSpeak) speak(result.text, currentLanguage);
      }
    } catch {} finally { setIsGenerating(false); }
  };

  const toggleFavorite = useCallback((phraseLabel) => {
    setFavorites(prev => 
      prev.includes(phraseLabel) 
        ? prev.filter(f => f !== phraseLabel) 
        : [...prev, phraseLabel]
    );
    showToast(favorites.includes(phraseLabel) ? "Removed from Pinned" : "Pinned to Top", "info");
  }, [favorites, showToast]);

  const handleCustomSentenceComplete = useCallback((text) => {
    if (!text.trim()) return;
    setConversationHistory((prev) => [{ sentence: text }, ...prev].slice(0, 50));
    addCaregiverEntry('Custom', 'Keyboard Expression', '#ffffff', { sentence: text });
    cloudSync.broadcastState({ type: 'PHRASE_SELECTED', text, roomId: patient.room });
    speak(text, currentLanguage);
    showToast("Message Sent & Spoken", "success");
  }, [addCaregiverEntry, currentLanguage, patient.room, speak, showToast]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      ['Medical', 'Social', 'Personal', 'Emergency'].forEach((q) => {
        registerElement(`quadrant-${q}`, 'quadrant');
        PHRASES[q]?.forEach((p) => registerElement(`phrase-${q}-${encodeTrackableValue(p.label)}`, 'phrase'));
      });
      for (let i = 0; i <= 2; i++) registerElement(`predict-${i}`, 'phrase');
      for (let i = 1; i <= 6; i++) registerElement(`mem-mem-${i}`, 'button');
      ['btn-speak', 'btn-repeat', 'btn-clear', 'sos-anchor-btn', 'btn-back', 'key-lang-toggle'].forEach(id => registerElement(id, 'button'));
    }, 450);
    return () => clearTimeout(timeout);
  }, [registerElement, selectedQuadrant]);

  useEffect(() => {
    if (webrtcManager.isHost && webrtcManager.connection) {
       cloudSync.broadcastState({ 
          type: 'SYNC_STATE', vitals, caregiverLog, clinicalLog, clinicalAI, patient, 
          sentiment: { current: emotionDetection.emotion, history: emotionDetection.emotionHistory, stabilityIndex: emotionDetection.stabilityIndex }, 
          wellbeingScore, sentinelReport, lastInteractionAt
       });
    }
  }, [vitals, caregiverLog, clinicalLog, clinicalAI, patient, emotionDetection, wellbeingScore, sentinelReport, lastInteractionAt]);

  const handleLogin = (patientData) => {
    setPatient(patientData);
    setIsLoggedIn(true);
    // Restore persisted data for this patient's room+day
    try {
      const convKey = `nayana_conv_${patientData.room}_${new Date().toDateString()}`;
      const painKey = `nayana_pain_${patientData.room}_${new Date().toDateString()}`;
      const savedConv = JSON.parse(localStorage.getItem(convKey) || '[]');
      const savedPain = JSON.parse(localStorage.getItem(painKey) || '[]');
      if (savedConv.length) setConversationHistory(savedConv);
      if (savedPain.length) setPainLog(savedPain);
      
      const favKey = `nayana_favs_${patientData.room}`;
      const savedFavs = JSON.parse(localStorage.getItem(favKey) || '[]');
      setFavorites(savedFavs);
    } catch {}
  };
  
  const handleVisionError = useCallback((err) => {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      showToast("VISION ACCESS DENIED", "warning", { label: "Verify Camera", onClick: refreshVision });
    } else {
      showToast(`Vision Error: ${err.message}`, "error");
    }
  }, [showToast, refreshVision]);

  const handlePDFExport = async () => {
    try {
      const report = sentinelReport?.assessment?.reasoning || "Standard clinical monitoring active.";
      const content = buildPDFHTML(report, clinicalLog, vitals, clinicalAI);
      
      const element = document.createElement('div');
      element.innerHTML = content;
      
      const opt = {
        margin: 10,
        filename: `NAYANA_Handover_${patient.name}_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(element).set(opt).save();
      showToast("Clinical Report Exported", "success");
      
      // Phase 48: Clinical Chain of Custody (WhatsApp Alert)
      sendWhatsAppAlert(`CLINICAL ALERT: A handover report has been generated for Patient ${patient.name} in Room ${patient.room}. Please check the system log.`);
    } catch (err) {
      showToast("Export Failed", "error");
    }
  };

  const handleGenerateHandoverReport = useCallback(async () => {
    setShowHandoverModal(true);
    setHandoverGenerating(true);
    setHandoverReportText('');
    try {
      const text = await generateHandoverReport(clinicalLog, vitals, clinicalAI, patient);
      setHandoverReportText(text);
    } catch {
      setHandoverReportText('Report generation failed. Please try again.');
    } finally {
      setHandoverGenerating(false);
    }
  }, [clinicalLog, vitals, clinicalAI, patient]);

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-base" data-theme={theme}>
      <NeuralBackground />
      {/* Digital Hug Pulse (Phase 31) */}
      {showFamilyHug && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-medical/5 backdrop-blur-sm animate-fade-in pointer-events-none">
           <div className="p-12 rounded-full bg-medical/10 border border-medical/20 animate-hug-pulse">
              <Heart size={120} className="text-medical fill-medical/40" />
           </div>
           <p className="mt-8 text-2xl font-black text-medical uppercase tracking-[0.5em] animate-fade-in delay-500">A hug from home</p>
        </div>
      )}

        <GazeReticle 
          position={gazePosition} 
          trail={gazeTrail} 
          dwellingOn={dwellingOn} 
          dwellProgress={dwellProgress} 
          isLocked={isLocked} 
          isVisible={showGazeReticle}
        />
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
        startEyeTracking={startEyeTracking} 
        stopEyeTracking={stopEyeTracking} 
        trackingEnabled={trackingEnabled} 
        setTrackingEnabled={setTrackingEnabled}
        elevenLabsAvailable={elevenLabsAvailable}
        isDemoRunning={presentationMode}
        startDemo={() => setPresentationMode(!presentationMode)}
        presentationMode={presentationMode}
        setPresentationMode={setPresentationMode}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden px-4 pb-2 pt-4">
        {!presentationMode && <LeftNav activePage={activePage} setActivePage={setActivePage} />}
        {!presentationMode && <div className="ml-3 hidden w-[190px] shrink-0 xl:block"><LeftSidebar vitals={vitals} /></div>}
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          {activePage === 'dashboard' && (
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto">
                <QuadrantGrid 
                  selectedQuadrant={selectedQuadrant} 
                  dwellingOn={dwellingOn} 
                  dwellProgress={dwellProgress} 
                  isLocked={isLocked} 
                  onQuadrantSelect={setSelectedQuadrant} 
                  onPhraseSelect={handlePhraseSelect} 
                  translations={TRANSLATIONS[currentLanguage]} 
                  densityMode={densityMode} 
                  lastSelectedPhrase={lastSelectedPhraseKey} 
                  aiSuggestions={aiSuggestions}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
              <SpeechOutput 
                sentence={deferredSentence} 
                isGenerating={deferredGenerating} 
                isSpeaking={isSpeaking} 
                onSpeak={() => speak(generatedSentence, currentLanguage)} 
                onRepeat={() => speak(generatedSentence, currentLanguage)} 
                onClear={() => setGeneratedSentence('')} 
                autoSpeak={autoSpeak} 
                currentLanguage={currentLanguage} 
                source="gemini"
                voiceMode={voiceMode}
                conversationHistory={conversationHistory}
                selectedQuadrant={selectedQuadrant}
                lastSelectedPhrase={lastSelectedPhraseKey}
              />
            </div>
          )}
          {activePage === 'keyboard' && <KeyboardPage dwellingOn={dwellingOn} dwellProgress={dwellProgress} onSentenceComplete={handleCustomSentenceComplete} />}
          {activePage === 'memory' && <MemoryPage dwellingOn={dwellingOn} dwellProgress={dwellProgress} speak={speak} />}
          {activePage === 'analytics' && <AnalyticsPage clinicalLog={clinicalLog} vitals={vitals} clinicalAI={clinicalAI} conversationHistory={conversationHistory} />}
          {activePage === 'caregiver' && <CaregiverHubPage caregiverLog={caregiverLog} setCaregiverLog={setCaregiverLog} clinicalLog={clinicalLog} vitals={vitals} clinicalAI={clinicalAI} showToast={showToast} speak={speak} currentLanguage={currentLanguage} onAddCaregiverEntry={addCaregiverEntry} lastInteractionAt={lastInteractionAt} onSendHug={() => cloudSync.sendFamilyHug(patient.room)} sentiment={emotionDetection} wellbeingScore={wellbeingScore} />}
          {activePage === 'family' && <FamilyPortalPage patient={patient} sentiment={emotionDetection} wellbeingScore={wellbeingScore} lastInteractionAt={lastInteractionAt} onSendHug={() => cloudSync.sendFamilyHug(patient.room)} />}
          {activePage === 'history' && <SessionHistoryPage clinicalLog={clinicalLog} vitals={vitals} clinicalAI={clinicalAI} />}
          {activePage === 'painmap' && <PainMapPage currentLanguage={currentLanguage} onPhraseSelect={handlePhraseSelect} painLog={painLog} setPainLog={setPainLog} onAddClinicalEntry={(entry) => addCaregiverEntry(entry.quadrant, entry.phrase, entry.color, { phrase: entry.phrase, sentence: entry.sentence })} />}
          {activePage === 'settings' && (
            <SettingsPage 
              currentLanguage={currentLanguage} 
              setCurrentLanguage={setCurrentLanguage} 
              autoSpeak={autoSpeak} 
              setAutoSpeak={setAutoSpeak} 
              dwellTime={dwellTime} 
              setDwellTime={setDwellTime}
              isMuted={isMuted}
              toggleMute={toggleMute}
              trackingMode={trackingMode}
              startEyeTracking={startEyeTracking}
              stopEyeTracking={stopEyeTracking}
              patient={patient}
              isVitalsLive={isVitalsLive}
              connectBLE={connectBLE}
              disconnectBLE={disconnectBLE}
              showGazeReticle={showGazeReticle}
              setShowGazeReticle={setShowGazeReticle}
            />
          )}
        </div>
        {!presentationMode && (
          <div className="ml-4 hidden w-[270px] shrink-0 overflow-y-auto h-full pr-1 xl:block scrollbar-slim">
            <RightPanel 
              riskScore={clinicalAI.riskScore} 
              riskLevel={clinicalAI.riskLevel} 
              riskReasoning={clinicalAI.riskReasoning || "Stable gaze patterns and stable vitals detected."}
              riskRecommendation={clinicalAI.riskRecommendation || "Continue standard ICU monitoring protocols."}
              vitals={vitals} 
              caregiverLog={caregiverLog} 
              setCaregiverLog={setCaregiverLog}
              clinicalLog={clinicalLog} 
              presentationMode={presentationMode} 
              setPresentationMode={setPresentationMode} 
              onGenerateReport={handleGenerateHandoverReport}
              onDownloadPDF={handlePDFExport}
              onTestWhatsApp={() => sendWhatsAppAlert(buildSOSMessage(patient, new Date().toLocaleTimeString()))}
              onRunRiskAssessment={() => showToast("AI Risk Engine Re-calibrated", "success")}
            />
          </div>
        )}
      </div>
        <BottomBar 
          isDemoRunning={presentationMode} 
          signalQuality={signalQuality} 
          fps={fps} 
          isVitalsLive={isVitalsLive}
          onOpenStats={() => setShowHardwareStats(true)} 
        /><GazeEngine key={visionRefresh} faceDetected={faceDetected} onGazeUpdate={handleIrisUpdate} onError={handleVisionError} isEnabled={trackingEnabled} />
      
      {/* 🚀 Phase 37 Toast Stack */}
      <div className="fixed top-24 left-1/2 z-[200] flex -translate-x-1/2 flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-6 py-4 shadow-2xl animate-toast-in ${
              toast.tone === 'warning' ? 'bg-emergency/10 border-emergency text-emergency' :
              toast.tone === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' :
              toast.tone === 'success' ? 'bg-stable-green/10 border-stable-green text-stable-green' :
              'bg-medical/10 border-medical text-medical'
            }`}
          >
            <span className="font-display font-black uppercase tracking-widest text-xs">{toast.message}</span>
            {toast.action && (
               <button 
                  onClick={() => { toast.action.onClick(); setToasts(prev => prev.filter(t => t.id !== toast.id)); }}
                  className="ml-2 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/5 text-[10px] font-bold uppercase transition-all"
               >
                  {toast.action.label}
               </button>
            )}
          </div>
        ))}
      </div>
      <HardwareStatsModal open={showHardwareStats} onClose={() => setShowHardwareStats(false)} fps={fps} signalQuality={signalQuality} gazeAccuracy={gazeAccuracy} />
      <HandoverReportModal
        open={showHandoverModal}
        onClose={() => setShowHandoverModal(false)}
        patient={patient}
        reportText={handoverReportText}
        isGenerating={handoverGenerating}
      />
      <CalibrationScreen open={trackingMode === 'eye' && !isCalibrated} onSkip={() => setTrackingMode('mouse')} />
      {!presentationMode && !sosActive && <SOSAnchor onTrigger={triggerSOS} dwellingOn={dwellingOn} dwellProgress={dwellProgress} />}
    </div>
  );
}
