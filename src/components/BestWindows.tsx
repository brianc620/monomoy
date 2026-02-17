"use client";

import { FishingWindow, FishingMode } from "@/lib/types";
import { format } from "date-fns";

interface BestWindowsProps {
  windows: FishingWindow[];
  mode: FishingMode;
  suggestedDockTime: Date | null;
}

export default function BestWindows({
  windows,
  mode,
  suggestedDockTime,
}: BestWindowsProps) {
  const accentBorder =
    mode === "tuna" ? "border-blue-500/30" : "border-emerald-500/30";
  const accentText = mode === "tuna" ? "text-blue-400" : "text-emerald-400";

  return (
    <div className="space-y-3">
      {suggestedDockTime && mode === "tuna" && (
        <div className="bg-blue-950/50 border border-blue-500/30 rounded-xl p-4">
          <div className="text-xs text-blue-400 uppercase tracking-wide mb-1">
            Leave the dock by
          </div>
          <div className="text-2xl font-bold text-white">
            {format(suggestedDockTime, "h:mm a")}
          </div>
          <div className="text-xs text-blue-300/70 mt-1">
            To reach fishing grounds by first light
          </div>
        </div>
      )}

      <div className={`bg-gray-800/50 border ${accentBorder} rounded-xl p-4`}>
        <div className={`text-xs ${accentText} uppercase tracking-wide mb-3`}>
          Best Windows
        </div>
        {windows.length === 0 ? (
          <div className="text-gray-500">No strong windows today.</div>
        ) : (
          <div className="space-y-3">
            {windows.map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`text-lg font-bold ${i === 0 ? "text-white" : "text-gray-400"}`}
                >
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-semibold ${i === 0 ? "text-white text-lg" : "text-gray-300"}`}
                  >
                    {format(w.start, "h:mm a")} – {format(w.end, "h:mm a")}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 capitalize">
                    {w.reason}
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    w.score > 0.7
                      ? "text-emerald-400"
                      : w.score > 0.5
                        ? "text-yellow-400"
                        : "text-gray-500"
                  }`}
                >
                  {Math.round(w.score * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
