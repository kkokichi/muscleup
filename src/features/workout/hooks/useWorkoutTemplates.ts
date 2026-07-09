"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkoutTemplate } from "@/types";
import { getRepos } from "@/repositories";

export function useWorkoutTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    const repos = await getRepos();
    setTemplates(await repos.workoutTemplates.getAll());
  }, []);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.workoutTemplates.getAll())
      .then((items) => {
        if (!cancelled) setTemplates(items);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveTemplate = useCallback(
    async (template: WorkoutTemplate) => {
      const repos = await getRepos();
      await repos.workoutTemplates.save(template);
      await reload();
    },
    [reload],
  );

  const markUsed = useCallback(
    async (template: WorkoutTemplate) => {
      await saveTemplate({
        ...template,
        lastUsedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    [saveTemplate],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      const repos = await getRepos();
      await repos.workoutTemplates.delete(id);
      await reload();
    },
    [reload],
  );

  return { templates, isLoading, reload, saveTemplate, markUsed, deleteTemplate };
}
