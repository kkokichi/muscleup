import {
  clearKnownGoogleSession,
  getSignedInUser,
  hasKnownGoogleSession,
  isFirebaseConfigured,
  isNotSignedInError,
} from "@/lib/firebase";
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
 * - 未ログイン時: Firebaseを待たず、端末ローカルを即返す。
 * - 共有データ（チェックイン・アドバイス）: Googleログイン中は Firestore。
 * - 個人データ（記録・自己ベスト・プロフィール・テンプレート・カスタム種目）:
 *   Googleログイン中はアカウント（Firestore users/{uid}）に保存。
 *   未ログイン時は端末ローカル（localStorage）。
 *   ※体組成・進捗写真・実績・リマインダーは端末ローカルのまま。
 *
 * 呼び出し側はデータソースを一切意識しない。
 * 認証状態が変わったら AccountSection が window.location.reload() を呼び、
 * この Factory を再評価させる（reposPromise が作り直される）。
 */
export function getRepos(): Promise<Repositories> {
  reposPromise ??= resolve();
  return reposPromise;
}

async function resolve(): Promise<Repositories> {
  const repos: Repositories = { ...localRepositories };

  if (!isFirebaseConfigured() || !hasKnownGoogleSession()) {
    return repos;
  }

  try {
    const user = await getSignedInUser();
    if (!user) return repos;

    const mod = await import("./firestore");
    const firestore = mod.createFirestoreRepositories();

    repos.workoutLogs = firestore.workoutLogs;
    repos.records = firestore.records;
    repos.userProfile = firestore.userProfile;
    repos.workoutTemplates = firestore.workoutTemplates;
    repos.exercises = firestore.exercises;
    repos.checkins = firestore.checkins;
    repos.advice = firestore.advice;
  } catch (error) {
    if (isNotSignedInError(error)) {
      clearKnownGoogleSession();
      return repos;
    }
    console.error("Firestore初期化に失敗。ローカルで継続します", error);
  }

  return repos;
}
