"use client";

import Link from "next/link";
import { ChevronRight, Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { categoryNameJa } from "@/data/categories";

interface TodayPlanCardProps {
  /** 提案部位。記録ゼロなら null（オンボーディング表示） */
  suggestedCategoryId: string | null;
  trainedToday: boolean;
}

/** 今日の予定（最も久しく鍛えていない部位を提案） */
export function TodayPlanCard({ suggestedCategoryId, trainedToday }: TodayPlanCardProps) {
  if (trainedToday) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-3 p-4">
          <Dumbbell className="size-5 text-primary" />
          <p className="text-sm font-semibold">
            今日のトレーニングは完了！ゆっくり回復しよう
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href="/workout/new" className="block">
      <Card className="border-border bg-card transition-colors active:bg-secondary/50">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Dumbbell className="size-5 text-primary" />
          </span>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">今日の予定</p>
            <p className="text-sm font-bold">
              {suggestedCategoryId
                ? `${categoryNameJa(suggestedCategoryId)}トレの日はどう？`
                : "最初のワークアウトを記録しよう！"}
            </p>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
