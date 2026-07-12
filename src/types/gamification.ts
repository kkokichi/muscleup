import type { AchievementTier } from "./achievement";

export interface QuestCompletion {
  id: string;
  questId: string;
  title: string;
  xp: number;
  date: string;
  completedAt: string;
}

export interface BadgeUnlock {
  id: string;
  achievementId: string;
  title: string;
  tier: AchievementTier;
  unlockedAt: string;
}

export interface MascotEvolutionRecord {
  id: string;
  stageId: string;
  name: string;
  level: number;
  evolvedAt: string;
}
