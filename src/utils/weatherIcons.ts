import { MaterialCommunityIcons } from '@expo/vector-icons';

const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  "01d": "weather-sunny",
  "01n": "weather-night",
  "02d": "weather-partly-cloudy",
  "02n": "weather-night-partly-cloudy",
  "03d": "weather-cloudy",
  "03n": "weather-cloudy",
  "04d": "weather-cloudy",
  "04n": "weather-cloudy",
  "09d": "weather-pouring",
  "09n": "weather-pouring",
  "10d": "weather-partly-rainy",
  "10n": "weather-rainy",
  "11d": "weather-lightning",
  "11n": "weather-lightning",
  "13d": "weather-snowy",
  "13n": "weather-snowy",
  "50d": "weather-fog",
  "50n": "weather-fog",
};

export const getWeatherIcon = (iconCode: string) => {
  return iconMap[iconCode] || "weather-cloudy";
};

