import PropTypes from 'prop-types';

export default function VitalCard({ label, value, unit, tone = 'cyan', icon: Icon }) {
  const tones = {
    cyan: 'from-medical/20 to-medical/5 border-medical/20 text-medical',
    emerald: 'from-social/20 to-social/5 border-social/20 text-social',
    violet: 'from-personal/20 to-personal/5 border-personal/20 text-personal',
    red: 'from-emergency/20 to-emergency/5 border-emergency/20 text-emergency',
    slate: 'from-white/10 to-white/5 border-white/10 text-white',
  };

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-3 shadow-glow ${tones[tone] || tones.slate}`}
    >
      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-white/50">
        <span>{label}</span>
        {Icon ? <Icon size={14} /> : null}
      </div>
      <div className="flex items-end gap-1">
        <span className="font-display text-2xl text-white">{value}</span>
        {unit ? <span className="mb-1 font-mono text-xs text-white/45">{unit}</span> : null}
      </div>
    </div>
  );
}

VitalCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  tone: PropTypes.oneOf(['cyan', 'emerald', 'violet', 'red', 'slate']),
  icon: PropTypes.elementType,
};
