"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RadioData {
  enabled: boolean;
  label: string;
  url: string;
}

export default function LiveTerminal() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [radio, setRadio] = useState<RadioData | null>(null);
  const [logs, setLogs] = useState<string[]>([
    "> NICTIA SYSTEM v2.0 INITIALIZED",
    "> FLOW FIELD ACTIVE",
    "> AUDIO ENGINE STANDBY",
  ]);

  // Fetch radio status from status.json
  useEffect(() => {
    fetch("/data/status.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.radio) {
          setRadio(data.radio);
        }
      })
      .catch(() => {});
  }, []);

  // Add system logs over time
  useEffect(() => {
    const messages = [
      "> SCANNING ENVIRONMENT...",
      "> BIO-RHYTHM SYNC COMPLETE",
      "> GENERATIVE PATTERNS LOADED",
      "> VISUAL SUBSYSTEM NOMINAL",
      "> NETWORK LATENCY: OK",
      "> UPTIME: CONTINUOUS",
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < messages.length) {
        setLogs((prev) => [...prev.slice(-8), messages[idx]]);
        idx++;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const isLive = radio?.enabled ?? false;
  const radioLabel = radio?.label ?? "RADIO";
  const radioUrl = radio?.url ?? "#";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed bar */}
      <div className="flex items-center border border-white/15 bg-black/80 backdrop-blur-md">
        {/* Live status - links to stream when live */}
        {isLive ? (
          <a
            href={radioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-3 md:px-5 md:py-3.5 hover:bg-cyan-400/5 transition-colors"
          >
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white/70 text-xs md:text-sm tracking-wider">
              {radioLabel}: LIVE
            </span>
          </a>
        ) : (
          <span className="flex items-center gap-2.5 px-4 py-3 md:px-5 md:py-3.5">
            <div className="w-2.5 h-2.5 bg-white/20 rounded-full" />
            <span className="text-white/40 text-xs md:text-sm tracking-wider">
              YouTube Live: OFFLINE
            </span>
          </span>
        )}

        {/* Terminal toggle */}
        <button
          onClick={toggleExpand}
          className="px-3 py-3 md:px-4 md:py-3.5 border-l border-white/10 text-white/30 text-xs md:text-sm hover:bg-white/5 hover:text-white/50 transition-colors"
        >
          {isExpanded ? "[-]" : "[+]"}
        </button>
      </div>

      {/* Expanded terminal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 w-72 md:w-80"
          >
            <div className="border border-cyan-400/20 bg-black/90 backdrop-blur-md">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-cyan-400/10">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400/60" />
                  <span className="text-cyan-400/50 text-[9px] tracking-[0.2em]">
                    SYSTEM TERMINAL
                  </span>
                </div>
                <span className="text-white/20 text-[9px]">
                  {new Date().toISOString().slice(0, 10)}
                </span>
              </div>

              {/* Live stream link */}
              {isLive && (
                <a
                  href={radioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-colors"
                >
                  <div className="w-2 h-2 bg-red-500 animate-pulse" />
                  <span className="text-white/70 text-[10px] tracking-wider">
                    {radioLabel}
                  </span>
                  <span className="text-cyan-400/40 text-[9px] ml-auto">
                    WATCH
                  </span>
                </a>
              )}

              {/* Logs */}
              <div className="p-3 max-h-48 overflow-y-auto space-y-1">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className="text-[10px] font-mono leading-relaxed"
                    style={{
                      color:
                        i === logs.length - 1
                          ? "rgba(0, 255, 255, 0.6)"
                          : "rgba(255, 255, 255, 0.25)",
                    }}
                  >
                    {log}
                  </div>
                ))}
                <div className="text-[10px] text-cyan-400/40 animate-blink">
                  _
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between px-3 py-1.5 border-t border-cyan-400/10 text-[8px] text-white/20 tracking-wider">
                <span>MODE: GENERATIVE</span>
                <span>UPTIME: CONTINUOUS</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
