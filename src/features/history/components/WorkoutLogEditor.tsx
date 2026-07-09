"use client";

import { useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import type { WorkoutLog, WorkoutSet } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRepos } from "@/repositories";
import { useExercises } from "@/hooks/useExercises";
import { categoryNameJa } from "@/data/categories";
import { rebuildRecordsFromLogs } from "@/services/recordService";

const RPE_OPTIONS = ["", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"];

interface WorkoutLogEditorProps {
  log: WorkoutLog;
  onCancel: () => void;
  onSaved: (log: WorkoutLog) => void;
}

function normalizeSets(sets: WorkoutSet[]): WorkoutSet[] {
  return sets
    .filter((set) => set.reps > 0)
    .map((set, index) => ({
      setNumber: index + 1,
      weightKg: set.weightKg,
      reps: set.reps,
      ...(set.rpe !== undefined ? { rpe: set.rpe } : {}),
    }));
}

export function WorkoutLogEditor({ log, onCancel, onSaved }: WorkoutLogEditorProps) {
  const { byId } = useExercises();
  const [draft, setDraft] = useState<WorkoutLog>(() => ({
    ...log,
    entries: log.entries.map((entry) => ({
      ...entry,
      sets: entry.sets.map((set) => ({ ...set })),
    })),
  }));
  const [isSaving, setIsSaving] = useState(false);

  const updateSet = (
    exerciseId: string,
    setIndex: number,
    patch: Partial<WorkoutSet>,
  ) => {
    setDraft((current) => ({
      ...current,
      entries: current.entries.map((entry) =>
        entry.exerciseId === exerciseId
          ? {
              ...entry,
              sets: entry.sets.map((set, index) =>
                index === setIndex ? { ...set, ...patch } : set,
              ),
            }
          : entry,
      ),
    }));
  };

  const addSet = (exerciseId: string) => {
    setDraft((current) => ({
      ...current,
      entries: current.entries.map((entry) => {
        if (entry.exerciseId !== exerciseId) return entry;
        const last = entry.sets[entry.sets.length - 1];
        return {
          ...entry,
          sets: [
            ...entry.sets,
            {
              setNumber: entry.sets.length + 1,
              weightKg: last?.weightKg ?? 20,
              reps: last?.reps ?? 10,
              ...(last?.rpe !== undefined ? { rpe: last.rpe } : {}),
            },
          ],
        };
      }),
    }));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setDraft((current) => ({
      ...current,
      entries: current.entries.map((entry) =>
        entry.exerciseId === exerciseId
          ? { ...entry, sets: entry.sets.filter((_, index) => index !== setIndex) }
          : entry,
      ),
    }));
  };

  const removeEntry = (exerciseId: string) => {
    setDraft((current) => ({
      ...current,
      entries: current.entries.filter((entry) => entry.exerciseId !== exerciseId),
    }));
  };

  const handleSave = async () => {
    const next: WorkoutLog = {
      ...draft,
      note: draft.note.trim(),
      durationMinutes: Math.max(0, Math.min(600, Math.round(draft.durationMinutes))),
      entries: draft.entries
        .map((entry) => ({
          ...entry,
          sets: normalizeSets(entry.sets),
        }))
        .filter((entry) => entry.sets.length > 0),
    };
    if (next.entries.length === 0) return;

    setIsSaving(true);
    try {
      const repos = await getRepos();
      await repos.workoutLogs.save(next);
      const logs = await repos.workoutLogs.getAll();
      const existingRecords = await repos.records.getAll();
      await repos.records.replaceAll(rebuildRecordsFromLogs(logs, existingRecords));
      onSaved(next);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            日付
            <input
              type="date"
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            所要時間
            <input
              type="number"
              min={0}
              max={600}
              value={draft.durationMinutes}
              onChange={(event) =>
                setDraft({ ...draft, durationMinutes: Number(event.target.value) })
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-muted-foreground sm:col-span-2">
            メモ
            <textarea
              value={draft.note}
              onChange={(event) => setDraft({ ...draft, note: event.target.value })}
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground"
            />
          </label>
        </CardContent>
      </Card>

      {draft.entries.map((entry) => {
        const exercise = byId.get(entry.exerciseId);
        return (
          <Card key={entry.exerciseId} className="border-border bg-card">
            <CardHeader className="flex-row items-start justify-between gap-2 pb-2">
              <div>
                <CardTitle className="text-base font-bold">
                  {exercise?.nameJa ?? entry.exerciseId}
                </CardTitle>
                {exercise && (
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    {categoryNameJa(exercise.categoryId)}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="種目を削除"
                onClick={() => removeEntry(entry.exerciseId)}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {entry.sets.map((set, index) => (
                <div
                  key={`${entry.exerciseId}-${index}`}
                  className="grid grid-cols-[1.5rem_1fr_1fr_4rem_2rem] items-end gap-2 rounded-lg bg-secondary p-2"
                >
                  <span className="pb-2 text-center text-xs font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <label className="space-y-1 text-[10px] font-medium text-muted-foreground">
                    重量
                    <input
                      type="number"
                      step={2.5}
                      value={set.weightKg}
                      onChange={(event) =>
                        updateSet(entry.exerciseId, index, {
                          weightKg: Number(event.target.value),
                        })
                      }
                      className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm font-semibold text-foreground"
                    />
                  </label>
                  <label className="space-y-1 text-[10px] font-medium text-muted-foreground">
                    回数
                    <input
                      type="number"
                      min={0}
                      value={set.reps}
                      onChange={(event) =>
                        updateSet(entry.exerciseId, index, {
                          reps: Math.round(Number(event.target.value)),
                        })
                      }
                      className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm font-semibold text-foreground"
                    />
                  </label>
                  <label className="space-y-1 text-[10px] font-medium text-muted-foreground">
                    RPE
                    <select
                      value={set.rpe !== undefined ? String(set.rpe) : ""}
                      onChange={(event) =>
                        updateSet(entry.exerciseId, index, {
                          rpe:
                            event.target.value === ""
                              ? undefined
                              : Number(event.target.value),
                        })
                      }
                      className="h-9 w-full rounded-md border border-border bg-background px-1 text-sm font-semibold text-foreground"
                    >
                      {RPE_OPTIONS.map((value) => (
                        <option key={value} value={value}>
                          {value || "-"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="セットを削除"
                    onClick={() => removeSet(entry.exerciseId, index)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => addSet(entry.exerciseId)}
              >
                <Plus className="size-4" data-icon="inline-start" />
                セットを追加
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex gap-2">
        <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
          <Save className="size-4" data-icon="inline-start" />
          {isSaving ? "保存中…" : "保存"}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </div>
  );
}
