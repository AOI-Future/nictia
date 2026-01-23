"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { initAudio, startAudio, stopAudio, getIsPlaying } from "@/utils/sound";

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

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInitialize = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await initAudio();
      startAudio();
      setIsInitialized(true);
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

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
      {/* 3D Visualizer */}
      <Visualizer />

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
          </div>
        </div>

        {/* Status indicator - top right (only before HUD overlay shows) */}
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
