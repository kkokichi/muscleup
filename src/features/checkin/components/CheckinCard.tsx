import { MapPin } from "lucide-react";
import type { Checkin } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateShort } from "@/utils/date";

/** チェックイン1件の表示（フォールバックリスト・履歴で共通利用） */
export function CheckinCard({ checkin }: { checkin: Checkin }) {
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
