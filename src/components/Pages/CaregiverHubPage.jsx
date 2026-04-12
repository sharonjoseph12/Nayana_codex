import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LayoutGrid, AlertCircle, LogOut, Search, UserCheck, ShieldAlert, Lock, Unlock, TrendingUp, Activity, WifiOff, Sparkles, Heart, Map as MapIcon, ChevronRight, User } from 'lucide-react';
import { PATIENT } from '../../constants/config';
import { sendWhatsAppAlert } from '../../services/whatsapp';
import BedsideCard from '../Clinical/BedsideCard';
import VitalsTrendChart from '../Clinical/VitalsTrendChart';
import HandoverReportView from '../Clinical/HandoverReportView';
import SentimentTimeline from '../Clinical/SentimentTimeline';
import WardHeatmap from '../Clinical/WardHeatmap';
import WardTriageWidget from '../Clinical/WardTriageWidget';

// Phase 21-26: Clinical Intelligence, Ward Strategy & Psychological Well-being
import { cloudSync } from '../../services/cloudSync';

const MOCK_PATIENTS = {
  'icu-7': { id: 'icu-7', name: 'Arjun Mehta', condition: 'ALS Stage 2', room: 'ICU-7', caregiver: 'Dr. Priya' },
  'icu-4': { id: 'icu-4', name: 'Suhail Khan', condition: 'Post-Op Recovery', room: 'ICU-4', caregiver: 'Dr. Priya' },
  'icu-12': { id: 'icu-12', name: 'Nita Rai', condition: 'Acute Respiratory', room: 'ICU-12', caregiver: 'Dr. Priya' },
};

export default function CaregiverHubPage({
  caregiverLog, setCaregiverLog, clinicalLog, vitals, clinicalAI, showToast, speak, currentLanguage, onAddCaregiverEntry, lastInteractionAt, onSendResponse, patientInfoOverride,
}) {
  const [view, setView] = useState('grid');
  const [selectedPatientId, setSelectedPatientId] = useState('icu-7');
  const [responseText, setResponseText] = useState('');
  const [hardwareAlerts, setHardwareAlerts] = useState({});
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  
  const [bedsideStatus, setBedsideStatus] = useState({}); 
  const [bedsidePredictions, setBedsidePredictions] = useState({}); 
  const [bedsideSentiments, setBedsideSentiments] = useState({}); 
  const [bedsideWellbeing, setBedsideWellbeing] = useState({}); // { [roomId]: score }

  useEffect(() => {
    const unsubscribe = cloudSync.subscribe((data) => {
      const rId = data.roomId || data.patient?.room || 'icu-7';
      if (data?.type === 'HEARTBEAT' || data?.type === 'SYNC_STATE' || data?.type === 'PHRASE_SELECTED') {
        setBedsideStatus(prev => ({ ...prev, [rId]: { lastSeen: Date.now() } }));
      }
      if (data?.type === 'SYNC_STATE') {
        if (data.sentiment) setBedsideSentiments(prev => ({ ...prev, [rId]: data.sentiment }));
        if (data.wellbeingScore !== undefined) setBedsideWellbeing(prev => ({ ...prev, [rId]: data.wellbeingScore }));
      }
      if (data?.type === 'AI_PREDICTIONS') {
        setBedsidePredictions(prev => ({ ...prev, [rId]: data.suggestions }));
      }
      if (data?.type === 'HARDWARE_HEALTH') {
        setHardwareAlerts(prev => ({ ...prev, [data.patientId || 'icu-7']: { status: data.status, message: data.message } }));
      }
    });
    const watchdogInterval = setInterval(() => { setBedsideStatus(prev => ({ ...prev })); }, 5000);
    return () => { unsubscribe(); clearInterval(watchdogInterval); };
  }, []);

  const handlePinSubmit = () => {
    if (pin === '1234') { setIsLocked(false); showToast('Terminal Unlocked', 'success'); }
    else { setPin(''); showToast('Access Denied', 'warning'); }
  };

  if (isLocked) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.03] border border-white/10 text-white/20"><ShieldAlert size={40} /></div>
        <h1 className="font-display text-4xl font-bold text-white mb-2">Nursing Station Locked</h1>
        <div className="flex flex-col gap-4 w-64 mt-8">
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="••••" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-center text-3xl tracking-[1em] focus:outline-none focus:border-medical" onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}/>
          <button onClick={handlePinSubmit} className="w-full bg-medical py-4 rounded-2xl text-black font-bold">UNLOCK</button>
        </div>
      </div>
    );
  }

  const patientData = patientInfoOverride || PATIENT;

  return (
    <div className={`flex flex-col gap-6 p-6 animate-fade-in h-screen overflow-y-auto`}>
      <div className="flex items-center justify-between shrink-0">
        <div><h1 className="font-display text-4xl font-bold text-white">Nursing Station</h1><p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-white/30">ICU Ward Floor A • Tactical Command</p></div>
        <div className="flex items-center gap-4">
           <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
              <button onClick={() => setView('grid')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'grid' ? 'bg-medical text-black shadow-glow-sm' : 'text-white/40 hover:text-white'}`}><LayoutGrid size={14} /> Grid</button>
              <button onClick={() => setView('map')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'map' ? 'bg-medical text-black shadow-glow-sm' : 'text-white/40 hover:text-white'}`}><MapIcon size={14} /> Map</button>
           </div>
           <button onClick={() => setIsLocked(true)} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40"><Lock size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,320px] flex-1 min-h-0">
         <div className="flex flex-col gap-6 min-h-0">
            {(view === 'grid' || view === 'detail') && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <div className="relative">
                     <BedsideCard patient={patientData} vitals={vitals} clinicalAI={clinicalAI} lastInteractionAt={lastInteractionAt} isCommunicating={Date.now() - lastInteractionAt < 120000} isOffline={Date.now() - (bedsideStatus[patientData.room]?.lastSeen || 0) > 20000} predictions={bedsidePredictions[patientData.room]} onOpenDetails={() => { setView('detail'); setSelectedPatientId('icu-7'); }}/>
                     {bedsideWellbeing[patientData.room] !== undefined && (
                        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 shadow-glow-sm">
                           <Heart size={10} className="text-black animate-pulse" />
                           <span className="text-[10px] font-black text-black">{bedsideWellbeing[patientData.room]}%</span>
                        </div>
                     )}
                  </div>
                  {bedsideSentiments[patientData.room] && <div className="panel-elevated p-5"><SentimentTimeline history={bedsideSentiments[patientData.room].history} /></div>}
                </div>
                {Object.values(MOCK_PATIENTS).filter(p => p.id !== 'icu-7').map(p => (
                  <BedsideCard key={p.id} patient={p} vitals={{ heartRate: 72, stressLevel: 'Low' }} clinicalAI={{ riskLevel: 'Stable' }} lastInteractionAt={Date.now() - 300000} isCommunicating={false} isOffline={false} onOpenDetails={() => {}} />
                ))}
              </div>
            )}
            
            {view === 'map' && <WardHeatmap bedsideSentiments={bedsideSentiments} onSelectBed={(id) => { if(id === 'icu-7') { setView('detail'); setSelectedPatientId(id); } }} />}
         </div>

         <div className="flex flex-col gap-6 shrink-0">
            <WardTriageWidget bedsideSentiments={bedsideSentiments} patients={{ 'icu-7': patientData, ...MOCK_PATIENTS }} />
            {view === 'detail' && (
               <div className="bg-[#121212] border border-white/5 rounded-[32px] p-6">
                  <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Psychological Pulse</h3>
                  <div className="flex items-center gap-4 mb-6">
                     <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500"><Heart size={20} /></div>
                     <div>
                        <div className="text-xl font-bold text-white">{bedsideWellbeing[patientData.room] || 100}%</div>
                        <div className="text-[10px] text-white/20 uppercase font-mono">Dignity Engagement Score</div>
                     </div>
                  </div>
                  <HandoverReportView clinicalLog={clinicalLog} vitals={vitals} clinicalAI={clinicalAI} />
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
CaregiverHubPage.propTypes = { caregiverLog: PropTypes.array, clinicalLog: PropTypes.array, vitals: PropTypes.object, clinicalAI: PropTypes.object, showToast: PropTypes.func, speak: PropTypes.func, currentLanguage: PropTypes.string, onAddCaregiverEntry: PropTypes.func, lastInteractionAt: PropTypes.number };
