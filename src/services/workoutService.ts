import type { WorkoutDraft, WorkoutLog } from "@/types";
import { createId } from "@/utils/id";
import { minutesBetween } from "@/utils/date";

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

  // 所要時間は「最初の入力〜最後の入力」で確定させる（保存時刻に依存しない）
  const durationMinutes =
    draft.firstInputAt && draft.lastInputAt
      ? Math.min(minutesBetween(draft.firstInputAt, draft.lastInputAt), 600)
      : 0;

  return {
    id: draft.activeLogId ?? createId(),
    date: draft.date,
    entries,
    note: draft.note.trim(),
    durationMinutes,
    createdAt: draft.firstInputAt ?? draft.startedAt,
  };
}
