import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "@/constants/theme";

interface LogoProps {
  theme: ThemeColors;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ theme, size = "md" }: LogoProps) {
  const scale = size === "sm" ? 0.7 : size === "lg" ? 1.3 : 1;

  const iconSize = Math.round(22 * scale);
  const ironSize = Math.round(24 * scale);
  const splitSize = Math.round(24 * scale);
  const tagSize = Math.round(10 * scale);
  const barH = Math.round(2 * scale);
  const barW = Math.round(18 * scale);
  const dotSize = Math.round(6 * scale);

  return (
    <View style={styles.container}>
      {/* Icon mark */}
      <View style={styles.iconRow}>
        {/* Left weight */}
        <View style={[styles.weightPlate, {
          width: dotSize, height: dotSize * 2.5,
          borderRadius: dotSize / 2,
          backgroundColor: "#f59e0b",
          marginRight: 2 * scale,
        }]} />
        {/* Bar */}
        <View style={[styles.bar, { width: barW, height: barH, backgroundColor: theme.textMuted }]} />
        {/* Barbell icon */}
        <Ionicons name="barbell-outline" size={iconSize} color="#f59e0b" style={{ marginHorizontal: 2 * scale }} />
        {/* Bar */}
        <View style={[styles.bar, { width: barW, height: barH, backgroundColor: theme.textMuted }]} />
        {/* Right weight */}
        <View style={[styles.weightPlate, {
          width: dotSize, height: dotSize * 2.5,
          borderRadius: dotSize / 2,
          backgroundColor: "#f59e0b",
          marginLeft: 2 * scale,
        }]} />
      </View>

      {/* Wordmark */}
      <View style={styles.wordmark}>
        <Text style={[styles.iron, { fontSize: ironSize, color: theme.text }]}>
          IRON
        </Text>
        <Text style={[styles.split, { fontSize: splitSize }]}>
          SPLIT
        </Text>
      </View>

      {/* Tagline */}
      <Text style={[styles.tagline, { fontSize: tagSize, color: theme.textFaint }]}>
        4-DAY UPPER / LOWER PROGRAM
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 5,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  weightPlate: {},
  bar: {},
  wordmark: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 0,
  },
  iron: {
    fontWeight: "900",
    letterSpacing: 2,
  },
  split: {
    fontWeight: "900",
    letterSpacing: 2,
    color: "#f59e0b",
  },
  tagline: {
    fontWeight: "700",
    letterSpacing: 1.5,
  },
});
