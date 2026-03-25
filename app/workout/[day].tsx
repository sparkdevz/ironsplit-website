import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DAYS, DAY_COLORS, DayKey, Exercise } from "@/constants/workoutData";
import { useWorkout, SetData } from "@/context/WorkoutContext";
import { getExerciseImageUri } from "@/hooks/useExerciseImage";
import { ThemeColors } from "@/constants/theme";
import AdBanner from "@/components/AdBanner";

type TabType = "info" | "track" | "variations";

interface ExCardState {
  activeTab: TabType;
  swappedTo: number;
  savedThisSession: boolean;
}

// ── Exercise image sub-component ───────────────────────────────────────────
function ExerciseImage({ name, theme }: { name: string; theme: ThemeColors }) {
  const uri = getExerciseImageUri(name);
  const [imgError, setImgError] = useState(false);

  if (!uri || imgError) {
    return (
      <View style={[imgStyles.placeholder, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder }]}>
        <Text style={[imgStyles.noImg, { color: theme.textFaint }]}>No image available</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[imgStyles.image, { backgroundColor: theme.cardAlt }]}
      resizeMode="contain"
      onError={() => setImgError(true)}
    />
  );
}

const imgStyles = StyleSheet.create({
  image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 14 },
  placeholder: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  noImg: { fontSize: 11 },
});

// ── Main screen ────────────────────────────────────────────────────────────
export default function WorkoutDayScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const insets = useSafeAreaInsets();
  const { week, unit, getSessionData, saveSessionData, getSwap, saveSwap, resetSwap, reloadTrigger, theme } = useWorkout();

  const dayKey = day as DayKey;
  const dayData = DAYS[dayKey];
  const colors = DAY_COLORS[dayKey];

  const [cardStates, setCardStates] = useState<ExCardState[]>(() =>
    dayData.exercises.map(() => ({ activeTab: "info" as TabType, swappedTo: -1, savedThisSession: false }))
  );

  const [inputData, setInputData] = useState<SetData[][]>(() =>
    dayData.exercises.map(() => [])
  );

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
    if (varIndex === -1) resetSwap(dayKey, exIndex);
    else saveSwap(dayKey, exIndex, varIndex);
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

  const totalSets = dayData.exercises.reduce((a, ex) => a + ex.sets, 0);
  const loggedSets = inputData.reduce((a, sets) => a + sets.filter((s) => s.weight || s.reps).length, 0);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!dayData) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.bg }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Day not found</Text>
      </View>
    );
  }

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
        style={[styles.container, { backgroundColor: theme.bg }]}
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
            <Text style={[styles.daySub, { color: theme.textFaint }]}>Week {week} · {unit}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow}>
              {dayData.muscles.map((m) => (
                <View key={m} style={[styles.muscleTag, { backgroundColor: colors.tag }]}>
                  <Text style={[styles.muscleTagText, { color: colors.tagText }]}>{m}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Summary bar */}
          <View style={[styles.summaryBar, { backgroundColor: theme.bgSecondary, borderBottomColor: theme.separator }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.primary }]}>{dayData.exercises.length}</Text>
              <Text style={[styles.summaryLabel, { color: theme.textFaint }]}>EXERCISES</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.primary }]}>{totalSets}</Text>
              <Text style={[styles.summaryLabel, { color: theme.textFaint }]}>TOTAL SETS</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.primary }]}>{loggedSets}</Text>
              <Text style={[styles.summaryLabel, { color: theme.textFaint }]}>LOGGED</Text>
            </View>
          </View>

          {/* Exercise cards */}
          {dayData.exercises.map((ex, exIndex) => {
            const state = cardStates[exIndex];
            const swapIdx = state?.swappedTo ?? -1;
            const isSwapped = swapIdx !== -1;
            const activeName = isSwapped ? ex.vars[swapIdx].name : ex.name;
            const activeDetail = isSwapped ? ex.vars[swapIdx].desc : ex.detail;
            const activeTab = state?.activeTab ?? "info";
            const prevData = getPrevData(exIndex);
            const currData = inputData[exIndex] ?? [];

            return (
              <ExerciseCard
                key={exIndex}
                ex={ex}
                exIndex={exIndex}
                activeName={activeName}
                activeDetail={activeDetail}
                activeTab={activeTab}
                isSwapped={isSwapped}
                swapIdx={swapIdx}
                savedThisSession={state?.savedThisSession ?? false}
                prevData={prevData}
                currData={currData}
                unit={unit}
                colors={colors}
                theme={theme}
                onSetTab={(tab) => setTab(exIndex, tab)}
                onSetSwap={(vi) => setSwap(exIndex, vi)}
                onUpdateInput={(setIdx, field, val) => updateInput(exIndex, setIdx, field, val)}
                onSave={() => saveSession(exIndex)}
              />
            );
          })}

          {/* Tip box */}
          <View style={[styles.tipBox, { backgroundColor: theme.tipBg, borderLeftColor: theme.tipBorder }]}>
            <Text style={[styles.tipText, { color: theme.textMuted }]}>💡 {dayData.tip}</Text>
          </View>
        </ScrollView>
        <AdBanner />
      </KeyboardAvoidingView>
    </>
  );
}

// ── ExerciseCard ───────────────────────────────────────────────────────────
interface ExerciseCardProps {
  ex: Exercise;
  exIndex: number;
  activeName: string;
  activeDetail: string;
  activeTab: TabType;
  isSwapped: boolean;
  swapIdx: number;
  savedThisSession: boolean;
  prevData: SetData[];
  currData: SetData[];
  unit: string;
  colors: { primary: string; light: string; tag: string; tagText: string };
  theme: ThemeColors;
  onSetTab: (tab: TabType) => void;
  onSetSwap: (vi: number) => void;
  onUpdateInput: (setIdx: number, field: "weight" | "reps", val: string) => void;
  onSave: () => void;
}

function ExerciseCard({
  ex, exIndex, activeName, activeDetail, activeTab, isSwapped, swapIdx,
  savedThisSession, prevData, currData, unit, colors, theme,
  onSetTab, onSetSwap, onUpdateInput, onSave,
}: ExerciseCardProps) {
  return (
    <View style={[styles.exCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {/* Header */}
      <View style={styles.exCardHeader}>
        <View style={[styles.exNum, { backgroundColor: colors.primary }]}>
          <Text style={styles.exNumText}>{exIndex + 1}</Text>
        </View>
        <View style={styles.exHeaderMain}>
          <Text style={[styles.exName, { color: theme.text }]}>{activeName}</Text>
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
          <Text style={[styles.exSRLabel, { color: theme.textFaint }]}>sets×reps</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.cardTabs, { borderTopColor: theme.separator, borderBottomColor: theme.separator }]}>
        {(["info", "track", "variations"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.cardTab, activeTab === tab && { borderBottomWidth: 2, borderBottomColor: colors.primary }]}
            onPress={() => onSetTab(tab)}
          >
            <Text style={[styles.cardTabText, { color: activeTab === tab ? colors.primary : theme.tabInactive }]}>
              {tab === "info" ? "📋 Info" : tab === "track" ? "📊 Track" : "🔄 Variations"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Info pane */}
      {activeTab === "info" && (
        <View style={styles.cardPane}>
          <ExerciseImage name={activeName} theme={theme} />
          <Text style={[styles.exDetail, { color: theme.textMuted }]}>{activeDetail}</Text>
          {isSwapped && (
            <TouchableOpacity style={[styles.resetBtn, { borderColor: theme.inputBorder }]} onPress={() => onSetSwap(-1)}>
              <Text style={[styles.resetBtnText, { color: theme.textMuted }]}>↩ Reset to original</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Track pane */}
      {activeTab === "track" && (
        <View style={styles.cardPane}>
          <View style={styles.tableHeader}>
            <Text style={[styles.thCell, { width: 46, color: theme.textFaint }]}>SET</Text>
            <Text style={[styles.thCell, { color: theme.textFaint }]}>WEIGHT ({unit})</Text>
            <Text style={[styles.thCell, { color: theme.textFaint }]}>REPS DONE</Text>
            <Text style={[styles.thCell, { width: 70, color: theme.textFaint }]}>vs PREV</Text>
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
                <Text style={[styles.setLabel, { color: theme.textFaint }]}>Set {setIdx + 1}</Text>
                <TextInput
                  style={[
                    styles.setInput,
                    { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text },
                    hasWeight && { backgroundColor: theme.inputFilled, borderColor: theme.inputFilledBorder },
                  ]}
                  value={cur?.weight ?? ""}
                  onChangeText={(v) => onUpdateInput(setIdx, "weight", v)}
                  keyboardType="decimal-pad"
                  placeholder="—"
                  placeholderTextColor={theme.textFaint}
                />
                <TextInput
                  style={[
                    styles.setInput,
                    { backgroundColor: theme.input, borderColor: theme.inputBorder, color: theme.text },
                    hasReps && { backgroundColor: theme.inputFilled, borderColor: theme.inputFilledBorder },
                  ]}
                  value={cur?.reps ?? ""}
                  onChangeText={(v) => onUpdateInput(setIdx, "reps", v)}
                  keyboardType="decimal-pad"
                  placeholder="—"
                  placeholderTextColor={theme.textFaint}
                />
                <View style={[styles.prevCell, { width: 70 }]}>
                  {prev?.weight || prev?.reps ? (
                    <>
                      <Text style={[styles.prevText, { color: theme.textFaint }]}>{prev.weight || "?"}×{prev.reps || "?"}</Text>
                      {arrow !== "" && <Text style={[styles.arrowText, { color: arrowColor }]}>{arrow}</Text>}
                    </>
                  ) : (
                    <Text style={[styles.prevEmpty, { color: theme.textFaint }]}>—</Text>
                  )}
                </View>
              </View>
            );
          })}
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={onSave}>
            <Text style={styles.saveBtnText}>{savedThisSession ? "✓ Saved!" : "Save Session"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Variations pane */}
      {activeTab === "variations" && (
        <View style={styles.cardPane}>
          <Text style={[styles.varNote, { color: theme.textFaint }]}>
            Select any exercise below to swap it in. Your tracking data stays in place.
          </Text>

          {/* Original */}
          <View style={[styles.varItem, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder },
            !isSwapped && { backgroundColor: theme.inputFilled, borderColor: theme.inputFilledBorder }]}>
            <View style={styles.varRow}>
              <View style={[styles.varNum, { backgroundColor: theme.input }, !isSwapped && { backgroundColor: colors.primary }]}>
                <Text style={[styles.varNumText, { color: theme.textFaint }, !isSwapped && { color: "#fff" }]}>★</Text>
              </View>
              <Text style={[styles.varName, { color: theme.textMuted }]}>{ex.name}</Text>
              <View style={[styles.varEquip, { backgroundColor: theme.cardBorder }]}>
                <Text style={[styles.varEquipText, { color: theme.textFaint }]}>Original</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.swapBtn, { borderColor: theme.inputBorder },
                !isSwapped && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => onSetSwap(-1)}
              disabled={!isSwapped}
            >
              <Text style={[styles.swapBtnText, { color: theme.textMuted }, !isSwapped && { color: "#fff" }]}>
                {!isSwapped ? "✓ Currently active" : "↩ Use original"}
              </Text>
            </TouchableOpacity>
          </View>

          {ex.vars.map((v, vi) => {
            const isSel = isSwapped && swapIdx === vi;
            return (
              <View key={vi} style={[styles.varItem, { backgroundColor: theme.cardAlt, borderColor: theme.cardBorder },
                isSel && { backgroundColor: theme.inputFilled, borderColor: theme.inputFilledBorder }]}>
                <View style={styles.varRow}>
                  <View style={[styles.varNum, { backgroundColor: theme.input }, isSel && { backgroundColor: colors.primary }]}>
                    <Text style={[styles.varNumText, { color: theme.textFaint }, isSel && { color: "#fff" }]}>{vi + 1}</Text>
                  </View>
                  <Text style={[styles.varName, { color: theme.textMuted }]}>{v.name}</Text>
                  <View style={[styles.varEquip, { backgroundColor: theme.cardBorder }]}>
                    <Text style={[styles.varEquipText, { color: theme.textFaint }]}>{v.equip}</Text>
                  </View>
                </View>
                <Text style={[styles.varDesc, { color: theme.textMuted }]}>{v.desc}</Text>
                <TouchableOpacity
                  style={[styles.swapBtn, { borderColor: theme.inputBorder },
                    isSel && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={() => onSetSwap(vi)}
                  disabled={isSel}
                >
                  <Text style={[styles.swapBtnText, { color: theme.textMuted }, isSel && { color: "#fff" }]}>
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
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 16 },
  dayHeader: { padding: 18, paddingBottom: 14 },
  dayTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  daySub: { fontSize: 12, marginBottom: 10 },
  tagsRow: { flexDirection: "row" as const },
  muscleTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9, marginRight: 6 },
  muscleTagText: { fontSize: 10, fontWeight: "700" },
  summaryBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 28,
  },
  summaryItem: { alignItems: "center" },
  summaryVal: { fontSize: 22, fontWeight: "800" },
  summaryLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 0.5, marginTop: 2 },
  exCard: {
    borderRadius: 14,
    marginHorizontal: 14,
    marginTop: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  exCardHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  exNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  exNumText: { fontSize: 11, fontWeight: "800", color: "#fff" },
  exHeaderMain: { flex: 1 },
  exName: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
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
  exSRLabel: { fontSize: 9, marginTop: 1 },
  cardTabs: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1 },
  cardTab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  cardTabText: { fontSize: 10, fontWeight: "700" },
  cardPane: { padding: 14 },
  exDetail: { fontSize: 13, lineHeight: 20, marginBottom: 10 },
  resetBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, alignSelf: "flex-start" },
  resetBtnText: { fontSize: 12 },
  tableHeader: { flexDirection: "row", marginBottom: 8, paddingHorizontal: 2 },
  thCell: { flex: 1, fontSize: 9, fontWeight: "800", letterSpacing: 0.5, textAlign: "center" },
  tableRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  setLabel: { width: 46, fontSize: 11, fontWeight: "700" },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  prevCell: { alignItems: "center" },
  prevText: { fontSize: 10, textAlign: "center" },
  prevEmpty: { fontSize: 12, textAlign: "center" },
  arrowText: { fontSize: 11, fontWeight: "800", textAlign: "center" },
  saveBtn: { width: "100%", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 12 },
  saveBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
  varNote: { fontSize: 11, marginBottom: 12, lineHeight: 17 },
  varItem: { borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1 },
  varRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  varNum: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  varNumText: { fontSize: 10, fontWeight: "800" },
  varName: { flex: 1, fontSize: 13, fontWeight: "700" },
  varEquip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  varEquipText: { fontSize: 9, fontWeight: "700" },
  varDesc: { fontSize: 11, lineHeight: 17, marginBottom: 10 },
  swapBtn: { width: "100%", paddingVertical: 9, borderRadius: 8, borderWidth: 1.5, alignItems: "center" },
  swapBtnText: { fontSize: 11, fontWeight: "800" },
  tipBox: { marginHorizontal: 14, marginTop: 16, borderLeftWidth: 3, borderRadius: 8, padding: 12 },
  tipText: { fontSize: 12, lineHeight: 18 },
});
