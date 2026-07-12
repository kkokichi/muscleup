import type {
  AchievementProgress,
  BadgeUnlock,
  MascotEvolutionRecord,
  QuestCompletion,
} from "@/types";
import type { DailyQuest } from "@/services/questService";
import type { MascotEvolution } from "@/services/levelService";
import { readStorage, writeStorage } from "@/repositories/local/storage";

const ACHIEVEMENT_UNLOCKED_KEY = "achievementsUnlockedAt";
const BADGE_UNLOCKS_KEY = "badgeUnlocks";
const QUEST_COMPLETIONS_KEY = "questCompletions";
const SEEN_MASCOT_STAGES_KEY = "seenMascotEvolutionStages";
const MASCOT_EVOLUTION_HISTORY_KEY = "mascotEvolutionHistory";

function newestFirst<T extends { completedAt?: string; unlockedAt?: string; evolvedAt?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const left = a.completedAt ?? a.unlockedAt ?? a.evolvedAt ?? "";
    const right = b.completedAt ?? b.unlockedAt ?? b.evolvedAt ?? "";
    return right.localeCompare(left);
  });
}

export function readAchievementUnlockedAt(): Record<string, string> {
  return readStorage<Record<string, string>>(ACHIEVEMENT_UNLOCKED_KEY, {});
}

export function recordAchievementUnlocks(
  progress: AchievementProgress[],
  unlockedAtMap: Record<string, string>,
  now: string,
): {
  unlockedAtMap: Record<string, string>;
  newlyUnlocked: AchievementProgress[];
  badgeUnlocks: BadgeUnlock[];
} {
  const nextUnlockedAt = { ...unlockedAtMap };
  const unlockedItems = progress.filter((item) => item.unlocked);
  const newlyUnlocked = unlockedItems.filter(
    (item) => item.unlocked && !nextUnlockedAt[item.achievement.id],
  );
  for (const item of newlyUnlocked) {
    nextUnlockedAt[item.achievement.id] = now;
  }

  const existingUnlocks = readStorage<BadgeUnlock[]>(BADGE_UNLOCKS_KEY, []);
  const existingIds = new Set(existingUnlocks.map((item) => item.achievementId));
  const additions = unlockedItems
    .filter((item) => !existingIds.has(item.achievement.id))
    .map((item) => ({
      id: item.achievement.id,
      achievementId: item.achievement.id,
      title: item.achievement.title,
      tier: item.achievement.tier,
      unlockedAt: nextUnlockedAt[item.achievement.id] ?? now,
    }));

  if (newlyUnlocked.length === 0 && additions.length === 0) {
    return {
      unlockedAtMap: nextUnlockedAt,
      newlyUnlocked: [],
      badgeUnlocks: readBadgeUnlockHistory(),
    };
  }

  writeStorage(ACHIEVEMENT_UNLOCKED_KEY, nextUnlockedAt);
  writeStorage(BADGE_UNLOCKS_KEY, newestFirst([...existingUnlocks, ...additions]));

  return {
    unlockedAtMap: nextUnlockedAt,
    newlyUnlocked,
    badgeUnlocks: readBadgeUnlockHistory(),
  };
}

export function readBadgeUnlockHistory(limit?: number): BadgeUnlock[] {
  const history = newestFirst(readStorage<BadgeUnlock[]>(BADGE_UNLOCKS_KEY, []));
  return typeof limit === "number" ? history.slice(0, limit) : history;
}

export function recordQuestCompletions(
  quests: DailyQuest[],
  date: string,
  now: string,
): QuestCompletion[] {
  const existing = readStorage<QuestCompletion[]>(QUEST_COMPLETIONS_KEY, []);
  const existingIds = new Set(existing.map((item) => item.id));
  const additions = quests
    .filter((quest) => quest.completed)
    .map((quest) => ({
      id: `${date}:${quest.id}`,
      questId: quest.id,
      title: quest.title,
      xp: quest.xp,
      date,
      completedAt: now,
    }))
    .filter((item) => !existingIds.has(item.id));

  if (additions.length > 0) {
    writeStorage(QUEST_COMPLETIONS_KEY, newestFirst([...existing, ...additions]));
  }

  return additions;
}

export function readQuestCompletionHistory(limit?: number): QuestCompletion[] {
  const history = newestFirst(readStorage<QuestCompletion[]>(QUEST_COMPLETIONS_KEY, []));
  return typeof limit === "number" ? history.slice(0, limit) : history;
}

export function recordMascotEvolutionIfNeeded(
  stage: MascotEvolution,
  level: number,
  now: string,
): { isNew: boolean; history: MascotEvolutionRecord[] } {
  const seenStages = readStorage<Record<string, string>>(SEEN_MASCOT_STAGES_KEY, {});
  if (seenStages[stage.id]) {
    return { isNew: false, history: readMascotEvolutionHistory() };
  }

  const record: MascotEvolutionRecord = {
    id: `${stage.id}:${now}`,
    stageId: stage.id,
    name: stage.name,
    level,
    evolvedAt: now,
  };
  const history = newestFirst([
    ...readStorage<MascotEvolutionRecord[]>(MASCOT_EVOLUTION_HISTORY_KEY, []),
    record,
  ]);

  writeStorage(SEEN_MASCOT_STAGES_KEY, { ...seenStages, [stage.id]: now });
  writeStorage(MASCOT_EVOLUTION_HISTORY_KEY, history);

  return { isNew: true, history };
}

export function readMascotEvolutionHistory(limit?: number): MascotEvolutionRecord[] {
  const history = newestFirst(
    readStorage<MascotEvolutionRecord[]>(MASCOT_EVOLUTION_HISTORY_KEY, []),
  );
  return typeof limit === "number" ? history.slice(0, limit) : history;
}
