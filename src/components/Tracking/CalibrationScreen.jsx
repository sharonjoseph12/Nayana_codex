import PropTypes from 'prop-types';

export default function CalibrationScreen({ open, onSkip }) {
  if (!open) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="panel-elevated max-w-md p-6 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-medical/70">Calibration</p>
        <h3 className="mt-2 font-display text-3xl text-white">Align your gaze</h3>
        <p className="mt-3 text-sm text-white/65">
          Follow the on-screen points to improve dwell accuracy. You can keep using mouse mode if the camera is not available.
        </p>
        <button
          type="button"
          onClick={onSkip}
          className="mt-6 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-medical/30 hover:text-white"
        >
          Continue in mouse mode
        </button>
      </div>
    </div>
  );
}

CalibrationScreen.propTypes = {
  open: PropTypes.bool.isRequired,
  onSkip: PropTypes.func.isRequired,
};
