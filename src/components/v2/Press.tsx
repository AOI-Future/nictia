"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PressItem {
  date: string;
  title: string;
  source: string;
  url: string;
}

export default function Press() {
  const [press, setPress] = useState<PressItem[]>([]);

  useEffect(() => {
    fetch("/data/status.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.press && data.press.length > 0) {
          setPress(data.press);
        }
      })
      .catch(() => {});
  }, []);

  if (press.length === 0) return null;

  return (
    <section className="relative z-10 px-4 md:px-8 py-16">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-px bg-cyan-400/40" />
          <span className="text-cyan-400/50 text-[10px] tracking-[0.4em]">
            PRESS
          </span>
        </div>
        <h2 className="text-white/80 text-lg md:text-xl tracking-wider pl-11">
          NEWS
        </h2>
      </motion.div>

      {/* Press items */}
      <div className="space-y-3 max-w-2xl">
        {press.map((item, i) => (
          <motion.a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group block relative border border-white/5 bg-black/40 backdrop-blur-sm p-4 hover:border-cyan-400/30 hover:bg-black/60 transition-all"
          >
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/0 group-hover:border-cyan-400/40 transition-colors" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/0 group-hover:border-cyan-400/40 transition-colors" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/0 group-hover:border-cyan-400/40 transition-colors" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/0 group-hover:border-cyan-400/40 transition-colors" />

            <div className="flex items-start gap-3">
              {/* Date */}
              <span className="text-[9px] text-white/30 tracking-wider shrink-0 mt-0.5">
                {item.date}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 leading-relaxed group-hover:text-cyan-400/80 transition-colors">
                  {item.title}
                </p>
                <span className="text-[9px] text-white/30 tracking-wider">
                  — {item.source}
                </span>
              </div>

              {/* External link icon */}
              <svg
                className="w-3.5 h-3.5 text-white/15 group-hover:text-cyan-400/50 shrink-0 mt-0.5 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
