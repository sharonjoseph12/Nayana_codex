import PropTypes from 'prop-types';
import { Activity, Brain, Eye, Waves } from 'lucide-react';
import VitalCard from './VitalCard';

export default function VitalsSidebar({ vitals }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <VitalCard label="Heart Rate" value={Math.round(vitals?.heartRate || 0)} unit="BPM" tone="red" icon={Activity} />
        <VitalCard label="Blink Rate" value={Math.round(vitals?.blinkRate || 0)} unit="/min" tone="cyan" icon={Eye} />
        <VitalCard label="Focus" value={Math.round(vitals?.focusScore || 0)} unit="%" tone="emerald" icon={Brain} />
        <VitalCard label="Stress" value={vitals?.stressLevel || 'Stable'} tone="violet" icon={Waves} />
      </div>
    </div>
  );
}

VitalsSidebar.propTypes = {
  vitals: PropTypes.shape({
    heartRate: PropTypes.number,
    blinkRate: PropTypes.number,
    focusScore: PropTypes.number,
    stressLevel: PropTypes.string,
    alertStatus: PropTypes.string,
    sessionDuration: PropTypes.number,
    formatDuration: PropTypes.func,
  }).isRequired,
};
