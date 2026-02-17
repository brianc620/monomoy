import { TidePrediction, CurrentPrediction, WaterTemperature } from "./types";
import { TIDE_STATION, CURRENT_STATION } from "./fishing-data";

// NDBC Buoy 44020 - Nantucket Sound, closest active buoy with water temp
const NDBC_BUOY = "44020";
import { format } from "date-fns";

const BASE_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";

function formatDate(date: Date): string {
  return format(date, "yyyyMMdd");
}

export async function fetchTidePredictions(
  startDate: Date,
  endDate: Date,
  station: string = TIDE_STATION
): Promise<TidePrediction[]> {
  const params = new URLSearchParams({
    begin_date: formatDate(startDate),
    end_date: formatDate(endDate),
    station,
    product: "predictions",
    datum: "MLLW",
    time_zone: "lst_ldt",
    interval: "hilo",
    units: "english",
    format: "json",
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error(`NOAA tide API error: ${res.status}`);
  const data = await res.json();
  return data.predictions ?? [];
}

export async function fetchHourlyTidePredictions(
  startDate: Date,
  endDate: Date,
  station: string = TIDE_STATION
): Promise<{ t: string; v: string }[]> {
  const params = new URLSearchParams({
    begin_date: formatDate(startDate),
    end_date: formatDate(endDate),
    station,
    product: "predictions",
    datum: "MLLW",
    time_zone: "lst_ldt",
    interval: "h",
    units: "english",
    format: "json",
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error(`NOAA hourly tide API error: ${res.status}`);
  const data = await res.json();
  return data.predictions ?? [];
}

export async function fetchCurrentPredictions(
  startDate: Date,
  endDate: Date,
  station: string = CURRENT_STATION
): Promise<CurrentPrediction[]> {
  const params = new URLSearchParams({
    begin_date: formatDate(startDate),
    end_date: formatDate(endDate),
    station,
    product: "currents_predictions",
    time_zone: "lst_ldt",
    units: "english",
    format: "json",
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error(`NOAA currents API error: ${res.status}`);
  const data = await res.json();
  return data.current_predictions?.cp ?? [];
}

export async function fetchWaterTemperature(): Promise<WaterTemperature | null> {
  const url = `https://www.ndbc.noaa.gov/data/realtime2/${NDBC_BUOY}.txt`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.split("\n").filter((l) => !l.startsWith("#") && l.trim());
    if (lines.length === 0) return null;

    // Columns: YY MM DD hh mm WDIR WSPD GST WVHT DPD APD MWD PRES ATMP WTMP DEWP VIS PTDY TIDE
    // WTMP is index 14 (0-based), in Celsius
    const cols = lines[0].trim().split(/\s+/);
    const wtmpC = cols[14];
    if (!wtmpC || wtmpC === "MM") return null;

    const tempC = parseFloat(wtmpC);
    const tempF = tempC * 9 / 5 + 32;

    return {
      t: `${cols[0]}-${cols[1]}-${cols[2]} ${cols[3]}:${cols[4]}`,
      v: tempF.toFixed(1),
    };
  } catch {
    return null;
  }
}

// Parse NOAA time strings like "2026-06-01 04:23" to Date
export function parseNOAATime(timeStr: string): Date {
  return new Date(timeStr.replace(" ", "T"));
}

// Get the tidal range for a day (difference between highest high and lowest low)
export function getTidalRange(tides: TidePrediction[]): number {
  const highs = tides.filter((t) => t.type === "H").map((t) => parseFloat(t.v));
  const lows = tides.filter((t) => t.type === "L").map((t) => parseFloat(t.v));
  if (highs.length === 0 || lows.length === 0) return 0;
  return Math.max(...highs) - Math.min(...lows);
}
