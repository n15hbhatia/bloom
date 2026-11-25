import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Check, RotateCcw, SkipForward, Plus, Download, Eraser, Undo2 } from 'lucide-react';
import type { Activity } from '../../data/activities';
import { completeActivity } from '../../state/store';
import { celebrate } from '../../state/ui';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { fmtClock, softChime, useCountdown } from '../../hooks/useCountdown';
import { INTENTION_IDEAS } from '../../data/content';

export function useFinish(activity: Activity) {
  return (opts: { minutes?: number; note?: string; hue?: number } = {}) => {
    const result = completeActivity(activity.id, opts);
    celebrate({ result, activityId: activity.id });
  };
}

// ——— Breathing ———————————————————————————————————————————————————

const PATTERNS = {
  calm: { label: 'Calming · 4–4–6', phases: [['Breathe in', 4], ['Hold', 4], ['Breathe out', 6]] as [string, number][] },
  box: { label: 'Box · 4–4–4–4', phases: [['Breathe in', 4], ['Hold', 4], ['Breathe out', 4], ['Rest', 4]] as [string, number][] },
  simple: { label: 'Simple · 4–6', phases: [['Breathe in', 4], ['Breathe out', 6]] as [string, number][] },
};

export function BreathingExercise({ activity }: { activity: Activity }) {
  const finish = useFinish(activity);
  const reduced = useReducedMotion();
  const [pattern, setPattern] = useState<keyof typeof PATTERNS>('calm');
  const [rounds, setRounds] = useState(4);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState(0);
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);
  const phases = PATTERNS[pattern].phases;
  const cycleSec = phases.reduce((s, p) => s + p[1], 0);

  useEffect(() => {
    if (!running) return;
    setLeft(phases[phase][1]);
    let remaining = phases[phase][1];
    const id = window.setInterval(() => {
      remaining -= 1;
      setLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        const next = phase + 1;
        if (next < phases.length) setPhase(next);
        else if (round + 1 < rounds) {
          setRound(round + 1);
          setPhase(0);
        } else {
          setRunning(false);
          setDone(true);
          softChime();
        }
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, phase, round, rounds, phases]);

  const label = phases[phase][0];
  const scale = label === 'Breathe in' ? 1 : label === 'Breathe out' ? 0.55 : label === 'Hold' ? 1 : 0.55;

  if (!running && !done && round === 0 && phase === 0) {
    return (
      <div className="card p-6">
        <p className="label mb-3">Rhythm</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PATTERNS) as (keyof typeof PATTERNS)[]).map((k) => (
            <button key={k} className={`chip ${pattern === k ? 'chip-on' : ''}`} onClick={() => setPattern(k)}>
              {PATTERNS[k].label}
            </button>
          ))}
        </div>
        <p className="label mb-3 mt-6">Rounds</p>
        <div className="flex flex-wrap gap-2">
          {[3, 4, 6, 8].map((r) => (
            <button key={r} className={`chip ${rounds === r ? 'chip-on' : ''}`} onClick={() => setRounds(r)}>
              {r} rounds · {fmtClock(r * cycleSec)}
            </button>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">Sit comfortably. Follow the circle — let it grow as you breathe in and soften as you breathe out.</p>
        <button className="btn-primary mt-6 w-full sm:w-auto" onClick={() => setRunning(true)}>
          <Play size={16} /> Begin
        </button>
      </div>
    );
  }

  return (
    <div className="card flex flex-col items-center p-6 text-center">
      <div className="relative flex h-72 w-72 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-sky/50"
          animate={{ scale: done ? 0.8 : reduced ? 0.8 : scale }}
          transition={{ duration: reduced ? 0 : phases[phase][1], ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-8 rounded-full bg-mint"
          animate={{ scale: done ? 0.8 : reduced ? 0.8 : scale }}
          transition={{ duration: reduced ? 0 : phases[phase][1], ease: 'easeInOut', delay: 0.1 }}
        />
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.p key={done ? 'done' : `${round}-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-display text-3xl text-deep">
              {done ? 'Well done' : label}
            </motion.p>
          </AnimatePresence>
          {!done && <p className="mt-1 text-2xl font-semibold tabular-nums text-forest">{left}</p>}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted" aria-live="polite">
        {done ? `${rounds} rounds complete.` : `Round ${round + 1} of ${rounds}`}
      </p>
      <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {done ? (
          <button className="btn-primary" onClick={() => finish({ minutes: Math.max(1, Math.round((rounds * cycleSec) / 60)) })}>
            <Check size={16} /> Plant my flower
          </button>
        ) : (
          <>
            <button className="btn-soft" onClick={() => setRunning((r) => !r)}>
              {running ? <Pause size={16} /> : <Play size={16} />} {running ? 'Pause' : 'Resume'}
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setRunning(false);
                setDone(true);
              }}
            >
              That’s enough for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ——— Timed (meditation, breaks, rest) ————————————————————————————

export function TimerActivity({ activity }: { activity: Activity }) {
  const cfg = activity.timer!;
  const finish = useFinish(activity);
  const reduced = useReducedMotion();
  const [minutes, setMinutes] = useState(cfg.options[1] ?? cfg.options[0]);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const cd = useCountdown(minutes * 60, () => {
    setDone(true);
    softChime();
  });
  const lineIdx = Math.min(cfg.guidance.length - 1, Math.floor((cd.elapsed / (minutes * 60)) * cfg.guidance.length));
  const progress = cd.elapsed / (minutes * 60);

  if (!started) {
    return (
      <div className="card p-6">
        <p className="label mb-3">How long?</p>
        <div className="flex flex-wrap gap-2">
          {cfg.options.map((m) => (
            <button key={m} className={`chip ${minutes === m ? 'chip-on' : ''}`} onClick={() => setMinutes(m)}>
              {m} min
            </button>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">{cfg.guidance[0]}</p>
        <button
          className="btn-primary mt-6 w-full sm:w-auto"
          onClick={() => {
            setStarted(true);
            cd.start();
          }}
        >
          <Play size={16} /> Begin
        </button>
      </div>
    );
  }

  return (
    <div className="card flex flex-col items-center overflow-hidden p-6 text-center">
      <div className="relative flex h-64 w-64 items-center justify-center">
        {cfg.visual === 'ripple' && !reduced
          ? [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute h-40 w-40 rounded-full border-2 border-sky"
                animate={cd.running ? { scale: [0.6, 1.6], opacity: [0.8, 0] } : {}}
                transition={{ duration: 6, repeat: Infinity, delay: i * 2, ease: 'easeOut' }}
              />
            ))
          : null}
        <motion.div
          className="absolute h-44 w-44 rounded-full"
          style={{ background: cfg.visual === 'ripple' ? 'radial-gradient(circle at 35% 35%, #DDF0F4, #B8DDE5)' : 'radial-gradient(circle at 35% 35%, #EEF5EC, #B8D1B9)' }}
          animate={reduced || !cd.running ? {} : { scale: [0.92, 1.05, 0.92] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="47" fill="none" stroke="#E6E6DC" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="47" fill="none" stroke="#527D56" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={`${progress * 295.3} 295.3`} />
        </svg>
        <div className="relative">
          <p className="font-display text-4xl tabular-nums text-deep">{done ? 'Done' : fmtClock(cd.remaining)}</p>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={done ? 'done' : lineIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-4 min-h-[3rem] max-w-sm text-[17px] leading-relaxed text-deep"
          aria-live="polite"
        >
          {done ? 'Take a breath before you move on. There’s no hurry.' : cfg.guidance[lineIdx]}
        </motion.p>
      </AnimatePresence>
      <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {done ? (
          <button className="btn-primary" onClick={() => finish({ minutes })}>
            <Check size={16} /> Complete
          </button>
        ) : (
          <>
            <button className="btn-soft" onClick={() => (cd.running ? cd.pause() : cd.start())}>
              {cd.running ? <Pause size={16} /> : <Play size={16} />} {cd.running ? 'Pause' : 'Resume'}
            </button>
            <button className="btn-ghost" onClick={() => finish({ minutes: Math.max(1, Math.round(cd.elapsed / 60)) })}>
              Finish here — it still counts
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ——— Grounding (5-4-3-2-1) —————————————————————————————————————————

const GROUNDING = [
  { n: 5, sense: 'see', prompt: 'Look around. Notice five things you can see.' },
  { n: 4, sense: 'feel', prompt: 'Notice four things you can feel — your feet, the air, your clothes.' },
  { n: 3, sense: 'hear', prompt: 'Listen for three things you can hear, near or far.' },
  { n: 2, sense: 'smell', prompt: 'Notice two things you can smell — or two scents you enjoy.' },
  { n: 1, sense: 'breathe', prompt: 'Take one slow, deep breath. You’re here.' },
];

export function GroundingActivity({ activity }: { activity: Activity }) {
  const finish = useFinish(activity);
  const [i, setI] = useState(0);
  const step = GROUNDING[i];
  return (
    <div className="card p-6 text-center">
      <div className="mb-6 flex justify-center gap-1.5">
        {GROUNDING.map((_, k) => (
          <span key={k} className={`h-1.5 w-8 rounded-full transition-colors ${k <= i ? 'bg-forest' : 'bg-line'}`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-mint font-display text-6xl text-deep">{step.n}</div>
          <p className="label mt-5">Things you can {step.sense}</p>
          <p className="mx-auto mt-2 max-w-sm text-xl leading-relaxed text-deep">{step.prompt}</p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-8 flex justify-center gap-2">
        {i > 0 && (
          <button className="btn-ghost" onClick={() => setI(i - 1)}>
            Back
          </button>
        )}
        {i < GROUNDING.length - 1 ? (
          <button className="btn-primary" onClick={() => setI(i + 1)}>
            I noticed them
          </button>
        ) : (
          <button className="btn-primary" onClick={() => finish({ minutes: 1 })}>
            <Check size={16} /> Complete
          </button>
        )}
      </div>
    </div>
  );
}

// ——— Guided steps (stretching) ————————————————————————————————————

export function StepsActivity({ activity }: { activity: Activity }) {
  const steps = activity.steps!.steps;
  const finish = useFinish(activity);
  const [i, setI] = useState(-1);
  const step = steps[Math.min(steps.length - 1, Math.max(0, i))];
  const cd = useCountdown(step.seconds, () => {
    if (i < steps.length - 1) setI((x) => x + 1);
    else {
      setI(steps.length);
      softChime();
    }
  });
  // auto-start each step
  useEffect(() => {
    if (i >= 0 && i < steps.length) {
      cd.reset();
      const t = window.setTimeout(() => cd.start(), 400);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  const total = steps.reduce((s, x) => s + x.seconds, 0);

  if (i === -1) {
    return (
      <div className="card p-6">
        <p className="label mb-3">The sequence · about {Math.round(total / 60)} min</p>
        <ol className="space-y-2">
          {steps.map((s, k) => (
            <li key={k} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-forest">{k + 1}</span>
              <span className="flex-1 text-sm font-semibold text-deep">{s.title}</span>
              <span className="text-xs text-muted">{s.seconds}s</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted">Move gently and stay within what feels comfortable. Skip anything that doesn’t suit your body today.</p>
        <button className="btn-primary mt-5 w-full sm:w-auto" onClick={() => setI(0)}>
          <Play size={16} /> Begin
        </button>
      </div>
    );
  }

  if (i >= steps.length) {
    return (
      <div className="card p-8 text-center">
        <p className="font-display text-3xl text-deep">All done</p>
        <p className="mt-2 text-muted">Notice how your body feels now.</p>
        <button className="btn-primary mt-6" onClick={() => finish({ minutes: Math.max(1, Math.round(total / 60)) })}>
          <Check size={16} /> Complete
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6 text-center">
      <p className="label">
        Step {i + 1} of {steps.length}
      </p>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h3 className="mt-3 text-3xl font-medium text-deep">{step.title}</h3>
          <p className="mx-auto mt-2 max-w-sm text-[17px] text-muted">{step.detail}</p>
        </motion.div>
      </AnimatePresence>
      <p className="mt-6 font-display text-5xl tabular-nums text-forest">{cd.remaining}</p>
      <div className="mx-auto mt-4 h-1.5 max-w-xs overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-leaf transition-all duration-300" style={{ width: `${(1 - cd.remaining / step.seconds) * 100}%` }} />
      </div>
      <div className="mt-6 flex justify-center gap-2">
        <button className="btn-soft" onClick={() => (cd.running ? cd.pause() : cd.start())}>
          {cd.running ? <Pause size={16} /> : <Play size={16} />}
          {cd.running ? 'Pause' : 'Resume'}
        </button>
        <button
          className="btn-ghost"
          onClick={() => {
            cd.reset();
            setI(i + 1 < steps.length ? i + 1 : steps.length);
          }}
        >
          <SkipForward size={16} /> Next
        </button>
      </div>
    </div>
  );
}

// ——— Simple logging (walks, connection, reading…) ———————————————————

export function LogActivity({ activity }: { activity: Activity }) {
  const cfg = activity.log!;
  const finish = useFinish(activity);
  const [chips, setChips] = useState<string[]>([]);
  const [minutes, setMinutes] = useState<number | undefined>(undefined);
  const [note, setNote] = useState('');
  const toggle = (c: string) => setChips((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  return (
    <div className="card p-6">
      <p className="text-lg font-semibold text-deep">{cfg.question}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {cfg.chips.map((c) => (
          <button key={c} className={`chip ${chips.includes(c) ? 'chip-on' : ''}`} onClick={() => toggle(c)} aria-pressed={chips.includes(c)}>
            {chips.includes(c) && <Check size={14} />} {c}
          </button>
        ))}
      </div>
      {cfg.minutes && (
        <>
          <p className="label mb-2 mt-6">Roughly how long? (optional)</p>
          <div className="flex flex-wrap gap-2">
            {cfg.minutes.map((m) => (
              <button key={m} className={`chip ${minutes === m ? 'chip-on' : ''}`} onClick={() => setMinutes(minutes === m ? undefined : m)}>
                {m} min
              </button>
            ))}
          </div>
        </>
      )}
      <label className="label mb-2 mt-6 block" htmlFor="log-note">
        A note for yourself
      </label>
      <textarea id="log-note" className="field min-h-[96px] resize-y" placeholder={cfg.notePlaceholder} value={note} onChange={(e) => setNote(e.target.value)} />
      {cfg.tips && (
        <div className="mt-5 rounded-2xl bg-cream p-4">
          <p className="label mb-2">Ideas</p>
          <ul className="space-y-1 text-sm text-muted">
            {cfg.tips.map((t) => (
              <li key={t}>· {t}</li>
            ))}
          </ul>
        </div>
      )}
      <button className="btn-primary mt-6 w-full sm:w-auto" onClick={() => finish({ minutes, note: [chips.join(', '), note.trim()].filter(Boolean).join(' — ') })}>
        <Check size={16} /> I did this
      </button>
    </div>
  );
}

// ——— Gratitude ——————————————————————————————————————————————————

export function GratitudeActivity({ activity }: { activity: Activity }) {
  const finish = useFinish(activity);
  const [items, setItems] = useState(['', '', '']);
  const filled = items.filter((i) => i.trim()).length;
  const placeholders = ['Something that made you smile…', 'Someone you appreciate…', 'A small comfort today…'];
  return (
    <div className="card p-6">
      <p className="text-lg font-semibold text-deep">Today, I’m grateful for…</p>
      <p className="mt-1 text-sm text-muted">One is plenty. Small things count — a warm drink, a kind word, a quiet minute.</p>
      <div className="mt-5 space-y-3">
        {items.map((v, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${v.trim() ? 'bg-peach text-white' : 'bg-cream text-muted'}`}>{i + 1}</span>
            <input
              className="field"
              value={v}
              placeholder={placeholders[i]}
              onChange={(e) => setItems(items.map((x, k) => (k === i ? e.target.value : x)))}
              aria-label={`Gratitude ${i + 1}`}
            />
          </div>
        ))}
      </div>
      <button className="btn-primary mt-6 w-full sm:w-auto" disabled={!filled} onClick={() => finish({ note: items.filter((i) => i.trim()).join(' · ') })}>
        <Check size={16} /> Save my gratitude
      </button>
    </div>
  );
}

// ——— Intentions ——————————————————————————————————————————————————

export function IntentionsActivity({ activity }: { activity: Activity }) {
  const finish = useFinish(activity);
  const [picked, setPicked] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [ideas, setIdeas] = useState(INTENTION_IDEAS);
  const toggle = (c: string) => setPicked((s) => (s.includes(c) ? s.filter((x) => x !== c) : s.length < 3 ? [...s, c] : s));
  const add = () => {
    const v = custom.trim();
    if (!v) return;
    if (!ideas.includes(v)) setIdeas([v, ...ideas]);
    if (!picked.includes(v) && picked.length < 3) setPicked([...picked, v]);
    setCustom('');
  };
  return (
    <div className="card p-6">
      <p className="text-lg font-semibold text-deep">What would you like to carry with you today?</p>
      <p className="mt-1 text-sm text-muted">Choose up to three. Intentions are a direction, not a to-do list.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {ideas.map((c) => (
          <button key={c} className={`chip ${picked.includes(c) ? 'chip-on' : ''}`} onClick={() => toggle(c)} aria-pressed={picked.includes(c)}>
            {picked.includes(c) && <Check size={14} />} {c}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          className="field"
          placeholder="Write your own…"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          aria-label="Your own intention"
        />
        <button className="btn-soft shrink-0 !px-4" onClick={add} aria-label="Add intention">
          <Plus size={18} />
        </button>
      </div>
      {picked.length > 0 && (
        <div className="mt-5 rounded-2xl bg-mint/50 p-4">
          <p className="label mb-2 !text-forest">Today I intend to</p>
          <ul className="space-y-1 font-display text-lg text-deep">
            {picked.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      <button className="btn-primary mt-6 w-full sm:w-auto" disabled={!picked.length} onClick={() => finish({ note: picked.join(' · ') })}>
        <Check size={16} /> Set my intentions
      </button>
    </div>
  );
}

// ——— Creative doodle ——————————————————————————————————————————————

const INKS = [
  { c: '#35543D', h: 135 },
  { c: '#83B85D', h: 95 },
  { c: '#EBA77F', h: 22 },
  { c: '#E59AB8', h: 335 },
  { c: '#8E9EE0', h: 228 },
  { c: '#F2C66D', h: 42 },
  { c: '#6FB7C9', h: 192 },
];

export function CreativeActivity({ activity }: { activity: Activity }) {
  const finish = useFinish(activity);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ink, setInk] = useState(INKS[2]);
  const [width, setWidth] = useState(6);
  const [strokes, setStrokes] = useState(0);
  const usage = useRef<Record<number, number>>({});
  const history = useRef<ImageData[]>([]);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const cv = canvasRef.current!;
    const resize = () => {
      const r = cv.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const prev = cv.width ? cv.getContext('2d')!.getImageData(0, 0, cv.width, cv.height) : null;
      cv.width = r.width * dpr;
      cv.height = r.height * dpr;
      const ctx = cv.getContext('2d')!;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, cv.width, cv.height);
      if (prev) ctx.putImageData(prev, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
  };
  const down = (e: React.PointerEvent) => {
    const cv = canvasRef.current!;
    cv.setPointerCapture(e.pointerId);
    const ctx = cv.getContext('2d')!;
    history.current.push(ctx.getImageData(0, 0, cv.width, cv.height));
    if (history.current.length > 20) history.current.shift();
    drawing.current = true;
    last.current = pos(e);
    move(e);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    const dpr = window.devicePixelRatio || 1;
    ctx.strokeStyle = ink.c;
    ctx.lineWidth = width * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
    usage.current[ink.h] = (usage.current[ink.h] ?? 0) + Math.hypot(p.x - last.current.x, p.y - last.current.y) + 1;
    last.current = p;
  };
  const up = () => {
    if (drawing.current) setStrokes((s) => s + 1);
    drawing.current = false;
    last.current = null;
  };
  const undo = () => {
    const prev = history.current.pop();
    if (prev) canvasRef.current!.getContext('2d')!.putImageData(prev, 0, 0);
    setStrokes((s) => Math.max(0, s - 1));
  };
  const clear = () => {
    const cv = canvasRef.current!;
    const ctx = cv.getContext('2d')!;
    history.current.push(ctx.getImageData(0, 0, cv.width, cv.height));
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, cv.width, cv.height);
    usage.current = {};
    setStrokes(0);
  };
  const download = () => {
    const a = document.createElement('a');
    a.download = `bloom-doodle-${new Date().toISOString().slice(0, 10)}.png`;
    a.href = canvasRef.current!.toDataURL('image/png');
    a.click();
  };
  const dominantHue = useMemo(
    () => () => {
      const entries = Object.entries(usage.current);
      if (!entries.length) return undefined;
      return Number(entries.sort((a, b) => b[1] - a[1])[0][0]);
    },
    [],
  );

  return (
    <div className="card p-4 sm:p-6">
      <p className="mb-3 text-sm text-muted">Doodle anything — shapes, a feeling, a pattern. The colour you use most will tint your flower.</p>
      <canvas
        ref={canvasRef}
        className="h-[340px] w-full touch-none rounded-2xl border border-line bg-white sm:h-[400px]"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        aria-label="Drawing canvas"
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {INKS.map((k) => (
          <button
            key={k.c}
            onClick={() => setInk(k)}
            aria-label={`Colour ${k.c}`}
            className={`h-9 w-9 rounded-full ring-offset-2 transition ${ink.c === k.c ? 'ring-2 ring-deep' : 'ring-0'}`}
            style={{ background: k.c }}
          />
        ))}
        <span className="mx-1 h-6 w-px bg-line" />
        {[3, 6, 12].map((w) => (
          <button key={w} onClick={() => setWidth(w)} aria-label={`Brush ${w}`} className={`flex h-9 w-9 items-center justify-center rounded-full ${width === w ? 'bg-mint' : 'bg-cream'}`}>
            <span className="rounded-full bg-deep" style={{ width: w + 2, height: w + 2 }} />
          </button>
        ))}
        <span className="ml-auto flex gap-1">
          <button className="btn-ghost !p-2.5" onClick={undo} aria-label="Undo">
            <Undo2 size={18} />
          </button>
          <button className="btn-ghost !p-2.5" onClick={clear} aria-label="Clear">
            <Eraser size={18} />
          </button>
          <button className="btn-ghost !p-2.5" onClick={download} aria-label="Download drawing">
            <Download size={18} />
          </button>
        </span>
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button className="btn-primary" disabled={strokes === 0} onClick={() => finish({ minutes: 5, hue: dominantHue() })}>
          <Check size={16} /> I made something
        </button>
        <button className="btn-ghost" onClick={clear}>
          <RotateCcw size={16} /> Start over
        </button>
      </div>
      <p className="mt-3 text-xs text-muted">Doodles aren’t stored — download yours if you’d like to keep it.</p>
    </div>
  );
}
