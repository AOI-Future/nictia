import * as Tone from "tone";

// NICTIA Sound System
// Generative ambient techno: drones + stochastic pulses

let isLightInitialized = false;
let isFullInitialized = false;
let isInitialized = false;
let isPlaying = false;

interface AudioProfile {
  lowMemoryMode: boolean;
  skipReverb: boolean;
  analyserBins: number;
  waveformBins: number;
  droneInterval: string;
  pulseInterval: string;
  noiseInterval: string;
}

let audioProfile: AudioProfile | null = null;

// Synths
let droneSynth: Tone.PolySynth | null = null;
let pulseSynth: Tone.MonoSynth | null = null;
let noiseSynth: Tone.NoiseSynth | null = null;

// Effects
let reverb: Tone.Reverb | null = null;
let delay: Tone.FeedbackDelay | null = null;
let filter: Tone.Filter | null = null;

// Loops
let droneLoop: Tone.Loop | null = null;
let pulseLoop: Tone.Loop | null = null;
let noiseLoop: Tone.Loop | null = null;

// Scales and notes for generative music
const baseNotes = ["C", "D", "E", "G", "A"]; // Pentatonic scale
const octaves = [2, 3, 4];
const droneNotes = ["C2", "G2", "C3", "E3"];

function getAudioProfile(): AudioProfile {
  if (audioProfile) return audioProfile;

  if (typeof navigator === "undefined") {
    audioProfile = {
      lowMemoryMode: false,
      skipReverb: false,
      analyserBins: 64,
      waveformBins: 256,
      droneInterval: "2m",
      pulseInterval: "8n",
      noiseInterval: "4n",
    };
    return audioProfile;
  }

  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory || 2;
  const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
  const saveData = !!connection?.saveData;
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const lowMemoryMode =
    saveData || reducedMotion || isMobile || memory <= 4 || cores <= 4;
  const skipReverb = saveData || reducedMotion || (isSafari && (isMobile || memory <= 4));

  audioProfile = {
    lowMemoryMode,
    skipReverb,
    analyserBins: lowMemoryMode ? 32 : 64,
    waveformBins: lowMemoryMode ? 128 : 256,
    droneInterval: lowMemoryMode ? "4m" : "2m",
    pulseInterval: lowMemoryMode ? "4n" : "8n",
    noiseInterval: lowMemoryMode ? "2n" : "4n",
  };

  return audioProfile;
}

function getRandomNote(): string {
  const note = baseNotes[Math.floor(Math.random() * baseNotes.length)];
  const octave = octaves[Math.floor(Math.random() * octaves.length)];
  return `${note}${octave}`;
}

function getRandomDroneNotes(): string[] {
  const count = Math.floor(Math.random() * 2) + 2; // 2-3 notes
  const notes: string[] = [];
  for (let i = 0; i < count; i++) {
    notes.push(droneNotes[Math.floor(Math.random() * droneNotes.length)]);
  }
  return notes;
}

// Phase 0: Just start Tone context (very fast)
export async function initToneContext(): Promise<void> {
  await Tone.start();
  const context = Tone.getContext();
  context.lookAhead = 0.05;
}

// Phase 1: Light initialization (Reverb無しで即座に開始)
export async function initAudioLight(): Promise<void> {
  if (isLightInitialized) return;
  const profile = getAudioProfile();

  // Tone.start() should already be called via initToneContext
  if (Tone.getContext().state !== "running") {
    await Tone.start();
  }

  // Create effects chain WITHOUT reverb (reverb is added later)
  // Delay connects directly to destination initially
  delay = new Tone.FeedbackDelay({
    delayTime: "8n.",
    feedback: profile.lowMemoryMode ? 0.3 : 0.4,
    wet: profile.lowMemoryMode ? 0.2 : 0.3,
  }).toDestination();

  filter = new Tone.Filter({
    type: "lowpass",
    frequency: 2000,
    Q: 1,
  }).connect(delay);

  // Drone synth - warm pad sound
  droneSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "sine",
    },
    envelope: {
      attack: 4,
      decay: 2,
      sustain: 0.8,
      release: 6,
    },
    volume: -12,
  }).connect(filter);

  // Pulse synth - sharp, rhythmic elements
  pulseSynth = new Tone.MonoSynth({
    oscillator: {
      type: "square",
    },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0,
      release: 0.5,
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.2,
      release: 0.5,
      baseFrequency: 200,
      octaves: 3,
    },
    volume: -18,
  }).connect(filter);

  // Noise synth - texture (connects to delay initially, will reconnect to reverb later)
  noiseSynth = new Tone.NoiseSynth({
    noise: {
      type: "pink",
    },
    envelope: {
      attack: 0.5,
      decay: 1,
      sustain: 0,
      release: 1,
    },
    volume: -24,
  }).connect(delay);

  // Drone loop - slow evolving chords
  droneLoop = new Tone.Loop((time) => {
    const notes = getRandomDroneNotes();
    droneSynth?.triggerAttackRelease(notes, "4n", time);

    // Randomly modulate filter
    if (filter && Math.random() > 0.5) {
      const newFreq = 500 + Math.random() * 2000;
      filter.frequency.rampTo(newFreq, 4);
    }
  }, profile.droneInterval);

  // Pulse loop - irregular rhythmic pulses
  pulseLoop = new Tone.Loop((time) => {
    // Probability-based triggering
    if (Math.random() > 0.4) {
      const note = getRandomNote();
      const duration = ["16n", "8n", "4n"][Math.floor(Math.random() * 3)];
      pulseSynth?.triggerAttackRelease(note, duration, time);
    }
  }, profile.pulseInterval);

  // Noise loop - occasional textural bursts
  noiseLoop = new Tone.Loop((time) => {
    if (Math.random() > 0.7) {
      noiseSynth?.triggerAttackRelease("4n", time);
    }
  }, profile.noiseInterval);

  isLightInitialized = true;
  isInitialized = true;
}

// Phase 2: Full initialization (Reverbをバックグラウンドで追加)
export async function initAudioFull(): Promise<void> {
  if (isFullInitialized || !isLightInitialized) return;
  const profile = getAudioProfile();

  if (profile.skipReverb) {
    isFullInitialized = true;
    return;
  }

  // Create reverb with wet: 0 (will fade in)
  reverb = new Tone.Reverb({
    decay: 8,
    wet: 0,
    preDelay: 0.2,
  }).toDestination();

  // Generate reverb (this is the heavy operation)
  try {
    await Promise.race([
      reverb.generate(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Reverb generation timeout")), 2500)
      ),
    ]);
  } catch (error) {
    console.warn("[NICTIA] Reverb disabled for stability:", error);
    reverb.dispose();
    reverb = null;
    isFullInitialized = true;
    return;
  }

  // Reconnect delay to reverb instead of destination
  delay?.disconnect();
  delay?.connect(reverb);

  // Reconnect noise synth to reverb for better texture
  noiseSynth?.disconnect();
  noiseSynth?.connect(reverb);

  // Fade in reverb wet level
  fadeInReverb();

  isFullInitialized = true;
}

// Smooth fade-in for reverb wet level
function fadeInReverb(): void {
  if (!reverb) return;

  // Fade from 0 to 0.6 over 3 seconds
  reverb.wet.rampTo(0.6, 3);
}

// Legacy function for compatibility (calls both phases)
export async function initAudio(): Promise<void> {
  if (isInitialized) return;

  await initAudioLight();
  // Start full init in background (don't await)
  initAudioFull();
}

export function startAudio(): void {
  if (!isInitialized || isPlaying) return;

  Tone.getTransport().bpm.value = 60 + Math.random() * 30; // 60-90 BPM
  Tone.getTransport().start();

  droneLoop?.start(0);
  pulseLoop?.start(0);
  noiseLoop?.start(0);

  isPlaying = true;
}

export function stopAudio(): void {
  if (!isPlaying) return;

  droneLoop?.stop();
  pulseLoop?.stop();
  noiseLoop?.stop();

  Tone.getTransport().stop();
  isPlaying = false;
}

export function toggleAudio(): boolean {
  if (isPlaying) {
    stopAudio();
  } else {
    startAudio();
  }
  return isPlaying;
}

export function getIsPlaying(): boolean {
  return isPlaying;
}

export function getIsInitialized(): boolean {
  return isInitialized;
}

export function getIsLightInitialized(): boolean {
  return isLightInitialized;
}

export function getIsFullInitialized(): boolean {
  return isFullInitialized;
}

// Expose audio analysis for visualizer
let analyser: Tone.Analyser | null = null;
let waveformAnalyser: Tone.Analyser | null = null;

export function getAnalyser(): Tone.Analyser {
  if (!analyser) {
    analyser = new Tone.Analyser("fft", getAudioProfile().analyserBins);
    Tone.getDestination().connect(analyser);
  }
  return analyser;
}

export function getWaveformAnalyser(): Tone.Analyser {
  if (!waveformAnalyser) {
    waveformAnalyser = new Tone.Analyser("waveform", getAudioProfile().waveformBins);
    Tone.getDestination().connect(waveformAnalyser);
  }
  return waveformAnalyser;
}

export function getFrequencyData(): Float32Array {
  return getAnalyser().getValue() as Float32Array;
}

export function getWaveformData(): Float32Array {
  return getWaveformAnalyser().getValue() as Float32Array;
}

// Volume control
let isMuted = false;
let currentVolume = 80; // 0-100

export function setVolume(volume: number): void {
  currentVolume = Math.max(0, Math.min(100, volume));
  if (!isMuted) {
    // Convert 0-100 to dB scale (-60 to 0)
    const db = volume === 0 ? -Infinity : -60 + (currentVolume / 100) * 60;
    Tone.getDestination().volume.value = db;
  }
}

export function getVolume(): number {
  return currentVolume;
}

export function setMuted(muted: boolean): void {
  isMuted = muted;
  if (muted) {
    Tone.getDestination().volume.value = -Infinity;
  } else {
    setVolume(currentVolume);
  }
}

export function getMuted(): boolean {
  return isMuted;
}

export function toggleMute(): boolean {
  setMuted(!isMuted);
  return isMuted;
}

// ═══════════════════════════════════════════════════════════════
// Bio-Rhythm System: Environment-reactive audio parameters
// ═══════════════════════════════════════════════════════════════

export interface AudioEnvironmentParams {
  bpm: number;
  reverbWet: number;
  filterFrequency: number;
  noiseLevel: number;
  energy: "high" | "low";
  waveformType: "sine" | "triangle" | "square";
}

// Rain/ambient noise synth
let rainNoiseSynth: Tone.NoiseSynth | null = null;
let rainNoiseGain: Tone.Gain | null = null;

// Current environment state
let currentEnvParams: AudioEnvironmentParams = {
  bpm: 120,
  reverbWet: 0.5,
  filterFrequency: 2000,
  noiseLevel: 0,
  energy: "high",
  waveformType: "sine",
};

export function updateEnvironmentAudio(params: AudioEnvironmentParams): void {
  if (!isInitialized) return;

  currentEnvParams = params;

  // Update BPM with smooth transition
  const transport = Tone.getTransport();
  transport.bpm.rampTo(params.bpm, 4); // 4 second transition

  // Update reverb wet level
  if (reverb) {
    reverb.wet.rampTo(params.reverbWet, 2);
  }

  // Update filter frequency
  if (filter) {
    filter.frequency.rampTo(params.filterFrequency, 3);
  }

  // Update drone synth waveform
  if (droneSynth) {
    // PolySynth doesn't support direct oscillator type change easily
    // So we adjust the volume based on energy instead
    const droneVolume = params.energy === "high" ? -10 : -14;
    droneSynth.volume.rampTo(droneVolume, 2);
  }

  // Update pulse synth based on energy
  if (pulseSynth) {
    const pulseVolume = params.energy === "high" ? -16 : -22;
    pulseSynth.volume.rampTo(pulseVolume, 2);
  }

  // Handle rain/ambient noise
  updateRainNoise(params.noiseLevel);
}

function updateRainNoise(level: number): void {
  // Create rain noise synth if not exists
  if (!rainNoiseSynth && reverb) {
    rainNoiseGain = new Tone.Gain(0).connect(reverb);
    rainNoiseSynth = new Tone.NoiseSynth({
      noise: { type: "brown" },
      envelope: {
        attack: 2,
        decay: 0,
        sustain: 1,
        release: 2,
      },
    }).connect(rainNoiseGain);
  }

  if (rainNoiseGain) {
    if (level > 0) {
      // Convert 0-1 to dB (-40 to -12)
      const db = -40 + level * 28;
      rainNoiseGain.gain.rampTo(Tone.dbToGain(db), 3);

      // Start rain noise if not playing
      if (rainNoiseSynth && isPlaying) {
        rainNoiseSynth.triggerAttack();
      }
    } else {
      rainNoiseGain.gain.rampTo(0, 2);
      if (rainNoiseSynth) {
        rainNoiseSynth.triggerRelease();
      }
    }
  }
}

export function getEnvironmentParams(): AudioEnvironmentParams {
  return currentEnvParams;
}

// Adjust pulse probability based on energy
export function getPulseProbability(): number {
  return currentEnvParams.energy === "high" ? 0.6 : 0.3;
}

// Adjust noise burst probability based on environment
export function getNoiseBurstProbability(): number {
  return currentEnvParams.noiseLevel > 0 ? 0.5 : 0.3;
}
