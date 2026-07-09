"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExerciseAdvice } from "@/types";
import { getRepos } from "@/repositories";
import { getAuthorId } from "@/lib/firebase";
import { createId } from "@/utils/id";
import { readStorage, writeStorage } from "@/repositories/local/storage";

/** 端末でいいね済みのアドバイスID（二重いいね防止・トグル用） */
const LIKED_KEY = "likedAdvice";

/** 種目ごとのアドバイス取得・投稿・いいね */
export function useExerciseAdvice(exerciseId: string) {
  const [advice, setAdvice] = useState<ExerciseAdvice[]>([]);
  // localStorage は SSR ガード済み。初回レンダリング時に一度だけ読み込む
  const [likedIds, setLikedIds] = useState<Set<string>>(
    () => new Set(readStorage<string[]>(LIKED_KEY, [])),
  );
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    const repos = await getRepos();
    setAdvice(await repos.advice.getByExercise(exerciseId));
  }, [exerciseId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const repos = await getRepos();
        const list = await repos.advice.getByExercise(exerciseId);
        if (!cancelled) setAdvice(list);
      } catch (e) {
        console.error("アドバイスの読み込みに失敗", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  const postAdvice = useCallback(
    async (body: string, authorName: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const repos = await getRepos();
      const item: ExerciseAdvice = {
        id: createId(),
        exerciseId,
        userId: await getAuthorId(),
        authorName,
        body: trimmed,
        createdAt: new Date().toISOString(),
        likeCount: 0,
      };
      await repos.advice.create(item);
      await reload();
    },
    [exerciseId, reload],
  );

  const toggleLike = useCallback(
    async (id: string) => {
      const liked = likedIds.has(id);
      const delta = liked ? -1 : 1;
      const repos = await getRepos();
      await repos.advice.updateLikes(id, delta);

      const nextLiked = new Set(likedIds);
      if (liked) nextLiked.delete(id);
      else nextLiked.add(id);
      setLikedIds(nextLiked);
      writeStorage(LIKED_KEY, [...nextLiked]);

      // 楽観的更新
      setAdvice((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, likeCount: Math.max(0, a.likeCount + delta) } : a,
        ),
      );
    },
    [likedIds],
  );

  return { advice, likedIds, isLoading, postAdvice, toggleLike };
}
