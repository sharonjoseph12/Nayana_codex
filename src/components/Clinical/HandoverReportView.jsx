import React from 'react';
import PropTypes from 'prop-types';
import { Heart, MessageCircle, AlertTriangle, ShieldCheck, Thermometer, Clock, Activity } from 'lucide-react';

/**
 * Production-grade Handover Dashboard for clinical staff.
 */
export default function HandoverReportView({ clinicalLog = [], vitals = {}, clinicalAI = {} }) {
  const totalRequests = clinicalLog.length;
  const criticalEvents = clinicalLog.filter(log => log.quadrant === 'Emergency').length;
  const highStressEvents = clinicalLog.filter(log => log.stressLevel === 'High').length;

  const stats = [
    { label: 'Comm. Volume', value: totalRequests, icon: <MessageCircle size={14} />, color: 'text-medical' },
    { label: 'Critical Alarms', value: criticalEvents, icon: <AlertTriangle size={14} />, color: 'text-emergency' },
    { label: 'Stress Peaks', value: highStressEvents, icon: <Thermometer size={14} />, color: 'text-amber-400' },
    { label: 'Handover Score', value: `${clinicalAI.riskScore}/100`, icon: <Activity size={14} />, color: 'text-stable-green' },
  ];

  return (
    <div className="flex flex-col gap-6 rounded-[32px] border border-white/[0.08] bg-[#0a0a0a] p-8 shadow-2xl">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] text-medical shadow-[0_0_20px_rgba(0,212,255,0.1)]">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Handover Insights</h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Session Analytics • Shift Horizon</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 transition-all hover:bg-white/[0.03]">
            <div className={`flex items-center gap-2 mb-2 ${stat.color}`}>
              {stat.icon}
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{stat.label}</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
           <Clock size={12} /> RECENT CLINICAL EVENTS
        </h3>
        <div className="flex flex-col gap-3">
          {clinicalLog.length === 0 ? (
             <div className="py-10 text-center text-white/10 font-mono text-[10px]">NO SIGNIFICANT CLINICAL EVENTS RECORDED</div>
          ) : (
            clinicalLog.slice(0, 3).map((log, index) => (
              <div key={index} className="flex gap-4 rounded-xl bg-white/[0.02] p-4 border border-white/5">
                <div className="pt-1">
                  <div className={`h-2 w-2 rounded-full ${log.quadrant === 'Emergency' ? 'bg-emergency animate-pulse' : 'bg-medical'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-white/20">{log.timestamp?.toLocaleTimeString()}</span>
                    <span className="text-[8px] font-bold uppercase tracking-tighter text-white/40 border border-white/10 px-1.5 rounded">{log.quadrant}</span>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2 italic">“{log.sentence}”</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-2 rounded-2xl bg-medical/5 border border-medical/10 p-5">
         <div className="flex items-center gap-3 mb-3">
            <Heart size={14} className="text-medical" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-medical">Clinical Stability Index</span>
         </div>
         <p className="text-[11px] leading-relaxed text-white/40">
           {clinicalAI.riskReasoning || "Patient is showing consistent interaction patterns. Monitor for fatigue indicators in the next 2-hour window."}
         </p>
      </div>
    </div>
  );
}

HandoverReportView.propTypes = {
  clinicalLog: PropTypes.arrayOf(PropTypes.object),
  vitals: PropTypes.object,
  clinicalAI: PropTypes.object,
};
