# AI-DLC ワークフロー導入メモ

このディレクトリは [awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows)
（AI-Driven Development Lifecycle）を muscleup に導入したものです。

## 構成
- `.aidlc/core-workflow.md` … ワークフロー本体（Inception / Construction / Operations の手順）
- `.aidlc-rule-details/` … 各ステージの詳細ルール（common / inception / construction / operations / extensions）
- ルート `CLAUDE.md` から `@.aidlc/core-workflow.md` を import して有効化している

出所: awslabs/aidlc-workflows（ライセンス: MIT-0 / `.aidlc/UPSTREAM-LICENSE`、バージョン: `.aidlc/UPSTREAM-VERSION`）

## 使い方（トリガー）
Claude Code のチャットで、意図を「Using AI-DLC, …」で始めて宣言する：

```
Using AI-DLC, muscleupに「フレンドのブロック機能」を追加したい
```

- 既存コードありのため brownfield として Reverse Engineering から入る
- 各ステージは承認制（`DO NOT PROCEED until user confirms`）。あなたが「OK」を出すまで進まない
- 進行状態は `aidlc-docs/aidlc-state.md`、監査ログは `aidlc-docs/audit.md` に記録される（実行時に生成）

## 無効化したいとき
ルート `CLAUDE.md` の `@.aidlc/core-workflow.md` の行を削除（またはコメントアウト）する。

## 更新（アップストリーム追従）
awslabs/aidlc-workflows を再取得し、`aws-aidlc-rules/core-workflow.md` を
`.aidlc/core-workflow.md` に、`aws-aidlc-rule-details/*` を `.aidlc-rule-details/` に
上書きコピーする。
