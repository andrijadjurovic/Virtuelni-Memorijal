"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Sky } from "@react-three/drei";
import * as THREE from "three";

function Terrain() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[90, 90, 40, 40]} />
        <meshStandardMaterial color="#294333" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.012} receiveShadow>
        <planeGeometry args={[7, 90]} />
        <meshStandardMaterial color="#c5b89b" roughness={0.9} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.014} receiveShadow>
        <planeGeometry args={[90, 7]} />
        <meshStandardMaterial color="#c5b89b" roughness={0.9} />
      </mesh>
      {[-28, -20, -12, 12, 20, 28].map((x) => <mesh key={`path-x-${x}`} rotation-x={-Math.PI / 2} position={[x, 0.016, 0]}><planeGeometry args={[2, 90]} /><meshStandardMaterial color="#788b6e" roughness={1} /></mesh>)}
      {[-28, -18, 18, 28].map((z) => <mesh key={`path-z-${z}`} rotation-x={-Math.PI / 2} position={[0, 0.018, z]}><planeGeometry args={[90, 2]} /><meshStandardMaterial color="#788b6e" roughness={1} /></mesh>)}
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}><ringGeometry args={[7, 8, 48]} /><meshStandardMaterial color="#b5a484" roughness={1} /></mesh>
      {Array.from({ length: 64 }).map((_, index) => <Tree key={`tree-${index}`} position={[(index * 17) % 76 - 38, 0, (index * 29) % 76 - 38]} scale={0.7 + (index % 4) * 0.12} />)}
      {Array.from({ length: 20 }).map((_, index) => <Shrub key={`shrub-${index}`} position={[(index * 23) % 70 - 35, 0, (index * 11) % 70 - 35]} />)}
      {Array.from({ length: 22 }).map((_, index) => <AmbientStone key={`stone-${index}`} position={[(index * 19) % 54 - 27, 0, (index * 31) % 46 - 23]} rotation={index % 2 ? 0.05 : -0.04} />)}
      <Entrance />
      <Gazebo position={[26, 0, 26]} />
      <Fountain />
      {[-14, -7, 7, 14].map((x) => <Bench key={`bench-${x}`} position={[x, 0, 12]} rotation={[0, 0, x > 0 ? 0.04 : -0.04]} />)}
      {[-24, -12, 0, 12, 24].map((x) => <Lantern key={`lantern-a-${x}`} position={[x, 0, -6]} />)}
      {[-24, -12, 0, 12, 24].map((x) => <Lantern key={`lantern-b-${x}`} position={[x, 0, 6]} />)}
    </group>
  );
}

function Tree({ position, scale = 1 }) {
  return <group position={position} scale={scale}><mesh position-y={1.3} castShadow><cylinderGeometry args={[0.16, 0.24, 2.6, 7]} /><meshStandardMaterial color="#5f4936" /></mesh><mesh position-y={2.7} castShadow><dodecahedronGeometry args={[1.25, 1]} /><meshStandardMaterial color="#31583c" roughness={1} /></mesh><mesh position={[-0.45, 3.2, 0.2]} castShadow><dodecahedronGeometry args={[0.65, 1]} /><meshStandardMaterial color="#47704a" roughness={1} /></mesh></group>;
}

function Shrub({ position }) {
  return <mesh position={[position[0], 0.35, position[2]]} scale={[1.3, 0.7, 1]} castShadow><icosahedronGeometry args={[0.55, 1]} /><meshStandardMaterial color="#507552" roughness={1} /></mesh>;
}

function AmbientStone({ position, rotation }) {
  return <group position={position} rotation-y={rotation}><mesh position-y={0.5} castShadow><boxGeometry args={[0.7, 1, 0.22]} /><meshStandardMaterial color="#888575" roughness={0.9} /></mesh><mesh position-y={0.98} castShadow><sphereGeometry args={[0.35, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#888575" roughness={0.9} /></mesh><mesh position-y={0.04}><boxGeometry args={[0.95, 0.1, 0.4]} /><meshStandardMaterial color="#686b5d" /></mesh></group>;
}

function Lantern({ position }) {
  return <group position={position}><mesh position-y={1.1} castShadow><cylinderGeometry args={[0.045, 0.07, 2.2, 8]} /><meshStandardMaterial color="#293b32" metalness={0.7} roughness={0.3} /></mesh><mesh position-y={2.15}><boxGeometry args={[0.28, 0.35, 0.28]} /><meshStandardMaterial color="#b8a06e" emissive="#efb85a" emissiveIntensity={0.6} /></mesh><pointLight position-y={2.1} color="#ffd28a" intensity={0.32} distance={4} /></group>;
}

function Bench({ position, rotation }) {
  return <group position={position} rotation={rotation}><mesh position-y={0.65} castShadow><boxGeometry args={[2.4, 0.14, 0.42]} /><meshStandardMaterial color="#75533c" /></mesh><mesh position={[-0.85, 0.3, 0]}><boxGeometry args={[0.12, 0.65, 0.32]} /><meshStandardMaterial color="#46594b" /></mesh><mesh position={[0.85, 0.3, 0]}><boxGeometry args={[0.12, 0.65, 0.32]} /><meshStandardMaterial color="#46594b" /></mesh></group>;
}

function Fountain() {
  return <group position={[0, 0.1, 0]}><mesh castShadow><cylinderGeometry args={[3.5, 3.7, 0.35, 32]} /><meshStandardMaterial color="#928c7d" roughness={0.7} /></mesh><mesh position-y={0.25}><cylinderGeometry args={[2.9, 3, 0.12, 32]} /><meshStandardMaterial color="#73999a" metalness={0.2} roughness={0.15} /></mesh><mesh position-y={1.2}><cylinderGeometry args={[0.32, 0.45, 2, 16]} /><meshStandardMaterial color="#aaa394" /></mesh><mesh position-y={2.25}><sphereGeometry args={[0.35, 16, 10]} /><meshStandardMaterial color="#759b9b" /></mesh><pointLight position-y={1} color="#9ad2d0" intensity={0.35} distance={8} /></group>;
}

function Entrance() {
  return <group position={[0, 0, -37]}><mesh position={[-3, 2.8, 0]} castShadow><boxGeometry args={[0.55, 5.6, 0.65]} /><meshStandardMaterial color="#7d7565" /></mesh><mesh position={[3, 2.8, 0]} castShadow><boxGeometry args={[0.55, 5.6, 0.65]} /><meshStandardMaterial color="#7d7565" /></mesh><mesh position-y={5.3} castShadow><boxGeometry args={[6.5, 0.55, 0.7]} /><meshStandardMaterial color="#8e8067" /></mesh><mesh position-y={4.7}><boxGeometry args={[4.8, 0.8, 0.1]} /><meshStandardMaterial color="#d3bd86" emissive="#493d25" emissiveIntensity={0.2} /></mesh></group>;
}

function Gazebo({ position }) {
  return <group position={position}><mesh position-y={3.4} castShadow><coneGeometry args={[3.2, 1.5, 6]} /><meshStandardMaterial color="#647c62" /></mesh>{[-2, 2, -2, 2].map((x, index) => <mesh key={index} position={[x, 1.8, index < 2 ? -2 : 2]} castShadow><cylinderGeometry args={[0.12, 0.16, 3.6, 8]} /><meshStandardMaterial color="#6d5945" /></mesh>)}</group>;
}

function GiftProp({ type, position }) {
  const [x, y, z] = position;
  if (type === "FLOWER_BOUQUET") return <mesh position={[x + 0.7, y + 0.5, z]}><sphereGeometry args={[0.32, 12, 8]} /><meshStandardMaterial color="#d98783" emissive="#5d2628" emissiveIntensity={0.2} /></mesh>;
  return <group position={[x + 0.65, y + 0.4, z]}>
    <mesh><cylinderGeometry args={[0.16, 0.18, 0.45, 12]} /><meshStandardMaterial color="#eee1bd" /></mesh>
    <pointLight color="#ffad56" intensity={1.5} distance={3} />
    <mesh position-y={0.34}><coneGeometry args={[0.11, 0.28, 8]} /><meshStandardMaterial color="#ffb24a" emissive="#ff7b24" emissiveIntensity={1.5} /></mesh>
  </group>;
}

function Headstone({ memorial, activeGifts, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const position = [memorial.x, 0, memorial.z];
  return <group position={position} onClick={(event) => { event.stopPropagation(); onSelect(memorial); }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
    <mesh position={[0, 0.12, 0.4]} rotation-x={-Math.PI / 2} receiveShadow><circleGeometry args={[1.25, 24]} /><meshStandardMaterial color="#5f7956" /></mesh>
    <mesh position-y={0.7} castShadow scale={hovered ? 1.05 : 1}>
      <boxGeometry args={[1.15, 1.6, 0.38]} />
      <meshStandardMaterial color={memorial.isPet ? "#9b7860" : hovered ? "#d8c8a8" : "#aaa391"} roughness={0.62} />
    </mesh>
    <mesh position-y={1.5} castShadow>
      <sphereGeometry args={[0.53, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={memorial.isPet ? "#92715f" : hovered ? "#d8c8a8" : "#afa68f"} roughness={0.75} />
    </mesh>
    <mesh position-y={0.05} receiveShadow><boxGeometry args={[1.45, 0.15, 0.65]} /><meshStandardMaterial color="#746c5a" /></mesh>
    <mesh position={[0, 0.9, -0.21]}><boxGeometry args={[0.58, 0.08, 0.02]} /><meshStandardMaterial color="#d9c58f" emissive="#a88948" emissiveIntensity={0.35} /></mesh>
    {activeGifts.map((gift) => <GiftProp key={gift.id} type={gift.giftType} position={[0, 0, 0]} />)}
    {hovered && <Html position={[0, 2.7, 0]} center distanceFactor={8}><div className="scene-preview"><span>{memorial.isPet ? "PET MEMORIJAL" : "MEMORIJAL"}</span><strong>{memorial.name}</strong><small>Otvori sećanje →</small></div></Html>}
  </group>;
}

function CameraFocus({ target }) {
  const { camera } = useThree();
  const goal = useRef(new THREE.Vector3());
  useFrame(() => {
    if (!target) return;
    goal.current.set(target.x + 4, 3.1, target.z + 5);
    camera.position.lerp(goal.current, 0.035);
    camera.lookAt(target.x, 1, target.z);
  });
  return null;
}

export default function CemeteryScene({ memorials, onSelect }) {
  const [focused, setFocused] = useState(null);
  return <Canvas shadows camera={{ position: [11, 8, 15], fov: 42 }} onPointerMissed={() => setFocused(null)} onCreated={({ gl }) => { gl.setClearColor("#a8c5c1"); }}>
    <ambientLight intensity={0.65} color="#dce8d6" />
    <directionalLight castShadow position={[8, 14, 4]} intensity={2.2} color="#fff0c5" shadow-mapSize={[2048, 2048]} />
    <Sky sunPosition={[-4, 5, -10]} turbidity={7} rayleigh={1.4} />
    <Terrain />
    {memorials.map((memorial) => <Headstone key={memorial.id} memorial={memorial} activeGifts={memorial.gifts.filter((gift) => new Date(gift.activeUntil) > new Date())} onSelect={(item) => { setFocused(item); onSelect(item); }} />)}
    <CameraFocus target={focused} />
    <OrbitControls enablePan enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.15} minDistance={5} maxDistance={34} target={[0, 1, 0]} />
  </Canvas>;
}