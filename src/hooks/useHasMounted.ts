"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * クライアントマウント済みかどうか。
 * persistされたZustandストアやlocalStorage由来の表示は
 * SSRとのハイドレーション不一致を避けるためマウント後に描画する。
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // クライアント
    () => false, // SSR
  );
}
