import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
import { getDate } from "../utils/helpers";
import { getWeatherIcon } from "../utils/weatherIcons";

interface CurrentWeatherProps {
  data: {
    weather: { description: string; icon: string }[];
    dt: number;
    main: { temp: number; feels_like: number };
    timezone: number;
  };
  locationName: string;
}

export default function CurrentWeather({
  data,
  locationName,
}: CurrentWeatherProps) {
  const { weather, dt, main, timezone } = data;
  const { description, icon } = weather[0];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Now</Text>

      <View style={styles.tempRow}>
        <Text style={styles.temperature}>
          {Math.round(main.temp)}
          <Text style={styles.degree}>°</Text>
          <Text style={styles.unit}>c</Text>
        </Text>
        <Image
          source={getWeatherIcon(icon)}
          style={styles.weatherIcon}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.description}>{description}</Text>

      <View style={styles.metaDivider} />

      <View style={styles.metaItem}>
        <MaterialIcons
          name="calendar-today"
          size={20}
          color={theme.colors.onSurfaceVariant}
        />
        <Text style={styles.metaText}>{getDate(dt, timezone)}</Text>
      </View>

      <View style={styles.metaItem}>
        <MaterialIcons
          name="location-on"
          size={20}
          color={theme.colors.onSurfaceVariant}
        />
        <Text style={styles.metaText}>{locationName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.r28,
    padding: 20,
    ...theme.shadows.shadow1,
  },
  cardTitle: {
    color: theme.colors.onSurface,
    fontSize: theme.fonts.title2,
    fontWeight: theme.fontWeights.semiBold,
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  temperature: {
    color: theme.colors.white,
    fontSize: 56,
    fontWeight: theme.fontWeights.regular,
    lineHeight: 62,
  },
  degree: {
    fontSize: 40,
  },
  unit: {
    fontSize: 24,
  },
  weatherIcon: {
    width: 64,
    height: 64,
  },
  description: {
    color: theme.colors.onSurface,
    fontSize: theme.fonts.body3,
    textTransform: "capitalize",
  },
  metaDivider: {
    height: 1,
    backgroundColor: theme.colors.outline,
    marginTop: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  metaText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.fonts.title3,
  },
});
