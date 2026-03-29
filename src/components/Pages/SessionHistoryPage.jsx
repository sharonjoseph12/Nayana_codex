import { useState } from 'react';
import PropTypes from 'prop-types';

function getMostUsed(log) {
  if (!log.length) return 'None';
  const counts = {};
  log.forEach((entry) => {
    counts[entry.quadrant] = (counts[entry.quadrant] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
}

function getRiskColor(score) {
  if (score > 70) return '#ff3d5a';
  if (score > 40) return '#ffd700';
  return '#00ffaa';
}

export default function SessionHistoryPage({ clinicalLog, vitals, clinicalAI }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? clinicalLog : clinicalLog.filter((entry) => entry.quadrant === filter);
  const quadrantColors = { Medical: '#00d4ff', Social: '#00ffaa', Personal: '#bf80ff', Emergency: '#ff3d5a' };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '600', color: '#fff' }}>Session History</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'Medical', 'Social', 'Personal', 'Emergency'].map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setFilter(entry)}
              style={{
                padding: '5px 12px',
                borderRadius: '100px',
                cursor: 'pointer',
                border: `1px solid ${filter === entry ? quadrantColors[entry] || 'rgba(0,212,255,0.4)' : '#222'}`,
                background: filter === entry ? `${quadrantColors[entry] || '#00d4ff'}18` : '#1a1a1a',
                color: filter === entry ? quadrantColors[entry] || '#00d4ff' : 'rgba(255,255,255,0.35)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '11px',
              }}
            >
              {entry}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
        {[
          { label: 'Total Communications', value: clinicalLog.length, color: '#00d4ff' },
          { label: 'Session Duration', value: vitals.formatDuration(vitals.sessionDuration), color: '#bf80ff' },
          { label: 'Risk Score', value: `${clinicalAI.riskScore}/100`, color: getRiskColor(clinicalAI.riskScore) },
          { label: 'Most Used', value: getMostUsed(clinicalLog), color: '#ffd700' },
        ].map((summary) => (
          <div key={summary.label} style={{ background: '#151515', border: '1px solid #222', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: summary.color, fontFamily: 'DM Mono, monospace' }}>{summary.value}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>{summary.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '16px' }}>
          Conversation Timeline
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
            No communications recorded yet. Select a quadrant to begin.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {filtered.slice().reverse().map((entry, index) => (
              <div key={entry.id} style={{ display: 'flex', gap: '14px', paddingBottom: '16px', position: 'relative' }}>
                {index < filtered.length - 1 ? <div style={{ position: 'absolute', left: '19px', top: '32px', bottom: 0, width: '1px', background: 'rgba(255,255,255,0.06)' }} /> : null}
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `${quadrantColors[entry.quadrant] || '#64748b'}18`, border: `2px solid ${quadrantColors[entry.quadrant] || '#64748b'}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }}>
                  {entry.quadrant === 'Medical' ? 'M' : entry.quadrant === 'Social' ? 'S' : entry.quadrant === 'Personal' ? 'P' : 'E'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: quadrantColors[entry.quadrant], fontFamily: 'DM Sans, sans-serif' }}>{entry.quadrant}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Mono, monospace' }}>- {entry.phrase}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono, monospace' }}>
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', borderLeft: `2px solid ${quadrantColors[entry.quadrant] || '#64748b'}` }}>
                    "{entry.sentence}"
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
