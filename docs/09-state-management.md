# 09. 状態管理設計

## 方針

- **サーバー/永続状態**は hooks + Repository（読み込み時にフェッチ、保存時に書き込み）
- **クライアント一時状態**のうち、画面をまたぐもの・複雑なものだけ Zustand
- ローカルUI状態（開閉・入力中の値）は useState / React Hook Form に留める
- 「とりあえず全部ストア」を禁止。ストアは以下の2つのみから始める

## Zustand ストア

### 1. `useWorkoutDraftStore` — 記録中セッションの下書き

記録画面を離れても入力が消えない（継続体験の生命線）。

```ts
interface WorkoutDraftState {
  draft: WorkoutDraft | null;        // { date, entries: { exerciseId, sets[] }[], note, startedAt }
  startWorkout(date: string): void;
  addExercise(exerciseId: string): void;
  removeExercise(exerciseId: string): void;
  addSet(exerciseId: string, preset?: Partial<WorkoutSet>): void;
  updateSet(exerciseId: string, setIndex: number, patch: Partial<WorkoutSet>): void;
  toggleSetDone(exerciseId: string, setIndex: number): void;
  setNote(note: string): void;
  clear(): void;
}
```

- `persist` ミドルウェアで localStorage に自動保存（アプリを閉じても下書き復元）

### 2. `useMascotStore` — マスコットの発話キュー

```ts
interface MascotState {
  currentMessage: MascotMessage | null;
  celebrate(context: MascotContext, payload?: { exerciseName?: string }): void;
  dismiss(): void;
}
```

- PB更新などのイベントを各featureから発火し、グローバルトーストとして表示

## hooks（サーバー状態の窓口）

| Hook | 返すもの | 内部 |
|---|---|---|
| `useWorkoutLogs()` | logs, isLoading, saveLog, deleteLog | WorkoutLogRepository |
| `useExercises()` | exercises, byCategory, search | ExerciseRepository |
| `useRecords()` | records, checkAndUpdate | RecordRepository + recordService |
| `useHomeStats()` | streak, weeklyCount, level, pbCount | statsService（logs から算出） |
| `useExerciseProgress(id)` | chartData, est1rm, pb, monthlyGrowth | statsService |

- MVPではデータ量が小さいため SWR/React Query は導入しない（依存最小化）。
  フェーズ2でリアルタイム同期が必要になった時点で Firestore の `onSnapshot` ラッパー or React Query を導入

## フォーム状態

- 記録フォームの数値入力: ステッパー中心のため Zustand ドラフトを直接更新
- 設定系・カスタム種目追加フォーム: React Hook Form + Zod スキーマ（`types/schemas.ts`）

## 状態の流れ（記録保存の例）

```
SetRow(+ボタン) → useWorkoutDraftStore.updateSet
保存ボタン → useWorkoutLogs.saveLog(draftから変換)
           → recordService.checkPB → PB更新なら useMascotStore.celebrate('pb')
           → draft.clear() → ホームへ遷移
```
