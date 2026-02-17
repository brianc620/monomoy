"use client";

import { useState, useEffect, useCallback } from "react";
import { FishingMode, DayForecast, TidePrediction } from "@/lib/types";
import { fetchTidePredictions, fetchHourlyTidePredictions, fetchWaterTemperature } from "@/lib/noaa";
import { generateForecast, generate7DayForecast } from "@/lib/scoring";
import { getSeasonalInfo } from "@/lib/fishing-data";
import { format, addDays } from "date-fns";
import ModeToggle from "./ModeToggle";
import FishingRating from "./FishingRating";
import TideTimeline from "./TideTimeline";
import BestWindows from "./BestWindows";
import MoonPhase from "./MoonPhase";
import WaterTemp from "./WaterTemp";
import SpotRecommendations from "./SpotRecommendations";
import WeekOutlook from "./WeekOutlook";

export default function Dashboard() {
  const [mode, setMode] = useState<FishingMode>("tuna");
  const [forecast, setForecast] = useState<DayForecast | null>(null);
  const [weekForecasts, setWeekForecasts] = useState<DayForecast[]>([]);
  const [hourlyTides, setHourlyTides] = useState<{ t: string; v: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (fishingMode: FishingMode) => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const endDate = addDays(today, 7);

      // Fetch all data in parallel
      const [tides, hourly, waterTempData] = await Promise.all([
        fetchTidePredictions(today, endDate),
        fetchHourlyTidePredictions(today, addDays(today, 1)),
        fetchWaterTemperature(),
      ]);

      const waterTemp = waterTempData ? parseFloat(waterTempData.v) : null;

      // Today's tides
      const todayStr = format(today, "yyyy-MM-dd");
      const todayTides = tides.filter((t: TidePrediction) => t.t.startsWith(todayStr));

      const todayForecast = generateForecast(today, fishingMode, todayTides, waterTemp);
      setForecast(todayForecast);
      setHourlyTides(hourly);

      // 7-day forecasts
      const week = generate7DayForecast(today, fishingMode, tides, waterTemp);
      setWeekForecasts(week);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load fishing data. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(mode);
  }, [mode, loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🎣</div>
          <div className="text-gray-400">Loading fishing data...</div>
          <div className="text-xs text-gray-600 mt-2">
            Fetching tides from NOAA
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-red-400 font-semibold mb-2">
            Unable to Load Data
          </div>
          <div className="text-gray-400 text-sm mb-4">{error}</div>
          <button
            onClick={() => loadData(mode)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!forecast) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800/50 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Monomoy</h1>
            <div className="text-xs text-gray-500">
              {format(new Date(), "EEEE, MMMM d")} · Chatham, MA
            </div>
          </div>
          <ModeToggle mode={mode} onChange={setMode} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-20">
        {/* Season Status Banner */}
        <div
          className={`rounded-xl p-4 ${
            mode === "tuna"
              ? "bg-blue-950/40 border border-blue-500/20"
              : "bg-emerald-950/40 border border-emerald-500/20"
          }`}
        >
          <div className="text-sm font-medium text-white">
            {forecast.seasonStatus}
          </div>
          {mode === "inshore" && (
            <div className="text-xs text-gray-400 mt-1">
              {getSeasonalInfo(forecast.date.getMonth() + 1).inshoreSpecies?.join(", ") || ""}
            </div>
          )}
        </div>

        {/* Rating */}
        <FishingRating
          rating={forecast.overallRating}
          label={`Today's ${mode} forecast`}
        />

        {/* Best Windows + Dock Time */}
        <BestWindows
          windows={forecast.bestWindows}
          mode={mode}
          suggestedDockTime={forecast.suggestedDockTime}
        />

        {/* Tide Timeline - THE CENTERPIECE */}
        <TideTimeline
          hourlyScores={forecast.hourlyScores}
          tides={forecast.tides}
          sunTimes={forecast.sunTimes}
          mode={mode}
          hourlyTides={hourlyTides}
        />

        {/* Water Temp + Moon Phase */}
        <div className="grid grid-cols-2 gap-3">
          <WaterTemp temp={forecast.waterTemp} mode={mode} />
          <MoonPhase data={forecast.moonData} />
        </div>

        {/* Sun Times */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            Sun Times
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Dawn</span>
              <div className="text-white font-medium">
                {format(forecast.sunTimes.dawn, "h:mm a")}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Sunrise</span>
              <div className="text-yellow-400 font-medium">
                {format(forecast.sunTimes.sunrise, "h:mm a")}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Sunset</span>
              <div className="text-orange-400 font-medium">
                {format(forecast.sunTimes.sunset, "h:mm a")}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Dusk</span>
              <div className="text-white font-medium">
                {format(forecast.sunTimes.dusk, "h:mm a")}
              </div>
            </div>
          </div>
        </div>

        {/* Spot Recommendations */}
        <SpotRecommendations spots={forecast.spotRecommendations} mode={mode} />

        {/* 7-Day Outlook */}
        <WeekOutlook forecasts={weekForecasts} mode={mode} />
      </main>
    </div>
  );
}
