// Weather icon mapping for React Native require() statements
// React Native requires static imports for local images

const weatherIcons: Record<string, any> = {
  "01d": require("../../assets/weather_icons/01d.png"),
  "01n": require("../../assets/weather_icons/01n.png"),
  "02d": require("../../assets/weather_icons/02d.png"),
  "02n": require("../../assets/weather_icons/02n.png"),
  "03d": require("../../assets/weather_icons/03d.png"),
  "03n": require("../../assets/weather_icons/03n.png"),
  "04d": require("../../assets/weather_icons/04d.png"),
  "04n": require("../../assets/weather_icons/04n.png"),
  "09d": require("../../assets/weather_icons/09d.png"),
  "09n": require("../../assets/weather_icons/09n.png"),
  "10d": require("../../assets/weather_icons/10d.png"),
  "10n": require("../../assets/weather_icons/10n.png"),
  "11d": require("../../assets/weather_icons/11d.png"),
  "11n": require("../../assets/weather_icons/11n.png"),
  "13d": require("../../assets/weather_icons/13d.png"),
  "13n": require("../../assets/weather_icons/13n.png"),
  "50d": require("../../assets/weather_icons/50d.png"),
  "50n": require("../../assets/weather_icons/50n.png"),
  direction: require("../../assets/weather_icons/direction.png"),
};

export const getWeatherIcon = (iconCode: string): any => {
  return weatherIcons[iconCode] || weatherIcons["01d"];
};

export const getDirectionIcon = (): any => {
  return weatherIcons["direction"];
};
