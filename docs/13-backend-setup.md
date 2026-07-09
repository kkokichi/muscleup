# 13. バックエンド設定ガイド（共有機能・地図の有効化）

MVPは設定なしでも**ローカル保存（単一端末）**で全機能が動きます。
以下を設定すると、チェックインと種目アドバイスが**全ユーザー間で共有**され、
チェックインが**Google Maps上にピン＋コメント**で表示されます。

---

## A. Firebase（チェックイン・アドバイスの共有）

### 1. プロジェクト作成
1. [Firebase Console](https://console.firebase.google.com/) で新規プロジェクトを作成
2. 「ウェブアプリを追加」して設定オブジェクト（apiKey等）を取得

### 2. 認証を有効化
- Authentication → Sign-in method → **匿名（Anonymous）** を有効化
  （MVPは匿名認証。将来Google/Apple連携にアップグレード可能）

### 3. Firestore を有効化
- Firestore Database → データベースを作成（本番モードで開始）
- ルールタブに [`firestore.rules`](../firestore.rules) の内容を貼り付けて公開
- 複合インデックス（初回アクセス時にコンソールがリンクを表示）:
  - `exerciseAdvice`: `exerciseId ASC, createdAt DESC`

### 4. 環境変数を設定
`.env.local`（ローカル開発）またはGitHub Secrets（デプロイ）に設定:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## B. Google Maps（チェックインの地図表示）

### 1. APIキー取得
1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「Maps JavaScript API」を有効化
3. 認証情報 → APIキーを作成

### 2. キーの制限（重要）
静的サイトではキーがブラウザに露出します。必ず制限を:
- **アプリケーションの制限**: HTTPリファラー → `https://kkokichi.github.io/*` と `http://localhost:3000/*`
- **API の制限**: Maps JavaScript API のみ
- 請求アラート・上限を設定して想定外課金を防ぐ

### 3. 環境変数を設定
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

---

## C. GitHub Pages（デプロイ）への反映

`NEXT_PUBLIC_*` はビルド時に埋め込まれるため、GitHub Secrets に登録します:

1. リポジトリ → Settings → Secrets and variables → **Actions**
2. 上記の各 `NEXT_PUBLIC_*` を Secret として登録
3. `main` にpush（または Actions を手動実行）すると、値が反映された状態で再デプロイされる

Secret未登録の項目は空文字になり、その機能だけローカル保存にフォールバックします
（他の機能は正常に動作します）。

---

## アーキテクチャ上の切替ポイント

| レイヤ | 役割 |
|---|---|
| [`src/lib/firebase.ts`](../src/lib/firebase.ts) | `isFirebaseConfigured()` で設定有無を判定 |
| [`src/repositories/index.ts`](../src/repositories/index.ts) | Factory が Firestore実装 / ローカル実装を切替 |
| [`src/lib/maps.ts`](../src/lib/maps.ts) | `isMapsConfigured()` で地図 / フォールバックを切替 |

UI・Service層はデータソースを一切意識しません。設定を入れるだけで共有が有効化されます。
