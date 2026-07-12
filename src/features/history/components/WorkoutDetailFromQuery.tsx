"use client";

import { useSearchParams } from "next/navigation";
import { WorkoutDetail } from "./WorkoutDetail";
import { WorkoutDayDetail } from "./WorkoutDayDetail";

/**
 * クエリパラメータから詳細を表示する。
 * ?id=... → 単一ワークアウトの詳細、?date=YYYY-MM-DD → その日の全ワークアウト詳細。
 */
export function WorkoutDetailFromQuery() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const date = searchParams.get("date");

  if (id) return <WorkoutDetail logId={id} />;
  if (date) return <WorkoutDayDetail date={date} />;

  return (
    <p className="py-16 text-center text-sm text-muted-foreground">
      記録が見つかりませんでした
    </p>
  );
}
