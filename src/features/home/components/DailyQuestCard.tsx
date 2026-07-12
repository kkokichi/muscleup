"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { WorkoutLog } from "@/types";
import { buildDailyQuests } from "@/services/questService";
import { cn } from "@/lib/utils";

export function DailyQuestCard({ logs }: { logs: WorkoutLog[] }) {
  const quests = buildDailyQuests(logs);
  const completedCount = quests.filter((quest) => quest.completed).length;
  const completedXp = quests.reduce(
    (sum, quest) => sum + (quest.completed ? quest.xp : 0),
    0,
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
            本日のクエスト達成。バッジ獲得ッス。
          </div>
        ) : (
          <Link
            href="/workout/new"
            className={cn(buttonVariants({ size: "lg" }), "mt-3 w-full")}
          >
            クエストを進める
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
