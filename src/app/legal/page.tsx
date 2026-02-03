import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal Notice | NICTIA",
  description: "Legal information about NICTIA's AI-collaborative music project",
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Scanline effect */}
      <div className="fixed inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] pointer-events-none opacity-30 z-50" />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent z-40" />

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent z-40" />

      {/* Back button */}
      <div className="fixed top-6 left-6 z-30">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 border border-white/20 bg-black/60 backdrop-blur-sm hover:border-cyan-400/60 hover:bg-cyan-400/10 transition-all duration-300"
        >
          <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[10px] text-white/60 tracking-widest font-mono">BACK</span>
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24">
        {/* Header */}
        <header className="mb-12">
          <div className="relative inline-block">
            <div className="absolute -left-3 top-0 w-1 h-full bg-gradient-to-b from-cyan-400/60 to-transparent" />
            <h1 className="text-white/90 text-lg tracking-[0.3em] font-light">
              LEGAL NOTICE
            </h1>
          </div>
          <p className="text-white/30 text-xs tracking-[0.2em] mt-2 ml-0">
            AI-COLLABORATIVE MUSIC PROJECT
          </p>
        </header>

        {/* Intro */}
        <section className="mb-10 p-5 border border-white/10 bg-white/5 backdrop-blur-sm">
          <p className="text-white/70 text-sm font-mono leading-relaxed">
            <strong className="text-cyan-400">NICTIA</strong> is an AI-collaborative music project produced by AOI Future.
          </p>
        </section>

        {/* Section: AI Disclosure */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-cyan-400" />
            <h2 className="text-white/80 text-xs tracking-[0.2em] font-mono">
              AI-GENERATED MUSIC DISCLOSURE
            </h2>
          </div>
          <div className="border border-white/10 p-5 space-y-4">
            <p className="text-white/60 text-xs font-mono leading-relaxed">
              All music released as NICTIA incorporates AI-generated elements created using commercial AI music generation services (Suno AI, Udio AI, and others). These works represent a collaboration between human creativity and artificial intelligence.
            </p>

            <div>
              <h3 className="text-white/50 text-[10px] tracking-widest mb-2">HUMAN CREATIVE CONTRIBUTION</h3>
              <ul className="text-white/50 text-xs font-mono space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-cyan-400/60" />
                  Original musical concepts and artistic direction
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-cyan-400/60" />
                  Prompt engineering and AI output curation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-cyan-400/60" />
                  Post-production, mixing, and mastering
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-cyan-400/60" />
                  Final creative decisions and quality control
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section: Copyright */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-cyan-400" />
            <h2 className="text-white/80 text-xs tracking-[0.2em] font-mono">
              COPYRIGHT NOTICE
            </h2>
          </div>
          <div className="border border-white/10 p-5 space-y-3">
            <p className="text-cyan-400/80 text-xs font-mono">
              © 2024-2026 AOI Future / Shugo Otsuka. All rights reserved.
            </p>
            <p className="text-white/50 text-xs font-mono leading-relaxed">
              Works created with substantial human creative contribution using AI as a tool may be eligible for copyright protection under applicable law. AOI Future claims copyright in NICTIA&apos;s musical works to the extent human authorship is present.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-white/40 text-[10px] font-mono">
                THIRD-PARTY AI SERVICES: The AI services used are operated by independent third-party providers. We have no control over their training data.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Trademark */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-cyan-400" />
            <h2 className="text-white/80 text-xs tracking-[0.2em] font-mono">
              TRADEMARK
            </h2>
          </div>
          <div className="border border-white/10 p-5">
            <p className="text-white/60 text-xs font-mono leading-relaxed mb-3">
              &quot;NICTIA&quot; is a pending trademark of AOI Future (Japan):
            </p>
            <ul className="text-white/50 text-xs font-mono space-y-1">
              <li>• Class 9: Downloadable music files, recorded music</li>
              <li>• Class 41: Providing music, music performance services</li>
            </ul>
          </div>
        </section>

        {/* Section: Music Licensing */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-cyan-400" />
            <h2 className="text-white/80 text-xs tracking-[0.2em] font-mono">
              MUSIC LICENSING
            </h2>
          </div>
          <div className="border border-white/10 p-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <h3 className="text-white/50 text-[10px] tracking-widest mb-2">STREAMING</h3>
                <p className="text-white/40">Subject to platform terms of service.</p>
              </div>
              <div>
                <h3 className="text-white/50 text-[10px] tracking-widest mb-2">DIGITAL DOWNLOADS</h3>
                <p className="text-white/40">Licensed for personal, non-commercial use only.</p>
              </div>
            </div>
            <div className="pt-3 border-t border-white/10">
              <h3 className="text-white/50 text-[10px] tracking-widest mb-2">COMMERCIAL LICENSING</h3>
              <p className="text-white/40 text-xs font-mono">
                For sync licensing (film, TV, advertising) or commercial use, contact:{" "}
                <a href="mailto:legal@aoifuture.com" className="text-cyan-400 hover:underline">
                  legal@aoifuture.com
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Section: Disclaimer */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-cyan-400" />
            <h2 className="text-white/80 text-xs tracking-[0.2em] font-mono">
              DISCLAIMER
            </h2>
          </div>
          <div className="border border-white/10 p-5">
            <p className="text-white/40 text-xs font-mono leading-relaxed">
              Music is provided &quot;as is&quot; without warranty. AOI Future is not liable for damages arising from music use. Users license at their own risk and should conduct due diligence for commercial applications.
            </p>
          </div>
        </section>

        {/* Section: Governing Law */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-cyan-400" />
            <h2 className="text-white/80 text-xs tracking-[0.2em] font-mono">
              GOVERNING LAW
            </h2>
          </div>
          <div className="border border-white/10 p-5">
            <p className="text-white/40 text-xs font-mono leading-relaxed">
              These terms are governed by Japanese law. Exclusive jurisdiction: Tokyo, Japan.
            </p>
          </div>
        </section>

        {/* Footer Links */}
        <footer className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-white/30 text-[10px] font-mono tracking-wider">
                FOR COMPLETE LEGAL TERMS
              </p>
              <a
                href="https://aoifuture.com/legal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono hover:underline"
              >
                aoifuture.com/legal
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div className="text-right">
              <p className="text-white/30 text-[10px] font-mono tracking-wider">CONTACT</p>
              <a
                href="mailto:legal@aoifuture.com"
                className="text-white/50 text-xs font-mono hover:text-cyan-400 transition-colors"
              >
                legal@aoifuture.com
              </a>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-center">
            <p className="text-white/20 text-[10px] font-mono tracking-widest">
              LAST UPDATED: 2026-01-31
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
