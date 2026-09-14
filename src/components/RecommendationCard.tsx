import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
import GlassCard from "./GlassCard";

interface RecommendationCardProps {
  icon: string;
  title: string;
  summary: string;
  tips: string[];
}

export default function RecommendationCard({ icon, title, summary, tips }: RecommendationCardProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name={icon as any} size={18} color="rgba(255,255,255,0.6)" />
        <Text style={styles.title}>{title.toUpperCase()}</Text>
      </View>
      <Text style={styles.summary}>{summary}</Text>
      <View style={styles.tips}>
        {tips.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  title: {
    color: "rgba(255,255,255,0.6)",
    fontSize: theme.fonts.label2,
    fontWeight: theme.fontWeights.semiBold,
    letterSpacing: 1,
  },
  summary: {
    color: theme.colors.white,
    fontSize: theme.fonts.body3,
    fontWeight: theme.fontWeights.semiBold,
    marginBottom: 10,
  },
  tips: {
    gap: 6,
  },
  tipRow: {
    flexDirection: "row",
    gap: 8,
  },
  bullet: {
    color: theme.colors.onSurfaceVariant2,
    fontSize: theme.fonts.label1,
  },
  tipText: {
    flex: 1,
    color: theme.colors.onSurfaceVariant2,
    fontSize: theme.fonts.label1,
    lineHeight: 18,
  },
});
