"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/common/FadeIn";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useHomeStats } from "@/hooks/useHomeStats";
import { useExercises } from "@/hooks/useExercises";
import { suggestNextCategory } from "@/services/statsService";
import { MUSCLE_CATEGORY_IDS } from "@/types";
import { formatDateJa } from "@/utils/date";
import { todayISO } from "@/utils/date";
import { MascotGreetingCard } from "./MascotGreetingCard";
import { StatsGrid } from "./StatsGrid";
import { WeeklyCard } from "./WeeklyCard";
import { TodayPlanCard } from "./TodayPlanCard";
import { RecentWorkoutsList } from "./RecentWorkoutsList";

export function HomeDashboard() {
  const mounted = useHasMounted();
  const { stats, isLoading } = useHomeStats();
  const { byId } = useExercises();

  const suggestedCategoryId = useMemo(
    () =>
      suggestNextCategory(
        stats.logs,
        (id) => byId.get(id)?.categoryId,
        [...MUSCLE_CATEGORY_IDS],
      ),
    [stats.logs, byId],
  );

  if (!mounted || isLoading) {
    return (
      <div>
        <PageHeader title="MuscleUp" subtitle={formatDateJa(todayISO())} />
        <div className="h-28 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="MuscleUp" subtitle={formatDateJa(todayISO())} />
      <div className="space-y-4">
        <FadeIn>
          <MascotGreetingCard
            streak={stats.streak}
            trainedToday={stats.trainedToday}
            weeklyCount={stats.weekly.count}
          />
        </FadeIn>
        <FadeIn delay={0.05}>
          <TodayPlanCard
            suggestedCategoryId={suggestedCategoryId}
            trainedToday={stats.trainedToday}
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <StatsGrid
            streak={stats.streak}
            levelInfo={stats.levelInfo}
            levelTitle={stats.levelTitle}
            pbCount={stats.pbCount}
          />
        </FadeIn>
        <FadeIn delay={0.15}>
          <WeeklyCard weekly={stats.weekly} />
        </FadeIn>
        <FadeIn delay={0.2}>
          <RecentWorkoutsList logs={stats.recentLogs} exerciseById={byId} />
        </FadeIn>
      </div>
    </div>
  );
}
