import type { Checkin, CheckinReaction } from "@/types";
import type { CheckinRepository } from "../interfaces";
import { readStorage, writeStorage } from "./storage";

const KEY = "checkins";
const REACTIONS_KEY = "checkinReactions";

function load(): Checkin[] {
  return readStorage<Checkin[]>(KEY, []);
}

/** checkinId ごとのリアクション配列 */
type ReactionMap = Record<string, CheckinReaction[]>;

function loadReactions(): ReactionMap {
  return readStorage<ReactionMap>(REACTIONS_KEY, {});
}

export const localCheckinRepository: CheckinRepository = {
  async getAll() {
    return load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async create(checkin) {
    const list = load();
    list.push(checkin);
    writeStorage(KEY, list);
  },

  async delete(id) {
    writeStorage(
      KEY,
      load().filter((c) => c.id !== id),
    );
    // 紐づくリアクションも掃除する
    const map = loadReactions();
    if (map[id]) {
      delete map[id];
      writeStorage(REACTIONS_KEY, map);
    }
  },

  async getReactions(checkinId) {
    return loadReactions()[checkinId] ?? [];
  },

  async setReaction(checkinId, userId, reaction) {
    const map = loadReactions();
    const current = (map[checkinId] ?? []).filter((r) => r.userId !== userId);
    if (reaction === null) {
      map[checkinId] = current;
    } else {
      map[checkinId] = [...current, { ...reaction, userId }];
    }
    writeStorage(REACTIONS_KEY, map);
  },
};
