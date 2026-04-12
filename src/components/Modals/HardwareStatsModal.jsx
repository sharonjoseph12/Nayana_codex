import React from 'react';
import PropTypes from 'prop-types';
import { X, Cpu, Camera, Sun, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Phase 27: Hardware Sentinel Diagnostic Modal
 */
export default function HardwareStatsModal({ 
  open, 
  onClose, 
  fps, 
  signalQuality, 
  gazeAccuracy 
}) {
  if (!open) return null;

  const isHealthy = signalQuality > 75;
  const isWarning = signalQuality <= 75 && signalQuality > 40;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fade-in p-6">
      <div className="relative w-full max-w-2xl rounded-[48px] border border-white/10 bg-[#080808] p-10 shadow-2xl overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-medical/10 blur-[120px] rounded-full -mr-32 -mt-32" />
        
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
             <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-white/40">
                <Cpu size={32} />
             </div>
             <div>
                <h2 className="text-3xl font-bold text-white">Hardware Sentinel</h2>
                <p className="text-xs text-white/20 uppercase tracking-[0.3em] font-mono">System Core Diagnostics</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-4 rounded-3xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
           {/* Metric Card */}
           <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Tracking Pipeline</span>
                 <Camera size={14} className="text-medical" />
              </div>
              <div className="text-4xl font-mono font-bold text-white mb-2">{fps} <span className="text-sm opacity-20">FPS</span></div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-medical transition-all duration-1000" style={{ width: `${(fps / 60) * 100}%` }} />
              </div>
           </div>

           <div className="p-6 rounded-[32px] border border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Signal Fidelity</span>
                 <Zap size={14} className="text-amber-500" />
              </div>
              <div className="text-4xl font-mono font-bold text-white mb-2">{Math.round(signalQuality)}%</div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full transition-all duration-1000" 
                      style={{ width: `${signalQuality}%`, backgroundColor: signalQuality > 75 ? '#00ffaa' : signalQuality > 40 ? '#ffd700' : '#ff3d5a' }} 
                 />
              </div>
           </div>
        </div>

        <div className={`p-8 rounded-[40px] border transition-colors ${isHealthy ? 'border-stable-green/20 bg-stable-green/5' : isWarning ? 'border-amber-500/20 bg-amber-500/5' : 'border-emergency/20 bg-emergency/5'}`}>
           <div className="flex items-center gap-4 mb-6">
              {isHealthy ? <CheckCircle2 size={24} className="text-stable-green" /> : <AlertCircle size={24} className={isWarning ? 'text-amber-500' : 'text-emergency'} />}
              <h3 className="text-lg font-bold text-white">Clinical Troubleshooting</h3>
           </div>
           
           <ul className="space-y-4 text-sm text-white/40">
              <li className="flex items-center gap-3">
                 <div className="h-1.5 w-1.5 rounded-full bg-white/20" /> 
                 <span>Ensure camera lens is free from clinical dust/smudges.</span>
              </li>
              <li className="flex items-center gap-3">
                 <div className="h-1.5 w-1.5 rounded-full bg-white/20" /> 
                 <span>Adjust bedside lighting to reduce high-contrast glare on irises.</span>
              </li>
              <li className="flex items-center gap-3">
                 <div className="h-1.5 w-1.5 rounded-full bg-white/20" /> 
                 <span>If drift exceeds 15%, initiate re-calibration through Settings.</span>
              </li>
           </ul>
        </div>

        <div className="mt-10 flex justify-center">
           <button 
             onClick={onClose}
             className="px-10 py-4 rounded-2xl bg-medical text-black font-black text-xs uppercase tracking-widest shadow-glow-sm hover:scale-[1.02] transition"
           >
             RETURN TO COMMAND
           </button>
        </div>
      </div>
    </div>
  );
}

HardwareStatsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fps: PropTypes.number.isRequired,
  signalQuality: PropTypes.number.isRequired,
  gazeAccuracy: PropTypes.number.isRequired,
};
