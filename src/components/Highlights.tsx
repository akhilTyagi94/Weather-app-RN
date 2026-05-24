import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getTime, aqiText } from "../utils/helpers";
import GlassCard from "./GlassCard";

interface HighlightsProps {
  currentWeather: {
    main: { feels_like: number; pressure: number; humidity: number };
    visibility: number;
    sys: { sunrise: number; sunset: number };
    timezone: number;
  };
  airPollution: {
    list: {
      main: { aqi: number };
      components: { no2: number; o3: number; so2: number; pm2_5: number };
    }[];
  } | null;
}

export default function Highlights({ currentWeather, airPollution }: HighlightsProps) {
  const { main, visibility, sys, timezone } = currentWeather;
  const pollutionData = airPollution?.list?.[0];
  const aqi = pollutionData?.main?.aqi || 1;

  return (
    <View style={styles.gridContainer}>
      
      {/* Column 1 */}
      <View style={styles.column}>
        <GlassCard style={styles.squareCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="weather-sunset-down" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.cardTitle}>SUNSET</Text>
          </View>
          <Text style={styles.cardMainValue}>{getTime(sys.sunset, timezone)}</Text>
          <Text style={styles.cardSubText}>Sunrise: {getTime(sys.sunrise, timezone)}</Text>
        </GlassCard>

        <GlassCard style={styles.squareCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="water-percent" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.cardTitle}>HUMIDITY</Text>
          </View>
          <Text style={styles.cardMainValue}>{main.humidity}%</Text>
          <Text style={styles.cardSubText}>The dew point is 12° right now.</Text>
        </GlassCard>

        <GlassCard style={styles.squareCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="eye" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.cardTitle}>VISIBILITY</Text>
          </View>
          <Text style={styles.cardMainValue}>{(visibility / 1000).toFixed(0)} km</Text>
          <Text style={styles.cardSubText}>Perfectly clear view.</Text>
        </GlassCard>
      </View>

      {/* Column 2 */}
      <View style={styles.column}>
        <GlassCard style={styles.squareCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="thermometer" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.cardTitle}>FEELS LIKE</Text>
          </View>
          <Text style={styles.cardMainValue}>{Math.round(main.feels_like)}°</Text>
          <Text style={styles.cardSubText}>Similar to the actual temperature.</Text>
        </GlassCard>

        <GlassCard style={styles.squareCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="air-filter" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.cardTitle}>AIR QUALITY</Text>
          </View>
          <Text style={styles.cardMainValue}>{aqi}</Text>
          <Text style={styles.cardSubText}>{aqiText[aqi]?.level || "Good"}</Text>
        </GlassCard>

        <GlassCard style={styles.squareCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="gauge" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.cardTitle}>PRESSURE</Text>
          </View>
          <Text style={styles.cardMainValue}>{main.pressure}</Text>
          <Text style={styles.cardSubText}>hPa</Text>
        </GlassCard>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  squareCard: {
    aspectRatio: 1, // Makes the card perfectly square
    justifyContent: 'space-between',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardMainValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '400',
  },
  cardSubText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
