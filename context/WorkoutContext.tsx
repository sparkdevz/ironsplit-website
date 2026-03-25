import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SetData {
  weight: string;
  reps: string;
}

interface WorkoutContextType {
  week: number;
  setWeek: (w: number) => void;
  unit: "kg" | "lbs";
  setUnit: (u: "kg" | "lbs") => void;
  getSessionData: (day: string, exIndex: number, w?: number) => SetData[];
  saveSessionData: (day: string, exIndex: number, data: SetData[]) => Promise<void>;
  clearWeek: (w: number) => Promise<void>;
  getSwap: (day: string, exIndex: number) => number;
  saveSwap: (day: string, exIndex: number, varIndex: number) => Promise<void>;
  resetSwap: (day: string, exIndex: number) => Promise<void>;
  reloadTrigger: number;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [week, setWeekState] = useState<number>(1);
  const [unit, setUnitState] = useState<"kg" | "lbs">("kg");
  const [sessionCache, setSessionCache] = useState<Record<string, SetData[]>>({});
  const [swapCache, setSwapCache] = useState<Record<string, number>>({});
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const savedUnit = await AsyncStorage.getItem("wl_unit");
        if (savedUnit === "kg" || savedUnit === "lbs") setUnitState(savedUnit);
        const savedWeek = await AsyncStorage.getItem("wl_week");
        if (savedWeek) setWeekState(parseInt(savedWeek));
        // Load all swaps
        const keys = await AsyncStorage.getAllKeys();
        const swapKeys = keys.filter((k) => k.startsWith("wl_swap_"));
        if (swapKeys.length > 0) {
          const pairs = await AsyncStorage.multiGet(swapKeys);
          const newSwapCache: Record<string, number> = {};
          pairs.forEach(([k, v]) => { if (v !== null) newSwapCache[k] = parseInt(v); });
          setSwapCache(newSwapCache);
        }
      } catch (_) {}
    })();
  }, []);

  const setWeek = useCallback(async (w: number) => {
    setWeekState(w);
    setSessionCache({});
    setReloadTrigger((t) => t + 1);
    await AsyncStorage.setItem("wl_week", String(w));
  }, []);

  const setUnit = useCallback(async (u: "kg" | "lbs") => {
    setUnitState(u);
    await AsyncStorage.setItem("wl_unit", u);
  }, []);

  const storageKey = (day: string, exIndex: number, w: number) =>
    `wl_${day}_${exIndex}_w${w}`;

  const getSessionData = useCallback(
    (day: string, exIndex: number, w?: number): SetData[] => {
      const wk = w !== undefined ? w : week;
      const key = storageKey(day, exIndex, wk);
      return sessionCache[key] ?? [];
    },
    [week, sessionCache]
  );

  const saveSessionData = useCallback(
    async (day: string, exIndex: number, data: SetData[]) => {
      const key = storageKey(day, exIndex, week);
      setSessionCache((prev) => ({ ...prev, [key]: data }));
      await AsyncStorage.setItem(key, JSON.stringify(data));
    },
    [week]
  );

  const clearWeek = useCallback(
    async (w: number) => {
      const keys = await AsyncStorage.getAllKeys();
      const weekKeys = keys.filter((k) => k.startsWith(`wl_`) && k.endsWith(`_w${w}`) && !k.startsWith("wl_swap_"));
      await AsyncStorage.multiRemove(weekKeys);
      setSessionCache({});
      setReloadTrigger((t) => t + 1);
    },
    []
  );

  const getSwap = useCallback(
    (day: string, exIndex: number): number => {
      const key = `wl_swap_${day}_${exIndex}`;
      return swapCache[key] !== undefined ? swapCache[key] : -1;
    },
    [swapCache]
  );

  const saveSwap = useCallback(async (day: string, exIndex: number, varIndex: number) => {
    const key = `wl_swap_${day}_${exIndex}`;
    setSwapCache((prev) => ({ ...prev, [key]: varIndex }));
    await AsyncStorage.setItem(key, String(varIndex));
  }, []);

  const resetSwap = useCallback(async (day: string, exIndex: number) => {
    const key = `wl_swap_${day}_${exIndex}`;
    setSwapCache((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    await AsyncStorage.removeItem(key);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const weekKeys = keys.filter((k) => k.match(/^wl_\w+_\d+_w\d+$/) && !k.startsWith("wl_swap_"));
        if (weekKeys.length === 0) return;
        const pairs = await AsyncStorage.multiGet(weekKeys);
        const newCache: Record<string, SetData[]> = {};
        pairs.forEach(([k, v]) => { if (v) newCache[k] = JSON.parse(v); });
        setSessionCache(newCache);
      } catch (_) {}
    })();
  }, [reloadTrigger]);

  return (
    <WorkoutContext.Provider
      value={{
        week,
        setWeek,
        unit,
        setUnit,
        getSessionData,
        saveSessionData,
        clearWeek,
        getSwap,
        saveSwap,
        resetSwap,
        reloadTrigger,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used inside WorkoutProvider");
  return ctx;
}
