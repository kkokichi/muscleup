"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/utils/date";
import { useCheckinNotifications } from "@/features/checkin/hooks/useCheckinNotifications";
import {
  CHECKIN_REACTION_EMOJI,
  CHECKIN_REACTION_LABEL,
} from "@/features/checkin/reactionMeta";

/**
 * 自分のチェックインに届いた応援（リアクション）をホームで気づけるカード。
 * 応援が無いときは何も表示しない。開くと既読になり未読数が消える。
 */
export function CheerNotificationsCard() {
  const { items, unreadCount, markSeen, isLoading } = useCheckinNotifications();
  const [expanded, setExpanded] = useState(false);

  if (isLoading || items.length === 0) return null;

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && unreadCount > 0) markSeen(); // 開いたら既読
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <button
          type="button"
          onClick={handleToggle}
          className="flex w-full items-center gap-3 text-left"
          aria-expanded={expanded}
        >
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Heart className="size-5 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">
              {unreadCount > 0 ? "新しい応援が届いています" : "みんなからの応援"}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              あなたのチェックインに{items.length}件の応援
            </span>
          </span>
          <ChevronRight
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-90",
            )}
          />
        </button>

        {expanded && (
          <ul className="mt-3 space-y-2 border-t border-border pt-3">
            {items.slice(0, 10).map((n) => (
              <li key={n.id} className="flex items-center gap-2 text-sm">
                <span className="text-base leading-none">
                  {CHECKIN_REACTION_EMOJI[n.type]}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-semibold">{n.reactorName}</span>
                  <span className="text-muted-foreground">
                    さんが「{n.gymName}」を{CHECKIN_REACTION_LABEL[n.type]}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatDateShort(n.createdAt.slice(0, 10))}
                </span>
              </li>
            ))}
            <li className="pt-1">
              <Link
                href="/muscle-map"
                className="flex items-center justify-center gap-1 text-xs font-semibold text-primary"
              >
                ジムマップを開く
                <ChevronRight className="size-3.5" />
              </Link>
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
