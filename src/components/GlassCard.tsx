import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export default function GlassCard({ children, style, intensity = 20 }: GlassCardProps) {
  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.card, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Slight dark tint to enhance the glass effect
  },
});
