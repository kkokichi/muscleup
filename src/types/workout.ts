/** 保存済みの1セット */
export interface WorkoutSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  /** 主観的運動強度 6.0-10.0（任意） */
  rpe?: number;
}

/** 1種目分のセットまとめ */
export interface WorkoutEntry {
  exerciseId: string;
  sets: WorkoutSet[];
}

/** 1セッションの記録 */
export interface WorkoutLog {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  entries: WorkoutEntry[];
  note: string;
  durationMinutes: number;
  /** ISO 8601 */
  createdAt: string;
}

export interface WorkoutTemplateSet {
  weightKg: number;
  reps: number;
  rpe?: number;
}

export interface WorkoutTemplateEntry {
  exerciseId: string;
  sets: WorkoutTemplateSet[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  entries: WorkoutTemplateEntry[];
  note?: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

/** 記録中（下書き）のセット。完了チェックを持つ */
export interface DraftSet {
  weightKg: number;
  reps: number;
  rpe?: number;
  isDone: boolean;
}

export interface DraftEntry {
  exerciseId: string;
  sets: DraftSet[];
}

export interface WorkoutDraft {
  /** 保存済みログへupsertするための安定ID */
  activeLogId?: string;
  /** YYYY-MM-DD */
  date: string;
  /** ISO 8601 — 所要時間の起点 */
  startedAt: string;
  entries: DraftEntry[];
  note: string;
}
