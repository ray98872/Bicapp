import { useEffect, useState } from 'react';

/** Re-renders every `intervalMs` while `enabled`, returning the current timestamp. */
export function useNow(enabled = true, intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [enabled, intervalMs]);
  return now;
}
