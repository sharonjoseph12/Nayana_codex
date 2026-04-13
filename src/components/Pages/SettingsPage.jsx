import { useState } from 'react';
import PropTypes from 'prop-types';
import { PATIENT } from '../../constants/config';
import DwellCalibrationModal from '../Modals/DwellCalibrationModal';

export default function SettingsPage({
  currentLanguage,
  setCurrentLanguage,
  autoSpeak,
  setAutoSpeak,
  isMuted,
  toggleMute,
  trackingMode,
  startEyeTracking,
  stopEyeTracking,
  dwellTime,
  setDwellTime,
  densityMode = 'normal',
  setDensityMode,
  patient,
  isVitalsLive,
  connectBLE,
  disconnectBLE,
  showGazeReticle,
  setShowGazeReticle
}) {
  const [showCalibration, setShowCalibration] = useState(false);
  const patientInfo = patient || PATIENT;

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '600', color: '#fff' }}>Settings</h1>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
          Configure Nayana for optimal patient experience
        </p>
      </div>

      <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '14px' }}>Language &amp; Voice</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '14px' }}>
          {[
            { code: 'en', label: 'English', flag: '🇬🇧', script: 'English' },
            { code: 'hi', label: 'हिंदी', flag: '🇮🇳', script: 'Hindi' },
            { code: 'kn', label: 'ಕನ್ನಡ', flag: '🌟', script: 'Kannada' },
            { code: 'ta', label: 'தமிழ்', flag: '🌺', script: 'Tamil' },
          ].map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => setCurrentLanguage(language.code)}
              style={{
                padding: '12px 8px',
                borderRadius: '10px',
                border: `1px solid ${currentLanguage === language.code ? 'rgba(0,212,255,0.4)' : '#222'}`,
                background: currentLanguage === language.code ? 'rgba(0,212,255,0.1)' : '#1a1a1a',
                color: currentLanguage === language.code ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{language.flag}</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>{language.label}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{language.script}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Auto-Speak', desc: 'Automatically speak when AI generates sentence', value: autoSpeak, toggle: () => setAutoSpeak((previous) => !previous) },
            { label: 'Mute All Audio', desc: 'Silence all speech output', value: isMuted, toggle: toggleMute },
          ].map((setting) => (
            <div key={setting.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{setting.label}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{setting.desc}</div>
              </div>
              <div onClick={setting.toggle} style={{ width: '44px', height: '24px', borderRadius: '100px', background: setting.value ? '#00d4ff' : '#333', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: '3px', left: setting.value ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '14px' }}>Eye Tracking</div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <button type="button" onClick={startEyeTracking} style={{ flex: 1, padding: '10px', borderRadius: '9px', border: '1px solid rgba(0,212,255,0.3)', background: trackingMode === 'eye' ? 'rgba(0,212,255,0.15)' : 'rgba(0,212,255,0.05)', color: '#00d4ff', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer' }}>
            Enable Eye Tracking
          </button>
          <button type="button" onClick={stopEyeTracking} style={{ flex: 1, padding: '10px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.12)', background: trackingMode === 'mouse' ? 'rgba(255,255,255,0.08)' : 'transparent', color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer' }}>
            Mouse Simulation
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', color: '#fff' }}>Dwell Time</div>
            <div style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', color: '#00d4ff' }}>{dwellTime / 1000}s</div>
          </div>
          <input type="range" min="1000" max="4000" step="250" value={dwellTime} onChange={(event) => setDwellTime(Number.parseInt(event.target.value, 10))} style={{ width: '100%', accentColor: '#00d4ff' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>1s Fast</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>4s Slow</span>
          </div>
        </div>

        {/* Calibration Wizard Button */}
        <button
          type="button"
          onClick={() => setShowCalibration(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(0,212,255,0.2)',
            background: 'rgba(0,212,255,0.06)',
            color: '#00d4ff',
            fontSize: '12px',
            fontWeight: '700',
            fontFamily: 'DM Mono, monospace',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>🎯 Run Calibration Wizard</span>
          <span style={{ fontSize: '10px', opacity: 0.5 }}>Auto-tune dwell →</span>
        </button>
      </div>

      <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>Cardiac Monitor Pairing</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '14px', fontFamily: 'DM Mono, monospace' }}>Pair a medical heart rate monitor via Web Bluetooth</div>
        
        <button
          onClick={isVitalsLive ? disconnectBLE : connectBLE}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: `1px solid ${isVitalsLive ? 'rgba(255,61,90,0.3)' : 'rgba(0,255,170,0.3)'}`,
            background: isVitalsLive ? 'rgba(255,61,90,0.1)' : 'rgba(0,255,170,0.1)',
            color: isVitalsLive ? '#ff3d5a' : '#00ffaa',
            fontSize: '12px',
            fontWeight: '800',
            fontFamily: 'DM Mono, monospace',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isVitalsLive ? (
            <><span>🔌 Disconnect Monitor</span></>
          ) : (
            <><span>🔗 Pair Heart Rate Monitor</span></>
          )}
        </button>
        <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '8px', fontFamily: 'DM Mono, monospace' }}>
          {isVitalsLive ? 'LIVE DATA STREAM ACTIVE' : 'Currently using simulated telemetry'}
        </p>
      </div>

      <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>Gaze Visualization</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '14px', fontFamily: 'DM Mono, monospace' }}>Display the point-of-regard on screen for monitoring</div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ fontSize: '12px', color: '#fff', fontWeight: '500' }}>Show On-Screen Cursor</span>
          <button
            onClick={() => setShowGazeReticle(!showGazeReticle)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: showGazeReticle ? '#00d4ff' : '#333',
              color: showGazeReticle ? '#080c10' : '#888',
              fontSize: '10px',
              fontWeight: '800',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {showGazeReticle ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>Progressive UX — Target Density</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '14px', fontFamily: 'DM Mono, monospace' }}>Adapt the grid as eye-tracking accuracy changes over time</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'normal', label: '🔲 Normal', desc: 'Full 4-quadrant grid · 4 phrases each · max control', color: '#00d4ff' },
            { id: 'focused', label: '⬛ Focused', desc: 'Larger targets · reduced clutter · moderate fatigue', color: '#bf80ff' },
            { id: 'binary', label: '🟥 Binary', desc: 'Only 2 giant buttons (Medical + Emergency) · high fatigue', color: '#ff3d5a' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setDensityMode?.(mode.id)}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: `1px solid ${densityMode === mode.id ? mode.color + '66' : '#222'}`,
                background: densityMode === mode.id ? `${mode.color}12` : '#1a1a1a',
                color: densityMode === mode.id ? mode.color : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{mode.label}</div>
                <div style={{ fontSize: '10px', marginTop: '2px', color: densityMode === mode.id ? `${mode.color}bb` : 'rgba(255,255,255,0.3)' }}>{mode.desc}</div>
              </div>
              {densityMode === mode.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: mode.color }} />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#151515', border: '1px solid #222', borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '14px' }}>Patient Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Patient Name', value: patientInfo.name },
            { label: 'Age', value: `${patientInfo.age} years` },
            { label: 'Condition', value: patientInfo.condition },
            { label: 'Room', value: patientInfo.room },
            { label: 'Caregiver', value: patientInfo.caregiver },
            { label: 'Staff on Duty', value: patientInfo.staffName || '—' },
          ].map((field) => (
            <div key={field.label} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{field.label}</div>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: '500', marginTop: '3px' }}>{field.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.06),rgba(191,128,255,0.06))', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: '800', color: '#00d4ff', fontFamily: 'Syne, sans-serif', letterSpacing: '0.1em' }}>NAYANA</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Voice for the Voiceless</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '8px', fontFamily: 'DM Mono, monospace' }}>Hackfest 2026 · Healthcare Innovation Track</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '4px', fontFamily: 'DM Mono, monospace' }}>Powered by Gemini AI · ElevenLabs · GazeCloudAPI</div>
      </div>

      <DwellCalibrationModal
        open={showCalibration}
        onClose={() => setShowCalibration(false)}
        dwellTime={dwellTime}
        setDwellTime={setDwellTime}
      />
    </div>
  );
}

SettingsPage.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  setCurrentLanguage: PropTypes.func.isRequired,
  autoSpeak: PropTypes.bool.isRequired,
  setAutoSpeak: PropTypes.func.isRequired,
  isMuted: PropTypes.bool.isRequired,
  toggleMute: PropTypes.func.isRequired,
  trackingMode: PropTypes.string.isRequired,
  startEyeTracking: PropTypes.func.isRequired,
  stopEyeTracking: PropTypes.func.isRequired,
  dwellTime: PropTypes.number.isRequired,
  setDwellTime: PropTypes.func.isRequired,
  densityMode: PropTypes.string,
  setDensityMode: PropTypes.func,
  patient: PropTypes.object,
  isVitalsLive: PropTypes.bool,
  connectBLE: PropTypes.func,
  disconnectBLE: PropTypes.func,
  showGazeReticle: PropTypes.bool,
  setShowGazeReticle: PropTypes.func,
};
