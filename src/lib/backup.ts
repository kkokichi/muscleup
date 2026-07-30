import {
  getStoredPhotos,
  replaceStoredPhotos,
  type StoredProgressPhoto,
} from "@/lib/photoStore";

const BACKUP_FORMAT = "muscleup-backup";
const BACKUP_VERSION = 1;
const STORAGE_PREFIX = "muscleup:v1:";
const EXCLUDED_STORAGE_KEYS = new Set([`${STORAGE_PREFIX}authSession`]);

interface BackupPhoto {
  id: string;
  date: string;
  createdAt: string;
  mimeType: string;
  base64: string;
}

export interface MuscleUpBackup {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  localStorage: Record<string, string>;
  photos: BackupPhoto[];
}

export interface BackupSummary {
  workoutCount: number;
  photoCount: number;
}

function isAppStorageKey(key: string): boolean {
  return key.startsWith(STORAGE_PREFIX) && !EXCLUDED_STORAGE_KEYS.has(key);
}

function readLocalStorageSnapshot(): Record<string, string> {
  const snapshot: Record<string, string> = {};
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !isAppStorageKey(key)) continue;
    const value = window.localStorage.getItem(key);
    if (value !== null) snapshot[key] = value;
  }
  return snapshot;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        reject(new Error("写真を読み取れませんでした"));
        return;
      }
      resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("写真を読み取れませんでした"));
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([key, item]) => isAppStorageKey(key) && typeof item === "string",
    )
  );
}

function isBackupPhoto(value: unknown): value is BackupPhoto {
  if (typeof value !== "object" || value === null) return false;
  const photo = value as Partial<BackupPhoto>;
  return (
    typeof photo.id === "string" &&
    typeof photo.date === "string" &&
    typeof photo.createdAt === "string" &&
    typeof photo.mimeType === "string" &&
    typeof photo.base64 === "string"
  );
}

function validateBackup(value: unknown): MuscleUpBackup {
  if (typeof value !== "object" || value === null) {
    throw new Error("MuscleUpのバックアップファイルではありません");
  }
  const backup = value as Partial<MuscleUpBackup>;
  if (backup.format !== BACKUP_FORMAT || backup.version !== BACKUP_VERSION) {
    throw new Error("対応していないバックアップ形式です");
  }
  if (
    typeof backup.exportedAt !== "string" ||
    !isStringRecord(backup.localStorage) ||
    !Array.isArray(backup.photos) ||
    !backup.photos.every(isBackupPhoto)
  ) {
    throw new Error("バックアップファイルが壊れています");
  }
  return backup as MuscleUpBackup;
}

export async function createBackupFile(): Promise<File> {
  const storedPhotos = await getStoredPhotos();
  const photos: BackupPhoto[] = await Promise.all(
    storedPhotos.map(async ({ blob, ...photo }) => ({
      ...photo,
      mimeType: blob.type || "application/octet-stream",
      base64: await blobToBase64(blob),
    })),
  );
  const backup: MuscleUpBackup = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    localStorage: readLocalStorageSnapshot(),
    photos,
  };
  const date = backup.exportedAt.slice(0, 10);
  return new File([JSON.stringify(backup)], `muscleup-backup-${date}.json`, {
    type: "application/json",
  });
}

export function downloadBackupFile(file: File): void {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function parseBackupFile(file: File): Promise<MuscleUpBackup> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("バックアップファイルを読み取れませんでした");
  }
  return validateBackup(parsed);
}

export function summarizeBackup(backup: MuscleUpBackup): BackupSummary {
  let workoutCount = 0;
  const rawLogs = backup.localStorage[`${STORAGE_PREFIX}workoutLogs`];
  if (rawLogs) {
    try {
      const logs: unknown = JSON.parse(rawLogs);
      if (Array.isArray(logs)) workoutCount = logs.length;
    } catch {
      // 個別データの不整合は復元時にそのまま保持し、アプリ側の既定値処理に任せる。
    }
  }
  return { workoutCount, photoCount: backup.photos.length };
}

export async function restoreBackup(backup: MuscleUpBackup): Promise<void> {
  const previousStorage = readLocalStorageSnapshot();
  const previousPhotos = await getStoredPhotos();
  const restoredPhotos: StoredProgressPhoto[] = backup.photos.map((photo) => ({
    id: photo.id,
    date: photo.date,
    createdAt: photo.createdAt,
    blob: base64ToBlob(photo.base64, photo.mimeType),
  }));

  try {
    for (const key of Object.keys(previousStorage)) window.localStorage.removeItem(key);
    for (const [key, value] of Object.entries(backup.localStorage)) {
      window.localStorage.setItem(key, value);
    }
    await replaceStoredPhotos(restoredPhotos);
  } catch (error) {
    for (const key of Object.keys(readLocalStorageSnapshot())) {
      window.localStorage.removeItem(key);
    }
    for (const [key, value] of Object.entries(previousStorage)) {
      window.localStorage.setItem(key, value);
    }
    await replaceStoredPhotos(previousPhotos);
    throw error;
  }
}
