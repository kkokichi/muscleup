import type { ExerciseCategory } from "@/types";

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  { id: "chest", nameJa: "胸", sortOrder: 1 },
  { id: "back", nameJa: "背中", sortOrder: 2 },
  { id: "shoulders", nameJa: "肩", sortOrder: 3 },
  { id: "legs", nameJa: "脚", sortOrder: 4 },
  { id: "arms", nameJa: "腕", sortOrder: 5 },
  { id: "core", nameJa: "腹筋", sortOrder: 6 },
];

export function categoryNameJa(id: string): string {
  return EXERCISE_CATEGORIES.find((c) => c.id === id)?.nameJa ?? id;
}

/**
 * 部位ごとの識別カラー（カレンダーの色分けなどに使用）。
 * dataviz skill の検証済みカテゴリカル配色（暗背景向け・canonical順）を採用。
 * 隣接ペアのCVD ΔE ≥ 8 / 通常視 ΔE ≥ 15 を満たす並び。
 */
export const CATEGORY_COLORS: Record<string, string> = {
  chest: "#3987e5", // 青
  back: "#008300", // 緑
  shoulders: "#d55181", // マゼンタ
  legs: "#c98500", // アンバー
  arms: "#199e70", // アクア
  core: "#d95926", // オレンジ
};

export function categoryColor(id: string): string {
  return CATEGORY_COLORS[id] ?? "#8a8a8a";
}
