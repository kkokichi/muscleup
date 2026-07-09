# MuscleUp 💪

**「ジムに行くのが楽しくなる」筋トレ記録アプリ**

筋トレ × SNS × AIコーチ × ゲーミフィケーションを組み合わせ、継続率の最大化を目指すワークアウトトラッカー。

## 特徴（MVP）

- ⚡ **3タップ記録** — 前回の重量・回数を自動プリセット。ステッパーでワンタップ調整
- 📈 **成長の可視化** — 種目ごとの重量推移・推定1RM・自己ベスト・月間成長率
- 📖 **種目辞典** — 24種目のフォーム解説（やり方・注意点・初心者ポイント・よくある失敗）
- 🧍 **部位マップ** — 人体イラストをタップして部位別の種目を探せる
- 🐿️ **AIマスコット「マッスー」** — 応援・称賛・自己ベスト祝福・休養日の肯定
- 🔥 **継続の仕組み** — 継続日数・週間トレーニング・レベル/XP・称号

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
