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
  SafeAreaView,
  Image,
  Linking,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../theme/theme";
import { fetchWeatherData, weatherUrls } from "../api/weather";

import SearchBar from "../components/SearchBar";
import CurrentWeather from "../components/CurrentWeather";
import Highlights from "../components/Highlights";
import HourlyForecast from "../components/HourlyForecast";
import FiveDayForecast from "../components/FiveDayForecast";

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

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchAllData = useCallback(
    async (lat: number, lon: number) => {
      try {
        setError(null);
        fadeAnim.setValue(0);

        const [weatherData, forecastData, airData, geoData] = await Promise.all(
          [
            fetchWeatherData(weatherUrls.currentWeather(lat, lon)),
            fetchWeatherData(weatherUrls.forecast(lat, lon)),
            fetchWeatherData(weatherUrls.airPollution(lat, lon)),
            fetchWeatherData(weatherUrls.reverseGeo(lat, lon)),
          ]
        );

        setCurrentWeather(weatherData);
        setForecast(forecastData);
        setAirPollution(airData);

        if (geoData && geoData.length > 0) {
          setLocationName(`${geoData[0].name}, ${geoData[0].country}`);
        }

        setCurrentLat(lat);
        setCurrentLon(lon);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } catch (err: any) {
        setError(err.message || "Failed to fetch weather data");
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fadeAnim]
  );

  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // Fall back to default location (Delhi)
        await fetchAllData(DEFAULT_LAT, DEFAULT_LON);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await fetchAllData(location.coords.latitude, location.coords.longitude);
    } catch (err) {
      // Fall back to default
      await fetchAllData(DEFAULT_LAT, DEFAULT_LON);
    }
  }, [fetchAllData]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleLocationSelect = useCallback(
    async (lat: number, lon: number) => {
      setLoading(true);
      await fetchAllData(lat, lon);
    },
    [fetchAllData]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData(currentLat, currentLon);
  }, [fetchAllData, currentLat, currentLon]);

  if (loading && !currentWeather) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
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
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
      >
        {loading && (
          <View style={styles.overlayLoading}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
          {currentWeather && (
            <CurrentWeather
              data={currentWeather}
              locationName={locationName}
            />
          )}

          {currentWeather && (
            <Highlights
              currentWeather={currentWeather}
              airPollution={airPollution}
            />
          )}

          {forecast && (
            <HourlyForecast
              forecastList={forecast.list}
              timezone={forecast.city.timezone}
            />
          )}

          {forecast && <FiveDayForecast forecastList={forecast.list} />}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Copyright {new Date().getFullYear()} Akhil_Tyagi. All Rights
              Reserved.
            </Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("https://openweathermap.org/api")
              }
              style={styles.footerLink}
            >
              <Text style={styles.footerText}>Powered By </Text>
              <Image
                source={require("../../assets/openweather.png")}
                style={styles.openWeatherLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 0,
    paddingBottom: 8,
  },
  logo: {
    width: 60,
    height: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
  },
  contentWrapper: {
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.fonts.body3,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
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
    fontSize: theme.fonts.body3,
    fontWeight: theme.fontWeights.semiBold,
  },
  overlayLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(19, 18, 20, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
    borderRadius: theme.borderRadius.r28,
    minHeight: 200,
  },
  footer: {
    alignItems: "center",
    gap: 10,
    paddingTop: 24,
    paddingBottom: 16,
  },
  footerText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.fonts.body3,
  },
  footerLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  openWeatherLogo: {
    width: 120,
    height: 24,
  },
});
