"use client";

interface RadioBannerProps {
  url: string;
  label: string;
}

export default function RadioBanner({ url, label }: RadioBannerProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 px-4 py-2.5 border border-cyan-400/30 bg-black/60 backdrop-blur-sm hover:bg-cyan-400/10 hover:border-cyan-400/60 transition-all duration-300"
    >
      {/* Animated sound wave bars */}
      <div className="flex items-center gap-0.5 h-4">
        <span className="w-0.5 h-2 bg-cyan-400 animate-soundwave-1" />
        <span className="w-0.5 h-3 bg-cyan-400 animate-soundwave-2" />
        <span className="w-0.5 h-4 bg-cyan-400 animate-soundwave-3" />
        <span className="w-0.5 h-2.5 bg-cyan-400 animate-soundwave-4" />
        <span className="w-0.5 h-3.5 bg-cyan-400 animate-soundwave-5" />
      </div>

      {/* Label */}
      <div className="flex flex-col">
        <span className="text-[9px] text-cyan-400/60 tracking-[0.2em]">NICTIA</span>
        <span className="text-[11px] text-cyan-400 tracking-wider font-medium">{label}</span>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 ml-2">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        <span className="text-[9px] text-red-400 tracking-wider">LIVE</span>
      </div>

      {/* Arrow on hover */}
      <svg
        className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 ml-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}
