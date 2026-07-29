# スプリント記録

## Sprint 0（プレ）: ログイン/PWA 系の欠陥修正（PBI-0）

ログイン絡みで連鎖していた不具合を修正。

| コミット | 内容 |
|---|---|
| `67adf55` | ログイン中でも履歴が反映されない。認証判定を localStorage フラグ→実セッション（getSignedInUser）に変更 |
| `6d54c71` | ログイン直後にログアウト（〜10秒）。Auth 永続化を localStorage 優先で明示（WKWebView/Safari 対策） |
| `5e3fb59` | ログイン後にホームが真っ白（standalone PWA）。`window.location.reload()` を廃止し、reposを再評価＋画面再マウントで反映 |
| `713aa97` | 再表示でホームが出ない/固まる。ErrorBoundary 追加＋ `userProfile.get()` の read 中 write を fire-and-forget 化（オフライン起動時のハング防止） |

**DoD**: 実機 Safari PWA でログイン→ホーム表示が白くならない／セッション維持／履歴反映 → 実機確認済みでクローズ。

---

## Sprint 1: 交流エピック MVP（Foundation + 11a + 11c）

- **スプリントゴール**: トレーニー同士が「チェックインに反応し合える」最小の交流ループを作る
- **PO判断**: 分析グラフ(PBI-1,2)は作成済のため除外／案③を採用（コメント11bは次スプリント）／リアクションは3種／通知はアプリ内・lastSeenAt方式
- **コミット**: `3b9c20d`

成果:
- Foundation: `CheckinReaction` 型、`getReactions`/`setReaction`、Firestore＋ローカル実装、`firestore.rules`（reactions）
- 11a: `useCheckinReactions`、`CheckinCard` に 💪🔥👍＋カウント＋自分の押下状態
- 11c: `useCheckinNotifications`（自分の投稿への他者リアクションを集計、lastSeenAt で未読判定）、ホームの `CheerNotificationsCard`

**スプリント中の割り込み欠陥**:
- `52e0cb2` チェックインが位置情報必須で送信できない → 位置を任意化（マップ未設定/PWAで位置不可でも送信可能に）

---

## Sprint 2: 応援コメント（11b）

- **スプリントゴール**: コメントで会話できるようにする
- **設計**: サブコレクション `comments/{id}`／最大140字／削除のみ（編集なし）／カード展開UI
- **コミット**: `2056b7c`

成果:
- Foundation: `CheckinComment` 型、`getComments`/`addComment`/`deleteComment`、Firestore＋ローカル実装、`firestore.rules`（comments）
- UI: `useCheckinComments`（一覧・投稿・削除・楽観更新）、`CheckinComments`、`CheckinCard` の「コメント」トグル

**受け入れ条件**: 一覧＝新しい順／投稿で即反映／自分のみ削除／空白不可＋140字／未ログインは閲覧のみ → 満たす。

---

## エピック到達状況
「応援を送る(11a)・会話する(11b)・気づく(11c)」の交流ループが一通り完成。残り 11d/11e はバックログ。
