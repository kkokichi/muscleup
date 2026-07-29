"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PublicProfile } from "@/types";
import { getRepos } from "@/repositories";
import { useAuthUser } from "@/hooks/useAuthUser";

/**
 * ブロック関係の取得・操作。
 * - hiddenIds: フィード等で非表示にすべき相手（自分がブロック＋自分をブロック）
 * - iBlocked: 自分がブロックした相手（設定の一覧・解除用。表示名も解決する）
 */
export function useBlockedUsers() {
  const { user } = useAuthUser();
  const uid = user?.uid ?? null;
  const [iBlockedIds, setIBlockedIds] = useState<string[]>([]);
  const [blockedMeIds, setBlockedMeIds] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Record<string, PublicProfile>>({});
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!uid) {
      setIBlockedIds([]);
      setBlockedMeIds([]);
      return;
    }
    const repos = await getRepos();
    const { iBlocked, blockedMe } = await repos.social.getBlockedUserIds(uid);
    setIBlockedIds(iBlocked);
    setBlockedMeIds(blockedMe);
    // 自分がブロックした相手の表示名を解決（設定一覧用）
    const entries = await Promise.all(
      iBlocked.map(async (id) => [id, await repos.social.getPublicProfile(id)] as const),
    );
    setProfiles(
      Object.fromEntries(entries.filter(([, p]) => p) as [string, PublicProfile][]),
    );
  }, [uid]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } catch (e) {
        console.error("ブロック情報の読み込みに失敗", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const hiddenIds = useMemo(
    () => new Set([...iBlockedIds, ...blockedMeIds]),
    [iBlockedIds, blockedMeIds],
  );

  const block = useCallback(
    async (otherUid: string) => {
      if (!uid || otherUid === uid) return;
      const repos = await getRepos();
      await repos.social.blockUser(uid, otherUid);
      await reload();
    },
    [uid, reload],
  );

  const unblock = useCallback(
    async (otherUid: string) => {
      if (!uid) return;
      const repos = await getRepos();
      await repos.social.unblockUser(uid, otherUid);
      await reload();
    },
    [uid, reload],
  );

  return {
    uid,
    hiddenIds,
    iBlocked: iBlockedIds,
    profiles,
    isLoading,
    block,
    unblock,
    reload,
    canBlock: Boolean(uid),
  };
}
