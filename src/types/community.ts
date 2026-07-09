/**
 * コミュニティ（共有）データ。
 * ユーザー個人データ（users/{uid}配下）と異なり、全ユーザー間で共有される。
 * Firebase設定時は Firestore、未設定時はローカル（単一端末）に保存される。
 */

/** ジムチェックイン: 地図上のピン + コメント */
export interface Checkin {
  id: string;
  /** 投稿者のUID（匿名認証） */
  userId: string;
  /** 投稿者の表示名（非正規化） */
  authorName: string;
  /** ジム・場所の名前 */
  gymName: string;
  lat: number;
  lng: number;
  comment: string;
  /** ISO 8601 */
  createdAt: string;
}

export type CheckinDraft = Omit<Checkin, "id" | "userId" | "authorName" | "createdAt">;

/** 種目へのアドバイス・コツの共有投稿 */
export interface ExerciseAdvice {
  id: string;
  exerciseId: string;
  userId: string;
  authorName: string;
  body: string;
  /** ISO 8601 */
  createdAt: string;
  likeCount: number;
}
