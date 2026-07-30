"use client";

import { Fragment, useEffect } from "react";
import { subscribeReposChanged } from "@/repositories";
import { useDataRefreshStore } from "@/stores/dataRefreshStore";

/**
 * データソースが切り替わったとき、配下のページを再マウントして各データフックに
 * 最新データを取り直させる。key を変えるだけで済むため、window.location.reload()
 * （standalone PWA で画面が真っ白になる）を使わずにデータを反映できる。
 *
 * 契機は2つ:
 *  1. ログイン/ログアウト操作（AccountSection が bump）
 *  2. 認証状態の変化にデータ層が追従したとき（repositories からの通知）
 *     → iOS の PWA がコールドスタートし、セッション復元前にローカルへ確定して
 *       しまった場合でも、復元後に自動でクラウドへ切り替えて記録を復帰させる。
 *
 * このコンポーネント自身は key の外側にあるため再マウントされず、購読は安定する。
 */
export function DataRefreshBoundary({ children }: { children: React.ReactNode }) {
  const epoch = useDataRefreshStore((state) => state.epoch);
  const bump = useDataRefreshStore((state) => state.bump);

  useEffect(() => subscribeReposChanged(bump), [bump]);

  return <Fragment key={epoch}>{children}</Fragment>;
}
