"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Noise,
  Glitch,
  Vignette,
} from "@react-three/postprocessing";
import { GlitchMode } from "postprocessing";
import * as THREE from "three";
import { getFrequencyData, getIsPlaying } from "@/utils/sound";
import type { EnvironmentParams } from "@/hooks/useEnvironment";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface VisualizerProps {
  envParams?: EnvironmentParams;
}

interface SceneProps {
  envParams: EnvironmentParams;
}

// Default environment params
const defaultEnvParams: EnvironmentParams = {
  bpm: 120,
  reverbWet: 0.5,
  filterFrequency: 2000,
  noiseLevel: 0,
  energy: "high",
  backgroundColor: "#000008",
  particleSpeed: 1,
  bloomIntensity: 0.5,
  noiseIntensity: 0,
  glitchIntensity: 0,
  waveformType: "sine",
};

// ═══════════════════════════════════════════════════════════════
// Morphing Particle Field
// ═══════════════════════════════════════════════════════════════

// Pre-generate particle data with deterministic pseudo-random values
const PARTICLE_COUNT = 5000;
const PARTICLE_DATA = (() => {
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  const origPos = new Float32Array(PARTICLE_COUNT * 3);
  const col = new Float32Array(PARTICLE_COUNT * 3);

  // Linear congruential generator for deterministic randomness
  let seed = 12345;
  const nextRand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = nextRand() * Math.PI * 2;
    const phi = Math.acos(2 * nextRand() - 1);
    const radius = 1.5 + nextRand() * 2.5;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;

    origPos[i * 3] = x;
    origPos[i * 3 + 1] = y;
    origPos[i * 3 + 2] = z;

    const t = radius / 4;
    col[i * 3] = 0.2 + t * 0.3;
    col[i * 3 + 1] = 0.5 + t * 0.3;
    col[i * 3 + 2] = 1.0;
  }

  return { positions: pos, originalPositions: origPos, colors: col };
})();

function ParticleField({ envParams }: { envParams: EnvironmentParams }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, originalPositions, colors] = useMemo(() => {
    return [PARTICLE_DATA.positions, PARTICLE_DATA.originalPositions, PARTICLE_DATA.colors];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    let audioIntensity = 0.3;
    if (getIsPlaying()) {
      const freqData = getFrequencyData();
      audioIntensity =
        0.3 +
        (freqData.reduce((a, b) => a + Math.abs(b), 0) / freqData.length / 50);
    }

    // Apply environment-based speed modifier
    const speedMod = envParams.particleSpeed;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const ox = originalPositions[i3];
      const oy = originalPositions[i3 + 1];
      const oz = originalPositions[i3 + 2];

      const noiseScale = 0.2 + audioIntensity * 0.8;
      const speed = (0.3 + audioIntensity * 0.5) * speedMod;
      const nx = Math.sin(time * speed + ox * 0.8 + oy * 0.3) * noiseScale;
      const ny =
        Math.cos(time * speed * 0.8 + oy * 0.8 + oz * 0.3) * noiseScale;
      const nz =
        Math.sin(time * speed * 0.6 + oz * 0.8 + ox * 0.3) * noiseScale;

      const breathe = 1 + Math.sin(time * 0.5 * speedMod) * 0.15 * audioIntensity;

      positions[i3] = ox * breathe + nx;
      positions[i3 + 1] = oy * breathe + ny;
      positions[i3 + 2] = oz * breathe + nz;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.08 * speedMod;
    pointsRef.current.rotation.x = Math.sin(time * 0.1 * speedMod) * 0.1;
  });

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      colors={colors}
      stride={3}
      frustumCulled={false}
    >
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

// ═══════════════════════════════════════════════════════════════
// The Eye
// ═══════════════════════════════════════════════════════════════

function Eye({ envParams }: { envParams: EnvironmentParams }) {
  const groupRef = useRef<THREE.Group>(null);
  const irisRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current || !irisRef.current) return;

    const time = state.clock.elapsedTime;
    const speedMod = envParams.particleSpeed;

    let audioIntensity = 0.2;
    if (getIsPlaying()) {
      const freqData = getFrequencyData();
      audioIntensity =
        0.2 +
        (freqData.reduce((a, b) => a + Math.abs(b), 0) / freqData.length / 80);
    }

    const baseScale = 0.25 + audioIntensity * 0.4;
    irisRef.current.scale.setScalar(baseScale);

    if (glowRef.current) {
      const glowMat = glowRef.current.material as THREE.MeshBasicMaterial;
      // Increase glow in night mode (higher bloom)
      glowMat.opacity = 0.3 + audioIntensity * 0.4 + envParams.bloomIntensity * 0.2;
    }

    groupRef.current.rotation.x = Math.sin(time * 0.4 * speedMod) * 0.15;
    groupRef.current.rotation.y = Math.cos(time * 0.3 * speedMod) * 0.15;

    const pulse = 1 + Math.sin(time * 1.5 * speedMod) * 0.03 * (1 + audioIntensity);
    groupRef.current.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

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

      <mesh ref={irisRef} position={[0, 0, 0.85]}>
        <circleGeometry args={[0.35, 64]} />
        <meshBasicMaterial color="#050510" />
      </mesh>

      <mesh position={[0, 0, 0.86]}>
        <ringGeometry args={[0.3, 0.5, 64]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0.15, 0.15, 0.9]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════
// Orbiting Fragments
// ═══════════════════════════════════════════════════════════════

// Pre-generated fragment data (deterministic based on index)
const FRAGMENT_COUNT = 20;
const FRAGMENT_DATA = Array.from({ length: FRAGMENT_COUNT }, (_, i) => {
  // Use deterministic pseudo-random values based on index
  const seed = (i * 9301 + 49297) % 233280;
  const rand1 = seed / 233280;
  const seed2 = (seed * 9301 + 49297) % 233280;
  const rand2 = seed2 / 233280;
  const seed3 = (seed2 * 9301 + 49297) % 233280;
  const rand3 = seed3 / 233280;
  const seed4 = (seed3 * 9301 + 49297) % 233280;
  const rand4 = seed4 / 233280;
  const seed5 = (seed4 * 9301 + 49297) % 233280;
  const rand5 = seed5 / 233280;

  return {
    angle: (i / FRAGMENT_COUNT) * Math.PI * 2,
    radius: 2.2 + rand1 * 1,
    speed: 0.08 + rand2 * 0.12,
    yOffset: (rand3 - 0.5) * 1.5,
    scale: 0.06 + rand4 * 0.08,
    rotSpeed: rand5 * 2,
  };
});

function OrbitingFragments({ envParams }: { envParams: EnvironmentParams }) {
  const groupRef = useRef<THREE.Group>(null);

  const fragments = useMemo(() => FRAGMENT_DATA, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const speedMod = envParams.particleSpeed;

    let audioIntensity = 0.3;
    if (getIsPlaying()) {
      const freqData = getFrequencyData();
      audioIntensity =
        0.3 +
        (freqData.reduce((a, b) => a + Math.abs(b), 0) / freqData.length / 60);
    }

    groupRef.current.children.forEach((child, i) => {
      const fragment = fragments[i];
      const speed = fragment.speed * (1 + audioIntensity * 0.5) * speedMod;
      const angle = fragment.angle + time * speed;

      child.position.x = Math.cos(angle) * fragment.radius;
      child.position.z = Math.sin(angle) * fragment.radius;
      child.position.y =
        fragment.yOffset + Math.sin(time * 0.8 * speedMod + i) * 0.4 * audioIntensity;

      child.rotation.x = time * fragment.rotSpeed * speedMod;
      child.rotation.y = time * fragment.rotSpeed * 0.7 * speedMod;

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

// ═══════════════════════════════════════════════════════════════
// Floating Rings
// ═══════════════════════════════════════════════════════════════

function FloatingRings({ envParams }: { envParams: EnvironmentParams }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    const speedMod = envParams.particleSpeed;

    groupRef.current.children.forEach((child, i) => {
      child.rotation.x = time * 0.1 * (i + 1) * 0.3 * speedMod;
      child.rotation.y = time * 0.15 * (i + 1) * 0.2 * speedMod;
      child.rotation.z = time * 0.08 * (i + 1) * 0.25 * speedMod;
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

// ═══════════════════════════════════════════════════════════════
// Post-processing Effects
// ═══════════════════════════════════════════════════════════════

function Effects({ envParams }: { envParams: EnvironmentParams }) {
  const { bloomIntensity, noiseIntensity, glitchIntensity } = envParams;

  // Render different effect combinations based on active effects
  // EffectComposer doesn't accept null children, so we use separate branches
  if (glitchIntensity > 0 && noiseIntensity > 0) {
    return (
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette offset={0.3} darkness={0.6} eskil={false} />
        <Noise opacity={noiseIntensity} premultiply />
        <Glitch
          delay={new THREE.Vector2(1.5, 3.5)}
          duration={new THREE.Vector2(0.1, 0.3)}
          strength={new THREE.Vector2(glitchIntensity * 0.3, glitchIntensity)}
          mode={GlitchMode.SPORADIC}
          active
          ratio={0.85}
        />
      </EffectComposer>
    );
  }

  if (glitchIntensity > 0) {
    return (
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette offset={0.3} darkness={0.6} eskil={false} />
        <Glitch
          delay={new THREE.Vector2(1.5, 3.5)}
          duration={new THREE.Vector2(0.1, 0.3)}
          strength={new THREE.Vector2(glitchIntensity * 0.3, glitchIntensity)}
          mode={GlitchMode.SPORADIC}
          active
          ratio={0.85}
        />
      </EffectComposer>
    );
  }

  if (noiseIntensity > 0) {
    return (
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette offset={0.3} darkness={0.6} eskil={false} />
        <Noise opacity={noiseIntensity} premultiply />
      </EffectComposer>
    );
  }

  // Default: Bloom + Vignette only
  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.6} eskil={false} />
    </EffectComposer>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Scene
// ═══════════════════════════════════════════════════════════════

function Scene({ envParams }: SceneProps) {
  return (
    <>
      <color attach="background" args={[envParams.backgroundColor]} />

      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 5]} intensity={2} color="#4a9eff" />
      <pointLight position={[0, 5, 0]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, 0, 0]} intensity={0.5} color="#9a4aff" />

      <Eye envParams={envParams} />
      <ParticleField envParams={envParams} />
      <OrbitingFragments envParams={envParams} />
      <FloatingRings envParams={envParams} />

      <Effects envParams={envParams} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Exported Visualizer Component
// ═══════════════════════════════════════════════════════════════

export default function Visualizer({ envParams }: VisualizerProps) {
  const params = envParams || defaultEnvParams;

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
        <Scene envParams={params} />
      </Canvas>
    </div>
  );
}
