"use client";

import { useEffect, useState } from "react";
import { Plus, Timer, X } from "lucide-react";
import { useRestTimerStore } from "@/stores/restTimerStore";
import { cn } from "@/lib/utils";

function formatRemaining(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function durationLabel(seconds: number): string {
  if (seconds % 60 === 0) return `${seconds / 60}分`;
  return `${seconds}秒`;
}

/**
 * レストタイマーのコンパクト表示。開始秒数は設定（defaultDurationSeconds）に従う。
 * 待機中は開始ボタン、計測中はカウントダウン・+30秒・停止を出す。
 */
export function RestTimerBar() {
  const { endsAt, defaultDurationSeconds, start, stop, addSeconds } =
    useRestTimerStore();
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
      <button
        type="button"
        onClick={() => start()}
        className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition-colors active:bg-secondary/70"
      >
        <Timer className="size-3.5 text-primary" />
        レスト {durationLabel(defaultDurationSeconds)}
      </button>
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
        className="flex h-6 shrink-0 items-center gap-0.5 rounded-full bg-background/20 px-1.5 text-[11px] font-bold transition-transform active:scale-90"
      >
        <Plus className="size-3" />
        30秒
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
