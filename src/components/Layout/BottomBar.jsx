import { memo } from 'react';
import PropTypes from 'prop-types';
import GazeHealthIndicator from '../Tracking/GazeHealthIndicator';

const shortcuts = ['F1 Demo', 'P Present', 'M Medical', 'S Social', 'N Personal', 'E Emergency', 'R Repeat', 'X Clear', 'ESC Stop'];

const BottomBar = memo(function BottomBar({ 
  isDemoRunning, 
  signalQuality, 
  fps, 
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
  onOpenStats: PropTypes.func.isRequired,
};
