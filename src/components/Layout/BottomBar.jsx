import { memo } from 'react';
import PropTypes from 'prop-types';
import GazeHealthIndicator from '../Tracking/GazeHealthIndicator';

const shortcuts = ['F1 Demo', 'P Present', 'M Medical', 'S Social', 'N Personal', 'E Emergency', 'R Repeat', 'X Clear', 'ESC Stop'];

const BottomBar = memo(function BottomBar({ 
  isDemoRunning, 
  signalQuality, 
  fps, 
  isVitalsLive = false,
  onOpenStats 
}) {
  return (
    <footer className="mx-4 mb-4 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.04] backdrop-blur-md px-4 py-3">
      <div className="flex flex-wrap gap-2 items-center">
        <GazeHealthIndicator 
          signalQuality={signalQuality} 
          fps={fps} 
          onClick={onOpenStats} 
        />
        <div className={`flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${isVitalsLive ? 'bg-stable-green/20 text-stable-green border border-stable-green/30' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${isVitalsLive ? 'bg-stable-green animate-pulse' : 'bg-orange-500'}`} />
          {isVitalsLive ? 'Live Sensor' : 'Simulated'}
        </div>
        <div className="w-[1px] h-6 bg-white/5 mx-2 hidden md:block" />
        <div className="flex flex-wrap gap-2">
          {shortcuts.map((shortcut) => (
            <span key={shortcut} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white/30">
              {shortcut}
            </span>
          ))}
        </div>
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-[0.28em] ${isDemoRunning ? 'text-emergency' : 'text-white/20'}`}>
        {isDemoRunning ? 'Demo sequence running' : 'Clinical Handshake Active'}
      </div>
    </footer>
  );
});

export default BottomBar;

BottomBar.propTypes = {
  isDemoRunning: PropTypes.bool.isRequired,
  signalQuality: PropTypes.number.isRequired,
  fps: PropTypes.number.isRequired,
  isVitalsLive: PropTypes.bool,
  onOpenStats: PropTypes.func.isRequired,
};
