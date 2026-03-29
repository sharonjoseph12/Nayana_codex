import PropTypes from 'prop-types';

export default function ConversationThread({ conversationHistory }) {
  const items = conversationHistory.slice(-4).reverse();

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-3 text-sm text-white/40">
          Conversation history appears here after the first generated phrase.
        </div>
      ) : (
        items.map((entry) => (
          <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-xs uppercase tracking-[0.24em] text-white/35">
              {entry.quadrant} - {entry.phrase}
            </div>
            <div className="mt-2 text-sm text-white/80">{entry.sentence}</div>
          </div>
        ))
      )}
    </div>
  );
}

ConversationThread.propTypes = {
  conversationHistory: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      quadrant: PropTypes.string.isRequired,
      phrase: PropTypes.string.isRequired,
      sentence: PropTypes.string.isRequired,
    })
  ).isRequired,
};
