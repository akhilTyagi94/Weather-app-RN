import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { weekDayNames } from "../utils/helpers";
import { getWeatherIcon } from "../utils/weatherIcons";
import GlassCard from "./GlassCard";

interface ForecastDataItem {
  dt_txt: string;
  main: { temp_max: number; temp_min: number };
  weather: { icon: string; description: string }[];
}

interface FiveDayForecastProps {
  forecastList: ForecastDataItem[];
}

interface DayAggregate {
  dateKey: string;
  tempMin: number;
  tempMax: number;
  icon: string;
}

// Group the 3-hourly forecast entries into calendar days and take the real
// min/max across each day's entries (a single 3-hour slot's temp_min/temp_max
// only covers that slot, not the whole day).
function aggregateByDay(forecastList: ForecastDataItem[]): DayAggregate[] {
  const days = new Map<string, DayAggregate>();

  for (const item of forecastList) {
    const dateKey = item.dt_txt.slice(0, 10); // "YYYY-MM-DD"
    const existing = days.get(dateKey);

    if (!existing) {
      days.set(dateKey, {
        dateKey,
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        icon: item.weather[0].icon,
      });
    } else {
      existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
      existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
    }
  }

  return Array.from(days.values());
}

export default function FiveDayForecast({ forecastList }: FiveDayForecastProps) {
  const dailyItems = aggregateByDay(forecastList).slice(0, 5);

  const globalMin = Math.min(...dailyItems.map((d) => d.tempMin));
  const globalMax = Math.max(...dailyItems.map((d) => d.tempMax));
  const globalRange = globalMax - globalMin || 1;

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="calendar-month-outline" size={16} color="rgba(255,255,255,0.6)" />
        <Text style={styles.sectionTitle}>5-DAY FORECAST</Text>
      </View>

      <View style={styles.list}>
        {dailyItems.map((day, index) => {
          const date = new Date(`${day.dateKey}T00:00:00Z`);
          const leftPct = ((day.tempMin - globalMin) / globalRange) * 100;
          const widthPct = ((day.tempMax - day.tempMin) / globalRange) * 100;

          return (
            <View
              key={day.dateKey}
              style={[
                styles.forecastItem,
                index < dailyItems.length - 1 && styles.forecastItemBorder,
              ]}
            >
              <Text style={styles.dayText}>
                {index === 0 ? "Today" : weekDayNames[date.getUTCDay()]}
              </Text>

              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name={getWeatherIcon(day.icon)}
                  size={24}
                  color="#fff"
                />
              </View>

              <View style={styles.tempWrapper}>
                <Text style={styles.tempTextMin}>
                  {Math.round(day.tempMin)}°
                </Text>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barForeground,
                      { left: `${leftPct}%`, width: `${Math.max(widthPct, 8)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.tempTextMax}>
                  {Math.round(day.tempMax)}°
                </Text>
              </View>
            </View>
          );
        })}
      </View>
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
  list: {
    gap: 12,
  },
  forecastItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  forecastItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  dayText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    width: 60,
  },
  iconWrapper: {
    alignItems: 'center',
    width: 40,
  },
  tempWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8,
  },
  tempTextMin: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 20,
    fontWeight: '500',
    width: 36,
    textAlign: 'right',
  },
  tempTextMax: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    width: 36,
    textAlign: 'right',
  },
  barBackground: {
    height: 4,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  barForeground: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#fff', // Ideally gradient, but solid white is okay
    borderRadius: 2,
  }
});
