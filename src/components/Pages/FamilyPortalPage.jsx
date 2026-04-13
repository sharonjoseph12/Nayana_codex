import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Heart, Activity, MessageCircle, ShieldCheck, Share2, Info } from 'lucide-react';

/**
 * Phase 31: Remote Family Portal
 * A mobile-optimized view for families to connect with ICU patients.
 */
export default function FamilyPortalPage({ 
  patient, 
  sentiment, 
  wellbeingScore, 
  lastInteractionAt,
  onSendHug 
}) {
  const [hugCount, setHugCount] = useState(0);
  const [sending, setSending] = useState(false);

  const getStatusNarrative = () => {
    const timeSince = Date.now() - lastInteractionAt;
    if (timeSince < 5 * 60 * 1000) return `${patient.name} is currently communicating and active.`;
    if (timeSince < 60 * 60 * 1000) return `${patient.name} was recently active and is now resting.`;
    return `${patient.name} is resting comfortably.`;
  };

  const handleSendHug = () => {
    setSending(true);
    onSendHug();
    setHugCount(prev => prev + 1);
    setTimeout(() => setSending(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#060606] text-white p-6 max-w-md mx-auto animate-fade-in font-sans">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-medical/10 text-medical">
               <Heart size={24} className="fill-medical/20" />
            </div>
            <div>
               <h1 className="text-xl font-bold">Nayana Family Portal</h1>
               <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Digital ICU Bridge</span>
            </div>
         </div>
      </div>

      {/* Hero Status Card */}
      <div className="p-8 rounded-[40px] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 mb-6 text-center shadow-glow-sm">
         <div className="h-20 w-20 rounded-full border border-medical/20 bg-medical/5 flex items-center justify-center mx-auto mb-6">
            <Activity size={32} className="text-medical animate-pulse" />
         </div>
         <h2 className="text-xl font-bold mb-2">{patient.name}</h2>
         <p className="text-sm text-white/60 leading-relaxed font-medium">
            {getStatusNarrative()}
         </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="p-5 rounded-[32px] bg-white/[0.03] border border-white/5">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Spirit Level</div>
            <div className="text-2xl font-black text-amber-500">{wellbeingScore}%</div>
         </div>
         <div className="p-5 rounded-[32px] bg-white/[0.03] border border-white/5">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Interaction</div>
            <div className="text-2xl font-black text-stable-green">Stable</div>
         </div>
      </div>

      <div className="p-6 rounded-[32px] border border-white/10 bg-[#0c0c0c] mb-8 relative overflow-hidden group">
         <div className={`absolute inset-0 bg-medical/5 transition-opacity duration-1000 ${sending ? 'opacity-100' : 'opacity-0'}`} />
         <div className="relative flex flex-col items-center gap-4">
            <div className="text-center">
               <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Send a Digital Hug</h3>
               <p className="text-[10px] text-white/30">Instantly pulses a heart on Arjun's screen</p>
            </div>
            <button 
              onClick={handleSendHug}
              disabled={sending}
              className={`h-20 w-20 rounded-full flex items-center justify-center transition-all shadow-glow-sm ${sending ? 'bg-medical text-black scale-90' : 'bg-white/5 border border-white/10 text-white/40 active:scale-95'}`}
            >
               <Heart size={32} className={sending ? 'fill-black' : ''} />
            </button>
            {hugCount > 0 && (
              <span className="text-[10px] font-mono text-medical/60 uppercase">
                 {hugCount} Hugs sent today
              </span>
            )}
         </div>
      </div>

      <div className="mt-auto pt-6 flex flex-col gap-4">
         <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <Info size={16} className="text-white/20" />
            <p className="text-[10px] text-white/30 leading-normal italic">
               This is a non-clinical view intended for family comfort. For medical emergencies, please contact the nursing station directly.
            </p>
         </div>
         <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-white/10 uppercase tracking-[0.4em]">
            <ShieldCheck size={10} /> Secure Clinical Link Active
         </div>
      </div>
    </div>
  );
}

FamilyPortalPage.propTypes = {
  patient: PropTypes.object.isRequired,
  sentiment: PropTypes.object,
  wellbeingScore: PropTypes.number,
  lastInteractionAt: PropTypes.number,
  onSendHug: PropTypes.func.isRequired,
};
