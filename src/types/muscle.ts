import type { MuscleCategoryId } from "./exercise";

/**
 * 部位マップの「タップできる筋肉」の細分類。
 * カテゴリ（chest等）を、部位マップ上で個別に選択できる筋肉に分解する。
 */
export const MUSCLE_IDS = [
  // 胸
  "chest-upper",
  "chest-mid",
  "chest-lower",
  // 背中
  "lats",
  "traps",
  "lower-back",
  // 肩
  "front-delt",
  "side-delt",
  "rear-delt",
  // 腕
  "biceps",
  "triceps",
  "forearms",
  // 脚
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  // 体幹
  "abs",
  "obliques",
] as const;

export type MuscleId = (typeof MUSCLE_IDS)[number];

export interface Muscle {
  id: MuscleId;
  categoryId: MuscleCategoryId;
  nameJa: string;
  /** 前面(front)か背面(back)か。両面に見えるものは主に見える側 */
  view: "front" | "back";
}

export const MUSCLES: Muscle[] = [
  { id: "chest-upper", categoryId: "chest", nameJa: "大胸筋 上部", view: "front" },
  { id: "chest-mid", categoryId: "chest", nameJa: "大胸筋 中部", view: "front" },
  { id: "chest-lower", categoryId: "chest", nameJa: "大胸筋 下部", view: "front" },

  { id: "lats", categoryId: "back", nameJa: "広背筋", view: "back" },
  { id: "traps", categoryId: "back", nameJa: "僧帽筋", view: "back" },
  { id: "lower-back", categoryId: "back", nameJa: "脊柱起立筋", view: "back" },

  { id: "front-delt", categoryId: "shoulders", nameJa: "三角筋 前部", view: "front" },
  { id: "side-delt", categoryId: "shoulders", nameJa: "三角筋 中部", view: "front" },
  { id: "rear-delt", categoryId: "shoulders", nameJa: "三角筋 後部", view: "back" },

  { id: "biceps", categoryId: "arms", nameJa: "上腕二頭筋", view: "front" },
  { id: "triceps", categoryId: "arms", nameJa: "上腕三頭筋", view: "back" },
  { id: "forearms", categoryId: "arms", nameJa: "前腕", view: "front" },

  { id: "quads", categoryId: "legs", nameJa: "大腿四頭筋", view: "front" },
  { id: "hamstrings", categoryId: "legs", nameJa: "ハムストリングス", view: "back" },
  { id: "glutes", categoryId: "legs", nameJa: "臀筋", view: "back" },
  { id: "calves", categoryId: "legs", nameJa: "カーフ（下腿三頭筋）", view: "back" },

  { id: "abs", categoryId: "core", nameJa: "腹直筋", view: "front" },
  { id: "obliques", categoryId: "core", nameJa: "腹斜筋", view: "front" },
];

const MUSCLE_BY_ID = new Map(MUSCLES.map((m) => [m.id, m]));

export function getMuscle(id: MuscleId): Muscle | undefined {
  return MUSCLE_BY_ID.get(id);
}

export function muscleNameJa(id: MuscleId): string {
  return MUSCLE_BY_ID.get(id)?.nameJa ?? id;
}

export function musclesForCategory(categoryId: MuscleCategoryId): Muscle[] {
  return MUSCLES.filter((m) => m.categoryId === categoryId);
}
