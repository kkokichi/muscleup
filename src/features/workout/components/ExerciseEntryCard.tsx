"use client";

import { Plus, Trash2 } from "lucide-react";
import type { DraftEntry, Exercise } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoryNameJa } from "@/data/categories";
import { useWorkoutDraftStore } from "@/stores/workoutDraftStore";
import { useMascotStore } from "@/stores/mascotStore";
import { useRestTimerStore } from "@/stores/restTimerStore";
import { SetRow } from "./SetRow";

interface ExerciseEntryCardProps {
  entry: DraftEntry;
  exercise: Exercise | undefined;
  /** 前回セッションの実績表示（例: "前回 60kg × 8回 × 3セット"） */
  previousHint?: string;
}

export function ExerciseEntryCard({
  entry,
  exercise,
  previousHint,
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
          <div className="mt-1 flex items-center gap-2">
            {exercise && (
              <Badge variant="secondary" className="text-[10px]">
                {categoryNameJa(exercise.categoryId)}
              </Badge>
            )}
            {previousHint && (
              <span className="text-[11px] text-muted-foreground">{previousHint}</span>
            )}
          </div>
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
