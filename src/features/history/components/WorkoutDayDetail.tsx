"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import type { WorkoutLog } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { getRepos } from "@/repositories";
import { formatDateJa } from "@/utils/date";
import { Mascot } from "@/features/mascot/components/Mascot";
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
 * 日付を指定して、その日の全ワークアウトを入力画面と同じレイアウトで表示する。
 * 左右の矢印・スワイプで、記録のある前後の日付へ移動できる。
 */
export function WorkoutDayDetail({ date }: { date: string }) {
  const router = useRouter();
  const [allLogs, setAllLogs] = useState<WorkoutLog[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.workoutLogs.getAll())
      .then((all) => {
        if (!cancelled) setAllLogs(all);
      })
      .catch(() => {
        if (!cancelled) setAllLogs([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 記録のある日付を新しい順に並べ、現在日の前後（過去・未来）を求める
  const { dayLogs, prevDate, nextDate } = useMemo(() => {
    const logs = allLogs ?? [];
    const dates = Array.from(new Set(logs.map((l) => l.date))).sort((a, b) =>
      a < b ? 1 : a > b ? -1 : 0,
    );
    const index = dates.indexOf(date);
    return {
      dayLogs: logs.filter((l) => l.date === date),
      // 配列は新しい順。過去日=indexの次、未来日=indexの前
      prevDate: index >= 0 ? (dates[index + 1] ?? null) : null,
      nextDate: index > 0 ? dates[index - 1] : null,
    };
  }, [allLogs, date]);

  const goToDate = (target: string | null) => {
    if (target) router.push(`/history/detail?date=${target}`);
  };

  const nav = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="前の記録へ"
        disabled={!prevDate}
        onClick={() => goToDate(prevDate)}
        className="flex size-9 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors active:bg-secondary disabled:opacity-30"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="次の記録へ"
        disabled={!nextDate}
        onClick={() => goToDate(nextDate)}
        className="flex size-9 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors active:bg-secondary disabled:opacity-30"
      >
        <ChevronRight className="size-5" />
      </button>
      {backAction}
    </div>
  );

  if (allLogs === null) {
    return (
      <div>
        <PageHeader title={formatDateJa(date)} subtitle="この日の記録" action={backAction} />
        <div className="h-40 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={formatDateJa(date)}
        subtitle={dayLogs.length > 1 ? `${dayLogs.length}件のワークアウト` : "この日の記録"}
        action={nav}
      />

      <motion.div
        key={date}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (info.offset.x > 80) goToDate(prevDate);
          else if (info.offset.x < -80) goToDate(nextDate);
        }}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="touch-pan-y"
      >
        {dayLogs.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <Mascot mood="happy" size={88} />
              <p className="text-sm font-semibold">この日の記録はないッス</p>
              <p className="text-xs text-muted-foreground">
                左右にスワイプで、記録のある日へ移動できるッス
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {dayLogs.map((log, i) => (
              <div key={log.id}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold">
                    {dayLogs.length > 1 ? `セッション ${i + 1}` : "ワークアウト詳細"}
                  </p>
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
        )}
      </motion.div>
    </div>
  );
}
