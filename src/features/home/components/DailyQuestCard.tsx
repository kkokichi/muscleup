"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { WorkoutLog } from "@/types";
import { QUEST_STREAK_BONUS_TIERS } from "@/services/questService";
import { formatDateShort } from "@/utils/date";
import { cn } from "@/lib/utils";
import { useDailyQuestProgress } from "../hooks/useDailyQuestProgress";

export function DailyQuestCard({ logs }: { logs: WorkoutLog[] }) {
  const {
    quests,
    history,
    bonusHistory,
    newBonus,
    newlyCompletedCount,
    perfectStreak,
  } = useDailyQuestProgress(logs);
  const completedCount = quests.filter((quest) => quest.completed).length;
  const completedXp = quests.reduce(
    (sum, quest) => sum + (quest.completed ? quest.xp : 0),
    0,
  );
  const nextBonus = QUEST_STREAK_BONUS_TIERS.find(
    (tier) => tier.streakDays > perfectStreak,
  );

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold">今日のクエスト</p>
            <p className="text-xs text-muted-foreground">
              3つ以内の小さな目標で続けやすく
            </p>
          </div>
          <Badge variant={completedCount > 0 ? "default" : "secondary"}>
            +{completedXp} XP
          </Badge>
        </div>

        <div className="mb-3 rounded-2xl bg-secondary/60 px-3 py-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold">完全達成ストリーク</span>
            <span className="font-black text-primary tabular-nums">
              {perfectStreak}日
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {nextBonus
              ? `次のボーナス: ${nextBonus.streakDays}日連続で +${nextBonus.xp} XP`
              : "全ボーナス獲得済み。継続記録を伸ばそう。"}
          </p>
        </div>

        <div className="space-y-2">
          {quests.map((quest) => {
            const Icon = quest.completed ? CheckCircle2 : Circle;
            return (
              <div
                key={quest.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5",
                  quest.completed ? "bg-primary/10" : "bg-secondary/60",
                )}
              >
                <Icon
                  className={cn(
                    "size-5 shrink-0",
                    quest.completed ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{quest.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {quest.description}
                  </p>
                </div>
                <span className="rounded-full bg-background/70 px-2 py-1 text-[10px] font-bold text-primary tabular-nums">
                  +{quest.xp}
                </span>
              </div>
            );
          })}
        </div>

        {completedCount === quests.length ? (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
            <Gift className="size-4" />
            本日のクエスト達成。履歴に保存済みッス。
          </div>
        ) : (
          <Link
            href="/workout/new"
            className={cn(buttonVariants({ size: "lg" }), "mt-3 w-full")}
          >
            クエストを進める
          </Link>
        )}

        {newlyCompletedCount > 0 && (
          <div className="mt-3 rounded-2xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
            新しく{newlyCompletedCount}件のクエストを達成しました。
          </div>
        )}

        {newBonus && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
            <Gift className="size-4" />
            {newBonus.title}で +{newBonus.xp} XP ボーナス獲得
          </div>
        )}

        <div className="mt-4 border-t border-border/60 pt-3">
          <p className="mb-2 text-xs font-bold">達成履歴</p>
          {history.length === 0 ? (
            <p className="rounded-2xl bg-secondary/60 px-3 py-3 text-center text-xs text-muted-foreground">
              今日のクエストを達成すると履歴が残ります。
            </p>
          ) : (
            <div className="space-y-1.5">
              {history.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2 text-xs"
                >
                  <span className="truncate font-semibold">{item.title}</span>
                  <span className="ml-2 shrink-0 text-muted-foreground">
                    {formatDateShort(item.date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {bonusHistory.length > 0 && (
          <div className="mt-4 border-t border-border/60 pt-3">
            <p className="mb-2 text-xs font-bold">ボーナス履歴</p>
            <div className="space-y-1.5">
              {bonusHistory.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2 text-xs"
                >
                  <span className="truncate font-semibold">{item.title}</span>
                  <span className="ml-2 shrink-0 text-primary tabular-nums">
                    +{item.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
