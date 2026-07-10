import type { BodyMetric } from "@/types";
import { readStorage, writeStorage } from "./storage";

/**
 * 体組成記録のローカルリポジトリ（個人データのため常にローカル）。
 * Repositories バンドルには含めず、単体で利用する。
 */
const KEY = "bodyMetrics";

function load(): BodyMetric[] {
  return readStorage<BodyMetric[]>(KEY, []);
}

export const localBodyMetricRepository = {
  async getAll(): Promise<BodyMetric[]> {
    // 日付降順
    return load().sort((a, b) => b.date.localeCompare(a.date));
  },

  async save(metric: BodyMetric): Promise<void> {
    const list = load().filter((m) => m.id !== metric.id);
    list.push(metric);
    writeStorage(KEY, list);
  },

  async delete(id: string): Promise<void> {
    writeStorage(
      KEY,
      load().filter((m) => m.id !== id),
    );
  },
};
