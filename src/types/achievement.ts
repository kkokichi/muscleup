export type AchievementTier = "bronze" | "silver" | "gold";

export type AchievementCondition =
  | "total_workouts"
  | "current_streak"
  | "longest_streak"
  | "pb_count"
  | "level"
  | "total_volume"
  | "categories_trained"
  | "body_metrics"
  | "checkins";

/** バッジ/実績の定義（宣言的。条件はconditionTypeで判定） */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** lucideアイコンのキー（表示側でマッピング） */
  icon: string;
  tier: AchievementTier;
  conditionType: AchievementCondition;
  conditionValue: number;
}

/** 実績の獲得状態 */
export interface AchievementProgress {
  achievement: Achievement;
  unlocked: boolean;
  /** 現在値（進捗バー用） */
  current: number;
  /** ISO 8601 */
  unlockedAt?: string;
}
