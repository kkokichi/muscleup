import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Exercise } from "@/types";

interface ExerciseOrderState {
  /** ユーザーが並べ替えた種目IDの並び（未収録IDは既定順で後ろに続く） */
  order: string[];
  setOrder: (orderedIds: string[]) => void;
}

/**
 * 種目辞典での並び順（端末ローカルの表示設定）。
 * 種目辞典・種目選択シートの両方から参照して並びを揃える。
 */
export const useExerciseOrderStore = create<ExerciseOrderState>()(
  persist(
    (set) => ({
      order: [],
      setOrder: (orderedIds) => set({ order: orderedIds }),
    }),
    { name: "muscleup:v1:exerciseOrder" },
  ),
);

/** 保存済みの並び順を種目リストに適用する（未収録は既定順を維持） */
export function applyExerciseOrder(
  exercises: Exercise[],
  order: string[],
): Exercise[] {
  if (order.length === 0) return exercises;
  const rank = new Map(order.map((id, index) => [id, index]));
  return [...exercises].sort(
    (a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity),
  );
}
