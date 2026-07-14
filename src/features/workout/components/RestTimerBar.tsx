"use client";

import { useEffect, useState } from "react";
import { Plus, Timer, X } from "lucide-react";
import { useRestTimerStore } from "@/stores/restTimerStore";
import { cn } from "@/lib/utils";

const PRESETS = [60, 90, 120] as const;

function formatRemaining(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function presetLabel(seconds: number): string {
  if (seconds === 90) return "90秒";
  return `${seconds / 60}分`;
}

/**
 * レストタイマーのコンパクト表示。ワークアウト画面上部（旧・保存ステータスの位置）に置き、
 * 待機中はプリセットのチップ、計測中はカウントダウンと操作を出す。
 */
export function RestTimerBar() {
  const { endsAt, start, stop, addSeconds } = useRestTimerStore();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const initial = setTimeout(() => setNow(Date.now()), 0);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, []);

  const remaining =
    endsAt && now ? Math.ceil((new Date(endsAt).getTime() - now) / 1000) : 0;

  const active = Boolean(endsAt);
  const done = active && remaining <= 0;

  if (!active) {
    return (
      <div className="flex items-center gap-1">
        <Timer className="size-3.5 shrink-0 text-muted-foreground" />
        {PRESETS.map((seconds) => (
          <button
            key={seconds}
            type="button"
            onClick={() => start(seconds)}
            className="rounded-full bg-secondary px-2 py-1 text-[11px] font-semibold text-foreground transition-colors active:bg-secondary/70"
          >
            {presetLabel(seconds)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full px-1.5 py-1",
        done ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
      )}
    >
      <Timer className="size-3.5 shrink-0" />
      <span className="min-w-11 text-center text-sm font-black tabular-nums">
        {done ? "次へ" : formatRemaining(remaining)}
      </span>
      <button
        type="button"
        aria-label="レストを30秒延長"
        onClick={() => addSeconds(30)}
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background/20 transition-transform active:scale-90"
      >
        <Plus className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label="レストを停止"
        onClick={stop}
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background/20 transition-transform active:scale-90"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
