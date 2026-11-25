import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Maximize2 } from 'lucide-react';
import { dismissCelebration, useCelebration } from '../../state/ui';
import { getActivity } from '../../data/activities';
import { PLANTS, plantSpecies, STAGE_LABELS } from '../../data/plants';
import { PlantPreview } from '../Garden/PlantPreview';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function PlantingCelebration() {
  const c = useCelebration();
  const nav = useNavigate();
  const reduced = useReducedMotion();
  const activity = c ? getActivity(c.activityId) : undefined;
  const info = c ? PLANTS[c.result.plant.kind] : undefined;

  const go = (path: string) => {
    dismissCelebration();
    nav(path);
  };

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: reduced ? 0 : delay, duration: 0.5 },
  });

  return (
    <AnimatePresence>
      {c && activity && info && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-cream/80 backdrop-blur-md" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="celebrate-title"
            className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white text-center shadow-[var(--shadow-lift)]"
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          >
            <div className="garden-backdrop relative h-[240px] bg-[#F3F6EE]">
              <PlantPreview plant={c.result.plant} reduced={reduced} />
            </div>
            <div className="px-7 pb-7 pt-5">
              <motion.p {...fade(0.2)} className="label text-forest">
                {activity.title} · complete
              </motion.p>
              <motion.h2 {...fade(0.35)} id="celebrate-title" className="mt-2 text-[26px] font-medium leading-snug text-deep">
                {c.headline ?? activity.completionLine}
              </motion.h2>
              <motion.p {...fade(0.9)} className="mt-3 text-[15px] text-muted">
                You’ve planted <strong className="font-semibold text-deep">{info.label}</strong> in your garden
                {c.result.plant.kind === 'tree' ? ` — a ${plantSpecies(c.result.plant).toLowerCase()}.` : '.'}
              </motion.p>

              <div className="mt-4 space-y-2 text-left">
                {c.result.grown && (
                  <motion.div {...fade(1.2)} className="flex items-start gap-3 rounded-2xl bg-mint/60 px-4 py-3 text-sm text-deep">
                    <TrendingUp size={18} className="mt-0.5 shrink-0" />
                    <span>
                      Coming back to this helped an earlier {plantSpecies(c.result.grown).toLowerCase()} grow — it’s now{' '}
                      <strong>{STAGE_LABELS[c.result.grown.stage].toLowerCase()}</strong>.
                    </span>
                  </motion.div>
                )}
                {c.result.expanded && (
                  <motion.div {...fade(1.3)} className="flex items-start gap-3 rounded-2xl bg-[#E4EEF2] px-4 py-3 text-sm text-deep">
                    <Maximize2 size={18} className="mt-0.5 shrink-0" />
                    <span>Your garden grew a little wider to make room.</span>
                  </motion.div>
                )}
                {c.suggestion && (
                  <motion.button
                    {...fade(1.4)}
                    onClick={() => go(`/focus/${c.suggestion!.activityId}`)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-line px-4 py-3 text-left text-sm text-deep transition hover:border-sage"
                  >
                    <Sparkles size={18} className="mt-0.5 shrink-0 text-peach" />
                    <span className="flex-1">{c.suggestion.text}</span>
                    <ArrowRight size={16} className="mt-0.5 shrink-0 text-muted" />
                  </motion.button>
                )}
              </div>

              <motion.div {...fade(1.1)} className="mt-6 flex flex-col gap-2">
                <button className="btn-primary w-full" onClick={() => go('/')} autoFocus>
                  See it in my garden
                </button>
                <button className="btn-ghost w-full" onClick={() => go(c.returnTo?.path ?? '/focus')}>
                  {c.returnTo?.label ?? 'Back to activities'}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
