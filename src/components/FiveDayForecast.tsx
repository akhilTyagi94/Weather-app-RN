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

export default function FiveDayForecast({ forecastList }: FiveDayForecastProps) {
  // Extract one entry per day (every 8th item starting from index 7)
  const dailyItems: ForecastDataItem[] = [];
  for (let i = 7; i < forecastList.length; i += 8) {
    dailyItems.push(forecastList[i]);
  }

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="calendar-month-outline" size={16} color="rgba(255,255,255,0.6)" />
        <Text style={styles.sectionTitle}>5-DAY FORECAST</Text>
      </View>

      <View style={styles.list}>
        {dailyItems.map((item, index) => {
          const date = new Date(item.dt_txt);
          const { icon } = item.weather[0];

          return (
            <View
              key={index}
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
                  name={getWeatherIcon(icon)}
                  size={24}
                  color="#fff"
                />
              </View>

              <View style={styles.tempWrapper}>
                <Text style={styles.tempTextMin}>
                  {Math.round(item.main.temp_max - 4)}°
                </Text>
                <View style={styles.barBackground}>
                  <View style={styles.barForeground} />
                </View>
                <Text style={styles.tempTextMax}>
                  {Math.round(item.main.temp_max)}°
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
  },
  barForeground: {
    height: '100%',
    width: '60%',
    backgroundColor: '#fff', // Ideally gradient, but solid white is okay
    borderRadius: 2,
    alignSelf: 'center',
  }
});
