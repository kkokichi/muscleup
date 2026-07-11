"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExerciseRecord, UserProfile, WorkoutLog } from "@/types";
import { getRepos } from "@/repositories";
import {
  calcStreak,
  calcWeeklyStats,
  type WeeklyStats,
} from "@/services/statsService";
import { levelFromXp, titleForLevel, type LevelInfo } from "@/services/levelService";

export interface HomeStats {
  logs: WorkoutLog[];
  records: ExerciseRecord[];
  streak: number;
  weekly: WeeklyStats;
  levelInfo: LevelInfo;
  levelTitle: string;
  /** 自己ベスト更新の累計回数 */
  pbCount: number;
  recentLogs: WorkoutLog[];
  /** 今日すでに記録済みか（マスコットの文脈判定に使用） */
  trainedToday: boolean;
}

/** ホーム画面のダッシュボード統計 */
export function useHomeStats() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const repos = await getRepos();
        const [l, r, p] = await Promise.all([
          repos.workoutLogs.getAll(),
          repos.records.getAll(),
          repos.userProfile.get(),
        ]);
        if (cancelled) return;
        setLogs(l);
        setRecords(r);
        setProfile(p);
      } catch (e) {
        console.error("ホーム統計の読み込みに失敗", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats: HomeStats = useMemo(() => {
    const levelInfo = levelFromXp(profile?.xp ?? 0);
    const today = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD
    return {
      logs,
      records,
      streak: calcStreak(logs),
      weekly: calcWeeklyStats(logs),
      levelInfo,
      levelTitle: titleForLevel(levelInfo.level),
      pbCount: records.reduce((sum, r) => sum + r.updatedCount, 0),
      recentLogs: logs.slice(0, 3),
      trainedToday: logs.some((l) => l.date === today),
    };
  }, [logs, records, profile]);

  return { stats, isLoading };
}
