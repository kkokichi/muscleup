"use client";

import { Clock, Trophy } from "lucide-react";
import type { WorkoutLog } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExercises } from "@/hooks/useExercises";
import { calcLogVolume } from "@/services/statsService";
import { estimate1RM } from "@/services/oneRepMaxService";
import { categoryNameJa } from "@/data/categories";

/**
 * 1ワークアウトの全セットを読み取り専用で表示する。
 * 入力画面（ExerciseEntryCard）と揃えたカード + セット行レイアウトで見せる。
 */
export function WorkoutSetsDetail({ log }: { log: WorkoutLog }) {
  const { byId } = useExercises();

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
        {log.durationMinutes > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {log.durationMinutes}分
          </span>
        )}
        <span className="tabular-nums">
          総ボリューム {Math.round(calcLogVolume(log)).toLocaleString()}kg
        </span>
      </div>

      <div className="space-y-4">
        {log.entries.map((entry) => {
          const exercise = byId.get(entry.exerciseId);
          const best1rm = entry.sets.reduce(
            (max, set) => Math.max(max, estimate1RM(set.weightKg, set.reps)),
            0,
          );
          return (
            <Card key={entry.exerciseId} className="border-border bg-card">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <CardTitle className="text-base font-bold">
                    {exercise?.nameJa ?? entry.exerciseId}
                  </CardTitle>
                  {exercise && (
                    <Badge variant="secondary" className="text-[10px]">
                      {categoryNameJa(exercise.categoryId)}
                    </Badge>
                  )}
                  {best1rm > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary tabular-nums">
                      <Trophy className="size-3" />
                      推定1RM {Math.round(best1rm)}kg
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                <div className="flex items-center gap-2 px-1 text-[10px] font-medium text-muted-foreground">
                  <span className="w-4 shrink-0 text-center">#</span>
                  <span className="flex-1 text-center">重量kg</span>
                  <span className="flex-1 text-center">回数</span>
                  <span className="w-10 shrink-0 text-center">RPE</span>
                  <span className="w-14 shrink-0 text-right">推定1RM</span>
                </div>
                {entry.sets.map((set) => (
                  <div
                    key={set.setNumber}
                    className="flex items-center gap-2 rounded-xl bg-secondary/50 px-1 py-2 text-sm tabular-nums"
                  >
                    <span className="w-4 shrink-0 text-center text-xs font-bold text-muted-foreground">
                      {set.setNumber}
                    </span>
                    <span className="flex-1 text-center text-base font-bold">
                      {set.weightKg}
                    </span>
                    <span className="flex-1 text-center text-base font-bold">
                      {set.reps}
                    </span>
                    <span className="w-10 shrink-0 text-center text-muted-foreground">
                      {set.rpe ?? "-"}
                    </span>
                    <span className="w-14 shrink-0 text-right text-muted-foreground">
                      {estimate1RM(set.weightKg, set.reps)}kg
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {log.note && (
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="mb-1 text-[11px] font-medium text-muted-foreground">メモ</p>
              <p className="whitespace-pre-wrap text-sm">{log.note}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
