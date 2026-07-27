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

/** チェックインへのリアクション種別 */
export type CheckinReactionType = "muscle" | "fire" | "good";

/**
 * チェックインへの応援リアクション。
 * サブコレクション checkins/{checkinId}/reactions/{userId} に1人1件保存する。
 * （ドキュメントIDが userId なので、押し直し＝上書き、取り消し＝削除で表現できる）
 */
export interface CheckinReaction {
  /** リアクションした人のUID（= ドキュメントID） */
  userId: string;
  /** リアクションした人の表示名（通知表示用に非正規化） */
  authorName: string;
  type: CheckinReactionType;
  /** ISO 8601 */
  createdAt: string;
}

/**
 * チェックインへの応援コメント。
 * サブコレクション checkins/{checkinId}/comments/{commentId} に保存する。
 */
export interface CheckinComment {
  id: string;
  /** 投稿者のUID */
  userId: string;
  /** 投稿者の表示名（非正規化） */
  authorName: string;
  body: string;
  /** ISO 8601 */
  createdAt: string;
}

/** コメント本文の最大文字数（一言応援の想定） */
export const CHECKIN_COMMENT_MAX_LENGTH = 140;

/**
 * 公開プロフィール（表示名のみの公開ミラー）。
 * users/{uid} には記録などの私的データがあり公開できないため、フレンド検索・
 * 表示に必要な「表示名だけ」を publicProfiles/{uid} に切り出して公開する。
 */
export interface PublicProfile {
  uid: string;
  displayName: string;
  /** ISO 8601 */
  updatedAt: string;
}

export type FriendRequestStatus = "pending" | "accepted" | "declined";

/** フレンド申請（相互承認型）。トップレベル friendRequests に保存 */
export interface FriendRequest {
  id: string;
  fromUserId: string;
  /** 送信者の表示名（非正規化・通知/一覧表示用） */
  fromName: string;
  toUserId: string;
  /** 受信者の表示名（非正規化・送信済み一覧の表示用） */
  toName: string;
  status: FriendRequestStatus;
  /** ISO 8601 */
  createdAt: string;
}

/**
 * フレンド関係。承認済みの2者を1件で表す。
 * ドキュメントID(pairId) = 2つのUIDをソートして "_" で連結したもの。
 */
export interface Friend {
  /** pairId（ソート済みUIDの連結） */
  id: string;
  userIds: string[];
  sourceRequestId: string;
  /** ISO 8601 */
  createdAt: string;
}

/** 自分から見た相手との関係 */
export type FriendRelationState =
  | "self"
  | "none"
  | "pending_sent"
  | "pending_received"
  | "friends";

export interface FriendRelation {
  state: FriendRelationState;
  /** pending_received のとき、承認に使う申請ID */
  requestId?: string;
}

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
