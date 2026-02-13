"use client";

import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type TimeOfDay = "day" | "night";
export type WeatherCondition = "clear" | "cloudy" | "rain" | "snow" | "storm";

export interface EnvironmentState {
  // Raw data
  latitude: number;
  longitude: number;
  hour: number;
  weatherCode: number;
  isDay: boolean;
  temperature: number;

  // Derived states
  timeOfDay: TimeOfDay;
  weather: WeatherCondition;

  // Loading/Error states
  isLoading: boolean;
  error: string | null;
  locationPermission: "granted" | "denied" | "prompt";
}

export interface EnvironmentParams {
  // Audio parameters
  bpm: number;
  reverbWet: number;
  filterFrequency: number;
  noiseLevel: number;
  energy: "high" | "low";

  // Visual parameters
  backgroundColor: string;
  particleSpeed: number;
  bloomIntensity: number;
  noiseIntensity: number;
  glitchIntensity: number;
  waveformType: "sine" | "triangle" | "square";

  // Lenia-inspired ecosystem parameters
  neighborRadius: number;      // 近傍半径 (0.5-2.0)
  attractionForce: number;     // 引力 (0-1)
  repulsionForce: number;      // 斥力 (0-1)
  cohesionStrength: number;    // 集合性 (0-1)
  separationStrength: number;  // 分離性 (0-1)
  activityThreshold: number;   // 活性度閾値 (0-1)
  solarIntensity: number;      // 太陽強度 (0-1) - 緯度と時刻から計算
}

// ═══════════════════════════════════════════════════════════════
// Solar calculations (緯度経度と時刻から太陽強度を計算)
// ═══════════════════════════════════════════════════════════════

function calculateSolarIntensity(latitude: number, longitude: number, date: Date = new Date()): number {
  // 日の出・日の入りを考慮した太陽強度計算
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);

  // 太陽赤緯 (Solar Declination)
  const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
  const declinationRad = declination * (Math.PI / 180);
  const latitudeRad = latitude * (Math.PI / 180);

  // 時角 (Hour Angle) - ローカル時間から計算
  const hours = date.getHours() + date.getMinutes() / 60;
  // 経度から時差を概算 (15度 = 1時間)
  const localSolarTime = hours + (longitude / 15);
  const hourAngle = (localSolarTime - 12) * 15 * (Math.PI / 180);

  // 太陽高度角 (Solar Altitude)
  const sinAltitude =
    Math.sin(latitudeRad) * Math.sin(declinationRad) +
    Math.cos(latitudeRad) * Math.cos(declinationRad) * Math.cos(hourAngle);

  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAltitude)));

  // 0-1に正規化 (地平線以下は0、真上は1)
  const intensity = Math.max(0, Math.sin(altitude));

  return intensity;
}

// 季節係数を計算 (北半球基準、南半球は反転)
function calculateSeasonFactor(latitude: number, date: Date = new Date()): number {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);

  // 北半球: 夏至(172日目)で最大、冬至(355日目)で最小
  // 南半球: 逆
  let seasonPhase = Math.cos((2 * Math.PI / 365) * (dayOfYear - 172));

  // 南半球の場合は反転
  if (latitude < 0) {
    seasonPhase = -seasonPhase;
  }

  // 0-1に正規化
  return (seasonPhase + 1) / 2;
}

// ═══════════════════════════════════════════════════════════════
// Weather code mapping (WMO codes from Open-Meteo)
// ═══════════════════════════════════════════════════════════════

function mapWeatherCode(code: number): WeatherCondition {
  // WMO Weather interpretation codes
  // https://open-meteo.com/en/docs
  if (code === 0 || code === 1) return "clear"; // Clear sky, Mainly clear
  if (code >= 2 && code <= 3) return "cloudy"; // Partly cloudy, Overcast
  if (code >= 45 && code <= 48) return "cloudy"; // Fog
  if (code >= 51 && code <= 67) return "rain"; // Drizzle, Rain
  if (code >= 71 && code <= 77) return "snow"; // Snow
  if (code >= 80 && code <= 82) return "rain"; // Rain showers
  if (code >= 85 && code <= 86) return "snow"; // Snow showers
  if (code >= 95 && code <= 99) return "storm"; // Thunderstorm
  return "clear";
}

// ═══════════════════════════════════════════════════════════════
// Parameter calculation based on environment
// ═══════════════════════════════════════════════════════════════

function calculateParams(state: EnvironmentState): EnvironmentParams {
  const { timeOfDay, weather, latitude, longitude } = state;

  // Calculate solar and seasonal factors
  const now = new Date();
  const solarIntensity = calculateSolarIntensity(latitude, longitude, now);
  const seasonFactor = calculateSeasonFactor(latitude, now);

  // Base parameters
  const params: EnvironmentParams = {
    bpm: 120,
    reverbWet: 0.5,
    filterFrequency: 2000,
    noiseLevel: 0,
    energy: "high",
    backgroundColor: "#0a0a0a",
    particleSpeed: 1,
    bloomIntensity: 0.5,
    noiseIntensity: 0,
    glitchIntensity: 0,
    waveformType: "sine",
    // Lenia ecosystem defaults
    neighborRadius: 1.0,
    attractionForce: 0.5,
    repulsionForce: 0.5,
    cohesionStrength: 0.5,
    separationStrength: 0.5,
    activityThreshold: 0.5,
    solarIntensity: solarIntensity,
  };

  // ═══ Time of Day adjustments ═══
  if (timeOfDay === "day") {
    // Day: High energy, faster, brighter
    params.bpm = 125 + Math.random() * 5; // 125-130
    params.energy = "high";
    params.backgroundColor = "#1a1a1a";
    params.particleSpeed = 1.3;
    params.bloomIntensity = 0.4;
    params.reverbWet = 0.4;

    // Lenia: Day = active, expansive, more attraction
    params.neighborRadius = 1.2 + solarIntensity * 0.6; // 1.2-1.8
    params.attractionForce = 0.4 + solarIntensity * 0.4; // 0.4-0.8
    params.repulsionForce = 0.3 + (1 - solarIntensity) * 0.2; // weaker in bright sun
    params.cohesionStrength = 0.5 + solarIntensity * 0.3;
    params.separationStrength = 0.3 + (1 - solarIntensity) * 0.3;
    params.activityThreshold = 0.3; // low threshold = more active
  } else {
    // Night: Deep, atmospheric, slower
    params.bpm = 110 + Math.random() * 10; // 110-120
    params.energy = "low";
    params.backgroundColor = "#000000";
    params.particleSpeed = 0.7;
    params.bloomIntensity = 0.8;
    params.reverbWet = 0.7;

    // Lenia: Night = clustered, defensive, more cohesion
    params.neighborRadius = 0.6 + solarIntensity * 0.4; // 0.6-1.0 (smaller)
    params.attractionForce = 0.6 + solarIntensity * 0.2; // stronger clustering
    params.repulsionForce = 0.2; // weaker repulsion
    params.cohesionStrength = 0.7; // tight groups
    params.separationStrength = 0.2; // stay close
    params.activityThreshold = 0.6; // higher threshold = less active
  }

  // ═══ Latitude-based adjustments (緯度による生態系の違い) ═══
  const absLatitude = Math.abs(latitude);

  if (absLatitude > 60) {
    // Polar regions: extreme variations, slow but dramatic
    params.neighborRadius *= 1.3; // wider influence
    params.activityThreshold *= 1.2;
    params.cohesionStrength += 0.2; // survival clustering
  } else if (absLatitude < 23.5) {
    // Tropical regions: consistently active, vibrant
    params.neighborRadius *= 0.9; // tighter interactions
    params.attractionForce *= 1.1;
    params.activityThreshold *= 0.8; // more active
    params.particleSpeed *= 1.1;
  }

  // ═══ Season adjustments ═══
  // Summer: expansive, Winter: contracted
  params.neighborRadius *= 0.8 + seasonFactor * 0.4; // 0.8-1.2
  params.attractionForce *= 0.9 + seasonFactor * 0.2;

  // ═══ Weather adjustments ═══
  switch (weather) {
    case "clear":
      // Clear: Sharp, clean, geometric
      params.waveformType = "sine";
      params.filterFrequency = 3000;
      params.noiseIntensity = 0;
      params.glitchIntensity = 0;
      // Lenia: Optimal conditions, balanced ecosystem
      // No additional adjustments needed
      break;

    case "cloudy":
      // Cloudy: Slightly muffled, soft
      params.waveformType = "triangle";
      params.filterFrequency = 1500;
      params.noiseIntensity = 0.05;
      params.glitchIntensity = 0;
      params.bloomIntensity += 0.1;
      // Lenia: Diffuse, spreading behavior
      params.neighborRadius *= 1.15;
      params.cohesionStrength *= 0.9;
      params.separationStrength *= 1.1;
      break;

    case "rain":
      // Rain: Noise layer, low-pass filter, visual distortion
      params.waveformType = "triangle";
      params.filterFrequency = 800;
      params.noiseLevel = 0.15;
      params.noiseIntensity = 0.12;
      params.glitchIntensity = 0.02;
      params.reverbWet = Math.min(params.reverbWet + 0.2, 0.9);
      // Lenia: Fluid, flowing behavior
      params.neighborRadius *= 1.3;
      params.attractionForce *= 0.7;
      params.repulsionForce *= 1.2;
      params.cohesionStrength *= 0.6;
      params.activityThreshold *= 0.9;
      break;

    case "snow":
      // Snow: Very soft, ethereal
      params.waveformType = "sine";
      params.filterFrequency = 600;
      params.noiseLevel = 0.08;
      params.noiseIntensity = 0.15;
      params.glitchIntensity = 0;
      params.particleSpeed *= 0.5;
      params.bloomIntensity += 0.2;
      // Lenia: Dormant, crystalline clustering
      params.neighborRadius *= 0.7;
      params.attractionForce *= 1.3;
      params.cohesionStrength *= 1.4;
      params.separationStrength *= 0.5;
      params.activityThreshold *= 1.3;
      break;

    case "storm":
      // Storm: Chaotic, distorted
      params.waveformType = "square";
      params.filterFrequency = 1200;
      params.noiseLevel = 0.25;
      params.noiseIntensity = 0.2;
      params.glitchIntensity = 0.15;
      params.bpm += 10;
      // Lenia: Chaotic, explosive scatter/reform
      params.neighborRadius *= 1.5;
      params.attractionForce *= 0.5;
      params.repulsionForce *= 1.8;
      params.cohesionStrength *= 0.4;
      params.separationStrength *= 1.6;
      params.activityThreshold *= 0.6;
      break;
  }

  // Clamp values to valid ranges
  params.neighborRadius = Math.max(0.3, Math.min(2.5, params.neighborRadius));
  params.attractionForce = Math.max(0, Math.min(1, params.attractionForce));
  params.repulsionForce = Math.max(0, Math.min(1, params.repulsionForce));
  params.cohesionStrength = Math.max(0, Math.min(1, params.cohesionStrength));
  params.separationStrength = Math.max(0, Math.min(1, params.separationStrength));
  params.activityThreshold = Math.max(0.1, Math.min(0.9, params.activityThreshold));

  return params;
}

// ═══════════════════════════════════════════════════════════════
// Default values (Tokyo)
// ═══════════════════════════════════════════════════════════════

const DEFAULT_LATITUDE = 35.6895;
const DEFAULT_LONGITUDE = 139.6917;

const initialState: EnvironmentState = {
  latitude: DEFAULT_LATITUDE,
  longitude: DEFAULT_LONGITUDE,
  hour: new Date().getHours(),
  weatherCode: 0,
  isDay: true,
  temperature: 20,
  timeOfDay: "day",
  weather: "clear",
  isLoading: true,
  error: null,
  locationPermission: "prompt",
};

// ═══════════════════════════════════════════════════════════════
// Custom Hook
// ═══════════════════════════════════════════════════════════════

export function useEnvironment() {
  const [state, setState] = useState<EnvironmentState>(initialState);
  const [params, setParams] = useState<EnvironmentParams>(
    calculateParams(initialState)
  );

  // Fetch weather data from Open-Meteo
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Weather API request failed");
      }

      const data = await response.json();
      const current = data.current;

      const hour = new Date().getHours();
      const isDay = current.is_day === 1;
      const weatherCode = current.weather_code;
      const temperature = current.temperature_2m;

      const timeOfDay: TimeOfDay = hour >= 6 && hour < 18 ? "day" : "night";
      const weather = mapWeatherCode(weatherCode);

      setState((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lon,
        hour,
        weatherCode,
        isDay,
        temperature,
        timeOfDay,
        weather,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to fetch weather data",
      }));
    }
  }, []);

  // Get user location
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      // Geolocation not supported, use default
      setState((prev) => ({
        ...prev,
        locationPermission: "denied",
      }));
      fetchWeather(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          locationPermission: "granted",
        }));
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
        setState((prev) => ({
          ...prev,
          locationPermission: "denied",
        }));
        // Use default location (Tokyo)
        fetchWeather(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, [fetchWeather]);

  // Initialize on mount
  useEffect(() => {
    getLocation();

    // Update time-based parameters every minute
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      const timeOfDay: TimeOfDay = hour >= 6 && hour < 18 ? "day" : "night";

      setState((prev) => {
        if (prev.hour !== hour) {
          return { ...prev, hour, timeOfDay };
        }
        return prev;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [getLocation]);

  // Update params when state changes
  useEffect(() => {
    if (!state.isLoading) {
      setParams(calculateParams(state));
    }
  }, [state]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    getLocation();
  }, [getLocation]);

  return {
    state,
    params,
    refresh,
  };
}

export default useEnvironment;
