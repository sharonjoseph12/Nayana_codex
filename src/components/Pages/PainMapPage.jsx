import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Activity, AlertTriangle, ChevronRight, Activity as Pulse } from 'lucide-react';

export default function PainMapPage({ currentLanguage, onPhraseSelect, painLog, setPainLog }) {
  const [selectedPart, setSelectedPart] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const bodyParts = [
    { id: 'head', label: 'Head', cx: 150, cy: 32 },
    { id: 'chest', label: 'Chest', cx: 150, cy: 100 },
    { id: 'abdomen', label: 'Abdomen', cx: 150, cy: 158 },
    { id: 'left_arm', label: 'Left Arm', cx: 88, cy: 115 },
    { id: 'right_arm', label: 'Right Arm', cx: 212, cy: 115 },
    { id: 'left_leg', label: 'Left Leg', cx: 127, cy: 255 },
    { id: 'right_leg', label: 'Right Leg', cx: 173, cy: 255 },
  ];

  const heatmap = Object.fromEntries(bodyParts.map((part) => [part.id, 0]));
  painLog.forEach((entry) => {
    if (heatmap[entry.part] !== undefined) heatmap[entry.part] += entry.intensity;
  });
  const maxHeat = Math.max(...Object.values(heatmap), 1);

  const getHeatColor = (partId) => {
    const heat = heatmap[partId] / maxHeat;
    if (heat === 0) return 'rgba(255, 255, 255, 0.05)';
    if (heat < 0.3) return 'rgba(0, 212, 255, 0.3)';
    if (heat < 0.6) return 'rgba(255, 215, 0, 0.4)';
    return 'rgba(255, 61, 90, 0.6)';
  };

  const confirmPain = async () => {
    if (!selectedPart) return;
    setIsGenerating(true);
    const newEntry = { part: selectedPart.id, label: selectedPart.label, intensity, timestamp: Date.now() };
    setPainLog((previous) => [...previous, newEntry]);
    
    await onPhraseSelect('Medical', `Pain in ${selectedPart.label} - intensity ${intensity}/10`, {
      forceSpeak: true,
      categoryOverride: 'PAIN',
    });
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white uppercase tracking-tight">Pain Body Map</h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Anatomical Sensory Log • Regional Active</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono">
           <Activity size={12} className="text-medical" /> Neural Mapping Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6 flex-1 min-h-0">
        <div className="panel-elevated flex flex-col items-center justify-center p-8 bg-[#0a0a0a]/60">
          <svg width="340" height="380" viewBox="0 0 300 320" className="drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            {/* Body Shapes with Nayana Transitions */}
            <circle cx={150} cy={32} r={28} className="transition-all duration-500 hover:brightness-125" fill={selectedPart?.id === 'head' ? 'rgba(0,212,255,0.45)' : getHeatColor('head')} stroke={selectedPart?.id === 'head' ? '#00d4ff' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[0])} />
            <rect x={143} y={61} width={14} height={16} fill="rgba(255,255,255,0.05)" />
            <rect x={115} y={78} width={70} height={50} rx="12" className="transition-all duration-500 hover:brightness-125" fill={selectedPart?.id === 'chest' ? 'rgba(0,212,255,0.45)' : getHeatColor('chest')} stroke={selectedPart?.id === 'chest' ? '#00d4ff' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[1])} />
            <rect x={120} y={132} width={60} height={42} rx="8" className="transition-all duration-500 hover:brightness-125" fill={selectedPart?.id === 'abdomen' ? 'rgba(0,212,255,0.45)' : getHeatColor('abdomen')} stroke={selectedPart?.id === 'abdomen' ? '#00d4ff' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[2])} />
            <rect x={74} y={80} width={28} height={80} rx="14" className="transition-all duration-500 hover:brightness-125" fill={selectedPart?.id === 'left_arm' ? 'rgba(0,212,255,0.45)' : getHeatColor('left_arm')} stroke={selectedPart?.id === 'left_arm' ? '#00d4ff' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[3])} />
            <rect x={198} y={80} width={28} height={80} rx="14" className="transition-all duration-500 hover:brightness-125" fill={selectedPart?.id === 'right_arm' ? 'rgba(0,212,255,0.45)' : getHeatColor('right_arm')} stroke={selectedPart?.id === 'right_arm' ? '#00d4ff' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[4])} />
            <rect x={111} y={178} width={34} height={100} rx="16" className="transition-all duration-500 hover:brightness-125" fill={selectedPart?.id === 'left_leg' ? 'rgba(0,212,255,0.45)' : getHeatColor('left_leg')} stroke={selectedPart?.id === 'left_leg' ? '#00d4ff' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[5])} />
            <rect x={157} y={178} width={34} height={100} rx="16" className="transition-all duration-500 hover:brightness-125" fill={selectedPart?.id === 'right_leg' ? 'rgba(0,212,255,0.45)' : getHeatColor('right_leg')} stroke={selectedPart?.id === 'right_leg' ? '#00d4ff' : 'rgba(255,255,255,0.1)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[6])} />
            
            {bodyParts.map((part) => (
              heatmap[part.id] > 0 && (
                <g key={`heat-${part.id}`}>
                   <circle cx={part.cx} cy={part.cy} r={selectedPart?.id === part.id ? 14 : 10} fill="white" className="animate-pulseSoft" />
                   <text x={part.cx} y={part.cy + 3} textAnchor="middle" fill="black" fontSize="9" fontWeight="900" fontFamily="DM Mono">
                    {heatmap[part.id]}
                  </text>
                </g>
              )
            ))}
          </svg>
          <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
             <div className={`h-2 w-2 rounded-full ${selectedPart ? 'bg-medical' : 'bg-white/20'}`} />
             <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
               {selectedPart ? `Targeting: ${selectedPart.label}` : 'Select Anatomical Zone'}
             </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto scrollbar-slim pr-2">
          <div className="panel-elevated p-6 flex flex-col gap-6">
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Intensity Matrix</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                  const isActive = intensity === level;
                  const color = level > 7 ? 'emergency' : level > 4 ? 'warning' : 'medical';
                  return (
                    <button
                      key={level}
                      onClick={() => setIntensity(level)}
                      className={`h-11 rounded-xl border font-mono font-bold transition-all duration-300 ${isActive ? `bg-${color}/20 border-${color} text-white scale-110 shadow-glow-sm` : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={confirmPain}
              disabled={!selectedPart || isGenerating}
              className={`group relative flex items-center justify-between px-6 py-4 rounded-2xl border transition-all duration-500 overflow-hidden ${selectedPart && !isGenerating ? 'bg-medical text-black border-medical hover:shadow-glow-md' : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'}`}
            >
              <div className="flex flex-col items-start leading-none">
                 <span className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Telemetry Relay</span>
                 <span className="text-sm font-black uppercase">
                   {isGenerating ? 'Synthesizing...' : selectedPart ? `Report ${selectedPart.label} Pain` : 'Invalid Selection'}
                 </span>
              </div>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="panel-elevated p-6 flex-1">
             <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Pain Log History</p>
                <Pulse size={14} className="text-white/20" />
             </div>
             <div className="space-y-3">
                {painLog.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center opacity-20">
                     <AlertTriangle size={32} className="mb-3" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">No sensory data recorded</p>
                  </div>
                ) : (
                  painLog.slice(-10).reverse().map((entry, idx) => (
                    <div key={`${entry.timestamp}-${idx}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-slide-up">
                       <div className={`h-2 w-2 rounded-full ${entry.intensity > 7 ? 'bg-emergency' : entry.intensity > 4 ? 'bg-warning' : 'bg-medical'}`} />
                       <div className="flex-1">
                          <div className="text-xs font-bold text-white">{entry.label} Pain</div>
                          <div className="text-[9px] font-mono text-white/30 uppercase mt-0.5">
                            Intensity {entry.intensity}/10 • {new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </div>
                       <div className={`text-lg font-black font-mono ${entry.intensity > 7 ? 'text-emergency' : entry.intensity > 4 ? 'text-warning' : 'text-medical'}`}>
                          {entry.intensity}
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

PainMapPage.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  onPhraseSelect: PropTypes.func.isRequired,
  painLog: PropTypes.arrayOf(PropTypes.object).isRequired,
  setPainLog: PropTypes.func.isRequired,
};
