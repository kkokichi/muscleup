// アプリアイコン/スプラッシュのソース画像を SVG から生成する。
// 生成物: resources/icon.png(1024, 不透明), resources/splash.png / splash-dark.png(2732)
// 実行後に `npx capacitor-assets generate --ios` で各サイズへ展開する。
import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const svg = readFileSync(path.join(root, "public/muscleup-icon.svg"));
const out = path.join(root, "resources");
mkdirSync(out, { recursive: true });

const BG = { r: 10, g: 10, b: 11, alpha: 1 }; // #0a0a0b

// アイコン: iOSは透過不可 & 角丸はOSが付けるので、角丸の外側も背景色で塗りつぶす
await sharp(svg)
  .resize(1024, 1024)
  .flatten({ background: BG })
  .png()
  .toFile(path.join(out, "icon.png"));

// スプラッシュ: 暗い背景の中央にアイコンを配置
const logo = await sharp(svg).resize(760, 760).png().toBuffer();
const makeSplash = (file) =>
  sharp({ create: { width: 2732, height: 2732, channels: 4, background: BG } })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(path.join(out, file));

await makeSplash("splash.png");
await makeSplash("splash-dark.png");

console.log("generated: resources/icon.png, splash.png, splash-dark.png");
