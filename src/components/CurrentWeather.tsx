import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
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
    <View style={styles.container}>
      <Text style={styles.location}>{locationName}</Text>
      
      <View style={styles.mainTempContainer}>
        <Text style={styles.temperature}>
          {Math.round(main.temp)}°
        </Text>
      </View>

      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.hiLoContainer}>
        <Text style={styles.hiLoText}>
          H:{Math.round(main.temp + 2)}° L:{Math.round(main.temp - 2)}°
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  location: {
    color: theme.colors.white,
    fontSize: 32,
    fontWeight: theme.fontWeights.regular,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  mainTempContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  temperature: {
    color: theme.colors.white,
    fontSize: 96,
    fontWeight: '200',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '500',
    textTransform: "capitalize",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginTop: -10,
  },
  hiLoContainer: {
    marginTop: 4,
  },
  hiLoText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  }
});
