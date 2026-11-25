import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Leaf, Plus, Maximize2, ChevronRight } from 'lucide-react';
import { useBloom, expandGarden } from '../state/store';
import { GardenView } from '../components/Garden/GardenView';
import { Avatar, Logo, Stat } from '../components/ui';
import { greeting, relativeDay, daysAgo } from '../utils/dates';
import { PLANTS, plantSpecies } from '../data/plants';
import { activityTitle } from '../data/activities';
import { ENCOURAGEMENTS, GROWTH_LINES } from '../data/content';
import { capacity, MAX_SIZE } from '../utils/garden';

export default function Home() {
  const profile = useBloom((s) => s.profile);
  const garden = useBloom((s) => s.garden);
  const logs = useBloom((s) => s.logs);
  const prefs = useBloom((s) => s.preferences);
  const nav = useNavigate();
  const location = useLocation();
  const [selectedId, setSelectedId] = useState<string | null>((location.state as { plantId?: string } | null)?.plantId ?? null);

  const weekCount = useMemo(() => {
    const since = daysAgo(6).getTime();
    return logs.filter((l) => new Date(l.completedAt).getTime() >= since).length;
  }, [logs]);
  const todayCount = useMemo(() => logs.filter((l) => relativeDay(l.completedAt) === 'Today').length, [logs]);

  const recent = useMemo(() => [...garden.plants].sort((a, b) => b.plantedAt.localeCompare(a.plantedAt)).slice(0, 4), [garden.plants]);
  const encouragement = useMemo(() => ENCOURAGEMENTS[new Date().getDate() % ENCOURAGEMENTS.length], []);
  const headline = garden.plants.length > 1 ? GROWTH_LINES[garden.plants.length % GROWTH_LINES.length] : 'Your garden has begun.';
  const cap = capacity(garden.size);
  const nearlyFull = garden.plants.length / cap > 0.8 && garden.size < MAX_SIZE;

  const summary =
    todayCount > 0
      ? `You’ve made time for yourself ${todayCount === 1 ? 'once' : `${todayCount} times`} today.`
      : weekCount > 0
        ? `${weekCount} moment${weekCount === 1 ? '' : 's'} of self-care this week.`
        : 'Whenever you’re ready, your garden is here.';

  return (
    <div className="lg:grid lg:h-dvh lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* ——— Garden column ——— */}
      <section className="relative flex flex-col lg:h-dvh">
        <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-5 sm:px-8 lg:pt-7">
          <div className="min-w-0">
            <div className="mb-3 lg:hidden">
              <Logo size={26} />
            </div>
            <h1 className="truncate text-[26px] font-medium leading-tight text-deep sm:text-[32px]">
              {greeting()}
              {profile.name ? `, ${profile.name}` : ''}
            </h1>
            <p className="mt-0.5 text-sm text-muted">{summary}</p>
          </div>
          <Link to="/profile" aria-label="Your profile" className="shrink-0 transition hover:scale-105">
            <Avatar id={profile.avatar} size={44} />
          </Link>
        </header>

        <GardenView
          className="mx-2 h-[clamp(340px,100vw,58dvh)] rounded-[28px] sm:mx-6 lg:mx-6 lg:mb-6 lg:h-auto lg:min-h-0 lg:flex-1"
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </section>

      {/* ——— Summary column ——— */}
      <aside className="space-y-4 px-5 pb-28 pt-5 sm:px-8 lg:overflow-y-auto lg:border-l lg:border-line/70 lg:px-6 lg:pb-8 lg:pt-7">
        <div>
          <h2 className="text-2xl font-medium text-deep">{headline}</h2>
          {prefs.encouragement && <p className="mt-1 text-[15px] text-muted">{encouragement}</p>}
        </div>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => nav('/focus')}
          className="group flex w-full items-center gap-4 rounded-[26px] bg-deep px-5 py-4 text-left text-cream shadow-[0_14px_30px_-14px_rgba(53,84,61,0.8)]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Plus size={22} />
          </span>
          <span className="flex-1">
            <span className="block font-display text-xl font-medium">Take a moment</span>
            <span className="block text-sm text-cream/70">Something small, just for you</span>
          </span>
          <ChevronRight className="opacity-60 transition group-hover:translate-x-0.5" />
        </motion.button>

        <div className="grid grid-cols-2 gap-3">
          <Stat value={garden.plants.length} label="Plants growing" icon={<Sprout size={20} />} />
          <Stat value={logs.length} label="Moments of care" icon={<Leaf size={20} />} />
        </div>

        {nearlyFull && (
          <div className="card flex items-center gap-3 p-4">
            <Maximize2 size={20} className="shrink-0 text-forest" />
            <p className="flex-1 text-sm text-muted">Your garden is filling up. Want a little more room?</p>
            <button className="btn-soft !px-4 !py-2 text-sm" onClick={expandGarden}>
              Expand
            </button>
          </div>
        )}

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-medium text-deep">Recent additions</h3>
            <span className="text-xs font-medium text-muted">
              {garden.size}×{garden.size} garden
            </span>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Nothing yet — your first activity will plant something here.</p>
          ) : (
            <ul className="space-y-1">
              {recent.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setSelectedId(p.id)}
                    className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-cream"
                  >
                    <span
                      className="h-9 w-9 shrink-0 rounded-xl ring-1 ring-black/5"
                      style={{ background: p.hue !== undefined ? `hsl(${p.hue} 62% 80%)` : PLANTS[p.kind].swatch }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-deep">{p.name ?? plantSpecies(p)}</span>
                      <span className="block truncate text-xs text-muted">{activityTitle(p.activityId)}</span>
                    </span>
                    <span className="text-xs text-muted">{relativeDay(p.plantedAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="px-1 text-xs leading-relaxed text-muted/80">
          Your garden is saved in this browser only — it isn’t backed up to the cloud and won’t sync between devices. You can export a copy from your profile.
        </p>
      </aside>
    </div>
  );
}
