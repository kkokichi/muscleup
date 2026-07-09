import type { MascotContext, MascotMessage } from "@/types";
import { MASCOT_MESSAGES } from "@/data/mascotMessages";

export interface MascotMessageVars {
  exercise?: string;
  streak?: number;
}

/** 重み付きランダムで文脈に合ったメッセージを1件選ぶ */
export function pickMascotMessage(
  context: MascotContext,
  vars: MascotMessageVars = {},
): MascotMessage {
  const candidates = MASCOT_MESSAGES.filter((m) => {
    if (m.context !== context) return false;
    // プレースホルダに対応する値がない文言は除外
    if (m.text.includes("{exercise}") && !vars.exercise) return false;
    if (m.text.includes("{streak}") && vars.streak === undefined) return false;
    return true;
  });

  if (candidates.length === 0) {
    return { id: "fallback", context, text: "今日もいい筋トレ日和ッス！", weight: 1 };
  }

  const total = candidates.reduce((sum, m) => sum + m.weight, 0);
  let roll = Math.random() * total;
  let chosen = candidates[candidates.length - 1];
  for (const m of candidates) {
    roll -= m.weight;
    if (roll <= 0) {
      chosen = m;
      break;
    }
  }

  return { ...chosen, text: fillVars(chosen.text, vars) };
}

function fillVars(text: string, vars: MascotMessageVars): string {
  return text
    .replaceAll("{exercise}", vars.exercise ?? "")
    .replaceAll("{streak}", vars.streak !== undefined ? String(vars.streak) : "");
}
