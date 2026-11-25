import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, TreeDeciduous, NotebookPen, Lock } from 'lucide-react';
import { useBloom } from '../state/store';
import { EmptyState, PageHeader } from '../components/ui';
import { JOURNAL_PROMPTS } from '../data/content';
import { formatLong, parseDateKey } from '../utils/dates';

export default function Journal() {
  const entries = useBloom((s) => s.journal);
  const nav = useNavigate();
  const [q, setQ] = useState('');

  const groups = useMemo(() => {
    const filtered = entries
      .filter((e) => !q.trim() || `${e.title} ${e.body}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    const out: { month: string; items: typeof filtered }[] = [];
    filtered.forEach((e) => {
      const month = parseDateKey(e.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      const g = out.find((x) => x.month === month);
      if (g) g.items.push(e);
      else out.push({ month, items: [e] });
    });
    return out;
  }, [entries, q]);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
      <PageHeader
        eyebrow="Journal"
        title="Your reflections"
        subtitle="A private place to think out loud. Each new entry plants a tree."
        right={
          <button className="btn-primary hidden shrink-0 sm:inline-flex" onClick={() => nav('/journal/new')}>
            <Plus size={18} /> New entry
          </button>
        }
      />

      <button className="btn-primary mb-6 w-full sm:hidden" onClick={() => nav('/journal/new')}>
        <Plus size={18} /> New entry
      </button>

      <section aria-labelledby="prompts" className="mb-8">
        <h2 id="prompts" className="label mb-3">
          Need a starting point?
        </h2>
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
          {JOURNAL_PROMPTS.map((p, i) => (
            <motion.button
              key={p}
              whileHover={{ y: -2 }}
              onClick={() => nav(`/journal/new?prompt=${i}`)}
              className="card w-[220px] shrink-0 p-4 text-left font-display text-[17px] leading-snug text-deep sm:w-auto"
            >
              {p}
            </motion.button>
          ))}
        </div>
      </section>

      {entries.length > 0 && (
        <div className="relative mb-6">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input className="field !pl-11" placeholder="Search your entries" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search entries" />
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState
          icon={<NotebookPen size={26} />}
          title="No entries yet"
          body="Whenever you feel like writing — a sentence or a page — it’ll live here, privately."
          action={
            <button className="btn-soft" onClick={() => nav('/journal/new')}>
              Write your first entry
            </button>
          }
        />
      ) : groups.length === 0 ? (
        <p className="text-center text-sm text-muted">No entries match “{q}”.</p>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.month}>
              <h3 className="label mb-3">{g.month}</h3>
              <ul className="space-y-3">
                {g.items.map((e) => (
                  <li key={e.id}>
                    <Link to={`/journal/${e.id}`} className="card block p-5 transition hover:shadow-[var(--shadow-lift)]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-muted">{formatLong(e.date)}</p>
                        {e.plantId && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest">
                            <TreeDeciduous size={14} /> Tree planted
                          </span>
                        )}
                      </div>
                      <h4 className="mt-1.5 text-xl font-medium text-deep">{e.title || 'Untitled reflection'}</h4>
                      {e.prompt && <p className="mt-1 text-xs italic text-muted">{e.prompt}</p>}
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{e.body}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-10 flex items-center justify-center gap-1.5 text-xs text-muted">
        <Lock size={12} /> Entries are stored only on this device.
      </p>
    </div>
  );
}
