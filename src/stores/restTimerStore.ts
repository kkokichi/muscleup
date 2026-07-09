import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RestTimerState {
  endsAt: string | null;
  durationSeconds: number;
  start: (durationSeconds?: number) => void;
  stop: () => void;
  addSeconds: (seconds: number) => void;
}

export const useRestTimerStore = create<RestTimerState>()(
  persist(
    (set, get) => ({
      endsAt: null,
      durationSeconds: 90,

      start: (durationSeconds = get().durationSeconds) => {
        const endsAt = new Date(Date.now() + durationSeconds * 1000).toISOString();
        set({ endsAt, durationSeconds });
      },

      stop: () => set({ endsAt: null }),

      addSeconds: (seconds) => {
        const endsAt = get().endsAt;
        const current = endsAt ? new Date(endsAt).getTime() : Date.now();
        set({ endsAt: new Date(current + seconds * 1000).toISOString() });
      },
    }),
    { name: "muscleup:v1:restTimer" },
  ),
);
