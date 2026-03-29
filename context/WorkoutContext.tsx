import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ColorScheme, ThemeColors, getTheme } from "@/constants/theme";

export interface SetData {
  weight: string;
  reps: string;
}

export interface WeekHistory {
  week: number;
  sets: SetData[];
}

interface WorkoutContextType {
  week: number;
  setWeek: (w: number) => void;
  unit: "kg" | "lbs";
  setUnit: (u: "kg" | "lbs") => void;
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
  theme: ThemeColors;
  getSessionData: (day: string, exIndex: number, w?: number) => SetData[];
  saveSessionData: (day: string, exIndex: number, data: SetData[]) => Promise<void>;
  clearWeek: (w: number) => Promise<void>;
  getSwap: (day: string, exIndex: number) => number;
  saveSwap: (day: string, exIndex: number, varIndex: number) => Promise<void>;
  resetSwap: (day: string, exIndex: number) => Promise<void>;
  getHistoryData: (day: string, exIndex: number) => WeekHistory[];
  reloadTrigger: number;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [week, setWeekState] = useState<number>(1);
  const [unit, setUnitState] = useState<"kg" | "lbs">("lbs");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
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
        const savedScheme = await AsyncStorage.getItem("wl_scheme");
        if (savedScheme === "dark" || savedScheme === "light") setColorScheme(savedScheme);
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

  const toggleColorScheme = useCallback(async () => {
    setColorScheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem("wl_scheme", next);
      return next;
    });
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
      const pattern = new RegExp(`_w${w}$`);

      // Remove from AsyncStorage
      const storageKeys = await AsyncStorage.getAllKeys();
      const storageWeekKeys = storageKeys.filter(
        (k) => k.startsWith("wl_") && !k.startsWith("wl_swap_") && pattern.test(k)
      );
      if (storageWeekKeys.length > 0) {
        await AsyncStorage.multiRemove(storageWeekKeys);
      }

      // Remove from cache by scanning cache keys directly (catches in-flight writes)
      setSessionCache((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (!k.startsWith("wl_swap_") && pattern.test(k)) {
            delete next[k];
          }
        });
        return next;
      });

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

  const getHistoryData = useCallback((day: string, exIndex: number): WeekHistory[] => {
    const prefix = `wl_${day}_${exIndex}_w`;
    const result: WeekHistory[] = [];
    for (const key of Object.keys(sessionCache)) {
      if (key.startsWith(prefix)) {
        const weekNum = parseInt(key.slice(prefix.length));
        if (!isNaN(weekNum)) {
          result.push({ week: weekNum, sets: sessionCache[key] ?? [] });
        }
      }
    }
    return result.sort((a, b) => a.week - b.week);
  }, [sessionCache]);

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
        if (weekKeys.length === 0) { setSessionCache({}); return; }
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
        colorScheme,
        toggleColorScheme,
        theme: getTheme(colorScheme),
        getSessionData,
        saveSessionData,
        clearWeek,
        getSwap,
        saveSwap,
        resetSwap,
        getHistoryData,
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
