"use client";

import { useEffect, useState } from "react";

interface Release {
  title: string;
  type: string;
  year: string;
}

interface DiscographyData {
  channelUrl: string;
  spotifyUrl: string;
  releases: Release[];
}

export default function Discography() {
  const [data, setData] = useState<DiscographyData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetch("/data/status.json")
      .then((res) => res.json())
      .then((json) => setData(json.discography))
      .catch((err) => console.error("Failed to load discography:", err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!data) return null;

  return (
    <section className="min-h-screen bg-black py-20 px-6 md:px-12">
      <div className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Section Header */}
        <div className="relative mb-12">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-cyan-400/60 to-transparent" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-cyan-400" />
            <span className="text-[10px] text-cyan-400/80 tracking-[0.4em]">DISCOGRAPHY</span>
          </div>
          <h2 className="text-white/90 text-2xl tracking-[0.2em] font-light pl-5">
            RELEASES
          </h2>
          <p className="text-white/40 text-xs tracking-wider mt-2 pl-5">
            Autonomous audiovisual transmissions
          </p>
        </div>

        {/* Releases Grid */}
        <div className="space-y-4 mb-12">
          {data.releases.map((release, index) => (
            <div
              key={index}
              className="group relative border border-white/10 bg-white/[0.02] backdrop-blur-sm p-5 hover:border-cyan-400/30 hover:bg-white/[0.04] transition-all duration-300"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/40 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[9px] text-cyan-400/60 tracking-wider px-2 py-0.5 border border-cyan-400/30">
                      {release.type}
                    </span>
                    <span className="text-[10px] text-white/30 tracking-wider">{release.year}</span>
                  </div>
                  <h3 className="text-white/80 text-sm tracking-wider font-light leading-relaxed">
                    {release.title}
                  </h3>
                </div>

                {/* Index number */}
                <div className="text-white/10 text-3xl font-light tracking-tighter">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Streaming Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href={data.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-5 py-3 border border-[#1DB954]/40 bg-[#1DB954]/5 hover:bg-[#1DB954]/20 hover:border-[#1DB954] transition-all duration-300"
          >
            <svg className="w-4 h-4 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <span className="text-xs text-[#1DB954] tracking-wider">Spotify</span>
          </a>

          <a
            href={data.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-5 py-3 border border-red-500/40 bg-red-500/5 hover:bg-red-500/20 hover:border-red-500 transition-all duration-300"
          >
            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="text-xs text-red-500 tracking-wider">YouTube Music</span>
          </a>
        </div>
      </div>
    </section>
  );
}
