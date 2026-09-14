import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { theme } from "../theme/theme";
import { fetchWeatherData, weatherUrls } from "../api/weather";
import { mps_to_kmh, aqiColors } from "../utils/helpers";
import { getWeatherIcon } from "../utils/weatherIcons";
import { getRecommendations, Recommendations } from "../utils/recommendationEngine";
import SearchBar from "../components/SearchBar";
import GlassCard from "../components/GlassCard";
import RecommendationCard from "../components/RecommendationCard";

const DEFAULT_LAT = 28.6448;
const DEFAULT_LON = 77.2167;

interface CurrentWeatherResponse {
  name: string;
  main: { temp: number; feels_like: number; humidity: number };
  weather: { main: string; id: number; description: string; icon: string }[];
  wind?: { speed: number };
  rain?: { "1h"?: number };
}

interface AirPollutionResponse {
  list: { main: { aqi: number } }[];
}

export default function WellnessScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherResponse | null>(null);
  const [airPollution, setAirPollution] = useState<AirPollutionResponse | null>(null);
  const [uvIndex, setUvIndex] = useState<number | undefined>(undefined);
  const [locationName, setLocationName] = useState("");
  const [currentLat, setCurrentLat] = useState<number>(DEFAULT_LAT);
  const [currentLon, setCurrentLon] = useState<number>(DEFAULT_LON);

  const fetchAllData = useCallback(async (lat: number, lon: number, isRefresh = false) => {
    try {
      setError(null);
      setCurrentLat(lat);
      setCurrentLon(lon);

      const [weather, pollution] = await Promise.all([
        fetchWeatherData(weatherUrls.currentWeather(lat, lon)),
        fetchWeatherData(weatherUrls.airPollution(lat, lon)),
      ]);

      setCurrentWeather(weather);
      setAirPollution(pollution);
      setLocationName(weather.name);

      // Best-effort, non-blocking: UV needs OWM's One Call 3.0 subscription
      // enabled. If it isn't (or this fails for any reason), recommendations
      // still render fully without a UV-specific tip.
      fetchWeatherData(weatherUrls.oneCall(lat, lon))
        .then((data) => setUvIndex(data?.current?.uvi))
        .catch(() => setUvIndex(undefined));
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationDenied(true);
        fetchAllData(DEFAULT_LAT, DEFAULT_LON);
        return;
      }

      setLocationDenied(false);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      fetchAllData(location.coords.latitude, location.coords.longitude);
    } catch (err) {
      setLocationDenied(true);
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
        <TouchableOpacity style={styles.retryBtn} onPress={getCurrentLocation}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const recommendations: Recommendations | null = currentWeather
    ? getRecommendations({
        tempC: currentWeather.main.temp,
        feelsLikeC: currentWeather.main.feels_like,
        humidity: currentWeather.main.humidity,
        windKph: mps_to_kmh(currentWeather.wind?.speed ?? 0),
        conditionMain: currentWeather.weather[0]?.main ?? "Clear",
        conditionId: currentWeather.weather[0]?.id ?? 800,
        rain1hMm: currentWeather.rain?.["1h"],
        uvIndex,
        aqi: airPollution?.list?.[0]?.main?.aqi,
      })
    : null;

  const indicatorColor = !recommendations
    ? aqiColors[1]
    : recommendations.overall.level === "avoid"
    ? aqiColors[4]
    : recommendations.overall.level === "caution"
    ? aqiColors[3]
    : aqiColors[1];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>WELLNESS</Text>
        </View>

        <View style={styles.searchContainer}>
          <SearchBar onLocationSelect={handleLocationSelect} onCurrentLocation={getCurrentLocation} />
        </View>

        {locationDenied && (
          <Text style={styles.denialNotice}>
            Location access denied — showing New Delhi. Search for your city above.
          </Text>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          {loading && (
            <View style={styles.overlayLoading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}

          {currentWeather && recommendations && (
            <>
              <GlassCard style={styles.headerCard}>
                <View style={styles.headerCardTop}>
                  <MaterialCommunityIcons
                    name={getWeatherIcon(currentWeather.weather[0]?.icon ?? "01d")}
                    size={40}
                    color={theme.colors.white}
                  />
                  <View style={styles.headerCardTextBlock}>
                    <Text style={styles.locationText} numberOfLines={1}>
                      {locationName}
                    </Text>
                    <Text style={styles.conditionText} numberOfLines={1}>
                      {currentWeather.weather[0]?.description}
                    </Text>
                  </View>
                  <Text style={styles.tempText}>{Math.round(currentWeather.main.temp)}°</Text>
                </View>

                <View style={styles.headerCardCaptionRow}>
                  <Text style={styles.captionText}>Feels like {Math.round(currentWeather.main.feels_like)}°</Text>
                  <Text style={styles.captionText}>Humidity {currentWeather.main.humidity}%</Text>
                </View>

                <View style={[styles.indicatorPill, { backgroundColor: indicatorColor.bg }]}>
                  <Text style={[styles.indicatorText, { color: indicatorColor.text }]}>
                    {recommendations.overall.label}
                  </Text>
                </View>
              </GlassCard>

              <RecommendationCard
                icon={recommendations.clothing.icon}
                title={recommendations.clothing.title}
                summary={recommendations.clothing.summary}
                tips={recommendations.clothing.tips}
              />
              <RecommendationCard
                icon={recommendations.hydration.icon}
                title={recommendations.hydration.title}
                summary={recommendations.hydration.summary}
                tips={recommendations.hydration.tips}
              />
              <RecommendationCard
                icon={recommendations.nutrition.icon}
                title={recommendations.nutrition.title}
                summary={recommendations.nutrition.summary}
                tips={recommendations.nutrition.tips}
              />
              <RecommendationCard
                icon={recommendations.exercise.icon}
                title={recommendations.exercise.title}
                summary={recommendations.exercise.summary}
                tips={recommendations.exercise.tips}
              />
              <RecommendationCard
                icon={recommendations.precautions.icon}
                title={recommendations.precautions.title}
                summary={recommendations.precautions.summary}
                tips={recommendations.precautions.tips}
              />

              <Text style={styles.disclaimer}>{recommendations.disclaimer}</Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: theme.fonts.label1,
    fontWeight: theme.fontWeights.semiBold,
    letterSpacing: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    zIndex: 1,
  },
  denialNotice: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.fonts.label1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 4,
    minHeight: "100%",
  },
  overlayLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 10,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerCardTextBlock: {
    flex: 1,
  },
  locationText: {
    color: theme.colors.white,
    fontSize: theme.fonts.title3,
    fontWeight: theme.fontWeights.semiBold,
  },
  conditionText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: theme.fonts.label1,
    textTransform: "capitalize",
  },
  tempText: {
    color: theme.colors.white,
    fontSize: theme.fonts.heading,
    fontWeight: theme.fontWeights.regular,
  },
  headerCardCaptionRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  captionText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: theme.fonts.label1,
  },
  indicatorPill: {
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
  },
  indicatorText: {
    fontSize: theme.fonts.label1,
    fontWeight: theme.fontWeights.semiBold,
  },
  disclaimer: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.fonts.label2,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 16,
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
