"use client";

import { useMemo } from "react";
import type { WorkoutLog } from "@/types";
import { buildActivityByDate } from "@/services/statsService";
import { formatDateShort } from "@/utils/date";

interface TrainingHeatmapProps {
  logs: WorkoutLog[];
  /** 表示する週数（デフォルト18週≒4ヶ月） */
  weeks?: number;
}

/** セット数を5段階の濃さに割り当てる（0=非トレ日） */
function intensity(sets: number): number {
  if (sets <= 0) return 0;
  if (sets <= 4) return 1;
  if (sets <= 9) return 2;
  if (sets <= 14) return 3;
  return 4;
}

const LEVEL_BG = [
  "var(--secondary)",
  "rgba(191,255,0,0.28)",
  "rgba(191,255,0,0.5)",
  "rgba(191,255,0,0.75)",
  "rgba(191,255,0,1)",
];

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * GitHubコントリビューション風の活動ヒートマップ。
 * 列=週（左が古い）、行=曜日（月〜日）。色の濃さ=その日のセット数。
 */
export function TrainingHeatmap({ logs, weeks = 18 }: TrainingHeatmapProps) {
  const { cells, monthLabels } = useMemo(() => {
    const activity = buildActivityByDate(logs);

    // 今週の月曜を求め、そこから weeks-1 週さかのぼった月曜を開始日とする
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mondayOffset = (today.getDay() + 6) % 7;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - mondayOffset);
    const start = new Date(thisMonday);
    start.setDate(thisMonday.getDate() - (weeks - 1) * 7);

    // 列優先（週ごとに7日）でセルを生成
    const cells: { iso: string; level: number; future: boolean; sets: number }[] = [];
    const monthLabels: { week: number; label: string }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < weeks; w++) {
      const colFirst = new Date(start);
      colFirst.setDate(start.getDate() + w * 7);
      const m = colFirst.getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ week: w, label: `${m + 1}月` });
        lastMonth = m;
      }
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        const iso = isoOf(date);
        const sets = activity.get(iso)?.sets ?? 0;
        cells.push({
          iso,
          level: intensity(sets),
          future: date > today,
          sets,
        });
      }
    }
    return { cells, monthLabels };
  }, [logs, weeks]);

  return (
    <div className="w-full">
      <div
        className="grid gap-[3px] text-[9px] text-muted-foreground"
        style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}
      >
        {monthLabels.map((m) => (
          <span
            key={`${m.week}-${m.label}`}
            style={{ gridColumnStart: m.week + 1 }}
            className="mb-1 whitespace-nowrap"
          >
            {m.label}
          </span>
        ))}
      </div>

      <div
        className="grid gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${weeks}, 1fr)`,
          gridTemplateRows: "repeat(7, 1fr)",
          gridAutoFlow: "column",
        }}
      >
        {cells.map((cell, i) => (
          <div
            key={i}
            title={
              cell.future
                ? undefined
                : `${formatDateShort(cell.iso)}　${cell.sets}セット`
            }
            className="aspect-square rounded-[3px]"
            style={{
              backgroundColor: cell.future ? "transparent" : LEVEL_BG[cell.level],
            }}
          />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>少ない</span>
        {LEVEL_BG.map((bg, i) => (
          <span
            key={i}
            className="size-2.5 rounded-[3px]"
            style={{ backgroundColor: bg }}
          />
        ))}
        <span>多い</span>
      </div>
    </div>
  );
}
