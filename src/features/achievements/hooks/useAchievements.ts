"use client";

import { useEffect, useState } from "react";
import type { AchievementProgress } from "@/types";
import { getRepos } from "@/repositories";
import { localBodyMetricRepository } from "@/repositories/local/localBodyMetricRepository";
import {
  evaluateAchievements,
  type AchievementContext,
} from "@/services/achievementService";
import {
  readAchievementUnlockedAt,
  recordAchievementUnlocks,
} from "@/services/gamificationStorageService";
import { calcLongestStreak, calcLogVolume } from "@/services/statsService";
import { levelFromXp } from "@/services/levelService";
import { useMascotStore } from "@/stores/mascotStore";

/**
 * 実績の進捗を算出し、新規獲得を永続化＋マスコットで祝福する。
 */
export function useAchievements() {
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const speak = useMascotStore((s) => s.speak);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const repos = await getRepos();
      const [logs, records, profile, exercises, checkins, bodyMetrics] =
        await Promise.all([
          repos.workoutLogs.getAll(),
          repos.records.getAll(),
          repos.userProfile.get(),
          repos.exercises.getAll(),
          repos.checkins.getAll().catch(() => []),
          localBodyMetricRepository.getAll(),
        ]);
      if (cancelled) return;

      const categoryOf = new Map(exercises.map((e) => [e.id, e.categoryId]));
      const categories = new Set<string>();
      let totalVolume = 0;
      for (const log of logs) {
        totalVolume += calcLogVolume(log);
        for (const entry of log.entries) {
          const cat = categoryOf.get(entry.exerciseId);
          if (cat) categories.add(cat);
        }
      }

      const ctx: AchievementContext = {
        totalWorkouts: logs.length,
        longestStreak: calcLongestStreak(logs),
        pbCount: records.reduce((sum, r) => sum + r.updatedCount, 0),
        level: levelFromXp(profile.xp).level,
        totalVolume,
        categoriesTrained: categories.size,
        bodyMetricsCount: bodyMetrics.length,
        checkinCount: checkins.length,
      };

      const unlockedAt = readAchievementUnlockedAt();
      const evaluated = evaluateAchievements(ctx, unlockedAt);

      // 新規獲得を検出して日時を記録
      const now = new Date().toISOString();
      const { unlockedAtMap, newlyUnlocked } = recordAchievementUnlocks(
        evaluated,
        unlockedAt,
        now,
      );
      if (newlyUnlocked.length > 0) {
        // 初回獲得の記録日時を反映
        for (const p of evaluated) {
          if (p.unlocked && !p.unlockedAt) {
            p.unlockedAt = unlockedAtMap[p.achievement.id];
          }
        }
      }

      setProgress(evaluated);
      setIsLoading(false);

      // 新規獲得を祝福（最初の1件）
      if (newlyUnlocked.length > 0) {
        speak("pb", { exercise: newlyUnlocked[0].achievement.title });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [speak]);

  const unlockedCount = progress.filter((p) => p.unlocked).length;

  return { progress, unlockedCount, total: progress.length, isLoading };
}
