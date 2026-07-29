# MuscleUp スクラム記録

muscleup を題材に「スクラム的に」機能開発を回した記録。
プロダクトバックログ・スプリント記録・レトロスペクティブを残す。
（学習用プレイブック「スクラム × AI-DLC 実践プレイブック」のラウンドA＝スクラムに対応）

## 目次
- [product-backlog.md](./product-backlog.md) — プロダクトバックログ（優先順位つき）
- [sprint-log.md](./sprint-log.md) — スプリントごとの目標・スコープ・成果・コミット
- [retrospective.md](./retrospective.md) — 各スプリントの振り返り（KPT）

## ロールの割り当て（一人＋AIでの模擬）
| ロール | 担当 |
|---|---|
| プロダクトオーナー（何を・なぜ） | 一ノ瀬（人間） |
| 開発チーム（どう作るか） | Claude Code |
| スクラムマスター（型の番人） | 一ノ瀬が兼務（薄め） |

## このリポジトリでのルール運用メモ
- 共有データ（checkins 配下の reactions / comments など）を追加したら
  **`firestore.rules` を Firebase コンソールで再デプロイ**する。忘れると本番で
  `permission-denied`。ルール変更を伴う PBI は「再デプロイ」を DoD に含める。
