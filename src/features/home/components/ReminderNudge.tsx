"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useHasMounted } from "@/hooks/useHasMounted";
import {
  getReminderSettings,
  maybeFireBrowserNotification,
  shouldNudge,
} from "@/lib/notifications";

/**
 * リマインダー時刻を過ぎても未トレーニングの時に表示するアプリ内ナッジ。
 * 対応環境ではブラウザ通知も1日1回発火する（権限がある場合）。
 */
export function ReminderNudge({ trainedToday }: { trainedToday: boolean }) {
  const mounted = useHasMounted();
  const fired = useRef(false);

  // localStorage/Date に依存するため、マウント後にのみ判定（SSR不一致回避）
  const show = mounted && shouldNudge(getReminderSettings(), trainedToday);

  useEffect(() => {
    if (!mounted || fired.current) return;
    fired.current = true;
    maybeFireBrowserNotification(trainedToday);
  }, [mounted, trainedToday]);

  if (!show) return null;

  return (
    <Link href="/workout/new" className="block">
      <Card className="border-primary/30 bg-primary/5 transition-colors active:bg-primary/10">
        <CardContent className="flex items-center gap-3 p-4">
          <Bell className="size-5 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-bold">今日のトレーニングはまだッス！</p>
            <p className="text-[11px] text-muted-foreground">
              5分だけでもOK。ストリークを守ろう🔥
            </p>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
