import type { WorkoutLog } from "@/types";
import { estimate1RM } from "./oneRepMaxService";
import { daysAgoISO, diffDays, todayISO } from "@/utils/date";

/** 連続トレーニング日数。今日または昨日を起点に、日付が連続する限りカウント */
export function calcStreak(logs: WorkoutLog[], today = todayISO()): number {
  if (logs.length === 0) return 0;
  const dates = [...new Set(logs.map((l) => l.date))].sort().reverse();

  const gapFromToday = diffDays(today, dates[0]);
  if (gapFromToday > 1) return 0; // 一昨日以前が最後 → ストリーク途切れ

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    if (diffDays(dates[i - 1], dates[i]) === 1) streak++;
    else break;
  }
  return streak;
}

export interface WeeklyStats {
  count: number;
  /** 月曜始まりの7日分。トレーニングした日は true */
  days: boolean[];
}

/** 今週（月曜始まり）のトレーニング状況 */
export function calcWeeklyStats(logs: WorkoutLog[], today = todayISO()): WeeklyStats {
  const t = new Date(`${today}T00:00:00`);
  const mondayOffset = (t.getDay() + 6) % 7; // 月=0, 日=6
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    daysAgoISO(mondayOffset - i, t),
  );
  const logDates = new Set(logs.map((l) => l.date));
  const days = weekDates.map((d) => logDates.has(d));
  return { count: days.filter(Boolean).length, days };
}

export interface ProgressPoint {
  date: string;
  maxWeight: number;
  est1rm: number;
  volume: number;
}

/** 種目ごとの推移データ（日付昇順）。グラフ描画用 */
export function buildProgressSeries(
  logs: WorkoutLog[],
  exerciseId: string,
): ProgressPoint[] {
  const byDate = new Map<string, ProgressPoint>();
  for (const log of logs) {
    for (const entry of log.entries) {
      if (entry.exerciseId !== exerciseId) continue;
      const point = byDate.get(log.date) ?? {
        date: log.date,
        maxWeight: 0,
        est1rm: 0,
        volume: 0,
      };
      for (const set of entry.sets) {
        point.maxWeight = Math.max(point.maxWeight, set.weightKg);
        point.est1rm = Math.max(point.est1rm, estimate1RM(set.weightKg, set.reps));
        point.volume += set.weightKg * set.reps;
      }
      byDate.set(log.date, point);
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 月間成長率(%)。直近30日の最高推定1RMを、その前30日間と比較する。
 * 比較対象が存在しない場合は null。
 */
export function calcMonthlyGrowth(
  series: ProgressPoint[],
  today = todayISO(),
): number | null {
  const boundary = daysAgoISO(30, new Date(`${today}T00:00:00`));
  const start = daysAgoISO(60, new Date(`${today}T00:00:00`));

  const recent = series.filter((p) => p.date > boundary);
  const previous = series.filter((p) => p.date > start && p.date <= boundary);
  if (recent.length === 0 || previous.length === 0) return null;

  const recentBest = Math.max(...recent.map((p) => p.est1rm));
  const previousBest = Math.max(...previous.map((p) => p.est1rm));
  if (previousBest <= 0) return null;

  return Math.round(((recentBest - previousBest) / previousBest) * 1000) / 10;
}

/**
 * 「今日の予定」の提案。最も長くトレーニングしていない部位を返す。
 * 一度も記録がない場合は null（オンボーディング表示に切り替える）。
 */
export function suggestNextCategory(
  logs: WorkoutLog[],
  categoryOf: (exerciseId: string) => string | undefined,
  categories: string[],
): string | null {
  const lastByCategory = new Map<string, string>();
  for (const log of logs) {
    for (const entry of log.entries) {
      const cat = categoryOf(entry.exerciseId);
      if (!cat) continue;
      const prev = lastByCategory.get(cat);
      if (!prev || log.date > prev) lastByCategory.set(cat, log.date);
    }
  }
  if (lastByCategory.size === 0) return null;

  const neverTrained = categories.find((c) => !lastByCategory.has(c));
  if (neverTrained) return neverTrained;

  let best: string | null = null;
  let bestDate = "9999-12-31";
  for (const c of categories) {
    const d = lastByCategory.get(c);
    if (d && d < bestDate) {
      bestDate = d;
      best = c;
    }
  }
  return best;
}

/** セッションの総ボリューム(kg) */
export function calcLogVolume(log: WorkoutLog): number {
  return log.entries.reduce(
    (sum, e) => sum + e.sets.reduce((s, set) => s + set.weightKg * set.reps, 0),
    0,
  );
}

/** セッションの総セット数 */
export function calcLogSetCount(log: WorkoutLog): number {
  return log.entries.reduce((sum, e) => sum + e.sets.length, 0);
}

export interface DayActivity {
  sets: number;
  volume: number;
  count: number;
}

/** 日付(YYYY-MM-DD)ごとの活動量。同日に複数セッションがあれば合算する */
export function buildActivityByDate(logs: WorkoutLog[]): Map<string, DayActivity> {
  const map = new Map<string, DayActivity>();
  for (const log of logs) {
    const prev = map.get(log.date) ?? { sets: 0, volume: 0, count: 0 };
    map.set(log.date, {
      sets: prev.sets + calcLogSetCount(log),
      volume: prev.volume + calcLogVolume(log),
      count: prev.count + 1,
    });
  }
  return map;
}

/** これまでの最長連続トレーニング日数 */
export function calcLongestStreak(logs: WorkoutLog[]): number {
  const dates = [...new Set(logs.map((l) => l.date))].sort();
  if (dates.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    if (diffDays(dates[i], dates[i - 1]) === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}
