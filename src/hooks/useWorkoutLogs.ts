"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkoutLog } from "@/types";
import { getRepos } from "@/repositories";

/** 保存済みワークアウトの読み込み・削除 */
export function useWorkoutLogs() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.workoutLogs.getAll())
      .then((list) => {
        if (!cancelled) setLogs(list);
      })
      .catch((e) => console.error("記録の読み込みに失敗", e))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = useCallback(async () => {
    const repos = await getRepos();
    setLogs(await repos.workoutLogs.getAll());
  }, []);

  const deleteLog = useCallback(
    async (id: string) => {
      const repos = await getRepos();
      await repos.workoutLogs.delete(id);
      await reload();
    },
    [reload],
  );

  return { logs, isLoading, reload, deleteLog };
}
