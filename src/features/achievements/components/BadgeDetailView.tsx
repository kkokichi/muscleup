"use client";

import Link from "next/link";
import { ArrowLeft, Lock, Trophy } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatDateShort } from "@/utils/date";
import { cn } from "@/lib/utils";
import { useAchievements } from "../hooks/useAchievements";
import {
  ACHIEVEMENT_ICONS,
  TIER_COLOR,
  TIER_LABEL,
} from "./achievementVisuals";

function BackAction() {
  return (
    <Link
      href="/achievements"
      aria-label="実績へ戻る"
      className="flex size-9 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors active:bg-secondary"
    >
      <ArrowLeft className="size-5" />
    </Link>
  );
}

function formatConditionLabel(type: string): string {
  switch (type) {
    case "total_workouts":
      return "ワークアウト回数";
    case "current_streak":
    case "longest_streak":
      return "連続トレーニング日数";
    case "pb_count":
      return "ベスト更新数";
    case "level":
      return "到達レベル";
    case "total_volume":
      return "累計負荷量";
    case "categories_trained":
      return "トレーニング済み部位";
    case "body_metrics":
      return "体組成記録";
    case "checkins":
      return "チェックイン";
    default:
      return "達成条件";
  }
}

export function BadgeDetailView() {
  const mounted = useHasMounted();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { progress, isLoading } = useAchievements();

  if (!mounted || isLoading) {
    return (
      <div>
        <PageHeader title="バッジ詳細" subtitle="達成条件と進捗" action={<BackAction />} />
        <div className="h-64 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  const item = progress.find((candidate) => candidate.achievement.id === id);
  if (!item) {
    return (
      <div>
        <PageHeader title="バッジ詳細" subtitle="見つかりません" action={<BackAction />} />
        <Card className="border-border bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-semibold">バッジが見つかりませんでした</p>
            <Link
              href="/achievements"
              className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
            >
              実績へ戻る
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { achievement, unlocked, current, unlockedAt } = item;
  const Icon = ACHIEVEMENT_ICONS[achievement.icon] ?? Trophy;
  const color = TIER_COLOR[achievement.tier];
  const pct = Math.min(100, Math.round((current / achievement.conditionValue) * 100));

  return (
    <div>
      <PageHeader title="バッジ詳細" subtitle="達成条件と進捗" action={<BackAction />} />

      <Card className="border-border bg-card">
        <CardContent className="p-5">
          <div className="flex flex-col items-center text-center">
            <div
              className="flex size-24 items-center justify-center rounded-full ring-1 ring-border"
              style={{ backgroundColor: unlocked ? `${color}22` : "var(--secondary)" }}
            >
              {unlocked ? (
                <Icon className="size-12" style={{ color }} />
              ) : (
                <Lock className="size-10 text-muted-foreground" />
              )}
            </div>
            <Badge className="mt-4" variant={unlocked ? "default" : "secondary"}>
              {unlocked ? "獲得済み" : "未獲得"} · {TIER_LABEL[achievement.tier]}
            </Badge>
            <h1 className="mt-3 text-2xl font-black">{achievement.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {achievement.description}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl bg-secondary/60 p-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold">
                  {formatConditionLabel(achievement.conditionType)}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {Math.min(current, achievement.conditionValue).toLocaleString()} /{" "}
                  {achievement.conditionValue.toLocaleString()}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-background/70">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Metric label="現在値" value={current.toLocaleString()} />
              <Metric
                label="獲得日"
                value={unlockedAt ? formatDateShort(unlockedAt) : "未獲得"}
              />
            </div>
          </div>

          <Link
            href="/achievements"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-5 w-full")}
          >
            バッジ一覧へ
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 px-3 py-3">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}
