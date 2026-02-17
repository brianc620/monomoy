import {
  TidePrediction,
  CurrentPrediction,
  SunTimes,
  HourlyScore,
  FishingWindow,
  FishingSpot,
  DayForecast,
  FishingMode,
} from "./types";
import { parseNOAATime, getTidalRange } from "./noaa";
import { getSunTimes, getMoonData, getMoonPhaseScore, getTimeOfDayScore } from "./astronomy";
import {
  getSeasonalInfo,
  OFFSHORE_SPOTS,
  INSHORE_SPOTS,
  TUNA_IDEAL_TEMP_MIN,
  TUNA_IDEAL_TEMP_MAX,
  DEFAULT_CRUISE_SPEED_KTS,
} from "./fishing-data";
import { startOfDay, addHours, addDays } from "date-fns";

// How close is the hour to the nearest slack tide? Score peaks at slack for tuna.
function getSlackTideScore(hour: Date, tides: TidePrediction[]): number {
  const h = hour.getTime();
  // Slack tide occurs ~at each high and low tide (when tide turns)
  let minDistance = Infinity;
  for (const tide of tides) {
    const tideTime = parseNOAATime(tide.t).getTime();
    const dist = Math.abs(h - tideTime);
    if (dist < minDistance) minDistance = dist;
  }
  // Score: 1.0 at slack, drops to 0 at 3 hours away
  const threeHours = 3 * 60 * 60 * 1000;
  return Math.max(0, 1 - minDistance / threeHours);
}

// Opposite of slack: peaks at max current flow (between tides) for inshore
function getCurrentFlowScore(hour: Date, tides: TidePrediction[]): number {
  return 1 - getSlackTideScore(hour, tides);
}

// Tidal range score: higher range = better (spring tides)
// Average Chatham range ~4ft, spring tides ~6ft, neaps ~2.5ft
function getTideRangeScore(range: number): number {
  return Math.min(1, Math.max(0, (range - 2) / 4)); // 2ft=0, 6ft=1
}

// Water temp score for tuna: peaks in 55-63°F range
function getWaterTempScore(temp: number | null): number {
  if (temp === null) return 0.5; // unknown = neutral
  if (temp >= TUNA_IDEAL_TEMP_MIN && temp <= TUNA_IDEAL_TEMP_MAX) return 1.0;
  if (temp < TUNA_IDEAL_TEMP_MIN) {
    return Math.max(0, 1 - (TUNA_IDEAL_TEMP_MIN - temp) / 10);
  }
  // Above ideal
  return Math.max(0, 1 - (temp - TUNA_IDEAL_TEMP_MAX) / 10);
}

function computeHourlyScores(
  date: Date,
  mode: FishingMode,
  tides: TidePrediction[],
  sunTimes: SunTimes,
  moonPhaseScore: number,
  seasonalScore: number,
  waterTemp: number | null,
  tidalRange: number
): HourlyScore[] {
  const scores: HourlyScore[] = [];
  const dayStart = startOfDay(date);

  for (let i = 0; i < 24; i++) {
    const hour = addHours(dayStart, i);
    const todScore = getTimeOfDayScore(hour, sunTimes);

    if (mode === "tuna") {
      const slackScore = getSlackTideScore(hour, tides);
      const tempScore = getWaterTempScore(waterTemp);
      const total =
        slackScore * 0.3 +
        todScore * 0.3 +
        seasonalScore * 0.2 +
        moonPhaseScore * 0.1 +
        tempScore * 0.1;

      scores.push({
        hour,
        score: total,
        slackTideScore: slackScore,
        timeOfDayScore: todScore,
        seasonalScore,
        moonPhaseScore,
        waterTempScore: tempScore,
      });
    } else {
      const flowScore = getCurrentFlowScore(hour, tides);
      const rangeScore = getTideRangeScore(tidalRange);
      const total =
        flowScore * 0.35 +
        rangeScore * 0.2 +
        todScore * 0.25 +
        moonPhaseScore * 0.1 +
        seasonalScore * 0.1;

      scores.push({
        hour,
        score: total,
        slackTideScore: 0,
        timeOfDayScore: todScore,
        seasonalScore,
        moonPhaseScore,
        waterTempScore: 0,
        currentFlowScore: flowScore,
        tideRangeScore: rangeScore,
      });
    }
  }
  return scores;
}

function findBestWindows(scores: HourlyScore[], threshold: number = 0.6): FishingWindow[] {
  const windows: FishingWindow[] = [];
  let windowStart: Date | null = null;
  let windowMaxScore = 0;
  let windowReason = "";

  for (let i = 0; i < scores.length; i++) {
    const s = scores[i];
    if (s.score >= threshold) {
      if (!windowStart) {
        windowStart = s.hour;
        windowMaxScore = s.score;
      }
      if (s.score > windowMaxScore) {
        windowMaxScore = s.score;
        // Build reason from top contributing factors
        const factors: [string, number][] = [
          ["slack tide", s.slackTideScore],
          ["time of day", s.timeOfDayScore],
          ["season", s.seasonalScore],
          ["moon phase", s.moonPhaseScore],
          ["water temp", s.waterTempScore],
          ["current flow", s.currentFlowScore ?? 0],
          ["tidal range", s.tideRangeScore ?? 0],
        ];
        factors.sort((a, b) => b[1] - a[1]);
        const topFactors = factors.slice(0, 2).map((f) => f[0]);
        windowReason = topFactors.join(" + ");
      }
    } else if (windowStart) {
      windows.push({
        start: windowStart,
        end: scores[i - 1].hour,
        score: windowMaxScore,
        reason: windowReason,
      });
      windowStart = null;
      windowMaxScore = 0;
    }
  }
  if (windowStart) {
    windows.push({
      start: windowStart,
      end: scores[scores.length - 1].hour,
      score: windowMaxScore,
      reason: windowReason,
    });
  }

  return windows.sort((a, b) => b.score - a.score).slice(0, 3);
}

function getSpotRecommendations(
  mode: FishingMode,
  month: number
): FishingSpot[] {
  const seasonal = getSeasonalInfo(month);
  if (mode === "tuna") {
    const spotNames = seasonal.tunaSpots;
    return OFFSHORE_SPOTS.filter((s) => spotNames.includes(s.name));
  }
  return INSHORE_SPOTS.filter(
    (s) => s.bestMonths === undefined || s.bestMonths === undefined
  );
}

function calculateDockTime(
  targetSpot: FishingSpot,
  sunrise: Date,
  cruiseSpeedKts: number = DEFAULT_CRUISE_SPEED_KTS
): Date | null {
  if (targetSpot.distanceNm === 0) return null;
  const runTimeHours = targetSpot.distanceNm / cruiseSpeedKts;
  const runTimeMs = runTimeHours * 60 * 60 * 1000;
  // Want to arrive 15 min before sunrise
  const arrivalTarget = new Date(sunrise.getTime() - 15 * 60 * 1000);
  return new Date(arrivalTarget.getTime() - runTimeMs);
}

function scoreToRating(score: number, seasonalScore: number): number {
  // Combine the best hourly score with seasonal context
  const combined = score * 0.7 + seasonalScore * 0.3;
  if (combined >= 0.8) return 5;
  if (combined >= 0.65) return 4;
  if (combined >= 0.5) return 3;
  if (combined >= 0.3) return 2;
  return 1;
}

export function generateForecast(
  date: Date,
  mode: FishingMode,
  tides: TidePrediction[],
  waterTemp: number | null
): DayForecast {
  const month = date.getMonth() + 1;
  const sunTimes = getSunTimes(date);
  const moonData = getMoonData(date);
  const seasonal = getSeasonalInfo(month);
  const moonScore = getMoonPhaseScore(moonData.phase);
  const seasonalScore = mode === "tuna" ? seasonal.tunaScore : seasonal.inshoreScore;
  const tidalRange = getTidalRange(tides);

  const hourlyScores = computeHourlyScores(
    date,
    mode,
    tides,
    sunTimes,
    moonScore,
    seasonalScore,
    waterTemp,
    tidalRange
  );

  const bestWindows = findBestWindows(hourlyScores, 0.5);
  const peakScore = Math.max(...hourlyScores.map((s) => s.score));
  const overallRating = scoreToRating(peakScore, seasonalScore);

  const spots = getSpotRecommendations(mode, month);

  // Dock time: for tuna, calculate based on closest recommended offshore spot
  let suggestedDockTime: Date | null = null;
  if (mode === "tuna" && spots.length > 0) {
    // Pick the closest spot
    const closest = spots.reduce((a, b) =>
      a.distanceNm < b.distanceNm ? a : b
    );
    suggestedDockTime = calculateDockTime(closest, sunTimes.sunrise);
  }

  const seasonStatus =
    mode === "tuna" ? seasonal.tunaStatus : seasonal.inshoreStatus;

  return {
    date,
    mode,
    overallRating,
    bestWindows,
    hourlyScores,
    tides,
    sunTimes,
    moonData,
    waterTemp,
    seasonStatus,
    spotRecommendations: spots,
    suggestedDockTime,
  };
}

// Generate 7-day forecasts
export function generate7DayForecast(
  startDate: Date,
  mode: FishingMode,
  allTides: TidePrediction[],
  waterTemp: number | null
): DayForecast[] {
  const forecasts: DayForecast[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(startDate, i);
    const dayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    // Filter tides for this specific day
    const dayTides = allTides.filter((t) => t.t.startsWith(dayStr));
    forecasts.push(generateForecast(date, mode, dayTides, waterTemp));
  }

  return forecasts;
}
