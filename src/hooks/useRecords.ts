"use client";

import { useEffect, useState } from "react";
import type { ExerciseRecord } from "@/types";
import { getRepos } from "@/repositories";

/** 種目ごとの自己ベスト一覧 */
export function useRecords() {
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.records.getAll())
      .then((list) => {
        if (!cancelled) setRecords(list);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { records, isLoading };
}
