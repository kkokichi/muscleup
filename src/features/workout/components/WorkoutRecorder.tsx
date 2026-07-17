"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Clock, Plus } from "lucide-react";
import type { ExerciseRecord, WorkoutEntry, WorkoutLog } from "@/types";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/common/FadeIn";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useExercises } from "@/hooks/useExercises";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useRecords } from "@/hooks/useRecords";
import { useWorkoutDraftStore } from "@/stores/workoutDraftStore";
import { calcCategoryLastTrained } from "@/services/statsService";
import {
  formatDateJa,
  formatElapsed,
  formatTimeJa,
  isoToLocalDate,
  todayISO,
} from "@/utils/date";
import { useAutoSaveWorkout } from "../hooks/useAutoSaveWorkout";
import { ExerciseEntryCard } from "./ExerciseEntryCard";
import { ExercisePickerSheet } from "./ExercisePickerSheet";
import { RestTimerBar } from "./RestTimerBar";

/** 直近ログから種目の前回セッション（日付+全セット）を引く */
function lastSessionFor(
  logs: WorkoutLog[],
  exerciseId: string,
): { date: string; entry: WorkoutEntry } | null {
  for (const log of logs) {
    const entry = log.entries.find((e) => e.exerciseId === exerciseId);
    if (entry && entry.sets.length > 0) return { date: log.date, entry };
  }
  return null;
}

export function WorkoutRecorder() {
  const mounted = useHasMounted();
  const {
    draft,
    startWorkout,
    ensureActiveLogId,
    resumeFromLog,
    addExercise,
    setNote,
    setDate,
    clear,
  } = useWorkoutDraftStore();
  const { exercises, byId, reload: reloadExercises } = useExercises();
  const { logs, isLoading: logsLoading } = useWorkoutLogs();
  const { records } = useRecords();
  // 自動保存（終了ボタンは廃止し、編集のたびにバックグラウンドで保存する）
  const { saveNow } = useAutoSaveWorkout(draft);
  const [pickerOpen, setPickerOpen] = useState(false);
  const hydratedRef = useRef(false);

  // 画面を離れるときに最新状態を確実に保存する（デバウンス保存の取りこぼし防止）
  const saveNowRef = useRef(saveNow);
  useEffect(() => {
    saveNowRef.current = saveNow;
  }, [saveNow]);
  useEffect(() => {
    return () => {
      void saveNowRef.current();
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const existing = useWorkoutDraftStore.getState().draft;
    if (!existing) {
      startWorkout();
      return;
    }
    // その日のうちに触れた下書きは継続する。日付が変わっていれば、前日分は
    // 自動保存済みなので、今日の新しい下書きを開始する（＝終了ボタンの代替）。
    const lastActiveDay = isoToLocalDate(existing.lastInputAt ?? existing.startedAt);
    if (lastActiveDay !== todayISO()) {
      clear();
      startWorkout();
    } else {
      ensureActiveLogId();
    }
  }, [mounted, startWorkout, ensureActiveLogId, clear]);

  // 終了後に再度開いたとき、その日の保存済みワークアウトを読み込んで続きを編集できるようにする。
  // 入力中の下書き（種目が既にある状態）は上書きしない。
  useEffect(() => {
    if (!mounted || logsLoading || hydratedRef.current) return;
    const current = useWorkoutDraftStore.getState().draft;
    if (!current || current.entries.length > 0) return;
    const savedToday = logs.find((log) => log.date === current.date);
    if (savedToday) {
      hydratedRef.current = true;
      resumeFromLog(savedToday);
    }
  }, [mounted, logsLoading, logs, resumeFromLog]);

  const recordByExercise = useMemo(() => {
    const map = new Map<string, ExerciseRecord>();
    for (const record of records) map.set(record.exerciseId, record);
    return map;
  }, [records]);

  const recentIds = useMemo(() => {
    const ids: string[] = [];
    for (const log of logs) {
      for (const entry of log.entries) {
        if (!ids.includes(entry.exerciseId)) ids.push(entry.exerciseId);
      }
    }
    return ids;
  }, [logs]);

  // 部位（カテゴリ）ごとの「何日何時間前」ラベル
  const categoryElapsed = useMemo(() => {
    const lastTrained = calcCategoryLastTrained(
      logs,
      (id) => byId.get(id)?.categoryId,
    );
    const result: Record<string, string> = {};
    for (const [cat, iso] of lastTrained) result[cat] = formatElapsed(iso);
    return result;
  }, [logs, byId]);

  if (!mounted || !draft) return null;

  const handleSelectExercise = (exerciseId: string) => {
    // 新規追加時は前回の値を引き継がず、空のセット1つから始める
    addExercise(exerciseId);
    setPickerOpen(false);
  };

  return (
    <div>
      <PageHeader title="ワークアウト" subtitle={formatDateJa(draft.date)} />

      <label className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-secondary px-3 py-2.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <CalendarDays className="size-4 text-primary" />
          記録する日
        </span>
        <input
          type="date"
          value={draft.date}
          max={todayISO()}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          aria-label="ワークアウトの日付"
          className="bg-transparent text-sm font-semibold tabular-nums outline-none"
        />
      </label>
      {draft.date !== todayISO() && (
        <p className="mb-3 -mt-1 text-[11px] font-medium text-primary">
          過去の記録として保存されます（{formatDateJa(draft.date)}）
        </p>
      )}

      {/* レストタイマーはスクロールしても常に見えるよう上部に固定する */}
      <div className="sticky top-[env(safe-area-inset-top)] z-30 -mx-4 mb-4 flex items-center justify-between gap-2 border-b border-border/60 bg-background/85 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {draft.firstInputAt ? (
            <span className="tabular-nums">{formatTimeJa(draft.firstInputAt)}〜</span>
          ) : (
            <span>まだ入力なし</span>
          )}
        </div>
        <RestTimerBar />
      </div>

      <div className="space-y-4">
        {draft.entries.map((entry, i) => (
          <FadeIn key={entry.exerciseId} delay={i * 0.05}>
            <ExerciseEntryCard
              entry={entry}
              exercise={byId.get(entry.exerciseId)}
              previous={lastSessionFor(logs, entry.exerciseId)}
              record={recordByExercise.get(entry.exerciseId) ?? null}
            />
          </FadeIn>
        ))}

        {draft.entries.length === 0 && (
          <Button
            variant="outline"
            size="lg"
            className="w-full border-dashed"
            onClick={() => setPickerOpen(true)}
          >
            <Plus className="size-4" data-icon="inline-start" />
            種目を追加
          </Button>
        )}

        <textarea
          value={draft.note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="メモ（体調・フォームの気づきなど）"
          rows={3}
          className="w-full resize-none rounded-2xl border border-border bg-card p-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[88px] z-30 mx-auto max-w-md px-4">
        <Button
          size="lg"
          className="pointer-events-auto w-full shadow-[0_18px_40px_rgba(0,0,0,0.25)]"
          onClick={() => setPickerOpen(true)}
        >
          <Plus className="size-4" data-icon="inline-start" />
          種目を追加
        </Button>
      </div>

      <ExercisePickerSheet
        open={pickerOpen}
        exercises={exercises}
        recentIds={recentIds}
        excludeIds={draft.entries.map((e) => e.exerciseId)}
        categoryElapsed={categoryElapsed}
        onSelect={(e) => handleSelectExercise(e.id)}
        onCustomExerciseCreated={async () => {
          await reloadExercises();
        }}
        onClose={() => setPickerOpen(false)}
      />

    </div>
  );
}
