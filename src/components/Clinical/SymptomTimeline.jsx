import PropTypes from 'prop-types';

export default function SymptomTimeline({ clinicalLog }) {
  const items = clinicalLog.slice(-4).reverse();

  return (
    <section className="panel-elevated p-4">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Symptoms</p>
        <h3 className="mt-1 font-display text-xl text-white">Recent Timeline</h3>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/45">
            Timeline populates after the first patient interactions.
          </div>
        ) : (
          items.map((entry) => (
            <div key={entry.id} className="flex gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-medical shadow-[0_0_12px_rgba(0,212,255,0.7)]" />
              <div className="min-w-0">
                <div className="text-sm text-white">
                  {entry.quadrant} - {entry.phrase}
                </div>
                <div className="mt-1 text-xs text-white/45">
                  {new Date(entry.timestamp).toLocaleTimeString('en-IN')} - Severity {entry.severity}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

SymptomTimeline.propTypes = {
  clinicalLog: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      quadrant: PropTypes.string.isRequired,
      phrase: PropTypes.string.isRequired,
      severity: PropTypes.number.isRequired,
    })
  ).isRequired,
};
