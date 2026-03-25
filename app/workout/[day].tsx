import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { DAYS, DAY_COLORS, DayKey, Exercise } from "@/constants/workoutData";
import { useWorkout, SetData } from "@/context/WorkoutContext";

type TabType = "info" | "track" | "variations";

interface ExCardState {
  activeTab: TabType;
  swappedTo: number; // -1 = original
  savedThisSession: boolean;
}

export default function WorkoutDayScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { week, unit, getSessionData, saveSessionData, getSwap, saveSwap, resetSwap, reloadTrigger } = useWorkout();

  const dayKey = day as DayKey;
  const dayData = DAYS[dayKey];
  const colors = DAY_COLORS[dayKey];

  const [cardStates, setCardStates] = useState<ExCardState[]>(() =>
    dayData.exercises.map((_, i) => ({
      activeTab: "info" as TabType,
      swappedTo: -1,
      savedThisSession: false,
    }))
  );

  const [inputData, setInputData] = useState<SetData[][]>(() =>
    dayData.exercises.map(() => [])
  );

  // Load swaps and session data on mount
  useEffect(() => {
    const newCardStates = dayData.exercises.map((_, i) => ({
      activeTab: "info" as TabType,
      swappedTo: getSwap(dayKey, i),
      savedThisSession: false,
    }));
    setCardStates(newCardStates);

    const newInputData = dayData.exercises.map((ex, i) => {
      const saved = getSessionData(dayKey, i, week);
      if (saved.length > 0) return saved;
      return Array.from({ length: ex.sets }, () => ({ weight: "", reps: "" }));
    });
    setInputData(newInputData);
  }, [week, reloadTrigger, dayKey]);

  function setTab(exIndex: number, tab: TabType) {
    setCardStates((prev) => {
      const next = [...prev];
      next[exIndex] = { ...next[exIndex], activeTab: tab };
      return next;
    });
  }

  function setSwap(exIndex: number, varIndex: number) {
    setCardStates((prev) => {
      const next = [...prev];
      next[exIndex] = { ...next[exIndex], swappedTo: varIndex, activeTab: "info" };
      return next;
    });
    if (varIndex === -1) {
      resetSwap(dayKey, exIndex);
    } else {
      saveSwap(dayKey, exIndex, varIndex);
    }
  }

  function updateInput(exIndex: number, setIndex: number, field: "weight" | "reps", value: string) {
    setInputData((prev) => {
      const next = prev.map((row) => [...row]);
      if (!next[exIndex]) next[exIndex] = [];
      if (!next[exIndex][setIndex]) next[exIndex][setIndex] = { weight: "", reps: "" };
      next[exIndex][setIndex] = { ...next[exIndex][setIndex], [field]: value };
      return next;
    });
  }

  async function saveSession(exIndex: number) {
    const ex = dayData.exercises[exIndex];
    const data = inputData[exIndex] ?? [];
    const toSave: SetData[] = Array.from({ length: ex.sets }, (_, s) => ({
      weight: data[s]?.weight ?? "",
      reps: data[s]?.reps ?? "",
    }));
    await saveSessionData(dayKey, exIndex, toSave);
    setCardStates((prev) => {
      const next = [...prev];
      next[exIndex] = { ...next[exIndex], savedThisSession: true };
      return next;
    });
    setTimeout(() => {
      setCardStates((prev) => {
        const next = [...prev];
        next[exIndex] = { ...next[exIndex], savedThisSession: false };
        return next;
      });
    }, 1600);
  }

  function getPrevData(exIndex: number): SetData[] {
    if (week <= 1) return [];
    return getSessionData(dayKey, exIndex, week - 1);
  }

  // Compute total sets logged for summary
  const totalSets = dayData.exercises.reduce((a, ex) => a + ex.sets, 0);
  const loggedSets = inputData.reduce((a, sets) => {
    return a + sets.filter((s) => s.weight || s.reps).length;
  }, 0);

  if (!dayData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Day not found</Text>
      </View>
    );
  }

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <>
      <Stack.Screen
        options={{
          title: dayData.dayType,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: bottomPad + 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Day header */}
          <View style={[styles.dayHeader, { backgroundColor: colors.light }]}>
            <Text style={[styles.dayTitle, { color: colors.primary }]}>{dayData.dayLabel}</Text>
            <Text style={styles.daySub}>Week {week} · {unit}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
              {dayData.muscles.map((m) => (
                <View key={m} style={[styles.muscleTag, { backgroundColor: colors.tag }]}>
                  <Text style={[styles.muscleTagText, { color: colors.tagText }]}>{m}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Summary bar */}
          <View style={styles.summaryBar}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.primary }]}>{dayData.exercises.length}</Text>
              <Text style={styles.summaryLabel}>EXERCISES</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.primary }]}>{totalSets}</Text>
              <Text style={styles.summaryLabel}>TOTAL SETS</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.primary }]}>{loggedSets}</Text>
              <Text style={styles.summaryLabel}>LOGGED</Text>
            </View>
          </View>

          {/* Exercise cards */}
          {dayData.exercises.map((ex, exIndex) => {
            const state = cardStates[exIndex];
            const swapIdx = state?.swappedTo ?? -1;
            const isSwapped = swapIdx !== -1;
            const activeEx = isSwapped ? ex.vars[swapIdx] : ex;
            const activeName = isSwapped ? ex.vars[swapIdx].name : ex.name;
            const activeDetail = isSwapped ? ex.vars[swapIdx].desc : ex.detail;
            const activeTab = state?.activeTab ?? "info";
            const prevData = getPrevData(exIndex);
            const currData = inputData[exIndex] ?? [];

            return (
              <View key={exIndex} style={styles.exCard}>
                {/* Card header */}
                <View style={styles.exCardHeader}>
                  <View style={[styles.exNum, { backgroundColor: colors.primary }]}>
                    <Text style={styles.exNumText}>{exIndex + 1}</Text>
                  </View>
                  <View style={styles.exHeaderMain}>
                    <Text style={styles.exName}>{activeName}</Text>
                    <View style={styles.exBadges}>
                      <View style={[styles.badge, ex.type === "compound" ? styles.badgeCompound : styles.badgeIsolation]}>
                        <Text style={[styles.badgeText, ex.type === "compound" ? styles.badgeCompoundText : styles.badgeIsolationText]}>
                          {ex.type}
                        </Text>
                      </View>
                      {isSwapped && (
                        <View style={styles.swappedBadge}>
                          <Text style={styles.swappedBadgeText}>↔ swapped</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.exSetsReps}>
                    <Text style={[styles.exSR, { color: colors.primary }]}>{ex.sets}×{ex.reps}</Text>
                    <Text style={styles.exSRLabel}>sets×reps</Text>
                  </View>
                </View>

                {/* Card tabs */}
                <View style={styles.cardTabs}>
                  {(["info", "track", "variations"] as TabType[]).map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.cardTab, activeTab === tab && styles.cardTabActive]}
                      onPress={() => setTab(exIndex, tab)}
                    >
                      <Text style={[styles.cardTabText, activeTab === tab && { color: colors.primary }]}>
                        {tab === "info" ? "📋 Info" : tab === "track" ? "📊 Track" : "🔄 Variations"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Info pane */}
                {activeTab === "info" && (
                  <View style={styles.cardPane}>
                    <Text style={styles.exDetail}>{activeDetail}</Text>
                    {isSwapped && (
                      <TouchableOpacity
                        style={styles.resetBtn}
                        onPress={() => setSwap(exIndex, -1)}
                      >
                        <Text style={styles.resetBtnText}>↩ Reset to original</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Track pane */}
                {activeTab === "track" && (
                  <View style={styles.cardPane}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.thCell, { width: 46 }]}>SET</Text>
                      <Text style={styles.thCell}>WEIGHT ({unit})</Text>
                      <Text style={styles.thCell}>REPS DONE</Text>
                      <Text style={[styles.thCell, { width: 70 }]}>vs PREV</Text>
                    </View>
                    {Array.from({ length: ex.sets }, (_, setIdx) => {
                      const cur = currData[setIdx];
                      const prev = prevData[setIdx];
                      const hasWeight = !!(cur?.weight);
                      const hasReps = !!(cur?.reps);
                      let arrow = "";
                      if (cur?.weight && prev?.weight) {
                        const cw = parseFloat(cur.weight);
                        const pw = parseFloat(prev.weight);
                        if (cw > pw) arrow = "▲";
                        else if (cw < pw) arrow = "▼";
                        else arrow = "—";
                      }
                      const arrowColor = arrow === "▲" ? "#22c55e" : arrow === "▼" ? "#ef4444" : "#f59e0b";

                      return (
                        <View key={setIdx} style={styles.tableRow}>
                          <Text style={styles.setLabel}>Set {setIdx + 1}</Text>
                          <TextInput
                            style={[styles.setInput, hasWeight && styles.setInputFilled]}
                            value={cur?.weight ?? ""}
                            onChangeText={(v) => updateInput(exIndex, setIdx, "weight", v)}
                            keyboardType="decimal-pad"
                            placeholder="—"
                            placeholderTextColor="#555"
                          />
                          <TextInput
                            style={[styles.setInput, hasReps && styles.setInputFilled]}
                            value={cur?.reps ?? ""}
                            onChangeText={(v) => updateInput(exIndex, setIdx, "reps", v)}
                            keyboardType="decimal-pad"
                            placeholder="—"
                            placeholderTextColor="#555"
                          />
                          <View style={[styles.prevCell, { width: 70 }]}>
                            {prev?.weight || prev?.reps ? (
                              <>
                                <Text style={styles.prevText}>{prev.weight || "?"}×{prev.reps || "?"}</Text>
                                {arrow !== "" && (
                                  <Text style={[styles.arrowText, { color: arrowColor }]}>{arrow}</Text>
                                )}
                              </>
                            ) : (
                              <Text style={styles.prevEmpty}>—</Text>
                            )}
                          </View>
                        </View>
                      );
                    })}
                    <TouchableOpacity
                      style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                      onPress={() => saveSession(exIndex)}
                    >
                      <Text style={styles.saveBtnText}>
                        {state?.savedThisSession ? "✓ Saved!" : "Save Session"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Variations pane */}
                {activeTab === "variations" && (
                  <View style={styles.cardPane}>
                    <Text style={styles.varNote}>
                      Select any exercise below to swap it in. Your tracking data stays in place.
                    </Text>

                    {/* Original */}
                    <View style={[styles.varItem, !isSwapped && styles.varItemActive]}>
                      <View style={styles.varRow}>
                        <View style={[styles.varNum, !isSwapped && { backgroundColor: colors.primary }]}>
                          <Text style={[styles.varNumText, !isSwapped && { color: "#fff" }]}>★</Text>
                        </View>
                        <Text style={styles.varName}>{ex.name}</Text>
                        <View style={styles.varEquip}>
                          <Text style={styles.varEquipText}>Original</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[styles.swapBtn, !isSwapped && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                        onPress={() => setSwap(exIndex, -1)}
                        disabled={!isSwapped}
                      >
                        <Text style={[styles.swapBtnText, !isSwapped && { color: "#fff" }]}>
                          {!isSwapped ? "✓ Currently active" : "↩ Use original"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {ex.vars.map((v, vi) => {
                      const isSel = isSwapped && swapIdx === vi;
                      return (
                        <View key={vi} style={[styles.varItem, isSel && styles.varItemActive]}>
                          <View style={styles.varRow}>
                            <View style={[styles.varNum, isSel && { backgroundColor: colors.primary }]}>
                              <Text style={[styles.varNumText, isSel && { color: "#fff" }]}>{vi + 1}</Text>
                            </View>
                            <Text style={styles.varName}>{v.name}</Text>
                            <View style={styles.varEquip}>
                              <Text style={styles.varEquipText}>{v.equip}</Text>
                            </View>
                          </View>
                          <Text style={styles.varDesc}>{v.desc}</Text>
                          <TouchableOpacity
                            style={[styles.swapBtn, isSel && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                            onPress={() => setSwap(exIndex, vi)}
                            disabled={isSel}
                          >
                            <Text style={[styles.swapBtnText, isSel && { color: "#fff" }]}>
                              {isSel ? "✓ Currently active" : "↔ Use this exercise"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}

          {/* Tip box */}
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>💡 {dayData.tip}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  scroll: { flex: 1 },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#111" },
  errorText: { color: "#fff", fontSize: 16 },
  dayHeader: { padding: 18, paddingBottom: 14 },
  dayTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  daySub: { fontSize: 12, color: "#666", marginBottom: 10 },
  tagsRow: { flexDirection: "row" as const },
  muscleTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9, marginRight: 6 },
  muscleTagText: { fontSize: 10, fontWeight: "700" },
  summaryBar: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 28,
  },
  summaryItem: { alignItems: "center" },
  summaryVal: { fontSize: 22, fontWeight: "800" },
  summaryLabel: { fontSize: 9, color: "#555", fontWeight: "700", letterSpacing: 0.5, marginTop: 2 },
  exCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    marginHorizontal: 14,
    marginTop: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  exCardHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  exNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  exNumText: { fontSize: 11, fontWeight: "800", color: "#fff" },
  exHeaderMain: { flex: 1 },
  exName: { fontSize: 14, fontWeight: "800", color: "#fff", marginBottom: 4 },
  exBadges: { flexDirection: "row", gap: 5 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badgeCompound: { backgroundColor: "#1a2e4a" },
  badgeIsolation: { backgroundColor: "#2a1e08" },
  badgeText: { fontSize: 9, fontWeight: "800" },
  badgeCompoundText: { color: "#5ba3f5" },
  badgeIsolationText: { color: "#f59e0b" },
  swappedBadge: { backgroundColor: "#2a2010", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  swappedBadgeText: { fontSize: 9, fontWeight: "800", color: "#d97706" },
  exSetsReps: { alignItems: "flex-end" },
  exSR: { fontSize: 16, fontWeight: "800" },
  exSRLabel: { fontSize: 9, color: "#555", marginTop: 1 },
  cardTabs: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#252525",
    borderBottomWidth: 1,
    borderBottomColor: "#252525",
  },
  cardTab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  cardTabActive: { borderBottomWidth: 2, borderBottomColor: "#fff" },
  cardTabText: { fontSize: 10, fontWeight: "700", color: "#555" },
  cardPane: { padding: 14 },
  exDetail: { fontSize: 13, color: "#aaa", lineHeight: 20, marginBottom: 10 },
  resetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    alignSelf: "flex-start",
  },
  resetBtnText: { fontSize: 12, color: "#888" },
  tableHeader: { flexDirection: "row", marginBottom: 8, paddingHorizontal: 2 },
  thCell: { flex: 1, fontSize: 9, fontWeight: "800", color: "#555", letterSpacing: 0.5, textAlign: "center" },
  tableRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  setLabel: { width: 46, fontSize: 11, color: "#555", fontWeight: "700" },
  setInput: {
    flex: 1,
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  setInputFilled: { backgroundColor: "#0f2a18", borderColor: "#22c55e" },
  prevCell: { alignItems: "center" },
  prevText: { fontSize: 10, color: "#555", textAlign: "center" },
  prevEmpty: { fontSize: 12, color: "#444", textAlign: "center" },
  arrowText: { fontSize: 11, fontWeight: "800", textAlign: "center" },
  saveBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  saveBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
  varNote: { fontSize: 11, color: "#666", marginBottom: 12, lineHeight: 17 },
  varItem: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  varItemActive: { backgroundColor: "#0f2a18", borderColor: "#22c55e" },
  varRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  varNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  varNumText: { fontSize: 10, fontWeight: "800", color: "#888" },
  varName: { flex: 1, fontSize: 13, fontWeight: "700", color: "#ddd" },
  varEquip: { backgroundColor: "#2a2a2a", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  varEquipText: { fontSize: 9, fontWeight: "700", color: "#888" },
  varDesc: { fontSize: 11, color: "#777", lineHeight: 17, marginBottom: 10 },
  swapBtn: {
    width: "100%",
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#444",
    alignItems: "center",
  },
  swapBtnText: { fontSize: 11, fontWeight: "800", color: "#aaa" },
  tipBox: {
    marginHorizontal: 14,
    marginTop: 16,
    backgroundColor: "#1a1a1a",
    borderLeftWidth: 3,
    borderLeftColor: "#333",
    borderRadius: 8,
    padding: 12,
  },
  tipText: { fontSize: 12, color: "#777", lineHeight: 18 },
});
