import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LayoutGrid, AlertCircle, LogOut, Search, UserCheck, ShieldAlert, Lock, Unlock, TrendingUp, Activity, WifiOff, Sparkles, Heart, Map as MapIcon, ChevronRight, User, Pill, Clock, Plus, Trash2, Check } from 'lucide-react';
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

  // Medication reminders state
  const [medReminders, setMedReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nayana_med_reminders') || '[]'); } catch { return []; }
  });
  const [medForm, setMedForm] = useState({ name: '', dueTime: '' });
  const [showMedForm, setShowMedForm] = useState(false);
  const medCheckRef = useRef(null);

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

  // Medication reminder watchdog
  useEffect(() => {
    localStorage.setItem('nayana_med_reminders', JSON.stringify(medReminders));
    if (medCheckRef.current) clearInterval(medCheckRef.current);
    medCheckRef.current = setInterval(() => {
      const now = new Date();
      const hhmm = now.toTimeString().slice(0, 5); // 'HH:MM'
      setMedReminders(prev => prev.map(r => {
        if (!r.fired && r.dueTime === hhmm) {
          showToast?.(`💊 Medication due: ${r.name}`, 'warning');
          const patientName = patientInfoOverride?.name || 'Patient';
          const room = patientInfoOverride?.room || 'ICU';
          sendWhatsAppAlert(`NAYANA MED REMINDER\n\nPatient: ${patientName} | Room: ${room}\nMedication: ${r.name}\nDue Time: ${r.dueTime}\n\nPlease administer medication now.`);
          return { ...r, fired: true };
        }
        return r;
      }));
    }, 15000); // check every 15s
    return () => clearInterval(medCheckRef.current);
  }, [medReminders, showToast, patientInfoOverride]);

  const addMedReminder = () => {
    if (!medForm.name.trim() || !medForm.dueTime) return;
    const newReminder = { id: Date.now(), name: medForm.name.trim(), dueTime: medForm.dueTime, fired: false, createdAt: new Date().toISOString() };
    setMedReminders(prev => [...prev, newReminder]);
    setMedForm({ name: '', dueTime: '' });
    setShowMedForm(false);
    showToast?.(`Reminder set: ${medForm.name} at ${medForm.dueTime}`, 'success');
  };

  const removeMedReminder = (id) => setMedReminders(prev => prev.filter(r => r.id !== id));

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

            {/* Medication Reminders Panel */}
            <div className="rounded-[24px] border border-white/[0.06] bg-[#0f0f0f] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pill size={14} className="text-[#bf80ff]" />
                  <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Medication Reminders</h3>
                </div>
                <button
                  onClick={() => setShowMedForm(prev => !prev)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#bf80ff]/10 border border-[#bf80ff]/20 text-[#bf80ff] text-[10px] font-bold uppercase tracking-widest hover:bg-[#bf80ff]/20 transition-all"
                >
                  <Plus size={11} /> Add
                </button>
              </div>

              {showMedForm && (
                <div className="mb-4 flex flex-col gap-2 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <input
                    type="text"
                    placeholder="Medication name…"
                    value={medForm.name}
                    onChange={e => setMedForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-[#bf80ff]/30"
                  />
                  <input
                    type="time"
                    value={medForm.dueTime}
                    onChange={e => setMedForm(prev => ({ ...prev, dueTime: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[#bf80ff]/30"
                    style={{ colorScheme: 'dark' }}
                  />
                  <button
                    onClick={addMedReminder}
                    disabled={!medForm.name.trim() || !medForm.dueTime}
                    className="w-full py-2 rounded-lg bg-[#bf80ff]/15 border border-[#bf80ff]/30 text-[#bf80ff] text-[10px] font-bold uppercase tracking-widest hover:bg-[#bf80ff]/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Set Reminder
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {medReminders.length === 0 ? (
                  <p className="text-center text-[10px] text-white/15 py-4 font-mono uppercase">No reminders set</p>
                ) : (
                  medReminders.slice().reverse().map(r => (
                    <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      r.fired ? 'border-stable-green/20 bg-stable-green/[0.03] opacity-50' : 'border-white/[0.06] bg-white/[0.02]'
                    }`}>
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                        r.fired ? 'border-stable-green/30 bg-stable-green/10' : 'border-[#bf80ff]/20 bg-[#bf80ff]/5'
                      }`}>
                        {r.fired ? <Check size={12} className="text-stable-green" /> : <Clock size={12} className="text-[#bf80ff]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{r.name}</div>
                        <div className="text-[10px] font-mono text-white/30 mt-0.5">{r.dueTime} {r.fired && '· Done'}</div>
                      </div>
                      <button onClick={() => removeMedReminder(r.id)} className="text-white/15 hover:text-emergency transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

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
