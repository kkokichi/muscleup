"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CheckinReactionType } from "@/types";
import { getRepos } from "@/repositories";
import { useAuthUser } from "@/hooks/useAuthUser";

const SEEN_AT_KEY = "muscleup:v1:checkinSeenAt";

export interface CheerNotification {
  id: string;
  checkinId: string;
  gymName: string;
  reactorName: string;
  type: CheckinReactionType;
  /** ISO 8601 */
  createdAt: string;
}

function readSeenAt(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(SEEN_AT_KEY) ?? "";
}

/**
 * 自分のチェックインに付いた「他の人からの応援（リアクション）」を集計する。
 * プッシュ基盤が無いため、開いたときにクライアント側で集計する方式。
 * 未読は端末に保存した最終確認時刻（lastSeenAt）より新しいものとする。
 */
export function useCheckinNotifications() {
  const { user } = useAuthUser();
  const uid = user?.uid ?? null;
  const [items, setItems] = useState<CheerNotification[]>([]);
  const [seenAt, setSeenAt] = useState<string>(() => readSeenAt());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!uid) {
        if (!cancelled) {
          setItems([]);
          setIsLoading(false);
        }
        return;
      }
      try {
        const repos = await getRepos();
        const all = await repos.checkins.getAll();
        const mine = all.filter((c) => c.userId === uid);
        const perCheckin = await Promise.all(
          mine.map(async (c) => {
            const reactions = await repos.checkins.getReactions(c.id);
            // 自分以外からの応援だけを対象にする
            return reactions
              .filter((r) => r.userId !== uid)
              .map<CheerNotification>((r) => ({
                id: `${c.id}:${r.userId}`,
                checkinId: c.id,
                gymName: c.gymName,
                reactorName: r.authorName,
                type: r.type,
                createdAt: r.createdAt,
              }));
          }),
        );
        if (cancelled) return;
        const flat = perCheckin
          .flat()
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setItems(flat);
      } catch (e) {
        if (!cancelled) console.error("応援通知の集計に失敗", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const unreadCount = useMemo(
    () => items.filter((i) => i.createdAt > seenAt).length,
    [items, seenAt],
  );

  const markSeen = useCallback(() => {
    // 最新の応援時刻（無ければ現在時刻）を既読ラインにする
    const newest = items[0]?.createdAt ?? new Date().toISOString();
    const next = newest > seenAt ? newest : seenAt;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SEEN_AT_KEY, next);
    }
    setSeenAt(next);
  }, [items, seenAt]);

  return { items, unreadCount, markSeen, isLoading, seenAt };
}
