import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart2,
  Clock3,
  Grid2x2,
  MapPin,
  Settings,
  Users,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', icon: Grid2x2, label: 'Dashboard' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  { id: 'caregiver', icon: Users, label: 'Caregiver Hub' },
  { id: 'history', icon: Clock3, label: 'Session History' },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'painmap', icon: MapPin, label: 'Pain Map' },
];

const LeftNav = memo(function LeftNav({ activePage, setActivePage }) {
  return (
    <aside className="ml-4 mr-3 flex w-14 shrink-0 flex-col items-center gap-3 rounded-[28px] border border-white/[0.08] bg-white/[0.04] backdrop-blur-md py-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activePage === item.id;

        return (
          <button
            key={item.id}
            type="button"
            title={item.label}
            onClick={() => setActivePage(item.id)}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
              active
                ? 'border-medical/25 bg-medical/10 text-medical shadow-cyan'
                : 'border-white/[0.06] bg-white/[0.03] text-white/45 hover:border-white/[0.15] hover:text-white/70'
            }`}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </aside>
  );
});

export default LeftNav;

LeftNav.propTypes = {
  activePage: PropTypes.string.isRequired,
  setActivePage: PropTypes.func.isRequired,
};
