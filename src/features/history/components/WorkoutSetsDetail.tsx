"use client";

import { Clock } from "lucide-react";
import type { WorkoutLog } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExercises } from "@/hooks/useExercises";
import { calcLogVolume } from "@/services/statsService";
import { estimate1RM } from "@/services/oneRepMaxService";
import { categoryNameJa } from "@/data/categories";

/** 1ワークアウトの全セットを読み取り専用で表示（種目ごとのテーブル + メモ） */
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

      <div className="space-y-3">
        {log.entries.map((entry) => {
          const exercise = byId.get(entry.exerciseId);
          return (
            <Card key={entry.exerciseId} className="border-border bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold">
                    {exercise?.nameJa ?? entry.exerciseId}
                  </CardTitle>
                  {exercise && (
                    <Badge variant="secondary" className="text-[10px]">
                      {categoryNameJa(exercise.categoryId)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] text-muted-foreground">
                      <th className="py-1 font-medium">セット</th>
                      <th className="py-1 font-medium">重量</th>
                      <th className="py-1 font-medium">回数</th>
                      <th className="py-1 font-medium">RPE</th>
                      <th className="py-1 text-right font-medium">推定1RM</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {entry.sets.map((set) => (
                      <tr key={set.setNumber} className="border-t border-border/50">
                        <td className="py-1.5">{set.setNumber}</td>
                        <td className="py-1.5 font-semibold">{set.weightKg}kg</td>
                        <td className="py-1.5">{set.reps}回</td>
                        <td className="py-1.5">{set.rpe ?? "-"}</td>
                        <td className="py-1.5 text-right text-muted-foreground">
                          {estimate1RM(set.weightKg, set.reps)}kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
