import type { ExerciseRecord } from "@/types";
import type { RecordRepository } from "../interfaces";
import { readStorage, writeStorage } from "./storage";

const KEY = "records";

function load(): ExerciseRecord[] {
  return readStorage<ExerciseRecord[]>(KEY, []);
}

export const localRecordRepository: RecordRepository = {
  async getAll() {
    return load();
  },

  async getByExercise(exerciseId) {
    return load().find((r) => r.exerciseId === exerciseId) ?? null;
  },

  async save(record) {
    const records = load().filter((r) => r.exerciseId !== record.exerciseId);
    records.push(record);
    writeStorage(KEY, records);
  },

  async replaceAll(records) {
    writeStorage(KEY, records);
  },
};
