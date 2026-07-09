import type { WorkoutTemplate } from "@/types";
import type { WorkoutTemplateRepository } from "../interfaces";
import { readStorage, writeStorage } from "./storage";

const KEY = "workoutTemplates";

function load(): WorkoutTemplate[] {
  return readStorage<WorkoutTemplate[]>(KEY, []);
}

function sortTemplates(templates: WorkoutTemplate[]): WorkoutTemplate[] {
  return [...templates].sort((a, b) => {
    const aTime = a.lastUsedAt ?? a.updatedAt;
    const bTime = b.lastUsedAt ?? b.updatedAt;
    return bTime.localeCompare(aTime);
  });
}

export const localWorkoutTemplateRepository: WorkoutTemplateRepository = {
  async getAll() {
    return sortTemplates(load());
  },

  async getById(id) {
    return load().find((template) => template.id === id) ?? null;
  },

  async save(template) {
    const templates = load().filter((item) => item.id !== template.id);
    templates.push(template);
    writeStorage(KEY, templates);
  },

  async delete(id) {
    writeStorage(
      KEY,
      load().filter((template) => template.id !== id),
    );
  },
};
