import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useWorkout } from "@/context/WorkoutContext";
import { DAYS, DAY_COLORS, SCHEDULE, DayKey } from "@/constants/workoutData";
import AdBanner from "@/components/AdBanner";
import Logo from "@/components/Logo";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { week, setWeek, unit, setUnit, clearWeek, getSessionData, theme, colorScheme, toggleColorScheme } = useWorkout();
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const isDark = colorScheme === "dark";

  function getDayProgress(dayId: string): { logged: number; total: number } {
    if (!(dayId in DAYS)) return { logged: 0, total: 0 };
    const day = DAYS[dayId as DayKey];
    let total = 0;
    let logged = 0;
    day.exercises.forEach((ex, i) => {
      total += ex.sets;
      const data = getSessionData(dayId, i);
      data.forEach((s) => { if (s.weight || s.reps) logged++; });
    });
    return { logged, total };
  }

  function handleClearWeek() {
    Alert.alert(
      "Clear Week",
      `Clear all logged data for Week ${week}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => clearWeek(week) },
      ]
    );
  }

  const workoutDays = SCHEDULE.filter((d) => !d.isRest);

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad, backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.separator, borderBottomWidth: 1, backgroundColor: theme.headerBg }]}>
        {/* Left — theme toggle */}
        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={toggleColorScheme}
        >
          <Text style={styles.themeIcon}>{isDark ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>

        {/* Center — logo */}
        <View style={styles.headerCenter}>
          <Logo theme={theme} size="md" />
        </View>

        {/* Right — unit toggle */}
        <View style={[styles.unitToggle, { borderColor: theme.cardBorder }]}>
          <TouchableOpacity
            style={[styles.unitBtn, unit === "kg" && { backgroundColor: theme.text }]}
            onPress={() => setUnit("kg")}
          >
            <Text style={[styles.unitBtnText, { color: unit === "kg" ? theme.bg : theme.textFaint }]}>kg</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitBtn, unit === "lbs" && { backgroundColor: theme.text }]}
            onPress={() => setUnit("lbs")}
          >
            <Text style={[styles.unitBtnText, { color: unit === "lbs" ? theme.bg : theme.textFaint }]}>lbs</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Week selector */}
        <View style={styles.weekSection}>
          <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>CURRENT WEEK</Text>
          <View style={styles.weekRow}>
            <TouchableOpacity style={styles.weekArrow} onPress={() => week > 1 && setWeek(week - 1)}>
              <Ionicons name="chevron-back" size={20} color={week > 1 ? theme.text : theme.textFaint} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.weekBadge} onPress={() => setShowWeekPicker(!showWeekPicker)}>
              <Text style={[styles.weekNumber, { color: theme.text }]}>Week {week}</Text>
              <Text style={[styles.weekOf, { color: theme.textFaint }]}>of 12</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.weekArrow} onPress={() => week < 12 && setWeek(week + 1)}>
              <Ionicons name="chevron-forward" size={20} color={week < 12 ? theme.text : theme.textFaint} />
            </TouchableOpacity>
          </View>

          {showWeekPicker && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekPicker}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[styles.weekPickerItem, { backgroundColor: theme.cardAlt }, week === w && { backgroundColor: theme.text }]}
                  onPress={() => { setWeek(w); setShowWeekPicker(false); }}
                >
                  <Text style={[styles.weekPickerText, { color: theme.textMuted }, week === w && { color: theme.bg }]}>
                    W{w}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Workout day cards */}
        <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>WORKOUTS</Text>
        <View style={styles.dayCards}>
          {workoutDays.map((day) => {
            const colors = DAY_COLORS[day.id as DayKey];
            const dayData = DAYS[day.id as DayKey];
            const prog = getDayProgress(day.id);
            const pct = prog.total > 0 ? prog.logged / prog.total : 0;

            return (
              <TouchableOpacity
                key={day.id}
                style={[styles.dayCard, { backgroundColor: colors.light, borderColor: theme.cardBorder, borderWidth: isDark ? 0 : 1 }]}
                onPress={() => router.push(`/workout/${day.id}`)}
              >
                <View style={[styles.dayCardAccent, { backgroundColor: colors.primary }]} />
                <View style={styles.dayCardContent}>
                  <Text style={[styles.dayCardLabel, { color: colors.primary }]}>{day.label}</Text>
                  <Text style={[styles.dayCardTitle, { color: isDark ? "#1a1a1a" : "#111" }]}>{dayData.dayLabel}</Text>
                  <Text style={[styles.dayCardMuscles, { color: isDark ? "#555" : "#888" }]}>
                    {dayData.muscles.slice(0, 3).join(" · ")}
                  </Text>
                  <View style={styles.dayCardFooter}>
                    <Text style={[styles.dayCardExCount, { color: isDark ? "#777" : "#999" }]}>{dayData.exercises.length} exercises</Text>
                    <Text style={[styles.dayCardProgress, { color: isDark ? "#777" : "#999" }]}>{prog.logged}/{prog.total} sets</Text>
                  </View>
                  <View style={[styles.progressBarSmall, { backgroundColor: isDark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)" }]}>
                    <View style={[styles.progressFillSmall, { width: `${pct * 100}%` as any, backgroundColor: colors.primary }]} />
                  </View>
                </View>
                <Ionicons name="arrow-forward-circle" size={28} color={colors.primary} style={styles.dayCardArrow} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Full Schedule */}
        <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>WEEKLY SCHEDULE</Text>
        <View style={styles.scheduleGrid}>
          {SCHEDULE.map((day) => {
            const isWorkout = !day.isRest;
            const colors = isWorkout ? DAY_COLORS[day.id as DayKey] : null;
            const prog = isWorkout ? getDayProgress(day.id) : null;
            const pct = prog && prog.total > 0 ? prog.logged / prog.total : 0;

            return (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.scheduleCard,
                  { backgroundColor: theme.restCard, borderLeftColor: isWorkout ? colors!.primary : theme.cardBorder, borderLeftWidth: 4 },
                ]}
                onPress={() => { if (!day.isRest) router.push(`/workout/${day.id}`); }}
                disabled={day.isRest}
              >
                <View style={styles.scheduleCardLeft}>
                  <Text style={[styles.scheduleDay, { color: isWorkout ? colors!.primary : theme.text }]}>{day.label}</Text>
                  <Text style={[styles.scheduleSub, { color: theme.textFaint }]}>{day.sub}</Text>
                </View>
                {isWorkout && prog ? (
                  <View style={styles.scheduleRight}>
                    <View style={[styles.progressBar, { backgroundColor: theme.cardBorder }]}>
                      <View style={[styles.progressFill, { width: `${pct * 100}%` as any, backgroundColor: colors!.primary }]} />
                    </View>
                    <Text style={[styles.progressText, { color: theme.textFaint }]}>{prog.logged}/{prog.total} sets</Text>
                  </View>
                ) : (
                  <Text style={styles.restText}>{(day as any).restIcon || "💤"}</Text>
                )}
                {isWorkout && (
                  <Ionicons name="chevron-forward" size={16} color={theme.textFaint} style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Clear week */}
        <TouchableOpacity
          style={[styles.clearBtn, { backgroundColor: theme.clearBtnBg, borderColor: theme.clearBtnBorder }]}
          onPress={handleClearWeek}
        >
          <Ionicons name="trash-outline" size={16} color="#dc2626" />
          <Text style={styles.clearBtnText}>Clear Week {week} Data</Text>
        </TouchableOpacity>
      </ScrollView>
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  themeIcon: { fontSize: 16 },
  unitToggle: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  unitBtn: { paddingHorizontal: 12, paddingVertical: 7 },
  unitBtnText: { fontSize: 12, fontWeight: "700" },
  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  weekSection: { paddingHorizontal: 18, marginTop: 8 },
  weekRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  weekArrow: { padding: 8 },
  weekBadge: { alignItems: "center" },
  weekNumber: { fontSize: 28, fontWeight: "800" },
  weekOf: { fontSize: 12, marginTop: -2 },
  weekPicker: { marginTop: 12, marginBottom: 4 },
  weekPickerItem: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  weekPickerText: { fontSize: 13, fontWeight: "700" },
  scheduleGrid: { paddingHorizontal: 18, gap: 8 },
  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
  },
  scheduleCardLeft: { flex: 1 },
  scheduleDay: { fontSize: 14, fontWeight: "700" },
  scheduleSub: { fontSize: 12, marginTop: 2 },
  scheduleRight: { alignItems: "flex-end", gap: 4, flex: 1 },
  progressBar: { width: 80, height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { fontSize: 10 },
  restText: { fontSize: 20 },
  dayCards: { paddingHorizontal: 18, gap: 12 },
  dayCard: {
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  dayCardAccent: { width: 5, alignSelf: "stretch" },
  dayCardContent: { flex: 1, padding: 16 },
  dayCardLabel: { fontSize: 11, fontWeight: "800", marginBottom: 4, letterSpacing: 0.5 },
  dayCardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  dayCardMuscles: { fontSize: 12, marginBottom: 10 },
  dayCardFooter: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  dayCardExCount: { fontSize: 11 },
  dayCardProgress: { fontSize: 11 },
  progressBarSmall: { height: 3, borderRadius: 2, overflow: "hidden" },
  progressFillSmall: { height: "100%", borderRadius: 2 },
  dayCardArrow: { marginRight: 14 },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 18,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearBtnText: { color: "#dc2626", fontSize: 13, fontWeight: "700" },
});
