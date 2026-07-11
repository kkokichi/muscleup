"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, MapPin, Plus } from "lucide-react";
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
import { formatDateJa, minutesSince } from "@/utils/date";
import { useCheckins } from "@/features/checkin/hooks/useCheckins";
import { CheckinComposer } from "@/features/checkin/components/CheckinComposer";
import { useSaveWorkout } from "../hooks/useSaveWorkout";
import { ExerciseEntryCard } from "./ExerciseEntryCard";
import { ExercisePickerSheet } from "./ExercisePickerSheet";
import { RestTimerBar } from "./RestTimerBar";
import { WorkoutTemplatePanel } from "./WorkoutTemplatePanel";

/** 直近ログから種目の前回実績を引く（前回値プリセットの核） */
function lastEntryFor(logs: WorkoutLog[], exerciseId: string): WorkoutEntry | null {
  for (const log of logs) {
    const entry = log.entries.find((e) => e.exerciseId === exerciseId);
    if (entry && entry.sets.length > 0) return entry;
  }
  return null;
}

export function WorkoutRecorder() {
  const mounted = useHasMounted();
  const router = useRouter();
  const { draft, startWorkout, addExercise, setNote } = useWorkoutDraftStore();
  const { exercises, byId } = useExercises();
  const { logs } = useWorkoutLogs();
  const { saveWorkout, isSaving } = useSaveWorkout(byId);
  const { name, saveName } = useUserName();
  const { addCheckin } = useCheckins();
  const { user } = useAuthUser();
  const speak = useMascotStore((s) => s.speak);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  // 経過時間は描画のたびに算出し、インターバルで再描画だけを促す
  const [, setTick] = useState(0);

  useEffect(() => {
    if (mounted && !useWorkoutDraftStore.getState().draft) startWorkout();
  }, [mounted, startWorkout]);

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

  if (!mounted || !draft) return null;

  const elapsed = minutesSince(draft.startedAt);
  const canSave = draft.entries.some((e) => e.sets.some((s) => s.reps > 0));

  const handleSelectExercise = (exerciseId: string) => {
    const prev = lastEntryFor(logs, exerciseId);
    const presetSets: DraftSet[] | undefined = prev?.sets.map((s) => ({
      weightKg: s.weightKg,
      reps: s.reps,
      isDone: false,
    }));
    addExercise(exerciseId, presetSets);
    setPickerOpen(false);
  };

  const handleSave = async () => {
    const saved = await saveWorkout(draft);
    if (saved) router.push("/");
  };

  return (
    <div>
      <PageHeader
        title="ワークアウト"
        subtitle={formatDateJa(draft.date)}
        action={
          <Button size="lg" disabled={!canSave || isSaving} onClick={handleSave}>
            {isSaving ? "保存中…" : "完了"}
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          <span className="tabular-nums">経過 {elapsed}分</span>
        </div>
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

      <RestTimerBar />
      <WorkoutTemplatePanel draft={draft} latestLog={logs[0]} />

      <div className="space-y-4">
        {draft.entries.map((entry, i) => {
          const prev = lastEntryFor(logs, entry.exerciseId);
          const hint = prev
            ? `前回 ${prev.sets[0].weightKg}kg × ${prev.sets[0].reps}回 · ${prev.sets.length}セット`
            : undefined;
          return (
            <FadeIn key={entry.exerciseId} delay={i * 0.05}>
              <ExerciseEntryCard
                entry={entry}
                exercise={byId.get(entry.exerciseId)}
                previousHint={hint}
              />
            </FadeIn>
          );
        })}

        <Button
          variant="outline"
          size="lg"
          className="w-full border-dashed"
          onClick={() => setPickerOpen(true)}
        >
          <Plus className="size-4" data-icon="inline-start" />
          種目を追加
        </Button>

        <textarea
          value={draft.note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="メモ（体調・フォームの気づきなど）"
          rows={3}
          className="w-full resize-none rounded-2xl border border-border bg-card p-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>

      <ExercisePickerSheet
        open={pickerOpen}
        exercises={exercises}
        recentIds={recentIds}
        excludeIds={draft.entries.map((e) => e.exerciseId)}
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
