import React from 'react';
import PropTypes from 'prop-types';

const EMOTION_COLORS = {
  Calm: '#00d4ff',
  Strained: '#ffd700',
  Distressed: '#ff3d5a',
  Unavailable: '#333333',
};

/**
 * Phase 24: Sentiment Journey Heatmap
 * Visualizes emotional history as a clinical telemetry strip.
 */
export default function SentimentTimeline({ history = [] }) {
  // Pad with grey if empty to maintain UI structure
  const segments = history.length > 0 ? history : Array(20).fill({ emotion: 'Unavailable' });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">24H Sentiment Journey</span>
        <span className="text-[9px] font-mono text-white/20 uppercase">Now</span>
      </div>

      <div className="flex gap-1 h-6 w-full">
        {segments.map((seg, idx) => (
          <div 
            key={idx}
            className="flex-1 rounded-sm transition-all duration-500 hover:scale-y-125"
            style={{ 
              backgroundColor: EMOTION_COLORS[seg.emotion] || EMOTION_COLORS.Unavailable,
              opacity: (idx + 1) / segments.length // Visual fade for history
            }}
            title={`${seg.emotion} @ ${seg.timestamp ? new Date(seg.timestamp).toLocaleTimeString() : 'N/A'}`}
          />
        ))}
      </div>
      
      <div className="flex justify-between items-center text-[7px] font-mono text-white/10 uppercase tracking-widest">
         <span>Shift Start</span>
         <span>Real-time Sentinel Active</span>
      </div>
    </div>
  );
}

SentimentTimeline.propTypes = {
  history: PropTypes.arrayOf(PropTypes.object),
};
