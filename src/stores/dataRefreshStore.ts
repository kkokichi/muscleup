import { create } from "zustand";

/**
 * 画面全体のデータ再取得トリガー。
 *
 * ログイン/ログアウトでデータソース（ローカル ⇄ Firestore）が切り替わったとき、
 * この epoch を増やすと DataRefreshBoundary の key が変わり、配下のページが
 * 再マウントされて各データフック（useHomeStats など）が最新のデータを取り直す。
 * window.location.reload() を使わずに済むため、iOS の standalone PWA で
 * ログイン後に画面が真っ白になる問題を避けられる。
 */
interface DataRefreshState {
  epoch: number;
  bump: () => void;
}

export const useDataRefreshStore = create<DataRefreshState>((set) => ({
  epoch: 0,
  bump: () => set((state) => ({ epoch: state.epoch + 1 })),
}));
