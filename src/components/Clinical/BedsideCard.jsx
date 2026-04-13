import React from 'react';
import PropTypes from 'prop-types';
import { Activity, AlertCircle, MessageSquare, ShieldAlert, WifiOff, Zap, Sparkles } from 'lucide-react';

function getRiskColor(score) {
  if (score > 70) return '#ff3d5a';
  if (score > 40) return '#ffd700';
  return '#00ffaa';
}

export default function BedsideCard({ 
  patient, 
  vitals, 
  clinicalAI, 
  lastInteractionAt, 
  isCommunicating, 
  hardwareAlert, 
  isOffline,
  predictions = [],
  onOpenDetails 
}) {
  const riskColor = getRiskColor(clinicalAI.riskScore);
  const timeSinceInteraction = Math.round((Date.now() - lastInteractionAt) / 60000);
  const topPrediction = predictions && predictions.length > 0 ? predictions[0] : null;

  return (
    <div 
      className={`relative group overflow-hidden panel-elevated p-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${isOffline ? 'border-emergency/40 bg-emergency/5' : ''}`}
      onClick={!isOffline ? onOpenDetails : undefined}
    >
      {/* ⚠️ Phase 21: Connection Lost Overlay */}
      {isOffline && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
          <div className="animate-pulse flex flex-col items-center gap-3">
             <div className="p-4 rounded-full bg-emergency/20 text-emergency border border-emergency/30">
                <WifiOff size={32} />
             </div>
             <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-emergency uppercase">Connection Lost</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-medical transition-colors">{patient.name}</h3>
          <p className="text-xs text-white/40 font-mono tracking-wider">{patient.room} • {patient.condition}</p>
        </div>
        <div 
          className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
          style={{ borderColor: `${riskColor}44`, backgroundColor: `${riskColor}11`, color: riskColor }}
        >
          {clinicalAI.riskLevel}
        </div>
      </div>

      {/* 🔮 Phase 22: Predictive AI Insight */}
      {!isOffline && topPrediction && (
         <div className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-medical/5 border border-medical/10 p-3">
            <div className="flex items-center gap-2 text-medical">
               <Sparkles size={14} className="animate-pulse" />
               <div className="flex flex-col">
                  <span className="text-[8px] font-bold uppercase tracking-widest opacity-50">Likely Next Need</span>
                  <span className="text-[11px] font-bold text-white">{topPrediction.phrase}</span>
               </div>
            </div>
            <div className="text-[10px] font-mono font-bold text-medical bg-medical/10 px-2 py-0.5 rounded-lg">
               {topPrediction.confidence}%
            </div>
         </div>
      )}

      {/* Hardware Health Alerts */}
      {hardwareAlert && hardwareAlert.status !== 'healthy' && !topPrediction && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2 text-amber-500">
           <AlertCircle size={14} />
           <span className="text-[10px] font-bold uppercase tracking-tight">{hardwareAlert.message}</span>
        </div>
      )}

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2 text-white/30 mb-1">
            <Activity size={12} />
            <span className="text-[10px] uppercase tracking-widest">Heart Rate</span>
          </div>
          <div className="text-lg font-mono font-bold text-medical">{vitals.heartRate} <span className="text-[10px] opacity-40">BPM</span></div>
        </div>
        
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2 text-white/30 mb-1">
            <Zap size={12} />
            <span className="text-[10px] uppercase tracking-widest">Stress</span>
          </div>
          <div className="text-lg font-mono font-bold text-amber-400">{vitals.stressLevel}</div>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex items-center gap-2">
          {isCommunicating ? (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stable-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-stable-green"></span>
              </span>
              <span className="text-[10px] font-bold text-stable-green uppercase tracking-widest">Communicating</span>
            </div>
          ) : (
             <div className="flex items-center gap-1.5 opacity-30">
                <MessageSquare size={12} />
                <span className="text-[10px] uppercase font-bold tracking-widest">Idle</span>
             </div>
          )}
        </div>
        
        <div className="text-[10px] font-mono text-white/20">
          Last: {timeSinceInteraction < 1 ? 'Just now' : `${timeSinceInteraction}m ago`}
        </div>
      </div>

      {/* Progress Indicator for Clinical Risk */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
        <div 
          className="h-full transition-all duration-1000 ease-in-out"
          style={{ width: `${clinicalAI.riskScore}%`, backgroundColor: riskColor }}
        />
      </div>
    </div>
  );
}

BedsideCard.propTypes = {
  patient: PropTypes.object.isRequired,
  vitals: PropTypes.object.isRequired,
  clinicalAI: PropTypes.object.isRequired,
  lastInteractionAt: PropTypes.number.isRequired,
  isCommunicating: PropTypes.bool.isRequired,
  hardwareAlert: PropTypes.object,
  isOffline: PropTypes.bool,
  predictions: PropTypes.arrayOf(PropTypes.object),
  onOpenDetails: PropTypes.func.isRequired,
};
