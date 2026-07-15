# App Store スクリーンショット

このフォルダの `*.png` は App Store Connect にアップロードする用のスクリーンショット。

- サイズ: **1290 × 2796 px**（iPhone 6.9"/6.7" スロットに対応）
- 5枚: ホーム / 記録 / 種目辞典 / 進捗 / バッジ
- デモデータ入りで自動生成（実データではない）

## 再生成

UIを変更したら作り直す:

```bash
npm run build                       # out/ を生成
npx serve out -l 5057               # 別ターミナルで配信
npm i -D puppeteer                  # 初回のみ
node scripts/gen-screenshots.mjs    # → このフォルダに5枚出力
```

PNG は `.gitignore` 済み（生成物のためコミットしない）。
