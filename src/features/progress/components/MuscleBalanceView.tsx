"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/common/FadeIn";
import type { MuscleCategoryId, WorkoutLog } from "@/types";
import { useExercises } from "@/hooks/useExercises";
import {
  calcCategoryVolume,
  calcMuscleHeat,
} from "@/services/muscleStatsService";
import { EXERCISE_CATEGORIES } from "@/data/categories";
import { daysAgoISO } from "@/utils/date";
import { cn } from "@/lib/utils";
import { BodyHeatmap } from "./BodyHeatmap";

const RANGES = [
  { days: 7, label: "1週間" },
  { days: 30, label: "1ヶ月" },
] as const;

/** 部位別の週次/月次ボリューム分析＋筋肉ヒートマップ */
export function MuscleBalanceView({ logs }: { logs: WorkoutLog[] }) {
  const { byId } = useExercises();
  const [days, setDays] = useState<number>(7);

  const since = useMemo(() => daysAgoISO(days - 1), [days]);

  const categoryVolume = useMemo(
    () => calcCategoryVolume(logs, byId, since),
    [logs, byId, since],
  );
  const heat = useMemo(
    () => calcMuscleHeat(logs, byId, since),
    [logs, byId, since],
  );

  const maxSets = Math.max(
    1,
    ...EXERCISE_CATEGORIES.map((c) => categoryVolume.get(c.id)?.sets ?? 0),
  );
  const totalSets = EXERCISE_CATEGORIES.reduce(
    (sum, c) => sum + (categoryVolume.get(c.id)?.sets ?? 0),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-full bg-secondary p-1">
        {RANGES.map((r) => (
          <button
            key={r.days}
            type="button"
            onClick={() => setDays(r.days)}
            className={cn(
              "flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors",
              days === r.days
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {totalSets === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            この期間の記録がありません
          </CardContent>
        </Card>
      ) : (
        <>
          <FadeIn>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="mb-3 text-sm font-semibold">刺激ヒートマップ</p>
                <BodyHeatmap heat={heat} />
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.05}>
            <Card className="border-border bg-card">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold">部位別ボリューム</p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    計 {totalSets} セット
                  </p>
                </div>
                {EXERCISE_CATEGORIES.map((cat: { id: MuscleCategoryId; nameJa: string }) => {
                  const stat = categoryVolume.get(cat.id);
                  const sets = stat?.sets ?? 0;
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <span className="w-10 shrink-0 text-xs font-medium">
                        {cat.nameJa}
                      </span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(sets / maxSets) * 100}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums">
                        {sets}セット
                      </span>
                    </div>
                  );
                })}
                <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
                  バーが極端に短い部位は鍛え不足のサイン。バランスよく回すと
                  ケガ予防と全身の成長につながります。
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </>
      )}
    </div>
  );
}
