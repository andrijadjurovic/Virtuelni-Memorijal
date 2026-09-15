"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls, RoundedBox, Sky } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

function Terrain({ weather }) {
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
      {[-28, -18, 18, 28].flatMap((z) => [-40, -30, -20, -10, 0, 10, 20, 30, 40].map((x) => <PathTile key={`tile-z-${z}-${x}`} position={[x, 0.035, z]} rotation-y={Math.PI / 2} />))}
      {[-28, -20, -12, 12, 20, 28].flatMap((x) => [-35, -25, -15, -5, 5, 15, 25, 35].map((z) => <PathTile key={`tile-x-${x}-${z}`} position={[x, 0.036, z]} />))}
      {[-32, -22, -12, 12, 22, 32].flatMap((x) => [-27, -17, 17, 27].map((z) => <PathBorder key={`border-${x}-${z}`} position={[x, 0.08, z]} rotation-y={Math.abs(x) % 2 ? Math.PI / 2 : 0} />))}
      {Array.from({ length: 42 }).map((_, index) => <GroundPatch key={`patch-${index}`} position={[(index * 41) % 76 - 38, 0.025, (index * 53) % 76 - 38]} scale={0.7 + index % 4 * 0.22} />)}
      {Array.from({ length: 28 }).map((_, index) => <GroundRock key={`rock-${index}`} position={[(index * 31) % 74 - 37, 0.05, (index * 43) % 74 - 37]} scale={0.5 + index % 3 * 0.2} />)}
      {Array.from({ length: 12 }).map((_, index) => <FlowerBed key={`bed-${index}`} position={[(index * 29) % 56 - 28, 0.04, (index * 37) % 56 - 28]} />)}
      {(weather === "rain" || weather === "storm") && Array.from({ length: 18 }).map((_, index) => <Puddle key={`puddle-${index}`} position={[(index * 17) % 60 - 30, 0.025, (index * 23) % 60 - 30]} scale={0.5 + index % 3 * 0.25} />)}
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}><ringGeometry args={[7, 8, 48]} /><meshStandardMaterial color="#b5a484" roughness={1} /></mesh>
      {Array.from({ length: 64 }).map((_, index) => <Tree key={`tree-${index}`} position={[(index * 17) % 76 - 38, 0, (index * 29) % 76 - 38]} scale={0.7 + (index % 4) * 0.12} />)}
      {Array.from({ length: 20 }).map((_, index) => <Shrub key={`shrub-${index}`} position={[(index * 23) % 70 - 35, 0, (index * 11) % 70 - 35]} />)}
      {Array.from({ length: 22 }).map((_, index) => <AmbientStone key={`stone-${index}`} position={[(index * 19) % 54 - 27, 0, (index * 31) % 46 - 23]} rotation={index % 2 ? 0.05 : -0.04} />)}
      {Array.from({ length: 75 }).map((_, index) => <GrassTuft key={`grass-${index}`} position={[(index * 37) % 78 - 39, 0.02, (index * 47) % 78 - 39]} />)}
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
  return <group position={position} scale={scale}><mesh position-y={1.3} castShadow><cylinderGeometry args={[0.16, 0.28, 2.6, 10]} /><meshStandardMaterial color="#57402f" roughness={0.95} /></mesh><mesh position={[-0.18, 2.35, 0]} rotation-z={-0.25} castShadow><cylinderGeometry args={[0.07, 0.12, 1.35, 9]} /><meshStandardMaterial color="#57402f" roughness={0.95} /></mesh><mesh position-y={2.55} castShadow><sphereGeometry args={[1.35, 20, 14]} /><meshStandardMaterial color="#294c35" roughness={1} /></mesh><mesh position={[-0.5, 3.05, 0.25]} castShadow><sphereGeometry args={[0.78, 18, 12]} /><meshStandardMaterial color="#3e6944" roughness={1} /></mesh><mesh position={[0.5, 2.9, -0.18]} castShadow><sphereGeometry args={[0.7, 18, 12]} /><meshStandardMaterial color="#345b3b" roughness={1} /></mesh></group>;
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
  return <group position={position} rotation={rotation}><mesh position-y={0.65} castShadow><boxGeometry args={[2.4, 0.14, 0.42]} /><meshStandardMaterial color="#75533c" /></mesh><mesh position={[-0.85, 0.3, 0]}><boxGeometry args={[0.12, 0.65, 0.32]} /><meshStandardMaterial color="#46594b" /></mesh><mesh position={[0.85, 0.3, 0]}><boxGeometry args={[0.12, 0.65, 0.32]} /><meshStandardMaterial color="#46594b" /></mesh></group>;
}

function Fountain() {
  return <group position={[0, 0.1, 0]}><mesh castShadow><cylinderGeometry args={[3.5, 3.7, 0.35, 32]} /><meshStandardMaterial color="#817d73" roughness={0.88} metalness={0.08} /></mesh><mesh position-y={0.25}><cylinderGeometry args={[2.9, 3, 0.12, 32]} /><meshPhysicalMaterial color="#659294" metalness={0.15} roughness={0.08} transmission={0.12} clearcoat={0.8} /></mesh><mesh position-y={1.2} castShadow><cylinderGeometry args={[0.32, 0.45, 2, 16]} /><meshStandardMaterial color="#9e9b91" roughness={0.82} /></mesh><mesh position-y={2.25}><sphereGeometry args={[0.35, 16, 10]} /><meshStandardMaterial color="#759b9b" roughness={0.25} /></mesh><pointLight position-y={1} color="#9ad2d0" intensity={0.35} distance={8} /></group>;
}

function Entrance() {
  return <group position={[0, 0, -37]}><mesh position={[-3, 2.8, 0]} castShadow><boxGeometry args={[0.55, 5.6, 0.65]} /><meshStandardMaterial color="#7d7565" /></mesh><mesh position={[3, 2.8, 0]} castShadow><boxGeometry args={[0.55, 5.6, 0.65]} /><meshStandardMaterial color="#7d7565" /></mesh><mesh position-y={5.3} castShadow><boxGeometry args={[6.5, 0.55, 0.7]} /><meshStandardMaterial color="#8e8067" /></mesh><mesh position-y={4.7}><boxGeometry args={[4.8, 0.8, 0.1]} /><meshStandardMaterial color="#d3bd86" emissive="#493d25" emissiveIntensity={0.2} /></mesh></group>;
}

function Gazebo({ position }) {
  return <group position={position}><mesh position-y={3.4} castShadow><coneGeometry args={[3.2, 1.5, 6]} /><meshStandardMaterial color="#647c62" /></mesh>{[-2, 2, -2, 2].map((x, index) => <mesh key={index} position={[x, 1.8, index < 2 ? -2 : 2]} castShadow><cylinderGeometry args={[0.12, 0.16, 3.6, 8]} /><meshStandardMaterial color="#6d5945" /></mesh>)}</group>;
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

function Headstone({ memorial, activeGifts, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const position = [memorial.x, 0, memorial.z];
  return <group position={position} onClick={(event) => { event.stopPropagation(); onSelect(memorial); }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
    <mesh position={[0, 0.12, 0.4]} rotation-x={-Math.PI / 2} receiveShadow><circleGeometry args={[1.25, 24]} /><meshStandardMaterial color="#5f7956" /></mesh>
    <mesh position-y={0.7} castShadow scale={hovered ? 1.05 : 1}>
      <RoundedBox args={[1.15, 1.6, 0.38]} radius={0.12} smoothness={4} />
      <meshStandardMaterial color={memorial.isPet ? "#9b7860" : hovered ? "#d8c8a8" : "#aaa391"} roughness={0.62} flatShading />
    </mesh>
    <mesh position-y={1.5} castShadow>
      <sphereGeometry args={[0.53, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={memorial.isPet ? "#92715f" : hovered ? "#d8c8a8" : "#afa68f"} roughness={0.75} />
    </mesh>
    <RoundedBox position-y={0.05} args={[1.45, 0.15, 0.65]} radius={0.05} smoothness={3} receiveShadow><meshStandardMaterial color="#746c5a" roughness={0.82} /></RoundedBox>
    <mesh position={[0, 0.9, -0.21]}><boxGeometry args={[0.58, 0.08, 0.02]} /><meshStandardMaterial color="#d9c58f" emissive="#a88948" emissiveIntensity={0.35} /></mesh>
    <mesh position={[0, 1.22, -0.22]}><boxGeometry args={[0.07, 0.38, 0.025]} /><meshStandardMaterial color="#d9c58f" /></mesh>
    <mesh position={[0, 1.22, -0.23]}><boxGeometry args={[0.25, 0.07, 0.025]} /><meshStandardMaterial color="#d9c58f" /></mesh>
    <mesh position={[0, 0.25, -0.28]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.28, 16]} /><meshStandardMaterial color="#6d8b58" /></mesh>
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

function WeatherEffects({ weather }) {
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
    {(weather === "wind" || weather === "storm") && <group ref={leaves}>{Array.from({ length: 38 }).map((_, index) => <mesh key={index} position={[(index * 23) % 80 - 40, 2 + index % 6, (index * 17) % 70 - 35]} rotation={[0.4, 0, index]}><planeGeometry args={[0.16, 0.28]} /><meshStandardMaterial color={index % 2 ? "#b57a43" : "#d19a54"} side={THREE.DoubleSide} /></mesh>)}</group>}
    {(weather === "rain" || weather === "storm") && <group ref={rain}>{Array.from({ length: 130 }).map((_, index) => <mesh key={index} position={[(index * 19) % 80 - 40, 4 + index % 15, (index * 31) % 80 - 40]} rotation-z={-0.16}><cylinderGeometry args={[0.012, 0.012, 0.7, 5]} /><meshBasicMaterial color="#bdd8df" transparent opacity={0.55} /></mesh>)}</group>}
    <pointLight ref={lightning} position={[0, 16, 0]} color="#d6e8ff" intensity={0} distance={60} />
  </>;
}

export default function CemeteryScene({ memorials, onSelect, weather = "sun" }) {
  const [focused, setFocused] = useState(null);
  return <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }} camera={{ position: [11, 8, 15], fov: 42 }} onPointerMissed={() => setFocused(null)} onCreated={({ gl, scene }) => { gl.setClearColor("#a8c5c1"); gl.shadowMap.type = THREE.PCFSoftShadowMap; scene.fog = new THREE.Fog("#a8c5c1", 36, 86); }}>
    <fog attach="fog" args={[weather === "fog" ? "#a9b7b2" : weather === "storm" ? "#53636a" : "#a8c5c1", weather === "fog" ? 8 : 36, weather === "fog" ? 42 : 86]} />
    <ambientLight intensity={weather === "storm" ? 0.22 : weather === "fog" ? 0.38 : 0.48} color="#dce8d6" />
    <hemisphereLight color="#dcebe1" groundColor="#304b38" intensity={weather === "storm" ? 0.42 : 0.7} />
    <directionalLight castShadow position={[-12, 18, -10]} intensity={weather === "storm" ? 0.75 : weather === "fog" ? 1.1 : 2.4} color={weather === "storm" ? "#b8c7db" : "#fff0c5"} shadow-mapSize={[2048, 2048]} shadow-bias={-0.0002} />
    <Sky sunPosition={[-4, 5, -10]} turbidity={weather === "fog" ? 12 : weather === "storm" ? 18 : 5} rayleigh={weather === "fog" ? 2.5 : 1.8} mieCoefficient={weather === "fog" ? 0.08 : 0.015} />
    <Terrain weather={weather} />
    <ContactShadows position={[0, 0.02, 0]} opacity={weather === "storm" ? 0.5 : 0.34} scale={70} blur={2.6} far={18} resolution={1024} />
    <EffectComposer multisampling={4}><Bloom luminanceThreshold={1.1} intensity={weather === "storm" ? 0.35 : 0.55} mipmapBlur /><Noise opacity={0.018} /><Vignette eskil={false} offset={0.18} darkness={0.52} /></EffectComposer>
    <WeatherEffects weather={weather} />
    {memorials.map((memorial) => <Headstone key={memorial.id} memorial={memorial} activeGifts={memorial.gifts.filter((gift) => new Date(gift.activeUntil) > new Date())} onSelect={(item) => { setFocused(item); onSelect(item); }} />)}
    <CameraFocus target={focused} />
    <OrbitControls enablePan enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.15} minDistance={5} maxDistance={34} target={[0, 1, 0]} />
  </Canvas>;
}