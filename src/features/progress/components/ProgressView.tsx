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
import { Mascot } from "@/features/mascot/components/Mascot";
import { cn } from "@/lib/utils";
import { WeightChart } from "./WeightChart";
import { StatSummaryRow } from "./StatSummaryRow";

export function ProgressView() {
  const mounted = useHasMounted();
  const { logs, isLoading } = useWorkoutLogs();
  const { records } = useRecords();
  const { byId } = useExercises();
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

  // 未選択時は最新の種目を自動選択（状態ではなく導出値として扱う）
  const selectedId = userSelectedId ?? trainedIds[0] ?? null;

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

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {trainedIds.map((id) => (
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
    </div>
  );
}
