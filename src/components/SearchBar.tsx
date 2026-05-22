import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
import { fetchWeatherData, weatherUrls } from "../api/weather";

interface GeoResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

interface SearchBarProps {
  onLocationSelect: (lat: number, lon: number) => void;
  onCurrentLocation: () => void;
}

export default function SearchBar({
  onLocationSelect,
  onCurrentLocation,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleSearch = useCallback((text: string) => {
    setQuery(text);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!text.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);

    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await fetchWeatherData(weatherUrls.geo(text));
        setResults(data);
        setShowResults(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, []);

  const handleSelect = (item: GeoResult) => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    Keyboard.dismiss();
    onLocationSelect(item.lat, item.lon);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.searchWrapper}>
          <MaterialIcons
            name="search"
            size={22}
            color={theme.colors.onSurfaceVariant2}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search city..."
            placeholderTextColor={theme.colors.onSurfaceVariant2}
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {isSearching && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.loader}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.locationBtn}
          onPress={onCurrentLocation}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="my-location"
            size={20}
            color={theme.colors.onPrimary}
          />
        </TouchableOpacity>
      </View>

      {showResults && results.length > 0 && (
        <Animated.View style={[styles.resultsList, { opacity: fadeAnim }]}>
          {results.map((item, index) => (
            <TouchableOpacity
              key={`${item.lat}-${item.lon}-${index}`}
              style={styles.resultItem}
              onPress={() => handleSelect(item)}
              activeOpacity={0.6}
            >
              <MaterialIcons
                name="location-on"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
              <View style={styles.resultTextWrapper}>
                <Text style={styles.resultTitle}>{item.name}</Text>
                <Text style={styles.resultSubtitle}>
                  {item.state ? `${item.state}, ` : ""}
                  {item.country}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.r28,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: theme.colors.onSurface,
    fontSize: theme.fonts.body3,
    fontFamily: "System",
  },
  loader: {
    marginLeft: 8,
  },
  locationBtn: {
    backgroundColor: theme.colors.primary,
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.circle,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.shadow1,
  },
  resultsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.r16,
    marginTop: 8,
    overflow: "hidden",
    ...theme.shadows.shadow2,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  resultTextWrapper: {
    flex: 1,
  },
  resultTitle: {
    color: theme.colors.onSurface,
    fontSize: theme.fonts.body3,
    fontWeight: theme.fontWeights.semiBold,
  },
  resultSubtitle: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.fonts.label2,
    marginTop: 2,
  },
});
