import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
import { getHours } from "../utils/helpers";
import { getWeatherIcon } from "../utils/weatherIcons";
import GlassCard from "./GlassCard";

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
  const items = forecastList.slice(0, 12);

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="clock-outline" size={16} color="rgba(255,255,255,0.6)" />
        <Text style={styles.sectionTitle}>HOURLY FORECAST</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.slider}
        contentContainerStyle={styles.sliderContent}
      >
        {items.map((item, index) => (
          <View key={`temp-${index}`} style={styles.sliderCard}>
            <Text style={styles.time}>{index === 0 ? 'Now' : getHours(item.dt, timezone)}</Text>
            <MaterialCommunityIcons
              name={getWeatherIcon(item.weather[0].icon)}
              size={28}
              color="#fff"
              style={styles.icon}
            />
            <Text style={styles.value}>{Math.round(item.main.temp)}°</Text>
          </View>
        ))}
      </ScrollView>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  slider: {
    marginHorizontal: -4,
  },
  sliderContent: {
    paddingHorizontal: 4,
    gap: 16,
  },
  sliderCard: {
    alignItems: "center",
    minWidth: 50,
  },
  time: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  icon: {
    marginVertical: 12,
  },
  value: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
});
