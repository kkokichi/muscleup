"use client";

import { useEffect, useMemo, useState } from "react";
import type { MascotEvolutionRecord, UserProfile } from "@/types";
import { getRepos } from "@/repositories";
import {
  MASCOT_EVOLUTIONS,
  levelFromXp,
  totalXpToReachLevel,
} from "@/services/levelService";
import { readMascotEvolutionHistory } from "@/services/gamificationStorageService";

export function useEvolutionDex() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<MascotEvolutionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const repos = await getRepos();
        const loadedProfile = await repos.userProfile.get();
        if (cancelled) return;
        setProfile(loadedProfile);
        setHistory(readMascotEvolutionHistory());
      } catch (error) {
        console.error("進化図鑑の読み込みに失敗", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const levelInfo = useMemo(() => levelFromXp(profile?.xp ?? 0), [profile?.xp]);
  const historyByStage = useMemo(
    () => new Map(history.map((item) => [item.stageId, item])),
    [history],
  );
  const stages = useMemo(
    () =>
      MASCOT_EVOLUTIONS.map((stage) => ({
        stage,
        unlocked: levelInfo.level >= stage.minLevel,
        requiredXp: totalXpToReachLevel(stage.minLevel),
        history: historyByStage.get(stage.id) ?? null,
      })),
    [historyByStage, levelInfo.level],
  );

  return {
    totalXp: profile?.xp ?? 0,
    levelInfo,
    stages,
    history,
    isLoading,
  };
}
