import PropTypes from 'prop-types';

const shortcuts = ['F1 Demo', 'P Present', 'M Medical', 'S Social', 'N Personal', 'E Emergency', 'R Repeat', 'X Clear', 'ESC Stop'];

export default function BottomBar({ isDemoRunning }) {
  return (
    <footer className="mx-4 mb-4 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.04] backdrop-blur-md px-4 py-3">
      <div className="flex flex-wrap gap-2">
        {shortcuts.map((shortcut) => (
          <span key={shortcut} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-white/55">
            {shortcut}
          </span>
        ))}
      </div>
      <div className={`text-xs uppercase tracking-[0.28em] ${isDemoRunning ? 'text-emergency' : 'text-white/35'}`}>
        {isDemoRunning ? 'Demo sequence running' : 'Keyboard shortcuts active'}
      </div>
    </footer>
  );
}

BottomBar.propTypes = {
  isDemoRunning: PropTypes.bool.isRequired,
};
