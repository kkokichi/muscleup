import { isFirebaseConfigured } from "@/lib/firebase";
import type { Repositories } from "./interfaces";
import { localWorkoutLogRepository } from "./local/localWorkoutLogRepository";
import { localExerciseRepository } from "./local/localExerciseRepository";
import { localRecordRepository } from "./local/localRecordRepository";
import { localUserProfileRepository } from "./local/localUserProfileRepository";

export type * from "./interfaces";

const localRepositories: Repositories = {
  workoutLogs: localWorkoutLogRepository,
  exercises: localExerciseRepository,
  records: localRecordRepository,
  userProfile: localUserProfileRepository,
};

let reposPromise: Promise<Repositories> | null = null;

/**
 * Repository Factory。
 * Firebase が設定されていれば Firestore 実装を動的 import、
 * なければローカル実装（MVPデフォルト）を返す。
 * 呼び出し側はデータソースを一切意識しない。
 */
export function getRepos(): Promise<Repositories> {
  reposPromise ??= resolve();
  return reposPromise;
}

async function resolve(): Promise<Repositories> {
  if (isFirebaseConfigured()) {
    try {
      const mod = await import("./firestore");
      return mod.createFirestoreRepositories();
    } catch (error) {
      console.error("Firestore初期化に失敗。ローカル保存で継続します", error);
    }
  }
  return localRepositories;
}
