import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Target, Check, ChevronRight, Loader2, Zap } from 'lucide-react';

const TARGETS = [
  { id: 1, label: 'Target A', x: '20%', y: '30%', hint: 'Look at the top-left target' },
  { id: 2, label: 'Target B', x: '75%', y: '65%', hint: 'Now look at the bottom-right target' },
  { id: 3, label: 'Target C', x: '50%', y: '20%', hint: 'Finally, the top-center target' },
];

const DWELL_MS = 1200; // how long to hold gaze for each target in wizard

export default function DwellCalibrationModal({ open, onClose, dwellTime, setDwellTime }) {
  const [step, setStep] = useState('intro'); // intro | calibrating | result
  const [currentTarget, setCurrentTarget] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [suggestedDwell, setSuggestedDwell] = useState(null);

  const holdTimerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setStep('intro');
      setCurrentTarget(0);
      setReactionTimes([]);
      setDwellProgress(0);
      setIsHolding(false);
      setSuggestedDwell(null);
    }
  }, [open]);

  const startHold = () => {
    if (isHolding) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();

    // Progress animation
    let elapsed = 0;
    progressTimerRef.current = setInterval(() => {
      elapsed += 50;
      setDwellProgress(Math.min(100, (elapsed / DWELL_MS) * 100));
    }, 50);

    // Complete hold
    holdTimerRef.current = setTimeout(() => {
      clearInterval(progressTimerRef.current);
      const reactionTime = Date.now() - startTimeRef.current;
      const newTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newTimes);
      setDwellProgress(100);

      setTimeout(() => {
        setDwellProgress(0);
        setIsHolding(false);

        if (currentTarget < TARGETS.length - 1) {
          setCurrentTarget(prev => prev + 1);
        } else {
          // All targets done — compute suggestion
          const avgTime = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
          // Suggest slightly above their natural reaction time, snapped to 250ms steps
          const raw = Math.round((avgTime * 1.3) / 250) * 250;
          const clamped = Math.max(1000, Math.min(4000, raw));
          setSuggestedDwell(clamped);
          setStep('result');
        }
      }, 300);
    }, DWELL_MS);
  };

  const cancelHold = () => {
    if (!isHolding) return;
    clearTimeout(holdTimerRef.current);
    clearInterval(progressTimerRef.current);
    setIsHolding(false);
    setDwellProgress(0);
  };

  const applyAndClose = () => {
    if (suggestedDwell) setDwellTime(suggestedDwell);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-medical/10 border border-medical/20">
              <Target size={16} className="text-medical" />
            </div>
            <div>
              <h2 className="font-display text-sm font-bold text-white uppercase tracking-widest">
                Dwell Calibration Wizard
              </h2>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-0.5">
                Auto-tune dwell time to this patient's pace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {step === 'intro' && (
            <div className="text-center py-6">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">
                <Target size={36} className="text-medical" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3-Target Calibration</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-2">
                Three targets will appear one at a time. Hold your gaze (or click) on each target until it fills up.
              </p>
              <p className="text-xs text-white/30 font-mono mb-8">
                Current dwell: <span className="text-medical">{dwellTime / 1000}s</span>
              </p>
              <button
                onClick={() => setStep('calibrating')}
                className="flex items-center gap-2 mx-auto px-8 py-3 rounded-full bg-medical/15 border border-medical/30 text-medical text-sm font-bold hover:bg-medical/25 transition-all"
              >
                Start Calibration <ChevronRight size={16} />
              </button>
            </div>
          )}

          {step === 'calibrating' && (
            <div>
              {/* Progress dots */}
              <div className="flex justify-center gap-3 mb-6">
                {TARGETS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i < currentTarget ? 'bg-stable-green' :
                      i === currentTarget ? 'bg-medical animate-pulse' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <p className="text-center text-xs text-white/40 uppercase tracking-widest mb-6 font-mono">
                {TARGETS[currentTarget]?.hint}
              </p>

              {/* Target arena */}
              <div
                className="relative mx-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                style={{ height: '240px' }}
              >
                {TARGETS.slice(0, currentTarget + 1).map((target, idx) => {
                  const isActive = idx === currentTarget;
                  return (
                    <button
                      key={target.id}
                      onMouseEnter={isActive ? startHold : undefined}
                      onMouseLeave={isActive ? cancelHold : undefined}
                      onMouseDown={isActive ? startHold : undefined}
                      onMouseUp={isActive ? cancelHold : undefined}
                      onClick={isActive ? startHold : undefined}
                      style={{ left: target.x, top: target.y, transform: 'translate(-50%, -50%)' }}
                      className={`absolute flex items-center justify-center rounded-full transition-all duration-300 ${
                        isActive
                          ? 'h-16 w-16 border-2 border-medical bg-medical/10 cursor-pointer hover:bg-medical/20'
                          : 'h-10 w-10 border border-stable-green/50 bg-stable-green/10 cursor-default'
                      }`}
                    >
                      {isActive ? (
                        <div className="relative flex items-center justify-center">
                          {/* Progress ring */}
                          <svg className="absolute" width="64" height="64" style={{ top: '-32px', left: '-32px' }}>
                            <circle
                              cx="32" cy="32" r="28"
                              fill="none"
                              stroke="rgba(0,212,255,0.2)"
                              strokeWidth="3"
                            />
                            <circle
                              cx="32" cy="32" r="28"
                              fill="none"
                              stroke="#00d4ff"
                              strokeWidth="3"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - dwellProgress / 100)}`}
                              strokeLinecap="round"
                              transform="rotate(-90 32 32)"
                              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                            />
                          </svg>
                          <Target size={20} className={`text-medical ${isHolding ? 'animate-pulse' : ''}`} />
                        </div>
                      ) : (
                        <Check size={16} className="text-stable-green" />
                      )}
                    </button>
                  );
                })}
                <p className="absolute bottom-3 right-4 text-[9px] font-mono text-white/20 uppercase tracking-widest">
                  {currentTarget + 1} / {TARGETS.length}
                </p>
              </div>

              <p className="text-center text-[10px] text-white/20 mt-4 font-mono uppercase tracking-widest">
                {isHolding ? 'Hold steady…' : 'Hover / click the glowing target'}
              </p>
            </div>
          )}

          {step === 'result' && suggestedDwell && (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-stable-green/30 bg-stable-green/10">
                <Check size={28} className="text-stable-green" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Calibration Complete</h3>
              <p className="text-sm text-white/40 mb-6">Based on response across 3 targets</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Current</div>
                  <div className="text-2xl font-black font-mono text-white/50">{dwellTime / 1000}s</div>
                </div>
                <div className="rounded-2xl border border-medical/20 bg-medical/[0.05] p-4">
                  <div className="text-[10px] text-medical/60 uppercase tracking-widest mb-1">Suggested</div>
                  <div className="text-2xl font-black font-mono text-medical">{suggestedDwell / 1000}s</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-white/40 hover:text-white transition-all uppercase tracking-widest"
                >
                  Keep Current
                </button>
                <button
                  onClick={applyAndClose}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-medical/15 border border-medical/30 text-medical text-xs font-bold hover:bg-medical/25 transition-all uppercase tracking-widest"
                >
                  <Zap size={14} /> Apply {suggestedDwell / 1000}s
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

DwellCalibrationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  dwellTime: PropTypes.number.isRequired,
  setDwellTime: PropTypes.func.isRequired,
};
