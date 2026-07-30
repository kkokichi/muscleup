"use client";

import { useEffect } from "react";

/**
 * サービスワーカーを登録し、更新があれば自動でリロードして最新を適用する。
 *
 * これにより、iOS の standalone PWA でも「デプロイした修正が端末に届かない」
 * （古いコードをキャッシュから動かし続ける）問題を根絶する。SW 側は HTML を
 * network-first にしているため、常に最新の index.html → 最新のJSに更新される。
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    // 既にSWに制御されている＝再訪。ここで controllerchange が来たら「更新」なので
    // リロードして最新を適用する。初回インストール時（未制御）はリロードしない。
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloaded = false;
    const onControllerChange = () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker
      .register(`${base}/sw.js`, { scope: `${base}/` })
      .then((reg) => reg.update().catch(() => undefined))
      .catch((e) => console.error("Service Worker の登録に失敗", e));

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  return null;
}
