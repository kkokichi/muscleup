"use client";

import { useState } from "react";
import { MapPin, MessageCircle } from "lucide-react";
import type { Checkin } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/utils/date";
import { useCheckinReactions } from "../hooks/useCheckinReactions";
import { CheckinComments } from "./CheckinComments";
import {
  CHECKIN_REACTION_EMOJI,
  CHECKIN_REACTION_LABEL,
  CHECKIN_REACTION_TYPES,
} from "../reactionMeta";

interface CheckinCardProps {
  checkin: Checkin;
  /** 閲覧中ユーザーのUID（未ログインなら null）。あればリアクションを押せる */
  currentUserId?: string | null;
  /** 閲覧中ユーザーの表示名 */
  currentUserName?: string;
}

/** チェックイン1件の表示（フォールバックリスト・履歴で共通利用） */
export function CheckinCard({
  checkin,
  currentUserId = null,
  currentUserName = "トレーニー",
}: CheckinCardProps) {
  const { counts, myType, toggle, canReact } = useCheckinReactions({
    checkinId: checkin.id,
    currentUserId,
    currentUserName,
  });
  const [showComments, setShowComments] = useState(false);

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-3.5">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{checkin.gymName}</p>
            {checkin.comment && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {checkin.comment}
              </p>
            )}
            <p className="mt-1 text-[11px] text-muted-foreground">
              {checkin.authorName}・{formatDateShort(checkin.createdAt.slice(0, 10))}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {CHECKIN_REACTION_TYPES.map((type) => {
                const active = myType === type;
                const count = counts[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggle(type)}
                    disabled={!canReact}
                    aria-pressed={active}
                    aria-label={`${CHECKIN_REACTION_LABEL[type]}${count > 0 ? `（${count}）` : ""}`}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/40 text-muted-foreground",
                      canReact ? "active:bg-secondary" : "cursor-default opacity-70",
                    )}
                  >
                    <span className="text-sm leading-none">
                      {CHECKIN_REACTION_EMOJI[type]}
                    </span>
                    {count > 0 && <span>{count}</span>}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setShowComments((v) => !v)}
                aria-expanded={showComments}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                  showComments
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/40 text-muted-foreground",
                  "active:bg-secondary",
                )}
              >
                <MessageCircle className="size-3.5" />
                コメント
              </button>
            </div>

            {showComments && (
              <CheckinComments
                checkinId={checkin.id}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
