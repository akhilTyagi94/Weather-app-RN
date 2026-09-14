export type TempBand = "extremeCold" | "cold" | "mild" | "warm" | "hot" | "extremeHot";
export type OverallLevel = "good" | "caution" | "avoid";
export type ExerciseRating = "good" | "moderate" | "poor";
type ConditionGroup = "thunderstorm" | "drizzle" | "rain" | "snow" | "atmosphere" | "clear" | "clouds";

export interface RecommendationWeatherInput {
  tempC: number;
  feelsLikeC: number;
  humidity: number; // 0-100
  windKph: number;
  conditionMain: string; // OWM weather[0].main
  conditionId: number; // OWM weather[0].id
  rain1hMm?: number; // OWM rain?.["1h"]
  uvIndex?: number; // OWM One Call current.uvi
  aqi?: number; // OWM air_pollution list[0].main.aqi (1-5)
  // Reserved, unused today -- additive-only hooks for future factors so the
  // rule table below can grow without breaking existing callers.
  pollenIndex?: number;
  hasSevereAlert?: boolean;
}

export interface RecommendationCategory {
  title: string;
  icon: string; // MaterialCommunityIcons glyph name, kept as a plain string so this module has no UI dependency
  summary: string;
  tips: string[];
}

export interface ExerciseRecommendation extends RecommendationCategory {
  rating: ExerciseRating;
  intensity: string;
  bestTime: string;
  indoorOutdoor: "indoor" | "outdoor" | "either";
}

export interface Recommendations {
  overall: { level: OverallLevel; label: string; reason: string };
  band: TempBand;
  clothing: RecommendationCategory;
  hydration: RecommendationCategory;
  nutrition: RecommendationCategory;
  precautions: RecommendationCategory;
  exercise: ExerciseRecommendation;
  disclaimer: string;
}

export const DISCLAIMER =
  "These are general wellness suggestions based on today's weather — not medical advice. If you have a health condition, please consult a healthcare professional.";

const OVERALL_LABELS: Record<OverallLevel, string> = {
  good: "Good",
  caution: "Be Cautious",
  avoid: "Avoid Heavy Outdoor Activity",
};

export function getTemperatureBand(feelsLikeC: number): TempBand {
  if (feelsLikeC < 0) return "extremeCold";
  if (feelsLikeC < 10) return "cold";
  if (feelsLikeC < 20) return "mild";
  if (feelsLikeC < 28) return "warm";
  if (feelsLikeC < 35) return "hot";
  return "extremeHot";
}

function getConditionGroup(conditionId: number): ConditionGroup {
  const group = Math.floor(conditionId / 100);
  switch (group) {
    case 2:
      return "thunderstorm";
    case 3:
      return "drizzle";
    case 5:
      return "rain";
    case 6:
      return "snow";
    case 7:
      return "atmosphere";
    case 8:
      return conditionId === 800 ? "clear" : "clouds";
    default:
      return "clear";
  }
}

// Ordered, extensible rule table -- first match wins. All "avoid" rules are
// listed before "caution" rules so severity ordering falls out of list
// order rather than needing a separate scoring step. Adding a new factor
// (pollen, a severe-alert flag, etc.) later is just appending a row here.
const OVERALL_RULES: Array<{
  level: OverallLevel;
  reason: string;
  test: (input: RecommendationWeatherInput, band: TempBand) => boolean;
}> = [
  { level: "avoid", reason: "Extreme temperature", test: (_i, band) => band === "extremeCold" || band === "extremeHot" },
  { level: "avoid", reason: "Thunderstorms in the area", test: (i) => getConditionGroup(i.conditionId) === "thunderstorm" },
  {
    level: "avoid",
    reason: "Heavy precipitation",
    test: (i) => (i.rain1hMm ?? 0) >= 8 || [502, 503, 504, 522].includes(i.conditionId),
  },
  {
    level: "avoid",
    reason: "Poor air quality combined with heat",
    test: (i, band) => (i.aqi ?? 0) >= 5 && (band === "hot" || band === "extremeHot"),
  },
  { level: "caution", reason: "Cold conditions", test: (_i, band) => band === "cold" },
  { level: "caution", reason: "Hot conditions", test: (_i, band) => band === "hot" },
  {
    level: "caution",
    reason: "High humidity adds heat stress",
    test: (i, band) => i.humidity >= 70 && (band === "warm" || band === "hot"),
  },
  { level: "caution", reason: "Strong winds", test: (i) => i.windKph >= 30 },
  { level: "caution", reason: "High UV exposure", test: (i) => (i.uvIndex ?? 0) >= 8 },
  { level: "caution", reason: "Elevated air pollution", test: (i) => (i.aqi ?? 0) >= 4 },
  {
    level: "caution",
    reason: "Rain expected",
    test: (i) => (i.rain1hMm ?? 0) > 2 || getConditionGroup(i.conditionId) === "rain",
  },
];

function getOverallLevel(
  input: RecommendationWeatherInput,
  band: TempBand
): { level: OverallLevel; label: string; reason: string } {
  for (const rule of OVERALL_RULES) {
    if (rule.test(input, band)) {
      return { level: rule.level, label: OVERALL_LABELS[rule.level], reason: rule.reason };
    }
  }
  return { level: "good", label: OVERALL_LABELS.good, reason: "Pleasant conditions" };
}

function getClothingRecommendation(input: RecommendationWeatherInput, band: TempBand): RecommendationCategory {
  const tips: string[] = [];
  let summary: string;

  if (band === "hot" || band === "extremeHot") {
    summary = "Light, loose, light-colored clothing to stay cool.";
    tips.push("Light-colored, loose-fitting clothes reflect heat better");
    tips.push("Breathable fabrics like cotton or linen");
    tips.push("A hat and sunglasses if you'll be outside");
  } else if (band === "warm") {
    summary = "Light, breathable clothing for a comfortable day.";
    tips.push("Light-colored, breathable fabrics");
    tips.push("A light layer for the evening if it cools down");
  } else if (band === "mild") {
    summary = "A light layer or two should keep you comfortable.";
    tips.push("A light jacket or sweater works well");
    tips.push("Breathable layers you can adjust through the day");
  } else if (band === "cold") {
    summary = "Layer up to stay warm.";
    tips.push("Base layer, insulating layer, and a jacket");
    tips.push("Cover extremities — gloves, warm socks, a hat");
  } else {
    summary = "Dress warmly — extreme cold conditions.";
    tips.push("Heavy insulated layers with a windproof outer shell");
    tips.push("Cover exposed skin — face, hands, and feet");
  }

  const group = getConditionGroup(input.conditionId);
  if ((input.rain1hMm ?? 0) > 0 || group === "rain" || group === "drizzle" || group === "thunderstorm") {
    tips.push("Bring a light raincoat or umbrella");
  } else if (input.windKph >= 30 && (band === "cold" || band === "extremeCold")) {
    tips.push("A windproof outer layer will help a lot today");
  }

  return { title: "Clothing", icon: "tshirt-crew-outline", summary, tips: tips.slice(0, 4) };
}

function getHydrationRecommendation(input: RecommendationWeatherInput, band: TempBand): RecommendationCategory {
  const tips: string[] = [];
  let summary: string;

  if (band === "hot" || band === "extremeHot") {
    summary = "Increase your fluid intake — the heat means you'll lose more through sweat.";
    tips.push("Aim for roughly 3–4 L of fluids, more if you're active outdoors");
    tips.push("Sip water regularly rather than waiting until you feel thirsty");
  } else if (band === "cold" || band === "extremeCold") {
    summary = "Easy to forget water in the cold — keep drinking regularly.";
    tips.push("Aim for roughly 2–2.5 L of fluids — warm drinks count too");
  } else {
    summary = "Aim for roughly 2–3 L of fluids today.";
    tips.push("Adjust upward if you're active or spending time outdoors");
  }

  if (input.humidity >= 70 || band === "hot" || band === "extremeHot") {
    tips.push("Sweating a lot? A drink with electrolytes (like an ORS or sports drink) can help");
  }
  tips.push("Individual needs vary with body weight, activity, and health — use this as a general guide");

  return { title: "Hydration", icon: "cup-water", summary, tips: tips.slice(0, 4) };
}

function getNutritionRecommendation(input: RecommendationWeatherInput, band: TempBand): RecommendationCategory {
  const tips: string[] = [];
  let summary: string;

  if (band === "hot" || band === "extremeHot") {
    summary = "Lighter, water-rich meals sit better in the heat.";
    tips.push("Water-rich fruits & veg — watermelon, cucumber, oranges");
    tips.push("Potassium-rich foods like bananas or coconut water");
    tips.push("Lighter meals — heavy food can make heat feel worse");
  } else if (band === "cold" || band === "extremeCold") {
    summary = "Warm, nourishing food helps your body handle the cold.";
    tips.push("Warm, cooked meals and soups");
    tips.push("Vitamin C-rich foods to support your immune system");
    tips.push("Warm fluids like tea or broth alongside your regular water intake");
  } else {
    summary = "A balanced diet suits today's conditions well.";
    tips.push("Seasonal fruits and vegetables for balanced nutrients");
    tips.push("Stay consistent with your regular, balanced meals");
  }

  tips.push("General guidance only, not medical or supplement advice");

  return { title: "Nutrition", icon: "food-apple-outline", summary, tips: tips.slice(0, 4) };
}

function getPrecautionsRecommendation(input: RecommendationWeatherInput, band: TempBand): RecommendationCategory {
  const tips: string[] = [];
  const group = getConditionGroup(input.conditionId);

  if ((input.uvIndex ?? 0) >= 6) {
    tips.push("Use SPF 30+ sunscreen and seek shade during midday hours");
  } else if (band === "hot" || band === "extremeHot") {
    tips.push("Use sunscreen and limit prolonged direct sun exposure");
  }

  if (band === "hot" || band === "extremeHot") {
    tips.push("Avoid strenuous outdoor activity between roughly 12–4pm");
    tips.push("Watch for dizziness, unusual fatigue, or nausea and cool down if you notice them");
  } else if (band === "cold" || band === "extremeCold") {
    tips.push("Layer up and cover exposed skin to avoid cold-related discomfort");
  }

  if (group === "rain" || group === "drizzle" || group === "thunderstorm") {
    tips.push("Carry an umbrella and watch for slippery surfaces");
  } else if (group === "snow") {
    tips.push("Surfaces may be icy — watch your footing");
  }

  if (input.windKph >= 30) {
    tips.push("Secure loose items and be cautious near trees or signage");
  }
  if ((input.aqi ?? 0) >= 4) {
    tips.push("Air quality is elevated — limit prolonged outdoor exertion");
  }

  if (tips.length === 0) {
    tips.push("No major weather precautions today — enjoy your day!");
  }

  return {
    title: "Precautions",
    icon: "shield-alert-outline",
    summary: "Keep these in mind based on today's conditions.",
    tips: tips.slice(0, 4),
  };
}

function getExerciseRecommendation(
  input: RecommendationWeatherInput,
  band: TempBand,
  overall: { level: OverallLevel }
): ExerciseRecommendation {
  const group = getConditionGroup(input.conditionId);
  const wetOutside = group === "rain" || group === "drizzle" || group === "thunderstorm" || group === "snow";

  let rating: ExerciseRating;
  let intensity: string;
  let bestTime: string;
  let indoorOutdoor: "indoor" | "outdoor" | "either";

  if (overall.level === "avoid") {
    rating = "poor";
    indoorOutdoor = "indoor";
    intensity = "Skip strenuous outdoor exercise today";
    bestTime = "Stay indoors if possible";
  } else if (overall.level === "caution") {
    rating = "moderate";
    indoorOutdoor = wetOutside ? "indoor" : "outdoor";
    intensity = "Keep it light to moderate";
    bestTime =
      band === "hot"
        ? "Early morning or evening, avoiding peak heat"
        : band === "cold"
        ? "Midday, when it's warmest"
        : "Any time, but listen to your body";
  } else {
    rating = "good";
    indoorOutdoor = "outdoor";
    intensity = "Good day for your normal routine";
    bestTime = "Any time that suits you";
  }

  const ratingLabel = rating === "good" ? "Good" : rating === "moderate" ? "Moderate" : "Poor";
  const tips = [
    intensity,
    bestTime,
    indoorOutdoor === "indoor" ? "Consider an indoor workout instead" : `Best done ${indoorOutdoor}`,
    "Hydrate before and after your workout",
  ];

  return {
    title: "Exercise",
    icon: "run",
    summary: `Outdoor conditions: ${ratingLabel}`,
    tips,
    rating,
    intensity,
    bestTime,
    indoorOutdoor,
  };
}

export function getRecommendations(input: RecommendationWeatherInput): Recommendations {
  const band = getTemperatureBand(input.feelsLikeC);
  const overall = getOverallLevel(input, band);

  return {
    overall,
    band,
    clothing: getClothingRecommendation(input, band),
    hydration: getHydrationRecommendation(input, band),
    nutrition: getNutritionRecommendation(input, band),
    precautions: getPrecautionsRecommendation(input, band),
    exercise: getExerciseRecommendation(input, band, overall),
    disclaimer: DISCLAIMER,
  };
}
