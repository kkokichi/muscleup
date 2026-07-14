"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/common/FadeIn";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useRecords } from "@/hooks/useRecords";
import { useExercises } from "@/hooks/useExercises";
import {
  buildProgressSeries,
  calcMonthlyGrowth,
} from "@/services/statsService";
import { EXERCISE_CATEGORIES } from "@/data/categories";
import { Mascot } from "@/features/mascot/components/Mascot";
import { cn } from "@/lib/utils";
import { WeightChart } from "./WeightChart";
import { StatSummaryRow } from "./StatSummaryRow";
import { MuscleBalanceView } from "./MuscleBalanceView";

type ProgressMode = "exercise" | "muscle";

export function ProgressView() {
  const mounted = useHasMounted();
  const { logs, isLoading } = useWorkoutLogs();
  const { records } = useRecords();
  const { byId } = useExercises();
  const [mode, setMode] = useState<ProgressMode>("exercise");
  const [userSelectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userSelectedId, setSelectedId] = useState<string | null>(null);

  /** 記録のある種目のみ（最近やった順） */
  const trainedIds = useMemo(() => {
    const ids: string[] = [];
    for (const log of logs) {
      for (const entry of log.entries) {
        if (!ids.includes(entry.exerciseId)) ids.push(entry.exerciseId);
      }
    }
    return ids;
  }, [logs]);

  /** 記録のある部位のみ（カテゴリ定義順） */
  const trainedCategories = useMemo(() => {
    const present = new Set<string>();
    for (const id of trainedIds) {
      const cat = byId.get(id)?.categoryId;
      if (cat) present.add(cat);
    }
    return EXERCISE_CATEGORIES.filter((c) => present.has(c.id)).map((c) => c.id);
  }, [trainedIds, byId]);

  // 未選択時は最初の部位を自動選択（導出値）
  const selectedCategory = userSelectedCategory ?? trainedCategories[0] ?? null;

  /** 選択中の部位に属する、記録のある種目 */
  const exercisesInCategory = useMemo(
    () => trainedIds.filter((id) => byId.get(id)?.categoryId === selectedCategory),
    [trainedIds, byId, selectedCategory],
  );

  // 選択中の種目が部位内に無ければ、その部位の先頭を選ぶ（導出値）
  const selectedId =
    userSelectedId && exercisesInCategory.includes(userSelectedId)
      ? userSelectedId
      : (exercisesInCategory[0] ?? null);

  const series = useMemo(
    () => (selectedId ? buildProgressSeries(logs, selectedId) : []),
    [logs, selectedId],
  );
  const record = records.find((r) => r.exerciseId === selectedId) ?? null;
  const monthlyGrowth = useMemo(() => calcMonthlyGrowth(series), [series]);

  if (!mounted || isLoading) {
    return (
      <div>
        <PageHeader title="進捗" subtitle="成長の記録" />
        <div className="h-64 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  if (trainedIds.length === 0) {
    return (
      <div>
        <PageHeader title="進捗" subtitle="成長の記録" />
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Mascot mood="happy" size={96} />
            <p className="text-sm font-semibold">まだ記録がないッス</p>
            <p className="text-xs text-muted-foreground">
              ワークアウトを記録すると、ここに成長グラフが表示されます
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="進捗" subtitle="成長の記録" />

      <div className="mb-5 flex gap-1 rounded-full bg-secondary p-1">
        {(
          [
            ["exercise", "種目別"],
            ["muscle", "部位別"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={cn(
              "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
              mode === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "muscle" ? (
        <MuscleBalanceView logs={logs} />
      ) : (
        <>
          {/* 部位で絞り込み → その部位の種目を選ぶ */}
          <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
            {trainedCategories.map((catId) => {
              const category = EXERCISE_CATEGORIES.find((c) => c.id === catId);
              return (
                <button
                  key={catId}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(catId);
                    setSelectedId(null);
                  }}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                    catId === selectedCategory
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {category?.nameJa ?? catId}
                </button>
              );
            })}
          </div>

          <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
            {exercisesInCategory.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedId(id)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  id === selectedId
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground",
                )}
              >
                {byId.get(id)?.nameJa ?? id}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <FadeIn>
              <StatSummaryRow record={record} monthlyGrowth={monthlyGrowth} />
            </FadeIn>
            <FadeIn delay={0.05}>
              <Card className="border-border bg-card">
                <CardContent className="p-3 pt-4">
                  {series.length >= 2 ? (
                    <WeightChart series={series} />
                  ) : (
                    <p className="py-16 text-center text-xs text-muted-foreground">
                      グラフ表示には2回以上の記録が必要です
                    </p>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </>
      )}
    </div>
  );
}
