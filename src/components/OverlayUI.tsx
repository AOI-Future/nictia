"use client";

import { useState, useEffect, useCallback } from "react";
import QRCode from "react-qr-code";
import {
  setVolume,
  setMuted,
} from "@/utils/sound";
import RadioBanner from "./RadioBanner";
import News from "./News";

// Types for status.json
interface PressItem {
  date: string;
  title: string;
  source: string;
  url: string;
}

interface StatusData {
  transmission: {
    enabled: boolean;
    message: string;
    cta: {
      enabled: boolean;
      label: string;
      url: string;
    };
  };
  links: {
    primary: {
      url: string;
      label: string;
    };
    social: Array<{
      platform: string;
      url: string;
      label: string;
    }>;
  };
  systemStatus: {
    version: string;
    mode: string;
    uptime: string;
  };
  radio?: {
    enabled: boolean;
    label: string;
    url: string;
  };
  press?: PressItem[];
}

// ═══════════════════════════════════════════════════════════════
// Volume Control Component
// ═══════════════════════════════════════════════════════════════
function VolumeControl() {
  const [volume, setVolumeState] = useState(80);
  const [muted, setMutedState] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolumeState(newVolume);
    setVolume(newVolume);
    if (newVolume > 0 && muted) {
      setMutedState(false);
      setMuted(false);
    }
  }, [muted]);

  const handleMuteToggle = useCallback(() => {
    const newMuted = !muted;
    setMutedState(newMuted);
    setMuted(newMuted);
  }, [muted]);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* HUD Frame */}
      <div className="relative border border-white/20 bg-black/40 backdrop-blur-sm p-3 transition-all duration-300">
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/60" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/60" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/60" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/60" />

        <div className="flex items-center gap-3">
          {/* Mute Button */}
          <button
            onClick={handleMuteToggle}
            className="w-8 h-8 flex items-center justify-center border border-white/20 hover:border-cyan-400/60 hover:bg-cyan-400/10 transition-all"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* Volume Slider */}
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isExpanded ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1 bg-white/20 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:border-0"
            />
            <span className="text-[10px] text-white/50 font-mono w-8">
              {muted ? "---" : `${volume}%`}
            </span>
          </div>

          {/* Label */}
          <span className="text-[10px] text-white/40 tracking-widest">VOL</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Typewriter Text Inner Component (resets on key change)
// ═══════════════════════════════════════════════════════════════
function TypewriterTextInner({ text, speed }: { text: string; speed: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setIndex(i => i + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text.length, speed]);

  const displayedText = text.slice(0, index);

  return (
    <span>
      {displayedText}
      {index < text.length && (
        <span className="inline-block w-2 h-4 bg-cyan-400/80 ml-0.5 animate-pulse" />
      )}
    </span>
  );
}

// Wrapper that uses key to reset inner component when text changes
function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
  return <TypewriterTextInner key={text} text={text} speed={speed} />;
}

// ═══════════════════════════════════════════════════════════════
// Transmission Terminal Component
// ═══════════════════════════════════════════════════════════════
function TransmissionTerminal({ data }: { data: StatusData | null }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!data?.transmission.enabled) return null;

  return (
    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* HUD Frame */}
      <div className="relative border border-white/20 bg-black/60 backdrop-blur-sm p-4 max-w-md">
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/60" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-400/60" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400/60" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/60" />

        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <div className="w-2 h-2 bg-cyan-400 animate-pulse" />
          <span className="text-[10px] text-cyan-400/80 tracking-[0.3em]">TRANSMISSION</span>
        </div>

        {/* Message */}
        <div className="text-white/70 text-xs font-mono leading-relaxed mb-4 min-h-[40px]">
          <TypewriterText text={data.transmission.message} speed={25} />
        </div>

        {/* CTA Button */}
        {data.transmission.cta.enabled && (
          <a
            href={data.transmission.cta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-4 py-2 border border-cyan-400/40 bg-cyan-400/5 hover:bg-cyan-400/20 hover:border-cyan-400 transition-all duration-300"
          >
            <span className="text-xs text-cyan-400 tracking-wider">
              {data.transmission.cta.label}
            </span>
            <svg className="w-3 h-3 text-cyan-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}

        {/* System Status */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-4 text-[9px] text-white/30 tracking-wider">
          <span>MODE: {data.systemStatus.mode}</span>
          <span>v{data.systemStatus.version}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Optical Link (QR Code) Component
// ═══════════════════════════════════════════════════════════════
function OpticalLink({ url }: { url: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        className="flex items-center gap-2 px-3 py-2 border border-white/20 bg-black/40 backdrop-blur-sm hover:border-cyan-400/60 hover:bg-cyan-400/10 transition-all"
      >
        <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        <span className="text-[10px] text-white/50 tracking-widest">SCAN LINK</span>
      </button>

      {/* QR Code Popup */}
      <div
        className={`absolute bottom-full left-0 mb-2 transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
        onMouseLeave={() => setIsVisible(false)}
      >
        <div className="relative border border-cyan-400/40 bg-black/80 backdrop-blur-md p-4">
          {/* Hologram effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.03)_2px,rgba(0,255,255,0.03)_4px)] pointer-events-none" />

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

          {/* QR Code */}
          <div className="relative bg-white p-2">
            <QRCode
              value={url}
              size={120}
              level="M"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          {/* Label */}
          <div className="mt-2 text-center">
            <span className="text-[9px] text-cyan-400/60 tracking-widest">OPTICAL LINK ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Social Links Component
// ═══════════════════════════════════════════════════════════════
function SocialLinks({ data }: { data: StatusData | null }) {
  if (!data?.links.social || data.links.social.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Primary Link */}
      {data.links.primary && (
        <a
          href={data.links.primary.url.startsWith('http') ? data.links.primary.url : `https://${data.links.primary.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 border border-white/20 bg-black/40 backdrop-blur-sm hover:border-cyan-400/60 hover:bg-cyan-400/10 transition-all"
        >
          <span className="w-1.5 h-1.5 bg-cyan-400" />
          <span className="text-[10px] text-white/60 tracking-wider">{data.links.primary.label}</span>
        </a>
      )}

      {/* Social Links */}
      {data.links.social.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 border border-white/20 bg-black/40 backdrop-blur-sm hover:border-cyan-400/60 hover:bg-cyan-400/10 transition-all"
        >
          <span className="w-1.5 h-1.5 bg-white/40" />
          <span className="text-[10px] text-white/60 tracking-wider">{link.label}</span>
        </a>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// System Stats Component
// ═══════════════════════════════════════════════════════════════
function SystemStats({ data }: { data: StatusData | null }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().slice(11, 19));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 text-[10px] text-white/30 font-mono tracking-wider">
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
        SYS_ONLINE
      </span>
      <span>UTC {time}</span>
      {data && <span>v{data.systemStatus.version}</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Overlay UI Component
// ═══════════════════════════════════════════════════════════════
export default function OverlayUI({ isActive }: { isActive: boolean }) {
  const [statusData, setStatusData] = useState<StatusData | null>(null);

  useEffect(() => {
    fetch("/data/status.json")
      .then((res) => res.json())
      .then((data) => setStatusData(data))
      .catch((err) => console.error("Failed to load status data:", err));
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] pointer-events-none opacity-30" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      {/* Top Right - System Stats */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <SystemStats data={statusData} />
      </div>

      {/* Bottom Left - Press + Transmission Terminal */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        {/* Press Section above Transmission */}
        {statusData?.press && statusData.press.length > 0 && (
          <div className="mb-3">
            <News data={statusData.press} />
          </div>
        )}

        <TransmissionTerminal data={statusData} />

        {/* QR Code below terminal */}
        {statusData?.links.primary.url && (
          <div className="mt-3">
            <OpticalLink url={statusData.links.primary.url} />
          </div>
        )}
      </div>

      {/* Bottom Right - Social Links + Volume Control + Radio Banner + Legal */}
      <div className="absolute bottom-6 right-6 pointer-events-auto flex flex-col items-end gap-3">
        <SocialLinks data={statusData} />
        <VolumeControl />

        {/* Radio Banner */}
        {statusData?.radio?.enabled && (
          <RadioBanner
            url={statusData.radio.url}
            label={statusData.radio.label}
          />
        )}

        {/* Legal Link */}
        <a
          href="/legal"
          className="flex items-center gap-2 px-3 py-1.5 text-[9px] text-white/30 tracking-widest font-mono hover:text-white/60 transition-colors"
        >
          LEGAL
        </a>
      </div>
    </div>
  );
}
