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

export interface MascotEvolution {
  id: "egg" | "rookie" | "power" | "athlete" | "legend";
  minLevel: number;
  maxLevel: number | null;
  name: string;
  title: string;
  message: string;
  accentClassName: string;
}

export const MASCOT_EVOLUTIONS: MascotEvolution[] = [
  {
    id: "egg",
    minLevel: 1,
    maxLevel: 4,
    name: "たまごマッスー",
    title: "初心者マッスー",
    message: "まずは記録するだけで十分ッス。小さく始めよう。",
    accentClassName: "from-zinc-400/30 to-primary/20",
  },
  {
    id: "rookie",
    minLevel: 5,
    maxLevel: 9,
    name: "ジム見習いマッスー",
    title: "フォーム研究生",
    message: "習慣が育ってきたッス。前回値を1つだけ超えよう。",
    accentClassName: "from-lime-400/25 to-primary/25",
  },
  {
    id: "power",
    minLevel: 10,
    maxLevel: 19,
    name: "パワーマッスー",
    title: "常連リフター",
    message: "ここから伸びるッス。重さ・回数・休養を整えよう。",
    accentClassName: "from-orange-400/25 to-primary/25",
  },
  {
    id: "athlete",
    minLevel: 20,
    maxLevel: 34,
    name: "アスリートマッスー",
    title: "鋼の求道者",
    message: "強さに安定感が出てきたッス。弱点部位も攻めよう。",
    accentClassName: "from-sky-400/25 to-primary/25",
  },
  {
    id: "legend",
    minLevel: 35,
    maxLevel: null,
    name: "レジェンドマッスー",
    title: "リビングレジェンド",
    message: "ここまで続けた事実が才能ッス。次は誰かを励まそう。",
    accentClassName: "from-yellow-300/30 to-primary/25",
  },
];

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

export function totalXpToReachLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return ((safeLevel - 1) * safeLevel * 100) / 2;
}

export function getMascotEvolution(level: number): MascotEvolution {
  return (
    MASCOT_EVOLUTIONS.find(
      (stage) =>
        level >= stage.minLevel &&
        (stage.maxLevel === null || level <= stage.maxLevel),
    ) ?? MASCOT_EVOLUTIONS[0]
  );
}

export function xpUntilNextEvolution(totalXp: number, level: number): number | null {
  const currentStage = getMascotEvolution(level);
  const currentIndex = MASCOT_EVOLUTIONS.findIndex(
    (stage) => stage.id === currentStage.id,
  );
  const nextStage = MASCOT_EVOLUTIONS[currentIndex + 1];
  if (!nextStage) return null;
  return Math.max(0, totalXpToReachLevel(nextStage.minLevel) - totalXp);
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
