import { Card, CardContent } from "@/components/ui/card";
import type { WorkoutLog } from "@/types";
import {
  calcVolumeSummary,
  formatSignedVolume,
  formatVolume,
} from "@/services/statsService";

interface VolumeSummaryCardProps {
  logs: WorkoutLog[];
  variant?: "full" | "compact";
}

/** 総負荷量サマリー（7日/28日/累計 + 週別バー） */
export function VolumeSummaryCard({
  logs,
  variant = "full",
}: VolumeSummaryCardProps) {
  const summary = calcVolumeSummary(logs);
  const maxWeek = Math.max(1, summary.weekTarget);
  const bestGap = Math.max(0, summary.bestWeek - summary.last7);
  const currentWeek = summary.weeks[0]?.volume ?? 0;

  if (variant === "compact") {
    return (
      <Card className="h-full border-border bg-card">
        <CardContent className="flex h-full flex-col p-3">
          <p className="text-[11px] font-bold leading-tight">合計負荷量</p>
          <p className="text-[9px] text-muted-foreground">7日間</p>
          <p className="mt-1 text-base font-black leading-tight text-primary tabular-nums">
            {formatVolume(summary.last7)}
          </p>
          <p className="mt-0.5 text-[9px] font-semibold text-muted-foreground tabular-nums">
            前7日比 {formatSignedVolume(summary.last7Delta)}
          </p>
          <div className="mt-auto space-y-1 pt-2.5">
            {summary.weeks.slice(0, 3).map((w) => (
              <div key={w.label} className="flex items-center gap-1">
                <span className="w-7 shrink-0 text-[8px] text-muted-foreground">
                  {w.label}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, (w.volume / maxWeek) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <p className="text-sm font-semibold">合計負荷量 / 7日間</p>
            <p className="text-[11px] text-muted-foreground">
              目標上限 {formatVolume(summary.weekTarget)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary tabular-nums">
              {formatVolume(summary.last7)}
            </p>
            <p className="text-[11px] font-semibold text-muted-foreground tabular-nums">
              前7日比 {formatSignedVolume(summary.last7Delta)}
            </p>
          </div>
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
                  style={{ width: `${Math.min(100, (w.volume / maxWeek) * 100)}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-[10px] text-muted-foreground tabular-nums">
                {formatVolume(w.volume)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
          <div>
            <p className="text-[10px] text-muted-foreground">今週合計</p>
            <p className="text-sm font-bold tabular-nums">
              {formatVolume(currentWeek)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">自己最高差</p>
            <p className="text-sm font-bold tabular-nums">
              {bestGap === 0 ? "更新中" : `あと${formatVolume(bestGap)}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">28日間</p>
            <p className="text-sm font-bold tabular-nums">
              {formatVolume(summary.last28)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
