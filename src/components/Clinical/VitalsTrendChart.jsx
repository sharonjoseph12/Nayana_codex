import React from 'react';
import PropTypes from 'prop-types';

/**
 * High-performance, lightweight SVG sparkline for clinical trends.
 * No dependencies, minimal overhead.
 */
export default function VitalsTrendChart({ data = [], color = '#00d4ff', height = 40, width = 120 }) {
  if (!data || data.length < 2) return <div style={{ height, width }} />;

  const maxVal = Math.max(...data, 100); // Normalize to at least 100
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;

  // Scale points to fit SVG viewbox
  const padding = 2;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = ((maxVal - val) / range) * (height - padding * 2) + padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative group">
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Background Trace Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
          opacity="0.2"
        />
        
        {/* Active Trend Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
          className="drop-shadow-[0_0_8px_var(--chart-color)]"
          style={{ '--chart-color': color }}
        />
        
        {/* Last Point Indicator */}
        {data.length > 0 && (
          <circle
            cx={(width - padding)}
            cy={((maxVal - data[data.length - 1]) / range) * (height - padding * 2) + padding}
            r="3"
            fill={color}
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
}

VitalsTrendChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  color: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
};
