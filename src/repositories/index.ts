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

/**
 * 端末保存モードのリポジトリ。
 *
 * 認証状態を確認せず、常に同じ localStorage のデータを返す。これにより、起動時や
 * ログイン状態の復元時に保存先が切り替わって履歴が空に見えることを防ぐ。
 */
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

const changeListeners = new Set<() => void>();

export function subscribeReposChanged(listener: () => void): () => void {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
}

/** 常に端末保存を即時返す。Firebase SDKやネットワークは使用しない。 */
export function getRepos(): Promise<Repositories> {
  return Promise.resolve(localRepositories);
}

/** インポート等で端末データを更新した場合に、表示を再取得させるための通知。 */
export function refreshRepos(): void {
  for (const listener of changeListeners) listener();
}
