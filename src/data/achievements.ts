import type { Achievement } from "@/types";

/**
 * バッジ/実績マスタ。宣言的に定義し、achievementService が条件を判定する。
 * 新しいバッジはここに追加するだけで有効になる。
 */
export const ACHIEVEMENTS: Achievement[] = [
  // --- 記録回数 ---
  {
    id: "first-workout",
    title: "はじめの一歩",
    description: "初めてワークアウトを記録した",
    icon: "Dumbbell",
    tier: "bronze",
    conditionType: "total_workouts",
    conditionValue: 1,
  },
  {
    id: "workouts-10",
    title: "習慣の芽",
    description: "10回トレーニングした",
    icon: "Dumbbell",
    tier: "bronze",
    conditionType: "total_workouts",
    conditionValue: 10,
  },
  {
    id: "workouts-50",
    title: "ジムの常連",
    description: "50回トレーニングした",
    icon: "Dumbbell",
    tier: "silver",
    conditionType: "total_workouts",
    conditionValue: 50,
  },
  {
    id: "workouts-100",
    title: "鉄の意志",
    description: "100回トレーニングした",
    icon: "Dumbbell",
    tier: "gold",
    conditionType: "total_workouts",
    conditionValue: 100,
  },

  // --- 連続日数 ---
  {
    id: "streak-3",
    title: "三日坊主、卒業",
    description: "3日連続でトレーニングした",
    icon: "Flame",
    tier: "bronze",
    conditionType: "longest_streak",
    conditionValue: 3,
  },
  {
    id: "streak-7",
    title: "一週間の炎",
    description: "7日連続でトレーニングした",
    icon: "Flame",
    tier: "silver",
    conditionType: "longest_streak",
    conditionValue: 7,
  },
  {
    id: "streak-30",
    title: "不屈の30日",
    description: "30日連続でトレーニングした",
    icon: "Flame",
    tier: "gold",
    conditionType: "longest_streak",
    conditionValue: 30,
  },

  // --- 自己ベスト ---
  {
    id: "pb-1",
    title: "自己ベスト更新",
    description: "初めて自己ベストを更新した",
    icon: "Trophy",
    tier: "bronze",
    conditionType: "pb_count",
    conditionValue: 1,
  },
  {
    id: "pb-25",
    title: "限界を超える者",
    description: "自己ベストを25回更新した",
    icon: "Trophy",
    tier: "gold",
    conditionType: "pb_count",
    conditionValue: 25,
  },

  // --- レベル ---
  {
    id: "level-5",
    title: "駆け出しリフター",
    description: "レベル5に到達した",
    icon: "Zap",
    tier: "bronze",
    conditionType: "level",
    conditionValue: 5,
  },
  {
    id: "level-20",
    title: "鋼の求道者",
    description: "レベル20に到達した",
    icon: "Crown",
    tier: "gold",
    conditionType: "level",
    conditionValue: 20,
  },

  // --- ボリューム ---
  {
    id: "volume-100k",
    title: "10万kgの旅",
    description: "累計挙上量が100,000kgに到達した",
    icon: "Mountain",
    tier: "silver",
    conditionType: "total_volume",
    conditionValue: 100000,
  },

  // --- バランス・その他 ---
  {
    id: "full-body",
    title: "全身制覇",
    description: "6部位すべてをトレーニングした",
    icon: "Layers",
    tier: "silver",
    conditionType: "categories_trained",
    conditionValue: 6,
  },
  {
    id: "weight-log",
    title: "自分を知る",
    description: "初めて体重を記録した",
    icon: "Scale",
    tier: "bronze",
    conditionType: "body_metrics",
    conditionValue: 1,
  },
  {
    id: "gym-checkin",
    title: "ジムデビュー",
    description: "初めてジムにチェックインした",
    icon: "MapPin",
    tier: "bronze",
    conditionType: "checkins",
    conditionValue: 1,
  },
];
