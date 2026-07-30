import { Suspense } from "react";
import { WorkoutRecorder } from "@/features/workout/components/WorkoutRecorder";

export default function WorkoutNewPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-card" />}>
      <WorkoutRecorder />
    </Suspense>
  );
}
