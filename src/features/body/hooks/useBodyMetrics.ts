"use client";

import { useCallback, useEffect, useState } from "react";
import type { BodyMetric } from "@/types";
import { localBodyMetricRepository as repo } from "@/repositories/local/localBodyMetricRepository";
import { createId } from "@/utils/id";

export interface BodyMetricInput {
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  note?: string;
}

/** 体組成記録の読み込み・追加・削除 */
export function useBodyMetrics() {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setMetrics(await repo.getAll());
  }, []);

  useEffect(() => {
    let cancelled = false;
    repo.getAll().then((list) => {
      if (!cancelled) {
        setMetrics(list);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addMetric = useCallback(
    async (input: BodyMetricInput) => {
      await repo.save({
        ...input,
        id: createId(),
        createdAt: new Date().toISOString(),
      });
      await reload();
    },
    [reload],
  );

  const deleteMetric = useCallback(
    async (id: string) => {
      await repo.delete(id);
      await reload();
    },
    [reload],
  );

  return { metrics, isLoading, addMetric, deleteMetric };
}
