import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Heart, Lock, Sprout } from 'lucide-react';
import { Avatar, Logo } from '../components/ui';
import { AVATARS } from '../data/content';
import { completeOnboarding } from '../state/store';
import { PlantPreview } from '../components/Garden/PlantPreview';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { Plant } from '../types';

const SHOWCASE: Plant = {
  id: 'showcase-cherry',
  kind: 'tree',
  variant: 1,
  x: 0,
  z: 0,
  stage: 3,
  nurtures: 2,
  plantedAt: new Date().toISOString(),
  activityId: 'journal',
  logId: '',
};

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('leaf');
  const reduced = useReducedMotion();

  return (
    <div className="garden-backdrop flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-2 flex justify-center">
          <Logo size={34} />
        </div>
        <div className="mx-auto h-[250px] w-full">
          <PlantPreview plant={SHOWCASE} reduced={reduced} />
        </div>
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div key="s0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="text-center">
              <h1 className="text-[34px] font-medium leading-tight text-deep">Grow at your own pace.</h1>
              <p className="mx-auto mt-3 max-w-sm text-[16px] leading-relaxed text-muted">
                Every time you take care of yourself, something grows. Journal, breathe, rest or call a friend — and watch your garden quietly come to life.
              </p>
              <ul className="mx-auto mt-6 max-w-sm space-y-2.5 text-left text-sm">
                {[
                  { icon: Sprout, t: 'Plants never wilt. Nothing is ever taken away.' },
                  { icon: Heart, t: 'No streaks, scores or pressure — just small moments of care.' },
                  { icon: Lock, t: 'Private by design. Everything stays on this device.' },
                ].map(({ icon: Icon, t }) => (
                  <li key={t} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-deep shadow-[var(--shadow-soft)]">
                    <Icon size={18} className="shrink-0 text-forest" /> {t}
                  </li>
                ))}
              </ul>
              <button className="btn-primary mt-8 w-full" onClick={() => setStep(1)}>
                Begin <ArrowRight size={18} />
              </button>
            </motion.div>
          ) : (
            <motion.div key="s1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
              <h1 className="text-[30px] font-medium leading-tight text-deep">What should we call you?</h1>
              <p className="mt-2 text-sm text-muted">Just a first name or nickname. You can change it any time.</p>
              <input
                className="field mt-6 text-center text-lg"
                placeholder="Your name"
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && completeOnboarding(name, avatar)}
                autoFocus
                aria-label="Your name"
              />
              <p className="label mb-3 mt-6">Pick an avatar</p>
              <div className="flex justify-center gap-2.5">
                {AVATARS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAvatar(a.id)}
                    aria-label={`Avatar ${a.id}`}
                    aria-pressed={avatar === a.id}
                    className={`rounded-full transition ${avatar === a.id ? 'ring-2 ring-forest ring-offset-2' : 'opacity-75 hover:opacity-100'}`}
                  >
                    <Avatar id={a.id} size={42} />
                  </button>
                ))}
              </div>
              <button className="btn-primary mt-8 w-full" onClick={() => completeOnboarding(name, avatar)}>
                <Sprout size={18} /> Plant my first seed
              </button>
              <button className="btn-ghost mt-2 w-full text-sm" onClick={() => setStep(0)}>
                Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
