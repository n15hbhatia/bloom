import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { C, G, mat } from './materials';
import { STREAM_X, bridgeZ } from '../../utils/garden';
import { hash2 } from '../../utils/dates';

const GRASS_H = 0.24;

function useTopTexture(size: number) {
  return useMemo(() => {
    const px = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size * px;
    const ctx = canvas.getContext('2d')!;
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        if (x === STREAM_X) continue;
        ctx.fillStyle = (x + z) % 2 === 0 ? C.grass : '#A1CB73';
        ctx.fillRect(x * px, z * px, px, px);
        // soft speckles
        for (let i = 0; i < 7; i++) {
          const r = hash2(x * 7 + i, z * 13 + i, 3);
          const r2 = hash2(z * 5 + i, x * 11 + i, 9);
          ctx.fillStyle = r > 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(53,84,61,0.07)';
          ctx.beginPath();
          ctx.ellipse(x * px + r * px, z * px + r2 * px, 2.5 + r * 3, 1.6 + r2 * 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [size]);
}

function Tufts({ size, reduced }: { size: number; reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const out: { x: number; z: number; h: number; c: THREE.Color; rot: number }[] = [];
    const o = (size - 1) / 2;
    const colors = [C.leaf, C.forest, '#6E9E5E', C.leafLight].map((c) => new THREE.Color(c));
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        if (x === STREAM_X) continue;
        const corners: [number, number][] = [
          [0.36, 0.36],
          [-0.36, 0.34],
          [0.34, -0.38],
          [-0.38, -0.36],
        ];
        corners.forEach(([dx, dz], i) => {
          if (hash2(x, z, i + 1) > 0.42) return;
          for (let b = 0; b < 3; b++) {
            out.push({
              x: x - o + dx + (b - 1) * 0.035,
              z: z - o + dz + (hash2(b, i, x) - 0.5) * 0.05,
              h: 0.06 + hash2(x + b, z + i, 7) * 0.07,
              c: colors[(x + z + b + i) % colors.length],
              rot: (b - 1) * 0.35,
            });
          }
        });
      }
    }
    return out;
  }, [size]);

  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new THREE.Object3D();
    items.forEach((it, i) => {
      d.position.set(it.x, it.h / 2, it.z);
      d.rotation.set(0, 0, it.rot);
      d.scale.set(0.018, it.h, 0.018);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, it.c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);
  const flowersRef = useRef<THREE.InstancedMesh>(null);
  const flowers = useMemo(() => {
    const cols = ['#FBFAF4', '#F2C66D', '#F4C3CF', '#FBFAF4'].map((c) => new THREE.Color(c));
    return items.filter((_, i) => i % 3 === 1 && hash2(i, 9, 4) < 0.35).map((it, i) => ({ ...it, c: cols[i % cols.length] }));
  }, [items]);
  useEffect(() => {
    const m = flowersRef.current;
    if (!m) return;
    const d = new THREE.Object3D();
    flowers.forEach((it, i) => {
      d.position.set(it.x, it.h + 0.01, it.z);
      d.rotation.set(0, 0, 0);
      d.scale.setScalar(0.022);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, it.c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [flowers]);
  void reduced;
  return (
    <>
      <instancedMesh ref={ref} args={[G.cone6, undefined, items.length]} key={items.length} castShadow={false} receiveShadow>
        <meshStandardMaterial flatShading roughness={0.9} />
      </instancedMesh>
      {flowers.length > 0 && (
        <instancedMesh ref={flowersRef} args={[G.ico0, undefined, flowers.length]} key={`f${flowers.length}`}>
          <meshStandardMaterial flatShading roughness={0.8} />
        </instancedMesh>
      )}
    </>
  );
}

function Stream({ size, reduced }: { size: number; reduced: boolean }) {
  const o = (size - 1) / 2;
  const x = STREAM_X - o;
  const sparkles = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (reduced || !sparkles.current) return;
    const t = clock.getElapsedTime();
    sparkles.current.children.forEach((c, i) => {
      const span = size;
      const z = ((t * 0.25 + i * (span / 7)) % span) - span / 2;
      c.position.z = z;
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.55 * Math.sin(((z + span / 2) / span) * Math.PI);
    });
  });
  const lilies = useMemo(
    () =>
      Array.from({ length: Math.max(2, Math.floor(size / 2)) }, (_, i) => {
        const z = (hash2(i, size, 4) - 0.5) * (size - 1.2);
        return { z, dx: (hash2(i, 2, 8) - 0.5) * 0.5, flower: i % 2 === 0 };
      }).filter((l) => Math.abs(l.z - (bridgeZ(size) - o)) > 0.7),
    [size, o],
  );
  return (
    <group position={[x, 0, 0]}>
      {/* channel bed */}
      <mesh position={[0, -0.16, 0]} receiveShadow geometry={G.box} scale={[1, 0.16, size]} material={mat(C.soil1)} />
      {/* water */}
      <mesh position={[0, -0.075, 0]} receiveShadow geometry={G.box} scale={[1.001, 0.02, size + 0.002]} material={mat(C.water, { smooth: true, emissive: 0.12 })} />
      {/* soft banks */}
      <mesh position={[-0.47, -0.04, 0]} geometry={G.box} scale={[0.06, 0.06, size]} material={mat(C.waterDeep, { smooth: true })} />
      <mesh position={[0.47, -0.04, 0]} geometry={G.box} scale={[0.06, 0.06, size]} material={mat(C.waterDeep, { smooth: true })} />
      <group ref={sparkles}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[((i % 3) - 1) * 0.22, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.12, 0.03, 1]}>
            <circleGeometry args={[1, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={reduced ? 0.3 : 0} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {lilies.map((l, i) => (
        <group key={i} position={[l.dx, -0.06, l.z]}>
          <mesh geometry={G.disc} material={mat(C.leaf)} scale={[0.09, 0.008, 0.09]} />
          {l.flower && <mesh geometry={G.ico0} material={mat(C.blossom)} position={[0.02, 0.02, 0]} scale={0.028} />}
        </group>
      ))}
      <Bridge z={bridgeZ(size) - o} />
    </group>
  );
}

function Bridge({ z }: { z: number }) {
  const planks = 7;
  return (
    <group position={[0, 0, z]}>
      {Array.from({ length: planks }, (_, i) => {
        const t = i / (planks - 1);
        const x = (t - 0.5) * 1.15;
        const y = Math.sin(t * Math.PI) * 0.16 + 0.02;
        const ang = Math.cos(t * Math.PI) * 0.5;
        return (
          <mesh
            key={i}
            geometry={G.box}
            material={mat(i % 2 ? C.bridge : C.bridgeDark)}
            position={[x, y, 0]}
            rotation={[0, 0, ang]}
            scale={[0.16, 0.04, 0.46]}
            castShadow
            receiveShadow
          />
        );
      })}
      {[-0.23, 0.23].map((zz) => (
        <group key={zz} position={[0, 0, zz]}>
          {[0, 0.5, 1].map((t) => {
            const x = (t - 0.5) * 1.0;
            const y = Math.sin(t * Math.PI) * 0.16;
            return <mesh key={t} geometry={G.box} material={mat(C.bridgeDark)} position={[x, y + 0.12, 0]} scale={[0.04, 0.2, 0.04]} castShadow />;
          })}
          {[0.25, 0.75].map((t) => {
            const x = (t - 0.5) * 1.0;
            const y = Math.sin(t * Math.PI) * 0.16 + 0.2;
            return (
              <mesh
                key={`r${t}`}
                geometry={G.box}
                material={mat(C.bridge)}
                position={[x, y, 0]}
                rotation={[0, 0, t < 0.5 ? 0.3 : -0.3]}
                scale={[0.54, 0.03, 0.03]}
                castShadow
              />
            );
          })}
        </group>
      ))}
    </group>
  );
}

function Rocks({ size }: { size: number }) {
  const o = (size - 1) / 2;
  const rocks = useMemo(() => {
    const out: { p: [number, number, number]; s: number; c: string }[] = [];
    for (let z = 0; z < size; z++) {
      if (z === bridgeZ(size)) continue;
      for (const side of [-1, 1]) {
        const h = hash2(z, side + 5, 11);
        if (h > 0.45) continue;
        out.push({
          p: [STREAM_X - o + side * 0.5, 0.01, z - o + (hash2(z, side, 2) - 0.5) * 0.6],
          s: 0.05 + h * 0.08,
          c: h > 0.2 ? C.stone : C.stoneDark,
        });
      }
    }
    return out;
  }, [size, o]);
  return (
    <>
      {rocks.map((r, i) => (
        <mesh key={i} geometry={G.dodec} material={mat(r.c)} position={r.p} scale={[r.s, r.s * 0.65, r.s * 0.9]} castShadow receiveShadow />
      ))}
    </>
  );
}

export function Island({ size, reduced }: { size: number; reduced: boolean }) {
  const tex = useTopTexture(size);
  const o = (size - 1) / 2;
  const leftW = STREAM_X; // tiles left of stream
  const rightW = size - STREAM_X - 1;
  const half = size / 2;

  return (
    <group>
      {/* grass slabs either side of the stream */}
      {leftW > 0 && (
        <RoundedBox
          args={[leftW, GRASS_H, size]}
          radius={0.05}
          smoothness={3}
          position={[-half + leftW / 2, -GRASS_H / 2, 0]}
          material={mat(C.grassDark)}
          receiveShadow
        />
      )}
      <RoundedBox
        args={[rightW, GRASS_H, size]}
        radius={0.05}
        smoothness={3}
        position={[half - rightW / 2, -GRASS_H / 2, 0]}
        material={mat(C.grassDark)}
        receiveShadow
      />
      {/* tile texture on top */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={tex} transparent roughness={0.95} />
      </mesh>

      <Stream size={size} reduced={reduced} />

      {/* layered soil — steps inward like a floating island */}
      <RoundedBox args={[size, 0.1, size]} radius={0.04} smoothness={2} position={[0, -GRASS_H - 0.05, 0]} material={mat(C.soil1)} />
      <RoundedBox args={[size - 0.04, 0.62, size - 0.04]} radius={0.06} smoothness={2} position={[0, -GRASS_H - 0.1 - 0.31, 0]} material={mat(C.soil2)} />
      <RoundedBox args={[size * 0.9, 0.5, size * 0.9]} radius={0.08} smoothness={2} position={[0, -GRASS_H - 0.72 - 0.25, 0]} material={mat(C.soil3)} />
      <RoundedBox args={[size * 0.72, 0.42, size * 0.72]} radius={0.1} smoothness={2} position={[0, -GRASS_H - 1.22 - 0.21, 0]} material={mat(C.soil4)} />
      <RoundedBox args={[size * 0.46, 0.34, size * 0.46]} radius={0.1} smoothness={2} position={[0, -GRASS_H - 1.64 - 0.17, 0]} material={mat('#5C4636')} />
      <RoundedBox args={[size * 0.2, 0.26, size * 0.2]} radius={0.08} smoothness={2} position={[0, -GRASS_H - 1.98 - 0.13, 0]} material={mat('#4E3B2E')} />

      {/* pebbles in the soil wall */}
      {Array.from({ length: size * 3 }, (_, i) => {
        const side = i % 2;
        const t = hash2(i, size, 21) - 0.5;
        const y = -GRASS_H - 0.2 - hash2(i, 3, 5) * 0.5;
        const pos: [number, number, number] = side ? [t * (size - 0.4), y, half + 0.005] : [half + 0.005, y, t * (size - 0.4)];
        return (
          <mesh key={i} position={pos} rotation={side ? [0, 0, 0] : [0, Math.PI / 2, 0]} scale={[0.08 + hash2(i, 1, 1) * 0.06, 0.04, 1]}>
            <circleGeometry args={[1, 10]} />
            <meshStandardMaterial color={i % 3 ? '#86684F' : '#A88A6A'} roughness={1} />
          </mesh>
        );
      })}

      <Tufts size={size} reduced={reduced} />
      <Rocks size={size} />
      {/* unused offset kept for clarity */}
      <group position={[-o, 0, -o]} />
    </group>
  );
}
