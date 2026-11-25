import { useEffect, useState } from 'react';
import { useBloom } from '../state/store';

function useSystemReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** Combines the OS setting with the in-app preference. */
export function useReducedMotion(): boolean {
  const pref = useBloom((s) => s.preferences.motion);
  const system = useSystemReducedMotion();
  if (pref === 'reduced') return true;
  if (pref === 'full') return false;
  return system;
}
