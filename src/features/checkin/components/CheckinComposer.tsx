"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LocateFixed, MapPin, X } from "lucide-react";
import type { CheckinDraft } from "@/types";
import { Button } from "@/components/ui/button";
import { DisplayNameInput } from "@/components/common/DisplayNameInput";
import { DEFAULT_MAP_CENTER, isMapsConfigured } from "@/lib/maps";
import { CheckinMapCanvas } from "./CheckinMapCanvas";

interface CheckinComposerProps {
  open: boolean;
  initialName: string;
  onClose: () => void;
  onSubmit: (draft: CheckinDraft, authorName: string) => Promise<void>;
}

interface LatLng {
  lat: number;
  lng: number;
}

/**
 * チェックイン作成シート。
 * 地図が使える場合はタップ or 現在地でピンを立て、
 * 使えない場合も現在地取得＋手入力でチェックインできる。
 */
export function CheckinComposer({
  open,
  initialName,
  onClose,
  onSubmit,
}: CheckinComposerProps) {
  const mapsOn = isMapsConfigured();
  const [name, setName] = useState(initialName);
  const [gymName, setGymName] = useState("");
  const [comment, setComment] = useState("");
  const [pos, setPos] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // シートが開いた瞬間に最新の表示名を反映（Reactのprop変化時リセットパターン）
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setName(initialName);
  }

  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("この端末では位置情報が使えません");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocating(false);
      },
      () => {
        setGeoError("位置情報を取得できませんでした（許可が必要です）");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const canSubmit = gymName.trim().length > 0 && pos !== null && !saving;

  const handleSubmit = async () => {
    if (!pos || !gymName.trim()) return;
    setSaving(true);
    try {
      await onSubmit(
        { gymName: gymName.trim(), lat: pos.lat, lng: pos.lng, comment: comment.trim() },
        name,
      );
      setGymName("");
      setComment("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="checkin-overlay"
          className="fixed inset-0 z-40 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {open && (
        <motion.div
          key="checkin-sheet"
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-md flex-col overflow-y-auto rounded-t-3xl border-t border-border bg-popover"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
        >
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <h2 className="text-lg font-bold">ジムにチェックイン</h2>
            <button
              type="button"
              aria-label="閉じる"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-3 px-5 pb-8">
            {mapsOn ? (
              <>
                <p className="text-xs text-muted-foreground">
                  地図をタップして場所を選ぶか、現在地ボタンを押してください
                </p>
                <CheckinMapCanvas
                  checkins={[]}
                  center={pos ?? DEFAULT_MAP_CENTER}
                  draftPin={pos}
                  onPickLocation={setPos}
                  height={220}
                />
              </>
            ) : (
              <div className="rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                地図（Google Maps）は未設定のため、現在地の座標でチェックインします。
                <br />
                設定すると地図上にピンとコメントが表示されます。
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={locate}
                disabled={locating}
              >
                <LocateFixed className="size-4" data-icon="inline-start" />
                {locating ? "取得中…" : "現在地を使う"}
              </Button>
              {pos && (
                <span className="flex items-center gap-1 text-[11px] text-primary">
                  <MapPin className="size-3.5" />
                  位置OK
                </span>
              )}
            </div>
            {geoError && <p className="text-[11px] text-destructive">{geoError}</p>}

            <input
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              placeholder="ジム・場所の名前（必須）"
              maxLength={40}
              className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメント（今日の意気込み・混雑状況など）"
              rows={2}
              maxLength={140}
              className="w-full resize-none rounded-xl border border-border bg-card p-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <DisplayNameInput value={name} onChange={setName} />

            <Button
              size="lg"
              className="w-full"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {saving ? "チェックイン中…" : "チェックインする"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
