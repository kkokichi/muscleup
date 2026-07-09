"use client";

import { useCallback, useEffect, useState } from "react";
import { getRepos } from "@/repositories";

/** コミュニティ投稿の表示名の取得・更新 */
export function useUserName() {
  const [name, setName] = useState("トレーニー");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.userProfile.get())
      .then((p) => {
        if (!cancelled) {
          setName(p.displayName);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveName = useCallback(async (next: string) => {
    const trimmed = next.trim() || "トレーニー";
    const repos = await getRepos();
    const profile = await repos.userProfile.get();
    await repos.userProfile.save({ ...profile, displayName: trimmed });
    setName(trimmed);
  }, []);

  return { name, saveName, isLoading };
}
