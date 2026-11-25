import { useMemo, useRef, useState } from 'react';
import { Bell, Download, Upload, Trash2, Shield, Pencil, Check, Sparkles, HardDrive } from 'lucide-react';
import { useBloom, updateProfile, updatePreferences, resetAll, exportData, importData, seedDemo, isStorageAvailable } from '../state/store';
import { Avatar, ConfirmDialog, PageHeader, Toggle } from '../components/ui';
import { AVATARS } from '../data/content';
import { PLANTS } from '../data/plants';
import { activityTitle, getActivity } from '../data/activities';
import { activityIcon } from '../components/Activity/icons';
import { formatLong, relativeDay, formatTime } from '../utils/dates';
import type { PlantKind } from '../types';

export default function Profile() {
  const profile = useBloom((s) => s.profile);
  const prefs = useBloom((s) => s.preferences);
  const garden = useBloom((s) => s.garden);
  const logs = useBloom((s) => s.logs);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDemo, setConfirmDemo] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const byKind = useMemo(() => {
    const m = new Map<PlantKind, number>();
    garden.plants.forEach((p) => m.set(p.kind, (m.get(p.kind) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [garden.plants]);
  const mature = garden.plants.filter((p) => p.stage === 3).length;
  const history = useMemo(() => [...logs].reverse(), [logs]);

  const flash = (m: string) => {
    setMessage(m);
    window.setTimeout(() => setMessage(null), 3500);
  };

  const saveName = () => {
    updateProfile({ name: name.trim() });
    setEditing(false);
  };

  const doExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bloom-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    flash('Backup downloaded.');
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    flash(importData(text) ? 'Your garden has been restored.' : 'That file doesn’t look like a BLOOM backup.');
  };

  const toggleReminders = async (on: boolean) => {
    if (on && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      const res = await Notification.requestPermission();
      if (res !== 'granted') {
        flash('Notifications are blocked in your browser settings.');
        return;
      }
    }
    updatePreferences({ reminders: on });
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
      <PageHeader eyebrow="Profile" title="You" />

      {message && (
        <div role="status" className="mb-4 rounded-2xl bg-mint px-4 py-3 text-sm font-semibold text-deep">
          {message}
        </div>
      )}

      {/* Identity */}
      <section className="card p-6">
        <div className="flex items-center gap-4">
          <Avatar id={profile.avatar} size={64} />
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex gap-2">
                <input
                  className="field !py-2"
                  value={name}
                  maxLength={40}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  aria-label="Your name"
                  autoFocus
                />
                <button className="btn-primary !px-4 !py-2" onClick={saveName} aria-label="Save name">
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="truncate text-2xl font-medium text-deep">{profile.name || 'Friend'}</h2>
                <button
                  className="rounded-full p-1.5 text-muted hover:bg-black/5"
                  onClick={() => {
                    setName(profile.name);
                    setEditing(true);
                  }}
                  aria-label="Edit name"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
            <p className="mt-0.5 text-sm text-muted">Growing since {formatLong(profile.createdAt)}</p>
          </div>
        </div>
        <p className="label mb-2 mt-6">Avatar</p>
        <div className="flex flex-wrap gap-2.5">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              onClick={() => updateProfile({ avatar: a.id })}
              aria-label={`Avatar ${a.id}`}
              aria-pressed={profile.avatar === a.id}
              className={`rounded-full transition ${profile.avatar === a.id ? 'ring-2 ring-forest ring-offset-2' : 'opacity-80 hover:opacity-100'}`}
            >
              <Avatar id={a.id} size={44} />
            </button>
          ))}
        </div>
      </section>

      {/* Garden overview */}
      <section className="card mt-4 p-6" aria-labelledby="overview">
        <h2 id="overview" className="text-xl font-medium text-deep">
          Garden overview
        </h2>
        <p className="mt-1 text-sm text-muted">
          {garden.plants.length} plants · {mature} fully grown · {garden.size}×{garden.size} island
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {byKind.map(([kind, n]) => (
            <div key={kind} className="flex items-center gap-2.5 rounded-2xl bg-cream px-3 py-2.5">
              <span className="h-7 w-7 shrink-0 rounded-lg ring-1 ring-black/5" style={{ background: PLANTS[kind].swatch }} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-deep">{PLANTS[kind].title}</span>
              <span className="text-sm text-muted">{n}</span>
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      <section className="card mt-4 p-6" aria-labelledby="history">
        <h2 id="history" className="text-xl font-medium text-deep">
          Activity history
        </h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Your completed activities will appear here.</p>
        ) : (
          <>
            <ul className="mt-3 divide-y divide-line">
              {(showAll ? history : history.slice(0, 8)).map((l) => {
                const Icon = activityIcon(l.activityId);
                const a = getActivity(l.activityId);
                return (
                  <li key={l.id} className="flex items-center gap-3 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint text-forest">
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-deep">{activityTitle(l.activityId)}</p>
                      <p className="truncate text-xs text-muted">
                        {a ? `Grew ${PLANTS[a.reward].label}` : ''}
                        {l.minutes ? ` · ${l.minutes} min` : ''}
                        {l.note ? ` · ${l.note}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">
                      {relativeDay(l.completedAt)}, {formatTime(l.completedAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
            {history.length > 8 && (
              <button className="btn-ghost mt-2 w-full text-sm" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show less' : `Show all ${history.length}`}
              </button>
            )}
          </>
        )}
      </section>

      {/* Preferences */}
      <section className="card mt-4 p-6" aria-labelledby="prefs">
        <h2 id="prefs" className="text-xl font-medium text-deep">
          Preferences
        </h2>
        <div className="mt-4 space-y-5">
          <div>
            <p className="text-sm font-semibold text-deep">Motion</p>
            <p className="mb-2 text-xs text-muted">Reduce garden swaying, water movement and animated transitions.</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['system', 'Match my device'],
                  ['full', 'Full motion'],
                  ['reduced', 'Reduced motion'],
                ] as const
              ).map(([v, l]) => (
                <button key={v} className={`chip ${prefs.motion === v ? 'chip-on' : ''}`} onClick={() => updatePreferences({ motion: v })}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-deep">Encouraging messages</p>
              <p className="text-xs text-muted">Show a small kind note on your garden.</p>
            </div>
            <Toggle checked={prefs.encouragement} onChange={(v) => updatePreferences({ encouragement: v })} label="Encouraging messages" />
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="card mt-4 p-6" aria-labelledby="notif">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-3">
            <Bell size={20} className="mt-0.5 shrink-0 text-forest" />
            <div>
              <h2 id="notif" className="text-xl font-medium text-deep">
                Gentle reminder
              </h2>
              <p className="text-xs text-muted">A soft, once-a-day nudge. Never about streaks.</p>
            </div>
          </div>
          <Toggle checked={prefs.reminders} onChange={toggleReminders} label="Daily reminder" />
        </div>
        {prefs.reminders && (
          <div className="mt-4 flex items-center gap-3">
            <label htmlFor="rtime" className="text-sm text-muted">
              Remind me at
            </label>
            <input id="rtime" type="time" className="field !w-auto !py-2" value={prefs.reminderTime} onChange={(e) => updatePreferences({ reminderTime: e.target.value })} />
          </div>
        )}
        <p className="mt-3 text-xs text-muted">Because BLOOM runs entirely in your browser, reminders can only appear while BLOOM is open in a tab.</p>
      </section>

      {/* Privacy */}
      <section className="card mt-4 p-6" aria-labelledby="privacy">
        <div className="flex gap-3">
          <Shield size={20} className="mt-0.5 shrink-0 text-forest" />
          <div>
            <h2 id="privacy" className="text-xl font-medium text-deep">
              Privacy & your data
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
              <li>• Everything — your journal, check-ins and garden — is stored only in this browser’s local storage.</li>
              <li>• There are no accounts, servers, analytics or trackers. Nothing is uploaded.</li>
              <li>
                • Local storage is <strong className="text-deep">not a cloud backup</strong>. It won’t sync between devices, and clearing your browser data will erase it.
                Download a backup now and then if your garden matters to you.
              </li>
              <li>• BLOOM is a self-care companion, not a medical or diagnostic tool.</li>
            </ul>
            {!isStorageAvailable() && (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-[#FBEDE6] px-3 py-2 text-sm text-[#9C5537]">
                <HardDrive size={16} /> This browser is blocking storage (private mode?). Changes may not be saved.
              </p>
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn-soft !py-2.5 text-sm" onClick={doExport}>
            <Download size={16} /> Download backup
          </button>
          <button className="btn-soft !py-2.5 text-sm" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Restore from backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = '';
            }}
          />
        </div>
      </section>

      {/* Data */}
      <section className="mt-4 rounded-[var(--radius-card)] border border-line p-6" aria-labelledby="data">
        <h2 id="data" className="text-xl font-medium text-deep">
          Manage data
        </h2>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button className="btn-ghost justify-start !px-4 text-sm" onClick={() => setConfirmDemo(true)}>
            <Sparkles size={16} /> Add sample activity (demo)
          </button>
          <button className="btn-ghost justify-start !px-4 text-sm !text-[#B5574B]" onClick={() => setConfirmReset(true)}>
            <Trash2 size={16} /> Reset all BLOOM data
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmDemo}
        title="Add sample activity?"
        body="This adds a few weeks of example activities and plants so you can preview a fuller garden and insights. They’ll be mixed in with your real data — you can reset everything later."
        confirmLabel="Add sample data"
        onCancel={() => setConfirmDemo(false)}
        onConfirm={() => {
          seedDemo();
          setConfirmDemo(false);
          flash('Sample activity added. Visit your garden!');
        }}
      />
      <ConfirmDialog
        open={confirmReset}
        title="Reset everything?"
        body={
          <>
            This permanently deletes your garden, all {logs.length} activities, your journal entries and check-ins from this browser. It can’t be undone.
            <br />
            <br />
            You might want to <button className="font-semibold text-forest underline" onClick={doExport}>download a backup</button> first.
          </>
        }
        confirmLabel="Yes, reset everything"
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll();
          setConfirmReset(false);
        }}
      />
    </div>
  );
}
