"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Sky } from "@react-three/drei";
import * as THREE from "three";

function Terrain() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[80, 80, 32, 32]} />
        <meshStandardMaterial color="#253c31" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.012} receiveShadow>
        <planeGeometry args={[9, 80]} />
        <meshStandardMaterial color="#b9a788" roughness={0.95} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.014} receiveShadow>
        <planeGeometry args={[80, 7]} />
        <meshStandardMaterial color="#b9a788" roughness={0.95} />
      </mesh>
      {Array.from({ length: 18 }).map((_, index) => (
        <mesh key={index} position={[(index * 13) % 65 - 32, 0.08, (index * 19) % 65 - 32]} castShadow>
          <coneGeometry args={[0.8 + (index % 3) * 0.25, 2 + (index % 4), 6]} />
          <meshStandardMaterial color={index % 2 ? "#355b43" : "#426b4d"} />
        </mesh>
      ))}
    </group>
  );
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
    <mesh position-y={0.7} castShadow scale={hovered ? 1.05 : 1}>
      <boxGeometry args={[1.05, 1.5, 0.32]} />
      <meshStandardMaterial color={memorial.isPet ? "#92715f" : hovered ? "#d8c8a8" : "#afa68f"} roughness={0.75} />
    </mesh>
    <mesh position-y={1.5} castShadow>
      <sphereGeometry args={[0.53, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={memorial.isPet ? "#92715f" : hovered ? "#d8c8a8" : "#afa68f"} roughness={0.75} />
    </mesh>
    <mesh position-y={0.05} receiveShadow><boxGeometry args={[1.45, 0.15, 0.65]} /><meshStandardMaterial color="#746c5a" /></mesh>
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