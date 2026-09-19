"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls, RoundedBox, Sky } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

function seededScatter(count, seed, spread = 36) {
  return Array.from({ length: count }, (_, index) => {
    const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
    const z = Math.sin(seed * 39.3467 + index * 17.719) * 24634.6345;
    return [((x - Math.floor(x)) * 2 - 1) * spread, ((z - Math.floor(z)) * 2 - 1) * spread];
  });
}

function createTerrainGeometry() {
  const geometry = new THREE.PlaneGeometry(90, 90, 80, 80);
  const position = geometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const contour = Math.sin(x * 0.42) * 0.34 + Math.cos(y * 0.36) * 0.28 + Math.sin((x + y) * 0.18) * 0.24;
    const mound = Math.max(0, 1 - (Math.abs(x) + Math.abs(y)) / 58) * 0.22;
    position.setZ(index, contour + mound);
  }

  geometry.computeVertexNormals();
  return geometry;
}

function Terrain({ weather, detail = 1 }) {
  const counts = {
    patches: detail === 1 ? 42 : 20,
    rocks: detail === 1 ? 28 : 14,
    beds: detail === 1 ? 12 : 6,
    trees: detail === 1 ? 64 : 30,
    shrubs: detail === 1 ? 20 : 10,
    stones: detail === 1 ? 22 : 10,
    grass: detail === 1 ? 75 : 28,
  };

  const terrainGeometry = useMemo(() => createTerrainGeometry(), []);
  const soilPatches = useMemo(() => seededScatter(28, 11, 40), []);

  return (
    <group>
      <mesh geometry={terrainGeometry} rotation-x={-Math.PI / 2} receiveShadow>
        <meshStandardMaterial color="#2e4d39" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.012} receiveShadow>
        <planeGeometry args={[7, 90]} />
        <meshStandardMaterial color="#c5b89b" roughness={0.9} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.014} receiveShadow>
        <planeGeometry args={[90, 7]} />
        <meshStandardMaterial color="#c5b89b" roughness={0.9} />
      </mesh>
      {soilPatches.map(([x, z], index) => (
        <mesh key={`soil-${index}`} position={[x, 0.028 + (index % 3) * 0.009, z]} rotation-x={-Math.PI / 2} scale={0.9 + (index % 4) * 0.25} receiveShadow>
          <circleGeometry args={[1.2, 16]} />
          <meshStandardMaterial color={index % 3 === 0 ? "#4c684d" : index % 3 === 1 ? "#5e7857" : "#49684a"} roughness={1} />
        </mesh>
      ))}
      {[-28, -20, -12, 12, 20, 28].map((x) => <mesh key={`path-x-${x}`} rotation-x={-Math.PI / 2} position={[x, 0.016, 0]}><planeGeometry args={[2, 90]} /><meshStandardMaterial color="#788b6e" roughness={1} /></mesh>)}
      {[-28, -18, 18, 28].map((z) => <mesh key={`path-z-${z}`} rotation-x={-Math.PI / 2} position={[0, 0.018, z]}><planeGeometry args={[90, 2]} /><meshStandardMaterial color="#788b6e" roughness={1} /></mesh>)}
      {[-28, -18, 18, 28].flatMap((z) => [-40, -30, -20, -10, 0, 10, 20, 30, 40].map((x) => <PathTile key={`tile-z-${z}-${x}`} position={[x, 0.035, z]} rotation-y={Math.PI / 2} />))}
      {[-28, -20, -12, 12, 20, 28].flatMap((x) => [-35, -25, -15, -5, 5, 15, 25, 35].map((z) => <PathTile key={`tile-x-${x}-${z}`} position={[x, 0.036, z]} />))}
      {[-32, -22, -12, 12, 22, 32].flatMap((x) => [-27, -17, 17, 27].map((z) => <PathBorder key={`border-${x}-${z}`} position={[x, 0.08, z]} rotation-y={Math.abs(x) % 2 ? Math.PI / 2 : 0} />))}
      {seededScatter(counts.patches, 2, 38).map(([x, z], index) => <GroundPatch key={`patch-${index}`} position={[x, 0.025, z]} scale={0.7 + (index % 4) * 0.22} />)}
      {seededScatter(counts.rocks, 3, 37).map(([x, z], index) => <GroundRock key={`rock-${index}`} position={[x, 0.05, z]} scale={0.5 + (index % 3) * 0.2} />)}
      {seededScatter(counts.beds, 4, 28).map(([x, z], index) => <FlowerBed key={`bed-${index}`} position={[x, 0.04, z]} />)}
      {(weather === "rain" || weather === "storm") && seededScatter(detail === 1 ? 18 : 8, 5, 30).map(([x, z], index) => <Puddle key={`puddle-${index}`} position={[x, 0.025, z]} scale={0.5 + (index % 3) * 0.25} />)}
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}><ringGeometry args={[7, 8, 48]} /><meshStandardMaterial color="#b5a484" roughness={1} /></mesh>
      {seededScatter(counts.trees, 6, 38).map(([x, z], index) => <Tree key={`tree-${index}`} position={[x, 0, z]} scale={0.7 + (index % 4) * 0.12} />)}
      {seededScatter(counts.shrubs, 7, 35).map(([x, z], index) => <Shrub key={`shrub-${index}`} position={[x, 0, z]} />)}
      {seededScatter(counts.stones, 8, 27).map(([x, z], index) => <AmbientStone key={`stone-${index}`} position={[x, 0, z]} rotation={Math.sin(index * 2.4) * 0.35} />)}
      {seededScatter(counts.grass, 9, 39).map(([x, z], index) => <GrassTuft key={`grass-${index}`} position={[x, 0.02, z]} />)}
      <Entrance />
      <Gazebo position={[26, 0, 26]} />
      <Fountain />
      {[-14, -7, 7, 14].map((x) => <Bench key={`bench-${x}`} position={[x, 0, 12]} rotation={[0, 0, x > 0 ? 0.04 : -0.04]} />)}
      {[-24, -12, 0, 12, 24].map((x) => <Lantern key={`lantern-a-${x}`} position={[x, 0, -6]} />)}
      {[-24, -12, 0, 12, 24].map((x) => <Lantern key={`lantern-b-${x}`} position={[x, 0, 6]} />)}
    </group>
  );
}

function PathTile({ position, rotation }) {
  return <mesh position={position} rotation-y={rotation} receiveShadow><boxGeometry args={[1.65, 0.06, 1.25]} /><meshStandardMaterial color="#a69b82" roughness={1} /></mesh>;
}

function PathBorder({ position, rotation }) {
  return <mesh position={position} rotation-y={rotation} castShadow><boxGeometry args={[0.22, 0.18, 2.4]} /><meshStandardMaterial color="#6d7564" roughness={0.95} /></mesh>;
}

function GroundPatch({ position, scale }) {
  return <group position={position} scale={scale}><mesh rotation-x={-Math.PI / 2} receiveShadow><circleGeometry args={[1.35, 12]} /><meshStandardMaterial color="#355943" roughness={1} /></mesh><mesh position={[0.25, 0.015, -0.2]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.5, 10]} /><meshStandardMaterial color="#496c48" roughness={1} /></mesh></group>;
}

function GroundRock({ position, scale }) {
  return <RoundedBox position={position} scale={scale} rotation={[0.1, position[0] * 0.1, 0.2]} args={[0.6, 0.38, 0.5]} radius={0.12} smoothness={3} castShadow><meshStandardMaterial color="#77796b" roughness={0.95} /></RoundedBox>;
}

function FlowerBed({ position }) {
  return <group position={position}>{Array.from({ length: 7 }).map((_, index) => <group key={index} position={[(index % 3) * 0.28 - 0.28, 0, Math.floor(index / 3) * 0.3 - 0.3]}><mesh position-y={0.22}><cylinderGeometry args={[0.018, 0.025, 0.42, 5]} /><meshStandardMaterial color="#58734b" /></mesh><mesh position-y={0.44} scale={[0.11, 0.06, 0.11]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color={index % 2 ? "#d88c85" : "#e5bd72" } /></mesh></group>)}</group>;
}

function Puddle({ position, scale }) {
  return <mesh position={position} rotation-x={-Math.PI / 2} scale={scale}><circleGeometry args={[1, 16]} /><meshPhysicalMaterial color="#72999a" transparent opacity={0.42} roughness={0.08} metalness={0.15} clearcoat={1} /></mesh>;
}

function GrassTuft({ position }) {
  return <group position={position} rotation-y={(position[0] + position[2]) % 3}><mesh rotation-z={-0.25} position-x={-0.06}><coneGeometry args={[0.025, 0.32, 4]} /><meshStandardMaterial color="#608054" /></mesh><mesh rotation-z={0.25} position-x={0.06}><coneGeometry args={[0.025, 0.27, 4]} /><meshStandardMaterial color="#78935c" /></mesh></group>;
}

function Tree({ position, scale = 1 }) {
  return <group position={position} scale={scale}>
    <mesh position-y={1.35} castShadow><cylinderGeometry args={[0.2, 0.46, 2.7, 12]} /><meshStandardMaterial color="#4d382a" roughness={1} /></mesh>
    <Branch start={[0, 2.25, 0]} end={[-0.95, 3.65, 0.08]} radius={0.16} />
    <Branch start={[0.04, 2.45, 0]} end={[0.95, 3.75, -0.12]} radius={0.15} />
    <Branch start={[-0.12, 3.05, 0.02]} end={[-1.5, 4.25, 0.15]} radius={0.11} />
    <Branch start={[0.24, 3.15, -0.05]} end={[1.45, 4.35, -0.2]} radius={0.1} />
    <Branch start={[-0.55, 3.5, 0.08]} end={[-0.65, 4.45, 0.35]} radius={0.075} />
    <Branch start={[0.65, 3.55, -0.12]} end={[0.85, 4.55, -0.32]} radius={0.07} />
    <Root start={[-0.08, 0.18, 0]} end={[-0.95, 0.04, 0.12]} rotation-y={-0.18} />
    <Root start={[0.12, 0.18, 0]} end={[0.9, 0.04, -0.18]} rotation-y={0.22} />
    <Root start={[0, 0.18, 0.08]} end={[0.08, 0.04, 0.9]} rotation-y={Math.PI / 2} />
    <BarkRidges />
    <FoliageCluster position={[-1.25, 4.25, 0.12]} scale={0.92} color="#315a3b" />
    <FoliageCluster position={[1.3, 4.35, -0.16]} scale={0.88} color="#3f6d46" />
    <FoliageCluster position={[-0.55, 4.8, 0.32]} scale={0.76} color="#426f48" />
    <FoliageCluster position={[0.72, 4.95, -0.28]} scale={0.7} color="#2b5338" />
    <FoliageCluster position={[0, 4.25, 0]} scale={0.62} color="#527a4d" />
  </group>;
}

function Branch({ start, end, radius }) {
  const midpoint = start.map((value, index) => (value + end[index]) / 2);
  const direction = new THREE.Vector3(...end).sub(new THREE.Vector3(...start));
  return <mesh position={midpoint} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize())} castShadow><cylinderGeometry args={[radius * 0.48, radius, direction.length(), 9]} /><meshStandardMaterial color="#503a2b" roughness={1} /></mesh>;
}

function Root({ start, end, rotation }) {
  const direction = new THREE.Vector3(...end).sub(new THREE.Vector3(...start));
  return <mesh position={[(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2]} rotation={[0, rotation, 0]} scale={[1, 1, 0.55]} castShadow><coneGeometry args={[0.25, direction.length(), 8]} /><meshStandardMaterial color="#5a402d" roughness={1} /></mesh>;
}

function BarkRidges() {
  return <group>{[-0.16, -0.06, 0.08, 0.18].map((x, index) => <mesh key={index} position={[x, 1.35, 0.2]} rotation-z={(index - 1.5) * 0.08} castShadow><boxGeometry args={[0.035, 2.25 + index % 2 * 0.3, 0.035]} /><meshStandardMaterial color={index % 2 ? "#684831" : "#3b2b23"} roughness={1} /></mesh>)}</group>;
}

function FoliageCluster({ position, scale, color }) {
  return <group position={position} scale={scale}><mesh castShadow><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={color} roughness={1} /></mesh><mesh position={[-0.55, 0.18, 0.12]} scale={0.64} castShadow><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color={color} roughness={1} /></mesh><mesh position={[0.55, -0.08, -0.12]} scale={0.58} castShadow><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color={color} roughness={1} /></mesh>{Array.from({ length: 10 }).map((_, index) => { const angle = index * 0.628; return <mesh key={index} position={[Math.cos(angle) * 0.92, Math.sin(angle * 1.7) * 0.48, Math.sin(angle) * 0.92]} rotation={[0.3 + Math.sin(index) * 0.25, angle, 0.35]} scale={[0.28, 0.5, 0.035]} castShadow><sphereGeometry args={[1, 8, 5]} /><meshStandardMaterial color={index % 3 ? color : "#5f8751"} roughness={1} /></mesh>; })}</group>;
}

function Shrub({ position }) {
  return <mesh position={[position[0], 0.35, position[2]]} scale={[1.3, 0.7, 1]} castShadow><sphereGeometry args={[0.55, 16, 10]} /><meshStandardMaterial color="#507552" roughness={1} /></mesh>;
}

function AmbientStone({ position, rotation }) {
  return <group position={position} rotation-y={rotation}><mesh position-y={0.5} castShadow><boxGeometry args={[0.7, 1, 0.22]} /><meshStandardMaterial color="#888575" roughness={0.9} /></mesh><mesh position-y={0.98} castShadow><sphereGeometry args={[0.35, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#888575" roughness={0.9} /></mesh><mesh position-y={0.04}><boxGeometry args={[0.95, 0.1, 0.4]} /><meshStandardMaterial color="#686b5d" /></mesh></group>;
}

function Lantern({ position }) {
  return <group position={position}><mesh position-y={1.1} castShadow><cylinderGeometry args={[0.045, 0.08, 2.2, 8]} /><meshStandardMaterial color="#1c2d27" metalness={0.8} roughness={0.25} /></mesh><mesh position-y={2.15} castShadow><cylinderGeometry args={[0.22, 0.26, 0.42, 6]} /><meshStandardMaterial color="#1c2d27" metalness={0.75} roughness={0.25} /></mesh><mesh position-y={2.15}><sphereGeometry args={[0.13, 12, 8]} /><meshStandardMaterial color="#ffd681" emissive="#ff9d3d" emissiveIntensity={2} transparent opacity={0.9} /></mesh><pointLight position-y={2.1} color="#ffd28a" intensity={0.55} distance={5} /></group>;
}

function Bench({ position, rotation }) {
  return <group position={position} rotation={rotation}><RoundedBox position-y={0.65} args={[2.4, 0.14, 0.42]} radius={0.04} smoothness={3} castShadow><meshStandardMaterial color="#75533c" roughness={0.7} /></RoundedBox><RoundedBox position-y={0.96} rotation-x={-0.18} args={[2.4, 0.75, 0.14]} radius={0.04} smoothness={3} castShadow><meshStandardMaterial color="#75533c" roughness={0.7} /></RoundedBox><mesh position={[-0.85, 0.3, 0]}><boxGeometry args={[0.12, 0.65, 0.32]} /><meshStandardMaterial color="#46594b" metalness={0.35} /></mesh><mesh position={[0.85, 0.3, 0]}><boxGeometry args={[0.12, 0.65, 0.32]} /><meshStandardMaterial color="#46594b" metalness={0.35} /></mesh><mesh position-y={0.38}><boxGeometry args={[1.8, 0.035, 0.5]} /><meshStandardMaterial color="#b28a61" /></mesh></group>;
}

function Fountain() {
  return <group position={[0, 0.1, 0]}><mesh castShadow><cylinderGeometry args={[3.5, 3.7, 0.35, 32]} /><meshStandardMaterial color="#817d73" roughness={0.88} metalness={0.08} /></mesh><mesh position-y={0.25}><cylinderGeometry args={[2.9, 3, 0.12, 32]} /><meshPhysicalMaterial color="#659294" metalness={0.15} roughness={0.08} transmission={0.12} clearcoat={0.8} /></mesh><mesh position-y={1.2} castShadow><cylinderGeometry args={[0.32, 0.45, 2, 16]} /><meshStandardMaterial color="#9e9b91" roughness={0.82} /></mesh><mesh position-y={2.25}><sphereGeometry args={[0.35, 16, 10]} /><meshStandardMaterial color="#759b9b" roughness={0.25} /></mesh>{[0, 1, 2, 3].map((index) => <mesh key={index} position={[Math.cos(index * 1.57) * 0.6, 1.3, Math.sin(index * 1.57) * 0.6]} rotation-x={Math.PI / 2}><torusGeometry args={[0.08, 0.025, 6, 12]} /><meshStandardMaterial color="#82b3b0" emissive="#609d9c" emissiveIntensity={0.4} /></mesh>)}<pointLight position-y={1} color="#9ad2d0" intensity={0.35} distance={8} /></group>;
}

function Entrance() {
  return <group position={[0, 0, -37]}><mesh position={[-3, 2.8, 0]} castShadow><boxGeometry args={[0.55, 5.6, 0.65]} /><meshStandardMaterial color="#7d7565" roughness={0.8} /></mesh><mesh position={[3, 2.8, 0]} castShadow><boxGeometry args={[0.55, 5.6, 0.65]} /><meshStandardMaterial color="#7d7565" roughness={0.8} /></mesh><RoundedBox position-y={5.3} args={[6.5, 0.55, 0.7]} radius={0.12} smoothness={4} castShadow><meshStandardMaterial color="#8e8067" roughness={0.75} /></RoundedBox><RoundedBox position-y={4.7} args={[4.8, 0.8, 0.1]} radius={0.04} smoothness={3}><meshStandardMaterial color="#d3bd86" emissive="#493d25" emissiveIntensity={0.2} /></RoundedBox><mesh position={[-2.1, 2.5, -0.38]} rotation-z={Math.PI / 2}><torusGeometry args={[0.65, 0.055, 8, 20]} /><meshStandardMaterial color="#b59660" metalness={0.7} roughness={0.28} /></mesh><mesh position={[2.1, 2.5, -0.38]} rotation-z={Math.PI / 2}><torusGeometry args={[0.65, 0.055, 8, 20]} /><meshStandardMaterial color="#b59660" metalness={0.7} roughness={0.28} /></mesh></group>;
}

function Gazebo({ position }) {
  return <group position={position}><mesh position-y={3.4} castShadow><coneGeometry args={[3.2, 1.5, 6]} /><meshStandardMaterial color="#647c62" roughness={0.8} /></mesh><mesh position-y={3.05} castShadow><cylinderGeometry args={[2.45, 2.45, 0.18, 6]} /><meshStandardMaterial color="#5a6c55" roughness={0.8} /></mesh>{[-2, 2, -2, 2].map((x, index) => <mesh key={index} position={[x, 1.8, index < 2 ? -2 : 2]} castShadow><cylinderGeometry args={[0.12, 0.16, 3.6, 10]} /><meshStandardMaterial color="#6d5945" roughness={0.8} /></mesh>)}{[-2, 2].map((x) => <mesh key={`rail-${x}`} position={[x, 1.1, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.045, 0.045, 4, 8]} /><meshStandardMaterial color="#6d5945" /></mesh>)}<mesh position-y={0.12} castShadow><cylinderGeometry args={[2.4, 2.4, 0.16, 6]} /><meshStandardMaterial color="#987552" roughness={0.75} /></mesh></group>;
}

function GiftProp({ type, position }) {
  const flame = useRef();
  useFrame((state) => {
    if (flame.current) flame.current.scale.setScalar(0.9 + Math.sin(state.clock.elapsedTime * 8) * 0.12);
  });
  const [x, y, z] = position;
  if (type === "FLOWER_BOUQUET") return <group position={[x + 0.7, y + 0.35, z]}><mesh position-y={0.22}><cylinderGeometry args={[0.12, 0.17, 0.45, 10]} /><meshStandardMaterial color="#6b8b58" roughness={0.9} /></mesh>{[0, 1, 2, 3, 4].map((petal) => <mesh key={petal} position={[Math.cos(petal * 1.256) * 0.2, 0.58 + (petal % 2) * 0.05, Math.sin(petal * 1.256) * 0.2]} scale={[0.14, 0.08, 0.14]}><sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color={petal % 2 ? "#d88982" : "#e8ad91"} roughness={0.75} /></mesh>)}<mesh position-y={0.58}><sphereGeometry args={[0.11, 10, 6]} /><meshStandardMaterial color="#d6b25e" /></mesh></group>;
  return <group position={[x + 0.65, y + 0.4, z]}>
    <mesh castShadow><cylinderGeometry args={[0.16, 0.2, 0.45, 16]} /><meshStandardMaterial color="#e8d9b3" roughness={0.6} /></mesh>
    <mesh position-y={0.23}><torusGeometry args={[0.14, 0.025, 8, 16]} /><meshStandardMaterial color="#b9965f" metalness={0.55} roughness={0.3} /></mesh>
    <pointLight color="#ffad56" intensity={1.5} distance={3} />
    <mesh ref={flame} position-y={0.42}><coneGeometry args={[0.1, 0.3, 8]} /><meshStandardMaterial color="#ffb24a" emissive="#ff7b24" emissiveIntensity={1.8 } /></mesh>
  </group>;
}

function MemorialWreath({ pet }) {
  return <group position={[0, 0.78, -0.24]} rotation-x={Math.PI / 2} scale={pet ? 0.82 : 1}>{Array.from({ length: 10 }).map((_, index) => <mesh key={index} position={[Math.cos(index * 0.628) * 0.28, Math.sin(index * 0.628) * 0.28, 0]} rotation-z={index * 0.628} scale={[0.12, 0.2, 0.04]}><sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color={index % 2 ? "#5d8759" : "#789b61"} roughness={0.85} /></mesh>)}</group>;
}

function createMonumentShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.58, 0);
  shape.lineTo(-0.58, 1.42);
  shape.quadraticCurveTo(-0.56, 1.82, 0, 1.98);
  shape.quadraticCurveTo(0.56, 1.82, 0.58, 1.42);
  shape.lineTo(0.58, 0);
  shape.closePath();
  return shape;
}

const monumentShape = createMonumentShape();
const monumentExtrude = { depth: 0.38, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.07, bevelThickness: 0.055, curveSegments: 8 };

function MonumentBody({ color }) {
  return <mesh position={[0, 0.12, 0]} castShadow><extrudeGeometry args={[monumentShape, monumentExtrude]} /><meshStandardMaterial color={color} roughness={0.72} metalness={0.04} /></mesh>;
}

function MonumentFrame() {
  return <group position={[0, 0.86, -0.215]}><RoundedBox args={[0.78, 0.88, 0.035]} radius={0.07} smoothness={3}><meshStandardMaterial color="#655f55" roughness={0.8} /></RoundedBox><RoundedBox position-z={-0.025} args={[0.67, 0.77, 0.04]} radius={0.045} smoothness={3}><meshStandardMaterial color="#9e9888" roughness={0.75} /></RoundedBox><mesh position-y={0.22} position-z={-0.04}><boxGeometry args={[0.34, 0.025, 0.025]} /><meshStandardMaterial color="#d6c58f" emissive="#9f8145" emissiveIntensity={0.25} /></mesh><mesh position-y={0.12} position-z={-0.04}><boxGeometry args={[0.23, 0.025, 0.025]} /><meshStandardMaterial color="#d6c58f" /></mesh><mesh position-y={0.02} position-z={-0.04}><boxGeometry args={[0.31, 0.025, 0.025]} /><meshStandardMaterial color="#d6c58f" /></mesh></group>;
}

function MonumentTrim() {
  return <group><mesh position={[0, 1.84, -0.24]} rotation-z={Math.PI / 2}><torusGeometry args={[0.43, 0.035, 8, 20, Math.PI]} /><meshStandardMaterial color="#c3af79" metalness={0.5} roughness={0.35} /></mesh><mesh position={[-0.53, 0.34, -0.23]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.035, 0.035, 0.75, 8]} /><meshStandardMaterial color="#b19c6d" metalness={0.45} /></mesh><mesh position={[0.53, 0.34, -0.23]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.035, 0.035, 0.75, 8]} /><meshStandardMaterial color="#b19c6d" metalness={0.45} /></mesh></group>;
}

function Headstone({ memorial, activeGifts, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const position = [memorial.x, 0, memorial.z];
  const stoneColor = memorial.isPet ? "#98765f" : hovered ? "#d8c8a8" : "#aaa391";
  return <group position={position} onClick={(event) => { event.stopPropagation(); onSelect(memorial); }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
    <mesh position={[0, 0.12, 0.4]} rotation-x={-Math.PI / 2} receiveShadow><circleGeometry args={[1.25, 24]} /><meshStandardMaterial color="#5f7956" /></mesh>
    <group scale={hovered ? 1.05 : 1}><MonumentBody color={stoneColor} /><RoundedBox position-y={0.03} args={[1.48, 0.16, 0.68]} radius={0.06} smoothness={3} receiveShadow><meshStandardMaterial color="#746c5a" roughness={0.82} /></RoundedBox><RoundedBox position-y={0.15} args={[1.22, 0.1, 0.56]} radius={0.04} smoothness={3}><meshStandardMaterial color="#8b8577" roughness={0.85} /></RoundedBox><MonumentFrame /><MonumentTrim /><MemorialWreath pet={memorial.isPet} /><mesh position={[0, 0.26, -0.28]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.28, 16]} /><meshStandardMaterial color="#6d8b58" /></mesh></group>
    {memorial.isPet && <group position={[0, 1.57, -0.23]}><mesh position-x={-0.23} rotation-z={-0.35}><coneGeometry args={[0.22, 0.42, 4]} /><meshStandardMaterial color="#9b7860" roughness={0.75} /></mesh><mesh position-x={0.23} rotation-z={0.35}><coneGeometry args={[0.22, 0.42, 4]} /><meshStandardMaterial color="#9b7860" roughness={0.75} /></mesh></group>}
    {activeGifts.map((gift) => <GiftProp key={gift.id} type={gift.giftType} position={[0, 0, 0]} />)}
    {hovered && <Html position={[0, 2.7, 0]} center distanceFactor={8}><div className="scene-preview"><span>{memorial.isPet ? "PET MEMORIJAL" : "MEMORIJAL"}</span><strong>{memorial.name}</strong><small>Otvori sećanje →</small></div></Html>}
  </group>;
}

function CameraFocus({ target }) {
  const { camera } = useThree();
  const goal = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!target) return;

    goal.current.set(target.x, 2.35, target.z - 5.8);
    lookTarget.current.set(target.x, 0.95, target.z + 0.15);

    camera.position.lerp(goal.current, 0.05);
    camera.lookAt(lookTarget.current);
  });
  return null;
}

function WeatherEffects({ weather, detail = 1 }) {
  const leaves = useRef();
  const rain = useRef();
  const lightning = useRef();
  useFrame((state, delta) => {
    const windStrength = weather === "wind" || weather === "storm" ? 1 : 0.2;
    if (leaves.current) leaves.current.children.forEach((leaf, index) => { leaf.position.x += delta * windStrength * (0.8 + index % 3 * 0.2); leaf.position.y -= delta * (0.12 + index % 4 * 0.03); leaf.rotation.z += delta * 2; if (leaf.position.x > 40) leaf.position.x = -40; if (leaf.position.y < 0.2) leaf.position.y = 8 + index % 5; });
    if (rain.current) rain.current.children.forEach((drop) => { drop.position.y -= delta * (weather === "storm" ? 18 : 12); drop.position.x += delta * (weather === "storm" ? 2.2 : 0.4); if (drop.position.y < 0) { drop.position.y = 18; drop.position.x = (drop.position.x + 40) % 80 - 40; } });
    if (lightning.current) lightning.current.intensity = weather === "storm" && Math.sin(state.clock.elapsedTime * 1.7) > 0.94 ? 5 : 0;
  });
  return <>
    {(weather === "wind" || weather === "storm") && <group ref={leaves}>{Array.from({ length: detail === 1 ? 38 : 16 }).map((_, index) => <mesh key={index} position={[(index * 23) % 80 - 40, 2 + index % 6, (index * 17) % 70 - 35]} rotation={[0.4, 0, index]}><planeGeometry args={[0.16, 0.28]} /><meshStandardMaterial color={index % 2 ? "#b57a43" : "#d19a54"} side={THREE.DoubleSide} /></mesh>)}</group>}
    {(weather === "rain" || weather === "storm") && <group ref={rain}>{Array.from({ length: detail === 1 ? 130 : 55 }).map((_, index) => <mesh key={index} position={[(index * 19) % 80 - 40, 4 + index % 15, (index * 31) % 80 - 40]} rotation-z={-0.16}><cylinderGeometry args={[0.012, 0.012, 0.7, 5]} /><meshBasicMaterial color="#bdd8df" transparent opacity={0.55} /></mesh>)}</group>}
    <pointLight ref={lightning} position={[0, 16, 0]} color="#d6e8ff" intensity={0} distance={60} />
  </>;
}

export default function CemeteryScene({ memorials, onSelect, resetCameraKey = 0, weather = "sun" }) {
  const [focused, setFocused] = useState(null);
  const [focusAnimating, setFocusAnimating] = useState(false);
  const controls = useRef();
  const previousResetKey = useRef(resetCameraKey);
  const [lowPower] = useState(() => typeof window !== "undefined" && (window.matchMedia("(max-width: 720px").matches || (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4)));
  const detail = lowPower ? 0 : 1;
  useEffect(() => {
    if (resetCameraKey !== previousResetKey.current) {
      setFocused(null);
      setFocusAnimating(false);
      controls.current?.reset();
      previousResetKey.current = resetCameraKey;
      return;
    }
    previousResetKey.current = resetCameraKey;
  }, [resetCameraKey]);
  return <Canvas shadows={!lowPower} dpr={lowPower ? 1 : [1, 1.5]} gl={{ antialias: !lowPower, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }} camera={{ position: [11, 8, 15], fov: 42 }} onCreated={({ gl, scene }) => { gl.setClearColor("#a8c5c1"); gl.shadowMap.type = THREE.PCFSoftShadowMap; scene.fog = new THREE.Fog("#a8c5c1", 36, 86); }}>
    <fog attach="fog" args={[weather === "fog" ? "#a9b7b2" : weather === "storm" ? "#53636a" : "#a8c5c1", weather === "fog" ? 8 : 36, weather === "fog" ? 42 : 86]} />
    <ambientLight intensity={weather === "storm" ? 0.22 : weather === "fog" ? 0.38 : 0.48} color="#dce8d6" />
    <hemisphereLight color="#dcebe1" groundColor="#304b38" intensity={weather === "storm" ? 0.42 : 0.7} />
    <directionalLight castShadow position={[-12, 18, -10]} intensity={weather === "storm" ? 0.75 : weather === "fog" ? 1.1 : 2.4} color={weather === "storm" ? "#b8c7db" : "#fff0c5"} shadow-mapSize={[2048, 2048]} shadow-bias={-0.0002} />
    <Sky sunPosition={[-4, 5, -10]} turbidity={weather === "fog" ? 12 : weather === "storm" ? 18 : 5} rayleigh={weather === "fog" ? 2.5 : 1.8} mieCoefficient={weather === "fog" ? 0.08 : 0.015} />
    <Terrain weather={weather} detail={detail} />
    {!lowPower && <ContactShadows position={[0, 0.02, 0]} opacity={weather === "storm" ? 0.5 : 0.34} scale={70} blur={2.6} far={18} resolution={1024} />}
    {!lowPower && <EffectComposer multisampling={4}><Bloom luminanceThreshold={1.1} intensity={weather === "storm" ? 0.35 : 0.55} mipmapBlur /><Noise opacity={0.018} /><Vignette eskil={false} offset={0.18} darkness={0.52} /></EffectComposer>}
    <WeatherEffects weather={weather} detail={detail} />
    {memorials.map((memorial) => <Headstone key={memorial.id} memorial={memorial} activeGifts={memorial.gifts.filter((gift) => new Date(gift.activeUntil) > new Date())} onSelect={(item) => { setFocused(item); setFocusAnimating(true); onSelect(item); }} />)}
    <CameraFocus target={focusAnimating ? focused : null} />
    <OrbitControls ref={controls} onStart={() => setFocusAnimating(false)} enablePan enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.15} minDistance={5} maxDistance={34} target={[0, 1, 0]} />
  </Canvas>;
}