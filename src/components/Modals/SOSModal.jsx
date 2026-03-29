import PropTypes from 'prop-types';
import { ShieldAlert } from 'lucide-react';

export default function SOSModal({ countdown, patient, onCancel }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="panel-elevated w-full max-w-lg p-8 text-center">
        <div className="mx-auto flex h-20 w-20 animate-pulseSoft items-center justify-center rounded-full border border-emergency/30 bg-emergency/10 text-emergency">
          <ShieldAlert size={40} />
        </div>
        <p className="mt-5 text-xs uppercase tracking-[0.32em] text-emergency/70">SOS Alert Active</p>
        <h2 className="mt-2 font-display text-4xl text-white">Caregiver escalation sent</h2>
        <div className="mt-4 inline-flex rounded-full border border-social/20 bg-social/10 px-4 py-2 text-sm text-social">
          WhatsApp notification dispatched
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-left">
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">Primary caregiver</div>
          <div className="mt-2 text-xl text-white">{patient.caregiver}</div>
          <div className="mt-1 text-sm text-white/60">
            Patient {patient.name} • Room {patient.room} • {patient.condition}
          </div>
        </div>

        <div className="mt-6 font-display text-6xl text-white">{countdown}</div>
        <div className="text-sm text-white/50">Seconds remaining to auto-dismiss</div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-8 rounded-full border border-white/[0.12] px-6 py-3 text-sm text-white/75 transition hover:border-white/25 hover:text-white"
        >
          Cancel SOS
        </button>
      </div>
    </div>
  );
}

SOSModal.propTypes = {
  countdown: PropTypes.number.isRequired,
  patient: PropTypes.shape({
    caregiver: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    room: PropTypes.string.isRequired,
    condition: PropTypes.string.isRequired,
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
};
