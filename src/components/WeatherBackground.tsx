import React, { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions, Easing } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FallingParticle {
  left: number;
  size: number;
  duration: number;
  delay: number;
  progress: Animated.Value;
}

function useFallingParticles(
  count: number,
  sizeRange: [number, number],
  durationRange: [number, number]
): FallingParticle[] {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * SCREEN_WIDTH,
        size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
        duration: durationRange[0] + Math.random() * (durationRange[1] - durationRange[0]),
        delay: Math.random() * durationRange[1],
        progress: new Animated.Value(0),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count]
  );

  useEffect(() => {
    const animations = particles.map((p) =>
      Animated.loop(
        Animated.timing(p.progress, {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [particles]);

  return particles;
}

function Rain({ intense = false }: { intense?: boolean }) {
  const particles = useFallingParticles(intense ? 40 : 24, [1, 2], [550, 950]);

  return (
    <>
      {particles.map((p, i) => {
        const translateY = p.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-40, SCREEN_HEIGHT + 40],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.raindrop,
              {
                left: p.left,
                width: p.size,
                height: p.size * 14,
                transform: [{ translateY }],
              },
            ]}
          />
        );
      })}
    </>
  );
}

function Snow() {
  const particles = useFallingParticles(28, [3, 6], [4000, 7500]);

  return (
    <>
      {particles.map((p, i) => {
        const translateY = p.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, SCREEN_HEIGHT + 20],
        });
        const translateX = p.progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 15, 0],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.snowflake,
              {
                left: p.left,
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                transform: [{ translateY }, { translateX }],
              },
            ]}
          />
        );
      })}
    </>
  );
}

function Clouds() {
  const clouds = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        top: 40 + i * 70 + Math.random() * 30,
        size: 80 + Math.random() * 60,
        duration: 18000 + Math.random() * 10000,
        progress: new Animated.Value(0),
      })),
    []
  );

  useEffect(() => {
    const animations = clouds.map((c) =>
      Animated.loop(
        Animated.timing(c.progress, {
          toValue: 1,
          duration: c.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [clouds]);

  return (
    <>
      {clouds.map((c, i) => {
        const translateX = c.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-c.size, SCREEN_WIDTH + c.size],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.cloud,
              {
                top: c.top,
                width: c.size,
                height: c.size * 0.5,
                borderRadius: c.size * 0.25,
                transform: [{ translateX }],
              },
            ]}
          />
        );
      })}
    </>
  );
}

function ThunderFlash() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const flash = () => {
      if (cancelled) return;
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 60, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 60, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => {
        if (!cancelled) {
          timeoutId = setTimeout(flash, 3000 + Math.random() * 5000);
        }
      });
    };

    timeoutId = setTimeout(flash, 1500 + Math.random() * 3000);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [opacity]);

  return <Animated.View pointerEvents="none" style={[styles.flash, { opacity }]} />;
}

export default function WeatherBackground({ condition }: { condition: string }) {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {condition === "Clouds" && <Clouds />}
      {(condition === "Rain" || condition === "Drizzle") && <Rain />}
      {condition === "Thunderstorm" && (
        <>
          <Rain intense />
          <ThunderFlash />
        </>
      )}
      {condition === "Snow" && <Snow />}
    </View>
  );
}

const styles = StyleSheet.create({
  raindrop: {
    position: "absolute",
    top: 0,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 2,
  },
  snowflake: {
    position: "absolute",
    top: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  cloud: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
  },
});
