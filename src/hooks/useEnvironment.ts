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
  const { timeOfDay, weather } = state;

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
  } else {
    // Night: Deep, atmospheric, slower
    params.bpm = 110 + Math.random() * 10; // 110-120
    params.energy = "low";
    params.backgroundColor = "#000000";
    params.particleSpeed = 0.7;
    params.bloomIntensity = 0.8;
    params.reverbWet = 0.7;
  }

  // ═══ Weather adjustments ═══
  switch (weather) {
    case "clear":
      // Clear: Sharp, clean, geometric
      params.waveformType = "sine";
      params.filterFrequency = 3000;
      params.noiseIntensity = 0;
      params.glitchIntensity = 0;
      break;

    case "cloudy":
      // Cloudy: Slightly muffled, soft
      params.waveformType = "triangle";
      params.filterFrequency = 1500;
      params.noiseIntensity = 0.05;
      params.glitchIntensity = 0;
      params.bloomIntensity += 0.1;
      break;

    case "rain":
      // Rain: Noise layer, low-pass filter, visual distortion
      params.waveformType = "triangle";
      params.filterFrequency = 800;
      params.noiseLevel = 0.15;
      params.noiseIntensity = 0.12;
      params.glitchIntensity = 0.02;
      params.reverbWet = Math.min(params.reverbWet + 0.2, 0.9);
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
      break;

    case "storm":
      // Storm: Chaotic, distorted
      params.waveformType = "square";
      params.filterFrequency = 1200;
      params.noiseLevel = 0.25;
      params.noiseIntensity = 0.2;
      params.glitchIntensity = 0.15;
      params.bpm += 10;
      break;
  }

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
