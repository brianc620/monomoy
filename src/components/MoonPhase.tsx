"use client";

import { MoonData } from "@/lib/types";

interface MoonPhaseProps {
  data: MoonData;
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

export default function MoonPhase({ data }: MoonPhaseProps) {
  const icon = MOON_ICONS[data.phaseName] ?? "🌑";
  const isSpring =
    data.phaseName === "New Moon" || data.phaseName === "Full Moon";
  const tideEffect = isSpring
    ? "Spring tides — stronger currents"
    : data.phaseName.includes("Quarter")
      ? "Neap tides — weaker currents"
      : "Moderate tides";

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
        Moon Phase
      </div>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <div className="font-semibold text-white">{data.phaseName}</div>
          <div className="text-sm text-gray-400">
            {Math.round(data.illumination * 100)}% illuminated
          </div>
          <div
            className={`text-xs mt-1 ${isSpring ? "text-emerald-400" : "text-gray-500"}`}
          >
            {tideEffect}
          </div>
        </div>
      </div>
    </div>
  );
}
