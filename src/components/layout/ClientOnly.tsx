"use client";

import { useHasMounted } from "@/hooks/useHasMounted";

/**
 * 子をクライアントマウント後にのみ描画する（SPA的レンダリング）。
 *
 * このアプリは静的エクスポート＋PWA/Capacitor で実質SPA。SSR（ビルド時）に
 * 実行時可変な値（今日の日付・localStorage・テーマ）を出すとハイドレーション
 * 不一致（React #418 等）を起こし、iOS Safari の standalone PWA では画面が
 * 真っ白になることがある。サーバー描画とマウント前の初回描画を「同じ静的な
 * フォールバック」に固定し、実コンテンツはマウント後にだけ描画することで、
 * ハイドレーション不一致そのものを発生させない。
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const mounted = useHasMounted();
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
