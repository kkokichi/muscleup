import { Suspense } from "react";
import { ExerciseList } from "@/features/exercises/components/ExerciseList";

/**
 * 種目辞典。部位フィルタ（?category=...）はクライアント側で
 * useSearchParams から読み取る（静的エクスポート対応）。
 */
export default function ExercisesPage() {
  return (
    <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-card" />}>
      <ExerciseList />
    </Suspense>
  );
}
