# MuscleUp 💪

**「ジムに行くのが楽しくなる」筋トレ記録アプリ**

筋トレ × SNS × AIコーチ × ゲーミフィケーションを組み合わせ、継続率の最大化を目指すワークアウトトラッカー。

## 特徴

- ⚡ **3タップ記録** — 前回の重量・回数を自動プリセット。ステッパーでワンタップ調整
- 🧩 **テンプレート** — 前回メニュー・保存済みメニューから1タップで開始
- ⏱️ **レストタイマー** — セット完了時に自動開始。60/90/120秒を切り替え
- 📈 **成長の可視化** — 種目ごとの重量推移・推定1RM・自己ベスト・月間成長率
- ✏️ **記録編集** — 履歴から重量・回数・RPE・メモ・所要時間を修正、削除時もPBを再計算
- 📖 **種目辞典** — 56種目のフォーム解説（やり方・注意点・初心者ポイント・よくある失敗）
- ➕ **オリジナル種目** — 種目辞典から自分だけの種目を追加・削除。部位マップや記録画面にもすぐ反映
- 🧍 **部位マップ** — 人体イラストの18の筋肉を個別にタップして種目を探せる
- 📍 **ジムチェックイン** — Google Maps上に位置＋コメントを投稿（共有）
- 💬 **アドバイス共有** — 種目ごとにコツを投稿・いいね（共有）
- 📲 **PWA対応** — Safariの「ホーム画面に追加」でアプリ風に起動
- 🐿️ **AIマスコット「マッスー」** — 応援・称賛・自己ベスト祝福・休養日の肯定
- 🔥 **継続の仕組み** — 継続日数・週間トレーニング・レベル/XP・称号

チェックインとアドバイスは、Firebaseを設定すると**全ユーザー間で共有**、
未設定ならローカル（単一端末）で動作します。設定手順は
[docs/13-backend-setup.md](docs/13-backend-setup.md) を参照。

## 技術スタック

| 領域 | 技術 |
|---|---|
| Frontend | Next.js 16 (App Router) / React 19 / TypeScript |
| UI | Tailwind CSS v4 / shadcn/ui / Framer Motion / Recharts |
| 状態管理 | Zustand（persist） |
| データ | Repository パターン: localStorage（デフォルト）⇄ Firestore（環境変数で切替） |
| Backend（任意） | Firebase Authentication（匿名） / Firestore |

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 で起動。**Firebase不要**でローカル保存のまま全機能が動作します。

### Firestore に切り替える場合

`.env.local` を作成（`.env.example` 参照）し、Firebaseプロジェクトの値を設定：

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

Firebase Console で **匿名認証** と **Firestore** を有効化してください。

## ドキュメント

設計ドキュメントは [docs/](docs/) に格納：

要件定義 / 画面一覧 / ユーザーフロー / ER図 / DB設計 / API設計 / ディレクトリ構成 / コンポーネント設計 / 状態管理設計 / MVP優先順位 / 将来拡張計画 / デザインガイドライン

## アーキテクチャ

```
app → features → hooks/stores → services / repositories → types
```

- **services**: 純粋なドメインロジック（1RM計算・PB判定・統計・XP）
- **repositories**: データソースの抽象化。Factory が環境に応じて Local / Firestore を返す
- **features**: 機能単位のUI。feature間の依存は禁止

詳細は [docs/07-directory-structure.md](docs/07-directory-structure.md) を参照。
