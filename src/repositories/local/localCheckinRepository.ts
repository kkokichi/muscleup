import type { Checkin, CheckinComment, CheckinReaction } from "@/types";
import type { CheckinRepository } from "../interfaces";
import { readStorage, writeStorage } from "./storage";

const KEY = "checkins";
const REACTIONS_KEY = "checkinReactions";
const COMMENTS_KEY = "checkinComments";

function load(): Checkin[] {
  return readStorage<Checkin[]>(KEY, []);
}

/** checkinId ごとのリアクション配列 */
type ReactionMap = Record<string, CheckinReaction[]>;

function loadReactions(): ReactionMap {
  return readStorage<ReactionMap>(REACTIONS_KEY, {});
}

/** checkinId ごとのコメント配列 */
type CommentMap = Record<string, CheckinComment[]>;

function loadComments(): CommentMap {
  return readStorage<CommentMap>(COMMENTS_KEY, {});
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
    // 紐づくリアクション・コメントも掃除する
    const map = loadReactions();
    if (map[id]) {
      delete map[id];
      writeStorage(REACTIONS_KEY, map);
    }
    const comments = loadComments();
    if (comments[id]) {
      delete comments[id];
      writeStorage(COMMENTS_KEY, comments);
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

  async getComments(checkinId) {
    return (loadComments()[checkinId] ?? []).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  async addComment(checkinId, comment) {
    const map = loadComments();
    map[checkinId] = [...(map[checkinId] ?? []), comment];
    writeStorage(COMMENTS_KEY, map);
  },

  async deleteComment(checkinId, commentId) {
    const map = loadComments();
    map[checkinId] = (map[checkinId] ?? []).filter((c) => c.id !== commentId);
    writeStorage(COMMENTS_KEY, map);
  },
};
