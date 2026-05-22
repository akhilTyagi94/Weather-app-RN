import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";
import { theme } from "../theme/theme";
import { getHours, mps_to_kmh } from "../utils/helpers";
import { getWeatherIcon, getDirectionIcon } from "../utils/weatherIcons";

interface ForecastItem {
  dt: number;
  main: { temp: number };
  weather: { icon: string; description: string }[];
  wind: { deg: number; speed: number };
}

interface HourlyForecastProps {
  forecastList: ForecastItem[];
  timezone: number;
}

export default function HourlyForecast({
  forecastList,
  timezone,
}: HourlyForecastProps) {
  const items = forecastList.slice(0, 8);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Today at</Text>

      {/* Temperature Slider */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.slider}
        contentContainerStyle={styles.sliderContent}
      >
        {items.map((item, index) => (
          <View key={`temp-${index}`} style={styles.sliderCard}>
            <Text style={styles.time}>{getHours(item.dt, timezone)}</Text>
            <Image
              source={getWeatherIcon(item.weather[0].icon)}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.value}>{Math.round(item.main.temp)}°</Text>
          </View>
        ))}
      </ScrollView>

      {/* Wind Slider */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.slider}
        contentContainerStyle={styles.sliderContent}
      >
        {items.map((item, index) => (
          <View key={`wind-${index}`} style={styles.sliderCard}>
            <Text style={styles.time}>{getHours(item.dt, timezone)}</Text>
            <Image
              source={getDirectionIcon()}
              style={[
                styles.icon,
                {
                  transform: [
                    { rotate: `${item.wind.deg - 180}deg` },
                  ],
                },
              ]}
              resizeMode="contain"
            />
            <Text style={styles.value}>
              {Math.round(mps_to_kmh(item.wind.speed))} km/h
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontSize: theme.fonts.title2,
    fontWeight: theme.fontWeights.semiBold,
    marginBottom: 4,
  },
  slider: {
    marginHorizontal: -4,
  },
  sliderContent: {
    paddingHorizontal: 4,
    gap: 10,
  },
  sliderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.r16,
    padding: 14,
    alignItems: "center",
    minWidth: 100,
    ...theme.shadows.shadow1,
  },
  time: {
    color: theme.colors.onSurface,
    fontSize: theme.fonts.body3,
  },
  icon: {
    width: 44,
    height: 44,
    marginVertical: 10,
  },
  value: {
    color: theme.colors.onSurface,
    fontSize: theme.fonts.body3,
  },
});
