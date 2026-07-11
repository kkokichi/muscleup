import type { Exercise } from "@/types";
import { SEED_EXERCISES } from "@/data/exercises";
import type { ExerciseRepository } from "../interfaces";
import { readStorage, writeStorage } from "./storage";

const KEY = "customExercises";

function loadAll(): Exercise[] {
  return [...SEED_EXERCISES, ...readStorage<Exercise[]>(KEY, [])];
}

export const localExerciseRepository: ExerciseRepository = {
  async getAll() {
    return loadAll();
  },

  async getById(id) {
    return loadAll().find((e) => e.id === id) ?? null;
  },

  async getByCategory(categoryId) {
    return loadAll().filter((e) => e.categoryId === categoryId);
  },

  async saveCustom(exercise) {
    const customs = readStorage<Exercise[]>(KEY, []).filter(
      (e) => e.id !== exercise.id,
    );
    customs.push({ ...exercise, isCustom: true });
    writeStorage(KEY, customs);
  },

  async deleteCustom(id) {
    writeStorage(
      KEY,
      readStorage<Exercise[]>(KEY, []).filter((e) => e.id !== id),
    );
  },
};
