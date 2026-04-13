import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, User, Zap } from 'lucide-react';

/**
 * Phase 25: Ward Triage Priority Widget
 * Lists patients needing the most attention based on aggregated stability metrics.
 */
export default function WardTriageWidget({ bedsideSentiments = {}, patients = {} }) {
  const priorities = Object.entries(bedsideSentiments)
    .map(([id, data]) => ({
      id,
      name: patients[id]?.name || id,
      stability: data.stabilityIndex || 100,
      demand: 100 - (data.stabilityIndex || 100)
    }))
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 3);

  if (priorities.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 p-6 rounded-[32px] border border-white/10 bg-white/[0.03] shadow-glow-sm">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Clinical Triage Priorities</span>
         </div>
      </div>

      <div className="space-y-4">
        {priorities.map((p) => (
          <div key={p.id} className="group flex flex-col gap-2">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${p.demand > 60 ? 'bg-emergency animate-pulse' : 'bg-medical'}`} />
                  <span className="text-xs font-bold text-white group-hover:text-medical transition-colors">{p.name}</span>
               </div>
               <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Bed {p.id.split('-')[1]}</span>
            </div>
            
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <div 
                 className={`h-full transition-all duration-1000 ease-out shadow-glow-sm`}
                 style={{ 
                   width: `${p.demand}%`, 
                   backgroundColor: p.demand > 70 ? '#ff3d5a' : p.demand > 40 ? '#ffd700' : '#00d4ff' 
                 }}
               />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-2 text-[8px] font-bold text-white/10 uppercase tracking-widest text-center border-t border-white/5 pt-4">
         Automated Ward Analysis Active
      </div>
    </div>
  );
}

WardTriageWidget.propTypes = {
  bedsideSentiments: PropTypes.object,
  patients: PropTypes.object,
};
