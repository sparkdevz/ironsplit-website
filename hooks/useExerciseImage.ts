import { EXERCISE_IMAGES } from "@/constants/exerciseImages";

export function getExerciseImageUri(exerciseName: string): string | null {
  return EXERCISE_IMAGES[exerciseName] ?? null;
}
