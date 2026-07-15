# iOS App Store 提出ガイド（Capacitor + クラウドMacビルド）

MuscleUp は Next.js の静的エクスポート（`out/`）を **Capacitor** でネイティブ iOS
アプリにラップして App Store に提出する。Windows だけで完結させるため、ビルドと
署名は **Codemagic**（クラウドMac CI）で行う。

## 準備状況（課金前に完了済み）

技術面は「課金すれば即アップロードできる」状態まで整備済み:

- ✅ Capacitor 導入・iOSプロジェクト生成（`ios/`）
- ✅ アプリアイコン 1024px 不透明 / スプラッシュ生成
- ✅ 共有スキーム `App.xcscheme`（CIの `build-ipa` に必須）
- ✅ Bundle ID `com.kkokichi.muscleup` / バージョン 1.0(1)
- ✅ Info.plist 縦向き固定・輸出コンプライアンス回答
- ✅ プライバシーマニフェスト `PrivacyInfo.xcprivacy`
- ✅ プライバシーポリシー公開: https://kkokichi.github.io/muscleup/privacy/
- ✅ `npm ci` / `npm run build` がCIで通ることを検証済み
- ✅ 静的エクスポートがフラット配信で正常動作（Capacitor想定）を検証済み

残るのは **Apple/Codemagic のアカウント作業のみ**（下記runbook）。

## 課金後の最短手順（runbook）

1. **Apple Developer Program 登録**（$99/年）
2. Apple Developer で **App ID `com.kkokichi.muscleup`** を登録
3. **App Store Connect** で同 Bundle ID の新規アプリを作成
   - プライバシーポリシーURL に上記URLを入力
   - `docs/15-appstore-listing.md` の名称・説明文・キーワードを入力
4. App Store Connect → Users and Access → Integrations で **API キー**発行（.p8/Key ID/Issuer ID）
5. **Codemagic** にサインアップ→本リポ接続→Integrations に API キーを名前 **`AppStoreConnect`** で登録
6. Codemagic で `ios-appstore` ワークフローを実行（または main に push）
   → 自動でビルド→署名→**TestFlight** へアップロード
7. スクリーンショットを撮影して App Store Connect にアップロード（`docs/15` 参照）
8. 「審査に提出」

補足: プライバシーポリシーの連絡先メールを `src/app/privacy/page.tsx` に記入してから運用する。

## 構成

- `capacitor.config.ts` … アプリID・アプリ名・`webDir: out` などの設定
- `ios/` … Capacitor が生成した Xcode プロジェクト（Capacitor 8 は SPM 方式。CocoaPods 不要）
- `codemagic.yaml` … クラウドMacでのビルド〜TestFlight アップロード定義
- `out/` と iOS のビルド生成物は gitignore 済み。CI が毎回 `npm run build` → `cap sync` で再生成する

## 必要なもの（自分で用意）

| 項目 | 内容 |
|---|---|
| Apple Developer Program | 年間 $99。これがないと提出不可 |
| App Store Connect API キー | Codemagic の署名・アップロードに使用 |
| 1024×1024 のアプリアイコン(PNG) | 審査に必須。透過なし |

## セットアップ手順

### 1. Bundle ID を決める
`capacitor.config.ts` の `appId`（現在 `com.kkokichi.muscleup`）を、Apple Developer で
登録する App ID と一致させる。変更したら以下も合わせる:
- `codemagic.yaml` の `BUNDLE_ID`
- Xcode プロジェクトの Bundle Identifier（`cap sync` 後、または Codemagic の署名設定で上書き）

### 2. Apple 側の登録
1. [Apple Developer](https://developer.apple.com/) で Bundle ID を登録
2. [App Store Connect](https://appstoreconnect.apple.com/) で同じ Bundle ID の新規アプリを作成
3. App Store Connect → Users and Access → Integrations で **App Store Connect API キー** を発行
   （Issuer ID / Key ID / .p8 を控える）

### 3. Codemagic を設定
1. [codemagic.io](https://codemagic.io/) にサインアップし、この GitHub リポジトリを接続
2. Teams → Integrations → App Store Connect に上記 API キーを登録し、
   名前を `AppStoreConnect` にする（`codemagic.yaml` の `integrations` と一致させる）
3. リポジトリに push すると `codemagic.yaml` の `ios-appstore` ワークフローが走り、
   ビルド → 署名 → **TestFlight** へアップロードされる

### 4. アイコン/スプラッシュ（審査前に必須）
1. 1024×1024 の PNG を `resources/icon.png` に置く（スプラッシュは `resources/splash.png`）
2. 生成ツールを実行:
   ```bash
   npm i -D @capacitor/assets
   npx capacitor-assets generate --ios
   ```
   → 各サイズのアイコン/起動画面が `ios/` に生成される

### 5. 審査提出
TestFlight で動作確認 → App Store Connect でスクリーンショット・説明文・
プライバシー情報を入力 → 「審査に提出」。
`codemagic.yaml` の `submit_to_testflight` を `submit_to_app_store: true` に
すると自動で審査提出まで行える。

## 審査で落ちやすい点（対策済み/要対応）

- **4.2 最低限の機能**: 単なるWebView包みは弾かれる。本アプリはローカル保存・
  オフライン動作・記録/実績など実機能があるため有利。さらにネイティブ感を出すため
  `@capacitor/haptics`（セット完了時の触覚）等を導入済み。必要なら通知も追加する。
- **プライバシー**: ローカル保存中心（アカウントは任意の Google ログイン）。
  App Store Connect のプライバシー質問で「データ収集」を正しく申告する。
- **アイコン**: SVG 不可。上記 4. でラスタ画像を生成すること。

## ローカルに Mac がある場合
`npm run mobile:sync`（`next build` + `cap sync ios`）→ `npm run mobile:open` で
Xcode を開き、そのままビルド・提出できる。
