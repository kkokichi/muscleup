"use client";

import Link from "next/link";
import { UserPlus, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFriendRequestCount } from "@/features/friends/hooks/useFriendRequestCount";

/** 自分宛のフレンド申請があるときだけホームに表示する気づきカード */
export function FriendRequestsCard() {
  const count = useFriendRequestCount();
  if (count === 0) return null;

  return (
    <Link href="/friends" className="block">
      <Card className="border-border bg-card transition-colors active:bg-secondary/50">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="size-5 text-primary" />
            <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {count}
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">フレンド申請が届いています</p>
            <p className="text-[11px] text-muted-foreground">
              {count}件の申請を確認する
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
