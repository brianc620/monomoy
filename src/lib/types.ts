export interface TidePrediction {
  t: string; // "2026-06-01 04:23"
  v: string; // "0.123" feet
  type: "H" | "L"; // High or Low
}

export interface CurrentPrediction {
  Time: string;
  Speed_kts: number;
  Direction_deg: number;
  Type: "flood" | "ebb" | "slack";
  Bin: string;
  Depth: string;
  meanFloodDir: number;
  meanEbbDir: number;
}

export interface WaterTemperature {
  t: string;
  v: string; // degrees F
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  dawn: Date; // civil twilight start
  dusk: Date; // civil twilight end
  nauticalDawn: Date;
  nauticalDusk: Date;
}

export interface MoonData {
  phase: number; // 0-1 (0=new, 0.5=full)
  phaseName: string;
  illumination: number;
  moonrise: Date | null;
  moonset: Date | null;
}

export interface FishingSpot {
  name: string;
  lat: number;
  lon: number;
  distanceNm: number;
  type: "offshore" | "inshore";
  notes: string;
  bestMonths?: number[];
  bestConditions?: string;
}

export interface FishingWindow {
  start: Date;
  end: Date;
  score: number;
  reason: string;
}

export interface HourlyScore {
  hour: Date;
  score: number;
  slackTideScore: number;
  timeOfDayScore: number;
  seasonalScore: number;
  moonPhaseScore: number;
  waterTempScore: number;
  currentFlowScore?: number;
  tideRangeScore?: number;
}

export interface DayForecast {
  date: Date;
  mode: "tuna" | "inshore";
  overallRating: number; // 1-5
  bestWindows: FishingWindow[];
  hourlyScores: HourlyScore[];
  tides: TidePrediction[];
  sunTimes: SunTimes;
  moonData: MoonData;
  waterTemp: number | null;
  seasonStatus: string;
  spotRecommendations: FishingSpot[];
  suggestedDockTime: Date | null;
}

export type FishingMode = "tuna" | "inshore";
