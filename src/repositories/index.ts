import { isFirebaseConfigured } from "@/lib/firebase";
import type { Repositories } from "./interfaces";
import { localWorkoutLogRepository } from "./local/localWorkoutLogRepository";
import { localExerciseRepository } from "./local/localExerciseRepository";
import { localRecordRepository } from "./local/localRecordRepository";
import { localUserProfileRepository } from "./local/localUserProfileRepository";
import { localCheckinRepository } from "./local/localCheckinRepository";
import { localAdviceRepository } from "./local/localAdviceRepository";
import { localWorkoutTemplateRepository } from "./local/localWorkoutTemplateRepository";

export type * from "./interfaces";

const localRepositories: Repositories = {
  workoutLogs: localWorkoutLogRepository,
  exercises: localExerciseRepository,
  records: localRecordRepository,
  userProfile: localUserProfileRepository,
  workoutTemplates: localWorkoutTemplateRepository,
  checkins: localCheckinRepository,
  advice: localAdviceRepository,
};

let reposPromise: Promise<Repositories> | null = null;

/**
 * Repository Factory（ハイブリッド構成）。
 *
 * - 個人データ（記録・記録・プロフィール）: 常にローカル（localStorage）。
 *   これにより、Firebase設定を有効にしても既存の記録が失われず、
 *   コアなトレーニング記録はオフラインで確実に動作する。
 *   （クラウド同期＋移行ウィザードはフェーズ1.5で対応予定 — docs/11-roadmap.md）
 * - 共有データ（チェックイン・アドバイス）: Firebase設定時は Firestore、
 *   未設定時はローカル。ここだけが全ユーザー間で共有される。
 *
 * 呼び出し側はデータソースを一切意識しない。
 */
export function getRepos(): Promise<Repositories> {
  reposPromise ??= resolve();
  return reposPromise;
}

async function resolve(): Promise<Repositories> {
  // 個人データは常にローカル
  const repos: Repositories = { ...localRepositories };

  if (isFirebaseConfigured()) {
    try {
      const mod = await import("./firestore");
      const firestore = mod.createFirestoreRepositories();
      // 共有データのみ Firestore に差し替える
      repos.checkins = firestore.checkins;
      repos.advice = firestore.advice;
    } catch (error) {
      console.error(
        "Firestore初期化に失敗。共有データもローカルで継続します",
        error,
      );
    }
  }

  return repos;
}
