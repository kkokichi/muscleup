"use client";

import { useEffect, useMemo, useState } from "react";
import type { Exercise } from "@/types";
import { getRepos } from "@/repositories";

/** 種目マスタ（シード + カスタム）の読み込みと検索 */
export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.exercises.getAll())
      .then((list) => {
        if (!cancelled) setExercises(list);
      })
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

  return { exercises, byId, isLoading };
}
