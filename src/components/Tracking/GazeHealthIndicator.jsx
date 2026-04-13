import React from 'react';
import PropTypes from 'prop-types';
import { Wifi, WifiOff, Activity, AlertCircle } from 'lucide-react';

/**
 * Phase 27: Gaze Health Indicator
 * Provides real-time visual feedback on signal quality and hardware status.
 */
export default function GazeHealthIndicator({ signalQuality, fps, onClick }) {
  const isCritical = signalQuality < 40;
  const isFair = signalQuality >= 40 && signalQuality < 75;
  
  const getStatusColor = () => {
    if (isCritical) return '#ff3d5a';
    if (isFair) return '#ffd700';
    return '#00d4ff';
  };

  return (
    <button 
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 transition-all hover:bg-white/10 ${isCritical ? 'animate-pulse border-emergency/30 bg-emergency/5' : ''}`}
    >
      <div className="relative">
        <Activity size={14} style={{ color: getStatusColor() }} />
        {isCritical && (
          <div className="absolute -top-1 -right-1 bg-emergency rounded-full p-0.5 border border-black">
             <AlertCircle size={8} className="text-white" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-start leading-none gap-0.5">
         <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Signal Fidelity</span>
         <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold" style={{ color: getStatusColor() }}>{Math.round(signalQuality)}%</span>
            <span className="text-[8px] font-mono text-white/20">{fps} FPS</span>
         </div>
      </div>

      <div className="hidden lg:block w-[1px] h-4 bg-white/5 mx-1" />
      
      <div className={`hidden lg:flex items-center gap-1 text-[8px] font-bold uppercase tracking-tighter ${isCritical ? 'text-emergency' : 'text-white/20'}`}>
         {isCritical ? 'Poor Connectivity' : isFair ? 'Fair Tracking' : 'Stable Link'}
      </div>
    </button>
  );
}

GazeHealthIndicator.propTypes = {
  signalQuality: PropTypes.number.isRequired,
  fps: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};
