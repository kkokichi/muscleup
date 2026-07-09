import { Card, CardContent } from "@/components/ui/card";
import type { ExerciseRecord } from "@/types";

interface StatSummaryRowProps {
  record: ExerciseRecord | null;
  /** 月間成長率(%)。データ不足時は null */
  monthlyGrowth: number | null;
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center gap-0.5 p-3">
        <p className="text-lg font-bold tabular-nums">
          {value}
          {unit && (
            <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
              {unit}
            </span>
          )}
        </p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

/** 自己ベスト / 推定1RM / 月間成長率のサマリー */
export function StatSummaryRow({ record, monthlyGrowth }: StatSummaryRowProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat label="自己ベスト" value={record ? String(record.maxWeight) : "-"} unit="kg" />
      <Stat label="推定1RM" value={record ? String(record.est1rm) : "-"} unit="kg" />
      <Stat
        label="月間成長率"
        value={
          monthlyGrowth === null
            ? "-"
            : `${monthlyGrowth > 0 ? "+" : ""}${monthlyGrowth}`
        }
        unit="%"
      />
    </div>
  );
}
