# NICTIA - Autonomous Audiovisual System

## Overview
AIアーティスト「NICTIA」のWebアプリケーション。自律的に音楽と映像を生成する。

- **Repository**: https://github.com/AOI-Future/nictia
- **Live Site**: Vercel (auto-deploy from main branch)
- **Version**: 0.2.0

## Tech Stack
- Next.js 16 (App Router, TypeScript)
- Three.js / React Three Fiber (@react-three/fiber, @react-three/drei)
- @react-three/postprocessing (Bloom, Vignette, Noise, Glitch)
- Tone.js (generative audio)
- Tailwind CSS
- react-qr-code

## Architecture

```
src/
├── app/page.tsx              # Main page with state management
├── components/
│   ├── Visualizer.tsx        # R3F 3D scene with postprocessing
│   └── OverlayUI.tsx         # HUD overlay (volume, terminal, QR, links)
├── hooks/useEnvironment.ts   # Bio-Rhythm System (location/weather)
├── utils/sound.ts            # Tone.js audio engine
└── public/data/status.json   # Data-driven UI content
```

## Bio-Rhythm System
外部環境（時間・天候）に応じて音と映像が変化。

### Data Sources
- **Location**: Geolocation API (fallback: Tokyo)
- **Weather**: Open-Meteo API

### Time of Day
| Time | BPM | Energy | Particle Speed | Bloom |
|------|-----|--------|----------------|-------|
| Day (6-18h) | 125-130 | High | 1.3x | 0.4 |
| Night | 110-120 | Low | 0.7x | 0.8 |

### Weather Effects
| Condition | Waveform | Filter | Effects |
|-----------|----------|--------|---------|
| Clear | Sine | 3000Hz | Clean |
| Cloudy | Triangle | 1500Hz | Soft bloom |
| Rain | Triangle | 800Hz | Noise + glitch |
| Snow | Sine | 600Hz | Heavy bloom, slow |
| Storm | Square | 1200Hz | Heavy glitch |

## Configuration (status.json)
```json
{
  "transmission": { "enabled": true, "message": "...", "cta": {...} },
  "links": { "primary": {...}, "social": [...] },
  "systemStatus": { "version": "...", "mode": "..." }
}
```

## Recent Changes (2025-01)
- Bio-Rhythm System implementation
- Postprocessing effects
- Social links display
- Rain noise synth
