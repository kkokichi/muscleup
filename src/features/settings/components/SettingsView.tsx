"use client";

import { Bell, Info, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { DisplayNameInput } from "@/components/common/DisplayNameInput";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useUserName } from "@/hooks/useUserName";
import { useRestTimerStore } from "@/stores/restTimerStore";
import { cn } from "@/lib/utils";
import { useReminderSettings } from "../hooks/useReminderSettings";
import { AccountSection } from "./AccountSection";

const REST_PRESETS = [30, 60, 90, 120, 150, 180] as const;

function restLabel(seconds: number): string {
  return seconds % 60 === 0 ? `${seconds / 60}分` : `${seconds}秒`;
}

export function SettingsView() {
  const mounted = useHasMounted();
  const { name, saveName } = useUserName();
  const { settings, permission, update, enable } = useReminderSettings();
  const restDuration = useRestTimerStore((s) => s.defaultDurationSeconds);
  const setRestDuration = useRestTimerStore((s) => s.setDefaultDuration);

  return (
    <div>
      <PageHeader title="設定" subtitle="プロフィール・通知" />

      <div className="space-y-4">
        <AccountSection />
        <ThemeToggle />

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="mb-2 text-sm font-semibold">表示名</p>
            <DisplayNameInput
              value={name}
              onChange={(v) => saveName(v)}
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              チェックインやアドバイス投稿で表示される名前です
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <Timer className="size-4 text-primary" />
              <p className="text-sm font-semibold">レストタイマーの時間</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {REST_PRESETS.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => setRestDuration(seconds)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    mounted && restDuration === seconds
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground",
                  )}
                >
                  {restLabel(seconds)}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              記録画面の「レスト」開始時に使う時間です（「＋30秒」で延長できます）
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                <p className="text-sm font-semibold">トレーニングリマインダー</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.enabled}
                aria-label="リマインダーを有効化"
                onClick={() =>
                  settings.enabled ? update({ enabled: false }) : enable()
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  settings.enabled ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
                    settings.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {settings.enabled && (
              <label className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">通知する時刻</span>
                <input
                  type="time"
                  value={settings.time}
                  onChange={(e) => update({ time: e.target.value })}
                  className="h-10 rounded-xl border border-border bg-card px-3 text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            )}

            {mounted && permission === "denied" && (
              <p className="text-[11px] text-destructive">
                ブラウザの通知がブロックされています。設定から許可してください。
              </p>
            )}
            {mounted && permission === "unsupported" && settings.enabled && (
              <p className="text-[11px] text-muted-foreground">
                この環境ではブラウザ通知が使えません。アプリを開いた時に
                ホーム画面でリマインドします。
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-secondary/40">
          <CardContent className="flex gap-2 p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              現在のリマインダーは、設定時刻以降にアプリを開いた時に通知・ナッジします。
              アプリを閉じている間に届くプッシュ通知は、iPhoneでは
              「ホーム画面に追加」でインストールし、サーバー側の配信基盤（FCM等）を
              有効にすると利用できます（今後の対応）。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
