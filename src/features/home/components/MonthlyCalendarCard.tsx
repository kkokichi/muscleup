"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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

/**
 * 表示対象月の日付配列を作る。
 * monthOffset は今月からの相対月（0=今月 / -1=前月 / +1=翌月）。
 * Date(year, month + offset, 1) は年をまたいでも正規化されるため、
 * 12月→1月のような繰り上がりもそのまま扱える。
 */
function monthDays(today: string, monthOffset: number) {
  const base = new Date(`${today}T00:00:00`);
  const thisYear = base.getFullYear();
  const first = new Date(thisYear, base.getMonth() + monthOffset, 1);
  const year = first.getFullYear();
  const month = first.getMonth();
  const last = new Date(year, month + 1, 0);
  const leading = (first.getDay() + 6) % 7;
  return {
    // 今年以外を見ているときは年も出して迷子にならないようにする
    label: year === thisYear ? `${month + 1}月` : `${year}年${month + 1}月`,
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
  // 今月からの相対月。0=今月、負=過去。未来は記録が無いため今月で止める
  const [monthOffset, setMonthOffset] = useState(0);

  const activity = useMemo(() => buildActivityByDate(logs), [logs]);
  const dominant = useMemo(
    () => calcDominantCategoryByDate(logs, (id) => exerciseById.get(id)?.categoryId),
    [logs, exerciseById],
  );
  const month = useMemo(() => monthDays(today, monthOffset), [today, monthOffset]);

  const trainedThisMonth = month.days.filter((day) => activity.has(day.iso)).length;

  // その月に登場する部位のみ、カテゴリ定義順で凡例に出す
  const present = new Set(month.days.map((d) => dominant.get(d.iso)).filter(Boolean));
  const legendCategories = EXERCISE_CATEGORIES.filter((c) => present.has(c.id));

  return (
    <Card className="h-full border-border bg-card">
      <CardContent className="p-3.5">
        <div className="mb-2.5 flex items-center justify-between gap-1">
          <Link
            href="/history"
            className="flex min-w-0 items-center gap-1.5 transition-colors active:text-primary"
          >
            <CalendarDays className="size-4 shrink-0 text-primary" />
            <p className="truncate text-sm font-bold">{month.label}</p>
          </Link>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              aria-label="前の月"
              onClick={() => setMonthOffset((v) => v - 1)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors active:bg-secondary"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
              {trainedThisMonth}日
            </span>
            <button
              type="button"
              aria-label="次の月"
              onClick={() => setMonthOffset((v) => Math.min(0, v + 1))}
              disabled={monthOffset >= 0}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors active:bg-secondary disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
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
                href={`/workout/new?date=${day.iso}`}
                aria-label={`${day.iso}の記録を入力・編集`}
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
