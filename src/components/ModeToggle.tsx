"use client";

import { FishingMode } from "@/lib/types";

interface ModeToggleProps {
  mode: FishingMode;
  onChange: (mode: FishingMode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex rounded-lg bg-gray-800 p-1 gap-1">
      <button
        onClick={() => onChange("tuna")}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
          mode === "tuna"
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        Tuna
      </button>
      <button
        onClick={() => onChange("inshore")}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
          mode === "inshore"
            ? "bg-emerald-600 text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        Inshore
      </button>
    </div>
  );
}
