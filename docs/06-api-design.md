# 06. API設計

## 方針

MVPはBFF/REST APIを持たず、**Repositoryインターフェース**がAPI契約となる。
クライアント → Repository → (LocalStorage | Firestore) の構成。
将来、Cloud Functions が必要な処理（集計・通知・SNS整合性）のみサーバーAPI化する。

## Repository インターフェース（= 内部API契約）

```ts
// repositories/workoutLogRepository.ts
interface WorkoutLogRepository {
  getAll(): Promise<WorkoutLog[]>;                  // 日付降順
  getById(id: string): Promise<WorkoutLog | null>;
  getByDateRange(from: string, to: string): Promise<WorkoutLog[]>;
  save(log: WorkoutLog): Promise<void>;             // upsert
  delete(id: string): Promise<void>;
}

// repositories/exerciseRepository.ts
interface ExerciseRepository {
  getAll(): Promise<Exercise[]>;                    // シード + カスタム
  getById(id: string): Promise<Exercise | null>;
  getByCategory(categoryId: MuscleCategoryId): Promise<Exercise[]>;
  saveCustom(exercise: Exercise): Promise<void>;
}

// repositories/recordRepository.ts
interface RecordRepository {
  getByExercise(exerciseId: string): Promise<ExerciseRecord | null>;
  getAll(): Promise<ExerciseRecord[]>;
  save(record: ExerciseRecord): Promise<void>;
}

// repositories/userProfileRepository.ts
interface UserProfileRepository {
  get(): Promise<UserProfile>;
  save(profile: UserProfile): Promise<void>;
}
```

### 実装の切替（Factory）

```ts
// repositories/index.ts
export function getRepositories(): Repositories {
  return isFirebaseConfigured() ? firestoreRepositories : localRepositories;
}
```

## Service層（ドメインロジック）

| Service | 責務 |
|---|---|
| `oneRepMaxService` | Epley法による推定1RM（`weight * (1 + reps/30)`）、Brzycki法も提供 |
| `recordService` | 記録保存時のPB判定・Records更新・更新種別の返却 |
| `statsService` | 週間回数、継続日数、月間成長率、種目別推移データの算出 |
| `mascotService` | 文脈（挨拶/称賛/PB/休養/連続記録）に応じた重み付きランダムメッセージ |
| `levelService` | XP計算（1セット=10XP等）とレベル算出 |

## 将来の Cloud Functions API（フェーズ2以降）

| エンドポイント | トリガー | 責務 |
|---|---|---|
| `onWorkoutLogCreated` | Firestore trigger | XP付与、アチーブメント判定、ストリーク更新 |
| `onPostLiked` | Firestore trigger | likeCount 更新、通知作成 |
| `POST /ai/analyze-form` | HTTPS callable | フォーム動画解析（フェーズ3） |
| `POST /ai/suggest-menu` | HTTPS callable | 今日のメニュー提案（フェーズ3） |
| `GET /ranking/weekly` | HTTPS callable | 週間ランキング集計 |
| `scheduledStreakCheck` | Cron | 連続日数リセット・リマインド通知 |

## エラーハンドリング方針

- Repository は失敗時に例外を投げ、Hooks層で捕捉して UI にトースト表示
- ローカル実装は原則失敗しない（QuotaExceeded のみ考慮）
- 楽観的更新: 保存系はUIを先に更新し、失敗時にロールバック
