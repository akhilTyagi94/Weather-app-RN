const PROXY_BASE_URL = process.env.EXPO_PUBLIC_WEATHER_PROXY_URL || "";
const PROXY_CLIENT_KEY = process.env.EXPO_PUBLIC_WEATHER_PROXY_KEY || "";

export const fetchWeatherData = async (path: string): Promise<any> => {
  const response = await fetch(
    `${PROXY_BASE_URL}/owm?target=${encodeURIComponent(path)}`,
    { headers: { "X-Client-Key": PROXY_CLIENT_KEY } }
  );
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  return response.json();
};

export const weatherUrls = {
  currentWeather(lat: number, lon: number): string {
    return `data/2.5/weather?lat=${lat}&lon=${lon}&units=metric`;
  },
  forecast(lat: number, lon: number): string {
    return `data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric`;
  },
  airPollution(lat: number, lon: number): string {
    return `data/2.5/air_pollution?lat=${lat}&lon=${lon}`;
  },
  reverseGeo(lat: number, lon: number): string {
    return `geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5`;
  },
  geo(query: string): string {
    return `geo/1.0/direct?q=${query}&limit=5`;
  },
  oneCall(lat: number, lon: number): string {
    return `data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly,daily,alerts`;
  },
};
