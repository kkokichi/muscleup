import { Suspense } from "react";
import { ExerciseDetailFromQuery } from "@/features/exercises/components/ExerciseDetailFromQuery";

/**
 * 種目詳細。シード種目・カスタム種目の両方を扱うため、
 * 動的ルートではなくクエリパラメータ（?id=...）で受け取る（静的エクスポート対応）。
 */
export default function ExerciseDetailPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-card" />}>
      <ExerciseDetailFromQuery />
    </Suspense>
  );
}
