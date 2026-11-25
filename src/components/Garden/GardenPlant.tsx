import { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Plant } from '../../types';
import { PlantModel, stageScale, swayAmount } from './PlantModels';
import { C, G } from './materials';
import { hashString } from '../../utils/dates';

const easeOutBack = (t: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

interface Props {
  plant: Plant;
  offset: number;
  isNew: boolean;
  selected: boolean;
  reduced: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const GROW_SECONDS = 1.9;

export function GardenPlant({ plant, offset, isNew, selected, reduced, onSelect, onHover }: Props) {
  const outer = useRef<THREE.Group>(null);
  const swayRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const particles = useRef<THREE.Group>(null);
  const born = useRef<number | null>(isNew && !reduced ? -1 : null);
  const prevStage = useRef(plant.stage);
  const pop = useRef(0);
  const [hovered, setHovered] = useState(false);

  const seed = useMemo(() => hashString(plant.id), [plant.id]);
  const rotY = useMemo(() => seed * Math.PI * 2, [seed]);
  const phase = seed * 10;
  const sway = swayAmount(plant.kind);
  const target = stageScale(plant.kind, plant.stage);

  useEffect(() => {
    if (prevStage.current !== plant.stage && !reduced) pop.current = 1;
    prevStage.current = plant.stage;
  }, [plant.stage, reduced]);

  const particleSeeds = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        a: (i / 12) * Math.PI * 2,
        r: 0.15 + ((i * 37) % 10) / 40,
        speed: 0.35 + ((i * 53) % 10) / 25,
        color: [C.leafLight, C.peach, C.cream, C.blossom][i % 4],
      })),
    [],
  );

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const g = outer.current;
    if (!g) return;

    // grow-in
    let s = target;
    if (born.current !== null) {
      if (born.current < 0) born.current = t;
      const k = Math.min(1, (t - born.current) / GROW_SECONDS);
      // seed pops in, pauses, then the plant rises
      const k2 = Math.max(0, (k - 0.15) / 0.85);
      s = target * (k < 0.15 ? 0.12 * (k / 0.15) : 0.12 + 0.88 * easeOutBack(k2));
      if (particles.current) {
        particles.current.visible = k < 1;
        particles.current.children.forEach((c, i) => {
          const ps = particleSeeds[i];
          const life = Math.min(1, (t - born.current!) / (GROW_SECONDS * 1.2));
          c.position.set(Math.cos(ps.a + life) * ps.r * (0.4 + life), 0.1 + life * ps.speed * 1.4, Math.sin(ps.a + life) * ps.r * (0.4 + life));
          const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
          m.opacity = (1 - life) * 0.9;
        });
      }
      if (k >= 1) born.current = null;
    }
    // pop when reaching a new growth stage
    if (pop.current > 0) {
      pop.current = Math.max(0, pop.current - delta * 1.4);
      s *= 1 + Math.sin(pop.current * Math.PI) * 0.12;
    }
    const hoverLift = hovered ? 1.04 : 1;
    g.scale.setScalar(s * hoverLift);

    if (!reduced && swayRef.current && sway > 0) {
      swayRef.current.rotation.z = Math.sin(t * 1.1 + phase) * sway;
      swayRef.current.rotation.x = Math.cos(t * 0.8 + phase) * sway * 0.6;
    }
    if (ringRef.current) {
      const pulse = reduced ? 1 : 1 + Math.sin(t * 3) * 0.04;
      ringRef.current.scale.set(0.46 * pulse, 0.46 * pulse, 0.46 * pulse);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(plant.id);
  };

  return (
    <group position={[plant.x - offset, 0, plant.z - offset]}>
      {/* invisible hit area makes small plants easy to tap */}
      <mesh
        position={[0, 0.35, 0]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(plant.id);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
        }}
        visible={false}
      >
        <boxGeometry args={[0.9, 0.8, 0.9]} />
      </mesh>

      {(selected || hovered) && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} geometry={G.ring}>
          <meshBasicMaterial color={selected ? '#FFFFFF' : '#F7F6F0'} transparent opacity={selected ? 0.95 : 0.6} />
        </mesh>
      )}

      <group ref={outer} scale={born.current !== null ? 0.001 : target}>
        <group ref={swayRef} rotation={[0, rotY, 0]}>
          <PlantModel plant={plant} stage={plant.stage} />
        </group>
      </group>

      {isNew && !reduced && (
        <group ref={particles}>
          {particleSeeds.map((p, i) => (
            <mesh key={i} geometry={G.ico0} scale={0.03}>
              <meshBasicMaterial color={p.color} transparent opacity={0} depthWrite={false} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
