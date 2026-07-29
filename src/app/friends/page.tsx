import { Suspense } from "react";
import { FriendsView } from "@/features/friends/components/FriendsView";

export default function FriendsPage() {
  return (
    <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-card" />}>
      <FriendsView />
    </Suspense>
  );
}
