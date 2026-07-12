"use client";

import Link from "next/link";
import { Lock, Trophy } from "lucide-react";
import type { AchievementProgress } from "@/types";
import { cn } from "@/lib/utils";
import { ACHIEVEMENT_ICONS, TIER_COLOR } from "./achievementVisuals";

export function AchievementBadge({ item }: { item: AchievementProgress }) {
  const { achievement, unlocked, current } = item;
  const Icon = ACHIEVEMENT_ICONS[achievement.icon] ?? Trophy;
  const color = TIER_COLOR[achievement.tier];
  const pct = Math.min(100, Math.round((current / achievement.conditionValue) * 100));

  return (
    <Link
      href={`/achievements/detail?id=${achievement.id}`}
      className={cn(
        "flex h-full flex-col items-center rounded-2xl border p-3 text-center transition-colors active:bg-secondary/50",
        unlocked ? "border-border bg-card" : "border-border/60 bg-card/40",
      )}
    >
      <div
        className="relative flex size-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: unlocked ? `${color}22` : "var(--secondary)",
        }}
      >
        {unlocked ? (
          <Icon className="size-7" style={{ color }} />
        ) : (
          <Lock className="size-6 text-muted-foreground" />
        )}
      </div>
      <p
        className={cn(
          "mt-2 text-xs font-bold leading-tight",
          !unlocked && "text-muted-foreground",
        )}
      >
        {achievement.title}
      </p>
      <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
        {achievement.description}
      </p>
      {!unlocked && (
        <div className="mt-2 w-full">
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary/70"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-[9px] text-muted-foreground tabular-nums">
            {Math.min(current, achievement.conditionValue).toLocaleString()} /{" "}
            {achievement.conditionValue.toLocaleString()}
          </p>
        </div>
      )}
    </Link>
  );
}
