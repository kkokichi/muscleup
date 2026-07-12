"use client";

import { useEffect, useState } from "react";
import type { MascotEvolutionRecord } from "@/types";
import {
  getMascotEvolution,
  type LevelInfo,
} from "@/services/levelService";
import {
  readMascotEvolutionHistory,
  recordMascotEvolutionIfNeeded,
} from "@/services/gamificationStorageService";

export function useMascotEvolutionPersistence(levelInfo: LevelInfo) {
  const stage = getMascotEvolution(levelInfo.level);
  const [isNewEvolution, setIsNewEvolution] = useState(false);
  const [history, setHistory] = useState<MascotEvolutionRecord[]>(() =>
    readMascotEvolutionHistory(5),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const result = recordMascotEvolutionIfNeeded(
        stage,
        levelInfo.level,
        new Date().toISOString(),
      );
      setIsNewEvolution(result.isNew);
      setHistory(result.history.slice(0, 5));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [stage, levelInfo.level]);

  return { stage, isNewEvolution, history };
}
