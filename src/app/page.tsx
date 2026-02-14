"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  initToneContext,
  initAudioLight,
  initAudioFullDeferred,
  startAudio,
  stopAudio,
  getIsPlaying,
  updateEnvironmentAudio,
} from "@/utils/sound";
import useEnvironment from "@/hooks/useEnvironment";
import type { EnvironmentParams } from "@/hooks/useEnvironment";

// ═══════════════════════════════════════════════════════════════
// Progressive Loading Types
// ═══════════════════════════════════════════════════════════════

type InitPhase =
  | "idle"
  | "starting"    // 軽量ビジュアル表示開始
  | "context"     // Tone.jsコンテキスト起動
  | "synth"       // シンセ初期化
  | "environment" // 環境データ（キャッシュから即時）
  | "visual"      // Visualizer表示
  | "ready";      // フル機能有効

const PHASE_INFO: Record<InitPhase, { label: string; progress: number }> = {
  idle: { label: "", progress: 0 },
  starting: { label: "STARTING", progress: 5 },
  context: { label: "AUDIO", progress: 20 },
  synth: { label: "SYNTH", progress: 40 },
  environment: { label: "ENV", progress: 55 },
  visual: { label: "VISUAL", progress: 75 },
  ready: { label: "READY", progress: 100 },
};

// ═══════════════════════════════════════════════════════════════
// Lightweight Loading Visual Component
// ═══════════════════════════════════════════════════════════════

function LoadingVisual({ phase, progress }: { phase: InitPhase; progress: number }) {
  const phases: InitPhase[] = ["context", "synth", "environment", "visual"];

  return (
    <div className="fixed inset-0 loading-bg flex flex-col items-center justify-center z-50">
      {/* Pulse rings */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute w-16 h-16 loading-ring" />
        <div className="absolute w-24 h-24 loading-ring loading-ring-delayed" />
        <div className="absolute w-32 h-32 loading-ring loading-ring-delayed-2" />

        {/* Core */}
        <div className="w-4 h-4 bg-cyan-400/80 rounded-full loading-core" />
      </div>

      {/* Progress bar */}
      <div className="mt-8 w-48">
        <div className="h-[2px] bg-white/10 overflow-hidden">
          <div
            className="h-full bg-cyan-400/80 progress-bar progress-bar-glow"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[9px] font-mono text-white/30">
          <span>{progress}%</span>
          <span>{PHASE_INFO[phase].label}</span>
        </div>
      </div>

      {/* Phase indicators */}
      <div className="mt-6 flex items-center gap-4">
        {phases.map((p, i) => {
          const isActive = phase === p;
          const isCompleted = phases.indexOf(phase) > i || phase === "ready";

          return (
            <div key={p} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  isCompleted
                    ? "bg-cyan-400"
                    : isActive
                    ? "bg-cyan-400/60 phase-dot-active"
                    : "bg-white/20"
                }`}
              />
              <span
                className={`text-[10px] tracking-wider font-mono ${
                  isCompleted || isActive ? "text-white/60" : "text-white/20"
                }`}
              >
                {p.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent scan-line" />
      </div>
    </div>
  );
}

// Dynamic import for R3F components (SSR disabled)
const Visualizer = dynamic(() => import("@/components/Visualizer"), {
  ssr: false,
  loading: () => null, // We use our own loading visual
});

// Dynamic import for Overlay UI (SSR disabled for QR code)
const OverlayUI = dynamic(() => import("@/components/OverlayUI"), {
  ssr: false,
});

// Dynamic import for Discography section
const Discography = dynamic(() => import("@/components/Discography"), {
  ssr: false,
});

// Environment indicator component
function EnvironmentIndicator({
  state,
  params,
}: {
  state: ReturnType<typeof useEnvironment>["state"];
  params: EnvironmentParams;
}) {
  if (state.isLoading) {
    return (
      <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono">
        <div className="w-2 h-2 bg-yellow-400/50 animate-pulse" />
        <span>SCANNING ENVIRONMENT...</span>
      </div>
    );
  }

  const weatherIcon = {
    clear: "CLEAR",
    cloudy: "CLOUDY",
    rain: "RAIN",
    snow: "SNOW",
    storm: "STORM",
  }[state.weather];

  const timeIcon = state.timeOfDay === "day" ? "DAY" : "NIGHT";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 text-[10px] text-white/40 font-mono tracking-wider">
        <span className="flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 ${
              state.timeOfDay === "day" ? "bg-yellow-400" : "bg-blue-400"
            }`}
          />
          {timeIcon}
        </span>
        <span className="flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 ${
              state.weather === "clear"
                ? "bg-cyan-400"
                : state.weather === "rain" || state.weather === "storm"
                ? "bg-blue-500"
                : "bg-gray-400"
            }`}
          />
          {weatherIcon}
        </span>
        <span className="text-white/20">
          {Math.round(state.temperature)}°C
        </span>
      </div>
      <div className="flex items-center gap-2 text-[9px] text-white/20 font-mono">
        <span>BPM:{Math.round(params.bpm)}</span>
        <span>|</span>
        <span>ENERGY:{params.energy.toUpperCase()}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<InitPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [showVisualizer, setShowVisualizer] = useState(false);

  // Bio-Rhythm System: Environment hook
  const { state: envState, params: envParams } = useEnvironment();

  // Smooth progress animation (faster increments for better UX)
  useEffect(() => {
    const targetProgress = PHASE_INFO[phase].progress;
    if (progress < targetProgress) {
      const increment = Math.max(3, Math.ceil((targetProgress - progress) / 5));
      const timer = setTimeout(() => {
        setProgress((prev) => Math.min(prev + increment, targetProgress));
      }, 16);
      return () => clearTimeout(timer);
    }
  }, [phase, progress]);

  // Update audio parameters when environment changes
  useEffect(() => {
    if (isInitialized && !envState.isLoading) {
      updateEnvironmentAudio({
        bpm: envParams.bpm,
        reverbWet: envParams.reverbWet,
        filterFrequency: envParams.filterFrequency,
        noiseLevel: envParams.noiseLevel,
        energy: envParams.energy,
        waveformType: envParams.waveformType,
      });
    }
  }, [isInitialized, envState.isLoading, envParams]);

  const handleInitialize = useCallback(async () => {
    if (phase !== "idle") return;

    try {
      // Phase 1: Starting (show loading UI)
      setPhase("starting");
      await new Promise((r) => setTimeout(r, 50));

      // Phase 2: Audio context (Tone.start - user gesture required)
      setPhase("context");
      await initToneContext();

      // Phase 3: Synth initialization
      setPhase("synth");
      await initAudioLight();

      // Apply initial environment parameters
      updateEnvironmentAudio({
        bpm: envParams.bpm,
        reverbWet: envParams.reverbWet,
        filterFrequency: envParams.filterFrequency,
        noiseLevel: envParams.noiseLevel,
        energy: envParams.energy,
        waveformType: envParams.waveformType,
      });

      // Start audio immediately (without waiting for reverb)
      startAudio();
      setIsPlaying(true);

      // Phase 4: Environment (uses cached data, fast)
      setPhase("environment");
      await new Promise((r) => setTimeout(r, 100));

      // Phase 5: Visual (show visualizer)
      setPhase("visual");
      setShowVisualizer(true);
      await new Promise((r) => setTimeout(r, 400));

      // Phase 6: Ready
      setPhase("ready");
      setIsInitialized(true);

      // Background: Initialize full audio (reverb) without blocking
      initAudioFullDeferred();
    } catch (error) {
      console.error("Failed to initialize:", error);
      setPhase("idle");
    }
  }, [phase, envParams]);

  const handleToggle = useCallback(() => {
    if (getIsPlaying()) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio();
      setIsPlaying(true);
    }
  }, []);

  // Keyboard shortcut: Space to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && isInitialized) {
        e.preventDefault();
        handleToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInitialized, handleToggle]);

  // Enable scroll when initialized
  useEffect(() => {
    if (isInitialized) {
      document.documentElement.classList.add("scroll-enabled");
    } else {
      document.documentElement.classList.remove("scroll-enabled");
    }
    return () => {
      document.documentElement.classList.remove("scroll-enabled");
    };
  }, [isInitialized]);

  const isLoading = phase !== "idle" && phase !== "ready";

  return (
    <div className="relative bg-black">
      {/* Loading Visual */}
      {isLoading && <LoadingVisual phase={phase} progress={progress} />}

      {/* Hero Section (100vh) */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* 3D Visualizer with environment params (only render when showVisualizer is true) */}
        {showVisualizer && <Visualizer envParams={envParams} />}

        {/* HUD Overlay UI (Volume, Transmission, QR) */}
        <OverlayUI isActive={isInitialized} />

        {/* Core UI Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Title - top left */}
          <div className="absolute top-6 left-6">
            <div className="relative">
              {/* HUD frame decoration */}
              <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-cyan-400/60 to-transparent" />
              <h1 className="text-white/90 text-sm tracking-[0.4em] font-light pl-2">
                NICTIA
              </h1>
              <p className="text-white/40 text-[10px] tracking-[0.2em] mt-1 pl-2">
                AUTONOMOUS AUDIOVISUAL SYSTEM
              </p>

              {/* Bio-Rhythm Environment Indicator */}
              {isInitialized && (
                <div className="mt-3 pl-2 border-l border-white/10">
                  <div className="text-[9px] text-cyan-400/60 tracking-widest mb-1">
                    BIO-RHYTHM
                  </div>
                  <EnvironmentIndicator state={envState} params={envParams} />
                </div>
              )}
            </div>
          </div>

          {/* Status indicator - top right */}
          {isInitialized && (
            <div className="absolute top-14 right-6 flex items-center gap-2">
              <div
                className={`w-2 h-2 ${
                  isPlaying ? "bg-cyan-400 animate-pulse" : "bg-white/30"
                }`}
              />
              <span className="text-white/50 text-[10px] tracking-widest font-mono">
                {isPlaying ? "STREAM_ACTIVE" : "STREAM_PAUSED"}
              </span>
            </div>
          )}

          {/* Center button - Initialize or Toggle */}
          <div className="absolute inset-0 flex items-center justify-center">
            {!isInitialized ? (
              <button
                onClick={handleInitialize}
                disabled={isLoading}
                className="pointer-events-auto group relative"
              >
                {/* Animated outer rings */}
                <div className="absolute inset-0 rounded-full border border-cyan-400/20 scale-[2] group-hover:scale-[2.2] group-hover:border-cyan-400/40 transition-all duration-700 animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-white/10 scale-[2.5] group-hover:scale-[2.8] transition-all duration-1000" />

                {/* Main button */}
                <div className="relative px-10 py-5 border border-cyan-400/30 bg-black/60 backdrop-blur-md group-hover:bg-cyan-400/10 group-hover:border-cyan-400/60 transition-all duration-300">
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/60" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-400/60" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400/60" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/60" />

                  <span className="text-cyan-400/90 text-xs tracking-[0.3em] font-mono">
                    INITIALIZE SYSTEM
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={handleToggle}
                className="pointer-events-auto opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-500 px-6 py-3 border border-white/20 bg-black/50 backdrop-blur-sm"
              >
                <span className="text-white/60 text-[10px] tracking-[0.3em] font-mono">
                  {isPlaying ? "PAUSE_STREAM" : "RESUME_STREAM"}
                </span>
              </button>
            )}
          </div>

          {/* Scroll indicator - bottom center */}
          {isInitialized && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <p className="text-white/20 text-[10px] tracking-widest font-mono">
                [SPACE] {isPlaying ? "PAUSE" : "RESUME"}
              </p>
              <div className="flex flex-col items-center gap-1 mt-2 animate-scroll-bounce">
                <span className="text-white/20 text-[9px] tracking-widest">SCROLL</span>
                <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Discography Section */}
      {isInitialized && <Discography />}

      {/* Footer */}
      {isInitialized && (
        <footer className="bg-black py-12 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-400/60 to-transparent" />
              <div>
                <span className="text-white/60 text-xs tracking-[0.3em]">NICTIA</span>
                <p className="text-white/20 text-[9px] tracking-wider">AUTONOMOUS AUDIOVISUAL SYSTEM</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-[10px] text-white/30 tracking-wider">
              <a href="/legal" className="hover:text-white/60 transition-colors">LEGAL</a>
              <span className="text-white/10">|</span>
              <span>© {new Date().getFullYear()} NICTIA</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
