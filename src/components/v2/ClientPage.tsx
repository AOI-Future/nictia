"use client";

import dynamic from "next/dynamic";
import { AudioProvider } from "@/components/v2/AudioEngine";

const FlowField = dynamic(() => import("@/components/v2/FlowField"), {
  ssr: false,
});
const StatusBar = dynamic(() => import("@/components/v2/StatusBar"), {
  ssr: false,
});
const NewsTicker = dynamic(() => import("@/components/v2/NewsTicker"), {
  ssr: false,
});
const HeroSection = dynamic(() => import("@/components/v2/HeroSection"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-white/20 text-sm tracking-widest animate-pulse">
        LOADING...
      </span>
    </div>
  ),
});
const Press = dynamic(() => import("@/components/v2/Press"), {
  ssr: false,
});
const Discography = dynamic(() => import("@/components/v2/Discography"), {
  ssr: false,
});
const LiveTerminal = dynamic(() => import("@/components/v2/LiveTerminal"), {
  ssr: false,
});
const AudioInitButton = dynamic(
  () =>
    import("@/components/v2/AudioEngine").then((mod) => mod.AudioInitButton),
  { ssr: false }
);

export default function ClientPage() {
  return (
    <AudioProvider>
      <div className="relative min-h-screen bg-black">
        {/* Background flow field canvas */}
        <FlowField />

        {/* Scanline overlay */}
        <div className="fixed inset-0 z-[1] scanlines pointer-events-none" />

        {/* Fixed UI elements */}
        <StatusBar />
        <NewsTicker />
        <LiveTerminal />
        <AudioInitButton />

        {/* Scrollable content */}
        <main className="relative z-10">
          {/* Hero */}
          <HeroSection />

          {/* Press / News */}
          <Press />

          {/* Discography */}
          <Discography />

          {/* Footer */}
          <footer className="relative z-10 border-t border-cyan-400/5 py-12 px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-cyan-400/40" />
                <span className="text-white/30 text-[10px] tracking-[0.3em]">
                  NICTIA SYSTEM v2.0
                </span>
              </div>

              <div className="flex items-center gap-6">
                <a
                  href="https://open.spotify.com/artist/0j7nZReeOs0R8lgdTxXtL6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/20 text-[10px] tracking-wider hover:text-cyan-400/60 transition-colors"
                >
                  SPOTIFY
                </a>
                <a
                  href="https://music.apple.com/jp/artist/nictia/1790247758"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/20 text-[10px] tracking-wider hover:text-cyan-400/60 transition-colors"
                >
                  APPLE MUSIC
                </a>
                <a
                  href="https://music.youtube.com/channel/UCrS9TtbbKn3rpN_KWd-u3_A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/20 text-[10px] tracking-wider hover:text-cyan-400/60 transition-colors"
                >
                  YOUTUBE MUSIC
                </a>
                <a
                  href="/legal"
                  className="text-white/20 text-[10px] tracking-wider hover:text-cyan-400/60 transition-colors"
                >
                  LEGAL
                </a>
              </div>

              <span className="text-white/15 text-[9px] tracking-wider">
                AUTONOMOUS AUDIOVISUAL GENERATION
              </span>
            </div>
          </footer>
        </main>
      </div>
    </AudioProvider>
  );
}
