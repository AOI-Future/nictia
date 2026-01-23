"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { getFrequencyData, getIsPlaying } from "@/utils/sound";

// Morphing particle system - organic, evolving geometry
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 5000;

  const [positions, originalPositions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const origPos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 1.5 + Math.random() * 2.5;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      origPos[i * 3] = x;
      origPos[i * 3 + 1] = y;
      origPos[i * 3 + 2] = z;

      // Color gradient based on position
      const t = radius / 4;
      col[i * 3] = 0.2 + t * 0.3; // R
      col[i * 3 + 1] = 0.5 + t * 0.3; // G
      col[i * 3 + 2] = 1.0; // B
    }

    return [pos, origPos, col];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    // Get audio data for reactive visuals
    let audioIntensity = 0.3; // Base intensity even without audio
    if (getIsPlaying()) {
      const freqData = getFrequencyData();
      audioIntensity =
        0.3 +
        (freqData.reduce((a, b) => a + Math.abs(b), 0) / freqData.length / 50);
    }

    // Organic morphing animation
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const ox = originalPositions[i3];
      const oy = originalPositions[i3 + 1];
      const oz = originalPositions[i3 + 2];

      // Noise-based displacement
      const noiseScale = 0.2 + audioIntensity * 0.8;
      const speed = 0.3 + audioIntensity * 0.5;
      const nx = Math.sin(time * speed + ox * 0.8 + oy * 0.3) * noiseScale;
      const ny = Math.cos(time * speed * 0.8 + oy * 0.8 + oz * 0.3) * noiseScale;
      const nz = Math.sin(time * speed * 0.6 + oz * 0.8 + ox * 0.3) * noiseScale;

      // Breathing effect
      const breathe = 1 + Math.sin(time * 0.5) * 0.15 * audioIntensity;

      positions[i3] = ox * breathe + nx;
      positions[i3 + 1] = oy * breathe + ny;
      positions[i3 + 2] = oz * breathe + nz;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.08;
    pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.9}
      />
    </Points>
  );
}

// The "Eye" - a central watching presence
function Eye() {
  const groupRef = useRef<THREE.Group>(null);
  const irisRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current || !irisRef.current) return;

    const time = state.clock.elapsedTime;

    // Get audio data
    let audioIntensity = 0.2;
    if (getIsPlaying()) {
      const freqData = getFrequencyData();
      audioIntensity =
        0.2 +
        (freqData.reduce((a, b) => a + Math.abs(b), 0) / freqData.length / 80);
    }

    // Pupil dilation based on audio
    const baseScale = 0.25 + audioIntensity * 0.4;
    irisRef.current.scale.setScalar(baseScale);

    // Glow intensity
    if (glowRef.current) {
      const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
      glowMat.opacity = 0.3 + audioIntensity * 0.4;
    }

    // Subtle "looking" movement
    groupRef.current.rotation.x = Math.sin(time * 0.4) * 0.15;
    groupRef.current.rotation.y = Math.cos(time * 0.3) * 0.15;

    // Pulse effect
    const pulse = 1 + Math.sin(time * 1.5) * 0.03 * (1 + audioIntensity);
    groupRef.current.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer eye sphere */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#0a0a1a"
          roughness={0.2}
          metalness={0.9}
          emissive="#1a1a3a"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Inner iris/pupil */}
      <mesh ref={irisRef} position={[0, 0, 0.85]}>
        <circleGeometry args={[0.35, 64]} />
        <meshBasicMaterial color="#050510" />
      </mesh>

      {/* Highlight ring */}
      <mesh position={[0, 0, 0.86]}>
        <ringGeometry args={[0.3, 0.5, 64]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner highlight */}
      <mesh position={[0.15, 0.15, 0.9]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

// Orbiting geometric fragments
function OrbitingFragments() {
  const groupRef = useRef<THREE.Group>(null);
  const fragmentCount = 20;

  const fragments = useMemo(() => {
    return Array.from({ length: fragmentCount }, (_, i) => ({
      angle: (i / fragmentCount) * Math.PI * 2,
      radius: 2.2 + Math.random() * 1,
      speed: 0.08 + Math.random() * 0.12,
      yOffset: (Math.random() - 0.5) * 1.5,
      scale: 0.06 + Math.random() * 0.08,
      rotSpeed: Math.random() * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Get audio intensity for reactive movement
    let audioIntensity = 0.3;
    if (getIsPlaying()) {
      const freqData = getFrequencyData();
      audioIntensity =
        0.3 +
        (freqData.reduce((a, b) => a + Math.abs(b), 0) / freqData.length / 60);
    }

    groupRef.current.children.forEach((child, i) => {
      const fragment = fragments[i];
      const speed = fragment.speed * (1 + audioIntensity * 0.5);
      const angle = fragment.angle + time * speed;

      child.position.x = Math.cos(angle) * fragment.radius;
      child.position.z = Math.sin(angle) * fragment.radius;
      child.position.y =
        fragment.yOffset + Math.sin(time * 0.8 + i) * 0.4 * audioIntensity;

      child.rotation.x = time * fragment.rotSpeed;
      child.rotation.y = time * fragment.rotSpeed * 0.7;

      // Scale pulse with audio
      const scale = fragment.scale * (1 + audioIntensity * 0.3);
      child.scale.setScalar(scale);
    });
  });

  return (
    <group ref={groupRef}>
      {fragments.map((fragment, i) => (
        <mesh key={i} scale={fragment.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color="#4a9eff"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Floating rings
function FloatingRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      child.rotation.x = time * 0.1 * (i + 1) * 0.3;
      child.rotation.y = time * 0.15 * (i + 1) * 0.2;
      child.rotation.z = time * 0.08 * (i + 1) * 0.25;
    });
  });

  return (
    <group ref={groupRef}>
      {[1.8, 2.2, 2.6].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI * 0.3 * i, Math.PI * 0.2 * i, 0]}>
          <torusGeometry args={[radius, 0.01, 16, 100]} />
          <meshBasicMaterial
            color="#4a9eff"
            transparent
            opacity={0.3 - i * 0.08}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main scene component
function Scene() {
  return (
    <>
      <color attach="background" args={["#000008"]} />

      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 5]} intensity={2} color="#4a9eff" />
      <pointLight position={[0, 5, 0]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, 0, 0]} intensity={0.5} color="#9a4aff" />

      <Eye />
      <ParticleField />
      <OrbitingFragments />
      <FloatingRings />
    </>
  );
}

// Exported Visualizer component
export default function Visualizer() {
  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
