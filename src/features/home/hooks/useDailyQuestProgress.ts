"use client";

import { useEffect, useMemo, useState } from "react";
import type { QuestCompletion, QuestStreakBonus, WorkoutLog } from "@/types";
import { getRepos } from "@/repositories";
import { buildDailyQuests } from "@/services/questService";
import {
  calcQuestPerfectStreak,
  readQuestCompletionHistory,
  readQuestStreakBonuses,
  recordQuestCompletions,
  recordQuestStreakBonusesIfNeeded,
} from "@/services/gamificationStorageService";
import { todayISO } from "@/utils/date";

export function useDailyQuestProgress(logs: WorkoutLog[]) {
  const today = todayISO();
  const quests = useMemo(() => buildDailyQuests(logs, today), [logs, today]);
  const [history, setHistory] = useState<QuestCompletion[]>(() =>
    readQuestCompletionHistory(6),
  );
  const [bonusHistory, setBonusHistory] = useState<QuestStreakBonus[]>(() =>
    readQuestStreakBonuses(4),
  );
  const [newlyCompletedCount, setNewlyCompletedCount] = useState(0);
  const [newBonus, setNewBonus] = useState<QuestStreakBonus | null>(null);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const questSignature = quests
    .map((quest) => `${quest.id}:${quest.completed ? "1" : "0"}`)
    .join("|");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const now = new Date().toISOString();
      const additions = recordQuestCompletions(
        quests,
        today,
        now,
      );
      const nextHistory = readQuestCompletionHistory();
      const nextStreak = calcQuestPerfectStreak(nextHistory, today);
      const bonusResult = recordQuestStreakBonusesIfNeeded(
        nextStreak,
        today,
        now,
      );
      const bonusXp = bonusResult.additions.reduce((sum, item) => sum + item.xp, 0);
      if (bonusXp > 0) {
        try {
          const repos = await getRepos();
          const profile = await repos.userProfile.get();
          await repos.userProfile.save({ ...profile, xp: profile.xp + bonusXp });
        } catch (error) {
          console.error("クエストボーナスXPの保存に失敗", error);
        }
      }
      setNewlyCompletedCount(additions.length);
      setPerfectStreak(nextStreak);
      setNewBonus(bonusResult.additions[0] ?? null);
      setHistory(nextHistory.slice(0, 6));
      setBonusHistory(bonusResult.history.slice(0, 4));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [questSignature, quests, today]);

  return { quests, history, bonusHistory, newBonus, newlyCompletedCount, perfectStreak };
}
