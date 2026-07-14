import type { ExerciseRecord, WorkoutEntry } from "@/types";

export interface SetAdvice {
  text: string;
  /** 自己ベスト更新など、紙吹雪付きの特別な祝福か */
  celebrate: boolean;
}

export interface SetAdviceInput {
  weightKg: number;
  reps: number;
  /** この種目の自己ベスト。未記録なら null */
  record: ExerciseRecord | null;
  /** 前回セッションの同種目の記録。なければ null */
  previous: WorkoutEntry | null;
  /** 何番目のセットか（0始まり） */
  setIndex: number;
  /** この種目の総セット数 */
  totalSets: number;
  exerciseName?: string;
}

/** Epley式による推定1RM。回数入力のたびに再計算する軽量な指標 */
function estimate1rm(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  return weightKg * (1 + reps / 30);
}

/**
 * 回数を入力した瞬間に、過去の実績をもとにまっすーが返す一言を組み立てる。
 * 優先度の高い「達成」から順に評価し、最初に当てはまった提案を返す。
 */
export function pickSetAdvice(input: SetAdviceInput): SetAdvice {
  const { weightKg, reps, record, previous, setIndex, totalSets } = input;

  // 実績と比較できるだけの入力が揃っていない場合は無言（呼び出し側で握りつぶす）
  if (reps <= 0) return { text: "", celebrate: false };

  // --- 1. 最高重量の更新（最も強い達成） ---
  if (record && weightKg > 0 && weightKg > record.maxWeight) {
    return {
      text: `最高重量更新ッス！${weightKg}kgは自己ベスト🎉`,
      celebrate: true,
    };
  }

  // --- 2. 推定1RMの更新 ---
  const est = estimate1rm(weightKg, reps);
  if (record && record.est1rm > 0 && est > record.est1rm + 0.5) {
    return {
      text: `推定1RM更新ッス！${Math.round(est)}kg相当、伸びてる🔥`,
      celebrate: true,
    };
  }

  // --- 3. 同一重量での最高回数の更新 ---
  if (
    record &&
    weightKg > 0 &&
    weightKg >= record.maxWeight &&
    reps > record.maxReps
  ) {
    return {
      text: `${weightKg}kgで${reps}回！最高回数の更新ッス！`,
      celebrate: true,
    };
  }

  // --- 4. 前回の同セットとの比較 ---
  const prevSet = previous?.sets[setIndex];
  if (prevSet) {
    if (weightKg > prevSet.weightKg && weightKg > 0) {
      return {
        text: `前回より重いッス（${prevSet.weightKg}→${weightKg}kg）！ナイス👍`,
        celebrate: false,
      };
    }
    if (weightKg === prevSet.weightKg && reps > prevSet.reps) {
      return {
        text: `前回より${reps - prevSet.reps}回多いッス！確実に前進💪`,
        celebrate: false,
      };
    }
    if (weightKg === prevSet.weightKg && reps === prevSet.reps) {
      return { text: "前回と同じ！安定して積み上げてるッス", celebrate: false };
    }
  }

  // --- 5. 残りセット数からの声かけ（あと1セットなど） ---
  const remaining = totalSets - (setIndex + 1);
  if (remaining === 1) {
    return { text: "あと1セット！ここが踏ん張りどころッス", celebrate: false };
  }
  if (remaining === 0) {
    return { text: "ラストセット！出し切るッス🔥", celebrate: false };
  }
  if (remaining > 1) {
    return { text: `残り${remaining}セット、いいペースッス！`, celebrate: false };
  }

  // --- 6. 回数の傾向に応じたフォールバック ---
  if (reps >= 12) {
    return { text: "高回数で追い込んでるッス！効いてる〜", celebrate: false };
  }
  if (reps <= 5 && weightKg > 0) {
    return { text: "低レップ高重量、パワー系ッスね！", celebrate: false };
  }
  return { text: "ナイスセットッス！その調子〜", celebrate: false };
}
