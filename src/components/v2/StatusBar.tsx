"use client";

import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
}

function weatherCodeToText(code: number): string {
  if (code === 0 || code === 1) return "CLEAR";
  if (code >= 2 && code <= 3) return "CLOUDY";
  if (code >= 45 && code <= 48) return "FOG";
  if (code >= 51 && code <= 67) return "RAIN";
  if (code >= 71 && code <= 77) return "SNOW";
  if (code >= 80 && code <= 82) return "SHOWERS";
  if (code >= 85 && code <= 86) return "SNOW";
  if (code >= 95 && code <= 99) return "STORM";
  return "---";
}

export default function StatusBar() {
  const [time, setTime] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // JST time
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const h = String(jst.getUTCHours()).padStart(2, "0");
      const m = String(jst.getUTCMinutes()).padStart(2, "0");
      const s = String(jst.getUTCSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tokyo weather from Open-Meteo
  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current=temperature_2m,weather_code,is_day&timezone=Asia%2FTokyo"
    )
      .then((res) => res.json())
      .then((data) => {
        setWeather({
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day === 1,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-400/10 bg-black/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-2 md:px-6">
        {/* Left: System name */}
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-xs md:text-sm tracking-[0.3em] font-bold">
            NICTIA
          </span>
          <span className="text-cyan-400/60 text-[10px] tracking-wider">
            [<span className="animate-blink">SYSTEM ONLINE</span>]
          </span>
        </div>

        {/* Right: Time & Weather */}
        <div className="flex items-center gap-3 md:gap-5 text-[10px] md:text-xs tracking-wider">
          {weather && (
            <div className="flex items-center gap-2 text-white/40">
              <span className="text-cyan-400/50">TYO</span>
              <span>{Math.round(weather.temperature)}°C</span>
              <span>{weatherCodeToText(weather.weatherCode)}</span>
            </div>
          )}
          <div className="text-white/60 font-mono tabular-nums">
            <span className="text-cyan-400/40 mr-1">JST</span>
            {time}
          </div>
        </div>
      </div>
    </header>
  );
}
