import PropTypes from 'prop-types';
import { X } from 'lucide-react';

export default function VoiceSetupModal({ open, onClose, autoSpeak, setAutoSpeak }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
      <div className="panel-elevated w-full max-w-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Voice Setup</p>
            <h2 className="mt-1 font-display text-3xl text-white">Speech preferences</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 p-2 text-white/60">
            <X size={16} />
          </button>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
          <div className="text-sm text-white">Auto Speak</div>
          <p className="mt-1 text-sm text-white/55">Automatically reads newly generated phrases aloud.</p>
          <button
            type="button"
            onClick={() => setAutoSpeak((previous) => !previous)}
            className={`mt-4 rounded-full border px-4 py-2 text-sm ${
              autoSpeak ? 'border-social/25 bg-social/10 text-social' : 'border-white/10 text-white/70'
            }`}
          >
            {autoSpeak ? 'Enabled' : 'Enable Auto Speak'}
          </button>
        </div>
      </div>
    </div>
  );
}

VoiceSetupModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  autoSpeak: PropTypes.bool.isRequired,
  setAutoSpeak: PropTypes.func.isRequired,
};
