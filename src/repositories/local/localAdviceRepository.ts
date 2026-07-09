import type { ExerciseAdvice } from "@/types";
import type { AdviceRepository } from "../interfaces";
import { readStorage, writeStorage } from "./storage";

const KEY = "exerciseAdvice";

function load(): ExerciseAdvice[] {
  return readStorage<ExerciseAdvice[]>(KEY, []);
}

export const localAdviceRepository: AdviceRepository = {
  async getByExercise(exerciseId) {
    return load()
      .filter((a) => a.exerciseId === exerciseId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async create(advice) {
    const list = load();
    list.push(advice);
    writeStorage(KEY, list);
  },

  async delete(id) {
    writeStorage(
      KEY,
      load().filter((a) => a.id !== id),
    );
  },

  async updateLikes(id, delta) {
    writeStorage(
      KEY,
      load().map((a) =>
        a.id === id ? { ...a, likeCount: Math.max(0, a.likeCount + delta) } : a,
      ),
    );
  },
};
