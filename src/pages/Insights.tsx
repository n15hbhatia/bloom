import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Sprout, Leaf, NotebookPen, Smile, Sparkles } from 'lucide-react';
import { useBloom } from '../state/store';
import { EmptyState, PageHeader, Stat } from '../components/ui';
import { CATEGORIES, activityTitle } from '../data/activities';
import { EMOTIONS, INTENSITY_LABELS, emotionInfo } from '../data/content';
import { dateKey, daysAgo, formatShort, relativeDay, formatTime } from '../utils/dates';

type Range = 'week' | 'month';

export default function Insights() {
  const logs = useBloom((s) => s.logs);
  const plants = useBloom((s) => s.garden.plants);
  const journal = useBloom((s) => s.journal);
  const checkIns = useBloom((s) => s.checkIns);
  const [range, setRange] = useState<Range>('week');

  const days = range === 'week' ? 7 : 30;
  const monthSince = daysAgo(29).getTime();

  const series = useMemo(() => {
    const out = Array.from({ length: days }, (_, i) => {
      const d = daysAgo(days - 1 - i);
      return {
        key: dateKey(d),
        label: range === 'week' ? d.toLocaleDateString('en-GB', { weekday: 'short' }) : formatShort(d),
        count: 0,
      };
    });
    const idx = new Map(out.map((o, i) => [o.key, i]));
    logs.forEach((l) => {
      const i = idx.get(dateKey(l.completedAt));
      if (i !== undefined) out[i].count++;
    });
    return out;
  }, [logs, days, range]);

  const monthLogs = useMemo(() => logs.filter((l) => new Date(l.completedAt).getTime() >= monthSince), [logs, monthSince]);
  const rangeTotal = series.reduce((s, d) => s + d.count, 0);

  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({ ...c, count: monthLogs.filter((l) => l.category === c.id).length }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count),
    [monthLogs],
  );
  const topActivity = useMemo(() => {
    const m = new Map<string, number>();
    monthLogs.forEach((l) => m.set(l.activityId, (m.get(l.activityId) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1])[0];
  }, [monthLogs]);

  const monthCheckIns = useMemo(() => checkIns.filter((c) => new Date(c.createdAt).getTime() >= monthSince), [checkIns, monthSince]);
  const emotionCounts = useMemo(
    () =>
      EMOTIONS.map((e) => ({ ...e, count: monthCheckIns.filter((c) => c.emotion === e.id).length }))
        .filter((e) => e.count > 0)
        .sort((a, b) => b.count - a.count),
    [monthCheckIns],
  );

  // 5-week reflection calendar
  const calendar = useMemo(() => {
    const journalDays = new Set(journal.map((e) => e.date));
    const checkDays = new Set(checkIns.map((c) => dateKey(c.createdAt)));
    const start = daysAgo(34);
    // align to Monday
    const offset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - offset);
    return Array.from({ length: 35 + offset > 35 ? 42 : 35 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const k = dateKey(d);
      return { k, d, journal: journalDays.has(k), check: checkDays.has(k), future: d.getTime() > Date.now() };
    });
  }, [journal, checkIns]);

  const reflectionCount = monthLogs.filter((l) => l.category === 'reflection').length;
  const sentences: string[] = [];
  if (reflectionCount > 0) sentences.push(`You’ve made time for reflection ${reflectionCount === 1 ? 'once' : `${reflectionCount} times`} in the last 30 days.`);
  if (topActivity && topActivity[1] > 1) sentences.push(`${activityTitle(topActivity[0])} has been one of your most frequent activities lately.`);
  if (byCategory.length >= 3) sentences.push(`You’ve cared for yourself in ${byCategory.length} different ways this month — a lovely mix.`);
  if (emotionCounts.length >= 3) sentences.push('Your check-ins show a variety of emotional experiences this month. That’s completely human.');
  else if (emotionCounts.length > 0) sentences.push(`You’ve checked in with yourself ${monthCheckIns.length === 1 ? 'once' : `${monthCheckIns.length} times`} this month.`);

  if (logs.length === 0 && checkIns.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-5 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
        <PageHeader eyebrow="Insights" title="Your growth journey" subtitle="Patterns in how you care for yourself — never a score." />
        <EmptyState
          icon={<Sparkles size={26} />}
          title="Your story starts with a single moment"
          body="As you complete activities and check-ins, gentle patterns will appear here."
          action={
            <Link to="/focus" className="btn-soft">
              Take a moment
            </Link>
          }
        />
      </div>
    );
  }

  const maxCat = Math.max(1, ...byCategory.map((c) => c.count));
  const maxEmo = Math.max(1, ...emotionCounts.map((c) => c.count));

  return (
    <div className="mx-auto max-w-5xl px-5 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
      <PageHeader eyebrow="Insights" title="Your growth journey" subtitle="Patterns in how you care for yourself — to understand, never to judge." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat value={plants.length} label="Plants in your garden" icon={<Sprout size={20} />} />
        <Stat value={logs.length} label="Activities completed" icon={<Leaf size={20} />} />
        <Stat value={journal.length} label="Journal entries" icon={<NotebookPen size={20} />} />
        <Stat value={checkIns.length} label="Emotional check-ins" icon={<Smile size={20} />} />
      </div>

      {sentences.length > 0 && (
        <div className="card mt-4 space-y-2 bg-gradient-to-br from-white to-mint/40 p-6">
          {sentences.map((s) => (
            <p key={s} className="flex gap-3 font-display text-base leading-snug text-deep sm:text-lg">
              <Sparkles size={18} className="mt-1 shrink-0 text-peach" />
              {s}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-5 sm:p-6" aria-labelledby="pattern-title">
          <div className="mb-1 flex items-center justify-between gap-3">
            <h2 id="pattern-title" className="text-xl font-medium text-deep">
              Moments of care
            </h2>
            <div className="flex rounded-full bg-cream p-1 text-xs font-bold" role="tablist">
              {(['week', 'month'] as Range[]).map((r) => (
                <button
                  key={r}
                  role="tab"
                  aria-selected={range === r}
                  onClick={() => setRange(r)}
                  className={`rounded-full px-3 py-1.5 transition ${range === r ? 'bg-white text-deep shadow-sm' : 'text-muted'}`}
                >
                  {r === 'week' ? '7 days' : '30 days'}
                </button>
              ))}
            </div>
          </div>
          <p className="mb-4 text-sm text-muted">
            {rangeTotal} {rangeTotal === 1 ? 'activity' : 'activities'} in the last {days} days
          </p>
          <div className="h-56" role="img" aria-label={`Bar chart of activities per day over the last ${days} days`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#EEEEE6" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#6B776D' }}
                  interval={range === 'week' ? 0 : 6}
                />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6B776D' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(184,209,185,0.25)' }}
                  contentStyle={{ borderRadius: 14, border: '1px solid #E6E6DC', fontSize: 13, boxShadow: '0 8px 24px -8px rgba(38,51,42,.15)' }}
                  formatter={(v) => [`${v}`, 'Activities']}
                  labelFormatter={(_, p) => (p?.[0]?.payload ? relativeDay(p[0].payload.key) : '')}
                />
                <Bar dataKey="count" fill="#83B85D" radius={[4, 4, 0, 0]} maxBarSize={range === 'week' ? 34 : 14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="cat-title">
          <h2 id="cat-title" className="text-xl font-medium text-deep">
            Ways you’ve cared for yourself
          </h2>
          <p className="mb-4 text-sm text-muted">Last 30 days, by category</p>
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted">Nothing in the last 30 days — and that’s okay.</p>
          ) : (
            <ul className="space-y-3.5">
              {byCategory.map((c) => (
                <li key={c.id}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-semibold text-deep">{c.title}</span>
                    <span className="text-muted">{c.count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-cream">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(c.count / maxCat) * 100}%`, background: c.ink }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="card p-5 sm:p-6" aria-labelledby="feel-title">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="feel-title" className="text-xl font-medium text-deep">
                How you’ve been feeling
              </h2>
              <p className="mb-4 text-sm text-muted">Check-ins from the last 30 days</p>
            </div>
            <Link to="/focus/checkin" className="btn-soft shrink-0 !px-4 !py-2 text-sm">
              Check in
            </Link>
          </div>
          {emotionCounts.length === 0 ? (
            <p className="text-sm text-muted">No check-ins yet this month.</p>
          ) : (
            <ul className="space-y-3">
              {emotionCounts.map((e) => (
                <li key={e.id} className="flex items-center gap-3">
                  <span className="w-24 text-sm font-semibold text-deep">{e.label}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream">
                    <div className="h-full rounded-full" style={{ width: `${(e.count / maxEmo) * 100}%`, background: e.color }} />
                  </div>
                  <span className="w-6 text-right text-sm text-muted">{e.count}</span>
                </li>
              ))}
            </ul>
          )}
          {checkIns.length > 0 && (
            <>
              <p className="label mb-2 mt-6">Recent check-ins</p>
              <ul className="divide-y divide-line">
                {[...checkIns]
                  .reverse()
                  .slice(0, 5)
                  .map((c) => {
                    const info = emotionInfo(c.emotion);
                    return (
                      <li key={c.id} className="flex items-start gap-3 py-2.5">
                        <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: info.color }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-deep">
                            {info.label} <span className="font-normal text-muted">· {INTENSITY_LABELS[c.intensity - 1].toLowerCase()}</span>
                          </p>
                          {c.note && <p className="truncate text-sm text-muted">{c.note}</p>}
                        </div>
                        <span className="shrink-0 text-xs text-muted">
                          {relativeDay(c.createdAt)}, {formatTime(c.createdAt)}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </>
          )}
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="cal-title">
          <h2 id="cal-title" className="text-xl font-medium text-deep">
            Reflection calendar
          </h2>
          <p className="mb-4 text-sm text-muted">Days you journaled or checked in, over the last five weeks</p>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i} className="pb-1 text-[11px] font-bold text-muted">
                {d}
              </span>
            ))}
            {calendar.map((c) => (
              <span
                key={c.k}
                title={`${formatShort(c.d)}${c.journal ? ' · journal' : ''}${c.check ? ' · check-in' : ''}`}
                className={`relative flex aspect-square items-center justify-center rounded-xl text-[11px] font-semibold ${
                  c.future ? 'text-transparent' : c.journal && c.check ? 'bg-forest text-white' : c.journal ? 'bg-leaf text-white' : c.check ? 'bg-sky text-deep' : 'bg-cream text-muted/70'
                } ${c.k === dateKey() ? 'ring-2 ring-deep ring-offset-1' : ''}`}
              >
                {c.d.getDate()}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-leaf" /> Journal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-sky" /> Check-in
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-forest" /> Both
            </span>
          </div>
          <p className="mt-4 text-xs text-muted">Gaps are part of every rhythm. Nothing here is a streak to keep.</p>
        </section>
      </div>
    </div>
  );
}
