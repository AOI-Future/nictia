"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  initAudio,
  startAudio,
  stopAudio,
  getIsPlaying,
  updateEnvironmentAudio,
} from "@/utils/sound";
import useEnvironment from "@/hooks/useEnvironment";
import type { EnvironmentParams } from "@/hooks/useEnvironment";

// Dynamic import for R3F components (SSR disabled)
const Visualizer = dynamic(() => import("@/components/Visualizer"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-white/30 text-sm tracking-widest">LOADING...</div>
    </div>
  ),
});

// Dynamic import for Overlay UI (SSR disabled for QR code)
const OverlayUI = dynamic(() => import("@/components/OverlayUI"), {
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
  const [isLoading, setIsLoading] = useState(false);

  // Bio-Rhythm System: Environment hook
  const { state: envState, params: envParams } = useEnvironment();

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
    if (isLoading) return;

    setIsLoading(true);
    try {
      await initAudio();
      // Apply initial environment parameters
      updateEnvironmentAudio({
        bpm: envParams.bpm,
        reverbWet: envParams.reverbWet,
        filterFrequency: envParams.filterFrequency,
        noiseLevel: envParams.noiseLevel,
        energy: envParams.energy,
        waveformType: envParams.waveformType,
      });
      startAudio();
      setIsInitialized(true);
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, envParams]);

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

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Visualizer with environment params */}
      <Visualizer envParams={envParams} />

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
                  {isLoading ? "INITIALIZING..." : "INITIALIZE SYSTEM"}
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

        {/* Instructions - bottom center */}
        {isInitialized && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <p className="text-white/20 text-[10px] tracking-widest font-mono">
              [SPACE] {isPlaying ? "PAUSE" : "RESUME"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
