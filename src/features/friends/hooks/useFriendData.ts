"use client";

import { useCallback, useEffect, useState } from "react";
import type { FriendRequest } from "@/types";
import { getRepos } from "@/repositories";
import { useAuthUser } from "@/hooks/useAuthUser";

export interface FriendEntry {
  uid: string;
  name: string;
}

/** フレンド一覧・受信/送信中の申請をまとめて扱う（フレンド画面用） */
export function useFriendData() {
  const { user } = useAuthUser();
  const uid = user?.uid ?? null;
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!uid) {
      setReceived([]);
      setSent([]);
      setFriends([]);
      return;
    }
    const repos = await getRepos();
    const [rec, snt, frs] = await Promise.all([
      repos.social.getReceivedRequests(uid),
      repos.social.getSentRequests(uid),
      repos.social.getFriends(uid),
    ]);
    setReceived(rec);
    setSent(snt);
    // フレンドの表示名は公開プロフィールから解決する
    const entries = await Promise.all(
      frs.map(async (f) => {
        const otherUid = f.userIds.find((id) => id !== uid) ?? "";
        const p = await repos.social.getPublicProfile(otherUid);
        return { uid: otherUid, name: p?.displayName ?? "ユーザー" };
      }),
    );
    setFriends(entries.filter((e) => e.uid));
  }, [uid]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } catch (e) {
        console.error("フレンド情報の読み込みに失敗", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  return { uid, received, sent, friends, isLoading, reload };
}
