"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/common/FadeIn";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useHomeStats } from "@/hooks/useHomeStats";
import { MascotGreetingCard } from "@/features/home/components/MascotGreetingCard";
import { MascotEvolutionCard } from "@/features/home/components/MascotEvolutionCard";
import { DailyQuestCard } from "@/features/home/components/DailyQuestCard";

const backAction = (
  <Link
    href="/"
    aria-label="ホームへ戻る"
    className="flex size-9 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors active:bg-secondary"
  >
    <ArrowLeft className="size-5" />
  </Link>
);

export function MassuView() {
  const mounted = useHasMounted();
  const { stats, isLoading } = useHomeStats();

  if (!mounted || isLoading) {
    return (
      <div>
        <PageHeader title="マッスー" subtitle="応援・進化・クエスト" action={backAction} />
        <div className="h-40 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="マッスー" subtitle="応援・進化・クエスト" action={backAction} />
      <div className="space-y-4">
        <FadeIn>
          <MascotGreetingCard
            streak={stats.streak}
            trainedToday={stats.trainedToday}
            weeklyCount={stats.weekly.count}
          />
        </FadeIn>
        <FadeIn delay={0.05}>
          <MascotEvolutionCard totalXp={stats.xp} levelInfo={stats.levelInfo} />
        </FadeIn>
        <FadeIn delay={0.1}>
          <DailyQuestCard logs={stats.logs} />
        </FadeIn>
      </div>
    </div>
  );
}
