"use client";

import { useCallback, useState } from "react";
import type { Exercise, WorkoutDraft, WorkoutLog } from "@/types";
import { getRepos } from "@/repositories";
import { draftToLog } from "@/services/workoutService";
import { evaluatePbUpdates } from "@/services/recordService";
import { xpForLog } from "@/services/levelService";
import { useWorkoutDraftStore } from "@/stores/workoutDraftStore";
import { useMascotStore } from "@/stores/mascotStore";

/**
 * セッション保存のオーケストレーション:
 * ログ保存 → PB判定・Records更新 → XP付与 → マスコット反応 → 下書きクリア
 */
export function useSaveWorkout(exerciseById: Map<string, Exercise>) {
  const clearDraft = useWorkoutDraftStore((s) => s.clear);
  const speak = useMascotStore((s) => s.speak);
  const [isSaving, setIsSaving] = useState(false);

  const saveWorkout = useCallback(
    async (draft: WorkoutDraft): Promise<WorkoutLog | null> => {
      const log = draftToLog(draft);
      if (log.entries.length === 0) return null;

      setIsSaving(true);
      try {
        const repos = await getRepos();
        await repos.workoutLogs.save(log);

        const existing = await repos.records.getAll();
        const { updates, nextRecords } = evaluatePbUpdates(log, existing);
        await Promise.all(nextRecords.map((r) => repos.records.save(r)));

        const profile = await repos.userProfile.get();
        await repos.userProfile.save({
          ...profile,
          xp: profile.xp + xpForLog(log),
        });

        if (updates.length > 0) {
          speak("pb", {
            exercise: exerciseById.get(updates[0].exerciseId)?.nameJa,
          });
        } else {
          speak("workoutSaved");
        }

        clearDraft();
        return log;
      } finally {
        setIsSaving(false);
      }
    },
    [exerciseById, clearDraft, speak],
  );

  return { saveWorkout, isSaving };
}
