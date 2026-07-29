"use client";

import { Fragment } from "react";
import { useDataRefreshStore } from "@/stores/dataRefreshStore";

/**
 * ログイン/ログアウトでデータソースが切り替わったとき、配下のページを
 * 再マウントして各データフックに最新データを取り直させる。key を変えるだけで
 * 済むため、window.location.reload()（standalone PWA で画面が真っ白になる）を
 * 使わずにデータを反映できる。
 */
export function DataRefreshBoundary({ children }: { children: React.ReactNode }) {
  const epoch = useDataRefreshStore((state) => state.epoch);
  return <Fragment key={epoch}>{children}</Fragment>;
}
