/**
 * localStorage の薄いラッパー。
 * スキーマバージョンをキーに含め、将来のマイグレーションに備える。
 * SSR時（window未定義）は安全に空値を返す。
 */
const PREFIX = "muscleup:v1:";

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}
