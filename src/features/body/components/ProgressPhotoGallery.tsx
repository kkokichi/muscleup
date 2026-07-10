"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/utils/date";
import { useProgressPhotos } from "../hooks/useProgressPhotos";

/** 進捗写真ギャラリー（撮影・アップロード・削除） */
export function ProgressPhotoGallery() {
  const { photos, isLoading, addProgressPhoto, removePhoto } = useProgressPhotos();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 同じファイルを連続選択できるようにリセット
    if (!file) return;
    setUploading(true);
    try {
      await addProgressPhoto(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">進捗写真</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="size-4" data-icon="inline-start" />
          {uploading ? "追加中…" : "写真を追加"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-secondary/50" />
      ) : photos.length === 0 ? (
        <p className="rounded-xl bg-secondary/40 py-8 text-center text-xs text-muted-foreground">
          before/after を残すとモチベーションが続きます。最初の1枚を撮ろう！
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary"
            >
              <Image
                src={photo.url}
                alt={`進捗写真 ${photo.date}`}
                fill
                unoptimized
                className="object-cover"
              />
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
                {formatDateShort(photo.date)}
              </span>
              <button
                type="button"
                aria-label="写真を削除"
                onClick={() => removePhoto(photo.id)}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
