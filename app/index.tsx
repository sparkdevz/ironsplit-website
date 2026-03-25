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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useWorkout } from "@/context/WorkoutContext";
import { DAYS, DAY_COLORS, SCHEDULE, DayKey } from "@/constants/workoutData";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { week, setWeek, unit, setUnit, clearWeek, getSessionData } = useWorkout();
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  function getDayProgress(dayId: string): { logged: number; total: number } {
    if (!(dayId in DAYS)) return { logged: 0, total: 0 };
    const day = DAYS[dayId as DayKey];
    let total = 0;
    let logged = 0;
    day.exercises.forEach((ex, i) => {
      total += ex.sets;
      const data = getSessionData(dayId, i);
      data.forEach((s) => {
        if (s.weight || s.reps) logged++;
      });
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
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🏋️ 4-Day Split</Text>
          <Text style={styles.headerSub}>Upper/Lower Program</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.unitToggle}
            onPress={() => setShowUnitPicker(!showUnitPicker)}
          >
            <Text style={[styles.unitBtn, unit === "kg" && styles.unitActive]}>kg</Text>
            <Text style={[styles.unitBtn, unit === "lbs" && styles.unitActive]}>lbs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Unit picker dropdown */}
      {showUnitPicker && (
        <View style={styles.dropdown}>
          {(["kg", "lbs"] as const).map((u) => (
            <TouchableOpacity
              key={u}
              style={[styles.dropdownItem, unit === u && styles.dropdownItemActive]}
              onPress={() => { setUnit(u); setShowUnitPicker(false); }}
            >
              <Text style={[styles.dropdownText, unit === u && styles.dropdownTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Week selector */}
        <View style={styles.weekSection}>
          <Text style={styles.sectionLabel}>CURRENT WEEK</Text>
          <View style={styles.weekRow}>
            <TouchableOpacity
              style={styles.weekArrow}
              onPress={() => week > 1 && setWeek(week - 1)}
            >
              <Ionicons name="chevron-back" size={20} color={week > 1 ? "#fff" : "#555"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.weekBadge}
              onPress={() => setShowWeekPicker(!showWeekPicker)}
            >
              <Text style={styles.weekNumber}>Week {week}</Text>
              <Text style={styles.weekOf}>of 12</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.weekArrow}
              onPress={() => week < 12 && setWeek(week + 1)}
            >
              <Ionicons name="chevron-forward" size={20} color={week < 12 ? "#fff" : "#555"} />
            </TouchableOpacity>
          </View>

          {showWeekPicker && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekPicker}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[styles.weekPickerItem, week === w && styles.weekPickerActive]}
                  onPress={() => { setWeek(w); setShowWeekPicker(false); }}
                >
                  <Text style={[styles.weekPickerText, week === w && styles.weekPickerTextActive]}>
                    W{w}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Full Schedule */}
        <Text style={styles.sectionLabel}>WEEKLY SCHEDULE</Text>
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
                  isWorkout ? { borderLeftColor: colors!.primary, borderLeftWidth: 4 } : styles.restCard,
                ]}
                onPress={() => {
                  if (!day.isRest) {
                    router.push(`/workout/${day.id}`);
                  }
                }}
                disabled={day.isRest}
              >
                <View style={styles.scheduleCardLeft}>
                  <Text style={[styles.scheduleDay, isWorkout && { color: colors!.primary }]}>
                    {day.label}
                  </Text>
                  <Text style={styles.scheduleSub}>{day.sub}</Text>
                </View>
                {isWorkout && prog ? (
                  <View style={styles.scheduleRight}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${pct * 100}%` as any, backgroundColor: colors!.primary }]} />
                    </View>
                    <Text style={styles.progressText}>
                      {prog.logged}/{prog.total} sets
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.restText}>{(day as any).restIcon || "💤"}</Text>
                )}
                {isWorkout && (
                  <Ionicons name="chevron-forward" size={16} color="#555" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Workout day cards */}
        <Text style={styles.sectionLabel}>WORKOUTS</Text>
        <View style={styles.dayCards}>
          {workoutDays.map((day) => {
            const colors = DAY_COLORS[day.id as DayKey];
            const dayData = DAYS[day.id as DayKey];
            const prog = getDayProgress(day.id);
            const pct = prog.total > 0 ? prog.logged / prog.total : 0;

            return (
              <TouchableOpacity
                key={day.id}
                style={[styles.dayCard, { backgroundColor: colors.light }]}
                onPress={() => router.push(`/workout/${day.id}`)}
              >
                <View style={[styles.dayCardAccent, { backgroundColor: colors.primary }]} />
                <View style={styles.dayCardContent}>
                  <Text style={[styles.dayCardLabel, { color: colors.primary }]}>{day.label}</Text>
                  <Text style={styles.dayCardTitle}>{dayData.dayLabel}</Text>
                  <Text style={styles.dayCardMuscles}>
                    {dayData.muscles.slice(0, 3).join(" · ")}
                  </Text>
                  <View style={styles.dayCardFooter}>
                    <Text style={styles.dayCardExCount}>{dayData.exercises.length} exercises</Text>
                    <Text style={styles.dayCardProgress}>
                      {prog.logged}/{prog.total} sets
                    </Text>
                  </View>
                  <View style={styles.progressBarSmall}>
                    <View style={[styles.progressFillSmall, { width: `${pct * 100}%` as any, backgroundColor: colors.primary }]} />
                  </View>
                </View>
                <Ionicons name="arrow-forward-circle" size={28} color={colors.primary} style={styles.dayCardArrow} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Clear week */}
        <TouchableOpacity style={styles.clearBtn} onPress={handleClearWeek}>
          <Ionicons name="trash-outline" size={16} color="#dc2626" />
          <Text style={styles.clearBtnText}>Clear Week {week} Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: "#888", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  unitToggle: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    overflow: "hidden",
  },
  unitBtn: { paddingHorizontal: 12, paddingVertical: 7, fontSize: 12, fontWeight: "700", color: "#666" },
  unitActive: { backgroundColor: "#fff", color: "#111" },
  dropdown: {
    position: "absolute",
    top: 72,
    right: 18,
    backgroundColor: "#222",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    zIndex: 999,
    overflow: "hidden",
  },
  dropdownItem: { paddingHorizontal: 20, paddingVertical: 12 },
  dropdownItemActive: { backgroundColor: "#333" },
  dropdownText: { color: "#aaa", fontSize: 14, fontWeight: "600" },
  dropdownTextActive: { color: "#fff" },
  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#555",
    letterSpacing: 1,
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  weekSection: { paddingHorizontal: 18, marginTop: 8 },
  weekRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  weekArrow: { padding: 8 },
  weekBadge: { alignItems: "center" },
  weekNumber: { fontSize: 28, fontWeight: "800", color: "#fff" },
  weekOf: { fontSize: 12, color: "#666", marginTop: -2 },
  weekPicker: { marginTop: 12, marginBottom: 4 },
  weekPickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#222",
    marginRight: 8,
  },
  weekPickerActive: { backgroundColor: "#fff" },
  weekPickerText: { fontSize: 13, fontWeight: "700", color: "#888" },
  weekPickerTextActive: { color: "#111" },
  scheduleGrid: { paddingHorizontal: 18, gap: 8 },
  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  restCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2a2a2a",
  },
  scheduleCardLeft: { flex: 1 },
  scheduleDay: { fontSize: 14, fontWeight: "700", color: "#fff" },
  scheduleSub: { fontSize: 12, color: "#666", marginTop: 2 },
  scheduleRight: { alignItems: "flex-end", gap: 4, flex: 1 },
  progressBar: { width: 80, height: 4, backgroundColor: "#333", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { fontSize: 10, color: "#666" },
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
  dayCardTitle: { fontSize: 15, fontWeight: "700", color: "#1a1a1a", marginBottom: 4 },
  dayCardMuscles: { fontSize: 12, color: "#666", marginBottom: 10 },
  dayCardFooter: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  dayCardExCount: { fontSize: 11, color: "#888" },
  dayCardProgress: { fontSize: 11, color: "#888" },
  progressBarSmall: { height: 3, backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 2, overflow: "hidden" },
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
    borderColor: "#3a1a1a",
    backgroundColor: "#1a0a0a",
  },
  clearBtnText: { color: "#dc2626", fontSize: 13, fontWeight: "700" },
});
