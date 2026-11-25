import { useMemo } from 'react';
import * as THREE from 'three';
import type { Plant, PlantKind } from '../../types';
import { C, G, mat, rng } from './materials';
import { hashString } from '../../utils/dates';

type V3 = [number, number, number];

interface PartProps {
  g: THREE.BufferGeometry;
  c: string;
  p?: V3;
  s?: number | V3;
  r?: V3;
  smooth?: boolean;
  shadow?: boolean;
  emissive?: number;
}

/** One low-poly part. */
function P({ g, c, p = [0, 0, 0], s = 1, r = [0, 0, 0], smooth, shadow = true, emissive }: PartProps) {
  return (
    <mesh
      geometry={g}
      material={mat(c, { smooth, emissive })}
      position={p}
      scale={s}
      rotation={r}
      castShadow={shadow}
      receiveShadow
    />
  );
}

/** Cylinder placed from y0 up to y0+h. */
function Stem({ h, r = 0.012, c = C.forest as string, p = [0, 0, 0] as V3, tilt = [0, 0, 0] as V3 }: { h: number; r?: number; c?: string; p?: V3; tilt?: V3 }) {
  return (
    <group position={p} rotation={tilt}>
      <P g={G.cyl} c={c} p={[0, h / 2, 0]} s={[r, h, r]} shadow={false} />
    </group>
  );
}

function Leaf({ p, rotY, len = 0.12, w = 0.04, c = C.leaf, tilt = -0.6 }: { p: V3; rotY: number; len?: number; w?: number; c?: string; tilt?: number }) {
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <group rotation={[tilt, 0, 0]}>
        <P g={G.sphere} c={c} p={[0, 0, len * 0.9]} s={[w, 0.012, len]} />
      </group>
    </group>
  );
}

// ——— TREES ————————————————————————————————————————————————

function RoundTree({ stage }: ModelProps) {
  return (
    <group>
      <P g={G.trunk} c={C.bark} p={[0, 0.3, 0]} s={[0.065, 0.6, 0.065]} />
      <P g={G.ico} c={C.leaf} p={[0, 0.8, 0]} s={0.34} />
      <P g={G.ico} c={C.leafLight} p={[0.2, 0.7, 0.1]} s={0.24} />
      <P g={G.ico} c={C.forest} p={[-0.18, 0.68, -0.08]} s={0.23} />
      {stage >= 2 && <P g={G.ico} c={C.leafLight} p={[-0.05, 0.72, 0.22]} s={0.2} />}
      {stage >= 3 && (
        <>
          <P g={G.ico} c={C.leaf} p={[0.04, 1.06, -0.02]} s={0.22} />
          <P g={G.sphere} c={C.coral} p={[0.24, 0.84, 0.2]} s={0.035} />
          <P g={G.sphere} c={C.coral} p={[-0.2, 0.92, 0.18]} s={0.035} />
          <P g={G.sphere} c={C.coral} p={[0.1, 0.62, 0.3]} s={0.035} />
        </>
      )}
    </group>
  );
}

function CherryTree({ stage, seed }: ModelProps) {
  const petals = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 9 }, () => {
      const a = r() * Math.PI * 2;
      const d = 0.18 + r() * 0.24;
      return [Math.cos(a) * d, 0.006, Math.sin(a) * d] as V3;
    });
  }, [seed]);
  return (
    <group>
      <P g={G.trunk} c={C.bark} p={[0, 0.22, 0]} s={[0.07, 0.44, 0.07]} />
      <P g={G.trunk} c={C.bark} p={[0.08, 0.5, 0]} s={[0.04, 0.26, 0.04]} r={[0, 0, -0.6]} />
      <P g={G.trunk} c={C.bark} p={[-0.07, 0.52, 0.02]} s={[0.035, 0.24, 0.035]} r={[0.2, 0, 0.55]} />
      <P g={G.ico} c={C.blossom} p={[0, 0.78, 0]} s={0.3} />
      <P g={G.ico} c={C.blossom2} p={[0.22, 0.66, 0.04]} s={0.22} />
      <P g={G.ico} c={C.blossom3} p={[-0.2, 0.68, 0.06]} s={0.21} />
      {stage >= 2 && <P g={G.ico} c={C.blossom2} p={[0.02, 0.68, -0.22]} s={0.19} />}
      {stage >= 3 && (
        <>
          <P g={G.ico} c={C.blossom3} p={[0.06, 1.0, 0.05]} s={0.2} />
          <P g={G.ico} c={C.blossom} p={[-0.04, 0.7, 0.24]} s={0.18} />
          {petals.map((p, i) => (
            <P key={i} g={G.disc} c={i % 2 ? C.blossom : C.blossom2} p={p} s={[0.025, 0.004, 0.025]} shadow={false} />
          ))}
        </>
      )}
    </group>
  );
}

function PineTree({ stage }: ModelProps) {
  return (
    <group>
      <P g={G.trunk} c={C.bark} p={[0, 0.12, 0]} s={[0.06, 0.24, 0.06]} />
      <P g={G.cone} c={C.forest} p={[0, 0.42, 0]} s={[0.32, 0.44, 0.32]} />
      <P g={G.cone} c={'#5E8C5F'} p={[0, 0.7, 0]} s={[0.25, 0.4, 0.25]} />
      <P g={G.cone} c={C.forest} p={[0, 0.94, 0]} s={[0.18, 0.34, 0.18]} />
      {stage >= 3 && <P g={G.cone} c={'#5E8C5F'} p={[0, 1.14, 0]} s={[0.11, 0.24, 0.11]} />}
    </group>
  );
}

function SlenderTree({ stage }: ModelProps) {
  return (
    <group>
      <P g={G.trunk} c={C.bark} p={[0, 0.42, 0]} s={[0.05, 0.84, 0.05]} />
      <P g={G.ico} c={'#6E9E5E'} p={[0, 1.0, 0]} s={[0.2, 0.42, 0.2]} />
      <P g={G.ico} c={C.leaf} p={[0.07, 0.82, 0.05]} s={[0.16, 0.3, 0.16]} />
      {stage >= 2 && <P g={G.ico} c={C.sage} p={[-0.07, 0.78, -0.04]} s={[0.13, 0.24, 0.13]} />}
      {stage >= 3 && <P g={G.ico} c={'#6E9E5E'} p={[0, 1.32, 0]} s={[0.12, 0.2, 0.12]} />}
    </group>
  );
}

function Tree(props: ModelProps) {
  switch (props.variant % 4) {
    case 1:
      return <CherryTree {...props} />;
    case 2:
      return <PineTree {...props} />;
    case 3:
      return <SlenderTree {...props} />;
    default:
      return <RoundTree {...props} />;
  }
}

function Sapling({ stage }: ModelProps) {
  const pairs = stage === 1 ? 2 : stage === 2 ? 3 : 4;
  return (
    <group>
      <P g={G.trunk} c={C.bark} p={[0, 0.22, 0]} s={[0.022, 0.44, 0.022]} />
      {Array.from({ length: pairs }, (_, i) => {
        const y = 0.12 + i * 0.09;
        const len = 0.08 - i * 0.008;
        return (
          <group key={i}>
            <Leaf p={[0, y, 0]} rotY={i * 1.3} len={len} w={0.035} c={i % 2 ? C.leaf : C.leafLight} tilt={-0.5} />
            <Leaf p={[0, y + 0.02, 0]} rotY={i * 1.3 + Math.PI} len={len} w={0.035} c={C.leaf} tilt={-0.5} />
          </group>
        );
      })}
      <P g={G.ico} c={C.leafLight} p={[0, 0.48, 0]} s={stage >= 3 ? 0.12 : 0.07} />
    </group>
  );
}

function TwinTrees({ stage }: ModelProps) {
  return (
    <group>
      {/* left */}
      <group position={[-0.17, 0, 0]} rotation={[0, 0, -0.12]}>
        <P g={G.trunk} c={C.bark} p={[0, 0.3, 0]} s={[0.05, 0.6, 0.05]} />
        <P g={G.ico} c={C.leaf} p={[0, 0.74, 0]} s={0.22} />
        <P g={G.ico} c={C.leafLight} p={[-0.1, 0.66, 0.06]} s={0.15} />
      </group>
      {/* right */}
      <group position={[0.17, 0, 0]} rotation={[0, 0, 0.12]}>
        <P g={G.trunk} c={C.bark} p={[0, 0.3, 0]} s={[0.05, 0.6, 0.05]} />
        <P g={G.ico} c={C.blossom} p={[0, 0.74, 0]} s={0.22} />
        <P g={G.ico} c={C.blossom2} p={[0.1, 0.66, 0.06]} s={0.15} />
      </group>
      {/* the branch they share */}
      <P g={G.torusArc} c={C.bark} p={[0, 0.5, 0]} s={[0.15, 0.13, 0.2]} />
      {stage >= 2 && <P g={G.ico} c={C.leafLight} p={[0, 0.82, 0]} s={0.14} />}
      {stage >= 3 && (
        <>
          <P g={G.sphere} c={C.blossom3} p={[-0.12, 0.88, 0.14]} s={0.035} />
          <P g={G.sphere} c={C.blossom3} p={[-0.25, 0.78, 0.12]} s={0.035} />
          <P g={G.ico} c={C.blossom3} p={[0.05, 0.94, -0.02]} s={0.11} />
        </>
      )}
    </group>
  );
}

// ——— FLOWERS ————————————————————————————————————————————————

function DaisyHead({ p, size = 1, petal = C.white, center = C.yellow }: { p: V3; size?: number; petal?: string; center?: string }) {
  return (
    <group position={p} scale={size} rotation={[-0.35, 0, 0]}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <P g={G.sphere} c={petal} p={[0.055, 0, 0]} s={[0.05, 0.01, 0.02]} smooth />
          </group>
        );
      })}
      <P g={G.sphere} c={center} p={[0, 0.008, 0]} s={[0.03, 0.018, 0.03]} />
    </group>
  );
}

function SmallFlower({ stage, seed }: ModelProps) {
  const spots = useMemo(() => {
    const r = rng(seed);
    const base: V3[] = [[0, 0, 0]];
    for (let i = 1; i < 3; i++) base.push([(r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3]);
    return base;
  }, [seed]);
  const count = stage;
  return (
    <group>
      {spots.slice(0, count).map((p, i) => {
        const h = 0.28 - i * 0.05;
        return (
          <group key={i} position={p}>
            <Stem h={h} />
            <Leaf p={[0, 0.03, 0]} rotY={i * 2} len={0.07} w={0.025} />
            <Leaf p={[0, 0.03, 0]} rotY={i * 2 + 2.6} len={0.06} w={0.022} c={C.forest} />
            <DaisyHead p={[0, h, 0]} size={1 - i * 0.12} />
          </group>
        );
      })}
    </group>
  );
}

const TULIP_COLORS = [C.peach, '#F2A7B5', C.yellow];

function TulipOne({ p, h, color }: { p: V3; h: number; color: string }) {
  return (
    <group position={p}>
      <Stem h={h} r={0.014} />
      <group rotation={[0, 0.4, 0]}>
        <P g={G.sphere} c={C.leaf} p={[0.04, 0.09, 0]} s={[0.03, 0.12, 0.012]} r={[0, 0, -0.35]} />
        <P g={G.sphere} c={C.forest} p={[-0.04, 0.08, 0]} s={[0.028, 0.1, 0.012]} r={[0, 0, 0.4]} />
      </group>
      <group position={[0, h + 0.05, 0]}>
        <P g={G.sphere} c={color} s={[0.055, 0.07, 0.055]} />
        {[0, 2.1, 4.2].map((a) => (
          <group key={a} rotation={[0, a, 0]}>
            <P g={G.sphere} c={color} p={[0.03, 0.025, 0]} s={[0.03, 0.06, 0.035]} r={[0, 0, -0.2]} />
          </group>
        ))}
      </group>
    </group>
  );
}

function Tulip({ stage, variant }: ModelProps) {
  const color = TULIP_COLORS[variant % TULIP_COLORS.length];
  return (
    <group>
      <TulipOne p={[0, 0, 0]} h={0.3} color={color} />
      {stage >= 2 && <TulipOne p={[0.13, 0, 0.06]} h={0.22} color={TULIP_COLORS[(variant + 1) % 3]} />}
      {stage >= 3 && <TulipOne p={[-0.1, 0, 0.1]} h={0.25} color={color} />}
    </group>
  );
}

const WILD_COLORS = [C.yellow, C.lavender, C.white, C.peach, '#F2A7B5'];

function Wildflowers({ stage, seed }: ModelProps) {
  const stems = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 12 }, () => ({
      p: [(r() - 0.5) * 0.55, 0, (r() - 0.5) * 0.55] as V3,
      h: 0.14 + r() * 0.2,
      c: WILD_COLORS[Math.floor(r() * WILD_COLORS.length)],
      tilt: [(r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3] as V3,
    }));
  }, [seed]);
  const n = stage === 1 ? 5 : stage === 2 ? 8 : 12;
  return (
    <group>
      {stems.slice(0, n).map((s, i) => (
        <group key={i} position={s.p} rotation={s.tilt}>
          <Stem h={s.h} r={0.008} c={C.leaf} />
          <P g={G.ico0} c={s.c} p={[0, s.h + 0.02, 0]} s={0.032} />
        </group>
      ))}
      {stems.slice(0, n).map((s, i) => (
        <P key={`b${i}`} g={G.cone6} c={C.leafLight} p={[s.p[0] + 0.04, 0.05, s.p[2]]} s={[0.012, 0.1, 0.012]} shadow={false} />
      ))}
    </group>
  );
}

function FloweringBush({ stage, seed, variant }: ModelProps) {
  const flowerColor = [C.peach, '#F2A7B5', C.white][variant % 3];
  const dots = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 16 }, () => {
      const a = r() * Math.PI * 2;
      const el = 0.15 + r() * 1.1;
      const rad = 0.27;
      return [Math.cos(a) * Math.cos(el) * rad, 0.2 + Math.sin(el) * rad * 0.85, Math.sin(a) * Math.cos(el) * rad] as V3;
    });
  }, [seed]);
  const n = stage === 1 ? 5 : stage === 2 ? 10 : 16;
  return (
    <group>
      <P g={G.ico} c={C.forest} p={[0, 0.2, 0]} s={[0.27, 0.23, 0.27]} />
      <P g={G.ico} c={C.leaf} p={[0.17, 0.14, 0.09]} s={0.16} />
      <P g={G.ico} c={'#6E9E5E'} p={[-0.16, 0.13, -0.05]} s={0.16} />
      {stage >= 3 && <P g={G.ico} c={C.leaf} p={[0.02, 0.12, 0.2]} s={0.13} />}
      {dots.slice(0, n).map((d, i) => (
        <P key={i} g={G.ico0} c={i % 4 === 0 ? C.cream : flowerColor} p={d} s={0.04} />
      ))}
    </group>
  );
}

function FloweringPlant({ stage, variant }: ModelProps) {
  const color = variant % 2 ? C.periwinkle : C.lavender;
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.25, 0),
        new THREE.Vector3(0.04, 0.45, 0),
        new THREE.Vector3(0.16, 0.54, 0),
        new THREE.Vector3(0.27, 0.5, 0),
      ]),
    [],
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 20, 0.012, 5, false), [curve]);
  const bells = stage === 1 ? 2 : stage === 2 ? 4 : 6;
  return (
    <group>
      <mesh geometry={tube} material={mat(C.forest)} castShadow />
      {Array.from({ length: bells }, (_, i) => {
        const t = 0.55 + (i / Math.max(1, bells - 1)) * 0.45;
        const pt = curve.getPoint(Math.min(1, t));
        return (
          <group key={i} position={[pt.x, pt.y - 0.035, pt.z + (i % 2 ? 0.015 : -0.015)]}>
            <P g={G.cyl} c={C.forest} p={[0, 0.02, 0]} s={[0.004, 0.03, 0.004]} shadow={false} />
            <P g={G.bell} c={color} p={[0, -0.02, 0]} s={[0.032, 0.05, 0.032]} />
          </group>
        );
      })}
      <Leaf p={[0, 0.02, 0]} rotY={0.4} len={0.14} w={0.035} c={C.leaf} tilt={-0.9} />
      <Leaf p={[0, 0.02, 0]} rotY={2.6} len={0.12} w={0.03} c={C.forest} tilt={-0.9} />
      <Leaf p={[0, 0.02, 0]} rotY={4.4} len={0.13} w={0.03} c={C.leaf} tilt={-0.9} />
      {stage >= 3 && (
        <group position={[-0.1, 0, 0.08]} scale={0.6} rotation={[0, 2.4, 0]}>
          <mesh geometry={tube} material={mat(C.forest)} />
          {[0.7, 0.85, 1].map((t) => {
            const pt = curve.getPoint(t);
            return <P key={t} g={G.bell} c={color} p={[pt.x, pt.y - 0.05, pt.z]} s={[0.035, 0.055, 0.035]} />;
          })}
        </group>
      )}
    </group>
  );
}

function UniqueFlower({ stage, hue = 320 }: ModelProps) {
  const outer = `hsl(${hue}, 62%, 74%)`;
  const inner = `hsl(${(hue + 28) % 360}, 66%, 63%)`;
  const head = (scale: number) => (
    <group scale={scale} rotation={[-0.55, 0, 0]}>
      {Array.from({ length: 7 }, (_, i) => (
        <group key={`o${i}`} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
          <P g={G.sphere} c={new THREE.Color(outer).getStyle()} p={[0.075, 0, 0]} s={[0.07, 0.014, 0.042]} r={[0, 0, 0.2]} smooth />
        </group>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <group key={`i${i}`} rotation={[0, ((i + 0.5) / 7) * Math.PI * 2, 0]}>
          <P g={G.sphere} c={new THREE.Color(inner).getStyle()} p={[0.045, 0.018, 0]} s={[0.045, 0.012, 0.028]} r={[0, 0, 0.45]} smooth />
        </group>
      ))}
      <P g={G.ico} c={C.yellow} p={[0, 0.03, 0]} s={[0.032, 0.022, 0.032]} emissive={0.15} />
    </group>
  );
  return (
    <group>
      <Stem h={0.46} r={0.015} />
      <Leaf p={[0, 0.08, 0]} rotY={0.3} len={0.12} w={0.04} tilt={-0.7} />
      <Leaf p={[0, 0.16, 0]} rotY={3.3} len={0.1} w={0.035} c={C.forest} tilt={-0.7} />
      <group position={[0, 0.48, 0]}>{head(1)}</group>
      {stage >= 2 && (
        <group position={[0.07, 0, -0.04]}>
          <Stem h={0.24} r={0.01} tilt={[0, 0, -0.35]} />
          <group position={[0.1, 0.24, 0]}>{head(0.55)}</group>
        </group>
      )}
      {stage >= 3 && (
        <group position={[-0.07, 0, 0.05]}>
          <Stem h={0.3} r={0.01} tilt={[0.2, 0, 0.3]} />
          <group position={[-0.09, 0.29, 0.06]}>{head(0.65)}</group>
        </group>
      )}
    </group>
  );
}

// ——— GREENERY ————————————————————————————————————————————————

function GrassPatch({ stage, seed }: ModelProps) {
  const blades = useMemo(() => {
    const r = rng(seed);
    const colors = [C.leaf, C.leafLight, C.forest, '#6E9E5E'];
    return Array.from({ length: 26 }, () => ({
      p: [(r() - 0.5) * 0.6, 0, (r() - 0.5) * 0.6] as V3,
      h: 0.1 + r() * 0.16,
      c: colors[Math.floor(r() * colors.length)],
      tilt: [(r() - 0.5) * 0.5, 0, (r() - 0.5) * 0.5] as V3,
    }));
  }, [seed]);
  const n = stage === 1 ? 10 : stage === 2 ? 18 : 26;
  return (
    <group>
      <P g={G.disc} c={'#8FBF62'} p={[0, 0.006, 0]} s={[0.34, 0.012, 0.34]} shadow={false} />
      {blades.slice(0, n).map((b, i) => (
        <group key={i} position={b.p} rotation={b.tilt}>
          <P g={G.cone6} c={b.c} p={[0, b.h / 2, 0]} s={[0.022, b.h, 0.022]} />
        </group>
      ))}
      {stage >= 3 && (
        <>
          <P g={G.ico0} c={C.white} p={[0.12, 0.12, 0.1]} s={0.025} />
          <P g={G.ico0} c={C.white} p={[-0.15, 0.1, -0.05]} s={0.025} />
          <P g={G.ico0} c={C.yellow} p={[0.02, 0.15, -0.16]} s={0.022} />
        </>
      )}
    </group>
  );
}

function LeafyPlant({ stage }: ModelProps) {
  const n = stage === 1 ? 4 : stage === 2 ? 6 : 8;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 2) * 0.3;
        const tilt = -0.55 - (i % 2) * 0.35;
        const len = 0.17 + (i % 3) * 0.025;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <P g={G.cyl} c={C.forest} p={[0, 0.08, 0.04]} s={[0.008, 0.16, 0.008]} r={[0.45, 0, 0]} shadow={false} />
            <group position={[0, 0.15, 0.07]} rotation={[tilt, 0, 0]}>
              <P g={G.sphere} c={i % 2 ? C.forest : C.leaf} p={[0, 0, len * 0.85]} s={[0.075, 0.014, len]} />
            </group>
          </group>
        );
      })}
      <P g={G.ico} c={C.leafLight} p={[0, 0.2, 0]} s={[0.04, 0.08, 0.04]} />
    </group>
  );
}

function Fern({ stage }: ModelProps) {
  const n = stage === 1 ? 4 : stage === 2 ? 6 : 8;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const segs = 6;
        return (
          <group key={i} rotation={[0, a, 0]}>
            {Array.from({ length: segs }, (_, j) => {
              const t = j / segs;
              const z = 0.04 + t * 0.3;
              const y = 0.06 + Math.sin(t * Math.PI * 0.85) * 0.2;
              const s = 0.05 * (1 - t * 0.65);
              return (
                <group key={j} position={[0, y, z]} rotation={[-0.3 + t * 0.9, 0, 0]}>
                  <P g={G.sphere} c={i % 2 ? C.forest : '#6E9E5E'} s={[s * 1.6, 0.008, s * 0.7]} />
                </group>
              );
            })}
          </group>
        );
      })}
      {stage >= 3 && <P g={G.ico0} c={C.leafLight} p={[0, 0.06, 0]} s={0.05} />}
    </group>
  );
}

function Moss({ stage }: ModelProps) {
  return (
    <group>
      <P g={G.dodec} c={C.stone} p={[0, 0.09, 0]} s={[0.2, 0.13, 0.17]} />
      <P g={G.ico} c={C.leaf} p={[0.01, 0.17, 0]} s={[0.17, 0.06, 0.14]} />
      <P g={G.ico} c={C.sage} p={[-0.08, 0.15, 0.06]} s={[0.07, 0.04, 0.06]} />
      {stage >= 2 && (
        <>
          <P g={G.dodec} c={C.stoneDark} p={[0.2, 0.05, 0.12]} s={[0.09, 0.07, 0.08]} />
          <P g={G.ico} c={C.leafLight} p={[0.2, 0.1, 0.12]} s={[0.07, 0.03, 0.06]} />
        </>
      )}
      {stage >= 3 && (
        <group position={[-0.17, 0, 0.12]}>
          <P g={G.cyl} c={C.cream} p={[0, 0.04, 0]} s={[0.014, 0.08, 0.014]} />
          <P g={G.sphere} c={C.coral} p={[0, 0.08, 0]} s={[0.045, 0.028, 0.045]} />
          <P g={G.sphere} c={C.white} p={[0.02, 0.1, 0.02]} s={0.007} shadow={false} />
        </group>
      )}
    </group>
  );
}

// ——— WATER ————————————————————————————————————————————————

function Pond({ stage, seed }: ModelProps) {
  const stones = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 + r() * 0.2;
      return {
        p: [Math.cos(a) * 0.4, 0.02, Math.sin(a) * 0.34] as V3,
        s: 0.04 + r() * 0.035,
        c: r() > 0.5 ? C.stone : C.stoneDark,
      };
    });
  }, [seed]);
  const pads: V3[] = [
    [0.12, 0.034, 0.05],
    [-0.14, 0.034, -0.06],
    [0.02, 0.034, -0.15],
  ];
  return (
    <group>
      <P g={G.disc} c={C.waterDeep} p={[0, 0.008, 0]} s={[0.4, 0.016, 0.34]} smooth shadow={false} />
      <P g={G.disc} c={C.water} p={[0, 0.024, 0]} s={[0.36, 0.01, 0.3]} smooth shadow={false} emissive={0.08} />
      {stones.map((st, i) => (
        <P key={i} g={G.dodec} c={st.c} p={st.p} s={[st.s, st.s * 0.7, st.s]} />
      ))}
      {pads.slice(0, stage).map((p, i) => (
        <group key={i} position={p} rotation={[0, i * 2, 0]} name="lily">
          <P g={G.disc} c={C.leaf} s={[0.06, 0.006, 0.06]} shadow={false} />
          {stage >= 2 && i === 0 && (
            <group position={[0, 0.012, 0]}>
              {[0, 1.25, 2.5, 3.75, 5].map((a) => (
                <group key={a} rotation={[0, a, 0]}>
                  <P g={G.sphere} c={C.blossom} p={[0.014, 0.008, 0]} s={[0.018, 0.01, 0.01]} r={[0, 0, 0.5]} />
                </group>
              ))}
              <P g={G.sphere} c={C.yellow} p={[0, 0.012, 0]} s={0.008} />
            </group>
          )}
        </group>
      ))}
      {stage >= 3 &&
        [
          [-0.3, 0, 0.18],
          [-0.34, 0, 0.1],
          [-0.26, 0, 0.24],
        ].map((p, i) => (
          <group key={`r${i}`} position={p as V3} rotation={[0, 0, (i - 1) * 0.12]}>
            <P g={G.cyl} c={C.forest} p={[0, 0.14, 0]} s={[0.007, 0.28, 0.007]} shadow={false} />
            <P g={G.cyl} c={C.bark} p={[0, 0.25, 0]} s={[0.014, 0.06, 0.014]} />
          </group>
        ))}
    </group>
  );
}

// ——— Public API ————————————————————————————————————————————————

export interface ModelProps {
  stage: 1 | 2 | 3;
  variant: number;
  seed: number;
  hue?: number;
}

const MODELS: Record<PlantKind, (p: ModelProps) => React.JSX.Element> = {
  tree: Tree,
  floweringPlant: FloweringPlant,
  smallFlower: SmallFlower,
  floweringBush: FloweringBush,
  grassPatch: GrassPatch,
  leafyPlant: LeafyPlant,
  twinTrees: TwinTrees,
  sapling: Sapling,
  pond: Pond,
  uniqueFlower: UniqueFlower,
  fern: Fern,
  tulip: Tulip,
  moss: Moss,
  wildflowers: Wildflowers,
};

/** Visual size per growth stage. Ponds spread rather than shrink. */
export function stageScale(kind: PlantKind, stage: 1 | 2 | 3): number {
  if (kind === 'pond') return stage === 1 ? 0.8 : stage === 2 ? 0.9 : 1;
  if (kind === 'grassPatch') return stage === 1 ? 0.8 : stage === 2 ? 0.9 : 1;
  const k = kind === 'tree' || kind === 'twinTrees' ? 1.25 : 1.35; // everything reads a little larger on the island
  if (kind === 'moss') return (stage === 1 ? 0.75 : stage === 2 ? 0.88 : 1) * 1.2;
  return (stage === 1 ? 0.66 : stage === 2 ? 0.85 : 1) * k;
}

export function PlantModel({ plant, stage }: { plant: Pick<Plant, 'id' | 'kind' | 'variant' | 'hue'>; stage?: 1 | 2 | 3 }) {
  const s = stage ?? 1;
  const seed = useMemo(() => hashString(plant.id), [plant.id]);
  const Model = MODELS[plant.kind] ?? Sapling;
  return <Model stage={s} variant={plant.variant} seed={seed} hue={plant.hue} />;
}

/** How strongly a kind sways in the breeze. */
export function swayAmount(kind: PlantKind): number {
  switch (kind) {
    case 'pond':
    case 'moss':
      return 0;
    case 'tree':
    case 'twinTrees':
      return 0.018;
    case 'floweringBush':
    case 'leafyPlant':
      return 0.025;
    default:
      return 0.05;
  }
}
