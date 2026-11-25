import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Minus, Plus, RotateCcw, Hand } from 'lucide-react';
import { useBloom, clearLastPlanted } from '../../state/store';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { PlantInfoPanel } from './PlantInfoPanel';
import type { GardenHandle } from './GardenScene';

const GardenScene = lazy(() => import('./GardenScene').then((m) => ({ default: m.GardenScene })));

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function GardenView({ className = '', selectedId, onSelect }: { className?: string; selectedId: string | null; onSelect: (id: string | null) => void }) {
  const garden = useBloom((s) => s.garden);
  const lastPlantedId = useBloom((s) => s.lastPlantedId);
  const reduced = useReducedMotion();
  const handle = useRef<GardenHandle>(null);
  const [webgl] = useState(supportsWebGL);
  const [newId] = useState(lastPlantedId);
  const selected = garden.plants.find((p) => p.id === selectedId) ?? null;

  // The newest plant animates in once, then settles.
  useEffect(() => {
    if (!lastPlantedId) return;
    const t = window.setTimeout(clearLastPlanted, 2600);
    return () => window.clearTimeout(t);
  }, [lastPlantedId]);

  return (
    <div className={`garden-backdrop relative overflow-hidden ${className}`}>
      {webgl ? (
        <Suspense fallback={<GardenLoading />}>
          <GardenScene
            ref={handle}
            size={garden.size}
            plants={garden.plants}
            newId={newId ?? lastPlantedId}
            selectedId={selectedId}
            reduced={reduced}
            onSelect={onSelect}
          />
        </Suspense>
      ) : (
        <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted">
          Your browser can’t display 3D graphics right now, but your garden is safe — you have {garden.plants.length} plants growing.
        </div>
      )}

      {webgl && (
        <>
          <div className="pointer-events-none absolute left-4 top-4 hidden items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur sm:flex">
            <Hand size={13} /> Drag to look around · Tap a plant
          </div>
          <div className="absolute right-3 top-3 flex flex-col gap-1.5">
            {[
              { icon: Plus, label: 'Zoom in', fn: () => handle.current?.zoomBy(1.2) },
              { icon: Minus, label: 'Zoom out', fn: () => handle.current?.zoomBy(1 / 1.2) },
              { icon: RotateCcw, label: 'Reset view', fn: () => handle.current?.reset() },
            ].map(({ icon: Icon, label, fn }) => (
              <button
                key={label}
                onClick={fn}
                aria-label={label}
                title={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-deep shadow-[var(--shadow-soft)] backdrop-blur transition hover:bg-white active:scale-95"
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center sm:justify-start">
        <div className="pointer-events-auto w-full max-w-sm">
          <AnimatePresence mode="wait">{selected && <PlantInfoPanel key={selected.id} plant={selected} onClose={() => onSelect(null)} />}</AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function GardenLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 animate-pulse rounded-2xl bg-mint" aria-label="Loading your garden" />
    </div>
  );
}
