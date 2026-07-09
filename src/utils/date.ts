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
