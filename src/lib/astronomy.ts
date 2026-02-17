import SunCalc from "suncalc";
import { SunTimes, MoonData } from "./types";
import { CHATHAM_LAT, CHATHAM_LON } from "./fishing-data";

export function getSunTimes(date: Date): SunTimes {
  const times = SunCalc.getTimes(date, CHATHAM_LAT, CHATHAM_LON);
  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    dawn: times.dawn, // civil twilight start
    dusk: times.dusk, // civil twilight end
    nauticalDawn: times.nauticalDawn,
    nauticalDusk: times.nauticalDusk,
  };
}

export function getMoonData(date: Date): MoonData {
  const illumination = SunCalc.getMoonIllumination(date);
  const moonTimes = SunCalc.getMoonTimes(date, CHATHAM_LAT, CHATHAM_LON);

  return {
    phase: illumination.phase,
    phaseName: getPhaseName(illumination.phase),
    illumination: illumination.fraction,
    moonrise: moonTimes.rise ?? null,
    moonset: moonTimes.set ?? null,
  };
}

function getPhaseName(phase: number): string {
  if (phase < 0.0625) return "New Moon";
  if (phase < 0.1875) return "Waxing Crescent";
  if (phase < 0.3125) return "First Quarter";
  if (phase < 0.4375) return "Waxing Gibbous";
  if (phase < 0.5625) return "Full Moon";
  if (phase < 0.6875) return "Waning Gibbous";
  if (phase < 0.8125) return "Last Quarter";
  if (phase < 0.9375) return "Waning Crescent";
  return "New Moon";
}

// Moon phase score: new and full moon = 1.0, quarters = 0.5
// Peaks near 0.0 (new) and 0.5 (full)
export function getMoonPhaseScore(phase: number): number {
  // Distance from nearest new (0) or full (0.5) moon
  const distFromNew = Math.min(phase, 1 - phase);
  const distFromFull = Math.abs(phase - 0.5);
  const minDist = Math.min(distFromNew, distFromFull);
  // 0 at new/full, 0.25 at quarter
  // Score: 1.0 at new/full, 0.5 at quarters
  return 1 - minDist * 2;
}

// Time of day score for fishing - peaks at dawn, secondary peak at dusk
export function getTimeOfDayScore(hour: Date, sunTimes: SunTimes): number {
  const h = hour.getTime();
  const sunrise = sunTimes.sunrise.getTime();
  const sunset = sunTimes.sunset.getTime();
  const dawn = sunTimes.dawn.getTime();

  // Peak window: 30 min before dawn through 2 hours after sunrise
  const peakStart = dawn - 30 * 60 * 1000;
  const peakEnd = sunrise + 2 * 60 * 60 * 1000;

  if (h >= peakStart && h <= peakEnd) {
    // Ramp up to peak at sunrise, then slowly decline
    if (h <= sunrise) {
      return 0.8 + 0.2 * ((h - peakStart) / (sunrise - peakStart));
    }
    return 1.0 - 0.3 * ((h - sunrise) / (peakEnd - sunrise));
  }

  // Secondary peak: 2 hours before sunset through sunset
  const duskStart = sunset - 2 * 60 * 60 * 1000;
  if (h >= duskStart && h <= sunset) {
    const progress = (h - duskStart) / (sunset - duskStart);
    return 0.5 + 0.3 * progress;
  }

  // Midday: low score
  if (h > peakEnd && h < duskStart) {
    return 0.2;
  }

  // Night: very low but not zero (night tuna bites happen)
  return 0.1;
}
