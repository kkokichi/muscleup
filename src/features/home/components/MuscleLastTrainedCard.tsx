"use client";

import { useMemo } from "react";
import type { Exercise, WorkoutLog } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { EXERCISE_CATEGORIES } from "@/data/categories";
import { diffDays, formatDateAxis, todayISO } from "@/utils/date";

interface MuscleLastTrainedCardProps {
  logs: WorkoutLog[];
  exerciseById: Map<string, Exercise>;
}

function elapsedLabel(date: string): { text: string; fresh: boolean } {
  const days = diffDays(todayISO(), date);
  if (days <= 0) return { text: "今日", fresh: true };
  if (days === 1) return { text: "昨日", fresh: true };
  return { text: `${days}日前`, fresh: days <= 3 };
}

/** 部位ごとに、最後にトレーニングした日を一覧表示する */
export function MuscleLastTrainedCard({
  logs,
  exerciseById,
}: MuscleLastTrainedCardProps) {
  // 部位（カテゴリ）ごとの最終トレーニング日（YYYY-MM-DD）
  const lastByCategory = useMemo(() => {
    const map = new Map<string, string>();
    for (const log of logs) {
      for (const entry of log.entries) {
        const cat = exerciseById.get(entry.exerciseId)?.categoryId;
        if (!cat) continue;
        const prev = map.get(cat);
        if (!prev || log.date > prev) map.set(cat, log.date);
      }
    }
    return map;
  }, [logs, exerciseById]);

  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-2 p-3">
        <p className="text-[11px] font-semibold text-muted-foreground">
          部位別の最終トレーニング日
        </p>
        <div className="flex flex-wrap gap-1.5">
          {EXERCISE_CATEGORIES.map((category) => {
            const date = lastByCategory.get(category.id);
            const elapsed = date ? elapsedLabel(date) : null;
            return (
              <span
                key={category.id}
                className={
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs tabular-nums " +
                  (elapsed?.fresh
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground")
                }
              >
                <span className="font-bold text-foreground">{category.nameJa}</span>
                {date && elapsed ? (
                  <span>
                    {formatDateAxis(date)}
                    <span className="ml-1 opacity-80">{elapsed.text}</span>
                  </span>
                ) : (
                  <span>—</span>
                )}
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
