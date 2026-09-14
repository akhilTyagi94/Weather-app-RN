import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { theme } from '../theme/theme';
import GlassCard from '../components/GlassCard';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [radarTileUrl, setRadarTileUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }

      // Fetch the latest RainViewer radar frame. RainViewer's v2 API keys
      // frames by an opaque `path`, not the frame's `time` -- tile requests
      // built from `time` 404/410.
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await res.json();
        if (data?.host && data?.radar?.past?.length > 0) {
          const latest = data.radar.past[data.radar.past.length - 1].path;
          setRadarTileUrl(`${data.host}${latest}/256/{z}/{x}/{y}/2/1_1.png`);
        }
      } catch (err) {
        console.error("Failed to fetch RainViewer data", err);
      }
    })();
  }, []);

  const mapRegion = location ? {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 2.0,
    longitudeDelta: 2.0,
  } : {
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 5.0,
    longitudeDelta: 5.0,
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PRECIPITATION MAP</Text>
        
        <GlassCard style={styles.mapContainer}>
          <MapView 
            style={styles.map} 
            provider={PROVIDER_DEFAULT}
            region={mapRegion}
            showsUserLocation={true}
            userInterfaceStyle="dark"
          >
            {radarTileUrl && (
              <UrlTile
                urlTemplate={radarTileUrl}
                maximumZ={12}
                flipY={false}
                zIndex={1}
                opacity={0.8}
              />
            )}
          </MapView>
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A2F3D', // Dark blue background for maps screen
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 16,
  },
  mapContainer: {
    flex: 1,
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  }
});
