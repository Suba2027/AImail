import { useEffect } from 'react';

/**
 * Calls `fn` immediately, then on an interval, skipping ticks while the tab is hidden.
 */
const usePolling = (fn, intervalMs = 4000) => {
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled || document.hidden) return;
      await fn();
    };

    run();
    const id = setInterval(run, intervalMs);
    const onVis = () => {
      if (!document.hidden) run();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [fn, intervalMs]);
};

export default usePolling;
