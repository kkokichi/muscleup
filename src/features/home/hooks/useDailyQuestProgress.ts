"use client";

import { useEffect, useMemo, useState } from "react";
import type { QuestCompletion, WorkoutLog } from "@/types";
import { buildDailyQuests } from "@/services/questService";
import {
  readQuestCompletionHistory,
  recordQuestCompletions,
} from "@/services/gamificationStorageService";
import { todayISO } from "@/utils/date";

export function useDailyQuestProgress(logs: WorkoutLog[]) {
  const today = todayISO();
  const quests = useMemo(() => buildDailyQuests(logs, today), [logs, today]);
  const [history, setHistory] = useState<QuestCompletion[]>(() =>
    readQuestCompletionHistory(6),
  );
  const [newlyCompletedCount, setNewlyCompletedCount] = useState(0);
  const questSignature = quests
    .map((quest) => `${quest.id}:${quest.completed ? "1" : "0"}`)
    .join("|");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const additions = recordQuestCompletions(
        quests,
        today,
        new Date().toISOString(),
      );
      setNewlyCompletedCount(additions.length);
      setHistory(readQuestCompletionHistory(6));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [questSignature, quests, today]);

  return { quests, history, newlyCompletedCount };
}
