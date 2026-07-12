import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { WorkoutLog } from "@/types";
import { buildActivityByDate } from "@/services/statsService";
import { todayISO } from "@/utils/date";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"] as const;

function monthDays(today: string) {
  const base = new Date(`${today}T00:00:00`);
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const leading = (first.getDay() + 6) % 7;
  return {
    label: `${month + 1}月`,
    leading,
    days: Array.from({ length: last.getDate() }, (_, index) => {
      const day = index + 1;
      const date = new Date(year, month, day);
      const iso = date.toLocaleDateString("sv-SE");
      return { day, iso };
    }),
  };
}

export function MonthlyCalendarCard({ logs }: { logs: WorkoutLog[] }) {
  const today = todayISO();
  const activity = buildActivityByDate(logs);
  const month = monthDays(today);
  const trainedThisMonth = month.days.filter((day) => activity.has(day.iso)).length;

  return (
    <Link href="/history" className="block h-full">
      <Card className="h-full border-border bg-card transition-colors active:bg-secondary/50">
        <CardContent className="p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-4 text-primary" />
              <p className="text-xs font-bold">{month.label}</p>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground">
              {trainedThisMonth}日
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((label) => (
              <span
                key={label}
                className="text-center text-[8px] font-semibold text-muted-foreground"
              >
                {label}
              </span>
            ))}
            {Array.from({ length: month.leading }).map((_, index) => (
              <span key={`blank-${index}`} className="aspect-square" />
            ))}
            {month.days.map((day) => {
              const active = activity.has(day.iso);
              const isToday = day.iso === today;
              return (
                <span
                  key={day.iso}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-md text-[9px] font-semibold tabular-nums",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-muted-foreground",
                    isToday && "ring-1 ring-primary",
                  )}
                >
                  {day.day}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
