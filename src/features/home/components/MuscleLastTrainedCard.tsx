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
      <CardContent className="space-y-2.5 p-4">
        <p className="text-xs font-semibold text-muted-foreground">
          部位別の最終トレーニング日
        </p>
        <div className="space-y-1.5">
          {EXERCISE_CATEGORIES.map((category) => {
            const date = lastByCategory.get(category.id);
            const elapsed = date ? elapsedLabel(date) : null;
            return (
              <div
                key={category.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="font-semibold">{category.nameJa}</span>
                {date && elapsed ? (
                  <span className="flex items-center gap-1.5 tabular-nums text-muted-foreground">
                    <span>{formatDateAxis(date)}</span>
                    <span
                      className={
                        elapsed.fresh
                          ? "rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
                          : "rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium"
                      }
                    >
                      {elapsed.text}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">記録なし</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
