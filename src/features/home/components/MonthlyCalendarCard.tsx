import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Exercise, WorkoutLog } from "@/types";
import {
  buildActivityByDate,
  calcDominantCategoryByDate,
} from "@/services/statsService";
import {
  EXERCISE_CATEGORIES,
  categoryColor,
  categoryNameJa,
} from "@/data/categories";
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

interface MonthlyCalendarCardProps {
  logs: WorkoutLog[];
  exerciseById: Map<string, Exercise>;
}

/** 月間カレンダー。各記録日はその日の主要部位の色で塗り分ける */
export function MonthlyCalendarCard({ logs, exerciseById }: MonthlyCalendarCardProps) {
  const today = todayISO();
  const activity = buildActivityByDate(logs);
  const dominant = calcDominantCategoryByDate(
    logs,
    (id) => exerciseById.get(id)?.categoryId,
  );
  const month = monthDays(today);
  const trainedThisMonth = month.days.filter((day) => activity.has(day.iso)).length;

  // その月に登場する部位のみ、カテゴリ定義順で凡例に出す
  const present = new Set(month.days.map((d) => dominant.get(d.iso)).filter(Boolean));
  const legendCategories = EXERCISE_CATEGORIES.filter((c) => present.has(c.id));

  return (
    <Card className="h-full border-border bg-card">
      <CardContent className="p-3.5">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <Link
            href="/history"
            className="flex items-center gap-1.5 transition-colors active:text-primary"
          >
            <CalendarDays className="size-4 text-primary" />
            <p className="text-sm font-bold">{month.label}</p>
          </Link>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {trainedThisMonth}日
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((label) => (
            <span
              key={label}
              className="text-center text-[10px] font-semibold text-muted-foreground"
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
            const category = active ? dominant.get(day.iso) : undefined;
            const color = category ? categoryColor(category) : undefined;
            return (
              <Link
                key={day.iso}
                href={`/history/detail?date=${day.iso}`}
                aria-label={`${day.iso}の記録詳細`}
                style={
                  color
                    ? {
                        backgroundColor: color,
                        color: "#fff",
                        textShadow: "0 1px 2px rgba(0,0,0,0.35)",
                      }
                    : undefined
                }
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg text-[13px] font-semibold tabular-nums transition-transform active:scale-90",
                  active
                    ? color
                      ? "shadow-sm"
                      : "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground",
                  isToday && "ring-2 ring-primary ring-offset-1 ring-offset-card",
                )}
              >
                {day.day}
              </Link>
            );
          })}
        </div>

        {legendCategories.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-x-2.5 gap-y-1">
            {legendCategories.map((category) => (
              <span
                key={category.id}
                className="flex items-center gap-1 text-[10px] text-muted-foreground"
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: categoryColor(category.id) }}
                />
                {categoryNameJa(category.id)}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
