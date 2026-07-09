/**
 * 推定1RM（1回挙上できる最大重量）の算出。
 * すべて純関数。reps=1 のときは実測値をそのまま返す。
 */

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Epley法: weight * (1 + reps / 30) — 標準として採用 */
export function epley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return round1(weightKg * (1 + reps / 30));
}

/** Brzycki法: weight * 36 / (37 - reps) — 高回数でEpleyより保守的 */
export function brzycki1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0 || reps >= 37) return 0;
  if (reps === 1) return weightKg;
  return round1((weightKg * 36) / (37 - reps));
}

/** アプリ標準の推定1RM */
export const estimate1RM = epley1RM;
