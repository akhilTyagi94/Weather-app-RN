import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { theme } from "../theme/theme";
import { weekDayNames, monthNames } from "../utils/helpers";
import { getWeatherIcon } from "../utils/weatherIcons";

interface ForecastDataItem {
  dt_txt: string;
  main: { temp_max: number };
  weather: { icon: string; description: string }[];
}

interface FiveDayForecastProps {
  forecastList: ForecastDataItem[];
}

export default function FiveDayForecast({ forecastList }: FiveDayForecastProps) {
  // Extract one entry per day (every 8th item starting from index 7)
  const dailyItems: ForecastDataItem[] = [];
  for (let i = 7; i < forecastList.length; i += 8) {
    dailyItems.push(forecastList[i]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>5 Days Forecast</Text>

      <View style={styles.card}>
        {dailyItems.map((item, index) => {
          const date = new Date(item.dt_txt);
          const { icon, description } = item.weather[0];

          return (
            <View
              key={index}
              style={[
                styles.forecastItem,
                index < dailyItems.length - 1 && styles.forecastItemBorder,
              ]}
            >
              <View style={styles.iconWrapper}>
                <Image
                  source={getWeatherIcon(icon)}
                  style={styles.weatherIcon}
                  resizeMode="contain"
                />
                <Text style={styles.tempText}>
                  {Math.round(item.main.temp_max)}
                  <Text style={styles.degree}>°</Text>
                  <Text style={styles.unit}>c</Text>
                </Text>
              </View>

              <Text style={styles.dateText}>
                {date.getDate()} {monthNames[date.getUTCMonth()]}
              </Text>

              <Text style={styles.dayText}>
                {weekDayNames[date.getUTCDay()]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontSize: theme.fonts.title2,
    fontWeight: theme.fontWeights.semiBold,
    marginBottom: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.r28,
    padding: 20,
    ...theme.shadows.shadow1,
  },
  forecastItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  forecastItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  weatherIcon: {
    width: 36,
    height: 36,
  },
  tempText: {
    color: theme.colors.white,
    fontSize: theme.fonts.title2,
    fontWeight: theme.fontWeights.semiBold,
  },
  degree: {
    fontSize: 14,
  },
  unit: {
    fontSize: 12,
  },
  dateText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.fonts.label1,
    fontWeight: theme.fontWeights.semiBold,
    textAlign: "right",
    flex: 1,
  },
  dayText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.fonts.label1,
    fontWeight: theme.fontWeights.semiBold,
    textAlign: "right",
    width: 90,
  },
});
