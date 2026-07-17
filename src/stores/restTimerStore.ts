import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RestTimerState {
  endsAt: string | null;
  /** 設定で決めるレストの既定秒数（開始時に使う） */
  defaultDurationSeconds: number;
  /** 直近に開始したレストの秒数（進捗バー表示用） */
  durationSeconds: number;
  start: (durationSeconds?: number) => void;
  stop: () => void;
  addSeconds: (seconds: number) => void;
  setDefaultDuration: (seconds: number) => void;
}

const MIN_SECONDS = 15;
const MAX_SECONDS = 600;

function clamp(seconds: number): number {
  return Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, Math.round(seconds)));
}

export const useRestTimerStore = create<RestTimerState>()(
  persist(
    (set, get) => ({
      endsAt: null,
      defaultDurationSeconds: 90,
      durationSeconds: 90,

      start: (durationSeconds = get().defaultDurationSeconds) => {
        const seconds = clamp(durationSeconds);
        const endsAt = new Date(Date.now() + seconds * 1000).toISOString();
        set({ endsAt, durationSeconds: seconds });
      },

      stop: () => set({ endsAt: null }),

      addSeconds: (seconds) => {
        const endsAt = get().endsAt;
        const current = endsAt ? new Date(endsAt).getTime() : Date.now();
        set({ endsAt: new Date(current + seconds * 1000).toISOString() });
      },

      setDefaultDuration: (seconds) => set({ defaultDurationSeconds: clamp(seconds) }),
    }),
    { name: "muscleup:v1:restTimer" },
  ),
);
