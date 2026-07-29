"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CheckinReaction, CheckinReactionType } from "@/types";
import { getRepos } from "@/repositories";

interface UseCheckinReactionsArgs {
  checkinId: string;
  /** 閲覧中ユーザーのUID（未ログインなら null） */
  currentUserId: string | null;
  /** 閲覧中ユーザーの表示名（リアクションの非正規化用） */
  currentUserName: string;
}

/**
 * 1件のチェックインに対するリアクションの取得・トグル。
 * 押下は楽観的に反映し、失敗したら元に戻す。
 */
export function useCheckinReactions({
  checkinId,
  currentUserId,
  currentUserName,
}: UseCheckinReactionsArgs) {
  const [reactions, setReactions] = useState<CheckinReaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.checkins.getReactions(checkinId))
      .then((list) => {
        if (!cancelled) setReactions(list);
      })
      .catch((e) => console.error("リアクションの読み込みに失敗", e))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [checkinId]);

  /** 種別ごとの件数 */
  const counts = useMemo(() => {
    const map: Record<CheckinReactionType, number> = {
      muscle: 0,
      fire: 0,
      good: 0,
    };
    for (const r of reactions) map[r.type] += 1;
    return map;
  }, [reactions]);

  /** 自分が押している種別（未ログイン or 未リアクションなら null） */
  const myType = useMemo(
    () =>
      currentUserId
        ? (reactions.find((r) => r.userId === currentUserId)?.type ?? null)
        : null,
    [reactions, currentUserId],
  );

  const toggle = useCallback(
    async (type: CheckinReactionType) => {
      if (!currentUserId) return; // 未ログインは押せない
      const previous = reactions;
      const others = reactions.filter((r) => r.userId !== currentUserId);
      // 同じ種別をもう一度＝取り消し。違う種別＝付け替え。
      const next: CheckinReaction | null =
        myType === type
          ? null
          : {
              userId: currentUserId,
              authorName: currentUserName,
              type,
              createdAt: new Date().toISOString(),
            };
      setReactions(next ? [...others, next] : others); // 楽観更新
      try {
        const repos = await getRepos();
        await repos.checkins.setReaction(
          checkinId,
          currentUserId,
          next ? { authorName: next.authorName, type: next.type, createdAt: next.createdAt } : null,
        );
      } catch (e) {
        console.error("リアクションの保存に失敗", e);
        setReactions(previous); // 失敗したら戻す
      }
    },
    [reactions, myType, currentUserId, currentUserName, checkinId],
  );

  return { counts, myType, toggle, isLoading, canReact: Boolean(currentUserId) };
}
