import type { Exercise, MuscleCategoryId, MuscleId, WorkoutLog } from "@/types";

export interface CategoryVolume {
  categoryId: MuscleCategoryId;
  sets: number;
  volume: number;
}

/** 指定日以降のログのみ抽出（sinceISO を含む） */
function filterSince(logs: WorkoutLog[], sinceISO: string): WorkoutLog[] {
  return logs.filter((l) => l.date >= sinceISO);
}

/**
 * 部位（カテゴリ）別の総セット数・ボリューム。
 * 種目の主働カテゴリ（exercise.categoryId）に集計する。
 */
export function calcCategoryVolume(
  logs: WorkoutLog[],
  exerciseById: Map<string, Exercise>,
  sinceISO: string,
): Map<MuscleCategoryId, CategoryVolume> {
  const map = new Map<MuscleCategoryId, CategoryVolume>();
  for (const log of filterSince(logs, sinceISO)) {
    for (const entry of log.entries) {
      const exercise = exerciseById.get(entry.exerciseId);
      if (!exercise) continue;
      const cat = exercise.categoryId;
      const prev = map.get(cat) ?? { categoryId: cat, sets: 0, volume: 0 };
      prev.sets += entry.sets.length;
      prev.volume += entry.sets.reduce((s, set) => s + set.weightKg * set.reps, 0);
      map.set(cat, prev);
    }
  }
  return map;
}

/**
 * 筋肉別の刺激量を 0-1 に正規化して返す（ヒートマップ用）。
 * 各セットを exercise.muscles に配分し、主働筋（先頭）は 1.0、
 * それ以外は 0.5 の重みで加算。最大値で正規化する。
 */
export function calcMuscleHeat(
  logs: WorkoutLog[],
  exerciseById: Map<string, Exercise>,
  sinceISO: string,
): Record<string, number> {
  const raw = new Map<MuscleId, number>();
  for (const log of filterSince(logs, sinceISO)) {
    for (const entry of log.entries) {
      const exercise = exerciseById.get(entry.exerciseId);
      if (!exercise) continue;
      const setCount = entry.sets.length;
      exercise.muscles.forEach((muscleId, index) => {
        const weight = index === 0 ? 1 : 0.5;
        raw.set(muscleId, (raw.get(muscleId) ?? 0) + setCount * weight);
      });
    }
  }

  const max = Math.max(0, ...raw.values());
  const heat: Record<string, number> = {};
  if (max <= 0) return heat;
  for (const [muscleId, value] of raw) {
    heat[muscleId] = value / max;
  }
  return heat;
}
