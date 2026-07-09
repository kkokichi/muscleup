# 05. データベース設計（Firestore）

## 方針

- **MVPはローカル（localStorage）で完全動作**し、Firebase 環境変数を設定すると Firestore に自動切替
- Repository インターフェースは共通（06参照）。物理層だけ差し替える
- Firestore は「読み取り最適化」でモデリング：ユーザー配下にサブコレクション、集計値は非正規化して保持

## コレクション構成

```
users/{userId}
  ├─ profile fields (displayName, level, xp, currentStreak, ...)
  ├─ workoutLogs/{logId}
  │    ├─ date, note, durationMinutes, createdAt
  │    └─ sets: WorkoutSet[]   ← 1セッションのセットは埋め込み配列
  ├─ records/{exerciseId}
  │    └─ maxWeight, est1rm, maxReps, maxVolume, achievedAt (種目ごと1ドキュメント)
  ├─ templates/{templateId}
  └─ achievements/{achievementId}

exercises/{exerciseId}          ← 全ユーザー共有マスタ（シード）
users/{userId}/customExercises/{exerciseId} ← ユーザー追加種目

mascotMessages/{messageId}      ← マスタ（MVPではコードに同梱）

-- フェーズ2 --
gyms/{gymId}
checkins/{checkinId}
posts/{postId}
  ├─ comments/{commentId}
  └─ likes/{userId}
follows/{followerId_followeeId}
notifications/{userId}/items/{notificationId}
```

## 正規化と非正規化の使い分け

| データ | 論理設計 | Firestore実装 | 理由 |
|---|---|---|---|
| WorkoutSets | 独立テーブル | ログに**埋め込み** | セットは常にセッション単位で読み書きされる。1ドキュメント=1セッションで読取1回 |
| Records | 独立テーブル | 種目ごと1ドキュメント | PB判定を1読取で完了。書込みは記録保存時のみ |
| likeCount 等 | 集計 | Posts に**非正規化** | フィード表示で集計クエリを避ける（Cloud Functions で整合性維持） |
| Exercises | マスタ | ルートコレクション | 全ユーザー共有・読取専用 |

## インデックス（Firestore composite）

| コレクション | フィールド | 用途 |
|---|---|---|
| workoutLogs | date DESC | 履歴一覧 |
| posts | createdAt DESC | フィード（フェーズ2） |
| checkins | gymId ASC, checkedInAt DESC | ジム別履歴（フェーズ2） |

セット単位の種目別推移は、`workoutLogs` を日付降順で読み、クライアント側で該当種目を抽出する
（個人データは量が小さいためMVPでは十分。将来は `exerciseStats/{exerciseId}` に日次集計を非正規化）。

## セキュリティルール（方針）

```
users/{userId}/** : request.auth.uid == userId のみ read/write
exercises          : 認証済み read、write は管理者のみ
posts              : read は公開範囲に従う、write は本人のみ（フェーズ2）
```

## ローカル実装（MVP デフォルト）

- `localStorage` にキー `muscleup:v1:<entity>` で JSON 保存
- スキーマバージョンをキーに含め、将来のマイグレーションに備える
- Repository 層で完全に隠蔽されるため、UI・Service 層はデータソースを知らない
