import * as THREE from 'three';

/** Shared palette for the 3D world. */
export const C = {
  leaf: '#83B85D',
  leafLight: '#9CCB6E',
  grass: '#A8D07A',
  grassDark: '#93C268',
  sage: '#B8D1B9',
  mint: '#D9E9D8',
  forest: '#527D56',
  deep: '#35543D',
  brown: '#94775C',
  bark: '#7C5E45',
  soil1: '#A88A6A',
  soil2: '#94775C',
  soil3: '#7E634C',
  soil4: '#6B533F',
  cream: '#F7F6F0',
  white: '#FBFAF4',
  peach: '#EBA77F',
  coral: '#E48B73',
  blossom: '#F4C3CF',
  blossom2: '#EDA6BA',
  blossom3: '#F8DCE3',
  sky: '#B8DDE5',
  water: '#8FCAD8',
  waterDeep: '#79B9C9',
  yellow: '#F2C66D',
  lavender: '#A9A4E0',
  periwinkle: '#8E9EE0',
  stone: '#C4C0B3',
  stoneDark: '#A9A597',
  bridge: '#DB8D66',
  bridgeDark: '#C2734F',
} as const;

const cache = new Map<string, THREE.MeshStandardMaterial>();

export function mat(color: string, opts: { smooth?: boolean; emissive?: number; opacity?: number } = {}): THREE.MeshStandardMaterial {
  const key = `${color}|${opts.smooth ? 1 : 0}|${opts.emissive ?? 0}|${opts.opacity ?? 1}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85,
      metalness: 0,
      flatShading: !opts.smooth,
      emissive: opts.emissive ? new THREE.Color(color) : new THREE.Color('#000000'),
      emissiveIntensity: opts.emissive ?? 0,
      transparent: (opts.opacity ?? 1) < 1,
      opacity: opts.opacity ?? 1,
    });
    cache.set(key, m);
  }
  return m;
}

/** Shared unit geometries — scaled per mesh so the GPU reuses buffers. */
export const G = {
  ico: new THREE.IcosahedronGeometry(1, 1),
  ico0: new THREE.IcosahedronGeometry(1, 0),
  sphere: new THREE.SphereGeometry(1, 14, 10),
  lowSphere: new THREE.SphereGeometry(1, 8, 6),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 8),
  trunk: new THREE.CylinderGeometry(0.65, 1, 1, 7),
  cone: new THREE.ConeGeometry(1, 1, 8),
  cone6: new THREE.ConeGeometry(1, 1, 5),
  bell: new THREE.ConeGeometry(1, 1, 10, 1, true),
  disc: new THREE.CylinderGeometry(1, 1, 1, 20),
  box: new THREE.BoxGeometry(1, 1, 1),
  dodec: new THREE.DodecahedronGeometry(1, 0),
  torusArc: new THREE.TorusGeometry(1, 0.08, 6, 16, Math.PI),
  ring: new THREE.TorusGeometry(1, 0.03, 8, 48),
};

/** Small deterministic PRNG so every plant looks the same after a reload. */
export function rng(seed: number) {
  let a = Math.floor(seed * 4294967295) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
