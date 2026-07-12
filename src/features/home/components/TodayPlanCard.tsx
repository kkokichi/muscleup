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

/** 今日はどこを鍛えるかを細く提案する */
export function TodayPlanCard({ suggestedCategoryId, trainedToday }: TodayPlanCardProps) {
  if (trainedToday) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-2.5 p-3">
          <Dumbbell className="size-4 text-primary" />
          <p className="text-xs font-semibold">
            今日のトレーニングは完了！ゆっくり回復しよう
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href="/workout/new" className="block">
      <Card className="border-border bg-card transition-colors active:bg-secondary/50">
        <CardContent className="flex items-center gap-2.5 p-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10">
            <Dumbbell className="size-4 text-primary" />
          </span>
          <div className="flex-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              今日はどこを鍛える？
            </p>
            <p className="text-xs font-semibold">
              {suggestedCategoryId
                ? `${categoryNameJa(suggestedCategoryId)}トレの日はどう？`
                : "最初のワークアウトを記録しよう！"}
            </p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
