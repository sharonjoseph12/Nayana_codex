import PropTypes from 'prop-types';

export default function CommsChart({ clinicalLog }) {
  const buckets = Array.from({ length: 6 }, (_, index) => {
    const windowEnd = Date.now() - (5 - index) * 60 * 60 * 1000;
    const windowStart = windowEnd - 60 * 60 * 1000;
    const total = clinicalLog.filter((entry) => {
      const time = new Date(entry.timestamp).getTime();
      return time >= windowStart && time < windowEnd;
    }).length;

    return {
      label: `${index + 1}h`,
      total,
    };
  });

  const maxValue = Math.max(1, ...buckets.map((bucket) => bucket.total));

  return (
    <div className="panel-elevated p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-white/40">Communications Per Hour</p>
      <div className="mt-5 flex h-40 items-end gap-3">
        {buckets.map((bucket) => (
          <div key={bucket.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="text-xs text-white/35">{bucket.total}</div>
            <div className="relative flex h-full w-full items-end">
              <div
                className="w-full rounded-t-2xl bg-[linear-gradient(180deg,rgba(0,212,255,0.95),rgba(0,255,170,0.55))]"
                style={{ height: `${Math.max(8, (bucket.total / maxValue) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-white/35">{bucket.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

CommsChart.propTypes = {
  clinicalLog: PropTypes.arrayOf(PropTypes.object).isRequired,
};
