import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, X, CalendarDays, Leaf, Heart } from 'lucide-react';
import type { Plant } from '../../types';
import { PLANTS, plantSpecies, plantTitle, STAGE_LABELS, NURTURES_FOR_STAGE } from '../../data/plants';
import { activityTitle, getActivity, WELCOME_ACTIVITY_ID } from '../../data/activities';
import { useBloom } from '../../state/store';
import { formatLong } from '../../utils/dates';

export function PlantInfoPanel({ plant, onClose }: { plant: Plant; onClose: () => void }) {
  const info = PLANTS[plant.kind];
  const entry = useBloom((s) => (plant.journalEntryId ? s.journal.find((e) => e.id === plant.journalEntryId) : undefined));
  const log = useBloom((s) => s.logs.find((l) => l.id === plant.logId));
  const welcome = plant.activityId === WELCOME_ACTIVITY_ID;
  const activity = getActivity(plant.activityId);
  const toNext = plant.stage < 3 ? NURTURES_FOR_STAGE[(plant.stage + 1) as 2 | 3] - plant.nurtures : 0;

  return (
    <motion.div
      key={plant.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className="card relative w-full max-w-sm p-5"
      role="region"
      aria-label="Plant details"
    >
      <button onClick={onClose} className="absolute right-3 top-3 rounded-full p-1.5 text-muted hover:bg-black/5" aria-label="Close plant details">
        <X size={16} />
      </button>
      <div className="flex items-center gap-3 pr-6">
        <span className="h-10 w-10 shrink-0 rounded-2xl ring-1 ring-black/5" style={{ background: plant.hue !== undefined ? `hsl(${plant.hue} 62% 80%)` : info.swatch }} />
        <div className="min-w-0">
          <p className="label !text-[10px] text-forest">Your {welcome ? 'first seed' : plantTitle(plant)}</p>
          <h3 className="truncate text-xl font-medium text-deep">{welcome ? 'First Sapling' : plantSpecies(plant)}</h3>
        </div>
      </div>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex gap-2.5">
          <CalendarDays size={16} className="mt-0.5 shrink-0 text-muted" />
          <dt className="text-muted">Planted</dt>
          <dd className="ml-auto font-semibold text-deep">{formatLong(plant.plantedAt)}</dd>
        </div>
        <div className="flex gap-2.5">
          <Leaf size={16} className="mt-0.5 shrink-0 text-muted" />
          <dt className="text-muted">Created through</dt>
          <dd className="ml-auto text-right font-semibold text-deep">{welcome ? 'Starting BLOOM' : (activity?.title ?? info.createdThrough)}</dd>
        </div>
        <div className="flex gap-2.5">
          <Heart size={16} className="mt-0.5 shrink-0 text-muted" />
          <dt className="text-muted">Associated with</dt>
          <dd className="ml-auto max-w-[55%] text-right font-semibold text-deep">{welcome ? 'Taking the first step.' : info.associatedWith}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-2xl bg-cream px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-deep">{STAGE_LABELS[plant.stage]}</span>
          <span className="flex gap-1" aria-label={`Growth stage ${plant.stage} of 3`}>
            {[1, 2, 3].map((s) => (
              <span key={s} className={`h-2 w-6 rounded-full ${s <= plant.stage ? 'bg-leaf' : 'bg-line'}`} />
            ))}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          {plant.stage === 3
            ? 'Fully grown. It will stay this way, always.'
            : welcome
              ? 'This little one is simply here to welcome you.'
              : `Grows each time you return to ${activityTitle(plant.activityId).toLowerCase()}${toNext > 1 ? ` (${toNext} more visits)` : ''}. No rush, ever.`}
        </p>
      </div>

      {log?.note && <p className="mt-3 rounded-2xl border border-line px-4 py-3 text-sm italic text-muted">“{log.note}”</p>}

      {entry && (
        <Link to={`/journal/${entry.id}`} className="btn-soft mt-3 w-full !py-2.5 text-sm">
          <BookOpen size={16} /> Revisit “{entry.title || formatLong(entry.date)}”
        </Link>
      )}
      {plant.journalEntryId === undefined && plant.kind === 'tree' && (
        <p className="mt-3 text-xs text-muted">The entry behind this tree was deleted, but the tree stays — the care still happened.</p>
      )}
    </motion.div>
  );
}
