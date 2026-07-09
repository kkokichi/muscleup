"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Trash2 } from "lucide-react";
import type { WorkoutLog } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { getRepos } from "@/repositories";
import { useExercises } from "@/hooks/useExercises";
import { calcLogVolume } from "@/services/statsService";
import { estimate1RM } from "@/services/oneRepMaxService";
import { categoryNameJa } from "@/data/categories";
import { formatDateJa } from "@/utils/date";

export function WorkoutDetail({ logId }: { logId: string }) {
  const router = useRouter();
  const { byId } = useExercises();
  const [log, setLog] = useState<WorkoutLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.workoutLogs.getById(logId))
      .then((l) => {
        if (!cancelled) setLog(l);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [logId]);

  const handleDelete = async () => {
    const repos = await getRepos();
    await repos.workoutLogs.delete(logId);
    router.push("/history");
  };

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-card" />;
  }
  if (!log) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        記録が見つかりませんでした
      </p>
    );
  }

  return (
    <div>
      <PageHeader
        title={formatDateJa(log.date)}
        subtitle="ワークアウト詳細"
        action={
          confirming ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
                やめる
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                削除する
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label="この記録を削除"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          )
        }
      />

      <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
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
