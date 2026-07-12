"use client";

import { Plus, Trash2 } from "lucide-react";
import type { DraftEntry, Exercise, WorkoutEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoryNameJa } from "@/data/categories";
import { formatDateShort } from "@/utils/date";
import { useWorkoutDraftStore } from "@/stores/workoutDraftStore";
import { useMascotStore } from "@/stores/mascotStore";
import { useRestTimerStore } from "@/stores/restTimerStore";
import { SetRow } from "./SetRow";

interface ExerciseEntryCardProps {
  entry: DraftEntry;
  exercise: Exercise | undefined;
  /** 前回セッションの実績（日付 + 全セット）。Last Record として全セットを表示 */
  previous?: { date: string; entry: WorkoutEntry } | null;
}

export function ExerciseEntryCard({
  entry,
  exercise,
  previous,
}: ExerciseEntryCardProps) {
  const { addSet, removeSet, updateSet, toggleSetDone, removeExercise } =
    useWorkoutDraftStore();
  const speak = useMascotStore((s) => s.speak);
  const startRest = useRestTimerStore((s) => s.start);

  const handleToggleDone = (setIndex: number) => {
    const wasDone = entry.sets[setIndex]?.isDone;
    toggleSetDone(entry.exerciseId, setIndex);
    if (!wasDone) {
      startRest();
      speak("setDone");
    }
  };

  return (
    <Card className="border-border bg-card">
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
        <button
          type="button"
          aria-label="種目を削除"
          onClick={() => removeExercise(entry.exerciseId)}
          className="mt-1 text-muted-foreground/60 transition-colors hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {previous && previous.entry.sets.length > 0 && (
          <div className="mb-2 rounded-xl bg-secondary/60 px-3 py-2">
            <p className="mb-1 text-[11px] font-medium text-muted-foreground">
              前回 {formatDateShort(previous.date)}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {previous.entry.sets.map((set) => (
                <div
                  key={set.setNumber}
                  className="flex items-center gap-2 text-xs tabular-nums"
                >
                  <span className="w-4 text-muted-foreground">{set.setNumber}</span>
                  <span className="font-semibold">{set.weightKg}kg</span>
                  <span className="text-muted-foreground">× {set.reps}回</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {entry.sets.map((set, i) => (
          <SetRow
            key={i}
            index={i}
            set={set}
            onUpdate={(patch) => updateSet(entry.exerciseId, i, patch)}
            onToggleDone={() => handleToggleDone(i)}
            onRemove={() => removeSet(entry.exerciseId, i)}
          />
        ))}
        <Button
          variant="secondary"
          className="mt-2 w-full"
          onClick={() => addSet(entry.exerciseId)}
        >
          <Plus className="size-4" data-icon="inline-start" />
          セットを追加
        </Button>
      </CardContent>
    </Card>
  );
}
