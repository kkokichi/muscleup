import { format, parseISO, differenceInMinutes } from "date-fns";
import { ja } from "date-fns/locale";

/** ローカルタイムゾーンでの今日 (YYYY-MM-DD) */
export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** "7月9日(木)" 形式 */
export function formatDateJa(isoDate: string): string {
  return format(parseISO(isoDate), "M月d日(EEEEE)", { locale: ja });
}

/** "2026/07/09" 形式 */
export function formatDateShort(isoDate: string): string {
  return format(parseISO(isoDate), "yyyy/MM/dd");
}

/** グラフ軸用 "7/9" 形式 */
export function formatDateAxis(isoDate: string): string {
  return format(parseISO(isoDate), "M/d");
}

export function minutesSince(isoDateTime: string): number {
  return Math.max(0, differenceInMinutes(new Date(), parseISO(isoDateTime)));
}

/** ISO日時 → "14:05" 形式（ローカル時刻） */
export function formatTimeJa(isoDateTime: string): string {
  return format(parseISO(isoDateTime), "HH:mm");
}

/** ISO日時 → ローカルタイムゾーンの日付 (YYYY-MM-DD) */
export function isoToLocalDate(isoDateTime: string): string {
  return format(parseISO(isoDateTime), "yyyy-MM-dd");
}

/** 2つのISO日時の差（分）。to - from */
export function minutesBetween(fromISO: string, toISO: string): number {
  return Math.max(0, differenceInMinutes(parseISO(toISO), parseISO(fromISO)));
}

/** 日付文字列の差（日数）。a - b */
export function diffDays(aIsoDate: string, bIsoDate: string): number {
  const ms = parseISO(aIsoDate).getTime() - parseISO(bIsoDate).getTime();
  return Math.round(ms / 86_400_000);
}

/** date から n 日前の YYYY-MM-DD */
export function daysAgoISO(n: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return format(d, "yyyy-MM-dd");
}

/** ISO日時から現在までの経過を「3日16時間前」形式で返す */
export function formatElapsed(fromISO: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - parseISO(fromISO).getTime();
  if (diffMs < 60_000) return "たった今";
  const totalHours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days}日${hours}時間前`;
  if (totalHours > 0) return `${totalHours}時間前`;
  return `${Math.floor(diffMs / 60_000)}分前`;
}
