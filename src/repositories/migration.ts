import { localWorkoutLogRepository } from "./local/localWorkoutLogRepository";
import { localRecordRepository } from "./local/localRecordRepository";
import { localUserProfileRepository } from "./local/localUserProfileRepository";
import { localWorkoutTemplateRepository } from "./local/localWorkoutTemplateRepository";
import { localExerciseRepository } from "./local/localExerciseRepository";

/**
 * 初回ログイン／新規登録時に、端末ローカルの個人データをアカウント（Firestore）へ移行する。
 * クラウドに既にデータがある場合（別端末で使用済み等）は上書きしない。
 * 呼び出し時点で currentUser がログイン済みである前提。
 */
export async function migrateLocalToCloud(): Promise<void> {
  const mod = await import("./firestore");
  const cloud = mod.createFirestoreRepositories();

  const cloudLogs = await cloud.workoutLogs.getAll();
  if (cloudLogs.length > 0) return; // 既存アカウントデータを保護

  const [logs, records, templates, exercises, profile] = await Promise.all([
    localWorkoutLogRepository.getAll(),
    localRecordRepository.getAll(),
    localWorkoutTemplateRepository.getAll(),
    localExerciseRepository.getAll(),
    localUserProfileRepository.get(),
  ]);

  await Promise.all([
    ...logs.map((l) => cloud.workoutLogs.save(l)),
    ...records.map((r) => cloud.records.save(r)),
    ...templates.map((t) => cloud.workoutTemplates.save(t)),
    ...exercises.filter((e) => e.isCustom).map((e) => cloud.exercises.saveCustom(e)),
  ]);

  // デフォルトから変化があるプロフィールのみ移行
  if (profile.xp > 0 || profile.displayName !== "トレーニー") {
    await cloud.userProfile.save(profile);
  }
}
