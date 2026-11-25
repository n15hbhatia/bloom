import { useSyncExternalStore } from 'react';
import type { CompletionResult } from './store';

export interface Celebration {
  result: CompletionResult;
  activityId: string;
  suggestion?: { activityId: string; text: string };
  headline?: string;
  returnTo?: { path: string; label: string };
}

let current: Celebration | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function celebrate(c: Celebration) {
  current = c;
  emit();
}
export function dismissCelebration() {
  current = null;
  emit();
}
export function useCelebration() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current,
  );
}
