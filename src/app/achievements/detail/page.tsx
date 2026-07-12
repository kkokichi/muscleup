import { Suspense } from "react";
import { BadgeDetailView } from "@/features/achievements/components/BadgeDetailView";

export default function AchievementDetailPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-card" />}>
      <BadgeDetailView />
    </Suspense>
  );
}
