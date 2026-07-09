export type RecordType = "maxWeight" | "est1rm" | "maxReps" | "maxVolume";

/** 種目ごとの自己ベスト（1種目=1レコード） */
export interface ExerciseRecord {
  exerciseId: string;
  maxWeight: number;
  est1rm: number;
  maxReps: number;
  /** 1セッション内の総ボリューム(kg) */
  maxVolume: number;
  /** 直近でベストを更新した日 YYYY-MM-DD */
  achievedAt: string;
  /** ベスト更新の累計回数 */
  updatedCount: number;
}

/** 記録保存時に検出されたベスト更新 */
export interface PbUpdate {
  exerciseId: string;
  type: RecordType;
  previous: number;
  value: number;
}
