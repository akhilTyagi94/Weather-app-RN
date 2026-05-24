import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useIsFocused } from "@react-navigation/native";
import { theme } from "../theme/theme";
import { fetchWeatherData, weatherUrls } from "../api/weather";
import { useFavorites } from "../context/FavoritesContext";
import SearchBar from "../components/SearchBar";
import CurrentWeather from "../components/CurrentWeather";
import Highlights from "../components/Highlights";
import HourlyForecast from "../components/HourlyForecast";
import FiveDayForecast from "../components/FiveDayForecast";
import WeatherBackground from "../components/WeatherBackground";

const DEFAULT_LAT = 28.6448;
const DEFAULT_LON = 77.2167;

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [airPollution, setAirPollution] = useState<any>(null);
  const [locationName, setLocationName] = useState("");
  const [currentLat, setCurrentLat] = useState<number>(DEFAULT_LAT);
  const [currentLon, setCurrentLon] = useState<number>(DEFAULT_LON);

  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused && route.params?.lat && route.params?.lon) {
      if (route.params.lat !== currentLat || route.params.lon !== currentLon) {
        setLoading(true);
        fetchAllData(route.params.lat, route.params.lon);
      }
    }
  }, [isFocused, route.params]);

  const fetchAllData = useCallback(
    async (lat: number, lon: number, isRefresh = false) => {
      try {
        setError(null);
        setCurrentLat(lat);
        setCurrentLon(lon);

        const [currentWeather, forecast, airPollution] = await Promise.all([
          fetchWeatherData(weatherUrls.currentWeather(lat, lon)),
          fetchWeatherData(weatherUrls.forecast(lat, lon)),
          fetchWeatherData(weatherUrls.airPollution(lat, lon)),
        ]);

        setCurrentWeather(currentWeather);
        setForecast(forecast);
        setAirPollution(airPollution);
        setLocationName(currentWeather.name);

        if (!isRefresh) {
          fadeAnim.setValue(0);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start();
        }
      } catch (err) {
        setError("Failed to fetch weather data. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fadeAnim]
  );

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied. Showing default location.");
        fetchAllData(DEFAULT_LAT, DEFAULT_LON);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      fetchAllData(location.coords.latitude, location.coords.longitude);
    } catch (err) {
      setError("Failed to get your location. Showing default location.");
      fetchAllData(DEFAULT_LAT, DEFAULT_LON);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData(currentLat, currentLon, true);
  }, [currentLat, currentLon, fetchAllData]);

  const handleLocationSelect = (lat: number, lon: number) => {
    setLoading(true);
    fetchAllData(lat, lon);
  };

  if (error && !currentWeather) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={getCurrentLocation}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getBackgroundColors = (weatherMain: string): readonly [string, string, ...string[]] => {
    switch (weatherMain) {
      case 'Clear':
        return ['#29B2DD', '#33AADD', '#2DC8EA'];
      case 'Clouds':
        return ['#6285A5', '#7A9CBF', '#A3B9D0'];
      case 'Rain':
      case 'Drizzle':
      case 'Thunderstorm':
        return ['#2A2F3D', '#3A4256', '#526079'];
      case 'Snow':
        return ['#8398B5', '#B8C6D9', '#E4EBF4'];
      default:
        return ['#29B2DD', '#33AADD', '#2DC8EA']; // Default Blue
    }
  };

  const currentCondition = currentWeather?.weather?.[0]?.main || 'Clear';
  const bgColors = getBackgroundColors(currentCondition);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={bgColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {currentWeather && (
          <WeatherBackground condition={currentCondition} />
        )}

        <View style={styles.header}>
          <View style={{ width: 28 }} />
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          {currentWeather ? (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => {
                const id = `${currentLat},${currentLon}`;
                if (isFavorite(id)) {
                  removeFavorite(id);
                } else {
                  addFavorite({
                    id,
                    name: locationName,
                    lat: currentLat,
                    lon: currentLon,
                  });
                }
              }}
            >
              <Ionicons
                name={isFavorite(`${currentLat},${currentLon}`) ? "star" : "star-outline"}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
          ) : <View style={{ width: 28 }} />}
        </View>

        <View style={styles.searchContainer}>
          <SearchBar
            onLocationSelect={handleLocationSelect}
            onCurrentLocation={getCurrentLocation}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={["#fff"]}
            />
          }
        >
          {loading && (
            <View style={styles.overlayLoading}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

          <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
            {currentWeather && (
              <CurrentWeather
                data={currentWeather}
                locationName={locationName}
              />
            )}

            {forecast && (
              <HourlyForecast
                forecastList={forecast.list}
                timezone={forecast.city.timezone}
              />
            )}

            {forecast && (
              <FiveDayForecast forecastList={forecast.list} />
            )}

            {currentWeather && (
              <Highlights
                currentWeather={currentWeather}
                airPollution={airPollution}
              />
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    paddingBottom: 10,
  },
  logo: {
    height: 32,
    width: 120,
    tintColor: '#fff',
  },
  favoriteButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    zIndex: 1, // needed for absolute positioned dropdown
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    minHeight: "100%", // Ensures pull to refresh works even if content is small
  },
  overlayLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 10,
  },
  contentWrapper: {
    flex: 1,
    gap: 12,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  errorTitle: {
    color: theme.colors.white,
    fontSize: 56,
    fontWeight: theme.fontWeights.semiBold,
    marginBottom: 8,
  },
  errorMessage: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.fonts.body1,
    textAlign: "center",
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.pill,
  },
  retryText: {
    color: theme.colors.onPrimary,
    fontSize: theme.fonts.body2,
    fontWeight: theme.fontWeights.semiBold,
  },
});
