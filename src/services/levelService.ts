import type { WorkoutLog } from "@/types";
import { calcLogSetCount } from "./statsService";

/** 1セッション保存で得られるXP。将来ゲーミフィケーション拡張時はここを差し替える */
export function xpForLog(log: WorkoutLog): number {
  const XP_PER_SET = 10;
  const XP_PER_SESSION = 20;
  return XP_PER_SESSION + calcLogSetCount(log) * XP_PER_SET;
}

export interface LevelInfo {
  level: number;
  /** 現レベル内で獲得済みのXP */
  currentLevelXp: number;
  /** 次のレベルまでに必要なXP総量 */
  nextLevelXp: number;
  /** 0-1 */
  progress: number;
}

/** レベルnに上がるのに必要なXP: 100 * n（累積は等差級数） */
export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, xp);
  while (remaining >= level * 100) {
    remaining -= level * 100;
    level++;
  }
  const nextLevelXp = level * 100;
  return {
    level,
    currentLevelXp: remaining,
    nextLevelXp,
    progress: remaining / nextLevelXp,
  };
}

/** レベルに応じた称号（将来はachievementsマスタ駆動に置き換え） */
export function titleForLevel(level: number): string {
  if (level >= 30) return "リビングレジェンド";
  if (level >= 20) return "鋼の求道者";
  if (level >= 15) return "筋肉の哲学者";
  if (level >= 10) return "常連リフター";
  if (level >= 5) return "駆け出しリフター";
  return "ジムルーキー";
}
