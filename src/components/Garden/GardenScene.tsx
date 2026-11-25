import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Plant } from '../../types';
import { Island } from './Island';
import { GardenPlant } from './GardenPlant';

export interface GardenHandle {
  zoomBy: (f: number) => void;
  reset: () => void;
}

interface SceneProps {
  size: number;
  plants: Plant[];
  newId?: string;
  selectedId: string | null;
  reduced: boolean;
  onSelect: (id: string | null) => void;
  compact?: boolean;
}

const CAM_DIR = new THREE.Vector3(1, 0.82, 1).normalize();
const DIST = 40;

function fitZoom(w: number, h: number, size: number, compact: boolean) {
  const narrow = w < 640;
  const across = size * 1.414 + (narrow ? 0.1 : 0.8); // diamond width
  const tall = size * 0.82 + 3.4; // diamond height + soil + tall trees
  return Math.min(w / across, h / tall) * (compact ? 0.98 : narrow ? 1 : 0.92);
}

const Rig = forwardRef<GardenHandle, { size: number; reduced: boolean; compact: boolean }>(function Rig({ size, reduced, compact }, ref) {
  const { camera, size: view, invalidate } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const base = useRef(1);

  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    const z = fitZoom(view.width, view.height, size, compact);
    base.current = z;
    cam.zoom = z;
    cam.updateProjectionMatrix();
    if (controls.current) {
      controls.current.minZoom = z * 0.7;
      controls.current.maxZoom = z * 3;
      controls.current.update();
    }
    invalidate();
  }, [view.width, view.height, size, camera, invalidate, compact]);

  useEffect(() => {
    // Let vertical swipes scroll the page on touch screens; horizontal drags rotate.
    const el = (controls.current as unknown as { domElement?: HTMLElement })?.domElement;
    if (el) el.style.touchAction = 'pan-y';
  });

  useImperativeHandle(ref, () => ({
    zoomBy(f: number) {
      const cam = camera as THREE.OrthographicCamera;
      cam.zoom = THREE.MathUtils.clamp(cam.zoom * f, base.current * 0.7, base.current * 3);
      cam.updateProjectionMatrix();
      invalidate();
    },
    reset() {
      const cam = camera as THREE.OrthographicCamera;
      cam.position.copy(CAM_DIR.clone().multiplyScalar(DIST));
      cam.zoom = base.current;
      cam.updateProjectionMatrix();
      controls.current?.target.set(0, -0.3, 0);
      controls.current?.update();
      invalidate();
    },
  }));

  const polar = Math.acos(CAM_DIR.y);
  return (
    <OrbitControls
      ref={controls}
      target={[0, -0.3, 0]}
      enablePan={false}
      enableZoom
      enableDamping={!reduced}
      dampingFactor={0.08}
      rotateSpeed={0.6}
      minPolarAngle={polar - 0.18}
      maxPolarAngle={polar + 0.12}
      minAzimuthAngle={Math.PI / 4 - 1.0}
      maxAzimuthAngle={Math.PI / 4 + 1.0}
    />
  );
});

function Float({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (reduced || !ref.current) return;
    ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.6) * 0.04;
  });
  return <group ref={ref}>{children}</group>;
}

export const GardenScene = forwardRef<GardenHandle, SceneProps>(function GardenScene(
  { size, plants, newId, selectedId, reduced, onSelect, compact = false },
  ref,
) {
  const [hovered, setHovered] = useState<string | null>(null);
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);

  const offset = (size - 1) / 2;
  const camPos = CAM_DIR.clone().multiplyScalar(DIST);

  return (
    <Canvas
      orthographic
      shadows="soft"
      dpr={[1, 2]}
      frameloop={reduced ? 'demand' : 'always'}
      camera={{ position: [camPos.x, camPos.y, camPos.z], zoom: 40, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      onPointerMissed={() => onSelect(null)}
      aria-label="Your 3D garden. Drag to look around, tap a plant to learn about it."
      role="img"
    >
      <hemisphereLight args={['#FFFDF5', '#B8D1B9', 1.15]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 12, 3]}
        intensity={1.9}
        color="#FFF6E8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-size}
        shadow-camera-right={size}
        shadow-camera-top={size}
        shadow-camera-bottom={-size}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />
      <directionalLight position={[-6, 4, 8]} intensity={0.35} color="#D9E9F2" />

      <Float reduced={reduced}>
        <Island size={size} reduced={reduced} />
        {plants.map((p) => (
          <GardenPlant
            key={p.id}
            plant={p}
            offset={offset}
            isNew={p.id === newId}
            selected={p.id === selectedId}
            reduced={reduced}
            onSelect={(id) => onSelect(id)}
            onHover={setHovered}
          />
        ))}
        {!reduced && (
          <Sparkles count={Math.min(40, 10 + size * 2)} scale={[size, 2, size]} position={[0, 1, 0]} size={2.2} speed={0.25} opacity={0.55} color="#FFF3D6" />
        )}
      </Float>

      <Rig ref={ref} size={size} reduced={reduced} compact={compact} />
    </Canvas>
  );
});
