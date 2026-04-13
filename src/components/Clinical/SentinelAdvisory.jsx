import React from 'react';
import PropTypes from 'prop-types';
import { ShieldAlert, Zap, Clock, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Phase 30: Sentinel Pre-Critical Advisory UI
 * Displays deterioration probability and driving metrics for nursing staff.
 */
export default function SentinelAdvisory({ report, onAcknowledge }) {
  if (!report || report.probability < 30) return null;

  const isCritical = report.probability > 75;

  return (
    <div className={`p-6 rounded-[32px] border transition-all animate-pulse-slow ${isCritical ? 'bg-emergency/5 border-emergency/30 shadow-glow-sm' : 'bg-amber-500/5 border-amber-500/20'}`}>
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isCritical ? 'bg-emergency text-black' : 'bg-amber-500 text-black'}`}>
               <ShieldAlert size={18} />
            </div>
            <div>
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Medical Sentinel Advisory</h3>
               <p className="text-[10px] text-white/20 font-mono uppercase tracking-tighter">Autonomous Deterioration Prediction</p>
            </div>
         </div>
         <div className="text-right">
            <span className={`text-2xl font-black font-mono ${isCritical ? 'text-emergency' : 'text-amber-500'}`}>{report.probability}%</span>
            <div className="text-[8px] text-white/20 uppercase tracking-widest">Crisis Probability</div>
         </div>
      </div>

      <div className="space-y-3 mb-6">
         {report.reasons.map((reason, idx) => (
           <div key={idx} className="flex items-center gap-2 text-[10px] text-white/60 font-medium">
              <Zap size={10} className={isCritical ? 'text-emergency' : 'text-amber-500'} />
              {reason}
           </div>
         ))}
      </div>

      <div className="flex flex-col gap-3">
         <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
               <Clock size={12} /> Estimated T-Crisis:
            </div>
            <span className="text-[11px] font-black text-white font-mono">{isCritical ? '1 - 4 MIN' : '12 - 20 MIN'}</span>
         </div>
         
         <div className="flex gap-2">
            <button 
              onClick={onAcknowledge}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition shadow-glow-sm ${isCritical ? 'bg-emergency text-black' : 'bg-amber-500 text-black'}`}
            >
               Deploy Triage
            </button>
            <button className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition">
               <CheckCircle2 size={16} />
            </button>
         </div>
      </div>
    </div>
  );
}

SentinelAdvisory.propTypes = {
  report: PropTypes.shape({
    probability: PropTypes.number,
    reasons: PropTypes.arrayOf(PropTypes.string),
    level: PropTypes.string,
  }),
  onAcknowledge: PropTypes.func.isRequired,
};
