/**
 * Google Maps 設定。NEXT_PUBLIC_GOOGLE_MAPS_API_KEY が未設定の場合、
 * 地図は表示せず、位置情報＋手入力によるチェックインにフォールバックする。
 */
export function getMapsApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || undefined;
}

export function isMapsConfigured(): boolean {
  return Boolean(getMapsApiKey());
}

/** 地図の初期表示位置（東京駅）。現在地が取れない場合のフォールバック */
export const DEFAULT_MAP_CENTER = { lat: 35.681236, lng: 139.767125 };
