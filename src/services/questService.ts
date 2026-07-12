import type { WorkoutLog } from "@/types";
import { calcLogSetCount } from "./statsService";
import { todayISO } from "@/utils/date";

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
}

export const DAILY_QUEST_IDS = [
  "record-one-exercise",
  "complete-three-sets",
  "beat-last-reps",
] as const;

export const QUEST_STREAK_BONUS_TIERS = [
  { streakDays: 3, xp: 50, title: "3日連続クエスト達成" },
  { streakDays: 7, xp: 150, title: "7日連続クエスト達成" },
  { streakDays: 14, xp: 400, title: "14日連続クエスト達成" },
] as const;

function hasRepImprovement(todayLogs: WorkoutLog[], previousLogs: WorkoutLog[]): boolean {
  const previousBestReps = new Map<string, number>();
  for (const log of previousLogs) {
    for (const entry of log.entries) {
      const best = Math.max(...entry.sets.map((set) => set.reps), 0);
      previousBestReps.set(
        entry.exerciseId,
        Math.max(previousBestReps.get(entry.exerciseId) ?? 0, best),
      );
    }
  }

  for (const log of todayLogs) {
    for (const entry of log.entries) {
      const previousBest = previousBestReps.get(entry.exerciseId) ?? 0;
      const todayBest = Math.max(...entry.sets.map((set) => set.reps), 0);
      if (previousBest > 0 && todayBest >= previousBest + 1) return true;
    }
  }

  return false;
}

export function buildDailyQuests(
  logs: WorkoutLog[],
  today: string = todayISO(),
): DailyQuest[] {
  const todayLogs = logs.filter((log) => log.date === today);
  const previousLogs = logs.filter((log) => log.date < today);
  const todayExerciseIds = new Set(
    todayLogs.flatMap((log) => log.entries.map((entry) => entry.exerciseId)),
  );
  const todaySetCount = todayLogs.reduce(
    (sum, log) => sum + calcLogSetCount(log),
    0,
  );

  return [
    {
      id: "record-one-exercise",
      title: "1種目記録する",
      description: "まずは1種目だけでOK",
      xp: 20,
      completed: todayExerciseIds.size >= 1,
    },
    {
      id: "complete-three-sets",
      title: "合計3セット完了",
      description: `${todaySetCount}/3セット`,
      xp: 30,
      completed: todaySetCount >= 3,
    },
    {
      id: "beat-last-reps",
      title: "前回より+1回",
      description: "同じ種目で回数ベストを狙う",
      xp: 40,
      completed: hasRepImprovement(todayLogs, previousLogs),
    },
  ];
}
