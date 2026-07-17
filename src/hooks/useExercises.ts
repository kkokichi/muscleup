"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Exercise } from "@/types";
import { getRepos } from "@/repositories";
import {
  applyExerciseOrder,
  useExerciseOrderStore,
} from "@/stores/exerciseOrderStore";

/** 種目マスタ（シード + カスタム）の読み込みと検索 */
export function useExercises() {
  const [rawExercises, setRawExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const order = useExerciseOrderStore((s) => s.order);
  // ユーザーの並べ替えを反映（辞典・種目選択シートで共通の並び）
  const exercises = useMemo(
    () => applyExerciseOrder(rawExercises, order),
    [rawExercises, order],
  );

  const reload = useCallback(async () => {
    const repos = await getRepos();
    setRawExercises(await repos.exercises.getAll());
  }, []);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.exercises.getAll())
      .then((list) => {
        if (!cancelled) setRawExercises(list);
      })
      .catch((e) => console.error("種目の読み込みに失敗", e))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byId = useMemo(
    () => new Map(exercises.map((e) => [e.id, e])),
    [exercises],
  );

  return { exercises, byId, isLoading, reload };
}
