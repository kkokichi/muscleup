"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/common/FadeIn";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useAchievements } from "../hooks/useAchievements";
import { AchievementBadge } from "./AchievementBadge";

export function AchievementsView() {
  const mounted = useHasMounted();
  const { progress, unlockedCount, total, isLoading } = useAchievements();

  if (!mounted || isLoading) {
    return (
      <div>
        <PageHeader title="実績" subtitle="バッジコレクション" />
        <div className="h-40 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="実績"
        subtitle="バッジコレクション"
        action={
          <span className="text-sm font-bold tabular-nums text-primary">
            {unlockedCount}
            <span className="text-muted-foreground">/{total}</span>
          </span>
        }
      />

      <Card className="mb-4 border-border bg-card">
        <CardContent className="p-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold">コンプリート率</span>
            <span className="text-muted-foreground tabular-nums">
              {Math.round((unlockedCount / total) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(unlockedCount / total) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2.5">
        {progress.map((item, i) => (
          <FadeIn key={item.achievement.id} delay={Math.min(i * 0.03, 0.3)}>
            <AchievementBadge item={item} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
