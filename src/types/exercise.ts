export const MUSCLE_CATEGORY_IDS = [
  "chest",
  "back",
  "shoulders",
  "legs",
  "arms",
  "core",
] as const;

export type MuscleCategoryId = (typeof MUSCLE_CATEGORY_IDS)[number];

export interface ExerciseCategory {
  id: MuscleCategoryId;
  nameJa: string;
  sortOrder: number;
}

import type { MuscleId } from "./muscle";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "bodyweight"
  | "cable";

export interface Exercise {
  id: string;
  categoryId: MuscleCategoryId;
  nameJa: string;
  nameEn: string;
  /** フォーム解説動画（YouTube） */
  youtubeUrl: string;
  /** 表示用の効く部位（日本語ラベル） */
  targetMuscles: string[];
  /** 部位マップでの絞り込みに使う筋肉ID。先頭ほど主働筋 */
  muscles: MuscleId[];
  howTo: string[];
  cautions: string[];
  beginnerTips: string[];
  commonMistakes: string[];
  equipment: Equipment;
  isCustom: boolean;
}
