"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/common/FadeIn";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useHomeStats } from "@/hooks/useHomeStats";
import { useExercises } from "@/hooks/useExercises";
import { formatDateJa } from "@/utils/date";
import { todayISO } from "@/utils/date";
import { MascotGreetingCard } from "./MascotGreetingCard";
import { StatsGrid } from "./StatsGrid";
import { MuscleLastTrainedCard } from "./MuscleLastTrainedCard";
import { RecentWorkoutsList } from "./RecentWorkoutsList";
import { ReminderNudge } from "./ReminderNudge";
import { HomeQuickLinks } from "./HomeQuickLinks";
import { VolumeSummaryCard } from "./VolumeSummaryCard";
import { MonthlyCalendarCard } from "./MonthlyCalendarCard";

const settingsAction = (
  <Link
    href="/settings"
    aria-label="設定"
    className="flex size-9 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors active:bg-secondary"
  >
    <Settings className="size-5" />
  </Link>
);

export function HomeDashboard() {
  const mounted = useHasMounted();
  const { stats, isLoading } = useHomeStats();
  const { byId } = useExercises();

  if (!mounted || isLoading) {
    return (
      <div>
        <PageHeader
          title="MuscleUp"
          subtitle={formatDateJa(todayISO())}
          action={settingsAction}
        />
        <div className="h-28 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="MuscleUp"
        subtitle={formatDateJa(todayISO())}
        action={settingsAction}
      />
      <div className="space-y-4">
        <FadeIn>
          <MascotGreetingCard
            streak={stats.streak}
            trainedToday={stats.trainedToday}
            weeklyCount={stats.weekly.count}
          />
        </FadeIn>
        <ReminderNudge trainedToday={stats.trainedToday} />
        <FadeIn delay={0.05}>
          <MuscleLastTrainedCard logs={stats.logs} exerciseById={byId} />
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <MonthlyCalendarCard logs={stats.logs} />
            </div>
            <VolumeSummaryCard logs={stats.logs} variant="compact" />
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <StatsGrid
            streak={stats.streak}
            levelInfo={stats.levelInfo}
            levelTitle={stats.levelTitle}
            pbCount={stats.pbCount}
          />
        </FadeIn>
        <FadeIn delay={0.25}>
          <HomeQuickLinks />
        </FadeIn>
        <FadeIn delay={0.3}>
          <RecentWorkoutsList logs={stats.recentLogs} exerciseById={byId} />
        </FadeIn>
      </div>
    </div>
  );
}
