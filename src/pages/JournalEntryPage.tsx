import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, Pencil, Trash2, TreeDeciduous, X } from 'lucide-react';
import { createJournalEntry, deleteJournalEntry, updateJournalEntry, useBloom } from '../state/store';
import { celebrate } from '../state/ui';
import { ConfirmDialog, PageHeader } from '../components/ui';
import { JOURNAL_PROMPTS } from '../data/content';
import { dateKey, formatLong, formatTime } from '../utils/dates';

const DRAFT_KEY = 'bloom.journal.draft';

interface Draft {
  title: string;
  body: string;
  date: string;
  prompt?: string;
}

function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export default function JournalEntryPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const entry = useBloom((s) => (isNew ? undefined : s.journal.find((e) => e.id === id)));
  if (!isNew && !entry) return <Navigate to="/journal" replace />;
  return isNew ? <Editor key="new" /> : <Viewer key={entry!.id} id={entry!.id} />;
}

function Editor({ existingId, onDone }: { existingId?: string; onDone?: () => void }) {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const existing = useBloom((s) => (existingId ? s.journal.find((e) => e.id === existingId) : undefined));
  const initial = useMemo<Draft>(() => {
    if (existing) return { title: existing.title, body: existing.body, date: existing.date, prompt: existing.prompt };
    const promptIdx = params.get('prompt');
    const draft = loadDraft();
    const prompt = promptIdx !== null ? JOURNAL_PROMPTS[Number(promptIdx)] : draft?.prompt;
    return { title: draft?.title ?? '', body: draft?.body ?? '', date: draft?.date ?? dateKey(), prompt };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [date, setDate] = useState(initial.date);
  const [prompt, setPrompt] = useState<string | undefined>(initial.prompt);

  // keep unsaved new entries safe across refreshes
  useEffect(() => {
    if (existingId) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, body, date, prompt }));
    } catch {
      /* ignore */
    }
  }, [title, body, date, prompt, existingId]);

  const words = body.trim() ? body.trim().split(/\s+/).length : 0;

  const save = () => {
    if (!body.trim()) return;
    if (existingId) {
      updateJournalEntry(existingId, { title, body, date, prompt });
      onDone?.();
      return;
    }
    const { result } = createJournalEntry({ title, body, date, prompt });
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    celebrate({ result, activityId: 'journal', returnTo: { path: '/journal', label: 'Back to my journal' } });
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
      {!existingId && <PageHeader back="/journal" eyebrow="New entry" title="What’s on your mind?" subtitle="Write as much or as little as you like. Only you can see this." />}

      <div className="card p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="entry-date">
            Date
          </label>
          <input id="entry-date" type="date" value={date} max={dateKey()} onChange={(e) => setDate(e.target.value || dateKey())} className="field !w-auto !py-2 text-sm" />
          <span className="text-xs text-muted">{words} words</span>
        </div>

        <div className="mt-4">
          <p className="label mb-2">Prompt (optional)</p>
          <div className="flex flex-wrap gap-2">
            {JOURNAL_PROMPTS.map((p) => (
              <button key={p} className={`chip !py-1.5 text-[13px] ${prompt === p ? 'chip-on' : ''}`} onClick={() => setPrompt(prompt === p ? undefined : p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {prompt && <p className="mt-5 font-display text-xl italic text-forest">{prompt}</p>}

        <label className="sr-only" htmlFor="entry-title">
          Title
        </label>
        <input
          id="entry-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give it a title (optional)"
          className="mt-5 w-full border-0 bg-transparent font-display text-2xl text-deep outline-none placeholder:text-muted/50"
          maxLength={120}
        />
        <label className="sr-only" htmlFor="entry-body">
          Entry
        </label>
        <textarea
          id="entry-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing…"
          className="mt-3 min-h-[300px] w-full resize-y border-0 bg-transparent text-[16px] leading-[1.75] text-ink outline-none placeholder:text-muted/50"
          autoFocus={!existingId}
        />
        <div className="mt-4 flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">{existingId ? 'Editing won’t plant another tree.' : 'Saving plants a tree in your garden.'}</p>
          <div className="flex gap-2">
            {existingId ? (
              <button className="btn-ghost" onClick={onDone}>
                <X size={16} /> Cancel
              </button>
            ) : (
              <button className="btn-ghost" onClick={() => nav('/journal')}>
                Later
              </button>
            )}
            <button className="btn-primary flex-1 sm:flex-none" onClick={save} disabled={!body.trim()}>
              <Check size={16} /> {existingId ? 'Save changes' : 'Save entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Viewer({ id }: { id: string }) {
  const nav = useNavigate();
  const entry = useBloom((s) => s.journal.find((e) => e.id === id));
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  if (!entry) return <Navigate to="/journal" replace />;
  if (editing) return <Editor existingId={id} onDone={() => setEditing(false)} />;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
      <PageHeader
        back="/journal"
        eyebrow={formatLong(entry.date)}
        title={entry.title || 'Untitled reflection'}
        right={
          <div className="flex shrink-0 gap-1">
            <button className="btn-ghost !p-3" onClick={() => setEditing(true)} aria-label="Edit entry">
              <Pencil size={18} />
            </button>
            <button className="btn-ghost !p-3 !text-[#B5574B]" onClick={() => setConfirm(true)} aria-label="Delete entry">
              <Trash2 size={18} />
            </button>
          </div>
        }
      />
      <article className="card p-6 sm:p-8">
        {entry.prompt && <p className="mb-4 font-display text-xl italic text-forest">{entry.prompt}</p>}
        <div className="whitespace-pre-wrap text-[16px] leading-[1.8] text-ink">{entry.body}</div>
        <p className="mt-6 border-t border-line pt-4 text-xs text-muted">
          Written {formatLong(entry.createdAt)} at {formatTime(entry.createdAt)}
          {entry.updatedAt !== entry.createdAt && ` · edited ${formatLong(entry.updatedAt)}`}
        </p>
      </article>
      {entry.plantId && (
        <button className="btn-soft mt-4 w-full" onClick={() => nav('/', { state: { plantId: entry.plantId } })}>
          <TreeDeciduous size={18} /> Visit the tree this entry planted
        </button>
      )}
      <ConfirmDialog
        open={confirm}
        title="Delete this entry?"
        body={<>This entry will be permanently removed from this device. The tree it planted will stay in your garden — the care you took still happened.</>}
        confirmLabel="Delete entry"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          deleteJournalEntry(id);
          nav('/journal');
        }}
      />
    </div>
  );
}
