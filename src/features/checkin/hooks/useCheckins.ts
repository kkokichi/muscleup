"use client";

import { useCallback, useEffect, useState } from "react";
import type { Checkin, CheckinDraft } from "@/types";
import { getRepos } from "@/repositories";
import { getAuthorId } from "@/lib/firebase";
import { createId } from "@/utils/id";

/** チェックインの読み込みと作成 */
export function useCheckins() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const repos = await getRepos();
    setCheckins(await repos.checkins.getAll());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const repos = await getRepos();
        const list = await repos.checkins.getAll();
        if (!cancelled) setCheckins(list);
      } catch (e) {
        // Firestore未設定・ルール未適用などでも画面を止めない
        console.error("チェックインの読み込みに失敗", e);
        if (!cancelled) setError("チェックインを読み込めませんでした");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addCheckin = useCallback(
    async (draft: CheckinDraft, authorName: string): Promise<Checkin> => {
      const repos = await getRepos();
      const checkin: Checkin = {
        ...draft,
        id: createId(),
        userId: await getAuthorId(),
        authorName,
        createdAt: new Date().toISOString(),
      };
      await repos.checkins.create(checkin);
      await reload();
      return checkin;
    },
    [reload],
  );

  return { checkins, isLoading, error, addCheckin, reload };
}
