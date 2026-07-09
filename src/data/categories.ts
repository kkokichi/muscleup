import type { ExerciseCategory } from "@/types";

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  { id: "chest", nameJa: "胸", sortOrder: 1 },
  { id: "back", nameJa: "背中", sortOrder: 2 },
  { id: "shoulders", nameJa: "肩", sortOrder: 3 },
  { id: "legs", nameJa: "脚", sortOrder: 4 },
  { id: "arms", nameJa: "腕", sortOrder: 5 },
  { id: "core", nameJa: "腹筋", sortOrder: 6 },
];

export function categoryNameJa(id: string): string {
  return EXERCISE_CATEGORIES.find((c) => c.id === id)?.nameJa ?? id;
}
