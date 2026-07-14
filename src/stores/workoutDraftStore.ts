import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DraftSet, WorkoutDraft, WorkoutLog, WorkoutTemplate } from "@/types";
import { templateSetsToDraftSets } from "@/services/templateService";
import { todayISO } from "@/utils/date";
import { createId } from "@/utils/id";

interface WorkoutDraftState {
  draft: WorkoutDraft | null;
  startWorkout: () => void;
  ensureActiveLogId: () => void;
  startFromTemplate: (template: WorkoutTemplate) => void;
  startFromLog: (log: WorkoutLog) => void;
  /** 保存済みログを同一IDのまま下書きへ復元し、続きを編集できるようにする */
  resumeFromLog: (log: WorkoutLog) => void;
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
  setDate: (date: string) => void;
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

/** セット入力のたびに最初/最後の入力時刻を記録する */
function touchInput(draft: WorkoutDraft): Pick<WorkoutDraft, "firstInputAt" | "lastInputAt"> {
  const now = new Date().toISOString();
  return {
    firstInputAt: draft.firstInputAt ?? now,
    lastInputAt: now,
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
        const existing = get().draft;
        if (existing) {
          if (!existing.activeLogId) {
            set({ draft: { ...existing, activeLogId: createId() } });
          }
          return; // 進行中の下書きを保護
        }
        set({
          draft: {
            activeLogId: createId(),
            date: todayISO(),
            startedAt: new Date().toISOString(),
            entries: [],
            note: "",
          },
        });
      },

      ensureActiveLogId: () => {
        const { draft } = get();
        if (!draft || draft.activeLogId) return;
        set({ draft: { ...draft, activeLogId: createId() } });
      },

      startFromTemplate: (template) => {
        set({
          draft: {
            activeLogId: createId(),
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
            activeLogId: createId(),
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

      resumeFromLog: (log) => {
        const lastInputAt = new Date(
          new Date(log.createdAt).getTime() + log.durationMinutes * 60_000,
        ).toISOString();
        set({
          draft: {
            activeLogId: log.id,
            date: log.date,
            startedAt: new Date().toISOString(),
            firstInputAt: log.createdAt,
            lastInputAt,
            entries: log.entries.map((entry) => ({
              exerciseId: entry.exerciseId,
              sets: entry.sets.map((workoutSet) => ({
                weightKg: workoutSet.weightKg,
                reps: workoutSet.reps,
                ...(workoutSet.rpe !== undefined ? { rpe: workoutSet.rpe } : {}),
                isDone: true,
              })),
            })),
            note: log.note,
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
          draft: {
            ...updateEntry(draft, exerciseId, (sets) => [
              ...sets,
              // 新規セットは前のセット値を引き継がず、常に初期値から始める
              { ...DEFAULT_SET, ...preset },
            ]),
            ...touchInput(draft),
          },
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
          draft: {
            ...updateEntry(draft, exerciseId, (sets) =>
              sets.map((s, i) => (i === setIndex ? { ...s, ...patch } : s)),
            ),
            ...touchInput(draft),
          },
        });
      },

      toggleSetDone: (exerciseId, setIndex) => {
        const { draft } = get();
        if (!draft) return;
        set({
          draft: {
            ...updateEntry(draft, exerciseId, (sets) =>
              sets.map((s, i) => (i === setIndex ? { ...s, isDone: !s.isDone } : s)),
            ),
            ...touchInput(draft),
          },
        });
      },

      setNote: (note) => {
        const { draft } = get();
        if (!draft) return;
        set({ draft: { ...draft, note } });
      },

      setDate: (date) => {
        const { draft } = get();
        if (!draft) return;
        set({ draft: { ...draft, date } });
      },

      clear: () => set({ draft: null }),
    }),
    { name: "muscleup:v1:workoutDraft" },
  ),
);
