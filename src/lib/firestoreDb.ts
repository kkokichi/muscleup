import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getFirebaseApp } from "./firebase";

/**
 * Firestore インスタンスを返す。
 *
 * このモジュールは Firestore SDK（約700KB・WebChannel含む）を静的 import するため、
 * 「Firestore を実際に使う経路（repositories/firestore・migration）」からのみ
 * import すること。lib/firebase.ts など初期バンドルに載るモジュールから読むと、
 * 未ログインのユーザーにも Firestore SDK 一式がダウンロード・パースされて
 * 初回表示が重くなる（getRepos() は未ログイン時にこの経路へ来ない）。
 *
 * オフライン永続キャッシュ（IndexedDB）を有効化しているため、2回目以降の
 * 画面表示はネットワーク往復を待たずローカルから即描画される。
 */
let db: Firestore | null = null;

export function getDb(): Firestore {
  if (db) return db;
  const app = getFirebaseApp();
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    // 既に初期化済み、または IndexedDB 非対応環境（プライベートブラウズ等）は
    // デフォルト設定にフォールバックする
    db = getFirestore(app);
  }
  return db;
}
