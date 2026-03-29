import PropTypes from 'prop-types';
import { Copy, Download, X } from 'lucide-react';
import { PATIENT } from '../../constants/config';

export default function ReportModal({
  report,
  loading,
  vitals,
  clinicalAI,
  clinicalLog,
  sessionDuration,
  formatDuration,
  onDownload,
  onClose,
}) {
  const copyReport = async () => {
    if (!report) {
      return;
    }

    try {
      await navigator.clipboard.writeText(report);
    } catch {
      // Clipboard access is optional.
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
      <div className="panel-elevated max-h-[90vh] w-full max-w-4xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Clinical Handover</p>
            <h2 className="mt-1 font-display text-3xl text-white">Shift Report</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 p-2 text-white/60">
            <X size={16} />
          </button>
        </div>

        <div className="grid max-h-[calc(90vh-88px)] gap-6 overflow-y-auto p-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-white/35">Patient</div>
                <div className="mt-2 text-lg text-white">{PATIENT.name}</div>
                <div className="mt-1 text-sm text-white/55">{PATIENT.condition}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-white/35">Room</div>
                <div className="mt-2 text-lg text-white">{PATIENT.room}</div>
                <div className="mt-1 text-sm text-white/55">{PATIENT.caregiver}</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-white/35">Session</div>
                <div className="mt-2 text-lg text-white">{formatDuration(sessionDuration)}</div>
                <div className="mt-1 text-sm text-white/55">{clinicalLog.length} communications</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-white/35">Risk</div>
                <div className="mt-2 text-lg text-white">{clinicalAI.riskLevel}</div>
                <div className="mt-1 text-sm text-white/55">{clinicalAI.riskScore}/100</div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-3 text-xs uppercase tracking-[0.24em] text-white/35">AI Summary</div>
              {loading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="h-4 rounded-full bg-white/6" />
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-white/78">{report}</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-white/35">Heart Rate</div>
                <div className="mt-2 text-white">{vitals.heartRate} BPM</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-white/35">Stress</div>
                <div className="mt-2 text-white">{vitals.stressLevel}</div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-3 text-xs uppercase tracking-[0.24em] text-white/35">Communication Preview</div>
              <div className="space-y-3">
                {clinicalLog.slice(-6).reverse().map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/35">
                      {entry.quadrant} - {entry.phrase}
                    </div>
                    <div className="mt-2 text-sm text-white/75">{entry.sentence}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={copyReport}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm text-white/70"
              >
                <Copy size={16} />
                Copy
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-medical/25 bg-medical/10 px-4 py-3 text-sm text-medical"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReportModal.propTypes = {
  report: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  vitals: PropTypes.shape({
    heartRate: PropTypes.number.isRequired,
    stressLevel: PropTypes.string.isRequired,
  }).isRequired,
  clinicalAI: PropTypes.shape({
    riskLevel: PropTypes.string.isRequired,
    riskScore: PropTypes.number.isRequired,
  }).isRequired,
  clinicalLog: PropTypes.arrayOf(PropTypes.object).isRequired,
  sessionDuration: PropTypes.number.isRequired,
  formatDuration: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
