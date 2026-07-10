"use client";

import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useExercises } from "@/hooks/useExercises";
import {
  calcLogSetCount,
  calcLogVolume,
  calcLongestStreak,
  calcStreak,
} from "@/services/statsService";
import { formatDateJa } from "@/utils/date";
import { Mascot } from "@/features/mascot/components/Mascot";
import { TrainingHeatmap } from "@/features/calendar/components/TrainingHeatmap";

export function HistoryList() {
  const mounted = useHasMounted();
  const { logs, isLoading } = useWorkoutLogs();
  const { byId } = useExercises();

  if (!mounted || isLoading) {
    return (
      <div>
        <PageHeader title="履歴" subtitle="トレーニングの記録" />
        <div className="h-24 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="履歴" subtitle="トレーニングの記録" />

      {logs.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Mascot mood="happy" size={96} />
            <p className="text-sm font-semibold">まだ記録がないッス</p>
            <p className="text-xs text-muted-foreground">
              最初のワークアウトを記録してみよう！
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-4 border-border bg-card">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">トレーニングカレンダー</p>
                <p className="text-[11px] text-muted-foreground">
                  現在
                  <span className="mx-1 font-bold text-primary tabular-nums">
                    {calcStreak(logs)}
                  </span>
                  日連続 · 最長
                  <span className="mx-1 font-bold text-foreground tabular-nums">
                    {calcLongestStreak(logs)}
                  </span>
                  日
                </p>
              </div>
              <TrainingHeatmap logs={logs} />
            </CardContent>
          </Card>

          <div className="space-y-2">
          {logs.map((log) => {
            const names = log.entries
              .map((e) => byId.get(e.exerciseId)?.nameJa ?? "")
              .filter(Boolean)
              .join("・");
            return (
              <Link
                key={log.id}
                href={`/history/detail?id=${log.id}`}
                className="block"
              >
                <Card className="border-border bg-card transition-colors active:bg-secondary/50">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {formatDateJa(log.date)}
                      </p>
                      <p className="truncate text-sm font-semibold">{names}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="tabular-nums">
                          {calcLogSetCount(log)}セット ·{" "}
                          {Math.round(calcLogVolume(log)).toLocaleString()}kg
                        </span>
                        {log.durationMinutes > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="size-3" />
                            {log.durationMinutes}分
                          </span>
                        )}
                      </p>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
}
