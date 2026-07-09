import { Card, CardContent } from "@/components/ui/card";
import type { WeeklyStats } from "@/services/statsService";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

/** 今週のトレーニング回数（曜日ドット表示） */
export function WeeklyCard({ weekly }: { weekly: WeeklyStats }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-sm font-semibold">今週のトレーニング</p>
          <p className="text-sm text-muted-foreground">
            <span className="text-lg font-bold text-foreground tabular-nums">
              {weekly.count}
            </span>
            回
          </p>
        </div>
        <div className="flex justify-between">
          {weekly.days.map((trained, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-semibold",
                  trained
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {trained ? "✓" : ""}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {DAY_LABELS[i]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
