import {
  clearKnownAuthSession,
  getSignedInUser,
  isFirebaseConfigured,
  isNotSignedInError,
  rememberAuthSession,
} from "@/lib/firebase";
import type { Repositories } from "./interfaces";
import { localWorkoutLogRepository } from "./local/localWorkoutLogRepository";
import { localExerciseRepository } from "./local/localExerciseRepository";
import { localRecordRepository } from "./local/localRecordRepository";
import { localUserProfileRepository } from "./local/localUserProfileRepository";
import { localCheckinRepository } from "./local/localCheckinRepository";
import { localAdviceRepository } from "./local/localAdviceRepository";
import { localWorkoutTemplateRepository } from "./local/localWorkoutTemplateRepository";
import { localSocialRepository } from "./local/localSocialRepository";

export type * from "./interfaces";

const localRepositories: Repositories = {
  workoutLogs: localWorkoutLogRepository,
  exercises: localExerciseRepository,
  records: localRecordRepository,
  userProfile: localUserProfileRepository,
  workoutTemplates: localWorkoutTemplateRepository,
  checkins: localCheckinRepository,
  advice: localAdviceRepository,
  social: localSocialRepository,
};

let reposPromise: Promise<Repositories> | null = null;

/**
 * Repository Factory（ハイブリッド構成）。
 *
 * - 未ログイン時: Firebaseを待たず、端末ローカルを即返す。
 * - 共有データ（チェックイン・アドバイス）: ログイン中は Firestore。
 * - 個人データ（記録・自己ベスト・プロフィール・テンプレート・カスタム種目）:
 *   ログイン中はアカウント（Firestore users/{uid}）に保存。
 *   未ログイン時は端末ローカル（localStorage）。
 *   ※体組成・進捗写真・実績・リマインダーは端末ローカルのまま。
 *
 * 呼び出し側はデータソースを一切意識しない。
 * 認証状態が変わったら（ログイン/ログアウト）AccountSection が refreshRepos() を
 * 呼び、この Factory を再評価させる（reposPromise が作り直される）。以前は
 * window.location.reload() で再評価していたが、iOS の standalone PWA では
 * フルリロードで画面が真っ白になることがあるため、リロードせず再取得する。
 */
export function getRepos(): Promise<Repositories> {
  reposPromise ??= resolve();
  return reposPromise;
}

/**
 * 認証状態が変わったときに呼ぶ。次回 getRepos() で Factory を再解決させる。
 * 併せて画面側（DataRefreshBoundary）を再マウントして各データフックを再取得させる。
 */
export function refreshRepos(): void {
  reposPromise = null;
}

async function resolve(): Promise<Repositories> {
  const repos: Repositories = { ...localRepositories };

  if (!isFirebaseConfigured()) return repos;

  // ログイン判定は「端末に残した localStorage フラグ」ではなく、Firebase の
  // 実セッションで行う。フラグは消えていてもセッション（IndexedDB 側の
  // firebase:authUser）が残っていることがあり（旧Googleログイン・iOS/Safari
  // による localStorage の失効など）、フラグだけで未ログインと決めつけると、
  // ログイン中なのにローカル（空）を返して履歴が反映されない。
  // ※ getSignedInUser は firebase/auth のみを使う。重い Firestore SDK は
  //   ユーザー確定後の動的 import まで読み込まれないため初回表示は軽いまま。
  let user;
  try {
    user = await getSignedInUser();
  } catch (error) {
    console.error("認証状態の確認に失敗。ローカルで継続します", error);
    return repos;
  }
  if (!user) return repos;

  // 実セッションを確認できたので、次回以降の同期表示（自動保存の保存先表示など）
  // のためにフラグを最新化しておく。
  rememberAuthSession();

  try {
    const mod = await import("./firestore");
    const firestore = mod.createFirestoreRepositories();

    repos.workoutLogs = firestore.workoutLogs;
    repos.records = firestore.records;
    repos.userProfile = firestore.userProfile;
    repos.workoutTemplates = firestore.workoutTemplates;
    repos.exercises = firestore.exercises;
    repos.checkins = firestore.checkins;
    repos.advice = firestore.advice;
    repos.social = firestore.social;
  } catch (error) {
    if (isNotSignedInError(error)) {
      clearKnownAuthSession();
      return repos;
    }
    console.error("Firestore初期化に失敗。ローカルで継続します", error);
  }

  return repos;
}
