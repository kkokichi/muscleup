import Link from "next/link";
import { Flame, Trophy, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LevelInfo } from "@/services/levelService";

interface StatsGridProps {
  streak: number;
  levelInfo: LevelInfo;
  levelTitle: string;
  pbCount: number;
}

/** 継続日数 / レベル / 自己ベスト更新数のグリッド */
export function StatsGrid({ streak, levelInfo, levelTitle, pbCount }: StatsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center gap-1 p-3.5">
          <Flame
            className={streak > 0 ? "size-5 text-orange-400" : "size-5 text-muted-foreground"}
          />
          <p className="text-xl font-bold tabular-nums">{streak}</p>
          <p className="text-[10px] text-muted-foreground">継続日数</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center gap-1 p-3.5">
          <Zap className="size-5 text-primary" />
          <p className="text-xl font-bold tabular-nums">Lv.{levelInfo.level}</p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round(levelInfo.progress * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">{levelTitle}</p>
        </CardContent>
      </Card>

      <Link href="/achievements" aria-label="ベスト更新詳細">
        <Card className="h-full border-border bg-card transition-colors active:bg-secondary/50">
          <CardContent className="flex flex-col items-center gap-1 p-3.5">
            <Trophy className="size-5 text-yellow-400" />
            <p className="text-xl font-bold tabular-nums">{pbCount}</p>
            <p className="text-[10px] text-muted-foreground">ベスト更新</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
