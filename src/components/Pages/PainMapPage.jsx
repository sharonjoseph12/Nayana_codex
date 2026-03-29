import { useState } from 'react';
import PropTypes from 'prop-types';

function showLanguageName(code) {
  return code === 'hi' ? 'Hindi' : code === 'kn' ? 'Kannada' : code === 'ta' ? 'Tamil' : 'English';
}

export default function PainMapPage({ currentLanguage, onPhraseSelect, painLog, setPainLog }) {
  const [selectedPart, setSelectedPart] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSentence, setGeneratedSentence] = useState('');

  const bodyParts = [
    { id: 'head', label: 'Head', cx: 150, cy: 32 },
    { id: 'chest', label: 'Chest', cx: 150, cy: 100 },
    { id: 'abdomen', label: 'Abdomen', cx: 150, cy: 158 },
    { id: 'left_arm', label: 'Left Arm', cx: 88, cy: 115 },
    { id: 'right_arm', label: 'Right Arm', cx: 212, cy: 115 },
    { id: 'left_leg', label: 'Left Leg', cx: 127, cy: 255 },
    { id: 'right_leg', label: 'Right Leg', cx: 173, cy: 255 },
  ];

  const heatmap = Object.fromEntries(bodyParts.map((part) => [part.id, 0]));
  painLog.forEach((entry) => {
    if (heatmap[entry.part] !== undefined) heatmap[entry.part] += entry.intensity;
  });
  const maxHeat = Math.max(...Object.values(heatmap), 1);

  const getHeatColor = (partId) => {
    const heat = heatmap[partId] / maxHeat;
    if (heat === 0) return 'rgba(255,255,255,0.06)';
    if (heat < 0.3) return 'rgba(0,212,255,0.4)';
    if (heat < 0.6) return 'rgba(255,215,0,0.5)';
    return 'rgba(255,61,90,0.7)';
  };

  const confirmPain = async () => {
    if (!selectedPart) return;
    setIsGenerating(true);
    setPainLog((previous) => [
      ...previous,
      { part: selectedPart.id, label: selectedPart.label, intensity, timestamp: Date.now() },
    ]);
    const phrase = `Pain in ${selectedPart.label} - intensity ${intensity}/10`;
    const text = await onPhraseSelect('Medical', phrase, {
      forceSpeak: true,
      categoryOverride: 'PAIN',
      severityOverride: intensity >= 8 ? 4 : intensity >= 5 ? 3 : 2,
    });
    setGeneratedSentence(text || '');
    setIsGenerating(false);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '600', color: '#fff' }}>Pain Body Map</h1>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
          Select the location and intensity of pain in {showLanguageName(currentLanguage)}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="300" height="320" viewBox="0 0 300 320">
            <circle cx={150} cy={32} r={28} fill={selectedPart?.id === 'head' ? 'rgba(0,212,255,0.4)' : getHeatColor('head')} stroke={selectedPart?.id === 'head' ? '#00d4ff' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[0])} />
            <rect x={143} y={61} width={14} height={16} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <rect x={115} y={78} width={70} height={50} rx="6" fill={selectedPart?.id === 'chest' ? 'rgba(0,212,255,0.4)' : getHeatColor('chest')} stroke={selectedPart?.id === 'chest' ? '#00d4ff' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[1])} />
            <rect x={120} y={132} width={60} height={40} rx="4" fill={selectedPart?.id === 'abdomen' ? 'rgba(0,212,255,0.4)' : getHeatColor('abdomen')} stroke={selectedPart?.id === 'abdomen' ? '#00d4ff' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[2])} />
            <rect x={74} y={80} width={28} height={75} rx="12" fill={selectedPart?.id === 'left_arm' ? 'rgba(0,212,255,0.4)' : getHeatColor('left_arm')} stroke={selectedPart?.id === 'left_arm' ? '#00d4ff' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[3])} />
            <rect x={198} y={80} width={28} height={75} rx="12" fill={selectedPart?.id === 'right_arm' ? 'rgba(0,212,255,0.4)' : getHeatColor('right_arm')} stroke={selectedPart?.id === 'right_arm' ? '#00d4ff' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[4])} />
            <rect x={111} y={176} width={32} height={90} rx="10" fill={selectedPart?.id === 'left_leg' ? 'rgba(0,212,255,0.4)' : getHeatColor('left_leg')} stroke={selectedPart?.id === 'left_leg' ? '#00d4ff' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[5])} />
            <rect x={157} y={176} width={32} height={90} rx="10" fill={selectedPart?.id === 'right_leg' ? 'rgba(0,212,255,0.4)' : getHeatColor('right_leg')} stroke={selectedPart?.id === 'right_leg' ? '#00d4ff' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(bodyParts[6])} />
            {bodyParts.map((part) =>
              heatmap[part.id] > 0 ? (
                <text key={part.id} x={part.cx} y={part.cy + 4} textAnchor="middle" fill="white" fontSize="9" fontFamily="DM Mono, monospace" fontWeight="600">
                  {heatmap[part.id]}
                </text>
              ) : null
            )}
          </svg>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Mono, monospace', marginTop: '8px' }}>
            {selectedPart ? `Selected: ${selectedPart.label}` : 'Click a body part to select'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Selected Area
            </div>
            <div style={{ fontSize: '22px', fontWeight: '600', color: selectedPart ? '#00d4ff' : 'rgba(255,255,255,0.2)', fontFamily: 'Syne, sans-serif' }}>
              {selectedPart ? selectedPart.label : 'None selected'}
            </div>
          </div>

          <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '12px' }}>
              Pain Intensity - {intensity}/10
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setIntensity(level)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: `1px solid ${intensity === level ? (level > 7 ? '#ff3d5a' : level > 4 ? '#ffd700' : '#00d4ff') : 'rgba(255,255,255,0.1)'}`,
                    background: intensity === level ? (level > 7 ? 'rgba(255,61,90,0.2)' : level > 4 ? 'rgba(255,215,0,0.2)' : 'rgba(0,212,255,0.2)') : 'rgba(255,255,255,0.03)',
                    color: intensity === level ? '#fff' : 'rgba(255,255,255,0.4)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'DM Mono, monospace',
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={confirmPain}
            disabled={!selectedPart || isGenerating}
            style={{ padding: '14px', borderRadius: '12px', border: '1px solid rgba(0,212,255,0.3)', background: selectedPart ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.05)', color: selectedPart ? '#00d4ff' : 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '600', cursor: selectedPart ? 'pointer' : 'not-allowed' }}
          >
            {isGenerating ? 'Generating...' : selectedPart ? `Report ${selectedPart.label} Pain (${intensity}/10)` : 'Select a body part first'}
          </button>

          {generatedSentence ? (
            <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '9px', color: '#00d4ff', fontFamily: 'DM Mono, monospace', marginBottom: '6px' }}>AI GENERATED</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5' }}>"{generatedSentence}"</div>
            </div>
          ) : null}

          {painLog.length > 0 ? (
            <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Pain Log
              </div>
              {painLog.slice(-5).reverse().map((entry, index) => (
                <div key={`${entry.part}-${entry.timestamp}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.intensity > 7 ? '#ff3d5a' : entry.intensity > 4 ? '#ffd700' : '#00d4ff', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', flex: 1 }}>{entry.label}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: entry.intensity > 7 ? '#ff3d5a' : entry.intensity > 4 ? '#ffd700' : '#00d4ff' }}>{entry.intensity}/10</span>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono, monospace' }}>
                    {new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

PainMapPage.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  onPhraseSelect: PropTypes.func.isRequired,
  painLog: PropTypes.arrayOf(PropTypes.object).isRequired,
  setPainLog: PropTypes.func.isRequired,
};
