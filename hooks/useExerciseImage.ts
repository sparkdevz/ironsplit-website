import { useState, useEffect } from "react";

const DB_URL =
  "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises.json";
const IMG_BASE =
  "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/";

interface ExerciseDBEntry {
  name: string;
  images: string[];
}

// Module-level cache so the DB is only fetched once per app session
let dbCache: ExerciseDBEntry[] | null = null;
let dbFetchPromise: Promise<ExerciseDBEntry[]> | null = null;

function getDB(): Promise<ExerciseDBEntry[]> {
  if (dbCache) return Promise.resolve(dbCache);
  if (dbFetchPromise) return dbFetchPromise;
  dbFetchPromise = fetch(DB_URL)
    .then((r) => r.json())
    .then((data: ExerciseDBEntry[]) => {
      dbCache = data;
      return data;
    })
    .catch(() => {
      dbCache = [];
      return [];
    });
  return dbFetchPromise;
}

function matchScore(query: string, name: string): number {
  const q = query
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const n = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const nSet = new Set(n);
  let hits = q.filter((w) => nSet.has(w)).length;
  if (name.toLowerCase().includes(query.toLowerCase().slice(0, 10))) hits += 0.5;
  return hits / Math.max(q.length, 1);
}

function findBestMatch(
  name: string,
  db: ExerciseDBEntry[]
): ExerciseDBEntry | null {
  let best: ExerciseDBEntry | null = null;
  let bestScore = 0;
  for (const entry of db) {
    const s = matchScore(name, entry.name);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }
  return bestScore >= 0.4 ? best : null;
}

type ImageStatus = "loading" | "ready" | "error";

export function useExerciseImage(exerciseName: string): {
  uri: string | null;
  status: ImageStatus;
} {
  const [uri, setUri] = useState<string | null>(null);
  const [status, setStatus] = useState<ImageStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    setUri(null);
    setStatus("loading");

    getDB().then((db) => {
      if (cancelled) return;
      const match = findBestMatch(exerciseName, db);
      if (match && match.images && match.images.length > 0) {
        setUri(IMG_BASE + match.images[0]);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [exerciseName]);

  return { uri, status };
}
