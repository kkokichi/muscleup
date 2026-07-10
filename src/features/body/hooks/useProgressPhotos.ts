"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProgressPhoto } from "@/types";
import { addPhoto, deletePhoto, getAllPhotos } from "@/lib/photoStore";
import { createId } from "@/utils/id";
import { todayISO } from "@/utils/date";

type PhotoWithUrl = ProgressPhoto & { url: string };

/** 進捗写真の読み込み・追加・削除（IndexedDBに保存） */
export function useProgressPhotos() {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 生成した ObjectURL を破棄するために保持
  const urlsRef = useRef<string[]>([]);

  const load = useCallback(async () => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    const list = await getAllPhotos();
    urlsRef.current = list.map((p) => p.url);
    setPhotos(list);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getAllPhotos()
      .then((list) => {
        if (cancelled) return;
        urlsRef.current = list.map((p) => p.url);
        setPhotos(list);
      })
      .catch((e) => console.error("進捗写真の読み込みに失敗", e))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const addProgressPhoto = useCallback(
    async (blob: Blob, date: string = todayISO()) => {
      await addPhoto(
        { id: createId(), date, createdAt: new Date().toISOString() },
        blob,
      );
      await load();
    },
    [load],
  );

  const removePhoto = useCallback(
    async (id: string) => {
      await deletePhoto(id);
      await load();
    },
    [load],
  );

  return { photos, isLoading, addProgressPhoto, removePhoto };
}
