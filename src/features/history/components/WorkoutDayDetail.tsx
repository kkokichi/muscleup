"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import type { WorkoutLog } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { getRepos } from "@/repositories";
import { formatDateJa } from "@/utils/date";
import { Mascot } from "@/features/mascot/components/Mascot";
import { WorkoutDetail } from "./WorkoutDetail";
import { WorkoutSetsDetail } from "./WorkoutSetsDetail";

const backAction = (
  <Link
    href="/"
    aria-label="ホームへ戻る"
    className="flex size-9 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors active:bg-secondary"
  >
    <ArrowLeft className="size-5" />
  </Link>
);

/**
 * 日付を指定して、その日の全ワークアウトを全セット付きで表示する。
 * 1件なら通常の詳細（編集・削除つき）、複数件なら各セッションを並べて表示。
 */
export function WorkoutDayDetail({ date }: { date: string }) {
  const [logs, setLogs] = useState<WorkoutLog[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.workoutLogs.getAll())
      .then((all) => {
        if (!cancelled) setLogs(all.filter((l) => l.date === date));
      })
      .catch(() => {
        if (!cancelled) setLogs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  if (logs === null) {
    return (
      <div>
        <PageHeader title={formatDateJa(date)} subtitle="この日の記録" action={backAction} />
        <div className="h-40 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div>
        <PageHeader title={formatDateJa(date)} subtitle="この日の記録" action={backAction} />
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Mascot mood="happy" size={88} />
            <p className="text-sm font-semibold">この日の記録はないッス</p>
            <p className="text-xs text-muted-foreground">
              別の日を選ぶか、今日のワークアウトを記録しよう！
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 1件だけなら編集・削除つきの通常詳細をそのまま使う
  if (logs.length === 1) {
    return <WorkoutDetail logId={logs[0].id} />;
  }

  // 複数セッションはまとめて全セット表示（各セッションに編集リンク）
  return (
    <div>
      <PageHeader
        title={formatDateJa(date)}
        subtitle={`${logs.length}件のワークアウト`}
        action={backAction}
      />
      <div className="space-y-6">
        {logs.map((log, i) => (
          <div key={log.id}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold">セッション {i + 1}</p>
              <Link
                href={`/history/detail?id=${log.id}`}
                className="flex items-center gap-1 text-xs font-semibold text-primary"
              >
                <Pencil className="size-3.5" />
                編集・削除
              </Link>
            </div>
            <WorkoutSetsDetail log={log} />
          </div>
        ))}
      </div>
    </div>
  );
}
