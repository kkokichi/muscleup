"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrendingUp, X } from "lucide-react";
import type { WorkoutEntry } from "@/types";
import { estimate1RM } from "@/services/oneRepMaxService";
import { formatDateJa, formatDateShort } from "@/utils/date";

export interface ExerciseSession {
  /** YYYY-MM-DD */
  date: string;
  entry: WorkoutEntry;
}

interface ExerciseHistorySheetProps {
  open: boolean;
  exerciseName: string;
  /** 新しい順のセッション一覧 */
  sessions: ExerciseSession[];
  onClose: () => void;
}

function sessionVolume(entry: WorkoutEntry): number {
  return entry.sets.reduce((sum, set) => sum + set.weightKg * set.reps, 0);
}

function sessionBest1rm(entry: WorkoutEntry): number {
  return entry.sets.reduce(
    (max, set) => Math.max(max, estimate1RM(set.weightKg, set.reps)),
    0,
  );
}

/**
 * 1種目のセット履歴（過去の全セッション・全セット）を読み取り専用で表示するボトムシート。
 * 記録画面から「この種目の前回より上げられているか」をその場で確認するためのもの。
 */
export function ExerciseHistorySheet({
  open,
  exerciseName,
  sessions,
  onClose,
}: ExerciseHistorySheetProps) {
  const summary = useMemo(() => {
    let maxWeight = 0;
    let best1rm = 0;
    let totalSets = 0;
    for (const { entry } of sessions) {
      totalSets += entry.sets.length;
      for (const set of entry.sets) {
        maxWeight = Math.max(maxWeight, set.weightKg);
        best1rm = Math.max(best1rm, estimate1RM(set.weightKg, set.reps));
      }
    }
    return { maxWeight, best1rm, totalSets };
  }, [sessions]);

  return (
    <AnimatePresence>
      {/* AnimatePresence直下はFragment不可（アンマウントされなくなる）。keyed siblingsにする */}
      {open && (
        <motion.div
          key="history-overlay"
          className="fixed inset-0 z-40 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {open && (
        <motion.div
          key="history-sheet"
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[80dvh] max-w-md flex-col rounded-t-3xl border-t border-border bg-popover"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
        >
          <div className="flex items-start justify-between gap-2 px-5 pb-2 pt-4">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold">{exerciseName}</h2>
              <p className="text-[11px] text-muted-foreground">
                セット履歴（{sessions.length}回・{summary.totalSets}セット）
              </p>
            </div>
            <button
              type="button"
              aria-label="閉じる"
              onClick={onClose}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>

          {summary.maxWeight > 0 && (
            <div className="mx-5 mb-3 flex items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2 text-xs tabular-nums">
              <TrendingUp className="size-4 shrink-0 text-primary" />
              <span>
                最高重量{" "}
                <b className="text-sm">{summary.maxWeight}</b>kg
              </span>
              <span className="text-muted-foreground">
                推定1RM {Math.round(summary.best1rm)}kg
              </span>
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-10">
            {sessions.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                この種目の記録はまだありません
              </p>
            ) : (
              sessions.map(({ date, entry }) => (
                <div
                  key={date}
                  className="rounded-2xl border border-border bg-card p-3"
                >
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <p className="text-sm font-bold">
                      {formatDateJa(date)}
                      <span className="ml-1.5 text-[10px] font-medium text-muted-foreground">
                        {formatDateShort(date)}
                      </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {entry.sets.length}セット ·{" "}
                      {Math.round(sessionVolume(entry)).toLocaleString()}kg
                    </p>
                  </div>

                  <div className="flex items-center gap-2 px-1 text-[10px] font-medium text-muted-foreground">
                    <span className="w-4 shrink-0 text-center">#</span>
                    <span className="flex-1 text-center">重量kg</span>
                    <span className="flex-1 text-center">回数</span>
                    <span className="w-10 shrink-0 text-center">RPE</span>
                    <span className="w-14 shrink-0 text-right">推定1RM</span>
                  </div>
                  <div className="space-y-1">
                    {entry.sets.map((set) => (
                      <div
                        key={set.setNumber}
                        className="flex items-center gap-2 rounded-xl bg-secondary/50 px-1 py-1.5 text-sm tabular-nums"
                      >
                        <span className="w-4 shrink-0 text-center text-xs font-bold text-muted-foreground">
                          {set.setNumber}
                        </span>
                        <span className="flex-1 text-center font-bold">
                          {set.weightKg}
                        </span>
                        <span className="flex-1 text-center font-bold">
                          {set.reps}
                        </span>
                        <span className="w-10 shrink-0 text-center text-xs text-muted-foreground">
                          {set.rpe ?? "-"}
                        </span>
                        <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">
                          {estimate1RM(set.weightKg, set.reps)}kg
                        </span>
                      </div>
                    ))}
                  </div>

                  {sessionBest1rm(entry) > 0 &&
                    Math.round(sessionBest1rm(entry)) ===
                      Math.round(summary.best1rm) && (
                      <p className="mt-1.5 text-[10px] font-semibold text-primary">
                        自己ベスト更新日
                      </p>
                    )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
