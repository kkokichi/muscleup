"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, CloudOff, Loader2, MapPin, Plus } from "lucide-react";
import type { CheckinDraft, DraftSet, WorkoutEntry, WorkoutLog } from "@/types";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/common/FadeIn";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useExercises } from "@/hooks/useExercises";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useUserName } from "@/hooks/useUserName";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useWorkoutDraftStore } from "@/stores/workoutDraftStore";
import { useMascotStore } from "@/stores/mascotStore";
import { calcCategoryLastTrained } from "@/services/statsService";
import { formatDateJa, formatElapsed, minutesSince } from "@/utils/date";
import { useCheckins } from "@/features/checkin/hooks/useCheckins";
import { CheckinComposer } from "@/features/checkin/components/CheckinComposer";
import type { AutoSaveStatus } from "../hooks/useAutoSaveWorkout";
import { useAutoSaveWorkout } from "../hooks/useAutoSaveWorkout";
import { ExerciseEntryCard } from "./ExerciseEntryCard";
import { ExercisePickerSheet } from "./ExercisePickerSheet";
import { RestTimerBar } from "./RestTimerBar";
import { WorkoutTemplatePanel } from "./WorkoutTemplatePanel";

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

function SaveStatusPill({
  status,
  lastSavedAt,
}: {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
}) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        保存中…
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
        保存に失敗
      </span>
    );
  }

  if (status === "offline") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
        <CloudOff className="size-3.5" />
        オフライン保存済み
      </span>
    );
  }

  if (status === "saved") {
    const savedAt = lastSavedAt
      ? ` ${lastSavedAt.toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : "";
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
        <CheckCircle2 className="size-3.5" />
        保存済み{savedAt}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
      入力待ち
    </span>
  );
}

export function WorkoutRecorder() {
  const mounted = useHasMounted();
  const router = useRouter();
  const { draft, startWorkout, ensureActiveLogId, addExercise, setNote, clear } =
    useWorkoutDraftStore();
  const { exercises, byId } = useExercises();
  const { logs } = useWorkoutLogs();
  const { status: saveStatus, lastSavedAt, saveNow } = useAutoSaveWorkout(draft);
  const { name, saveName } = useUserName();
  const { addCheckin } = useCheckins();
  const { user } = useAuthUser();
  const speak = useMascotStore((s) => s.speak);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  // 経過時間は描画のたびに算出し、インターバルで再描画だけを促す
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!mounted) return;
    if (!useWorkoutDraftStore.getState().draft) startWorkout();
    else ensureActiveLogId();
  }, [mounted, startWorkout, ensureActiveLogId]);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(timer);
  }, []);

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

  const elapsed = minutesSince(draft.startedAt);

  const handleSelectExercise = (exerciseId: string) => {
    const prev = lastSessionFor(logs, exerciseId);
    const presetSets: DraftSet[] | undefined = prev?.entry.sets.map((s) => ({
      weightKg: s.weightKg,
      reps: s.reps,
      isDone: false,
    }));
    addExercise(exerciseId, presetSets);
    setPickerOpen(false);
  };

  const handleFinish = async () => {
    await saveNow();
    clear();
    router.push("/");
  };

  return (
    <div>
      <PageHeader
        title="ワークアウト"
        subtitle={formatDateJa(draft.date)}
        action={
          <Button
            size="lg"
            variant="secondary"
            disabled={saveStatus === "saving"}
            onClick={handleFinish}
          >
            終了
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          <span className="tabular-nums">経過 {elapsed}分</span>
        </div>
        <div className="flex items-center gap-2">
          <SaveStatusPill status={saveStatus} lastSavedAt={lastSavedAt} />
          {user && (
            <button
              type="button"
              onClick={() => setCheckinOpen(true)}
              className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition-colors active:bg-secondary/70"
            >
              <MapPin className="size-3.5 text-primary" />
              チェックイン
            </button>
          )}
        </div>
      </div>

      <RestTimerBar />
      <WorkoutTemplatePanel draft={draft} latestLog={logs[0]} />

      <div className="space-y-4">
        {draft.entries.map((entry, i) => (
          <FadeIn key={entry.exerciseId} delay={i * 0.05}>
            <ExerciseEntryCard
              entry={entry}
              exercise={byId.get(entry.exerciseId)}
              previous={lastSessionFor(logs, entry.exerciseId)}
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
        onClose={() => setPickerOpen(false)}
      />

      <CheckinComposer
        open={checkinOpen}
        initialName={name}
        onClose={() => setCheckinOpen(false)}
        onSubmit={async (checkinDraft: CheckinDraft, authorName: string) => {
          await saveName(authorName);
          await addCheckin(checkinDraft, authorName);
          speak("greeting");
        }}
      />
    </div>
  );
}
