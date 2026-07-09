import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Exercise, WorkoutLog } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { calcLogSetCount, calcLogVolume } from "@/services/statsService";
import { formatDateJa } from "@/utils/date";

interface RecentWorkoutsListProps {
  logs: WorkoutLog[];
  exerciseById: Map<string, Exercise>;
}

/** 最近の記録（直近3件）。詳細と履歴一覧への導線 */
export function RecentWorkoutsList({ logs, exerciseById }: RecentWorkoutsListProps) {
  if (logs.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">最近の記録</h2>
        <Link
          href="/history"
          className="flex items-center text-xs font-medium text-primary"
        >
          すべて見る
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
      <div className="space-y-2">
        {logs.map((log) => {
          const names = log.entries
            .map((e) => exerciseById.get(e.exerciseId)?.nameJa ?? "")
            .filter(Boolean)
            .slice(0, 3)
            .join("・");
          return (
            <Link key={log.id} href={`/history/detail?id=${log.id}`} className="block">
              <Card className="border-border bg-card transition-colors active:bg-secondary/50">
                <CardContent className="flex items-center justify-between p-3.5">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {formatDateJa(log.date)}
                    </p>
                    <p className="truncate text-sm font-semibold">{names}</p>
                  </div>
                  <p className="ml-3 shrink-0 text-right text-[11px] leading-tight text-muted-foreground">
                    {calcLogSetCount(log)}セット
                    <br />
                    <span className="tabular-nums">
                      {Math.round(calcLogVolume(log)).toLocaleString()}kg
                    </span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
