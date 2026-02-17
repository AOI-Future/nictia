"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveTerminal() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "> NICTIA SYSTEM v2.0 INITIALIZED",
    "> FLOW FIELD ACTIVE",
    "> AUDIO ENGINE STANDBY",
  ]);

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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed button */}
      <button
        onClick={toggleExpand}
        className="relative flex items-center gap-2 px-3 py-2 border border-white/10 bg-black/70 backdrop-blur-md hover:border-cyan-400/30 hover:bg-black/80 transition-all"
      >
        <div className="w-2 h-2 bg-red-500/60 animate-pulse" />
        <span className="text-white/40 text-[10px] tracking-wider">
          YouTube Live: OFFLINE
        </span>
        <span className="text-white/20 text-[10px]">
          {isExpanded ? "[-]" : "[+]"}
        </span>
      </button>

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
