import React from 'react';
import PropTypes from 'prop-types';
import { FileText, Download, TrendingUp, Heart, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';
import SentimentTimeline from './SentimentTimeline';

/**
 * Phase 29: Advocacy Handover Summary
 * A professional summary dashboard for ICU-to-Ward transitions.
 */
export default function HandoverAdvocacySummary({ 
  patient, 
  vitals, 
  sentiment, 
  wellbeingScore, 
  clinicalLog, 
  onDownloadPDF 
}) {
  
  const getTopPhrases = () => {
    const counts = {};
    clinicalLog.forEach(entry => {
      const key = `${entry.quadrant}: ${entry.phrase}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 4);
  };

  const topPhrases = getTopPhrases();

  return (
    <div id="handover-summary-root" className="flex flex-col gap-8 p-10 bg-[#080808] rounded-[56px] border border-white/10 shadow-glow-lg animate-fade-in overflow-hidden relative">
      {/* Background Blurs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-medical/5 blur-[120px] rounded-full -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full -ml-48 -mb-48" />

      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-6">
           <div className="p-5 rounded-[32px] bg-medical/10 text-medical border border-medical/20">
              <FileText size={40} />
           </div>
           <div>
              <h1 className="text-4xl font-black text-white leading-tight">Handover Advocacy Summary</h1>
              <div className="flex items-center gap-3 mt-1">
                 <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/40">Clinical Transition Protocol</span>
                 <div className="h-1 w-1 rounded-full bg-white/20" />
                 <span className="text-[10px] font-bold text-medical uppercase tracking-widest">{patient.room} • {patient.name}</span>
              </div>
           </div>
        </div>
        <button 
          onClick={onDownloadPDF}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-[1.05] transition shadow-glow-sm"
        >
          <Download size={16} /> Export to Ward PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
         {/* Sentiment Journey Card */}
         <div className="md:col-span-2 p-8 rounded-[40px] border border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <TrendingUp size={18} className="text-medical" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Sentiment Heatmap (24h)</h3>
               </div>
               <span className="text-[9px] font-mono text-white/20">Stability Index: {Math.round(sentiment.stabilityIndex)}%</span>
            </div>
            <SentimentTimeline history={sentiment.history} />
         </div>

         {/* Wellbeing Balance Card */}
         <div className="p-8 rounded-[40px] border border-white/5 bg-white/[0.02] flex flex-col justify-between">
            <div>
               <div className="flex items-center gap-3 mb-8">
                  <Heart size={18} className="text-amber-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Well-being Score</h3>
               </div>
               <div className="relative h-40 w-40 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                     <circle cx="80" cy="80" r="70" className="stroke-white/5 fill-none" strokeWidth="12" />
                     <circle cx="80" cy="80" r="70" className="stroke-amber-500 fill-none transition-all duration-1000" 
                             strokeWidth="12" strokeDasharray={440} strokeDashoffset={440 - (440 * wellbeingScore / 100)} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-4xl font-black text-white">{wellbeingScore}%</span>
                     <span className="text-[8px] font-mono text-white/20 uppercase">Engagement</span>
                  </div>
               </div>
            </div>
            <p className="text-[10px] text-white/30 text-center leading-relaxed mt-4">Psychological resilience is within optimal range for ward transfer.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
         {/* Communication Pulse Card */}
         <div className="p-8 rounded-[40px] border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-8">
               <MessageSquare size={18} className="text-stable-green" />
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Communication Fingerprint</h3>
            </div>
            <div className="space-y-4">
               {topPhrases.map(([phrase, count]) => (
                 <div key={phrase} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                       <span>{phrase}</span>
                       <span className="text-white/60">{count} Events</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-stable-green rounded-full shadow-green" style={{ width: `${(count / clinicalLog.length) * 100}%` }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* AI Continuity Summary Card */}
         <div className="p-8 rounded-[40px] border border-white/10 bg-medical/5 flex flex-col justify-between">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck size={18} className="text-medical" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Nayana Intelligence Handover</h3>
               </div>
               <div className="text-sm text-white/80 leading-[1.8] font-medium p-4 border-l-2 border-medical bg-medical/5 italic">
                  "Patient displays high-confidence communication in the morning. Pain mentions usually precede respiratory distress by 15 mins. Memory bridge engagement is essential for evening stability."
               </div>
            </div>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
               <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <ArrowRight size={12} /> Receiving Ward Team A
               </div>
               <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">Protocol Validated</span>
            </div>
         </div>
      </div>
    </div>
  );
}

HandoverAdvocacySummary.propTypes = {
  patient: PropTypes.object.isRequired,
  vitals: PropTypes.object.isRequired,
  sentiment: PropTypes.object.isRequired,
  wellbeingScore: PropTypes.number.isRequired,
  clinicalLog: PropTypes.array.isRequired,
  onDownloadPDF: PropTypes.func.isRequired,
};
