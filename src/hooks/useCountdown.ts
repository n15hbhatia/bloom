import { useCallback, useEffect, useRef, useState } from 'react';

/** Wall-clock based countdown that survives tab throttling. */
export function useCountdown(totalSeconds: number, onDone?: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const endAt = useRef<number | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    setRemaining(totalSeconds);
    setRunning(false);
    endAt.current = null;
  }, [totalSeconds]);

  useEffect(() => {
    if (!running) return;
    if (endAt.current === null) endAt.current = Date.now() + remaining * 1000;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.round((endAt.current! - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(id);
        setRunning(false);
        endAt.current = null;
        doneRef.current?.();
      }
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => {
    endAt.current = null;
    setRunning(false);
  }, []);
  const reset = useCallback(() => {
    endAt.current = null;
    setRunning(false);
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  return { remaining, running, start, pause, reset, elapsed: totalSeconds - remaining };
}

export function fmtClock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** A very soft two-note chime, generated on the fly (no audio files). */
export function softChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [523.25, 783.99].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.35;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 2.3);
    });
    window.setTimeout(() => ctx.close(), 3200);
  } catch {
    /* audio is optional */
  }
}
