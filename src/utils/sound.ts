import * as Tone from "tone";

// NICTIA Sound System
// Generative ambient techno: drones + stochastic pulses

let isInitialized = false;
let isPlaying = false;

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

export async function initAudio(): Promise<void> {
  if (isInitialized) return;

  await Tone.start();

  // Create effects chain
  reverb = new Tone.Reverb({
    decay: 8,
    wet: 0.6,
    preDelay: 0.2,
  }).toDestination();
  await reverb.generate();

  delay = new Tone.FeedbackDelay({
    delayTime: "8n.",
    feedback: 0.4,
    wet: 0.3,
  }).connect(reverb);

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

  // Noise synth - texture
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
  }).connect(reverb);

  // Drone loop - slow evolving chords
  droneLoop = new Tone.Loop((time) => {
    const notes = getRandomDroneNotes();
    droneSynth?.triggerAttackRelease(notes, "4n", time);

    // Randomly modulate filter
    if (filter && Math.random() > 0.5) {
      const newFreq = 500 + Math.random() * 2000;
      filter.frequency.rampTo(newFreq, 4);
    }
  }, "2m");

  // Pulse loop - irregular rhythmic pulses
  pulseLoop = new Tone.Loop((time) => {
    // Probability-based triggering
    if (Math.random() > 0.4) {
      const note = getRandomNote();
      const duration = ["16n", "8n", "4n"][Math.floor(Math.random() * 3)];
      pulseSynth?.triggerAttackRelease(note, duration, time);
    }
  }, "8n");

  // Noise loop - occasional textural bursts
  noiseLoop = new Tone.Loop((time) => {
    if (Math.random() > 0.7) {
      noiseSynth?.triggerAttackRelease("4n", time);
    }
  }, "4n");

  isInitialized = true;
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

// Expose audio analysis for visualizer
let analyser: Tone.Analyser | null = null;
let waveformAnalyser: Tone.Analyser | null = null;

export function getAnalyser(): Tone.Analyser {
  if (!analyser) {
    analyser = new Tone.Analyser("fft", 64);
    Tone.getDestination().connect(analyser);
  }
  return analyser;
}

export function getWaveformAnalyser(): Tone.Analyser {
  if (!waveformAnalyser) {
    waveformAnalyser = new Tone.Analyser("waveform", 256);
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
