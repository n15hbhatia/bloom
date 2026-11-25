import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { ACTIVITIES, CATEGORIES, type Activity } from '../data/activities';
import { PLANTS } from '../data/plants';
import { useBloom } from '../state/store';
import { PageHeader } from '../components/ui';
import { activityIcon } from '../components/Activity/icons';
import type { CategoryId } from '../types';
import { dateKey } from '../utils/dates';

export default function Focus() {
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');
  const logs = useBloom((s) => s.logs);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    logs.forEach((l) => m.set(l.activityId, (m.get(l.activityId) ?? 0) + 1));
    return m;
  }, [logs]);
  const doneToday = useMemo(() => new Set(logs.filter((l) => dateKey(l.completedAt) === dateKey()).map((l) => l.activityId)), [logs]);

  const cats = filter === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c.id === filter);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
      <PageHeader
        eyebrow="Focus"
        title="Take a moment"
        subtitle="Small, gentle things you can do for yourself. Pick whatever feels right — there’s no wrong choice, and nothing to keep up with."
      />

      <div className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter by category">
        <button role="tab" aria-selected={filter === 'all'} className={`chip shrink-0 ${filter === 'all' ? 'chip-on' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} role="tab" aria-selected={filter === c.id} className={`chip shrink-0 ${filter === c.id ? 'chip-on' : ''}`} onClick={() => setFilter(c.id)}>
            <span className="h-2 w-2 rounded-full" style={{ background: c.ink }} />
            {c.title}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        {cats.map((cat) => (
          <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
            <div className="mb-3 flex items-baseline gap-3">
              <h2 id={`cat-${cat.id}`} className="text-2xl font-medium text-deep">
                {cat.title}
              </h2>
              <p className="text-sm text-muted">{cat.blurb}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ACTIVITIES.filter((a) => a.category === cat.id).map((a, i) => (
                <ActivityCard key={a.id} activity={a} index={i} count={counts.get(a.id) ?? 0} today={doneToday.has(a.id)} tint={cat.tint} ink={cat.ink} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ activity, index, count, today, tint, ink }: { activity: Activity; index: number; count: number; today: boolean; tint: string; ink: string }) {
  const nav = useNavigate();
  const Icon = activityIcon(activity.id);
  const go = () => nav(activity.id === 'journal' ? '/journal/new' : `/focus/${activity.id}`);
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      className="card group flex cursor-pointer flex-col p-5 transition-shadow hover:shadow-[var(--shadow-lift)]"
      onClick={go}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: tint, color: ink }}>
          <Icon size={22} strokeWidth={1.9} />
        </span>
        {today && <span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-forest">Done today</span>}
      </div>
      <h3 className="mt-4 font-sans text-[17px] font-bold text-deep">{activity.title}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{activity.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted">
        {activity.minutes && (
          <span className="inline-flex items-center gap-1">
            <Clock size={13} /> ~{activity.minutes} min
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ background: PLANTS[activity.reward].swatch }} />
          Grows {PLANTS[activity.reward].label}
        </span>
        {count > 0 && <span>· {count}× so far</span>}
      </div>
      <button
        className="btn-soft mt-4 w-full !py-2.5 text-sm group-hover:bg-[#cde2cb]"
        onClick={(e) => {
          e.stopPropagation();
          go();
        }}
        aria-label={`Begin ${activity.title}`}
      >
        Begin <ArrowRight size={15} />
      </button>
    </motion.article>
  );
}
