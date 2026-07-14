import { create } from "zustand";
import type { MascotContext, MascotMessage } from "@/types";
import {
  pickMascotMessage,
  type MascotMessageVars,
} from "@/services/mascotService";

interface MascotState {
  /** グローバルトーストとして表示中のメッセージ */
  currentMessage: MascotMessage | null;
  /** PB更新など特別な祝福か（紙吹雪演出用） */
  isCelebration: boolean;
  speak: (context: MascotContext, vars?: MascotMessageVars) => void;
  /** 定型プールを介さず、その場で組み立てた文言を直接話す（実績ベースの提案など） */
  speakText: (text: string, celebration?: boolean) => void;
  dismiss: () => void;
}

/** マスコット「マッスー」の発話。各featureからイベントを発火する */
export const useMascotStore = create<MascotState>((set) => ({
  currentMessage: null,
  isCelebration: false,

  speak: (context, vars) =>
    set({
      currentMessage: pickMascotMessage(context, vars),
      isCelebration: context === "pb",
    }),

  speakText: (text, celebration = false) =>
    set({
      currentMessage: {
        id: "advice",
        context: celebration ? "pb" : "encourage",
        text,
        weight: 1,
      },
      isCelebration: celebration,
    }),

  dismiss: () => set({ currentMessage: null, isCelebration: false }),
}));
