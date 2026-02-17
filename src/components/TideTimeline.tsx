"use client";

import { HourlyScore, TidePrediction, SunTimes, FishingMode } from "@/lib/types";
import { parseNOAATime } from "@/lib/noaa";
import { format } from "date-fns";

interface TideTimelineProps {
  hourlyScores: HourlyScore[];
  tides: TidePrediction[];
  sunTimes: SunTimes;
  mode: FishingMode;
  hourlyTides?: { t: string; v: string }[];
}

export default function TideTimeline({
  hourlyScores,
  tides,
  sunTimes,
  mode,
  hourlyTides,
}: TideTimelineProps) {
  const accentColor = mode === "tuna" ? "rgb(59, 130, 246)" : "rgb(16, 185, 129)";
  const accentColorFaded = mode === "tuna" ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)";

  // Build the tide curve from hourly tide data
  const tideCurve = hourlyTides?.map((t) => ({
    hour: new Date(t.t.replace(" ", "T")).getHours(),
    height: parseFloat(t.v),
  })) ?? [];

  const maxHeight = tideCurve.length > 0 ? Math.max(...tideCurve.map((t) => t.height)) : 1;
  const minHeight = tideCurve.length > 0 ? Math.min(...tideCurve.map((t) => t.height)) : 0;
  const heightRange = maxHeight - minHeight || 1;

  const sunriseHour = sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60;
  const sunsetHour = sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60;

  const chartWidth = 720;
  const chartHeight = 200;
  const padding = { top: 20, right: 10, bottom: 40, left: 10 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Build SVG path from tide curve
  let tidePath = "";
  let tideAreaPath = "";
  if (tideCurve.length > 1) {
    const points = tideCurve.map((t) => ({
      x: padding.left + (t.hour / 24) * innerWidth,
      y: padding.top + innerHeight - ((t.height - minHeight) / heightRange) * innerHeight,
    }));

    tidePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    tideAreaPath = `${tidePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`;
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">
        {mode === "tuna" ? "Tide & Slack Timeline" : "Tide & Current Timeline"}
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full min-w-[500px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Dawn/dusk background shading */}
          <rect
            x={padding.left}
            y={padding.top}
            width={(sunriseHour / 24) * innerWidth}
            height={innerHeight}
            fill="rgba(30, 41, 59, 0.8)"
          />
          <rect
            x={padding.left + (sunsetHour / 24) * innerWidth}
            y={padding.top}
            width={((24 - sunsetHour) / 24) * innerWidth}
            height={innerHeight}
            fill="rgba(30, 41, 59, 0.8)"
          />

          {/* Fishing score bars */}
          {hourlyScores.map((s, i) => {
            const barWidth = innerWidth / 24;
            const x = padding.left + (i / 24) * innerWidth;
            const barHeight = s.score * innerHeight;
            const y = padding.top + innerHeight - barHeight;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth - 1}
                height={barHeight}
                fill={s.score > 0.6 ? accentColor : accentColorFaded}
                opacity={s.score > 0.6 ? 0.6 : 0.3}
                rx={2}
              />
            );
          })}

          {/* Tide curve */}
          {tideAreaPath && (
            <path d={tideAreaPath} fill="rgba(148, 163, 184, 0.1)" />
          )}
          {tidePath && (
            <path
              d={tidePath}
              fill="none"
              stroke="rgba(148, 163, 184, 0.6)"
              strokeWidth={2}
            />
          )}

          {/* High/Low tide markers */}
          {tides.map((tide, i) => {
            const tideTime = parseNOAATime(tide.t);
            const hour = tideTime.getHours() + tideTime.getMinutes() / 60;
            const x = padding.left + (hour / 24) * innerWidth;
            const height = parseFloat(tide.v);
            const y =
              padding.top +
              innerHeight -
              ((height - minHeight) / heightRange) * innerHeight;
            const isHigh = tide.type === "H";
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y || padding.top + (isHigh ? 10 : innerHeight - 10)}
                  r={4}
                  fill={isHigh ? "#60a5fa" : "#f97316"}
                />
                <text
                  x={x}
                  y={(y || padding.top + (isHigh ? 10 : innerHeight - 10)) - 8}
                  textAnchor="middle"
                  fill={isHigh ? "#93c5fd" : "#fdba74"}
                  fontSize={10}
                  fontWeight="bold"
                >
                  {isHigh ? "H" : "L"} {format(tideTime, "h:mm a")}
                </text>
              </g>
            );
          })}

          {/* Sunrise/Sunset markers */}
          <line
            x1={padding.left + (sunriseHour / 24) * innerWidth}
            y1={padding.top}
            x2={padding.left + (sunriseHour / 24) * innerWidth}
            y2={padding.top + innerHeight}
            stroke="#fbbf24"
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
          <text
            x={padding.left + (sunriseHour / 24) * innerWidth}
            y={padding.top + innerHeight + 12}
            textAnchor="middle"
            fill="#fbbf24"
            fontSize={9}
          >
            ☀ {format(sunTimes.sunrise, "h:mm")}
          </text>
          <line
            x1={padding.left + (sunsetHour / 24) * innerWidth}
            y1={padding.top}
            x2={padding.left + (sunsetHour / 24) * innerWidth}
            y2={padding.top + innerHeight}
            stroke="#f97316"
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
          <text
            x={padding.left + (sunsetHour / 24) * innerWidth}
            y={padding.top + innerHeight + 12}
            textAnchor="middle"
            fill="#f97316"
            fontSize={9}
          >
            🌅 {format(sunTimes.sunset, "h:mm")}
          </text>

          {/* Hour labels */}
          {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
            <text
              key={h}
              x={padding.left + (h / 24) * innerWidth}
              y={chartHeight - 4}
              textAnchor="middle"
              fill="#6b7280"
              fontSize={10}
            >
              {h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`}
            </text>
          ))}
        </svg>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500 justify-center">
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-3 h-3 rounded"
            style={{ backgroundColor: accentColor, opacity: 0.6 }}
          />
          Best fishing
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-slate-400/60" />
          Tide height
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-1 bg-yellow-400" />
          Sun
        </span>
      </div>
    </div>
  );
}
