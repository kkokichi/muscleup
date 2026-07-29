"use client";

import { Ban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBlockedUsers } from "@/features/checkin/hooks/useBlockedUsers";

/** ブロック中のユーザー一覧と解除。ブロックが無いときは何も表示しない */
export function BlockedUsersSection() {
  const { iBlocked, profiles, unblock, isLoading } = useBlockedUsers();

  if (isLoading || iBlocked.length === 0) return null;

  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Ban className="size-4 text-primary" />
          <p className="text-sm font-semibold">ブロック中のユーザー</p>
        </div>
        <ul className="space-y-2">
          {iBlocked.map((uid) => (
            <li key={uid} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm">
                {profiles[uid]?.displayName ?? "ユーザー"}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => unblock(uid)}
              >
                解除
              </Button>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-muted-foreground">
          解除すると、相手の投稿が再び表示され、フレンド申請もできるようになります。
        </p>
      </CardContent>
    </Card>
  );
}
