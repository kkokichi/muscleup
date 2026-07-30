import type { ProgressPhoto } from "@/types";

/**
 * 進捗写真の画像本体を IndexedDB に保存する。
 * localStorage は容量が小さく画像に不向きなため、Blobを直接扱えるIndexedDBを使う。
 * （個人データのため端末ローカル。将来クラウド保存はFirebase Storageで対応）
 */
const DB_NAME = "muscleup";
const STORE = "progressPhotos";

export interface StoredProgressPhoto extends ProgressPhoto {
  blob: Blob;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const store = db.transaction(STORE, mode).objectStore(STORE);
        const req = run(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function addPhoto(photo: ProgressPhoto, blob: Blob): Promise<void> {
  await tx("readwrite", (store) =>
    store.put({ ...photo, blob } as StoredProgressPhoto),
  );
}

/** メタ情報 + 表示用のObjectURL を新しい順で返す */
export async function getAllPhotos(): Promise<(ProgressPhoto & { url: string })[]> {
  const records = await tx<StoredProgressPhoto[]>("readonly", (store) =>
    store.getAll() as IDBRequest<StoredProgressPhoto[]>,
  );
  return records
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ blob, ...meta }) => ({ ...meta, url: URL.createObjectURL(blob) }));
}

export async function deletePhoto(id: string): Promise<void> {
  await tx("readwrite", (store) => store.delete(id));
}

/** バックアップ用に画像Blobを含むレコードをそのまま取得する。 */
export function getStoredPhotos(): Promise<StoredProgressPhoto[]> {
  return tx<StoredProgressPhoto[]>("readonly", (store) =>
    store.getAll() as IDBRequest<StoredProgressPhoto[]>,
  );
}

/** 復元用。既存の進捗写真をすべて指定レコードへ置き換える。 */
export async function replaceStoredPhotos(
  photos: StoredProgressPhoto[],
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    const store = transaction.objectStore(STORE);
    store.clear();
    for (const photo of photos) store.put(photo);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error ?? new Error("写真の復元が中断されました"));
    };
  });
}
