"use client";

import { useEffect, useState } from "react";
import { Pause, Plus, Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRestTimerStore } from "@/stores/restTimerStore";
import { cn } from "@/lib/utils";

function formatRemaining(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function RestTimerBar() {
  const { endsAt, durationSeconds, start, stop, addSeconds } = useRestTimerStore();
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

  return (
    <div
      className={cn(
        "mb-4 rounded-2xl border p-3 transition-colors",
        active ? "border-primary/40 bg-primary/10" : "border-border bg-card",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-secondary">
            <Timer className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">レスト</p>
            <p className="text-xl font-black tabular-nums">
              {active ? (done ? "次セットへ" : formatRemaining(remaining)) : "待機中"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[60, 90, 120].map((seconds) => (
            <Button
              key={seconds}
              variant={durationSeconds === seconds && active ? "default" : "secondary"}
              size="sm"
              onClick={() => start(seconds)}
            >
              {seconds / 60 === 1.5 ? "90秒" : `${seconds / 60}分`}
            </Button>
          ))}
          {active && (
            <>
              <Button
                variant="secondary"
                size="icon"
                aria-label="レストを30秒延長"
                onClick={() => addSeconds(30)}
              >
                <Plus className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="レストを停止"
                onClick={stop}
              >
                {done ? <X className="size-4" /> : <Pause className="size-4" />}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
