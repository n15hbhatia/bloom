import { useSyncExternalStore } from 'react';
import type { ActivityLog, AppState, CheckIn, Emotion, JournalEntry, Plant, Preferences } from '../types';
import { getActivity, WELCOME_ACTIVITY_ID } from '../data/activities';
import { stageFromNurtures } from '../data/plants';
import { uid, dateKey } from '../utils/dates';
import { EXPAND_STEP, MAX_SIZE, pickTile, START_SIZE } from '../utils/garden';

export const STORAGE_KEY = 'bloom.app.state';
export const SCHEMA_VERSION = 1;

export function defaultState(): AppState {
  return {
    version: SCHEMA_VERSION,
    profile: { name: '', avatar: 'leaf', createdAt: new Date().toISOString(), onboarded: false },
    preferences: { motion: 'system', encouragement: true, reminders: false, reminderTime: '19:00' },
    garden: { size: START_SIZE, plants: [] },
    logs: [],
    journal: [],
    checkIns: [],
  };
}

// ——— Safe parsing ———————————————————————————————————————————————

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const arr = <T>(v: unknown, guard: (x: unknown) => boolean): T[] => (Array.isArray(v) ? (v.filter(guard) as T[]) : []);

const isPlant = (p: unknown) =>
  isObj(p) && typeof p.id === 'string' && typeof p.kind === 'string' && Number.isFinite(p.x) && Number.isFinite(p.z);
const isLog = (l: unknown) => isObj(l) && typeof l.id === 'string' && typeof l.activityId === 'string' && typeof l.completedAt === 'string';
const isEntry = (e: unknown) => isObj(e) && typeof e.id === 'string' && typeof e.body === 'string';
const isCheckIn = (c: unknown) => isObj(c) && typeof c.id === 'string' && typeof c.emotion === 'string';

/** Turns anything (old versions, partial or corrupted data) into a valid AppState. */
export function sanitize(raw: unknown): AppState {
  const base = defaultState();
  if (!isObj(raw)) return base;
  const migrated = migrate(raw);
  const profile = isObj(migrated.profile) ? migrated.profile : {};
  const prefs = isObj(migrated.preferences) ? migrated.preferences : {};
  const garden = isObj(migrated.garden) ? migrated.garden : {};
  const size = Number(garden.size);
  const plants = arr<Plant>(garden.plants, isPlant).map((p) => ({
    ...p,
    nurtures: Number(p.nurtures) || 0,
    stage: stageFromNurtures(Number(p.nurtures) || 0),
    variant: Number(p.variant) || 0,
  }));
  const maxCoord = plants.reduce((m, p) => Math.max(m, p.x + 1, p.z + 1), 0);
  return {
    version: SCHEMA_VERSION,
    profile: {
      name: typeof profile.name === 'string' ? profile.name.slice(0, 40) : base.profile.name,
      avatar: typeof profile.avatar === 'string' ? profile.avatar : base.profile.avatar,
      createdAt: typeof profile.createdAt === 'string' ? profile.createdAt : base.profile.createdAt,
      onboarded: profile.onboarded === true,
    },
    preferences: {
      motion: prefs.motion === 'reduced' || prefs.motion === 'full' ? prefs.motion : 'system',
      encouragement: prefs.encouragement !== false,
      reminders: prefs.reminders === true,
      reminderTime: typeof prefs.reminderTime === 'string' && /^\d\d:\d\d$/.test(prefs.reminderTime) ? prefs.reminderTime : '19:00',
    },
    garden: {
      size: Math.min(MAX_SIZE, Math.max(Number.isFinite(size) ? size : START_SIZE, START_SIZE, maxCoord)),
      plants,
    },
    logs: arr<ActivityLog>(migrated.logs, isLog),
    journal: arr<JournalEntry>(migrated.journal, isEntry),
    checkIns: arr<CheckIn>(migrated.checkIns, isCheckIn),
    lastPlantedId: undefined,
  };
}

/** Version migrations live here. v1 is the first schema. */
function migrate(raw: Record<string, unknown>): Record<string, unknown> {
  const v = Number(raw.version) || 1;
  const out = { ...raw };
  // if (v < 2) { ...transform to v2... }
  void v;
  return out;
}

// ——— Store ————————————————————————————————————————————————————

let storageOk = true;

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return sanitize(JSON.parse(raw));
  } catch {
    storageOk = false;
    return defaultState();
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    const { lastPlantedId: _omit, ...rest } = state;
    void _omit;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    storageOk = true;
  } catch {
    storageOk = false;
  }
}

function set(next: AppState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

export function getState(): AppState {
  return state;
}

export function isStorageAvailable(): boolean {
  return storageOk;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useBloom<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

// Keep tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  });
}

// ——— Garden helpers ——————————————————————————————————————————————

function placePlant(garden: AppState['garden'], draft: Omit<Plant, 'x' | 'z'>): { garden: AppState['garden']; plant: Plant } {
  let size = garden.size;
  let tile = pickTile(size, garden.plants);
  while (!tile && size < MAX_SIZE) {
    size = Math.min(MAX_SIZE, size + EXPAND_STEP);
    tile = pickTile(size, garden.plants);
  }
  // Absolute fallback: never lose a plant. Stack on the far corner if the garden is at max size.
  const pos = tile ?? { x: size - 1, z: size - 1 };
  const plant: Plant = { ...draft, x: pos.x, z: pos.z };
  return { garden: { size, plants: [...garden.plants, plant] }, plant };
}

// ——— Actions ————————————————————————————————————————————————————

export interface CompletionResult {
  plant: Plant;
  log: ActivityLog;
  grown?: Plant; // an existing plant that reached a new stage
  expanded: boolean;
}

export function completeActivity(
  activityId: string,
  opts: { minutes?: number; note?: string; journalEntryId?: string; hue?: number } = {},
): CompletionResult {
  const activity = getActivity(activityId);
  if (!activity) throw new Error(`Unknown activity ${activityId}`);
  const now = new Date().toISOString();
  const logId = uid('log_');
  const plantId = uid('plant_');

  // 1. Repeated engagement nurtures the oldest still-growing plant of the same kind.
  let grown: Plant | undefined;
  const plants = state.garden.plants.map((p) => p);
  const growable = plants
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.kind === activity.reward && p.stage < 3)
    .sort((a, b) => a.p.plantedAt.localeCompare(b.p.plantedAt))[0];
  if (growable) {
    const nurtures = growable.p.nurtures + 1;
    const stage = stageFromNurtures(nurtures);
    const updated = { ...growable.p, nurtures, stage };
    plants[growable.i] = updated;
    if (stage !== growable.p.stage) grown = updated;
  }

  // 2. Plant something new.
  const sameKind = plants.filter((p) => p.kind === activity.reward).length;
  const variant = activity.reward === 'tree' ? sameKind % 4 : Math.floor(Math.random() * 3);
  const hue = activity.reward === 'uniqueFlower' ? (opts.hue ?? Math.floor(Math.random() * 360)) : undefined;
  const { garden, plant } = placePlant(
    { ...state.garden, plants },
    {
      id: plantId,
      kind: activity.reward,
      variant,
      stage: 1,
      nurtures: 0,
      plantedAt: now,
      activityId,
      logId,
      journalEntryId: opts.journalEntryId,
      hue,
    },
  );

  const log: ActivityLog = {
    id: logId,
    activityId,
    category: activity.category,
    completedAt: now,
    plantId,
    minutes: opts.minutes,
    note: opts.note?.trim() || undefined,
  };

  set({ ...state, garden, logs: [...state.logs, log], lastPlantedId: plantId });
  return { plant, log, grown, expanded: garden.size !== state.garden.size };
}

export function completeOnboarding(name: string, avatar: string) {
  const base = { ...state, profile: { ...state.profile, name: name.trim().slice(0, 40), avatar, onboarded: true } };
  if (base.garden.plants.length === 0) {
    const { garden, plant } = placePlant(base.garden, {
      id: uid('plant_'),
      kind: 'sapling',
      variant: 0,
      stage: 2,
      nurtures: 1,
      plantedAt: new Date().toISOString(),
      activityId: WELCOME_ACTIVITY_ID,
      logId: '',
      name: 'First Seed',
    });
    set({ ...base, garden, lastPlantedId: plant.id });
  } else {
    set(base);
  }
}

export function clearLastPlanted() {
  if (state.lastPlantedId) {
    state = { ...state, lastPlantedId: undefined };
    listeners.forEach((l) => l());
  }
}

export function expandGarden() {
  if (state.garden.size >= MAX_SIZE) return;
  set({ ...state, garden: { ...state.garden, size: Math.min(MAX_SIZE, state.garden.size + EXPAND_STEP) } });
}

// Journal ——

export function createJournalEntry(input: { title: string; body: string; date: string; prompt?: string }): {
  entry: JournalEntry;
  result: CompletionResult;
} {
  const now = new Date().toISOString();
  const entry: JournalEntry = {
    id: uid('entry_'),
    title: input.title.trim(),
    body: input.body,
    date: input.date || dateKey(),
    prompt: input.prompt,
    createdAt: now,
    updatedAt: now,
  };
  set({ ...state, journal: [...state.journal, entry] });
  const result = completeActivity('journal', { journalEntryId: entry.id });
  const linked = { ...entry, plantId: result.plant.id };
  set({ ...state, journal: state.journal.map((e) => (e.id === entry.id ? linked : e)) });
  return { entry: linked, result };
}

export function updateJournalEntry(id: string, patch: Partial<Pick<JournalEntry, 'title' | 'body' | 'date' | 'prompt'>>) {
  set({
    ...state,
    journal: state.journal.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e)),
  });
}

/** Deleting an entry never removes its tree — the care you took still happened. */
export function deleteJournalEntry(id: string) {
  set({
    ...state,
    journal: state.journal.filter((e) => e.id !== id),
    garden: {
      ...state.garden,
      plants: state.garden.plants.map((p) => (p.journalEntryId === id ? { ...p, journalEntryId: undefined } : p)),
    },
  });
}

// Check-ins ——

export function saveCheckIn(emotion: Emotion, intensity: number, note?: string): { checkIn: CheckIn; result: CompletionResult } {
  const checkIn: CheckIn = {
    id: uid('check_'),
    emotion,
    intensity: Math.max(1, Math.min(5, Math.round(intensity))),
    note: note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  set({ ...state, checkIns: [...state.checkIns, checkIn] });
  const result = completeActivity('checkin');
  return { checkIn, result };
}

// Profile & preferences ——

export function updateProfile(patch: Partial<Pick<AppState['profile'], 'name' | 'avatar'>>) {
  set({ ...state, profile: { ...state.profile, ...patch, name: (patch.name ?? state.profile.name).slice(0, 40) } });
}

export function updatePreferences(patch: Partial<Preferences>) {
  set({ ...state, preferences: { ...state.preferences, ...patch } });
}

export function resetAll() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  set(defaultState());
}

export function exportData(): string {
  const { lastPlantedId: _omit, ...rest } = state;
  void _omit;
  return JSON.stringify(rest, null, 2);
}

export function importData(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    if (!isObj(parsed) || !isObj(parsed.garden)) return false;
    set(sanitize(parsed));
    return true;
  } catch {
    return false;
  }
}

/** Dev helper: fills the garden with sample activity so you can preview it. */
export function seedDemo() {
  const before = state.logs.length;
  const checkBefore = state.checkIns.length;
  const samples = [
    { title: 'A slower morning', body: 'Had my tea by the window before checking my phone. It made the whole day feel less rushed.' },
    { title: 'Letting go', body: 'I keep replaying that conversation. Writing it down helps me see it was not as bad as it felt.' },
  ];
  samples.forEach((s, i) => createJournalEntry({ ...s, date: dateKey(new Date(Date.now() - (i + 2) * 86400000)) }));
  const ids = ['meditation', 'breathing', 'gratitude', 'walk', 'stretch', 'friend', 'reading', 'rest', 'create', 'intentions', 'pause', 'outdoors'];
  for (let round = 0; round < 2; round++) {
    if (round === 1) createJournalEntry({ title: 'Small wins', body: 'Went for a walk, called Mum, cooked something proper. Small, but it counts.', date: dateKey() });
    for (const id of ids) completeActivity(id);
  }
  (['calm', 'tired', 'grateful', 'anxious', 'happy'] as Emotion[]).forEach((e, i) => saveCheckIn(e, 2 + (i % 3)));
  // Spread only the sample activity across the last few weeks, for nicer insights.
  const shift = (iso: string, i: number) => {
    const d = new Date();
    d.setDate(d.getDate() - ((i * 7) % 26));
    d.setHours(8 + (i % 12), (i * 13) % 60);
    return d.getTime() < new Date(iso).getTime() ? d.toISOString() : iso;
  };
  const logs = state.logs.map((l, i) => (i >= before ? { ...l, completedAt: shift(l.completedAt, i) } : l));
  const checkIns = state.checkIns.map((c, i) => (i >= checkBefore ? { ...c, createdAt: shift(c.createdAt, i * 3 + 1) } : c));
  set({ ...state, logs, checkIns, lastPlantedId: undefined });
}
