"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useExercises } from "@/hooks/useExercises";
import { calcLogSetCount, calcLogVolume } from "@/services/statsService";
import { formatDateJa } from "@/utils/date";
import { Mascot } from "@/features/mascot/components/Mascot";

export function HistoryList() {
  const mounted = useHasMounted();
  const searchParams = useSearchParams();
  const { logs, isLoading } = useWorkoutLogs();
  const { byId } = useExercises();
  const selectedDate = searchParams.get("date");
  const shownLogs = selectedDate
    ? logs.filter((log) => log.date === selectedDate)
    : logs;

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
      <PageHeader
        title="履歴"
        subtitle={selectedDate ? `${formatDateJa(selectedDate)}の記録` : "トレーニングの記録"}
        action={
          selectedDate ? (
            <Link
              href="/history"
              className="rounded-full bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors active:bg-secondary"
            >
              全件
            </Link>
          ) : undefined
        }
      />

      {shownLogs.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Mascot mood="happy" size={96} />
            <p className="text-sm font-semibold">
              {selectedDate ? "この日の記録はないッス" : "まだ記録がないッス"}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedDate
                ? "別の日を選ぶか、今日のワークアウトを記録しよう！"
                : "最初のワークアウトを記録してみよう！"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
          {shownLogs.map((log) => {
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
