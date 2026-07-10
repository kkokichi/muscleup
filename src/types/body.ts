/** 体組成の記録（体重・体脂肪率） */
export interface BodyMetric {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  weightKg: number;
  /** 体脂肪率(%) 任意 */
  bodyFatPct?: number;
  note?: string;
  /** ISO 8601 */
  createdAt: string;
}

/** 進捗写真のメタ情報（画像本体はIndexedDBに別途保存） */
export interface ProgressPhoto {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** ISO 8601 */
  createdAt: string;
}
