import { Suspense } from "react";
import { HistoryList } from "@/features/history/components/HistoryList";

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-card" />}>
      <HistoryList />
    </Suspense>
  );
}
