"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { WorkoutLog } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 月間カレンダー。トレーニング日をハイライトし、タップでその日の記録へ */
export function MonthlyCalendarCard({ logs }: { logs: WorkoutLog[] }) {
  const router = useRouter();
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const { logByDate, monthCount } = useMemo(() => {
    const logByDate = new Map<string, string>();
    let monthCount = 0;
    const prefix = `${view.year}-${String(view.month + 1).padStart(2, "0")}`;
    for (const log of logs) {
      if (!logByDate.has(log.date)) logByDate.set(log.date, log.id);
      if (log.date.startsWith(prefix)) monthCount++;
    }
    return { logByDate, monthCount };
  }, [logs, view]);

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const todayISO = iso(now.getFullYear(), now.getMonth(), now.getDate());

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shift = (delta: number) => {
    setView((v) => {
      const m = v.month + delta;
      return {
        year: v.year + Math.floor(m / 12),
        month: ((m % 12) + 12) % 12,
      };
    });
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="前の月"
            onClick={() => shift(-1)}
            className="flex size-7 items-center justify-center rounded-full bg-secondary"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="text-sm font-bold">
            {view.year}年{view.month + 1}月
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {monthCount}日
            </span>
          </p>
          <button
            type="button"
            aria-label="次の月"
            onClick={() => shift(1)}
            className="flex size-7 items-center justify-center rounded-full bg-secondary"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((w) => (
            <span key={w} className="py-1 text-[10px] text-muted-foreground">
              {w}
            </span>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <span key={i} />;
            const dateISO = iso(view.year, view.month, day);
            const trained = logByDate.has(dateISO);
            const isToday = dateISO === todayISO;
            const logId = logByDate.get(dateISO);
            return (
              <button
                key={i}
                type="button"
                disabled={!trained}
                onClick={() =>
                  logId && router.push(`/history/detail?id=${logId}`)
                }
                className={cn(
                  "mx-auto flex size-8 items-center justify-center rounded-full text-xs tabular-nums transition-colors",
                  trained
                    ? "bg-primary font-bold text-primary-foreground"
                    : "text-muted-foreground",
                  isToday && !trained && "ring-1 ring-primary",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
