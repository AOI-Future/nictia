"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AudioContextType {
  isAudioActive: boolean;
  initializeAudio: () => Promise<void>;
  playClickSound: () => void;
  playHoverSound: () => void;
}

const AudioContext = createContext<AudioContextType>({
  isAudioActive: false,
  initializeAudio: async () => {},
  playClickSound: () => {},
  playHoverSound: () => {},
});

export function useAudio() {
  return useContext(AudioContext);
}

// Beep sound generator using Web Audio API
function playBeep(
  audioCtx: globalThis.AudioContext,
  frequency: number,
  duration: number,
  volume: number
) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration
  );

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const audioCtxRef = useRef<globalThis.AudioContext | null>(null);
  const bgmNodesRef = useRef<{
    dronOsc1: OscillatorNode;
    dronOsc2: OscillatorNode;
    lfo: OscillatorNode;
    masterGain: GainNode;
  } | null>(null);

  const initializeAudio = useCallback(async () => {
    if (isAudioActive) return;

    const ctx = new window.AudioContext();
    audioCtxRef.current = ctx;

    // Create BGM: minimal drone
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    filter.Q.value = 1;
    filter.connect(masterGain);

    // Drone oscillator 1 (C2 ~65Hz)
    const dronOsc1 = ctx.createOscillator();
    dronOsc1.type = "sine";
    dronOsc1.frequency.value = 65.41;
    const droneGain1 = ctx.createGain();
    droneGain1.gain.value = 0.08;
    dronOsc1.connect(droneGain1);
    droneGain1.connect(filter);
    dronOsc1.start();

    // Drone oscillator 2 (G2 ~98Hz)
    const dronOsc2 = ctx.createOscillator();
    dronOsc2.type = "sine";
    dronOsc2.frequency.value = 98;
    const droneGain2 = ctx.createGain();
    droneGain2.gain.value = 0.05;
    dronOsc2.connect(droneGain2);
    droneGain2.connect(filter);
    dronOsc2.start();

    // LFO for subtle movement
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    bgmNodesRef.current = { dronOsc1, dronOsc2, lfo, masterGain };

    // Fade in over 3 seconds
    masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 3);

    setIsAudioActive(true);

    // Confirmation beep
    playBeep(ctx, 880, 0.08, 0.1);
    setTimeout(() => playBeep(ctx, 1320, 0.06, 0.08), 100);
  }, [isAudioActive]);

  const playClickSound = useCallback(() => {
    if (!audioCtxRef.current) return;
    playBeep(audioCtxRef.current, 1200, 0.04, 0.06);
  }, []);

  const playHoverSound = useCallback(() => {
    if (!audioCtxRef.current) return;
    playBeep(audioCtxRef.current, 2400, 0.02, 0.02);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bgmNodesRef.current) {
        bgmNodesRef.current.dronOsc1.stop();
        bgmNodesRef.current.dronOsc2.stop();
        bgmNodesRef.current.lfo.stop();
      }
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <AudioContext value={{
      isAudioActive,
      initializeAudio,
      playClickSound,
      playHoverSound,
    }}>
      {children}
    </AudioContext>
  );
}

export function AudioInitButton() {
  const { isAudioActive, initializeAudio } = useAudio();

  if (isAudioActive) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5, delay: 2 }}
        onClick={initializeAudio}
        className="fixed bottom-4 left-4 z-50 group"
      >
        <div className="relative px-4 py-2 border border-cyan-400/20 bg-black/70 backdrop-blur-md hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all duration-300">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/40" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/40" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/40" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/40" />

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 border border-cyan-400/60 group-hover:bg-cyan-400/40 transition-colors" />
            <span className="text-cyan-400/70 text-[10px] tracking-[0.2em] group-hover:text-cyan-400 transition-colors">
              INITIALIZE AUDIO
            </span>
          </div>
        </div>
      </motion.button>
    </AnimatePresence>
  );
}
