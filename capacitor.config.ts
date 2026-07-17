/// <reference types="@capacitor-firebase/authentication" />

import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor 設定。Next.js の静的エクスポート（out/）をネイティブアプリの
 * WebView にバンドルして iOS App Store に提出するための構成。
 *
 * appId は Apple Developer で作成する App ID（Bundle ID）と一致させること。
 * 変更する場合は Xcode / App Store Connect 側の Bundle ID も合わせる。
 */
const config: CapacitorConfig = {
  appId: "com.kkokichi.muscleup",
  appName: "MuscleUp",
  webDir: "out",
  backgroundColor: "#0a0a0b",
  ios: {
    // ノッチ/セーフエリアはWeb側(pb-safe等)で処理するため never
    contentInset: "never",
    backgroundColor: "#0a0a0b",
  },
  plugins: {
    FirebaseAuthentication: {
      providers: ["google.com"],
      skipNativeAuth: true,
    },
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#0a0a0b",
      showSpinner: false,
    },
  },
};

export default config;
