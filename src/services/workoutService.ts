import type { WorkoutDraft, WorkoutLog } from "@/types";
import { createId } from "@/utils/id";
import { minutesSince } from "@/utils/date";

/**
 * 下書き → 保存用ログへの変換。
 * 回数0のセット・セットが空の種目は除外する。
 * 完了チェックはジム内での進捗表示用であり、保存対象には影響しない。
 */
export function draftToLog(draft: WorkoutDraft): WorkoutLog {
  const entries = draft.entries
    .map((e) => ({
      exerciseId: e.exerciseId,
      sets: e.sets
        .filter((s) => s.reps > 0)
        .map((s, i) => ({
          setNumber: i + 1,
          weightKg: s.weightKg,
          reps: s.reps,
          ...(s.rpe !== undefined ? { rpe: s.rpe } : {}),
        })),
    }))
    .filter((e) => e.sets.length > 0);

  return {
    id: createId(),
    date: draft.date,
    entries,
    note: draft.note.trim(),
    durationMinutes: Math.min(minutesSince(draft.startedAt), 600),
    createdAt: new Date().toISOString(),
  };
}
