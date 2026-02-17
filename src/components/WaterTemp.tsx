"use client";

import { TUNA_IDEAL_TEMP_MIN, TUNA_IDEAL_TEMP_MAX } from "@/lib/fishing-data";
import { FishingMode } from "@/lib/types";

interface WaterTempProps {
  temp: number | null;
  mode: FishingMode;
}

export default function WaterTemp({ temp, mode }: WaterTempProps) {
  if (temp === null) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Water Temp
        </div>
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const isIdeal = temp >= TUNA_IDEAL_TEMP_MIN && temp <= TUNA_IDEAL_TEMP_MAX;
  const isTooWarm = temp > TUNA_IDEAL_TEMP_MAX;
  const isCold = temp < TUNA_IDEAL_TEMP_MIN;

  let status: string;
  let color: string;
  if (mode === "tuna") {
    if (isIdeal) {
      status = "Ideal range for bluefin";
      color = "text-emerald-400";
    } else if (isTooWarm) {
      status = "Above ideal — fish may have moved";
      color = "text-orange-400";
    } else {
      status = "Below ideal — fish moving in soon";
      color = "text-blue-400";
    }
  } else {
    status =
      temp > 50 ? "Good for stripers" : "Cold — slow bite expected";
    color = temp > 50 ? "text-emerald-400" : "text-blue-400";
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
        Water Temp
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{temp.toFixed(1)}</span>
        <span className="text-gray-400">°F</span>
      </div>
      <div className={`text-sm mt-1 ${color}`}>{status}</div>
      {mode === "tuna" && (
        <div className="text-xs text-gray-500 mt-1">
          Ideal: {TUNA_IDEAL_TEMP_MIN}–{TUNA_IDEAL_TEMP_MAX}°F
        </div>
      )}
      <div className="text-xs text-gray-600 mt-1">Nantucket Island station</div>
    </div>
  );
}
