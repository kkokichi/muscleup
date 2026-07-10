import type {
  Achievement,
  AchievementCondition,
  AchievementProgress,
} from "@/types";
import { ACHIEVEMENTS } from "@/data/achievements";

/** 実績判定に必要な集計値 */
export interface AchievementContext {
  totalWorkouts: number;
  longestStreak: number;
  pbCount: number;
  level: number;
  totalVolume: number;
  categoriesTrained: number;
  bodyMetricsCount: number;
  checkinCount: number;
}

function contextValue(
  ctx: AchievementContext,
  type: AchievementCondition,
): number {
  switch (type) {
    case "total_workouts":
      return ctx.totalWorkouts;
    case "current_streak":
    case "longest_streak":
      return ctx.longestStreak;
    case "pb_count":
      return ctx.pbCount;
    case "level":
      return ctx.level;
    case "total_volume":
      return ctx.totalVolume;
    case "categories_trained":
      return ctx.categoriesTrained;
    case "body_metrics":
      return ctx.bodyMetricsCount;
    case "checkins":
      return ctx.checkinCount;
  }
}

export function isUnlocked(a: Achievement, ctx: AchievementContext): boolean {
  return contextValue(ctx, a.conditionType) >= a.conditionValue;
}

/**
 * 全実績の進捗を算出する。
 * unlockedAtMap には過去に獲得した日時（永続化済み）を渡す。
 */
export function evaluateAchievements(
  ctx: AchievementContext,
  unlockedAtMap: Record<string, string>,
): AchievementProgress[] {
  return ACHIEVEMENTS.map((achievement) => {
    const current = contextValue(ctx, achievement.conditionType);
    const unlocked = current >= achievement.conditionValue;
    return {
      achievement,
      unlocked,
      current,
      unlockedAt: unlockedAtMap[achievement.id],
    };
  });
}
