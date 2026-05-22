const API_KEY = process.env.EXPO_PUBLIC_API_KEY || "YOUR_API_KEY_HERE";

const BASE_URL = "https://api.openweathermap.org";

export const fetchWeatherData = async (url: string): Promise<any> => {
  const separator = url.includes("?") ? "&" : "?";
  const response = await fetch(`${url}${separator}appid=${API_KEY}`);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  return response.json();
};

export const weatherUrls = {
  currentWeather(lat: number, lon: number): string {
    return `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric`;
  },
  forecast(lat: number, lon: number): string {
    return `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric`;
  },
  airPollution(lat: number, lon: number): string {
    return `${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}`;
  },
  reverseGeo(lat: number, lon: number): string {
    return `${BASE_URL}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5`;
  },
  geo(query: string): string {
    return `${BASE_URL}/geo/1.0/direct?q=${query}&limit=5`;
  },
};
