import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Plant } from '../../types';
import { GardenPlant } from './GardenPlant';
import { C, mat } from './materials';
import { stageScale } from './PlantModels';

const HEIGHT: Partial<Record<Plant['kind'], number>> = { tree: 1.3, twinTrees: 1.0, floweringPlant: 0.6, uniqueFlower: 0.6, sapling: 0.55 };

function Fit({ plant, zoom }: { plant: Plant; zoom?: number }) {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const h = (HEIGHT[plant.kind] ?? 0.4) * stageScale(plant.kind, plant.stage);
    const cam = camera as THREE.OrthographicCamera;
    cam.zoom = zoom ?? Math.min(size.height / (h * 0.85 + 1.25), size.width / 2.1);
    cam.lookAt(0, h * 0.42 - 0.22, 0);
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size, plant.kind, plant.stage, zoom, invalidate]);
  return null;
}

const DIR = new THREE.Vector3(1, 0.75, 1).normalize().multiplyScalar(20);

/** A single plant on a tiny floating tile — used for planting moments and the plant library. */
export function PlantPreview({
  plant,
  animate = true,
  reduced,
  zoom,
  spin = false,
}: {
  plant: Plant;
  animate?: boolean;
  reduced: boolean;
  zoom?: number;
  spin?: boolean;
}) {
  return (
    <Canvas
      orthographic
      shadows
      dpr={[1, 2]}
      frameloop={reduced ? 'demand' : 'always'}
      camera={{ position: [DIR.x, DIR.y, DIR.z], zoom: 100, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true }}
      aria-hidden
    >
      <Fit plant={plant} zoom={zoom} />
      <hemisphereLight args={['#FFFDF5', '#B8D1B9', 1.2]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 8, 2]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <group rotation={[0, spin ? 0.3 : 0, 0]}>
        <RoundedBox args={[1.25, 0.16, 1.25]} radius={0.05} position={[0, -0.08, 0]} material={mat(C.grass)} receiveShadow />
        <RoundedBox args={[1.2, 0.3, 1.2]} radius={0.05} position={[0, -0.3, 0]} material={mat(C.soil2)} />
        <RoundedBox args={[0.85, 0.22, 0.85]} radius={0.06} position={[0, -0.55, 0]} material={mat(C.soil3)} />
        <GardenPlant plant={{ ...plant, x: 0, z: 0 }} offset={0} isNew={animate} selected={false} reduced={reduced} onSelect={() => {}} onHover={() => {}} />
      </group>
    </Canvas>
  );
}
