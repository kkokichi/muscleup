import type { CheckinReactionType } from "@/types";

/** 表示順つきのリアクション種別 */
export const CHECKIN_REACTION_TYPES: readonly CheckinReactionType[] = [
  "muscle",
  "fire",
  "good",
] as const;

/** リアクション種別 → 絵文字 */
export const CHECKIN_REACTION_EMOJI: Record<CheckinReactionType, string> = {
  muscle: "💪",
  fire: "🔥",
  good: "👍",
};

/** リアクション種別 → 読み上げ/aria用ラベル */
export const CHECKIN_REACTION_LABEL: Record<CheckinReactionType, string> = {
  muscle: "ナイスパンプ",
  fire: "アツい",
  good: "いいね",
};
