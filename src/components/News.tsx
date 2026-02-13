"use client";

import { useEffect, useState } from "react";

interface PressItem {
  date: string;
  title: string;
  source: string;
  url: string;
}

interface NewsProps {
  data: PressItem[] | null;
}

export default function News({ data }: NewsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!data || data.length === 0) return null;

  return (
    <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* HUD Frame */}
      <div className="relative border border-white/15 bg-black/50 backdrop-blur-sm p-4 max-w-md">
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/50" />

        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <div className="w-1.5 h-1.5 bg-white/60" />
          <span className="text-[9px] text-white/50 tracking-[0.3em]">PRESS</span>
        </div>

        {/* Press Items */}
        <div className="space-y-3">
          {data.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block hover:bg-white/[0.03] -mx-2 px-2 py-1.5 transition-colors duration-200"
            >
              <div className="flex items-start gap-2">
                <span className="text-[9px] text-white/30 tracking-wider shrink-0 mt-0.5">
                  {item.date}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/60 leading-relaxed group-hover:text-cyan-400/80 transition-colors duration-200 line-clamp-2">
                    {item.title}
                  </p>
                  <span className="text-[9px] text-white/30 tracking-wider">
                    — {item.source}
                  </span>
                </div>
                <svg
                  className="w-3 h-3 text-white/20 group-hover:text-cyan-400/60 shrink-0 mt-0.5 transition-colors duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
