import PropTypes from 'prop-types';
import { Activity, Brain, Eye, Waves } from 'lucide-react';
import VitalCard from './VitalCard';

export default function VitalsSidebar({ vitals }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <VitalCard label="Heart Rate" value={vitals.heartRate} unit="BPM" tone="red" icon={Activity} />
        <VitalCard label="Blink Rate" value={vitals.blinkRate} unit="/min" tone="cyan" icon={Eye} />
        <VitalCard label="Focus" value={vitals.focusScore} unit="%" tone="emerald" icon={Brain} />
        <VitalCard label="Stress" value={vitals.stressLevel} tone="violet" icon={Waves} />
      </div>
    </div>
  );
}

VitalsSidebar.propTypes = {
  vitals: PropTypes.shape({
    heartRate: PropTypes.number.isRequired,
    blinkRate: PropTypes.number.isRequired,
    focusScore: PropTypes.number.isRequired,
    stressLevel: PropTypes.string.isRequired,
    alertStatus: PropTypes.string.isRequired,
    sessionDuration: PropTypes.number.isRequired,
    formatDuration: PropTypes.func.isRequired,
  }).isRequired,
};
