import { Card, CardContent } from "@/components/ui/card";
import type { WorkoutLog } from "@/types";
import { calcVolumeSummary, formatVolume } from "@/services/statsService";

/** 総負荷量サマリー（7日/28日/累計 + 週別バー） */
export function VolumeSummaryCard({ logs }: { logs: WorkoutLog[] }) {
  const summary = calcVolumeSummary(logs);
  const maxWeek = Math.max(1, ...summary.weeks.map((w) => w.volume));

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-sm font-semibold">合計負荷量 / 7日間</p>
          <p className="text-xl font-bold text-primary tabular-nums">
            {formatVolume(summary.last7)}
          </p>
        </div>

        <div className="space-y-1.5">
          {summary.weeks.map((w) => (
            <div key={w.label} className="flex items-center gap-2">
              <span className="w-10 shrink-0 text-[11px] text-muted-foreground">
                {w.label}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary/80 transition-all"
                  style={{ width: `${(w.volume / maxWeek) * 100}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-[10px] text-muted-foreground tabular-nums">
                {formatVolume(w.volume)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-between border-t border-border/60 pt-3">
          <div>
            <p className="text-[10px] text-muted-foreground">28日間</p>
            <p className="text-sm font-bold tabular-nums">
              {formatVolume(summary.last28)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">累計</p>
            <p className="text-sm font-bold tabular-nums">
              {formatVolume(summary.total)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
