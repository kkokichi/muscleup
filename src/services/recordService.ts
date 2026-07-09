import type { ExerciseRecord, PbUpdate, WorkoutLog } from "@/types";
import { estimate1RM } from "./oneRepMaxService";

interface ExerciseSummary {
  maxWeight: number;
  est1rm: number;
  maxReps: number;
  volume: number;
}

/** 1セッション内の種目ごとの成績を集計する */
export function summarizeLog(log: WorkoutLog): Map<string, ExerciseSummary> {
  const map = new Map<string, ExerciseSummary>();
  for (const entry of log.entries) {
    const s: ExerciseSummary = map.get(entry.exerciseId) ?? {
      maxWeight: 0,
      est1rm: 0,
      maxReps: 0,
      volume: 0,
    };
    for (const set of entry.sets) {
      s.maxWeight = Math.max(s.maxWeight, set.weightKg);
      s.est1rm = Math.max(s.est1rm, estimate1RM(set.weightKg, set.reps));
      s.maxReps = Math.max(s.maxReps, set.reps);
      s.volume += set.weightKg * set.reps;
    }
    map.set(entry.exerciseId, s);
  }
  return map;
}

/**
 * 記録保存時のPB判定。
 * 既存レコードと比較し、更新一覧と保存すべき新レコードを返す。
 */
export function evaluatePbUpdates(
  log: WorkoutLog,
  existing: ExerciseRecord[],
): { updates: PbUpdate[]; nextRecords: ExerciseRecord[] } {
  const updates: PbUpdate[] = [];
  const nextRecords: ExerciseRecord[] = [];
  const byExercise = new Map(existing.map((r) => [r.exerciseId, r]));

  for (const [exerciseId, s] of summarizeLog(log)) {
    if (s.maxWeight <= 0) continue;

    const prev = byExercise.get(exerciseId);
    if (!prev) {
      // 初回記録はPB演出の対象にしない（すべてがベストになってしまうため）
      nextRecords.push({
        exerciseId,
        maxWeight: s.maxWeight,
        est1rm: s.est1rm,
        maxReps: s.maxReps,
        maxVolume: s.volume,
        achievedAt: log.date,
        updatedCount: 0,
      });
      continue;
    }

    const next: ExerciseRecord = { ...prev };
    let updated = false;

    if (s.maxWeight > prev.maxWeight) {
      updates.push({
        exerciseId,
        type: "maxWeight",
        previous: prev.maxWeight,
        value: s.maxWeight,
      });
      next.maxWeight = s.maxWeight;
      updated = true;
    }
    if (s.est1rm > prev.est1rm) {
      updates.push({
        exerciseId,
        type: "est1rm",
        previous: prev.est1rm,
        value: s.est1rm,
      });
      next.est1rm = s.est1rm;
      updated = true;
    }
    if (s.maxReps > prev.maxReps) {
      next.maxReps = s.maxReps;
      updated = true;
    }
    if (s.volume > prev.maxVolume) {
      next.maxVolume = s.volume;
      updated = true;
    }

    if (updated) {
      next.achievedAt = log.date;
      next.updatedCount = prev.updatedCount + 1;
      nextRecords.push(next);
    }
  }

  return { updates, nextRecords };
}
