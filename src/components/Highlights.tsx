import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
import { getTime, aqiText, aqiColors } from "../utils/helpers";

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

export default function Highlights({
  currentWeather,
  airPollution,
}: HighlightsProps) {
  const { main, visibility, sys, timezone } = currentWeather;
  const pollutionData = airPollution?.list?.[0];
  const aqi = pollutionData?.main?.aqi || 1;
  const components = pollutionData?.components;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Today's Highlights</Text>

      {/* Air Quality Index */}
      <View style={styles.cardLarge}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardSmTitle}>Air Quality Index</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: aqiColors[aqi]?.bg || "#89e589" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: aqiColors[aqi]?.text || "#1f331f" },
              ]}
            >
              {aqiText[aqi]?.level || "Good"}
            </Text>
          </View>
        </View>
        <View style={styles.aqiRow}>
          <MaterialIcons name="air" size={36} color={theme.colors.onSurface} />
          <View style={styles.aqiValues}>
            {components && (
              <>
                <View style={styles.aqiItem}>
                  <Text style={styles.aqiValue}>
                    {components.pm2_5.toPrecision(3)}
                  </Text>
                  <Text style={styles.aqiLabel}>PM₂.₅</Text>
                </View>
                <View style={styles.aqiItem}>
                  <Text style={styles.aqiValue}>
                    {components.so2.toPrecision(3)}
                  </Text>
                  <Text style={styles.aqiLabel}>SO₂</Text>
                </View>
                <View style={styles.aqiItem}>
                  <Text style={styles.aqiValue}>
                    {components.no2.toPrecision(3)}
                  </Text>
                  <Text style={styles.aqiLabel}>NO₂</Text>
                </View>
                <View style={styles.aqiItem}>
                  <Text style={styles.aqiValue}>
                    {components.o3.toPrecision(3)}
                  </Text>
                  <Text style={styles.aqiLabel}>O₃</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Sunrise & Sunset */}
      <View style={styles.cardLarge}>
        <Text style={styles.cardSmTitle}>Sunrise & Sunset</Text>
        <View style={styles.sunRow}>
          <View style={styles.sunItem}>
            <MaterialIcons
              name="wb-sunny"
              size={32}
              color="#FFD700"
            />
            <View>
              <Text style={styles.sunLabel}>Sunrise</Text>
              <Text style={styles.sunTime}>
                {getTime(sys.sunrise, timezone)}
              </Text>
            </View>
          </View>
          <View style={styles.sunItem}>
            <MaterialIcons
              name="nights-stay"
              size={32}
              color="#b5a1e5"
            />
            <View>
              <Text style={styles.sunLabel}>Sunset</Text>
              <Text style={styles.sunTime}>
                {getTime(sys.sunset, timezone)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Small Highlight Cards */}
      <View style={styles.smallCardsGrid}>
        <View style={styles.smallCard}>
          <Text style={styles.cardSmTitle}>Humidity</Text>
          <View style={styles.smallCardRow}>
            <MaterialIcons
              name="water-drop"
              size={28}
              color={theme.colors.primary}
            />
            <Text style={styles.smallCardValue}>
              {main.humidity}
              <Text style={styles.smallCardUnit}> %</Text>
            </Text>
          </View>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.cardSmTitle}>Pressure</Text>
          <View style={styles.smallCardRow}>
            <MaterialIcons
              name="compress"
              size={28}
              color={theme.colors.primary}
            />
            <Text style={styles.smallCardValue}>
              {main.pressure}
              <Text style={styles.smallCardUnit}> hPa</Text>
            </Text>
          </View>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.cardSmTitle}>Visibility</Text>
          <View style={styles.smallCardRow}>
            <MaterialIcons
              name="visibility"
              size={28}
              color={theme.colors.primary}
            />
            <Text style={styles.smallCardValue}>
              {(visibility / 1000).toFixed(1)}
              <Text style={styles.smallCardUnit}> km</Text>
            </Text>
          </View>
        </View>

        <View style={styles.smallCard}>
          <Text style={styles.cardSmTitle}>Feels Like</Text>
          <View style={styles.smallCardRow}>
            <MaterialIcons
              name="thermostat"
              size={28}
              color={theme.colors.primary}
            />
            <Text style={styles.smallCardValue}>
              {Math.round(main.feels_like)}
              <Text style={styles.smallCardUnit}>°c</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontSize: theme.fonts.title2,
    fontWeight: theme.fontWeights.semiBold,
    marginBottom: 4,
  },
  cardLarge: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.r28,
    padding: 20,
    ...theme.shadows.shadow1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardSmTitle: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.fonts.title3,
    fontWeight: theme.fontWeights.semiBold,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.pill,
  },
  badgeText: {
    fontSize: theme.fonts.label1,
    fontWeight: theme.fontWeights.semiBold,
  },
  aqiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  aqiValues: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  aqiItem: {
    alignItems: "flex-end",
    minWidth: 60,
  },
  aqiValue: {
    color: theme.colors.onSurface,
    fontSize: theme.fonts.title1,
    fontWeight: theme.fontWeights.semiBold,
  },
  aqiLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.fonts.label1,
  },
  sunRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  sunItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sunLabel: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.fonts.label1,
    marginBottom: 2,
  },
  sunTime: {
    color: theme.colors.onSurface,
    fontSize: theme.fonts.title1,
    fontWeight: theme.fontWeights.semiBold,
  },
  smallCardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  smallCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.r16,
    padding: 16,
    width: "48%",
    flexGrow: 1,
    ...theme.shadows.shadow1,
  },
  smallCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  smallCardValue: {
    color: theme.colors.onSurface,
    fontSize: theme.fonts.title1,
    fontWeight: theme.fontWeights.semiBold,
  },
  smallCardUnit: {
    fontSize: theme.fonts.label1,
    color: theme.colors.onSurfaceVariant,
  },
});
