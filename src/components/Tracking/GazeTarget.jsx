import React, { useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * GazeTarget.jsx
 * Automatically registers and unregisters elements with the GazeEngine.
 */
export default function GazeTarget({
  id,
  type = 'button',
  dwellTime,
  registerElement,
  unregisterElement,
  children
}) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (!registerElement || !unregisterElement) return;

    // Small delay to ensure DOM is ready and styled
    const timer = setTimeout(() => {
      registerElement(id, type, { dwellTime });
    }, 100);

    return () => {
      clearTimeout(timer);
      unregisterElement(id);
    };
  }, [id, type, dwellTime, registerElement, unregisterElement]);

  // We wrap children in a span or div to ensure we have a stable DOM reference if needed,
  // but most logic relies on getElementById(id) inside useGazeTracking.
  return (
    <div ref={containerRef} id={id} className="contents">
      {children}
    </div>
  );
}

GazeTarget.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  dwellTime: PropTypes.number,
  registerElement: PropTypes.func.isRequired,
  unregisterElement: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
