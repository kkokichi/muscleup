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
  targetMuscles: string[];
  howTo: string[];
  cautions: string[];
  beginnerTips: string[];
  commonMistakes: string[];
  equipment: Equipment;
  isCustom: boolean;
}
