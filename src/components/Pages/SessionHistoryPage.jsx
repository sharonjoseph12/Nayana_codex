import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Clock, MessageSquare, ShieldAlert, Zap, Filter, Activity } from 'lucide-react';

function getMostUsed(log) {
  if (!log.length) return 'None';
  const counts = {};
  log.forEach((entry) => {
    counts[entry.quadrant] = (counts[entry.quadrant] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
}

function getRiskColor(score) {
  if (score > 70) return 'text-emergency';
  if (score > 40) return 'text-warning';
  return 'text-medical';
}

export default function SessionHistoryPage({ clinicalLog, vitals, clinicalAI }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? clinicalLog : clinicalLog.filter((entry) => entry.quadrant === filter);
  
  const categories = [
    { id: 'all', label: 'All Events', color: 'white' },
    { id: 'Medical', label: 'Medical', color: '#00d4ff' },
    { id: 'Social', label: 'Social', color: '#00ffaa' },
    { id: 'Personal', label: 'Personal', color: '#bf80ff' },
    { id: 'Emergency', label: 'Emergency', color: '#ff3d5a' }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white uppercase tracking-tight">Session History</h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
            Clinical Telemetry Archive • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl overflow-x-auto max-w-[500px] scrollbar-none">
          {categories.map((cat) => {
            const active = filter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  active 
                    ? 'bg-white/10 text-white border border-white/20 shadow-glow-sm' 
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Communications', value: clinicalLog.length, color: 'text-medical', icon: MessageSquare },
          { label: 'Session Duration', value: vitals.formatDuration(vitals.sessionDuration), color: 'text-[#bf80ff]', icon: Clock },
          { label: 'Risk Indices', value: `${clinicalAI.riskScore}/100`, color: getRiskColor(clinicalAI.riskScore), icon: ShieldAlert },
          { label: 'Priority Zone', value: getMostUsed(clinicalLog), color: 'text-warning', icon: Zap },
        ].map((stat, idx) => (
          <div key={idx} className="panel-elevated p-6 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex items-center justify-between mb-3 text-white/20">
               <stat.icon size={16} />
               <div className="h-1 w-8 rounded-full bg-white/5" />
            </div>
            <div className={`text-2xl font-black font-mono tracking-tighter ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="panel-elevated p-6 flex-1 min-h-0 overflow-y-auto scrollbar-slim">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <Filter size={14} className="text-medical" />
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Conversation Timeline</p>
           </div>
           <Activity size={14} className="text-white/10" />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20 grayscale">
             <MessageSquare size={48} className="mb-4" />
             <p className="text-sm font-bold uppercase tracking-widest">No matching records found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.slice().reverse().map((entry, idx) => (
              <div key={entry.id} className="group flex gap-6 p-4 rounded-2xl hover:bg-white/[0.03] transition-colors relative animate-slide-up">
                <div className="flex flex-col items-center">
                   <div className={`w-10 h-10 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center text-xs font-black transition-all group-hover:scale-110 ${
                     entry.quadrant === 'Emergency' ? 'text-emergency border-emergency/30' : 
                     entry.quadrant === 'Medical' ? 'text-medical border-medical/30' : 
                     entry.quadrant === 'Social' ? 'text-[#00ffaa] border-[#00ffaa]/30' : 'text-[#bf80ff] border-[#bf80ff]/30'
                   }`}>
                      {entry.quadrant[0]}
                   </div>
                   {idx < filtered.length - 1 && <div className="w-[1px] flex-1 bg-white/10 my-2" />}
                </div>

                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${
                         entry.quadrant === 'Emergency' ? 'text-emergency' : 
                         entry.quadrant === 'Medical' ? 'text-medical' : 
                         entry.quadrant === 'Social' ? 'text-[#00ffaa]' : 'text-[#bf80ff]'
                       }`}>{entry.quadrant} Protocol</span>
                       <span className="text-[10px] font-mono text-white/20">/ UID_{entry.id.toString().slice(-4)}</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/30">{new Date(entry.timestamp).toLocaleTimeString('en-IN')}</span>
                  </div>
                  <div className="text-sm text-white/80 leading-relaxed font-medium panel-elevated-subtle p-4 border-l-2 border-white/20 bg-white/[0.02]">
                    "{entry.sentence}"
                  </div>
                  <div className="mt-3 flex gap-2">
                     <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-white/40 border border-white/10">PHASE: {entry.phrase}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

SessionHistoryPage.propTypes = {
  clinicalLog: PropTypes.arrayOf(PropTypes.object).isRequired,
  vitals: PropTypes.object.isRequired,
  clinicalAI: PropTypes.object.isRequired,
};
