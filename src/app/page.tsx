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

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Title - top left */}
        <div className="absolute top-6 left-6">
          <h1 className="text-white/80 text-xs tracking-[0.3em] font-light">
            NICTIA
          </h1>
          <p className="text-white/30 text-[10px] tracking-widest mt-1">
            AUTONOMOUS AUDIOVISUAL SYSTEM
          </p>
        </div>

        {/* Status indicator - top right */}
        {isInitialized && (
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isPlaying ? "bg-cyan-400 animate-pulse" : "bg-white/30"
              }`}
            />
            <span className="text-white/50 text-[10px] tracking-widest">
              {isPlaying ? "ACTIVE" : "PAUSED"}
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
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border border-white/20 scale-150 group-hover:scale-[1.6] group-hover:border-white/40 transition-all duration-500" />

              {/* Main button */}
              <div className="relative px-8 py-4 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm group-hover:bg-white/10 group-hover:border-white/50 transition-all duration-300">
                <span className="text-white/80 text-xs tracking-[0.2em] font-light">
                  {isLoading ? "INITIALIZING..." : "INITIALIZE SYSTEM"}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={handleToggle}
              className="pointer-events-auto opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-500 px-6 py-3 rounded-full border border-white/20 bg-black/50 backdrop-blur-sm"
            >
              <span className="text-white/60 text-[10px] tracking-[0.2em]">
                {isPlaying ? "PAUSE" : "RESUME"}
              </span>
            </button>
          )}
        </div>

        {/* Instructions - bottom */}
        {isInitialized && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <p className="text-white/20 text-[10px] tracking-widest">
              PRESS SPACE TO {isPlaying ? "PAUSE" : "RESUME"}
            </p>
          </div>
        )}

        {/* Version - bottom right */}
        <div className="absolute bottom-6 right-6">
          <p className="text-white/20 text-[10px] tracking-widest">v0.1.0</p>
        </div>
      </div>
    </main>
  );
}
