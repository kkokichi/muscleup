import { Suspense } from "react";
import { WorkoutDetailFromQuery } from "@/features/history/components/WorkoutDetailFromQuery";

/**
 * 履歴詳細。ログIDはユーザーデータ由来で静的生成できないため、
 * 動的ルートではなくクエリパラメータ（?id=...）で受け取る（静的エクスポート対応）。
 */
export default function HistoryDetailPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-card" />}>
      <WorkoutDetailFromQuery />
    </Suspense>
  );
}
