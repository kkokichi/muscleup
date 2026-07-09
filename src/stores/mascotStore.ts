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

  dismiss: () => set({ currentMessage: null, isCelebration: false }),
}));
