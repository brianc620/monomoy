import { FishingSpot } from "./types";

// Chatham, MA coordinates
export const CHATHAM_LAT = 41.6823;
export const CHATHAM_LON = -69.9597;

// NOAA Station IDs
export const TIDE_STATION = "8447435"; // Chatham (Lydia Cove)
export const CURRENT_STATION = "ACT1646"; // Monomoy Point area
// Water temp now sourced from NDBC Buoy 44020 (Nantucket Sound) in noaa.ts

// Default boat cruising speed in knots
export const DEFAULT_CRUISE_SPEED_KTS = 25;

// Ideal tuna water temp range (°F)
export const TUNA_IDEAL_TEMP_MIN = 55;
export const TUNA_IDEAL_TEMP_MAX = 63;

export const OFFSHORE_SPOTS: FishingSpot[] = [
  {
    name: "Crab Ledge",
    lat: 41.72,
    lon: -69.6,
    distanceNm: 15,
    type: "offshore",
    notes:
      "Closest tuna spot. Expansive area off Orleans/Chatham. Holds tons of bait. Great early season.",
    bestMonths: [5, 6, 7, 8, 9],
  },
  {
    name: "BC Buoy",
    lat: 41.58,
    lon: -69.35,
    distanceNm: 25,
    type: "offshore",
    notes: "Shipping lanes area. Big area to cover.",
    bestMonths: [6, 7, 8, 9, 10],
  },
  {
    name: "Regal Sword",
    lat: 41.47,
    lon: -69.34,
    distanceNm: 35,
    type: "offshore",
    notes:
      "Multiple wrecks, varied depths (210-230ft). Holds bait all season. Strong currents. Also great for cod.",
    bestMonths: [7, 8, 9, 10, 11],
  },
  {
    name: "BB Buoy",
    lat: 41.26,
    lon: -69.29,
    distanceNm: 40,
    type: "offshore",
    notes:
      "Furthest south. Under-fished. Deep water (~200ft). Often where fish show after leaving south of MV.",
    bestMonths: [6, 7, 8, 9],
  },
  {
    name: "Nauset / Outer Beach",
    lat: 41.78,
    lon: -69.9,
    distanceNm: 8,
    type: "offshore",
    notes: "Run north up the beach from Chatham. Good for smaller boats.",
    bestMonths: [6, 7, 8, 9],
  },
  {
    name: "Shipping Lanes",
    lat: 41.55,
    lon: -69.45,
    distanceNm: 25,
    type: "offshore",
    notes: "Broad area between spots. Tuna transit through here.",
    bestMonths: [7, 8, 9, 10],
  },
];

export const INSHORE_SPOTS: FishingSpot[] = [
  {
    name: "Bearse Shoals",
    lat: 41.605,
    lon: -69.96,
    distanceNm: 2,
    type: "inshore",
    notes: "First rips south of Chatham. Good on incoming tide.",
  },
  {
    name: "Stonehorse Shoals",
    lat: 41.58,
    lon: -69.95,
    distanceNm: 4,
    type: "inshore",
    notes: "Middle shoals. Miles of rips.",
  },
  {
    name: "Handkerchief Shoal",
    lat: 41.55,
    lon: -70.0,
    distanceNm: 6,
    type: "inshore",
    notes: "Southern shoals. Steep drop-offs. Dangerous in rough weather.",
  },
  {
    name: "Monomoy Point",
    lat: 41.56,
    lon: -69.93,
    distanceNm: 5,
    type: "inshore",
    notes: "Tip of the island. Extremely strong currents. Expert area.",
  },
  {
    name: "Chatham Harbor Mouth",
    lat: 41.67,
    lon: -69.95,
    distanceNm: 1,
    type: "inshore",
    notes: "Good on outgoing tide. Strong currents.",
  },
  {
    name: "South Beach (inside)",
    lat: 41.65,
    lon: -69.95,
    distanceNm: 1.5,
    type: "inshore",
    notes: "Flats fishing. Fly fishing for stripers on incoming tide.",
  },
  {
    name: "Stage Harbor",
    lat: 41.66,
    lon: -69.97,
    distanceNm: 0.5,
    type: "inshore",
    notes: "Protected. Good for smaller boats.",
  },
];

interface SeasonalInfo {
  month: number;
  tunaScore: number;
  tunaStatus: string;
  tunaSpots: string[];
  inshoreScore: number;
  inshoreStatus: string;
  inshoreSpecies: string[];
}

export const SEASONAL_DATA: SeasonalInfo[] = [
  {
    month: 1,
    tunaScore: 0,
    tunaStatus: "Off season. No tuna until late May.",
    tunaSpots: [],
    inshoreScore: 0,
    inshoreStatus: "Off season.",
    inshoreSpecies: [],
  },
  {
    month: 2,
    tunaScore: 0,
    tunaStatus: "Off season. No tuna until late May.",
    tunaSpots: [],
    inshoreScore: 0,
    inshoreStatus: "Off season.",
    inshoreSpecies: [],
  },
  {
    month: 3,
    tunaScore: 0,
    tunaStatus: "Off season. No tuna until late May.",
    tunaSpots: [],
    inshoreScore: 0,
    inshoreStatus: "Off season.",
    inshoreSpecies: [],
  },
  {
    month: 4,
    tunaScore: 0,
    tunaStatus: "Off season. First tuna may show in 4-6 weeks.",
    tunaSpots: [],
    inshoreScore: 0.1,
    inshoreStatus: "Pre-season. A few early schoolies possible.",
    inshoreSpecies: [],
  },
  {
    month: 5,
    tunaScore: 0.3,
    tunaStatus:
      "Early season. First bluefin arriving. Fish are thin, feeding aggressively on herring/mackerel/sand eels.",
    tunaSpots: ["Crab Ledge", "BC Buoy"],
    inshoreScore: 0.5,
    inshoreStatus:
      "Stripers arriving. Schoolies first, then keepers. Sand eels and herring as bait.",
    inshoreSpecies: ["Striped bass"],
  },
  {
    month: 6,
    tunaScore: 0.7,
    tunaStatus:
      "Strong early season. Schools of bluefin east of Chatham. Great jigging/popping bite.",
    tunaSpots: ["Crab Ledge", "BC Buoy", "Nauset / Outer Beach"],
    inshoreScore: 0.8,
    inshoreStatus:
      "Peak rip fishing. Squid run. Blues arriving. Massive bait concentrations on the shoals.",
    inshoreSpecies: ["Striped bass", "Bluefish", "Sea bass"],
  },
  {
    month: 7,
    tunaScore: 0.8,
    tunaStatus:
      "Peak early season. Fish also showing south of Martha's Vineyard.",
    tunaSpots: ["Crab Ledge", "BC Buoy", "Regal Sword", "BB Buoy"],
    inshoreScore: 0.9,
    inshoreStatus:
      "Bonito and false albacore arriving. Fluke on the shoals. Best variety.",
    inshoreSpecies: [
      "Striped bass",
      "Bluefish",
      "Bonito",
      "False albacore",
      "Fluke",
      "Scup",
      "Sea bass",
    ],
  },
  {
    month: 8,
    tunaScore: 0.85,
    tunaStatus:
      "Good consistent fishing. Variety of sizes. Trolling, jigging, live bait all working.",
    tunaSpots: [
      "Crab Ledge",
      "BC Buoy",
      "Regal Sword",
      "BB Buoy",
      "Shipping Lanes",
    ],
    inshoreScore: 0.85,
    inshoreStatus: "Great variety continues. Peak bonito and albie season.",
    inshoreSpecies: [
      "Striped bass",
      "Bluefish",
      "Bonito",
      "False albacore",
      "Fluke",
      "Scup",
      "Sea bass",
    ],
  },
  {
    month: 9,
    tunaScore: 1.0,
    tunaStatus:
      "BEST MONTH. Fall run begins. Multiple size classes feeding aggressively. Giants come through. Can be incredible.",
    tunaSpots: [
      "Regal Sword",
      "Crab Ledge",
      "Shipping Lanes",
      "BC Buoy",
      "BB Buoy",
    ],
    inshoreScore: 0.9,
    inshoreStatus: "Fall run. Big stripers moving south. Blues aggressive.",
    inshoreSpecies: ["Striped bass (large)", "Bluefish"],
  },
  {
    month: 10,
    tunaScore: 0.8,
    tunaStatus:
      "Late season. Largest fish migrating through. Weather windows critical - big fish but rough seas.",
    tunaSpots: ["Regal Sword", "Shipping Lanes"],
    inshoreScore: 0.7,
    inshoreStatus: "Fall run continues. Big stripers still moving.",
    inshoreSpecies: ["Striped bass (large)", "Bluefish"],
  },
  {
    month: 11,
    tunaScore: 0.4,
    tunaStatus:
      "Very late season. Biggest fish but tough weather. Trolling natural baits, chunking.",
    tunaSpots: ["Regal Sword", "Shipping Lanes"],
    inshoreScore: 0.3,
    inshoreStatus: "Late season. Fish moving out.",
    inshoreSpecies: ["Striped bass (dwindling)"],
  },
  {
    month: 12,
    tunaScore: 0.1,
    tunaStatus: "Rare but possible. Season effectively over.",
    tunaSpots: [],
    inshoreScore: 0,
    inshoreStatus: "Off season.",
    inshoreSpecies: [],
  },
];

export function getSeasonalInfo(month: number) {
  return SEASONAL_DATA.find((s) => s.month === month) ?? SEASONAL_DATA[0];
}
