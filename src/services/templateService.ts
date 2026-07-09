import type {
  DraftSet,
  WorkoutDraft,
  WorkoutLog,
  WorkoutTemplate,
  WorkoutTemplateEntry,
} from "@/types";
import { createId } from "@/utils/id";

function toTemplateEntries(
  entries: Array<{ exerciseId: string; sets: Array<{ weightKg: number; reps: number; rpe?: number }> }>,
): WorkoutTemplateEntry[] {
  return entries
    .map((entry) => ({
      exerciseId: entry.exerciseId,
      sets: entry.sets
        .filter((set) => set.reps > 0)
        .map((set) => ({
          weightKg: set.weightKg,
          reps: set.reps,
          ...(set.rpe !== undefined ? { rpe: set.rpe } : {}),
        })),
    }))
    .filter((entry) => entry.sets.length > 0);
}

export function createTemplateFromDraft(
  draft: WorkoutDraft,
  name: string,
): WorkoutTemplate | null {
  const entries = toTemplateEntries(draft.entries);
  if (entries.length === 0) return null;

  const now = new Date().toISOString();
  return {
    id: createId(),
    name: name.trim() || "いつものメニュー",
    entries,
    note: draft.note.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export function createTemplateFromLog(
  log: WorkoutLog,
  name: string,
): WorkoutTemplate | null {
  const entries = toTemplateEntries(log.entries);
  if (entries.length === 0) return null;

  const now = new Date().toISOString();
  return {
    id: createId(),
    name: name.trim() || "前回メニュー",
    entries,
    note: log.note.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export function templateSetsToDraftSets(
  sets: WorkoutTemplateEntry["sets"],
): DraftSet[] {
  return sets.map((set) => ({
    weightKg: set.weightKg,
    reps: set.reps,
    ...(set.rpe !== undefined ? { rpe: set.rpe } : {}),
    isDone: false,
  }));
}
