export function uid(prefix = ''): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}${Date.now().toString(36)}${rand}`;
}

/** Local calendar date key, yyyy-mm-dd. */
export function dateKey(d: Date | string = new Date()): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatLong(d: Date | string): string {
  const date = typeof d === 'string' ? (d.length === 10 ? parseDateKey(d) : new Date(d)) : d;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatShort(d: Date | string): string {
  const date = typeof d === 'string' ? (d.length === 10 ? parseDateKey(d) : new Date(d)) : d;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatTime(d: string): string {
  return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function relativeDay(d: string): string {
  const today = dateKey();
  const k = dateKey(d);
  if (k === today) return 'Today';
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (k === dateKey(y)) return 'Yesterday';
  return formatShort(d);
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

/** Deterministic 0..1 pseudo-random from integers. */
export function hash2(a: number, b: number, seed = 0): number {
  let h = (a * 374761393 + b * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return ((h >>> 0) % 10000) / 10000;
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}
