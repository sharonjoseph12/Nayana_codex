import React from 'react';
import PropTypes from 'prop-types';
import { Map, Zap, AlertTriangle } from 'lucide-react';

const BEDS = [
  { id: 'icu-1', x: 20, y: 20 }, { id: 'icu-2', x: 40, y: 20 }, { id: 'icu-3', x: 60, y: 20 }, { id: 'icu-4', x: 80, y: 20 },
  { id: 'icu-5', x: 20, y: 80 }, { id: 'icu-6', x: 40, y: 80 }, { id: 'icu-7', x: 60, y: 80, active: true }, { id: 'icu-8', x: 80, y: 80 },
  { id: 'icu-9', x: 5, y: 50 }, { id: 'icu-10', x: 95, y: 50 }, { id: 'icu-11', x: 50, y: 5 }, { id: 'icu-12', x: 50, y: 95 }
];

/**
 * Phase 25: Ward Tactical Heatmap
 * Visualizes ward-wide demand in a clinical spatial context.
 */
export default function WardHeatmap({ bedsideSentiments = {}, onSelectBed }) {
  
  const getDemandColor = (id) => {
    const data = bedsideSentiments[id];
    if (!data) return 'rgba(255, 255, 255, 0.05)';
    const score = 100 - (data.stabilityIndex || 100);
    if (score > 70) return 'rgba(255, 61, 90, 0.8)'; // Critical
    if (score > 40) return 'rgba(255, 215, 0, 0.6)'; // Warning
    return 'rgba(0, 212, 255, 0.4)'; // Stable
  };

  const getDemandIntensity = (id) => {
    const data = bedsideSentiments[id];
    if (!data) return 0;
    return (100 - (data.stabilityIndex || 100)) / 100;
  };

  return (
    <div className="relative h-[500px] w-full bg-[#080808] rounded-[48px] border border-white/10 overflow-hidden group shadow-inner">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      <div className="absolute inset-x-8 top-8 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-medical/10 text-medical"><Map size={18} /></div>
            <div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Ward Floor A Heatmap</h3>
               <p className="text-[10px] text-white/20 font-mono">Tactical Decision Support Active</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-medical uppercase tracking-widest">
               <div className="h-2 w-2 rounded-full bg-medical animate-pulse" /> Stable
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emergency uppercase tracking-widest">
               <div className="h-2 w-2 rounded-full bg-emergency animate-pulse" /> Distressed
            </div>
         </div>
      </div>

      <div className="absolute inset-0 p-20">
         <div className="relative w-full h-full border border-white/5 rounded-full opacity-20" /> {/* Inner Hallway Path */}
         
         {BEDS.map((bed) => {
           const intensity = getDemandIntensity(bed.id);
           const color = getDemandColor(bed.id);
           
           return (
             <div 
               key={bed.id}
               className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-700"
               style={{ left: `${bed.x}%`, top: `${bed.y}%` }}
               onClick={() => onSelectBed(bed.id)}
             >
                {/* Heat Bubble */}
                <div 
                  className={`absolute inset-0 -m-8 rounded-full blur-2xl transition-opacity duration-1000 ${intensity > 0 ? 'opacity-100' : 'opacity-0'}`}
                  style={{ backgroundColor: color, transform: `scale(${0.5 + intensity})` }}
                />

                <div className={`relative flex flex-col items-center gap-2 group/bed`}>
                   <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all ${bed.active ? 'border-medical/50 bg-medical/10' : 'border-white/10 bg-white/5'} hover:border-white/30`}>
                      <span className={`text-[10px] font-bold ${bed.active ? 'text-medical' : 'text-white/40'}`}>{bed.id.split('-')[1]}</span>
                   </div>
                   {intensity > 0.5 && (
                     <div className="absolute -top-1 -right-1">
                        <AlertTriangle size={14} className="text-emergency animate-bounce" />
                     </div>
                   )}
                </div>
             </div>
           );
         })}
      </div>

      <div className="absolute inset-x-8 bottom-8 flex justify-center">
         <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] flex items-center gap-4">
            <Zap size={12} className="text-amber-500" /> Nursing Resource Distribution Balanced
         </div>
      </div>
    </div>
  );
}

WardHeatmap.propTypes = {
  bedsideSentiments: PropTypes.object,
  onSelectBed: PropTypes.func.isRequired,
};
