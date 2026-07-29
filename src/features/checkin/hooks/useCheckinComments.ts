"use client";

import { useCallback, useEffect, useState } from "react";
import type { CheckinComment } from "@/types";
import { getRepos } from "@/repositories";
import { createId } from "@/utils/id";

interface UseCheckinCommentsArgs {
  checkinId: string;
  /** 閲覧中ユーザーのUID（未ログインなら null） */
  currentUserId: string | null;
  /** 閲覧中ユーザーの表示名 */
  currentUserName: string;
}

/**
 * 1件のチェックインへのコメントの取得・投稿・削除。
 * 投稿/削除は楽観的に反映し、失敗したら元に戻す。
 */
export function useCheckinComments({
  checkinId,
  currentUserId,
  currentUserName,
}: UseCheckinCommentsArgs) {
  const [comments, setComments] = useState<CheckinComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.checkins.getComments(checkinId))
      .then((list) => {
        if (!cancelled) setComments(list);
      })
      .catch((e) => console.error("コメントの読み込みに失敗", e))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [checkinId]);

  const add = useCallback(
    async (raw: string): Promise<boolean> => {
      const body = raw.trim();
      if (!body || !currentUserId) return false;
      const comment: CheckinComment = {
        id: createId(),
        userId: currentUserId,
        authorName: currentUserName,
        body,
        createdAt: new Date().toISOString(),
      };
      setPosting(true);
      setComments((prev) => [comment, ...prev]); // 楽観更新（新しい順）
      try {
        const repos = await getRepos();
        await repos.checkins.addComment(checkinId, comment);
        return true;
      } catch (e) {
        console.error("コメントの投稿に失敗", e);
        setComments((prev) => prev.filter((c) => c.id !== comment.id)); // 戻す
        return false;
      } finally {
        setPosting(false);
      }
    },
    [checkinId, currentUserId, currentUserName],
  );

  const remove = useCallback(
    async (commentId: string) => {
      const previous = comments;
      setComments((prev) => prev.filter((c) => c.id !== commentId)); // 楽観更新
      try {
        const repos = await getRepos();
        await repos.checkins.deleteComment(checkinId, commentId);
      } catch (e) {
        console.error("コメントの削除に失敗", e);
        setComments(previous); // 戻す
      }
    },
    [checkinId, comments],
  );

  return {
    comments,
    isLoading,
    posting,
    add,
    remove,
    canPost: Boolean(currentUserId),
  };
}
