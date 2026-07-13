"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/common/FadeIn";
import { useHasMounted } from "@/hooks/useHasMounted";
import type { AchievementProgress, AchievementTier } from "@/types";
import { useAchievements } from "@/features/achievements/hooks/useAchievements";
import { AchievementBadge } from "@/features/achievements/components/AchievementBadge";
import { TIER_COLOR, TIER_LABEL } from "@/features/achievements/components/achievementVisuals";

const TIER_ORDER: AchievementTier[] = ["gold", "silver", "bronze"];

/** 実績バッジ専用のコレクションページ（グレード別に一覧） */
export function BadgeCollectionView() {
  const mounted = useHasMounted();
  const { progress, unlockedCount, total, isLoading } = useAchievements();

  const byTier = useMemo(() => {
    const groups = new Map<AchievementTier, AchievementProgress[]>();
    for (const tier of TIER_ORDER) groups.set(tier, []);
    for (const item of progress) {
      groups.get(item.achievement.tier)?.push(item);
    }
    return groups;
  }, [progress]);

  if (!mounted || isLoading) {
    return (
      <div>
        <PageHeader title="バッジ" subtitle="実績コレクション" />
        <div className="h-40 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  const pct = total === 0 ? 0 : Math.round((unlockedCount / total) * 100);

  return (
    <div>
      <PageHeader
        title="バッジ"
        subtitle="実績コレクション"
        action={
          <span className="text-sm font-bold tabular-nums text-primary">
            {unlockedCount}
            <span className="text-muted-foreground"> / {total}</span>
          </span>
        }
      />

      <Card className="mb-5 border-border bg-card">
        <CardContent className="p-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold">コンプリート率</span>
            <span className="text-muted-foreground tabular-nums">{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
            {TIER_ORDER.map((tier) => {
              const items = byTier.get(tier) ?? [];
              const unlocked = items.filter((i) => i.unlocked).length;
              return (
                <div key={tier} className="text-center">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: TIER_COLOR[tier] }}
                  >
                    {TIER_LABEL[tier]}
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    {unlocked}
                    <span className="text-muted-foreground"> / {items.length}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {TIER_ORDER.map((tier) => {
          const items = byTier.get(tier) ?? [];
          if (items.length === 0) return null;
          return (
            <section key={tier}>
              <div className="mb-2.5 flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: TIER_COLOR[tier] }}
                />
                <h2 className="text-sm font-bold">{TIER_LABEL[tier]}</h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {items.filter((i) => i.unlocked).length} / {items.length}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {items.map((item, i) => (
                  <FadeIn key={item.achievement.id} delay={Math.min(i * 0.03, 0.3)}>
                    <AchievementBadge item={item} />
                  </FadeIn>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
