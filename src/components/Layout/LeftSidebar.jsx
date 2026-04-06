import { memo } from 'react';
import PropTypes from 'prop-types';
import { Gauge, ShieldAlert } from 'lucide-react';
import VitalsSidebar from '../Vitals/VitalsSidebar';
import VitalCard from '../Vitals/VitalCard';

const LeftSidebar = memo(function LeftSidebar({ vitals }) {
  return (
    <div className="space-y-4 pr-2">
      <div className="panel-elevated p-4">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Vitals Monitor</p>
          <h3 className="mt-1 font-display text-xl text-white">Realtime Status</h3>
        </div>
        <VitalsSidebar vitals={vitals} />

        <div className="mt-4 grid grid-cols-1 gap-3">
          <VitalCard
            label="Fatigue Risk"
            value={vitals.fatigueRisk}
            tone={vitals.fatigueRisk === 'Alert' ? 'red' : vitals.fatigueRisk === 'Watch' ? 'violet' : 'emerald'}
            icon={ShieldAlert}
          />
          <VitalCard
            label="Session Health"
            value={vitals.sessionHealthScore}
            unit="/100"
            tone={vitals.sessionHealthScore >= 75 ? 'emerald' : vitals.sessionHealthScore >= 50 ? 'cyan' : 'red'}
            icon={Gauge}
          />
        </div>
      </div>
    </div>
  );
});

export default LeftSidebar;

LeftSidebar.propTypes = {
  vitals: PropTypes.shape({
    fatigueRisk: PropTypes.string.isRequired,
    sessionHealthScore: PropTypes.number.isRequired,
  }).isRequired,
};
