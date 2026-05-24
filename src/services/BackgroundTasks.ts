import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { fetchWeatherData, weatherUrls } from '../api/weather';

const BACKGROUND_FETCH_TASK = 'weather-background-fetch';

// Define the task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const weatherData = await fetchWeatherData(weatherUrls.currentWeather(location.coords.latitude, location.coords.longitude));
    
    // Check for severe weather conditions
    if (weatherData && weatherData.weather && weatherData.weather.length > 0) {
      const conditionId = weatherData.weather[0].id;
      
      // OpenWeatherMap condition codes:
      // 2xx: Thunderstorm
      // 502, 503, 504: Heavy intensity rain
      // 602: Heavy snow
      // 781: Tornado
      const isSevere = 
        (conditionId >= 200 && conditionId < 300) || 
        [502, 503, 504, 602, 781].includes(conditionId);

      if (isSevere) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "⚠️ Severe Weather Alert",
            body: `Severe conditions detected in your area: ${weatherData.weather[0].description}. Please stay safe.`,
            data: { data: 'goes here' },
          },
          trigger: null, // trigger immediately
        });
        return BackgroundFetch.BackgroundFetchResult.NewData;
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error("Background fetch failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Helper to register the task
export async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

// Helper to unregister the task
export async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}
