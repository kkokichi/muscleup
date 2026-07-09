# 07. ディレクトリ構成

```
muscleup/
├─ docs/                          # 設計ドキュメント（本ディレクトリ）
├─ public/
└─ src/
   ├─ app/                        # Next.js App Router（ルーティングのみ・薄く保つ）
   │   ├─ layout.tsx              # ルートレイアウト（AppShell）
   │   ├─ page.tsx                # S-01 ホーム
   │   ├─ workout/new/page.tsx    # S-02 記録
   │   ├─ history/page.tsx        # S-03 履歴一覧
   │   ├─ history/[id]/page.tsx   # S-04 履歴詳細
   │   ├─ progress/page.tsx       # S-05 進捗
   │   ├─ exercises/page.tsx      # S-06 種目辞典
   │   ├─ exercises/[id]/page.tsx # S-07 種目詳細
   │   └─ muscle-map/page.tsx     # S-08 部位マップ
   │
   ├─ components/                 # 汎用UI（ドメイン知識を持たない）
   │   ├─ ui/                     # shadcn/ui プリミティブ
   │   └─ layout/                 # AppShell, TabBar, PageHeader
   │
   ├─ features/                   # 機能単位（UI＋ロジックの結合点）
   │   ├─ home/                   # ダッシュボードカード群
   │   ├─ workout/                # 記録フォーム、種目ピッカー、セット入力
   │   ├─ history/                # 履歴リスト・詳細
   │   ├─ progress/               # グラフ、統計カード
   │   ├─ exercises/              # 辞典一覧・詳細
   │   ├─ muscle-map/             # 人体SVGマップ
   │   └─ mascot/                 # マスコット表示・吹き出し
   │
   ├─ hooks/                      # 共有カスタムフック（useWorkoutLogs 等）
   ├─ services/                   # 純粋なドメインロジック（副作用なし・テスト容易）
   ├─ repositories/               # データアクセス抽象化
   │   ├─ interfaces.ts
   │   ├─ local/                  # localStorage 実装（MVPデフォルト）
   │   ├─ firestore/              # Firestore 実装
   │   └─ index.ts                # Factory（環境で切替）
   ├─ stores/                     # Zustand ストア
   ├─ types/                      # ドメイン型定義（依存の最下層）
   ├─ utils/                      # 汎用ユーティリティ（date, cn 等）
   ├─ data/                       # シードデータ（種目マスタ、マスコットメッセージ）
   └─ lib/                        # 外部サービス初期化（firebase.ts）
```

## 依存ルール（Clean Architecture）

```
app → features → hooks/stores → services / repositories → types
components(ui) ←─ どこからでも利用可（ただし ui は他層に依存しない）
```

- **types** は何にも依存しない（最内層）
- **services** は types のみに依存（純関数群。ユニットテスト対象）
- **repositories** は types + lib に依存。UIを知らない
- **features** は下位層を組み合わせる。**他の feature に依存しない**
- **app/** はルーティングとレイアウトのみ。ロジックを書かない

## ファイルサイズ規律

- 1ファイル 200行 を超えたら分割を検討
- 1コンポーネント = 1責務。「〜Card」「〜List」「〜Form」単位で分割
