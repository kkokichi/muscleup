import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DraftSet, WorkoutDraft, WorkoutLog, WorkoutTemplate } from "@/types";
import { templateSetsToDraftSets } from "@/services/templateService";
import { todayISO } from "@/utils/date";

interface WorkoutDraftState {
  draft: WorkoutDraft | null;
  startWorkout: () => void;
  startFromTemplate: (template: WorkoutTemplate) => void;
  startFromLog: (log: WorkoutLog) => void;
  addExercise: (exerciseId: string, presetSets?: DraftSet[]) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string, preset?: Partial<DraftSet>) => void;
  removeSet: (exerciseId: string, setIndex: number) => void;
  updateSet: (
    exerciseId: string,
    setIndex: number,
    patch: Partial<DraftSet>,
  ) => void;
  toggleSetDone: (exerciseId: string, setIndex: number) => void;
  setNote: (note: string) => void;
  clear: () => void;
}

const DEFAULT_SET: DraftSet = { weightKg: 20, reps: 10, isDone: false };

function updateEntry(
  draft: WorkoutDraft,
  exerciseId: string,
  mutate: (sets: DraftSet[]) => DraftSet[],
): WorkoutDraft {
  return {
    ...draft,
    entries: draft.entries.map((e) =>
      e.exerciseId === exerciseId ? { ...e, sets: mutate(e.sets) } : e,
    ),
  };
}

/**
 * 記録中セッションの下書き。persistにより
 * アプリを閉じても入力が消えない（継続体験の生命線）。
 */
export const useWorkoutDraftStore = create<WorkoutDraftState>()(
  persist(
    (set, get) => ({
      draft: null,

      startWorkout: () => {
        if (get().draft) return; // 進行中の下書きを保護
        set({
          draft: {
            date: todayISO(),
            startedAt: new Date().toISOString(),
            entries: [],
            note: "",
          },
        });
      },

      startFromTemplate: (template) => {
        set({
          draft: {
            date: todayISO(),
            startedAt: new Date().toISOString(),
            entries: template.entries.map((entry) => ({
              exerciseId: entry.exerciseId,
              sets: templateSetsToDraftSets(entry.sets),
            })),
            note: template.note ?? "",
          },
        });
      },

      startFromLog: (log) => {
        set({
          draft: {
            date: todayISO(),
            startedAt: new Date().toISOString(),
            entries: log.entries.map((entry) => ({
              exerciseId: entry.exerciseId,
              sets: entry.sets.map((workoutSet) => ({
                weightKg: workoutSet.weightKg,
                reps: workoutSet.reps,
                ...(workoutSet.rpe !== undefined ? { rpe: workoutSet.rpe } : {}),
                isDone: false,
              })),
            })),
            note: "",
          },
        });
      },

      addExercise: (exerciseId, presetSets) => {
        const { draft } = get();
        if (!draft || draft.entries.some((e) => e.exerciseId === exerciseId)) return;
        set({
          draft: {
            ...draft,
            entries: [
              ...draft.entries,
              { exerciseId, sets: presetSets ?? [{ ...DEFAULT_SET }] },
            ],
          },
        });
      },

      removeExercise: (exerciseId) => {
        const { draft } = get();
        if (!draft) return;
        set({
          draft: {
            ...draft,
            entries: draft.entries.filter((e) => e.exerciseId !== exerciseId),
          },
        });
      },

      addSet: (exerciseId, preset) => {
        const { draft } = get();
        if (!draft) return;
        set({
          draft: updateEntry(draft, exerciseId, (sets) => {
            const last = sets[sets.length - 1];
            const base = last
              ? { ...last, isDone: false }
              : { ...DEFAULT_SET };
            return [...sets, { ...base, ...preset }];
          }),
        });
      },

      removeSet: (exerciseId, setIndex) => {
        const { draft } = get();
        if (!draft) return;
        set({
          draft: updateEntry(draft, exerciseId, (sets) =>
            sets.filter((_, i) => i !== setIndex),
          ),
        });
      },

      updateSet: (exerciseId, setIndex, patch) => {
        const { draft } = get();
        if (!draft) return;
        set({
          draft: updateEntry(draft, exerciseId, (sets) =>
            sets.map((s, i) => (i === setIndex ? { ...s, ...patch } : s)),
          ),
        });
      },

      toggleSetDone: (exerciseId, setIndex) => {
        const { draft } = get();
        if (!draft) return;
        set({
          draft: updateEntry(draft, exerciseId, (sets) =>
            sets.map((s, i) => (i === setIndex ? { ...s, isDone: !s.isDone } : s)),
          ),
        });
      },

      setNote: (note) => {
        const { draft } = get();
        if (!draft) return;
        set({ draft: { ...draft, note } });
      },

      clear: () => set({ draft: null }),
    }),
    { name: "muscleup:v1:workoutDraft" },
  ),
);
