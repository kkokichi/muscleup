"use client";

import { Fragment, useEffect } from "react";
import { subscribeReposChanged } from "@/repositories";
import { useDataRefreshStore } from "@/stores/dataRefreshStore";

/**
 * 端末データをインポートするなど、リポジトリから更新通知があったときに配下を
 * 再マウントし、各データフックへ最新データを取り直させる。
 *
 * このコンポーネント自身は key の外側にあるため再マウントされず、購読は安定する。
 */
export function DataRefreshBoundary({ children }: { children: React.ReactNode }) {
  const epoch = useDataRefreshStore((state) => state.epoch);
  const bump = useDataRefreshStore((state) => state.bump);

  useEffect(() => subscribeReposChanged(bump), [bump]);

  return <Fragment key={epoch}>{children}</Fragment>;
}
