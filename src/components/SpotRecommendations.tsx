"use client";

import { FishingSpot, FishingMode } from "@/lib/types";
import { DEFAULT_CRUISE_SPEED_KTS } from "@/lib/fishing-data";

interface SpotRecommendationsProps {
  spots: FishingSpot[];
  mode: FishingMode;
}

export default function SpotRecommendations({ spots, mode }: SpotRecommendationsProps) {
  if (spots.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Spot Recommendations
        </div>
        <div className="text-gray-500">No spots recommended for this time of year.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">
        {mode === "tuna" ? "Offshore Spots" : "Inshore Spots"}
      </div>
      <div className="space-y-3">
        {spots.map((spot) => {
          const runTime = spot.distanceNm / DEFAULT_CRUISE_SPEED_KTS;
          const runMin = Math.round(runTime * 60);
          return (
            <div
              key={spot.name}
              className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-3"
            >
              <div
                className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                  mode === "tuna" ? "bg-blue-500" : "bg-emerald-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm">
                  {spot.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {spot.distanceNm} nm
                  {mode === "tuna" && ` · ${runMin} min run`}
                </div>
                <div className="text-xs text-gray-500 mt-1">{spot.notes}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
