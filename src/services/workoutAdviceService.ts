import type { ExerciseRecord, WorkoutEntry } from "@/types";

export interface SetAdvice {
  text: string;
  /** 自己ベスト更新など、紙吹雪付きの特別な祝福か */
  celebrate: boolean;
}

export interface SetAdviceInput {
  weightKg: number;
  reps: number;
  /** 主観的運動強度 6.0-10.0（任意） */
  rpe?: number;
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

/** Epley式による推定1RM */
function estimate1rm(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  return weightKg * (1 + reps / 30);
}

/** 候補からランダムに1つ選ぶ（毎回同じ文言にならないように） */
function pick(candidates: string[]): string {
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * セット完了（チェック押下）時に、過去実績をもとにまっすーが返す一言を組み立てる。
 * パーソナルトレーナーが言いそうな「実績への言及＋次の一手」を意識し、
 * 優先度の高い達成から順に評価して最初に当てはまった提案を返す。
 */
export function pickSetAdvice(input: SetAdviceInput): SetAdvice {
  const { weightKg, reps, rpe, record, previous, setIndex, totalSets } = input;

  // 回数が入っていないセットには声かけしない（呼び出し側で握りつぶす）
  if (reps <= 0) return { text: "", celebrate: false };

  // --- A. 最高重量の更新（最も強い達成） ---
  if (record && weightKg > 0 && weightKg > record.maxWeight) {
    return {
      text: pick([
        `最高重量、更新ッス！ここまで積み上げた成果ッスね。フォームが崩れてなかったのも完璧`,
        `${weightKg}kgで自己ベスト達成ッス。次はこの重量を"余裕"で挙げられるようにしていきましょう`,
      ]),
      celebrate: true,
    };
  }

  // --- B. 推定1RMの更新 ---
  const est = estimate1rm(weightKg, reps);
  if (record && record.est1rm > 0 && est > record.est1rm + 0.5) {
    return {
      text: pick([
        `今のセットで推定1RMが${Math.round(est)}kg相当に伸びました。数字が示す成長ッス、自信持ってOK`,
        `推定1RM更新ッス。地力が上がってる証拠、この積み重ねが効いてます`,
      ]),
      celebrate: true,
    };
  }

  // --- C. 同一重量での最高回数の更新 ---
  if (
    record &&
    weightKg > 0 &&
    weightKg >= record.maxWeight &&
    reps > record.maxReps
  ) {
    return {
      text: `${weightKg}kgで${reps}回、最高回数の更新ッス！しっかり効いてる証拠`,
      celebrate: true,
    };
  }

  // --- D. 前回の同セットを上回った ---
  const prevSet = previous?.sets[setIndex];
  if (prevSet) {
    if (weightKg > prevSet.weightKg && weightKg > 0) {
      return {
        text: pick([
          `前回超えッス（${prevSet.weightKg}→${weightKg}kg）。少しずつでも上回り続けるのが最短ルート`,
          `前回より重い${weightKg}kg、着実に前進ッス。この調子でいきましょう`,
        ]),
        celebrate: false,
      };
    }
    if (weightKg === prevSet.weightKg && reps > prevSet.reps) {
      return {
        text: pick([
          `前回より${reps - prevSet.reps}回多いッス。その1回が一番効くやつ`,
          `同じ重量で回数が伸びてます。伸びしろが数字に出てるッス`,
        ]),
        celebrate: false,
      };
    }
    // --- E. 前回と同水準を維持 ---
    if (weightKg === prevSet.weightKg && reps === prevSet.reps) {
      return {
        text: `前回と同水準をキープ。安定して出せる＝実力になった証拠ッス`,
        celebrate: false,
      };
    }
  }

  // --- F. RPEが高い＝限界近くまで追い込めている ---
  if (rpe !== undefined && rpe >= 8.5) {
    return {
      text: pick([
        `かなり効いてますね。この1〜2レップが一番伸びる領域ッス`,
        `よく追い込めてます。ここで踏ん張れる人が伸びるッス`,
      ]),
      celebrate: false,
    };
  }

  // --- G. RPEが低い＝余力あり。次の一手を提案 ---
  if (rpe !== undefined && rpe > 0 && rpe <= 6.5 && weightKg > 0) {
    return {
      text: pick([
        `まだ余力ありッス。次のセットは2.5kg足してみましょうか`,
        `軽く挙がってますね。伸ばすチャンス、次は重量か回数を1つ上げてみましょう`,
      ]),
      celebrate: false,
    };
  }

  // --- H. ラストセット完了 ---
  const remaining = totalSets - (setIndex + 1);
  if (remaining === 0) {
    return {
      text: pick([
        `ラストまでやり切りました。今日の頑張り、しっかり刻まれてるッス`,
        `お疲れさまッス！最後まで質を落とさなかったのが素晴らしい`,
      ]),
      celebrate: false,
    };
  }

  // --- I. 途中セット（残りあり） ---
  if (remaining >= 1) {
    return {
      text: pick([
        `いいペースッス。この強度をあと${remaining}セット、集中していきましょう`,
        `ナイスセット。あと${remaining}セット、同じ集中でいきましょう`,
      ]),
      celebrate: false,
    };
  }

  // --- J. 汎用（実績データが無い初回など） ---
  return {
    text: pick([
      `ナイスセット。次も呼吸を止めず、下ろす動作を丁寧にッス`,
      `いい動きッス。フォームを保てば重量は後からついてきます`,
    ]),
    celebrate: false,
  };
}
