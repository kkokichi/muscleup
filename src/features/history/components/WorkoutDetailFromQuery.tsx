"use client";

import { useSearchParams } from "next/navigation";
import { WorkoutDetail } from "./WorkoutDetail";

/** クエリパラメータ ?id=... からログIDを読み取って詳細を表示する */
export function WorkoutDetailFromQuery() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        記録が見つかりませんでした
      </p>
    );
  }
  return <WorkoutDetail logId={id} />;
}
