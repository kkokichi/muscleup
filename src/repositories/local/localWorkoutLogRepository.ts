import type { WorkoutLog } from "@/types";
import type { WorkoutLogRepository } from "../interfaces";
import { readStorage, writeStorage } from "./storage";

const KEY = "workoutLogs";

function load(): WorkoutLog[] {
  return readStorage<WorkoutLog[]>(KEY, []);
}

export const localWorkoutLogRepository: WorkoutLogRepository = {
  async getAll() {
    return load().sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    );
  },

  async getById(id) {
    return load().find((l) => l.id === id) ?? null;
  },

  async save(log) {
    const logs = load().filter((l) => l.id !== log.id);
    logs.push(log);
    writeStorage(KEY, logs);
  },

  async delete(id) {
    writeStorage(
      KEY,
      load().filter((l) => l.id !== id),
    );
  },
};
