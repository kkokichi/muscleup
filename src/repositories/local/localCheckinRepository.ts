import type { Checkin } from "@/types";
import type { CheckinRepository } from "../interfaces";
import { readStorage, writeStorage } from "./storage";

const KEY = "checkins";

function load(): Checkin[] {
  return readStorage<Checkin[]>(KEY, []);
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
  },
};
