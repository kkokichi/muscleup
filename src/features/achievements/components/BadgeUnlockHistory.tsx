"use client";

import { Award } from "lucide-react";
import type { BadgeUnlock } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateShort } from "@/utils/date";

const TIER_LABEL = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
} as const;

export function BadgeUnlockHistory({ history }: { history: BadgeUnlock[] }) {
  return (
    <Card className="mb-4 border-border bg-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold">バッジ獲得履歴</p>
            <p className="text-xs text-muted-foreground">
              獲得した日時を端末に保存しています
            </p>
          </div>
          <Badge variant="secondary">{history.length}件</Badge>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl bg-secondary/60 px-3 py-4 text-center text-xs text-muted-foreground">
            条件を達成すると、ここにバッジ獲得履歴が残ります。
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl bg-secondary/60 px-3 py-2.5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Award className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDateShort(item.unlockedAt)}
                  </p>
                </div>
                <span className="rounded-full bg-background/70 px-2 py-1 text-[10px] font-bold text-muted-foreground">
                  {TIER_LABEL[item.tier]}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
