"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WorkoutDraft } from "@/types";
import { getRepos } from "@/repositories";
import { rebuildRecordsFromLogs } from "@/services/recordService";
import { draftToLog } from "@/services/workoutService";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "offline" | "error";

interface AutoSaveState {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  saveNow: () => Promise<boolean>;
}

const AUTO_SAVE_DELAY_MS = 800;

function canPersistDraft(draft: WorkoutDraft): boolean {
  return draft.entries.some((entry) => entry.sets.some((set) => set.reps > 0));
}

async function persistDraft(draft: WorkoutDraft): Promise<boolean> {
  const repos = await getRepos();
  const log = draftToLog(draft);
  if (log.entries.length === 0) return false;

  await repos.workoutLogs.save(log);
  const [logs, existingRecords] = await Promise.all([
    repos.workoutLogs.getAll(),
    repos.records.getAll(),
  ]);
  await repos.records.replaceAll(rebuildRecordsFromLogs(logs, existingRecords));
  return true;
}

/** 全セット削除時は、同じIDで自動保存済みの記録も消してその日を空に戻す。 */
async function removePersistedDraft(draft: WorkoutDraft): Promise<boolean> {
  if (!draft.activeLogId) return false;
  const repos = await getRepos();
  const existing = await repos.workoutLogs.getById(draft.activeLogId);
  if (!existing) return false;

  await repos.workoutLogs.delete(draft.activeLogId);
  const [logs, existingRecords] = await Promise.all([
    repos.workoutLogs.getAll(),
    repos.records.getAll(),
  ]);
  await repos.records.replaceAll(rebuildRecordsFromLogs(logs, existingRecords));
  return true;
}

export function useAutoSaveWorkout(draft: WorkoutDraft | null): AutoSaveState {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const latestSequence = useRef(0);

  const sourceSignature = useMemo(() => {
    if (!draft) return "";
    return JSON.stringify(draft);
  }, [draft]);

  const saveNow = useCallback(async () => {
    if (!draft) return false;
    const sequence = latestSequence.current + 1;
    latestSequence.current = sequence;
    if (!canPersistDraft(draft)) {
      try {
        const removed = await removePersistedDraft(draft);
        if (latestSequence.current === sequence) setStatus("idle");
        return removed;
      } catch (error) {
        console.error("空になったワークアウトの削除に失敗", error);
        if (latestSequence.current === sequence) setStatus("error");
        return false;
      }
    }
    setStatus("saving");
    try {
      const saved = await persistDraft(draft);
      if (!saved) {
        setStatus("idle");
        return false;
      }
      if (latestSequence.current === sequence) {
        setLastSavedAt(new Date());
        setStatus("saved");
      }
      return true;
    } catch (error) {
      console.error("ワークアウトの自動保存に失敗", error);
      if (latestSequence.current === sequence) setStatus("error");
      return false;
    }
  }, [draft]);

  useEffect(() => {
    if (!draft) {
      const idleTimer = window.setTimeout(() => setStatus("idle"), 0);
      return () => window.clearTimeout(idleTimer);
    }

    if (!canPersistDraft(draft)) {
      const sequence = latestSequence.current + 1;
      latestSequence.current = sequence;
      const clearTimer = window.setTimeout(async () => {
        try {
          await removePersistedDraft(draft);
          if (latestSequence.current === sequence) setStatus("idle");
        } catch (error) {
          console.error("空になったワークアウトの削除に失敗", error);
          if (latestSequence.current === sequence) setStatus("error");
        }
      }, 0);
      return () => window.clearTimeout(clearTimer);
    }

    const sequence = latestSequence.current + 1;
    latestSequence.current = sequence;
    const timer = window.setTimeout(async () => {
      setStatus("saving");
      try {
        const saved = await persistDraft(draft);
        if (!saved) {
          setStatus("idle");
          return;
        }

        if (latestSequence.current !== sequence) return;
        setLastSavedAt(new Date());
        setStatus("saved");
      } catch (error) {
        console.error("ワークアウトの自動保存に失敗", error);
        if (latestSequence.current === sequence) setStatus("error");
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [draft, sourceSignature]);

  return { status, lastSavedAt, saveNow };
}
