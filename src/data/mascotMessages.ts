import type { MascotMessage } from "@/types";

/**
 * マスコット「マッスー」のメッセージマスタ。
 * 将来は Firestore / AI 生成に差し替え可能（mascotService が供給元を隠蔽）。
 */
export const MASCOT_MESSAGES: MascotMessage[] = [
  // --- 挨拶（ホーム表示時） ---
  { id: "g1", context: "greeting", text: "今日も会えて嬉しいッス！", weight: 2 },
  { id: "g2", context: "greeting", text: "昨日より強くなってるッスよ！", weight: 2 },
  { id: "g3", context: "greeting", text: "小さな一歩が大きな筋肉になるッス", weight: 1 },
  { id: "g4", context: "greeting", text: "今日はどこを鍛えるッスか？", weight: 2 },
  { id: "g5", context: "greeting", text: "継続は筋力なり、ッス！", weight: 1 },
  { id: "g6", context: "greeting", text: "フォームが一番のサプリッス", weight: 1 },

  // --- 応援（記録中） ---
  { id: "e1", context: "encourage", text: "あと1セット！いけるッス！", weight: 2 },
  { id: "e2", context: "encourage", text: "その調子ッス！", weight: 2 },
  { id: "e3", context: "encourage", text: "呼吸を忘れずにッス〜", weight: 1 },
  { id: "e4", context: "encourage", text: "キツい時が伸びる時ッス！", weight: 1 },

  // --- セット完了 ---
  { id: "s1", context: "setDone", text: "ナイスセット！", weight: 3 },
  { id: "s2", context: "setDone", text: "いい重量ッス！", weight: 2 },
  { id: "s3", context: "setDone", text: "効いてる効いてる！", weight: 2 },
  { id: "s4", context: "setDone", text: "フォームも忘れずにッス", weight: 1 },
  { id: "s5", context: "setDone", text: "その1回が明日の筋肉ッス", weight: 1 },

  // --- セッション保存 ---
  { id: "w1", context: "workoutSaved", text: "おつかれさまッス！最高のトレでした！", weight: 2 },
  { id: "w2", context: "workoutSaved", text: "今日の自分に拍手ッス👏", weight: 2 },
  { id: "w3", context: "workoutSaved", text: "しっかり食べて寝るまでが筋トレッス", weight: 2 },
  { id: "w4", context: "workoutSaved", text: "また一歩強くなったッス！", weight: 2 },
  { id: "w5", context: "workoutSaved", text: "記録完了！プロテインの時間ッス", weight: 1 },

  // --- 自己ベスト更新 ---
  { id: "p1", context: "pb", text: "自己ベスト更新ッス！！🎉", weight: 3 },
  { id: "p2", context: "pb", text: "{exercise}で新記録ッス！強すぎ！", weight: 3 },
  { id: "p3", context: "pb", text: "限界を超えたッス！レジェンド！", weight: 2 },
  { id: "p4", context: "pb", text: "過去の自分に勝ったッス！", weight: 2 },

  // --- 休養日 ---
  { id: "r1", context: "restDay", text: "今日は休養も大事ッス！", weight: 2 },
  { id: "r2", context: "restDay", text: "筋肉は休んでる間に育つッス", weight: 2 },
  { id: "r3", context: "restDay", text: "休むのも筋トレのうちッス！", weight: 2 },
  { id: "r4", context: "restDay", text: "ストレッチだけでも◎ッス", weight: 1 },

  // --- 連続記録 ---
  { id: "st1", context: "streak", text: "{streak}日連続！炎が消えないッス🔥", weight: 2 },
  { id: "st2", context: "streak", text: "継続{streak}日目！本物ッス！", weight: 2 },
  { id: "st3", context: "streak", text: "{streak}日続いてるッス。もはや習慣！", weight: 1 },
];
