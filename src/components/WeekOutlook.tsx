"use client";

import { DayForecast, FishingMode } from "@/lib/types";
import { format } from "date-fns";

interface WeekOutlookProps {
  forecasts: DayForecast[];
  mode: FishingMode;
}

const MOON_ICONS: Record<string, string> = {
  "New Moon": "🌑",
  "Waxing Crescent": "🌒",
  "First Quarter": "🌓",
  "Waxing Gibbous": "🌔",
  "Full Moon": "🌕",
  "Waning Gibbous": "🌖",
  "Last Quarter": "🌗",
  "Waning Crescent": "🌘",
};

const ratingColors = [
  "bg-red-500/20 text-red-400",
  "bg-orange-500/20 text-orange-400",
  "bg-yellow-500/20 text-yellow-400",
  "bg-green-500/20 text-green-400",
  "bg-emerald-500/20 text-emerald-400",
];

export default function WeekOutlook({ forecasts, mode }: WeekOutlookProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">
        7-Day Outlook
      </div>
      <div className="space-y-2">
        {forecasts.map((f, i) => {
          const isToday = i === 0;
          const moonIcon = MOON_ICONS[f.moonData.phaseName] ?? "🌑";
          const bestWindow = f.bestWindows[0];
          return (
            <div
              key={i}
              className={`flex items-center gap-3 py-2 ${
                isToday
                  ? "border-l-2 pl-3 " +
                    (mode === "tuna"
                      ? "border-blue-500"
                      : "border-emerald-500")
                  : "pl-4"
              } ${!isToday ? "border-t border-gray-800/50" : ""}`}
            >
              <div className="w-10 text-center">
                <div className="text-xs text-gray-500">
                  {isToday ? "Today" : format(f.date, "EEE")}
                </div>
                <div className="text-sm font-semibold text-white">
                  {format(f.date, "d")}
                </div>
              </div>
              <div
                className={`text-xs font-bold px-2 py-1 rounded ${ratingColors[f.overallRating - 1]}`}
              >
                {f.overallRating}/5
              </div>
              <div className="flex-1 min-w-0">
                {bestWindow ? (
                  <div className="text-xs text-gray-400 truncate">
                    Best: {format(bestWindow.start, "h:mm a")}–
                    {format(bestWindow.end, "h:mm a")}
                  </div>
                ) : (
                  <div className="text-xs text-gray-600">No strong windows</div>
                )}
              </div>
              <div className="text-sm" title={f.moonData.phaseName}>
                {moonIcon}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
