"use client";

import { Suspense, useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
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
import { TextureLoader } from "three";
import { getFrequencyData, getIsPlaying } from "@/utils/sound";
import type { EnvironmentParams } from "@/hooks/useEnvironment";

// ═══════════════════════════════════════════════════════════════
// Performance Detection
// ═══════════════════════════════════════════════════════════════

type PerformanceLevel = "high" | "medium" | "low";

interface PerformanceConfig {
  particleCount: number;
  enableLenia: boolean;
  leniaSampleRate: number;
  postProcessing: "full" | "medium" | "minimal";
  dpr: [number, number];
  coverLoadDelay: number;
  fragmentCount: number;
  enableShadows: boolean;
  powerPreference: WebGLPowerPreference;
}

const PERFORMANCE_CONFIGS: Record<PerformanceLevel, PerformanceConfig> = {
  high: {
    particleCount: 5000,
    enableLenia: true,
    leniaSampleRate: 2,
    postProcessing: "full",
    dpr: [1, 2],
    coverLoadDelay: 1500,
    fragmentCount: 12,
    enableShadows: true,
    powerPreference: "high-performance",
  },
  medium: {
    particleCount: 3000,
    enableLenia: true,
    leniaSampleRate: 4, // Less frequent updates
    postProcessing: "medium",
    dpr: [1, 1.5],
    coverLoadDelay: 2000,
    fragmentCount: 8,
    enableShadows: false,
    powerPreference: "default",
  },
  low: {
    particleCount: 1500,
    enableLenia: false,
    leniaSampleRate: 8,
    postProcessing: "minimal",
    dpr: [1, 1],
    coverLoadDelay: 3000,
    fragmentCount: 4,
    enableShadows: false,
    powerPreference: "low-power",
  },
};

function getPerformanceLevel(): PerformanceLevel {
  if (typeof navigator === "undefined") return "medium";

  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory || 2;
  const isMobile = /iPhone|iPad|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
  const saveData = !!connection?.saveData;

  if (prefersReducedMotion || saveData) return "low";

  // High: 8+ cores, 8GB+ RAM, not mobile
  if (cores >= 8 && memory >= 8 && !isMobile) return "high";

  // Medium: 4+ cores, 4GB+ RAM
  if (cores >= 4 && memory >= 4) return "medium";

  // Low: everything else
  return "low";
}

// Types for discography
interface Release {
  title: string;
  type: string;
  year: string;
  cover: string;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface VisualizerProps {
  envParams?: EnvironmentParams;
  covers?: string[];
}

interface SceneProps {
  envParams: EnvironmentParams;
  covers: string[];
  showCovers: boolean;
  config: PerformanceConfig;
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
  // Lenia ecosystem defaults
  neighborRadius: 1.0,
  attractionForce: 0.5,
  repulsionForce: 0.5,
  cohesionStrength: 0.5,
  separationStrength: 0.5,
  activityThreshold: 0.5,
  solarIntensity: 0.5,
};

// ═══════════════════════════════════════════════════════════════
// Spatial Hash Grid for efficient neighbor lookup
// ═══════════════════════════════════════════════════════════════

class SpatialHashGrid {
  private cellSize: number;
  private grid: Map<string, number[]>;

  constructor(cellSize: number = 0.5) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private hash(x: number, y: number, z: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    return `${cx},${cy},${cz}`;
  }

  clear() {
    this.grid.clear();
  }

  insert(index: number, x: number, y: number, z: number) {
    const key = this.hash(x, y, z);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(index);
  }

  getNeighbors(x: number, y: number, z: number, radius: number): number[] {
    const neighbors: number[] = [];
    const cellRadius = Math.ceil(radius / this.cellSize);

    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const cz = Math.floor(z / this.cellSize);

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        for (let dz = -cellRadius; dz <= cellRadius; dz++) {
          const key = `${cx + dx},${cy + dy},${cz + dz}`;
          const cell = this.grid.get(key);
          if (cell) {
            neighbors.push(...cell);
          }
        }
      }
    }

    return neighbors;
  }
}

// Singleton spatial grid instance
const spatialGrid = new SpatialHashGrid(0.6);

// ═══════════════════════════════════════════════════════════════
// Morphing Particle Field
// ═══════════════════════════════════════════════════════════════

// Generate particle data with deterministic pseudo-random values
function generateParticleData(count: number) {
  const pos = new Float32Array(count * 3);
  const origPos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  // Linear congruential generator for deterministic randomness
  let seed = 12345;
  const nextRand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (let i = 0; i < count; i++) {
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
}

function ParticleField({
  envParams,
  config,
}: {
  envParams: EnvironmentParams;
  config: PerformanceConfig;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const frameCount = useRef(0);

  // Generate particle data based on performance config (memoized)
  const particleData = useMemo(
    () => generateParticleData(config.particleCount),
    [config.particleCount]
  );

  // Velocity buffer (useRef to allow mutation in useFrame)
  const velocitiesRef = useRef<Float32Array>(new Float32Array(config.particleCount * 3));

  const { positions, originalPositions, colors } = particleData;
  const particleCount = config.particleCount;

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    const velocities = velocitiesRef.current;

    let audioIntensity = 0.3;
    if (getIsPlaying()) {
      const freqData = getFrequencyData();
      audioIntensity =
        0.3 +
        (freqData.reduce((a, b) => a + Math.abs(b), 0) / freqData.length / 50);
    }

    // Apply environment-based speed modifier
    const speedMod = envParams.particleSpeed;

    // Lenia ecosystem parameters
    const {
      neighborRadius,
      attractionForce,
      repulsionForce,
      cohesionStrength,
      separationStrength,
      activityThreshold,
      solarIntensity,
    } = envParams;

    // Update spatial hash grid based on performance config
    frameCount.current++;
    const updateLenia = config.enableLenia && frameCount.current % 2 === 0;

    if (updateLenia) {
      spatialGrid.clear();
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        spatialGrid.insert(i, positions[i3], positions[i3 + 1], positions[i3 + 2]);
      }
    }

    // Sample particles for Lenia interactions (based on performance config)
    const sampleRate = config.leniaSampleRate;
    const interactionStrength = 0.06 * (0.5 + solarIntensity * 0.5);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const ox = originalPositions[i3];
      const oy = originalPositions[i3 + 1];
      const oz = originalPositions[i3 + 2];

      // Current position
      const px = positions[i3];
      const py = positions[i3 + 1];
      const pz = positions[i3 + 2];

      // Base organic movement (original behavior)
      const noiseScale = 0.2 + audioIntensity * 0.8;
      const speed = (0.3 + audioIntensity * 0.5) * speedMod;
      const nx = Math.sin(time * speed + ox * 0.8 + oy * 0.3) * noiseScale;
      const ny = Math.cos(time * speed * 0.8 + oy * 0.8 + oz * 0.3) * noiseScale;
      const nz = Math.sin(time * speed * 0.6 + oz * 0.8 + ox * 0.3) * noiseScale;

      const breathe = 1 + Math.sin(time * 0.5 * speedMod) * 0.15 * audioIntensity;

      // Lenia-style interaction forces (calculated for sampled particles)
      let leniaX = 0, leniaY = 0, leniaZ = 0;

      if (config.enableLenia && updateLenia && i % sampleRate === 0) {
        const neighbors = spatialGrid.getNeighbors(px, py, pz, neighborRadius);

        let cohesionX = 0, cohesionY = 0, cohesionZ = 0;
        let separationX = 0, separationY = 0, separationZ = 0;
        let neighborCount = 0;

        for (const j of neighbors) {
          if (j === i) continue;

          const j3 = j * 3;
          const dx = positions[j3] - px;
          const dy = positions[j3 + 1] - py;
          const dz = positions[j3 + 2] - pz;
          const distSq = dx * dx + dy * dy + dz * dz;
          const dist = Math.sqrt(distSq);

          if (dist < neighborRadius && dist > 0.01) {
            neighborCount++;

            // Lenia-style kernel: attraction at medium distance, repulsion at close
            const normalizedDist = dist / neighborRadius;

            if (normalizedDist < activityThreshold) {
              // Repulsion zone (too close)
              const repulsion = (activityThreshold - normalizedDist) * repulsionForce;
              separationX -= (dx / dist) * repulsion;
              separationY -= (dy / dist) * repulsion;
              separationZ -= (dz / dist) * repulsion;
            } else {
              // Attraction zone
              const attraction = (normalizedDist - activityThreshold) * attractionForce;
              cohesionX += (dx / dist) * attraction;
              cohesionY += (dy / dist) * attraction;
              cohesionZ += (dz / dist) * attraction;
            }
          }
        }

        if (neighborCount > 0) {
          // Apply cohesion (move towards average neighbor position)
          leniaX = (cohesionX * cohesionStrength + separationX * separationStrength) / neighborCount;
          leniaY = (cohesionY * cohesionStrength + separationY * separationStrength) / neighborCount;
          leniaZ = (cohesionZ * cohesionStrength + separationZ * separationStrength) / neighborCount;

          // Update velocity with smoothing
          velocities[i3] = velocities[i3] * 0.85 + leniaX * interactionStrength;
          velocities[i3 + 1] = velocities[i3 + 1] * 0.85 + leniaY * interactionStrength;
          velocities[i3 + 2] = velocities[i3 + 2] * 0.85 + leniaZ * interactionStrength;
        }
      }

      // Combine base movement with Lenia velocity
      positions[i3] = ox * breathe + nx + velocities[i3];
      positions[i3 + 1] = oy * breathe + ny + velocities[i3 + 1];
      positions[i3 + 2] = oz * breathe + nz + velocities[i3 + 2];

      // Dampen velocities over time (prevent runaway)
      velocities[i3] *= 0.95;
      velocities[i3 + 1] *= 0.95;
      velocities[i3 + 2] *= 0.95;
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
// Orbiting Album Covers
// ═══════════════════════════════════════════════════════════════

// Single album cover component with texture
function AlbumCover({
  coverUrl,
  index,
  total,
  envParams
}: {
  coverUrl: string;
  index: number;
  total: number;
  envParams: EnvironmentParams;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useLoader(TextureLoader, coverUrl);
  const fadeProgress = useRef(0);

  // Pre-calculate orbit parameters based on index
  const orbitData = useMemo(() => {
    const seed = (index * 9301 + 49297) % 233280;
    const rand1 = seed / 233280;
    const seed2 = (seed * 9301 + 49297) % 233280;
    const rand2 = seed2 / 233280;
    const seed3 = (seed2 * 9301 + 49297) % 233280;
    const rand3 = seed3 / 233280;

    return {
      angle: (index / total) * Math.PI * 2,
      radius: 2.5 + rand1 * 0.8,
      speed: 0.06 + rand2 * 0.08,
      yOffset: (rand3 - 0.5) * 1.2,
      fadeDelay: index * 0.2, // Stagger fade-in per cover
    };
  }, [index, total]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const speedMod = envParams.particleSpeed;

    // Smooth fade-in animation
    if (fadeProgress.current < 1) {
      fadeProgress.current = Math.min(1, fadeProgress.current + delta * 0.8);
      if (materialRef.current) {
        materialRef.current.opacity = fadeProgress.current * 0.9;
      }
    }

    let audioIntensity = 0.3;
    if (getIsPlaying()) {
      const freqData = getFrequencyData();
      audioIntensity = 0.3 + (freqData.reduce((a, b) => a + Math.abs(b), 0) / freqData.length / 60);
    }

    const speed = orbitData.speed * (1 + audioIntensity * 0.3) * speedMod;
    const angle = orbitData.angle + time * speed;

    meshRef.current.position.x = Math.cos(angle) * orbitData.radius;
    meshRef.current.position.z = Math.sin(angle) * orbitData.radius;
    meshRef.current.position.y = orbitData.yOffset + Math.sin(time * 0.5 * speedMod + index) * 0.3 * audioIntensity;

    // Face camera (billboard effect) with subtle tilt
    meshRef.current.rotation.y = -angle + Math.PI;
    meshRef.current.rotation.x = Math.sin(time * 0.3 + index) * 0.1;

    // Pulse scale with audio + fade-in scale
    const baseScale = (0.35 + audioIntensity * 0.1) * fadeProgress.current;
    meshRef.current.scale.setScalar(baseScale);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Fallback octahedron for additional orbiting elements
function OrbitingFragment({
  index,
  total,
  envParams
}: {
  index: number;
  total: number;
  envParams: EnvironmentParams;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const orbitData = useMemo(() => {
    const seed = ((index + 100) * 9301 + 49297) % 233280;
    const rand1 = seed / 233280;
    const seed2 = (seed * 9301 + 49297) % 233280;
    const rand2 = seed2 / 233280;
    const seed3 = (seed2 * 9301 + 49297) % 233280;
    const rand3 = seed3 / 233280;
    const seed4 = (seed3 * 9301 + 49297) % 233280;
    const rand4 = seed4 / 233280;

    return {
      angle: (index / total) * Math.PI * 2 + Math.PI / total,
      radius: 2.8 + rand1 * 1.2,
      speed: 0.05 + rand2 * 0.1,
      yOffset: (rand3 - 0.5) * 1.8,
      rotSpeed: rand4 * 2,
    };
  }, [index, total]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const speedMod = envParams.particleSpeed;

    let audioIntensity = 0.3;
    if (getIsPlaying()) {
      const freqData = getFrequencyData();
      audioIntensity = 0.3 + (freqData.reduce((a, b) => a + Math.abs(b), 0) / freqData.length / 60);
    }

    const speed = orbitData.speed * (1 + audioIntensity * 0.5) * speedMod;
    const angle = orbitData.angle + time * speed;

    meshRef.current.position.x = Math.cos(angle) * orbitData.radius;
    meshRef.current.position.z = Math.sin(angle) * orbitData.radius;
    meshRef.current.position.y = orbitData.yOffset + Math.sin(time * 0.8 * speedMod + index) * 0.4 * audioIntensity;

    meshRef.current.rotation.x = time * orbitData.rotSpeed * speedMod;
    meshRef.current.rotation.y = time * orbitData.rotSpeed * 0.7 * speedMod;

    const scale = 0.06 + audioIntensity * 0.03;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        color="#4a9eff"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function OrbitingCovers({
  envParams,
  covers,
  showCovers,
  fragmentCount,
}: {
  envParams: EnvironmentParams;
  covers: string[];
  showCovers: boolean;
  fragmentCount: number;
}) {

  return (
    <group>
      {/* Album covers - fade in after delay */}
      {showCovers && covers.map((cover, i) => (
        <AlbumCover
          key={`cover-${i}`}
          coverUrl={cover}
          index={i}
          total={covers.length}
          envParams={envParams}
        />
      ))}

      {/* Decorative fragments - always visible */}
      {Array.from({ length: fragmentCount }).map((_, i) => (
        <OrbitingFragment
          key={`fragment-${i}`}
          index={i}
          total={fragmentCount}
          envParams={envParams}
        />
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

function Effects({
  envParams,
  postProcessingLevel,
}: {
  envParams: EnvironmentParams;
  postProcessingLevel: "full" | "medium" | "minimal";
}) {
  const { bloomIntensity, noiseIntensity, glitchIntensity } = envParams;

  // Minimal: Only Bloom
  if (postProcessingLevel === "minimal") {
    return (
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity * 0.7}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    );
  }

  // Medium: Bloom + Vignette (no Noise/Glitch)
  if (postProcessingLevel === "medium") {
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

  // Full: All effects based on environment
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

function Scene({ envParams, covers, showCovers, config }: SceneProps) {
  return (
    <>
      <color attach="background" args={[envParams.backgroundColor]} />

      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 5]} intensity={2} color="#4a9eff" />
      <pointLight position={[0, 5, 0]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, 0, 0]} intensity={0.5} color="#9a4aff" />

      <Eye envParams={envParams} />
      <ParticleField envParams={envParams} config={config} />

      {/* Album covers with Suspense for texture loading */}
      <Suspense fallback={null}>
        <OrbitingCovers
          envParams={envParams}
          covers={covers}
          showCovers={showCovers}
          fragmentCount={config.fragmentCount}
        />
      </Suspense>

      <FloatingRings envParams={envParams} />

      <Effects envParams={envParams} postProcessingLevel={config.postProcessing} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Exported Visualizer Component
// ═══════════════════════════════════════════════════════════════

export default function Visualizer({ envParams, covers = [] }: VisualizerProps) {
  const params = envParams || defaultEnvParams;
  const [loadedCovers, setLoadedCovers] = useState<string[]>(covers);
  const [showCovers, setShowCovers] = useState(false);

  // Detect performance level once on mount
  const [perfConfig] = useState<PerformanceConfig>(() => {
    const level = getPerformanceLevel();
    console.log(`[NICTIA] Performance level: ${level}`);
    return PERFORMANCE_CONFIGS[level];
  });

  // Fetch covers from discography if not provided
  useEffect(() => {
    if (covers.length === 0) {
      fetch("/data/status.json")
        .then((res) => res.json())
        .then((data) => {
          if (data.discography?.releases) {
            const coverUrls = data.discography.releases
              .map((r: Release) => r.cover)
              .filter(Boolean);
            setLoadedCovers(coverUrls);
          }
        })
        .catch((err) => console.error("Failed to load covers:", err));
    }
  }, [covers]);

  // Delay showing covers based on performance level
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCovers(true);
    }, perfConfig.coverLoadDelay);
    return () => clearTimeout(timer);
  }, [perfConfig.coverLoadDelay]);

  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{
          antialias: perfConfig.postProcessing !== "minimal",
          alpha: false,
          powerPreference: perfConfig.powerPreference,
          stencil: false,
          depth: true,
        }}
        dpr={perfConfig.dpr}
        shadows={perfConfig.enableShadows}
      >
        <Scene
          envParams={params}
          covers={loadedCovers}
          showCovers={showCovers}
          config={perfConfig}
        />
      </Canvas>
    </div>
  );
}
