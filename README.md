# 🌦️ WeatherAppRN

A beautiful, feature-rich weather application built with **React Native** and **Expo**. Get real-time weather data, hourly forecasts, 5-day predictions, and air quality information — all wrapped in a sleek dark-themed interface.

> Originally built as a web application and converted to React Native for cross-platform mobile deployment on both **Android** and **iOS**.

---

## ✨ Features

- 🔍 **City Search** — Debounced search with auto-complete suggestions powered by OpenWeatherMap Geocoding API
- 📍 **Current Location** — One-tap GPS-based weather using device geolocation
- 🌡️ **Real-Time Weather** — Temperature, weather condition, icon, date, and location
- 🕐 **Hourly Forecast** — Horizontally scrollable temperature and wind cards for the next 8 intervals
- 📅 **5-Day Forecast** — Daily high temperatures with weather icons and day names
- 🌬️ **Today's Highlights** — Air Quality Index (PM₂.₅, SO₂, NO₂, O₃), Sunrise & Sunset, Humidity, Pressure, Visibility, and Feels Like
- 🔄 **Pull-to-Refresh** — Native swipe-down gesture to reload weather data
- 🎨 **Dark Theme** — Premium dark UI with smooth fade-in animations

---

## 📸 Screenshots

<!-- Add your screenshots here -->
<!-- ![Home Screen](./screenshots/home.png) -->
<!-- ![Search](./screenshots/search.png) -->

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [React Native](https://reactnative.dev/) | Cross-platform mobile framework |
| [Expo](https://expo.dev/) | Build toolchain & development platform |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) | Native GPS & geolocation |
| [expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) | Gradient backgrounds |
| [@expo/vector-icons](https://docs.expo.dev/guides/icons/) | Material Design icons |
| [OpenWeatherMap API](https://openweathermap.org/api) | Weather, forecast & air pollution data |

---

## 📁 Project Structure

```
WeatherAppRN/
├── App.tsx                          # App entry point
├── .env                             # API key (not committed)
├── assets/
│   ├── weather_icons/               # Weather condition icons (19 PNGs)
│   ├── logo.png                     # App logo
│   └── openweather.png              # OpenWeather attribution
└── src/
    ├── api/
    │   └── weather.ts               # API client & URL builders
    ├── components/
    │   ├── SearchBar.tsx             # City search with dropdown results
    │   ├── CurrentWeather.tsx        # Main weather display card
    │   ├── Highlights.tsx            # AQI, sunrise/sunset, humidity, etc.
    │   ├── HourlyForecast.tsx        # Horizontal hourly temp & wind sliders
    │   └── FiveDayForecast.tsx       # 5-day forecast list
    ├── screens/
    │   └── HomeScreen.tsx            # Main screen orchestrator
    ├── theme/
    │   └── theme.ts                  # Design tokens (colors, fonts, radii)
    └── utils/
        ├── helpers.ts                # Date/time formatters & AQI data
        └── weatherIcons.ts           # Static icon require() map
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.19+ recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/go) app on your phone (for testing)
- An [OpenWeatherMap API key](https://openweathermap.org/api) (free or paid)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/WeatherAppRN.git
   cd WeatherAppRN
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your API key**

   Open the `.env` file in the project root and replace the placeholder:
   ```env
   EXPO_PUBLIC_API_KEY=your_openweathermap_api_key_here
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS)
   - Or press `a` for Android emulator / `i` for iOS simulator

---

## 📦 Building for Production

This project uses [Expo Application Services (EAS)](https://docs.expo.dev/build/introduction/) for production builds.

```bash
# Initialize EAS (first time only)
npx eas init

# Build for Android (APK / AAB)
npx eas build --platform android

# Build for iOS (IPA)
npx eas build --platform ios

# Submit to stores
npx eas submit --platform android
npx eas submit --platform ios
```

> **Note:** iOS builds require an [Apple Developer account](https://developer.apple.com/) ($99/year). Android builds require a [Google Play Developer account](https://play.google.com/console/) ($25 one-time).

---

## 🔑 API Reference

This app uses the following [OpenWeatherMap](https://openweathermap.org/api) endpoints:

| Endpoint | Description |
|---|---|
| `/data/2.5/weather` | Current weather data |
| `/data/2.5/forecast` | 5-day / 3-hour forecast |
| `/data/2.5/air_pollution` | Air quality index & pollutants |
| `/geo/1.0/direct` | City name → coordinates (geocoding) |
| `/geo/1.0/reverse` | Coordinates → city name (reverse geocoding) |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/WeatherAppRN/issues).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- Weather data powered by [OpenWeatherMap](https://openweathermap.org/)
- Icons from [Material Design Icons](https://fonts.google.com/icons)
- Built with [Expo](https://expo.dev/)

---

<p align="center">
  Made with ❤️ by <strong>Akhil Tyagi</strong>
</p>
