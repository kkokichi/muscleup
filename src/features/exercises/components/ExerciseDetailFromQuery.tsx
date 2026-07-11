"use client";

import { useSearchParams } from "next/navigation";
import { ExerciseDetail } from "./ExerciseDetail";

/** クエリパラメータ ?id=... から種目IDを読み取って詳細を表示する（静的エクスポート対応） */
export function ExerciseDetailFromQuery() {
  const id = useSearchParams().get("id");

  if (!id) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        種目が見つかりませんでした
      </p>
    );
  }
  return <ExerciseDetail exerciseId={id} />;
}
