import type { Plant } from '../types';
import { hash2 } from './dates';

export const START_SIZE = 6;
export const MAX_SIZE = 20;
export const EXPAND_STEP = 2;

/** The stream runs along this column for every row. */
export const STREAM_X = 1;

export function isReserved(x: number, _z: number): boolean {
  return x === STREAM_X;
}

export function bridgeZ(size: number): number {
  return Math.floor(size / 2);
}

export function capacity(size: number): number {
  return size * size - size; // minus stream column
}

export function freeTiles(size: number, plants: Plant[]): { x: number; z: number }[] {
  const taken = new Set(plants.map((p) => `${p.x},${p.z}`));
  const out: { x: number; z: number }[] = [];
  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      if (isReserved(x, z) || taken.has(`${x},${z}`)) continue;
      out.push({ x, z });
    }
  }
  return out;
}

/**
 * Picks a tile that keeps the garden pleasant: fills from the heart of the
 * island outward, with a little deterministic jitter so it feels organic.
 */
export function pickTile(size: number, plants: Plant[]): { x: number; z: number } | null {
  const free = freeTiles(size, plants);
  if (!free.length) return null;
  const c = (size - 1) / 2 + 0.6; // bias a little away from the stream
  const n = plants.length;
  free.sort((a, b) => {
    const da = Math.hypot(a.x - c, a.z - c) + hash2(a.x, a.z, n) * 1.6;
    const db = Math.hypot(b.x - c, b.z - c) + hash2(b.x, b.z, n) * 1.6;
    return da - db;
  });
  return free[0];
}

export function fullness(size: number, plants: Plant[]): number {
  return plants.length / capacity(size);
}
