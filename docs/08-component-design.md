# 08. コンポーネント設計

## 設計原則

1. **Presentational / Container 分離**: features 内の `components/` は props のみで動く。データ取得は hooks に集約
2. **1コンポーネント1責務**: 200行超えたら分割
3. **アニメーションは Framer Motion**: カード出現 (`FadeInUp`)、数値カウントアップ、PB祝福演出を共通化

## コンポーネントツリー（主要画面）

### S-01 ホーム

```
HomePage (app/page.tsx)
└─ HomeDashboard (features/home)
   ├─ MascotGreetingCard      # マスコット + 今日のひとこと
   ├─ StreakCard              # 継続日数（炎アイコン + カウント）
   ├─ WeeklyStatsCard         # 今週のトレ回数（曜日ドット表示）
   ├─ LevelCard               # レベル + XPプログレスバー
   ├─ PersonalBestCard        # 自己ベスト更新数
   ├─ TodayPlanCard           # 今日の予定（テンプレート/前回部位から提案）
   └─ RecentWorkoutsList      # 最近の記録（→履歴詳細へ）
```

### S-02 ワークアウト記録

```
WorkoutNewPage
└─ WorkoutRecorder (features/workout)
   ├─ WorkoutHeader           # 日付・経過時間・完了ボタン
   ├─ ExerciseEntryList
   │   └─ ExerciseEntryCard   # 種目ごとのセット一覧
   │       ├─ SetRow          # 重量/回数/RPE + 完了チェック
   │       └─ AddSetButton    # 前回値コピーで1タップ追加
   ├─ ExercisePickerSheet     # 検索 + 最近使った順 + 部位フィルタ
   ├─ WorkoutNoteInput
   └─ MascotToast             # セット完了・PB更新の即時反応
```

### S-05 進捗

```
ProgressPage
└─ ProgressView (features/progress)
   ├─ ExerciseSelector        # 記録のある種目のみ表示
   ├─ StatSummaryRow          # 自己ベスト / 推定1RM / 月間成長率
   ├─ WeightChart             # Recharts LineChart（最大重量 & 推定1RM）
   └─ VolumeChart             # 週次ボリューム（将来）
```

### S-08 部位マップ

```
MuscleMapPage
└─ MuscleMapView (features/muscle-map)
   ├─ BodyMapSvg              # 前面/背面切替可能な人体SVG。部位 homver/tap
   └─ MusclePanel             # 選択部位の種目リスト（→種目詳細へ）
```

### 共通レイアウト

```
RootLayout
└─ AppShell (components/layout)
   ├─ PageHeader
   ├─ <main>{children}</main>
   └─ TabBar                  # 5タブ。中央が記録ボタン（アクセント色・大）
```

## マスコット設計

- `Mascot`（SVGキャラ「マッスー」: リス × ダンベルモチーフ）
  - props: `mood: 'happy' | 'excited' | 'cheering' | 'sleeping'`, `size`
- `MascotBubble`: 吹き出し。`mascotService` から文脈別メッセージを取得
- 表示文脈: ホーム挨拶 / セット完了 / セッション保存 / PB更新（紙吹雪演出付き）/ 休養日

## shadcn/ui 利用コンポーネント

Button, Card, Input, Textarea, Label, Select, Dialog, Tabs, Badge, Separator
（追加時は `npx shadcn add <name>`。直接編集可）

## 命名規約

- コンポーネント: PascalCase / ファイル名も PascalCase.tsx
- hooks: `useXxx.ts`、service: `xxxService.ts`、repository: `xxxRepository.ts`
- features 配下: `features/<name>/components/`, `features/<name>/hooks/`
