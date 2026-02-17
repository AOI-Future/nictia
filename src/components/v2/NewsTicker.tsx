"use client";

const TICKER_ITEMS = [
  "METASONICA — NEW ALBUM OUT NOW",
  "PRLN ver 1.2 + ver 2.0 = ? — LATEST SINGLE",
  "SYSTEM UPDATE v2.0 DEPLOYED",
  "WALKING INTO THE SUMMER FOREST — SINGLE",
  "SAUCE ENCYCLOPEDIA — 8 TRACKS",
  "CUANDO EL SOL Y LA LUNA CUENTAN SUS SECRETOS — 15 TRACKS",
  "NICTIA SYSTEM ONLINE",
  "AUTONOMOUS AUDIOVISUAL GENERATION ACTIVE",
];

export default function NewsTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="fixed top-[37px] left-0 right-0 z-40 overflow-hidden border-b border-cyan-400/5 bg-black/60 backdrop-blur-sm">
      <div className="flex items-center animate-marquee whitespace-nowrap py-1.5">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center mx-8">
            <span className="w-1 h-1 bg-cyan-400/40 mr-3" />
            <span className="text-[10px] text-white/30 tracking-[0.2em]">
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
