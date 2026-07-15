// App Store 用スクリーンショット生成（iPhone 6.9"/6.7" = 1290×2796）。
//
// 使い方（Windowsでも可）:
//   1) 静的ビルド:            npm run build
//   2) 別ターミナルで配信:    npx serve out -l 5057
//   3) puppeteer を入れて実行: npm i -D puppeteer && node scripts/gen-screenshots.mjs
//   → appstore-screenshots/*.png が生成される（App Store Connect にそのままアップロード可）
//
// puppeteer は実行時のみ必要なため依存には含めない（CIのインストールを重くしないため）。
import puppeteer from "puppeteer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.SHOT_BASE ?? "http://localhost:5057";
const OUT = path.resolve(import.meta.dirname, "..", "appstore-screenshots");
mkdirSync(OUT, { recursive: true });

// ---- デモ用データ（実データは投入しない・撮影専用の見栄え用） ----
const s = (setNumber, weightKg, reps) => ({ setNumber, weightKg, reps });
const e = (exerciseId, sets) => ({ exerciseId, sets });
const log = (id, date, entries, durationMinutes = 48) => ({
  id, date, entries, note: "", durationMinutes,
  createdAt: `${date}T00:10:00.000Z`,
});

const logs = [
  log("l1", "2026-07-15", [e("bench-press", [s(1,100,5),s(2,100,5),s(3,95,6),s(4,90,8)]), e("incline-dumbbell-press",[s(1,32,10),s(2,32,9),s(3,30,10)])]),
  log("l2", "2026-07-13", [e("squat",[s(1,140,5),s(2,140,5),s(3,130,6)]), e("leg-press",[s(1,220,10),s(2,220,10)])]),
  log("l3", "2026-07-11", [e("deadlift",[s(1,180,3),s(2,180,3),s(3,170,5)]), e("lat-pulldown",[s(1,75,10),s(2,75,9)])]),
  log("l4", "2026-07-09", [e("overhead-press",[s(1,60,6),s(2,60,5),s(3,55,8)]), e("side-lateral-raise",[s(1,14,15),s(2,14,14)])]),
  log("l5", "2026-07-07", [e("bench-press",[s(1,97.5,6),s(2,97.5,5)]), e("barbell-curl",[s(1,40,10),s(2,40,9)])]),
  log("l6", "2026-07-05", [e("squat",[s(1,135,6),s(2,135,5)]), e("romanian-deadlift",[s(1,110,8),s(2,110,8)])]),
  log("l7", "2026-07-03", [e("pull-up",[s(1,0,12),s(2,0,10)]), e("bent-over-row",[s(1,80,10),s(2,80,9)])]),
  log("l8", "2026-07-01", [e("bench-press",[s(1,95,8),s(2,95,7)])]),
  log("l9", "2026-06-29", [e("squat",[s(1,130,6)]), e("leg-press",[s(1,200,12)])]),
  log("l10","2026-06-27", [e("deadlift",[s(1,170,5)])]),
  log("l11","2026-06-25", [e("overhead-press",[s(1,57.5,6)])]),
  log("l12","2026-06-23", [e("bench-press",[s(1,92.5,8)])]),
];

const rec = (exerciseId, maxWeight, est1rm, maxReps, maxVolume, achievedAt, updatedCount) =>
  ({ exerciseId, maxWeight, est1rm, maxReps, maxVolume, achievedAt, updatedCount });
const records = [
  rec("bench-press",100,116.7,8,2260,"2026-07-15",6),
  rec("squat",140,157.5,6,2210,"2026-07-13",5),
  rec("deadlift",180,196.4,5,1870,"2026-07-11",4),
  rec("overhead-press",60,69,8,1000,"2026-07-09",3),
  rec("lat-pulldown",75,97.5,10,1500,"2026-07-11",2),
  rec("barbell-curl",40,52,10,800,"2026-07-07",2),
];

const profile = { displayName: "コウキ", xp: 4200, createdAt: "2026-01-05T00:00:00.000Z" };

const draft = {
  activeLogId: "draft1", date: "2026-07-15",
  startedAt: "2026-07-15T00:00:00.000Z",
  firstInputAt: "2026-07-15T00:02:00.000Z",
  lastInputAt: "2026-07-15T00:38:00.000Z",
  entries: [
    { exerciseId: "bench-press", sets: [{ weightKg:100, reps:5, isDone:true }, { weightKg:100, reps:5, isDone:true }, { weightKg:95, reps:6, isDone:false }] },
    { exerciseId: "squat", sets: [{ weightKg:140, reps:5, isDone:false }] },
  ],
  note: "",
};

const seed = {
  "muscleup:v1:workoutLogs": JSON.stringify(logs),
  "muscleup:v1:records": JSON.stringify(records),
  "muscleup:v1:userProfile": JSON.stringify(profile),
  "muscleup:v1:workoutDraft": JSON.stringify({ state: { draft }, version: 0 }),
};

const screens = [
  { name: "01-home", path: "/", wait: 2000 },
  { name: "02-record", path: "/workout/new/", wait: 2000 },
  { name: "03-exercises", path: "/exercises/", wait: 2000 },
  { name: "04-progress", path: "/progress/", wait: 2500 },
  // バッジ画面は初回にマスコットの祝福トーストが出るため、消えるまで待つ(4.5s)
  { name: "05-badges", path: "/badges/", wait: 5500 },
];

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--force-color-profile=srgb", "--lang=ja-JP"],
});
for (const sc of screens) {
  const page = await browser.newPage();
  await page.emulateTimezone("Asia/Tokyo");
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 3 }); // →1290×2796
  await page.evaluateOnNewDocument((data) => {
    for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v);
  }, seed);
  await page.goto(BASE + sc.path, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, sc.wait ?? 2000));
  await page.screenshot({ path: `${OUT}/${sc.name}.png` });
  console.log("shot:", sc.name);
  await page.close();
}
await browser.close();
console.log("done ->", OUT);
