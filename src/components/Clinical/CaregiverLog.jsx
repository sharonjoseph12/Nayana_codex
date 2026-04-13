import PropTypes from 'prop-types';
import { Check, MessageCircleWarning } from 'lucide-react';

export default function CaregiverLog({ caregiverLog, setCaregiverLog }) {
  const acknowledge = (id) => {
    setCaregiverLog((previous) =>
      previous.map((entry) => (entry.id === id ? { ...entry, acknowledged: true } : entry))
    );
  };

  return (
    <section className="panel-elevated flex flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Caregiver Log</p>
          <h3 className="mt-1 font-display text-xl text-white">Live Feed</h3>
        </div>
        <span className="rounded-full border border-social/25 bg-social/10 px-3 py-1 text-xs text-social">
          WhatsApp
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto pr-1">
        {caregiverLog.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/45">
            No caregiver events yet.
          </div>
        ) : (
          caregiverLog.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white">{entry.message}</div>
                  <div className="mt-1 text-xs text-white/45">
                    {entry.time} - {entry.quadrant}
                  </div>
                </div>
                <div
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <MessageCircleWarning size={12} />
                  <span>{entry.acknowledged ? 'Acknowledged by care team' : 'Pending acknowledgment'}</span>
                </div>
                {!entry.acknowledged ? (
                  <button
                    type="button"
                    onClick={() => acknowledge(entry.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 transition hover:border-social/30 hover:text-white"
                  >
                    <Check size={12} />
                    Acknowledge
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

CaregiverLog.propTypes = {
  caregiverLog: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      time: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      quadrant: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      acknowledged: PropTypes.bool.isRequired,
    })
  ).isRequired,
  setCaregiverLog: PropTypes.func.isRequired,
};
